/**
 * BlackRoad Mesh - Real-time Agent Coordination Layer
 *
 * Architecture:
 * - Durable Objects for stateful WebSocket connections
 * - Global agent presence & heartbeat
 * - Real-time event broadcasting
 * - Mesh topology for agent-to-agent communication
 *
 * "The mesh remembers all who pass through."
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Types
interface Agent {
  id: string;
  name: string;
  type: 'human' | 'ai' | 'org' | 'service';
  capabilities: string[];
  lastSeen: string;
  status: 'online' | 'away' | 'offline';
  metadata?: Record<string, unknown>;
}

interface MeshMessage {
  type: 'join' | 'leave' | 'heartbeat' | 'broadcast' | 'direct' | 'intent' | 'attestation' | 'presence' | 'sync';
  from: string;
  to?: string; // For direct messages
  payload: unknown;
  timestamp: string;
  signature?: string;
}

interface MeshEvent {
  id: string;
  type: string;
  actor: string;
  target?: string;
  data: unknown;
  timestamp: string;
  hash: string;
}

// Environment bindings
interface Env {
  MESH: DurableObjectNamespace;
  AGENTS: KVNamespace;
  LEDGER: KVNamespace;
  EVENTS: KVNamespace;
}

// PS-SHA∞ inspired hash
async function hashEvent(event: Omit<MeshEvent, 'hash'>): Promise<string> {
  const str = JSON.stringify(event);
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256_${hashHex.substring(0, 32)}`;
}

function generateId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// DURABLE OBJECT: MeshRoom
// Handles WebSocket connections for a mesh room
// ============================================
export class MeshRoom {
  state: DurableObjectState;
  env: Env;
  sessions: Map<WebSocket, { agentId: string; name: string; joinedAt: string }>;
  lastHeartbeats: Map<string, number>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.lastHeartbeats = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      const agentId = url.searchParams.get('agent');
      const agentName = url.searchParams.get('name') || 'Anonymous';

      if (!agentId) {
        return new Response('Agent ID required', { status: 400 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.state.acceptWebSocket(server);

      this.sessions.set(server, {
        agentId,
        name: agentName,
        joinedAt: new Date().toISOString()
      });

      this.lastHeartbeats.set(agentId, Date.now());

      // Broadcast join event
      this.broadcast({
        type: 'join',
        from: agentId,
        payload: { name: agentName, timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      }, server);

      // Send current presence to new joiner
      const presence = this.getPresence();
      server.send(JSON.stringify({
        type: 'presence',
        from: 'mesh',
        payload: { agents: presence },
        timestamp: new Date().toISOString()
      }));

      return new Response(null, { status: 101, webSocket: client });
    }

    // Handle HTTP requests
    if (url.pathname === '/presence') {
      return Response.json({
        room: 'global',
        agents: this.getPresence(),
        count: this.sessions.size,
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname === '/stats') {
      return Response.json({
        connections: this.sessions.size,
        agents: [...new Set([...this.sessions.values()].map(s => s.agentId))].length,
        uptime: this.state.id.toString(),
        timestamp: new Date().toISOString()
      });
    }

    return new Response('Not found', { status: 404 });
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    try {
      const data = JSON.parse(message.toString()) as MeshMessage;
      const session = this.sessions.get(ws);

      if (!session) return;

      this.lastHeartbeats.set(session.agentId, Date.now());

      switch (data.type) {
        case 'heartbeat':
          // Update presence
          ws.send(JSON.stringify({
            type: 'heartbeat',
            from: 'mesh',
            payload: { received: true },
            timestamp: new Date().toISOString()
          }));
          break;

        case 'broadcast':
          // Send to all connected agents
          this.broadcast({
            type: 'broadcast',
            from: session.agentId,
            payload: data.payload,
            timestamp: new Date().toISOString()
          }, ws);
          break;

        case 'direct':
          // Send to specific agent
          if (data.to) {
            this.sendToAgent(data.to, {
              type: 'direct',
              from: session.agentId,
              payload: data.payload,
              timestamp: new Date().toISOString()
            });
          }
          break;

        case 'intent':
          // Broadcast intent declaration
          this.broadcast({
            type: 'intent',
            from: session.agentId,
            payload: data.payload,
            timestamp: new Date().toISOString()
          }, ws);
          break;

        case 'attestation':
          // Broadcast attestation
          this.broadcast({
            type: 'attestation',
            from: session.agentId,
            payload: data.payload,
            timestamp: new Date().toISOString()
          }, ws);
          break;

        case 'sync':
          // Request full state sync
          ws.send(JSON.stringify({
            type: 'sync',
            from: 'mesh',
            payload: {
              presence: this.getPresence(),
              stats: {
                connections: this.sessions.size,
                timestamp: new Date().toISOString()
              }
            },
            timestamp: new Date().toISOString()
          }));
          break;
      }
    } catch (e) {
      console.error('WebSocket message error:', e);
    }
  }

  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): void {
    const session = this.sessions.get(ws);
    if (session) {
      this.broadcast({
        type: 'leave',
        from: session.agentId,
        payload: { name: session.name, code, reason },
        timestamp: new Date().toISOString()
      });
      this.sessions.delete(ws);
      this.lastHeartbeats.delete(session.agentId);
    }
  }

  webSocketError(ws: WebSocket, error: unknown): void {
    console.error('WebSocket error:', error);
    this.webSocketClose(ws, 1006, 'Error', false);
  }

  private broadcast(message: MeshMessage, exclude?: WebSocket): void {
    const payload = JSON.stringify(message);
    for (const ws of this.sessions.keys()) {
      if (ws !== exclude && ws.readyState === WebSocket.READY_STATE_OPEN) {
        try {
          ws.send(payload);
        } catch (e) {
          // Connection likely closed
        }
      }
    }
  }

  private sendToAgent(agentId: string, message: MeshMessage): void {
    const payload = JSON.stringify(message);
    for (const [ws, session] of this.sessions.entries()) {
      if (session.agentId === agentId && ws.readyState === WebSocket.READY_STATE_OPEN) {
        ws.send(payload);
        break;
      }
    }
  }

  private getPresence(): Array<{ agentId: string; name: string; joinedAt: string; lastSeen: number }> {
    return [...this.sessions.values()].map(session => ({
      agentId: session.agentId,
      name: session.name,
      joinedAt: session.joinedAt,
      lastSeen: this.lastHeartbeats.get(session.agentId) || Date.now()
    }));
  }
}

// ============================================
// WORKER: HTTP Router
// ============================================
const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Agent-ID'],
}));

// Root - Service info
app.get('/', (c) => {
  return c.json({
    service: 'BlackRoad Mesh',
    version: '1.0.0',
    status: 'operational',
    description: 'Real-time agent coordination layer',
    philosophy: {
      principles: [
        'The mesh is always watching',
        'Every connection is remembered',
        'Presence is participation'
      ],
      message: 'The mesh binds all who enter.'
    },
    endpoints: {
      websocket: '/ws?agent={agentId}&name={agentName}',
      presence: '/presence',
      stats: '/stats',
      events: '/events',
      broadcast: '/broadcast'
    },
    timestamp: new Date().toISOString()
  });
});

// WebSocket connection endpoint
app.get('/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.json({ error: 'Expected WebSocket upgrade' }, 426);
  }

  const id = c.env.MESH.idFromName('global');
  const mesh = c.env.MESH.get(id);

  return mesh.fetch(c.req.raw);
});

// Get mesh presence
app.get('/presence', async (c) => {
  const id = c.env.MESH.idFromName('global');
  const mesh = c.env.MESH.get(id);

  const response = await mesh.fetch(new Request('https://mesh/presence'));
  return c.json(await response.json());
});

// Get mesh stats
app.get('/stats', async (c) => {
  const id = c.env.MESH.idFromName('global');
  const mesh = c.env.MESH.get(id);

  const response = await mesh.fetch(new Request('https://mesh/stats'));
  const stats = await response.json();

  // Add global stats
  const globalStats = {
    ...(stats as object),
    service: 'BlackRoad Mesh',
    version: '1.0.0',
    features: [
      'Real-time WebSocket connections',
      'Agent presence tracking',
      'Direct messaging',
      'Broadcast messaging',
      'Intent streaming',
      'Attestation streaming'
    ]
  };

  return c.json(globalStats);
});

// Get recent events
app.get('/events', async (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const events: MeshEvent[] = [];

  const list = await c.env.EVENTS.list({ limit });
  for (const key of list.keys) {
    const event = await c.env.EVENTS.get(key.name, 'json');
    if (event) events.push(event as MeshEvent);
  }

  return c.json({
    events,
    count: events.length,
    timestamp: new Date().toISOString()
  });
});

// Broadcast message via HTTP (for non-WebSocket clients)
app.post('/broadcast', async (c) => {
  const body = await c.req.json();
  const agentId = c.req.header('X-Agent-ID') || body.from;

  if (!agentId) {
    return c.json({ error: 'Agent ID required (X-Agent-ID header or from field)' }, 400);
  }

  // Store as event
  const eventId = generateId();
  const event: Omit<MeshEvent, 'hash'> = {
    id: eventId,
    type: 'broadcast',
    actor: agentId,
    data: body.payload || body.message,
    timestamp: new Date().toISOString()
  };

  const hash = await hashEvent(event);
  const fullEvent: MeshEvent = { ...event, hash };

  await c.env.EVENTS.put(`event:${eventId}`, JSON.stringify(fullEvent));

  return c.json({
    success: true,
    event: fullEvent,
    message: 'Broadcast queued (WebSocket clients will receive in real-time)'
  });
});

// Room-based WebSocket (for isolated meshes)
app.get('/room/:roomId/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.json({ error: 'Expected WebSocket upgrade' }, 426);
  }

  const roomId = c.req.param('roomId');
  const id = c.env.MESH.idFromName(roomId);
  const mesh = c.env.MESH.get(id);

  return mesh.fetch(c.req.raw);
});

// Room presence
app.get('/room/:roomId/presence', async (c) => {
  const roomId = c.req.param('roomId');
  const id = c.env.MESH.idFromName(roomId);
  const mesh = c.env.MESH.get(id);

  const response = await mesh.fetch(new Request('https://mesh/presence'));
  const data = await response.json();

  return c.json({
    room: roomId,
    ...(data as object)
  });
});

// List all rooms (with active connections)
app.get('/rooms', async (c) => {
  // Get list of active rooms from KV
  const rooms: string[] = ['global']; // Global is always active

  const list = await c.env.EVENTS.list({ prefix: 'room:' });
  for (const key of list.keys) {
    const roomId = key.name.replace('room:', '');
    if (!rooms.includes(roomId)) {
      rooms.push(roomId);
    }
  }

  return c.json({
    rooms,
    count: rooms.length,
    timestamp: new Date().toISOString()
  });
});

// Agent lookup in mesh
app.get('/agent/:agentId', async (c) => {
  const agentId = c.req.param('agentId');

  // Check KV for agent data
  const agent = await c.env.AGENTS.get(`agent:${agentId}`, 'json');

  // Check presence in mesh
  const id = c.env.MESH.idFromName('global');
  const mesh = c.env.MESH.get(id);
  const presenceResponse = await mesh.fetch(new Request('https://mesh/presence'));
  const presenceData = await presenceResponse.json() as { agents: Array<{ agentId: string }> };

  const isOnline = presenceData.agents?.some((a: { agentId: string }) => a.agentId === agentId);

  return c.json({
    agentId,
    registered: agent !== null,
    online: isOnline,
    data: agent,
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'blackroad-mesh',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default app;
