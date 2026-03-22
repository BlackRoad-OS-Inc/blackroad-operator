/**
 * Railway API Integration
 *
 * Read-only operations for listing services, deployments, and health status.
 * Uses Railway's GraphQL API.
 */

export interface RailwayConfig {
  apiToken: string;
}

export interface RailwayProject {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  teamId: string | null;
  environments: RailwayEnvironment[];
  services: RailwayService[];
}

export interface RailwayEnvironment {
  id: string;
  name: string;
  isEphemeral: boolean;
  createdAt: string;
}

export interface RailwayService {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  icon: string | null;
  source?: {
    repo: string;
    branch: string;
  };
  domains: RailwayDomain[];
  deployments: RailwayDeployment[];
}

export interface RailwayDomain {
  id: string;
  domain: string;
  suffix: string | null;
  createdAt: string;
}

export interface RailwayDeployment {
  id: string;
  serviceId: string;
  status: 'BUILDING' | 'DEPLOYING' | 'SUCCESS' | 'FAILED' | 'CRASHED' | 'REMOVED' | 'SLEEPING';
  createdAt: string;
  meta?: {
    repo?: string;
    branch?: string;
    commitHash?: string;
    commitMessage?: string;
    commitAuthor?: string;
  };
}

export interface RailwayServiceInstance {
  id: string;
  serviceId: string;
  environmentId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DEPLOYING' | 'FAILED';
  healthcheckPath?: string;
  domains: string[];
  variables: { key: string; value: string }[];
}

const RAILWAY_GQL_ENDPOINT = 'https://backboard.railway.app/graphql/v2';

export class RailwayClient {
  private readonly headers: Record<string, string>;

