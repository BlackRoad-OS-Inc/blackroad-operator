#!/usr/bin/env bash
# BlackRoad Environment Template Sync System
# Syncs canonical .env.example across all repos and orgs

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CANONICAL_TEMPLATE="$HOME/blackroad-os-infra/templates/.env.example"
SYNC_LOG="$HOME/.blackroad-env-sync-$(date +%Y%m%d-%H%M%S).log"
DRY_RUN="${DRY_RUN:-false}"

# Stats
SYNCED_COUNT=0
SKIPPED_COUNT=0
ERROR_COUNT=0

# GitHub Organizations
ORGS=(
  "BlackRoad-OS"
  "BlackRoad-AI"
  "BlackRoad-Labs"
  "BlackRoad-Cloud"
  "BlackRoad-Ventures"
  "BlackRoad-Foundation"
  "BlackRoad-Media"
  "BlackRoad-Hardware"
  "BlackRoad-Education"
  "BlackRoad-Gov"
  "BlackRoad-Security"
  "BlackRoad-Interactive"
  "BlackRoad-Archive"
  "BlackRoad-Studio"
  "Blackbox-Enterprises"
)

log() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*" | tee -a "$SYNC_LOG"
}

success() {
  echo -e "${GREEN}✓${NC} $*" | tee -a "$SYNC_LOG"
  ((SYNCED_COUNT++))
}

warn() {
  echo -e "${YELLOW}⚠${NC} $*" | tee -a "$SYNC_LOG"
  ((SKIPPED_COUNT++))
}

error() {
  echo -e "${RED}✗${NC} $*" | tee -a "$SYNC_LOG"
  ((ERROR_COUNT++))
}

# Check if canonical template exists
if [[ ! -f "$CANONICAL_TEMPLATE" ]]; then
  error "Canonical template not found: $CANONICAL_TEMPLATE"
  exit 1
fi

log "Starting environment template sync..."
log "Canonical template: $CANONICAL_TEMPLATE"
log "Dry run mode: $DRY_RUN"
log "Log file: $SYNC_LOG"
echo ""

# Function to sync template to a directory
sync_template() {
  local target_dir="$1"
  local target_file="$target_dir/.env.example"
  
  # Skip if directory doesn't exist
  if [[ ! -d "$target_dir" ]]; then
    warn "Directory not found: $target_dir"
    return
  fi
  
  # Check if it's a git repo
  if [[ ! -d "$target_dir/.git" ]]; then
    warn "Not a git repo: $target_dir"
    return
  fi
  
  # Check if template already exists and is identical
  if [[ -f "$target_file" ]]; then
    if cmp -s "$CANONICAL_TEMPLATE" "$target_file"; then
      log "Already synced: $target_dir"
      return
    fi
  fi
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log "Would sync: $target_dir"
    return
  fi
  
  # Copy template
  cp "$CANONICAL_TEMPLATE" "$target_file"
  success "Synced: $target_dir"
}

# Sync local repositories
log "Syncing local repositories..."
echo ""

# Sync all blackroad-os-* repos
for dir in "$HOME"/blackroad-os-*; do
  [[ -d "$dir" ]] && sync_template "$dir"
done

# Sync services
for dir in "$HOME"/services/*; do
  [[ -d "$dir" ]] && sync_template "$dir"
done

# Sync specific project directories
SPECIFIC_DIRS=(
  "$HOME/blackroad"
  "$HOME/blackroad-api"
  "$HOME/blackroad-apps"
  "$HOME/blackroad-platform"
  "$HOME/blackroad-io"
  "$HOME/roadapi"
  "$HOME/roadauth"
  "$HOME/roadbilling"
  "$HOME/roadcommand"
  "$HOME/roadgateway"
)

for dir in "${SPECIFIC_DIRS[@]}"; do
  [[ -d "$dir" ]] && sync_template "$dir"
done

echo ""
log "Local sync complete!"
echo ""

# GitHub sync function
sync_github_org() {
  local org="$1"
  
  log "Syncing GitHub org: $org"
  
  # Get all repos in org
  local repos
  repos=$(gh repo list "$org" --limit 1000 --json name -q '.[].name' 2>/dev/null || echo "")
  
  if [[ -z "$repos" ]]; then
    warn "No repos found or no access: $org"
    return
  fi
  
  # Sync each repo
  while IFS= read -r repo; do
    [[ -z "$repo" ]] && continue
    
    local repo_path="$HOME/github-repos/$org/$repo"
    
    # Clone if doesn't exist
    if [[ ! -d "$repo_path" ]]; then
      if [[ "$DRY_RUN" == "true" ]]; then
        log "Would clone: $org/$repo"
        continue
      fi
      
      mkdir -p "$HOME/github-repos/$org"
      if gh repo clone "$org/$repo" "$repo_path" 2>/dev/null; then
        log "Cloned: $org/$repo"
      else
        warn "Failed to clone: $org/$repo"
        continue
      fi
    fi
    
    sync_template "$repo_path"
    
  done <<< "$repos"
}

# Ask if user wants to sync GitHub
if [[ "$DRY_RUN" == "false" ]]; then
  echo ""
  read -p "Sync to GitHub organizations? (y/N): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Syncing to GitHub organizations..."
    echo ""
    
    for org in "${ORGS[@]}"; do
      sync_github_org "$org"
    done
  else
    log "Skipped GitHub sync"
  fi
fi

# Summary
echo ""
echo "======================================"
log "Sync complete!"
echo "======================================"
echo -e "${GREEN}Synced:${NC}  $SYNCED_COUNT"
echo -e "${YELLOW}Skipped:${NC} $SKIPPED_COUNT"
echo -e "${RED}Errors:${NC}  $ERROR_COUNT"
echo ""
log "Full log: $SYNC_LOG"
echo ""

# Create commit helper script
cat > "$HOME/commit-env-sync.sh" << 'COMMIT_EOF'
#!/usr/bin/env bash
# Commit and push .env.example changes across all repos

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"
}

success() {
  echo -e "${GREEN}✓${NC} $*"
}

# Find all repos with .env.example changes
for dir in "$HOME"/blackroad-os-* "$HOME"/services/* "$HOME"/github-repos/*/*; do
  [[ ! -d "$dir/.git" ]] && continue
  
  cd "$dir" || continue
  
  # Check if .env.example has changes
  if git status --porcelain | grep -q '.env.example'; then
    log "Processing: $dir"
    
    git add .env.example
    git commit -m "chore: sync canonical .env.example template

- Updated to use standardized BlackRoad OS environment template
- Includes comprehensive configuration sections
- Adds security best practices and documentation
- Source: blackroad-os-infra/templates/.env.example"
    
    # Push to origin
    if git push 2>/dev/null; then
      success "Pushed: $dir"
    else
      echo "⚠ Manual push needed: $dir"
    fi
  fi
done

log "Commit complete!"
COMMIT_EOF

chmod +x "$HOME/commit-env-sync.sh"

if [[ "$DRY_RUN" == "false" && $SYNCED_COUNT -gt 0 ]]; then
  echo ""
  echo "To commit and push all changes, run:"
  echo -e "${GREEN}  ~/commit-env-sync.sh${NC}"
  echo ""
fi
