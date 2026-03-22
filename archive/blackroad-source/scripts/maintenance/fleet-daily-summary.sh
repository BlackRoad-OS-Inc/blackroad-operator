#!/bin/bash
# BlackRoad Fleet Daily Summary — posts to Slack every morning
source ~/.blackroad/config/nodes.sh 2>/dev/null

SLACK="https://blackroad-slack.amundsonalexa.workers.dev/post"
UP=0; DOWN=0; REPORT=""

for name in alice cecilia octavia aria lucidia; do
  ip="${NODE_IP[$name]:-unknown}"
  if ping -c1 -W2 "$ip" &>/dev/null; then
    data=$(ssh $BR_SSH_OPTS "$(br_ssh_target "$name")" "
      load=\$(cat /proc/loadavg | awk '{print \$1}')
      temp=\$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{printf \"%.0f\", \$1/1000}' || echo '?')
      disk=\$(df / | awk 'NR==2 {print \$5}')
      up=\$(uptime -p | sed 's/up //')
      echo \"\$load|\$temp|\$disk|\$up\"
    " 2>/dev/null)
    if [[ -n "$data" ]]; then
      IFS='|' read -r load temp disk uptime <<< "$data"
      REPORT="$REPORT\n• *$name* — load:$load temp:${temp}°C disk:$disk up:$uptime"
      UP=$((UP+1))
    else
      REPORT="$REPORT\n• *$name* — ⚠️ SSH failed"
      DOWN=$((DOWN+1))
    fi
  else
    REPORT="$REPORT\n• *$name* — 🔴 offline"
    DOWN=$((DOWN+1))
  fi
done

MSG="📊 *Fleet Daily Summary* — $(date '+%A %B %d')\n\n${UP} online, ${DOWN} offline\n${REPORT}\n\n_BlackRoad OS — Pave Tomorrow._"

curl -s -X POST "$SLACK" -H "Content-Type: application/json" \
  -d "{\"text\":\"$MSG\"}" >/dev/null 2>&1
