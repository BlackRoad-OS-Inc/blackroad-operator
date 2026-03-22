#!/opt/homebrew/bin/bash
# BlackRoad Fleet Dashboard — Mac-side aggregator
# Reads fleet data from ~/local/fleet/* and displays unified status
#
# Usage:
#   fleet-dashboard.sh           # Show fleet status
#   fleet-dashboard.sh --json    # JSON output
#   fleet-dashboard.sh --watch   # Live refresh every 30s

set -euo pipefail

FLEET_DIR="$HOME/local/fleet"
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RED='\033[38;5;196m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
DIM='\033[38;5;242m'
BOLD='\033[1m'
RESET='\033[0m'

declare -A FLEET_IPS
FLEET_IPS[alice]="192.168.4.49"
FLEET_IPS[cecilia]="192.168.4.96"
FLEET_IPS[octavia]="192.168.4.100"
FLEET_IPS[aria]="192.168.4.98"
FLEET_IPS[lucidia]="192.168.4.38"
FLEET_IPS[anastasia]="174.138.44.45"
FLEET_IPS[gematria]="143.198.79.78"

show_dashboard() {
    echo -e "\n${PINK}${BOLD}  BlackRoad Fleet Status${RESET}  ${DIM}$(date '+%Y-%m-%d %H:%M:%S')${RESET}\n"
    printf "  ${DIM}%-10s %-6s %-8s %-10s %-8s %-10s %-20s${RESET}\n" \
        "NODE" "STATE" "TEMP" "MEMORY" "DISK" "LOAD" "LAST SEEN"
    printf "  ${DIM}%s${RESET}\n" "─────────────────────────────────────────────────────────────────────────"

    for node in alice cecilia octavia aria lucidia anastasia gematria; do
        local ip="${FLEET_IPS[$node]}"
        local state_color="$RED"
        local state="DOWN"
        local temp="-" mem="-" disk="-" load="-" last_seen="-"

        # Check if node is pingable right now
        if ping -c 1 -W 1 "$ip" > /dev/null 2>&1; then
            state="UP"
            state_color="$GREEN"
        fi

        # Read last dial-in data
        local heartbeat="$FLEET_DIR/$node/heartbeat.json"
        local sysinfo="$FLEET_DIR/$node/system-info.json"

        if [ -f "$sysinfo" ]; then
            temp=$(python3 -c "import json;d=json.load(open('$sysinfo'));print(f\"{d.get('temp_c',0):.0f}C\")" 2>/dev/null || echo "-")
            mem=$(python3 -c "import json;d=json.load(open('$sysinfo'));m=d.get('memory_mb',{});print(f\"{m.get('free',0)}/{m.get('total',0)}M\")" 2>/dev/null || echo "-")
            disk=$(python3 -c "import json;d=json.load(open('$sysinfo'));print(d.get('disk','-'))" 2>/dev/null || echo "-")
            load=$(python3 -c "import json;d=json.load(open('$sysinfo'));l=d.get('load',[0]);print(f\"{l[0]:.1f}\")" 2>/dev/null || echo "-")

            # Last seen = file modification time
            if [ "$(uname)" = "Darwin" ]; then
                last_seen=$(stat -f '%Sm' -t '%H:%M %m/%d' "$sysinfo" 2>/dev/null || echo "-")
            else
                last_seen=$(stat -c '%y' "$sysinfo" 2>/dev/null | cut -d. -f1 || echo "-")
            fi
        elif [ -f "$heartbeat" ]; then
            temp=$(python3 -c "import json;d=json.load(open('$heartbeat'));print(f\"{d.get('temp_c',0):.0f}C\")" 2>/dev/null || echo "-")
            mem=$(python3 -c "import json;d=json.load(open('$heartbeat'));print(f\"{d.get('mem_free_mb',0)}/{d.get('mem_total_mb',0)}M\")" 2>/dev/null || echo "-")
            disk=$(python3 -c "import json;d=json.load(open('$heartbeat'));print(f\"{d.get('disk_pct',0)}%\")" 2>/dev/null || echo "-")
            load=$(python3 -c "import json;d=json.load(open('$heartbeat'));print(f\"{d.get('load',0):.1f}\")" 2>/dev/null || echo "-")

            if [ "$(uname)" = "Darwin" ]; then
                last_seen=$(stat -f '%Sm' -t '%H:%M %m/%d' "$heartbeat" 2>/dev/null || echo "-")
            fi
        fi

        # Color temp based on severity
        local temp_color="$GREEN"
        local temp_val=${temp%C}
        if [ "$temp_val" -gt 70 ] 2>/dev/null; then
            temp_color="$RED"
        elif [ "$temp_val" -gt 55 ] 2>/dev/null; then
            temp_color="$AMBER"
        fi

        printf "  %-10s ${state_color}%-6s${RESET} ${temp_color}%-8s${RESET} %-10s %-8s %-10s ${DIM}%-20s${RESET}\n" \
            "$node" "$state" "$temp" "$mem" "$disk" "$load" "$last_seen"
    done

    echo ""

    # Show services summary per node
    echo -e "  ${VIOLET}${BOLD}Services${RESET}"
    for node in alice cecilia octavia aria lucidia anastasia gematria; do
        local svc_file="$FLEET_DIR/$node/services.txt"
        if [ -f "$svc_file" ]; then
            local count
            count=$(wc -l < "$svc_file" | tr -d ' ')
            local key_svcs
            key_svcs=$(grep -E "blackroad|ollama|cloudflare|nginx|docker|stats|cece|gitea|headscale|portainer|lucidia" "$svc_file" 2>/dev/null \
                | sed 's/\.service//' | tr '\n' ' ' || echo "-")
            printf "  ${BLUE}%-10s${RESET} ${DIM}(%2s total)${RESET} %s\n" "$node" "$count" "$key_svcs"
        fi
    done

    echo ""

    # Docker containers
    echo -e "  ${VIOLET}${BOLD}Docker${RESET}"
    for node in alice cecilia octavia aria lucidia anastasia gematria; do
        local docker_file="$FLEET_DIR/$node/docker.txt"
        if [ -f "$docker_file" ] && [ -s "$docker_file" ]; then
            local dcount
            dcount=$(wc -l < "$docker_file" | tr -d ' ')
            local containers
            containers=$(awk -F'\t' '{print $1}' "$docker_file" | tr '\n' ' ')
            printf "  ${BLUE}%-10s${RESET} ${DIM}(%2s)${RESET} %s\n" "$node" "$dcount" "$containers"
        fi
    done

    echo ""

    # Autonomy log highlights (last issues)
    echo -e "  ${VIOLET}${BOLD}Recent Autonomy Events${RESET}"
    for node in alice cecilia octavia aria lucidia anastasia gematria; do
        local log_file="$FLEET_DIR/$node/autonomy-log.txt"
        if [ -f "$log_file" ]; then
            local alerts
            alerts=$(grep -E "\[ALERT\]|\[HEAL\]|\[AUTO\]" "$log_file" 2>/dev/null | tail -3)
            if [ -n "$alerts" ]; then
                echo -e "  ${AMBER}$node:${RESET}"
                echo "$alerts" | while read -r line; do
                    echo -e "    ${DIM}$line${RESET}"
                done
            fi
        fi
    done

    echo ""
}

show_json() {
    echo "{"
    local first=true
    for node in alice cecilia octavia aria lucidia anastasia gematria; do
        local sysinfo="$FLEET_DIR/$node/system-info.json"
        $first || echo ","
        first=false
        if [ -f "$sysinfo" ]; then
            echo "  \"$node\": $(cat "$sysinfo")"
        else
            local ip="${FLEET_IPS[$node]}"
            local up="false"
            ping -c 1 -W 1 "$ip" > /dev/null 2>&1 && up="true"
            echo "  \"$node\": {\"status\": \"no_data\", \"pingable\": $up}"
        fi
    done
    echo "}"
}

case "${1:-}" in
    --json)  show_json ;;
    --watch)
        while true; do
            clear
            show_dashboard
            sleep 30
        done
        ;;
    *)       show_dashboard ;;
esac
