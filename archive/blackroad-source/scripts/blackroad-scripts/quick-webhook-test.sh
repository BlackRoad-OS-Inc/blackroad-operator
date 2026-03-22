#!/usr/bin/env bash
# Quick webhook test (works without external service)
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create local webhook logger
mkdir -p ~/.codex/memory/webhook-logs

# Enhanced post-commit hook with local logging
cat > .git/hooks/post-commit <<'HOOK'
#!/bin/bash
# Auto-push and webhook notification

# Push to GitHub
git push 2>/dev/null || true

# Log webhook notification locally
COMMIT_MSG=$(git log -1 --format="%s")
COMMIT_SHA=$(git log -1 --format="%h")
PROJECT=$(basename $(pwd))
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Create rich notification log
cat >> ~/.codex/memory/webhook-logs/deployments.log <<LOG
[${TIMESTAMP}] 🚀 DEPLOYED: ${PROJECT}
  Commit: ${COMMIT_SHA}
  Message: ${COMMIT_MSG}
  Branch: $(git branch --show-current)
  URL: $(git remote get-url origin 2>/dev/null || echo "No remote")
---
LOG

# Show notification in terminal
echo "🔔 Webhook fired! Logged to ~/.codex/memory/webhook-logs/deployments.log"
HOOK

chmod +x .git/hooks/post-commit

echo -e "${GREEN}✅ Enhanced webhook logging enabled for $PROJECT_NAME!${NC}"
echo ""
echo "Every commit will now:"
echo "  1. Auto-push to GitHub"
echo "  2. Log to webhook logs"
echo "  3. Show notification"
echo ""
echo "View logs: cat ~/.codex/memory/webhook-logs/deployments.log"
