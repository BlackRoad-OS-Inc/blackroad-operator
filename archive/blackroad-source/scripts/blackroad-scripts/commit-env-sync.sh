#!/usr/bin/env bash
# Commit and push .env.example changes across all repos

set -uo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMMITTED=0
PUSHED=0
SKIPPED=0

log() { echo -e "${BLUE}[COMMIT]${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC} $*"; }

commit_and_push() {
  local dir="$1"
  local repo_name=$(basename "$dir")
  
  [[ ! -d "$dir/.git" ]] && return
  
  cd "$dir" || return
  
  # Check if .env.example has changes
  if ! git status --porcelain | grep -q '.env.example'; then
    return
  fi
  
  log "Processing: $repo_name"
  
  git add .env.example
  
  git commit -m "chore: sync canonical .env.example template

- Updated to use standardized BlackRoad OS environment template
- Includes comprehensive configuration sections
- Adds security best practices and documentation
- Source: blackroad-os-infra/templates/.env.example" 2>&1 | head -5
  
  COMMITTED=$((COMMITTED + 1))
  
  # Try to push
  if git push 2>&1 | head -3; then
    success "Pushed: $repo_name"
    PUSHED=$((PUSHED + 1))
  else
    warn "Manual push needed: $repo_name"
    SKIPPED=$((SKIPPED + 1))
  fi
  
  echo ""
done

log "Committing and pushing .env.example changes..."
echo ""

# Process all blackroad-os repos
for dir in "$HOME"/blackroad-os-*; do
  commit_and_push "$dir"
done

# Process core projects
for name in blackroad blackroad-api blackroad-apps blackroad-platform blackroad-io roadapi roadauth roadbilling roadcommand roadgateway; do
  commit_and_push "$HOME/$name"
done

echo "======================================"
log "Complete!"
echo "======================================"
echo -e "${GREEN}Committed:${NC} $COMMITTED repos"
echo -e "${GREEN}Pushed:${NC}    $PUSHED repos"
echo -e "${YELLOW}Skipped:${NC}   $SKIPPED repos (need manual push)"
echo ""

if [[ $SKIPPED -gt 0 ]]; then
  echo "For repos needing manual push:"
  echo "  cd <repo> && git push"
  echo ""
fi
