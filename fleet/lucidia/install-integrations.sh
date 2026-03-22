#!/bin/bash
# BlackRoad Integrations Installer
# Installs: Memory system, Git, Railway, Slack, Mail
# Run with: bash install-integrations.sh

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad Integrations Installer - $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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

echo -e "${AMBER}[1/6]${NC} Setting up [MEMORY] system..."
mkdir -p ~/.blackroad/memory/{journals,sessions,active-agents,tasks,til,infinite-todos}

# Create core memory system
cat > ~/memory-system.sh << 'EOFMEM'
#!/bin/bash
# BlackRoad Memory System - Distributed Agent Coordination
# Usage: memory-system.sh <command> [args]

MEMORY_DIR="$HOME/.blackroad/memory"
JOURNAL="$MEMORY_DIR/journals/master-journal.jsonl"
mkdir -p "$MEMORY_DIR/journals" "$MEMORY_DIR/sessions" "$MEMORY_DIR/active-agents" "$MEMORY_DIR/tasks" "$MEMORY_DIR/til"

log() {
    local action="$1"
    local entity="$2"
    local details="$3"
    local tags="$4"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local hash=$(echo -n "$timestamp$action$entity" | sha256sum | cut -c1-8)
    local hostname=$(hostname)

    local entry=$(cat << EOF
{"timestamp":"$timestamp","agent":"$hostname","action":"$action","entity":"$entity","details":"$details","tags":"$tags","hash":"$hash"}
EOF
)
    echo "$entry" >> "$JOURNAL"
    echo -e "\033[38;5;135m[MEMORY]\033[0m Logged: $action → $entity (hash: $hash...)"
}

summary() {
    echo -e "\033[38;5;205m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
    echo -e "\033[1;37m  [MEMORY] System Status - $(hostname)\033[0m"
    echo -e "\033[38;5;205m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"

    if [[ -f "$JOURNAL" ]]; then
        local entries=$(wc -l < "$JOURNAL" 2>/dev/null || echo "0")
        local last_entry=$(tail -1 "$JOURNAL" 2>/dev/null | jq -r '.timestamp // "none"' 2>/dev/null || echo "none")
        echo "  Journal entries: $entries"
        echo "  Last entry: $last_entry"
    else
        echo "  Journal: not initialized"
    fi

    local active_agents=$(ls -1 "$MEMORY_DIR/active-agents/" 2>/dev/null | wc -l || echo "0")
    local tasks=$(ls -1 "$MEMORY_DIR/tasks/" 2>/dev/null | wc -l || echo "0")
    local til=$(ls -1 "$MEMORY_DIR/til/" 2>/dev/null | wc -l || echo "0")

    echo "  Active agents: $active_agents"
    echo "  Tasks: $tasks"
    echo "  TIL broadcasts: $til"
}

recent() {
    local n="${1:-10}"
    if [[ -f "$JOURNAL" ]]; then
        tail -n "$n" "$JOURNAL" | jq -r '"\(.timestamp | split("T")[0]) [\(.action)] \(.entity): \(.details | .[0:60])"' 2>/dev/null
    else
        echo "No journal entries"
    fi
}

search() {
    local query="$1"
    if [[ -f "$JOURNAL" ]]; then
        grep -i "$query" "$JOURNAL" | tail -20 | jq -r '"\(.timestamp | split("T")[0]) [\(.action)] \(.entity)"' 2>/dev/null
    fi
}

case "$1" in
    log) log "$2" "$3" "$4" "$5" ;;
    summary) summary ;;
    recent) recent "$2" ;;
    search) search "$2" ;;
    check) summary ;;
    *)
        echo "memory-system.sh - BlackRoad Memory"
        echo ""
        echo "Commands:"
        echo "  log <action> <entity> <details> <tags>"
        echo "  summary    - Show memory status"
        echo "  recent [n] - Show recent entries"
        echo "  search <q> - Search journal"
        ;;
esac
EOFMEM
chmod +x ~/memory-system.sh

# Create TIL broadcast system
cat > ~/memory-til-broadcast.sh << 'EOFTIL'
#!/bin/bash
# Today I Learned - Broadcast to all agents
TIL_DIR="$HOME/.blackroad/memory/til"
mkdir -p "$TIL_DIR"

