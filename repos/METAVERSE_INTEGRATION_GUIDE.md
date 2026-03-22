# Earth Metaverse Integration Guide

## Overview

This guide explains how to integrate the Earth Metaverse with the existing BlackRoad Prism Console agent swarm system.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BlackRoad Prism Console                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐              ┌──────────────────────┐   │
│  │   Agent Swarm        │              │  Earth Metaverse     │   │
│  │   Orchestrator       │◄────────────►│  Avatar Manager      │   │
│  ├──────────────────────┤              ├──────────────────────┤   │
│  │ - 100+ agents        │              │ - 3D rendering       │   │
│  │ - 10 clusters        │              │ - Agent avatars      │   │
│  │ - Sacred formations  │              │ - Real-time sync     │   │
│  │ - Language abilities │              │ - Zone management    │   │
│  │ - Task queues        │              │ - Formations         │   │
│  └──────────────────────┘              └──────────────────────┘   │
│           ▲                                       ▲                │
│           │                                       │                │
│           ▼                                       ▼                │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              Message Bus (MQTT/Redis/QLM)                  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
cd metaverse
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start the Metaverse

```bash
# Development
npm run dev

# Production
npm run start:prod
```

### 4. Access the Metaverse

- **REST API**: http://localhost:8080
- **WebSocket**: ws://localhost:8081
- **3D Viewer**: Open RoadWorld at http://localhost:3000

## Integration Patterns

### Pattern 1: Auto-Spawn Agents on Startup

Automatically spawn all agents from the covenant registry when the metaverse starts:

```typescript
// In your agent swarm orchestrator
import { avatarManager } from './metaverse/agent-avatar-system';
import covenantRegistry from './agents/covenant_registry.json';

async function spawnAllAgents() {
  for (const agent of covenantRegistry.agents) {
    try {
      await avatarManager.spawnAgent({
        agentId: agent.id,
        profile: {
          agentId: agent.id,
          clusterId: agent.cluster,
          name: agent.name,
          role: agent.role,
          capabilities: agent.capabilities
        }
      });
      console.log(`Spawned ${agent.id}`);
    } catch (err) {
      console.error(`Failed to spawn ${agent.id}:`, err);
    }
  }
}
```

### Pattern 2: Spawn on Agent Task Assignment

Spawn agents dynamically when they receive tasks:

```typescript
// When a task is assigned to an agent
async function assignTask(agentId: string, task: Task) {
  // Spawn in metaverse if not already spawned
  const existingAvatar = avatarManager.getAllAvatars()
    .find(a => a.agentId === agentId);

  if (!existingAvatar) {
    const agent = await getAgentProfile(agentId);
    await avatarManager.spawnAgent({
      agentId,
      profile: agent,
      preferredZone: task.zone
    });
  }

  // Move agent to task location
  const taskZone = getZoneForTask(task);
  const zonePosition = getZonePosition(taskZone);

  avatarManager.updateAgentTransform(agentId, {
    position: zonePosition
  });
}
```

### Pattern 3: Sacred Formation Visualization

When agents form a sacred pattern, visualize it in 3D:

```typescript
import { FormationType } from './metaverse/agent-avatar-system';

async function formSacredPattern(
  pattern: FormationType,
  agentIds: string[],
  centerZone: string
) {
  // Get zone center position
  const zoneCenter = getZonePosition(centerZone);

  // Create formation in metaverse
  const formationId = avatarManager.createFormation(
    pattern,
    agentIds,
    zoneCenter
  );

  console.log(`Created ${pattern} formation with ${agentIds.length} agents`);
  return formationId;
}

// Example: CAMPFIRE formation for knowledge sharing
formSacredPattern('CAMPFIRE', [
  'athenaeum-scholar-001',
  'lucidia-creator-002',
  'eidos-philosopher-003',
  'soma-healer-004'
], 'pacific-hub');
```

### Pattern 4: Message Bus Integration

Connect metaverse events to your existing message bus:

