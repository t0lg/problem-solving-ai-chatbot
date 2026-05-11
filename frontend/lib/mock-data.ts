import type { Problem, AnalysisResult, TimelineEvent } from "@/types/problem";
import type { Methodology } from "@/types/methodology";
import type { Incident, SimilarIncident, LessonLearned } from "@/types/incident";

// ── Recent Incidents ────────────────────────────────────────────────────
export const mockIncidents: Incident[] = [
  {
    id: "INC-2024-001",
    title: "Taşıyıcı Bant Motorunun Aşırı Isınması",
    description: "Üretim hattı 3 taşıyıcı bant motoru sıcaklığı yoğun kullanım sırasında eşiği 15°C aştı.",
    category: "mechanical",
    severity: "high",
    status: "investigating",
    reportedAt: "2024-12-15T08:30:00Z",
    location: "Tesis A - Hat 3",
    assignee: "J. Martinez",
  },
  {
    id: "INC-2024-002",
    title: "Basınç Valfi PSV-104 Sızıntısı",
    description: "Reaktör tankı 2'deki basınç emniyet valfi PSV-104'te yavaş sızıntı tespit edildi.",
    category: "process",
    severity: "critical",
    status: "open",
    reportedAt: "2024-12-14T14:15:00Z",
    location: "Tesis B - Reaktör 2",
  },
  {
    id: "INC-2024-003",
    title: "PLC İletişim Zaman Aşımı",
    description: "Üretim hattı 1'de PLC ve SCADA sistemi arasında aralıklı iletişim kaybı.",
    category: "electrical",
    severity: "medium",
    status: "resolved",
    reportedAt: "2024-12-13T11:00:00Z",
    resolvedAt: "2024-12-14T09:30:00Z",
    location: "Tesis A - Kontrol Odası",
    assignee: "S. Patel",
  },
  {
    id: "INC-2024-004",
    title: "Parti #4412'de Kalite Sapması",
    description: "Parti #4412 için ürün viskozite ölçümleri spesifikasyon limitlerinin dışında.",
    category: "quality",
    severity: "medium",
    status: "investigating",
    reportedAt: "2024-12-12T16:45:00Z",
    location: "Tesis A - KK Laboratuvarı",
    assignee: "L. Chen",
  },
  {
    id: "INC-2024-005",
    title: "Soğutma Kulesi Fanı Titreşimi",
    description: "Soğutma kulesi fan ünitesi CT-02'de anormal titreşim seviyeleri tespit edildi.",
    category: "mechanical",
    severity: "low",
    status: "open",
    reportedAt: "2024-12-11T09:20:00Z",
    location: "Tesis B - Kamu Hizmetleri",
  },
];

// ── Similar Incidents ───────────────────────────────────────────────────
export const mockSimilarIncidents: SimilarIncident[] = [
  {
    incident: {
      id: "INC-2024-089",
      title: "Hat 2'de Motor Rulman Arızası",
      description: "Benzer motor aşırı ısınma modeli, 3 haftalık yüksek sıcaklıkların ardından rulman arızasına yol açtı.",
      category: "mechanical",
      severity: "critical",
      status: "resolved",
      reportedAt: "2024-09-20T10:00:00Z",
      resolvedAt: "2024-09-25T16:00:00Z",
      location: "Tesis A - Hat 2",
      assignee: "M. Thompson",
    },
    similarityScore: 0.92,
    matchedKeywords: ["motor", "aşırı-ısınma", "taşıyıcı", "sıcaklık"],
  },
  {
    incident: {
      id: "INC-2023-156",
      title: "Tahrik Motoru Termal Kapanması",
      description: "Yetersiz havalandırma nedeniyle paketleme hattı motorunda VFD termal koruması tetiklendi.",
      category: "electrical",
      severity: "high",
      status: "resolved",
      reportedAt: "2023-11-05T13:30:00Z",
      resolvedAt: "2023-11-08T11:00:00Z",
      location: "Tesis A - Paketleme",
      assignee: "R. Kim",
    },
    similarityScore: 0.78,
    matchedKeywords: ["motor", "termal", "kapanma", "sıcaklık"],
  },
  {
    incident: {
      id: "INC-2023-201",
      title: "Pompa Motoru Aşırı Yük Atması",
      description: "Pervane kirlenmesi ve artan akım çekimi nedeniyle sirkülasyon pompası motoru aşırı yükten dolayı attı.",
      category: "mechanical",
      severity: "medium",
      status: "resolved",
      reportedAt: "2023-08-14T07:45:00Z",
      resolvedAt: "2023-08-15T14:00:00Z",
      location: "Tesis B - Kamu Hizmetleri",
      assignee: "J. Martinez",
    },
    similarityScore: 0.65,
    matchedKeywords: ["motor", "aşırı-yük", "aşırı-ısınma"],
  },
];

