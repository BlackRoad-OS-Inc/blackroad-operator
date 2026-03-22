#!/usr/bin/env bash
# Enable auto-deploy in ALL git projects (FIXED)
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}[AUTO-DEPLOY-ALL]${NC} Scanning for git repositories..."

# Find all git repos (excluding common ignore patterns)
REPOS=()
while IFS= read -r repo; do
  # Skip if in node_modules, cache, etc
  if [[ "$repo" =~ node_modules|\.npm|\.cache|\.local/share|\.git/|Applications/|Library/ ]]; then
    continue
  fi
  REPOS+=("$repo")
done < <(find "$HOME" -maxdepth 3 -name ".git" -type d 2>/dev/null | sed 's/\/.git$//')

TOTAL=${#REPOS[@]}
echo -e "${BLUE}[AUTO-DEPLOY-ALL]${NC} Found $TOTAL git repositories (after filtering)"
echo ""

if [[ $TOTAL -eq 0 ]]; then
  echo "No git repositories found!"
  exit 0
fi

# Ask for confirmation if more than 50
if [[ $TOTAL -gt 50 ]]; then
  echo -e "${YELLOW}⚠${NC} Found $TOTAL repos. This might take a while."
  echo "Continue? (y/n)"
  read -r CONFIRM
  if [[ "$CONFIRM" != "y" ]]; then
    echo "Cancelled."
    exit 0
  fi
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
  
  echo -e "${BLUE}▸${NC} Enabling: $REPO_NAME"
  
  # Create auto-commit script
  cat > "$repo/.git-auto-commit.sh" <<'AUTOCOMMIT'
#!/bin/bash
MESSAGE="${1:-Auto-commit: $(date +%Y-%m-%d\ %H:%M:%S)}"
git add -A
if git commit -m "$MESSAGE"; then
  git push 2>/dev/null || echo "⚠ Push may have failed - check git remote"
  echo "✅ Committed!"
else
  echo "ℹ No changes to commit"
fi
AUTOCOMMIT
  chmod +x "$repo/.git-auto-commit.sh" || { ((FAILED++)); continue; }
  
  # Setup git hooks
  mkdir -p "$repo/.git/hooks"
  cat > "$repo/.git/hooks/post-commit" <<'HOOK'
#!/bin/bash
git push 2>/dev/null || true
HOOK
  chmod +x "$repo/.git/hooks/post-commit" || { ((FAILED++)); continue; }
  
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
echo "Use './.git-auto-commit.sh \"message\"' in any project!"
