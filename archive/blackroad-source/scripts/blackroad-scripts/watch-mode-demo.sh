#!/usr/bin/env bash
# Watch mode demo - safer version for testing
set -euo pipefail

PROJECT_DIR="${1:-.}"
DURATION="${2:-60}"

cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}     👀 WATCH MODE ACTIVATED 👀                      ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Project:${NC} $PROJECT_NAME"
echo -e "${YELLOW}Duration:${NC} ${DURATION}s (demo mode)"
echo -e "${YELLOW}Checking for changes every 10 seconds...${NC}"
echo ""
echo "Press Ctrl+C to stop early"
echo ""

CHECKS=0
MAX_CHECKS=$((DURATION / 10))

while [[ $CHECKS -lt $MAX_CHECKS ]]; do
  TIMESTAMP=$(date '+%H:%M:%S')
  
  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    echo -e "${BLUE}[$TIMESTAMP]${NC} 🔍 Changes detected! Auto-committing..."
    
    if ./.git-auto-commit.sh "🤖 Watch mode auto-save: $TIMESTAMP" 2>&1 | grep -q "Committed"; then
      echo -e "${GREEN}[$TIMESTAMP]${NC} ✅ Auto-committed and pushed!"
    fi
  else
    echo -e "${YELLOW}[$TIMESTAMP]${NC} ⚪ No changes detected"
  fi
  
  ((CHECKS++))
  [[ $CHECKS -lt $MAX_CHECKS ]] && sleep 10
done

echo ""
echo -e "${GREEN}✅ Watch mode demo complete!${NC}"
echo ""
echo "To run continuously, use:"
echo "  ~/scripts/memory-watch-mode.sh . 30"
