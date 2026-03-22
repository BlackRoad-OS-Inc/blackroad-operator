#!/usr/bin/env bash
# BlackRoad Memory System - Connection Manager
set -euo pipefail

echo "[MEMORY-CONNECT] Starting connection checks..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Connection status tracking
CONNECTIONS=()

# GitHub Connection
echo -e "\n${YELLOW}[GitHub]${NC} Checking connection..."
if gh auth status >/dev/null 2>&1; then
  ACCOUNT=$(gh api user -q .login 2>/dev/null || echo "unknown")
  echo -e "${GREEN}✓${NC} GitHub authenticated as: $ACCOUNT"
  CONNECTIONS+=("github:connected:$ACCOUNT")
else
  echo -e "${RED}✗${NC} GitHub not authenticated"
  CONNECTIONS+=("github:disconnected")
fi

# Cloudflare Connection
echo -e "\n${YELLOW}[Cloudflare]${NC} Checking connection..."
if CF_ACCOUNT=$(wrangler whoami 2>&1 | grep "Account Name" | cut -d: -f2 | xargs); then
  if [[ -n "$CF_ACCOUNT" ]]; then
    echo -e "${GREEN}✓${NC} Cloudflare authenticated as: $CF_ACCOUNT"
    CONNECTIONS+=("cloudflare:connected:$CF_ACCOUNT")
  else
    echo -e "${YELLOW}⚠${NC} Cloudflare token may be expired, attempting refresh..."
    wrangler login >/dev/null 2>&1 || true
    CONNECTIONS+=("cloudflare:expired")
  fi
else
  echo -e "${RED}✗${NC} Cloudflare not authenticated"
  CONNECTIONS+=("cloudflare:disconnected")
fi

# Pi Network (Tailscale)
echo -e "\n${YELLOW}[Pi Network]${NC} Checking Tailscale..."
if tailscale status >/dev/null 2>&1; then
  ONLINE_PIS=$(tailscale status 2>/dev/null | grep -v "offline" | grep -E "alice|aria|lucidia|shellfish|codex" | wc -l | xargs)
  TOTAL_PIS=$(tailscale status 2>/dev/null | grep -E "alice|aria|lucidia|shellfish|codex" | wc -l | xargs)
  echo -e "${GREEN}✓${NC} Tailscale active: $ONLINE_PIS/$TOTAL_PIS Pis online"
  
  # Show which Pis are online
  tailscale status 2>/dev/null | grep -E "alice|aria|lucidia|shellfish|codex" | while read -r line; do
    if echo "$line" | grep -q "offline"; then
      PI_NAME=$(echo "$line" | awk '{print $2}')
      echo -e "  ${RED}✗${NC} $PI_NAME offline"
    else
      PI_NAME=$(echo "$line" | awk '{print $2}')
      PI_IP=$(echo "$line" | awk '{print $1}')
      echo -e "  ${GREEN}✓${NC} $PI_NAME ($PI_IP)"
    fi
  done
  CONNECTIONS+=("tailscale:connected:$ONLINE_PIS/$TOTAL_PIS")
else
  echo -e "${RED}✗${NC} Tailscale not running"
  CONNECTIONS+=("tailscale:disconnected")
fi

# br-help system (check if it exists)
echo -e "\n${YELLOW}[br-help]${NC} Checking system..."
if [[ -f "./br-help" ]] || command -v br-help >/dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} br-help available"
  CONNECTIONS+=("br-help:available")
else
  echo -e "${YELLOW}⚠${NC} br-help not found - creating..."
  # Create br-help command
  cat > "$HOME/.local/bin/br-help" <<'EOF'
#!/usr/bin/env bash
# BlackRoad Help System
COMMAND="${1:-help}"

case "$COMMAND" in
  help|--help|-h)
    cat <<'HELP'
🛣️  BlackRoad Help System

Commands:
  br-help status      - Show all system connections
  br-help github      - GitHub operations help
  br-help cloudflare  - Cloudflare operations help
  br-help pi          - Pi cluster operations help
  br-help memory      - Memory system help

Quick Actions:
  br-help connect     - Check all connections
  br-help deploy      - Deployment help
  br-help agents      - Agent system help
HELP
    ;;
  status)
    bash "$HOME/scripts/memory-connect.sh"
    ;;
  connect)
    bash "$HOME/scripts/memory-connect.sh"
    ;;
  github)
    echo "GitHub CLI Commands:"
    echo "  gh repo list --limit 10"
    echo "  gh pr list"
    echo "  gh workflow list"
    ;;
  cloudflare)
    echo "Cloudflare Commands:"
    echo "  wrangler whoami"
    echo "  wrangler pages project list"
    echo "  wrangler deployments list"
    ;;
  pi)
    echo "Pi Cluster Commands:"
    echo "  tailscale status"
    echo "  ssh alice"
    echo "  ssh aria"
    ;;
  memory)
    echo "Memory System Commands:"
    echo "  ./scripts/memory.sh start"
    echo "  ./scripts/memory.sh note 'your note'"
    echo "  ./scripts/memory-connect.sh"
    ;;
  *)
    echo "Unknown command: $COMMAND"
    echo "Run 'br-help' for help"
    exit 1
    ;;
esac
EOF
  chmod +x "$HOME/.local/bin/br-help"
  mkdir -p "$HOME/.local/bin"
  echo -e "${GREEN}✓${NC} br-help created at ~/.local/bin/br-help"
  CONNECTIONS+=("br-help:created")
fi

# Write connections to memory
echo -e "\n${YELLOW}[MEMORY]${NC} Recording connections..."
MEMORY_DIR="$HOME/.codex/memory"
mkdir -p "$MEMORY_DIR"

CONNECTION_FILE="$MEMORY_DIR/connections.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build JSON
JSON_CONNECTIONS="["
FIRST=true
for conn in "${CONNECTIONS[@]}"; do
  if [[ "$FIRST" == "true" ]]; then
    FIRST=false
  else
    JSON_CONNECTIONS+=","
  fi
  SERVICE=$(echo "$conn" | cut -d: -f1)
  STATUS=$(echo "$conn" | cut -d: -f2)
  DETAILS=$(echo "$conn" | cut -d: -f3-)
  JSON_CONNECTIONS+="{\"service\":\"$SERVICE\",\"status\":\"$STATUS\",\"details\":\"$DETAILS\"}"
done
JSON_CONNECTIONS+="]"

cat > "$CONNECTION_FILE" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "connections": $JSON_CONNECTIONS
}
EOF

echo -e "${GREEN}✓${NC} Connection status saved to: $CONNECTION_FILE"
echo -e "\n${GREEN}[MEMORY-CONNECT]${NC} Complete! Run 'br-help status' anytime to check."
