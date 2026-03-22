#!/usr/bin/env bash
# Auto-update dependencies across projects
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[DEP-UPDATE]${NC} Checking for outdated dependencies..."

UPDATED=0
CHECKED=0

find ~ -name "package.json" -not -path "*/node_modules/*" -maxdepth 3 2>/dev/null | head -10 | while read pkg; do
  PROJECT_DIR=$(dirname "$pkg")
  PROJECT_NAME=$(basename "$PROJECT_DIR")
  
  cd "$PROJECT_DIR"
  ((CHECKED++))
  
  if command -v npm >/dev/null 2>&1; then
    echo -e "${YELLOW}▸${NC} Checking $PROJECT_NAME..."
    
    # Check for outdated (without actually updating)
    OUTDATED=$(npm outdated 2>/dev/null | tail -n +2 | wc -l | xargs)
    
    if [[ "$OUTDATED" -gt 0 ]]; then
      echo "  Found $OUTDATED outdated packages"
      echo "  Run 'npm update' in $PROJECT_DIR to update"
    else
      echo -e "  ${GREEN}✓${NC} Up to date!"
    fi
  fi
done

echo ""
echo -e "${GREEN}✅ Checked $CHECKED projects${NC}"
