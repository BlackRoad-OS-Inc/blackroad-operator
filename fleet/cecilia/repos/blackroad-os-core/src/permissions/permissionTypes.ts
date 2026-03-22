/**
 * Permissions, Roles & Capabilities Types
 * 🔐 Auth/security models for BlackRoad OS
 */

import type { PsShaInfinity } from "../identity/identityTypes";

/**
 * Permission represents a single action that can be performed
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: ResourceType;
  action: ActionType;
}

export type ResourceType =
  | "org"
  | "workspace"
  | "user"
  | "agent"
  | "app"
  | "deployment"
  | "policy"
  | "billing"
  | "settings";

export type ActionType =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "execute"
  | "manage"
  | "invite"
  | "revoke";

/**
 * Role aggregates multiple permissions
 */
export interface Role {
  id: PsShaInfinity;
  name: string;
  description: string;
  scope: RoleScope;
  permissions: Permission[];
  isCustom: boolean;
  createdAt: string;
}

export type RoleScope = "system" | "org" | "workspace";

/**
 * Capability represents a feature flag or entitlement
 */
export interface Capability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  tier?: CapabilityTier;
}

export type CapabilityTier = "free" | "pro" | "enterprise";

/**
 * Policy defines access rules
 */
export interface AccessPolicy {
  id: PsShaInfinity;
  name: string;
  description?: string;
  rules: PolicyRule[];
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  id: string;
  effect: PolicyEffect;
  resources: string[];
  actions: ActionType[];
  conditions?: PolicyCondition[];
}

export type PolicyEffect = "allow" | "deny";

export interface PolicyCondition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export type ConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "notIn";

/**
 * PermissionCheck is used to evaluate access
 */
export interface PermissionCheck {
  userId: PsShaInfinity;
  resource: ResourceType;
  action: ActionType;
  resourceId?: PsShaInfinity;
  context?: Record<string, unknown>;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  matchedPolicy?: PsShaInfinity;
}

/**
 * Built-in system roles
 */
export const SystemRoles = {
  SYSTEM_ADMIN: "system_admin",
  ORG_OWNER: "org_owner",
  ORG_ADMIN: "org_admin",
  ORG_MEMBER: "org_member",
  ORG_VIEWER: "org_viewer",
  WORKSPACE_ADMIN: "workspace_admin",
  WORKSPACE_EDITOR: "workspace_editor",
  WORKSPACE_VIEWER: "workspace_viewer",
} as const;

export type SystemRoleName = (typeof SystemRoles)[keyof typeof SystemRoles];
