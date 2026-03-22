/**
 * Canonical Enums & Constants
 * 📚 Shared constants for BlackRoad OS - other repos should import, not redefine
 */

// ─────────────────────────────────────────────────────────────
// Environments
// ─────────────────────────────────────────────────────────────

export const Environments = {
  LOCAL: "local",
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
} as const;

export type Environment = (typeof Environments)[keyof typeof Environments];

export const EnvironmentConfig: Record<Environment, EnvironmentMeta> = {
  local: {
    name: "Local",
    shortName: "local",
    color: "#6b7280",
    dangerous: false,
  },
  development: {
    name: "Development",
    shortName: "dev",
    color: "#3b82f6",
    dangerous: false,
  },
  staging: {
    name: "Staging",
    shortName: "staging",
    color: "#f59e0b",
    dangerous: false,
  },
  production: {
    name: "Production",
    shortName: "prod",
    color: "#ef4444",
    dangerous: true,
  },
};

export interface EnvironmentMeta {
  name: string;
  shortName: string;
  color: string;
  dangerous: boolean;
}

// ─────────────────────────────────────────────────────────────
// Teams / Roles
// ─────────────────────────────────────────────────────────────

export const Teams = {
  ENGINEERING: "engineering",
  PRODUCT: "product",
  DESIGN: "design",
  OPERATIONS: "operations",
  SUPPORT: "support",
  SECURITY: "security",
  FINANCE: "finance",
  LEADERSHIP: "leadership",
} as const;

export type Team = (typeof Teams)[keyof typeof Teams];

export const TeamConfig: Record<Team, TeamMeta> = {
  engineering: { name: "Engineering", icon: "⚙️", color: "#3b82f6" },
  product: { name: "Product", icon: "📊", color: "#8b5cf6" },
  design: { name: "Design", icon: "🎨", color: "#ec4899" },
  operations: { name: "Operations", icon: "🔧", color: "#f59e0b" },
  support: { name: "Support", icon: "💬", color: "#10b981" },
  security: { name: "Security", icon: "🔐", color: "#ef4444" },
  finance: { name: "Finance", icon: "💰", color: "#06b6d4" },
  leadership: { name: "Leadership", icon: "👑", color: "#6366f1" },
};

export interface TeamMeta {
  name: string;
  icon: string;
  color: string;
}

// ─────────────────────────────────────────────────────────────
// Packs (Domain Extensions)
// ─────────────────────────────────────────────────────────────

export const Packs = {
  EDUCATION: "education",
  INFRA_DEVOPS: "infra-devops",
  FINANCE: "finance",
  LEGAL: "legal",
  HEALTHCARE: "healthcare",
  ECOMMERCE: "ecommerce",
  MARKETING: "marketing",
  HR: "hr",
} as const;

export type Pack = (typeof Packs)[keyof typeof Packs];

export const PackConfig: Record<Pack, PackMeta> = {
  education: {
    id: "pack-education",
    name: "Education Pack",
    description: "Tools for educational institutions and e-learning",
    icon: "📚",
    color: "#8b5cf6",
  },
  "infra-devops": {
    id: "pack-infra-devops",
    name: "Infra/DevOps Pack",
    description: "Infrastructure and DevOps automation tools",
    icon: "☁️",
    color: "#06b6d4",
  },
  finance: {
    id: "pack-finance",
    name: "Finance Pack",
    description: "Financial services and accounting tools",
    icon: "💰",
    color: "#10b981",
  },
  legal: {
    id: "pack-legal",
    name: "Legal Pack",
    description: "Legal document management and compliance",
    icon: "⚖️",
    color: "#6366f1",
  },
  healthcare: {
    id: "pack-healthcare",
    name: "Healthcare Pack",
    description: "Healthcare management and patient tools",
    icon: "🏥",
    color: "#ef4444",
  },
  ecommerce: {
    id: "pack-ecommerce",
    name: "E-Commerce Pack",
    description: "Online retail and marketplace tools",
    icon: "🛒",
    color: "#f59e0b",
  },
  marketing: {
    id: "pack-marketing",
    name: "Marketing Pack",
    description: "Marketing automation and analytics",
    icon: "📢",
    color: "#ec4899",
  },
  hr: {
    id: "pack-hr",
    name: "HR Pack",
    description: "Human resources and workforce management",
    icon: "👥",
    color: "#3b82f6",
  },
};

export interface PackMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ─────────────────────────────────────────────────────────────
// Status Types
// ─────────────────────────────────────────────────────────────

export const GenericStatuses = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  ARCHIVED: "archived",
  DELETED: "deleted",
  SUSPENDED: "suspended",
} as const;

