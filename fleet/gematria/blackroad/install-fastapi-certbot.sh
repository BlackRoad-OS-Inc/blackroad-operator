#!/bin/bash
# Install certbot + FastAPI on BlackRoad devices
# Run with: bash install-fastapi-certbot.sh

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
NC='\033[0m'

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad FastAPI + Certbot Installer${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Detect OS
if [[ -f /etc/debian_version ]]; then
    PKG_MGR="apt"
elif [[ -f /etc/redhat-release ]]; then
    PKG_MGR="dnf"
else
    PKG_MGR="apt"
fi

echo -e "${AMBER}[1/4]${NC} Updating packages..."
sudo $PKG_MGR update -y

echo -e "${AMBER}[2/4]${NC} Installing certbot..."
if ! which certbot &>/dev/null; then
    sudo $PKG_MGR install -y certbot python3-certbot-nginx 2>/dev/null || \
    sudo $PKG_MGR install -y certbot 2>/dev/null || \
    sudo pip3 install certbot
    echo -e "${GREEN}certbot installed${NC}"
else
    echo -e "${GREEN}certbot already installed${NC}"
fi

echo -e "${AMBER}[3/4]${NC} Installing FastAPI + uvicorn..."
pip3 install --user fastapi uvicorn[standard] python-multipart pydantic 2>/dev/null || \
pip3 install fastapi uvicorn python-multipart pydantic

echo -e "${AMBER}[4/4]${NC} Creating FastAPI service directory..."
mkdir -p ~/blackroad-api
cat > ~/blackroad-api/main.py << 'EOFAPI'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socket
import os
from datetime import datetime

app = FastAPI(
    title="BlackRoad Agent API",
    description="Local API for BlackRoad OS agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "agent": socket.gethostname(),
        "status": "online",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
def health():
    import subprocess
    load = open("/proc/loadavg").read().split()[0]
    mem = subprocess.check_output("free -m | awk '/Mem:/ {print $4}'", shell=True).decode().strip()
    disk = subprocess.check_output("df -h / | awk 'NR==2 {print $4}'", shell=True).decode().strip()
    return {
        "agent": socket.gethostname(),
        "load": load,
        "memory_free_mb": int(mem) if mem.isdigit() else mem,
        "disk_free": disk,
        "status": "healthy"
    }

@app.get("/info")
def info():
    return {
        "hostname": socket.gethostname(),
        "python": os.popen("python3 --version").read().strip(),
        "platform": os.uname().sysname,
        "arch": os.uname().machine
    }

@app.post("/exec")
def execute(cmd: str):
    import subprocess
    try:
        result = subprocess.check_output(cmd, shell=True, timeout=30).decode()
        return {"success": True, "output": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
EOFAPI

# Create systemd service
cat > ~/blackroad-api/blackroad-api.service << 'EOFSVC'
[Unit]
Description=BlackRoad Agent API
After=network.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/home/blackroad/blackroad-api
ExecStart=/home/blackroad/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOFSVC

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Installation Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "To start the API:"
echo "  cd ~/blackroad-api && uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo "Or install as service:"
echo "  sudo cp ~/blackroad-api/blackroad-api.service /etc/systemd/system/"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable --now blackroad-api"
