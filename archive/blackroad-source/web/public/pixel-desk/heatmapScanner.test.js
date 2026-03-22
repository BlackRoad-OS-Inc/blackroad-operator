/**
 * HeatmapScanner Tests
 * JSONL scanning, daily aggregation, incremental scanning, persistence tests
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const HeatmapScanner = require('../src/heatmapScanner');

// Temporary directory for tests
let tmpDir;
let projectsDir;
let persistDir;

// Preserve originals for fs.existsSync, readFileSync, etc.
const originalHomedir = os.homedir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'heatmap-test-'));
  projectsDir = path.join(tmpDir, '.claude', 'projects', 'test-project');
  persistDir = path.join(tmpDir, '.pixel-agent-desk');
  fs.mkdirSync(projectsDir, { recursive: true });

  // Mock homedir to tmpDir
  os.homedir = () => tmpDir;
});

afterEach(() => {
  os.homedir = originalHomedir;
  // Clean up temporary directory
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/**
 * Helper to generate JSONL lines for testing
 */
function makeUserLine(timestamp, sessionId = 'sess-1') {
  return JSON.stringify({
    type: 'user',
    timestamp,
    sessionId,
    message: { role: 'user', content: 'hello' },
  });
}

function makeAssistantLine(timestamp, sessionId = 'sess-1', opts = {}) {
  const {
    model = 'claude-sonnet-4-6',
    inputTokens = 1000,
    outputTokens = 200,
    toolUseCount = 0,
  } = opts;

  const content = [];
  content.push({ type: 'text', text: 'response' });
  for (let i = 0; i < toolUseCount; i++) {
    content.push({ type: 'tool_use', id: `tool-${i}`, name: 'Bash', input: {} });
  }

  return JSON.stringify({
    type: 'assistant',
    timestamp,
    sessionId,
    message: {
      role: 'assistant',
      model,
      content,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cache_read_input_tokens: 0,
        cache_creation_input_tokens: 0,
      },
    },
  });
}