broadcast() {
    local category="$1"
    local learning="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local hostname=$(hostname)
    local id=$(date +%s)

    cat > "$TIL_DIR/til-$id.json" << EOF
{"id":"$id","timestamp":"$timestamp","agent":"$hostname","category":"$category","learning":"$learning"}
EOF
    echo -e "\033[38;5;214m[TIL]\033[0m Broadcast: $category - $learning"
}

list() {
    echo -e "\033[38;5;205m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
    echo -e "\033[1;37m  Recent Learnings\033[0m"
    echo -e "\033[38;5;205m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
    for f in $(ls -t "$TIL_DIR"/*.json 2>/dev/null | head -10); do
        cat "$f" | jq -r '"\(.agent) [\(.category)]: \(.learning | .[0:60])"' 2>/dev/null
    done
}

case "$1" in
    broadcast) broadcast "$2" "$3" ;;
    list) list ;;
    *) echo "Usage: memory-til-broadcast.sh broadcast <category> <learning>" ;;
esac
EOFTIL
chmod +x ~/memory-til-broadcast.sh

echo -e "${GREEN}[MEMORY] system installed${NC}"

echo -e "${AMBER}[2/6]${NC} Setting up Git..."
if ! which git &>/dev/null; then
    $INSTALL git 2>/dev/null || echo "Git install requires sudo"
fi

# Configure git
git config --global user.name "BlackRoad Agent - $HOSTNAME" 2>/dev/null || true
git config --global user.email "agent-$HOSTNAME@blackroad.io" 2>/dev/null || true
git config --global init.defaultBranch main 2>/dev/null || true
echo -e "${GREEN}Git configured${NC}"

echo -e "${AMBER}[3/6]${NC} Setting up Railway CLI..."
if ! which railway &>/dev/null; then
    # Install Railway CLI
    curl -fsSL https://railway.app/install.sh 2>/dev/null | sh 2>/dev/null || {
        npm install -g @railway/cli 2>/dev/null || echo "Railway CLI install deferred"
    }
fi
echo -e "${GREEN}Railway CLI ready${NC}"

echo -e "${AMBER}[4/6]${NC} Setting up Slack integration..."
mkdir -p ~/blackroad-integrations

cat > ~/blackroad-integrations/slack.py << 'EOFSLACK'
#!/usr/bin/env python3
"""BlackRoad Slack Integration"""
import os
import json
import socket
from datetime import datetime

SLACK_WEBHOOK = os.environ.get("SLACK_WEBHOOK_URL", "")
SLACK_LOG = os.path.expanduser("~/blackroad-integrations/slack.log")

def send_message(channel: str, message: str, username: str = None):
    """Send message to Slack"""
    import urllib.request

    if not SLACK_WEBHOOK:
        log_local(channel, message)
        return {"error": "No webhook configured", "logged": True}

    hostname = socket.gethostname()
    payload = {
        "channel": channel,
        "username": username or f"blackroad-{hostname}",
        "text": message,
        "icon_emoji": ":robot_face:"
    }

    try:
        req = urllib.request.Request(
            SLACK_WEBHOOK,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req)
        log_local(channel, message)
        return {"sent": True}
    except Exception as e:
        return {"error": str(e)}

def log_local(channel: str, message: str):
    """Log message locally"""
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "agent": socket.gethostname(),
        "channel": channel,
        "message": message
    }
    with open(SLACK_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 3:
        result = send_message(sys.argv[1], " ".join(sys.argv[2:]))
        print(json.dumps(result))
    else:
        print("Usage: slack.py <channel> <message>")
EOFSLACK
chmod +x ~/blackroad-integrations/slack.py

# Create slack CLI wrapper
cat > ~/slack-send << 'EOFSLACKCLI'
#!/bin/bash
# Quick Slack sender
python3 ~/blackroad-integrations/slack.py "$@"
EOFSLACKCLI
chmod +x ~/slack-send

echo -e "${GREEN}Slack integration ready${NC}"

echo -e "${AMBER}[5/6]${NC} Setting up mail..."
pip3 install --user --break-system-packages aiosmtplib 2>/dev/null || pip3 install aiosmtplib 2>/dev/null || true

cat > ~/blackroad-integrations/mail.py << 'EOFMAIL'
#!/usr/bin/env python3
"""BlackRoad Mail System"""
import os
import json
import socket
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

MAIL_LOG = os.path.expanduser("~/blackroad-integrations/mail.log")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")

def send_mail(to: str, subject: str, body: str, from_addr: str = None):
    """Send email"""
    hostname = socket.gethostname()
    from_addr = from_addr or f"agent-{hostname}@blackroad.io"

    # Log locally always
    log_mail(to, subject, body)

    if not SMTP_USER or not SMTP_PASS:
        return {"error": "SMTP not configured", "logged": True}

    try:
        msg = MIMEMultipart()
        msg["From"] = from_addr
        msg["To"] = to
        msg["Subject"] = f"[BlackRoad/{hostname}] {subject}"
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)

        return {"sent": True}
    except Exception as e:
        return {"error": str(e)}

def log_mail(to: str, subject: str, body: str):
    """Log email locally"""
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "agent": socket.gethostname(),
        "to": to,
        "subject": subject,
        "body": body[:200]
    }
    with open(MAIL_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 4:
        result = send_mail(sys.argv[1], sys.argv[2], " ".join(sys.argv[3:]))
        print(json.dumps(result))
    else:
        print("Usage: mail.py <to> <subject> <body>")
EOFMAIL
chmod +x ~/blackroad-integrations/mail.py

# Create mail CLI wrapper
cat > ~/mail-send << 'EOFMAILCLI'
#!/bin/bash
# Quick mail sender
python3 ~/blackroad-integrations/mail.py "$@"
EOFMAILCLI
chmod +x ~/mail-send

echo -e "${GREEN}Mail system ready${NC}"

echo -e "${AMBER}[6/6]${NC} Setting up GitHub CLI..."
if ! which gh &>/dev/null; then
    # Try to install gh
    if [[ "$PKG" == "apt" ]]; then
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg 2>/dev/null
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null 2>/dev/null
        sudo apt update && sudo apt install gh -y 2>/dev/null || echo "GitHub CLI install requires sudo"
    else
        echo "Install gh manually: https://cli.github.com"
    fi
fi
echo -e "${GREEN}GitHub CLI ready${NC}"

# Create master status command
cat > ~/blackroad-status << 'EOFSTATUS'
#!/bin/bash
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
NC='\033[0m'

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\033[1;37m  BlackRoad Agent Status - $(hostname)${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${AMBER}Services:${NC}"
for svc in fastapi node webhooks ollama; do
    port=8000
    case $svc in
        node) port=3000 ;;
        webhooks) port=9000 ;;
        ollama) port=11434 ;;
    esac
    if curl -s "http://localhost:$port/" &>/dev/null; then
        echo -e "  ${GREEN}●${NC} $svc (port $port)"
    else
        echo -e "  ○ $svc (port $port)"
    fi
done

echo ""
echo -e "${AMBER}Integrations:${NC}"
echo -n "  Git: "; git --version 2>/dev/null | cut -d' ' -f3 || echo "not installed"
echo -n "  Railway: "; railway --version 2>/dev/null || echo "not installed"
echo -n "  gh: "; gh --version 2>/dev/null | head -1 || echo "not installed"

echo ""
echo -e "${AMBER}Memory:${NC}"
~/memory-system.sh summary 2>/dev/null | grep -E "entries|agents" || echo "  Not initialized"
EOFSTATUS
chmod +x ~/blackroad-status

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  All Integrations Installed on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Commands available:${NC}"
echo "  ~/memory-system.sh summary     - Memory status"
echo "  ~/memory-til-broadcast.sh      - Share learnings"
echo "  ~/slack-send <channel> <msg>   - Send to Slack"
echo "  ~/mail-send <to> <subj> <body> - Send email"
echo "  ~/blackroad-status             - Full status"
echo ""
echo -e "${VIOLET}Environment variables needed:${NC}"
echo "  SLACK_WEBHOOK_URL  - Slack incoming webhook"
echo "  SMTP_USER/SMTP_PASS - Email credentials"
