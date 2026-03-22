/**
 * Agent-World API Integration Layer
 *
 * REST API and WebSocket server for connecting the agent swarm system
 * to the Earth Metaverse 3D environment.
 */

import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import path from 'path';
import { readFile } from 'fs/promises';
import {
  avatarManager,
  SpawnRequest,
  FormationType,
  AgentTransform,
  ClusterId
} from './agent-avatar-system';
import {
  getAgentRoster,
  summarizeRoster,
  toSpawnRequest
} from './agent-roster';

// ==================== Configuration ====================

const DEFAULT_AUTO_SPAWN_LIMIT = 25;

const CONFIG = {
  port: parseInt(process.env.METAVERSE_API_PORT || '8080', 10),
  wsPort: parseInt(process.env.METAVERSE_WS_PORT || '8081', 10),
function numberFromEnv(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return fallback;
}

const CONFIG = {
  port: numberFromEnv(process.env.METAVERSE_API_PORT, 8080),
  wsPort: numberFromEnv(process.env.METAVERSE_WS_PORT, 8081),
  jwtSecret: process.env.JWT_SECRET || 'blackroad-prism-console-secret',
  jwtIssuer: 'blackroad-prism-console',
  tickRate: 30, // Hz for state sync
  rateLimits: {
    spawn: { max: 10, window: 60000 }, // 10 per minute
    update: { max: 100, window: 1000 }, // 100 per second
    interact: { max: 50, window: 1000 }  // 50 per second
  }
};

type CovenantRegistryEntry = {
  agent_id: string;
  display_name?: string;
  cluster?: string;
  role?: string;
  capabilities?: string[];
  languageAbility?: AgentProfile['languageAbility'];
  covenant?: {
    tags?: string[];
  };
};

type CovenantRegistry = {
  entries?: CovenantRegistryEntry[];
};

const CLUSTER_ID_LOOKUP: readonly ClusterId[] = [
  'athenaeum',
  'lucidia',
  'blackroad',
  'eidos',
  'mycelia',
  'soma',
  'aurum',
  'aether',
  'parallax',
  'continuum'
] as const;

function isClusterId(value: string): value is ClusterId {
  return (CLUSTER_ID_LOOKUP as readonly string[]).includes(value);
}

function normalizeClusterId(cluster?: string): ClusterId {
  const normalized = cluster?.trim().toLowerCase();
  if (normalized && isClusterId(normalized)) {
    return normalized;
  }
  return 'continuum';
}

function deriveCapabilities(entry: CovenantRegistryEntry): string[] {
  if (Array.isArray(entry.capabilities) && entry.capabilities.length > 0) {
    return entry.capabilities;
  }

  if (Array.isArray(entry.covenant?.tags) && entry.covenant?.tags.length > 0) {
    return entry.covenant.tags;
  }

  if (entry.role) {
    return [entry.role];
  }

  return [];
}

function buildAgentProfile(entry: CovenantRegistryEntry): AgentProfile {
  const displayName = entry.display_name?.trim() || entry.agent_id.replace(/[-_]/g, ' ');

  return {
    agentId: entry.agent_id,
    clusterId: normalizeClusterId(entry.cluster),
    name: displayName,
    role: entry.role || 'Agent',
    capabilities: deriveCapabilities(entry),
    languageAbility: entry.languageAbility || 'core'
  };
}

async function loadCovenantRegistry(): Promise<CovenantRegistry> {
  const customPath = process.env.COVENANT_REGISTRY_PATH;
  const candidatePaths = [
    customPath,
    path.resolve(__dirname, '../agents/covenant_registry.json'),
    path.resolve(__dirname, '../../agents/covenant_registry.json'),
    path.resolve(process.cwd(), 'agents/covenant_registry.json')
  ].filter(Boolean) as string[];

  let lastError: unknown;
  for (const candidate of candidatePaths) {
    try {
      const fileContents = await readFile(candidate, 'utf-8');
      console.log(`[Metaverse API] Loaded covenant registry from ${candidate}`);
      return JSON.parse(fileContents) as CovenantRegistry;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error('Unable to locate covenant registry file');
}

async function autoSpawnAgentsFromRegistry(entries: CovenantRegistryEntry[]): Promise<number> {
  if (!Array.isArray(entries) || entries.length === 0) {
    return 0;
  }

  const stats = avatarManager.getStats();
  const totalCapacity = stats.maxConcurrentAgents;
  let capacityRemaining = Math.max(totalCapacity - stats.totalAgents, 0);

  if (capacityRemaining <= 0) {
    console.warn('[Metaverse API] Cannot auto-spawn agents: capacity already reached');
    return 0;
  }

  const spawnCandidates = entries.filter(entry => Boolean(entry.agent_id));

  let spawned = 0;
  for (const entry of spawnCandidates) {
    if (capacityRemaining <= 0) {
      break;
    }

    const spawnRequest: SpawnRequest = {
      agentId: entry.agent_id,
      profile: buildAgentProfile(entry)
    };

    try {
      await avatarManager.spawnAgent(spawnRequest);
      spawned += 1;
      capacityRemaining -= 1;

      if (spawned % 100 === 0) {
        console.log(`[Metaverse API] Auto-spawned ${spawned} agents so far (${stats.totalAgents + spawned}/${totalCapacity})`);
      }
    } catch (err) {
      console.warn(`[Metaverse API] Unable to auto-spawn agent ${entry.agent_id}: ${(err as Error).message}`);
    }
  }

  if (capacityRemaining === 0 && spawned < spawnCandidates.length) {
    console.warn('[Metaverse API] Auto-spawn halted after reaching max capacity. Increase MAX_CONCURRENT_AGENTS to bring more agents online.');
  }

  return spawned;
}

// ==================== Rate Limiting ====================

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const recentRequests = requests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// ==================== Authentication Middleware ====================

function authenticateToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, CONFIG.jwtSecret, {
      issuer: CONFIG.jwtIssuer
    });
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ==================== REST API ====================

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  const stats = avatarManager.getStats();
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    stats
  });
});

