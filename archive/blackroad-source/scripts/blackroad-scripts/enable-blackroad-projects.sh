#!/usr/bin/env bash
# Enable auto-deploy in BlackRoad projects
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[AUTO-DEPLOY]${NC} Enabling auto-deploy in BlackRoad projects..."

# Target main BlackRoad project folders
TARGETS=(
  "$HOME"
  "$HOME/blackroad-os-demo"
  "$HOME/blackroad.io"
  "$HOME/blackroad-deploy"
  "$HOME/blackroad-ai-platform"
  "$HOME/blackroad-os-home"
  "$HOME/blackroad-meet"
  "$HOME/blackroad-resume"
  "$HOME/blackroad-status-page"
  "$HOME/my-awesome-app"
  "$HOME/blackroad-test-deploy-"*
)

ENABLED=0
SKIPPED=0

for target in "${TARGETS[@]}"; do
  # Handle wildcards
  for repo in $target; do
    [[ ! -d "$repo" ]] && continue
    [[ ! -d "$repo/.git" ]] && continue
    
    REPO_NAME=$(basename "$repo")
    
    # Skip if already enabled
    if [[ -f "$repo/.git-auto-commit.sh" ]]; then
      echo -e "${YELLOW}⊘${NC} $REPO_NAME - already enabled"
      ((SKIPPED++))
      continue
    fi
    
    echo -e "${BLUE}▸${NC} Enabling: $REPO_NAME"
    
    # Create auto-commit script
    cat > "$repo/.git-auto-commit.sh" <<'AUTOCOMMIT'
#!/bin/bash
MESSAGE="${1:-Auto-commit: $(date +%Y-%m-%d\ %H:%M:%S)}"
git add -A
if git commit -m "$MESSAGE"; then
  git push 2>/dev/null || echo "⚠ Check git remote"
  echo "✅ Committed and pushed!"
else
  echo "ℹ No changes to commit"
fi
AUTOCOMMIT
    chmod +x "$repo/.git-auto-commit.sh"
    
    # Setup post-commit hook
    mkdir -p "$repo/.git/hooks"
    cat > "$repo/.git/hooks/post-commit" <<'HOOK'
#!/bin/bash
git push 2>/dev/null || true
HOOK
    chmod +x "$repo/.git/hooks/post-commit"
    
    echo -e "${GREEN}✓${NC} $REPO_NAME - enabled!"
    ((ENABLED++))
  done
done

echo ""
echo -e "${GREEN}✅ Enabled auto-deploy in $ENABLED projects!${NC}"
echo -e "${YELLOW}⊘ Skipped $SKIPPED (already enabled)${NC}"
echo ""
echo "Now use './.git-auto-commit.sh' in any project to auto-push!"
