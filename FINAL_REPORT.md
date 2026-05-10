# 📊 YÖNETİCİ OPERASYON RAPORU

Son güncelleme: 2026-05-10 20:06 UTC · Analiz sürüyor · Adım: Why #2 (2/8)

## Vaka Özeti

Siparislerimiz cok gecikiyor

---

## Kök Neden Analizi (5 Whys)

```text
Siparislerimiz cok gecikiyor --> Siparişlerin gecikmesi, hem müşteri güvenini sarsan hem de operasyonel maliyetleri artıran kritik bir durumdur; bu sorunu birlikte çözmek… --> Yaşadığınız bu durum, özellikle kampanya dönemleri veya yoğun zamanlarda operasyonu kilitleyebilecek ciddi bir teknik aksaklıktır; 500 pa… --> Dış sistemlere bu kadar bağımlı bir operasyonda, "sessiz hata" (silent failure) dediğimiz bu durumun yaşanması, operasyonun sürdürülebili… --> kargo firmasıyla aramızda resmi bir iletişim protokolü olmaması ve sistemde bir 'monitoring/hata takip' yapısının bulunmaması. Güncellemeden haberimiz olmadı, sistem de pat…
```

---

## Aksiyonlar Tablosu

| Birim | Görev | Durum |
|:---:|:---|:---|
| Operasyon Sorumlusu | Son 10 siparişin 'Sipariş Onayı' ile 'Kargo Teslimi' arasında geçen süreleri ve takılan aşamaları listele. | 📌 ATANDI |
| operasyon@kargofirmasi.com | E-posta: Sipariş Alımları Hakkında - Gecikme Bildirimi | ✅ GÖNDERİLDİ |
| Sistem Yöneticisi | Yurtiçi Kargo müşteri panelinden yeni API/auth anahtarlarını al ve entegrasyon ayarlarında güncelle. Bağlantıyı test et. | 📌 ATANDI |
| entegrasyon@yurticikargo.com | E-posta: ACİL: API Auth Hatası ve Gönderi Oluşturma Sorunu - [Kooperatif/Şirket Adı] | ✅ GÖNDERİLDİ |
| Depo Sorumlusu | API sorunu çözülene kadar paketleme yapan personelin bir kısmını kargo verilerinin hazırlanmasına (Excel listesi vb.) yönlendirerek birikmeyi yönet. | 📌 ATANDI |
| bolge_mudurlugu@yurticikargo.com | E-posta: Hizmet Kesintisi ve Operasyonel Mağduriyet Hakkında - [Kooperatif/Şirket Adı] | ⏳ GÖNDERİM BEKLENİYOR |
| Depo Sorumlusu | API çalışana kadar manuel tek tek giriş yapmak yerine, bekleyen 500 siparişi Yurtiçi Kargo'nun 'Self-Servis' veya 'Toplu Gönderi' (Excel) şablonuna uygun hale getirerek kargo şubesiyle bu listeyi paylaş. | 📌 ATANDI |
| Genel Müdür / Kooperatif Başkanı | Kritik dış sistem entegrasyonlarının (Kargo, Banka, Yazılım) 'Sistem Sağlık Kontrolü' sorumluluğunu bir personele görev olarak ata ve bu personelin kargo firmasındaki teknik irtibat kişileriyle eşleşmesini sağla. | 📌 ATANDI |


---

## Stratejik Tavsiyeler (Madde 6)

### Teknik

- Kargo firmasi veya entegrasyon (API/panel) kesintileri musteriye yansimadan once operasyonda fark edilmeyebilir.
- Siparis-kargo-stok icin tek referans paneli veya tablo (tek dogruluk kaynagi) kullanin.

### Operasyonel

- Operasyonel verilerin (siparis, stok, kargo) daginik tutulmasi tekrar eden gecikme ve yanlis onceliklere yol acabilir.
- Insan bagimli takip (telefon/mesaj) arttikca hata ve unutma riski buyur.
- Kritik stok tukenmesi musteri kaybi ve acil tedarik maliyeti riski tasir.

---

## Diyalog Detayları

### Asistan

[LIVE AI] Siparişlerin gecikmesi, hem müşteri güvenini sarsan hem de operasyonel maliyetleri artıran kritik bir durumdur; bu sorunu birlikte çözmek için buradayım.

**Mevcut Adım:** 1. Neden Analizi (Kök Neden Tespiti Başlangıcı)

**Soru:** Siparişlerinizin gecikmesine neden olan darboğaz operasyonun hangi aşamasında (ürünlerin stoktan ayrılması, paketleme süreci veya kargonun teslim alınması) daha belirgin hissediliyor?

**Gerekçe:** Sorunun kaynağının depodaki hazırlık süreçlerinden mi yoksa dış lojistik partnerlerinden mi kaynaklandığını netleştirmemiz, doğru çözüme odaklanmamızı sağlayacaktır.

