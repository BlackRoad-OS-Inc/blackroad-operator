/**
 * Retention policy configuration for event and trace stores
 */

export interface RetentionConfig {
  /**
   * Maximum number of events to keep in memory.
   * Older events are evicted when this limit is exceeded.
   * Set to 0 for unlimited.
   */
  maxEvents: number;

  /**
   * Maximum age of events in milliseconds.
   * Events older than this are pruned.
   * Set to 0 to disable age-based pruning.
   */
  maxAgeMs: number;

  /**
   * How often to run the pruning task (in milliseconds)
   */
  pruneIntervalMs: number;
}

export interface TraceRetentionConfig {
  /**
   * Maximum number of traces to keep in memory
   */
  maxTraces: number;

  /**
   * Maximum age of traces in milliseconds
   */
  maxAgeMs: number;

  /**
   * How often to run the pruning task (in milliseconds)
   */
  pruneIntervalMs: number;
}

function parseEnvInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function getEventRetentionConfig(): RetentionConfig {
  return {
    maxEvents: parseEnvInt("PRISM_EVENT_MAX_COUNT", 10000),
    maxAgeMs: parseEnvInt("PRISM_EVENT_MAX_AGE_MS", 3600000), // 1 hour default
    pruneIntervalMs: parseEnvInt("PRISM_EVENT_PRUNE_INTERVAL_MS", 60000), // 1 minute
  };
}

export function getTraceRetentionConfig(): TraceRetentionConfig {
  return {
    maxTraces: parseEnvInt("PRISM_TRACE_MAX_COUNT", 1000),
    maxAgeMs: parseEnvInt("PRISM_TRACE_MAX_AGE_MS", 3600000), // 1 hour default
    pruneIntervalMs: parseEnvInt("PRISM_TRACE_PRUNE_INTERVAL_MS", 60000), // 1 minute
  };
}
