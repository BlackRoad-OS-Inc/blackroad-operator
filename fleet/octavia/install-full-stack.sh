#!/bin/bash
# BlackRoad Full Stack Installer
# Installs: nginx, certbot, FastAPI, cloudflared
# Run with: bash install-full-stack.sh

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad Full Stack Installer - $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Detect package manager
if command -v apt &>/dev/null; then
    PKG="apt"
    INSTALL="sudo apt install -y"
elif command -v dnf &>/dev/null; then
    PKG="dnf"
    INSTALL="sudo dnf install -y"
else
    PKG="apt"
    INSTALL="sudo apt install -y"
fi

echo -e "${AMBER}[1/6]${NC} Updating system..."
sudo $PKG update -y

echo -e "${AMBER}[2/6]${NC} Installing nginx..."
if ! which nginx &>/dev/null; then
    $INSTALL nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo -e "${GREEN}nginx installed${NC}"
else
    echo -e "${GREEN}nginx already installed${NC}"
fi

echo -e "${AMBER}[3/6]${NC} Installing certbot..."
if ! which certbot &>/dev/null; then
    $INSTALL certbot python3-certbot-nginx 2>/dev/null || pip3 install certbot certbot-nginx
    echo -e "${GREEN}certbot installed${NC}"
else
    echo -e "${GREEN}certbot already installed${NC}"
fi

echo -e "${AMBER}[4/6]${NC} Installing cloudflared..."
if ! which cloudflared &>/dev/null; then
    # Detect architecture
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) CF_ARCH="amd64" ;;
        aarch64|arm64) CF_ARCH="arm64" ;;
        armv7l) CF_ARCH="arm" ;;
        *) CF_ARCH="amd64" ;;
    esac

    curl -L -o /tmp/cloudflared.deb "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${CF_ARCH}.deb" 2>/dev/null
    sudo dpkg -i /tmp/cloudflared.deb 2>/dev/null || sudo apt install -f -y
    rm -f /tmp/cloudflared.deb
    echo -e "${GREEN}cloudflared installed${NC}"
else
    echo -e "${GREEN}cloudflared already installed${NC}"
fi

echo -e "${AMBER}[5/6]${NC} Installing FastAPI + uvicorn..."
pip3 install --user fastapi uvicorn[standard] python-multipart pydantic httpx 2>/dev/null || \
pip3 install fastapi uvicorn python-multipart pydantic httpx

echo -e "${AMBER}[6/6]${NC} Setting up BlackRoad API..."
mkdir -p ~/blackroad-api

cat > ~/blackroad-api/main.py << 'EOFAPI'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import socket
import os
import subprocess
from datetime import datetime
from typing import Optional

app = FastAPI(
    title=f"BlackRoad Agent API - {socket.gethostname()}",
    description="Local API for BlackRoad OS agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExecRequest(BaseModel):
    cmd: str
    timeout: Optional[int] = 30

@app.get("/")
def root():
    return {
        "agent": socket.gethostname(),
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "api_version": "1.0.0"
    }

@app.get("/health")
def health():
    try:
        load = open("/proc/loadavg").read().split()[0]
        mem_info = subprocess.check_output("free -m | awk '/Mem:/ {print $4}'", shell=True).decode().strip()
        disk = subprocess.check_output("df -h / | awk 'NR==2 {print $4}'", shell=True).decode().strip()
        temp = "N/A"
        try:
            temp = str(int(open("/sys/class/thermal/thermal_zone0/temp").read()) // 1000) + "C"
        except:
            pass
        return {
            "agent": socket.gethostname(),
            "load": load,
            "memory_free_mb": int(mem_info) if mem_info.isdigit() else 0,
            "disk_free": disk,
            "temperature": temp,
            "status": "healthy"
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/info")
def info():
    return {
        "hostname": socket.gethostname(),
        "python": subprocess.check_output("python3 --version", shell=True).decode().strip(),
        "platform": os.uname().sysname,
        "arch": os.uname().machine,
        "nginx": "running" if subprocess.call("systemctl is-active nginx", shell=True, stdout=subprocess.DEVNULL) == 0 else "stopped",
        "cloudflared": subprocess.check_output("cloudflared --version 2>/dev/null || echo 'not installed'", shell=True).decode().strip().split()[0] if subprocess.call("which cloudflared", shell=True, stdout=subprocess.DEVNULL) == 0 else "not installed"
    }

@app.post("/exec")
def execute(req: ExecRequest):
    try:
        result = subprocess.check_output(req.cmd, shell=True, timeout=req.timeout, stderr=subprocess.STDOUT).decode()
        return {"success": True, "output": result}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "timeout"}
    except subprocess.CalledProcessError as e:
        return {"success": False, "error": e.output.decode() if e.output else str(e)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/services")
def services():
    svcs = ["nginx", "ollama", "tailscaled", "blackroad-api"]
    result = {}
    for svc in svcs:
        try:
            status = subprocess.call(f"systemctl is-active {svc}", shell=True, stdout=subprocess.DEVNULL)
            result[svc] = "running" if status == 0 else "stopped"
        except:
            result[svc] = "unknown"
    return result
EOFAPI

# Create start script
cat > ~/blackroad-api/start.sh << 'EOFSTART'
#!/bin/bash
cd ~/blackroad-api
~/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload
EOFSTART
chmod +x ~/blackroad-api/start.sh

# Create nginx config
sudo tee /etc/nginx/sites-available/blackroad-api > /dev/null << EOFNGINX
server {
    listen 80;
    server_name ${HOSTNAME}.blackroad.local ${HOSTNAME}.local;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOFNGINX

sudo ln -sf /etc/nginx/sites-available/blackroad-api /etc/nginx/sites-enabled/ 2>/dev/null
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Installation Complete on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Installed:${NC}"
echo "  - nginx (web server)"
echo "  - certbot (SSL certificates)"
echo "  - cloudflared (Cloudflare tunnels)"
echo "  - FastAPI + uvicorn (API server)"
echo ""
echo -e "${AMBER}Start API:${NC}"
echo "  ~/blackroad-api/start.sh"
echo ""
echo -e "${AMBER}Cloudflare Tunnel:${NC}"
echo "  cloudflared tunnel login"
echo "  cloudflared tunnel create $HOSTNAME"
echo "  cloudflared tunnel route dns $HOSTNAME ${HOSTNAME}.blackroad.io"