// ── Lessons Learned ─────────────────────────────────────────────────────
export const mockLessonsLearned: LessonLearned[] = [
  {
    id: "LL-001",
    incidentId: "INC-2024-089",
    title: "Kestirimci motor sıcaklık izlemesini uygulayın",
    description: "Sıcaklık eğilimlerinin erken tespiti rulman arızasını önleyebilirdi. Otomatik uyarılarla sürekli izleme kritik önem taşır.",
    actionsTaken: [
      "Tüm kritik motorlara IoT sıcaklık sensörleri takıldı",
      "%80 eşiğinde otomatik uyarılar yapılandırıldı",
      "Haftalık termal görüntüleme denetimleri uygulandı",
    ],
    preventiveMeasures: [
      "Aylık rulman yağlama programı",
      "Üç aylık titreşim analizi programı",
      "Yıllık motor hizalama doğrulaması",
    ],
    createdAt: "2024-09-26T10:00:00Z",
    tags: ["motor", "kestirimci-bakım", "sıcaklık", "IoT"],
  },
  {
    id: "LL-002",
    incidentId: "INC-2023-156",
    title: "VFD tahrikli motorlar için yeterli havalandırma sağlayın",
    description: "Düşük hızlarda VFD çalışması soğutma fanı etkinliğini azaltır. 30Hz'in altında harici zorlanmış havalandırma gereklidir.",
    actionsTaken: [
      "VFD tahrikli motorlara harici soğutma fanları eklendi",
      "Düşük hızlı işlemler için işletme prosedürleri güncellendi",
    ],
    preventiveMeasures: [
      "VFD kurulum kontrol listesine havalandırma değerlendirmesini dahil et",
      "Harici soğutma olmadan minimum hız limitlerini tanımla",
    ],
    createdAt: "2023-11-10T09:00:00Z",
    tags: ["VFD", "havalandırma", "termal-yönetim"],
  },
];

