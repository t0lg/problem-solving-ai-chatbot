"""Gemini client wrapper for problem-solving conversations."""

from __future__ import annotations

import json
import logging
import os
import re
import warnings
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import AbstractSet, Any, Dict, List, Optional, Set, Tuple

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:  # pragma: no cover
    def load_dotenv() -> bool:
        return False

try:
    from pydantic import BaseModel, Field
except ModuleNotFoundError:  # pragma: no cover
    BaseModel = None

    def Field(default_factory):  # type: ignore
        return default_factory()

from app.llm.prompts import METHODOLOGY_PROMPTS
from app.rag.vector_store import MockRAG
from app.templates.methodology_schemas import METHODOLOGY_SCHEMAS
from app.services import email_service

try:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", FutureWarning)
        import google.generativeai as genai
except ModuleNotFoundError:  # pragma: no cover - fallback for local/dev without deps
    genai = None

load_dotenv()

logger = logging.getLogger(__name__)


def _gemini_stdout_verbose() -> bool:
    """GEREKTIGINDE: GEMINI_VERBOSE=1 ile SDK/model/kota stderr ayrıntılarını yazdır."""
    return os.getenv("GEMINI_VERBOSE", "").strip().lower() in {"1", "true", "yes", "on"}


def _first_line_exc(exc: Exception, limit: int = 220) -> str:
    line = str(exc).strip().split("\n", 1)[0]
    if len(line) > limit:
        return f"{line[: limit - 3]}..."
    return line


def _canonical_model_name(model_id: str) -> str:
    """Use API form models/gemini-... GenerativeModel ve list_models ciktisiyla uyumlu."""
    mid = model_id.strip()
    if not mid:
        return mid
    if mid.startswith("models/"):
        return mid
    return f"models/{mid}"


def _print_genai_models_with_generate_content() -> None:
    """genai.list_models() ile generateContent destekleyen modelleri terminale yaz."""
    if genai is None or not _gemini_stdout_verbose():
        return
    print("\n--- Mevcut modeller (generateContent destekli) ---")
    try:
        count = 0
        for m in genai.list_models():
            methods = getattr(m, "supported_generation_methods", []) or []
            if "generateContent" not in methods:
                continue
            count += 1
            name = getattr(m, "name", "")
            print(f"  - {name}")
        if count == 0:
            print("  (bos liste — API anahtari / v1 erisimini kontrol et)")
    except Exception as exc:  # noqa: BLE001
        print(f"  list_models hatasi: {exc}")
    print("--- /modeller ---\n")


if BaseModel is not None:
    class AnalysisState(BaseModel):
        methodology: str
        problem: str
        step_index: int = 0
        history: List[Dict[str, str]] = Field(default_factory=list)
else:
    @dataclass
    class AnalysisState:
        methodology: str
        problem: str
        step_index: int = 0
        history: List[Dict[str, str]] = field(default_factory=list)


def _exclude_from_chat_autopilot(short_model: str) -> bool:
    """Sohbet metodojisi icin uygun olmayan (TTS/gorsel/ozel) endpoint adlarini ele."""
    s = short_model.lower()
    needles = (
        "tts",
        "lyria",
        "deep-research",
        "robotics",
        "computer-use",
        "nano-banana",
        "gemma",
        "-image-preview",
        "flash-image",
        "-clip-",
        "customtools",
    )
    return any(n in s for n in needles)


def _find_optional_actions_json_blob(text: str) -> Optional[str]:
    """Metnin sonundaki {"optional_actions": [...]} blogunu bul."""
    marker = '"optional_actions"'
    pos = text.rfind(marker)
    if pos == -1:
        return None
    start = text.rfind("{", 0, pos)
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
    return None


def _parse_optional_actions_list(text: str) -> List[Dict[str, Any]]:
    blob = _find_optional_actions_json_blob(text)
    if not blob:
        return []
    try:
        data = json.loads(blob)
        raw = data.get("optional_actions")
        if not isinstance(raw, list):
            return []
        return [x for x in raw if isinstance(x, dict)]
    except json.JSONDecodeError:
        return []


def _strip_trailing_optional_actions_json(text: str) -> str:
    blob = _find_optional_actions_json_blob(text)
    if not blob:
        return text.strip()
    i = text.rfind(blob)
    if i == -1:
        return text.strip()
    return text[:i].strip()


def _extract_block(text: str, pattern: str) -> str:
    m = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
    if not m:
        return ""
    return m.group(1).strip()


def _merge_assistant_transcript(history: List[Dict[str, str]]) -> str:
    chunks: List[str] = []
    for m in history:
        if m.get("role") != "assistant":
            continue
        chunks.append(_strip_trailing_optional_actions_json(m.get("content") or ""))
    return "\n\n---\n\n".join(chunks)


def _fallback_risks_and_advice(problem: str, transcript: str) -> Tuple[str, str]:
    ctx = f"{problem}\n{transcript}".lower()
    risks: List[str] = [
        "Operasyonel verilerin (siparis, stok, kargo) daginik tutulmasi tekrar eden gecikme ve "
        "yanlis onceliklere yol acabilir.",
        "Insan bagimli takip (telefon/mesaj) arttikca hata ve unutma riski buyur.",
    ]
    advice: List[str] = [
        "Kritik urunler icin min-max stok esigi ve haftalik kapanis kontrol listesi tanimlayin.",
        "Siparis-kargo-stok icin tek referans paneli veya tablo (tek dogruluk kaynagi) kullanin.",
    ]
    if any(k in ctx for k in ("kargo", "teslimat", "entegrasyon", "api")):
        risks.append(
            "Kargo firmasi veya entegrasyon (API/panel) kesintileri musteriye yansimadan once "
            "operasyonda fark edilmeyebilir."
        )
        advice.append(
            "Kargo takip kodlarini gunluk otomatik esitleme veya sabah ozet kontrolu ile izleyin."
        )
    if any(k in ctx for k in ("stok", "envanter", "tuken", "kritik")):
        risks.append(
            "Kritik stok tukenmesi musteri kaybi ve acil tedarik maliyeti riski tasir."
        )
        advice.append(
            "Satis hizi yuksek kalemlerde yenileme siparisini esik degerine ulasmadan tetikleyin."
        )
    risks_body = "\n".join(f"- {r}" for r in risks)
    advice_body = "\n".join(f"- {a}" for a in advice)
    return risks_body, advice_body


TECH_ROADMAP_KEYWORDS = frozenset(
    (
        "api",
        "entegrasyon",
        "otomasyon",
        "yazılım",
        "erp",
        "panel",
        "smtp",
        "ssl",
        "güvenlik",
        "token",
        "quota",
        "sunuc",
        "sistem",
        "veritabanı",
        "veritaban",
        "yedek",
    )
)


def _markdown_bullets_from_lines(lines: List[str]) -> str:
    clean = [re.sub(r"\s+", " ", x).strip() for x in lines if x and str(x).strip()]
    if not clean:
        return ""
    return "\n".join(f"- {c}" for c in clean)


def _lines_from_dash_md(md: str) -> List[str]:
    out: List[str] = []
    for ln in md.splitlines():
        t = ln.strip()
        if t.startswith("- ") or t.startswith("* "):
            out.append((t[2:] if len(t) > 2 else "").strip())
    return out


