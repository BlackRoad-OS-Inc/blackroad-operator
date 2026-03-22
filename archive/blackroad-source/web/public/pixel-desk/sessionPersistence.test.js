/**
 * sessionPersistence.js Tests
 * State save/restore, PID validation, Claude process verification
 */

const path = require('path');
const os = require('os');

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  renameSync: jest.fn(),
}));

jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
}));

const fs = require('fs');
const { execFileSync } = require('child_process');
const { savePersistedState, recoverExistingSessions } = require('../src/main/sessionPersistence');

describe('sessionPersistence', () => {
  let debugLog;
  let errorHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    debugLog = jest.fn();
    errorHandler = { capture: jest.fn() };
  });

  // ── savePersistedState ──

  describe('savePersistedState', () => {
    test('writes state.json with agents and pids', () => {
      const agentManager = {
        getAllAgents: jest.fn(() => [
          { id: 'agent-1', state: 'Working', displayName: 'app' },
          { id: 'agent-2', state: 'Done', displayName: 'lib' },
        ]),
      };
      const sessionPids = new Map([['agent-1', 12345], ['agent-2', 67890]]);

      fs.existsSync.mockReturnValue(true);

      savePersistedState({ agentManager, sessionPids });

      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      const [writePath, content] = fs.writeFileSync.mock.calls[0];
      expect(writePath).toContain('state.json.tmp');

      const parsed = JSON.parse(content);
      expect(parsed.agents).toHaveLength(2);
      expect(parsed.pids).toHaveLength(2);
      expect(parsed.pids[0]).toEqual(['agent-1', 12345]);

      // Atomic rename
      expect(fs.renameSync).toHaveBeenCalledTimes(1);
      const [tmpPath, finalPath] = fs.renameSync.mock.calls[0];
      expect(tmpPath).toContain('state.json.tmp');
      expect(finalPath).toContain('state.json');
      expect(finalPath).not.toContain('.tmp');
    });

    test('creates directory if not exists', () => {
      const agentManager = { getAllAgents: jest.fn(() => []) };
      const sessionPids = new Map();

      fs.existsSync.mockReturnValue(false);

      savePersistedState({ agentManager, sessionPids });

      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    test('does nothing when agentManager is null', () => {
      savePersistedState({ agentManager: null, sessionPids: new Map() });
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  // ── recoverExistingSessions ──

  describe('recoverExistingSessions', () => {
    let agentManager;
    let sessionPids;
    let firstPreToolUseDone;

    beforeEach(() => {
      agentManager = {
        getAllAgents: jest.fn(() => []),
        updateAgent: jest.fn(),
      };
      sessionPids = new Map();
      firstPreToolUseDone = new Map();
    });

    test('recovers agents with valid PIDs', () => {
      const savedState = {
        agents: [
          { id: 'agent-1', projectPath: '/p/app', displayName: 'app', state: 'Working', jsonlPath: '/tmp/a.jsonl' },
        ],
        pids: [['agent-1', process.pid]], // current process PID (always alive)
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(savedState));

      // isClaudeProcess check
      const origPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
      execFileSync.mockReturnValue('node.exe|C:\\node\\claude\\cli.js');

      recoverExistingSessions({ agentManager, sessionPids, firstPreToolUseDone, debugLog, errorHandler });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'agent-1',
          state: 'Working',
          displayName: 'app',
        }),
        'recover'
      );
      expect(sessionPids.has('agent-1')).toBe(true);
      expect(firstPreToolUseDone.has('agent-1')).toBe(true);

      // state.json should be reset after recovery (atomic: write .tmp then rename)
      const resetCall = fs.writeFileSync.mock.calls.find(c => c[0].includes('state.json'));
      expect(resetCall).toBeTruthy();
      expect(fs.renameSync).toHaveBeenCalled();

      Object.defineProperty(process, 'platform', { value: origPlatform, configurable: true });
    });

    test('skips agents without PID', () => {
      const savedState = {
        agents: [{ id: 'agent-no-pid', state: 'Working' }],
        pids: [],
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(savedState));

      recoverExistingSessions({ agentManager, sessionPids, firstPreToolUseDone, debugLog, errorHandler });

      expect(agentManager.updateAgent).not.toHaveBeenCalled();
      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('no pid'));
    });

    test('skips agents with dead PIDs', () => {
      const savedState = {
        agents: [{ id: 'agent-dead', state: 'Working' }],
        pids: [['agent-dead', 99999999]], // likely dead PID
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(savedState));

      // process.kill will throw for non-existent PID
      recoverExistingSessions({ agentManager, sessionPids, firstPreToolUseDone, debugLog, errorHandler });

      expect(agentManager.updateAgent).not.toHaveBeenCalled();
      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('pid gone'));
    });

    test('skips agents where PID is not a Claude process', () => {
      const savedState = {
        agents: [{ id: 'agent-wrong', state: 'Working' }],
        pids: [['agent-wrong', process.pid]],
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(savedState));

      // isClaudeProcess returns false (not a Claude process)
      execFileSync.mockReturnValue(''); // empty result → not Claude

      recoverExistingSessions({ agentManager, sessionPids, firstPreToolUseDone, debugLog, errorHandler });

      expect(agentManager.updateAgent).not.toHaveBeenCalled();
      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('not claude'));
    });

    test('handles missing state.json gracefully', () => {
      fs.existsSync.mockReturnValue(false);

      recoverExistingSessions({ agentManager, sessionPids, firstPreToolUseDone, debugLog, errorHandler });

      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('No persisted state'));
      expect(agentManager.updateAgent).not.toHaveBeenCalled();
    });

    test('handles corrupted state.json with error handler', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('not-json{{{');

      recoverExistingSessions({ agentManager, sessionPids, firstPreToolUseDone, debugLog, errorHandler });

      expect(errorHandler.capture).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ code: 'E009', category: 'FILE_IO' })
      );
    });

    test('does nothing when agentManager is null', () => {
      recoverExistingSessions({ agentManager: null, sessionPids, firstPreToolUseDone, debugLog, errorHandler });
      expect(fs.existsSync).not.toHaveBeenCalled();
    });

    test('resets state.json after successful recovery', () => {
      const savedState = { agents: [], pids: [] };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(savedState));

      recoverExistingSessions({ agentManager, sessionPids, firstPreToolUseDone, debugLog, errorHandler });

      // Atomic write: writes to .tmp first
      const resetCall = fs.writeFileSync.mock.calls.find(c => {
        if (!c[0].includes('state.json')) return false;
        const parsed = JSON.parse(c[1]);
        return parsed.agents.length === 0 && parsed.pids.length === 0;
      });
      expect(resetCall).toBeTruthy();

      // Then renames .tmp to final path
      expect(fs.renameSync).toHaveBeenCalled();
    });
  });
});
