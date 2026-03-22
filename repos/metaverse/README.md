# BlackRoad Earth Metaverse 🌍

Production-ready Earth replica metaverse with real-time agent integration for the BlackRoad Prism Console.

## Overview

The Earth Metaverse is a fully-featured 3D virtual environment where 100+ AI agents can spawn, collaborate, and interact across realistic continental zones and orbital stations. Built with Unity/React Three Fiber, it supports real-time synchronization, sacred formation patterns, and production-scale deployment.

## Features

### 🌐 Earth Replica
- **Realistic Earth rendering** with 8K textures (day/night/specular/normal/clouds)
- **7 Continents** + 2 Ocean Hubs + 1 Orbital Station
- **Dynamic day/night cycle** (20 minutes real-time = 24 hours sim)
- **Weather system** with regional variations
- **Ocean simulation** with realistic waves and currents
- **Atmosphere rendering** with Rayleigh scattering

### 🚀 Space Environment
- **Milky Way galaxy** background with 10,000+ stars
- **Moon** with realistic orbital mechanics
- **Sun** with dynamic lighting and shadows
- **Nearby planets** (Mars, Venus) for telescopic viewing
- **Space stations** at various orbital heights

### 🤖 Agent Integration
- **1,200 concurrent agents** default capacity (tunable via `MAX_CONCURRENT_AGENTS`)
- **10 agent clusters** with unique avatars and color schemes
- **Geographic distribution** based on cluster preferences
- **Real-time position updates** at 30 Hz
- **Sacred formations**: DELTA, HALO, LATTICE, HUM, CAMPFIRE
- **Avatar customization** per cluster
- **Auto-spawn of 1,000+ covenant agents** when `AUTO_SPAWN_AGENTS=true`

### 📡 Real-Time Synchronization
- **WebSocket server** for live updates
- **Client prediction** and interpolation
- **Delta encoding** for bandwidth optimization
- **State compression** for efficient networking
- **Automatic reconnection** and error recovery

### 🏗️ Production-Ready
- **Docker** containerization
- **Kubernetes** deployment with auto-scaling (3-10 replicas)
- **Health checks** and monitoring
- **Rate limiting** and authentication (JWT)
- **Horizontal pod autoscaling** based on CPU/memory
- **Load balancing** with NGINX

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (optional, for containerization)
- Kubernetes cluster (optional, for production deployment)

### Installation

```bash
cd metaverse
npm install
```

### Development

```bash
# Start the API server with hot reload
npm run dev

# In another terminal, start RoadWorld (React Three Fiber client)
cd ../apps/roadworld
npm run dev
```

The API will be available at:
- REST API: `http://localhost:8080`
- WebSocket: `ws://localhost:8081`

### Building

```bash
npm run build
```

### Agent roster sync

Generate or refresh the consolidated 1,000-agent roster that powers the
metaverse auto-spawn pipeline:

```bash
python tools/build_metaverse_roster.py
```

This writes `metaverse/data/agent_roster.json` with normalized metadata for the
first 1,000 archetype expansions. The API layer consumes this file at runtime
to pre-warm the metaverse and expose cluster-aware spawn hints.

### Production

```bash
# Using Node.js
npm run start:prod

# Using Docker
npm run docker:build
npm run docker:run

# Using Docker Compose
docker-compose up -d

# Using Kubernetes
kubectl create namespace blackroad
npm run k8s:deploy
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Earth Metaverse                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │ Agent Swarm  │◄───────►│ Avatar Mgr   │                │
│  │ Orchestrator │         │ (TS)         │                │
│  └──────────────┘         └──────┬───────┘                │
│                                   │                         │
│  ┌──────────────┐         ┌──────▼───────┐                │
│  │ REST API     │◄───────►│ State Sync   │                │
│  │ (Express)    │         │ (WebSocket)  │                │
│  └──────┬───────┘         └──────┬───────┘                │
│         │                        │                         │
│  ┌──────▼────────────────────────▼───────┐                │
│  │         3D Rendering Layer            │                │
│  │  - React Three Fiber (Web)            │                │
│  │  - Unity (Native/VR)                  │                │
│  └───────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## API Reference

### Authentication

All endpoints require a JWT token:

```bash
# Get a token
curl -X POST http://localhost:8080/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"agentId": "athenaeum-scholar-001"}'

