#!/usr/bin/env bash
# Check dependency licenses
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}        📜 LICENSE CHECKER 📜                        ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check project license
echo -e "${YELLOW}[PROJECT LICENSE]${NC}"
if [[ -f LICENSE ]]; then
  LICENSE_TYPE=$(head -1 LICENSE)
  echo -e "  ${GREEN}✓${NC} License found: $LICENSE_TYPE"
else
  echo -e "  ${RED}✗${NC} No LICENSE file"
  echo "  Recommendation: Add MIT, Apache 2.0, or GPL license"
fi

# Check dependencies (Node.js)
if [[ -f package.json ]]; then
  echo ""
  echo -e "${YELLOW}[DEPENDENCY LICENSES]${NC}"
  
  if [[ -d node_modules ]]; then
    TOTAL=0
    MIT=0
    
    find node_modules -maxdepth 2 -name "package.json" 2>/dev/null | head -20 | while read pkg; do
      LICENSE=$(grep -oP '"license":\s*"\K[^"]+' "$pkg" 2>/dev/null || echo "UNKNOWN")
      NAME=$(grep -oP '"name":\s*"\K[^"]+' "$pkg" 2>/dev/null || echo "unknown")
      
      case $LICENSE in
        MIT|ISC|BSD*|Apache*)
          echo -e "  ${GREEN}✓${NC} $NAME: $LICENSE"
          ;;
        *)
          echo -e "  ${YELLOW}⚠${NC} $NAME: $LICENSE"
          ;;
      esac
    done
  else
    echo "  No node_modules found (run npm install)"
  fi
fi

echo ""
echo -e "${YELLOW}[RECOMMENDATIONS]${NC}"
echo "  ✓ MIT - Permissive, widely used"
echo "  ✓ Apache 2.0 - Permissive with patent grant"
echo "  ⚠ GPL - Copyleft, requires derivative works to be GPL"

echo ""
echo -e "${GREEN}✅ License check complete!${NC}"
