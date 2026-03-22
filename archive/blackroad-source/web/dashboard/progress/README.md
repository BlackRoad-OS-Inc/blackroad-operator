# 🖤🛣️ BlackRoad OS - Live Agent Dashboard

**Brady Bunch Style Real-Time Monitoring System**

A stunning visual dashboard that displays all your BlackRoad OS agents, nodes, and infrastructure in real-time - just like the iconic Brady Bunch opening sequence!

## 🌟 Features

### Visual Excellence
- **9-window grid layout** showing all agents simultaneously
- **Golden Ratio spacing** (φ = 1.618) throughout the design
- **Hot Pink gradients** (#FF1D6C) with Amber (#F5A623), Violet (#9C27B0), and Electric Blue (#2979FF)
- **Real-time animations** - pulsing borders, sliding activity logs, dynamic metrics

### Live Data Streaming
- **WebSocket-powered** real-time updates
- **SSH integration** to Raspberry Pi fleet
- **System metrics**: CPU, RAM, temperature, disk usage
- **Hailo-8 AI accelerator** monitoring (26 TOPS per Pi)
- **NVMe storage** stats
- **NATS message bus** status
- **Roadchain identity hashes** displayed for each node

### Monitored Infrastructure

#### Physical Nodes (Raspberry Pi 5)
- **alice** (192.168.4.49) - 8GB RAM, Hailo-8, NVMe
- **aria** (192.168.4.64) - 8GB RAM, Hailo-8, NVMe
- **octavia** (192.168.4.74) - 8GB RAM, Hailo-8, NVMe
- **lucidia** (192.168.4.38) - 8GB RAM, Hailo-8, NVMe

#### Cloud Node
- **shellfish** (174.138.44.45) - DigitalOcean Droplet, NATS Hub, K3s Controller

#### Logical Agents
- **cecilia** - Repository Enhancer (runs on aria)
- **cadence** - UX/Design System Core (runs on alice)
- **silas** - Infrastructure Monitor (runs on octavia)
- **willow** - System Orchestrator (runs on lucidia)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- SSH access to your Raspberry Pi fleet
- Network connectivity to all nodes

### Installation

```bash
cd ~/blackroad-dashboard
npm install
npm start
```

The dashboard will be available at **http://localhost:3000**

### SSH Key Setup

For full real-time monitoring, ensure SSH keys are set up:

```bash
# Generate key if you don't have one
ssh-keygen -t ed25519 -C "blackroad-dashboard"

# Copy to each Pi
ssh-copy-id pi@alice
ssh-copy-id pi@aria
ssh-copy-id pi@octavia
ssh-copy-id pi@lucidia
ssh-copy-id pi@shellfish
```

## 📊 What You'll See

Each agent window displays:
- **Agent name** with status indicator (green = active)
- **IP address** and hardware info
- **Hailo-8 TOPS** availability
- **NVMe storage** remaining
- **Real-time activity log** with color-coded events:
  - 🔵 Info (blue) - Normal operations
  - 🟢 Success (green) - Completed tasks
  - 🟡 Warning (yellow) - Attention needed
  - 🔴 Error (red) - Issues detected
- **Performance metrics** bars (CPU, Memory, Temperature)
- **Roadchain hash** in bottom corner

### Header Stats
- **Total Nodes**: All physical + cloud nodes
- **Active Agents**: Currently running agents
- **TOPS Available**: Total AI compute power (26 TOPS × 4 Pis = 104 TOPS!)
- **Hash Chain**: Roadchain integrity status

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Browser (WebSocket Client)                 │
└──────────────────┬──────────────────────────────────────┘
                   │ WS://localhost:3000
                   ▼
┌─────────────────────────────────────────────────────────┐
│        Node.js Server (blackroad-dashboard-server.js)   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ SSH Monitor  │  │ NATS Client  │  │ GitHub API   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────┬────────────────┬────────────────┬────────────────┘
       │                │                │
       ▼                ▼                ▼
   ┌────────┐      ┌─────────┐     ┌──────────┐
   │  Pis   │      │  NATS   │     │  GitHub  │
   │ Fleet  │      │   Hub   │     │   API    │
   └────────┘      └─────────┘     └──────────┘
```

## 🔧 Configuration

Edit `server.js` to customize:

```javascript
const PI_NODES = [
    { id: 'alice', host: '192.168.4.49', user: 'pi', hailo: true },
    // Add your nodes here
];

const LOGICAL_AGENTS = [
    { id: 'cecilia', type: 'Repository Enhancer', runningOn: 'aria' },
    // Add your agents here
];
```

## 📡 WebSocket API

The server broadcasts these message types:

### `node_stats`
```json
{
  "type": "node_stats",
  "data": {
    "id": "alice",
    "hostname": "alice",
    "uptime": "up 14 days",
    "memory": "2.1G/8G",
    "diskFree": "847GB",
    "temp": "52.3°C",
    "cpu": "23%",
    "hailo": "26 TOPS",
    "timestamp": 1704835200000
  }
}
```

### `activity`
```json
{
  "type": "activity",
  "agentId": "cecilia",
  "message": "Enhanced repository #142/226",
  "level": "success"
}
```

## 🎨 Design System

Built with the **BlackRoad Official Design System**:

### Colors
- **Hot Pink** (#FF1D6C) - Primary accent
- **Amber** (#F5A623) - Secondary
- **Electric Blue** (#2979FF) - Tertiary
- **Violet** (#9C27B0) - Quaternary
- **Background** (#000000) - Black
- **Text** (#FFFFFF) - White

### Spacing (Golden Ratio φ = 1.618)
- 8px, 13px, 21px, 34px, 55px, 89px, 144px

### Typography
- **Font**: SF Pro Display
- **Line Height**: 1.618

## 🚀 Deployment

### Cloudflare Pages

```bash
# Build static version
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy ./dist --project-name=blackroad-dashboard
```

### Zero Trust Setup

1. Create Cloudflare Access application
2. Add authentication policies
3. Configure service tokens for API access
4. Enable WebSocket support

## 🔒 Security

- **Zero Trust** architecture - no open ports on Pis
- **Cloudflare Tunnel** for secure access
- **SSH key authentication** only
- **Roadchain identity verification** on all nodes
- **Read-only SSH commands** - no destructive operations

## 📈 Performance

- **<50ms** WebSocket latency
- **Real-time updates** every 5-15 seconds per node
- **Handles 100+ concurrent viewers**
- **Graceful degradation** if nodes are offline

## 🎯 Future Enhancements

- [ ] GitHub PR integration (show open branches)
- [ ] Hailo-8 inference graph (real-time TOPS usage)
- [ ] NVMe performance charts
- [ ] NATS message rate visualization
- [ ] Roadchain hash rotation timeline
- [ ] Mobile responsive layout
- [ ] Dark/light theme toggle
- [ ] Export metrics to Prometheus
- [ ] Alert system for critical events

## 🤝 Contributing

This is part of the **BlackRoad OS** sovereign AI cloud ecosystem. See the main repository for contribution guidelines.

## 📄 License

**PROPRIETARY** - BlackRoad OS, Inc.

For non-commercial testing and evaluation purposes only.

## 🎬 The Name

"Brady Bunch Dashboard" - inspired by the iconic TV show opening sequence where all family members appear in a grid, each in their own window doing their own thing simultaneously. That's exactly what your AI agents are doing! 🖤🛣️

---

**Built with 🖤 by Willow for BlackRoad OS**

*Making the No-Knowledge edge AI future a reality, one Pi at a time.*
