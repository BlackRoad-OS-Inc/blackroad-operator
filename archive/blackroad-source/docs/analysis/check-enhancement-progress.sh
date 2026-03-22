#!/usr/bin/env bash
# Monitor the BlackRoad OS repository enhancement progress

PROGRESS_FILE="/Users/alexa/.copilot/session-state/30b63bc6-2854-4c07-ab88-b97fde63a123/files/logs/enhancement_progress.txt"
LOG_FILE="/Users/alexa/.copilot/session-state/30b63bc6-2854-4c07-ab88-b97fde63a123/files/logs/enhancement.log"

if [ ! -f "$PROGRESS_FILE" ]; then
    echo "Enhancement hasn't started yet."
    exit 1
fi

PROCESSED=$(cat "$PROGRESS_FILE")
TOTAL=1141
REMAINING=$((TOTAL - PROCESSED))
PERCENT=$(awk "BEGIN {printf \"%.2f\", ($PROCESSED/$TOTAL)*100}")

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   BlackRoad OS Repository Enhancement Progress       ║"
echo "╠═══════════════════════════════════════════════════════╣"
echo "║ Total Repositories: $TOTAL                            "
echo "║ Processed:          $PROCESSED                        "
echo "║ Remaining:          $REMAINING                        "
echo "║ Progress:           $PERCENT%                         "
echo "╠═══════════════════════════════════════════════════════╣"
echo "║ Recent Activity:                                      ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
tail -10 "$LOG_FILE"
echo ""
echo "Run 'tail -f $LOG_FILE' to watch live progress"
