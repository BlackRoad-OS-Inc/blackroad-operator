#!/bin/bash
# BlackRoad Cron Health Dashboard
# Shows last run time + status for all crons across fleet

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
AMBER='\033[38;5;214m'
DIM='\033[2m'
BOLD='\033[1m'
R='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${R}"
echo -e "${PINK}║  Cron Health Dashboard — $(date '+%Y-%m-%d %H:%M')              ║${R}"
echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${R}"
echo ""

check_log() {
  local name="$1" logfile="$2" node="$3"
  local last_mod size status
  
  if [ "$node" = "local" ]; then
    [ ! -f "$logfile" ] && printf "  ${DIM}%-28s %-8s %s${R}\n" "$name" "$node" "NO LOG" && return
    last_mod=$(stat -f "%Sm" -t "%H:%M %m/%d" "$logfile" 2>/dev/null)
    size=$(wc -c < "$logfile" 2>/dev/null | tr -d ' ')
    status=$(tail -1 "$logfile" 2>/dev/null | head -c 60)
  else
    local result
    result=$(ssh -o ConnectTimeout=3 -o BatchMode=yes "$node" "stat -c '%Y' '$logfile' 2>/dev/null && wc -c < '$logfile' 2>/dev/null && tail -1 '$logfile' 2>/dev/null" 2>/dev/null)
    if [ -z "$result" ]; then
      printf "  ${RED}%-28s %-8s %s${R}\n" "$name" "$node" "UNREACHABLE"
      return
    fi
    last_mod=$(echo "$result" | head -1)
    size=$(echo "$result" | sed -n '2p' | tr -d ' ')
    status=$(echo "$result" | tail -1 | head -c 60)
    # Convert epoch to readable
    if [ -n "$last_mod" ]; then
      last_mod=$(date -r "$last_mod" '+%H:%M %m/%d' 2>/dev/null || echo "$last_mod")
    fi
  fi

  local color="$GREEN"
  [ "${size:-0}" -eq 0 ] && color="$AMBER"
  printf "  ${color}%-28s${R} %-8s %-14s %s\n" "$name" "$node" "${last_mod:-?}" "${size:-0}B"
}

echo -e "${BOLD}Mac (Alexandria)${R}"
check_log "health-monitor" "$HOME/.blackroad/logs/health-cron.log" "local"
check_log "fleet-collector" "$HOME/.blackroad/logs/fleet-collector.log" "local"
check_log "gdrive-sync" "$HOME/.blackroad/logs/gdrive-cron.log" "local"
check_log "claude-sync" "$HOME/.blackroad/claude-sync.log" "local"
check_log "cf-token-refresh" "/tmp/cf-token-refresh.log" "local"
echo ""

echo -e "${BOLD}Alice (192.168.4.49)${R}"
check_log "fleet-autonomy" "/home/pi/.blackroad-autonomy/autonomy.log" "pi@192.168.4.49"
check_log "stats-push" "/var/log/blackroad-stats-push.log" "pi@192.168.4.49"
check_log "git-sync" "/home/pi/.blackroad-autonomy/git-sync.log" "pi@192.168.4.49"
check_log "heartbeat" "/home/pi/.blackroad-autonomy/heartbeat.log" "pi@192.168.4.49"
echo ""

echo -e "${BOLD}Octavia (192.168.4.101)${R}"
check_log "fleet-autonomy" "/home/pi/.blackroad-autonomy/autonomy.log" "pi@192.168.4.101"
check_log "gitea" "/var/log/gitea/gitea.log" "pi@192.168.4.101"
echo ""

echo -e "${BOLD}Lucidia (192.168.4.38)${R}"
check_log "fleet-autonomy" "/home/blackroad/.blackroad-autonomy/autonomy.log" "blackroad@192.168.4.38"
echo ""

echo -e "${DIM}Run: br cron-health${R}"
