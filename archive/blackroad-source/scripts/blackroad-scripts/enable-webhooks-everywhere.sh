#!/usr/bin/env bash
# Enable webhook logging on ALL projects
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[WEBHOOKS-ALL]${NC} Enabling webhooks on all auto-deploy projects..."

# Create webhook logs directory
mkdir -p ~/.codex/memory/webhook-logs

ENABLED=0
SKIPPED=0

# Find all projects with auto-commit
while IFS= read -r script; do
  PROJECT_DIR=$(dirname "$script")
  PROJECT_NAME=$(basename "$PROJECT_DIR")
  
  # Check if already has enhanced webhook
  if grep -q "webhook-logs" "$PROJECT_DIR/.git/hooks/post-commit" 2>/dev/null; then
    ((SKIPPED++))
    continue
  fi
  
  # Add enhanced post-commit hook
  cat > "$PROJECT_DIR/.git/hooks/post-commit" <<'HOOK'
#!/bin/bash
# Auto-push and webhook notification

# Push to GitHub
git push 2>/dev/null || true

# Log webhook notification
COMMIT_MSG=$(git log -1 --format="%s")
COMMIT_SHA=$(git log -1 --format="%h")
PROJECT=$(basename $(pwd))
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
BRANCH=$(git branch --show-current)
REMOTE=$(git remote get-url origin 2>/dev/null || echo "No remote")

# Rich notification log
cat >> ~/.codex/memory/webhook-logs/deployments.log <<LOG
[${TIMESTAMP}] 🚀 ${PROJECT}
  📝 ${COMMIT_MSG}
  🔖 ${COMMIT_SHA} on ${BRANCH}
  🔗 ${REMOTE}
---
LOG

# Terminal notification
echo "🔔 Deployed ${PROJECT} (${COMMIT_SHA})"
HOOK
  
  chmod +x "$PROJECT_DIR/.git/hooks/post-commit"
  echo -e "${GREEN}✓${NC} $PROJECT_NAME"
  ((ENABLED++))
done < <(find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null)

echo ""
echo -e "${GREEN}✅ Webhooks enabled on $ENABLED projects!${NC}"
echo -e "${YELLOW}⊘ Skipped $SKIPPED (already enabled)${NC}"
echo ""
echo "View logs: cat ~/.codex/memory/webhook-logs/deployments.log"
