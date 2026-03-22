/**
 * GitHub API Integration
 *
 * Read-only operations for discovering repos, branches, and linking to services.
 * Uses GitHub REST API v3 with personal access token or GitHub App authentication.
 */

export interface GitHubConfig {
  token: string;
  baseUrl?: string; // For GitHub Enterprise
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  url: string;
  htmlUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  language: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export interface GitHubBranch {
  name: string;
  sha: string;
  protected: boolean;
}

export interface GitHubOrg {
  id: number;
  login: string;
  name: string | null;
  description: string | null;
  avatarUrl: string;
  url: string;
}

export interface ListReposOptions {
  org?: string;
  user?: string;
  type?: 'all' | 'owner' | 'public' | 'private' | 'member';
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  perPage?: number;
  page?: number;
}

export class GitHubClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(config: GitHubConfig) {
    this.baseUrl = config.baseUrl || 'https://api.github.com';
    this.headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    };
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

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get authenticated user info
   */
  async getAuthenticatedUser(): Promise<{ login: string; id: number; name: string | null }> {
    return this.request('/user');
  }

  /**
   * List organizations the authenticated user belongs to
   */
  async listOrgs(): Promise<GitHubOrg[]> {
    const orgs = await this.request<any[]>('/user/orgs');
    return orgs.map((org) => ({
      id: org.id,
      login: org.login,
      name: org.name,
      description: org.description,
      avatarUrl: org.avatar_url,
      url: org.url,
    }));
  }

  /**
   * List repositories for authenticated user or org
   */
  async listRepos(options: ListReposOptions = {}): Promise<GitHubRepo[]> {
    const params = new URLSearchParams();
    if (options.type) params.set('type', options.type);
    if (options.sort) params.set('sort', options.sort);
    if (options.direction) params.set('direction', options.direction);
    params.set('per_page', String(options.perPage || 100));
    params.set('page', String(options.page || 1));

    let path: string;
    if (options.org) {
      path = `/orgs/${options.org}/repos`;
    } else if (options.user) {
      path = `/users/${options.user}/repos`;
    } else {
      path = '/user/repos';
    }

    const repos = await this.request<any[]>(`${path}?${params}`);
    return repos.map(this.mapRepo);
  }

  /**
   * Get a specific repository
   */
  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    const data = await this.request<any>(`/repos/${owner}/${repo}`);
    return this.mapRepo(data);
  }

  /**
   * List branches for a repository
   */
  async listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    const branches = await this.request<any[]>(`/repos/${owner}/${repo}/branches`);
    return branches.map((branch) => ({
      name: branch.name,
      sha: branch.commit.sha,
      protected: branch.protected,
    }));
  }

  /**
   * Get the default branch for a repository
   */
  async getDefaultBranch(owner: string, repo: string): Promise<string> {
    const repoData = await this.getRepo(owner, repo);
    return repoData.defaultBranch;
  }

  /**
   * Check if repo has a specific file (e.g., railway.json, Dockerfile)
   */
  async hasFile(owner: string, repo: string, path: string): Promise<boolean> {
    try {
      await this.request(`/repos/${owner}/${repo}/contents/${path}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List all repos across all accessible orgs and user account
   */
  async listAllRepos(): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = [];

    // Get user repos
    const userRepos = await this.listRepos({ type: 'all' });
    allRepos.push(...userRepos);

    // Get org repos
    const orgs = await this.listOrgs();
    for (const org of orgs) {
      try {
        const orgRepos = await this.listRepos({ org: org.login });
        allRepos.push(...orgRepos);
      } catch (error) {
        console.warn(`Failed to fetch repos for org ${org.login}:`, error);
      }
    }

    // Deduplicate by fullName
    const seen = new Set<string>();
    return allRepos.filter((repo) => {
      if (seen.has(repo.fullName)) return false;
      seen.add(repo.fullName);
      return true;
    });
  }

  private mapRepo(data: any): GitHubRepo {
    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      owner: data.owner.login,
      description: data.description,
      url: data.url,
      htmlUrl: data.html_url,
      defaultBranch: data.default_branch,
      isPrivate: data.private,
      language: data.language,
      topics: data.topics || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
    };
  }
}

/**
 * Create a GitHub client from environment variables
 */
export function createGitHubClient(): GitHubClient {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }
  return new GitHubClient({
    token,
    baseUrl: process.env.GITHUB_API_URL,
  });
}