def _split_tech_oper_lists(bullets: List[str]) -> Tuple[List[str], List[str]]:
    teknik: List[str] = []
    operasyonel: List[str] = []
    lower_ctx = "\n".join(bullets).lower()
    for b in bullets:
        lo = b.lower()
        if any(k in lo for k in TECH_ROADMAP_KEYWORDS):
            teknik.append(b)
        else:
            operasyonel.append(b)
    if not teknik and operasyonel:
        teknik.append(operasyonel.pop(0))
    elif not operasyonel and teknik:
        operasyonel.append(teknik.pop())
    elif not teknik and not operasyonel:
        return [], []
    return teknik, operasyonel


def _fallback_technical_operational_roadmaps(
    problem: str, transcript: str
) -> Tuple[str, str]:
    rb, advb = _fallback_risks_and_advice(problem, transcript)
    merged = _lines_from_dash_md(rb) + _lines_from_dash_md(advb)
    if not merged:
        merged = [
            "Operasyonel süreçler için tek doğruluk kaynağı (sipariş-stok-kargo görünümü) tanımlanmalıdır.",
            "Tedarikçi/kargo bildirimi ve iç iletişim ritüeli netleştirilmelidir.",
        ]
    t_list, o_list = _split_tech_oper_lists(merged)
    return _markdown_bullets_from_lines(t_list), _markdown_bullets_from_lines(o_list)


def _sanitize_table_cell(val: str, max_chars: int = 220) -> str:
    t = re.sub(r"\s+", " ", val or "").strip()
    t = t.replace("|", "/")
    if len(t) > max_chars:
        return f"{t[: max_chars - 1]}…"
    return t or "—"


def _normalize_mail_key(to_val: Optional[str], subject_val: Optional[str]) -> Tuple[str, str]:
    t = re.sub(r"\s+", " ", (to_val or "").strip()).lower()
    s = re.sub(r"\s+", " ", (subject_val or "").strip()).lower()[:260]
    return (t, s)


def _truncate_bullet_list_md(md: str, limit: int) -> str:
    items = _lines_from_dash_md(md)
    if not items:
        return md.strip()[:800] if md.strip() else ""
    return _markdown_bullets_from_lines(items[:limit])


_EMPATHY_SUBSTRINGS = (
    "anlıyorum",
    "anliyorum",
    "anıyorum",
    "anıyorum",
    "can sıkıcı",
    "can sikici",
    "sıkıntı yaşadığınızı",
    "sikinti yasadig",
    "üzgünüm",
    "uzgunum",
    "empati ile",
)


def _strip_conversational_fluff(segment: str) -> str:
    """Nezaket / koçlama satirlari cikarilir; teknik- operasyon ozeti kalir."""
    if not segment or not segment.strip():
        return ""
    s = segment.strip()
    s = re.sub(r"^\[LIVE AI\]\s*", "", s, flags=re.IGNORECASE)
    out_lines: List[str] = []
    skip_fence = False
    for line in s.splitlines():
        raw = line
        stripped = line.strip()

        fence = stripped.startswith("```")
        if fence:
            skip_fence = not skip_fence
            continue
        if skip_fence:
            continue

        ls = stripped.lower()

        pedagogical_hdr = (
            "bu adımda ne yapıyoruz",
            "bu adimda ne yapiyoruz",
            "neden bu adım önemli",
            "neden bu adim onemli",
            "neden bu adım",
            "gelek adım",
            "lessons learned: henüz",
            "lessons learned: henuz",
        )
        if any(h in stripped for h in pedagogical_hdr) or any(
            h in stripped for h in ["**Bu adımda", "**Bu adimda", "**Gelecek adım"]
        ):
            continue
        if "lessons learned" in ls and ("henüz" in ls or "henuz" in ls):
            continue
        if "**lessons learned" in stripped and len(stripped) < 220:
            if "belirlenmedi" in ls or "yok" in ls.split(":")[-1].strip()[:80]:
                continue

        low = stripped.lower()
        if len(stripped) < 380 and any(b in low for b in _EMPATHY_SUBSTRINGS):
            continue

        if stripped.startswith(("-", "*", "•")) and len(stripped) < 200:
            if any(b in low for b in _EMPATHY_SUBSTRINGS):
                continue

        if stripped:
            out_lines.append(raw.rstrip())

    return re.sub(r"\n{4,}", "\n\n\n", "\n".join(out_lines)).strip()


def _merge_facts_assistant_transcript(history: List[Dict[str, str]]) -> str:
    chunks: List[str] = []
    for m in history:
        if m.get("role") != "assistant":
            continue
        stripped = _strip_trailing_optional_actions_json(m.get("content") or "")
        fact = _strip_conversational_fluff(stripped)
        if fact:
            chunks.append(fact)
    return "\n\n---\n\n".join(chunks)


def _gather_action_table_rows(
    history: List[Dict[str, str]],
    sent_mail_keys: Optional[AbstractSet[Tuple[str, str]]] = None,
) -> List[List[str]]:
    rows: List[List[str]] = []
    seen: set[Tuple[Any, Any, Any]] = set()

    sent_set: AbstractSet[Tuple[str, str]] = sent_mail_keys or frozenset()

    def _consume(act: Dict[str, Any]) -> None:
        at = act.get("type") or ""
        sig: Tuple[Any, Any, Any]
        if at == "assign_task":
            sorumlu = str(act.get("assignee") or act.get("label") or "—").strip()
            body = str(act.get("task") or "—").strip()
            durum = "📌 ATANDI"
            sig = ("t", sorumlu.lower(), body[:120].lower())
        elif at == "draft_email":
            sorumlu = str(act.get("to") or "—").strip()
            subject = str(act.get("subject") or "").strip()
            body = f"E-posta: {subject}".strip()
            mk = _normalize_mail_key(sorumlu, subject)
            durum = "✅ GÖNDERİLDİ" if mk in sent_set else "⏳ GÖNDERİM BEKLENİYOR"
            sig = ("m", sorumlu.lower(), subject[:120].lower())
        else:
            return

        if sig in seen:
            return
        seen.add(sig)

        rows.append(
            [_sanitize_table_cell(sorumlu), _sanitize_table_cell(body), _sanitize_table_cell(durum, 160)]
        )

    for msg in history:
        if msg.get("role") != "assistant":
            continue
        raw = msg.get("content") or ""
        for act in _parse_optional_actions_list(raw):
            if isinstance(act, dict):
                _consume(act)

    if not rows:
        rows.append(["—", "`optional_actions` kaydı yok.", "—"])
    return rows


def _markdown_actions_table(rows: List[List[str]]) -> str:
    header = "| Birim | Görev | Durum |\n|:---:|:---|:---|\n"
    lines = [header]
    for a, g, d in rows:
        lines.append(f"| {a} | {g} | {d} |\n")
    return "".join(lines)


def _format_dialog_archive(history: List[Dict[str, str]], limit_chars: int = 120000) -> str:
    """Tam diyalog: rapor govdesinden ayrik arsiv bolumu."""
    parts: List[str] = []
    for m in history:
        raw = (m.get("content") or "").strip()
        if not raw:
            continue
        role = m.get("role")
        if role == "user":
            title = "### Kullanıcı"
        elif role == "assistant":
            title = "### Asistan"
        else:
            title = "### Diğer"
        parts.append(f"{title}\n\n{raw}\n")
    text = "\n".join(parts)
    if len(text) > limit_chars:
        text = text[:limit_chars] + "\n\n_(metin güvenlik sınırında kesildi)_"
    return text


