/**
 * User-Friendly Error Messages
 * Convert technical errors into user-friendly messages
 */

const ErrorMessages = {
  // File I/O errors
  'ENOENT': {
    userMessage: 'Could not find the file',
    explanation: 'The required file does not exist or the path may be incorrect',
    recovery: ['RESET', 'VIEW_LOGS']
  },
  'EACCES': {
    userMessage: 'Could not access the file',
    explanation: 'You may lack file permissions or another program may be using it',
    recovery: ['VIEW_LOGS', 'OPEN_DOCS']
  },
  'EEXIST': {
    userMessage: 'File already exists',
    explanation: 'A file with the same name already exists',
    recovery: ['SKIP', 'VIEW_LOGS']
  },

  // Parsing errors
  'SyntaxError': {
    userMessage: 'Invalid file format',
    explanation: 'The JSON format is invalid or the file may be corrupted',
    recovery: ['RESET', 'VIEW_LOGS']
  },
  'UnexpectedToken': {
    userMessage: 'Could not read file contents',
    explanation: 'The file encoding or format is invalid',
    recovery: ['RESET', 'VIEW_LOGS']
  },

  // Network errors
  'EADDRINUSE': {
    userMessage: 'Port is already in use',
    explanation: 'Another program is using the same port',
    recovery: ['RETRY', 'VIEW_LOGS']
  },
  'ETIMEDOUT': {
    userMessage: 'Connection timed out',
    explanation: 'The server response was too slow or please check your internet connection',
    recovery: ['RETRY', 'OPEN_DOCS']
  },
  'ECONNREFUSED': {
    userMessage: 'Connection refused',
    explanation: 'The server is not running or refused the connection',
    recovery: ['RETRY', 'VIEW_LOGS']
  },

  // Default
  'default': {
    userMessage: 'Could not complete the operation',
    explanation: 'An unexpected problem occurred',
    recovery: ['VIEW_LOGS', 'COPY_ERROR']
  }
};

// Error code messages
const ErrorCodeMessages = {
  'E001': {
    short: 'Could not find config file',
    detail: 'settings.json does not exist. Create a new one?',
    recovery: [
      { type: 'reset', label: 'Reset to defaults' },
      { type: 'view_logs', label: 'View logs' }
    ]
  },
  'E002': {
    short: 'Config file format error',
    detail: 'settings.json format is invalid. A backup is available',
    recovery: [
      { type: 'reset', label: 'Restore from backup' },
      { type: 'open_settings', label: 'Open settings folder' }
    ]
  },
  'E003': {
    short: 'Could not load avatar',
    detail: 'Avatar image file could not be found',
    recovery: [
      { type: 'retry', label: 'Retry' },
      { type: 'skip', label: 'Use default icon' }
    ]
  },
  'E004': {
    short: 'Port conflict',
    detail: 'The hook server port is already in use',
    recovery: [
      { type: 'retry', label: 'Try another port' },
      { type: 'view_logs', label: 'View logs' }
    ]
  },
  'E005': {
    short: 'Focus failed',
    detail: 'Could not find the agent window',
    recovery: [
      { type: 'retry', label: 'Retry' },
      { type: 'view_logs', label: 'View logs' }
    ]
  },
  'E006': {
    short: 'Hook server error',
    detail: 'A problem occurred with the HTTP server',
    recovery: [
      { type: 'retry', label: 'Restart' },
      { type: 'view_logs', label: 'View logs' }
    ]
  },
  'E007': {
    short: 'Log write failed',
    detail: 'Could not save the log file',
    recovery: [
      { type: 'skip', label: 'Continue' },
      { type: 'open_settings', label: 'Open settings folder' }
    ]
  },
  'E008': {
    short: 'Agent not found',
    detail: 'No agent exists with the given PID',
    recovery: [
      { type: 'skip', label: 'Dismiss' },
      { type: 'view_logs', label: 'View logs' }
    ]
  },
  'E009': {
    short: 'Failed to load agent list',
    detail: 'Could not retrieve running agents',
    recovery: [
      { type: 'retry', label: 'Retry' },
      { type: 'reset', label: 'Reset' }
    ]
  },
  'E010': {
    short: 'Hook data validation failed',
    detail: 'The data format received from Claude is invalid. Please check the schema.',
    recovery: [
      { type: 'skip', label: 'Defer notification' },
      { type: 'view_logs', label: 'View logs' }
    ]
  },
  'E000': {
    short: 'Unknown error',
    detail: 'An unexpected problem occurred. Please check the logs.',
    recovery: [
      { type: 'retry', label: 'Retry' },
      { type: 'view_logs', label: 'View logs' }
    ]
  }
};

/**
 * Look up message by error code
 */
function getMessageByErrorCode(errorCode) {
  return ErrorCodeMessages[errorCode] || ErrorCodeMessages['E000'];
}

/**
 * Look up message by error name
 */
function getMessageByErrorName(errorName) {
  return ErrorMessages[errorName] || ErrorMessages['default'];
}

module.exports = {
  ErrorMessages,
  ErrorCodeMessages,
  getMessageByErrorCode,
  getMessageByErrorName
};
