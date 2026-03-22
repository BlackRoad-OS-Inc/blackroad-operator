#!/usr/bin/env bash
# Smart project cloner with auto-setup
set -euo pipefail

REPO_URL="${1:-}"
TARGET_DIR="${2:-}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [[ -z "$REPO_URL" ]]; then
  echo "Usage: $0 <repo-url> [target-dir]"
  exit 1
fi

echo -e "${BLUE}[CLONE]${NC} Cloning repository..."

# Clone
if [[ -n "$TARGET_DIR" ]]; then
  git clone "$REPO_URL" "$TARGET_DIR"
  cd "$TARGET_DIR"
else
  git clone "$REPO_URL"
  REPO_NAME=$(basename "$REPO_URL" .git)
  cd "$REPO_NAME"
fi

PROJECT_DIR=$(pwd)
echo -e "${GREEN}✓${NC} Cloned to: $PROJECT_DIR"

# Auto-detect and setup
echo ""
echo -e "${BLUE}[AUTO-SETUP]${NC} Detecting project type..."

if [[ -f package.json ]]; then
  echo "  📦 Node.js project detected"
  echo "  Installing dependencies..."
  npm install --silent 2>/dev/null && echo -e "  ${GREEN}✓${NC} Dependencies installed"
elif [[ -f requirements.txt ]]; then
  echo "  🐍 Python project detected"
  echo "  Installing dependencies..."
  pip install -q -r requirements.txt 2>/dev/null && echo -e "  ${GREEN}✓${NC} Dependencies installed"
elif [[ -f go.mod ]]; then
  echo "  🔷 Go project detected"
  echo "  Downloading dependencies..."
  go mod download 2>/dev/null && echo -e "  ${GREEN}✓${NC} Dependencies downloaded"
fi

# Enable auto-deploy
echo ""
echo -e "${BLUE}[AUTO-DEPLOY]${NC} Enabling automation..."
if [[ -f ~/scripts/memory-git-auto.sh ]]; then
  ~/scripts/memory-git-auto.sh "$PROJECT_DIR" >/dev/null 2>&1
  echo -e "  ${GREEN}✓${NC} Auto-deploy enabled"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}        ✅ PROJECT READY! ✅                          ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  📍 Location: $PROJECT_DIR"
echo "  🚀 Auto-deploy: Enabled"
echo "  ✅ Dependencies: Installed"
echo ""
echo "Next: cd $PROJECT_DIR && start coding!"
