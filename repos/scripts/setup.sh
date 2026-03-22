#!/bin/bash
# RoadWay Setup — Install deps and link CLI
# Usage: bash setup.sh

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo ""
echo -e "${PINK}RoadWay Setup${RESET}"
echo ""

cd "$(dirname "$0")/.."

echo -e "\n${GREEN}Installing dependencies...${RESET}"
npm install

echo -e "\n${GREEN}Linking CLI globally...${RESET}"
chmod +x cli/roadway.js
npm link 2>/dev/null || sudo npm link

echo -e "\n${GREEN}Making detect.sh executable...${RESET}"
chmod +x buildpacks/detect.sh

# Check Docker
if command -v docker &>/dev/null; then
  echo -e "${GREEN}Docker: $(docker --version)${RESET}"
else
  echo -e "\033[38;5;214mDocker not found. Install Docker to deploy containers.${RESET}"
fi

echo -e "\n${PINK}RoadWay is ready!${RESET}"
echo -e "  Start server:  ${GREEN}roadway server${RESET}"
echo -e "  Deploy an app:  ${GREEN}roadway deploy ./my-project${RESET}"
echo -e "  Dashboard:      ${GREEN}http://localhost:4400${RESET}"
echo ""
