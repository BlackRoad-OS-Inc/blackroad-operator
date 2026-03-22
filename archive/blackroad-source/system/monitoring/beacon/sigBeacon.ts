import axios from 'axios';
import { ServiceConfig, getServices } from './servicesRegistry';

export type BeaconStatus = 'healthy' | 'unhealthy';

export interface BeaconMeta {
  region: string;
  agent_id: string;
  ps_sha_infinity: string;
  [key: string]: unknown;
}

export interface Beacon {
  service: string;
  version: string;
  env: string;
  status: BeaconStatus;
  url: string;
  last_checked_at: string;
  meta: BeaconMeta;
}

const defaultAgentId = 'blackroad-os-beacon';

async function performHealthCheck(service: ServiceConfig): Promise<{ ok: boolean; version?: string; meta?: Record<string, unknown> }>
{
  try {
    const response = await axios.get(service.health_url, { timeout: 5000 });
    return response.data;
  } catch (error) {
    return { ok: false, meta: { error: error instanceof Error ? error.message : 'unknown error' } };
  }
}

export async function collectServiceBeacon(service: ServiceConfig): Promise<Beacon> {
  const startedAt = new Date().toISOString();
  const result = await performHealthCheck(service);

  const status: BeaconStatus = result.ok ? 'healthy' : 'unhealthy';
  const meta = {
    region: service.region,
    agent_id: defaultAgentId,
    ps_sha_infinity: `pssha∞:br:${defaultAgentId}:` + (result.meta && typeof result.meta['ps_sha_infinity'] === 'string'
      ? (result.meta['ps_sha_infinity'] as string).split(':').pop()
      : service.id),
    ...(result.meta || {}),
  } as BeaconMeta;

  if (!result.ok && !meta.error) {
    meta.error = 'Health check returned unhealthy state';
  }

  return {
    service: service.id,
    version: (result as { version?: string }).version || 'unknown',
    env: service.env,
    status,
    url: service.health_url,
    last_checked_at: startedAt,
    meta,
  };
}

export async function collectAllBeacons(concurrency = 5): Promise<Beacon[]> {
  const services = getServices();
  const results: Beacon[] = [];

  for (let i = 0; i < services.length; i += concurrency) {
    const batch = services.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((service) => collectServiceBeacon(service)));
    results.push(...batchResults);
  }

  return results;
}
