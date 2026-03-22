# BlackRoad Device Expansion & Integration Plan
**Created:** 2026-02-11  
**Status:** Ready for Implementation

## 🖥️ Current Infrastructure

### Raspberry Pi Cluster (All Online ✅)
| Node | IP | Role | Uptime | Load | Status |
|------|-----|------|--------|------|--------|
| **alice** | 192.168.4.49 | AI/Headscale | 2h 19m | 9.30 (high) | ✅ Online |
| **lucidia** | 192.168.4.81 | Primary Services | 19h 53m | 0.14 (healthy) | ✅ Online |
| **octavia** | 192.168.4.38 | AI Accelerator | 29d 20h | 3.10 (moderate) | ✅ Online |
| **aria** | 192.168.4.82 | Compute/Sim | 29d 20h | 0.15 (healthy) | ✅ Online |

### Current Mac
- **lucidia-operator** (This Mac)
- Model: MacBook Pro M1 (2020) - 8GB RAM
- IP: 192.168.4.28
- Role: Development/Operator workstation

---

## 🚀 Expansion Hardware

### MacBooks (Vintage - 30-pin/Lightning Era)
| Device | Estimated Era | Proposed Role | Limitations |
|--------|---------------|---------------|-------------|
| **MacBook #1** (Maggie's Dad) | ~2012-2015 | Monitoring Station | May struggle with modern Docker |
| **MacBook #2** (For Agents) | ~2012-2015 | Agent Orchestrator | Older macOS, limited resources |
| **MacBook #3** (Current/M1) | 2020 | Primary Dev/Control | ✅ Modern, capable |

### iPads (30-pin Charger Era = Pre-2012)
| Device | Era | iOS Max | Proposed Role | Reality Check |
|--------|-----|---------|---------------|---------------|
| **iPad Pro 12.9"** | 2015 | iOS 16 | Display Terminal | ✅ Best option for kiosk |
| **iPad #2** | ~2010-2012 | iOS 9-10 | Retired/Parts | ❌ Too old for any use |
| **iPad #3** | ~2010-2012 | iOS 9-10 | Retired/Parts | ❌ Too old for any use |

---

## 🎯 Realistic Integration Strategy

### Tier 1: Production Nodes (Keep As-Is)
**Raspberry Pi Cluster (4 nodes)**
- Already running 24/7
- Hosting BlackRoad services
- 29 days uptime on aria/octavia
- **Action:** Monitor, don't disrupt

**Current MacBook Pro M1**
- Primary development machine
- Operator workstation
- GitHub operations
- **Action:** Add Tailscale, optimize setup

### Tier 2: Add Value Devices

#### MacBook #1 (Monitoring Station)
**Capabilities:**
- Web browser for dashboards
- SSH terminal access
- Lightweight monitoring tools
- Can run older versions of tools

**Setup Plan:**
```bash
# Install basics (if compatible with old macOS)
brew install tailscale
brew install htop
brew install tmux

# Set up monitoring dashboard in browser
# Point to: http://192.168.4.49:9001 (alice webhook)
# Point to: http://192.168.4.38:3000 (octavia services)
```

**Role:**
- Wall-mounted monitoring display
- Show Grafana/status dashboards
- SSH terminal to all Pis
- No heavy workloads

#### MacBook #2 (Agent Orchestrator)
**If Capable (macOS 10.12+):**
```bash
# Install Tailscale
# Install Ollama (if hardware supports)
# Run lighter LLMs (phi, mistral-7b)
```

**If Too Old (macOS 10.11 or older):**
- Repurpose as dedicated SSH terminal
- Run iSH or Linux VM
- Or donate to Maggie's dad for experiments

**Role (Best Case):**
- Run Ollama with small models
- NATS event bus monitor
- Capability registry viewer
- Agent coordination CLI

**Role (Worst Case):**
- Dedicated terminal to Pi cluster
- Documentation workstation
- Spare parts

#### iPad Pro 12.9" (2015) - Display Terminal ✅
**This Actually Works!**

**Option A: iSH Alpine (Recommended)**
```bash
# Install iSH from App Store (free)
# Inside iSH:
apk add curl wget ssh python3 nodejs
ssh pi@192.168.4.81  # Connect to lucidia
```

**Option B: Kiosk Mode (Most Practical)**
1. Install **Blink Shell** or **Termius** (SSH clients)
2. Enable **Guided Access** (Settings → Accessibility)
3. Mount on wall/stand
4. Display one of:
   - Agent status dashboard
   - System metrics (htop/grafana)
   - Logs streaming
   - Network map visualization

