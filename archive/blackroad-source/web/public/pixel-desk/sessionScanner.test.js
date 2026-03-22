/**
 * sessionScanner.js Tests
 * JSONL parsing, token aggregation, cost calculation, scan lifecycle
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

const SessionScanner = require('../src/sessionScanner');

// Helper: build JSONL content from entries
function buildJsonl(entries) {
  return entries.map(e => JSON.stringify(e)).join('\n');
}

describe('SessionScanner', () => {
  let scanner;
  let mockAgentManager;
  let debugLog;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAgentManager = {
      getAllAgents: jest.fn(() => []),
      getAgent: jest.fn(() => null),
      updateAgent: jest.fn(),
    };
    debugLog = jest.fn();
    scanner = new SessionScanner(mockAgentManager, debugLog);
  });

  // ── parseSessionFile ──

  describe('parseSessionFile', () => {
    test('parses assistant messages with token usage', () => {
      const jsonl = buildJsonl([
        { type: 'user', timestamp: '2026-03-07T10:00:00Z' },
        {
          type: 'assistant',
          timestamp: '2026-03-07T10:00:05Z',
          message: {
            model: 'claude-sonnet-4-6',
            usage: { input_tokens: 5000, output_tokens: 300 },
            content: [{ type: 'text', text: 'Hello' }],
          },
        },
        {
          type: 'assistant',
          timestamp: '2026-03-07T10:00:10Z',
          message: {
            model: 'claude-sonnet-4-6',
            usage: { input_tokens: 8000, output_tokens: 500 },
            content: [
              { type: 'text', text: 'Reading file' },
              { type: 'tool_use', name: 'Read' },
            ],
          },
        },
      ]);

      fs.readFileSync.mockReturnValue(jsonl);

      const stats = scanner.parseSessionFile('/tmp/session.jsonl');

      expect(stats.model).toBe('claude-sonnet-4-6');
      expect(stats.userMessages).toBe(1);
      expect(stats.assistantMessages).toBe(2);
      expect(stats.toolUses).toBe(1);
      expect(stats.inputTokens).toBe(13000); // 5000 + 8000
      expect(stats.outputTokens).toBe(800);  // 300 + 500
      expect(stats.estimatedCost).toBeGreaterThan(0);
      expect(stats.firstMessageAt).toBe('2026-03-07T10:00:00Z');
      expect(stats.lastMessageAt).toBe('2026-03-07T10:00:10Z');
    });

    test('handles cache tokens with discount/premium', () => {
      const jsonl = buildJsonl([
        {
          type: 'assistant',
          timestamp: '2026-03-07T10:00:00Z',
          message: {
            model: 'claude-sonnet-4-6',
            usage: {
              input_tokens: 1000,
              output_tokens: 200,
              cache_read_input_tokens: 5000,
              cache_creation_input_tokens: 2000,
            },
            content: [],
          },
        },
      ]);

      fs.readFileSync.mockReturnValue(jsonl);

      const stats = scanner.parseSessionFile('/tmp/session.jsonl');

      // inputTokens = 1000 + 5000 (cache read) + 2000 (cache creation) = 8000
      expect(stats.inputTokens).toBe(8000);
      expect(stats.estimatedCost).toBeGreaterThan(0);
    });

    test('skips sidechain entries', () => {
      const jsonl = buildJsonl([
        { type: 'user', timestamp: '2026-03-07T10:00:00Z' },
        { type: 'user', timestamp: '2026-03-07T10:00:01Z', isSidechain: true },
        { type: 'assistant', timestamp: '2026-03-07T10:00:02Z', isSidechain: true, message: { usage: { input_tokens: 999 }, content: [] } },
      ]);

      fs.readFileSync.mockReturnValue(jsonl);

      const stats = scanner.parseSessionFile('/tmp/session.jsonl');

      expect(stats.userMessages).toBe(1); // only non-sidechain
      expect(stats.inputTokens).toBe(0);  // sidechain assistant skipped
    });

    test('returns null for empty file', () => {
      fs.readFileSync.mockReturnValue('');
      expect(scanner.parseSessionFile('/tmp/empty.jsonl')).toBeNull();
    });

    test('returns null when file read fails', () => {
      fs.readFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
      expect(scanner.parseSessionFile('/tmp/missing.jsonl')).toBeNull();
    });

    test('skips malformed JSON lines gracefully', () => {
      const jsonl = 'not-json\n' + JSON.stringify({
        type: 'user', timestamp: '2026-03-07T10:00:00Z',
      });

      fs.readFileSync.mockReturnValue(jsonl);

      const stats = scanner.parseSessionFile('/tmp/bad.jsonl');

      expect(stats).not.toBeNull();
      expect(stats.userMessages).toBe(1);
    });

    test('resolves ~ in file path', () => {
      fs.readFileSync.mockReturnValue(JSON.stringify({ type: 'user', timestamp: 'T' }));

      scanner.parseSessionFile('~/.claude/session.jsonl');

      const expectedPath = path.join(os.homedir(), '.claude/session.jsonl');
      expect(fs.readFileSync).toHaveBeenCalledWith(expectedPath, 'utf-8');
    });

    test('uses DEFAULT_PRICING when model is unknown', () => {
      const jsonl = buildJsonl([
        {
          type: 'assistant',
          timestamp: 'T',
          message: {
            model: 'unknown-model-xyz',
            usage: { input_tokens: 10000, output_tokens: 1000 },
            content: [],
          },
        },
      ]);

      fs.readFileSync.mockReturnValue(jsonl);

      const stats = scanner.parseSessionFile('/tmp/session.jsonl');

      expect(stats.model).toBe('unknown-model-xyz');
      expect(stats.estimatedCost).toBeGreaterThan(0);
    });

    test('counts multiple tool_use blocks in single message', () => {
      const jsonl = buildJsonl([
        {
          type: 'assistant',
          timestamp: 'T',
          message: {
            usage: { input_tokens: 100, output_tokens: 50 },
            content: [
              { type: 'tool_use', name: 'Read' },
              { type: 'text', text: 'Reading...' },
              { type: 'tool_use', name: 'Write' },
              { type: 'tool_use', name: 'Bash' },
            ],
          },
        },
      ]);

      fs.readFileSync.mockReturnValue(jsonl);

      const stats = scanner.parseSessionFile('/tmp/session.jsonl');
      expect(stats.toolUses).toBe(3);
    });
  });

  // ── scanAll ──

  describe('scanAll', () => {
    test('updates agent when JSONL has more tokens than hook data', () => {
      mockAgentManager.getAllAgents.mockReturnValue([
        {
          id: 'agent-1',
          jsonlPath: '/tmp/session.jsonl',
          tokenUsage: { inputTokens: 100, outputTokens: 10, estimatedCost: 0.001 },
          model: 'claude-sonnet-4-6',
        },
      ]);

      const jsonl = buildJsonl([
        {
          type: 'assistant',
          message: {
            model: 'claude-sonnet-4-6',
            usage: { input_tokens: 5000, output_tokens: 500 },
            content: [],
          },
        },
      ]);
      fs.readFileSync.mockReturnValue(jsonl);

      scanner.scanAll();

      expect(mockAgentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenUsage: expect.objectContaining({
            inputTokens: 5000,
            outputTokens: 500,
          }),
        }),
        'scanner'
      );
    });

    test('does not update agent when hook data exceeds JSONL', () => {
      mockAgentManager.getAllAgents.mockReturnValue([
        {
          id: 'agent-1',
          jsonlPath: '/tmp/session.jsonl',
          tokenUsage: { inputTokens: 50000, outputTokens: 5000, estimatedCost: 1.0 },
        },
      ]);

      const jsonl = buildJsonl([
        {
          type: 'assistant',
          message: {
            usage: { input_tokens: 1000, output_tokens: 100 },
            content: [],
          },
        },
      ]);
      fs.readFileSync.mockReturnValue(jsonl);

      scanner.scanAll();

      expect(mockAgentManager.updateAgent).not.toHaveBeenCalled();
    });

    test('skips agents without jsonlPath', () => {
      mockAgentManager.getAllAgents.mockReturnValue([
        { id: 'agent-1', jsonlPath: null },
      ]);

      scanner.scanAll();

      expect(fs.readFileSync).not.toHaveBeenCalled();
    });

    test('handles errors in scan pipeline gracefully', () => {
      // parseSessionFile handles its own read errors, so we trigger an error
      // in the outer try block by making updateAgent throw
      mockAgentManager.getAllAgents.mockReturnValue([
        {
          id: 'agent-1',
          jsonlPath: '/tmp/session.jsonl',
          tokenUsage: { inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
        },
      ]);

      fs.readFileSync.mockReturnValue(buildJsonl([
        { type: 'assistant', message: { usage: { input_tokens: 100, output_tokens: 10 }, content: [] } },
      ]));

      mockAgentManager.updateAgent.mockImplementation(() => { throw new Error('updateAgent failed'); });

      expect(() => scanner.scanAll()).not.toThrow();
      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('Error scanning'));
    });

    test('does nothing when agentManager is null', () => {
      scanner.agentManager = null;
      scanner.scanAll();
      expect(mockAgentManager.getAllAgents).not.toHaveBeenCalled();
    });

    test('supplements model from JSONL when agent has no model', () => {
      mockAgentManager.getAllAgents.mockReturnValue([
        {
          id: 'agent-1',
          jsonlPath: '/tmp/session.jsonl',
          model: null,
          tokenUsage: { inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
        },
      ]);

      const jsonl = buildJsonl([
        {
          type: 'assistant',
          message: {
            model: 'claude-opus-4-6',
            usage: { input_tokens: 100, output_tokens: 10 },
            content: [],
          },
        },
      ]);
      fs.readFileSync.mockReturnValue(jsonl);

      scanner.scanAll();

      expect(mockAgentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'claude-opus-4-6' }),
        'scanner'
      );
    });
  });

  // ── start / stop ──

  describe('start and stop', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('start runs scanAll immediately and sets interval', () => {
      const scanSpy = jest.spyOn(scanner, 'scanAll');

      scanner.start(30000);

      expect(scanSpy).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(30000);
      expect(scanSpy).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(30000);
      expect(scanSpy).toHaveBeenCalledTimes(3);
    });

    test('stop clears interval', () => {
      scanner.start(10000);
      scanner.stop();

      const scanSpy = jest.spyOn(scanner, 'scanAll');
      jest.advanceTimersByTime(30000);
      expect(scanSpy).not.toHaveBeenCalled();
    });

    test('stop is safe when not started', () => {
      expect(() => scanner.stop()).not.toThrow();
    });
  });

  // ── getSessionStats / getAllStats ──

  describe('getSessionStats and getAllStats', () => {
    test('getSessionStats returns null for unknown agent', () => {
      expect(scanner.getSessionStats('unknown')).toBeNull();
    });

    test('getSessionStats returns cached result after scan', () => {
      mockAgentManager.getAllAgents.mockReturnValue([
        {
          id: 'agent-1',
          jsonlPath: '/tmp/session.jsonl',
          tokenUsage: { inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
        },
      ]);

      fs.readFileSync.mockReturnValue(buildJsonl([
        { type: 'user', timestamp: 'T1' },
        { type: 'assistant', message: { usage: { input_tokens: 100, output_tokens: 10 }, content: [] }, timestamp: 'T2' },
      ]));

      scanner.scanAll();

      const stats = scanner.getSessionStats('agent-1');
      expect(stats).not.toBeNull();
      expect(stats.userMessages).toBe(1);
      expect(stats.assistantMessages).toBe(1);
    });

    test('getAllStats returns object with all scanned agents', () => {
      mockAgentManager.getAllAgents.mockReturnValue([
        { id: 'a1', jsonlPath: '/tmp/a.jsonl', tokenUsage: { inputTokens: 0, outputTokens: 0, estimatedCost: 0 } },
        { id: 'a2', jsonlPath: '/tmp/b.jsonl', tokenUsage: { inputTokens: 0, outputTokens: 0, estimatedCost: 0 } },
      ]);

      fs.readFileSync.mockReturnValue(buildJsonl([
        { type: 'user', timestamp: 'T' },
      ]));

      scanner.scanAll();

      const all = scanner.getAllStats();
      expect(Object.keys(all)).toEqual(['a1', 'a2']);
    });
  });
});