// Generate JWT token (for development)
app.post('/api/v1/auth/token', (req, res) => {
  const { agentId } = req.body;

  if (!agentId) {
    return res.status(400).json({ error: 'agentId required' });
  }

  const token = jwt.sign(
    { agentId, type: 'agent' },
    CONFIG.jwtSecret,
    { issuer: CONFIG.jwtIssuer, expiresIn: '24h' }
  );

  res.json({ token });
});

// Spawn agent
app.post('/api/v1/agents/spawn', authenticateToken, async (req, res) => {
  const clientId = (req as any).user.agentId;

  if (!rateLimiter.check(`spawn:${clientId}`, CONFIG.rateLimits.spawn.max, CONFIG.rateLimits.spawn.window)) {
    return res.status(429).json({ error: 'Rate limit exceeded for spawn' });
  }

  try {
    const spawnRequest: SpawnRequest = req.body;

    if (!spawnRequest.agentId || !spawnRequest.profile) {
      return res.status(400).json({ error: 'Invalid spawn request' });
    }

    const avatar = await avatarManager.spawnAgent(spawnRequest);

    res.status(201).json({
      success: true,
      avatar: {
        agentId: avatar.agentId,
        currentZone: avatar.currentZone,
        position: avatar.transform.position,
        rotation: avatar.transform.rotation,
        avatarConfig: avatar.avatarConfig
      }
    });

    // Broadcast spawn event to all WebSocket clients
    broadcastEvent({
      type: 'agent_spawned',
      data: {
        agentId: avatar.agentId,
        zone: avatar.currentZone,
        position: avatar.transform.position,
        avatarConfig: avatar.avatarConfig
      }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update agent position
app.patch('/api/v1/agents/:agentId/position', authenticateToken, (req, res) => {
  const { agentId } = req.params;
  const clientId = (req as any).user.agentId;

  if (!rateLimiter.check(`update:${clientId}`, CONFIG.rateLimits.update.max, CONFIG.rateLimits.update.window)) {
    return res.status(429).json({ error: 'Rate limit exceeded for updates' });
  }

  try {
    const transform: Partial<AgentTransform> = {
      position: req.body.position,
      rotation: req.body.rotation,
      velocity: req.body.velocity
    };

    avatarManager.updateAgentTransform(agentId, transform);

    res.json({ success: true });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Agent interaction
app.post('/api/v1/agents/:agentId/interact', authenticateToken, (req, res) => {
  const { agentId } = req.params;
  const { targetId, interactionType } = req.body;
  const clientId = (req as any).user.agentId;

  if (!rateLimiter.check(`interact:${clientId}`, CONFIG.rateLimits.interact.max, CONFIG.rateLimits.interact.window)) {
    return res.status(429).json({ error: 'Rate limit exceeded for interactions' });
  }

  // Broadcast interaction event
  broadcastEvent({
    type: 'agent_interaction',
    data: {
      sourceAgentId: agentId,
      targetId,
      interactionType,
      timestamp: Date.now()
    }
  });

  res.json({ success: true });
});

// Create sacred formation
app.post('/api/v1/formations/create', authenticateToken, (req, res) => {
  try {
    const { pattern_type, agent_ids, center_position } = req.body;

    if (!pattern_type || !agent_ids || !center_position) {
      return res.status(400).json({ error: 'Invalid formation request' });
    }

    const formationId = avatarManager.createFormation(
      pattern_type as FormationType,
      agent_ids,
      center_position
    );

    res.json({
      success: true,
      formationId,
      pattern: pattern_type,
      agentCount: agent_ids.length
    });

    // Broadcast formation event
    broadcastEvent({
      type: 'formation_created',
      data: {
        formationId,
        pattern: pattern_type,
        agentIds: agent_ids,
        centerPosition: center_position
      }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Despawn agent
app.delete('/api/v1/agents/:agentId', authenticateToken, (req, res) => {
  const { agentId } = req.params;

  try {
    avatarManager.despawnAgent(agentId);

    res.json({ success: true });

    // Broadcast despawn event
    broadcastEvent({
      type: 'agent_despawned',
      data: { agentId }
    });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Get all agents
app.get('/api/v1/agents', authenticateToken, (req, res) => {
  const avatars = avatarManager.getAllAvatars();
  res.json({
    agents: avatars.map(a => ({
      agentId: a.agentId,
      profile: a.profile,
      currentZone: a.currentZone,
      position: a.transform.position,
      isActive: a.isActive,
      formationId: a.formationId
    }))
  });
});

// Get agents in zone
app.get('/api/v1/zones/:zone/agents', authenticateToken, (req, res) => {
  const { zone } = req.params;
  const avatars = avatarManager.getAvatarsInZone(zone);

  res.json({
    zone,
    count: avatars.length,
    agents: avatars.map(a => ({
      agentId: a.agentId,
      position: a.transform.position,
      avatarConfig: a.avatarConfig
    }))
  });
});

// Get metaverse stats
app.get('/api/v1/stats', authenticateToken, (req, res) => {
  const stats = avatarManager.getStats();
  res.json(stats);
});

// ==================== WebSocket Server ====================

const wsClients: Set<WebSocket> = new Set();

function broadcastEvent(event: any) {
  const message = JSON.stringify(event);
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function startWebSocketServer() {
  const wss = new WebSocketServer({ port: CONFIG.wsPort });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WebSocket] Client connected');
    wsClients.add(ws);

    // Send initial state
    const avatars = avatarManager.getAllAvatars();
    ws.send(JSON.stringify({
      type: 'initial_state',
      data: {
        agents: avatars.map(a => ({
          agentId: a.agentId,
          profile: a.profile,
          currentZone: a.currentZone,
          transform: a.transform,
          avatarConfig: a.avatarConfig
        }))
      }
    }));

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        handleWebSocketMessage(ws, data);
      } catch (err) {
        console.error('[WebSocket] Invalid message:', err);
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      wsClients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Error:', err);
      wsClients.delete(ws);
    });
  });

  console.log(`[WebSocket] Server started on port ${CONFIG.wsPort}`);
}

function handleWebSocketMessage(ws: WebSocket, data: any) {
  switch (data.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;

    case 'subscribe_zone':
      // Future: implement zone-specific subscriptions
      ws.send(JSON.stringify({ type: 'subscribed', zone: data.zone }));
      break;

    default:
      console.log('[WebSocket] Unknown message type:', data.type);
  }
}

// ==================== State Sync Loop ====================

function startStateSyncLoop() {
  setInterval(() => {
    const avatars = avatarManager.getAllAvatars();

    const syncData = {
      type: 'state_sync',
      timestamp: Date.now(),
      data: {
        agents: avatars.map(a => ({
          agentId: a.agentId,
          position: a.transform.position,
          rotation: a.transform.rotation,
          velocity: a.transform.velocity,
          currentZone: a.currentZone
        }))
      }
    };

    broadcastEvent(syncData);
  }, 1000 / CONFIG.tickRate);
}

// ==================== Server Startup ====================

export function startMetaverseAPI() {
  const server = createServer(app);

  server.listen(CONFIG.port, () => {
    console.log(`[Metaverse API] REST API server started on port ${CONFIG.port}`);
  });

  startWebSocketServer();
  startStateSyncLoop();

  console.log('[Metaverse API] Agent-World integration layer is running');
  console.log(`[Metaverse API] Tick rate: ${CONFIG.tickRate} Hz`);
  console.log(`[Metaverse API] Max concurrent agents: ${avatarManager.getStats().maxConcurrentAgents}`);

  return { server, app };
}

// ==================== Integration with Agent Swarm ====================

/**
 * Connect to the existing agent swarm orchestrator
 */
export async function integrateWithAgentSwarm() {
  // This function will be called from the main agent swarm orchestrator
  // to register metaverse capabilities with all agents

  console.log('[Metaverse API] Integrating with agent swarm...');

  try {
    const roster = getAgentRoster();
    console.log(`[Metaverse API] ${summarizeRoster()}`);
    // Dynamic import to avoid circular dependencies
    const covenantRegistry = await import('../agents/covenant_registry.json');

    console.log(`[Metaverse API] Found ${(covenantRegistry.default as any).entries?.length || 0} agents in covenant registry`);

    if (process.env.AUTO_SPAWN_AGENTS === 'true') {
      const configuredLimit = Number(process.env.AUTO_SPAWN_LIMIT ?? DEFAULT_AUTO_SPAWN_LIMIT);
      const normalizedLimit = Number.isFinite(configuredLimit) && configuredLimit > 0
        ? Math.floor(configuredLimit)
        : DEFAULT_AUTO_SPAWN_LIMIT;
      const safeLimit = Math.min(normalizedLimit, roster.length);
      let spawned = 0;

      console.log(`[Metaverse API] Auto-spawning up to ${safeLimit} agents for metaverse warm-up...`);

      for (const agent of roster.slice(0, safeLimit)) {
        try {
          await avatarManager.spawnAgent(toSpawnRequest(agent));
          spawned += 1;
        } catch (error) {
          console.error(`[Metaverse API] Failed to auto-spawn ${agent.id}:`, error);
        }
      }

      console.log(`[Metaverse API] Auto-spawned ${spawned} agent(s) into the metaverse.`);
    const registry = await loadCovenantRegistry();
    const entryCount = registry.entries?.length || 0;

    console.log(`[Metaverse API] Found ${entryCount} agents in covenant registry`);

    const shouldAutoSpawn = (process.env.AUTO_SPAWN_AGENTS || '').toLowerCase() === 'true';

    if (shouldAutoSpawn && entryCount > 0) {
      console.log('[Metaverse API] Auto-spawning covenant registry agents...');
      const spawned = await autoSpawnAgentsFromRegistry(registry.entries || []);
      console.log(`[Metaverse API] Auto-spawned ${spawned} agents into the metaverse`);
    } else if (!shouldAutoSpawn) {
      console.log('[Metaverse API] AUTO_SPAWN_AGENTS disabled; skipping auto-spawn.');
    }
  } catch (err) {
    console.error('[Metaverse API] Could not load metaverse roster:', err);
  }
}

// ==================== Main Entry Point ====================

if (require.main === module) {
  startMetaverseAPI();
  integrateWithAgentSwarm();
}
