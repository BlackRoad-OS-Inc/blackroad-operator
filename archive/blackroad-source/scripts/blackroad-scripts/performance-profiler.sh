#!/usr/bin/env bash
# Profile application performance
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        ⚡ PERFORMANCE PROFILER ⚡                  ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check build performance
echo -e "${YELLOW}[BUILD PERFORMANCE]${NC}"
if [[ -f package.json ]] && grep -q "\"build\":" package.json; then
  echo "  Testing build time..."
  START=$(date +%s)
  npm run build --silent 2>/dev/null || true
  END=$(date +%s)
  DURATION=$((END - START))
  
  if [[ $DURATION -lt 10 ]]; then
    echo -e "  ${GREEN}✓${NC} Build time: ${DURATION}s (Fast)"
  elif [[ $DURATION -lt 30 ]]; then
    echo -e "  ${YELLOW}⚠${NC} Build time: ${DURATION}s (Moderate)"
  else
    echo -e "  ${YELLOW}⚠${NC} Build time: ${DURATION}s (Slow - consider optimization)"
  fi
fi

# Check bundle size
echo ""
echo -e "${YELLOW}[BUNDLE SIZE]${NC}"
if [[ -d dist ]] || [[ -d build ]]; then
  BUILD_DIR=$(ls -d dist build 2>/dev/null | head -1)
  SIZE=$(du -sh "$BUILD_DIR" 2>/dev/null | awk '{print $1}')
  echo "  📦 Build output: $SIZE"
  
  # Find large files
  echo "  Largest files:"
  find "$BUILD_DIR" -type f -exec ls -lh {} + 2>/dev/null | sort -k5 -hr | head -3 | awk '{print "    " $9 " (" $5 ")"}'
else
  echo "  No build output found"
fi

# Memory estimate
echo ""
echo -e "${YELLOW}[MEMORY FOOTPRINT]${NC}"
if [[ -d node_modules ]]; then
  SIZE=$(du -sh node_modules 2>/dev/null | awk '{print $1}')
  echo "  📦 Dependencies: $SIZE"
fi

echo ""
echo -e "${YELLOW}[OPTIMIZATION TIPS]${NC}"
echo "  • Use code splitting"
echo "  • Lazy load components"
echo "  • Tree shake unused code"
echo "  • Compress assets"
echo "  • Use CDN for large dependencies"

echo ""
echo -e "${GREEN}✅ Performance profile complete!${NC}"
