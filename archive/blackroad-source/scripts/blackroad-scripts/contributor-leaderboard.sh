#!/usr/bin/env bash
# Show contributor leaderboard across all projects
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🏆 CONTRIBUTOR LEADERBOARD 🏆                 ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Aggregate commits across all repos
declare -A AUTHOR_COMMITS
declare -A AUTHOR_PROJECTS

echo -e "${CYAN}[SCANNING ALL PROJECTS...]${NC}"

find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | while read gitdir; do
  PROJECT_DIR=$(dirname "$gitdir")
  cd "$PROJECT_DIR" 2>/dev/null || continue
  
  PROJECT_NAME=$(basename "$PROJECT_DIR")
  
  git log --format="%an" 2>/dev/null | while read author; do
    echo "$author|$PROJECT_NAME"
  done
done | sort | uniq -c > /tmp/contributor_stats.txt

echo ""
echo -e "${YELLOW}[TOP CONTRIBUTORS]${NC}"
echo ""

# Process and display
awk '{print $2, $1}' /tmp/contributor_stats.txt | \
  awk -F'|' '{author=$1; count+=$2; projects[author]++} END {
    for (a in projects) print count[a], projects[a], a
  }' | sort -rn | head -10 | \
  awk '{printf "  🥇 %-20s %4d commits across %d projects\n", $3, $1, $2}'

echo ""
echo -e "${YELLOW}[THIS MONTH]${NC}"

find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | head -10 | while read gitdir; do
  PROJECT_DIR=$(dirname "$gitdir")
  cd "$PROJECT_DIR" 2>/dev/null || continue
  
  COUNT=$(git log --since="1 month ago" --oneline 2>/dev/null | wc -l | xargs)
  if [[ $COUNT -gt 0 ]]; then
    echo "  📦 $(basename $PROJECT_DIR): $COUNT commits"
  fi
done

rm -f /tmp/contributor_stats.txt
echo ""
echo -e "${GREEN}✅ Leaderboard complete!${NC}"
