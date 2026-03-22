import type { PolicyMetricsPayload, PolicyResultCounts } from '../types/metrics.js';

export type PolicyEvalResult = 'pass' | 'warn' | 'fail';
export type PolicyEvalErrorStage = 'input' | 'engine' | 'attest' | 'unknown';
export type AttestStatus = 'ok' | 'fail';
export type PqcMode = 'on' | 'off' | 'unavailable';

interface HistogramBucket {
  readonly le: number;
  count: number;
}

interface HistogramState {
  readonly buckets: HistogramBucket[];
  count: number;
  sum: number;
}

interface HttpMetricKey {
  method: string;
  route: string;
  status: string;
}

interface HttpMetricEntry {
  key: HttpMetricKey;
  histogram: HistogramState;
}

const PROCESS_STARTED_AT = Date.now();
const PROM_ENABLED = (process.env.METRICS_PROMETHEUS_ENABLE ?? 'true').toLowerCase() !== 'false';

const histogramBuckets = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10];

const policyEvalCounter: Record<PolicyEvalResult, number> = { pass: 0, warn: 0, fail: 0 };
const policyEvalErrorCounter: Record<PolicyEvalErrorStage, number> = {
  input: 0,
  engine: 0,
  attest: 0,
  unknown: 0
};
const attestStatusCounter: Record<AttestStatus, number> = { ok: 0, fail: 0 };
const attestPqcCounter: Record<PqcMode, number> = { on: 0, off: 0, unavailable: 0 };
const attestComboCounter = new Map<string, number>();

const policyEvalLatencyHistogram = createHistogram();
const policyEngineLatencyHistogram = createHistogram();
const httpRequestMetrics = new Map<string, HttpMetricEntry>();

let currentPolicyVersion = 'unknown';
let currentRuleCount = 0;

export function setPolicyVersion(version: string, ruleCount: number): void {
  currentPolicyVersion = version || 'unknown';
  currentRuleCount = Math.max(0, Number.isFinite(ruleCount) ? Math.trunc(ruleCount) : 0);
}

export function incrementPolicyEval(result: PolicyEvalResult, durations: {
  totalSeconds: number;
  engineSeconds: number;
}): void {
  policyEvalCounter[result] += 1;
  observeHistogram(policyEvalLatencyHistogram, durations.totalSeconds);
  observeHistogram(policyEngineLatencyHistogram, durations.engineSeconds);
}

export function incrementPolicyEvalErrors(stage: PolicyEvalErrorStage): void {
  policyEvalErrorCounter[stage] += 1;
}

export function incrementAttestBundle(status: AttestStatus, pqc: PqcMode): void {
  attestStatusCounter[status] += 1;
  attestPqcCounter[pqc] += 1;
  const comboKey = `${status}:${pqc}`;
  attestComboCounter.set(comboKey, (attestComboCounter.get(comboKey) ?? 0) + 1);
  if (status === 'fail') {
    incrementPolicyEvalErrors('attest');
  }
}

export function trackHttpRequest(durationSeconds: number, key: HttpMetricKey): void {
  const mapKey = `${key.method}::${key.route}::${key.status}`;
  const entry = httpRequestMetrics.get(mapKey) ?? {
    key,
    histogram: createHistogram()
  };
  observeHistogram(entry.histogram, durationSeconds);
  httpRequestMetrics.set(mapKey, entry);
}

export function collectPolicyMetrics(): PolicyMetricsPayload {
  const now = new Date();
  const uptimeSeconds = (Date.now() - PROCESS_STARTED_AT) / 1000;
  const counters = {
    policy_eval_total: { ...policyEvalCounter },
    policy_eval_error_total: { ...policyEvalErrorCounter },
    attest_bundle_total: {
      ok: attestStatusCounter.ok,
      fail: attestStatusCounter.fail,
      pqc_on: attestPqcCounter.on,
      pqc_off: attestPqcCounter.off,
      pqc_unavailable: attestPqcCounter.unavailable
    }
  };
  const gauges = {
    policy_rules_count: currentRuleCount,
    uptime_seconds: Math.max(0, Math.round(uptimeSeconds))
  };
  const latency = {
    policy_eval_p95_ms: Math.round(histogramP95(policyEvalLatencyHistogram) * 1000),
    engine_p95_ms: Math.round(histogramP95(policyEngineLatencyHistogram) * 1000)
  };
  return {
    version: currentPolicyVersion,
    now: now.toISOString(),
    counters,
    gauges,
    latency
  };
}

