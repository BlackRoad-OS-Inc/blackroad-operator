#!/bin/bash
# push-stats.sh — Run from any fleet node (or Mac) to push live stats to the stats API
# Usage: STATS_SECRET=xxx ./push-stats.sh
# Deploy as cron: */5 * * * * source /opt/blackroad/stats-push.env && /opt/blackroad/push-stats.sh

set -e

STATS_URL="${STATS_URL:-https://stats.blackroad.io/api/stats}"
STATS_SECRET="${STATS_SECRET:?STATS_SECRET required}"

# Node identifier for per-node tracking and uptime
NODE_NAME=$(hostname -s 2>/dev/null || hostname 2>/dev/null || echo "unknown")

# ── Collect stats from this node ──

# SQLite databases in ~/.blackroad/
DB_COUNT=$(find ~/.blackroad/ -name "*.db" 2>/dev/null | wc -l | tr -d ' ')

# FTS5 memory entries
MEMORY_DB="$HOME/.blackroad/memory.db"
if [ -f "$MEMORY_DB" ] && [ -s "$MEMORY_DB" ]; then
  MEMORIES=$(sqlite3 "$MEMORY_DB" "SELECT COUNT(*) FROM memory_fts;" 2>/dev/null || echo "")
else
  MEMORIES=""
fi

# Ollama models
OLLAMA_JSON=$(curl -sf http://localhost:11434/api/tags 2>/dev/null || echo "")
if [ -n "$OLLAMA_JSON" ]; then
  MODELS=$(echo "$OLLAMA_JSON" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('models',[])))" 2>/dev/null || echo "")
  CECE=$(echo "$OLLAMA_JSON" | python3 -c "import sys,json; print(len([m for m in json.load(sys.stdin).get('models',[]) if 'cece' in m['name'].lower()]))" 2>/dev/null || echo "")
else
  MODELS=""
  CECE=""
fi

# Gitea repos (if local or accessible)
GITEA_REPOS=""
for url in "http://localhost:3100" "http://192.168.4.100:3100"; do
  GITEA_REPOS=$(curl -sf "${url}/api/v1/repos/search?limit=1" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('total_count', len(d.get('data',[]))))" 2>/dev/null || echo "")
  [ -n "$GITEA_REPOS" ] && [ "$GITEA_REPOS" -gt 0 ] 2>/dev/null && break
  GITEA_REPOS=""
done

# Online nodes (ping fleet)
NODES_ONLINE=0
for ip in 192.168.4.49 192.168.4.96 192.168.4.100 192.168.4.98 192.168.4.38; do
  ping -c1 -W1 "$ip" &>/dev/null && NODES_ONLINE=$((NODES_ONLINE + 1))
done

# Agents (constant)
AGENTS=6

# Uptime (seconds)
UPTIME_SECS=""
if [ -f /proc/uptime ]; then
  UPTIME_SECS=$(cut -d' ' -f1 /proc/uptime | cut -d'.' -f1)
fi

# CPU temperature (Raspberry Pi)
CPU_TEMP=""
if [ -f /sys/class/thermal/thermal_zone0/temp ]; then
  CPU_TEMP=$(awk '{printf "%.1f", $1/1000}' /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "")
fi

# Disk usage (root %)
DISK_PCT=$(df / 2>/dev/null | awk 'NR==2{print $5}' | tr -d '%' || echo "")

# RAM usage (%)
RAM_PCT=""
if [ -f /proc/meminfo ]; then
  TOTAL=$(awk '/MemTotal/{print $2}' /proc/meminfo)
  AVAIL=$(awk '/MemAvailable/{print $2}' /proc/meminfo)
  if [ -n "$TOTAL" ] && [ "$TOTAL" -gt 0 ] 2>/dev/null; then
    RAM_PCT=$(( (TOTAL - AVAIL) * 100 / TOTAL ))
  fi
fi

