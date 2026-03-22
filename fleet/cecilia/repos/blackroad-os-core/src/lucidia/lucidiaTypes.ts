import type { PsShaInfinity } from "../identity/identityTypes";

export type LucidiaSchemaVersion = "v0.1.0";

export interface SigIdentity {
  psShaInf: PsShaInfinity;
  label?: string;
  worldline?: string;
}

export type LucidiaIdentityKind = "agent" | "human" | "system";

export interface LucidiaIdentityRef {
  type: LucidiaIdentityKind;
  id: string;
  psShaInf?: PsShaInfinity;
}

export interface LucidiaRetryPolicy {
  maxAttempts?: number;
  backoffStrategy?: "none" | "linear" | "exponential";
  baseDelayMs?: number;
}

export interface LucidiaContext {
  environment?: "dev" | "stage" | "prod" | string;
  timeoutMs?: number;
  maxConcurrency?: number;
  retryPolicy?: LucidiaRetryPolicy;
  metadata?: Record<string, unknown>;
}

export interface LucidiaProgram {
  id: string;
  name?: string;
  description?: string;
  version?: string;
  createdAt?: string;
  createdBy?: LucidiaIdentityRef;
  context?: LucidiaContext;
  graph: LucidiaGraph;
  ui?: LucidiaUiHints;
  sigIdentity?: SigIdentity;
  schemaVersion?: LucidiaSchemaVersion;
}

export interface LucidiaGraph {
  nodes: LucidiaNode[];
  edges: LucidiaEdge[];
}

export type LucidiaNodeType =
  | "agent_call"
  | "http"
  | "transform"
  | "branch"
  | "parallel"
  | "sleep"
  | "custom";

export interface LucidiaNode {
  id: string;
  type: LucidiaNodeType;
  name?: string;
  description?: string;
  agent?: LucidiaAgentRef;
  operation?: LucidiaOperation;
  params?: Record<string, unknown>;
  inputs?: LucidiaIORef[];
  outputs?: LucidiaIORef[];
  ui?: LucidiaNodeUiHints;
  metadata?: Record<string, unknown>;
}

export interface LucidiaAgentRef {
  id: string;
  capabilities?: string[];
  psShaInf?: PsShaInfinity;
}

export type LucidiaOperationKind = "http" | "transform" | "custom";

export interface LucidiaOperation {
  kind: LucidiaOperationKind;
  spec: Record<string, unknown>;
}

export interface LucidiaIORef {
  key: string;
  fromNode?: string;
  fromOutput?: string;
  constant?: unknown;
}

export interface LucidiaCondition {
  expression: string;
}

export interface LucidiaEdge {
  id: string;
  from: string;
  to: string;
  condition?: LucidiaCondition;
}

export type LucidiaLayout = "linear" | "grid" | "radial" | "timeline";

export interface LucidiaUiHints {
  layout?: LucidiaLayout;
  focusNodeIds?: string[];
}

export interface LucidiaNodeUiHints {
  lane?: string;
  importance?: "low" | "normal" | "high";
  showLogsInline?: boolean;
}

export type LucidiaRunStatus = "pending" | "running" | "succeeded" | "failed" | "cancelled";

export interface LucidiaRun {
  runId: string;
  programId: string;
  status: LucidiaRunStatus;
  startedAt?: string;
  finishedAt?: string;
  rootNodeId?: string;
  metadata?: Record<string, unknown>;
  nodes: LucidiaNodeRun[];
  sigIdentity?: SigIdentity;
}

export type LucidiaNodeRunStatus = "pending" | "running" | "succeeded" | "failed" | "skipped";

export interface LucidiaNodeRun {
  nodeId: string;
  status: LucidiaNodeRunStatus;
  startedAt?: string;
  finishedAt?: string;
  logs?: LucidiaLogEntry[];
  outputSnapshot?: Record<string, unknown>;
  error?: LucidiaErrorInfo;
  childrenRunIds?: string[];
}

export type LucidiaLogLevel = "debug" | "info" | "warn" | "error";

export interface LucidiaLogEntry {
  timestamp: string;
  level: LucidiaLogLevel;
  message: string;
  data?: unknown;
}

export interface LucidiaErrorInfo {
  message: string;
  code?: string;
  details?: unknown;
}
