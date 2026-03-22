#!/usr/bin/env bash
# Security scanner for projects
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}        🔒 SECURITY SCAN: $PROJECT_NAME"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

ISSUES=0

# Check for exposed secrets
echo -e "${YELLOW}[SECRET SCAN]${NC}"
if grep -r "api_key\|password\|secret\|token" . --include="*.js" --include="*.ts" --include="*.py" 2>/dev/null | grep -v "node_modules" | head -5; then
  echo -e "  ${RED}⚠${NC} Potential secrets found in code!"
  ((ISSUES++))
else
  echo -e "  ${GREEN}✓${NC} No obvious secrets in code"
fi

# Check for .env files
echo ""
echo -e "${YELLOW}[ENV FILES]${NC}"
if [[ -f .env ]]; then
  echo -e "  ${YELLOW}⚠${NC} .env file exists"
  if grep -q ".env" .gitignore 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} .env is in .gitignore"
  else
    echo -e "  ${RED}✗${NC} .env NOT in .gitignore!"
    ((ISSUES++))
  fi
else
  echo -e "  ${GREEN}✓${NC} No .env file"
fi

# Check git history for secrets
echo ""
echo -e "${YELLOW}[GIT HISTORY]${NC}"
if git log --all --pretty=format: --name-only | grep -q ".env\|secrets"; then
  echo -e "  ${RED}⚠${NC} Sensitive files may be in git history"
  ((ISSUES++))
else
  echo -e "  ${GREEN}✓${NC} No obvious sensitive files in history"
fi

# Check dependencies (if package.json exists)
if [[ -f package.json ]]; then
  echo ""
  echo -e "${YELLOW}[DEPENDENCIES]${NC}"
  if command -v npm >/dev/null 2>&1; then
    npm audit --json 2>/dev/null | grep -q "vulnerabilities" && {
      echo -e "  ${YELLOW}⚠${NC} Run 'npm audit' for details"
    } || echo -e "  ${GREEN}✓${NC} No known vulnerabilities"
  fi
fi

echo ""
if [[ $ISSUES -eq 0 ]]; then
  echo -e "${GREEN}✅ Security scan complete - no critical issues!${NC}"
else
  echo -e "${YELLOW}⚠ Security scan found $ISSUES potential issues${NC}"
fi
