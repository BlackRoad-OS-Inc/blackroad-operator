export type PsShaInfinity = string;

export type IdentityKind =
  | "agent"
  | "job"
  | "task"
  | "text_snapshot"
  | "event"
  | "ledger_block"
  | "user"
  | "org"
  | "workspace"
  | "app"
  | "system";

export interface IdentityAnchor {
  id: PsShaInfinity;
  kind: IdentityKind;
  createdAt: string;
  label?: string;
  tags?: string[];
}

/**
 * User identity model - represents a person in BlackRoad OS
 * 🧬 Canonical type: other repos should import this, not redefine
 */
export interface User {
  id: PsShaInfinity;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  status: UserStatus;
  metadata?: Record<string, unknown>;
}

export type UserStatus = "active" | "inactive" | "suspended" | "pending";

/**
 * Organization identity model - represents a company/team in BlackRoad OS
 * 🧬 Canonical type: other repos should import this, not redefine
 */
export interface Org {
  id: PsShaInfinity;
  name: string;
  slug: string;
  ownerId: PsShaInfinity;
  createdAt: string;
  updatedAt: string;
  status: OrgStatus;
  plan?: OrgPlan;
  metadata?: Record<string, unknown>;
}

export type OrgStatus = "active" | "inactive" | "suspended";
export type OrgPlan = "free" | "pro" | "enterprise";

/**
 * Workspace identity model - represents a project space within an org
 * 🧬 Canonical type: other repos should import this, not redefine
 */
export interface Workspace {
  id: PsShaInfinity;
  orgId: PsShaInfinity;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: WorkspaceStatus;
  environment: WorkspaceEnvironment;
  metadata?: Record<string, unknown>;
}

export type WorkspaceStatus = "active" | "archived" | "deleted";
export type WorkspaceEnvironment = "development" | "staging" | "production";

/**
 * Membership represents a user's relationship to an org
 */
export interface OrgMembership {
  userId: PsShaInfinity;
  orgId: PsShaInfinity;
  role: OrgRole;
  joinedAt: string;
  status: MembershipStatus;
}

export type OrgRole = "owner" | "admin" | "member" | "viewer";
export type MembershipStatus = "active" | "invited" | "removed";

/**
 * Workspace membership represents a user's relationship to a workspace
 */
export interface WorkspaceMembership {
  userId: PsShaInfinity;
  workspaceId: PsShaInfinity;
  role: WorkspaceRole;
  joinedAt: string;
  status: MembershipStatus;
}

export type WorkspaceRole = "admin" | "editor" | "viewer";
