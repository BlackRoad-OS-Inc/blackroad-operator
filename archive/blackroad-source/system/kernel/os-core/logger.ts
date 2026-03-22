/**
 * Logger
 * Lightweight structured logging utilities for BlackRoad OS
 */

import type { LogLevel } from "../config/types";
import type { LogContext, LogEntry } from "./types";

/**
 * Create a logger instance with a base context
 */
export function createLogger(baseContext: Partial<LogContext>) {
  const log = (level: LogLevel, message: string, additionalContext?: Partial<LogContext>, error?: Error) => {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        service: baseContext.service || "unknown",
        env: baseContext.env || "local",
        ...baseContext,
        ...additionalContext,
      },
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    // Output to stdout/stderr as JSON
    const output = JSON.stringify(entry);
    if (level === "error") {
      console.error(output);
    } else {
      console.log(output);
    }
  };

  return {
    debug: (message: string, context?: Partial<LogContext>) => log("debug", message, context),
    info: (message: string, context?: Partial<LogContext>) => log("info", message, context),
    warn: (message: string, context?: Partial<LogContext>) => log("warn", message, context),
    error: (message: string, error?: Error, context?: Partial<LogContext>) => log("error", message, context, error),
  };
}

/**
 * Simple logging helpers (stateless, no base context)
 */
export function logDebug(message: string, context: LogContext): void {
  logMessage("debug", message, context);
}

export function logInfo(message: string, context: LogContext): void {
  logMessage("info", message, context);
}

export function logWarn(message: string, context: LogContext): void {
  logMessage("warn", message, context);
}

export function logError(message: string, context: LogContext, error?: Error): void {
  logMessage("error", message, context, error);
}

/**
 * Internal helper for logging messages
 */
function logMessage(level: LogLevel, message: string, context: LogContext, error?: Error): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    ...(error && {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    }),
  };

  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
  } else {
    console.log(output);
  }
}