**Ders Çıkarımı (Ön Analiz):**
Gecikme şikayetleri genellikle operasyonel görünürlük eksikliğinden kaynaklanır. Darboğazın yerini netleştirmek, tüm süreci iyileştirmek yerine odaklanmış bir müdahale yapmamıza olanak tanır.

```json
{
  "optional_actions": [
    {
      "type": "check_inventory",
      "label": "Kritik stok kontrolü yap",
      "item": "En çok satan 5 ürün",
      "site": "Merkez Depo"
    },
    {
      "type": "assign_task",
      "label": "Gecikme dökümü hazırla",
      "assignee": "Operasyon Sorumlusu",
      "due_date": "Bugün sonuna kadar",
      "task": "Son 10 siparişin 'Sipariş Onayı' ile 'Kargo Teslimi' arasında geçen süreleri ve takılan aşamaları listele."
    },
    {
      "type": "draft_email",
      "label": "Kargo firmasına durum sorgusu",
      "to": "operasyon@kargofirmasi.com",
      "subject": "Sipariş Alımları Hakkında - Gecikme Bildirimi",
      "body": "Sayın Yetkili,\n\nSon dönemde kooperatifimizden çıkan siparişlerin teslim alınma süreçlerinde aksamalar gözlemlemekteyiz. Günlük kargo alım saatlerimize uyum ve yaşanan gecikmelerin operasyonel nedenleri hakkında bilgi rica ediyoruz.\n\nKonunun ivedilikle incelenmesini ve tarafımıza dönüş yapılmasını bekleriz.\n\nSaygılarımızla."
    }
  ]
}
```

### Kullanıcı

Kargo teslimatı aşamasında büyük bir yığılma var. Yurtiçi Kargo API'si hafta sonu güncellenmiş, bizim auth anahtarları geçersiz kalmış. Gönderi numaraları otomatik oluşmadığı için personel manuel giriyor, depoda 500 paket birikti. Acil çözüm lazım.

### Asistan

[LIVE AI] Yaşadığınız bu durum, özellikle kampanya dönemleri veya yoğun zamanlarda operasyonu kilitleyebilecek ciddi bir teknik aksaklıktır; 500 paketin manuel girilmesi ciddi bir iş gücü kaybı ve hata riski demektir.

**Mevcut Adım:** 2. Neden Analizi (Süreç Kesintisi Kaynağı)

**Soru:** Yeni API/auth anahtarlarını Yurtiçi Kargo panelinden alıp sisteme girmemize veya kargo firmasının teknik destek ekibiyle bu güncellemeyi tamamlamamıza engel olan temel durum nedir?

**Gerekçe:** Sorunun kargo firmasından yeni bilgilerin gelmemesi mi, yoksa sistemimizdeki yönetim paneline erişim kısıtı mı olduğunu bilmemiz, manuel girişi durduracak teknik müdahaleyi hızlandıracaktır.

**Ders Çıkarımı (Ön Analiz):**
Kritik dış sistem entegrasyonlarında (Kargo API gibi) hafta sonu yapılan güncellemelerin takibi ve teknik "iletişim kişisi" eksikliği, tüm operasyonun durmasına yol açabilir. Bu tür durumlar için sistemde "Manuel Giriş" yerine "Toplu Liste Yükleme" (CSV/Excel) gibi bir B planının bulunmaması, darboğazın etkisini büyütür.

```json
{
  "optional_actions": [
    {
      "type": "assign_task",
      "label": "API Anahtarlarını Güncelle",
      "assignee": "Sistem Yöneticisi",
      "due_date": "1 saat içinde",
      "task": "Yurtiçi Kargo müşteri panelinden yeni API/auth anahtarlarını al ve entegrasyon ayarlarında güncelle. Bağlantıyı test et."
    },
    {
      "type": "draft_email",
      "label": "Yurtiçi Kargo Teknik Destek Talebi",
      "to": "entegrasyon@yurticikargo.com",
      "subject": "ACİL: API Auth Hatası ve Gönderi Oluşturma Sorunu - [Kooperatif/Şirket Adı]",
      "body": "Sayın Yetkili,\n\nHafta sonu gerçekleştirilen API güncellemesi sonrasında auth anahtarlarımız geçersiz kalmış ve sistemimiz üzerinden gönderi numarası alınamamaktadır. Şu an depomuzda gönderilmeyi bekleyen 500 adet paket birikmiş durumdadır.\n\nGüncel API bilgilerimizin tarafımıza iletilmesini veya mevcut bağlantı sorunumuzun ivedilikle teknik ekibinizce incelenmesini rica ederiz. Konu operasyonel olarak kritik seviyededir.\n\nMüşteri No / API Kullanıcı Adı: [Buraya Yazınız]\n\nSaygılarımızla."
    },
    {
      "type": "assign_task",
      "label": "Personel Kaydırması Yap",
      "assignee": "Depo Sorumlusu",
      "due_date": "Hemen",
      "task": "API sorunu çözülene kadar paketleme yapan personelin bir kısmını kargo verilerinin hazırlanmasına (Excel listesi vb.) yönlendirerek birikmeyi yönet."
    }
  ]
}
```

