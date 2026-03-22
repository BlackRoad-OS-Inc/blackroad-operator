# 🚀 BlackRoad OS Dashboard - Quick Start

## What You Just Got

**The "Brady Bunch" Live Agent Dashboard** - A real-time visual monitoring system showing all your BlackRoad OS infrastructure in a stunning 9-window grid!

## Files Created

```
~/blackroad-dashboard/
├── index.html           # The beautiful dashboard UI
├── server.js            # WebSocket server with SSH monitoring
├── package.json         # Node.js dependencies
├── setup-ssh-keys.sh    # SSH key setup automation
├── README.md            # Full documentation
└── QUICKSTART.md        # This file
```

## Instant Access (Simulated Data)

The dashboard is already running! Open in your browser:

```bash
open http://localhost:3000
```

You'll see:
- ✅ 9 agent windows in Brady Bunch grid
- ✅ Real-time activity animations
- ✅ Simulated metrics and logs
- ✅ Beautiful BlackRoad design system

## Get Real Live Data

To connect to your actual Raspberry Pis:

### Step 1: Setup SSH Keys

```bash
cd ~/blackroad-dashboard
./setup-ssh-keys.sh
```

This will:
- Generate SSH keys if needed
- Copy keys to all Pi nodes
- Configure SSH shortcuts (so you can just type `ssh alice`)

### Step 2: Restart the Server

```bash
# Stop current server
# (Find the process and kill it, or just close the terminal)

# Start fresh
npm start
```

Now you'll see **real live data** from:
- Alice, Aria, Octavia, Lucidia (Raspberry Pi 5 with Hailo-8)
- Shellfish (DigitalOcean NATS hub)

## What You'll See (Live)

### Per Agent Window:
- **System stats**: CPU%, memory usage, temperature
- **Storage**: NVMe disk space remaining
- **AI Power**: Hailo-8 accelerator status (26 TOPS)
- **Activity log**: Real-time command outputs and events
- **Identity hash**: Roadchain SHA-256 verification

### Header Stats:
- **9 Total Nodes** (4 Pis + 1 cloud + 4 logical agents)
- **104 TOPS** total AI compute (4 × 26 TOPS)
- **Hash Chain Verified** ✓

## Troubleshooting

### "Permission denied (publickey)"
Some Pis need SSH key setup. Run:
```bash
./setup-ssh-keys.sh
```

### "Connection timeout" or "Host is down"
Check if the Pi is powered on and on the network:
```bash
ping alice    # or aria, octavia, lucidia
```

### Port 3000 already in use
Change the port:
```bash
PORT=3001 npm start
```

## Next Steps

### 1. Deploy to Cloudflare Pages

Make it accessible from anywhere:

```bash
# Install Wrangler
npm install -g wrangler

# Deploy
wrangler pages deploy . --project-name=blackroad-dashboard
```

### 2. Add Zero Trust Auth

Secure it with Cloudflare Access:
- Go to Cloudflare Dashboard → Zero Trust
- Create new Application
- Add authentication rules
- Point to your deployed dashboard

### 3. Connect to Real NATS

Edit `server.js` and add NATS client:
```javascript
const nats = require('nats');
const nc = await nats.connect({ servers: 'nats://174.138.44.45:4222' });
```

### 4. Add GitHub Integration

Show your open PRs and branches:
```javascript
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: 'your-token' });
```

### 5. Hailo-8 Real Metrics

Install HailoRT on your Pis and query:
```bash
ssh alice "hailortcli monitor"
```

## The Vision

This dashboard is the first step toward the **"Computer Use" killer feature** you envisioned - watching all your AI agents work simultaneously in real-time, just like the OpenAI Agent demo but for your entire sovereign edge AI cloud!

Next phases:
1. ✅ **Brady Bunch Grid** (DONE!)
2. 🔄 **Live SSH Data** (in progress - need keys)
3. 📊 **Hailo-8 Visualizations** (pending)
4. 🔗 **GitHub PR Integration** (pending)
5. 📈 **NVMe Performance Graphs** (pending)
6. 🌐 **NATS Message Stream** (pending)
7. 🔐 **Roadchain Hash Rotation Timeline** (pending)
8. ☁️ **Cloudflare Deployment** (pending)

## The Golden Rule Check

Before continuing, verify:
- ✅ [MEMORY] - Logged to memory system
- ✅ [BLACKROAD OS] - Could check for existing solutions
- ✅ [COLLABORATION] - Dashboard shows all agents
- ✅ [BRAND SYSTEM] - Hot Pink (#FF1D6C), Golden Ratio spacing

## Commands Reference

```bash
# Start server
npm start

# Setup SSH
./setup-ssh-keys.sh

# Test Pi connectivity
ssh alice "hostname && uptime"
ssh aria "free -h"
ssh lucidia "vcgencmd measure_temp"

# Check server logs
# (If running in background, check the terminal)

# Stop server
# Ctrl+C or kill the process
```

## Getting Help

- **Full docs**: See README.md
- **Logs**: Check the terminal where `npm start` is running
- **Issues**: All error messages appear in the dashboard (red activity items)

---

**Built by Willow 🖤🛣️**

*Making BlackRoad OS vision a reality - the No-Knowledge sovereign AI cloud!*
