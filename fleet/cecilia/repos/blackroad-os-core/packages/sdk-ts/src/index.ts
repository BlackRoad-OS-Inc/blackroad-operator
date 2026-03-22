import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export interface Agent {
  id: string;
  name: string;
  role: string;
  managerId?: string | null;
}

export interface Catalog {
  agents: Agent[];
}

const DEFAULT_CATALOG_URL = process.env.CATALOG_URL;
const DEFAULT_POLICY_PATH = path.resolve(process.cwd(), "policy", "role_matrix.yaml");

async function loadFromUrl(url: string): Promise<Catalog> {
  const fetchFn = globalThis.fetch;
  if (!fetchFn) {
    throw new Error("Global fetch is not available in this runtime.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const res = await fetchFn(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`Failed to load catalog from ${url}`);
    }
    return (await res.json()) as Catalog;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after 5 seconds`);
    }
    throw error;
  }
}

async function loadFromFile(filePath: string): Promise<Catalog> {
  const { readFile } = await import("fs/promises");
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as Catalog;
}

export async function loadCatalog(source?: string): Promise<Catalog> {
  const target = source ?? DEFAULT_CATALOG_URL;
  if (!target) {
    const fallback = path.resolve(process.cwd(), "catalog.json");
    if (fs.existsSync(fallback)) {
      return loadFromFile(fallback);
    }
    throw new Error("No catalog source provided. Set CATALOG_URL or provide a file path.");
  }

  if (target.startsWith("http")) {
    return loadFromUrl(target);
  }
  const filePath = path.isAbsolute(target)
    ? target
    : path.resolve(process.cwd(), target);
  return loadFromFile(filePath);
}

export function getAgent(id: string, catalog: Catalog): Agent | null {
  return catalog.agents.find((a) => a.id === id) ?? null;
}

// Escape HTML special characters to prevent XSS in SVG output
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export class RoleGuard {
  private roles: string[];
  private policy: Record<string, string[]>;

  constructor(roles: string[], policyPath: string = DEFAULT_POLICY_PATH) {
    this.roles = roles;
    this.policy = this.loadPolicy(policyPath);
  }

  private loadPolicy(policyPath: string): Record<string, string[]> {
    if (!fs.existsSync(policyPath)) {
      return {};
    }
    const content = fs.readFileSync(policyPath, "utf-8");
    const data = yaml.load(content) as Record<string, string[]>;
    return data ?? {};
  }

  /**
   * Checks if the current roles can perform the given action on the resource.
   * Both `action` and `resource` must NOT contain colons, as colons are used as separators in policy keys.
   */
  canPerform(action: string, resource: string): boolean {
    if (action.includes(":") || resource.includes(":")) {
      throw new Error("Action and resource must not contain ':' characters.");
    }
    const check = `${action}:${resource}`;
    return this.roles.some((role) => this.policy[role]?.includes(check));
  }
}

export function generateOrgChartSVG(catalog: Catalog): string {
  const nodes = catalog.agents
    .map((agent, index) => {
      const y = 40 + index * 40;
      const safeName = escapeHtml(agent.name);
      const safeRole = escapeHtml(agent.role);
      return `<g id="${agent.id}"><rect x="10" y="${y}" width="240" height="30" fill="#0f172a" rx="4"/><text x="20" y="${y + 20}" fill="#e2e8f0">${safeName} (${safeRole})</text></g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="${40 +
    catalog.agents.length * 40}">${nodes}</svg>`;
}
