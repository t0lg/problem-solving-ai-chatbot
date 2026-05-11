/**
 * AI Analysis Service — Simulated Pipeline
 *
 * This service simulates an AI-driven investigation flow.
 * All data flows through here — components NEVER access mock-data directly.
 *
 * When backend is ready, replace the internal implementations
 * while keeping the same public API signatures.
 */

import type { Problem, AnalysisResult, InvestigationStep, Finding } from "@/types/problem";
import type { Methodology, SelectedMethodology } from "@/types/methodology";
import type { SimilarIncident, LessonLearned } from "@/types/incident";
import {
  mockMethodologies,
  mockSimilarIncidents,
  mockLessonsLearned,
} from "@/lib/mock-data";

// ── Utilities ───────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── AI Response Generators ──────────────────────────────────────────────

const symptomTemplates = [
  "Tanımlanan sistem bileşeninde anormal çalışma parametreleri tespit edildi.",
  "Geçmiş veriler, son çalışma döngüsü boyunca kademeli bir bozulma paterni gösteriyor.",
  "Çevresel ve operasyonel koşullar, hızlandırılmış arıza moduna katkıda bulunuyor.",
  "Sensör verisi korelasyonu, sistem performans metriklerinde aşamalı bir düşüş ortaya koyuyor.",
  "Patern analizi, izole bir bileşen arızası yerine sistemsel bir soruna işaret ediyor.",
];

const failureChainTemplates = [
  (problem: string) =>
    `İlk tetikleyici: ${problem} → Bitişik alt sistemler üzerinde kademeli etki → Aşamalı performans düşüşü → Kritik eşik ihlali.`,
  (problem: string) =>
    `Kök olay: ${problem} → Tespit edilemeyen aşınma birikimi → Güvenlik marjı aşınması → Operasyonel parametre aşımı → Sistem uyarısı tetiklemesi.`,
  (problem: string) =>
    `Başlangıç: ${problem} → Bakım boşluğunun oluşması → Hızlandırılmış bileşen stresi → Termal/mekanik limit aşımı → Arızanın ortaya çıkması.`,
];

const rootCauseTemplates = [
  "Yetersiz önleyici bakım programı ile artan operasyonel yükün birleşmesi, hızlandırılmış bileşen bozulması için uygun koşullar yarattı.",
  "Kalibrasyon eksikliği nedeniyle proses parametrelerindeki kayma, sistemin optimum aralık dışında çalışmasına izin vererek kümülatif stres hasarına yol açtı.",
  "Maliyet optimizasyonu girişimi sırasında bakım aralıklarının uzatılması, güvenlik marjını güvenilir çalışma eşiğinin altına düşürdü.",
  "Çevresel koşul değişikliklerinin işletim prosedürlerine yansıtılmaması, sistemin hesaba katılmayan termal strese maruz kalmasına neden oldu.",
  "Bileşen malzeme spesifikasyonu mevcut çalışma koşulları için yetersiz kaldı ve erken aşınma ile arızaya neden oldu.",
];

const actionTemplates = [
  "Daha fazla hasarı önlemek için derhal kontrol altına alma eylemlerini uygulayın",
  "Etkilenen bileşenler için orijinal bakım programını geri yükleyin",
  "Otomatik eşik uyarıları ile sürekli izleme sistemi kurun",
  "Fiziksel inceleme yoluyla kök neden doğrulaması yapın",
  "Düzeltici önlemleri yansıtacak şekilde işletim prosedürlerini güncelleyin",
  "Bir sonraki planlı duruş sırasında bileşen değişimini planlayın",
  "Tesisteki benzer ekipmanlarda güvenilirlik analizi gerçekleştirin",
  "Önleyici eylem takibi için işlevler arası bir inceleme ekibi oluşturun",
  "Gelecekte referans olması için arıza modunu FMEA belgelerine ekleyin",
  "Benzer paternlerin erken tespiti için öngörücü analitik uygulayın",
];

// ── Step Generators ─────────────────────────────────────────────────────

