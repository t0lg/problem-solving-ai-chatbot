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
  "Abnormal operating parameters detected in the described system component.",
  "Historical data shows gradual degradation pattern over the past operational cycle.",
  "Environmental and operational conditions are contributing to accelerated failure mode.",
  "Sensor data correlation reveals a progressive decline in system performance metrics.",
  "Pattern analysis indicates a systemic issue rather than isolated component failure.",
];

const failureChainTemplates = [
  (problem: string) =>
    `Initial trigger: ${problem} → Cascading effect on adjacent subsystems → Progressive performance degradation → Critical threshold breach.`,
  (problem: string) =>
    `Root event: ${problem} → Undetected wear accumulation → Safety margin erosion → Operational parameter exceedance → System alert trigger.`,
  (problem: string) =>
    `Origin: ${problem} → Maintenance gap exploitation → Accelerated component stress → Thermal/mechanical limit exceeded → Failure manifestation.`,
];

const rootCauseTemplates = [
  "Insufficient preventive maintenance schedule combined with increased operational load created conditions for accelerated component degradation.",
  "Process parameter drift due to calibration gap allowed the system to operate outside optimal range, leading to cumulative stress damage.",
  "Maintenance interval extension during cost optimization initiative reduced the safety margin below the threshold for reliable operation.",
  "Environmental condition changes were not reflected in the operating procedures, causing the system to experience unaccounted thermal stress.",
  "Component material specification was inadequate for the current operating conditions, resulting in premature wear and failure.",
];

const actionTemplates = [
  "Implement immediate containment actions to prevent further damage",
  "Restore original maintenance schedule for affected components",
  "Install continuous monitoring with automated threshold alerts",
  "Conduct root cause verification through physical inspection",
  "Update operating procedures to reflect corrective measures",
  "Schedule component replacement during next planned shutdown",
  "Perform reliability analysis on similar equipment across the facility",
  "Establish a cross-functional review team for preventive action tracking",
  "Add failure mode to FMEA documentation for future reference",
  "Implement predictive analytics for early detection of similar patterns",
];

// ── Step Generators ─────────────────────────────────────────────────────

function generateStepDefinitions(problem: Problem): Omit<InvestigationStep, "status" | "timestamp" | "durationMs">[] {
  const failureChainFn = pickRandom(failureChainTemplates);

  return [
    {
      id: "step-1",
      stepNumber: 1,
      type: "problem_received",
      title: "Problem Received",
      description: `Registered: "${problem.title}" — initializing investigation context and loading knowledge base.`,
      detail: problem.description,
    },
    {
      id: "step-2",
      stepNumber: 2,
      type: "ai_thinking",
      title: "AI Analysis Engine Processing",
      description: "Analyzing problem context, cross-referencing historical data, and evaluating failure patterns across the knowledge base.",
      detail: pickRandom(symptomTemplates),
    },
    {
      id: "step-3",
      stepNumber: 3,
      type: "methodology_selection",
      title: "Methodology Selected",
      description: "Based on problem complexity and category, an optimal analysis framework has been selected.",
    },
    {
      id: "step-4",
      stepNumber: 4,
      type: "root_cause_analysis",
      title: "Root Cause Identified",
      description: "Structured reasoning complete. Failure chain and root cause determined with supporting evidence.",
      detail: failureChainFn(problem.title),
    },
    {
      id: "step-5",
      stepNumber: 5,
      type: "action_proposal",
      title: "Corrective Actions Proposed",
      description: "Generated prioritized corrective and preventive action plan based on root cause analysis.",
    },
    {
      id: "step-6",
      stepNumber: 6,
      type: "similar_incidents",
      title: "Similar Incidents Found",
      description: "Cross-referenced problem signature against historical incident database for pattern matching.",
    },
    {
      id: "step-7",
      stepNumber: 7,
      type: "lessons_learned",
      title: "Lessons Learned Extracted",
      description: "Synthesized actionable insights from past resolutions of similar problems.",
    },
    {
      id: "step-8",
      stepNumber: 8,
      type: "completion",
      title: "Investigation Complete",
      description: "All analysis steps completed successfully. Results are ready for review.",
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
      title: "Primary Failure Mode Identified",
      description: `Analysis of "${problem.title}" reveals a systematic pattern consistent with degraded maintenance effectiveness.`,
      severity: problem.severity === "critical" ? "critical" : "high",
      evidence: [
        "Historical maintenance records (last 6 months)",
        "SCADA system telemetry data",
        `Incident correlation: ${randomBetween(2, 5)} similar events in database`,
      ],
    },
    {
      id: "f2",
      title: "Contributing Factor Analysis",
      description: "Secondary factors including operational load changes and environmental conditions have compounded the primary failure mode.",
      severity: "medium",
      evidence: [
        "Operational log analysis",
        "Environmental monitoring data",
        "Shift report cross-reference",
      ],
    },
  ];

  return {
    id: `analysis-${Date.now()}`,
    problemId: problem.id,
    rootCause,
    confidence,
    findings,
    recommendations,
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
          step.description = `Selected "${selected.methodology.name}" based on problem category and complexity analysis.`;
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
          step.detail = "Corrective actions have been integrated into the analysis report.";
          break;
        }

        case "similar_incidents": {
          const incidents = generateSimilarIncidents();
          step.description = `Found ${incidents.length} similar incidents with similarity scores ranging from ${Math.round(Math.min(...incidents.map((i) => i.similarityScore)) * 100)}% to ${Math.round(Math.max(...incidents.map((i) => i.similarityScore)) * 100)}%.`;
          callbacks.onSimilarIncidents(incidents);
          break;
        }

        case "lessons_learned": {
          const lessons = generateLessonsLearned();
          step.description = `Extracted ${lessons.length} actionable lessons from historical incident resolutions.`;
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
