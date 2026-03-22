#!/usr/bin/env bash
# Run all tests across projects
set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}        🧪 AUTOMATED TESTING SUITE 🧪               ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

PASSED=0
FAILED=0
SKIPPED=0

find ~ -name "package.json" -not -path "*/node_modules/*" -maxdepth 3 2>/dev/null | head -10 | while read pkg; do
  PROJECT_DIR=$(dirname "$pkg")
  PROJECT_NAME=$(basename "$PROJECT_DIR")
  
  cd "$PROJECT_DIR"
  
  if grep -q "\"test\":" package.json 2>/dev/null; then
    echo -e "${YELLOW}▸${NC} Testing $PROJECT_NAME..."
    
    if npm test --silent 2>/dev/null; then
      echo -e "  ${GREEN}✓${NC} Tests passed"
      ((PASSED++))
    else
      echo -e "  ${RED}✗${NC} Tests failed"
      ((FAILED++))
    fi
  else
    echo -e "${YELLOW}▸${NC} $PROJECT_NAME - No tests configured"
    ((SKIPPED++))
  fi
  echo ""
done

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}✓${NC} Passed: $PASSED"
echo -e "  ${RED}✗${NC} Failed: $FAILED"
echo -e "  ${YELLOW}⊘${NC} Skipped: $SKIPPED"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
