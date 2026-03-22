#!/usr/bin/env bash
# Snake game in terminal!
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}        🐍 SNAKE GAME 🐍                              ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Simple Snake Game!"
echo ""
echo "  Controls:"
echo "  W = Up"
echo "  A = Left"
echo "  S = Down"
echo "  D = Right"
echo ""
echo "  Goal: Eat the apples 🍎 and grow!"
echo ""
echo "  Score: 0"
echo ""
echo "  🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"
echo "  🟩                🟩"
echo "  🟩     🐍         🟩"
echo "  🟩                🟩"
echo "  🟩          🍎    🟩"
echo "  ��                🟩"
echo "  🟩                🟩"
echo "  🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"
echo ""
echo "  (Simplified version - full game coming soon!)"
echo ""
read -p "  Press any key to return..." -n 1 -s
