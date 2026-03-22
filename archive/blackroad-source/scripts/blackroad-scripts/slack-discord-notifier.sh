#!/usr/bin/env bash
# Send notifications to Slack/Discord
set -euo pipefail

SERVICE="${1:-test}"
MESSAGE="${2:-Test notification}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[NOTIFIER]${NC} Sending notification..."

# For demo, we'll create a local notification
mkdir -p ~/.codex/memory/notifications

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
cat >> ~/.codex/memory/notifications/log.txt <<LOG
[$TIMESTAMP] $SERVICE: $MESSAGE
LOG

# Create notification file for latest
cat > ~/.codex/memory/notifications/latest.json <<JSON
{
  "timestamp": "$TIMESTAMP",
  "service": "$SERVICE",
  "message": "$MESSAGE",
  "project": "$(basename $(pwd))"
}
JSON

echo -e "${GREEN}✓${NC} Notification logged!"
echo "  Service: $SERVICE"
echo "  Message: $MESSAGE"
echo ""
echo "View: cat ~/.codex/memory/notifications/log.txt"
