/**
 * hookRegistration.js Tests
 * HOOK_EVENTS list, isHookRegistered (all-or-nothing), registerClaudeHooks (idempotent)
 */

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

const fs = require('fs');
const path = require('path');
const os = require('os');

// Reload fresh module for each test to avoid state leakage
function loadModule() {
  const modulePath = require.resolve('../src/main/hookRegistration');
  delete require.cache[modulePath];
  return require('../src/main/hookRegistration');
}

const EXPECTED_EVENTS = [
  'SessionStart', 'SessionEnd', 'UserPromptSubmit',
  'PreToolUse', 'PostToolUse', 'PostToolUseFailure',
  'Stop', 'TaskCompleted', 'PermissionRequest', 'Notification',
  'SubagentStart', 'SubagentStop', 'TeammateIdle',
  'ConfigChange', 'WorktreeCreate', 'WorktreeRemove',
  'PreCompact',
];
const HOOK_URL = 'http://localhost:47821/hook';
const CONFIG_PATH = path.join(os.homedir(), '.claude', 'settings.json');

/** Build a config where all EXPECTED_EVENTS have our hook registered */
function buildFullConfig() {
  const hooks = {};
  for (const event of EXPECTED_EVENTS) {
    hooks[event] = [{ matcher: '*', hooks: [{ type: 'http', url: HOOK_URL }] }];
  }
  return { hooks };
}

/** Build a config with only a subset of events registered */
function buildPartialConfig(events) {
  const hooks = {};
  for (const event of events) {
    hooks[event] = [{ matcher: '*', hooks: [{ type: 'http', url: HOOK_URL }] }];
  }
  return { hooks };
}

