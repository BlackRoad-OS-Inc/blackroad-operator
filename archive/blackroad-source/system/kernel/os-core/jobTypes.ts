import type { PsShaInfinity } from "../identity/identityTypes";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface Job<Input = unknown, Output = unknown> {
  id: PsShaInfinity;
  type: string;
  agentId: PsShaInfinity;
  input: Input;
  status: JobStatus;
  output?: Output;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
