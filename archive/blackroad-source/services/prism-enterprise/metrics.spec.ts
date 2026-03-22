import assert from 'node:assert/strict';
import http from 'node:http';
import { afterEach, beforeEach, test } from 'node:test';
import express from 'express';
import policyRoutes from '../src/routes/policy.ts';
import attestRoutes from '../src/routes/attest.ts';
import metricsRouter, { prometheusMetricsHandler } from '../src/routes/metrics.ts';
import { metricsMiddleware } from '../src/middleware/metrics.ts';
import { resetMetricsForTest } from '../src/metrics/metrics.ts';
import { notifyPolicyEvaluation } from '../src/services/slack.ts';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(metricsMiddleware);
  app.use('/api/policy', policyRoutes);
  app.use('/api/attest', attestRoutes);
  app.use('/api/metrics', metricsRouter);
  app.get('/metrics', prometheusMetricsHandler);
  return app;
}

async function withServer(fn: (baseUrl: string) => Promise<void>): Promise<void> {
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('server did not start');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

beforeEach(() => {
  resetMetricsForTest();
});

afterEach(() => {
  delete (process as any).env.SLACK_WEBHOOK_URL;
});

test('GET /api/policy/metrics returns metric snapshot', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/policy/metrics`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.ok(body.counters);
    assert.ok(body.gauges);
    assert.ok(body.latency);
  });
});

test('policy evaluation increments Prometheus metrics', async () => {
  await withServer(async (baseUrl) => {
    const evalRes = await fetch(`${baseUrl}/api/policy/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId: 'case-1', rules: [{ outcome: 'pass' }] })
    });
    assert.equal(evalRes.status, 200);
    const metricsResponse = await fetch(`${baseUrl}/metrics`);
    assert.equal(metricsResponse.status, 200);
    const metricsText = await metricsResponse.text();
    assert.ok(metricsText.includes('policy_eval_total{result="pass"} 1'));
    assert.ok(metricsText.includes('policy_eval_latency_seconds'));
  });
});

test('Slack webhook formats payload and retries on failure', async () => {
  process.env.SLACK_WEBHOOK_URL = 'https://example.com/webhook';
  let attempts = 0;
  const payloads: any[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
    attempts += 1;
    if (init?.body) {
      payloads.push(JSON.parse(String(init.body)));
    }
    if (attempts === 1) {
      return new Response('', { status: 502 });
    }
    return new Response('', { status: 200 });
  }) as typeof globalThis.fetch;

  try {
    const ok = await notifyPolicyEvaluation({
      caseId: '1234',
      result: 'warn',
      counts: { pass: 1, warn: 2, fail: 0 },
      ruleCount: 3,
      pqc: 'on'
    });
    assert.equal(ok, true);
    assert.equal(attempts, 2);
    assert.match(payloads[0].text, /PolicyCheck warn/);
    assert.match(payloads[0].text, /pass=1 warn=2 fail=0/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
