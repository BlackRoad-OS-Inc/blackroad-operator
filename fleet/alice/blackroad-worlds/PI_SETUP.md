# BlackRoad Pi Autonomous Setup

Deploy a self-running BlackRoad agent node on any Raspberry Pi.

## One-Line Install

```bash
curl -sSL https://raw.githubusercontent.com/BlackRoad-OS-Inc/blackroad-agents/main/scripts/bootstrap-pi.sh | bash
```

## What Gets Installed

| Component | Purpose |
|-----------|---------|
| Python venv | Isolated Python environment |
| World Engine | Autonomous AI content generation (every 3 min) |
| Status Server | HTTP monitoring API |
| Git Worker | Auto-pull + commit worlds back to repos |
| Ollama models | qwen2.5:3b, nomic-embed-text |

## Architecture

```
Pi Node (octavia / aria64)
├── blackroad-world.service   → Generates worlds/code/lore every 3 min
├── blackroad-status.service  → HTTP status at :8182/status
├── blackroad-git-worker.service → Syncs repos every 5 min
└── ollama.service            → Local LLM inference
```

## Status Endpoints

| Node | URL |
|------|-----|
| aria64 (octavia) | http://192.168.4.38:8182/status |
| alice | http://192.168.4.49:8183/status |

## Worlds Generated

Each cycle the engine creates one of:
- **World descriptions** — immersive lore for BlackRoad universe
- **Code artifacts** — working Python/TypeScript/bash solutions
- **Agent lore** — backstories for LUCIDIA, ALICE, OCTAVIA, etc.

All saved to  and pushed to  in this repo.

## Task Queue

Drop a JSON task file in :

```json
{
  "task_id": "t-001",
  "title": "Write a haiku about Cloudflare Workers",
  "description": "Write a beautiful haiku about edge computing",
  "agent": "LUCIDIA",
  "priority": "high"
}
```

The world engine will pick it up on the next cycle.

## Fleet Nodes

| Hostname | IP | Role | Agents | Status |
|----------|----|------|--------|--------|
| octavia (aria64) | 192.168.4.38 | Primary | 22,500 | 🟢 online |
| alice | 192.168.4.49 | Secondary | 0 | 🟢 online |
| blackroad-pi | 192.168.4.64 | CF Tunnel | 7,500 | 🔴 offline |
| lucidia-alt | 192.168.4.99 | Backup | 0 | 🔴 offline |

## Models

| Model | Size | Use |
|-------|------|-----|
| qwen2.5:3b | 1.9GB | World generation (fast) |
| lucidia:latest | 4.9GB | Deep reasoning |
| nomic-embed-text | 274MB | Semantic search |
| llama3.2:1b | 1.3GB | Ultra-fast tasks |