def _finalize_strategic_lessons_md(text: str) -> str:
    if not (text or "").strip():
        return ""
    kept: List[str] = []
    for line in text.splitlines():
        stem = re.sub(r"^\s*[-*•]+\s*", "", line.strip())
        if not stem:
            continue
        if _is_placeholder_lessons_line(stem):
            continue
        kept.append(line.rstrip())
    return "\n".join(kept).strip()


def _is_placeholder_lessons_line(line: str) -> bool:
    lo = line.lower()
    if "otomatik ayrıştırılamadı" in lo:
        return True
    if "lessons learned bölümü" in lo and "otomatik" in lo:
        return True
    if "henüz" in lo and ("yakalan" in lo or "yakalanmadı" in lo):
        return True
    if "henüz" in lo and "yok" in lo and len(lo) < 180:
        return True
    if "belirlenmedi" in lo and "lesson" in lo:
        return True
    return False


def _lessons_as_strategic_bullets(
    agent: "ProblemSolvingAgent", raw_lessons: str, transcript_tail: str
) -> str:
    if ProblemSolvingAgent._looks_like_missing_lessons_extract(
        raw_lessons if raw_lessons else ""
    ):
        raw_lessons = ""

    bullets: List[str] = []
    text = raw_lessons or ""
    if text:
        if "\n" not in text.strip() and len(text) < 500 and not text.startswith("{"):
            s = re.sub(r"\s+", " ", text.strip())
            if s and not _is_placeholder_lessons_line(s):
                bullets.append(s)
        for line in text.splitlines():
            s = line.strip()
            if not s:
                continue
            s = re.sub(r"^\s*[*\-•]+\s*", "", s)
            s = re.sub(r"^\s*\d+[\).\]]\s+", "", s)
            if len(s) < 8:
                continue
            if _is_placeholder_lessons_line(s):
                continue
            bullets.append(re.sub(r"\s+", " ", s))

    seen: set[str] = set()
    dedup = []
    for b in bullets:
        k = b[:120].lower()
        if k not in seen:
            seen.add(k)
            dedup.append(b)

    if not dedup:
        dedup.extend(agent._infer_lessons_from_transcript_hints(transcript_tail[-3800:] if transcript_tail else ""))

    if dedup:
        return "\n".join(f"- {b}" for b in dedup[:14])
    return ""


