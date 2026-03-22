#!/bin/bash
# Rainbow addition counter

colors=(41 43 42 46 44 45)  # R Y G C B M

while true; do
  for a in {0..9}; do
    for b in {0..9}; do
      clear
      sum=$((a + b))
      
      # Display with color blocks
      echo ""
      c1=${colors[$((a % 6))]}
      c2=${colors[$((b % 6))]}
      c3=${colors[$((sum % 6))]}
      
      printf "   \033[${c1};1m %d \033[0m" $a
      printf " + "
      printf "\033[${c2};1m %d \033[0m" $b
      printf " = "
      printf "\033[${c3};1m %2d \033[0m\n" $sum
      
      # Block visualization
      echo ""
      printf "   "
      for ((i=0; i<a; i++)); do printf "\033[${c1}m▋\033[0m"; done
      printf " + "
      for ((i=0; i<b; i++)); do printf "\033[${c2}m▋\033[0m"; done
      printf " = "
      for ((i=0; i<sum; i++)); do printf "\033[${c3}m▋\033[0m"; done
      echo ""
      
      sleep 0.15
    done
  done
done
