import type { PsShaInfinity } from "../identity/identityTypes";

export type TruthValue = "true" | "false" | "unknown" | "contradictory";

export interface AgentAssessment {
  id: PsShaInfinity;
  jobId: PsShaInfinity;
  agentId: PsShaInfinity;
  createdAt: string;
  verdict: TruthValue;
  confidence: number;
  reasoning?: string;
  metadata?: Record<string, unknown>;
}

export interface TruthState {
  id: PsShaInfinity;
  snapshotId: PsShaInfinity;
  jobId: PsShaInfinity;
  aggregatedVerdict: TruthValue;
  aggregatedConfidence: number;
  minorityReports?: AgentAssessment[];
  ledgerTxId?: string;
  updatedAt: string;
}
