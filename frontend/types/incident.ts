export type IncidentCategory =
  | "mechanical"
  | "electrical"
  | "process"
  | "quality"
  | "safety"
  | "environmental";

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "closed";
  reportedAt: string;
  resolvedAt?: string;
  location: string;
  assignee?: string;
}

export interface SimilarIncident {
  incident: Incident;
  similarityScore: number;
  matchedKeywords: string[];
}

export interface LessonLearned {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  actionsTaken: string[];
  preventiveMeasures: string[];
  createdAt: string;
  tags: string[];
}
