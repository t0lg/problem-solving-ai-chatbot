import api from "./api";
import type { Problem, AnalysisResult } from "@/types/problem";
import type { SimilarIncident, LessonLearned } from "@/types/incident";

/**
 * Analysis service — currently returns mock data.
 * Replace with real API calls when backend is ready.
 */
export const analysisService = {
  /**
   * Submit a problem for AI analysis
   */
  async submitProblem(problem: Omit<Problem, "id" | "createdAt" | "updatedAt">): Promise<Problem> {
    // Future: return api.post("/problems", problem).then(r => r.data);
    void api; // suppress unused import warning
    return {
      ...problem,
      id: `INC-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Problem;
  },

  /**
   * Get analysis result for a problem
   */
  async getAnalysis(problemId: string): Promise<AnalysisResult | null> {
    // Future: return api.get(`/problems/${problemId}/analysis`).then(r => r.data);
    console.log(`[Mock] Fetching analysis for ${problemId}`);
    return null;
  },

  /**
   * Find similar historical incidents
   */
  async findSimilarIncidents(problemId: string): Promise<SimilarIncident[]> {
    // Future: return api.get(`/problems/${problemId}/similar`).then(r => r.data);
    console.log(`[Mock] Finding similar incidents for ${problemId}`);
    return [];
  },

  /**
   * Get lessons learned related to a problem
   */
  async getLessonsLearned(problemId: string): Promise<LessonLearned[]> {
    // Future: return api.get(`/problems/${problemId}/lessons`).then(r => r.data);
    console.log(`[Mock] Fetching lessons for ${problemId}`);
    return [];
  },
};
