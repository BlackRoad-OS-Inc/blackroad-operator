#!/bin/bash
# BlackRoad Fleet Coordinator — Background process that:
# 1. Monitors all nodes continuously
# 2. Auto-heals crashed services
# 3. Pushes telemetry to stats API
# 4. Syncs state between Pis
# 5. Alerts on problems
#
# Run: ./blackroad-fleet-coordinator.sh
# Cron: */5 * * * * /Users/alexa/blackroad-fleet-coordinator.sh >> ~/.blackroad/logs/coordinator.log 2>&1

set -euo pipefail
source ~/.blackroad/config/nodes.sh

LOG_DIR="$HOME/.blackroad/logs"
STATE_DIR="$HOME/.blackroad/fleet-state"
mkdir -p "$LOG_DIR" "$STATE_DIR"

STATS_URL="https://stats-blackroad.amundsonalexa.workers.dev"
STATS_KEY="blackroad-stats-push-2026"
SLACK_URL="https://blackroad-slack.amundsonalexa.workers.dev"

log() { printf "[%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$1"; }

ALERT_COOLDOWN=1800  # 30 minutes between repeat alerts for same issue
ALERT_STATE_DIR="$STATE_DIR/alerts"
mkdir -p "$ALERT_STATE_DIR"

slack_alert() {
  local key=$(echo "$1" | md5sum | cut -c1-12 2>/dev/null || echo "$(date +%s)")
  local cooldown_file="$ALERT_STATE_DIR/$key"
  # Skip if same alert was sent within cooldown period
  if [[ -f "$cooldown_file" ]]; then
    local last=$(cat "$cooldown_file" 2>/dev/null)
    local now=$(date +%s)
    if (( now - last < ALERT_COOLDOWN )); then
      return 0  # Suppress duplicate
    fi
  fi
  date +%s > "$cooldown_file"
  curl -s --max-time 5 -X POST "$SLACK_URL/alert" \
    -H "Content-Type: application/json" \
    -d "{\"text\":\"$1\"}" >/dev/null 2>&1 || true
}

slack_post() {
  local key=$(echo "$1" | md5sum | cut -c1-12 2>/dev/null || echo "$(date +%s)")
  local cooldown_file="$ALERT_STATE_DIR/$key"
  if [[ -f "$cooldown_file" ]]; then
    local last=$(cat "$cooldown_file" 2>/dev/null)
    local now=$(date +%s)
    if (( now - last < ALERT_COOLDOWN )); then
      return 0
    fi
  fi
  date +%s > "$cooldown_file"
  curl -s --max-time 5 -X POST "$SLACK_URL/post" \
    -H "Content-Type: application/json" \
    -d "{\"text\":\"$1\"}" >/dev/null 2>&1 || true
}

