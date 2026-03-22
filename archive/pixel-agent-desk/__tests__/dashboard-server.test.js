/**
 * dashboard-server.js Tests
 * Stats calculation, API routing, SSE/WebSocket, CORS, path traversal protection
 */

// Mock dependencies before requiring the module
jest.mock('fs', () => ({
  readFile: jest.fn(),
}));

jest.mock('http', () => {
  const EventEmitter = require('events');
  const mockServer = new EventEmitter();
  mockServer.listen = jest.fn((port, cb) => { if (cb) cb(); });
  mockServer.close = jest.fn((cb) => { if (cb) cb(); });
  return {
    createServer: jest.fn(() => mockServer),
    __mockServer: mockServer,
  };
});

jest.mock('../src/dashboardAdapter', () => ({
  adaptAgentToDashboard: jest.fn((agent) => ({
    id: agent.id || agent.sessionId,
    name: agent.displayName || 'Agent',
    status: agent.state ? agent.state.toLowerCase() : 'idle',
    type: agent.isSubagent ? 'subagent' : agent.isTeammate ? 'teammate' : 'main',
    tokenUsage: agent.tokenUsage || { inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
  })),
}));

const EventEmitter = require('events');
const http = require('http');

// Load module ONCE and capture request handler
const dashboardServer = require('../src/dashboard-server');
const handler = http.createServer.mock.calls[0][0];

// Helper: create mock request/response pair
function createMockReqRes(method, urlPath, headers = {}) {
  const reqEmitter = new EventEmitter();
  const req = Object.assign(reqEmitter, {
    method,
    url: urlPath,
    headers: { host: 'localhost:3000', ...headers },
  });

  const res = {
    writeHead: jest.fn(),
    setHeader: jest.fn(),
    end: jest.fn(),
    write: jest.fn(),
  };

  return { req, res };
}

// Helper: mock agent manager
function createMockAgentManager() {
  const emitter = new EventEmitter();
  const agents = [];
  return Object.assign(emitter, {
    getAllAgents: jest.fn(() => agents),
    getAgent: jest.fn((id) => agents.find(a => a.id === id) || null),
    getAgentCount: jest.fn(() => agents.length),
    _agents: agents,
  });
}

describe('dashboard-server', () => {
  // ── calculateStats ──

  describe('calculateStats', () => {
    test('returns empty stats when no agentManager', () => {
      // Reset agentManager by setting to null
      dashboardServer.setAgentManager(null);
      const stats = dashboardServer.calculateStats();
      expect(stats).toEqual({ total: 0, active: 0, completed: 0, byState: {} });
    });

    test('counts agents by state correctly', () => {
      const mgr = createMockAgentManager();
      mgr._agents.push(
        { id: '1', state: 'Working', projectPath: '/p/app', tokenUsage: null },
        { id: '2', state: 'Thinking', projectPath: '/p/app', tokenUsage: null },
        { id: '3', state: 'Done', projectPath: '/p/lib', tokenUsage: null },
        { id: '4', state: 'Waiting', projectPath: '/p/lib', tokenUsage: null },
        { id: '5', state: 'Help', projectPath: '/p/app', tokenUsage: null },
        { id: '6', state: 'Error', projectPath: '/p/app', tokenUsage: null },
      );

      dashboardServer.setAgentManager(mgr);
      const stats = dashboardServer.calculateStats();

      expect(stats.total).toBe(6);
      expect(stats.working).toBe(1);
      expect(stats.thinking).toBe(1);
      expect(stats.done).toBe(1);
      expect(stats.waiting).toBe(1);
      expect(stats.help).toBe(1);
      expect(stats.error).toBe(1);
      expect(stats.active).toBe(3); // Working + Thinking + Help
      expect(stats.completed).toBe(1); // Done
    });

    test('groups by project correctly', () => {
      const mgr = createMockAgentManager();
      mgr._agents.push(
        { id: '1', state: 'Working', projectPath: '/projects/alpha', tokenUsage: null },
        { id: '2', state: 'Done', projectPath: '/projects/alpha', tokenUsage: null },
        { id: '3', state: 'Thinking', projectPath: '/projects/beta', tokenUsage: null },
      );

      dashboardServer.setAgentManager(mgr);
      const stats = dashboardServer.calculateStats();

      expect(stats.byProject.alpha).toEqual({ total: 2, active: 1, completed: 1 });
      expect(stats.byProject.beta).toEqual({ total: 1, active: 1, completed: 0 });
    });

    test('uses "Default" for agents without projectPath', () => {
      const mgr = createMockAgentManager();
      mgr._agents.push(
        { id: '1', state: 'Working', projectPath: null, tokenUsage: null },
      );

      dashboardServer.setAgentManager(mgr);
      const stats = dashboardServer.calculateStats();

      expect(stats.byProject.Default).toEqual({ total: 1, active: 1, completed: 0 });
    });

    test('counts by agent type', () => {
      const mgr = createMockAgentManager();
      mgr._agents.push(
        { id: '1', state: 'Working', isSubagent: false, isTeammate: false, tokenUsage: null },
        { id: '2', state: 'Working', isSubagent: true, isTeammate: false, tokenUsage: null },
        { id: '3', state: 'Working', isSubagent: false, isTeammate: true, tokenUsage: null },
      );

      dashboardServer.setAgentManager(mgr);
      const stats = dashboardServer.calculateStats();

      expect(stats.byType).toEqual({ main: 1, subagent: 1, teammate: 1 });
    });

    test('aggregates token usage across agents', () => {
      const mgr = createMockAgentManager();
      mgr._agents.push(
        { id: '1', state: 'Working', tokenUsage: { inputTokens: 1000, outputTokens: 200, estimatedCost: 0.005 } },
        { id: '2', state: 'Done', tokenUsage: { inputTokens: 3000, outputTokens: 500, estimatedCost: 0.015 } },
        { id: '3', state: 'Waiting', tokenUsage: null },
      );

      dashboardServer.setAgentManager(mgr);
      const stats = dashboardServer.calculateStats();

      expect(stats.tokens.input).toBe(4000);
      expect(stats.tokens.output).toBe(700);
      expect(stats.tokens.total).toBe(4700);
      expect(stats.tokens.estimatedCost).toBe(0.02);
    });
  });

  // ── setAgentManager event wiring ──

  describe('setAgentManager', () => {
    test('registers event listeners on agent manager', () => {
      const mgr = createMockAgentManager();
      dashboardServer.setAgentManager(mgr);

      expect(mgr.listenerCount('agent-added')).toBe(1);
      expect(mgr.listenerCount('agent-updated')).toBe(1);
      expect(mgr.listenerCount('agent-removed')).toBe(1);
    });
  });

  // ── API routing ──

  describe('API endpoints', () => {
    let mgr;

    beforeEach(() => {
      mgr = createMockAgentManager();
      mgr._agents.push(
        { id: 'agent-1', sessionId: 'agent-1', state: 'Working', displayName: 'Test', projectPath: '/p/app', tokenUsage: null },
      );
      dashboardServer.setAgentManager(mgr);
      dashboardServer.setSessionScanner(null);
      dashboardServer.setHeatmapScanner(null);
    });

    test('GET /api/agents returns agent list', () => {
      const { req, res } = createMockReqRes('GET', '/api/agents');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      const body = JSON.parse(res.end.mock.calls[0][0]);
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe('agent-1');
    });

    test('GET /api/agents/:id returns single agent with sessionStats', () => {
      const mockScanner = {
        getSessionStats: jest.fn(() => ({ tokens: 999 })),
      };
      dashboardServer.setSessionScanner(mockScanner);

      const { req, res } = createMockReqRes('GET', '/api/agents/agent-1');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      const body = JSON.parse(res.end.mock.calls[0][0]);
      expect(body.sessionStats).toEqual({ tokens: 999 });
    });

    test('GET /api/agents/:id returns 404 for unknown agent', () => {
      const { req, res } = createMockReqRes('GET', '/api/agents/nonexistent');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json' });
    });

    test('GET /api/stats returns calculated stats', () => {
      const { req, res } = createMockReqRes('GET', '/api/stats');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      const body = JSON.parse(res.end.mock.calls[0][0]);
      expect(body.total).toBe(1);
    });

    test('GET /api/sessions returns scanner results', () => {
      const mockScanner = { getAllStats: jest.fn(() => ({ sess1: { tokens: 100 } })) };
      dashboardServer.setSessionScanner(mockScanner);

      const { req, res } = createMockReqRes('GET', '/api/sessions');
      handler(req, res);

      const body = JSON.parse(res.end.mock.calls[0][0]);
      expect(body.sess1).toEqual({ tokens: 100 });
    });

    test('GET /api/sessions returns {} when no scanner', () => {
      const { req, res } = createMockReqRes('GET', '/api/sessions');
      handler(req, res);

      const body = JSON.parse(res.end.mock.calls[0][0]);
      expect(body).toEqual({});
    });

    test('GET /api/health returns status', () => {
      const { req, res } = createMockReqRes('GET', '/api/health');
      handler(req, res);

      const body = JSON.parse(res.end.mock.calls[0][0]);
      expect(body.status).toBe('ok');
      expect(body.agents).toBe(1);
    });

    test('GET /api/heatmap returns 503 when no heatmap scanner', () => {
      const { req, res } = createMockReqRes('GET', '/api/heatmap');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(503, { 'Content-Type': 'application/json' });
    });

    test('GET /api/heatmap returns range data', () => {
      const mockHeatmap = {
        getRange: jest.fn(() => [{ date: '2026-03-01', count: 5 }]),
        lastScan: Date.now(),
      };
      dashboardServer.setHeatmapScanner(mockHeatmap);

      const { req, res } = createMockReqRes('GET', '/api/heatmap?days=30');
      handler(req, res);

      expect(mockHeatmap.getRange).toHaveBeenCalled();
      const body = JSON.parse(res.end.mock.calls[0][0]);
      expect(body.days).toHaveLength(1);
    });

    test('unknown API returns 404', () => {
      const { req, res } = createMockReqRes('GET', '/api/unknown');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json' });
    });

    test('GET /api/agents returns 503 when no agent manager', () => {
      dashboardServer.setAgentManager(null);

      const { req, res } = createMockReqRes('GET', '/api/agents');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(503, { 'Content-Type': 'application/json' });
    });
  });

  // ── CORS ──

  describe('CORS', () => {
    test('OPTIONS request returns 200 with CORS headers', () => {
      const mgr = createMockAgentManager();
      dashboardServer.setAgentManager(mgr);

      const { req, res } = createMockReqRes('OPTIONS', '/api/agents');
      handler(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      expect(res.writeHead).toHaveBeenCalledWith(200);
    });
  });

  // ── Static file serving ──

  describe('static file serving', () => {
    test('/ serves dashboard.html', () => {
      const fs = require('fs');
      fs.readFile.mockImplementation((_path, cb) => cb(null, Buffer.from('<html></html>')));

      const { req, res } = createMockReqRes('GET', '/');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/html; charset=utf-8' });
    });

    test('/ returns 500 when HTML file read fails', () => {
      const fs = require('fs');
      fs.readFile.mockImplementation((_path, cb) => cb(new Error('ENOENT')));

      const { req, res } = createMockReqRes('GET', '/');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(500, { 'Content-Type': 'text/plain' });
    });

    test('/public/* serves static files with correct MIME types', () => {
      const fs = require('fs');
      fs.readFile.mockImplementation((_path, cb) => cb(null, Buffer.from('data')));

      const { req, res } = createMockReqRes('GET', '/public/characters/agent.png');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Content-Type': 'image/png',
      }));
    });

    test('path traversal via ../ is prevented by URL normalization', () => {
      // URL class normalizes /public/../../etc/passwd → /etc/passwd
      // which doesn't start with /public/, so falls through to general 404
      const { req, res } = createMockReqRes('GET', '/public/../../etc/passwd');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
    });

    test('static file 404 when file not found', () => {
      const fs = require('fs');
      fs.readFile.mockImplementation((_path, cb) => cb(new Error('ENOENT')));

      const { req, res } = createMockReqRes('GET', '/public/nonexistent.js');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
    });

    test('unknown static path returns 404', () => {
      const { req, res } = createMockReqRes('GET', '/random/path');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
    });

    test('/ws path returns 426 for non-upgrade requests', () => {
      const { req, res } = createMockReqRes('GET', '/ws');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(426);
    });
  });

  // ── SSE ──

  describe('SSE event stream', () => {
    test('GET /api/events sets up SSE connection', () => {
      jest.useFakeTimers();
      const mgr = createMockAgentManager();
      dashboardServer.setAgentManager(mgr);

      const { req, res } = createMockReqRes('GET', '/api/events');
      handler(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Should have written connected event
      expect(res.write).toHaveBeenCalledWith(expect.stringContaining('event: connected'));

      // Keep-alive should fire after 15s
      jest.advanceTimersByTime(15000);
      expect(res.write).toHaveBeenCalledWith(': keepalive\n\n');

      // Cleanup on close
      req.emit('close');
      const writeCountAfterClose = res.write.mock.calls.length;
      jest.advanceTimersByTime(15000);
      expect(res.write.mock.calls.length).toBe(writeCountAfterClose);

      jest.useRealTimers();
    });
  });

  // ── broadcastSSE ──

  describe('broadcastSSE', () => {
    test('sends SSE formatted message to all clients', () => {
      jest.useFakeTimers();
      const mgr = createMockAgentManager();
      dashboardServer.setAgentManager(mgr);

      // Set up SSE client via handler
      const { req, res } = createMockReqRes('GET', '/api/events');
      handler(req, res);

      // Broadcast
      dashboardServer.broadcastSSE('agent.updated', { id: 'test' });

      const sseCalls = res.write.mock.calls.filter(c => c[0].includes('agent.updated'));
      expect(sseCalls).toHaveLength(1);
      expect(sseCalls[0][0]).toContain('event: agent.updated');
      expect(sseCalls[0][0]).toContain('"id":"test"');

      // Cleanup
      req.emit('close');
      jest.useRealTimers();
    });

    test('removes client on write error', () => {
      jest.useFakeTimers();
      const mgr = createMockAgentManager();
      dashboardServer.setAgentManager(mgr);

      const { req, res } = createMockReqRes('GET', '/api/events');
      handler(req, res);

      // Make write throw on broadcast
      res.write.mockImplementation((data) => {
        if (typeof data === 'string' && data.includes('agent.error')) throw new Error('broken pipe');
      });

      // Should not throw
      expect(() => dashboardServer.broadcastSSE('agent.error', {})).not.toThrow();

      req.emit('close');
      jest.useRealTimers();
    });
  });

  // ── broadcastUpdate (WebSocket) ──

  describe('broadcastUpdate', () => {
    test('does not throw when no WebSocket clients connected', () => {
      expect(() => dashboardServer.broadcastUpdate('test-event', { key: 'value' })).not.toThrow();
    });
  });

  // ── startServer ──

  describe('startServer', () => {
    test('starts listening on configured port', () => {
      const mockServer = http.__mockServer;
      mockServer.listen.mockClear();

      dashboardServer.startServer();

      expect(mockServer.listen).toHaveBeenCalledWith(dashboardServer.PORT, expect.any(Function));
    });

    test('PORT is 3000', () => {
      expect(dashboardServer.PORT).toBe(3000);
    });
  });

  // ── setters ──

  describe('setter functions', () => {
    test('setSessionScanner stores reference (verified via API)', () => {
      const scanner = { getSessionStats: jest.fn(), getAllStats: jest.fn(() => ({ test: 1 })) };
      const mgr = createMockAgentManager();
      dashboardServer.setAgentManager(mgr);
      dashboardServer.setSessionScanner(scanner);

      const { req, res } = createMockReqRes('GET', '/api/sessions');
      handler(req, res);

      expect(scanner.getAllStats).toHaveBeenCalled();
    });

    test('setHeatmapScanner stores reference (verified via API)', () => {
      const scanner = { getRange: jest.fn(() => []), lastScan: Date.now() };
      const mgr = createMockAgentManager();
      dashboardServer.setAgentManager(mgr);
      dashboardServer.setHeatmapScanner(scanner);

      const { req, res } = createMockReqRes('GET', '/api/heatmap');
      handler(req, res);

      expect(scanner.getRange).toHaveBeenCalled();
    });

    test('setDashboardWindow stores reference without error', () => {
      expect(() => dashboardServer.setDashboardWindow({ webContents: {} })).not.toThrow();
    });
  });

  // ── Agent manager events trigger broadcasts ──

  describe('agent manager event broadcasting', () => {
    test('agent-added emits SSE broadcast', () => {
      jest.useFakeTimers();
      const mgr = createMockAgentManager();
      dashboardServer.setAgentManager(mgr);

      const { req, res } = createMockReqRes('GET', '/api/events');
      handler(req, res);

      mgr.emit('agent-added', { id: 'new-1', sessionId: 'new-1', state: 'Waiting', displayName: 'Test' });

      const addedCalls = res.write.mock.calls.filter(c => c[0].includes('agent.created'));
      expect(addedCalls).toHaveLength(1);

      req.emit('close');
      jest.useRealTimers();
    });

    test('agent-updated emits SSE broadcast', () => {
      jest.useFakeTimers();
      const mgr = createMockAgentManager();
      dashboardServer.setAgentManager(mgr);

      const { req, res } = createMockReqRes('GET', '/api/events');
      handler(req, res);

      mgr.emit('agent-updated', { id: 'u-1', state: 'Working' });

      const updatedCalls = res.write.mock.calls.filter(c => c[0].includes('agent.updated'));
      expect(updatedCalls).toHaveLength(1);

      req.emit('close');
      jest.useRealTimers();
    });

    test('agent-removed emits SSE broadcast', () => {
      jest.useFakeTimers();
      const mgr = createMockAgentManager();
      dashboardServer.setAgentManager(mgr);

      const { req, res } = createMockReqRes('GET', '/api/events');
      handler(req, res);

      mgr.emit('agent-removed', { id: 'r-1', reason: 'session_end' });

      const removedCalls = res.write.mock.calls.filter(c => c[0].includes('agent.removed'));
      expect(removedCalls).toHaveLength(1);

      req.emit('close');
      jest.useRealTimers();
    });
  });
});
