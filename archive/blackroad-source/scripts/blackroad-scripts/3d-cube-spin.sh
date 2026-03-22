#!/usr/bin/env bash
# Spinning 3D cube!
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🎮 3D CUBE SPINNER 🎮                         ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

frames=(
"
      +-------+
     /|      /|
    / |     / |
   +-------+  |
   |  |    |  |
   |  +----+--+
   | /     | /
   |/      |/
   +-------+
"
"
      +-----+
     /     /|
    /     / |
   +-----+  |
   |     |  |
   |     | /
   |     |/
   +-----+
"
"
    +-------+
   /       /|
  /       / |
 +-------+  |
 |       |  |
 |       | /
 +-------+
"
"
   +-------+
  /|      /|
 / |     / |
+-------+  |
|  |    | /
|  +----+/
| /    /
|/    /
+----+
"
)

echo -e "${YELLOW}  🎮 Press Ctrl+C to stop${NC}"
echo ""

while true; do
  for frame in "${frames[@]}"; do
    tput cup 8 10
    echo -e "${MAGENTA}$frame${NC}"
    sleep 0.3
  done
done
