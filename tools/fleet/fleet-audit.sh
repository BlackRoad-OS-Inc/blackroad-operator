#!/bin/bash
# br fleet-audit — Audit all 7 nodes
set -e
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  BlackRoad Fleet Audit                 ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════╝${RESET}"
echo ""

NODES=(alice cecilia octavia aria lucidia gematria anastasia)

for node in "${NODES[@]}"; do
  echo -e "${PINK}=== ${node} ===${RESET}"
  result=$(ssh -o ConnectTimeout=5 "$node" "
    echo \"HOST: \$(hostname)\"
    echo \"ARCH: \$(uname -m)\"
    echo \"DISK: \$(df -h / | tail -1 | awk '{print \$5, \"used,\", \$4, \"free\"}')\"
    echo \"LOAD: \$(uptime | awk -F'load average:' '{print \$2}')\"
    echo \"UPTIME: \$(uptime -p 2>/dev/null || uptime | awk -F'up ' '{print \$2}' | awk -F',' '{print \$1, \$2}')\"
    echo \"OLLAMA: \$(ollama list 2>/dev/null | wc -l) models\"
    echo \"DOCKER: \$(docker ps --format '{{.Names}}' 2>/dev/null | wc -l) containers\"
    echo \"TEMP: \$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{printf \"%.1f°C\", \$1/1000}' || echo 'N/A')\"
  " 2>/dev/null)
  
  if [ -n "$result" ]; then
    echo "$result" | while read line; do
      key=$(echo "$line" | cut -d: -f1)
      val=$(echo "$line" | cut -d: -f2-)
      # Color disk usage
      if [ "$key" = "DISK" ] && echo "$val" | grep -qE '9[0-9]%|100%'; then
        echo -e "  ${RED}${key}:${val}${RESET}"
      elif [ "$key" = "DISK" ] && echo "$val" | grep -qE '8[0-9]%'; then
        echo -e "  ${AMBER}${key}:${val}${RESET}"
      else
        echo -e "  ${GREEN}${key}:${val}${RESET}"
      fi
    done
  else
    echo -e "  ${RED}UNREACHABLE${RESET}"
  fi
  echo ""
done

echo -e "${GREEN}Fleet audit complete.${RESET}"
