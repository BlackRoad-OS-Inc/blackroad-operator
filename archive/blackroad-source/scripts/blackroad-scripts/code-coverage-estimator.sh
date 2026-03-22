#!/usr/bin/env bash
# Estimate code coverage
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}        🎯 CODE COVERAGE ESTIMATOR 🎯               ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Count source files
SRC_FILES=$(find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/test*" -not -path "*/__tests__/*" 2>/dev/null | wc -l | xargs)

# Count test files
TEST_FILES=$(find . -type f \( -name "*.test.js" -o -name "*.test.ts" -o -name "*.spec.js" -o -name "*.spec.ts" -o -name "test_*.py" \) -not -path "*/node_modules/*" 2>/dev/null | wc -l | xargs)

echo -e "${YELLOW}[FILE ANALYSIS]${NC}"
echo "  📄 Source files: $SRC_FILES"
echo "  🧪 Test files: $TEST_FILES"

if [[ $SRC_FILES -gt 0 ]]; then
  COVERAGE=$((TEST_FILES * 100 / SRC_FILES))
  
  echo ""
  echo -e "${YELLOW}[ESTIMATED COVERAGE]${NC}"
  
  if [[ $COVERAGE -ge 80 ]]; then
    echo -e "  ${GREEN}$COVERAGE%${NC} - Excellent!"
  elif [[ $COVERAGE -ge 50 ]]; then
    echo -e "  ${YELLOW}$COVERAGE%${NC} - Good"
  else
    echo -e "  ${YELLOW}$COVERAGE%${NC} - Could be better"
  fi
  
  echo ""
  echo -e "${YELLOW}[RECOMMENDATIONS]${NC}"
  if [[ $COVERAGE -lt 80 ]]; then
    NEEDED=$((SRC_FILES * 80 / 100 - TEST_FILES))
    echo "  Add $NEEDED more test files for 80% coverage"
  else
    echo "  ✓ Coverage looks good!"
  fi
else
  echo ""
  echo "  No source files found"
fi

echo ""
echo -e "${GREEN}✅ Coverage estimation complete!${NC}"
