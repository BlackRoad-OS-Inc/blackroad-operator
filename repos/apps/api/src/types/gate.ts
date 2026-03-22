export type GateEnvironment = 'preview' | 'staging' | 'production';

export interface PolicySummary {
  pass: boolean;
  rules: number;
  violations: number;
  warnings: number;
}

export interface TestsSummary {
  unit: string;
  ui: string;
  opa: string;
}

export interface MetricsSummary {
  contract: string;
  observability: string;
}

export interface ApprovalsSummary {
  required: string[];
  granted: string[];
  pending: string[];
}

export interface GateStatus {
  commit: string;
  env: GateEnvironment;
  policy: PolicySummary;
  tests: TestsSummary;
  metrics: MetricsSummary;
  approvals: ApprovalsSummary;
  ready: boolean;
  reasons: string[];
}

export interface GateStatusInput {
  commit: string;
  env: GateEnvironment;
}

export type GateCheckState = 'success' | 'failure' | 'neutral';

export interface GateCheckInput {
  commit: string;
  name: string;
  status: GateCheckState;
  summary?: string;
}

export interface GateCheckResult {
  ok: boolean;
  action: 'created' | 'updated' | 'skipped';
  checkRunId?: number;
  message?: string;
}
