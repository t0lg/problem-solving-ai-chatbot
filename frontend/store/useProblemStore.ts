import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { Problem, AnalysisResult } from "@/types/problem";
import type { Methodology, SelectedMethodology } from "@/types/methodology";
import type { SimilarIncident, LessonLearned } from "@/types/incident";
import {
  mockProblems,
  mockAnalysisResult,
  mockMethodologies,
  mockSimilarIncidents,
  mockLessonsLearned,
} from "@/lib/mock-data";

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

  // UI State
  isAnalyzing: boolean;
  isSidebarOpen: boolean;
  isInsightsPanelOpen: boolean;

  // Actions
  setCurrentProblem: (problem: Problem | null) => void;
  submitProblem: (title: string, description: string) => void;
  selectMethodology: (methodology: Methodology) => void;
  clearMethodology: () => void;
  startAnalysis: () => void;
  resetAnalysis: () => void;
  toggleSidebar: () => void;
  toggleInsightsPanel: () => void;
  loadMockData: () => void;
}

// ── Store ───────────────────────────────────────────────────────────────
export const useProblemStore = create<ProblemState>()(
  devtools(
    (set) => ({
      // Initial State
      currentProblem: null,
      problems: mockProblems,
      selectedMethodology: null,
      availableMethodologies: mockMethodologies,
      analysisResult: null,
      similarIncidents: [],
      lessonsLearned: [],
      isAnalyzing: false,
      isSidebarOpen: true,
      isInsightsPanelOpen: true,

      // Actions
      setCurrentProblem: (problem) =>
        set({ currentProblem: problem }, false, "setCurrentProblem"),

      submitProblem: (title, description) => {
        const newProblem: Problem = {
          id: `INC-${Date.now()}`,
          title,
          description,
          severity: "medium",
          status: "draft",
          category: "General",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
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
        set({ isAnalyzing: true }, false, "startAnalysis");

        // Simulate analysis with mock data after delay
        setTimeout(() => {
          set(
            {
              isAnalyzing: false,
              analysisResult: mockAnalysisResult,
              similarIncidents: mockSimilarIncidents,
              lessonsLearned: mockLessonsLearned,
            },
            false,
            "analysisComplete"
          );
        }, 2500);
      },

      resetAnalysis: () =>
        set(
          {
            currentProblem: null,
            analysisResult: null,
            selectedMethodology: null,
            similarIncidents: [],
            lessonsLearned: [],
            isAnalyzing: false,
          },
          false,
          "resetAnalysis"
        ),

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

      loadMockData: () =>
        set(
          {
            similarIncidents: mockSimilarIncidents,
            lessonsLearned: mockLessonsLearned,
            analysisResult: mockAnalysisResult,
          },
          false,
          "loadMockData"
        ),
    }),
    { name: "problem-store" }
  )
);