function generateStepDefinitions(problem: Problem): Omit<InvestigationStep, "status" | "timestamp" | "durationMs">[] {
  const failureChainFn = pickRandom(failureChainTemplates);

  return [
    {
      id: "step-1",
      stepNumber: 1,
      type: "problem_received",
      title: "Problem Alındı",
      description: `Kaydedildi: "${problem.title}" — inceleme bağlamı başlatılıyor ve bilgi tabanı yükleniyor.`,
      detail: problem.description,
    },
    {
      id: "step-2",
      stepNumber: 2,
      type: "ai_thinking",
      title: "Yapay Zeka Analiz Motoru İşliyor",
      description: "Problem bağlamı analiz ediliyor, geçmiş verilerle karşılaştırılıyor ve bilgi tabanındaki arıza paternleri değerlendiriliyor.",
      detail: pickRandom(symptomTemplates),
    },
    {
      id: "step-3",
      stepNumber: 3,
      type: "methodology_selection",
      title: "Metodoloji Seçildi",
      description: "Problemin karmaşıklığına ve kategorisine göre optimal bir analiz çerçevesi seçildi.",
    },
    {
      id: "step-4",
      stepNumber: 4,
      type: "root_cause_analysis",
      title: "Kök Neden Tespit Edildi",
      description: "Yapılandırılmış akıl yürütme tamamlandı. Arıza zinciri ve kök neden destekleyici kanıtlarla birlikte belirlendi.",
      detail: failureChainFn(problem.title),
    },
    {
      id: "step-5",
      stepNumber: 5,
      type: "action_proposal",
      title: "Düzeltici Aksiyonlar Önerildi",
      description: "Kök neden analizine dayanarak önceliklendirilmiş düzeltici ve önleyici eylem planı oluşturuldu.",
    },
    {
      id: "step-6",
      stepNumber: 6,
      type: "similar_incidents",
      title: "Benzer Olaylar Bulundu",
      description: "Problem imzası, patern eşleştirme için geçmiş olay veritabanı ile çapraz referanslandı.",
    },
    {
      id: "step-7",
      stepNumber: 7,
      type: "lessons_learned",
      title: "Alınan Dersler Çıkarıldı",
      description: "Geçmişteki benzer problemlerin çözümlerinden eyleme geçirilebilir içgörüler sentezlendi.",
    },
    {
      id: "step-8",
      stepNumber: 8,
      type: "completion",
      title: "İnceleme Tamamlandı",
      description: "Tüm analiz adımları başarıyla tamamlandı. Sonuçlar incelemeye hazır.",
    },
  ];
}

function selectMethodology(problem: Problem): SelectedMethodology {
  // Rule-based selection with slight randomization
  const keywords = `${problem.title} ${problem.description}`.toLowerCase();

  let methodology: Methodology;

  if (keywords.includes("quality") || keywords.includes("batch") || keywords.includes("specification")) {
    methodology = mockMethodologies.find((m) => m.type === "fmea") || mockMethodologies[0];
  } else if (keywords.includes("recurring") || keywords.includes("systemic") || keywords.includes("multiple")) {
    methodology = mockMethodologies.find((m) => m.type === "8d") || mockMethodologies[0];
  } else if (keywords.includes("complex") || keywords.includes("multiple causes") || keywords.includes("categories")) {
    methodology = mockMethodologies.find((m) => m.type === "fishbone") || mockMethodologies[1];
  } else {
    // Default: 5 Whys or random between 5 Whys and Fishbone
    const candidates = mockMethodologies.filter((m) => m.type === "5_whys" || m.type === "fishbone");
    methodology = pickRandom(candidates);
  }

  return {
    methodology,
    currentStep: 0,
    progress: 0,
    startedAt: new Date().toISOString(),
  };
}

function generateAnalysisResult(problem: Problem, methodology: Methodology): AnalysisResult {
  const rootCause = pickRandom(rootCauseTemplates);
  const confidence = randomBetween(78, 95) / 100;

  // Pick 3-5 random actions
  const shuffledActions = [...actionTemplates].sort(() => Math.random() - 0.5);
  const recommendations = shuffledActions.slice(0, randomBetween(3, 5));

  const findings: Finding[] = [
    {
      id: "f1",
      title: "Birincil Arıza Modu Tanımlandı",
      description: `"${problem.title}" analizi, düşmüş bakım etkinliği ile tutarlı sistematik bir patern ortaya koyuyor.`,
      severity: problem.severity === "critical" ? "critical" : "high",
      evidence: [
        "Geçmiş bakım kayıtları (son 6 ay)",
        "SCADA sistemi telemetri verileri",
        `Olay korelasyonu: Veritabanında ${randomBetween(2, 5)} benzer olay`,
      ],
    },
    {
      id: "f2",
      title: "Katkıda Bulunan Faktör Analizi",
      description: "Operasyonel yük değişiklikleri ve çevresel koşullar gibi ikincil faktörler, birincil arıza modunu daha da karmaşıklaştırdı.",
      severity: "medium",
      evidence: [
        "Operasyonel günlük analizi",
        "Çevresel izleme verileri",
        "Vardiya raporu çapraz referansı",
      ],
    },
  ];

  return {
    id: `analysis-${Date.now()}`,
    problemId: problem.id,
    methodology: methodology.type,
    currentStep: methodology.steps.length,
    analysisState: "COMPLETED",
    rootCause,
    confidence,
    confidenceScore: confidence,
    findings,
    recommendations,
    correctiveActions: recommendations,
    optionalActions: [
      {
        id: "act-1",
        type: "schedule_maintenance",
        label: "Bakım Planla",
        description: "Tespit edilen sorun için acil bakım talebi oluşturun",
      },
      {
        id: "act-2",
        type: "assign_task",
        label: "Görev Ata",
        description: "İlgili ekibe onarım için görev yönlendirin",
      },
      {
        id: "act-3",
        type: "draft_email",
        label: "Durum Raporu Hazırla",
        description: "Yöneticiye detaylı bilgilendirme e-postası taslağı oluşturun",
      }
    ],
    lessonsLearned: [],
    investigationSteps: [],
    nextQuestion: "Önerilen düzeltici aksiyonları uygulamaya başlamak ister misiniz?",
    timeline: [], // Timeline is managed separately via steps
    createdAt: new Date().toISOString(),
  };
}

