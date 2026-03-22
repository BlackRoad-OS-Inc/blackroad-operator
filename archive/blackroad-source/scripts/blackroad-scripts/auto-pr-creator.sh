#!/usr/bin/env bash
# Automatically create pull requests from current branch
set -euo pipefail

PROJECT_DIR="${1:-.}"
PR_TITLE="${2:-Auto-generated PR}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

CURRENT_BRANCH=$(git branch --show-current)
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")

if [[ "$CURRENT_BRANCH" == "$DEFAULT_BRANCH" ]]; then
  echo "Already on default branch ($DEFAULT_BRANCH)"
  echo "Create a feature branch first:"
  echo "  git checkout -b feature/my-feature"
  exit 1
fi

echo -e "${BLUE}[AUTO-PR]${NC} Creating PR from $CURRENT_BRANCH → $DEFAULT_BRANCH"

# Commit any pending changes
if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  git commit -m "Auto-commit before PR" 2>/dev/null || true
fi

# Push branch
git push -u origin "$CURRENT_BRANCH" 2>/dev/null || true

# Create PR
PR_BODY="Auto-generated pull request

Branch: \`${CURRENT_BRANCH}\`
Target: \`${DEFAULT_BRANCH}\`

## Changes
$(git log ${DEFAULT_BRANCH}..${CURRENT_BRANCH} --oneline | head -10)

---
*Created by BlackRoad Auto-PR System*"

if gh pr create --title "$PR_TITLE" --body "$PR_BODY" --base "$DEFAULT_BRANCH" --head "$CURRENT_BRANCH" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Pull request created!"
  gh pr view --web
else
  echo "PR already exists or could not be created"
  echo "View PRs: gh pr list"
fi
