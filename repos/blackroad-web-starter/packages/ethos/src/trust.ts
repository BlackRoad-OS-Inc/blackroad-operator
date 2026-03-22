export interface TelemetrySample {
  agentId: string;
  policyChecks: number;
  policyPasses: number;
  attestationRequired: number;
  attestationProvided: number;
  actionHistogram: Record<string, number>;
  timestamp: string;
}

export interface TrustBreakdown {
  C: number;
  Tr: number;
  S: number;
}

function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return numerator / denominator;
}

function shannonEntropy(histogram: Record<string, number>): number {
  const counts = Object.values(histogram);
  const total = counts.reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return 0;
  }
  const entropy = counts.reduce((sum, value) => {
    const probability = value / total;
    return probability > 0 ? sum - probability * Math.log2(probability) : sum;
  }, 0);
  const maxEntropy = Math.log2(counts.length || 1);
  if (maxEntropy === 0) {
    return 0;
  }
  return entropy / maxEntropy;
}

export function complianceRate(samples: TelemetrySample[]): number {
  const totals = samples.reduce(
    (acc, sample) => {
      acc.checks += sample.policyChecks;
      acc.passes += sample.policyPasses;
      return acc;
    },
    { checks: 0, passes: 0 },
  );
  return safeDivide(totals.passes, totals.checks);
}

export function attestationCoverage(samples: TelemetrySample[]): number {
  const totals = samples.reduce(
    (acc, sample) => {
      acc.required += sample.attestationRequired;
      acc.provided += sample.attestationProvided;
      return acc;
    },
    { required: 0, provided: 0 },
  );
  return safeDivide(totals.provided, totals.required);
}

export function actionEntropy(samples: TelemetrySample[]): number {
  if (samples.length === 0) {
    return 0;
  }
  const aggregated: Record<string, number> = {};
  for (const sample of samples) {
    for (const [action, count] of Object.entries(sample.actionHistogram)) {
      aggregated[action] = (aggregated[action] ?? 0) + count;
    }
  }
  return shannonEntropy(aggregated);
}

export function summarizeTelemetry(samples: TelemetrySample[]): TrustBreakdown {
  return {
    C: complianceRate(samples),
    Tr: attestationCoverage(samples),
    S: actionEntropy(samples),
  };
}