export function renderPrometheusMetrics(): string {
  if (!PROM_ENABLED) {
    return '# metrics disabled\n';
  }
  const lines: string[] = [];
  lines.push('# HELP policy_eval_total Policy evaluations by result');
  lines.push('# TYPE policy_eval_total counter');
  for (const result of Object.keys(policyEvalCounter) as PolicyEvalResult[]) {
    lines.push(`policy_eval_total{result="${result}"} ${policyEvalCounter[result]}`);
  }
  lines.push('# HELP policy_eval_error_total Policy evaluation errors by stage');
  lines.push('# TYPE policy_eval_error_total counter');
  for (const stage of Object.keys(policyEvalErrorCounter) as PolicyEvalErrorStage[]) {
    lines.push(`policy_eval_error_total{stage="${stage}"} ${policyEvalErrorCounter[stage]}`);
  }
  lines.push('# HELP attest_bundle_total Attestation bundle outcomes');
  lines.push('# TYPE attest_bundle_total counter');
  for (const status of Object.keys(attestStatusCounter) as AttestStatus[]) {
    for (const pqc of Object.keys(attestPqcCounter) as PqcMode[]) {
      const value = attestComboCounter.get(`${status}:${pqc}`) ?? 0;
      lines.push(`attest_bundle_total{status="${status}",pqc="${pqc}"} ${value}`);
    }
  }
  lines.push('# HELP policy_eval_latency_seconds Policy evaluation end-to-end latency');
  lines.push('# TYPE policy_eval_latency_seconds histogram');
  pushHistogram(lines, 'policy_eval_latency_seconds', policyEvalLatencyHistogram);
  lines.push('# HELP policy_engine_latency_seconds Policy engine latency');
  lines.push('# TYPE policy_engine_latency_seconds histogram');
  pushHistogram(lines, 'policy_engine_latency_seconds', policyEngineLatencyHistogram);
  lines.push('# HELP policy_version_info Policy bundle version info');
  lines.push('# TYPE policy_version_info gauge');
  lines.push(`policy_version_info{version="${currentPolicyVersion}"} 1`);
  lines.push('# HELP policy_rules_count Number of policy rules loaded');
  lines.push('# TYPE policy_rules_count gauge');
  lines.push(`policy_rules_count ${currentRuleCount}`);
  lines.push('# HELP uptime_seconds Process uptime in seconds');
  lines.push('# TYPE uptime_seconds gauge');
  lines.push(`uptime_seconds ${(Date.now() - PROCESS_STARTED_AT) / 1000}`);
  lines.push('# HELP http_request_duration_seconds HTTP request durations by route');
  lines.push('# TYPE http_request_duration_seconds histogram');
  for (const entry of httpRequestMetrics.values()) {
    pushHistogram(lines, 'http_request_duration_seconds', entry.histogram, entry.key);
  }
  return `${lines.join('\n')}\n`;
}

export function isPrometheusEnabled(): boolean {
  return PROM_ENABLED;
}

export function resetMetricsForTest(): void {
  for (const key of Object.keys(policyEvalCounter) as PolicyEvalResult[]) {
    policyEvalCounter[key] = 0;
  }
  for (const key of Object.keys(policyEvalErrorCounter) as PolicyEvalErrorStage[]) {
    policyEvalErrorCounter[key] = 0;
  }
  for (const key of Object.keys(attestStatusCounter) as AttestStatus[]) {
    attestStatusCounter[key] = 0;
  }
  for (const key of Object.keys(attestPqcCounter) as PqcMode[]) {
    attestPqcCounter[key] = 0;
  }
  attestComboCounter.clear();
  resetHistogram(policyEvalLatencyHistogram);
  resetHistogram(policyEngineLatencyHistogram);
  httpRequestMetrics.clear();
  currentRuleCount = 0;
  currentPolicyVersion = 'unknown';
}

function createHistogram(): HistogramState {
  return {
    buckets: histogramBuckets.map((le) => ({ le, count: 0 })),
    count: 0,
    sum: 0
  };
}

function observeHistogram(hist: HistogramState, valueSeconds: number): void {
  const value = Math.max(0, valueSeconds);
  hist.count += 1;
  hist.sum += value;
  for (const bucket of hist.buckets) {
    if (value <= bucket.le) {
      bucket.count += 1;
    }
  }
}

function histogramP95(hist: HistogramState): number {
  if (hist.count === 0) {
    return 0;
  }
  const target = hist.count * 0.95;
  for (const bucket of hist.buckets) {
    if (bucket.count >= target) {
      return bucket.le;
    }
  }
  return hist.buckets[hist.buckets.length - 1]?.le ?? 0;
}

function pushHistogram(lines: string[], name: string, hist: HistogramState, key?: HttpMetricKey): void {
  for (const bucket of hist.buckets) {
    if (key) {
      lines.push(`${name}{method="${key.method}",route="${key.route}",status="${key.status}",le="${formatLe(bucket.le)}"} ${bucket.count}`);
    } else {
      lines.push(`${name}{le="${formatLe(bucket.le)}"} ${bucket.count}`);
    }
  }
  const total = hist.count;
  if (key) {
    lines.push(`${name}{method="${key.method}",route="${key.route}",status="${key.status}",le="+Inf"} ${total}`);
    lines.push(`${name}_sum{method="${key.method}",route="${key.route}",status="${key.status}"} ${hist.sum}`);
    lines.push(`${name}_count{method="${key.method}",route="${key.route}",status="${key.status}"} ${total}`);
  } else {
    lines.push(`${name}{le="+Inf"} ${total}`);
    lines.push(`${name}_sum ${hist.sum}`);
    lines.push(`${name}_count ${total}`);
  }
}

function formatLe(value: number): string {
  return Number.isFinite(value) ? value.toString() : '+Inf';
}

function resetHistogram(hist: HistogramState): void {
  hist.count = 0;
  hist.sum = 0;
  for (const bucket of hist.buckets) {
    bucket.count = 0;
  }
}

export function summarizeResults(results: readonly ('pass' | 'warn' | 'fail')[]): PolicyResultCounts {
  const summary: PolicyResultCounts = { pass: 0, warn: 0, fail: 0 };
  for (const result of results) {
    summary[result] += 1;
  }
  return summary;
}
