#!/usr/bin/env bash
# Start watch mode on multiple projects simultaneously
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

INTERVAL="${1:-60}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}     👀 MASS WATCH MODE ACTIVATED 👀                  ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Checking top 10 projects every ${INTERVAL}s${NC}"
echo "Press Ctrl+C to stop"
echo ""

# Get top 10 most recently modified projects
PROJECTS=()
while IFS= read -r script && [[ ${#PROJECTS[@]} -lt 10 ]]; do
  PROJECT_DIR=$(dirname "$script")
  PROJECTS+=("$PROJECT_DIR")
done < <(find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null | head -10)

echo "Watching ${#PROJECTS[@]} projects:"
for proj in "${PROJECTS[@]}"; do
  echo "  • $(basename "$proj")"
done
echo ""

ROUND=1
while true; do
  echo -e "${BLUE}[Round $ROUND - $(date '+%H:%M:%S')]${NC}"
  
  CHANGES=0
  for PROJECT_DIR in "${PROJECTS[@]}"; do
    PROJECT_NAME=$(basename "$PROJECT_DIR")
    
    cd "$PROJECT_DIR" 2>/dev/null || continue
    
    if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
      echo -e "  ${GREEN}✓${NC} $PROJECT_NAME - committing..."
      
      if ./.git-auto-commit.sh "🤖 Auto-watch: Round $ROUND" 2>&1 | grep -q "Committed"; then
        ((CHANGES++))
      fi
    fi
  done
  
  if [[ $CHANGES -eq 0 ]]; then
    echo -e "  ${YELLOW}⚪${NC} No changes detected"
  else
    echo -e "  ${GREEN}✅${NC} Committed $CHANGES projects!"
  fi
  
  echo ""
  ((ROUND++))
  sleep "$INTERVAL"
done
