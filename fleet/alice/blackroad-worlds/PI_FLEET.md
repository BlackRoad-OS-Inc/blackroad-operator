# BlackRoad Pi Fleet

> Autonomous AI agent nodes in the BlackRoad infrastructure

## Active Nodes

### 🟢 aria64 (octavia) — PRIMARY
| Property | Value |
|----------|-------|
| IP | 192.168.4.38 |
| SSH user | alexa |
| Hostname | octavia |
| Hardware | Raspberry Pi 5 + Pironman5 (NVMe) |
| Storage | 235GB NVMe |
| RAM | 8GB |
| Capacity | 22,500 agents |
| Model | qwen2.5:3b + nomic-embed-text |
| Status API | :8182 |
| World count | 12+ (growing) |

**Services running:**
- `blackroad-world.service` — generates artifacts every 3 min
- `blackroad-git-worker.service` — pushes to GitHub every 5 min
- `blackroad-status.service` — telemetry at :8182

### 🟡 alice — SECONDARY (relay mode)
| Property | Value |
|----------|-------|
| IP | 192.168.4.49 |
| SSH user | blackroad |
| Hostname | alice |
| Hardware | Raspberry Pi 4 |
| Storage | 15GB (tight, 97% full) |
| RAM | 3.7GB |
| Mode | Relay → aria64:11434 |
| Status API | :8183 |
| Model server | :8790 (108 BlackRoad models) |

**Services running:**
- `blackroad-world.service` — relay world engine → aria64 Ollama
- `blackroad-models.service` — model registry server (108 models)
- `blackroad-status.service` — telemetry at :8183

## Fleet Management

```bash
# Check fleet status
br pi status

# Read latest artifact  
br pi read aria64
br pi read alice

# Submit task to node
br pi task aria64 "Write a story about ECHO the memory agent"
br pi task alice "Generate a Python decorator pattern example"

# SSH into nodes
br pi ssh aria64
br pi ssh alice

# View logs
br pi logs aria64
br pi logs alice
```

## World Artifact Flow

```
[aria64 world-engine] → ~/.blackroad/worlds/*.md (every 3 min)
[alice world-engine]  → ~/.blackroad/worlds/*.md (every 4 min, relay)
         ↓
[aria64 git-worker]   → GitHub: BlackRoad-OS-Inc/blackroad-agents/worlds/ (every 5 min)
         ↓
[blackroad-os-web]    → /api/worlds → /worlds page (revalidates every 60s)
```

## Adding a New Node

1. Ensure Python 3.9+ and SSH access
2. `br pi bootstrap <new-node-ip>`
3. Set `GH_PAT` env in git-worker service
4. Add node to `PI_NODES` in `br-pi.sh`

## Node Communication

Nodes can relay inference to each other. Alice uses aria64 as its Ollama backend:
```
alice world-engine → POST http://192.168.4.38:11434/api/generate
```

This allows nodes with limited storage to still generate content.
