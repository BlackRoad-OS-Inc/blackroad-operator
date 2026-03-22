const {
  ErrorMessages,
  ErrorCodeMessages,
  getMessageByErrorCode,
  getMessageByErrorName,
} = require('../src/errorMessages');

describe('ErrorMessages', () => {
  test('should have required fields for every entry', () => {
    for (const [key, msg] of Object.entries(ErrorMessages)) {
      expect(msg).toHaveProperty('userMessage');
      expect(msg).toHaveProperty('explanation');
      expect(msg).toHaveProperty('recovery');
      expect(typeof msg.userMessage).toBe('string');
      expect(typeof msg.explanation).toBe('string');
      expect(Array.isArray(msg.recovery)).toBe(true);
      expect(msg.recovery.length).toBeGreaterThan(0);
    }
  });

  test('should have a default entry', () => {
    expect(ErrorMessages['default']).toBeDefined();
  });

  test('should contain known error names', () => {
    const expected = ['ENOENT', 'EACCES', 'EEXIST', 'SyntaxError', 'EADDRINUSE', 'ETIMEDOUT', 'ECONNREFUSED'];
    for (const name of expected) {
      expect(ErrorMessages[name]).toBeDefined();
    }
  });
});

describe('ErrorCodeMessages', () => {
  test('should have required fields for every entry', () => {
    for (const [code, msg] of Object.entries(ErrorCodeMessages)) {
      expect(msg).toHaveProperty('short');
      expect(msg).toHaveProperty('detail');
      expect(msg).toHaveProperty('recovery');
      expect(typeof msg.short).toBe('string');
      expect(typeof msg.detail).toBe('string');
      expect(Array.isArray(msg.recovery)).toBe(true);
      expect(msg.recovery.length).toBeGreaterThan(0);
      // Each recovery action should have type and label
      for (const action of msg.recovery) {
        expect(action).toHaveProperty('type');
        expect(action).toHaveProperty('label');
      }
    }
  });

  test('should contain codes E000 through E010', () => {
    const codes = ['E000', 'E001', 'E002', 'E003', 'E004', 'E005', 'E006', 'E007', 'E008', 'E009', 'E010'];
    for (const code of codes) {
      expect(ErrorCodeMessages[code]).toBeDefined();
    }
  });
});

describe('getMessageByErrorCode', () => {
  test('should return correct message for known code', () => {
    const msg = getMessageByErrorCode('E001');
    expect(msg.short).toBe('Could not find config file');
  });

  test('should return E000 fallback for unknown code', () => {
    const msg = getMessageByErrorCode('E999');
    expect(msg).toBe(ErrorCodeMessages['E000']);
  });

  test('should return E000 fallback for null input', () => {
    const msg = getMessageByErrorCode(null);
    expect(msg).toBe(ErrorCodeMessages['E000']);
  });

  test('should return E000 fallback for undefined input', () => {
    const msg = getMessageByErrorCode(undefined);
    expect(msg).toBe(ErrorCodeMessages['E000']);
  });
});

describe('getMessageByErrorName', () => {
  test('should return correct message for known name', () => {
    const msg = getMessageByErrorName('ENOENT');
    expect(msg.userMessage).toBe('Could not find the file');
  });

  test('should return default fallback for unknown name', () => {
    const msg = getMessageByErrorName('UNKNOWN_ERROR');
    expect(msg).toBe(ErrorMessages['default']);
  });

  test('should return default fallback for null input', () => {
    const msg = getMessageByErrorName(null);
    expect(msg).toBe(ErrorMessages['default']);
  });

  test('should return default fallback for undefined input', () => {
    const msg = getMessageByErrorName(undefined);
    expect(msg).toBe(ErrorMessages['default']);
  });
});
