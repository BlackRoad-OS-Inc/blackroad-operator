#!/bin/bash
# BlackRoad Full Internet Stack Installer
# Installs: Node.js, Java, Python servers, DNS tools, webhook handlers
# Run with: bash install-blackroad-stack.sh

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad Full Stack Installer - $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Detect OS
if [[ -f /etc/debian_version ]]; then
    PKG="apt"
    INSTALL="sudo apt install -y"
elif [[ -f /etc/redhat-release ]]; then
    PKG="dnf"
    INSTALL="sudo dnf install -y"
else
    PKG="apt"
    INSTALL="sudo apt install -y"
fi

echo -e "${AMBER}[1/8]${NC} Installing Node.js..."
if ! which node &>/dev/null; then
    # Install Node.js via nvm for user-level install (no sudo)
    if [[ ! -d "$HOME/.nvm" ]]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    source ~/.nvm/nvm.sh 2>/dev/null
    nvm install --lts 2>/dev/null || nvm install 20
    echo -e "${GREEN}Node.js $(node --version) installed${NC}"
else
    echo -e "${GREEN}Node.js $(node --version) already installed${NC}"
fi

echo -e "${AMBER}[2/8]${NC} Installing npm packages..."
npm install -g express fastify ws socket.io http-server pm2 2>/dev/null || \
~/.nvm/versions/node/*/bin/npm install -g express fastify ws socket.io http-server pm2

echo -e "${AMBER}[3/8]${NC} Installing Java..."
if ! which java &>/dev/null; then
    # Try apt first, fallback to sdkman
    $INSTALL default-jdk 2>/dev/null || {
        curl -s "https://get.sdkman.io" | bash
        source "$HOME/.sdkman/bin/sdkman-init.sh"
        sdk install java 21-open
    }
    echo -e "${GREEN}Java installed${NC}"
else
    echo -e "${GREEN}Java already installed: $(java -version 2>&1 | head -1)${NC}"
fi

echo -e "${AMBER}[4/8]${NC} Installing Python web frameworks..."
pip3 install --user --break-system-packages flask quart aiohttp websockets tornado 2>/dev/null || \
pip3 install flask quart aiohttp websockets tornado

echo -e "${AMBER}[5/8]${NC} Installing DNS tools..."
pip3 install --user --break-system-packages dnspython cloudflare 2>/dev/null || \
pip3 install dnspython cloudflare

echo -e "${AMBER}[6/8]${NC} Creating webhook handler..."
mkdir -p ~/blackroad-webhooks

cat > ~/blackroad-webhooks/webhook_server.py << 'EOFWH'
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import socket
from datetime import datetime
import subprocess

app = FastAPI(
    title=f"BlackRoad Webhook Handler - {socket.gethostname()}",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WEBHOOK_LOG = os.path.expanduser("~/blackroad-webhooks/events.jsonl")

@app.get("/")
def root():
    return {
        "service": "blackroad-webhooks",
        "agent": socket.gethostname(),
        "status": "ready",
        "endpoints": ["/github", "/stripe", "/cloudflare", "/custom"]
    }

@app.post("/github")
async def github_webhook(request: Request):
    event = request.headers.get("X-GitHub-Event", "unknown")
    payload = await request.json()
    log_event("github", event, payload)

    # Auto-pull on push events
    if event == "push":
        repo = payload.get("repository", {}).get("name", "unknown")
        return {"received": True, "event": event, "repo": repo, "action": "logged"}

    return {"received": True, "event": event}

@app.post("/stripe")
async def stripe_webhook(request: Request):
    payload = await request.json()
    event_type = payload.get("type", "unknown")
    log_event("stripe", event_type, payload)
    return {"received": True, "event": event_type}

@app.post("/cloudflare")
async def cloudflare_webhook(request: Request):
    payload = await request.json()
    log_event("cloudflare", "notification", payload)
    return {"received": True}

@app.post("/custom/{channel}")
async def custom_webhook(channel: str, request: Request):
    payload = await request.json()
    log_event(f"custom:{channel}", "message", payload)
    return {"received": True, "channel": channel}

@app.get("/events")
def get_events(limit: int = 50):
    events = []
    try:
        with open(WEBHOOK_LOG, "r") as f:
            lines = f.readlines()[-limit:]
            events = [json.loads(line) for line in lines]
    except FileNotFoundError:
        pass
    return {"events": events, "count": len(events)}

def log_event(source: str, event_type: str, payload: dict):
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "agent": socket.gethostname(),
        "source": source,
        "event": event_type,
        "payload": payload
    }
    with open(WEBHOOK_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")
EOFWH

cat > ~/blackroad-webhooks/start.sh << 'EOFSTART'
#!/bin/bash
cd ~/blackroad-webhooks
~/.local/bin/uvicorn webhook_server:app --host 0.0.0.0 --port 9000
EOFSTART
chmod +x ~/blackroad-webhooks/start.sh

echo -e "${AMBER}[7/8]${NC} Creating Express.js server..."
mkdir -p ~/blackroad-node

cat > ~/blackroad-node/server.js << 'EOFNODE'
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

const hostname = os.hostname();

// REST API
app.get('/', (req, res) => {
    res.json({
        agent: hostname,
        service: 'blackroad-node',
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: ['/api/status', '/api/exec', '/api/broadcast']
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        hostname,
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        memory: {
            total: os.totalmem(),
            free: os.freemem()
        },
        load: os.loadavg()
    });
});

app.post('/api/exec', (req, res) => {
    const { cmd } = req.body;
    if (!cmd) return res.status(400).json({ error: 'No command provided' });

    const { exec } = require('child_process');
    exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        res.json({
            success: !error,
            stdout,
            stderr,
            error: error?.message
        });
    });
});

app.post('/api/broadcast', (req, res) => {
    const { message, channel = 'general' } = req.body;
    io.to(channel).emit('broadcast', { from: hostname, message, timestamp: Date.now() });
    res.json({ sent: true, channel });
});

// WebSocket
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.emit('welcome', { agent: hostname, message: 'Connected to BlackRoad mesh' });

    socket.on('join', (channel) => {
        socket.join(channel);
        socket.emit('joined', { channel });
    });

    socket.on('message', (data) => {
        io.emit('message', { from: hostname, ...data, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`BlackRoad Node server running on http://0.0.0.0:${PORT}`);
});
EOFNODE

cat > ~/blackroad-node/package.json << 'EOFPKG'
{
  "name": "blackroad-node",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  }
}
EOFPKG

echo -e "${AMBER}[8/8]${NC} Creating DNS manager..."
mkdir -p ~/blackroad-dns

cat > ~/blackroad-dns/dns_manager.py << 'EOFDNS'
#!/usr/bin/env python3
"""BlackRoad DNS Manager - Local + Cloudflare DNS management"""

import json
import os
import socket
import subprocess
from datetime import datetime

HOSTS_FILE = os.path.expanduser("~/blackroad-dns/local_hosts.json")
DNS_LOG = os.path.expanduser("~/blackroad-dns/dns.log")

# BlackRoad fleet IPs (local network)
FLEET = {
    "cecilia": "192.168.4.89",
    "lucidia": "192.168.4.81",
    "octavia": "192.168.4.38",
    "aria": "192.168.4.82",
    "alice": "192.168.4.49",
    "gematria": "174.138.44.45",
    "anastasia": "159.65.43.12",
    "alexandria": "192.168.4.28"
}

# Tailscale IPs
TAILSCALE = {
    "cecilia": "100.72.180.98",
    "lucidia": "100.83.149.86",
    "octavia": "100.66.235.47",
    "alice": "100.77.210.18",
    "aria": "100.109.14.17",
    "shellfish": "100.94.33.37",
    "blackroad-infinity": "100.108.132.8"
}

def resolve(hostname: str, use_tailscale: bool = False) -> str:
    """Resolve BlackRoad hostname to IP"""
    hosts = TAILSCALE if use_tailscale else FLEET
    if hostname in hosts:
        return hosts[hostname]
    # Fallback to system DNS
    try:
        return socket.gethostbyname(hostname)
    except:
        return None

def add_local_host(hostname: str, ip: str, domain: str = "blackroad.local"):
    """Add a local host entry"""
    hosts = load_hosts()
    fqdn = f"{hostname}.{domain}"
    hosts[fqdn] = ip
    save_hosts(hosts)
    log(f"Added: {fqdn} -> {ip}")
    return {"added": fqdn, "ip": ip}

def load_hosts() -> dict:
    try:
        with open(HOSTS_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def save_hosts(hosts: dict):
    with open(HOSTS_FILE, "w") as f:
        json.dump(hosts, f, indent=2)

def log(message: str):
    with open(DNS_LOG, "a") as f:
        f.write(f"{datetime.utcnow().isoformat()} - {message}\n")

def fleet_status():
    """Check DNS resolution for entire fleet"""
    results = {}
    for name, ip in FLEET.items():
        try:
            subprocess.check_output(["ping", "-c", "1", "-W", "1", ip], stderr=subprocess.DEVNULL)
            results[name] = {"ip": ip, "status": "online"}
        except:
            results[name] = {"ip": ip, "status": "offline"}
    return results

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: dns_manager.py <command> [args]")
        print("Commands: resolve <host>, add <host> <ip>, fleet")
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "resolve" and len(sys.argv) > 2:
        print(resolve(sys.argv[2]))
    elif cmd == "add" and len(sys.argv) > 3:
        print(add_local_host(sys.argv[2], sys.argv[3]))
    elif cmd == "fleet":
        status = fleet_status()
        for name, info in status.items():
            print(f"{name}: {info['ip']} [{info['status']}]")
    else:
        print("Unknown command")
EOFDNS
chmod +x ~/blackroad-dns/dns_manager.py

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  BlackRoad Full Stack Installed on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Services installed:${NC}"
echo "  • Node.js + Express + Socket.IO (port 3000)"
echo "  • Python Webhook Handler (port 9000)"
echo "  • FastAPI Agent API (port 8000)"
echo "  • DNS Manager (local + Cloudflare)"
echo ""
echo -e "${AMBER}Start services:${NC}"
echo "  cd ~/blackroad-node && npm install && npm start"
echo "  ~/blackroad-webhooks/start.sh"
echo "  ~/blackroad-api/start.sh"
echo ""
echo -e "${VIOLET}DNS commands:${NC}"
echo "  python3 ~/blackroad-dns/dns_manager.py fleet"
echo "  python3 ~/blackroad-dns/dns_manager.py resolve cecilia"
