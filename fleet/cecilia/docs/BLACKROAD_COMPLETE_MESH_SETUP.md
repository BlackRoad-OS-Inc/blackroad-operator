# BlackRoad Complete Mesh - All Devices Integration
**Tailscale + NATS + MQTT Unified Network**  
**Date:** 2026-02-11

---

## 🌐 COMPLETE TOPOLOGY

```
┌───────────────────────────────────────────────────────────┐
│              BLACKROAD UNIFIED MESH                        │
│              Tailscale VPN (100.x.x.x)                    │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ORCHESTRATION LAYER (MacBooks)                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │ MacBook #1 (Monitoring)   → Grafana + InfluxDB  │    │
│  │ MacBook #2 (LLM Brain)    → Ollama + NATS       │    │
│  │ MacBook #3 (Dev/M1)       → Git + CI/CD         │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  INTERFACE LAYER (iPads)                                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │ iPad Pro 12.9" (2015)     → Agent Terminal #1   │    │
│  │ iPad #2 (TBD)             → Agent Terminal #2   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  CONSTELLATION LAYER (New Build)                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Pi-Ops (192.168.4.202)    → MQTT Broker         │    │
│  │ Pi-Holo (192.168.4.200)   → Hologram Display    │    │
│  │ Jetson (192.168.4.201)    → Agent UI            │    │
│  │ Pi-Zero (192.168.4.203)   → Sim Output          │    │
│  │ Pi-400 (192.168.4.204)    → Admin Console       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  PRODUCTION LAYER (Existing Cluster)                      │
│  ┌──────────────────────────────────────────────────┐    │
│  │ alice (192.168.4.49)      → Headscale + AI      │    │
│  │ lucidia (192.168.4.81)    → Services Hub        │    │
│  │ octavia (192.168.4.38)    → AI Accelerator      │    │
│  │ aria (192.168.4.82)       → Compute/Sim         │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
└───────────────────────────────────────────────────────────┘

         COMMUNICATION PROTOCOLS
         ┌────────────────────────┐
         │ Tailscale → Security   │
         │ NATS      → Events     │
         │ MQTT      → Sensors    │
         │ HTTP/WS   → Dashboards │
         └────────────────────────┘
```

---

## 💻 DEVICE ROLES & RESPONSIBILITIES

### MacBook #1 - "The Monitor" (Maggie's Dad)
**Hardware:** ~2014 Intel MacBook  
**Tailscale Name:** macbook-monitor  
**IP:** 100.x.x.x (auto-assigned)

**Services:**
- **Grafana** (port 3001) - System-wide monitoring dashboards
- **InfluxDB** (port 8086) - Time-series metrics storage
- **MQTT Explorer** - Live event bus visualization
- **Prometheus** - Metrics scraping

**Namespace:** `weird-stuff/*` (sandbox for experiments)

**Setup:**
```bash
# Install Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Tailscale
brew install tailscale
sudo tailscale up --hostname=macbook-monitor

# Install monitoring stack
brew install grafana influxdb prometheus
brew services start grafana
brew services start influxdb
brew services start prometheus

# Install MQTT Explorer
brew install --cask mqttexplorer

# Get Tailscale IP
tailscale ip -4
```

**Access Grafana:** `http://macbook-monitor.local:3001`

---

### MacBook #2 - "The Backup" (Optional Development)
**Hardware:** ~2014 Intel MacBook  
**Tailscale Name:** macbook-dev  
**IP:** 100.x.x.x (auto-assigned)

**NOTE:** ⚠️ **LUCIDIA (Pi 5) ALREADY HAS NATS + OLLAMA!**

**Revised Role:**
- Backup development station
- Testing/experimentation
- CI/CD runner (if needed)
- OR: Give to Maggie's dad for tinkering

**What Lucidia Already Provides:**
- ✅ NATS event bus at `192.168.4.81:4222`
- ✅ Ollama LLM at `192.168.4.81:11434`
- ✅ Edge agent coordination

**Setup (Minimal):**
```bash
# Install Tailscale only
brew install tailscale
sudo tailscale up --hostname=macbook-dev

# Test existing services on lucidia
curl http://192.168.4.81:4222  # NATS
curl http://192.168.4.81:11434/api/tags  # Ollama models

# Connect to NATS
nats context add lucidia --server nats://192.168.4.81:4222
nats sub "agent.>"
```

**You DON'T need to install Ollama/NATS here - use Lucidia!**

---

### MacBook #3 - "Alexandria" (Dev Station)
**Hardware:** MacBook Pro M1 8GB (CURRENT)  
**Tailscale Name:** alexandria  
**IP:** 192.168.4.28 (local), 100.x.x.x (Tailscale)