// ── Methodologies ───────────────────────────────────────────────────────
export const mockMethodologies: Methodology[] = [
  {
    id: "meth-001",
    name: "5 Neden Analizi",
    type: "5_whys",
    description: "Bir sorunun altında yatan neden-sonuç ilişkilerini keşfetmek için yinelenen sorgulama tekniği.",
    steps: [
      { id: "s1", order: 1, title: "Problemi Tanımla", description: "İncelenecek problemi açıkça belirtin", isCompleted: false },
      { id: "s2", order: 2, title: "Sor: 1. Neden", description: "Bu problem neden oluştu?", isCompleted: false },
      { id: "s3", order: 3, title: "Sor: 2. Neden", description: "Bu neden niçin oluştu?", isCompleted: false },
      { id: "s4", order: 4, title: "Sor: 3. Neden", description: "Bu neden niçin oluştu?", isCompleted: false },
      { id: "s5", order: 5, title: "Sor: 4. Neden", description: "Bu neden niçin oluştu?", isCompleted: false },
      { id: "s6", order: 6, title: "Sor: 5. Neden", description: "Kök nedeni belirle", isCompleted: false },
    ],
    applicability: ["Basit ila orta dereceli problemler", "Tekli neden zinciri", "Hızlı analiz ihtiyacı"],
    icon: "help-circle",
  },
  {
    id: "meth-002",
    name: "Kılçık (Balıkkılçığı) Diyagramı",
    type: "fishbone",
    description: "Büyük kategorilere (İnsan, Makine, Yöntem, Malzeme, Ölçüm, Çevre) göre düzenlenmiş bir problemin olası tüm nedenlerini belirleyin.",
    steps: [
      { id: "s1", order: 1, title: "Etkiyi Belirt", description: "Problemi balığın kafasına yazın", isCompleted: false },
      { id: "s2", order: 2, title: "Kategorileri Belirle", description: "Ana neden kategori dallarını çizin", isCompleted: false },
      { id: "s3", order: 3, title: "Nedenler Üzerinde Beyin Fırtınası", description: "Her kategori altındaki olası nedenleri listeleyin", isCompleted: false },
      { id: "s4", order: 4, title: "Analiz Et & Önceliklendir", description: "Nedenleri olasılık ve etkiye göre derecelendirin", isCompleted: false },
      { id: "s5", order: 5, title: "Kök Nedeni Doğrula", description: "En önemli nedenleri verilerle doğrulayın", isCompleted: false },
    ],
    applicability: ["Karmaşık problemler", "Birden fazla olası neden", "Takım beyin fırtınası"],
    icon: "git-branch",
  },
  {
    id: "meth-003",
    name: "FMEA (Hata Türleri ve Etkileri Analizi)",
    type: "fmea",
    description: "Olası hataları ve sistem performansı üzerindeki etkilerini değerlendirmek için sistematik yöntem.",
    steps: [
      { id: "s1", order: 1, title: "Bileşenleri Belirle", description: "Tüm sistem bileşenlerini ve işlevlerini listeleyin", isCompleted: false },
      { id: "s2", order: 2, title: "Hata Türlerini Belirle", description: "Her bileşenin nasıl arızalanabileceğini belirleyin", isCompleted: false },
      { id: "s3", order: 3, title: "Etkileri Değerlendir", description: "Her hata türünün etkisini belirleyin", isCompleted: false },
      { id: "s4", order: 4, title: "RÖS Hesapla", description: "Risk Öncelik Sayısı = Şiddet × Olasılık × Keşfedilebilirlik", isCompleted: false },
      { id: "s5", order: 5, title: "Eylem Öner", description: "Düzeltici eylemleri önceliklendirin ve atayın", isCompleted: false },
    ],
    applicability: ["Tasarım incelemesi", "Süreç optimizasyonu", "Risk değerlendirmesi"],
    icon: "shield-alert",
  },
  {
    id: "meth-004",
    name: "8D Raporu",
    type: "8d",
    description: "Tekrarlayan problemleri belirlemek, düzeltmek ve ortadan kaldırmak için sekiz disiplinli problem çözme metodolojisi.",
    steps: [
      { id: "s1", order: 1, title: "D1: Takım Oluştur", description: "Çapraz fonksiyonel bir ekip kurun", isCompleted: false },
      { id: "s2", order: 2, title: "D2: Problemi Tanımla", description: "Problemi verilerle ölçülebilir hale getirin", isCompleted: false },
      { id: "s3", order: 3, title: "D3: Sınırlama", description: "Geçici sınırlama eylemleri uygulayın", isCompleted: false },
      { id: "s4", order: 4, title: "D4: Kök Neden", description: "Kök nedenleri belirleyin ve doğrulayın", isCompleted: false },
      { id: "s5", order: 5, title: "D5: Düzeltici Aksiyonlar", description: "Kalıcı düzeltici eylemleri seçin ve doğrulayın", isCompleted: false },
      { id: "s6", order: 6, title: "D6: Uygula", description: "Düzeltmeleri uygulayın ve onaylayın", isCompleted: false },
      { id: "s7", order: 7, title: "D7: Tekrarı Önle", description: "Tekrarlamayı önlemek için sistemleri değiştirin", isCompleted: false },
      { id: "s8", order: 8, title: "D8: Tebrik Et", description: "Ekibin katkılarını takdir edin", isCompleted: false },
    ],
    applicability: ["Müşteri şikayetleri", "Büyük kalite sorunları", "Sistematik hatalar"],
    icon: "clipboard-list",
  },
];

