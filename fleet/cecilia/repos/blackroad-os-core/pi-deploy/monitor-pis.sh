#!/bin/bash
# BlackRoad OS - Pi Fleet Live Monitor

PI_USER="${PI_USER:-pi}"

declare -A PI_FLEET=(
    ["lucidia"]="192.168.4.38"
    ["blackroad-pi"]="192.168.4.64"
    ["lucidia-alt"]="192.168.4.99"
)

while true; do
    clear
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║       BlackRoad Pi Fleet - Live Monitor               ║"
    echo "║       $(date '+%Y-%m-%d %H:%M:%S')                             ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""

    for pi_name in "${!PI_FLEET[@]}"; do
        pi_ip="${PI_FLEET[$pi_name]}"

        echo "┌─ ${pi_name} (${pi_ip}) ─────────────"

        if ! ping -c 1 -W 1 "${pi_ip}" > /dev/null 2>&1; then
            echo "  ✗ OFFLINE"
            echo "└──────────────────────────────────────"
            echo ""
            continue
        fi

        # Get quick stats
        ssh -o ConnectTimeout=2 "${PI_USER}@${pi_ip}" "bash -s" << 'REMOTE' 2>/dev/null || echo "  ✗ SSH failed"
# CPU load
LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')

# Memory %
MEM=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')

# Temp
if [ -f /sys/class/thermal/thermal_zone0/temp ]; then
    TEMP=$(($(cat /sys/class/thermal/thermal_zone0/temp) / 1000))
else
    TEMP="N/A"
fi

# Service status
if systemctl is-active --quiet blackroad-lucidia; then
    SVC="lucidia:UP"
elif systemctl is-active --quiet blackroad-agent; then
    SVC="agent:UP"
else
    SVC="DOWN"
fi

echo "  CPU Load: ${LOAD}  |  Mem: ${MEM}%  |  Temp: ${TEMP}°C  |  ${SVC}"
REMOTE

        echo "└──────────────────────────────────────"
        echo ""
    done

    echo "Press Ctrl+C to exit | Refreshing every 5s..."
    sleep 5
done
