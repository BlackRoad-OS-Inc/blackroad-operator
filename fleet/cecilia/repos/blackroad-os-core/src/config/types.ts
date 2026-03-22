/**
 * Config Types
 * Shared configuration types for BlackRoad OS services
 */

import type { BaseEnv } from "../services/types";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface CoreConfig {
  env: BaseEnv;
  serviceName: string;
  logLevel: LogLevel;
  version?: string;
  commit?: string;
}

export interface ConfigValidationError {
  field: string;
  message: string;
}
