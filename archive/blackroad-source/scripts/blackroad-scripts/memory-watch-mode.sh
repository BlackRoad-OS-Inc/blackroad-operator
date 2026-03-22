#!/usr/bin/env bash
# Watch mode - auto-commit when files change
set -euo pipefail

PROJECT_DIR="${1:-.}"
WATCH_INTERVAL="${2:-30}"

cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

echo "👀 Watching $PROJECT_NAME for changes..."
echo "   Auto-committing every $WATCH_INTERVAL seconds if changes detected"
echo "   Press Ctrl+C to stop"
echo ""

while true; do
  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    echo "[$(date '+%H:%M:%S')] Changes detected! Auto-committing..."
    ./.git-auto-commit.sh "🤖 Auto-save: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null
  fi
  sleep "$WATCH_INTERVAL"
done
