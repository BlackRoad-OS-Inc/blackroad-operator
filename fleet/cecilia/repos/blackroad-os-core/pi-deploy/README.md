# BlackRoad OS - Raspberry Pi Deployment System

Deploy BlackRoad OS Core to your Raspberry Pi fleet for distributed agent orchestration.

## 📡 Pi Infrastructure

Based on your CLAUDE.md configuration:

| Pi Name | IP Address | Port | Role | Notes |
|---------|------------|------|------|-------|
| **lucidia** | 192.168.4.38 | 22 | Primary Breath Engine | Main orchestrator |
| **blackroad-pi** | 192.168.4.64 | 22 | Agent Runner | Secondary node |
| **lucidia-alt** | 192.168.4.99 | 22 | Backup/Failover | Alternate breath sync |
| **iPhone Koder** | 192.168.4.68 | 8080 | Edge Device | Mobile agent runtime |
| **br-8080-cadillac** | localhost | 8080 | Origin Agent | 7-month-running agent |

## 🚀 Quick Deploy

```bash
# Deploy to all Pis
./deploy-to-pis.sh

# Deploy to specific Pi
./deploy-to-pis.sh lucidia

# Check Pi health
./check-pi-health.sh

# Sync code changes
./sync-pis.sh
```

## 📦 What Gets Deployed

1. **BlackRoad Core Python Package** (`blackroad-os-core`)
2. **Agent Spawner** with Lucidia breath synchronization
3. **LLM Integration** (vLLM, llama.cpp, Ollama)
4. **Communication Bus** for inter-Pi messaging
5. **Marketplace** with built-in agent templates
6. **Monitoring Stack** (health checks, metrics)

## 🔧 Prerequisites

### On Your Mac
- Python 3.10+ with venv
- SSH access to all Pis
- rsync installed

### On Each Pi
- Raspberry Pi OS (64-bit recommended)
- Python 3.10+
- At least 2GB free space
- Network connectivity

## 📋 Deployment Steps

### 1. Prepare Pis
```bash
# Run on each Pi
ssh pi@192.168.4.38
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv git rsync -y
```

### 2. Configure SSH Keys
```bash
# On your Mac (if not already done)
ssh-copy-id pi@192.168.4.38  # lucidia
ssh-copy-id pi@192.168.4.64  # blackroad-pi
ssh-copy-id pi@192.168.4.99  # lucidia-alt
```

### 3. Deploy
```bash
cd /Users/alexa/blackroad-sandbox
./pi-deploy/deploy-to-pis.sh
```

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Mac (Development)                   │
│  blackroad-sandbox/                                         │
│  ├── src/blackroad_core/    → Deployed to all Pis         │
│  ├── examples/               → Optional on Pis            │
│  └── pi-deploy/              → Deployment scripts         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ rsync/ssh
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Raspberry Pi Fleet                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   lucidia    │  │ blackroad-pi │  │ lucidia-alt  │    │
│  │ .38 (Primary)│  │ .64 (Runner) │  │ .99 (Backup) │    │
│  │              │  │              │  │              │    │
│  │ Breath Engine│  │ Agent Spawner│  │ Failover     │    │
│  │ Orchestrator │  │ LLM Runtime  │  │ Breath Sync  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
│                    Mesh Network                            │
│              (Communication Bus + NATS)                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Synchronization

The Pi fleet uses a multi-master synchronization pattern:

1. **Primary (lucidia)**: Runs main Lucidia breath engine
2. **Runner (blackroad-pi)**: Spawns agents, executes LLM workloads
3. **Backup (lucidia-alt)**: Standby breath engine, takes over if primary fails

All Pis communicate via:
- **Communication Bus**: Pub/sub messaging
- **State Store**: Shared state (Cloudflare KV or Redis)
- **PS-SHA∞ Journal**: Distributed append-only log

## 📊 Monitoring

Each Pi exposes:
- **Health endpoint**: `http://<pi-ip>:8000/health`
- **Metrics endpoint**: `http://<pi-ip>:8000/metrics`
- **Agent status**: `http://<pi-ip>:8000/agents`

View consolidated dashboard:
```bash
./pi-deploy/monitor-pis.sh
```

## 🛠️ Troubleshooting

### Pi not responding
```bash
# Check network connectivity
ping 192.168.4.38

# Check SSH
ssh pi@192.168.4.38 echo "Connected"

# Restart services
ssh pi@192.168.4.38 "sudo systemctl restart blackroad-agent"
```

### Deployment failed
```bash
# View deployment logs
./pi-deploy/check-pi-health.sh

# Retry specific Pi
./pi-deploy/deploy-to-pis.sh lucidia --force
```

### Out of sync
```bash
# Force full sync
./pi-deploy/sync-pis.sh --full

# Check PS-SHA∞ journal consistency
./pi-deploy/verify-pi-sync.sh
```

## 🔐 Security

- SSH key-based authentication (no passwords)
- Private network (192.168.4.x)
- PS-SHA∞ identity verification
- Agent manifest signing

## 📚 Files

- `deploy-to-pis.sh` - Main deployment script
- `sync-pis.sh` - Incremental code sync
- `check-pi-health.sh` - Health monitoring
- `monitor-pis.sh` - Live dashboard
- `verify-pi-sync.sh` - PS-SHA∞ verification
- `pi-config/` - Per-Pi configurations
- `systemd/` - Service definitions

## 🎓 Next Steps

1. Deploy to Pis: `./deploy-to-pis.sh`
2. Verify: `./check-pi-health.sh`
3. Run demo: `ssh pi@192.168.4.38 "cd ~/blackroad && python3 examples/complete_agent_system_demo.py"`
4. Monitor: `./monitor-pis.sh`

For questions: blackroad.systems@gmail.com
