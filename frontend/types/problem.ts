export type ProblemSeverity = "low" | "medium" | "high" | "critical";
export type ProblemStatus = "draft" | "analyzing" | "in_progress" | "resolved" | "closed";
export type TimelineEventType = "input" | "analysis" | "insight" | "recommendation" | "resolution";

export interface Problem {
  id: string;
  title: string;
  description: string;
  severity: ProblemSeverity;
  status: ProblemStatus;
  category: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AnalysisResult {
  id: string;
  problemId: string;
  rootCause: string;
  confidence: number;
  findings: Finding[];
  recommendations: string[];
  timeline: TimelineEvent[];
  createdAt: string;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: ProblemSeverity;
  evidence: string[];
}
