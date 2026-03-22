import request from 'supertest';

import { createApp } from '../src/server';
import type { AppConfig } from '../src/config';

const baseConfig: AppConfig = {
  APP_NAME: 'svc-template-node',
  ENVIRONMENT: 'test',
  PORT: 0,
  LOG_LEVEL: 'info',
  BUILD_SHA: 'test-sha',
  OTLP_ENDPOINT: undefined,
  METRICS_AUTH_TOKEN: undefined,
  READINESS_DEPENDENCIES: [],
};

describe('health endpoints', () => {
  it('returns build sha on /health', async () => {
    const app = createApp(baseConfig);
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.build_sha).toBe('test-sha');
  });

  it('exposes prometheus metrics', async () => {
    const app = createApp(baseConfig);
    const response = await request(app).get('/metrics');
    expect(response.status).toBe(200);
    expect(response.text).toContain('http_request_duration_seconds');
  });
});