// ── Timeline Events ─────────────────────────────────────────────────────
export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "evt-001",
    type: "input",
    title: "Problem Gönderildi",
    description: "Üretim hattı 3'teki taşıyıcı bant motoru normal çalışma parametrelerinin ötesinde aşırı ısınıyor.",
    timestamp: "2024-12-15T08:30:00Z",
  },
  {
    id: "evt-002",
    type: "analysis",
    title: "Yapay Zeka Analizi Başladı",
    description: "Bilgi tabanındaki problem bağlamı, geçmiş veriler ve benzer olaylar analiz ediliyor.",
    timestamp: "2024-12-15T08:30:05Z",
  },
  {
    id: "evt-003",
    type: "insight",
    title: "Örüntü Algılandı",
    description: "Son 12 ayda 3 benzer olay bulundu. Konveyör hatlarındaki motor aşırı ısınması, rulman aşınması ve yetersiz yağlama programlarıyla korelasyon gösteriyor.",
    timestamp: "2024-12-15T08:30:12Z",
  },
  {
    id: "evt-004",
    type: "recommendation",
    title: "Metodoloji Önerildi",
    description: "Problem karmaşıklığına bağlı olarak, birincil analiz çerçevesi olarak '5 Neden' metodolojisi, tamamlayıcı olarak ise 'Balıkkılçığı' önerilir.",
    timestamp: "2024-12-15T08:30:15Z",
  },
  {
    id: "evt-005",
    type: "resolution",
    title: "Kök Neden Tespit Edildi",
    description: "Kök neden: Rulman yağlama aralığının maliyet azaltma girişimi sırasında 30 günden 60 güne çıkarılması, hızlandırılmış aşınma ve ısı üretimine yol açtı.",
    timestamp: "2024-12-15T09:15:00Z",
  },
];

