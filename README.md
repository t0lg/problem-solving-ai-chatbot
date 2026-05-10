# AI Problem Solving Chatbot

> **Dikkat:** Branch’ler arasında README’yi “hep aynı” sanıp geçmeyin; bu dosya branch’e göre güncellenir. **`.env` ve içindeki sırlar repoda yoktur** ([.gitignore](.gitignore)) — API anahtarı ve SMTP bilgisi klon sonrası sizin eklemeniz gerekir. Hemen aşağıdaki tabloyu ve [.env.example](.env.example) şablonunu kullanın.

---

## Ortam dosyası ve gizli bilgiler

Şu dosyalar **Git’te izlenmez** (repoda görünmezler, klonladığınızda boştan oluşturmanız gerekir):

| Dosya | Açıklama |
|:---|:---|
| `.env` | Asıl sırlar: API anahtarı, SMTP şifresi, gerçek e-posta adresleri. |
| `.env.local` | Bazı araçların kullandığı ek yerel yapılandırma. |
| `.env.<ortam>.local` | Ortama özel yerel ekler (`*.local` deseni). |

**Repoda olan şey:** yalnızca şablon [.env.example](.env.example) (değer yok, güvenli). İlk kurulum:

```bash
cp .env.example .env
```

Aşağıdaki tablo kod tabanıyla uyumlu tüm ortam anahtarlarını listeler (`getenv` ile okunanlar). Zorunluluk, üretimde e-posta veya Gemini kullanımına bağlıdır.

| Değişken | Tipik zorunluluk | Kullanım |
|:---|:---|:---|
| `GEMINI_API_KEY` | LLM çalışsın istiyorsanız **evet** | Google Generative AI (Gemini) kimlik doğrulama |
| `GEMINI_MODEL` | Hayır | Kullanılacak model kimliği; boşsa uygulama varsayılanı |
| `GEMINI_VERBOSE` | Hayır | `1` / `true` iken daha ayrıntılı konsol logu |
| `SMTP_SERVER` | E-posta gönderimi için **evet** | SMTP sunucu adresi |
| `SMTP_PORT` | Genelde dolu (`587`) | SMTP portu |
| `SMTP_USER` | E-posta gönderimi için **evet** | SMTP kullanıcı adı |
| `SMTP_PASS` | E-posta gönderimi için **evet** | SMTP şifresi |
| `SMTP_FROM` | Hayır | Gönderen adresi; boşsa çoğu senaryoda `SMTP_USER` kullanılır |
| `DEFAULT_KARGO_MAIL_TO` | Hayır | Taslak e-posta önerilerinde kargo varsayılan alıcısı |
| `DEFAULT_TEDARIK_MAIL_TO` | Hayır | Taslak şablonda tedarik varsayılan alıcısı |
| `DEFAULT_DEPO_MAIL_TO` | Hayır | Taslak şablonda depo varsayılan alıcısı |

Gerçek değerleri repoya eklemeyin; ekip içi paylaşımda sırları güvenli kanallardan iletin.

Hangi `.py` dosyasının hangi değişkeni okuduğunu [.env.example](.env.example) içindeki yorum satırlarında da görebilirsiniz.

---

AI Problem Solving Chatbot, üretim, otomotiv, lojistik ve operasyon ekiplerinin sistematik problem çözme süreçlerini daha hızlı, düzenli ve izlenebilir hale getirmek için geliştirilen AI destekli bir web uygulamasıdır.

Proje; 5 Why, Ishikawa / Fishbone ve 8D gibi profesyonel problem çözme metodolojilerini destekler. Kullanıcıya adım adım rehberlik eder, çözüm süreci sonunda lessons learned kaydı oluşturur ve geçmiş problem çözme deneyimlerini kurumsal bilgi havuzunda saklamayı hedefler.

---

## Problem

Şirketlerde karşılaşılan operasyonel problemler genellikle sistematik problem çözme yöntemleriyle ele alınır. Ancak bu süreçler çoğu zaman:

