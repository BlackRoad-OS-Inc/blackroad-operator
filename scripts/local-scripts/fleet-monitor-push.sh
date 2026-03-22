#!/bin/bash
# Fleet Monitor Push — checks all workers and pushes results to fleet-monitor
# Run via cron: */5 * * * * ~/local/scripts/fleet-monitor-push.sh
set -e

MONITOR_URL="https://fleet-monitor.amundsonalexa.workers.dev/push"
WORKERS=(
  "roadcode-squad"
  "squad-webhook"
  "stats-blackroad"
  "analytics-blackroad"
  "fleet-dashboard"
  "roadpay"
  "road-search"
  "blackroad-stripe"
)

results="["
first=true

for w in "${WORKERS[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://${w}.amundsonalexa.workers.dev/health" 2>/dev/null || echo "0")
  up="false"
  [ "$code" = "200" ] && up="true"

  $first || results+=","
  results+="{\"name\":\"$w\",\"up\":$up,\"code\":$code}"
  first=false
done

results+="]"

# Push to fleet-monitor
curl -s -X POST "$MONITOR_URL" \
  -H "Content-Type: application/json" \
  -d "{\"workers\":$results}" > /dev/null 2>&1

# Log locally
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) pushed $(echo "$results" | grep -o '"up":true' | wc -l | tr -d ' ')/8 healthy" >> /tmp/fleet-monitor.log
