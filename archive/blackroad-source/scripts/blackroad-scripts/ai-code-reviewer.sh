#!/usr/bin/env bash
# AI-powered code review
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🤖 AI CODE REVIEWER 🤖                        ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

ISSUES_FOUND=0

# Check for common issues
echo -e "${CYAN}[ANALYZING CODE...]${NC}"
echo ""

# Check for console.logs in production
echo -e "${YELLOW}[CONSOLE STATEMENTS]${NC}"
CONSOLE_COUNT=$(grep -r "console\.log\|console\.error" --include="*.js" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l | xargs)
if [[ $CONSOLE_COUNT -gt 0 ]]; then
  echo -e "  ${YELLOW}⚠${NC} Found $CONSOLE_COUNT console statements (consider removing for production)"
  ((ISSUES_FOUND++))
else
  echo -e "  ${GREEN}✓${NC} No console statements"
fi

# Check for TODO/FIXME comments
echo ""
echo -e "${YELLOW}[TODO/FIXME COMMENTS]${NC}"
TODO_COUNT=$(grep -r "TODO\|FIXME" --include="*.js" --include="*.ts" --include="*.py" . 2>/dev/null | grep -v node_modules | wc -l | xargs)
if [[ $TODO_COUNT -gt 0 ]]; then
  echo -e "  ${YELLOW}📝${NC} Found $TODO_COUNT TODO/FIXME comments"
  grep -r "TODO\|FIXME" --include="*.js" --include="*.ts" --include="*.py" . 2>/dev/null | grep -v node_modules | head -3 | while read line; do
    echo "    • $(echo $line | cut -d: -f2-)"
  done
else
  echo -e "  ${GREEN}✓${NC} No pending TODOs"
fi

# Check for hardcoded secrets patterns
echo ""
echo -e "${YELLOW}[SECURITY PATTERNS]${NC}"
SECRET_PATTERNS=$(grep -rE "(password|api_key|secret|token)\s*=\s*['\"][^'\"]+['\"]" --include="*.js" --include="*.ts" --include="*.py" . 2>/dev/null | grep -v node_modules | wc -l | xargs)
if [[ $SECRET_PATTERNS -gt 0 ]]; then
  echo -e "  ${RED}⚠${NC} Found $SECRET_PATTERNS potential hardcoded secrets!"
  ((ISSUES_FOUND+=5))
else
  echo -e "  ${GREEN}✓${NC} No obvious hardcoded secrets"
fi

# Check for long functions
echo ""
echo -e "${YELLOW}[FUNCTION LENGTH]${NC}"
LONG_FUNCS=0
find . -type f \( -name "*.js" -o -name "*.ts" \) -not -path "*/node_modules/*" 2>/dev/null | while read file; do
  awk '/function |=>/ {start=NR} /^}/ {if(start && NR-start>50) print FILENAME":"start}' "$file" 2>/dev/null
done | head -3 | while read line; do
  echo -e "  ${YELLOW}⚠${NC} Long function in: $line"
  ((LONG_FUNCS++))
done
[[ $LONG_FUNCS -eq 0 ]] && echo -e "  ${GREEN}✓${NC} All functions are reasonable length"

# Check for error handling
echo ""
echo -e "${YELLOW}[ERROR HANDLING]${NC}"
TRY_COUNT=$(grep -r "try\s*{" --include="*.js" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l | xargs)
if [[ $TRY_COUNT -gt 0 ]]; then
  echo -e "  ${GREEN}✓${NC} Error handling found ($TRY_COUNT try-catch blocks)"
else
  echo -e "  ${YELLOW}⚠${NC} No error handling detected - consider adding try-catch"
  ((ISSUES_FOUND++))
fi

# Summary
echo ""
echo -e "${MAGENTA}═══════════════════════════════════════════════════════${NC}"
if [[ $ISSUES_FOUND -eq 0 ]]; then
  echo -e "  ${GREEN}✅ CODE LOOKS GREAT! No critical issues found!${NC}"
elif [[ $ISSUES_FOUND -lt 3 ]]; then
  echo -e "  ${YELLOW}⚠ Found $ISSUES_FOUND minor issues${NC}"
else
  echo -e "  ${RED}⚠ Found $ISSUES_FOUND issues - review recommended${NC}"
fi
echo -e "${MAGENTA}═══════════════════════════════════════════════════════${NC}"

# Save review
mkdir -p ~/.codex/code-reviews
cat > ~/.codex/code-reviews/$(basename $PROJECT_DIR)_review.txt <<REVIEW
Code Review: $(basename $PROJECT_DIR)
Date: $(date)
Issues Found: $ISSUES_FOUND
Console Statements: $CONSOLE_COUNT
TODOs: $TODO_COUNT
Security Concerns: $SECRET_PATTERNS
Error Handling: $TRY_COUNT blocks

Review complete.
REVIEW

echo ""
echo "Full review saved to: ~/.codex/code-reviews/$(basename $PROJECT_DIR)_review.txt"
