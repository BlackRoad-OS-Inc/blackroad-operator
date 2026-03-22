/**
 * Logging Types
 * Shared logging types for BlackRoad OS services
 */

import type { LogLevel } from "../config/types";
import type { BaseEnv } from "../services/types";

export interface LogContext {
  service: string;
  env: BaseEnv;
  component?: string;
  module?: string;
  requestId?: string;
  jobId?: string;
  workflowId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
