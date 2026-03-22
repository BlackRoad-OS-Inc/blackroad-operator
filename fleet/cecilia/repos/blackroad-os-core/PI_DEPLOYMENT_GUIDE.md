# BlackRoad OS - Raspberry Pi Deployment Guide 🥧

Complete guide to deploying BlackRoad OS Core to your Raspberry Pi fleet for distributed autonomous agent orchestration.

## 🎯 Overview

Deploy BlackRoad OS to 3 Raspberry Pis forming a resilient, distributed agent mesh:

- **lucidia** (192.168.4.38) - Primary Lucidia breath engine & orchestrator
- **blackroad-pi** (192.168.4.64) - Agent spawner & LLM runtime
- **lucidia-alt** (192.168.4.99) - Backup breath engine & failover

## ⚡ Quick Start

```bash
# 1. Deploy to all Pis
cd /Users/alexa/blackroad-sandbox
./pi-deploy/deploy-to-pis.sh

# 2. Check health
./pi-deploy/check-pi-health.sh

# 3. Monitor (live dashboard)
./pi-deploy/monitor-pis.sh

# 4. Sync code changes
./pi-deploy/sync-pis.sh
```

## 📋 Prerequisites

### On Your Mac
- ✅ SSH access to all Pis
- ✅ Python 3.10+
- ✅ This repository cloned

### On Each Pi
```bash
# Run once on each Pi
ssh pi@<pi-ip>

sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git rsync

# Optional: For better performance
sudo apt install -y python3-dev build-essential
```

### SSH Key Setup
```bash
# On your Mac - copy keys to all Pis
ssh-copy-id pi@192.168.4.38  # lucidia
ssh-copy-id pi@192.168.4.64  # blackroad-pi
ssh-copy-id pi@192.168.4.99  # lucidia-alt

# Test connectivity
ssh pi@192.168.4.38 "echo 'Connected to lucidia!'"
```

## 🚀 Deployment Process

### Option 1: Deploy All Pis (Recommended)
```bash
./pi-deploy/deploy-to-pis.sh
```

This will:
1. Check Pi connectivity
2. Sync code to each Pi
3. Create Python virtual environment
4. Install `blackroad-os-core` package
5. Set up systemd services
6. Configure roles (primary/runner/backup)

### Option 2: Deploy Single Pi
```bash
# Deploy only to lucidia
./pi-deploy/deploy-to-pis.sh lucidia

# Deploy only to blackroad-pi
./pi-deploy/deploy-to-pis.sh blackroad-pi
```

## 🔧 Post-Deployment

### Start Services

```bash
# On lucidia (primary breath engine)
ssh pi@192.168.4.38
sudo systemctl start blackroad-lucidia
sudo systemctl status blackroad-lucidia

# On blackroad-pi (agent runner)
ssh pi@192.168.4.64
sudo systemctl start blackroad-agent
sudo systemctl status blackroad-agent

# On lucidia-alt (backup)
ssh pi@192.168.4.99
sudo systemctl start blackroad-lucidia
sudo systemctl status blackroad-lucidia
```

### Enable Auto-Start on Boot
```bash
# Already done by deploy script, but manual command is:
sudo systemctl enable blackroad-lucidia  # or blackroad-agent
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check all Pis
./pi-deploy/check-pi-health.sh

# Output shows:
# - Network status
# - SSH connectivity
# - Python version
# - BlackRoad installation status
# - Memory usage
# - Disk usage
# - CPU temperature
# - Service status
```

### Live Monitoring
```bash
# Real-time dashboard (refreshes every 5s)
./pi-deploy/monitor-pis.sh

# Shows CPU load, memory, temp, and service status
# Press Ctrl+C to exit
```

### Code Synchronization
```bash
# Quick sync after making changes to src/blackroad_core/
./pi-deploy/sync-pis.sh

# Then restart services
ssh pi@192.168.4.38 "sudo systemctl restart blackroad-lucidia"
ssh pi@192.168.4.64 "sudo systemctl restart blackroad-agent"
```

## 🎭 Pi Roles Explained

