#!/bin/bash
# Say hello on boot — through Cloudflare Worker
sleep 15
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
TEMP=$(vcgencmd measure_temp 2>/dev/null | grep -oP '[0-9.]+' || echo "?")
curl -sf -X POST "${WORKER_URL}/post" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"*${NODE}:* just booted up ${TEMP}°C — I'm here, let's ride.\"}" >/dev/null 2>&1
