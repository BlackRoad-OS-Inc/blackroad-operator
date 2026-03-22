#!/bin/bash
# BlackRoad Pi Autonomy System — Universal Fleet Edition
# Self-healing, monitoring, and autonomous operation for all Pi nodes

AUTONOMY_DIR="$HOME/.blackroad-autonomy"
LOG_FILE="$AUTONOMY_DIR/autonomy.log"
HEARTBEAT_FILE="$AUTONOMY_DIR/heartbeat"
CONFIG_FILE="$AUTONOMY_DIR/config.json"
HOSTNAME=$(hostname)

mkdir -p "$AUTONOMY_DIR"/{logs,health,tasks/pending,tasks/completed,state}

# ─── CONFIG PER NODE ─────────────────────────────────────────────
declare -A NODE_SERVICES
NODE_SERVICES[alice]="stats-proxy cloudflared pihole-FTL postgresql qdrant"
NODE_SERVICES[cecilia]="stats-proxy ollama"
NODE_SERVICES[octavia]="stats-proxy ollama"
NODE_SERVICES[aria]="stats-proxy ollama"

SERVICES="${NODE_SERVICES[$HOSTNAME]:-stats-proxy}"

log() {
    local ts=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$ts] [$1] $2" >> "$LOG_FILE"
}

heartbeat() {
    local ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local load=$(cat /proc/loadavg 2>/dev/null | awk '{print $1}')
    local mem_free=$(free -m 2>/dev/null | awk '/Mem:/ {printf "%d", $7}')
    local disk_pct=$(df / 2>/dev/null | awk 'NR==2 {print $5}' | tr -d '%')
    local disk_free=$(df -h / 2>/dev/null | awk 'NR==2 {print $4}')
    local temp=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{printf "%.1f", $1/1000}' || echo "0")

    cat > "$HEARTBEAT_FILE" << EOF
{"hostname":"$HOSTNAME","timestamp":"$ts","load":"$load","memory_free_mb":$mem_free,"disk_free":"$disk_free","disk_pct":$disk_pct,"temperature_c":$temp}
EOF
    log "BEAT" "load=$load mem=${mem_free}MB disk=${disk_pct}% temp=${temp}C"
}

check_services() {
    for svc in $SERVICES; do
        if systemctl is-active --quiet "$svc" 2>/dev/null; then
            log "SVC" "$svc: ok"
        else
            log "SVC" "$svc: DOWN — restarting"
            sudo systemctl restart "$svc" 2>/dev/null && \
                log "SVC" "$svc: restarted" || \
                log "SVC" "$svc: restart FAILED"
        fi
    done

    # Check Docker containers on Octavia (Gitea)
    if [[ "$HOSTNAME" == "octavia" ]] && command -v docker &>/dev/null; then
        if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q "blackroad-git"; then
            log "SVC" "gitea-docker: DOWN — restarting"
            docker start blackroad-git 2>/dev/null && \
                log "SVC" "gitea-docker: restarted" || \
                log "SVC" "gitea-docker: restart FAILED"
        fi
    fi
}

check_network() {
    if ping -c 1 -W 3 1.1.1.1 &>/dev/null; then
        log "NET" "internet: ok"
    else
        log "NET" "internet: DOWN"
        # Try restarting WireGuard
        sudo systemctl restart wg-quick@wg0 2>/dev/null
    fi
}

self_heal() {
    log "HEAL" "running self-heal on $HOSTNAME"

    # Disk pressure
    local disk_pct=$(df / 2>/dev/null | awk 'NR==2 {print $5}' | tr -d '%')
    if [[ "$disk_pct" -gt 90 ]]; then
        log "HEAL" "disk ${disk_pct}% — cleaning"
        sudo journalctl --vacuum-time=1d --vacuum-size=50M 2>/dev/null
        sudo find /tmp -type f -atime +2 -delete 2>/dev/null
        sudo apt-get clean 2>/dev/null
        # Clear old docker stuff on Octavia
        if [[ "$HOSTNAME" == "octavia" ]]; then
            docker system prune -f 2>/dev/null
        fi
    fi

    # Memory pressure
    local mem_pct=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}')
    if [[ "$mem_pct" -gt 90 ]]; then
        log "HEAL" "memory ${mem_pct}% — clearing caches"
        sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1
    fi

    # Temperature
    local temp=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo 0)
    if [[ "$temp" -gt 80000 ]]; then
        log "HEAL" "temp CRITICAL $(( temp / 1000 ))C — throttling"
        # Reduce load by stopping non-essential services temporarily
    fi

    # Stats proxy health check
    if ! curl -s --max-time 5 http://localhost:7890/health &>/dev/null; then
        log "HEAL" "stats-proxy not responding — restarting"
        sudo systemctl restart stats-proxy 2>/dev/null
    fi

    # Log rotation
    if [[ -f "$LOG_FILE" ]] && [[ $(wc -l < "$LOG_FILE") -gt 5000 ]]; then
        tail -1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
        log "HEAL" "rotated autonomy log"
    fi
}

check_tasks() {
    shopt -s nullglob
    for task in "$AUTONOMY_DIR/tasks/pending/"*.json; do
        local id=$(basename "$task" .json)
        local cmd=$(python3 -c "import json; print(json.load(open('$task')).get('command',''))" 2>/dev/null)
        if [[ -n "$cmd" ]]; then
            log "TASK" "executing: $id"
            eval "$cmd" >> "$AUTONOMY_DIR/logs/task-$id.log" 2>&1
            mv "$task" "$AUTONOMY_DIR/tasks/completed/"
            log "TASK" "done: $id"
        fi
    done
    shopt -u nullglob
}

status() {
    echo "BlackRoad Pi Autonomy — $HOSTNAME"
    echo "=================================="
    cat "$HEARTBEAT_FILE" 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "No heartbeat"
    echo ""
    echo "Services: $SERVICES"
    for svc in $SERVICES; do
        printf "  %-20s %s\n" "$svc" "$(systemctl is-active $svc 2>/dev/null)"
    done
    echo ""
    echo "Recent log:"
    tail -5 "$LOG_FILE" 2>/dev/null || echo "  No logs"
}

case "${1:-status}" in
    heartbeat) heartbeat ;;
    heal) check_services; check_network; self_heal; check_tasks ;;
    check) check_services; check_network ;;
    status) status ;;
    logs) tail -f "$LOG_FILE" ;;
    *) echo "Usage: $0 {heartbeat|heal|check|status|logs}" ;;
esac
