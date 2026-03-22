import type { DomainEvent } from "../events/domainEvent";
import type { PsShaInfinity } from "../identity/identityTypes";
import type { Result } from "../results/result";

export interface AgentMetadata {
  id: PsShaInfinity;
  name: string;
  role: string;
  version?: string;
  tags?: string[];
}

export type AgentStatus = "idle" | "running" | "error" | "offline";

export interface AgentState {
  status: AgentStatus;
  lastHeartbeat: string;
  lastError?: string;
}

export interface AgentContext {
  emitEvent: (event: DomainEvent) => void;
  now: () => string;
}

export interface Agent<I = unknown, O = unknown> {
  id: PsShaInfinity;
  metadata: AgentMetadata;
  getState(): AgentState;
  run(input: I, context: AgentContext): Promise<Result<O, Error>>;
}
