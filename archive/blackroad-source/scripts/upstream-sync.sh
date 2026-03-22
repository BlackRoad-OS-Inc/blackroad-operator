#!/bin/bash
# BlackRoad Source — Autonomous Upstream Sync
# Pulls source files from all 17 GitHub orgs into the canonical source tree
# Cron: 0 */6 * * * /path/to/upstream-sync.sh
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMPCLONE=$(mktemp -d)
LOG="$HOME/.blackroad/logs/upstream-sync.log"
mkdir -p "$(dirname "$LOG")"

log() { echo -e "[$(date -u +%H:%M:%S)] $1" | tee -a "$LOG"; }

pull_repo() {
  local org="$1" repo="$2" dest="$3"
  git clone --depth 1 --quiet "https://github.com/$org/$repo.git" "$TMPCLONE/$repo" 2>/dev/null || return
  mkdir -p "$SOURCE_DIR/$dest"
  find "$TMPCLONE/$repo" -maxdepth 5 \
    \( -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \
    -o -name "*.sh" -o -name "*.sql" -o -name "*.json" -o -name "*.toml" -o -name "*.yml" \
    -o -name "*.yaml" -o -name "*.css" -o -name "*.html" -o -name "*.md" -o -name "*.c" \
    -o -name "*.go" -o -name "*.graphql" -o -name "*.tf" -o -name "Dockerfile" \) \
    | grep -v node_modules | grep -v .git | grep -v package-lock | grep -v .next \
    | while read f; do cp "$f" "$SOURCE_DIR/$dest/" 2>/dev/null; done
  rm -rf "$TMPCLONE/$repo"
}

log "Starting upstream sync..."

# Map of org/repo → destination in source tree
# Add new repos here as they're created
declare -A REPO_MAP=(
  # Workers (apps/)
  [blackboxprogramming/tollbooth]="apps/roadpay"
  [blackboxprogramming/road-search]="apps/roadsearch"
  [blackboxprogramming/chat-blackroad]="apps/roadchat"
  [blackboxprogramming/portal-blackroad]="apps/portal"
  [blackboxprogramming/images-blackroad]="services/storage"
  [blackboxprogramming/index-blackroad]="services/indexing"
  [blackboxprogramming/analytics-blackroad]="services/analytics"
  [blackboxprogramming/stats-blackroad]="services/analytics"
  [blackboxprogramming/auth-blackroad]="api/auth"
  # Memory
  [BlackRoad-OS-Inc/memory]="memory"
  # Orchestrator (from operator)
  [BlackRoad-OS-Inc/blackroad-operator]="cli"
  # Key products
  [blackboxprogramming/roadc]="apps/roadc/src"
  [blackboxprogramming/roadchain]="apps/roadchain/src"
  [blackboxprogramming/lucidia]="agents/lucidia/main"
  [blackboxprogramming/lucidia-cli]="agents/lucidia/cli"
  [BlackRoad-OS/lucidia-core]="agents/lucidia/core"
)

synced=0
for key in "${!REPO_MAP[@]}"; do
  org="${key%%/*}"
  repo="${key#*/}"
  dest="${REPO_MAP[$key]}"
  pull_repo "$org" "$repo" "$dest" && synced=$((synced+1))
done

rm -rf "$TMPCLONE"

# Commit and push if there are changes
cd "$SOURCE_DIR"
if ! git diff --quiet 2>/dev/null || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  git add -A
  git commit -m "Upstream sync: $(date -u +%Y-%m-%d) — $synced repos refreshed

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" 2>/dev/null
  git push 2>/dev/null
  log "Pushed changes from $synced repos"
else
  log "No changes detected"
fi

# Update file count
dirs=$(find . -type d | grep -v .git | wc -l | tr -d ' ')
files=$(find . -type f | grep -v .git | wc -l | tr -d ' ')
log "Source tree: $dirs dirs, $files files"