### Kullanıcı

kargo firmasıyla aramızda resmi bir iletişim protokolü olmaması ve sistemde bir 'monitoring/hata takip' yapısının bulunmaması. Güncellemeden haberimiz olmadı, sistem de patlayana kadar bizi uyarmadı. Tamamen kargo firmasının insiyatifine ve personelin manuel dikkatine kalmış durumdayız.

### Asistan

[LIVE AI] Dış sistemlere bu kadar bağımlı bir operasyonda, "sessiz hata" (silent failure) dediğimiz bu durumun yaşanması, operasyonun sürdürülebilirliği önündeki en büyük engeldir; 500 paketin manuel girişiyle kaybedilen zamanı yapısal bir çözümle telafi etmeliyiz.

**Mevcut Adım:** 3. Neden Analizi (Kurumsal İletişim ve İzleme Boşluğu)

**Soru:** Kargo firmasıyla yapılan mevcut hizmet sözleşmesinde teknik güncellemelerin bildirimine dair bir madde bulunmaması mı, yoksa kurum içinde bu entegrasyonun sağlığını takip edecek (operasyonel veya teknik) bir sorumlunun net olarak tanımlanmamış olması mı bu boşluğu yarattı?

**Gerekçe:** Sorunun sözleşme kaynaklı mı yoksa iç görev tanımı eksikliği mi olduğunu anlamak, kargo firmasına karşı hukuki/ticari haklarımızı kullanmamızı veya iç süreçlerimizde "sistem sorumlusu" rolünü netleştirmemizi sağlayacaktır.

**Ders Çıkarımı (Ön Analiz):**
Kritik iş süreçleri (kargo, ödeme sistemleri vb.) "kur ve unut" mantığıyla yönetilemez. Dış partnerlerle olan ilişkilerde sadece fiyat değil, "servis seviyesi taahhüdü" (SLA) ve teknik iletişim kanallarının netliği, bu tür krizlerin maliyetini belirleyen temel unsurdur.

```json
{
  "optional_actions": [
    {
      "type": "draft_email",
      "label": "Resmi Protokol ve Zarar Tazmin Talebi",
      "to": "bolge_mudurlugu@yurticikargo.com",
      "subject": "Hizmet Kesintisi ve Operasyonel Mağduriyet Hakkında - [Kooperatif/Şirket Adı]",
      "body": "Sayın Bölge Yöneticisi,\n\nKurumumuz ile şirketiniz arasındaki kargo gönderi entegrasyonu, hafta sonu tarafınızca yapılan API güncellemesi nedeniyle çalışamaz hale gelmiştir. Bu durum hakkında önceden bilgilendirme yapılmaması sonucunda 500'den fazla siparişimizin sevkiyatı durmuş ve ciddi bir operasyonel iş yükü oluşmuştur.\n\nMağduriyetimizin giderilmesi adına acilen tarafımıza teknik bir muhatap atanmasını ve benzer güncellemelerin en az 48 saat öncesinden yazılı olarak bildirilmesini sağlayacak bir iletişim protokolünün oluşturulmasını talep ediyoruz. \n\nKonunun ivedilikle değerlendirilmesini rica eder, iyi çalışmalar dileriz.\n\nSaygılarımızla."
    },
    {
      "type": "assign_task",
      "label": "Toplu Gönderi Dosyası Hazırla",
      "assignee": "Depo Sorumlusu",
      "due_date": "2 saat içinde",
      "task": "API çalışana kadar manuel tek tek giriş yapmak yerine, bekleyen 500 siparişi Yurtiçi Kargo'nun 'Self-Servis' veya 'Toplu Gönderi' (Excel) şablonuna uygun hale getirerek kargo şubesiyle bu listeyi paylaş."
    },
    {
      "type": "assign_task",
      "label": "Sorumluluk Matrisi Güncelleme",
      "assignee": "Genel Müdür / Kooperatif Başkanı",
      "due_date": "Bu hafta sonu",
      "task": "Kritik dış sistem entegrasyonlarının (Kargo, Banka, Yazılım) 'Sistem Sağlık Kontrolü' sorumluluğunu bir personele görev olarak ata ve bu personelin kargo firmasındaki teknik irtibat kişileriyle eşleşmesini sağla."
    }
  ]
}
```