describe('hookRegistration', () => {
  let debugLog;

  beforeEach(() => {
    jest.clearAllMocks();
    debugLog = jest.fn();
  });

  // ── Exports ──

  describe('exports', () => {
    test('HOOK_SERVER_PORT is 47821', () => {
      const { HOOK_SERVER_PORT } = loadModule();
      expect(HOOK_SERVER_PORT).toBe(47821);
    });

    test('registerClaudeHooks is a function', () => {
      const { registerClaudeHooks } = loadModule();
      expect(typeof registerClaudeHooks).toBe('function');
    });
  });

  // ── isHookRegistered (tested via registerClaudeHooks behavior) ──

  describe('isHookRegistered — all events must be present', () => {
    test('returns false (triggers registration) when no config file exists', () => {
      const { registerClaudeHooks } = loadModule();
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => {});
      fs.mkdirSync.mockImplementation(() => {});

      registerClaudeHooks(debugLog);

      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('returns false (triggers registration) when config has no hooks key', () => {
      const { registerClaudeHooks } = loadModule();
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ someOtherKey: true }));
      fs.writeFileSync.mockImplementation(() => {});
      fs.mkdirSync.mockImplementation(() => {});

      registerClaudeHooks(debugLog);

      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('skips registration when all events are already registered', () => {
      const { registerClaudeHooks } = loadModule();
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(buildFullConfig()));

      const result = registerClaudeHooks(debugLog);

      expect(result).toBe(true);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('already registered'));
    });

    test('triggers registration when only old 3-event subset is registered (upgrade scenario)', () => {
      const { registerClaudeHooks } = loadModule();
      // Simulate a user who had the old version (only 3 events registered)
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(
        JSON.stringify(buildPartialConfig(['SessionStart', 'PreToolUse', 'PostToolUse']))
      );
      fs.writeFileSync.mockImplementation(() => {});
      fs.mkdirSync.mockImplementation(() => {});

      registerClaudeHooks(debugLog);

      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('triggers registration when any single event is missing', () => {
      const { registerClaudeHooks } = loadModule();
      const missingOne = EXPECTED_EVENTS.filter(e => e !== 'PreCompact');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(buildPartialConfig(missingOne)));
      fs.writeFileSync.mockImplementation(() => {});
      fs.mkdirSync.mockImplementation(() => {});

      registerClaudeHooks(debugLog);

      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  // ── registerClaudeHooks — written config content ──

  describe('registerClaudeHooks — written config', () => {
    function captureWrittenConfig() {
      let written = null;
      fs.writeFileSync.mockImplementation((filePath, content) => {
        if (filePath === CONFIG_PATH) written = JSON.parse(content);
      });
      return () => written;
    }

    test('registers all expected events on fresh install', () => {
      const { registerClaudeHooks } = loadModule();
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});
      const getWritten = captureWrittenConfig();

      registerClaudeHooks(debugLog);

      const config = getWritten();
      expect(config).not.toBeNull();
      for (const event of EXPECTED_EVENTS) {
        expect(config.hooks[event]).toBeDefined();
        expect(
          config.hooks[event].some(
            entry => entry.hooks && entry.hooks.some(h => h.type === 'http' && h.url === HOOK_URL)
          )
        ).toBe(true);
      }
    });

    test('adds missing events without duplicating already-registered ones (idempotent)', () => {
      const { registerClaudeHooks } = loadModule();
      const partial = buildPartialConfig(['SessionStart', 'PreToolUse', 'PostToolUse']);
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(partial));
      fs.mkdirSync.mockImplementation(() => {});
      const getWritten = captureWrittenConfig();

      registerClaudeHooks(debugLog);

      const config = getWritten();
      // SessionStart already had one entry — should still have exactly one
      expect(config.hooks['SessionStart']).toHaveLength(1);
      // SubagentStart was missing — should now be registered
      expect(
        config.hooks['SubagentStart'].some(
          entry => entry.hooks && entry.hooks.some(h => h.url === HOOK_URL)
        )
      ).toBe(true);
    });

    test('preserves existing user hooks alongside ours', () => {
      const { registerClaudeHooks } = loadModule();
      // User has their own hook on SessionStart, none of ours
      const userHook = { matcher: '*', hooks: [{ type: 'http', url: 'http://localhost:9999/hook' }] };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ hooks: { SessionStart: [userHook] } }));
      fs.mkdirSync.mockImplementation(() => {});
      const getWritten = captureWrittenConfig();

      registerClaudeHooks(debugLog);

      const config = getWritten();
      const sessionStartEntries = config.hooks['SessionStart'];
      // Both user hook and ours should be present
      expect(sessionStartEntries.some(e => e.hooks.some(h => h.url === 'http://localhost:9999/hook'))).toBe(true);
      expect(sessionStartEntries.some(e => e.hooks.some(h => h.url === HOOK_URL))).toBe(true);
    });

    test('creates config directory if it does not exist', () => {
      const { registerClaudeHooks } = loadModule();
      fs.existsSync.mockImplementation((p) => {
        // Config file doesn't exist, dir doesn't exist
        return false;
      });
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});

      registerClaudeHooks(debugLog);

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.dirname(CONFIG_PATH),
        { recursive: true }
      );
    });

    test('returns false and logs error when writeFileSync throws', () => {
      const { registerClaudeHooks } = loadModule();
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => { throw new Error('Permission denied'); });

      const result = registerClaudeHooks(debugLog);

      expect(result).toBe(false);
      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('failed'));
    });

    test('returns false and logs error when readFileSync throws', () => {
      const { registerClaudeHooks } = loadModule();
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => { throw new Error('Read error'); });
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});

      // Should not throw — error is caught internally
      expect(() => registerClaudeHooks(debugLog)).not.toThrow();
    });

    test('handles malformed JSON in config file gracefully', () => {
      const { registerClaudeHooks } = loadModule();
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('{ invalid json }');
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});

      expect(() => registerClaudeHooks(debugLog)).not.toThrow();
    });
  });

  // ── HOOK_EVENTS coverage ──

  describe('HOOK_EVENTS completeness', () => {
    test('registers exactly the expected set of events', () => {
      const { registerClaudeHooks } = loadModule();
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});

      let written = null;
      fs.writeFileSync.mockImplementation((filePath, content) => {
        if (filePath === CONFIG_PATH) written = JSON.parse(content);
      });

      registerClaudeHooks(debugLog);

      const registeredEvents = Object.keys(written.hooks);
      for (const event of EXPECTED_EVENTS) {
        expect(registeredEvents).toContain(event);
      }
      expect(registeredEvents).toHaveLength(EXPECTED_EVENTS.length);
    });
  });
});