  constructor(config: RailwayConfig) {
    this.headers = {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async gql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const response = await fetch(RAILWAY_GQL_ENDPOINT, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json() as { data?: T; errors?: any[] };

    if (data.errors?.length) {
      const errorMsg = data.errors.map((e) => e.message).join(', ');
      throw new Error(`Railway API error: ${errorMsg}`);
    }

    if (!data.data) {
      throw new Error('Railway API returned no data');
    }

    return data.data;
  }

  /**
   * Get current authenticated user/team info
   */
  async getMe(): Promise<{ id: string; email: string; name: string }> {
    const query = `
      query {
        me {
          id
          email
          name
        }
      }
    `;
    const result = await this.gql<{ me: any }>(query);
    return result.me;
  }

  /**
   * List all projects accessible to the user
   */
  async listProjects(): Promise<RailwayProject[]> {
    const query = `
      query {
        projects {
          edges {
            node {
              id
              name
              description
              createdAt
              updatedAt
              teamId
              environments {
                edges {
                  node {
                    id
                    name
                    isEphemeral
                    createdAt
                  }
                }
              }
              services {
                edges {
                  node {
                    id
                    name
                    createdAt
                    updatedAt
                    icon
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.gql<{ projects: { edges: { node: any }[] } }>(query);
    return result.projects.edges.map(({ node }) => ({
      id: node.id,
      name: node.name,
      description: node.description,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      teamId: node.teamId,
      environments: node.environments.edges.map(({ node: env }: any) => ({
        id: env.id,
        name: env.name,
        isEphemeral: env.isEphemeral,
        createdAt: env.createdAt,
      })),
      services: node.services.edges.map(({ node: svc }: any) => ({
        id: svc.id,
        name: svc.name,
        projectId: node.id,
        createdAt: svc.createdAt,
        updatedAt: svc.updatedAt,
        icon: svc.icon,
        domains: [],
        deployments: [],
      })),
    }));
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId: string): Promise<RailwayProject> {
    const query = `
      query($projectId: String!) {
        project(id: $projectId) {
          id
          name
          description
          createdAt
          updatedAt
          teamId
          environments {
            edges {
              node {
                id
                name
                isEphemeral
                createdAt
              }
            }
          }
          services {
            edges {
              node {
                id
                name
                createdAt
                updatedAt
                icon
              }
            }
          }
        }
      }
    `;

    const result = await this.gql<{ project: any }>(query, { projectId });
    const node = result.project;
    return {
      id: node.id,
      name: node.name,
      description: node.description,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      teamId: node.teamId,
      environments: node.environments.edges.map(({ node: env }: any) => ({
        id: env.id,
        name: env.name,
        isEphemeral: env.isEphemeral,
        createdAt: env.createdAt,
      })),
      services: node.services.edges.map(({ node: svc }: any) => ({
        id: svc.id,
        name: svc.name,
        projectId: node.id,
        createdAt: svc.createdAt,
        updatedAt: svc.updatedAt,
        icon: svc.icon,
        domains: [],
        deployments: [],
      })),
    };
  }

  /**
   * Get service details with domains and latest deployment
   */
  async getService(serviceId: string): Promise<RailwayService> {
    const query = `
      query($serviceId: String!) {
        service(id: $serviceId) {
          id
          name
          projectId
          createdAt
          updatedAt
          icon
          serviceInstances {
            edges {
              node {
                domains {
                  serviceDomains {
                    domain
                    suffix
                    id
                    createdAt
                  }
                }
                latestDeployment {
                  id
                  status
                  createdAt
                  meta {
                    repo
                    branch
                    commitHash
                    commitMessage
                    commitAuthor
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.gql<{ service: any }>(query, { serviceId });
    const svc = result.service;

    // Aggregate domains and deployments from all instances
    const domains: RailwayDomain[] = [];
    const deployments: RailwayDeployment[] = [];

    for (const { node: instance } of svc.serviceInstances?.edges || []) {
      for (const d of instance.domains?.serviceDomains || []) {
        domains.push({
          id: d.id,
          domain: d.domain,
          suffix: d.suffix,
          createdAt: d.createdAt,
        });
      }
      if (instance.latestDeployment) {
        deployments.push({
          id: instance.latestDeployment.id,
          serviceId: svc.id,
          status: instance.latestDeployment.status,
          createdAt: instance.latestDeployment.createdAt,
          meta: instance.latestDeployment.meta,
        });
      }
    }

    return {
      id: svc.id,
      name: svc.name,
      projectId: svc.projectId,
      createdAt: svc.createdAt,
      updatedAt: svc.updatedAt,
      icon: svc.icon,
      domains,
      deployments,
    };
  }

  /**
   * Get latest deployments for a service
   */
  async getDeployments(serviceId: string, limit = 10): Promise<RailwayDeployment[]> {
    const query = `
      query($serviceId: String!, $limit: Int!) {
        deployments(first: $limit, input: { serviceId: $serviceId }) {
          edges {
            node {
              id
              status
              createdAt
              meta {
                repo
                branch
                commitHash
                commitMessage
                commitAuthor
              }
            }
          }
        }
      }
    `;

    const result = await this.gql<{ deployments: { edges: { node: any }[] } }>(query, {
      serviceId,
      limit
    });

    return result.deployments.edges.map(({ node }) => ({
      id: node.id,
      serviceId,
      status: node.status,
      createdAt: node.createdAt,
      meta: node.meta,
    }));
  }

  /**
   * Get all services across all projects with their status
   */
  async listAllServices(): Promise<RailwayService[]> {
    const projects = await this.listProjects();
    const allServices: RailwayService[] = [];

    for (const project of projects) {
      for (const svc of project.services) {
        try {
          const fullService = await this.getService(svc.id);
          allServices.push(fullService);
        } catch (error) {
          console.warn(`Failed to fetch service ${svc.id}:`, error);
          allServices.push(svc);
        }
      }
    }

    return allServices;
  }

  /**
   * Derive service health from latest deployment status
   */
  getServiceHealth(service: RailwayService): 'healthy' | 'degraded' | 'down' | 'unknown' {
    if (!service.deployments?.length) {
      return 'unknown';
    }

    const latest = service.deployments[0];
    switch (latest.status) {
      case 'SUCCESS':
        return 'healthy';
      case 'BUILDING':
      case 'DEPLOYING':
        return 'degraded';
      case 'FAILED':
      case 'CRASHED':
        return 'down';
      case 'SLEEPING':
        return 'degraded';
      default:
        return 'unknown';
    }
  }
}

/**
 * Create a Railway client from environment variables
 */
export function createRailwayClient(): RailwayClient {
  const apiToken = process.env.RAILWAY_TOKEN;
  if (!apiToken) {
    throw new Error('RAILWAY_TOKEN environment variable is required');
  }
  return new RailwayClient({ apiToken });
}