class ProblemSolvingAgent:
    """AI engine for guided methodology-based root cause analysis."""

    MODEL_NAME = "models/gemini-1.5-flash"
    MODEL_FALLBACK_NAME = "models/gemini-1.5-flash-latest"
    # Max switches when API lists a model ID that still 404s on generateContent (version skew).
    _MAX_MODEL_PROBE = 24

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or self._read_env_key_from_file()
        self.rag = MockRAG()
        self.state: Optional[AnalysisState] = None
        self._model = None
        self._active_model_name: str = self.MODEL_NAME
        self._pending_email_drafts: List[Dict[str, Any]] = []
        self._sent_mail_keys: Set[Tuple[str, str]] = set()

        if not self.api_key:
            print("Gemini API key bulunamadi: GEMINI_API_KEY")
            return

        if genai is None:
            print("google.generativeai paketi yuklu degil.")
            return

        try:
            # NOT: google.generativeai isteklerini v1beta protobuf ile uretir.
            # generativelanguage_v1 GAPIC ile degistirmek GenerateContentRequest uyumsuzluguna yol acar.
            genai.configure(api_key=self.api_key, transport="rest")
            if _gemini_stdout_verbose():
                print(
                    "Gemini: transport=rest, GAPIC=v1beta (google.generativeai ile uyumlu). "
                    "Tam v1 REST icin google-genai paketine gecmek gerekir."
                )
            _print_genai_models_with_generate_content()
            resolved_model = self._resolve_model_name()
            resolved_model = _canonical_model_name(resolved_model)
            self._active_model_name = resolved_model
            self._model = genai.GenerativeModel(resolved_model)
            self._catalog_chat_models = frozenset(self._api_flash_candidates_sorted())
            if _gemini_stdout_verbose():
                sdk_ver = getattr(genai, "__version__", "bilinmiyor")
                print(f"Gemini SDK: google-generativeai {sdk_ver} | model: {resolved_model}")
                if resolved_model != self.MODEL_NAME:
                    print(
                        f"Uyari: Oncelikli model '{self.MODEL_NAME}' API listesinde yok; "
                        f"'{resolved_model}' kullaniliyor."
                    )
        except Exception as e:  # noqa: BLE001
            if _gemini_stdout_verbose():
                print(f"Gemini baslatma hatasi: {e}")
            else:
                logger.warning("Gemini baslatma: %s", _first_line_exc(e))
            self._model = None
            self._catalog_chat_models = frozenset()

    def _resolve_model_name(self) -> str:
        """Prefer 1.5 flash IDs from the live API catalog (may include version suffixes)."""
        if genai is None:
            return self.MODEL_NAME

        ranked = self._api_flash_candidates_sorted()
        for candidate in (self.MODEL_NAME, self.MODEL_FALLBACK_NAME):
            if candidate in ranked:
                return candidate
        # Short names can 404 while versioned ids work; starting with catalog is safer.
        for mid in ranked:
            short = self._short_model_id(mid)
            if short.startswith("gemini-1.5-flash"):
                return mid
        if ranked:
            return ranked[0]
        return self.MODEL_NAME

    @staticmethod
    def _short_model_id(full_name: str) -> str:
        return full_name.replace("models/", "").strip()

    @staticmethod
    def _unique_preserve(ids: List[str]) -> List[str]:
        seen: set[str] = set()
        out: List[str] = []
        for mid in ids:
            if mid and mid not in seen:
                seen.add(mid)
                out.append(mid)
        return out

    def _api_flash_candidates_sorted(self) -> List[str]:
        """Return generateContent-capable Gemini Flash model ids, ordered conservatively."""
        if genai is None:
            return []

        try:
            models = list(genai.list_models())
        except Exception:
            return []

        def _can_generate(model_obj: object) -> bool:
            methods = getattr(model_obj, "supported_generation_methods", []) or []
            return "generateContent" in methods

        flash_ids: List[str] = []
        for m in models:
            if not _can_generate(m):
                continue
            full_id = _canonical_model_name(getattr(m, "name", ""))
            short = self._short_model_id(full_id)
            if not short.startswith("gemini"):
                continue
            low = short.lower()
            if "embedding" in low or "music" in low:
                continue
            if "flash" not in low and low not in {
                "gemini-flash-latest",
                "gemini-flash-lite-latest",
                "gemini-pro-latest",
            }:
                continue
            if _exclude_from_chat_autopilot(short):
                continue
            flash_ids.append(full_id)

        ranked = sorted(
            flash_ids,
            key=lambda x: (
                self._flash_tier(x),
                self._flash_version_sort_bias(x),
                len(self._short_model_id(x)),
                x,
            ),
        )
        kota_once = [
            fid
            for fid in ranked
            if (
                ("flash-lite" in self._short_model_id(fid).lower())
                or self._short_model_id(fid).lower()
                in ("gemini-flash-latest", "gemini-flash-lite-latest")
            )
        ]
        others = [fid for fid in ranked if fid not in kota_once]
        return self._unique_preserve(kota_once + others)

    @staticmethod
    def _flash_version_sort_bias(full_id: str) -> int:
        """Ayni ailede gemini-2.0-flash-001 gibi surumlu id'yi onceliklendir."""
        short = ProblemSolvingAgent._short_model_id(full_id)
        if re.search(r"-\d+$", short):
            return 0
        return 1

    def _flash_tier(self, full_id: str) -> int:
        """1.5 flash Onceligi; kota icin 2.5 en son."""
        s = self._short_model_id(full_id).lower()
        if s == "gemini-1.5-flash" or s.startswith("gemini-1.5-flash-"):
            return 0
        if "1.5" in s and "flash" in s:
            return 1
        if "2.0" in s and "flash" in s:
            return 2
        if "2.5" in s and "flash" in s:
            return 3
        return 4

    def _generate_model_candidates(self) -> List[str]:
        """Full attempt order for generateContent (handles list vs invoke ID mismatch)."""
        raw_env = os.getenv("GEMINI_MODEL", "").strip()
        env_pref = _canonical_model_name(raw_env) if raw_env else ""
        api_order = self._api_flash_candidates_sorted()
        pref_list: List[str] = []
        if env_pref:
            pref_list.append(env_pref)
        pref_list.append(_canonical_model_name(self._active_model_name))

        avail = getattr(
            self,
            "_catalog_chat_models",
            frozenset(self._api_flash_candidates_sorted()),
        )
        for wish in (self.MODEL_NAME, self.MODEL_FALLBACK_NAME):
            if wish in avail:
                pref_list.append(wish)

        merged = pref_list + api_order
        return [_canonical_model_name(x) for x in self._unique_preserve(merged) if x]

    @staticmethod
    def _print_model_catalog_hint() -> None:
        if _gemini_stdout_verbose():
            print(
                "Uygulanabilir modeller icin GEMINI_MODEL ile tam id ver "
                "(or: models/gemini-1.5-flash-002 veya gemini-1.5-flash-002)."
            )

    def _switch_model(self, model_id: str) -> None:
        if genai is None:
            return
        self._active_model_name = _canonical_model_name(model_id)
        self._model = genai.GenerativeModel(self._active_model_name)

    @staticmethod
    def _is_model_missing_error(exc: Exception) -> bool:
        msg = str(exc).lower()
        return ("404" in msg and "model" in msg) or ("not found" in msg and "model" in msg)

    @staticmethod
    def _is_quota_or_rate_limit_error(exc: Exception) -> bool:
        msg = str(exc).lower()
        if "429" in msg:
            return True
        if "quota" in msg or "rate limit" in msg or "resource exhausted" in msg:
            return True
        if "exceeded" in msg and "limit" in msg:
            return True
        cod = getattr(exc, "code", None)
        if callable(cod):
            try:
                cod = cod()
            except Exception:
                cod = None
        if cod == 429:
            return True
        resp = getattr(exc, "response", None)
        if resp is not None and getattr(resp, "status_code", None) == 429:
            return True
        return False

    @staticmethod
    def _read_env_key_from_file() -> Optional[str]:
        """Read GEMINI_API_KEY from project .env as a fallback."""
        project_root = Path(__file__).resolve().parents[3]
        env_path = project_root / ".env"
        if not env_path.exists():
            return None

        try:
            for line in env_path.read_text(encoding="utf-8").splitlines():
                if not line or line.strip().startswith("#"):
                    continue
                if line.startswith("GEMINI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
        except Exception as e:  # noqa: BLE001
            print(f".env okuma hatasi: {e}")
        return None

    def get_pending_email_drafts(self) -> List[Dict[str, Any]]:
        return list(self._pending_email_drafts)

    def _enqueue_draft_emails(self, actions: List[Dict[str, Any]]) -> None:
        seen = {
            (d.get("to"), d.get("subject"))
            for d in self._pending_email_drafts
            if d.get("type") == "draft_email"
        }
        for act in actions:
            if act.get("type") != "draft_email":
                continue
            sig = (act.get("to"), act.get("subject"))
            if sig in seen:
                continue
            seen.add(sig)
            self._pending_email_drafts.append(dict(act))

    def _sync_pending_drafts_from_response(self, assistant_raw: str) -> None:
        parsed = _parse_optional_actions_list(assistant_raw)
        self._enqueue_draft_emails(parsed)

    @staticmethod
    def is_mail_send_approval(user_message: str) -> bool:
        t = user_message.strip().lower()
        return t in {"onayla", "mail onayla"}

    def approve_pending_emails(self) -> List[Dict[str, Any]]:
        """Onaydan sonra bekleyen mail taslaklarini SMTP ile dener (basarisizlarda kota tutar)."""
        drafts = [
            x
            for x in self._pending_email_drafts
            if isinstance(x, dict) and x.get("type") == "draft_email"
        ]
        other = [
            x
            for x in self._pending_email_drafts
            if not (isinstance(x, dict) and x.get("type") == "draft_email")
        ]
        remaining: List[Dict[str, Any]] = []
        results: List[Dict[str, Any]] = []
        for d in drafts:
            ok, detail = email_service.send_draft_email(d)
            results.append(
                {
                    "to": d.get("to"),
                    "subject": d.get("subject"),
                    "ok": ok,
                    "detail": detail,
                }
            )
            if not ok:
                remaining.append(d)
                logger.warning("Mail gonderilemedi: %s — %s", d.get("to"), detail)
            else:
                self._sent_mail_keys.add(
                    _normalize_mail_key(str(d.get("to") or ""), str(d.get("subject") or ""))
                )
        self._pending_email_drafts = other + remaining
        return results

    @staticmethod
    def _heuristic_draft_emails(scope_lower: str) -> List[Dict[str, Any]]:
        """Stok (4) ve is akisi/kargo (5) temalari icin KOBI tonlu yedek taslaklar."""
        out: List[Dict[str, Any]] = []
        kargo_to = os.getenv("DEFAULT_KARGO_MAIL_TO", "kargo.yetkili@firmaniz.com").strip()
        ted_to = os.getenv("DEFAULT_TEDARIK_MAIL_TO", "tedarik@tedarikci-firma.com").strip()
        depo_to = os.getenv("DEFAULT_DEPO_MAIL_TO", "depo.sorumlusu@firmaniz.com").strip()

        if any(
            k in scope_lower
            for k in (
                "kargo",
                "teslimat",
                "entegrasyon",
                "yurtici",
                "api",
                "panel",
                "takip no",
                "takip",
            )
        ):
            out.append(
                {
                    "type": "draft_email",
                    "label": "Mail hazirla",
                    "to": kargo_to,
                    "subject": "Kargo / entegrasyon takibi — siparis ve takip bilgisi talebi",
                    "body": (
                        "Sayin Yetkili,\n\n"
                        "KOBI operasyonlarimiz kapsaminda kargo surecinde gecikme veya "
                        "entegrasyon tarafinda (API / panel) belirlenen bir aksaklik soz konusu.\n"
                        "Ilgili siparis veya gonderi referanslarini ve guncel tahmini teslim "
                        "tarihini (ETA) paylasmanizi rica ederiz. Kooperatif / depo tarafinda "
                        "koordinasyonu hizlandirmak icin teknik detay varsa ozetleyebilirsiniz.\n\n"
                        "Varsayim: Gercek siparis numarasi ve kargo kodu kullanici girdisi veya ERP "
                        "kaydı ile sonradan tamamlanacaktir.\n\n"
                        "Saygilarimla,\nKOBI Operasyon Ekibi\n"
                        "[Isletme adi]"
                    ),
                }
            )

        if any(
            k in scope_lower
            for k in (
                "stok",
                "envanter",
                "minimum",
                "tukendi",
                "kritik",
                "yenileme",
                "siparis ver",
            )
        ):
            out.append(
                {
                    "type": "draft_email",
                    "label": "Mail hazirla",
                    "to": ted_to,
                    "subject": "Kritik stok / yeniden siparis teklifi (KOBI / kooperatif)",
                    "body": (
                        "Sayin Tedarikci Yetkilisi,\n\n"
                        "Kooperatif / KOBI yapimiza ait kritik kalemlerde stok yenilemesi gerektiren "
                        "bir durum tespit edilmistir. Guncel teslim tarihi, birim fiyat ve minimum "
                        "siparis miktarinizi bildirmenizi rica ederiz.\n"
                        "Gecmis satis ortalamamiza uygun miktar talebi operasyon ekibince netlestirilecektir "
                        "(dokuman temasi Madde 4 — stok ve envanter uyumu).\n\n"
                        "Varsayim: Urun SKU ve miktar kullanici onayindan sonra eklenecektir.\n\n"
                        "Saygilarimla,\nSatin Alma / Operasyon\n"
                        "[Isletme adi]"
                    ),
                }
            )

        if any(
            k in scope_lower
            for k in (
                "sabah",
                "gunluk",
                "liste",
                "paket",
                "hazirlama",
                "depo ",
                "depoya",
                "rota",
            )
        ):
            out.append(
                {
                    "type": "draft_email",
                    "label": "Mail hazirla",
                    "to": depo_to,
                    "subject": "Gunluk is akisi — depo paket hazirligi ve sevkiyat listesi",
                    "body": (
                        "Sayin Depo Ekibi,\n\n"
                        "Bugune ait onceliklendirilmis siparis paketleri ve teslimatu bugun gereken "
                        "kalemleri ekteki ozete gore hazirlamanizi rica ederiz (Temalar madde 5 — "
                        "is akisi). Kargo gorevlisine devredilecek paletleri saat bildiriminize gore "
                        "hazirlarsaniz teslimaat zincirinde aksama olmaz.\n\n"
                        "Varsayim: Excel / panel kesiti AI sonrasi insan tarafindan kesinlestirilecektir.\n\n"
                        "Saygilarimla,\nOperasyon Yonetimi\n"
                        "[Isletme adi]"
                    ),
                }
            )

        return out

    def _snapshot_5why_report(self) -> None:
        """Her kullanici round sonundan sonra FINAL_REPORT.md guncellenir."""
        if not self.state or self.state.methodology != "5why":
            return
        last_idx = len(METHODOLOGY_SCHEMAS["5why"]) - 1
        is_completed = self.state.step_index >= last_idx
        try:
            path = self._write_final_report_md(is_completed=is_completed)
            if path is not None:
                logger.info(
                    "FINAL_REPORT guncellendi | adim %s tamamlandi=%s | %s",
                    self.state.step_index,
                    is_completed,
                    path,
                )
        except OSError as exc:
            logger.exception("FINAL_REPORT yazilamadi: %s", exc)
            print(f"\n[RAPOR] FINAL_REPORT yazilamadi: {exc}\n")

    @staticmethod
    def _repo_root() -> Path:
        return Path(__file__).resolve().parents[3]

    @staticmethod
    def _report_output_path() -> Path:
        """FINAL_REPORT'u test_ai_logic.py ile ayni klasore yazar."""
        here = Path(__file__).resolve()
        for parent in here.parents:
            if (parent / "test_ai_logic.py").exists():
                return parent / "FINAL_REPORT.md"
        return ProblemSolvingAgent._repo_root() / "FINAL_REPORT.md"

    @staticmethod
    def _looks_like_missing_root_extract(s: str) -> bool:
        s = s or ""
        return "aşağıdaki referans bölümünden" in s and "çıkarılmalı" in s

    @staticmethod
    def _looks_like_missing_lessons_extract(s: str) -> bool:
        s = s or ""
        return "Lessons Learned bölümü otomatik" in s or (
            "lessons learned bölümü otomatik" in s.lower()
        )

    @staticmethod
    def _last_turn_assistant_plain(history: List[Dict[str, str]], max_chars: int = 1200) -> str:
        for m in reversed(history):
            if m.get("role") != "assistant":
                continue
            t = _strip_trailing_optional_actions_json(m.get("content") or "")
            t = re.sub(r"\s+", " ", t).strip()
            if len(t) > max_chars:
                return f"{t[:max_chars]}…"
            return t if t else "_(Henüz asistan metni yok)_"
        return "_(Henüz asistan metni yok)_"

    @staticmethod
    def _extract_root_cause_snippets(transcript: str) -> str:
        block = _extract_block(
            transcript,
            r"(?is)(?:\*\*\s*)?(?:kök\s*nedeni|kok\s*nedeni|kök\s*neden|kok\s*neden|root\s*cause)"
            r"\s*(?:\*\*)?\s*[:\-]?\s*(.+?)(?=\n\s*(?:\*\*|##)|Lessons\s*Learned|\Z)",
        )
        if block:
            return block
        block = _extract_block(
            transcript,
            r"(?is)(?:\*\*\s*)?(?:why\s*#5|5\.\s*neden|neden\s*#5)\s*(?:\*\*)?\s*[:\-]?\s*"
            r"(.+?)(?=\n\s*(?:\*\*|##)|Duzeltici|Onleyici|Lessons|\Z)",
        )
        if block:
            return block
        return (
            "_Kök neden metni otomatik ayrıştırılamadı; aşağıdaki referans bölümünden "
            "çıkarılmalı._"
        )

    @staticmethod
    def _extract_lessons_md(transcript: str) -> str:
        block = _extract_block(
            transcript,
            r"(?is)(?:\*\*\s*)?lessons\s*learned\s*(?:\*\*)?\s*[:\-]?\s*"
            r"(.+?)(?=\n\s*(?:\*\*|##)|\{\s*\"optional_actions\"|\Z)",
        )
        if block:
            return block
        return "_Lessons Learned bölümü otomatik ayrıştırılamadı._"

    @staticmethod
    def _infer_lessons_from_transcript_hints(tail: str) -> List[str]:
        bullets: List[str] = []
        if not tail or len(tail) < 48:
            return bullets
        for para in re.split(r"\n{2,}", tail):
            p = re.sub(r"\s+", " ", para).strip()
            if len(p) < 52:
                continue
            lp = p.lower()
            hints = (
                "öğrendik",
                "ders",
                "preventif",
                "önleyici",
                "stratejik",
                "tekrar",
                "lessons learned",
                "köksel",
                "operasyon",
            )
            if any(k in lp for k in hints) and not _is_placeholder_lessons_line(p):
                bullets.append(p[:440])
            if len(bullets) >= 7:
                break
        uniq: List[str] = []
        seen: set[str] = set()
        for b in bullets:
            sig = b[:90].lower()
            if sig in seen:
                continue
            seen.add(sig)
            uniq.append(b)
        return uniq

    @staticmethod
    def _snippet_for_chain_segment(segment: str, cap: int = 138) -> str:
        txt = _strip_trailing_optional_actions_json(segment)
        txt = re.sub(r"\[LIVE AI\]\s*", "", txt)
        txt = re.sub(r"\*\*([^*]+)\*\*", r"\1", txt)
        line = txt.split("\n")[0].strip().lstrip("-•*› ").strip()
        line = re.sub(r"\s+", " ", line)
        if len(line) > cap:
            return line[: cap - 1] + "…"
        return line

    @staticmethod
    def _compose_five_why_levels(
        gemini_levels: Optional[List[str]],
        *,
        problem: str,
        transcript: str,
        history: List[Dict[str, str]],
    ) -> List[str]:
        def _normalize_one(x: str) -> str:
            s = re.sub(r"\s+", " ", (x or "").strip())
            return s[:180] + ("…" if len(s) > 180 else "")

        out: List[str] = []
        for x in gemini_levels or []:
            s = _normalize_one(str(x))
            if len(s) > 14 and s not in out:
                out.append(s)
                if len(out) >= 5:
                    break

        segments = [s.strip() for s in transcript.split("\n\n---\n\n") if s.strip()]
        seg_i = 0
        while len(out) < 5 and seg_i < len(segments):
            sn = ProblemSolvingAgent._snippet_for_chain_segment(segments[seg_i])
            seg_i += 1
            if len(sn) > 36 and sn not in out:
                out.append(sn)

        if len(out) < 5 and problem.strip():
            p = _normalize_one(problem)
            if p and (not out or p[:42] != out[0][:42]):
                out.insert(0, p)

        u_msgs = [
            re.sub(r"\s+", " ", (m.get("content") or "").strip())
            for m in history
            if m.get("role") == "user"
        ]
        for um in reversed(u_msgs):
            cand = um[:172] + ("…" if len(um) > 172 else "")
            if len(cand) > 32 and cand not in out:
                out.append(cand)
            if len(out) >= 5:
                break

        while len(out) < 5:
            out.append("[Analiz Sürüyor...]")

        return out[:5]

    @staticmethod
    def _five_whys_arrow_line(levels: List[str]) -> str:
        seq = list(levels[:5])
        while len(seq) < 5:
            seq.append("[Analiz Sürüyor...]")
        pretty = [
            (_sanitize_table_cell(x, 220).strip() or "[Analiz Sürüyor...]")
            for x in seq[:5]
        ]
        flow = " --> ".join(pretty)
        return f"```text\n{flow}\n```"

    def _fallback_case_pulse(self, problem: str, is_completed: bool) -> Tuple[str, str]:
        p = re.sub(r"\s+", " ", problem.strip())
        urgency = (
            "**Öncelik:** Metodoloji tamamlandı — doğrulanmış çıktılar rapora işlendi."
            if is_completed
            else "**Öncelik:** Analiz derinleşiyor; karar çıktıları her tur güncellenmektedir."
        )
        low = problem.lower()
        if any(k in low for k in ("acil", "acilen", "kritik", "müşteri", "şikâyet")):
            urgency = "**Öncelik:** Yüksek — müşteri ve operasyon uçlarında görünür etki bekleniyor."
        elif any(k in low for k in ("gecik", "ertel", "kayıp")):
            urgency = "**Öncelik:** Orta‑yüksek — teslimât ve SLA riski oluşturan gecikme sinyalleri içeriyor."
        elif any(k in low for k in ("stok", "envanter")):
            urgency = "**Öncelik:** Orta — stok-satış uyumsuzluğu ve servis sürekliliği riski doğurabilir."
        if not is_completed and "Analiz derinleşiyor" not in urgency:
            urgency += "\n(**Not:** Süreç açık; bu değerlendirme taslaktır.)"
        return (p[:280] + ("…" if len(p) > 280 else ""), urgency)

    def _gemini_executive_bundle(
        self, problem: str, transcript: str
    ) -> Optional[Dict[str, Any]]:
        if self._model is None:
            return None
        prompt = (
            "Sen operasyon için kıdemli danışmansın (KOBİ ve kooperatif). Aşağıdaki 5 Why oturumu "
            "özeti üret.\n\n"
            "Örnek 5‑neden sıralamasında her kademe tek satır olmalı, semptomdan köke doğru sıralı; "
            '"→" yazma, liste elemanları oklar kod tarafından birleştirilir.\n\n'
            'Yalnızca geçerli JSON yaz. Şema anahtarları Türkçe ve tam olarak böyle olmalı:\n'
            "{\n"
            ' "vaka_cumlesi":"tek cumle sorun tanimi",\n'
            ' "aciliyet_kisa":"Orta / Yuksek vb + kisa gerekce",\n'
            ' "neden_zinciri_5":["kisa1","kisa2","kisa3","kisa4","kisa5"],\n'
            ' "kurumsal_hafiza_maddeleri":["stratejik ders 1"],\n'
            ' "yol_haritasi_teknik":["API otomasyon SLA izleme gibi teknik aksiyonlar"],\n'
            ' "yol_haritasi_operasyonel":["surec rutin KPI egitim SLA gibi operasyon aksiyonlar"] \n'
            "}\n\n"
            "* Madde‑6 uyumu: Teknik liste dijital/entegrasyon/altyapı, operasyonel liste süreç/insan/rituel.\n"
            "* Doğrulanmamış sayı yazma; çıkarım gerekiyorsa cümleyi \"Varsayım:\" ile işaretle.\n"
            '* En az üçer madde yaz; gerekiyorsa aynı cümleyi iki listeye bölmeye çalışma.\n'
            "- Her alan eksiksiz olsun; `neden_zinciri_5` tam olarak 5 eleman.\n\n"
            f"Problem:\n{problem}\n\nTranskript:\n{transcript[:12000]}"
        )
        try:
            response = self._model.generate_content(prompt)
            raw = (response.text or "").strip()
            raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
            raw = re.sub(r"\s*```\s*$", "", raw)
            data = json.loads(raw)
            if not isinstance(data, dict):
                return None

            lv = (
                data.get("neden_zinciri_5")
                or data.get("five_whys")
                or data.get("nedenleri")
                or []
            )
            kh = (
                data.get("kurumsal_hafiza_maddeleri")
                or data.get("lessons_learned")
                or []
            )
            tk = (
                data.get("yol_haritasi_teknik")
                or data.get("technical_roadmap")
                or []
            )
            oo = (
                data.get("yol_haritasi_operasyonel")
                or data.get("operations_roadmap")
                or data.get("operasyonel_yol_haritasi")
                or []
            )
            def _normalize_exec_list(lst: Any) -> List[str]:
                if isinstance(lst, list):
                    return [
                        re.sub(r"\s+", " ", str(x)).strip()
                        for x in lst
                        if str(x).strip()
                    ]
                return []

            lv_list = _normalize_exec_list(lv)[:5]
            kh_list = _normalize_exec_list(kh)
            tk_list = _normalize_exec_list(tk)
            oo_list = _normalize_exec_list(oo)

            return {
                "vaka_cumlesi": str(data.get("vaka_cumlesi") or "").strip(),
                "aciliyet_kisa": str(
                    data.get("aciliyet_kisa") or data.get("aciliyet") or ""
                ).strip(),
                "neden_zinciri_5": lv_list,
                "kurumsal_hafiza_maddeleri": kh_list,
                "yol_haritasi_teknik": tk_list,
                "yol_haritasi_operasyonel": oo_list,
            }
        except Exception as exc:  # noqa: BLE001
            logger.warning("FINAL_REPORT yonetici ozeti (AI): %s", exc)
            return None

    def _write_final_report_md(self, *, is_completed: bool) -> Optional[Path]:
        assert self.state is not None
        history = self.state.history
        schema = METHODOLOGY_SCHEMAS["5why"]
        last_ix = len(schema) - 1
        idx = min(self.state.step_index, last_ix)
        current_label = schema[idx]
        problem = self.state.problem.strip()
        facts_transcript = _merge_facts_assistant_transcript(history)

        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        durum_etiket = (
            "Kapanış (Lessons Learned)" if is_completed else "Analiz sürüyor"
        )

        exec_bundle = (
            self._gemini_executive_bundle(problem, facts_transcript)
            if (is_completed and self._model is not None)
            else None
        )

        overview_raw = (
            (exec_bundle or {}).get("vaka_cumlesi") if exec_bundle else None
        ) or problem
        overview = re.sub(r"\s+", " ", (overview_raw or "").strip())
        if len(overview) > 420:
            overview = overview[:417] + "…"

        gh_levels: List[str] = (
            exec_bundle.get("neden_zinciri_5", []) if exec_bundle else []
        )
        chain = ProblemSolvingAgent._compose_five_why_levels(
            gh_levels,
            problem=problem,
            transcript=facts_transcript,
            history=history,
        )
        flow_diagram = ProblemSolvingAgent._five_whys_arrow_line(chain)

        ftek_md, fops_md = _fallback_technical_operational_roadmaps(
            problem, facts_transcript
        )
        tk_md = _markdown_bullets_from_lines(
            exec_bundle["yol_haritasi_teknik"] if exec_bundle else []
        )
        op_md = _markdown_bullets_from_lines(
            exec_bundle["yol_haritasi_operasyonel"] if exec_bundle else []
        )
        if not tk_md.strip():
            tk_md = ftek_md
        elif len(_lines_from_dash_md(tk_md)) < 2:
            tk_md = ftek_md

        if not op_md.strip():
            op_md = fops_md
        elif len(_lines_from_dash_md(op_md)) < 2:
            op_md = fops_md

        tk_fin = _truncate_bullet_list_md(tk_md, 3).strip()
        if not tk_fin:
            tk_fin = _truncate_bullet_list_md(ftek_md, 3).strip()
        tk_md = tk_fin or "- *Veri çıktısı yok — sonraki oturumda tamamlanır.*"

        op_fin = _truncate_bullet_list_md(op_md, 3).strip()
        if not op_fin:
            op_fin = _truncate_bullet_list_md(fops_md, 3).strip()
        op_md = op_fin or "- *Veri çıktısı yok — sonraki oturumda tamamlanır.*"

        actions_md = _markdown_actions_table(
            _gather_action_table_rows(history, self._sent_mail_keys)
        )

        dialog_archive = _format_dialog_archive(history)

        body = f"""# 📊 YÖNETİCİ OPERASYON RAPORU

Son güncelleme: {now} · {durum_etiket} · Adım: {current_label} ({idx}/{last_ix})

## Vaka Özeti

{overview}

---

## Kök Neden Analizi (5 Whys)

{flow_diagram}

---

## Aksiyonlar Tablosu

{actions_md}

---

## Stratejik Tavsiyeler (Madde 6)

### Teknik

{tk_md}

### Operasyonel

{op_md}

---

## Diyalog Detayları

{dialog_archive}
"""
        out_path = ProblemSolvingAgent._report_output_path()
        out_path.write_text(body, encoding="utf-8")
        return out_path

    def start_analysis(self, problem: str, methodology: str) -> str:
        method_key = self._normalize_methodology(methodology)
        if method_key not in METHODOLOGY_SCHEMAS:
            raise ValueError(f"Unsupported methodology: {methodology}")

        self._pending_email_drafts.clear()
        self._sent_mail_keys.clear()
        self.state = AnalysisState(methodology=method_key, problem=problem)
        related_cases = self.rag.search_cases(problem, top_k=2)
        case_context = "; ".join(f"{c.case_id}: {c.title}" for c in related_cases)

        intro_prompt = (
            f"Problem: {problem}\n"
            f"Methodology: {method_key}\n"
            f"Related cases: {case_context}\n"
            "Act as an Isletme Verimlilik Asistani. Do not assume root cause.\n"
            "Start with one short empathetic sentence and ask only one deepening question\n"
            "based strictly on the user's stated problem."
        )

        response = self._generate_with_fallback(
            intro_prompt,
            method_key,
            is_first_turn=True,
            context_text=problem,
        )
        self.state.history.append({"role": "assistant", "content": response})
        self._sync_pending_drafts_from_response(response)
        if method_key == "5why":
            self._snapshot_5why_report()
        return response

    def get_next_step(self, history: List[Dict[str, str]], user_input: str) -> str:
        if not self.state:
            raise RuntimeError("Analysis has not been started. Call start_analysis first.")

        clean_input = user_input.strip()
        if not clean_input:
            raise ValueError("user_input bos olamaz.")

        # Keep state history canonical to avoid duplicate merges from external history.
        self.state.history.append({"role": "user", "content": clean_input})
        self.state.step_index += 1

        method_key = self.state.methodology
        schema = METHODOLOGY_SCHEMAS[method_key]
        current_step = schema[min(self.state.step_index, len(schema) - 1)]
        prompt = (
            f"Problem: {self.state.problem}\n"
            f"Methodology: {method_key}\n"
            f"Current step: {current_step}\n"
            f"Conversation history: {json.dumps(self.state.history[-8:], ensure_ascii=False)}\n"
            "Guide the user to the next actionable step."
        )

        response = self._generate_with_fallback(
            prompt,
            method_key,
            is_first_turn=False,
            context_text=f"{self.state.problem} {clean_input}",
        )
        self.state.history.append({"role": "assistant", "content": response})
        self._sync_pending_drafts_from_response(response)
        if method_key == "5why":
            self._snapshot_5why_report()
        return response

    def _generate_with_fallback(
        self,
        prompt: str,
        methodology: str,
        is_first_turn: bool,
        context_text: str = "",
    ) -> str:
        system_prompt = METHODOLOGY_PROMPTS[methodology]
        if self._model is None:
            raise RuntimeError(
                "Gemini modeli hazir degil. GEMINI_API_KEY ve paket kurulumunu kontrol edin."
            )

        candidates = self._generate_model_candidates()[: self._MAX_MODEL_PROBE]
        last_error: Optional[Exception] = None

        for idx, model_id in enumerate(candidates):
            if idx > 0 or self._active_model_name != model_id:
                if _gemini_stdout_verbose():
                    print(f"Gemini model denemesi [{idx + 1}/{len(candidates)}]: {model_id}")
                self._switch_model(model_id)

            try:
                response = self._model.generate_content(f"{system_prompt}\n\n{prompt}")
                text = (response.text or "").strip()
                if text:
                    live_text = f"[LIVE AI] {text}"
                    return self._ensure_optional_actions(
                        live_text,
                        methodology,
                        is_first_turn,
                        context_text=context_text,
                    )
                raise RuntimeError("Gemini bos yanit dondu.")
            except Exception as e:  # noqa: BLE001
                last_error = e
                if _gemini_stdout_verbose():
                    print(f"Gemini API hatasi: {e}")
                else:
                    logger.debug(
                        "Gemini deneme %s/%s [%s]: %s",
                        idx + 1,
                        len(candidates),
                        ProblemSolvingAgent._short_model_id(str(model_id)),
                        _first_line_exc(e),
                    )

                if self._is_network_error(e):
                    break

                if self._is_model_missing_error(e):
                    continue

                if self._is_quota_or_rate_limit_error(e):
                    if _gemini_stdout_verbose():
                        print(
                            "Bu model icin kota / limit asildi veya uygun kota yok; "
                            "siradaki uygun chat modeli denenecek."
                        )
                    continue

                raise

        if last_error is not None and not self._is_network_error(last_error):
            if self._is_quota_or_rate_limit_error(last_error):
                if _gemini_stdout_verbose():
                    print(
                        "Tum sirada denenen modellerde kota veya RPM limitine takilinmis olabilir:\n"
                        "- Bir sure bekleyip tekrar dene,\n"
                        "- Google AI Studio / Cloud'da kota ve odemeyi kontrol et "
                        "(bos hesapta bazen limit: 0 olur),\n"
                        "- Farkli bir GEMINI_MODEL sec veya GEMINI_API_KEY kullan.\n"
                    )
                logger.warning(
                    "Gemini: kota/limit nedeniyle tum siradaki modeller kullanilamadi. "
                    "Ayrinti icin GEMINI_VERBOSE=1 veya log seviyesini ayarlayin."
                )
            if _gemini_stdout_verbose():
                print(
                    "Tum aday modelleri basarisiz. list_models ciktisindan uygun bir id'yi "
                    "GEMINI_MODEL ile sabitleyebilirsin."
                )
            else:
                print(
                    "\nGemini: Tum denemeler basarisiz "
                    "(kota, ag veya model id). Tam hata için: GEMINI_VERBOSE=1\n"
                )
            self._print_model_catalog_hint()
            raise last_error

        # Deterministic fallback for local/dev use without API key.
        first_question = {
            "5why": (
                "Anladim, bu durum operasyonunu zorlamis gorunuyor. "
                "Ilk neden sorusuyla baslayalim: Siparis gecikmesi veya stok akisinda ilk kopma "
                "hangi noktada oldu?"
            ),
            "ishikawa": (
                "Anladim, birlikte netlestirelim. "
                "People dalindan baslayalim: Siparis ve stok surecinde kimlerin sorumluluk devri "
                "belirsiz kaldi?"
            ),
            "8d": (
                "Durumu anladim, cozum icin sistematik ilerleyelim. "
                "D1: Siparis gecikmesi ve kargo takibi sorununu cozecek cekirdek ekipte hangi "
                "roller yer almali?"
            ),
        }[methodology]

        body = (
            first_question
            if is_first_turn
            else "Paylastigin bilgiye gore bir sonraki adimda olculebilir kanit toplamaya odaklanalim. "
            "Lutfen son gozlemini tarih/saat ve etkilenen siparis-stok-kargo adimi ile birlikte belirt."
        )
        return self._ensure_optional_actions(
            body,
            methodology,
            is_first_turn,
            context_text=context_text,
        )

    @staticmethod
    def _is_network_error(exc: Exception) -> bool:
        msg = str(exc).lower()
        network_markers = [
            "connection",
            "timeout",
            "timed out",
            "network",
            "name resolution",
            "dns",
            "unreachable",
            "temporary failure",
            "ssl",
        ]
        return any(marker in msg for marker in network_markers)

    @staticmethod
    def _normalize_methodology(methodology: str) -> str:
        key = methodology.strip().lower()
        aliases = {"5 why": "5why", "5why": "5why", "ishikawa": "ishikawa", "8d": "8d"}
        if key not in aliases:
            raise ValueError(f"Unsupported methodology: {methodology}")
        return aliases[key]

    @staticmethod
    def _ensure_optional_actions(
        text: str,
        methodology: str,
        is_first_turn: bool,
        context_text: str = "",
    ) -> str:
        text = ProblemSolvingAgent._strip_markdown_duplicate_action_headers(text)

        if (
            '"optional_actions"' in text
            or re.search(r'"optional_actions"\s*:', text)
            or re.search(r"'optional_actions'\s*:", text)
        ):
            return text.strip()

        scope = context_text.lower()
        actions = []
        if "stok" in scope:
            actions.append(
                {
                    "type": "assign_task",
                    "label": "Gorev ata",
                    "assignee": "Tedarikci",
                    "due_date": "2026-05-12",
                    "task": "Kritik urunler icin tedarik terminini ve sevk planini guncelle.",
                }
            )
            actions.append(
                {
                    "type": "assign_task",
                    "label": "Gorev ata",
                    "assignee": "Depo Sorumlusu",
                    "due_date": "2026-05-12",
                    "task": "Stok devir hizini ve kritik urun min-max seviyelerini kontrol et.",
                }
            )
        if "kargo" in scope or "teslimat" in scope:
            actions.append(
                {
                    "type": "assign_task",
                    "label": "Gorev ata",
                    "assignee": "Kargo Firmasi",
                    "due_date": "2026-05-12",
                    "task": "Geciken sevkiyatlar icin guncel teslimat plani ve ETA paylas.",
                }
            )
        if "siparis" in scope or "gecik" in scope:
            actions.append(
                {
                    "type": "assign_task",
                    "label": "Gorev ata",
                    "assignee": "Depo Sorumlusu",
                    "due_date": "2026-05-12",
                    "task": "Bekleyen siparisleri oncelik sirasina gore yeniden planla.",
                }
            )

        if not actions and is_first_turn and methodology == "5why":
            actions.append(
                {
                    "type": "assign_task",
                    "label": "Gorev ata",
                    "assignee": "Depo Sorumlusu",
                    "due_date": "2026-05-12",
                    "task": "Kooperatif operasyonlarinda geciken siparis adimlarini raporla.",
                }
            )

        if not any(a.get("type") == "draft_email" for a in actions):
            actions.extend(ProblemSolvingAgent._heuristic_draft_emails(scope))

        payload = {"optional_actions": actions}
        return f"{text.strip()}\n\n{json.dumps(payload, ensure_ascii=False)}"

    @staticmethod
    def _strip_markdown_duplicate_action_headers(text: str) -> str:
        """Prompt Turkce yazdiginda LLM'in **opsiyonel_aksiyonlar:** satin cift blok olmasin."""
        stripped = text
        for pat in (
            r"(?mi)^\s*[-*]?\s*\*+\s*opsiyonel_aksiyonlar\*+\s*:.*$",
            r"(?mi)^\s*[-*]?\s*\*+\s*optional_actions\*+\s*:.*$",
            r"(?msi)\*{0,2}\s*opsiyonel_aksiyonlar\s*\*{0,2}\s*:\s*\[\s*\]\s*",
        ):
            stripped = re.sub(pat, "", stripped)
        return stripped.strip()
