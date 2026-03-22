#!/bin/bash
# fleet-repo-sync.sh — Pull latest blackroad-operator to all fleet nodes
# Usage: ./fleet-repo-sync.sh [--push] [--branch main]
# Deployed to Mac, runs via cron or manually

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RED='\033[0;31m'
RESET='\033[0m'

BRANCH="${2:-main}"
PUSH_MODE="${1:-}"

NODES=(
  "pi@192.168.4.49:/home/pi/blackroad-operator"
  "blackroad@192.168.4.96:/home/blackroad/blackroad-operator"
  "octavia@192.168.4.38:/home/octavia/blackroad-operator"
)

NODE_NAMES=("Alice" "Cecilia" "Lucidia")

echo -e "${PINK}━━━ BlackRoad Fleet Repo Sync ━━━${RESET}"
echo -e "Branch: ${AMBER}${BRANCH}${RESET}"
echo ""

for i in "${!NODES[@]}"; do
  IFS=':' read -r ssh_target repo_path <<< "${NODES[$i]}"
  name="${NODE_NAMES[$i]}"

  echo -ne "  ${name} (${ssh_target})... "

  if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$ssh_target" "true" 2>/dev/null; then
    echo -e "${RED}OFFLINE${RESET}"
    continue
  fi

  if [ "$PUSH_MODE" = "--push" ]; then
    # Push local changes to node via rsync (excludes .git for speed)
    rsync -az --delete \
      --exclude='.git' \
      --exclude='node_modules' \
      --exclude='.wrangler' \
      ~/blackroad-operator/ "${ssh_target}:${repo_path}/" 2>/dev/null
    echo -e "${GREEN}PUSHED${RESET}"
  else
    # Pull latest from GitHub on each node
    result=$(ssh -o ConnectTimeout=10 "$ssh_target" "
      cd '${repo_path}' 2>/dev/null || exit 1
      git fetch origin ${BRANCH} 2>&1 && git reset --hard origin/${BRANCH} 2>&1 | tail -1
    " 2>&1)

    if echo "$result" | grep -q "HEAD is now at\|Already up to date"; then
      echo -e "${GREEN}OK${RESET} — $(echo "$result" | tail -1)"
    else
      echo -e "${AMBER}WARN${RESET} — ${result}"
    fi
  fi
done

echo ""
echo -e "${PINK}━━━ Sync complete ━━━${RESET}"
