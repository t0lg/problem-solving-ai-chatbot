export type ProblemSeverity = "low" | "medium" | "high" | "critical";
export type ProblemStatus = "draft" | "analyzing" | "in_progress" | "resolved" | "closed";
export type TimelineEventType = "input" | "analysis" | "insight" | "recommendation" | "resolution";

export type InvestigationStepStatus = "pending" | "active" | "completed";

export type InvestigationStepType =
  | "problem_received"
  | "ai_thinking"
  | "methodology_selection"
  | "root_cause_analysis"
  | "action_proposal"
  | "similar_incidents"
  | "lessons_learned"
  | "completion";

export interface InvestigationStep {
  id: string;
  stepNumber: number;
  type: InvestigationStepType;
  status: InvestigationStepStatus;
  title: string;
  description: string;
  detail?: string;
  timestamp?: string;
  durationMs?: number;
}

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

export interface AIAction {
  id: string;
  type:
    | "assign_task"
    | "draft_email"
    | "check_inventory"
    | "escalate_incident"
    | "schedule_maintenance";
  label: string;
  description: string;
}

export interface AnalysisResult {
  id: string;
  problemId: string;
  methodology: string;
  currentStep: number;
  analysisState: "IDLE" | "ANALYZING" | "WAITING_USER" | "COMPLETED";
  rootCause?: string;
  confidence: number;
  confidenceScore?: number;
  findings: Finding[];
  recommendations: string[];
  correctiveActions: string[];
  optionalActions: AIAction[];
  lessonsLearned: string[];
  investigationSteps: InvestigationStep[];
  nextQuestion?: string;
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
