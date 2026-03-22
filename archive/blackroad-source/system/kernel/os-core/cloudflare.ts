/**
 * Cloudflare API Integration
 *
 * Read-only operations for listing zones, DNS records, tunnels, and origins.
 * Uses Cloudflare API v4 with API token authentication.
 */

export interface CloudflareConfig {
  apiToken: string;
  accountId?: string;
}

export interface CloudflareZone {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'initializing' | 'moved' | 'deleted' | 'deactivated';
  paused: boolean;
  type: 'full' | 'partial' | 'secondary';
  developmentMode: number; // seconds remaining
  nameServers: string[];
  originalNameServers: string[];
  plan: {
    id: string;
    name: string;
  };
  createdOn: string;
  modifiedOn: string;
}

export interface CloudflareDNSRecord {
  id: string;
  zoneId: string;
  zoneName: string;
  name: string; // Full hostname
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'SRV' | 'CAA' | string;
  content: string; // Target/value
  proxied: boolean;
  proxiable: boolean;
  ttl: number;
  priority?: number;
  locked: boolean;
  createdOn: string;
  modifiedOn: string;
}

export interface CloudflareTunnel {
  id: string;
  accountId: string;
  name: string;
  status: 'healthy' | 'down' | 'degraded';
  createdAt: string;
  deletedAt: string | null;
  connections: {
    id: string;
    features: string[];
    version: string;
    arch: string;
    runAt: string;
    connectedAt: string;
    originIp: string;
    isPlatform: boolean;
  }[];
}

export interface CloudflarePageProject {
  id: string;
  name: string;
  subdomain: string;
  productionBranch: string;
  createdOn: string;
  domains: string[];
  source?: {
    type: string;
    config: {
      owner: string;
      repoName: string;
      productionBranch: string;
    };
  };
  latestDeployment?: {
    id: string;
    url: string;
    environment: string;
    createdOn: string;
  };
}

export interface ListRecordsOptions {
  type?: string;
  name?: string;
  content?: string;
  proxied?: boolean;
  perPage?: number;
  page?: number;
}

export class CloudflareClient {
  private readonly baseUrl = 'https://api.cloudflare.com/client/v4';
  private readonly headers: Record<string, string>;
  private readonly accountId?: string;

