import { AuditEvent } from '../../domain';
import { DeployAdapter, PlanStep, DeployResult } from '../types';

export const flyAdapter: DeployAdapter = {
  name: 'fly',
  async plan({ service, release }) {
    const steps: PlanStep[] = [
      { description: `Generate fly.toml for ${service.id}` },
      { description: `Release ${release.sha} via fly deploy` }
    ];
    return steps;
  },
  async apply(plan, opts) {
    if (opts?.dryRun) {
      return { ok: true } satisfies DeployResult;
    }
    plan.forEach((step) => opts?.onEvent?.(emit(step)));
    return { ok: true } satisfies DeployResult;
  },
  async status(query: { serviceId: string; envId: string }) {
    const appName = mapServiceToFlyApp(query.serviceId, query.envId);

    try {
      // Check if Fly API token is configured
      const flyApiToken = process.env.FLY_API_TOKEN;
      if (!flyApiToken) {
        console.warn('FLY_API_TOKEN not configured, falling back to idle state');
        return { state: 'idle' as const, details: 'Fly API token not configured' };
      }

      // Fetch app status from Fly.io API
      const appStatus = await fetchFlyAppStatus(appName, flyApiToken);

      // Map Fly status to DeployStatus
      return {
        state: mapFlyStatus(appStatus.status),
        details: `App: ${appStatus.name}, Instances: ${appStatus.deployed?.instances || 0}, Version: ${appStatus.deployed?.version || 'unknown'}`
      };
    } catch (error) {
      console.error(`Failed to fetch Fly.io status for ${appName}:`, error);
      return {
        state: 'failed' as const,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

function emit(step: PlanStep): AuditEvent {
  return {
    ts: new Date().toISOString(),
    actor: 'fly-adapter',
    action: 'fly.plan',
    subjectType: 'AdapterStep',
    subjectId: step.description,
    metadata: step.metadata ?? {}
  };
}

/**
 * Map BlackRoad service ID to Fly.io app name
 */
function mapServiceToFlyApp(serviceId: string, envId: string): string {
  // Check environment variable first
  const envKey = `FLY_APP_${serviceId.toUpperCase().replace(/-/g, '_')}_${envId.toUpperCase()}`;
  const flyApp = process.env[envKey];

  if (flyApp) {
    return flyApp;
  }

  // Fallback: construct app name from service and env
  // Fly.io app names must be lowercase and use hyphens
  return `${serviceId}-${envId}`.toLowerCase();
}

/**
 * Fetch app status from Fly.io GraphQL API
 */
async function fetchFlyAppStatus(appName: string, apiToken: string): Promise<FlyAppStatus> {
  const query = `
    query($appName: String!) {
      app(name: $appName) {
        name
        status
        deployed
        organization {
          slug
        }
      }
    }
  `;

  const response = await fetch('https://api.fly.io/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables: { appName }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fly.io API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  if (!result.data?.app) {
    throw new Error(`App ${appName} not found in Fly.io`);
  }

  return result.data.app;
}

/**
 * Map Fly.io app status to DeployStatus state
 */
function mapFlyStatus(flyStatus: string): 'idle' | 'deploying' | 'failed' | 'active' {
  switch (flyStatus?.toLowerCase()) {
    case 'running':
    case 'deployed':
      return 'active';
    case 'deploying':
    case 'pending':
      return 'deploying';
    case 'dead':
    case 'crashed':
    case 'failed':
      return 'failed';
    default:
      return 'idle';
  }
}

/**
 * Fly.io API types
 */
interface FlyAppStatus {
  name: string;
  status: string;
  deployed?: {
    version: string;
    instances: number;
  };
  organization: {
    slug: string;
  };
}
