"""Step-by-step methodology schemas for orchestration logic."""

from typing import Dict, List


METHODOLOGY_SCHEMAS: Dict[str, List[str]] = {
    "5why": [
        "Problem tanimi",
        "Why #1",
        "Why #2",
        "Why #3",
        "Why #4",
        "Why #5 / kok neden dogrulama",
        "Duzeltici aksiyon",
        "Onleyici aksiyon",
        "Lessons Learned",
    ],
    "ishikawa": [
        "Problem ve etki tanimi",
        "People nedenleri",
        "Process nedenleri",
        "Machine nedenleri",
        "Material nedenleri",
        "Measurement nedenleri",
        "Environment nedenleri",
        "Onceliklendirme ve kok neden",
        "Lessons Learned",
    ],
    "8d": [
        "D1 Takim olusturma",
        "D2 Problemi tanimlama",
        "D3 Gecici aksiyon",
        "D4 Kok neden analizi",
        "D5 Kalici cozum secimi",
        "D6 Uygulama ve dogrulama",
        "D7 Tekrari onleme",
        "D8 Takdir ve standardizasyon",
        "Lessons Learned",
    ],
}