  constructor(config: CloudflareConfig) {
    this.headers = {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    };
    this.accountId = config.accountId;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options?.headers,
      },
    });

    const data = await response.json() as { success: boolean; result: T; errors: any[] };

    if (!data.success) {
      const errorMsg = data.errors?.map((e) => e.message).join(', ') || 'Unknown error';
      throw new Error(`Cloudflare API error: ${errorMsg}`);
    }

    return data.result;
  }

  /**
   * Verify API token is valid
   */
  async verifyToken(): Promise<{ id: string; status: string }> {
    return this.request('/user/tokens/verify');
  }

  /**
   * List all zones (domains) in the account
   */
  async listZones(): Promise<CloudflareZone[]> {
    const zones = await this.request<any[]>('/zones');
    return zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      status: zone.status,
      paused: zone.paused,
      type: zone.type,
      developmentMode: zone.development_mode,
      nameServers: zone.name_servers,
      originalNameServers: zone.original_name_servers,
      plan: {
        id: zone.plan.id,
        name: zone.plan.name,
      },
      createdOn: zone.created_on,
      modifiedOn: zone.modified_on,
    }));
  }

  /**
   * Get a specific zone by ID
   */
  async getZone(zoneId: string): Promise<CloudflareZone> {
    const zone = await this.request<any>(`/zones/${zoneId}`);
    return {
      id: zone.id,
      name: zone.name,
      status: zone.status,
      paused: zone.paused,
      type: zone.type,
      developmentMode: zone.development_mode,
      nameServers: zone.name_servers,
      originalNameServers: zone.original_name_servers,
      plan: {
        id: zone.plan.id,
        name: zone.plan.name,
      },
      createdOn: zone.created_on,
      modifiedOn: zone.modified_on,
    };
  }

  /**
   * Get zone by domain name
   */
  async getZoneByName(name: string): Promise<CloudflareZone | null> {
    const zones = await this.listZones();
    return zones.find((z) => z.name === name) || null;
  }

  /**
   * List DNS records for a zone
   */
  async listDNSRecords(zoneId: string, options: ListRecordsOptions = {}): Promise<CloudflareDNSRecord[]> {
    const params = new URLSearchParams();
    if (options.type) params.set('type', options.type);
    if (options.name) params.set('name', options.name);
    if (options.content) params.set('content', options.content);
    if (options.proxied !== undefined) params.set('proxied', String(options.proxied));
    params.set('per_page', String(options.perPage || 100));
    params.set('page', String(options.page || 1));

    const records = await this.request<any[]>(`/zones/${zoneId}/dns_records?${params}`);
    return records.map((record) => ({
      id: record.id,
      zoneId: record.zone_id,
      zoneName: record.zone_name,
      name: record.name,
      type: record.type,
      content: record.content,
      proxied: record.proxied,
      proxiable: record.proxiable,
      ttl: record.ttl,
      priority: record.priority,
      locked: record.locked,
      createdOn: record.created_on,
      modifiedOn: record.modified_on,
    }));
  }

  /**
   * Get all DNS records across all zones
   */
  async listAllDNSRecords(): Promise<CloudflareDNSRecord[]> {
    const zones = await this.listZones();
    const allRecords: CloudflareDNSRecord[] = [];

    for (const zone of zones) {
      try {
        const records = await this.listDNSRecords(zone.id);
        allRecords.push(...records);
      } catch (error) {
        console.warn(`Failed to fetch DNS records for zone ${zone.name}:`, error);
      }
    }

    return allRecords;
  }

  /**
   * List Cloudflare Tunnels (requires account ID)
   */
  async listTunnels(): Promise<CloudflareTunnel[]> {
    if (!this.accountId) {
      throw new Error('Account ID required for tunnel operations');
    }

    const tunnels = await this.request<any[]>(`/accounts/${this.accountId}/tunnels`);
    return tunnels.map((tunnel) => ({
      id: tunnel.id,
      accountId: tunnel.account_id,
      name: tunnel.name,
      status: tunnel.status,
      createdAt: tunnel.created_at,
      deletedAt: tunnel.deleted_at,
      connections: tunnel.connections?.map((conn: any) => ({
        id: conn.id,
        features: conn.features,
        version: conn.version,
        arch: conn.arch,
        runAt: conn.run_at,
        connectedAt: conn.connected_at,
        originIp: conn.origin_ip,
        isPlatform: conn.is_platform,
      })) || [],
    }));
  }

  /**
   * List Cloudflare Pages projects (requires account ID)
   */
  async listPagesProjects(): Promise<CloudflarePageProject[]> {
    if (!this.accountId) {
      throw new Error('Account ID required for Pages operations');
    }

    const projects = await this.request<any[]>(`/accounts/${this.accountId}/pages/projects`);
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      subdomain: project.subdomain,
      productionBranch: project.production_branch,
      createdOn: project.created_on,
      domains: project.domains || [],
      source: project.source ? {
        type: project.source.type,
        config: {
          owner: project.source.config.owner,
          repoName: project.source.config.repo_name,
          productionBranch: project.source.config.production_branch,
        },
      } : undefined,
      latestDeployment: project.latest_deployment ? {
        id: project.latest_deployment.id,
        url: project.latest_deployment.url,
        environment: project.latest_deployment.environment,
        createdOn: project.latest_deployment.created_on,
      } : undefined,
    }));
  }

  /**
   * Get combined domain info with zone and records
   */
  async getDomainInfo(domain: string): Promise<{
    zone: CloudflareZone | null;
    records: CloudflareDNSRecord[];
  }> {
    const zone = await this.getZoneByName(domain);
    if (!zone) {
      return { zone: null, records: [] };
    }
    const records = await this.listDNSRecords(zone.id);
    return { zone, records };
  }
}

/**
 * Create a Cloudflare client from environment variables
 */
export function createCloudflareClient(): CloudflareClient {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!apiToken) {
    throw new Error('CLOUDFLARE_API_TOKEN environment variable is required');
  }
  return new CloudflareClient({
    apiToken,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  });
}
