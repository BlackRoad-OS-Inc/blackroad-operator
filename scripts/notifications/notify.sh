#!/bin/bash
# BlackRoad Notification System
# Posts alerts to RoundTrip ops channel + logs locally
# Usage: notify.sh <level> <message>
#   notify.sh info "Deploy complete"
#   notify.sh warn "Disk 85% on Alice"
#   notify.sh error "Cecilia offline"

LEVEL="${1:-info}"
MESSAGE="${2:-No message}"
TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%SZ")
LOG_DIR="$HOME/.blackroad/notifications"
mkdir -p "$LOG_DIR"

# Log locally
echo "$TIMESTAMP [$LEVEL] $MESSAGE" >> "$LOG_DIR/notifications.log"

# Post to RoundTrip ops channel
ROUNDTRIP_URL="http://192.168.4.101:9016"
CHANNEL="ops"
AGENT="_system"

case "$LEVEL" in
  error) PREFIX="[ERROR]" ;;
  warn)  PREFIX="[WARN]" ;;
  info)  PREFIX="[INFO]" ;;
  *)     PREFIX="[$LEVEL]" ;;
esac

curl -s --max-time 5 "$ROUNDTRIP_URL/api/chat" \
  -X POST -H 'Content-Type: application/json' \
  -d "{\"agent\":\"_system\",\"message\":\"$PREFIX $MESSAGE\",\"channel\":\"$CHANNEL\"}" \
  > /dev/null 2>&1

# Also post to memory journal
cd ~/blackroad-operator 2>/dev/null && \
  bash scripts/memory/memory-system.sh log "notify-$LEVEL" notification "$MESSAGE" > /dev/null 2>&1

echo "$PREFIX $MESSAGE"
