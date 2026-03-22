#!/usr/bin/env bash
# Export project stats as JSON
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[JSON-EXPORT]${NC} Generating stats..."

# Gather stats
COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
BRANCHES=$(git branch -a 2>/dev/null | wc -l | xargs)
CONTRIBUTORS=$(git shortlog -sn HEAD 2>/dev/null | wc -l | xargs)
FILES=$(find . -type f -not -path "*/.git/*" -not -path "*/node_modules/*" 2>/dev/null | wc -l | xargs)
SIZE=$(du -sh . 2>/dev/null | awk '{print $1}')
LAST_COMMIT=$(git log -1 --format="%h" 2>/dev/null || echo "none")

# Create JSON
cat > "${PROJECT_NAME}_stats.json" <<JSON
{
  "project": "$PROJECT_NAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git": {
    "commits": $COMMITS,
    "branches": $BRANCHES,
    "contributors": $CONTRIBUTORS,
    "last_commit": "$LAST_COMMIT"
  },
  "files": {
    "total": $FILES,
    "size": "$SIZE"
  },
  "health": {
    "readme": $([ -f README.md ] && echo "true" || echo "false"),
    "license": $([ -f LICENSE ] && echo "true" || echo "false"),
    "ci": $([ -d .github/workflows ] && echo "true" || echo "false")
  }
}
JSON

echo -e "${GREEN}✓${NC} Stats exported!"
echo "  📄 File: ${PROJECT_NAME}_stats.json"
cat "${PROJECT_NAME}_stats.json"
