import { BlackRoadClient } from './client';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency_ms: number;
  timestamp: string;
  details?: Record<string, any>;
}

export interface DeploymentResult {
  id: string;
  service: string;
  version: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  started_at: string;
  completed_at?: string;
  logs: string[];
}

export interface MetricsResult {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  labels: Record<string, string>;
}

export interface ResourceUsage {
  cpu_percent: number;
  memory_percent: number;
  memory_mb: number;
  disk_percent: number;
  network_in_mb: number;
  network_out_mb: number;
}

export class InfrastructureTools {
  constructor(private client: BlackRoadClient) {}

  /**
   * Perform health check on a service
   */
  async healthCheck(
    service: string,
    options?: { timeout_ms?: number; method?: 'http' | 'tcp' | 'dns' }
  ): Promise<HealthCheckResult> {
    return this.client.fetch('/tools/infra/health', {
      method: 'POST',
      body: JSON.stringify({
        service,
        timeout_ms: options?.timeout_ms || 5000,
        method: options?.method || 'http'
      })
    });
  }

  /**
   * Check health of multiple services
   */
  async healthCheckAll(
    services: string[],
    options?: { timeout_ms?: number; parallel?: boolean }
  ): Promise<{ results: HealthCheckResult[]; summary: { healthy: number; unhealthy: number } }> {
    return this.client.fetch('/tools/infra/health/all', {
      method: 'POST',
      body: JSON.stringify({
        services,
        timeout_ms: options?.timeout_ms || 5000,
        parallel: options?.parallel !== false
      })
    });
  }

  /**
   * Trigger a deployment
   */
  async deploy(
    service: string,
    options?: {
      version?: string;
      environment?: string;
      strategy?: 'rolling' | 'blue-green' | 'canary';
      config?: Record<string, any>;
    }
  ): Promise<DeploymentResult> {
    return this.client.fetch('/tools/infra/deploy', {
      method: 'POST',
      body: JSON.stringify({
        service,
        version: options?.version || 'latest',
        environment: options?.environment || 'production',
        strategy: options?.strategy || 'rolling',
        config: options?.config
      })
    });
  }

  /**
   * Get deployment status
   */
  async getDeployment(deploymentId: string): Promise<DeploymentResult> {
    return this.client.fetch(`/tools/infra/deploy/${deploymentId}`);
  }

  /**
   * List recent deployments
   */
  async listDeployments(options?: {
    service?: string;
    environment?: string;
    limit?: number;
  }): Promise<{ deployments: DeploymentResult[] }> {
    const params = new URLSearchParams();
    if (options?.service) params.set('service', options.service);
    if (options?.environment) params.set('environment', options.environment);
    if (options?.limit) params.set('limit', String(options.limit));

    return this.client.fetch(`/tools/infra/deployments?${params}`);
  }

  /**
   * Rollback a deployment
   */
  async rollback(
    service: string,
    options?: { target_version?: string; environment?: string }
  ): Promise<DeploymentResult> {
    return this.client.fetch('/tools/infra/rollback', {
      method: 'POST',
      body: JSON.stringify({
        service,
        target_version: options?.target_version,
        environment: options?.environment || 'production'
      })
    });
  }

  /**
   * Get metrics for a service
   */
  async getMetrics(
    service: string,
    options?: {
      metrics?: string[];
      period?: '1m' | '5m' | '15m' | '1h' | '24h';
      aggregation?: 'avg' | 'max' | 'min' | 'sum';
    }
  ): Promise<{ metrics: MetricsResult[] }> {
    const params = new URLSearchParams();
    params.set('service', service);
    if (options?.metrics) params.set('metrics', options.metrics.join(','));
    if (options?.period) params.set('period', options.period);
    if (options?.aggregation) params.set('aggregation', options.aggregation);

    return this.client.fetch(`/tools/infra/metrics?${params}`);
  }

  /**
   * Get resource usage
   */
  async getResourceUsage(service: string): Promise<ResourceUsage> {
    return this.client.fetch(`/tools/infra/resources/${service}`);
  }

  /**
   * Scale a service
   */
  async scale(
    service: string,
    replicas: number,
    options?: { environment?: string }
  ): Promise<{ scaled: boolean; service: string; replicas: number; previous: number }> {
    return this.client.fetch('/tools/infra/scale', {
      method: 'POST',
      body: JSON.stringify({
        service,
        replicas,
        environment: options?.environment || 'production'
      })
    });
  }

  /**
   * Get logs for a service
   */
  async getLogs(
    service: string,
    options?: {
      lines?: number;
      since?: string;
      filter?: string;
      level?: 'error' | 'warn' | 'info' | 'debug';
    }
  ): Promise<{ logs: string[]; count: number }> {
    const params = new URLSearchParams();
    params.set('service', service);
    if (options?.lines) params.set('lines', String(options.lines));
    if (options?.since) params.set('since', options.since);
    if (options?.filter) params.set('filter', options.filter);
    if (options?.level) params.set('level', options.level);

    return this.client.fetch(`/tools/infra/logs?${params}`);
  }

  /**
   * Execute a command on a service
   */
  async exec(
    service: string,
    command: string,
    options?: { timeout_ms?: number; environment?: string }
  ): Promise<{ stdout: string; stderr: string; exit_code: number; duration_ms: number }> {
    return this.client.fetch('/tools/infra/exec', {
      method: 'POST',
      body: JSON.stringify({
        service,
        command,
        timeout_ms: options?.timeout_ms || 30000,
        environment: options?.environment || 'production'
      })
    });
  }

  /**
   * Set environment variable
   */
  async setEnv(
    service: string,
    key: string,
    value: string,
    options?: { secret?: boolean; environment?: string }
  ): Promise<{ set: boolean; key: string; service: string }> {
    return this.client.fetch('/tools/infra/env', {
      method: 'POST',
      body: JSON.stringify({
        service,
        key,
        value,
        secret: options?.secret || false,
        environment: options?.environment || 'production'
      })
    });
  }

  /**
   * Get environment variables (values masked for secrets)
   */
  async getEnv(
    service: string,
    options?: { environment?: string }
  ): Promise<{ variables: Record<string, string>; secrets: string[] }> {
    const params = new URLSearchParams();
    params.set('service', service);
    if (options?.environment) params.set('environment', options.environment);

    return this.client.fetch(`/tools/infra/env?${params}`);
  }
}