export type GenericStatus = (typeof GenericStatuses)[keyof typeof GenericStatuses];

export const JobStatuses = {
  QUEUED: "queued",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  TIMED_OUT: "timed_out",
} as const;

export type JobStatusType = (typeof JobStatuses)[keyof typeof JobStatuses];

export const DeploymentStatuses = {
  PENDING: "pending",
  BUILDING: "building",
  DEPLOYING: "deploying",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  CANCELLED: "cancelled",
  ROLLED_BACK: "rolled_back",
} as const;

export type DeploymentStatusType = (typeof DeploymentStatuses)[keyof typeof DeploymentStatuses];

export const AgentStatuses = {
  IDLE: "idle",
  RUNNING: "running",
  ERROR: "error",
  OFFLINE: "offline",
  MAINTENANCE: "maintenance",
} as const;

export type AgentStatusType = (typeof AgentStatuses)[keyof typeof AgentStatuses];

// ─────────────────────────────────────────────────────────────
// Status Metadata
// ─────────────────────────────────────────────────────────────

export interface StatusMeta {
  label: string;
  color: string;
  icon: string;
  terminal: boolean;
}

export const StatusColors: Record<string, StatusMeta> = {
  active: { label: "Active", color: "#10b981", icon: "✓", terminal: false },
  inactive: { label: "Inactive", color: "#6b7280", icon: "○", terminal: false },
  pending: { label: "Pending", color: "#f59e0b", icon: "⏳", terminal: false },
  archived: { label: "Archived", color: "#9ca3af", icon: "📦", terminal: true },
  deleted: { label: "Deleted", color: "#ef4444", icon: "🗑️", terminal: true },
  suspended: { label: "Suspended", color: "#f97316", icon: "⚠️", terminal: false },
  queued: { label: "Queued", color: "#6b7280", icon: "⏸️", terminal: false },
  running: { label: "Running", color: "#3b82f6", icon: "▶️", terminal: false },
  completed: { label: "Completed", color: "#10b981", icon: "✓", terminal: true },
  failed: { label: "Failed", color: "#ef4444", icon: "✗", terminal: true },
  cancelled: { label: "Cancelled", color: "#9ca3af", icon: "⊘", terminal: true },
  timed_out: { label: "Timed Out", color: "#f97316", icon: "⏰", terminal: true },
  building: { label: "Building", color: "#3b82f6", icon: "🔨", terminal: false },
  deploying: { label: "Deploying", color: "#8b5cf6", icon: "🚀", terminal: false },
  succeeded: { label: "Succeeded", color: "#10b981", icon: "✓", terminal: true },
  rolled_back: { label: "Rolled Back", color: "#f59e0b", icon: "↩️", terminal: true },
  idle: { label: "Idle", color: "#6b7280", icon: "○", terminal: false },
  error: { label: "Error", color: "#ef4444", icon: "✗", terminal: false },
  offline: { label: "Offline", color: "#9ca3af", icon: "⊘", terminal: false },
  maintenance: { label: "Maintenance", color: "#f59e0b", icon: "🔧", terminal: false },
};

// ─────────────────────────────────────────────────────────────
// Priority Levels
// ─────────────────────────────────────────────────────────────

export const Priorities = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type Priority = (typeof Priorities)[keyof typeof Priorities];

export const PriorityConfig: Record<Priority, PriorityMeta> = {
  critical: { label: "Critical", color: "#ef4444", weight: 4 },
  high: { label: "High", color: "#f97316", weight: 3 },
  medium: { label: "Medium", color: "#f59e0b", weight: 2 },
  low: { label: "Low", color: "#6b7280", weight: 1 },
};

export interface PriorityMeta {
  label: string;
  color: string;
  weight: number;
}

// ─────────────────────────────────────────────────────────────
// API Response Codes
// ─────────────────────────────────────────────────────────────

export const ErrorCodes = {
  // Auth errors
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  SESSION_EXPIRED: "session_expired",
  INVALID_CREDENTIALS: "invalid_credentials",

  // Resource errors
  NOT_FOUND: "not_found",
  ALREADY_EXISTS: "already_exists",
  CONFLICT: "conflict",

  // Validation errors
  VALIDATION_ERROR: "validation_error",
  INVALID_INPUT: "invalid_input",
  MISSING_REQUIRED_FIELD: "missing_required_field",

  // Rate limiting
  RATE_LIMITED: "rate_limited",
  QUOTA_EXCEEDED: "quota_exceeded",

  // Server errors
  INTERNAL_ERROR: "internal_error",
  SERVICE_UNAVAILABLE: "service_unavailable",
  TIMEOUT: "timeout",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
