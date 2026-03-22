import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import { clearServicesCache } from '../src/lib/servicesRegistry';

vi.mock('axios');

const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
};

function createTempConfig(services: unknown): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'beacon-config-'));
  const filePath = path.join(dir, 'services.yaml');
  fs.writeFileSync(filePath, services as string | NodeJS.ArrayBufferView);
  return filePath;
}

describe('sigBeacon', () => {
  let configPath: string;

  beforeEach(() => {
    const yamlContent = `services:\n  - id: svc-a\n    name: Service A\n    env: prod\n    health_url: http://svc-a/health\n    region: us-central\n  - id: svc-b\n    name: Service B\n    env: staging\n    health_url: http://svc-b/health\n    region: us-east\n`;
    configPath = createTempConfig(yamlContent);
    process.env.BEACON_SERVICES_CONFIG_PATH = configPath;
    clearServicesCache();
  });

  afterEach(() => {
    clearServicesCache();
    if (configPath && fs.existsSync(configPath)) {
      fs.rmSync(path.dirname(configPath), { recursive: true, force: true });
    }
  });

  it('collectServiceBeacon maps healthy response', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: { ok: true, version: '1.2.3', meta: { extra: 'info' } },
    });
    const { collectServiceBeacon } = await import('../src/lib/sigBeacon');
    const beacon = await collectServiceBeacon({
      id: 'svc-a',
      name: 'Service A',
      env: 'prod',
      health_url: 'http://svc-a/health',
      region: 'us-central',
    });

    expect(beacon.status).toBe('healthy');
    expect(beacon.version).toBe('1.2.3');
    expect(beacon.meta.region).toBe('us-central');
    expect(beacon.meta.extra).toBe('info');
  });

  it('collectAllBeacons returns all services and marks unhealthy on failure', async () => {
    mockedAxios.get = vi
      .fn()
      .mockResolvedValueOnce({ data: { ok: true, version: '2.0.0' } })
      .mockRejectedValueOnce(new Error('timeout'));

    const { collectAllBeacons } = await import('../src/lib/sigBeacon');
    const beacons = await collectAllBeacons(2);

    expect(beacons).toHaveLength(2);
    const healthy = beacons.find((b) => b.service === 'svc-a');
    const unhealthy = beacons.find((b) => b.service === 'svc-b');

    expect(healthy?.status).toBe('healthy');
    expect(unhealthy?.status).toBe('unhealthy');
    expect(unhealthy?.meta.error).toBeDefined();
  });
});
