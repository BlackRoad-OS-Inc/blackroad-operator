#!/bin/bash
# BlackRoad Pi Fleet Status Monitor

FLEET_DIR="$HOME/.blackroad/pi-fleet"
PIES=(cecilia lucidia octavia aria alice)

# BlackRoad Brand Colors (ANSI 256)
PINK='\033[38;5;205m'    # Hot Pink #FF1D6C
AMBER='\033[38;5;214m'   # Amber #F5A623
BLUE='\033[38;5;69m'     # Electric Blue #2979FF
VIOLET='\033[38;5;135m'  # Violet #9C27B0
WHITE='\033[1;37m'       # Bold White
GREEN='\033[38;5;82m'    # Success
RED='\033[38;5;196m'     # Error
DIM='\033[2m'            # Dim
NC='\033[0m'             # Reset

show_fleet() {
    echo -e "${PINK}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}                    BlackRoad Pi Fleet${NC}"
    echo -e "${PINK}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    printf "${DIM}%-12s %-10s %-8s %-10s %-10s %-8s${NC}\n" "HOST" "STATUS" "LOAD" "MEM" "DISK" "TEMP"
    echo -e "${DIM}───────────────────────────────────────────────────────────────${NC}"

    for pi in "${PIES[@]}"; do
        status=$(ssh -o ConnectTimeout=3 "$pi" "cat ~/.blackroad-autonomy/heartbeat 2>/dev/null" 2>/dev/null)

        if [[ -n "$status" ]]; then
            load=$(echo "$status" | jq -r '.load // "?"')
            mem=$(echo "$status" | jq -r '.memory_free_mb // "?"')
            disk=$(echo "$status" | jq -r '.disk_free // "?"')
            temp=$(echo "$status" | jq -r '.temperature_c // "?"')

            if ssh -o ConnectTimeout=2 "$pi" "pgrep -f blackroad-pi-autonomy" &>/dev/null; then
                svc="${GREEN}ONLINE${NC}"
            else
                svc="${AMBER}IDLE${NC}"
            fi

            printf "%-12s %-18b ${AMBER}%-8s${NC} ${BLUE}%-10s${NC} ${VIOLET}%-10s${NC} ${PINK}%-8s${NC}\n" \
                "$pi" "$svc" "$load" "${mem}MB" "$disk" "${temp}C"
        else
            printf "%-12s %-18b %-8s %-10s %-10s %-8s\n" \
                "$pi" "${RED}OFFLINE${NC}" "-" "-" "-" "-"
        fi
    done

    echo ""
    echo -e "${DIM}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
}

watch_fleet() {
    while true; do
        clear
        show_fleet
        echo -e "\n${DIM}Refreshing in 30s...${NC}"
        sleep 30
    done
}

case "${1:-show}" in
    show) show_fleet ;;
    watch) watch_fleet ;;
    logs)
        pi="${2:-cecilia}"
        echo -e "${PINK}Logs from $pi:${NC}"
        ssh "$pi" "tail -30 ~/.blackroad-autonomy/autonomy.log" 2>/dev/null || echo "Offline"
        ;;
    exec)
        shift
        cmd="$*"
        echo -e "${PINK}Executing:${NC} $cmd"
        for pi in "${PIES[@]}"; do
            echo -e "\n${AMBER}[$pi]${NC}"
            ssh -o ConnectTimeout=5 "$pi" "$cmd" 2>/dev/null || echo "  (offline)"
        done
        ;;
    *)
        echo -e "${PINK}BlackRoad${NC} Pi Fleet Monitor"
        echo ""
        echo "Usage: $0 {show|watch|logs [pi]|exec [cmd]}"
        ;;
esac
