/**
 * Config Loader
 * Utilities for loading and validating environment-based configuration
 */

import type { CoreConfig, LogLevel, ConfigValidationError } from "./types";
import type { BaseEnv } from "../services/types";

/**
 * Load core configuration from environment variables
 * @param prefix - Environment variable prefix (e.g., "BR_OS_API", "BR_OS_OPERATOR")
 * @returns CoreConfig object
 * @throws Error if required environment variables are missing or invalid
 */
export function loadCoreConfig(prefix: string): CoreConfig {
  const errors: ConfigValidationError[] = [];

  // Environment (defaults to "local")
  const envRaw = process.env[`${prefix}_ENV`] || "local";
  const env = validateEnv(envRaw);
  if (!env) {
    errors.push({
      field: `${prefix}_ENV`,
      message: `Invalid environment "${envRaw}". Must be one of: local, staging, prod`,
    });
  }

  // Service name (required)
  const serviceName = process.env[`${prefix}_SERVICE_NAME`];
  if (!serviceName) {
    errors.push({
      field: `${prefix}_SERVICE_NAME`,
      message: "Service name is required",
    });
  }

  // Log level (defaults to "info")
  const logLevelRaw = process.env[`${prefix}_LOG_LEVEL`] || "info";
  const logLevel = validateLogLevel(logLevelRaw);
  if (!logLevel) {
    errors.push({
      field: `${prefix}_LOG_LEVEL`,
      message: `Invalid log level "${logLevelRaw}". Must be one of: debug, info, warn, error`,
    });
  }

  // Optional fields
  const version = process.env[`${prefix}_VERSION`];
  const commit = process.env[`${prefix}_COMMIT`];

  // If there are validation errors, throw
  if (errors.length > 0) {
    const errorMessages = errors.map((e) => `${e.field}: ${e.message}`).join("\n");
    throw new Error(
      `Configuration validation failed:\n${errorMessages}\n\nPlease set the required environment variables.`
    );
  }

  return {
    env: env!,
    serviceName: serviceName!,
    logLevel: logLevel!,
    version,
    commit,
  };
}

/**
 * Validate environment value
 */
function validateEnv(value: string): BaseEnv | null {
  const validEnvs: BaseEnv[] = ["local", "staging", "prod"];
  return validEnvs.includes(value as BaseEnv) ? (value as BaseEnv) : null;
}

/**
 * Validate log level value
 */
function validateLogLevel(value: string): LogLevel | null {
  const validLevels: LogLevel[] = ["debug", "info", "warn", "error"];
  return validLevels.includes(value as LogLevel) ? (value as LogLevel) : null;
}

/**
 * Get a required environment variable or throw
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Please set this variable before starting the application.`
    );
  }
  return value;
}

/**
 * Get an optional environment variable with a default value
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