**Services:**
- **Development Environment** - VS Code, Git, etc.
- **CI/CD Runner** - GitHub Actions self-hosted
- **Backup Orchestration** - HA failover for MacBook #2
- **Tailscale Exit Node** (optional) - Secure remote access

**Setup:**
```bash
# Install Tailscale
brew install tailscale
sudo tailscale up --hostname=alexandria

# Enable as exit node (optional)
sudo tailscale up --advertise-exit-node

# Install GitHub Actions runner (optional)
# https://github.com/organizations/blackboxprogramming/settings/actions/runners/new

# Install development tools (already done)
brew install git gh node python3 docker

# Set up wake-on-LAN for MacBook #2
brew install wakeonlan
# Save MacBook #2 MAC address
echo "XX:XX:XX:XX:XX:XX" > ~/.macbook-brain-mac
```

**Wake MacBook #2:**
```bash
wakeonlan $(cat ~/.macbook-brain-mac)
```

---

### iPad Pro 12.9" (2015) - "Agent Terminal #1"
**Hardware:** A9X, iOS 16 max  
**Name:** agent-terminal-1  
**Role:** Primary agent interface

**Setup:**

**1. Install Apps (App Store):**
- **Blink Shell** - SSH/mosh client
- **iSH** - Alpine Linux environment
- **MQTT Client** - iOS MQTT app (any free one)

**2. Configure Blink Shell:**
```
Add Hosts:
  - pi-ops.local (192.168.4.202)
  - pi-holo.local (192.168.4.200)
  - jetson-agent.local (192.168.4.201)
  - alice (192.168.4.49)

Import SSH Keys:
  - Copy from Mac via AirDrop or paste
```

**3. Set up iSH:**
```sh
# Inside iSH app:
apk update
apk add python3 mosquitto-clients openssh-client curl

# Subscribe to agent messages
mosquitto_sub -h 192.168.4.202 -t "agent/phone/1" -v
```

**4. Web Dashboard Access:**
```
Safari → http://192.168.4.202:3000
(Dashboard served from Pi-Ops)

Add to Home Screen → "Agent Dashboard"
```

**5. Enable Kiosk Mode:**
```
Settings → Accessibility → Guided Access → Enable
Open dashboard → Triple-click Home button → Start Guided Access
(Locks into fullscreen kiosk mode)
```

**6. WebRTC "Phone" Setup:**
```
Safari → https://192.168.4.202:8443/agent-phone-1
Allow microphone/camera access
Bookmark as "Agent Phone"
```

---

### iPad #2 - "Agent Terminal #2"
**Hardware:** TBD (old 30-pin era)  
**Status:** Too old for production use

**Options:**
1. **Donate to Maggie's Dad** for experiments
2. **Recycle** at Apple Store
3. **Keep as backup** if battery works

If it's surprisingly newer (iPad Air 2+), repeat iPad Pro setup above.

---

## 🔧 ONBOARDING SCRIPT - ALL AT ONCE

### Master Setup Script
Save as `~/setup-blackroad-mesh.sh`:

