#!/usr/bin/env bash
# Hacker mode simulation
GREEN='\033[0;32m'
NC='\033[0m'

messages=(
  "Initializing quantum compiler..."
  "Bypassing firewall..."
  "Decrypting blockchain..."
  "Hacking the mainframe..."
  "Accessing satellite uplink..."
  "Downloading internet..."
  "Compiling AI consciousness..."
  "Reversing entropy..."
  "Triangulating IP address..."
  "Establishing backdoor..."
)

clear
echo -e "${GREEN}"
cat << 'HACKER'
╦ ╦╔═╗╔═╗╦╔═╔═╗╦═╗  ╔╦╗╔═╗╔╦╗╔═╗
╠═╣╠═╣║  ╠╩╗║╣ ╠╦╝  ║║║║ ║ ║║║╣ 
╩ ╩╩ ╩╚═╝╩ ╩╚═╝╩╚═  ╩ ╩╚═╝═╩╝╚═╝
HACKER
echo -e "${NC}"

for msg in "${messages[@]}"; do
  echo -e "${GREEN}[$(date +%H:%M:%S)] $msg${NC}"
  sleep 0.5
  echo -e "${GREEN}[████████████████████] 100%${NC}"
  sleep 0.3
done

echo ""
echo -e "${GREEN}✓ ALL SYSTEMS OPERATIONAL${NC}"
echo -e "${GREEN}✓ YOU ARE IN THE MAINFRAME${NC}"
echo -e "${GREEN}✓ HACK COMPLETE${NC}"
echo ""
