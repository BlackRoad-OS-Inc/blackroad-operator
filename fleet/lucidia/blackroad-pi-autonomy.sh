#!/bin/bash
# BlackRoad Pi Autonomy System
# Self-healing, monitoring, and autonomous operation for Pi fleet

set -e

AUTONOMY_DIR="$HOME/.blackroad-autonomy"
LOG_FILE="$AUTONOMY_DIR/autonomy.log"
HEARTBEAT_FILE="$AUTONOMY_DIR/heartbeat"
CONFIG_FILE="$AUTONOMY_DIR/config.json"

# BlackRoad Brand Colors (ANSI 256)
PINK='\033[38;5;205m'    # Hot Pink #FF1D6C
AMBER='\033[38;5;214m'   # Amber #F5A623
BLUE='\033[38;5;69m'     # Electric Blue #2979FF
VIOLET='\033[38;5;135m'  # Violet #9C27B0
WHITE='\033[1;37m'       # Bold White
GREEN='\033[38;5;82m'    # Success Green
RED='\033[38;5;196m'     # Error Red
DIM='\033[2m'            # Dim
NC='\033[0m'             # Reset

init() {
    mkdir -p "$AUTONOMY_DIR"/{logs,health,tasks/pending,tasks/completed,state}

    if [[ ! -f "$CONFIG_FILE" ]]; then
        cat > "$CONFIG_FILE" << EOFCONFIG
{
    "hostname": "$(hostname)",
    "role": "worker",
    "heartbeat_interval": 60,
    "health_check_interval": 300,
    "services_to_monitor": ["ollama", "tailscaled"],
    "self_healing_enabled": true
}
EOFCONFIG
    fi
    echo -e "${GREEN}[INIT]${NC} Autonomy initialized at $AUTONOMY_DIR"
}

log() {
    local level="$1"
    local msg="$2"
    local ts=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$ts] [${PINK}$level${NC}] $msg" | tee -a "$LOG_FILE"
}

heartbeat() {
    local ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local uptime=$(uptime -p 2>/dev/null || uptime | awk -F'up ' '{print $2}' | awk -F',' '{print $1}')
    local load=$(cat /proc/loadavg 2>/dev/null | awk '{print $1}')
    local mem=$(free -m 2>/dev/null | awk '/Mem:/ {printf "%.0f", $4}' || echo "0")
    local disk=$(df -h / 2>/dev/null | awk 'NR==2 {print $4}' || echo "0")
    local temp=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{printf "%.1f", $1/1000}' || echo "0")

    cat > "$HEARTBEAT_FILE" << EOF
{
    "hostname": "$(hostname)",
    "timestamp": "$ts",
    "uptime": "$uptime",
    "load": "$load",
    "memory_free_mb": $mem,
    "disk_free": "$disk",
    "temperature_c": $temp,
    "status": "healthy"
}
EOF
    log "BEAT" "Load: ${AMBER}$load${NC} | Mem: ${BLUE}${mem}MB${NC} | Disk: ${VIOLET}$disk${NC} | Temp: ${PINK}${temp}C${NC}"
}

check_services() {
    local services=("ollama" "tailscaled")
    for svc in "${services[@]}"; do
        if systemctl is-active --quiet "$svc" 2>/dev/null; then
            log "SVC" "$svc: ${GREEN}running${NC}"
        else
            log "SVC" "$svc: ${RED}stopped${NC} - restarting"
            sudo systemctl restart "$svc" 2>/dev/null && \
                log "SVC" "$svc: ${GREEN}restarted${NC}" || \
                log "SVC" "$svc: ${RED}failed${NC}"
        fi
    done
}

check_network() {
    if tailscale status &>/dev/null; then
        log "NET" "Tailscale: ${GREEN}up${NC}"
    else
        log "NET" "Tailscale: ${RED}down${NC} - reconnecting"
        sudo tailscale up 2>/dev/null || true
    fi

    if ping -c 1 -W 3 8.8.8.8 &>/dev/null; then
        log "NET" "Internet: ${GREEN}up${NC}"
    else
        log "NET" "Internet: ${RED}down${NC}"
    fi
}

self_heal() {
    log "HEAL" "Running self-healing..."

    local disk_pct=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
    if [[ "$disk_pct" -gt 90 ]]; then
        log "HEAL" "Disk ${RED}${disk_pct}%${NC} - cleaning"
        sudo journalctl --vacuum-time=2d 2>/dev/null
        rm -rf /tmp/* 2>/dev/null
    fi

    local mem_pct=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}')
    if [[ "$mem_pct" -gt 95 ]]; then
        log "HEAL" "Memory ${RED}${mem_pct}%${NC} - restarting ollama"
        sudo systemctl restart ollama 2>/dev/null
    fi

    local temp=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo 0)
    if [[ "$temp" -gt 80000 ]]; then
        log "HEAL" "Temp ${RED}critical${NC}"
    fi
}

check_tasks() {
    local tasks_dir="$AUTONOMY_DIR/tasks/pending"
    shopt -s nullglob
    for task in "$tasks_dir"/*.json; do
        if [[ -f "$task" ]]; then
            local id=$(basename "$task" .json)
            local cmd=$(jq -r '.command // ""' "$task" 2>/dev/null)
            if [[ -n "$cmd" ]]; then
                log "TASK" "Executing: ${AMBER}$id${NC}"
                eval "$cmd" 2>&1 | tee -a "$AUTONOMY_DIR/logs/task-$id.log"
                mv "$task" "$AUTONOMY_DIR/tasks/completed/"
                log "TASK" "Done: ${GREEN}$id${NC}"
            fi
        fi
    done
    shopt -u nullglob
}

daemon() {
    log "START" "${PINK}BlackRoad Pi Autonomy${NC} on ${WHITE}$(hostname)${NC}"
    local hi=60 hci=300 last_hc=0
    while true; do
        local now=$(date +%s)
        heartbeat
        if (( now - last_hc >= hci )); then
            check_services
            check_network
            self_heal
            check_tasks
            last_hc=$now
        fi
        sleep "$hi"
    done
}

status() {
    echo -e "${PINK}═══════════════════════════════════════${NC}"
    echo -e "${WHITE}   BlackRoad Pi Autonomy Status${NC}"
    echo -e "${PINK}═══════════════════════════════════════${NC}"
    echo ""

    if pgrep -f 'blackroad-pi-autonomy.*daemon' &>/dev/null; then
        echo -e "Daemon: ${GREEN}running${NC}"
    else
        echo -e "Daemon: ${DIM}stopped${NC}"
    fi

    if [[ -f "$HEARTBEAT_FILE" ]]; then
        echo -e "\n${AMBER}Heartbeat:${NC}"
        jq -r '"  Host: \(.hostname)
  Load: \(.load)
  Mem:  \(.memory_free_mb)MB
  Disk: \(.disk_free)
  Temp: \(.temperature_c)C"' "$HEARTBEAT_FILE"
    fi

    echo -e "\n${BLUE}Recent:${NC}"
    tail -3 "$LOG_FILE" 2>/dev/null | sed 's/^/  /' || echo "  No logs"
}

case "${1:-status}" in
    init) init ;;
    daemon) init; daemon ;;
    heartbeat) heartbeat ;;
    heal) self_heal ;;
    check) check_services; check_network ;;
    status) status ;;
    logs) tail -f "$LOG_FILE" ;;
    *)
        echo -e "${PINK}BlackRoad${NC} Pi Autonomy"
        echo ""
        echo "Usage: $0 {init|daemon|status|heartbeat|heal|check|logs}"
        ;;
esac
