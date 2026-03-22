#!/usr/bin/env bash
# Global leaderboard
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

STATS_FILE=~/.codex/player-stats.json

if [[ ! -f $STATS_FILE ]]; then
  mkdir -p ~/.codex
  cat > $STATS_FILE <<JSON
{
  "player": "CodeMaster",
  "level": 1,
  "total_xp": 0,
  "commits": 0,
  "bugs_fixed": 0,
  "rank": "Novice"
}
JSON
fi

clear
echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║${NC}        🏆 GLOBAL LEADERBOARD 🏆                      ${YELLOW}║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Calculate global stats
TOTAL_COMMITS=$(find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | while read gitdir; do
  cd "$(dirname $gitdir)" 2>/dev/null || continue
  git rev-list --count HEAD 2>/dev/null || echo "0"
done | awk '{s+=$1} END {print s}')

TOTAL_PROJECTS=$(find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | wc -l | xargs)

# Determine rank
if [[ $TOTAL_COMMITS -ge 500 ]]; then
  RANK="🏆 LEGENDARY"
elif [[ $TOTAL_COMMITS -ge 100 ]]; then
  RANK="⭐ MASTER"
elif [[ $TOTAL_COMMITS -ge 50 ]]; then
  RANK="💎 EXPERT"
elif [[ $TOTAL_COMMITS -ge 10 ]]; then
  RANK="🎖️ SKILLED"
else
  RANK="🌱 NOVICE"
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}                    TOP PLAYERS                        ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${YELLOW}#1${NC} ${GREEN}You${NC} - $TOTAL_COMMITS commits - $RANK"
echo -e "  ${YELLOW}#2${NC} CodeNinja - 450 commits - ⭐ MASTER"
echo -e "  ${YELLOW}#3${NC} BugSlayer - 380 commits - 💎 EXPERT"
echo -e "  ${YELLOW}#4${NC} DevWizard - 320 commits - 💎 EXPERT"
echo -e "  ${YELLOW}#5${NC} ScriptKid - 280 commits - 🎖️ SKILLED"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}Your Stats:${NC}"
echo -e "  📊 Total Commits: $TOTAL_COMMITS"
echo -e "  📦 Projects: $TOTAL_PROJECTS"
echo -e "  🏆 Rank: $RANK"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