export const mockAnalysisResult: AnalysisResult = {
  id: "analysis-001",
  problemId: "INC-2024-001",
  methodology: "5_whys",
  currentStep: 5,
  analysisState: "COMPLETED",
  rootCause: "Uzatılmış bakım aralıkları nedeniyle yetersiz rulman yağlaması",
  confidence: 0.87,
  confidenceScore: 0.87,
  findings: [
    {
      id: "f1",
      title: "Yağlama Programı",
      description: "Yağlama programı 3. çeyrekte değiştirildi",
      severity: "medium",
      evidence: ["Bakım Raporu Q3"],
    },
    {
      id: "f2",
      title: "Sıcaklık Artışı",
      description: "Motor çalışma sıcaklığında son 6 haftadır sürekli artış tespit edildi",
      severity: "high",
      evidence: ["Isı Sensörü Logları"],
    },
    {
      id: "f3",
      title: "Rulman Aşınması",
      description: "Vibrasyon analizi rulman aşınmasını doğruluyor",
      severity: "critical",
      evidence: ["Vibrasyon Testi Sonuçları"],
    },
  ],
  recommendations: [
    "Orijinal 30 günlük yağlama programını derhal geri yükleyin",
    "Tüm hat 3 motorlarında titreşim analizi yapın",
  ],
  correctiveActions: [
    "Orijinal 30 günlük yağlama programını derhal geri yükleyin",
    "Otomatik uyarılara sahip sürekli sıcaklık izleme sistemi kurun",
    "Bir sonraki planlı duruş sırasında rulman değişimini planlayın",
  ],
  optionalActions: [
    {
      id: "act-1",
      type: "schedule_maintenance",
      label: "Bakım Planla",
      description: "Rulman değişimi için acil bakım talebi oluşturun",
    },
    {
      id: "act-2",
      type: "assign_task",
      label: "Görev Ata",
      description: "Titreşim analizi için bakım ekibini yönlendirin",
    },
    {
      id: "act-3",
      type: "draft_email",
      label: "Durum Raporu Hazırla",
      description: "Üretim müdürüne bilgilendirme e-postası taslağı oluşturun",
    },
    {
      id: "act-4",
      type: "check_inventory",
      label: "Stok Kontrolü",
      description: "Depoda uygun yedek rulman olup olmadığını kontrol edin",
    }
  ],
  lessonsLearned: [
    "Kestirimci motor sıcaklık izlemesini uygulayın",
    "Maliyet düşürme hedefleri kritik bakım aralıklarını etkilememelidir",
  ],
  investigationSteps: [
    {
      id: "step-1",
      stepNumber: 1,
      type: "problem_received",
      status: "completed",
      title: "Problem Tanımlandı",
      description: "Bant motoru aşırı ısınma raporu alındı ve bağlam yüklendi.",
      timestamp: "2024-12-15T08:30:00Z",
    },
    {
      id: "step-2",
      stepNumber: 2,
      type: "ai_thinking",
      status: "completed",
      title: "YZ Analizi ve Teşhis",
      description: "Geçmiş bakım logları ve SCADA verileri inceleniyor.",
      timestamp: "2024-12-15T08:30:05Z",
    },
    {
      id: "step-3",
      stepNumber: 3,
      type: "root_cause_analysis",
      status: "completed",
      title: "Kök Neden Analizi: Neden 1 & 2",
      description: "Motor aşırı ısındı -> Sürtünme arttı -> Rulmanlar yetersiz yağlandı.",
      timestamp: "2024-12-15T08:30:15Z",
    },
    {
      id: "step-4",
      stepNumber: 4,
      type: "root_cause_analysis",
      status: "completed",
      title: "Kök Neden Analizi: Neden 3 & 4",
      description: "Neden yetersiz yağlandı? -> Bakım periyodu atlandı -> Prosedür değişti.",
      timestamp: "2024-12-15T08:30:25Z",
    },
    {
      id: "step-5",
      stepNumber: 5,
      type: "completion",
      status: "completed",
      title: "Analiz Tamamlandı",
      description: "Sonuçlar ve operasyonel aksiyonlar oluşturuldu.",
      timestamp: "2024-12-15T08:30:45Z",
    }
  ],
  nextQuestion: "Konveyör sistemindeki diğer motorların da bakım periyotları uzatıldı mı?",
  timeline: mockTimelineEvents,
  createdAt: "2024-12-15T09:30:00Z",
};

// ── Problems ────────────────────────────────────────────────────────────
export const mockProblems: Problem[] = [
  {
    id: "INC-2024-001",
    title: "Taşıyıcı Bant Motorunun Aşırı Isınması",
    description: "Üretim hattı 3 taşıyıcı bant motoru sıcaklığı yoğun kullanım sırasında eşiği 15°C aştı.",
    severity: "high",
    status: "in_progress",
    category: "Mekanik",
    createdAt: "2024-12-15T08:30:00Z",
    updatedAt: "2024-12-15T09:30:00Z",
    tags: ["motor", "aşırı-ısınma", "hat-3", "taşıyıcı"],
  },
  {
    id: "INC-2024-002",
    title: "Basınç Valfi PSV-104 Sızıntısı",
    description: "Reaktör tankı 2'deki basınç emniyet valfi PSV-104'te yavaş sızıntı tespit edildi.",
    severity: "critical",
    status: "analyzing",
    category: "Proses",
    createdAt: "2024-12-14T14:15:00Z",
    updatedAt: "2024-12-14T14:15:00Z",
    tags: ["valf", "basınç", "sızıntı", "reaktör"],
  },
];
