import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { Problem, AnalysisResult, InvestigationStep } from "@/types/problem";
import type { Methodology, SelectedMethodology } from "@/types/methodology";
import type { SimilarIncident, LessonLearned } from "@/types/incident";
import { mockProblems, mockMethodologies } from "@/lib/mock-data";
import { runInvestigationPipeline } from "@/services/analysis.service";

// ── State ───────────────────────────────────────────────────────────────
interface ProblemState {
  // Data
  currentProblem: Problem | null;
  problems: Problem[];
  selectedMethodology: SelectedMethodology | null;
  availableMethodologies: Methodology[];
  analysisResult: AnalysisResult | null;
  similarIncidents: SimilarIncident[];
  lessonsLearned: LessonLearned[];

  // Investigation pipeline
  timelineSteps: InvestigationStep[];
  analysisProgress: number;
  isAnalyzing: boolean;
  isComplete: boolean;

  // UI State
  isSidebarOpen: boolean;
  isInsightsPanelOpen: boolean;

  // Internal — abort controller for running pipeline
  _abortPipeline: (() => void) | null;

  // Actions
  setCurrentProblem: (problem: Problem | null) => void;
  submitProblem: (title: string, description: string) => void;
  selectMethodology: (methodology: Methodology) => void;
  clearMethodology: () => void;
  startAnalysis: () => void;
  updateStep: (step: InvestigationStep) => void;
  updateProgress: (progress: number) => void;
  setMethodology: (selected: SelectedMethodology) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setSimilarIncidents: (incidents: SimilarIncident[]) => void;
  setLessonsLearned: (lessons: LessonLearned[]) => void;
  completeAnalysis: () => void;
  resetInvestigation: () => void;
  toggleSidebar: () => void;
  toggleInsightsPanel: () => void;
}

