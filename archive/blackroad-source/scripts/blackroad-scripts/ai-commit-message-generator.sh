#!/usr/bin/env bash
# AI-powered commit message generator
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[AI-COMMIT]${NC} Analyzing changes..."

# Get diff
DIFF=$(git diff --cached 2>/dev/null || git diff 2>/dev/null)

if [[ -z "$DIFF" ]]; then
  echo "No changes to commit!"
  exit 0
fi

# Simple AI-like analysis
FILES_CHANGED=$(git status --porcelain | wc -l | xargs)
ADDED_LINES=$(echo "$DIFF" | grep "^+" | grep -v "^+++" | wc -l | xargs)
REMOVED_LINES=$(echo "$DIFF" | grep "^-" | grep -v "^---" | wc -l | xargs)

# Detect change type
if echo "$DIFF" | grep -q "test\|spec"; then
  TYPE="🧪 test"
elif echo "$DIFF" | grep -q "README\|docs"; then
  TYPE="📚 docs"
elif echo "$DIFF" | grep -q "fix\|bug"; then
  TYPE="🐛 fix"
elif echo "$DIFF" | grep -q "style\|css"; then
  TYPE="💄 style"
elif [[ $ADDED_LINES -gt $REMOVED_LINES ]]; then
  TYPE="✨ feat"
else
  TYPE="♻️ refactor"
fi

# Generate message
MSG="$TYPE: Auto-generated commit

- Files changed: $FILES_CHANGED
- Lines added: $ADDED_LINES
- Lines removed: $REMOVED_LINES
- Project: $(basename $PROJECT_DIR)"

echo ""
echo "Generated commit message:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$MSG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Use this message? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git add -A
  git commit -m "$MSG"
  echo -e "${GREEN}✓${NC} Committed!"
fi
