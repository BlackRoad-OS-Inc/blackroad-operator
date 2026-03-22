/**
 * Error Constants
 * Error codes, categories, severity levels, and recovery action types
 */

// Error categories
const ErrorCategory = {
  FILE_IO: 'FILE_IO',
  NETWORK: 'NETWORK',
  PARSE: 'PARSE',
  PERMISSION: 'PERMISSION',
  AGENT_LIFECYCLE: 'AGENT_LIFECYCLE',
  UI_RENDER: 'UI_RENDER',
  HOOK_SERVER: 'HOOK_SERVER',
  UNKNOWN: 'UNKNOWN'
};

// Error severity levels
const ErrorSeverity = {
  FATAL: 'fatal',      // App cannot continue running
  ERROR: 'error',      // Feature is not working
  WARNING: 'warning',  // Feature has limited functionality
  INFO: 'info'         // Informational
};

module.exports = {
  ErrorCategory,
  ErrorSeverity
};