function generateSimilarIncidents(): SimilarIncident[] {
  // Randomize similarity scores for realistic feel
  return mockSimilarIncidents.map((si) => ({
    ...si,
    similarityScore: randomBetween(65, 98) / 100,
  }));
}

function generateLessonsLearned(): LessonLearned[] {
  return mockLessonsLearned.map((ll) => ({ ...ll }));
}

// ── Public API ──────────────────────────────────────────────────────────

export type StepCallback = (step: InvestigationStep) => void;
export type ProgressCallback = (progress: number) => void;
export type MethodologyCallback = (selected: SelectedMethodology) => void;
export type ResultCallback = (result: AnalysisResult) => void;
export type SimilarIncidentsCallback = (incidents: SimilarIncident[]) => void;
export type LessonsCallback = (lessons: LessonLearned[]) => void;

export interface AnalysisPipelineCallbacks {
  onStepUpdate: StepCallback;
  onProgress: ProgressCallback;
  onMethodologySelected: MethodologyCallback;
  onAnalysisResult: ResultCallback;
  onSimilarIncidents: SimilarIncidentsCallback;
  onLessonsLearned: LessonsCallback;
  onComplete: () => void;
}

/**
 * Main entry point: runs the full simulated AI investigation pipeline.
 * Returns an abort function to cancel the pipeline.
 */
export function runInvestigationPipeline(
  problem: Problem,
  callbacks: AnalysisPipelineCallbacks
): () => void {
  let aborted = false;

  const run = async () => {
    const stepDefs = generateStepDefinitions(problem);
    const totalSteps = stepDefs.length;

    // Initialize all steps as pending
    const steps: InvestigationStep[] = stepDefs.map((def) => ({
      ...def,
      status: "pending" as const,
      timestamp: undefined,
      durationMs: undefined,
    }));

    // Emit all pending steps
    for (const step of steps) {
      if (aborted) return;
      callbacks.onStepUpdate({ ...step });
    }

    // Process each step sequentially
    for (let i = 0; i < totalSteps; i++) {
      if (aborted) return;

      const step = steps[i];
      const stepDelay = getStepDelay(step.type);

      // Mark step as active
      step.status = "active";
      step.timestamp = new Date().toISOString();
      callbacks.onStepUpdate({ ...step });
      callbacks.onProgress(Math.round(((i + 0.5) / totalSteps) * 100));

      // Simulate processing time
      await delay(stepDelay);
      if (aborted) return;

      // Process step-specific side effects
      switch (step.type) {
        case "methodology_selection": {
          const selected = selectMethodology(problem);
          step.description = `Problem kategorisi ve karmaşıklık analizine dayanarak "${selected.methodology.name}" seçildi.`;
          step.detail = selected.methodology.description;
          callbacks.onMethodologySelected(selected);
          break;
        }

        case "root_cause_analysis": {
          const result = generateAnalysisResult(problem, selectMethodology(problem).methodology);
          callbacks.onAnalysisResult(result);
          break;
        }

        case "action_proposal": {
          // Actions are already part of the analysis result
          step.detail = "Düzeltici aksiyonlar analiz raporuna entegre edildi.";
          break;
        }

        case "similar_incidents": {
          const incidents = generateSimilarIncidents();
          step.description = `%${Math.round(Math.min(...incidents.map((i) => i.similarityScore)) * 100)} ile %${Math.round(Math.max(...incidents.map((i) => i.similarityScore)) * 100)} arasında değişen benzerlik skorlarına sahip ${incidents.length} benzer olay bulundu.`;
          callbacks.onSimilarIncidents(incidents);
          break;
        }

        case "lessons_learned": {
          const lessons = generateLessonsLearned();
          step.description = `Geçmiş olay çözümlerinden ${lessons.length} adet eyleme geçirilebilir ders çıkarıldı.`;
          callbacks.onLessonsLearned(lessons);
          break;
        }
      }

      // Mark step as completed
      step.status = "completed";
      step.durationMs = stepDelay;
      callbacks.onStepUpdate({ ...step });
      callbacks.onProgress(Math.round(((i + 1) / totalSteps) * 100));
    }

    if (!aborted) {
      callbacks.onComplete();
    }
  };

  run();

  // Return abort function
  return () => {
    aborted = true;
  };
}

function getStepDelay(type: string): number {
  switch (type) {
    case "problem_received":
      return randomBetween(600, 900);
    case "ai_thinking":
      return randomBetween(2000, 3000);
    case "methodology_selection":
      return randomBetween(1200, 1800);
    case "root_cause_analysis":
      return randomBetween(2500, 3500);
    case "action_proposal":
      return randomBetween(1500, 2000);
    case "similar_incidents":
      return randomBetween(1000, 1500);
    case "lessons_learned":
      return randomBetween(800, 1200);
    case "completion":
      return randomBetween(400, 600);
    default:
      return 1000;
  }
}
