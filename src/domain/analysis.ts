import type { Ecomap } from "./model";

/** Future extension point. 0.1 deliberately has no active AI or remote provider. */
export interface AnalysisProvider {
  readonly id: string;
  analyze(document: Ecomap): Promise<AnalysisResult>;
}

export interface AnalysisResult {
  summary: string;
  findings: Array<{ code: string; label: string; detail: string; confidence?: number }>;
}
