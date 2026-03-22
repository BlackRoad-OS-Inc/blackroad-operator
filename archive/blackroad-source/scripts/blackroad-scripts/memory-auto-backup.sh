#!/usr/bin/env bash
# Automatic scheduled backups for all enabled projects
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[AUTO-BACKUP]${NC} Starting automatic backup of all projects..."

BACKED_UP=0
SKIPPED=0

# Find all projects with auto-commit enabled
while IFS= read -r script; do
  PROJECT_DIR=$(dirname "$script")
  PROJECT_NAME=$(basename "$PROJECT_DIR")
  
  cd "$PROJECT_DIR" || continue
  
  # Check if there are uncommitted changes
  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    echo -e "${BLUE}▸${NC} Backing up: $PROJECT_NAME"
    
    # Auto-commit with timestamp
    if git add -A && git commit -m "🤖 Auto-backup: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null; then
      git push 2>/dev/null || echo "  ⚠ Push failed"
      echo -e "${GREEN}✓${NC} $PROJECT_NAME backed up!"
      ((BACKED_UP++))
    fi
  else
    ((SKIPPED++))
  fi
done < <(find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null)

echo ""
echo -e "${GREEN}✅ Backup complete!${NC}"
echo "  Backed up: $BACKED_UP projects"
echo "  No changes: $SKIPPED projects"
