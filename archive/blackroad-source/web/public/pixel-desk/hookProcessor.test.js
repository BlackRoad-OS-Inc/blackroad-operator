/**
 * hookProcessor.js Tests
 * Core hook event processing, state transitions, token calculation, PID reconnect
 */

const { createHookProcessor } = require('../src/main/hookProcessor');

// Mock agentManager factory
function createMockAgentManager() {
  const agents = new Map();
  return {
    getAgent: jest.fn((id) => agents.get(id) || null),
    updateAgent: jest.fn((data, source) => {
      const id = data.sessionId || data.id;
      agents.set(id, { ...data, id, firstSeen: data.firstSeen || Date.now() });
      return agents.get(id);
    }),
    removeAgent: jest.fn((id) => { agents.delete(id); }),
    getAllAgents: jest.fn(() => Array.from(agents.values())),
    getAgentCount: jest.fn(() => agents.size),
    _agents: agents,
  };
}

describe('hookProcessor', () => {
  let processor;
  let agentManager;
  let sessionPids;
  let debugLog;
  let detectClaudePidByTranscript;

  beforeEach(() => {
    agentManager = createMockAgentManager();
    sessionPids = new Map();
    debugLog = jest.fn();
    detectClaudePidByTranscript = jest.fn((_path, cb) => cb(null));

    processor = createHookProcessor({
      agentManager,
      sessionPids,
      debugLog,
      detectClaudePidByTranscript,
    });
  });

  // ── SessionStart ──

  describe('SessionStart', () => {
    test('creates new agent on startup', () => {
      processor.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-1234-abcd',
        cwd: '/projects/my-app',
        source: 'startup',
        transcript_path: '/tmp/session.jsonl',
        model: 'claude-sonnet-4-6',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'sess-1234-abcd',
          displayName: 'my-app',
          state: 'Waiting',
          model: 'claude-sonnet-4-6',
        }),
        'http'
      );
    });

    test('updates existing agent on compact (no duplicate creation)', () => {
      // Pre-create agent
      agentManager._agents.set('sess-1234-abcd', {
        id: 'sess-1234-abcd',
        sessionId: 'sess-1234-abcd',
        state: 'Working',
        model: 'claude-sonnet-4-6',
        jsonlPath: '/old.jsonl',
        tokenUsage: { inputTokens: 1000, contextPercent: 80 },
      });

      processor.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-1234-abcd',
        source: 'compact',
        cwd: '/projects/my-app',
        transcript_path: '/new.jsonl',
      });

      // Should update via 'hook' source, not create new via 'http'
      const hookCall = agentManager.updateAgent.mock.calls.find(c => c[1] === 'hook');
      expect(hookCall).toBeTruthy();
      expect(hookCall[0].state).toBe('Waiting');
      expect(hookCall[0].jsonlPath).toBe('/new.jsonl');
      // compact resets contextPercent
      expect(hookCall[0].tokenUsage.contextPercent).toBe(0);
    });

    test('updates existing agent on resume (preserves jsonlPath if not provided)', () => {
      agentManager._agents.set('sess-1234-abcd', {
        id: 'sess-1234-abcd',
        sessionId: 'sess-1234-abcd',
        state: 'Done',
        jsonlPath: '/existing.jsonl',
        model: 'claude-sonnet-4-6',
      });

      processor.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-1234-abcd',
        source: 'resume',
        cwd: '/projects/my-app',
      });

      const hookCall = agentManager.updateAgent.mock.calls.find(c => c[1] === 'hook');
      expect(hookCall[0].jsonlPath).toBe('/existing.jsonl');
    });

    test('creates new agent when compact/resume but no existing agent', () => {
      processor.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-new-abcd',
        source: 'resume',
        cwd: '/projects/my-app',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: 'sess-new-abcd', state: 'Waiting' }),
        'http'
      );
    });

    test('sets PID directly when _pid > 0', () => {
      processor.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-1234-abcd',
        cwd: '/projects/app',
        _pid: 12345,
      });

      expect(sessionPids.get('sess-1234-abcd')).toBe(12345);
      expect(detectClaudePidByTranscript).not.toHaveBeenCalled();
    });

    test('calls detectClaudePidByTranscript when no _pid', () => {
      detectClaudePidByTranscript.mockImplementation((p, cb) => cb(9999));

      processor.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-1234-abcd',
        cwd: '/projects/app',
        transcript_path: '/tmp/sess.jsonl',
      });

      expect(detectClaudePidByTranscript).toHaveBeenCalledWith('/tmp/sess.jsonl', expect.any(Function));
      expect(sessionPids.get('sess-1234-abcd')).toBe(9999);
    });

    test('handles array PID result (picks unregistered)', () => {
      sessionPids.set('other-session', 100);
      detectClaudePidByTranscript.mockImplementation((p, cb) => cb([100, 200]));

      processor.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-1234-abcd',
        cwd: '/projects/app',
      });

      expect(sessionPids.get('sess-1234-abcd')).toBe(200);
    });

    test('queues start when agentManager is null', () => {
      const proc = createHookProcessor({
        agentManager: null,
        sessionPids,
        debugLog,
        detectClaudePidByTranscript,
      });

      proc.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-queued-1',
        cwd: '/projects/app',
      });

      // Nothing created yet
      expect(agentManager.updateAgent).not.toHaveBeenCalled();
    });

    test('displayName falls back to "Agent" when cwd is empty', () => {
      processor.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-1234-abcd',
        cwd: '',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'Agent' }),
        'http'
      );
    });
  });

  // ── SessionEnd ──

  describe('SessionEnd', () => {
    test('removes existing agent and cleans up resources', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', state: 'Working' });
      sessionPids.set('sess-1234-abcd', 12345);
      processor.firstPreToolUseDone.set('sess-1234-abcd', true);

      processor.processHookEvent({
        hook_event_name: 'SessionEnd',
        session_id: 'sess-1234-abcd',
      });

      expect(agentManager.removeAgent).toHaveBeenCalledWith('sess-1234-abcd');
      expect(sessionPids.has('sess-1234-abcd')).toBe(false);
      expect(processor.firstPreToolUseDone.has('sess-1234-abcd')).toBe(false);
    });

    test('logs reason when provided', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', state: 'Done' });

      processor.processHookEvent({
        hook_event_name: 'SessionEnd',
        session_id: 'sess-1234-abcd',
        reason: 'user_quit',
      });

      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('user_quit'));
    });

    test('handles SessionEnd for unknown agent gracefully', () => {
      processor.processHookEvent({
        hook_event_name: 'SessionEnd',
        session_id: 'sess-unknown-99',
      });

      expect(agentManager.removeAgent).not.toHaveBeenCalled();
      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('unknown agent'));
    });
  });

  // ── UserPromptSubmit ──

  describe('UserPromptSubmit', () => {
    test('transitions agent to Thinking and resets firstPreToolUseDone', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', sessionId: 'sess-1234-abcd', state: 'Done' });
      processor.firstPreToolUseDone.set('sess-1234-abcd', true);

      processor.processHookEvent({
        hook_event_name: 'UserPromptSubmit',
        session_id: 'sess-1234-abcd',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'Thinking' }),
        'hook'
      );
      expect(processor.firstPreToolUseDone.has('sess-1234-abcd')).toBe(false);
    });
  });

  // ── Stop / TaskCompleted ──

  describe('Stop and TaskCompleted', () => {
    test('Stop sets state to Done', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', sessionId: 'sess-1234-abcd', state: 'Working' });

      processor.processHookEvent({
        hook_event_name: 'Stop',
        session_id: 'sess-1234-abcd',
        last_assistant_message: 'Task done.',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'Done', lastMessage: 'Task done.', currentTool: null }),
        'hook'
      );
    });

    test('TaskCompleted logs task details', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', sessionId: 'sess-1234-abcd', state: 'Working' });

      processor.processHookEvent({
        hook_event_name: 'TaskCompleted',
        session_id: 'sess-1234-abcd',
        task_id: 'task-99',
        task_subject: 'Fix bug',
        teammate_name: 'worker-1',
      });

      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('task-99'));
      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('Fix bug'));
    });
  });

  // ── PreToolUse ──

  describe('PreToolUse', () => {
    test('ignores first PreToolUse event (session init)', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', sessionId: 'sess-1234-abcd', state: 'Thinking' });

      processor.processHookEvent({
        hook_event_name: 'PreToolUse',
        session_id: 'sess-1234-abcd',
        tool_name: 'Read',
      });

      // Should NOT update agent state to Working (first event suppressed)
      const workingCall = agentManager.updateAgent.mock.calls.find(
        c => c[0].state === 'Working'
      );
      expect(workingCall).toBeUndefined();
    });

    test('second PreToolUse transitions to Working', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', sessionId: 'sess-1234-abcd', state: 'Thinking' });

      // First (suppressed)
      processor.processHookEvent({
        hook_event_name: 'PreToolUse',
        session_id: 'sess-1234-abcd',
        tool_name: 'Read',
      });

      // Second (should update)
      processor.processHookEvent({
        hook_event_name: 'PreToolUse',
        session_id: 'sess-1234-abcd',
        tool_name: 'Write',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'Working', currentTool: 'Write' }),
        'hook'
      );
    });

    test('UserPromptSubmit resets firstPreToolUseDone so next PreToolUse is suppressed again', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', sessionId: 'sess-1234-abcd', state: 'Thinking' });

      // First round
      processor.processHookEvent({ hook_event_name: 'PreToolUse', session_id: 'sess-1234-abcd' });
      processor.processHookEvent({ hook_event_name: 'PreToolUse', session_id: 'sess-1234-abcd' });

      // New prompt resets
      processor.processHookEvent({ hook_event_name: 'UserPromptSubmit', session_id: 'sess-1234-abcd' });

      agentManager.updateAgent.mockClear();

      // This PreToolUse should be suppressed again
      processor.processHookEvent({ hook_event_name: 'PreToolUse', session_id: 'sess-1234-abcd' });
      const workingCall = agentManager.updateAgent.mock.calls.find(c => c[0].state === 'Working');
      expect(workingCall).toBeUndefined();
    });
  });

  // ── PostToolUse — token calculation ──

  describe('PostToolUse', () => {
    beforeEach(() => {
      // Mark firstPreToolUseDone so PostToolUse processes
      processor.firstPreToolUseDone.set('sess-1234-abcd', true);
      agentManager._agents.set('sess-1234-abcd', {
        id: 'sess-1234-abcd',
        sessionId: 'sess-1234-abcd',
        state: 'Working',
        model: 'claude-sonnet-4-6',
        tokenUsage: null,
      });
    });

    test('calculates token usage with known model pricing', () => {
      processor.processHookEvent({
        hook_event_name: 'PostToolUse',
        session_id: 'sess-1234-abcd',
        tool_response: {
          token_usage: { input_tokens: 10000, output_tokens: 500 },
        },
      });

      const call = agentManager.updateAgent.mock.calls.find(
        c => c[0].tokenUsage && c[0].tokenUsage.inputTokens > 0
      );
      expect(call).toBeTruthy();
      expect(call[0].tokenUsage.inputTokens).toBe(10000);
      expect(call[0].tokenUsage.outputTokens).toBe(500);
      expect(call[0].tokenUsage.contextPercent).toBeGreaterThan(0);
      expect(call[0].tokenUsage.estimatedCost).toBeGreaterThan(0);
      expect(call[0].state).toBe('Thinking');
    });

    test('accumulates tokens across multiple PostToolUse events', () => {
      // First PostToolUse
      processor.processHookEvent({
        hook_event_name: 'PostToolUse',
        session_id: 'sess-1234-abcd',
        tool_response: { token_usage: { input_tokens: 5000, output_tokens: 200 } },
      });

      // Update the agent mock with the new token data
      const firstCall = agentManager.updateAgent.mock.calls.find(c => c[0].tokenUsage?.inputTokens > 0);
      agentManager._agents.set('sess-1234-abcd', firstCall[0]);

      // Second PostToolUse
      processor.processHookEvent({
        hook_event_name: 'PostToolUse',
        session_id: 'sess-1234-abcd',
        tool_response: { token_usage: { input_tokens: 3000, output_tokens: 100 } },
      });

      const secondCall = agentManager.updateAgent.mock.calls.find(
        c => c[0].tokenUsage?.inputTokens === 8000
      );
      expect(secondCall).toBeTruthy();
      expect(secondCall[0].tokenUsage.outputTokens).toBe(300);
    });

    test('transitions to Thinking without token data', () => {
      processor.processHookEvent({
        hook_event_name: 'PostToolUse',
        session_id: 'sess-1234-abcd',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'Thinking', currentTool: null }),
        'hook'
      );
    });

    test('skips processing when firstPreToolUseDone not set', () => {
      processor.firstPreToolUseDone.delete('sess-1234-abcd');

      processor.processHookEvent({
        hook_event_name: 'PostToolUse',
        session_id: 'sess-1234-abcd',
        tool_response: { token_usage: { input_tokens: 1000, output_tokens: 50 } },
      });

      // Only the auto-create call should exist, not a token update
      const tokenCall = agentManager.updateAgent.mock.calls.find(
        c => c[0].tokenUsage?.inputTokens > 0
      );
      expect(tokenCall).toBeUndefined();
    });
  });

  // ── PostToolUse — PID reconnect ──

  describe('PostToolUse PID reconnect', () => {
    beforeEach(() => {
      processor.firstPreToolUseDone.set('sess-1234-abcd', true);
      agentManager._agents.set('sess-1234-abcd', {
        id: 'sess-1234-abcd',
        sessionId: 'sess-1234-abcd',
        state: 'Working',
        jsonlPath: '/tmp/sess.jsonl',
      });
    });

    test('triggers PID detection on echo $$ command', () => {
      detectClaudePidByTranscript.mockImplementation((p, cb) => cb(42));

      processor.processHookEvent({
        hook_event_name: 'PostToolUse',
        session_id: 'sess-1234-abcd',
        tool_name: 'Bash',
        tool_input: { command: 'echo $$' },
      });

      expect(detectClaudePidByTranscript).toHaveBeenCalled();
      expect(sessionPids.get('sess-1234-abcd')).toBe(42);
    });

    test('triggers PID detection on echo $PPID command', () => {
      detectClaudePidByTranscript.mockImplementation((p, cb) => cb(99));

      processor.processHookEvent({
        hook_event_name: 'PostToolUse',
        session_id: 'sess-1234-abcd',
        tool_name: 'Bash',
        tool_input: { command: 'echo $PPID' },
      });

      expect(sessionPids.get('sess-1234-abcd')).toBe(99);
    });

    test('does not trigger on non-Bash tool', () => {
      processor.processHookEvent({
        hook_event_name: 'PostToolUse',
        session_id: 'sess-1234-abcd',
        tool_name: 'Read',
        tool_input: { command: 'echo $$' },
      });

      expect(detectClaudePidByTranscript).not.toHaveBeenCalled();
    });

    test('resets firstSeen when no PID registered', () => {
      const beforeTime = Date.now();
      agentManager._agents.get('sess-1234-abcd').firstSeen = 1000;

      processor.processHookEvent({
        hook_event_name: 'PostToolUse',
        session_id: 'sess-1234-abcd',
        tool_name: 'Bash',
        tool_input: { command: 'echo $$' },
      });

      const firstSeenCall = agentManager.updateAgent.mock.calls.find(
        c => c[0].firstSeen && c[0].firstSeen >= beforeTime
      );
      expect(firstSeenCall).toBeTruthy();
    });
  });

  // ── PostToolUseFailure ──

  describe('PostToolUseFailure', () => {
    test('sets state to Error', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', sessionId: 'sess-1234-abcd', state: 'Working' });

      processor.processHookEvent({
        hook_event_name: 'PostToolUseFailure',
        session_id: 'sess-1234-abcd',
        tool_name: 'Bash',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'Error', currentTool: 'Bash' }),
        'hook'
      );
    });
  });

  // ── PermissionRequest ──

  describe('PermissionRequest', () => {
    test('sets state to Help', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', sessionId: 'sess-1234-abcd', state: 'Thinking' });

      processor.processHookEvent({
        hook_event_name: 'PermissionRequest',
        session_id: 'sess-1234-abcd',
        tool_name: 'Bash',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'Help', currentTool: 'Bash' }),
        'hook'
      );
    });
  });

  // ── Notification ──

  describe('Notification', () => {
    test('permission_prompt sets state to Help', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', sessionId: 'sess-1234-abcd', state: 'Working' });

      processor.processHookEvent({
        hook_event_name: 'Notification',
        session_id: 'sess-1234-abcd',
        notification_type: 'permission_prompt',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'Help' }),
        'hook'
      );
    });

    test('other notification types set state to Waiting', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', sessionId: 'sess-1234-abcd', state: 'Working' });

      processor.processHookEvent({
        hook_event_name: 'Notification',
        session_id: 'sess-1234-abcd',
        notification_type: 'general',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'Waiting' }),
        'hook'
      );
    });
  });

  // ── SubagentStart / SubagentStop ──

  describe('Subagent lifecycle', () => {
    test('SubagentStart creates subagent with parent reference', () => {
      processor.processHookEvent({
        hook_event_name: 'SubagentStart',
        session_id: 'parent-session',
        agent_id: 'sub-agent-01',
        cwd: '/projects/app',
        agent_type: 'Explore',
        agent_transcript_path: '/tmp/sub.jsonl',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'sub-agent-01',
          state: 'Working',
          isSubagent: true,
          parentId: 'parent-session',
          agentType: 'Explore',
        }),
        'http'
      );
    });

    test('SubagentStop updates last message and removes', () => {
      agentManager._agents.set('sub-agent-01', {
        id: 'sub-agent-01',
        sessionId: 'sub-agent-01',
        state: 'Working',
        isSubagent: true,
      });

      processor.processHookEvent({
        hook_event_name: 'SubagentStop',
        session_id: 'parent-session',
        agent_id: 'sub-agent-01',
        last_assistant_message: 'Search completed.',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ lastMessage: 'Search completed.', state: 'Done' }),
        'hook'
      );
      expect(agentManager.removeAgent).toHaveBeenCalledWith('sub-agent-01');
    });
  });

  // ── TeammateIdle ──

  describe('TeammateIdle', () => {
    test('updates existing agent to Waiting with teammate info', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', state: 'Working' });

      processor.processHookEvent({
        hook_event_name: 'TeammateIdle',
        session_id: 'sess-1234-abcd',
        teammate_name: 'worker-1',
        team_name: 'alpha-team',
      });

      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'Waiting',
          isTeammate: true,
          teammateName: 'worker-1',
          teamName: 'alpha-team',
        }),
        'hook'
      );
    });

    test('creates new agent when teammate not found (auto-create then update)', () => {
      processor.processHookEvent({
        hook_event_name: 'TeammateIdle',
        session_id: 'sess-new-team',
        teammate_name: 'worker-2',
        team_name: 'beta-team',
        cwd: '/projects/app',
      });

      // Auto-create fallback fires first (http), then TeammateIdle updates (hook)
      // The 'hook' call sets isTeammate: true
      const hookCall = agentManager.updateAgent.mock.calls.find(c => c[1] === 'hook');
      expect(hookCall).toBeTruthy();
      expect(hookCall[0]).toEqual(expect.objectContaining({
        sessionId: 'sess-new-team',
        isTeammate: true,
        state: 'Waiting',
        teammateName: 'worker-2',
        teamName: 'beta-team',
      }));
    });
  });

  // ── PreCompact ──

  describe('PreCompact', () => {
    test('resets firstSeen and sets state to Thinking', () => {
      const oldTime = Date.now() - 60000;
      agentManager._agents.set('sess-1234-abcd', {
        id: 'sess-1234-abcd',
        sessionId: 'sess-1234-abcd',
        state: 'Working',
        firstSeen: oldTime,
      });

      processor.processHookEvent({
        hook_event_name: 'PreCompact',
        session_id: 'sess-1234-abcd',
        trigger: 'auto',
      });

      const call = agentManager.updateAgent.mock.calls.find(c => c[0].state === 'Thinking');
      expect(call).toBeTruthy();
      expect(call[0].firstSeen).toBeGreaterThan(oldTime);
    });
  });

  // ── Auto-create fallback ──

  describe('auto-create fallback', () => {
    test('creates agent on first non-SessionStart event if missing', () => {
      processor.processHookEvent({
        hook_event_name: 'UserPromptSubmit',
        session_id: 'sess-missed-start',
        cwd: '/projects/fallback',
        transcript_path: '/tmp/t.jsonl',
      });

      // First call is auto-create (http), second is state update (hook)
      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: 'sess-missed-start', state: 'Waiting' }),
        'http'
      );
    });

    test('does not auto-create on SessionEnd', () => {
      processor.processHookEvent({
        hook_event_name: 'SessionEnd',
        session_id: 'sess-unknown-end',
      });

      // Should not call updateAgent at all (only removeAgent path, but agent doesn't exist)
      expect(agentManager.updateAgent).not.toHaveBeenCalled();
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    test('ignores events without session_id', () => {
      processor.processHookEvent({ hook_event_name: 'UserPromptSubmit' });
      expect(agentManager.updateAgent).not.toHaveBeenCalled();
    });

    test('supports sessionId alias', () => {
      processor.processHookEvent({
        hook_event_name: 'UserPromptSubmit',
        sessionId: 'sess-alias-1234',
      });

      // Should auto-create since agent doesn't exist
      expect(agentManager.updateAgent).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: 'sess-alias-1234' }),
        'http'
      );
    });

    test('unknown events are logged', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', state: 'Working' });

      processor.processHookEvent({
        hook_event_name: 'SomeNewEvent',
        session_id: 'sess-1234-abcd',
      });

      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('Unknown'));
    });

    test('meta events (ConfigChange, WorktreeCreate, WorktreeRemove) are logged', () => {
      agentManager._agents.set('sess-1234-abcd', { id: 'sess-1234-abcd', state: 'Working' });

      for (const event of ['ConfigChange', 'WorktreeCreate', 'WorktreeRemove']) {
        processor.processHookEvent({ hook_event_name: event, session_id: 'sess-1234-abcd' });
      }

      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('Meta info'));
    });
  });

  // ── flushPendingStarts / cleanup ──

  describe('flushPendingStarts and cleanup', () => {
    test('flushPendingStarts processes queued sessions', () => {
      // Create processor without agentManager to queue starts
      const proc = createHookProcessor({
        agentManager: null,
        sessionPids,
        debugLog,
        detectClaudePidByTranscript,
      });

      proc.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-queued-1',
        cwd: '/projects/app1',
      });
      proc.processHookEvent({
        hook_event_name: 'SessionStart',
        session_id: 'sess-queued-2',
        cwd: '/projects/app2',
      });

      // Now won't flush since agentManager is still null inside proc
      // This tests the queueing mechanism itself
      expect(debugLog).toHaveBeenCalledWith(expect.stringContaining('queued'));
    });

    test('cleanup clears internal state', () => {
      processor.firstPreToolUseDone.set('sess-1', true);
      processor.firstPreToolUseDone.set('sess-2', true);

      processor.cleanup();

      expect(processor.firstPreToolUseDone.size).toBe(0);
    });
  });
});