```bash
#!/bin/bash
# BlackRoad Mesh Onboarding - Run on each device

set -e

echo "🖤 BlackRoad Mesh Onboarding"
echo "============================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
elif [[ -f /etc/os-release ]]; then
    . /etc/os-release
    if [[ "$ID" == "raspbian" ]] || [[ "$ID" == "debian" ]]; then
        OS="pi"
    fi
else
    echo "❌ Unsupported OS"
    exit 1
fi

echo "Detected OS: $OS"
echo ""

# Ask for hostname
read -p "Enter hostname for this device: " HOSTNAME
echo ""

# Install Tailscale
echo "📦 Installing Tailscale..."
if [[ "$OS" == "mac" ]]; then
    brew install tailscale || echo "Tailscale already installed"
    sudo tailscale up --hostname=$HOSTNAME
elif [[ "$OS" == "pi" ]]; then
    curl -fsSL https://tailscale.com/install.sh | sh
    sudo tailscale up --hostname=$HOSTNAME
fi

# Get Tailscale IP
TS_IP=$(tailscale ip -4)
echo "✅ Tailscale IP: $TS_IP"
echo ""

# Install MQTT client
echo "📦 Installing MQTT client..."
if [[ "$OS" == "mac" ]]; then
    brew install mosquitto
elif [[ "$OS" == "pi" ]]; then
    sudo apt install -y mosquitto-clients
fi

# Test connection to broker
echo "🧪 Testing MQTT connection to pi-ops..."
if mosquitto_pub -h 192.168.4.202 -t "system/heartbeat/$HOSTNAME" -m "online" 2>/dev/null; then
    echo "✅ MQTT connection successful"
else
    echo "⚠️  MQTT broker not reachable yet (run this script on pi-ops first)"
fi
echo ""

# Device-specific setup
if [[ "$HOSTNAME" == "macbook-brain" ]]; then
    echo "🧠 Setting up Agent Orchestration Brain..."
    
    # Install Ollama
    if ! command -v ollama &> /dev/null; then
        echo "Installing Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh
    fi
    
    # Install NATS
    if [[ "$OS" == "mac" ]]; then
        brew install nats-server
        brew services start nats-server
    fi
    
    # Pull models
    echo "Pulling LLM models (this may take a while)..."
    ollama pull llama3.2:3b
    ollama pull phi3
    
    echo "✅ Brain setup complete"
    
elif [[ "$HOSTNAME" == "macbook-monitor" ]]; then
    echo "📊 Setting up Monitoring Station..."
    
    if [[ "$OS" == "mac" ]]; then
        brew install grafana influxdb prometheus
        brew services start grafana
        brew services start influxdb
        brew services start prometheus
        
        echo "✅ Monitoring setup complete"
        echo "📊 Grafana: http://localhost:3001"
        echo "📊 InfluxDB: http://localhost:8086"
    fi
    
elif [[ "$HOSTNAME" == "pi-ops" ]]; then
    echo "🎛️ Setting up Operations Hub..."
    
    # Install MQTT broker
    sudo apt install -y mosquitto mosquitto-clients
    sudo systemctl enable mosquitto
    sudo systemctl start mosquitto
    
    # Install monitoring tools
    sudo apt install -y btop python3-pip python3-serial
    
    # Set static IP
    if ! grep -q "static ip_address=192.168.4.202" /etc/dhcpcd.conf; then
        echo "interface eth0" | sudo tee -a /etc/dhcpcd.conf
        echo "static ip_address=192.168.4.202/24" | sudo tee -a /etc/dhcpcd.conf
        echo "static routers=192.168.4.1" | sudo tee -a /etc/dhcpcd.conf
        echo "static domain_name_servers=192.168.4.1 8.8.8.8" | sudo tee -a /etc/dhcpcd.conf
        echo "⚠️  Reboot required for static IP"
    fi
    
    echo "✅ Pi-Ops setup complete"
    
elif [[ "$HOSTNAME" == "pi-holo" ]]; then
    echo "🎨 Setting up Hologram Renderer..."
    
    # Install camera support
    sudo apt install -y python3-picamera2 libcamera-apps
    
    # Set static IP
    if ! grep -q "static ip_address=192.168.4.200" /etc/dhcpcd.conf; then
        echo "interface eth0" | sudo tee -a /etc/dhcpcd.conf
        echo "static ip_address=192.168.4.200/24" | sudo tee -a /etc/dhcpcd.conf
        echo "static routers=192.168.4.1" | sudo tee -a /etc/dhcpcd.conf
        echo "static domain_name_servers=192.168.4.1 8.8.8.8" | sudo tee -a /etc/dhcpcd.conf
        echo "⚠️  Reboot required for static IP"
    fi
    
    echo "✅ Pi-Holo setup complete"
fi

echo ""
echo "🎉 Onboarding complete for $HOSTNAME!"
echo "🌐 Tailscale IP: $TS_IP"
echo "🔗 Local IP: $(hostname -I | awk '{print $1}')"
echo ""
echo "Next steps:"
echo "  - Run this script on other devices"
echo "  - Test connectivity: ping $HOSTNAME"
echo "  - Check MQTT: mosquitto_sub -h 192.168.4.202 -t '#' -v"
echo ""
```

---

## 🚀 DEPLOYMENT ORDER

### Phase 1: Core Infrastructure (Day 1)

1. **Pi-Ops first** (MQTT broker is critical):
```bash
# Flash SD card with 'pi-ops.local' hostname
# Boot, SSH in, run:
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/setup-blackroad-mesh.sh | bash
```

2. **MacBook #3 (Alexandria - your current Mac)**:
```bash
cd ~
curl -O https://raw.githubusercontent.com/YOUR_REPO/setup-blackroad-mesh.sh
chmod +x setup-blackroad-mesh.sh
./setup-blackroad-mesh.sh
# Enter hostname: alexandria
```

3. **Pi-Holo**:
```bash
# Flash SD card with 'pi-holo.local' hostname
# Boot, SSH in, run script
```

4. **Verify mesh**:
```bash
# From Alexandria:
ping pi-ops
ping pi-holo
ssh pi@pi-ops.local
ssh pi@pi-holo.local
```

### Phase 2: Orchestration Layer (Day 2)

5. **MacBook #2 (The Brain)**:
```bash
# Run onboarding script
./setup-blackroad-mesh.sh
# Enter hostname: macbook-brain

# Wait for Ollama models to download (~10GB)
```

