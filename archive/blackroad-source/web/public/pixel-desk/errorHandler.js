/**
 * Central Error Handler
 * Captures, classifies, logs, and forwards all errors to the UI
 */
const { app } = require('electron');
const path = require('path');
const fs = require('fs');

const { ErrorSeverity, ErrorCategory } = require('./errorConstants');
const { getMessageByErrorCode } = require('./errorMessages');

class ErrorHandler {
  constructor() {
    this.mainWindow = null;
    this.logPath = path.join(app.getPath('userData'), 'logs');
    this.currentLogFile = null;
    this.errorCount = 0;
    this.deduplicationSet = new Set();
    this.setupLogDirectory();
  }

  setMainWindow(window) {
    this.mainWindow = window;
  }

  setupLogDirectory() {
    try {
      if (!fs.existsSync(this.logPath)) {
        fs.mkdirSync(this.logPath, { recursive: true });
      }
      this.rotateLogFile();
    } catch (e) {
      console.error('[ErrorHandler] Failed to setup log directory:', e);
    }
  }

  rotateLogFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentLogFile = path.join(this.logPath, `error-${timestamp}.log`);

    // Clean up old log files (max 5 files, 10MB limit)
    try {
      const files = fs.readdirSync(this.logPath)
        .filter(f => f.startsWith('error-') && f.endsWith('.log'))
        .map(f => ({
          name: f,
          path: path.join(this.logPath, f),
          time: fs.statSync(path.join(this.logPath, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      // Delete if more than 5 files
      if (files.length > 5) {
        files.slice(5).forEach(f => {
          try {
            fs.unlinkSync(f.path);
          } catch (e) { /* ignore */ }
        });
      }

      // Rotate if current file exceeds 10MB
      if (files.length > 0) {
        const newest = files[0];
        const stats = fs.statSync(newest.path);
        if (stats.size > 10 * 1024 * 1024) {
          // Create new file
          const newTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
          this.currentLogFile = path.join(this.logPath, `error-${newTimestamp}.log`);
        }
      }
    } catch (e) {
      console.error('[ErrorHandler] Failed to rotate logs:', e);
    }
  }

  /**
   * Capture and process an error (async logging)
   * @param {Error|object} error - Error object
   * @param {object} context - Additional context
   * @returns {object} Normalized error context
   */
  async capture(error, context = {}) {
    try {
      const errorContext = this.normalize(error, context);

      // Deduplication (same error code + message combination)
      const dedupKey = `${errorContext.code}:${errorContext.message}`;
      if (this.deduplicationSet.has(dedupKey)) {
        return errorContext; // Skip already-processed errors
      }
      this.deduplicationSet.add(dedupKey);

      // Remove from deduplication set after 5 seconds
      setTimeout(() => {
        this.deduplicationSet.delete(dedupKey);
      }, 5000);

      await this.logToFile(errorContext);

      // Send to renderer
      this.sendToRenderer(errorContext);

      // Increment counter
      this.errorCount++;

      return errorContext;
    } catch (e) {
      console.error('[ErrorHandler] Failed to capture error:', e);
      return this.normalize(error, context);
    }
  }

  /**
   * Normalize an error into a standard format.
   */
  normalize(error, context) {
    const errorCode = context.code || 'E000';
    const messageData = getMessageByErrorCode(errorCode);

    return {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      code: errorCode,
      name: error?.name || context.name || 'UnknownError',
      message: error?.message || context.message || messageData.short || 'Unknown error',
      userMessage: messageData.short || messageData.userMessage || 'Could not complete the operation',
      explanation: messageData.detail || messageData.explanation || '',
      severity: context.severity || ErrorSeverity.ERROR,
      category: context.category || ErrorCategory.UNKNOWN,
      stack: error?.stack || '',
      recovery: messageData.recovery || [],
      context: context
    };
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Write to log file (async)
   */
  async logToFile(errorContext) {
    if (!this.currentLogFile) return;

    try {
      const logEntry = {
        timestamp: errorContext.timestamp,
        id: errorContext.id,
        code: errorContext.code,
        severity: errorContext.severity,
        message: errorContext.message,
        stack: errorContext.stack,
        context: errorContext.context
      };

      const logLine = JSON.stringify(logEntry) + '\n';

      await fs.promises.appendFile(this.currentLogFile, logLine, 'utf8');
    } catch (e) {
      console.error('[ErrorHandler] Failed to write log:', e);
    }
  }

  /**
   * Send error to renderer process
   */
  sendToRenderer(errorContext) {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return;
    }

    try {
      this.mainWindow.webContents.send('error-occurred', errorContext);
    } catch (e) {
      console.error('[ErrorHandler] Failed to send to renderer:', e);
    }
  }

  /**
   * Reset error count
   */
  resetErrorCount() {
    this.errorCount = 0;
  }

  /**
   * Read recent log file contents
   */
  readRecentLogs(maxLines = 100) {
    if (!this.currentLogFile || !fs.existsSync(this.currentLogFile)) {
      return 'No log file found';
    }

    try {
      const content = fs.readFileSync(this.currentLogFile, 'utf8');
      const lines = content.trim().split('\n');
      const recentLines = lines.slice(-maxLines);

      return recentLines.map(line => {
        try {
          const parsed = JSON.parse(line);
          return `[${parsed.timestamp}] [${parsed.code}] ${parsed.message}`;
        } catch (e) {
          return line;
        }
      }).join('\n');
    } catch (e) {
      return `Failed to read logs: ${e.message}`;
    }
  }

  /**
   * Return current log file path
   */
  getLogFilePath() {
    return this.currentLogFile;
  }
}

// Singleton instance
const errorHandler = new ErrorHandler();

module.exports = errorHandler;