# Use the token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/v1/stats
```

### Endpoints

#### `POST /api/v1/agents/spawn`
Spawn a new agent in the metaverse.

**Request:**
```json
{
  "agentId": "athenaeum-scholar-001",
  "profile": {
    "agentId": "athenaeum-scholar-001",
    "clusterId": "athenaeum",
    "name": "Scholar Alpha",
    "role": "researcher",
    "capabilities": ["quantum_computing", "mathematics"]
  },
  "preferredZone": "europe",
  "avatarConfig": {
    "customization": {
      "glow": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "avatar": {
    "agentId": "athenaeum-scholar-001",
    "currentZone": "europe",
    "position": { "x": 75, "y": 50, "z": 30 },
    "rotation": { "x": 0, "y": 0, "z": 0, "w": 1 }
  }
}
```

#### `PATCH /api/v1/agents/:agentId/position`
Update agent position.

**Request:**
```json
{
  "position": { "x": 80, "y": 55, "z": 35 },
  "rotation": { "x": 0, "y": 0.707, "z": 0, "w": 0.707 },
  "velocity": { "x": 1, "y": 0, "z": 0 }
}
```

#### `POST /api/v1/formations/create`
Create a sacred formation.

**Request:**
```json
{
  "pattern_type": "CAMPFIRE",
  "agent_ids": [
    "athenaeum-scholar-001",
    "lucidia-creator-002",
    "eidos-philosopher-003"
  ],
  "center_position": { "x": 75, "y": 50, "z": 30 }
}
```

#### `GET /api/v1/stats`
Get metaverse statistics.

**Response:**
```json
{
  "totalAgents": 45,
  "maxConcurrentAgents": 1200,
  "activeFormations": 3,
  "zoneDistribution": {
    "north-america": 12,
    "europe": 15,
    "asia": 10,
    "orbital-station": 8
  }
}
```

### WebSocket Events

Connect to `ws://localhost:8081` to receive real-time updates.

**Events received:**
- `initial_state` - Full state on connection
- `state_sync` - Position updates (30 Hz)
- `agent_spawned` - New agent joined
- `agent_despawned` - Agent left
- `formation_created` - Sacred formation formed

**Events to send:**
- `ping` - Keep-alive
- `subscribe_zone` - Subscribe to zone-specific updates

## Integration with Agent Swarm

The metaverse automatically integrates with the existing agent swarm orchestrator:

```typescript
import { startMetaverseAPI, integrateWithAgentSwarm } from '@blackroad/metaverse';

// Start the metaverse
startMetaverseAPI();

// Integrate with agent swarm
await integrateWithAgentSwarm();
```

Agents from the covenant registry can be auto-spawned by setting:
```bash
export AUTO_SPAWN_AGENTS=true
```

## Zones

### Continents
- **North America** - Innovation and tech development (25 agents)
- **Europe** - Research and scientific discovery (20 agents)
- **Asia** - Manufacturing and optimization (35 agents)
- **Africa** - Sustainability and renewable energy (20 agents)
- **South America** - Biodiversity and conservation (15 agents)
- **Oceania** - Ocean exploration (10 agents)
- **Antarctica** - Extreme environment research (5 agents)

### Ocean Hubs
- **Pacific Hub** - Climate action and global collaboration (30 agents)
- **Atlantic Hub** - Economic systems and fair trade (30 agents)

### Space
- **Orbital Station** - Advanced research and AI ethics (50 agents)

## Cluster Avatar Variants

Each of the 10 clusters has a unique avatar:

| Cluster | Variant | Color | Continents |
|---------|---------|-------|------------|
| Athenaeum | Scholar | Blue | Europe, North America |
| Lucidia | Creator | Orange/Gold | Asia, Oceania |
| BlackRoad | Engineer | Dark | North America, Europe |
| Eidos | Philosopher | Purple | Europe, Asia |
| Mycelia | Networker | Green | South America, Africa |
| Soma | Healer | Earth Tones | Africa, South America |
| Aurum | Trader | Gold | Ocean Hubs |
| Aether | Explorer | Silver | Orbital Station |
| Parallax | Observer | Gray | Antarctica, Orbital |
| Continuum | Chronicler | Cyan | Ocean Hubs |

## Sacred Formations

Agents can organize into sacred formation patterns:

- **DELTA** - Triangle formation for fast iteration
- **HALO** - Circular protective formation
- **LATTICE** - Grid for systematic work
- **HUM** - Tight cluster for synchronous work
- **CAMPFIRE** - Circle facing inward for knowledge sharing

## Covenant Registry Auto-Spawn

Set `AUTO_SPAWN_AGENTS=true` to automatically stream every entry from `agents/covenant_registry.json` (1,000+ agents) into the metaverse at boot. The integration layer will:

1. Load and validate the registry (you can override the file path via `COVENANT_REGISTRY_PATH`).
2. Normalize cluster IDs, roles, and covenant metadata into fully-typed `AgentProfile` objects.
3. Spawn agents in sequence, logging progress every 100 spawns until `MAX_CONCURRENT_AGENTS` is reached.

Increase `MAX_CONCURRENT_AGENTS` if you want to visualize even more agents simultaneously.

## Performance Optimization

### Level of Detail (LOD)
- 4 LOD levels at 50m, 200m, 500m, 1000m
- Agent culling beyond 300m
- Texture streaming for large assets

### Instancing
- Vegetation instancing
- Building instancing
- Agent instancing for distant avatars

### Quality Presets
- **Ultra**: 4K shadows, 1,200 agents
- **High**: 2K shadows, 800 agents
- **Medium**: 1K shadows, 400 agents
- **Low**: 512px shadows, 150 agents

## Monitoring

Health check endpoint:
```bash
curl http://localhost:8080/health
```

Prometheus metrics (coming soon):
```
metaverse_active_agents
metaverse_formations_count
metaverse_zone_population
metaverse_api_requests_total
metaverse_websocket_connections
```

## Environment Variables

```bash
# API Configuration
METAVERSE_API_PORT=8080
METAVERSE_WS_PORT=8081

# Security
JWT_SECRET=your-secret-key

# Features
AUTO_SPAWN_AGENTS=false  # set to true to auto-load all covenant agents
LOG_LEVEL=info

# Performance
MAX_CONCURRENT_AGENTS=1200
TICK_RATE=30

# Database (optional)
REDIS_URL=redis://localhost:6379

# Overrides (optional)
COVENANT_REGISTRY_PATH=/absolute/path/to/covenant_registry.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- GitHub Issues: https://github.com/blackboxprogramming/blackroad-prism-console/issues
- Discord: [BlackRoad Community]
- Email: support@blackroad.ai