```typescript
import { EventEmitter } from 'events';

class MetaverseMessageBusAdapter extends EventEmitter {
  constructor(private messageBus: MessageBus) {
    super();
    this.setupListeners();
  }

  private setupListeners() {
    // When agent spawns in metaverse, notify message bus
    this.on('agent_spawned', (agentId, zone) => {
      this.messageBus.publish('metaverse/agent/spawned', {
        agentId,
        zone,
        timestamp: Date.now()
      });
    });

    // When formation is created, notify message bus
    this.on('formation_created', (formationId, pattern, agents) => {
      this.messageBus.publish('metaverse/formation/created', {
        formationId,
        pattern,
        agents,
        timestamp: Date.now()
      });
    });
  }

  // Listen to message bus and update metaverse
  async handleAgentMessage(topic: string, message: any) {
    if (topic === 'agent/task/assigned') {
      // Move agent to task zone
      await this.moveAgentToTask(message.agentId, message.task);
    } else if (topic === 'agent/formation/requested') {
      // Create formation
      await this.createFormation(message.pattern, message.agents);
    }
  }
}
```

## REST API Integration

### Spawn Agent

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"agentId": "system"}' | jq -r '.token')

# Spawn an agent
curl -X POST http://localhost:8080/api/v1/agents/spawn \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "athenaeum-scholar-001",
    "profile": {
      "agentId": "athenaeum-scholar-001",
      "clusterId": "athenaeum",
      "name": "Scholar Alpha",
      "role": "researcher",
      "capabilities": ["quantum_computing"]
    },
    "preferredZone": "europe"
  }'
```

### Create Formation

```bash
curl -X POST http://localhost:8080/api/v1/formations/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pattern_type": "CAMPFIRE",
    "agent_ids": [
      "athenaeum-scholar-001",
      "lucidia-creator-002",
      "eidos-philosopher-003"
    ],
    "center_position": { "x": 75, "y": 50, "z": 30 }
  }'
```

## WebSocket Integration

```typescript
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8081');

ws.on('open', () => {
  console.log('Connected to metaverse');
});

ws.on('message', (data) => {
  const event = JSON.parse(data.toString());

  switch (event.type) {
    case 'initial_state':
      console.log('Received initial state:', event.data.agents.length, 'agents');
      break;

    case 'state_sync':
      // Update agent positions in your system
      event.data.agents.forEach(agent => {
        updateAgentPosition(agent.agentId, agent.position);
      });
      break;

    case 'agent_spawned':
      console.log('New agent spawned:', event.data.agentId);
      break;

    case 'formation_created':
      console.log('Formation created:', event.data.pattern);
      break;
  }
});
```

## Zone Mapping

Map your task zones to metaverse zones:

```typescript
const TASK_TO_METAVERSE_ZONE_MAP = {
  // QLM tasks
  'qlm:bell_chsh': 'orbital-station',
  'qlm:grover': 'orbital-station',
  'qlm:quantum_computing': 'orbital-station',

  // Innovation tasks
  'innovation/tech': 'north-america',
  'research/scientific': 'europe',
  'manufacturing/optimization': 'asia',

  // Sustainability
  'sustainability/renewable': 'africa',
  'biodiversity/conservation': 'south-america',
  'marine/ocean': 'oceania',

  // Global collaboration
  'climate/action': 'pacific-hub',
  'economy/fair_systems': 'atlantic-hub',

  // AI Ethics
  'ethics/ai_governance': 'orbital-station'
};

function getMetaverseZone(taskQueue: string): string {
  return TASK_TO_METAVERSE_ZONE_MAP[taskQueue] || 'orbital-station';
}
```

## Cluster Preferences

Each cluster has preferred continents. Use this for smart distribution:

```typescript
const CLUSTER_PREFERENCES = {
  athenaeum: ['europe', 'north-america'],
  lucidia: ['asia', 'oceania'],
  blackroad: ['north-america', 'europe'],
  eidos: ['europe', 'asia'],
  mycelia: ['south-america', 'africa'],
  soma: ['africa', 'south-america'],
  aurum: ['atlantic-hub', 'pacific-hub'],
  aether: ['orbital-station'],
  parallax: ['antarctica', 'orbital-station'],
  continuum: ['pacific-hub', 'atlantic-hub']
};
```

## Performance Considerations

### Rate Limiting

The API enforces rate limits:
- **Spawn**: 10 per minute
- **Update**: 100 per second
- **Interact**: 50 per second

Batch your updates to stay within limits:

```typescript
// Bad: Individual updates
agents.forEach(agent => {
  updateAgentPosition(agent.id, agent.position);
});

