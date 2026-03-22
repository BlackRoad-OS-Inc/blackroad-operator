#!/bin/bash
# BlackRoad Uptime Monitor — checks all services and logs results
# Run via cron: */5 * * * *

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
DIM='\033[2m'
RESET='\033[0m'

LOG_DIR="$HOME/.blackroad/uptime"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/$(date +%Y-%m-%d).log"

SERVICES=(
  "app.blackroad.io|App"
  "roundtrip.blackroad.io|RoundTrip"
  "chat.blackroad.io|Chat"
  "auth.blackroad.io|Auth"
  "search.blackroad.io|Search"
  "git.blackroad.io|RoadCode"
  "blackroad.io|Main"
  "ai.blackroad.io|AI"
  "pay.blackroad.io|RoadPay"
  "hq.blackroad.io|HQ"
  "admin.blackroad.io|Admin"
)

NODES=(
  "192.168.4.49|Alice"
  "192.168.4.96|Cecilia"
  "192.168.4.101|Octavia"
  "192.168.4.38|Lucidia"
)

ts=$(date +"%Y-%m-%dT%H:%M:%S")
up=0
down=0
total=0

echo -e "${PINK}BlackRoad Uptime Monitor${RESET} ${DIM}$ts${RESET}"
echo ""

# Check HTTPS services
echo -e "${DIM}Services:${RESET}"
for entry in "${SERVICES[@]}"; do
  domain=$(echo "$entry" | cut -d'|' -f1)
  name=$(echo "$entry" | cut -d'|' -f2)
  total=$((total + 1))

  start=$(python3 -c "import time; print(time.time())" 2>/dev/null || date +%s)
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "https://$domain/" 2>/dev/null || echo "000")
  end=$(python3 -c "import time; print(time.time())" 2>/dev/null || date +%s)
  ms=$(python3 -c "print(int(($end - $start) * 1000))" 2>/dev/null || echo "?")

  if [ "$code" = "200" ] || [ "$code" = "301" ] || [ "$code" = "302" ] || [ "$code" = "303" ]; then
    echo -e "  ${GREEN}UP${RESET}  ${name} (${ms}ms)"
    up=$((up + 1))
    echo "$ts UP $domain $code ${ms}ms" >> "$LOG"
  else
    echo -e "  ${RED}DOWN${RESET} ${name} (HTTP $code)"
    down=$((down + 1))
    echo "$ts DOWN $domain $code" >> "$LOG"
  fi
done

echo ""

# Check Pi nodes via SSH
echo -e "${DIM}Nodes:${RESET}"
for entry in "${NODES[@]}"; do
  ip=$(echo "$entry" | cut -d'|' -f1)
  name=$(echo "$entry" | cut -d'|' -f2)
  total=$((total + 1))

  if ssh -o ConnectTimeout=3 -o BatchMode=yes "pi@$ip" "echo ok" 2>/dev/null | grep -q ok; then
    temp=$(ssh -o ConnectTimeout=3 "pi@$ip" "cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null" 2>/dev/null | awk '{printf "%.0f", $1/1000}')
    echo -e "  ${GREEN}UP${RESET}  ${name} (${temp}C)"
    up=$((up + 1))
    echo "$ts UP $name ${temp}C" >> "$LOG"
  elif ssh -o ConnectTimeout=3 -o BatchMode=yes "blackroad@$ip" "echo ok" 2>/dev/null | grep -q ok; then
    echo -e "  ${GREEN}UP${RESET}  ${name}"
    up=$((up + 1))
    echo "$ts UP $name" >> "$LOG"
  else
    echo -e "  ${RED}DOWN${RESET} ${name}"
    down=$((down + 1))
    echo "$ts DOWN $name" >> "$LOG"
  fi
done

echo ""
pct=$((up * 100 / total))
echo -e "${PINK}Score: ${up}/${total} (${pct}%)${RESET}"
echo "$ts SCORE $up/$total ${pct}%" >> "$LOG"