# Load average (1 min)
LOAD_AVG=""
if [ -f /proc/loadavg ]; then
  LOAD_AVG=$(cut -d' ' -f1 /proc/loadavg)
fi

# Docker containers running
DOCKER_COUNT=""
if command -v docker >/dev/null 2>&1; then
  DOCKER_COUNT=$(docker ps -q 2>/dev/null | wc -l | tr -d ' ' || echo "")
fi

# Service health checks
OLLAMA_UP=0
curl -sf -o /dev/null http://localhost:11434/api/tags && OLLAMA_UP=1

SSH_UP=0
pgrep -x sshd >/dev/null 2>&1 && SSH_UP=1

TUNNEL_UP=0
pgrep -x cloudflared >/dev/null 2>&1 && TUNNEL_UP=1

SERVICES_UP=$((OLLAMA_UP + SSH_UP + TUNNEL_UP))

# Internet connectivity
INET_UP=0
ping -c1 -W2 1.1.1.1 &>/dev/null && INET_UP=1

# ── Build JSON payload (only include non-empty values) ──

PAYLOAD="{\"_node\":\"$NODE_NAME\","
[ -n "$DB_COUNT" ] && [ "$DB_COUNT" -gt 0 ] 2>/dev/null && PAYLOAD="$PAYLOAD\"databases\":$DB_COUNT,"
[ -n "$MEMORIES" ] && [ "$MEMORIES" -gt 0 ] 2>/dev/null && PAYLOAD="$PAYLOAD\"memories\":$MEMORIES,"
[ -n "$MODELS" ] && [ "$MODELS" -gt 0 ] 2>/dev/null && PAYLOAD="$PAYLOAD\"models\":$MODELS,"
[ -n "$CECE" ] && [ "$CECE" -gt 0 ] 2>/dev/null && PAYLOAD="$PAYLOAD\"cece_personas\":$CECE,"
[ -n "$GITEA_REPOS" ] && [ "$GITEA_REPOS" -gt 0 ] 2>/dev/null && PAYLOAD="$PAYLOAD\"gitea_repos\":$GITEA_REPOS,"
[ "$NODES_ONLINE" -gt 0 ] && PAYLOAD="$PAYLOAD\"nodes_online\":$NODES_ONLINE,"
[ -n "$UPTIME_SECS" ] && [ "$UPTIME_SECS" -gt 0 ] 2>/dev/null && PAYLOAD="$PAYLOAD\"uptime_secs\":$UPTIME_SECS,"
[ -n "$CPU_TEMP" ] && PAYLOAD="$PAYLOAD\"cpu_temp\":$CPU_TEMP,"
[ -n "$DISK_PCT" ] && [ "$DISK_PCT" -gt 0 ] 2>/dev/null && PAYLOAD="$PAYLOAD\"disk_pct\":$DISK_PCT,"
[ -n "$RAM_PCT" ] && [ "$RAM_PCT" -gt 0 ] 2>/dev/null && PAYLOAD="$PAYLOAD\"ram_pct\":$RAM_PCT,"
[ -n "$LOAD_AVG" ] && PAYLOAD="$PAYLOAD\"load_avg\":\"$LOAD_AVG\","
[ -n "$DOCKER_COUNT" ] && [ "$DOCKER_COUNT" -gt 0 ] 2>/dev/null && PAYLOAD="$PAYLOAD\"docker_containers\":$DOCKER_COUNT,"
[ "$SERVICES_UP" -gt 0 ] && PAYLOAD="$PAYLOAD\"services_up\":$SERVICES_UP,"
[ "$INET_UP" -gt 0 ] && PAYLOAD="$PAYLOAD\"inet_up\":$INET_UP,"
PAYLOAD="$PAYLOAD\"agents\":$AGENTS}"
PAYLOAD=$(echo "$PAYLOAD" | sed 's/,}/}/')

curl -sf -X POST "$STATS_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STATS_SECRET" \
  -d "$PAYLOAD"

echo "Stats pushed: $PAYLOAD"
