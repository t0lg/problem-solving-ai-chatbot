export type MethodologyType = "5_whys" | "fishbone" | "fmea" | "8d" | "pareto" | "rca";

export interface Methodology {
  id: string;
  name: string;
  type: MethodologyType;
  description: string;
  steps: MethodologyStep[];
  applicability: string[];
  icon: string;
}

export interface MethodologyStep {
  id: string;
  order: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface SelectedMethodology {
  methodology: Methodology;
  currentStep: number;
  progress: number;
  startedAt: string;
}
