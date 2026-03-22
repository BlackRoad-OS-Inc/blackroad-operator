/**
 * Cross-App Context Passing Types
 * 🧳 Context passing between apps (selected org, env, project, agent)
 */

import type { PsShaInfinity } from "../identity/identityTypes";

/**
 * AppContext is the shared context passed between apps
 * 🧳 What context is shared across the desktop shell
 */
export interface AppContext {
  currentUser: UserContextInfo;
  currentOrg: OrgContextInfo;
  currentWorkspace?: WorkspaceContextInfo;
  selectedAgent?: AgentContextInfo;
  selectedProject?: ProjectContextInfo;
  environment: EnvironmentContextInfo;
}

/**
 * UserContextInfo - minimal user info for context passing
 */
export interface UserContextInfo {
  id: PsShaInfinity;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
}

/**
 * OrgContextInfo - minimal org info for context passing
 */
export interface OrgContextInfo {
  id: PsShaInfinity;
  name: string;
  slug: string;
  plan: string;
  memberRole: string;
}

/**
 * WorkspaceContextInfo - minimal workspace info for context passing
 */
export interface WorkspaceContextInfo {
  id: PsShaInfinity;
  name: string;
  slug: string;
  environment: string;
  memberRole: string;
}

/**
 * AgentContextInfo - minimal agent info for context passing
 */
export interface AgentContextInfo {
  id: PsShaInfinity;
  name: string;
  role: string;
  status: string;
}

/**
 * ProjectContextInfo - minimal project info for context passing
 */
export interface ProjectContextInfo {
  id: PsShaInfinity;
  name: string;
  slug: string;
  status: string;
}

/**
 * EnvironmentContextInfo - current environment settings
 */
export interface EnvironmentContextInfo {
  name: EnvironmentName;
  apiBaseUrl: string;
  features: FeatureFlags;
}

export type EnvironmentName = "local" | "development" | "staging" | "production";

/**
 * Feature flags for the current environment
 */
export interface FeatureFlags {
  [key: string]: boolean;
}

/**
 * ContextUpdate represents a change to the shared context
 */
export interface ContextUpdate<T = unknown> {
  field: ContextField;
  value: T;
  source: string;
  timestamp: string;
}

export type ContextField =
  | "currentOrg"
  | "currentWorkspace"
  | "selectedAgent"
  | "selectedProject"
  | "environment";

/**
 * ContextSubscription allows apps to subscribe to context changes
 */
export interface ContextSubscription {
  id: string;
  appId: PsShaInfinity;
  fields: ContextField[];
  callback: (update: ContextUpdate) => void;
}

/**
 * ContextProvider interface for managing shared context
 */
export interface ContextProvider {
  getContext(): AppContext;
  setOrg(orgId: PsShaInfinity): Promise<void>;
  setWorkspace(workspaceId: PsShaInfinity): Promise<void>;
  selectAgent(agentId: PsShaInfinity): void;
  selectProject(projectId: PsShaInfinity): void;
  setEnvironment(env: EnvironmentName): void;
  subscribe(subscription: Omit<ContextSubscription, "id">): string;
  unsubscribe(subscriptionId: string): void;
}

/**
 * DeepLink represents a navigable deep link within the OS
 */
export interface DeepLink {
  appId: PsShaInfinity;
  route: string;
  params?: Record<string, string>;
  context?: Partial<AppContext>;
}

/**
 * Parse a deep link URL into a DeepLink object
 */
export function parseDeepLink(url: string): DeepLink | null {
  try {
    const parsed = new URL(url);
    
    // For custom protocols like blackroad://, the "host" is the appId
    // For standard URLs like https://, the first pathname segment is the appId
    let appId: string;
    let pathParts: string[];
    
    if (parsed.protocol === "blackroad:" || parsed.protocol.endsWith(":") && !parsed.protocol.startsWith("http")) {
      // Custom protocol: blackroad://appId/route
      appId = parsed.host || parsed.hostname;
      pathParts = parsed.pathname.split("/").filter(Boolean);
    } else {
      // Standard URL: https://domain/appId/route
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length < 1) {
        return null;
      }
      appId = parts[0];
      pathParts = parts.slice(1);
    }
    
    if (!appId) {
      return null;
    }

    const route = "/" + pathParts.join("/");
    const params: Record<string, string> = {};

    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return {
      appId,
      route,
      params: Object.keys(params).length > 0 ? params : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Build a deep link URL from a DeepLink object
 */
export function buildDeepLink(link: DeepLink, baseUrl = "blackroad://"): string {
  let url = `${baseUrl}${link.appId}${link.route}`;

  if (link.params && Object.keys(link.params).length > 0) {
    const searchParams = new URLSearchParams(link.params);
    url += `?${searchParams.toString()}`;
  }

  return url;
}