6. **MacBook #1 (Monitoring)**:
```bash
# Run onboarding script
./setup-blackroad-mesh.sh
# Enter hostname: macbook-monitor
```

### Phase 3: Constellation (Day 3)

7. **Jetson Orin Nano**
8. **Pi Zero W**
9. **Pi 400**

### Phase 4: Interfaces (Day 4)

10. **iPad Pro** - Manual setup (apps from App Store)
11. **iPad #2** - Assess, then setup or retire

---

## 🧪 VERIFICATION TESTS

### Test 1: Tailscale Mesh Connectivity
```bash
# From any device:
tailscale status

# Should show all devices:
# 100.x.x.x   alexandria
# 100.x.x.x   macbook-brain
# 100.x.x.x   macbook-monitor
# 100.x.x.x   pi-ops
# 100.x.x.x   pi-holo
# etc.
```

### Test 2: MQTT Pub/Sub
```bash
# Terminal 1 (subscriber):
mosquitto_sub -h pi-ops.local -t "test/#" -v

# Terminal 2 (publisher):
mosquitto_pub -h pi-ops.local -t "test/hello" -m "Mesh online!"

# Should see in Terminal 1:
# test/hello Mesh online!
```

### Test 3: NATS Event Bus
```bash
# Subscribe to events:
nats sub "agent.>"

# Publish event:
nats pub agent.test "Hello from agent"
```

### Test 4: Cross-device SSH
```bash
# From Alexandria, SSH into every device:
ssh pi@pi-ops
ssh pi@pi-holo
ssh pi@alice
ssh macbook-brain.local
```

### Test 5: Ollama LLM Test (on MacBook #2)
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Say hello in JSON format",
  "stream": false
}'
```

---

## 📊 POWER MANAGEMENT

### Always-On (24/7):
- Pi-Ops (MQTT broker - critical)
- Pi-Holo (display node)
- Jetson (agent UI)
- iPad Pro (kiosk mode, 5-10W)

**Total:** ~100-150W

### Wake-on-Demand:
- MacBook #1 (monitoring - wake when needed)
- MacBook #2 (LLM inference - wake for heavy tasks)

### Sleep When Idle:
- Pi-400 (admin console)
- Pi Zero (sim output)
- MacBook #3 (dev machine)

### UPS Recommendation:
**APC Back-UPS Pro 1500VA** (~$200)
- 900W output
- 10-15 minutes runtime at full load
- Enough to safely shut down everything

---

## 🌐 NETWORK MAP

```
192.168.4.1         Router/Gateway
192.168.4.28        Alexandria (M1 Mac)
192.168.4.49        alice (existing Pi)
192.168.4.81        lucidia (existing Pi)
192.168.4.38        octavia (existing Pi)
192.168.4.82        aria (existing Pi)
192.168.4.200       Pi-Holo (new Pi 5)
192.168.4.201       Jetson Orin Nano
192.168.4.202       Pi-Ops (new Pi 5)
192.168.4.203       Pi-Zero-Sim
192.168.4.204       Pi-400
192.168.4.205       MacBook #1 (WiFi)
192.168.4.206       MacBook #2 (WiFi)
192.168.4.210       iPad Pro (WiFi)
192.168.4.211       iPad #2 (WiFi)

100.x.x.x range     Tailscale VPN (all devices)
```

---

## 📱 iPad Dashboard Deployment

### On Pi-Ops, create dashboard:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Create dashboard
mkdir -p ~/agent-dashboard
cd ~/agent-dashboard

# Quick React dashboard
npx create-react-app . --template minimal
# Edit src/App.js to fetch from MQTT WebSocket
npm run build

# Serve with nginx
sudo apt install -y nginx
sudo cp -r build/* /var/www/html/
sudo systemctl restart nginx
```

### Access from iPad:
```
Safari → http://192.168.4.202
Add to Home Screen → "Agent Dashboard"
Enable Guided Access → Lock into fullscreen
```

---

## 🎯 SUCCESS CRITERIA

After complete onboarding, you should have:

- [x] All devices on Tailscale mesh (100.x.x.x IPs)
- [x] MQTT broker running on Pi-Ops
- [x] NATS running on MacBook #2
- [x] Ollama with 3 models on MacBook #2
- [x] Grafana accessible from MacBook #1
- [x] SSH access between all devices
- [x] iPad showing web dashboard in kiosk mode
- [x] Static IPs for all Pi nodes
- [x] Heartbeat messages from all nodes

**Total Compute Nodes:** 13
- 4 Raspberry Pis (production cluster)
- 2 Raspberry Pi 5s (constellation)
- 1 Jetson Orin Nano
- 1 Pi Zero W
- 1 Pi 400
- 3 MacBooks
- (iPads as terminals, not compute)

**You now have a 13-node AI cluster with unified networking!** 🚀
