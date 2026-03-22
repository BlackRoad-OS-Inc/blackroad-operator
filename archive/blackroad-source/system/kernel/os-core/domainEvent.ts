import type { PsShaInfinity } from "../identity/identityTypes";
import type { IdentityHash } from "../identity/registry";

export type EventSeverity = "info" | "warning" | "error";

export interface DomainEventPayload {
  [key: string]: unknown;
}

export interface DomainEvent<TPayload extends DomainEventPayload = DomainEventPayload> {
  id: PsShaInfinity;
  type: string;
  payload: TPayload;
  severity: EventSeverity;
  timestamp: string;
  agentId?: PsShaInfinity;

  // Identity anchoring (Genesis Block 0)
  authorizedBy: IdentityHash; // Identity that authorized/emitted this event
  authorityChain?: IdentityHash[]; // Full delegation chain back to genesis
}

/**
 * Domain Event Contracts
 * 📡 Canonical event names for audit-friendly flows
 * Other repos should use these types, not redefine them
 */

// ─────────────────────────────────────────────────────────────
// User Events
// ─────────────────────────────────────────────────────────────

export interface UserLoggedInPayload extends DomainEventPayload {
  userId: PsShaInfinity;
  sessionId: PsShaInfinity;
  orgId: PsShaInfinity;
  method: LoginMethod;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
  };
}

export type LoginMethod = "password" | "oauth" | "sso" | "api_key" | "magic_link";

export interface UserLoggedOutPayload extends DomainEventPayload {
  userId: PsShaInfinity;
  sessionId: PsShaInfinity;
  reason: LogoutReason;
}

export type LogoutReason = "user_initiated" | "session_expired" | "admin_revoked" | "security";

export interface UserRoleChangedPayload extends DomainEventPayload {
  userId: PsShaInfinity;
  orgId: PsShaInfinity;
  previousRole: string;
  newRole: string;
  changedBy: PsShaInfinity;
}

export interface UserInvitedPayload extends DomainEventPayload {
  inviteId: PsShaInfinity;
  email: string;
  orgId: PsShaInfinity;
  role: string;
  invitedBy: PsShaInfinity;
}

// ─────────────────────────────────────────────────────────────
// Org Events
// ─────────────────────────────────────────────────────────────

export interface OrgCreatedPayload extends DomainEventPayload {
  orgId: PsShaInfinity;
  name: string;
  ownerId: PsShaInfinity;
}

export interface OrgUpdatedPayload extends DomainEventPayload {
  orgId: PsShaInfinity;
  changes: Record<string, { from: unknown; to: unknown }>;
  updatedBy: PsShaInfinity;
}

// ─────────────────────────────────────────────────────────────
// Workspace Events
// ─────────────────────────────────────────────────────────────

export interface WorkspaceCreatedPayload extends DomainEventPayload {
  workspaceId: PsShaInfinity;
  orgId: PsShaInfinity;
  name: string;
  createdBy: PsShaInfinity;
}

export interface WorkspaceDeletedPayload extends DomainEventPayload {
  workspaceId: PsShaInfinity;
  orgId: PsShaInfinity;
  deletedBy: PsShaInfinity;
}

// ─────────────────────────────────────────────────────────────
// Environment Events
// ─────────────────────────────────────────────────────────────

export interface EnvironmentSwitchedPayload extends DomainEventPayload {
  userId: PsShaInfinity;
  previousEnv: string;
  newEnv: string;
  workspaceId?: PsShaInfinity;
}

// ─────────────────────────────────────────────────────────────
// Deployment Events
// ─────────────────────────────────────────────────────────────

export interface DeploymentChangedPayload extends DomainEventPayload {
  deploymentId: PsShaInfinity;
  status: DeploymentStatus;
  environment: string;
  version: string;
  triggeredBy: PsShaInfinity;
  metadata?: {
    commitSha?: string;
    duration?: number;
    error?: string;
  };
}

export type DeploymentStatus =
  | "pending"
  | "building"
  | "deploying"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "rolled_back";

export interface DeploymentStartedPayload extends DomainEventPayload {
  deploymentId: PsShaInfinity;
  environment: string;
  version: string;
  triggeredBy: PsShaInfinity;
}

export interface DeploymentCompletedPayload extends DomainEventPayload {
  deploymentId: PsShaInfinity;
  status: "succeeded" | "failed";
  duration: number;
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// Agent Events
// ─────────────────────────────────────────────────────────────

export interface AgentRunStartedPayload extends DomainEventPayload {
  runId: PsShaInfinity;
  agentId: PsShaInfinity;
  jobId: PsShaInfinity;
  input: Record<string, unknown>;
  triggeredBy: TriggerSource;
}

export type TriggerSource = "user" | "schedule" | "webhook" | "event" | "system";

export interface AgentRunCompletedPayload extends DomainEventPayload {
  runId: PsShaInfinity;
  agentId: PsShaInfinity;
  jobId: PsShaInfinity;
  status: AgentRunStatus;
  duration: number;
  output?: Record<string, unknown>;
  error?: string;
}

export type AgentRunStatus = "completed" | "failed" | "cancelled" | "timed_out";

export interface AgentStatusChangedPayload extends DomainEventPayload {
  agentId: PsShaInfinity;
  previousStatus: string;
  newStatus: string;
  reason?: string;
}

// ─────────────────────────────────────────────────────────────
// App Events
// ─────────────────────────────────────────────────────────────

export interface AppOpenedPayload extends DomainEventPayload {
  appId: PsShaInfinity;
  userId: PsShaInfinity;
  windowId: PsShaInfinity;
  route?: string;
}

export interface AppClosedPayload extends DomainEventPayload {
  appId: PsShaInfinity;
  userId: PsShaInfinity;
  windowId: PsShaInfinity;
  duration: number;
}

// ─────────────────────────────────────────────────────────────
// Canonical Event Type Names
// ─────────────────────────────────────────────────────────────

export const DomainEventTypes = {
  // User events
  USER_LOGGED_IN: "user.logged_in",
  USER_LOGGED_OUT: "user.logged_out",
  USER_ROLE_CHANGED: "user.role_changed",
  USER_INVITED: "user.invited",

  // Org events
  ORG_CREATED: "org.created",
  ORG_UPDATED: "org.updated",

  // Workspace events
  WORKSPACE_CREATED: "workspace.created",
  WORKSPACE_DELETED: "workspace.deleted",

  // Environment events
  ENVIRONMENT_SWITCHED: "environment.switched",

  // Deployment events
  DEPLOYMENT_CHANGED: "deployment.changed",
  DEPLOYMENT_STARTED: "deployment.started",
  DEPLOYMENT_COMPLETED: "deployment.completed",

  // Agent events
  AGENT_RUN_STARTED: "agent.run_started",
  AGENT_RUN_COMPLETED: "agent.run_completed",
  AGENT_STATUS_CHANGED: "agent.status_changed",

  // App events
  APP_OPENED: "app.opened",
  APP_CLOSED: "app.closed",
} as const;

export type DomainEventType = (typeof DomainEventTypes)[keyof typeof DomainEventTypes];
