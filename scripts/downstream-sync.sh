#!/bin/bash
# BlackRoad Downstream Sync Pipeline
# Pushes code from blackroad-operator monorepo → downstream GitHub repos
#
# How it works:
#   1. Reads sync-map.json for operator_dir → github_org/repo mapping
#   2. For each mapping, clones the downstream repo (shallow)
#   3. Rsyncs the operator directory into the clone
#   4. Commits and pushes if there are changes
#
# Usage:
#   downstream-sync.sh                     — sync all (dry-run)
#   downstream-sync.sh --push              — actually push
#   downstream-sync.sh --org BlackRoad-AI   — sync one org only
#   downstream-sync.sh --repo lucidia-core  — sync one repo only
#   downstream-sync.sh --changed-only       — only repos with git changes
#   downstream-sync.sh --create-missing     — create repos that don't exist yet

set +e  # Don't exit on errors — we handle them per-repo

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
CYAN='\033[38;5;69m'
RED='\033[0;31m'
DIM='\033[2m'
NC='\033[0m'

OPERATOR_DIR="$HOME/blackroad-operator"
SYNC_MAP="$OPERATOR_DIR/sync-map.json"
WORK_DIR="/tmp/blackroad-downstream-sync"
PUSH=false
ORG_FILTER=""
REPO_FILTER=""
CHANGED_ONLY=false
CREATE_MISSING=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --push) PUSH=true; shift ;;
    --changed-only) CHANGED_ONLY=true; shift ;;
    --create-missing) CREATE_MISSING=true; shift ;;
    --org) ORG_FILTER="$2"; shift 2 ;;
    --repo) REPO_FILTER="$2"; shift 2 ;;
    *) shift ;;
  esac
done

echo -e "${PINK}BlackRoad Downstream Sync${NC}"
echo -e "${DIM}Source: blackroad-operator → downstream GitHub repos${NC}"
if ! $PUSH; then
  echo -e "${AMBER}DRY RUN — use --push to actually push${NC}"
fi
echo ""

mkdir -p "$WORK_DIR"

# Read mapping into a temp file (avoids stdin conflicts with git/gh)
REPO_LIST="$WORK_DIR/repo-list.tsv"
python3 -c "
import json, sys
with open('$SYNC_MAP') as f:
    data = json.load(f)
for path, info in sorted(data.items()):
    org = info['org']
    repo = info['dir']
    github = info['github']
    files = info['files']
    status = info.get('status', 'active')
    if status != 'active':
        continue
    if '$ORG_FILTER' and org != '$ORG_FILTER':
        continue
    if '$REPO_FILTER' and repo != '$REPO_FILTER':
        continue
    print(f'{path}\t{github}\t{files}')
" > "$REPO_LIST"

synced=0
skipped=0
created=0
errors=0

repo_count=$(wc -l < "$REPO_LIST" | tr -d ' ')
echo -e "${DIM}Processing $repo_count repos...${NC}"
echo ""

# Use line-by-line iteration to avoid stdin conflicts with git/gh
for line_num in $(seq 1 "$repo_count"); do
  line=$(sed -n "${line_num}p" "$REPO_LIST")
  [ -z "$line" ] && continue
  rel_path=$(echo "$line" | cut -f1)
  github=$(echo "$line" | cut -f2)
  file_count=$(echo "$line" | cut -f3)

  src_dir="$OPERATOR_DIR/$rel_path"
  org=$(echo "$github" | cut -d/ -f1)
  repo=$(echo "$github" | cut -d/ -f2)
  clone_dir="$WORK_DIR/$org/$repo"

  # Skip tiny repos (< 3 files = probably empty placeholder)
  if [ "$file_count" -lt 3 ]; then
    ((skipped++))
    continue
  fi

  echo -ne "  ${CYAN}${github}${NC} (${file_count} files)..."

  # Check if repo exists on GitHub
  if ! gh repo view "$github" --json name < /dev/null >/dev/null 2>&1; then
    if $CREATE_MISSING; then
      echo -ne " creating..."
      gh repo create "$github" --public --description "BlackRoad OS — $repo (synced from operator)" < /dev/null >/dev/null 2>&1
      ((created++))
    else
      echo -e " ${AMBER}not found (use --create-missing)${NC}"
      ((skipped++))
      continue
    fi
  fi

  # Clone or update
  if [ -d "$clone_dir/.git" ]; then
    cd "$clone_dir"
    git pull --quiet < /dev/null 2>/dev/null || true
  else
    rm -rf "$clone_dir"
    gh repo clone "$github" "$clone_dir" -- --depth 1 --quiet < /dev/null 2>/dev/null || {
      # Repo might be empty
      mkdir -p "$clone_dir"
      cd "$clone_dir"
      git init --quiet
      git remote add origin "https://github.com/$github.git" 2>/dev/null || true
    }
  fi

  cd "$clone_dir"

  # Rsync operator dir → clone (exclude .git and node_modules)
  rsync -a --delete \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '__pycache__' \
    --exclude '.DS_Store' \
    --exclude 'dist' \
    --exclude 'build' \
    "$src_dir/" "$clone_dir/" 2>/dev/null

  # Check for changes
  if [ -d ".git" ]; then
    changes=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  else
    changes=1
  fi

  if [ "$changes" -eq 0 ]; then
    echo -e " ${DIM}no changes${NC}"
    ((skipped++))
    continue
  fi

  if $PUSH; then
    git add -A 2>/dev/null
    git commit -m "sync: update from blackroad-operator $(date +%Y-%m-%d)

Synced from BlackRoad-OS-Inc/blackroad-operator/$rel_path
BlackRoad OS — Pave Tomorrow." --quiet 2>/dev/null || true

    if git push origin HEAD --quiet < /dev/null 2>/dev/null; then
      echo -e " ${GREEN}pushed ($changes changes)${NC}"
      ((synced++))
    else
      echo -e " ${RED}push failed${NC}"
      ((errors++))
    fi
  else
    echo -e " ${AMBER}$changes changes (dry-run)${NC}"
    ((synced++))
  fi

done

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}Synced: $synced${NC}  ${AMBER}Skipped: $skipped${NC}  ${RED}Errors: $errors${NC}  Created: $created"
if ! $PUSH; then
  echo -e "  ${AMBER}This was a dry run. Use --push to actually push.${NC}"
fi
echo -e "  ${DIM}BlackRoad OS — Pave Tomorrow.${NC}"
echo ""
