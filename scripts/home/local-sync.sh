#!/bin/bash
# BlackRoad Local Sync — backs up working files to blackroad-os-inc/local
# Usage: ~/local-sync.sh [--dry-run]
# Cron: */30 * * * * ~/local-sync.sh >> /tmp/local-sync.log 2>&1

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

LOCAL_DIR="$HOME/local"
DRY_RUN=false
[[ "$1" == "--dry-run" ]] && DRY_RUN=true

log() { echo -e "${PINK}[local-sync]${RESET} $(date '+%H:%M:%S') $1"; }

# Dirs/files to sync (working files not in other repos)
SYNC_SOURCES=(
    # Loose scripts
    "$HOME/*.sh"
    "$HOME/*.py"
    "$HOME/*.html"
    "$HOME/*.css"
    "$HOME/*.json"

    # Key working dirs (small, active, no own repo)
    "$HOME/bin/"
    "$HOME/roadnet/"
    "$HOME/roadc/"
    "$HOME/config/"
    "$HOME/memory/"
    "$HOME/archive/scripts/"
    "$HOME/archive/modelfiles/"
    "$HOME/archive/yaml/"

    # Cron and dotfiles
    "$HOME/.zshrc"
    "$HOME/.zprofile"
    "$HOME/.gitconfig"
    "$HOME/.claude/CLAUDE.md"
    "$HOME/.claude/projects/"
    "$HOME/CLAUDE.md"
)

# Dirs to EXCLUDE from rsync (already in dedicated repos or too large)
EXCLUDE_ARGS=(
    --exclude='.git/'
    --exclude='node_modules/'
    --exclude='__pycache__/'
    --exclude='.next/'
    --exclude='dist/'
    --exclude='.DS_Store'
    --exclude='*.pyc'
    --exclude='package-lock.json'
    --exclude='.env'
    --exclude='.env.*'
    --exclude='*.pem'
    --exclude='*.key'
)

mkdir -p "$LOCAL_DIR/scripts" "$LOCAL_DIR/bin" "$LOCAL_DIR/dotfiles" "$LOCAL_DIR/config" "$LOCAL_DIR/roadnet" "$LOCAL_DIR/roadc" "$LOCAL_DIR/memory" "$LOCAL_DIR/archive"

log "Starting sync..."

# 1. Loose scripts and files from ~/
rsync -a --update "${EXCLUDE_ARGS[@]}" --include='*.sh' --include='*.py' --include='*.html' --include='*.css' --exclude='*/' --exclude='*.db' --filter='- */' "$HOME/"*.sh "$LOCAL_DIR/scripts/" 2>/dev/null || true
rsync -a --update "${EXCLUDE_ARGS[@]}" "$HOME/"*.py "$LOCAL_DIR/scripts/" 2>/dev/null || true

# 2. ~/bin/ tools
rsync -a --update "${EXCLUDE_ARGS[@]}" "$HOME/bin/" "$LOCAL_DIR/bin/" 2>/dev/null || true

# 3. Dotfiles
cp -p "$HOME/.zshrc" "$LOCAL_DIR/dotfiles/zshrc" 2>/dev/null || true
cp -p "$HOME/.zprofile" "$LOCAL_DIR/dotfiles/zprofile" 2>/dev/null || true
cp -p "$HOME/.gitconfig" "$LOCAL_DIR/dotfiles/gitconfig" 2>/dev/null || true
cp -p "$HOME/CLAUDE.md" "$LOCAL_DIR/dotfiles/CLAUDE.md" 2>/dev/null || true

# 4. Claude memory
rsync -a --update "${EXCLUDE_ARGS[@]}" "$HOME/.claude/projects/" "$LOCAL_DIR/claude-projects/" 2>/dev/null || true

# 5. Config dir
[ -d "$HOME/config" ] && rsync -a --update "${EXCLUDE_ARGS[@]}" "$HOME/config/" "$LOCAL_DIR/config/" 2>/dev/null || true

# 6. RoadNet & RoadC
[ -d "$HOME/roadnet" ] && rsync -a --update "${EXCLUDE_ARGS[@]}" "$HOME/roadnet/" "$LOCAL_DIR/roadnet/" 2>/dev/null || true
[ -d "$HOME/roadc" ] && rsync -a --update "${EXCLUDE_ARGS[@]}" "$HOME/roadc/" "$LOCAL_DIR/roadc/" 2>/dev/null || true

# 7. Memory
[ -d "$HOME/memory" ] && rsync -a --update "${EXCLUDE_ARGS[@]}" "$HOME/memory/" "$LOCAL_DIR/memory/" 2>/dev/null || true

# 8. Archive (scripts, modelfiles, yaml only — skip repos/images)
[ -d "$HOME/archive/scripts" ] && rsync -a --update "${EXCLUDE_ARGS[@]}" "$HOME/archive/scripts/" "$LOCAL_DIR/archive/scripts/" 2>/dev/null || true
[ -d "$HOME/archive/modelfiles" ] && rsync -a --update "${EXCLUDE_ARGS[@]}" "$HOME/archive/modelfiles/" "$LOCAL_DIR/archive/modelfiles/" 2>/dev/null || true
[ -d "$HOME/archive/yaml" ] && rsync -a --update "${EXCLUDE_ARGS[@]}" "$HOME/archive/yaml/" "$LOCAL_DIR/archive/yaml/" 2>/dev/null || true

# 9. Crontab snapshot
crontab -l > "$LOCAL_DIR/dotfiles/crontab.txt" 2>/dev/null || true

# 10. Homebrew bundle
brew list --formula > "$LOCAL_DIR/dotfiles/brew-formulae.txt" 2>/dev/null || true
brew list --cask > "$LOCAL_DIR/dotfiles/brew-casks.txt" 2>/dev/null || true

# Git commit and push
cd "$LOCAL_DIR"
git add -A

CHANGES=$(git diff --cached --stat)
if [ -z "$CHANGES" ]; then
    log "${GREEN}No changes to sync${RESET}"
    exit 0
fi

FILE_COUNT=$(git diff --cached --numstat | wc -l | tr -d ' ')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

if $DRY_RUN; then
    log "${AMBER}[DRY RUN] Would commit $FILE_COUNT files${RESET}"
    git diff --cached --stat
    git reset HEAD -- . > /dev/null 2>&1
    exit 0
fi

git commit -m "sync: $TIMESTAMP — $FILE_COUNT files from Alexandria" --quiet
git push origin main --quiet 2>/dev/null || git push origin master --quiet 2>/dev/null || {
    # First push — set up branch
    git branch -M main
    git push -u origin main --quiet
}

log "${GREEN}Synced $FILE_COUNT files${RESET}"