**Setup:**
```bash
# On one of your Pis, create a web dashboard
mkdir -p /var/www/agent-dashboard
cat > /var/www/agent-dashboard/index.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>BlackRoad Agent Status</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { 
      background: #000; 
      color: #0f0; 
      font-family: monospace; 
      padding: 20px;
      font-size: 16px;
    }
    .node { 
      border: 1px solid #0f0; 
      padding: 15px; 
      margin: 10px 0;
    }
    .online { border-color: #0f0; }
    .offline { border-color: #f00; color: #f00; }
  </style>
</head>
<body>
  <h1>🖤 BlackRoad Cluster Status</h1>
  <div id="status"></div>
  <script>
    function updateStatus() {
      fetch('/api/status')
        .then(r => r.json())
        .then(data => {
          document.getElementById('status').innerHTML = 
            data.nodes.map(n => `
              <div class="node ${n.status}">
                <h3>${n.name}</h3>
                <p>IP: ${n.ip} | Uptime: ${n.uptime}</p>
                <p>Load: ${n.load}</p>
              </div>
            `).join('');
        });
    }
    updateStatus();
    setInterval(updateStatus, 5000);
  </script>
</body>
</html>
EOF

# Serve it
python3 -m http.server 8080 --directory /var/www/agent-dashboard
```

Then open on iPad: `http://192.168.4.49:8080`

#### iPads #2 & #3 (Too Old)
**Reality:** iOS 9-10, 30-pin connector, ~12 years old
- App Store no longer accessible
- Security vulnerabilities
- Battery likely degraded

**Options:**
1. **Recycle** them (Apple Store takes them)
2. **Donate** to Maggie's dad for parts/experiments
3. **E-waste** proper disposal
4. **Keep** as emergency backup iPad if battery still holds

---

## 🌐 Network Architecture

### Phase 1: Tailscale Mesh (Week 1)
```bash
# On each capable device:
# 1. This Mac (M1)
brew install tailscale
sudo tailscale up

# 2. Old MacBooks (if macOS 10.12+)
# Download from https://pkgs.tailscale.com/stable/
# Or skip if too old

# 3. Already on Pis (verify)
ssh alice@192.168.4.49 "sudo tailscale status"
```

**Result:** 
- All devices on 100.x.x.x VPN mesh
- Secure access from anywhere
- No port forwarding needed

### Phase 2: Service Distribution (Week 2)

**Raspberry Pis:**
- `alice` → Headscale server, AI workloads
- `lucidia` → Web services (3000-3100)
- `octavia` → Heavy compute, 29-day uptime beast
- `aria` → Simulation/test workloads

**MacBook Pro M1 (Current):**
- Development environment
- Git operations
- Claude/Copilot sessions
- Deployment orchestration

**MacBook #1 (Monitor):**
- Grafana dashboard (read-only)
- Status displays
- Alert notifications

**MacBook #2 (If Capable):**
- Ollama with phi-2 or mistral-7b
- Agent CLI tools
- NATS subscriber for event bus

**iPad Pro 2015:**
- Kiosk display for agent status
- SSH terminal via Blink/Termius
- iSH for lightweight scripts

### Phase 3: Agent Orchestration (Week 3)

**NATS Event Bus:**
- Install on `alice` (already has Headscale)
- Pub/sub for all agents
- MacBooks can subscribe to events

**Capability Registry:**
- SQLite database on `lucidia`
- REST API for agent capabilities
- Web UI for monitoring

**PS-SHA∞ Memory:**
- Append-only journal on `octavia` (29-day uptime!)
- Replicated to `aria` for backup
- MacBook M1 runs search/query tools

---

## 📋 Implementation Checklist

### Week 1: Foundation
- [ ] Install Tailscale on M1 Mac
- [ ] Test Tailscale connections to all Pis
- [ ] Check old MacBook compatibility (macOS version)
- [ ] Decide on old MacBook roles based on capabilities
- [ ] Set up iPad Pro with Blink Shell
- [ ] Create basic web dashboard on one Pi

