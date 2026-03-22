#!/bin/bash
# Isometric block stacking addition

block() {
  local c=$1 row=$2 col=$3
  tput cup $row $col
  echo -ne "\033[${c}m@@\033[0m"
  tput cup $((row+1)) $col
  echo -ne "\033[${c}m##\033[0m"
}

clear
echo -e "\n  \033[1;37m1 + 2 = ?\033[0m\n"
sleep 0.5

# First block (red)
block "41" 6 10
sleep 0.4

# Plus
tput cup 7 16; echo -ne "\033[1;33m+\033[0m"
sleep 0.3

# Two blocks (blue) 
block "44" 6 22
sleep 0.3
block "44" 4 22
sleep 0.4

# Equals
tput cup 7 30; echo -ne "\033[1;33m=\033[0m"
sleep 0.3

# Result: 3 blocks (green) stacking up
block "42" 6 36
sleep 0.25
block "42" 4 36
sleep 0.25
block "42" 2 36
sleep 0.3

# Answer
tput cup 10 0
echo -e "  \033[1;32m1 + 2 = 3\033[0m"
echo ""
