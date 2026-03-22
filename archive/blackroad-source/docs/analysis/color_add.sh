#!/bin/bash
# Live addition with colored blocks

# ANSI colors
R='\033[41m  \033[0m'  # red block
G='\033[42m  \033[0m'  # green block
B='\033[44m  \033[0m'  # blue block
Y='\033[43m  \033[0m'  # yellow block
C='\033[46m  \033[0m'  # cyan block
M='\033[45m  \033[0m'  # magenta block
W='\033[47m  \033[0m'  # white block

clear
echo ""
echo "  LIVE ADDITION"
echo ""

for i in {1..5}; do
  # Clear and redraw
  tput cup 4 0
  
  # Left side: i blocks
  printf "  "
  for ((j=1; j<=i; j++)); do printf "${R}"; done
  
  # Plus sign
  printf "  \033[1;37m+\033[0m  "
  
  # Right side: always 3 blocks
  printf "${G}${G}${G}"
  
  # Equals
  printf "  \033[1;37m=\033[0m  "
  
  # Result: i+3 blocks in yellow
  for ((j=1; j<=i+3; j++)); do printf "${Y}"; done
  
  echo ""
  echo ""
  printf "     %d     +     3     =     %d\n" $i $((i+3))
  
  sleep 0.8
done

echo ""
echo "  Done!"
