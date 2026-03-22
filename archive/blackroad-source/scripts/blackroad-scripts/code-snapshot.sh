#!/usr/bin/env bash
# Create instant code snapshots
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

SNAPSHOT_DIR=~/.codex/snapshots
mkdir -p "$SNAPSHOT_DIR"

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
SNAPSHOT_FILE="$SNAPSHOT_DIR/${PROJECT_NAME}_${TIMESTAMP}.tar.gz"

echo -e "${BLUE}[SNAPSHOT]${NC} Creating snapshot..."

# Create tarball excluding node_modules, .git, etc
tar -czf "$SNAPSHOT_FILE" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.DS_Store' \
  . 2>/dev/null

SIZE=$(du -h "$SNAPSHOT_FILE" | awk '{print $1}')

echo -e "${GREEN}✓${NC} Snapshot created!"
echo "  📦 File: $SNAPSHOT_FILE"
echo "  💾 Size: $SIZE"
echo "  ⏰ Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "Restore with: tar -xzf $SNAPSHOT_FILE"

# List recent snapshots
echo ""
echo "Recent snapshots:"
ls -lht "$SNAPSHOT_DIR" | grep "$PROJECT_NAME" | head -5 | awk '{print "  " $9 " (" $5 ")"}'
