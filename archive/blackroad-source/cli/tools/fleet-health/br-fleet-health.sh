#!/bin/bash
# BlackRoad Fleet Health — Check all services and push to stats
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
CYAN='\033[38;5;69m'
RESET='\033[0m'

SERVICES=(
  "auth|https://auth.blackroad.io/api/health"
  "pay|https://pay.blackroad.io/health"
  "search|https://search.blackroad.io/api/health"
  "portal|https://portal.blackroad.io/api/health"
  "chat|https://chat.blackroad.io/api/health"
  "images|https://images.blackroad.io/api/health"
  "index|https://index.blackroad.io/api/health"
  "analytics|https://analytics.blackroad.io/api/health"
  "stats|https://stats.blackroad.io/health"
  "agents|https://agents.blackroad.io/health"
  "api|https://api.blackroad.io/health"
  "fleet|https://fleet.blackroad.io/health"
  "brand|https://brand.blackroad.io"
  "blackroad.io|https://blackroad.io"
)

NODES=(
  "alice|pi@192.168.4.49"
  "cecilia|blackroad@192.168.4.96"
  "octavia|pi@192.168.4.101"
  "aria|blackroad@192.168.4.98"
  "lucidia|pi@192.168.4.38"
)

up=0; down=0; total=0

echo -e "${PINK}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  BLACKROAD FLEET HEALTH                                 ║${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════════════╝${RESET}"
echo ""

echo -e "${CYAN}Workers (${#SERVICES[@]}):${RESET}"
for svc in "${SERVICES[@]}"; do
  name="${svc%%|*}"
  url="${svc#*|}"
  total=$((total+1))
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" 2>/dev/null)
  if [ "$code" = "200" ]; then
    up=$((up+1))
    echo -e "  ${GREEN}✓${RESET} $name"
  else
    down=$((down+1))
    echo -e "  ${RED}✗${RESET} $name ($code)"
  fi
done

echo ""
echo -e "${CYAN}Pi Nodes (${#NODES[@]}):${RESET}"
for node in "${NODES[@]}"; do
  name="${node%%|*}"
  target="${node#*|}"
  total=$((total+1))
  if ssh -o ConnectTimeout=3 -o BatchMode=yes "$target" "true" 2>/dev/null; then
    up=$((up+1))
    uptime=$(ssh -o ConnectTimeout=3 "$target" "uptime -p 2>/dev/null || uptime | sed 's/.*up/up/' | cut -d, -f1" 2>/dev/null)
    echo -e "  ${GREEN}✓${RESET} $name — $uptime"
  else
    down=$((down+1))
    echo -e "  ${RED}✗${RESET} $name"
  fi
done

echo ""
echo -e "${CYAN}Orchestrator:${RESET}"
orch=$(curl -s --max-time 3 http://localhost:8100/api/cluster 2>/dev/null)
if [ -n "$orch" ]; then
  total=$((total+1)); up=$((up+1))
  echo "$orch" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'  \033[38;5;82m✓\033[0m Controller — {d[\"total_agents_registered\"]:,} agents, {d[\"healthy_nodes\"]}/{d[\"total_nodes\"]} nodes')
" 2>/dev/null
else
  total=$((total+1)); down=$((down+1))
  echo -e "  ${RED}✗${RESET} Controller offline"
fi

echo ""
echo -e "  ${GREEN}Up: $up${RESET}  ${RED}Down: $down${RESET}  Total: $total  $(date '+%H:%M:%S')"