describe('HeatmapScanner', () => {
  test('constructor initializes empty state', () => {
    const scanner = new HeatmapScanner();
    const stats = scanner.getDailyStats();
    expect(stats.days).toEqual({});
    expect(stats.lastScan).toBe(0);
  });

  describe('scanAll', () => {
    test('scans JSONL files and aggregates daily stats', async () => {
      const lines = [
        makeUserLine('2026-03-05T10:00:00Z'),
        makeAssistantLine('2026-03-05T10:00:05Z', 'sess-1', { toolUseCount: 2 }),
        makeUserLine('2026-03-05T11:00:00Z', 'sess-2'),
        makeAssistantLine('2026-03-05T11:00:05Z', 'sess-2', { toolUseCount: 1 }),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();

      const stats = scanner.getDailyStats();
      const day = stats.days['2026-03-05'];

      expect(day).toBeDefined();
      expect(day.sessions).toBe(2);
      expect(day.userMessages).toBe(2);
      expect(day.assistantMessages).toBe(2);
      expect(day.toolUses).toBe(3);
      expect(day.inputTokens).toBe(2000);
      expect(day.outputTokens).toBe(400);
      expect(day.estimatedCost).toBeGreaterThan(0);
    });

    test('handles empty projects directory', async () => {
      const scanner = new HeatmapScanner();
      await scanner.scanAll();
      expect(Object.keys(scanner.getDailyStats().days)).toHaveLength(0);
    });

    test('handles non-existent projects directory', async () => {
      // Temporarily delete .claude directory
      fs.rmSync(path.join(tmpDir, '.claude'), { recursive: true, force: true });

      const scanner = new HeatmapScanner();
      await scanner.scanAll();
      expect(Object.keys(scanner.getDailyStats().days)).toHaveLength(0);
    });

    test('skips sidechain entries', async () => {
      const lines = [
        makeUserLine('2026-03-05T10:00:00Z'),
        JSON.stringify({
          type: 'user',
          timestamp: '2026-03-05T10:01:00Z',
          sessionId: 'sess-1',
          isSidechain: true,
          message: { role: 'user', content: 'compacted' },
        }),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();

      const day = scanner.getDailyStats().days['2026-03-05'];
      expect(day.userMessages).toBe(1);
    });

    test('aggregates across multiple dates', async () => {
      const lines = [
        makeUserLine('2026-03-04T10:00:00Z'),
        makeAssistantLine('2026-03-04T10:00:05Z'),
        makeUserLine('2026-03-05T10:00:00Z'),
        makeAssistantLine('2026-03-05T10:00:05Z'),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();

      const stats = scanner.getDailyStats();
      expect(stats.days['2026-03-04']).toBeDefined();
      expect(stats.days['2026-03-05']).toBeDefined();
      expect(stats.days['2026-03-04'].sessions).toBe(1);
      expect(stats.days['2026-03-05'].sessions).toBe(1);
    });
  });

  describe('incremental scan', () => {
    test('only reads new bytes on second scan', async () => {
      const lines1 = [
        makeUserLine('2026-03-05T10:00:00Z'),
        makeAssistantLine('2026-03-05T10:00:05Z', 'sess-1', { toolUseCount: 1 }),
      ].join('\n') + '\n';

      const filePath = path.join(projectsDir, 'transcript.jsonl');
      fs.writeFileSync(filePath, lines1);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();

      expect(scanner.getDailyStats().days['2026-03-05'].toolUses).toBe(1);

      // Append additional data to the file
      const lines2 = [
        makeAssistantLine('2026-03-05T12:00:00Z', 'sess-1', { toolUseCount: 3 }),
      ].join('\n') + '\n';
      fs.appendFileSync(filePath, lines2);

      await scanner.scanAll();

      // Existing + new tool uses should be summed
      expect(scanner.getDailyStats().days['2026-03-05'].toolUses).toBe(4);
    });

    test('skips file if unchanged', async () => {
      const lines = [
        makeUserLine('2026-03-05T10:00:00Z'),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();
      const firstScan = scanner.lastScan;

      // Re-scanning the same file should not change entry count
      await scanner.scanAll();
      expect(scanner.getDailyStats().days['2026-03-05'].userMessages).toBe(1);
    });
  });

  describe('getRange', () => {
    test('returns only days in range', async () => {
      const lines = [
        makeUserLine('2026-03-01T10:00:00Z'),
        makeUserLine('2026-03-03T10:00:00Z'),
        makeUserLine('2026-03-05T10:00:00Z'),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();

      const range = scanner.getRange('2026-03-02', '2026-03-04');
      expect(Object.keys(range)).toEqual(['2026-03-03']);
    });
  });

  describe('persistence', () => {
    test('saves and restores data', async () => {
      const lines = [
        makeUserLine('2026-03-05T10:00:00Z'),
        makeAssistantLine('2026-03-05T10:00:05Z', 'sess-1', { toolUseCount: 2 }),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner1 = new HeatmapScanner();
      await scanner1.scanAll();

      // Verify persistence
      const persistFile = path.join(tmpDir, '.pixel-agent-desk', 'heatmap.json');
      expect(fs.existsSync(persistFile)).toBe(true);

      // Restore with a new instance
      const scanner2 = new HeatmapScanner();
      const stats = scanner2.getDailyStats();
      expect(stats.days['2026-03-05']).toBeDefined();
      expect(stats.days['2026-03-05'].toolUses).toBe(2);
    });

    test('serialization excludes internal Set fields', async () => {
      const lines = [
        makeUserLine('2026-03-05T10:00:00Z'),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();

      const persistFile = path.join(tmpDir, '.pixel-agent-desk', 'heatmap.json');
      const data = JSON.parse(fs.readFileSync(persistFile, 'utf-8'));

      // _sessions and _projects Sets should be excluded from serialization
      expect(data.days['2026-03-05']._sessions).toBeUndefined();
      expect(data.days['2026-03-05']._projects).toBeUndefined();
    });
  });

  describe('cost calculation', () => {
    test('uses model-specific pricing', async () => {
      const lines = [
        makeAssistantLine('2026-03-05T10:00:00Z', 'sess-1', {
          model: 'claude-opus-4-6',
          inputTokens: 1000,
          outputTokens: 100,
        }),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();

      const day = scanner.getDailyStats().days['2026-03-05'];
      // opus-4-6: input=15/1M, output=75/1M
      // 1000 * 15/1M + 100 * 75/1M = 0.015 + 0.0075 = 0.0225
      expect(day.estimatedCost).toBeCloseTo(0.0225, 4);
    });
  });

  describe('byModel aggregation', () => {
    test('aggregates tokens and cost per model', async () => {
      const lines = [
        makeAssistantLine('2026-03-05T10:00:00Z', 'sess-1', {
          model: 'claude-sonnet-4-6',
          inputTokens: 1000,
          outputTokens: 200,
        }),
        makeAssistantLine('2026-03-05T11:00:00Z', 'sess-1', {
          model: 'claude-opus-4-6',
          inputTokens: 500,
          outputTokens: 100,
        }),
        makeAssistantLine('2026-03-05T12:00:00Z', 'sess-1', {
          model: 'claude-sonnet-4-6',
          inputTokens: 2000,
          outputTokens: 300,
        }),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();

      const day = scanner.getDailyStats().days['2026-03-05'];
      expect(day.byModel).toBeDefined();

      // Sonnet: 1000+2000 = 3000 input, 200+300 = 500 output
      expect(day.byModel['claude-sonnet-4-6'].inputTokens).toBe(3000);
      expect(day.byModel['claude-sonnet-4-6'].outputTokens).toBe(500);
      expect(day.byModel['claude-sonnet-4-6'].estimatedCost).toBeGreaterThan(0);

      // Opus: 500 input, 100 output
      expect(day.byModel['claude-opus-4-6'].inputTokens).toBe(500);
      expect(day.byModel['claude-opus-4-6'].outputTokens).toBe(100);
      expect(day.byModel['claude-opus-4-6'].estimatedCost).toBeGreaterThan(0);

      // Opus cost should be higher per-token than Sonnet
      const opusCostPerToken = day.byModel['claude-opus-4-6'].estimatedCost / 600;
      const sonnetCostPerToken = day.byModel['claude-sonnet-4-6'].estimatedCost / 3500;
      expect(opusCostPerToken).toBeGreaterThan(sonnetCostPerToken);
    });

    test('byModel persists through save/load', async () => {
      const lines = [
        makeAssistantLine('2026-03-05T10:00:00Z', 'sess-1', {
          model: 'claude-opus-4-6',
          inputTokens: 1000,
          outputTokens: 100,
        }),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner1 = new HeatmapScanner();
      await scanner1.scanAll();

      // Load from persistence
      const scanner2 = new HeatmapScanner();
      const day = scanner2.getDailyStats().days['2026-03-05'];
      expect(day.byModel['claude-opus-4-6']).toBeDefined();
      expect(day.byModel['claude-opus-4-6'].inputTokens).toBe(1000);
      expect(day.byModel['claude-opus-4-6'].outputTokens).toBe(100);
      expect(day.byModel['claude-opus-4-6'].estimatedCost).toBeGreaterThan(0);
    });

    test('backward compat: missing byModel defaults to empty object', () => {
      // Write a cache file without byModel
      fs.mkdirSync(persistDir, { recursive: true });
      const cacheData = {
        days: {
          '2026-03-05': {
            sessions: 1,
            userMessages: 1,
            assistantMessages: 1,
            toolUses: 0,
            inputTokens: 1000,
            outputTokens: 200,
            estimatedCost: 0.01,
            projects: [],
          },
        },
        lastScan: Date.now(),
        fileOffsets: {},
      };
      fs.writeFileSync(
        path.join(persistDir, 'heatmap.json'),
        JSON.stringify(cacheData),
        'utf-8'
      );

      const scanner = new HeatmapScanner();
      const day = scanner.getDailyStats().days['2026-03-05'];
      expect(day.byModel).toEqual({});
    });
  });

  describe('start and stop', () => {
    test('start and stop manage interval', () => {
      jest.useFakeTimers();
      const scanner = new HeatmapScanner();

      scanner.start(60_000);
      expect(scanner.scanInterval).not.toBeNull();

      scanner.stop();
      expect(scanner.scanInterval).toBeNull();

      jest.useRealTimers();
    });
  });

  describe('malformed data handling', () => {
    test('skips invalid JSON lines', async () => {
      const lines = [
        'not-valid-json',
        makeUserLine('2026-03-05T10:00:00Z'),
        '{broken',
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();

      expect(scanner.getDailyStats().days['2026-03-05'].userMessages).toBe(1);
    });

    test('skips entries without timestamp', async () => {
      const lines = [
        JSON.stringify({ type: 'user', message: { role: 'user', content: 'no ts' } }),
        makeUserLine('2026-03-05T10:00:00Z'),
      ].join('\n') + '\n';

      fs.writeFileSync(path.join(projectsDir, 'transcript.jsonl'), lines);

      const scanner = new HeatmapScanner();
      await scanner.scanAll();

      expect(scanner.getDailyStats().days['2026-03-05'].userMessages).toBe(1);
    });
  });
});
