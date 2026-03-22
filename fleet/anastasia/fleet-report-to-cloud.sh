#!/bin/bash
# fleet-report-to-cloud.sh — report node status to CF Worker fleet bridge
# Run via cron: */5 * * * * /opt/blackroad/bin/fleet-report-to-cloud.sh

BRIDGE_URL="https://blackroad-fleet-bridge.amundsonalexa.workers.dev"
SECRET="blackroad-fleet-2026"

NODE=$(hostname)
CORES=$(nproc)
LOAD=$(cat /proc/loadavg | awk '{print $1}')
RAM_USED=$(free -m | awk 'NR==2{print $3}')
RAM_TOTAL=$(free -m | awk 'NR==2{print $2}')
DISK_PCT=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')
HAILO=$([ -e /dev/hailo0 ] && echo "true" || echo "false")
WG_IP=$(ip addr show wg0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)
UPTIME_S=$(cat /proc/uptime | awk '{print int($1)}')

curl -s -X POST "$BRIDGE_URL/report" \
  -H "Content-Type: application/json" \
  -H "X-Fleet-Secret: $SECRET" \
  -d "{\"node\":\"$NODE\",\"cores\":$CORES,\"load\":$LOAD,\"ram_used\":$RAM_USED,\"ram_total\":$RAM_TOTAL,\"disk_pct\":$DISK_PCT,\"hailo\":$HAILO,\"wg_ip\":\"$WG_IP\",\"uptime_s\":$UPTIME_S}" \
  > /dev/null 2>&1