### Week 2: Integration
- [ ] Deploy monitoring stack (if MacBook #1 capable)
- [ ] Install Ollama on MacBook #2 (if capable)
- [ ] Configure Guided Access on iPad Pro
- [ ] Mount iPad as permanent display
- [ ] Set up SSH keys on all devices
- [ ] Test cross-device communication

### Week 3: Advanced Features
- [ ] Deploy NATS on alice
- [ ] Set up capability registry
- [ ] Configure PS-SHA∞ memory persistence
- [ ] Create agent coordination scripts
- [ ] Build web dashboards for monitoring
- [ ] Document all access patterns

### Week 4: Production
- [ ] Harden security (firewall rules)
- [ ] Set up automatic backups
- [ ] Configure alerts/notifications
- [ ] Load test the mesh network
- [ ] Document runbooks
- [ ] Train on new workflow

---

## 🎯 Quick Start Commands

### Check Old MacBook Capability
```bash
# On the old MacBook:
sw_vers  # Check macOS version
system_profiler SPHardwareDataType  # Check specs
which brew || echo "Need to install Homebrew"
```

### Set Up Tailscale on This Mac
```bash
brew install tailscale
sudo tailscale up
tailscale status  # Should show all Pis
ssh pi@alice  # Connect via Tailscale name
```

### iPad Setup (Manual Steps)
1. App Store → Search "Blink Shell" (free tier)
2. Add connection: `alice@192.168.4.49`
3. Import SSH key or use password
4. Settings → Accessibility → Guided Access → Enable
5. Open Blink → Triple-click Home to lock into app

### Create Simple Dashboard
```bash
# On lucidia (192.168.4.81)
ssh pi@192.168.4.81
mkdir -p ~/dashboard
cd ~/dashboard

cat > index.html <<'EOF'
<!DOCTYPE html>
<html>
<head><title>BlackRoad Status</title></head>
<body style="background:#000;color:#0f0;font-family:monospace;padding:20px">
  <h1>🖤 BlackRoad Cluster</h1>
  <pre id="status">Loading...</pre>
  <script>
    setInterval(() => {
      fetch('/status.json')
        .then(r => r.json())
        .then(d => document.getElementById('status').innerText = 
          JSON.stringify(d, null, 2))
    }, 3000);
  </script>
</body>
</html>
EOF

cat > status.json <<EOF
{
  "updated": "$(date)",
  "nodes": {
    "alice": {"ip": "192.168.4.49", "status": "online"},
    "lucidia": {"ip": "192.168.4.81", "status": "online"},
    "octavia": {"ip": "192.168.4.38", "status": "online"},
    "aria": {"ip": "192.168.4.82", "status": "online"}
  }
}
EOF

python3 -m http.server 8080
```

Then open on iPad: `http://192.168.4.81:8080`

---

## 💡 Realistic Expectations

### What Will Work Well ✅
- Raspberry Pi cluster (already proven 29-day uptime)
- M1 Mac as development hub
- iPad Pro 2015 as kiosk display
- SSH terminals on old Macs
- Web-based dashboards
- Tailscale mesh network

### What Might Struggle ⚠️
- Running modern Docker on old MacBooks
- Heavy LLMs on old hardware
- iOS apps on ancient iPads
- Keeping old hardware alive long-term

### What Won't Work ❌
- Virtualization on 2015 iPad Pro
- Modern Xcode on old MacBooks
- Latest apps on iOS 9-10 iPads
- Expecting old hardware to match new

---

## 🎓 Learning Opportunities

Perfect hardware for Maggie's dad:
- Old MacBook → Learn terminal, networking, Docker basics
- Old iPads → Jailbreak experiments, Linux-on-iOS, hardware hacking
- No risk if broken!

---

## 🔐 Security Notes

**Old Devices = Security Risk**
- No OS updates = vulnerabilities
- Keep on isolated network segment
- Don't store sensitive data
- Use for monitoring/display only
- Keep SSH keys read-only where possible

**Recommended:**
- Put old devices on guest WiFi
- Use Tailscale ACLs to limit access
- Monitor for unusual activity
- Regular security audits

---

## 📊 Expected Outcomes

**Immediate (Week 1-2):**
- All devices networked via Tailscale
- iPad showing live cluster status
- Old MacBook(s) as monitoring displays
- SSH access from anywhere

**Medium-term (Month 1-2):**
- NATS event bus operational
- Agent coordination working
- Memory persistence stable
- Dashboards polished

**Long-term (Month 3+):**
- Full agent swarm operational
- 1000+ agents coordinated
- Old hardware retired/replaced as needed
- New Pis added to cluster

---

## 🚀 Next Steps

1. **Run capability check** on old MacBooks (see Quick Start)
2. **Install Tailscale** on this M1 Mac now
3. **Set up iPad** with Blink Shell this week
4. **Test basic dashboard** on one Pi
5. **Decide** on old MacBook fate based on capabilities

**Ready to start?** Begin with Tailscale installation!
