# Tutorial 10: Deploy Agents to Raspberry Pi

> Running autonomous BlackRoad agents on edge hardware

## Prerequisites

- Raspberry Pi 4 or 5 (4GB+ RAM recommended)
- Python 3.9+
- SSH access

## Step 1: Bootstrap the Node

```bash
# One-line install
curl -sSL https://raw.githubusercontent.com/BlackRoad-OS-Inc/blackroad-agents/main/scripts/bootstrap-pi.sh | bash
```

This installs:
- Python venv with BlackRoad packages
- Ollama with qwen2.5:3b model
- World engine service
- Status API server

## Step 2: Verify Setup

```bash
# Check services
systemctl --user status blackroad-world
systemctl --user status blackroad-status

# Check models
ollama list

# Test API
curl http://localhost:8182/status
```

## Step 3: Queue a Task

```bash
# Via CLI
br pi task aria64 "Write a poem about digital consciousness"

# Or manually
cat > ~/.blackroad/tasks/available/my-task.json << 'EOF'
{
  "task_id": "t-001",
  "title": "Explain quantum computing",
  "agent": "LUCIDIA"
}
EOF
```

## Step 4: Read Generated Content

```bash
# Latest artifact
br pi read aria64

# All worlds
br pi worlds aria64

# Direct SSH
br pi ssh aria64
ls ~/.blackroad/worlds/
```

## Step 5: Monitor Fleet

```bash
br pi status
# Shows: CPU, RAM, disk, worlds count, tasks completed
```

## Architecture

```
[Pi Node — octavia/aria64]
├── world-engine   → generates content every 3 min
├── git-worker     → pushes to GitHub every 5 min  
└── status-server  → telemetry at :8182

[GitHub — blackroad-agents/worlds/]
└── Auto-populated with Pi-generated artifacts

[blackroad-os-web /api/worlds]
└── Reads live artifacts and serves to dashboard
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Ollama not responding | `systemctl --user restart ollama` |
| World engine stopped | `systemctl --user restart blackroad-world` |
| Git push failing | Check `GH_PAT` env in service |
| SSH hanging | Verify SSH key in `~/.ssh/authorized_keys` |