- Dağınık dokümanlar üzerinden yürütülür.
- Geçmiş çözüm deneyimleri kaybolur.
- Ekipler arası bilgi paylaşımı sınırlı kalır.
- Benzer problemler tekrar yaşandığında önceki çözümlere hızlı erişilemez.
- Problem çözme metodolojileri her ekip tarafından aynı standartta uygulanmaz.

Bu durum, problem çözme sürecinin yavaşlamasına ve kurumsal hafızanın zayıflamasına neden olur.

---

## Çözüm

Bu proje, AI destekli bir problem solving chatbot sunar.

Chatbot:

- Kullanıcıya seçilen metodolojiye göre adım adım rehberlik eder.
- 5 Why, Ishikawa / Fishbone ve 8D gibi problem çözme şablonlarını destekler.
- Kullanıcı cevaplarına göre bir sonraki soruyu üretir.
- Süreç sonunda yapılandırılmış problem çözme raporu oluşturur.
- Lessons learned kayıtlarını bilgi havuzuna işler.
- Geçmişte benzer bir problem yaşanıp yaşanmadığını RAG yapısı ile arar.

---

## Değer Önerisi

Bu proje şirketlere aşağıdaki faydaları sağlamayı hedefler:

- Problem çözme süreçlerinde hız ve verimlilik
- Kurumsal hafıza oluşturma
- Çapraz ekipler arasında bilgi paylaşımı
- Tekrarlayan sorunlarda daha hızlı aksiyon alma
- Problem çözme metodolojilerinin standartlaştırılması
- Lessons learned kayıtlarının tekrar kullanılabilir hale gelmesi

---

## MVP Özellikleri

İlk MVP kapsamında hedeflenen özellikler:

- Problem kaydı başlatma
- Problem çözme metodolojisi seçme
- Chatbot ile adım adım problem analizi yürütme
- AI destekli soru üretimi
- Final problem solving raporu oluşturma
- Lessons learned kaydetme
- Geçmiş benzer problemleri arama
- Basit web arayüzü üzerinden kullanıcı etkileşimi

---

## Desteklenen Metodolojiler

### 5 Why

Problemin kök nedenine ulaşmak için art arda “neden?” sorularının sorulduğu problem çözme metodolojisidir.

### Ishikawa / Fishbone

Problemin olası nedenlerini kategorilere ayırarak analiz etmeyi sağlayan görsel ve sistematik bir yöntemdir.

Temel kategoriler:

- Man
- Machine
- Method
- Material
- Measurement
- Environment

### 8D

Takım bazlı ve disiplinli problem çözme sürecidir.

Temel adımlar:

- D1 - Takım oluştur
- D2 - Problemi tanımla
- D3 - Geçici önlem al
- D4 - Kök nedeni belirle
- D5 - Kalıcı düzeltici aksiyonları seç
- D6 - Aksiyonları uygula
- D7 - Tekrarı önle
- D8 - Takımı takdir et

---

## Teknoloji Stack

### Backend

- Python
- FastAPI
- Pydantic
- Gemini API
- ChromaDB

### Frontend

- React.js
- Vite
- JavaScript
- Fetch / Axios

### AI Layer

- Gemini API
- Prompt templates
- Methodology-based guided reasoning

### RAG Layer

- ChromaDB
- Lessons learned kayıtları
- Similar problem search
- Knowledge base retrieval

---

## Proje Yapısı

```text
problem-solving-ai-chatbot/
│
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI endpointleri
│   │   ├── core/             # Config ve Pydantic modelleri
│   │   ├── llm/              # Gemini API ve prompt yönetimi
│   │   ├── rag/              # ChromaDB ve RAG işlemleri
│   │   ├── services/         # Business logic katmanı
│   │   └── templates/        # Problem çözme metodolojileri
│   │
│   ├── lessons/              # Örnek lessons learned kayıtları
│   ├── tests/                # Backend testleri
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/       # UI componentleri
│   │   ├── pages/            # Sayfalar
│   │   └── services/         # API çağrıları
│   │
│   └── package.json
│
├── docker/                   # Docker dosyaları
├── docs/                     # Dokümantasyon
├── scripts/                  # Yardımcı scriptler
├── .gitignore
└── README.md
