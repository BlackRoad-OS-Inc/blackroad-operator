#!/bin/bash
# br org-status — Show repo counts across all orgs
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  BlackRoad Org Status                  ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════╝${RESET}"

TOTAL=0
for org in BlackRoad-OS-Inc BlackRoad-OS BlackRoad-Studio BlackRoad-Archive BlackRoad-Interactive BlackRoad-Security BlackRoad-Gov BlackRoad-Education BlackRoad-Hardware BlackRoad-Media BlackRoad-Foundation BlackRoad-Ventures BlackRoad-Cloud BlackRoad-Labs BlackRoad-AI Blackbox-Enterprises; do
  count=$(gh repo list "$org" --limit 500 --json name --jq 'length' 2>/dev/null || echo 0)
  TOTAL=$((TOTAL + count))
  printf "  ${GREEN}%-25s${RESET} %3s repos\n" "$org" "$count"
done
echo ""
echo -e "  ${PINK}TOTAL: ${TOTAL} repos${RESET}"
