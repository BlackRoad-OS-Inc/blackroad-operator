import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import policyRoutes from '../src/routes/policy.ts';
import metricsRouter, { prometheusMetricsHandler } from '../src/routes/metrics.ts';
import { metricsMiddleware } from '../src/middleware/metrics.ts';
import { resetMetricsForTest } from '../src/metrics/metrics.ts';

async function main(): Promise<void> {
  resetMetricsForTest();
  const app = express();
  app.use(express.json());
  app.use(metricsMiddleware);
  app.use('/api/policy', policyRoutes);
  app.use('/api/metrics', metricsRouter);
  app.get('/metrics', prometheusMetricsHandler);
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('address unavailable');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    const response = await fetch(`${baseUrl}/api/policy/metrics`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(typeof body.version, 'string');
    assert.ok(body.counters);
    assert.ok(body.gauges);
    assert.ok(body.latency);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
