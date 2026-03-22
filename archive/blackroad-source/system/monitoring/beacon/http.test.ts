import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'supertest';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import axios from 'axios';
import { createApp } from '../src/app';
import { clearServicesCache } from '../src/lib/servicesRegistry';

vi.mock('axios');
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

describe('HTTP routes', () => {
  let configPath: string;
  let logPath: string;

  beforeEach(() => {
    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'beacon-http-config-'));
    configPath = path.join(configDir, 'services.yaml');
    const yamlContent = `services:\n  - id: svc-http\n    name: Service HTTP\n    env: prod\n    health_url: http://svc-http/health\n    region: us-central\n`;
    fs.writeFileSync(configPath, yamlContent);
    process.env.BEACON_SERVICES_CONFIG_PATH = configPath;
    clearServicesCache();

    const logDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-http-'));
    logPath = path.join(logDir, 'deploy-log.jsonl');
    process.env.DEPLOY_LOG_PATH = logPath;
  });

  it('responds to /health', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('blackroad-os-beacon');
  });

  it('returns beacon data', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({ data: { ok: true, version: '9.9.9' } });
    const app = createApp();
    const res = await request(app).get('/beacon');
    expect(res.status).toBe(200);
    expect(res.body.services[0].status).toBe('healthy');
  });

  it('accepts deploy POST and returns in query', async () => {
    const app = createApp();
    const payload = {
      service: 'svc-http',
      env: 'prod',
      git_sha: 'sha',
      actor: 'tester',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      outcome: 'success',
      links: ['https://example.com/pr/1'],
    };

    const postRes = await request(app).post('/deploys').send(payload);
    expect(postRes.status).toBe(200);

    const getRes = await request(app).get('/deploys').query({ service: 'svc-http', limit: 1 });
    expect(getRes.status).toBe(200);
    expect(getRes.body.deploys).toHaveLength(1);
    expect(getRes.body.deploys[0].service).toBe('svc-http');
  });
});
