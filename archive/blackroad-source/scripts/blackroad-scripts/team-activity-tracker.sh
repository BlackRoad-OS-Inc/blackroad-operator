#!/usr/bin/env bash
# Track team activity across projects
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        👥 TEAM ACTIVITY TRACKER 👥                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Aggregate activity from all projects
TOTAL_COMMITS=0
TOTAL_AUTHORS=0
declare -A AUTHOR_COMMITS

echo -e "${YELLOW}[SCANNING PROJECTS...]${NC}"

find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | head -20 | while read gitdir; do
  PROJECT_DIR=$(dirname "$gitdir")
  cd "$PROJECT_DIR" 2>/dev/null || continue
  
  # Get commits from last 7 days
  RECENT=$(git log --since="7 days ago" --format="%an" 2>/dev/null | wc -l | xargs)
  if [[ $RECENT -gt 0 ]]; then
    echo "  📦 $(basename $PROJECT_DIR): $RECENT commits"
  fi
done

echo ""
echo -e "${YELLOW}[TOP CONTRIBUTORS (Last 7 Days)]${NC}"

# Aggregate across all repos
ALL_AUTHORS=$(find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | while read gitdir; do
  PROJECT_DIR=$(dirname "$gitdir")
  cd "$PROJECT_DIR" 2>/dev/null || continue
  git log --since="7 days ago" --format="%an" 2>/dev/null
done | sort | uniq -c | sort -rn | head -10)

if [[ -n "$ALL_AUTHORS" ]]; then
  echo "$ALL_AUTHORS" | while read count author; do
    echo "  👤 $author: $count commits"
  done
else
  echo "  No recent activity"
fi

echo ""
echo -e "${YELLOW}[ACTIVITY HEATMAP]${NC}"
echo "  📅 Last 7 days:"

for i in {6..0}; do
  DAY=$(date -v-${i}d '+%Y-%m-%d' 2>/dev/null || date -d "$i days ago" '+%Y-%m-%d' 2>/dev/null)
  COUNT=$(find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | while read gitdir; do
    PROJECT_DIR=$(dirname "$gitdir")
    cd "$PROJECT_DIR" 2>/dev/null || continue
    git log --since="$DAY 00:00" --until="$DAY 23:59" --oneline 2>/dev/null | wc -l
  done | awk '{s+=$1} END {print s}')
  
  BARS=$(printf '█%.0s' $(seq 1 $((COUNT > 0 ? COUNT : 0))))
  echo "    $DAY: $BARS ($COUNT)"
done

echo ""
echo -e "${GREEN}✅ Activity tracking complete!${NC}"
