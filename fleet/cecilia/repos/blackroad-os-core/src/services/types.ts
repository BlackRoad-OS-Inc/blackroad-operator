/**
 * Service Registry Types
 * Defines the core types for the BlackRoad OS service registry
 */

export type ServiceId =
  | "core"
  | "api"
  | "operator"
  | "web"
  | "prism-console"
  | "pack-education"
  | "pack-infra-devops"
  | "pack-finance"
  | "pack-legal";

export type ServiceKind =
  | "core"
  | "api"
  | "worker"
  | "web"
  | "console"
  | "pack"
  | "infra";

export type BaseEnv = "local" | "staging" | "prod";

export interface ServiceMetadata {
  id: ServiceId;
  name: string;
  description: string;
  kind: ServiceKind;
  default_env: BaseEnv;
  health_path: string;
  ready_path: string;
  version_path: string;
}

/**
 * Standard endpoint response types
 */

export interface HealthResponse {
  ok: boolean;
  service: string;
  timestamp: string; // ISO-8601
}

export interface ReadyResponse {
  ready: boolean;
  service: string;
  checks?: Record<string, boolean>;
}

export interface VersionResponse {
  service: string;
  version: string;
  commit: string;
  env: string;
}
