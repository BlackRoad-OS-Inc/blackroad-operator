#!/usr/bin/env bash
# Gaming-style achievement system for coding
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

ACHIEVEMENTS_FILE=~/.codex/achievements.json

# Initialize if doesn't exist
if [[ ! -f $ACHIEVEMENTS_FILE ]]; then
  mkdir -p ~/.codex
  cat > $ACHIEVEMENTS_FILE <<JSON
{
  "unlocked": [],
  "total_commits": 0,
  "total_projects": 0,
  "streak_days": 0
}
JSON
fi

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🏆 ACHIEVEMENT SYSTEM 🏆                      ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Calculate stats
TOTAL_COMMITS=$(find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | while read gitdir; do
  cd "$(dirname $gitdir)" 2>/dev/null || continue
  git rev-list --count HEAD 2>/dev/null || echo "0"
done | awk '{s+=$1} END {print s}')

TOTAL_PROJECTS=$(find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | wc -l | xargs)

echo -e "${CYAN}[YOUR STATS]${NC}"
echo "  📊 Total Commits: $TOTAL_COMMITS"
echo "  📦 Total Projects: $TOTAL_PROJECTS"
echo ""

# Check achievements
echo -e "${YELLOW}[ACHIEVEMENTS]${NC}"
echo ""

declare -a UNLOCKED=()

# Commit milestones
if [[ $TOTAL_COMMITS -ge 1 ]]; then
  echo -e "  ${GREEN}🎉 First Commit!${NC} - Make your first commit"
  UNLOCKED+=("first_commit")
fi

if [[ $TOTAL_COMMITS -ge 10 ]]; then
  echo -e "  ${GREEN}🔟 Double Digits!${NC} - Reach 10 commits"
  UNLOCKED+=("10_commits")
fi

if [[ $TOTAL_COMMITS -ge 50 ]]; then
  echo -e "  ${GREEN}⭐ Half Century!${NC} - Reach 50 commits"
  UNLOCKED+=("50_commits")
fi

if [[ $TOTAL_COMMITS -ge 100 ]]; then
  echo -e "  ${GREEN}💯 Centurion!${NC} - Reach 100 commits"
  UNLOCKED+=("100_commits")
fi

if [[ $TOTAL_COMMITS -ge 500 ]]; then
  echo -e "  ${GREEN}🔥 On Fire!${NC} - Reach 500 commits"
  UNLOCKED+=("500_commits")
fi

# Project milestones
if [[ $TOTAL_PROJECTS -ge 5 ]]; then
  echo -e "  ${GREEN}🎨 Polyglot!${NC} - Have 5 different projects"
  UNLOCKED+=("5_projects")
fi

if [[ $TOTAL_PROJECTS -ge 10 ]]; then
  echo -e "  ${GREEN}��️  Builder!${NC} - Have 10 different projects"
  UNLOCKED+=("10_projects")
fi

if [[ $TOTAL_PROJECTS -ge 50 ]]; then
  echo -e "  ${GREEN}🏰 Empire!${NC} - Have 50 different projects"
  UNLOCKED+=("50_projects")
fi

# Special achievements
if [[ -f ~/scripts/mega-dashboard.sh ]]; then
  echo -e "  ${GREEN}🤖 Automation Master!${NC} - Create automation scripts"
  UNLOCKED+=("automation")
fi

if [[ $(ls ~/scripts/*.sh 2>/dev/null | wc -l) -ge 50 ]]; then
  echo -e "  ${GREEN}🧙 Wizard!${NC} - Create 50+ automation scripts"
  UNLOCKED+=("50_scripts")
fi

# Count achievements
UNLOCKED_COUNT=${#UNLOCKED[@]}
TOTAL_ACHIEVEMENTS=15

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "  ${YELLOW}Unlocked: $UNLOCKED_COUNT/$TOTAL_ACHIEVEMENTS achievements${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"

# Update achievements file
cat > $ACHIEVEMENTS_FILE <<JSON
{
  "unlocked": [$(printf '"%s",' "${UNLOCKED[@]}" | sed 's/,$//') ],
  "total_commits": $TOTAL_COMMITS,
  "total_projects": $TOTAL_PROJECTS,
  "last_check": "$(date)"
}
JSON

echo ""
echo "Next milestone: $(( ((TOTAL_COMMITS / 100) + 1) * 100 )) commits"
