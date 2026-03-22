/**
 * Infra Sync Service
 *
 * Coordinates syncing data from GitHub, Cloudflare, and Railway
 * into the BlackRoad OS database models.
 */

import { GitHubClient, GitHubRepo, createGitHubClient } from './github';
import { CloudflareClient, CloudflareDNSRecord, CloudflareZone, createCloudflareClient } from './cloudflare';
import { RailwayClient, RailwayProject, RailwayService, createRailwayClient } from './railway';

export interface SyncResult {
  timestamp: string;
  github: {
    repos: number;
    errors: string[];
  };
  cloudflare: {
    zones: number;
    records: number;
    errors: string[];
  };
  railway: {
    projects: number;
    services: number;
    errors: string[];
  };
}

export interface InfraSnapshot {
  syncedAt: string;
  repos: GitHubRepo[];
  zones: CloudflareZone[];
  dnsRecords: CloudflareDNSRecord[];
  railwayProjects: RailwayProject[];
  railwayServices: RailwayService[];
}

export interface SyncOptions {
  github?: boolean;
  cloudflare?: boolean;
  railway?: boolean;
}

export class InfraSyncService {
  private github?: GitHubClient;
  private cloudflare?: CloudflareClient;
  private railway?: RailwayClient;

  constructor(options?: {
    github?: GitHubClient;
    cloudflare?: CloudflareClient;
    railway?: RailwayClient;
  }) {
    this.github = options?.github;
    this.cloudflare = options?.cloudflare;
    this.railway = options?.railway;
  }

  /**
   * Initialize clients from environment variables
   */
  static fromEnv(): InfraSyncService {
    let github: GitHubClient | undefined;
    let cloudflare: CloudflareClient | undefined;
    let railway: RailwayClient | undefined;

    try {
      github = createGitHubClient();
    } catch (e) {
      console.warn('GitHub client not available:', (e as Error).message);
    }

    try {
      cloudflare = createCloudflareClient();
    } catch (e) {
      console.warn('Cloudflare client not available:', (e as Error).message);
    }

    try {
      railway = createRailwayClient();
    } catch (e) {
      console.warn('Railway client not available:', (e as Error).message);
    }

    return new InfraSyncService({ github, cloudflare, railway });
  }

  /**
   * Check which integrations are available
   */
  getAvailableIntegrations(): { github: boolean; cloudflare: boolean; railway: boolean } {
    return {
      github: !!this.github,
      cloudflare: !!this.cloudflare,
      railway: !!this.railway,
    };
  }

  /**
   * Fetch a complete snapshot of all infrastructure
   */
  async fetchSnapshot(options: SyncOptions = {}): Promise<InfraSnapshot> {
    const doGithub = options.github !== false && this.github;
    const doCloudflare = options.cloudflare !== false && this.cloudflare;
    const doRailway = options.railway !== false && this.railway;

    const [repos, zonesAndRecords, railwayData] = await Promise.all([
      doGithub ? this.github!.listAllRepos() : Promise.resolve([]),
      doCloudflare ? this.fetchCloudflareData() : Promise.resolve({ zones: [], records: [] }),
      doRailway ? this.fetchRailwayData() : Promise.resolve({ projects: [], services: [] }),
    ]);

    return {
      syncedAt: new Date().toISOString(),
      repos,
      zones: zonesAndRecords.zones,
      dnsRecords: zonesAndRecords.records,
      railwayProjects: railwayData.projects,
      railwayServices: railwayData.services,
    };
  }

  /**
   * Fetch Cloudflare zones and DNS records
   */
  private async fetchCloudflareData(): Promise<{
    zones: CloudflareZone[];
    records: CloudflareDNSRecord[];
  }> {
    if (!this.cloudflare) {
      return { zones: [], records: [] };
    }

    const zones = await this.cloudflare.listZones();
    const records = await this.cloudflare.listAllDNSRecords();
    return { zones, records };
  }

  /**
   * Fetch Railway projects and services
   */
  private async fetchRailwayData(): Promise<{
    projects: RailwayProject[];
    services: RailwayService[];
  }> {
    if (!this.railway) {
      return { projects: [], services: [] };
    }

    const projects = await this.railway.listProjects();
    const services = await this.railway.listAllServices();
    return { projects, services };
  }

  /**
   * Perform a full sync and return results summary
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    const result: SyncResult = {
      timestamp: new Date().toISOString(),
      github: { repos: 0, errors: [] },
      cloudflare: { zones: 0, records: 0, errors: [] },
      railway: { projects: 0, services: 0, errors: [] },
    };

    // GitHub
    if (options.github !== false && this.github) {
      try {
        const repos = await this.github.listAllRepos();
        result.github.repos = repos.length;
      } catch (e) {
        result.github.errors.push((e as Error).message);
      }
    }

    // Cloudflare
    if (options.cloudflare !== false && this.cloudflare) {
      try {
        const zones = await this.cloudflare.listZones();
        result.cloudflare.zones = zones.length;
      } catch (e) {
        result.cloudflare.errors.push((e as Error).message);
      }

      try {
        const records = await this.cloudflare.listAllDNSRecords();
        result.cloudflare.records = records.length;
      } catch (e) {
        result.cloudflare.errors.push((e as Error).message);
      }
    }

    // Railway
    if (options.railway !== false && this.railway) {
      try {
        const projects = await this.railway.listProjects();
        result.railway.projects = projects.length;
      } catch (e) {
        result.railway.errors.push((e as Error).message);
      }

      try {
        const services = await this.railway.listAllServices();
        result.railway.services = services.length;
      } catch (e) {
        result.railway.errors.push((e as Error).message);
      }
    }

    return result;
  }

  /**
   * Match domains to services (cross-reference Cloudflare → Railway)
   */
  async matchDomainsToServices(): Promise<Map<string, { domain: CloudflareDNSRecord; service?: RailwayService }>> {
    const matches = new Map<string, { domain: CloudflareDNSRecord; service?: RailwayService }>();

    if (!this.cloudflare) {
      return matches;
    }

    const records = await this.cloudflare.listAllDNSRecords();
    const services = this.railway ? await this.railway.listAllServices() : [];

    // Build a lookup of Railway domains
    const railwayDomainMap = new Map<string, RailwayService>();
    for (const svc of services) {
      for (const domain of svc.domains) {
        const fullDomain = domain.suffix
          ? `${domain.domain}.${domain.suffix}`
          : domain.domain;
        railwayDomainMap.set(fullDomain, svc);
      }
    }

    // Match each DNS record
    for (const record of records) {
      const service = railwayDomainMap.get(record.name);
      matches.set(record.name, { domain: record, service });
    }

    return matches;
  }

  /**
   * Get health summary across all services
   */
  async getHealthSummary(): Promise<{
    total: number;
    healthy: number;
    degraded: number;
    down: number;
    unknown: number;
  }> {
    const summary = { total: 0, healthy: 0, degraded: 0, down: 0, unknown: 0 };

    if (!this.railway) {
      return summary;
    }

    const services = await this.railway.listAllServices();
    summary.total = services.length;

    for (const svc of services) {
      const health = this.railway.getServiceHealth(svc);
      summary[health]++;
    }

    return summary;
  }
}

/**
 * Create sync service from environment
 */
export function createSyncService(): InfraSyncService {
  return InfraSyncService.fromEnv();
}
