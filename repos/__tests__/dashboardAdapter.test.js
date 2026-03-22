/**
 * dashboardAdapter.js Tests
 * State mapping, project extraction, agent type, timing, full adaptation
 */

const {
  adaptAgentToDashboard,
  mapPixelStateToDashboardState,
  extractProjectName,
  STATE_MAP,
  DEFAULT_STATE,
} = require('../src/dashboardAdapter');

describe('dashboardAdapter', () => {
  describe('mapPixelStateToDashboardState', () => {
    test.each(Object.entries(STATE_MAP))('maps %s → %s', (pixel, dash) => {
      expect(mapPixelStateToDashboardState(pixel)).toBe(dash);
    });

    test('returns default for unknown state', () => {
      expect(mapPixelStateToDashboardState('Offline')).toBe(DEFAULT_STATE);
      expect(mapPixelStateToDashboardState('')).toBe(DEFAULT_STATE);
      expect(mapPixelStateToDashboardState(undefined)).toBe(DEFAULT_STATE);
    });
  });

  describe('extractProjectName', () => {
    test('extracts basename from path', () => {
      expect(extractProjectName('/home/user/projects/my-app')).toBe('my-app');
    });

    test('returns Default for null/undefined/empty', () => {
      expect(extractProjectName(null)).toBe('Default');
      expect(extractProjectName(undefined)).toBe('Default');
      expect(extractProjectName('')).toBe('Default');
    });

    test('handles Windows paths', () => {
      expect(extractProjectName('C:\\Users\\dev\\projects\\my-app')).toBe('my-app');
    });
  });

  describe('adaptAgentToDashboard', () => {
    test('maps all fields correctly', () => {
      const pixelAgent = {
        id: 'sess-123',
        sessionId: 'sess-123',
        displayName: 'my-app',
        projectPath: '/projects/my-app',
        state: 'Working',
        model: 'claude-sonnet-4-6',
        tokenUsage: { inputTokens: 1000, outputTokens: 200, estimatedCost: 0.01 },
        currentTool: 'Read',
        lastMessage: 'Done reading.',
        avatarIndex: 2,
        isSubagent: false,
        isTeammate: false,
        parentId: null,
        permissionMode: 'default',
        teammateName: null,
        teamName: null,
        endReason: null,
        firstSeen: Date.now() - 5000,
      };

      const result = adaptAgentToDashboard(pixelAgent);

      expect(result.id).toBe('sess-123');
      expect(result.sessionId).toBe('sess-123');
      expect(result.name).toBe('my-app');
      expect(result.project).toBe('my-app');
      expect(result.status).toBe('working');
      expect(result.type).toBe('main');
      expect(result.model).toBe('claude-sonnet-4-6');
      expect(result.tokenUsage.inputTokens).toBe(1000);
      expect(result.currentTool).toBe('Read');
      expect(result.lastMessage).toBe('Done reading.');
      expect(result.avatarIndex).toBe(2);
      expect(result.metadata.isSubagent).toBe(false);
      expect(result.metadata.permissionMode).toBe('default');
      expect(result.metadata.source).toBe('pixel-agent-desk');
      expect(result.timing.elapsed).toBeGreaterThan(0);
      expect(result.timing.active).toBe(true);
    });

    test('identifies subagent type', () => {
      const result = adaptAgentToDashboard({
        sessionId: 's1', state: 'Working', isSubagent: true, isTeammate: false,
      });
      expect(result.type).toBe('subagent');
    });

    test('identifies teammate type', () => {
      const result = adaptAgentToDashboard({
        sessionId: 's1', state: 'Waiting', isSubagent: false, isTeammate: true,
        teammateName: 'worker-1', teamName: 'alpha',
      });
      expect(result.type).toBe('teammate');
      expect(result.metadata.teammateName).toBe('worker-1');
      expect(result.metadata.teamName).toBe('alpha');
    });

    test('uses defaults for missing optional fields', () => {
      const result = adaptAgentToDashboard({ sessionId: 's1', state: 'Waiting' });

      expect(result.name).toBe('Agent');
      expect(result.project).toBe('Default');
      expect(result.model).toBeNull();
      expect(result.currentTool).toBeNull();
      expect(result.lastMessage).toBeNull();
      expect(result.avatarIndex).toBeNull();
      expect(result.tokenUsage).toEqual({ inputTokens: 0, outputTokens: 0, estimatedCost: 0 });
      expect(result.metadata.parentId).toBeNull();
    });

    test('uses id over sessionId when both present', () => {
      const result = adaptAgentToDashboard({ id: 'id-1', sessionId: 'sess-1', state: 'Done' });
      expect(result.id).toBe('id-1');
    });

    test('timing.active is false for non-working states', () => {
      for (const state of ['Done', 'Waiting', 'Help', 'Error']) {
        const result = adaptAgentToDashboard({ sessionId: 's1', state });
        expect(result.timing.active).toBe(false);
      }
    });

    test('timing.active is true for Working and Thinking', () => {
      for (const state of ['Working', 'Thinking']) {
        const result = adaptAgentToDashboard({ sessionId: 's1', state, firstSeen: Date.now() - 1000 });
        expect(result.timing.active).toBe(true);
      }
    });

    test('timing.elapsed is 0 when no firstSeen', () => {
      const result = adaptAgentToDashboard({ sessionId: 's1', state: 'Waiting' });
      expect(result.timing.elapsed).toBe(0);
    });
  });
});
