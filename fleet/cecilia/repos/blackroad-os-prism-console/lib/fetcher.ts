import type { DeploySummary, Env, HealthResponse, VersionResponse } from '@/types';
import { API_BASE_URL } from './constants';

const mockEnvs: Env[] = [
  {
    id: 'env-dev',
    name: 'Development',
    region: 'iad',
    status: 'healthy',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'env-stg',
    name: 'Staging',
    region: 'cdg',
    status: 'warning',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'env-prd',
    name: 'Production',
    region: 'sfo',
    status: 'degraded',
    updatedAt: new Date().toISOString()
  }
];

const mockDeploys: DeploySummary[] = [
  {
    envId: 'env-dev',
    lastDeploy: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    artifact: 'console:0.0.1'
  },
  {
    envId: 'env-stg',
    lastDeploy: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    artifact: 'console:0.0.1-rc1'
  }
];

export async function fetchEnvironments(): Promise<Env[]> {
  if (!API_BASE_URL) {
    return mockEnvs;
  }

  // TODO(prism-next): swap mock fallback for BlackRoad OS API Gateway call
  return fetch(`${API_BASE_URL}/envs`, { cache: 'no-store' })
    .then((res) => res.json())
    .catch(() => mockEnvs);
}

export async function fetchEnvironmentById(id: string): Promise<Env | undefined> {
  const envs = await fetchEnvironments();
  return envs.find((env) => env.id === id);
}

export async function fetchDeploySummary(envId: string): Promise<DeploySummary | undefined> {
  if (!API_BASE_URL) {
    return mockDeploys.find((deploy) => deploy.envId === envId);
  }

  // TODO(prism-next): wire to deployment stream via $CORE_HUB
  return fetch(`${API_BASE_URL}/deploys/${envId}`)
    .then((res) => res.json())
    .catch(() => mockDeploys.find((deploy) => deploy.envId === envId));
}

export async function fetchHealth(): Promise<HealthResponse> {
  // TODO(prism-next): pin to ops health endpoint once live
  return { status: 'ok', uptime: Math.round(process.uptime()) };
}

export async function fetchVersion(): Promise<VersionResponse> {
  // TODO(prism-next): source commit hash from build metadata
  return { version: '0.0.1', commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev-local' };
}
