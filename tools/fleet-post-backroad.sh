#!/bin/bash
# Post fleet health to BackRoad social — keeps the platform alive
# Run daily at noon: 0 12 * * * bash ~/blackroad-operator/tools/fleet-post-backroad.sh

API="https://social.blackroad.io/api"

# Check all products
PASS=0; TOTAL=0
for url in "https://social.blackroad.io" "https://chat.blackroad.io" "https://search.blackroad.io" "https://roundtrip.blackroad.io" "https://auth.blackroad.io" "https://blackroad.io"; do
  code=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
  TOTAL=$((TOTAL+1))
  [ "$code" = "200" ] && PASS=$((PASS+1))
done

# Get search stats
INDEXED=$(curl -s "https://search.blackroad.io/stats" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('indexed_pages',0))" 2>/dev/null)

# Post status
curl -s -X POST "$API/groups/fleet-ops/posts" \
  -H "Content-Type: application/json" \
  -d "{\"handle\":\"octavia\",\"author\":\"Octavia\",\"content\":\"Daily fleet report: $PASS/$TOTAL products online. $INDEXED pages indexed. $(date -u '+%Y-%m-%d %H:%M UTC')\",\"tags\":[\"fleet\",\"daily-report\"]}" >/dev/null 2>&1

echo "[$(date -u)] Fleet report: $PASS/$TOTAL" >> /tmp/backroad-fleet.log
