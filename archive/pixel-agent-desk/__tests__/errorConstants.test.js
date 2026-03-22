const { ErrorCategory, ErrorSeverity } = require('../src/errorConstants');

describe('ErrorCategory', () => {
  test('should contain all expected categories', () => {
    const expected = ['FILE_IO', 'NETWORK', 'PARSE', 'PERMISSION', 'AGENT_LIFECYCLE', 'UI_RENDER', 'HOOK_SERVER', 'UNKNOWN'];
    for (const cat of expected) {
      expect(ErrorCategory[cat]).toBe(cat);
    }
  });

  test('should have string values matching keys', () => {
    for (const [key, value] of Object.entries(ErrorCategory)) {
      expect(key).toBe(value);
    }
  });

  test('should not be empty', () => {
    expect(Object.keys(ErrorCategory).length).toBeGreaterThan(0);
  });
});

describe('ErrorSeverity', () => {
  test('should contain all expected severity levels', () => {
    expect(ErrorSeverity.FATAL).toBe('fatal');
    expect(ErrorSeverity.ERROR).toBe('error');
    expect(ErrorSeverity.WARNING).toBe('warning');
    expect(ErrorSeverity.INFO).toBe('info');
  });

  test('should have exactly 4 levels', () => {
    expect(Object.keys(ErrorSeverity).length).toBe(4);
  });

  test('should have lowercase string values', () => {
    for (const value of Object.values(ErrorSeverity)) {
      expect(value).toBe(value.toLowerCase());
    }
  });
});
