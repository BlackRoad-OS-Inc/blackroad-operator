#!/usr/bin/env bash
# Quick deployment test for any project
PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}[DEPLOY-TEST]${NC} Testing deployment for $(basename $PROJECT_DIR)..."

# Create test file
TEST_FILE="deploy-test-$(date +%s).txt"
echo "Deployment test at $(date)" > "$TEST_FILE"

# Try auto-commit
if ./.git-auto-commit.sh "🧪 Deployment test" 2>&1 | grep -q "Committed"; then
  echo -e "${GREEN}✓${NC} Auto-commit: SUCCESS"
else
  echo -e "${RED}✗${NC} Auto-commit: FAILED"
fi

# Check if webhook logged it
sleep 2
if grep -q "deploy-test\|Deployment test" ~/.codex/memory/webhook-logs/deployments.log 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Webhook: LOGGED"
else
  echo -e "${YELLOW}⚠${NC} Webhook: Not logged yet"
fi

# Check GitHub
REPO_URL=$(git remote get-url origin 2>/dev/null)
if [[ -n "$REPO_URL" ]]; then
  echo -e "${GREEN}✓${NC} GitHub: Connected"
  echo "  URL: $REPO_URL"
else
  echo -e "${RED}✗${NC} GitHub: No remote"
fi

echo ""
echo -e "${GREEN}✅ Deployment test complete!${NC}"
