#!/bin/zsh
# Deploy BlackRoad agent runtime to Raspberry Pi fleet

set -e

GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'

# Pi fleet IPs
PI_FLEET=(
  "pi@192.168.4.64:blackroad-pi"
  "pi@192.168.4.38:aria64"
  "pi@192.168.4.49:alice"
  "pi@192.168.4.99:lucidia"
)

DEPLOY_PATH="/home/pi/blackroad-agent"
GATEWAY_URL="${BLACKROAD_GATEWAY_URL:-http://127.0.0.1:8787}"

check_connectivity() {
  local pi="$1"
  local host="${pi%%:*}"
  local ip="${host##*@}"
  
  if ping -c 1 -W 2 "$ip" >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} $ip reachable"
    return 0
  else
    echo -e "  ${RED}✗${NC} $ip unreachable"
    return 1
  fi
}

deploy_to_pi() {
  local pi="$1"
  local host="${pi%%:*}"
  local name="${pi##*:}"
  local ip="${host##*@}"
  
  echo -e "\n${CYAN}Deploying to $name ($ip)...${NC}"
  
  # Copy agent files
  ssh -o ConnectTimeout=5 "$host" "mkdir -p $DEPLOY_PATH"
  scp -r pi_agent/ "$host:$DEPLOY_PATH/"
  scp -r install-pi-agent.sh "$host:/tmp/"
  
  # Run install
  ssh "$host" "bash /tmp/install-pi-agent.sh"
  
  echo -e "  ${GREEN}✓${NC} $name deployed"
}

restart_agents() {
  for pi in "${PI_FLEET[@]}"; do
    local host="${pi%%:*}"
    local name="${pi##*:}"
    echo -e "  ${CYAN}Restarting $name...${NC}"
    ssh -o ConnectTimeout=5 "$host" "sudo systemctl restart blackroad-agent" 2>/dev/null && \
      echo -e "  ${GREEN}✓${NC} $name restarted" || \
      echo -e "  ${YELLOW}⚠${NC} $name restart failed (may not be installed)"
  done
}

status_check() {
  echo -e "\n${CYAN}Fleet Status${NC}\n"
  for pi in "${PI_FLEET[@]}"; do
    local host="${pi%%:*}"
    local name="${pi##*:}"
    local ip="${host##*@}"
    
    if ping -c 1 -W 2 "$ip" >/dev/null 2>&1; then
      service_status=$(ssh -o ConnectTimeout=5 "$host" \
        "systemctl is-active blackroad-agent 2>/dev/null || echo 'not-installed'" 2>/dev/null || echo "ssh-failed")
      echo -e "  ${GREEN}●${NC} $name ($ip): $service_status"
    else
      echo -e "  ${RED}●${NC} $name ($ip): offline"
    fi
  done
}

case "${1:-help}" in
  check)
    echo -e "${CYAN}Checking fleet connectivity...${NC}"
    for pi in "${PI_FLEET[@]}"; do
      check_connectivity "$pi"
    done
    ;;
  deploy)
    if [ -n "${2:-}" ]; then
      # Deploy to specific Pi
      for pi in "${PI_FLEET[@]}"; do
        [[ "${pi##*:}" == "$2" ]] && deploy_to_pi "$pi"
      done
    else
      # Deploy to all
      for pi in "${PI_FLEET[@]}"; do
        check_connectivity "$pi" && deploy_to_pi "$pi"
      done
    fi
    ;;
  restart) restart_agents ;;
  status)  status_check ;;
  *)
    echo "Usage: $0 <command> [pi-name]"
    echo "Commands: check, deploy [name], restart, status"
    echo "Pi names: blackroad-pi, aria64, alice, lucidia"
    ;;
esac
