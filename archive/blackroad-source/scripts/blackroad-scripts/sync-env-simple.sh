#!/usr/bin/env bash
# Simplified BlackRoad Environment Sync
# Usage: ./sync-env-simple.sh [--github]

set -uo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CANONICAL="$HOME/blackroad-os-infra/templates/.env.example"
SYNCED=0
SKIPPED=0

log() { echo -e "${BLUE}[ENV-SYNC]${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; SYNCED=$((SYNCED + 1)); }
skip() { echo -e "${YELLOW}⊘${NC} $*"; SKIPPED=$((SKIPPED + 1)); }

sync_file() {
  local dir="$1"
  local target="$dir/.env.example"
  
  [[ ! -d "$dir" ]] && return
  [[ ! -d "$dir/.git" ]] && { skip "Not a repo: $dir"; return; }
  
  if [[ -f "$target" ]] && cmp -s "$CANONICAL" "$target"; then
    skip "Already synced: $(basename "$dir")"
    return
  fi
  
  cp "$CANONICAL" "$target"
  success "Synced: $(basename "$dir")"
}

log "Syncing from: $CANONICAL"
echo ""

# Sync all blackroad-os-* repos
log "Syncing blackroad-os-* repos..."
for dir in "$HOME"/blackroad-os-*; do
  sync_file "$dir"
done
echo ""

# Sync services
log "Syncing services..."
for dir in "$HOME"/services/*; do
  sync_file "$dir"
done
echo ""

# Sync core projects
log "Syncing core projects..."
for name in blackroad blackroad-api blackroad-apps blackroad-platform blackroad-io roadapi roadauth roadbilling roadcommand roadgateway; do
  sync_file "$HOME/$name"
done
echo ""

echo "======================================"
log "Complete!"
echo "======================================"
echo -e "${GREEN}Synced:${NC}  $SYNCED repos"
echo -e "${YELLOW}Skipped:${NC} $SKIPPED repos"
echo ""

if [[ $SYNCED -gt 0 ]]; then
  echo "Next steps:"
  echo "1. Review changes: cd <repo> && git diff .env.example"
  echo "2. Commit all: ~/commit-env-sync.sh"
  echo ""
fi
