"""Mock vector store until ChromaDB is integrated."""

from dataclasses import dataclass
from typing import List


@dataclass
class CaseRecord:
    case_id: str
    title: str
    summary: str
    tags: List[str]


class MockRAG:
    """Simple keyword-based retrieval to simulate past case search."""

    def __init__(self) -> None:
        self._cases: List[CaseRecord] = [
            CaseRecord(
                case_id="CASE-001",
                title="Kooperatifte siparis gecikmesi artisi",
                summary="Siparis toplama ve kargo cikis saatleri uyumsuz oldugu icin gecikmeler artti.",
                tags=["siparis", "gecikme", "kargo", "5why"],
            ),
            CaseRecord(
                case_id="CASE-002",
                title="Stok tukenmesi nedeniyle satis kaybi",
                summary="Kritik urunlerde min-max seviyeleri izlenmedigi icin stok disi kalma siklasti.",
                tags=["stok", "tedarik", "8d", "planlama"],
            ),
            CaseRecord(
                case_id="CASE-003",
                title="Kargo takibinde bilgi kopuklugu",
                summary="Kargo firmasi ve depo arasinda durum guncellemesi gecikince musteri bilgilendirmesi aksadi.",
                tags=["kargo", "depo", "ishikawa", "surec"],
            ),
        ]

    def search_cases(self, query: str, top_k: int = 3) -> List[CaseRecord]:
        """Return most relevant mock cases based on token overlap."""
        q_tokens = {token.strip().lower() for token in query.split() if token.strip()}
        if not q_tokens:
            return self._cases[:top_k]

        scored = []
        for case in self._cases:
            corpus = f"{case.title} {case.summary} {' '.join(case.tags)}".lower()
            score = sum(1 for token in q_tokens if token in corpus)
            scored.append((score, case))

        scored.sort(key=lambda item: item[0], reverse=True)
        return [case for score, case in scored if score > 0][:top_k] or self._cases[:top_k]
