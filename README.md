KURULUM VE KRİTİK AYARLAR (İLK ADIM)
DİKKAT: Bu projeyi klonladığınızda sistemin çalışması için bazı gizli dosyaları manuel oluşturmanız gerekir. Güvenlik nedeniyle (.gitignore) API anahtarları ve şifreler kodla birlikte gelmez.

1. .env Dosyasını Oluşturun
Proje kök dizininde (yani README.md ile aynı klasörde) .env isimli bir dosya oluşturun. İsterseniz şu komutla şablondan kopyalayabilirsiniz:

2. İçini Doldurun
Oluşturduğunuz .env dosyasını açın ve aşağıdaki şablona göre kendi bilgilerinizi girin. Dosyanın başka bir alt klasörde değil, ana dizinde olduğundan emin olun.

Kod snippet'i
# Gemini Yapay Zeka Ayarları (Eksikse AI cevap üretmez)
GEMINI_API_KEY=buraya_gemini_api_keyini_yaz

# E-posta Gönderim Ayarları (SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=gonderici_mail_adresin@gmail.com
# ÖNEMLİ: Gmail kullanıyorsanız düz hesap şifreniz DEĞİL, 
# Google hesabınızdan aldığınız "Uygulama Şifresi"ni yazmalısınız.
SMTP_PASS=uygulama_sifreniz_buraya

# Opsiyonel Mail Ayarları
SMTP_FROM= # Boş bırakırsanız SMTP_USER kullanılır
DEFAULT_KARGO_MAIL_TO=kargo@isletme.com
DEFAULT_DEPO_MAIL_TO=depo@isletme.com
DEFAULT_TEDARIK_MAIL_TO=tedarik@isletme.com
💡 Önemli Notlar:
API Key Yoksa: Yapay zeka analiz yapamaz ve cevap üretmez.

SMTP Bilgileri Yoksa: Mailler taslak olarak hazırlanır ama gerçek gönderim yapılmaz.

Konum: .env dosyası mutlaka projenin ana klasöründe (/problem-solving-ai-chatbot/.env) durmalıdır.

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
