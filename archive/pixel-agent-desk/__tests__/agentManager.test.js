/**
 * P0-4: Test Coverage - agentManager.js Tests
 * AgentManager core logic tests
 */

const AgentManager = require('../src/agentManager');
const EventEmitter = require('events');

describe('AgentManager', () => {
  let manager;

  beforeEach(() => {
    manager = new AgentManager();
    manager.start();
  });

  afterEach(() => {
    manager.stop();
  });

  describe('start and stop', () => {
    test('start runs without error', () => {
      // Agent cleanup is handled exclusively by main.js liveness checker (PID-based)
      expect(() => manager.start()).not.toThrow();
    });

    test('stop clears agents', () => {
      manager.updateAgent({ sessionId: 'test-1', state: 'Working' });
      expect(manager.getAgentCount()).toBe(1);

      manager.stop();
      expect(manager.getAgentCount()).toBe(0);
    });
  });

  describe('updateAgent', () => {
    test('adds new agent', () => {
      const entry = {
        sessionId: 'test-1',
        slug: 'test-agent',
        state: 'Working',
        projectPath: '/path/to/project'
      };

      const result = manager.updateAgent(entry);

      expect(result).not.toBeNull();
      expect(result.id).toBe('test-1');
      expect(result.state).toBe('Working');
      expect(result.displayName).toBe('Test Agent');
    });

    test('updates existing agent state', () => {
      jest.useFakeTimers();

      const entry1 = {
        sessionId: 'test-2',
        slug: 'agent-two',
        state: 'Working'
      };

      const entry2 = {
        sessionId: 'test-2',
        state: 'Done'
      };

      manager.updateAgent(entry1);

      jest.advanceTimersByTime(5000);

      manager.updateAgent(entry2);

      const agent = manager.getAgent('test-2');
      expect(agent.state).toBe('Done');
      expect(agent.lastDuration).toBe(5000);

      jest.useRealTimers();
    });

    test('emits agent-added event for new agent', (done) => {
      const mockCallback = (agent) => {
        expect(agent.id).toBe('test-3');
        expect(agent.state).toBe('Thinking');
        done();
      };

      manager.on('agent-added', mockCallback);

      const entry = {
        sessionId: 'test-3',
        slug: 'new-agent',
        state: 'Thinking'
      };

      manager.updateAgent(entry);
    });

    test('emits agent-updated event on state change', (done) => {
      const mockCallback = (agent) => {
        if (agent.state === 'Done') {
          expect(agent.id).toBe('test-4');
          expect(agent.state).toBe('Done');
          done();
        }
      };

      manager.on('agent-updated', mockCallback);

      const entry1 = { sessionId: 'test-4', state: 'Working' };
      const entry2 = { sessionId: 'test-4', state: 'Done' };

      manager.updateAgent(entry1);
      manager.updateAgent(entry2);
    });

    test('does not emit agent-updated when state unchanged', () => {
      const mockCallback = jest.fn();
      manager.on('agent-updated', mockCallback);

      const entry1 = { sessionId: 'test-5', state: 'Working' };
      const entry2 = { sessionId: 'test-5', state: 'Working' };

      manager.updateAgent(entry1);
      manager.updateAgent(entry2);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('tracks active duration correctly', () => {
      const entry1 = { sessionId: 'test-6', state: 'Working' };
      const entry2 = { sessionId: 'test-6', state: 'Done' };

      jest.useFakeTimers();
      manager.updateAgent(entry1);

      jest.advanceTimersByTime(5000);

      manager.updateAgent(entry2);

      const agent = manager.getAgent('test-6');
      expect(agent.lastDuration).toBe(5000);

      jest.useRealTimers();
    });

    test('soft limit warns but does not block agents', () => {
      manager.config.softLimitWarning = 2;
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      manager.updateAgent({ sessionId: 'agent-1', state: 'Working' });
      manager.updateAgent({ sessionId: 'agent-2', state: 'Working' });
      const result = manager.updateAgent({ sessionId: 'agent-3', state: 'Working' });

      // Soft limit: does not block registration, only logs a warning
      expect(result).not.toBeNull();
      expect(manager.getAgentCount()).toBe(3);
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('removeAgent', () => {
    test('removes existing agent', () => {
      manager.updateAgent({ sessionId: 'remove-1', state: 'Working' });
      expect(manager.getAgentCount()).toBe(1);

      const result = manager.removeAgent('remove-1');
      expect(result).toBe(true);
      expect(manager.getAgentCount()).toBe(0);
    });

    test('returns false for non-existent agent', () => {
      const result = manager.removeAgent('non-existent');
      expect(result).toBe(false);
    });

    test('emits agent-removed event', (done) => {
      manager.updateAgent({ sessionId: 'remove-2', state: 'Working' });

      manager.on('agent-removed', (data) => {
        expect(data.id).toBe('remove-2');
        done();
      });

      manager.removeAgent('remove-2');
    });
  });

  describe('getAgent', () => {
    test('returns agent by ID', () => {
      manager.updateAgent({ sessionId: 'get-1', state: 'Working' });
      const agent = manager.getAgent('get-1');
      expect(agent).toBeDefined();
      expect(agent.id).toBe('get-1');
    });

    test('returns null for non-existent agent', () => {
      const agent = manager.getAgent('non-existent');
      expect(agent).toBeNull();
    });
  });

  describe('getAllAgents', () => {
    test('returns all agents', () => {
      manager.updateAgent({ sessionId: 'all-1', state: 'Working' });
      manager.updateAgent({ sessionId: 'all-2', state: 'Done' });

      const agents = manager.getAllAgents();
      expect(agents).toHaveLength(2);
    });

    test('returns empty array when no agents', () => {
      const agents = manager.getAllAgents();
      expect(agents).toEqual([]);
    });
  });

  describe('getAgentWithEffectiveState', () => {
    test('returns agent with effective state for parent with working children', () => {
      const parentEntry = { sessionId: 'parent-1', state: 'Done' };
      const childEntry = {
        sessionId: 'child-1',
        state: 'Working',
        parentId: 'parent-1'
      };

      manager.updateAgent(parentEntry);
      manager.updateAgent(childEntry);

      const parentWithState = manager.getAgentWithEffectiveState('parent-1');
      expect(parentWithState.state).toBe('Working');
      expect(parentWithState.isAggregated).toBe(true);
    });

    test('returns original state when no working children', () => {
      const entry = { sessionId: 'parent-2', state: 'Done' };
      manager.updateAgent(entry);

      const agent = manager.getAgentWithEffectiveState('parent-2');
      expect(agent.state).toBe('Done');
      expect(agent.isAggregated).toBeUndefined();
    });
  });

  describe('formatDisplayName', () => {
    test('uses slug when available', () => {
      const agent = manager.updateAgent({
        sessionId: 'display-1',
        slug: 'test-agent-name',
        state: 'Working'
      });
      expect(agent.displayName).toBe('Test Agent Name');
    });

    test('uses projectPath basename when no slug', () => {
      const agent = manager.updateAgent({
        sessionId: 'display-2',
        projectPath: '/path/to/my-project',
        state: 'Working'
      });
      expect(agent.displayName).toBe('my-project');
    });

    test('returns "Agent" when neither slug nor projectPath', () => {
      const agent = manager.updateAgent({
        sessionId: 'display-3',
        state: 'Working'
      });
      expect(agent.displayName).toBe('Agent');
    });
  });

  describe('getAgentsByActivity', () => {
    test('sorts agents by last activity', () => {
      jest.useFakeTimers();

      manager.updateAgent({ sessionId: 'activity-1', state: 'Working' });
      jest.advanceTimersByTime(1000);
      manager.updateAgent({ sessionId: 'activity-2', state: 'Working' });
      jest.advanceTimersByTime(1000);
      manager.updateAgent({ sessionId: 'activity-3', state: 'Working' });

      const sorted = manager.getAgentsByActivity();

      expect(sorted[0].id).toBe('activity-3');
      expect(sorted[1].id).toBe('activity-2');
      expect(sorted[2].id).toBe('activity-1');

      jest.useRealTimers();
    });
  });

  describe('getStats', () => {
    test('returns correct state counts', () => {
      manager.updateAgent({ sessionId: 'stat-1', state: 'Working' });
      manager.updateAgent({ sessionId: 'stat-2', state: 'Working' });
      manager.updateAgent({ sessionId: 'stat-3', state: 'Done' });
      manager.updateAgent({ sessionId: 'stat-4', state: 'Thinking' });

      const stats = manager.getStats();

      expect(stats.total).toBe(4);
      expect(stats.byState.Working).toBe(2);
      expect(stats.byState.Done).toBe(1);
      expect(stats.byState.Thinking).toBe(1);
    });

    test('returns zero counts for empty states', () => {
      const stats = manager.getStats();

      expect(stats.total).toBe(0);
      expect(stats.byState.Working).toBe(0);
      expect(stats.byState.Done).toBe(0);
      expect(stats.byState.Thinking).toBe(0);
    });
  });
});