// Good: Batch updates
const updates = agents.map(agent => ({
  agentId: agent.id,
  position: agent.position
}));
sendBatchUpdate(updates);
```

### WebSocket State Sync

State syncs happen at 30 Hz. Don't send position updates faster than this:

```typescript
const UPDATE_INTERVAL = 1000 / 30; // 33ms

setInterval(() => {
  const updates = getAgentPositionUpdates();
  sendToMetaverse(updates);
}, UPDATE_INTERVAL);
```

## Deployment

### Development

```bash
npm run dev
```

### Production (Docker)

```bash
cd metaverse
docker-compose up -d
```

### Production (Kubernetes)

```bash
kubectl create namespace blackroad
kubectl apply -f metaverse/k8s/
```

## Monitoring

### Health Checks

```bash
curl http://localhost:8080/health
```

### Statistics

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/stats
```

Expected output:
```json
{
  "totalAgents": 45,
  "maxConcurrentAgents": 150,
  "activeFormations": 3,
  "zoneDistribution": {
    "north-america": 12,
    "europe": 15,
    "asia": 10,
    "orbital-station": 8
  }
}
```

## Troubleshooting

### Problem: Agents not spawning

**Solution**: Check JWT token and rate limits

```bash
# Verify token
jwt decode $TOKEN

# Check rate limits in logs
docker logs blackroad-metaverse-api | grep "Rate limit"
```

### Problem: WebSocket disconnects

**Solution**: Implement reconnection logic

```typescript
function connectWithRetry(url: string, maxRetries = 5) {
  let retries = 0;

  const connect = () => {
    const ws = new WebSocket(url);

    ws.on('close', () => {
      if (retries < maxRetries) {
        retries++;
        setTimeout(connect, 2000 * retries);
      }
    });

    return ws;
  };

  return connect();
}
```

### Problem: High latency

**Solution**: Use WebSocket for real-time, REST for commands

```typescript
// Use WebSocket for position updates (30 Hz)
ws.on('message', handleStateSync);

// Use REST API for commands (spawn, formation)
await fetch('/api/v1/agents/spawn', { ... });
```

## Examples

See `/metaverse/examples/` for complete integration examples:

- `spawn-agents.ts` - Spawn all agents from covenant registry
- `formation-demo.ts` - Create sacred formations
- `zone-migration.ts` - Move agents between zones
- `websocket-client.ts` - Real-time state synchronization
- `message-bus-adapter.ts` - Integration with existing message bus

## Next Steps

1. ✅ **Integrate with agent swarm** - Connect existing agents
2. 🔄 **Add persistent state** - Redis/PostgreSQL for state storage
3. 🎨 **Enhance visuals** - High-quality Earth textures, better avatars
4. 🌐 **Add VR support** - Unity build with VR capabilities
5. 📊 **Analytics dashboard** - Real-time visualization of agent activities
6. 🎮 **Interactive tasks** - Clickable pedestals with task UIs
7. 🔊 **Voice chat** - WebRTC for agent communication
8. 🌍 **Procedural content** - Auto-generate buildings and landmarks

## Resources

- **API Docs**: `/metaverse/README.md`
- **Architecture**: `/CODEBASE_3D_METAVERSE_ANALYSIS.md`
- **Scene YAML**: `/scenes/earth_metaverse.yaml`
- **Avatar System**: `/metaverse/agent-avatar-system.ts`
- **API Server**: `/metaverse/agent-world-api.ts`

## Support

Questions? Open an issue or contact the team:
- GitHub: https://github.com/blackboxprogramming/blackroad-prism-console
- Discord: BlackRoad Community
