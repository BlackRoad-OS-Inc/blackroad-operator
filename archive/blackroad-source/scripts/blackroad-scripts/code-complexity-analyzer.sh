#!/usr/bin/env bash
# Analyze code complexity
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🧠 CODE COMPLEXITY ANALYZER 🧠              ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Analyze JavaScript/TypeScript files
echo -e "${YELLOW}[FUNCTION COMPLEXITY]${NC}"

TOTAL_FUNCS=0
COMPLEX_FUNCS=0

find . -type f \( -name "*.js" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | while read file; do
  FUNCS=$(grep -E "(function |const.*=.*=>|async |\.then\()" "$file" 2>/dev/null | wc -l | xargs)
  if [[ $FUNCS -gt 0 ]]; then
    LINES=$(wc -l < "$file" | xargs)
    AVG_COMPLEXITY=$((LINES / (FUNCS > 0 ? FUNCS : 1)))
    
    if [[ $AVG_COMPLEXITY -gt 50 ]]; then
      echo -e "  ${RED}⚠${NC} $(basename $file): $FUNCS functions, ~$AVG_COMPLEXITY lines/func (HIGH)"
    elif [[ $AVG_COMPLEXITY -gt 25 ]]; then
      echo -e "  ${YELLOW}📊${NC} $(basename $file): $FUNCS functions, ~$AVG_COMPLEXITY lines/func"
    else
      echo -e "  ${GREEN}✓${NC} $(basename $file): $FUNCS functions, ~$AVG_COMPLEXITY lines/func"
    fi
  fi
done

echo ""
echo -e "${YELLOW}[NESTING DEPTH]${NC}"

find . -type f \( -name "*.js" -o -name "*.ts" \) -not -path "*/node_modules/*" 2>/dev/null | head -5 | while read file; do
  MAX_DEPTH=0
  while IFS= read -r line; do
    DEPTH=$(echo "$line" | grep -o "{" | wc -l | xargs)
    [[ $DEPTH -gt $MAX_DEPTH ]] && MAX_DEPTH=$DEPTH
  done < "$file"
  
  if [[ $MAX_DEPTH -gt 4 ]]; then
    echo -e "  ${RED}⚠${NC} $(basename $file): Max nesting $MAX_DEPTH (consider refactoring)"
  else
    echo -e "  ${GREEN}✓${NC} $(basename $file): Max nesting $MAX_DEPTH"
  fi
done

echo ""
echo -e "${YELLOW}[RECOMMENDATIONS]${NC}"
echo "  • Keep functions under 25 lines"
echo "  • Limit nesting to 3-4 levels max"
echo "  • Extract complex logic into helpers"
echo "  • Use early returns to reduce nesting"

echo ""
echo -e "${GREEN}✅ Complexity analysis complete!${NC}"