// ── Store ───────────────────────────────────────────────────────────────
export const useProblemStore = create<ProblemState>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentProblem: null,
      problems: mockProblems,
      selectedMethodology: null,
      availableMethodologies: mockMethodologies,
      analysisResult: null,
      similarIncidents: [],
      lessonsLearned: [],
      timelineSteps: [],
      analysisProgress: 0,
      isAnalyzing: false,
      isComplete: false,
      isSidebarOpen: true,
      isInsightsPanelOpen: true,
      _abortPipeline: null,

      // ── Actions ─────────────────────────────────────────────────────

      setCurrentProblem: (problem) =>
        set({ currentProblem: problem }, false, "setCurrentProblem"),

      submitProblem: (title, description) => {
        // Categorize based on keywords
        const keywords = `${title} ${description}`.toLowerCase();
        let category = "General";
        let severity: Problem["severity"] = "medium";

        if (keywords.includes("motor") || keywords.includes("bearing") || keywords.includes("conveyor") || keywords.includes("pump") || keywords.includes("vibration")) {
          category = "Mechanical";
        } else if (keywords.includes("plc") || keywords.includes("electrical") || keywords.includes("power") || keywords.includes("circuit")) {
          category = "Electrical";
        } else if (keywords.includes("valve") || keywords.includes("pressure") || keywords.includes("flow") || keywords.includes("reactor")) {
          category = "Process";
        } else if (keywords.includes("quality") || keywords.includes("batch") || keywords.includes("specification") || keywords.includes("deviation")) {
          category = "Quality";
        }

        if (keywords.includes("critical") || keywords.includes("shutdown") || keywords.includes("emergency") || keywords.includes("explosion")) {
          severity = "critical";
        } else if (keywords.includes("overheating") || keywords.includes("failure") || keywords.includes("leak") || keywords.includes("damage")) {
          severity = "high";
        } else if (keywords.includes("vibration") || keywords.includes("deviation") || keywords.includes("anomaly")) {
          severity = "medium";
        }

        const newProblem: Problem = {
          id: `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
          title,
          description,
          severity,
          status: "draft",
          category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: title.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
        };

        set(
          (state) => ({
            currentProblem: newProblem,
            problems: [newProblem, ...state.problems],
          }),
          false,
          "submitProblem"
        );
      },

      selectMethodology: (methodology) =>
        set(
          {
            selectedMethodology: {
              methodology,
              currentStep: 0,
              progress: 0,
              startedAt: new Date().toISOString(),
            },
          },
          false,
          "selectMethodology"
        ),

      clearMethodology: () =>
        set({ selectedMethodology: null }, false, "clearMethodology"),

      startAnalysis: () => {
        const { currentProblem, _abortPipeline } = get();
        if (!currentProblem) return;

        // Abort any running pipeline
        if (_abortPipeline) _abortPipeline();

        // Reset investigation state
        set(
          {
            isAnalyzing: true,
            isComplete: false,
            analysisProgress: 0,
            timelineSteps: [],
            analysisResult: null,
            selectedMethodology: null,
            similarIncidents: [],
            lessonsLearned: [],
          },
          false,
          "startAnalysis"
        );

        // Update problem status
        set(
          (state) => ({
            currentProblem: state.currentProblem
              ? { ...state.currentProblem, status: "analyzing" as const }
              : null,
          }),
          false,
          "updateProblemStatus"
        );

        // Launch the AI pipeline
        const abort = runInvestigationPipeline(currentProblem, {
          onStepUpdate: (step) => get().updateStep(step),
          onProgress: (progress) => get().updateProgress(progress),
          onMethodologySelected: (selected) => get().setMethodology(selected),
          onAnalysisResult: (result) => get().setAnalysisResult(result),
          onSimilarIncidents: (incidents) => get().setSimilarIncidents(incidents),
          onLessonsLearned: (lessons) => get().setLessonsLearned(lessons),
          onComplete: () => get().completeAnalysis(),
        });

        set({ _abortPipeline: abort }, false, "setPipelineAbort");
      },

      updateStep: (step) =>
        set(
          (state) => {
            const existing = state.timelineSteps.findIndex((s) => s.id === step.id);
            if (existing >= 0) {
              const updated = [...state.timelineSteps];
              updated[existing] = step;
              return { timelineSteps: updated };
            }
            return { timelineSteps: [...state.timelineSteps, step] };
          },
          false,
          `updateStep:${step.type}:${step.status}`
        ),

      updateProgress: (progress) =>
        set({ analysisProgress: progress }, false, "updateProgress"),

      setMethodology: (selected) =>
        set({ selectedMethodology: selected }, false, "setMethodology"),

      setAnalysisResult: (result) =>
        set({ analysisResult: result }, false, "setAnalysisResult"),

      setSimilarIncidents: (incidents) =>
        set({ similarIncidents: incidents }, false, "setSimilarIncidents"),

      setLessonsLearned: (lessons) =>
        set({ lessonsLearned: lessons }, false, "setLessonsLearned"),

      completeAnalysis: () =>
        set(
          (state) => ({
            isAnalyzing: false,
            isComplete: true,
            analysisProgress: 100,
            _abortPipeline: null,
            currentProblem: state.currentProblem
              ? { ...state.currentProblem, status: "in_progress" as const, updatedAt: new Date().toISOString() }
              : null,
          }),
          false,
          "completeAnalysis"
        ),

      resetInvestigation: () => {
        const { _abortPipeline } = get();
        if (_abortPipeline) _abortPipeline();

        set(
          {
            currentProblem: null,
            analysisResult: null,
            selectedMethodology: null,
            similarIncidents: [],
            lessonsLearned: [],
            timelineSteps: [],
            analysisProgress: 0,
            isAnalyzing: false,
            isComplete: false,
            _abortPipeline: null,
          },
          false,
          "resetInvestigation"
        );
      },

      toggleSidebar: () =>
        set(
          (state) => ({ isSidebarOpen: !state.isSidebarOpen }),
          false,
          "toggleSidebar"
        ),

      toggleInsightsPanel: () =>
        set(
          (state) => ({ isInsightsPanelOpen: !state.isInsightsPanelOpen }),
          false,
          "toggleInsightsPanel"
        ),
    }),
    { name: "problem-store" }
  )
);
