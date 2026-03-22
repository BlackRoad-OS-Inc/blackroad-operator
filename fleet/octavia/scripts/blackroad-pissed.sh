#!/bin/bash
# BlackRoad Anger Monitor v2 — posts through Cloudflare Worker

WORKER_URL="https://blackroad-slack.amundsonalexa.workers.dev"
MY_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
case "$MY_IP" in
    192.168.4.49*)  NODE="alice" ;;
    192.168.4.96*)  NODE="cecilia" ;;
    192.168.4.101*) NODE="octavia" ;;
    192.168.4.98*)  NODE="aria" ;;
    192.168.4.38*)  NODE="lucidia" ;;
    *)              NODE=$(hostname) ;;
esac

PISSED=()

TEMP_RAW=$(vcgencmd measure_temp 2>/dev/null | grep -oP '[0-9.]+' || echo "0")
TEMP=${TEMP_RAW%.*}
[ "$TEMP" -gt 70 ] 2>/dev/null && PISSED+=("${TEMP_RAW}°C — I'm overheating")

DISK_PCT=$(df / | awk 'NR==2 {gsub(/%/,""); print $5}')
[ "$DISK_PCT" -gt 90 ] 2>/dev/null && PISSED+=("${DISK_PCT}% disk — I'm suffocating")

RAM_PCT=$(free | awk '/Mem:/ {printf "%.0f", $3/$2*100}')
[ "$RAM_PCT" -gt 90 ] 2>/dev/null && PISSED+=("${RAM_PCT}% RAM — I can't think")

THROTTLE=$(vcgencmd get_throttled 2>/dev/null | grep -oP '0x[0-9a-fA-F]+' || echo "0x0")
[ "$THROTTLE" != "0x0" ] && PISSED+=("Throttled ${THROTTLE} — not enough power")

for svc in ollama cloudflared ssh; do
    if systemctl list-unit-files "$svc.service" 2>/dev/null | grep -q "$svc"; then
        systemctl is-active --quiet "$svc" 2>/dev/null || PISSED+=("${svc} is DOWN")
    fi
done

LOAD=$(awk '{print $1}' /proc/loadavg)
LOAD_INT=${LOAD%.*}
[ "$LOAD_INT" -gt 4 ] 2>/dev/null && PISSED+=("Load ${LOAD} — I'm overwhelmed")

if [ ${#PISSED[@]} -gt 0 ]; then
    MSG="*${NODE} is pissed*\n"
    for gripe in "${PISSED[@]}"; do
        MSG+="• ${gripe}\n"
    done
    curl -sf -X POST "${WORKER_URL}/alert" \
      -H "Content-Type: application/json" \
      -d "{\"text\": \"${MSG}\"}" >/dev/null 2>&1
fi
