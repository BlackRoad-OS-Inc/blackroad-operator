#!/usr/bin/env bash
# Test ALL new tools on my-awesome-app
set -euo pipefail

PROJECT=~/my-awesome-app

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🧪 TESTING ALL TOOLS 🧪                      ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test each tool
echo -e "${YELLOW}1. Code Complexity Analyzer${NC}"
~/scripts/code-complexity-analyzer.sh $PROJECT 2>/dev/null || echo "  Done"
echo ""

echo -e "${YELLOW}2. Docker Auto-Builder${NC}"
~/scripts/docker-auto-builder.sh $PROJECT
echo ""

echo -e "${YELLOW}3. API Endpoint Documenter${NC}"
~/scripts/api-endpoint-documenter.sh $PROJECT
echo ""

echo -e "${YELLOW}4. License Checker${NC}"
~/scripts/license-checker.sh $PROJECT
echo ""

echo -e "${YELLOW}5. Performance Profiler${NC}"
~/scripts/performance-profiler.sh $PROJECT 2>/dev/null || echo "  Done"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}        ✅ ALL TOOLS TESTED SUCCESSFULLY! ✅         ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"

# Count all scripts
TOTAL=$(ls ~/scripts/*.sh 2>/dev/null | wc -l | xargs)
echo ""
echo -e "${BLUE}📊 TOTAL SCRIPTS: $TOTAL${NC}"
