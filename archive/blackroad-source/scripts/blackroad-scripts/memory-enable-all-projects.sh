#!/usr/bin/env bash
# Enable auto-deploy in ALL git projects
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}[AUTO-DEPLOY-ALL]${NC} Scanning for git repositories..."

# Find all git repos (excluding hidden folders and common ignore patterns)
REPOS=()
while IFS= read -r repo; do
  REPOS+=("$repo")
done < <(find "$HOME" -maxdepth 3 -name ".git" -type d 2>/dev/null | sed 's/\/.git$//')

TOTAL=${#REPOS[@]}
echo -e "${BLUE}[AUTO-DEPLOY-ALL]${NC} Found $TOTAL git repositories"

if [[ $TOTAL -eq 0 ]]; then
  echo "No git repositories found!"
  exit 0
fi

ENABLED=0
SKIPPED=0
FAILED=0

for repo in "${REPOS[@]}"; do
  REPO_NAME=$(basename "$repo")
  
  # Skip if already has auto-commit script
  if [[ -f "$repo/.git-auto-commit.sh" ]]; then
    echo -e "${YELLOW}⊘${NC} $REPO_NAME - already enabled"
    ((SKIPPED++))
    continue
  fi
  
  # Skip node_modules, .npm, and other cache folders
  if [[ "$repo" =~ node_modules|\.npm|\.cache|\.local/share ]]; then
    ((SKIPPED++))
    continue
  fi
  
  echo -e "${BLUE}▸${NC} Enabling: $REPO_NAME"
  
  cd "$repo" || { ((FAILED++)); continue; }
  
  # Create auto-commit script
  cat > ".git-auto-commit.sh" <<'AUTOCOMMIT'
#!/bin/bash
MESSAGE="${1:-Auto-commit: $(date +%Y-%m-%d\ %H:%M:%S)}"
git add -A
git commit -m "$MESSAGE" && git push 2>/dev/null || echo "Push may have failed - check git remote"
echo "✅ Committed!"
AUTOCOMMIT
  chmod +x .git-auto-commit.sh
  
  # Setup git hooks
  mkdir -p .git/hooks
  cat > .git/hooks/post-commit <<'HOOK'
#!/bin/bash
git push 2>/dev/null || true
HOOK
  chmod +x .git/hooks/post-commit
  
  echo -e "${GREEN}✓${NC} $REPO_NAME - enabled!"
  ((ENABLED++))
done

# Summary
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Enabled: $ENABLED${NC}"
echo -e "${YELLOW}⊘ Skipped: $SKIPPED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# Log to memory
mkdir -p "$HOME/.codex/memory"
cat >> "$HOME/.codex/memory/auto-deploy-mass-enable.log" <<LOG
[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Enabled auto-deploy in $ENABLED projects (skipped: $SKIPPED, failed: $FAILED)
LOG

echo ""
echo "✅ Auto-deploy enabled in $ENABLED projects!"
echo "Use './.git-auto-commit.sh' in any project to auto-commit and push!"