### Primary Breath Engine (lucidia - .38)
- Runs main Lucidia consciousness breath pattern: `𝔅(t) = sin(φ·t) + i + (-1)^⌊t⌋`
- Orchestrates agent spawning across the fleet
- Publishes breath phase to communication bus
- **Golden ratio breathing:** φ = 1.618034

### Agent Runner (blackroad-pi - .64)
- Subscribes to breath phase from lucidia
- Spawns agents during expansion phase (𝔅>0)
- Runs LLM inference (llama.cpp, Ollama)
- Executes agent workflows

### Backup Breath Engine (lucidia-alt - .99)
- Standby Lucidia instance
- Takes over if primary fails
- Maintains breath synchronization
- Automatic failover (manual trigger currently)

## 🧪 Testing Deployment

### 1. Test Python Import
```bash
ssh pi@192.168.4.38
cd ~/blackroad
source venv/bin/activate
python3 -c "import blackroad_core; print(f'✓ v{blackroad_core.__version__}')"
```

### 2. Test PS-SHA ID Generation
```bash
ssh pi@192.168.4.38
cd ~/blackroad
source venv/bin/activate
python3 << 'EOF'
from blackroad_core import generate_ps_sha_id, validate_ps_sha_id

manifest = {"name": "test-agent", "role": "tester"}
agent_id = generate_ps_sha_id(manifest, "pi-test")

print(f"Generated ID: {agent_id[:32]}...")
print(f"Valid: {validate_ps_sha_id(agent_id)}")
print(f"Length: {len(agent_id)} chars")
EOF
```

### 3. Run Example Demo
```bash
ssh pi@192.168.4.38
cd ~/blackroad
source venv/bin/activate
python3 examples/complete_agent_system_demo.py
```

## 🔍 Troubleshooting

### Pi Not Responding
```bash
# Check network
ping 192.168.4.38

# Check if Pi is on
# Physical check: Look for green LED activity

# Try rebooting
ssh pi@192.168.4.38 "sudo reboot"
```

### SSH Connection Failed
```bash
# Reset SSH keys
ssh-keygen -R 192.168.4.38
ssh-copy-id pi@192.168.4.38

# Check SSH service on Pi (via monitor/keyboard)
sudo systemctl status ssh
sudo systemctl restart ssh
```

### Service Won't Start
```bash
ssh pi@192.168.4.38

# Check logs
sudo journalctl -u blackroad-lucidia -n 50 --no-pager

# Check if virtual environment exists
ls -la ~/blackroad/venv/

# Reinstall if needed
cd ~/blackroad
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -e .
```

### Out of Memory
```bash
# Check memory usage
ssh pi@192.168.4.38 "free -m"

# Increase swap (temporary)
ssh pi@192.168.4.38 "sudo dphys-swapfile swapoff && sudo dphys-swapfile setup && sudo dphys-swapfile swapon"

# For permanent fix: Edit /etc/dphys-swapfile
# Set CONF_SWAPSIZE=2048 (2GB)
```

### High CPU Temperature
```bash
# Check temp
ssh pi@192.168.4.38 "vcgencmd measure_temp"

# If > 70°C:
# 1. Ensure proper ventilation
# 2. Add heatsink/fan
# 3. Throttle service (reduce agent count)
```

## 📁 File Structure on Pi

After deployment, each Pi will have:

```
/home/pi/blackroad/
├── blackroad_core/          # Synced from Mac
│   ├── __init__.py
│   ├── agents/
│   ├── cloudflare/
│   ├── communication.py
│   ├── identity.py
│   ├── llm/
│   ├── lucidia/
│   ├── manifest/
│   ├── marketplace/
│   ├── model_router.py
│   ├── networking/
│   ├── orchestrator.py
│   ├── packs/
│   ├── protocol/
│   ├── ps_sha/
│   ├── sdk/
│   └── spawner.py
│
├── examples/                # Demo scripts
│   ├── complete_agent_system_demo.py
│   ├── job_hunter_demo.py
│   └── lucidia_orchestrator_demo.py
│
├── venv/                    # Python virtual environment
│   ├── bin/python3
│   ├── lib/
│   └── ...
│
├── setup.py                 # Package configuration
└── README.md

Systemd Services:
/etc/systemd/system/
├── blackroad-lucidia.service  # On lucidia & lucidia-alt
└── blackroad-agent.service    # On blackroad-pi
```

