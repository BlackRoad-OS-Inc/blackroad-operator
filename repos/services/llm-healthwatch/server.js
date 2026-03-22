import express from 'express';
import promClient from 'prom-client';

const PORT = process.env.PORT || 8080;
const WINDOW_MS = Number(process.env.WINDOW_MS ?? 5 * 60 * 1000);
const P95_SLO_MS = Number(process.env.P95_SLO_MS ?? 1200);
const ERROR_RATE_SLO = Number(process.env.ERROR_RATE_SLO ?? 0.02);
const ERROR_RATE_AMBER = Number(process.env.ERROR_RATE_AMBER ?? 0.05);
const MIN_SAMPLE_COUNT = Number(process.env.MIN_SAMPLE_COUNT ?? 20);

const app = express();
app.use(express.json({ limit: '256kb' }));

const metricsRegistry = new promClient.Registry();
const requestCounter = new promClient.Counter({
  name: 'prism_llm_canary_requests_total',
  help: 'Total canary requests ingested by provider',
  labelNames: ['provider', 'status'],
});
const latencyHistogram = new promClient.Histogram({
  name: 'prism_llm_canary_latency_ms',
  help: 'Latency histogram for canary calls (milliseconds)',
  labelNames: ['provider'],
  buckets: [100, 250, 500, 750, 1000, 1250, 1500, 2000, 5000],
});
metricsRegistry.registerMetric(requestCounter);
metricsRegistry.registerMetric(latencyHistogram);
promClient.collectDefaultMetrics({ register: metricsRegistry });

let samples = [];

function pruneSamples(now = Date.now()) {
  samples = samples.filter((sample) => sample.ts >= now - WINDOW_MS);
}

function percentile(sortedNumbers, ratio) {
  if (!sortedNumbers.length) return 0;
  const index = Math.max(Math.ceil(sortedNumbers.length * ratio) - 1, 0);
  return sortedNumbers[index];
}

function classifyWindow(now = Date.now()) {
  pruneSamples(now);
  if (samples.length < MIN_SAMPLE_COUNT) {
    return { state: 'amber', reason: 'insufficient_data', sampleCount: samples.length };
  }
  const latencies = samples.map((sample) => sample.latency_ms).sort((a, b) => a - b);
  const p95 = percentile(latencies, 0.95);
  const errors = samples.filter((sample) => !sample.ok).length;
  const errRate = errors / samples.length;
  const timedOut = samples.filter((sample) => sample.timed_out).length / samples.length;

  if (errRate > ERROR_RATE_AMBER || p95 > P95_SLO_MS * 1.5) {
    return { state: 'red', p95, errRate, timeoutRate: timedOut, sampleCount: samples.length };
  }
  if (errRate > ERROR_RATE_SLO || p95 > P95_SLO_MS) {
    return { state: 'amber', p95, errRate, timeoutRate: timedOut, sampleCount: samples.length };
  }
  return { state: 'green', p95, errRate, timeoutRate: timedOut, sampleCount: samples.length };
}

app.post('/samples', (req, res) => {
  const { samples: payload } = req.body ?? {};
  if (!Array.isArray(payload)) {
    return res.status(400).json({ error: 'invalid_payload' });
  }
  const now = Date.now();
  const normalized = payload
    .map((sample) => ({
      ts: typeof sample.ts === 'number' ? sample.ts * 1000 : now,
      provider: String(sample.provider ?? 'unknown'),
      ok: Boolean(sample.ok),
      latency_ms: Number(sample.latency_ms ?? 0),
      timed_out: Boolean(sample.timed_out),
      status_code: Number(sample.status_code ?? 0),
    }))
    .filter((sample) => Number.isFinite(sample.latency_ms));
  normalized.forEach((sample) => {
    requestCounter.inc({ provider: sample.provider, status: sample.ok ? 'ok' : 'error' });
    latencyHistogram.observe({ provider: sample.provider }, sample.latency_ms);
  });
  samples.push(...normalized.map((sample) => ({ ...sample, ts: sample.ts || now })));
  pruneSamples(now);
  return res.json({ accepted: normalized.length, windowSize: samples.length });
});

app.get('/healthz', (_req, res) => {
  const classification = classifyWindow();
  const statusCode = classification.state === 'red' ? 503 : 200;
  res.status(statusCode).json({
    state: classification.state,
    metrics: {
      p95_ms: classification.p95 ?? null,
      error_rate: classification.errRate ?? null,
      timeout_rate: classification.timeoutRate ?? null,
      sample_count: classification.sampleCount,
      window_ms: WINDOW_MS,
    },
    reason: classification.reason ?? null,
    ts: new Date().toISOString(),
  });
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', metricsRegistry.contentType);
  res.send(await metricsRegistry.metrics());
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[llm-healthwatch] listening on :${PORT}`);
});
