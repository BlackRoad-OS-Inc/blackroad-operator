#!/bin/bash
# br gdrive-sync — Bidirectional Google Drive sync
set -e
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  Google Drive Sync                     ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════╝${RESET}"

case "${1:-status}" in
  pull)
    echo -e "${PINK}Pulling from gdrive-blackroad...${RESET}"
    rclone sync "gdrive-blackroad:BlackRoad OS, Inc." ~/blackroad-gdrive/ \
      --exclude ".git/**" --transfers 4 --progress
    echo -e "${GREEN}✅ Pull complete${RESET}"
    ;;
  push)
    echo -e "${PINK}Pushing docs to gdrive-blackroad...${RESET}"
    rclone sync ~/blackroad-operator/docs/ \
      "gdrive-blackroad:BlackRoad OS, Inc./04 - Product & Engineering/06 - Tech Docs (Non-GitHub)/" \
      --exclude ".git/**" --transfers 4 --progress
    echo -e "${GREEN}✅ Push complete${RESET}"
    ;;
  status)
    echo "gdrive-blackroad:"
    rclone lsd "gdrive-blackroad:" 2>/dev/null | head -10
    echo ""
    echo "gdrive (personal):"
    rclone lsd "gdrive:" 2>/dev/null | head -10
    ;;
  *)
    echo "Usage: br gdrive-sync [pull|push|status]"
    ;;
esac
