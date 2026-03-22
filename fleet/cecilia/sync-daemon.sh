#!/bin/bash
# Continuous sync daemon - runs on Mac to push updates to Pis

SYNC_INTERVAL=300  # 5 minutes
SOURCE_DIR="/Users/alexa/BlackRoad-Private/memory-index"
LOG_FILE="$SOURCE_DIR/sync.log"

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo -e "${PINK}🔄 Memory Index Sync Daemon Started${RESET}" | tee -a "$LOG_FILE"
echo "Syncing every $SYNC_INTERVAL seconds" | tee -a "$LOG_FILE"

while true; do
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "" | tee -a "$LOG_FILE"
  echo "[$timestamp] Checking for updates..." | tee -a "$LOG_FILE"
  
  # Check if memory journals have new entries
  current_count=$(cat ~/.blackroad/memory/journals/*.jsonl 2>/dev/null | wc -l | tr -d ' ')
  last_count=$(cat "$SOURCE_DIR/.last_sync_count" 2>/dev/null || echo "0")
  
  if [ "$current_count" -gt "$last_count" ]; then
    new_entries=$((current_count - last_count))
    echo "  📊 New entries detected: $new_entries" | tee -a "$LOG_FILE"
    
    # Rebuild indexes
    echo "  🔄 Rebuilding indexes..." | tee -a "$LOG_FILE"
    cd "$SOURCE_DIR"
    python3 build-indexes.py >> "$LOG_FILE" 2>&1
    python3 resolve-entity-names.py >> "$LOG_FILE" 2>&1
    
    # Deploy to Pis
    echo "  📤 Syncing to Pis..." | tee -a "$LOG_FILE"
    "$SOURCE_DIR/deploy-to-pis.sh" >> "$LOG_FILE" 2>&1
    
    # Save count
    echo "$current_count" > "$SOURCE_DIR/.last_sync_count"
    
    echo -e "  ${GREEN}✅ Sync complete!${RESET}" | tee -a "$LOG_FILE"
  else
    echo "  ✓ No new entries, skipping sync" >> "$LOG_FILE"
  fi
  
  sleep "$SYNC_INTERVAL"
done
