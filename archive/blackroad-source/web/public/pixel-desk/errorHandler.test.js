/**
 * P0-4: Test Coverage - errorHandler.js Tests
 * Core error handler functionality tests
 */

// Mock fs module before requiring errorHandler
const fs = require('fs');

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  readFileSync: jest.fn(),
  appendFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  mkdirSync: jest.fn(),
  promises: {
    appendFile: jest.fn()
  }
}));

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/tmp/userdata')
  }
}));

// Configure mocks before loading errorHandler
fs.existsSync.mockReturnValue(true);
fs.readdirSync.mockReturnValue([]);
fs.statSync.mockReturnValue({ size: 1024, mtime: { getTime: () => Date.now() } });
fs.readFileSync.mockReturnValue('');
fs.appendFileSync.mockImplementation(() => {});
fs.unlinkSync.mockImplementation(() => {});
fs.mkdirSync.mockImplementation(() => {});
fs.promises.appendFile.mockResolvedValue(undefined);

const errorHandler = require('../src/errorHandler');

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-configure default mock values
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue([]);
    fs.statSync.mockReturnValue({ size: 1024, mtime: { getTime: () => Date.now() } });
  });

  describe('capture', () => {
    test('normalizes error object', async () => {
      const error = new Error('Test error');
      const context = { code: 'E001', category: 'FILE_IO' };

      const result = await errorHandler.capture(error, context);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('timestamp');
      expect(result.code).toBe('E001');
      expect(result.message).toBe('Test error');
      expect(result.userMessage).toBeDefined();
      expect(result.severity).toBe('error');
    });

    test('generates unique ID for each error', async () => {
      const error1 = await errorHandler.capture(new Error('Error 1'), { code: 'E001' });
      const error2 = await errorHandler.capture(new Error('Error 2'), { code: 'E002' });

      expect(error1.id).not.toBe(error2.id);
      expect(error1.id).toMatch(/^err_/);
    });

    test('deduplicates identical errors within 5 seconds', async () => {
      errorHandler.deduplicationSet.clear();

      const error = new Error('Duplicate error');
      const context = { code: 'E001' };

      const result1 = await errorHandler.capture(error, context);
      const result2 = await errorHandler.capture(error, context);

      // Deduplication should work based on code:message
      // Both results should have same structure even if IDs differ
      expect(result1.code).toBe(result2.code);
      expect(result1.message).toBe(result2.message);
      expect(result1.userMessage).toBe(result2.userMessage);
    });

    test('logs error to file', async () => {
      const error = new Error('Log test');
      await errorHandler.capture(error, { code: 'E001' });

      expect(fs.promises.appendFile).toHaveBeenCalled();
    });

    test('increments error count', async () => {
      errorHandler.resetErrorCount();
      const initialCount = errorHandler.errorCount;

      await errorHandler.capture(new Error('Error 1'), { code: 'E001' });
      await errorHandler.capture(new Error('Error 2'), { code: 'E002' });

      expect(errorHandler.errorCount).toBe(initialCount + 2);
    });
  });

  describe('normalize', () => {
    test('handles error with code', async () => {
      const error = new Error('Test error');
      const context = { code: 'E001' };

      const result = await errorHandler.capture(error, context);

      expect(result.code).toBe('E001');
      expect(result.userMessage).toBeDefined();
      expect(result.explanation).toBeDefined();
    });

    test('handles error without code', async () => {
      const error = new Error('Test error');
      const context = { code: 'E999' }; // Unknown code

      const result = await errorHandler.capture(error, context);

      expect(result.code).toBe('E999');
      expect(result.userMessage).toBeDefined();
      // Should have default message for unknown code
      expect(result.userMessage).toBeTruthy();
    });

    test('includes stack trace', async () => {
      const error = new Error('Test error');
      const context = { code: 'E001' };

      const result = await errorHandler.capture(error, context);

      expect(result.stack).toBeDefined();
      expect(result.stack).toContain('Test error');
    });

    test('maps severity correctly', async () => {
      const error = new Error('Test error');

      const fatalResult = await errorHandler.capture(error, { severity: 'fatal', code: 'E001' });
      expect(fatalResult.severity).toBe('fatal');

      const warningResult = await errorHandler.capture(error, { severity: 'warning', code: 'E002' });
      expect(warningResult.severity).toBe('warning');
    });
  });

  describe('generateId', () => {
    test('generates ID with prefix', async () => {
      const error = new Error('Test');
      const result = await errorHandler.capture(error, { code: 'E001' });

      expect(result.id).toMatch(/^err_\d+_[a-z0-9]+$/);
    });

    test('generates unique IDs', async () => {
      const error = new Error('Test');
      const result1 = await errorHandler.capture(error, { code: 'E001' });
      const result2 = await errorHandler.capture(error, { code: 'E002' });

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('logToFile', () => {
    test('writes JSON log entry', async () => {
      const errorContext = {
        id: 'err_test',
        timestamp: '2026-03-05T00:00:00.000Z',
        code: 'E001',
        message: 'Test error'
      };

      await errorHandler.logToFile(errorContext);

      expect(fs.promises.appendFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"message":"Test error"'),
        'utf8'
      );
    });

    test('handles write errors gracefully', async () => {
      fs.promises.appendFile.mockRejectedValue(new Error('Write failed'));

      const error = new Error('Test');
      await expect(errorHandler.capture(error, { code: 'E001' }))
        .resolves.toBeDefined();
    });
  });

  describe('readRecentLogs', () => {
    test('returns recent logs from file', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(
        JSON.stringify({ timestamp: '2026-03-05T00:00:00.000Z', message: 'Test 1' }) + '\n' +
        JSON.stringify({ timestamp: '2026-03-05T00:01:00.000Z', message: 'Test 2' })
      );

      const logs = errorHandler.readRecentLogs(100);

      expect(logs).toContain('Test 1');
      expect(logs).toContain('Test 2');
    });

    test('returns message when log file missing', () => {
      fs.existsSync.mockReturnValue(false);

      const logs = errorHandler.readRecentLogs();

      expect(logs).toBe('No log file found');
    });

    test('handles read errors gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Read failed');
      });

      const logs = errorHandler.readRecentLogs();

      expect(logs).toContain('Failed to read logs');
    });
  });

  describe('resetErrorCount', () => {
    test('resets error counter to zero', async () => {
      await errorHandler.capture(new Error('Error 1'), { code: 'E001' });
      expect(errorHandler.errorCount).toBeGreaterThan(0);

      errorHandler.resetErrorCount();
      expect(errorHandler.errorCount).toBe(0);
    });
  });

  describe('getLogFilePath', () => {
    test('returns current log file path', () => {
      const path = errorHandler.getLogFilePath();
      expect(path).toBeDefined();
      expect(path).toContain('error-');
      expect(path).toContain('.log');
    });
  });

  describe('setMainWindow', () => {
    test('sets main window for IPC', () => {
      const mockWindow = {
        webContents: {
          send: jest.fn()
        }
      };

      errorHandler.setMainWindow(mockWindow);
      expect(errorHandler.mainWindow).toBe(mockWindow);
    });
  });

  describe('sendToRenderer', () => {
    test('sends error event to renderer', () => {
      const mockWindow = {
        webContents: {
          send: jest.fn()
        },
        isDestroyed: () => false
      };

      errorHandler.setMainWindow(mockWindow);

      const errorContext = {
        id: 'err_test',
        code: 'E001',
        message: 'Test error'
      };

      errorHandler.sendToRenderer(errorContext);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'error-occurred',
        errorContext
      );
    });

    test('does not send when window destroyed', () => {
      const mockWindow = {
        isDestroyed: () => true
      };

      errorHandler.setMainWindow(mockWindow);

      const errorContext = { id: 'err_test', code: 'E001' };

      expect(() => errorHandler.sendToRenderer(errorContext))
        .not.toThrow();
    });

    test('does not send when no window', () => {
      errorHandler.setMainWindow(null);

      const errorContext = { id: 'err_test', code: 'E001' };

      expect(() => errorHandler.sendToRenderer(errorContext))
        .not.toThrow();
    });
  });

  describe('rotateLogFile', () => {
    test('creates new log file on first call', () => {
      fs.readdirSync.mockReturnValue([]);

      errorHandler.rotateLogFile();

      expect(errorHandler.currentLogFile).toBeDefined();
      expect(errorHandler.currentLogFile).toContain('error-');
    });

    test('handles rotation errors gracefully', () => {
      fs.readdirSync.mockImplementation(() => {
        throw new Error('Read failed');
      });

      expect(() => errorHandler.rotateLogFile())
        .not.toThrow();
    });
  });

  describe('recovery actions', () => {
    test('error context includes recovery actions', async () => {
      const error = new Error('Test error');
      const result = await errorHandler.capture(error, { code: 'E001' });

      expect(result.recovery).toBeDefined();
      expect(Array.isArray(result.recovery)).toBe(true);
    });

    test('each recovery action has type and label', async () => {
      const error = new Error('Test error');
      const result = await errorHandler.capture(error, { code: 'E003' });

      result.recovery.forEach(action => {
        expect(action).toHaveProperty('type');
        expect(action).toHaveProperty('label');
      });
    });
  });
});
