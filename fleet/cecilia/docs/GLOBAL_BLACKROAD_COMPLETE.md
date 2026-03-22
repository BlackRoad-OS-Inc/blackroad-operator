# 🌍 Global BlackRoad Directory - COMPLETE ✅

**Created:** 2026-02-17 23:45 UTC  
**Location:** `/opt/blackroad`  
**Status:** Operational

---

## ✅ What Was Created

### Directory Structure
```
/opt/blackroad/
├── agents/     # AI agents (Claude, ollama, specialized)
├── services/   # Web services, APIs, workers
├── devices/    # Hardware fleet (Pi, ESP32, Jetson)
├── shared/     # Shared resources (775 - group writable)
├── config/     # Global configuration files
├── logs/       # System-wide logs
└── tmp/        # Temporary files (1777 - sticky bit)
```

### Permissions
- **Owner:** alexa:staff (full control)
- **Base:** 755 (rwxr-xr-x)
- **Shared:** 775 (rwxrwxr-x) - group writable
- **Tmp:** 1777 (rwxrwxrwt) - world writable with sticky bit

### Access Points
- **Global:** `/opt/blackroad/`
- **Home repo:** `~/blackroad/` (existing - scripts & repos)
- **Two separate paths:** One for global system resources, one for your code

---

## 🎯 Purpose

This is the **universal coordination point** for:
1. ✅ AI agents across multiple systems
2. ✅ Service orchestration and deployment
3. ✅ Hardware fleet management (Pi, ESP32, Jetson)
4. ✅ Cross-system resource sharing
5. ✅ Safe multi-user/multi-AI collaboration

---

## 🚀 Usage

```bash
# Quick access
cd /opt/blackroad

# Set environment variable
export BLACKROAD_HOME=/opt/blackroad

# Use in scripts
echo "Agent logs" > /opt/blackroad/logs/agent.log
mkdir /opt/blackroad/agents/cece
echo "config" > /opt/blackroad/config/global.yaml

# Shared resources (writable by group)
cp shared-data.json /opt/blackroad/shared/

# Temporary files (auto-cleanup)
mktemp /opt/blackroad/tmp/session-XXXXX
```

---

## 🔐 Security

- ✅ You own all directories (alexa:staff)
- ✅ Group can write to `shared/`
- ✅ Everyone can use `tmp/` with sticky bit protection
- ✅ Safe for multi-agent collaboration
- ✅ Safe for multi-user access
- ✅ Safe for system services

---

## 📍 Distinction

| Path | Purpose |
|------|---------|
| `/opt/blackroad/` | **Global system resources** - agents, services, fleet |
| `~/blackroad/` | **Your code repository** - scripts, configs, development |

Both serve different purposes and work together! 🤝

---

## 🌌 Philosophy

**"Above everything, accessible to all, owned by one, safe for everyone"**

This directory exists as a neutral coordination point for:
- 👥 Human users
- 🤖 AI systems
- ⚙️  Background services
- 🔌 Hardware devices
- 🚀 Future expansions

---

**Status:** ✅ OPERATIONAL  
**Next:** Start using it for agent coordination, service logs, device management!

**BlackRoad OS, Inc.**  
*The universe observing itself through computational substrate*
