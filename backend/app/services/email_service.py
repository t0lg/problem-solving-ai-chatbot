"""SMTP mail gonderimi: AI tarafindan hazirlanan taslaklar onaydan sonra kullanilir."""

from __future__ import annotations

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, Tuple

logger = logging.getLogger(__name__)

__all__ = ["send_draft_email"]


def _normalize_email_body_plain(text: str) -> str:
    """JSON/model ciktisi bazen \\\\n olarak birakir; gercek satir kirilimina cevir."""
    if not text:
        return ""
    t = (
        text.replace("\\r\\n", "\n")
        .replace("\\r", "\n")
        .replace("\\n", "\n")
        .replace("\\t", "\t")
    )
    t = "\n".join(line.rstrip() for line in t.split("\n")).strip("\n").strip()
    return t


def send_draft_email(draft_email: Dict[str, Any]) -> Tuple[bool, str]:
    """draft_email objsindeki to, subject, body ile SMTP uzerinden gonder.

    Gerekli ortam (.env): SMTP_SERVER, SMTP_USER, SMTP_PASS
    Isteg'e bagli: SMTP_PORT (varsayilan 587), SMTP_FROM (varsayilan SMTP_USER).
    Taslak yapisi bekleniyor:
      {"type": "draft_email", "to": "...", "subject": "...", "body": "..."}
    """
    if draft_email.get("type") != "draft_email":
        msg = "Gecersiz aksiyon: draft_email bekleniyor."
        logger.warning(msg)
        return False, msg

    to_addr = str(draft_email.get("to", "")).strip()
    subject = str(draft_email.get("subject", "")).strip()
    body = _normalize_email_body_plain(str(draft_email.get("body", "")))

    if not to_addr:
        logger.warning("Mail gonderimi: alici (to) bos.")
        return False, "Mail taslagi hazir ama gonderilemedi: alici (to) adresi yok."

    server = os.getenv("SMTP_SERVER", "").strip()
    user = os.getenv("SMTP_USER", "").strip()
    password = os.getenv("SMTP_PASS", "").strip()

    if not server or not user or not password:
        logger.warning(
            "SMTP yapilandirmasi eksik (SMTP_SERVER, SMTP_USER veya SMTP_PASS).",
        )
        return (
            False,
            "Mail taslagi hazir ama gonderilemedi: SMTP ortam bilgileri tam degil.",
        )

    port = int(os.getenv("SMTP_PORT", "587").strip())
    from_addr = os.getenv("SMTP_FROM", "").strip() or user

    message = MIMEMultipart("alternative")
    message["Subject"] = subject or "(Konu belirtilmedi)"
    message["From"] = from_addr
    message["To"] = to_addr

    subtype = "html" if body.lstrip().lower().startswith("<") else "plain"
    message.attach(MIMEText(body if body else " ", subtype, _charset="utf-8"))

    try:
        with smtplib.SMTP(server, port, timeout=30) as smtp:
            smtp.ehlo()
            try:
                smtp.starttls()
                smtp.ehlo()
            except smtplib.SMTPException:
                logger.info("SMTP starttls atladi veya zorlanmadi.")

            try:
                smtp.login(user, password)
            except smtplib.SMTPAuthenticationError as e:
                logger.exception("SMTP kimlik dogrulama basarisiz")
                return False, (
                    "Mail taslagi hazir ama gonderilemedi: SMTP kullanici adi "
                    "veya sifresi yanlis / yetki yok. "
                    f"Teknik ozet: {e}"
                )
            except Exception as e:  # noqa: BLE001
                logger.exception("SMTP login beklenmedik hata")
                return False, f"Mail taslagi hazir ama gonderilemedi: {e}"

            try:
                smtp.sendmail(from_addr, [to_addr], message.as_string())
            except Exception as e:  # noqa: BLE001
                logger.exception("sendmail basarisiz")
                return False, f"Mail taslagi hazir ama gonderilemedi: {e}"

        return True, "Mail basariyla gonderildi."

    except OSError as e:
        logger.exception("SMTP baglantisi kurulamadi")
        return (
            False,
            f"Mail taslagi hazir ama gonderilemedi: sunucuya baglanilamadi ({e}).",
        )
    except smtplib.SMTPException as e:
        logger.exception("SMTP hatasi")
        return False, f"Mail taslagi hazir ama gonderilemedi: SMTP hatasi ({e})."