# ── 1. PROBE ALL NODES ──
probe_node() {
  local name=$1
  local ip="${NODE_IP[$name]}"
  local user="${NODE_USER[$name]:-pi}"
  local state_file="$STATE_DIR/${name}.json"
  local prev_status="unknown"
  [[ -f "$state_file" ]] && prev_status=$(python3 -c "import json;print(json.load(open('$state_file')).get('status','unknown'))" 2>/dev/null || echo "unknown")

  # Ping check
  if ! ping -c1 -W2 "$ip" &>/dev/null; then
    echo "{\"name\":\"$name\",\"ip\":\"$ip\",\"status\":\"down\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$state_file"
    if [[ "$prev_status" != "down" ]]; then
      log "ALERT: $name ($ip) went DOWN"
      slack_alert "🔴 *$name* ($ip) went DOWN"
    fi
    return
  fi

  # SSH probe
  local data
  data=$(ssh $BR_SSH_OPTS "${user}@${ip}" "
    load=\$(cat /proc/loadavg | awk '{print \$1}')
    temp=\$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{printf \"%.0f\", \$1/1000}' || echo 0)
    mem_free=\$(free -m | awk '/Mem:/ {print \$4}')
    mem_total=\$(free -m | awk '/Mem:/ {print \$2}')
    disk=\$(df / | awk 'NR==2 {print \$5}' | tr -d '%')
    uptime_s=\$(cat /proc/uptime | awk '{print int(\$1)}')
    svcs=\$(systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null | wc -l)
    docker_c=\$(docker ps -q 2>/dev/null | wc -l || echo 0)
    echo \"\$load|\$temp|\$mem_free|\$mem_total|\$disk|\$uptime_s|\$svcs|\$docker_c\"
  " 2>/dev/null) || data=""

  if [[ -z "$data" ]]; then
    echo "{\"name\":\"$name\",\"ip\":\"$ip\",\"status\":\"ssh_fail\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$state_file"
    log "WARN: $name ($ip) ping OK but SSH failed"
    return
  fi

  IFS='|' read -r load temp mem_free mem_total disk uptime svcs docker_c <<< "$data"

  cat > "$state_file" << EOF
{"name":"$name","ip":"$ip","status":"up","load":$load,"temp":$temp,"mem_free":$mem_free,"mem_total":$mem_total,"disk_pct":$disk,"uptime_s":$uptime,"services":$svcs,"containers":$docker_c,"ts":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOF

  # State change alerts
  if [[ "$prev_status" == "down" || "$prev_status" == "ssh_fail" ]]; then
    log "RECOVERED: $name ($ip) is back UP"
    slack_post "🟢 *$name* ($ip) recovered — back online"
  fi

  # Threshold alerts
  if [[ "$disk" -gt 90 ]]; then log "ALERT: $name disk at ${disk}%"; slack_alert "💾 *$name* disk critical: ${disk}%"; fi
  if [[ "$temp" -gt 75 ]]; then log "ALERT: $name temp at ${temp}C"; slack_alert "🌡️ *$name* overheating: ${temp}°C"; fi
  if [[ "$mem_free" -lt 200 ]]; then log "ALERT: $name low memory (${mem_free}MB free)"; slack_alert "🧠 *$name* low memory: ${mem_free}MB free"; fi
}

# ── 2. SERVICE HEALTH CHECKS ──
# Some services bind to localhost only (PostgreSQL, Redis) — check via SSH
check_services() {
  local name=$1
  local ip="${NODE_IP[$name]}"
  local services="${NODE_SERVICES[$name]:-}"
  [[ -z "$services" ]] && return

  IFS=',' read -ra svc_list <<< "$services"
  for svc in "${svc_list[@]}"; do
    local port=$(echo "$svc" | cut -d: -f1)
    local label=$(echo "$svc" | cut -d: -f2)
    # Try remote first, then check via SSH for localhost-bound services
    if ! nc -z -w2 "$ip" "$port" 2>/dev/null; then
      local ssh_check
      ssh_check=$(br_ssh "$name" "ss -tlnp 2>/dev/null | grep -q ':$port ' && echo ok || echo down" 2>/dev/null || echo "ssh_fail")
      if [[ "$ssh_check" != "ok" ]]; then
        log "SERVICE DOWN: $name:$port ($label)"
      fi
    fi
  done
}

# ── 3. AUTO-HEAL ──
auto_heal() {
  # Check Ollama on Cecilia
  if ! nc -z -w2 192.168.4.96 11434 2>/dev/null; then
    log "HEAL: Restarting Ollama on Cecilia"
    br_ssh cecilia "sudo systemctl restart ollama" 2>/dev/null
    slack_post "🔧 Auto-healed: restarted *Ollama* on Cecilia"
  fi

  # Check Gitea on Octavia
  if ! nc -z -w2 192.168.4.101 3100 2>/dev/null; then
    log "HEAL: Restarting Gitea (blackroad-git) on Octavia"
    br_ssh octavia "docker restart blackroad-git" 2>/dev/null
    slack_post "🔧 Auto-healed: restarted *Gitea* on Octavia"
  fi

  # Check cloudflared tunnels
  for node in cecilia lucidia; do
    local tunnel_ok
    tunnel_ok=$(br_ssh "$node" "systemctl is-active cloudflared 2>/dev/null" || echo "inactive")
    if [[ "$tunnel_ok" != "active" ]]; then
      log "HEAL: Restarting cloudflared on $node"
      br_ssh "$node" "sudo systemctl restart cloudflared" 2>/dev/null
    fi
  done

  # Check NATS on Octavia
  local nats_ok
  nats_ok=$(br_ssh octavia "docker ps -q -f name=nats | head -1" 2>/dev/null || echo "")
  if [[ -z "$nats_ok" ]]; then
    log "HEAL: NATS container not running on Octavia"
  fi
}

# ── 4. PUSH TELEMETRY ──
push_telemetry() {
  for name in "${ALL_NODES[@]}"; do
    local state_file="$STATE_DIR/${name}.json"
    [[ -f "$state_file" ]] || continue
    local status=$(python3 -c "import json;print(json.load(open('$state_file')).get('status','unknown'))" 2>/dev/null || echo "unknown")
    [[ "$status" == "up" ]] || continue

    curl -s --max-time 5 -X POST "$STATS_URL/api/push" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $STATS_KEY" \
      -d @"$state_file" >/dev/null 2>&1 || true
  done
}

# ── 5. FLEET SUMMARY ──
fleet_summary() {
  local up=0 down=0
  for name in "${ALL_NODES[@]}"; do
    local state_file="$STATE_DIR/${name}.json"
    if [[ -f "$state_file" ]]; then
      local status=$(python3 -c "import json;print(json.load(open('$state_file')).get('status','unknown'))" 2>/dev/null || echo "unknown")
      if [[ "$status" == "up" ]]; then
        up=$((up + 1))
      else
        down=$((down + 1))
      fi
    fi
  done
  log "FLEET: $up up, $down down ($(date))"
}

# ── MAIN ──
log "━━━ Fleet Coordinator Run ━━━"

# Probe all nodes (local Pis only - cloud nodes are slower)
for name in "${PI_NODES[@]}"; do
  probe_node "$name"
done

# Service checks
for name in "${PI_NODES[@]}"; do
  local_status=$(python3 -c "import json;print(json.load(open('$STATE_DIR/${name}.json')).get('status','down'))" 2>/dev/null || echo "down")
  [[ "$local_status" == "up" ]] && check_services "$name"
done

# Auto-heal
auto_heal

# Push telemetry
push_telemetry

# Summary
fleet_summary

log "━━━ Done ━━━"
