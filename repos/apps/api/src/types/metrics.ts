export interface PolicyResultCounts {
  pass: number;
  warn: number;
  fail: number;
}

export interface PolicyErrorCounts {
  input: number;
  engine: number;
  attest: number;
  unknown: number;
}

export interface AttestBundleCounters {
  ok: number;
  fail: number;
  pqc_on: number;
  pqc_off: number;
  pqc_unavailable: number;
}

export interface PolicyCounters {
  policy_eval_total: PolicyResultCounts;
  policy_eval_error_total: PolicyErrorCounts;
  attest_bundle_total: AttestBundleCounters;
}

export interface PolicyGauges {
  policy_rules_count: number;
  uptime_seconds: number;
}

export interface PolicyLatencyStats {
  policy_eval_p95_ms: number;
  engine_p95_ms: number;
}

export interface PolicyMetricsPayload {
  version: string;
  now: string;
  counters: PolicyCounters;
  gauges: PolicyGauges;
  latency: PolicyLatencyStats;
}