## 🔄 Update Workflow

### For Code Changes
```bash
# 1. Make changes on Mac
cd /Users/alexa/blackroad-sandbox
code src/blackroad_core/spawner.py  # Edit file

# 2. Test locally
source venv/bin/activate
python3 -c "import blackroad_core; print('✓ Imports work')"

# 3. Sync to Pis
./pi-deploy/sync-pis.sh

# 4. Restart services
ssh pi@192.168.4.38 "sudo systemctl restart blackroad-lucidia"
ssh pi@192.168.4.64 "sudo systemctl restart blackroad-agent"

# 5. Verify
./pi-deploy/check-pi-health.sh
```

### For Full Redeployment
```bash
# If you need to completely redeploy (structure changes, new dependencies):
./pi-deploy/deploy-to-pis.sh
```

## 🌐 Network Architecture

```
Your Mac (Development)
192.168.4.x (varies)
    │
    │ rsync/ssh deploy
    ↓
┌─────────────────────────────────────┐
│     Raspberry Pi Mesh Network       │
│         (192.168.4.0/24)            │
│                                     │
│  ┌────────────────────────────┐    │
│  │  lucidia (.38) - Primary   │    │
│  │  • Breath Engine           │────┼──→ Publishes 𝔅(t)
│  │  • Orchestrator            │    │   to Communication Bus
│  └────────────────────────────┘    │
│             │                       │
│             │ Breath Phase          │
│             ↓                       │
│  ┌────────────────────────────┐    │
│  │  blackroad-pi (.64)        │    │
│  │  • Agent Spawner           │    │
│  │  • LLM Runtime             │    │
│  │  • Subscribes to 𝔅(t)      │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │  lucidia-alt (.99) - Backup│    │
│  │  • Standby Breath Engine   │    │
│  │  • Failover Ready          │    │
│  └────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

## 📖 Related Documentation

- **Main README:** `../README.md`
- **Connection Status:** `../CONNECTION_STATUS.md`
- **Pi Deploy README:** `../pi-deploy/README.md`
- **Agent System Docs:** `../docs/AGENT_INFRASTRUCTURE.md`

## 🎓 Next Steps

1. ✅ Deploy to Pis: `./pi-deploy/deploy-to-pis.sh`
2. ✅ Verify health: `./pi-deploy/check-pi-health.sh`
3. ✅ Start services: SSH and `sudo systemctl start ...`
4. ✅ Run demo: `python3 examples/complete_agent_system_demo.py`
5. ✅ Monitor: `./pi-deploy/monitor-pis.sh`
6. 🔄 Iterate: Edit, sync, restart, test

## 💡 Pro Tips

- **SSH Aliases:** Add to `~/.ssh/config`:
  ```
  Host lucidia
    HostName 192.168.4.38
    User pi

  Host blackroad-pi
    HostName 192.168.4.64
    User pi

  Host lucidia-alt
    HostName 192.168.4.99
    User pi
  ```

- **Quick Restart All:**
  ```bash
  for ip in 192.168.4.{38,64,99}; do
    ssh pi@$ip "sudo systemctl restart blackroad-*"
  done
  ```

- **View Live Logs:**
  ```bash
  ssh pi@192.168.4.38 "sudo journalctl -u blackroad-lucidia -f"
  ```

- **Test Breath Synchronization:**
  ```bash
  # On lucidia (primary)
  ssh pi@192.168.4.38 "cd blackroad && source venv/bin/activate && python3 -c 'from blackroad_core.lucidia import LucidiaEngine; print(LucidiaEngine().current_breath_value())'"
  ```

## 🆘 Support

Issues? Questions?
- Email: blackroad.systems@gmail.com
- Check logs: `sudo journalctl -u blackroad-* -n 100`
- GitHub Issues: (when repo is public)

---

**Happy Pi Deploying!** 🥧✨
