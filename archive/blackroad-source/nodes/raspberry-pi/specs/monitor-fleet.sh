#!/bin/zsh
# Monitor BlackRoad Pi Fleet

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

FLEET=(
  "pi@192.168.4.64:blackroad-pi:PRIMARY"
  "pi@192.168.4.38:aria64:AGENTS"
  "pi@192.168.4.49:alice:TERTIARY"
  "pi@192.168.4.99:lucidia:BACKUP"
)

check_pi() {
  local host="${1%%:*}"
  local name=$(echo "$1" | cut -d: -f2)
  local role=$(echo "$1" | cut -d: -f3)
  local ip="${host##*@}"
  
  if ! ping -c 1 -W 2 "$ip" >/dev/null 2>&1; then
    echo -e "  ${RED}✗${NC} $name ($role) — OFFLINE"
    return
  fi
  
  # Get system stats via SSH
  stats=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "$host" \
    "echo cpu=$(top -bn1 | grep 'Cpu(s)' | awk '{print $2}')% && \
     echo mem=$(free -h | awk '/^Mem:/{print $3\"/\"$2}') && \
     echo temp=$(vcgencmd measure_temp 2>/dev/null || echo n/a) && \
     echo agents=$(pgrep -c blackroad-agent 2>/dev/null || echo 0)" 2>/dev/null || echo "ssh-failed")
  
  if [ "$stats" = "ssh-failed" ]; then
    echo -e "  ${YELLOW}●${NC} $name ($role) — SSH failed"
    return
  fi
  
  cpu=$(echo "$stats" | grep "^cpu=" | cut -d= -f2)
  mem=$(echo "$stats" | grep "^mem=" | cut -d= -f2)
  temp=$(echo "$stats" | grep "^temp=" | cut -d= -f2)
  agents=$(echo "$stats" | grep "^agents=" | cut -d= -f2)
  
  echo -e "  ${GREEN}●${NC} $name [$role]"
  echo -e "    CPU: $cpu | RAM: $mem | Temp: $temp | Agents: $agents"
}

echo -e "\n${CYAN}BlackRoad Pi Fleet Monitor${NC} — $(date)"
echo -e "$(printf '─%.0s' {1..40})\n"

for pi in "${FLEET[@]}"; do
  check_pi "$pi"
done

echo ""
