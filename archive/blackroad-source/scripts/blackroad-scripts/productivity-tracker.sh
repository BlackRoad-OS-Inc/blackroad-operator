#!/usr/bin/env bash
# Track your coding productivity
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        📈 PRODUCTIVITY TRACKER 📈                    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Today's stats
echo -e "${CYAN}[TODAY'S ACTIVITY]${NC}"
TODAY=$(date '+%Y-%m-%d')

COMMITS_TODAY=0
PROJECTS_TOUCHED=0

find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | while read gitdir; do
  PROJECT_DIR=$(dirname "$gitdir")
  cd "$PROJECT_DIR" 2>/dev/null || continue
  
  COUNT=$(git log --since="$TODAY 00:00" --oneline 2>/dev/null | wc -l | xargs)
  if [[ $COUNT -gt 0 ]]; then
    echo "  📦 $(basename $PROJECT_DIR): $COUNT commits"
    ((COMMITS_TODAY+=COUNT))
    ((PROJECTS_TOUCHED++))
  fi
done

# This week
echo ""
echo -e "${CYAN}[THIS WEEK]${NC}"

for i in {6..0}; do
  DAY=$(date -v-${i}d '+%Y-%m-%d' 2>/dev/null || date -d "$i days ago" '+%Y-%m-%d' 2>/dev/null)
  DAY_NAME=$(date -v-${i}d '+%a' 2>/dev/null || date -d "$i days ago" '+%a' 2>/dev/null)
  
  COUNT=0
  find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | while read gitdir; do
    PROJECT_DIR=$(dirname "$gitdir")
    cd "$PROJECT_DIR" 2>/dev/null || continue
    git log --since="$DAY 00:00" --until="$DAY 23:59" --oneline 2>/dev/null | wc -l
  done | awk '{s+=$1} END {print s}'
done | while read count; do
  BARS=$(printf '█%.0s' $(seq 1 $((count > 0 ? count : 0))))
  printf "  %s: %s (%d commits)\n" "$DAY_NAME" "$BARS" "$count"
done

# Productivity score
echo ""
echo -e "${CYAN}[PRODUCTIVITY SCORE]${NC}"

TOTAL_COMMITS=$(find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | while read gitdir; do
  PROJECT_DIR=$(dirname "$gitdir")
  cd "$PROJECT_DIR" 2>/dev/null || continue
  git log --since="7 days ago" --oneline 2>/dev/null | wc -l
done | awk '{s+=$1} END {print s}')

if [[ $TOTAL_COMMITS -gt 50 ]]; then
  echo -e "  ${GREEN}🔥 LEGENDARY! $TOTAL_COMMITS commits this week!${NC}"
elif [[ $TOTAL_COMMITS -gt 20 ]]; then
  echo -e "  ${GREEN}⭐ EXCELLENT! $TOTAL_COMMITS commits this week!${NC}"
elif [[ $TOTAL_COMMITS -gt 10 ]]; then
  echo -e "  ${YELLOW}👍 GOOD! $TOTAL_COMMITS commits this week!${NC}"
else
  echo -e "  ${YELLOW}📊 $TOTAL_COMMITS commits this week${NC}"
fi

# Save to history
mkdir -p ~/.codex/productivity
echo "$(date +%Y-%m-%d),$TOTAL_COMMITS" >> ~/.codex/productivity/history.csv

echo ""
echo -e "${GREEN}✅ Keep up the great work!${NC}"
