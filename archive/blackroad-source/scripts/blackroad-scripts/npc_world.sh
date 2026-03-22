#!/bin/bash

WIDTH=30
HEIGHT=30

# NPC position
NX=15
NY=15

# Messages the NPC "types"
MESSAGES=(
  "Hmm..."
  "Nice day out here."
  "I wonder what's next."
  "This world feels big."
  "..."
)

clear_screen() {
  printf "\033[H\033[2J"
}

draw_world() {
  clear_screen

  for ((y=1; y<=HEIGHT; y++)); do
    for ((x=1; x<=WIDTH; x++)); do
      if [[ $x -eq $NX && $y -eq $NY ]]; then
        printf "🧑"
      else
        printf "⬜"
      fi
    done
    echo
  done

  echo
  printf "💬 %s\n" "${MESSAGES[$((RANDOM % ${#MESSAGES[@]}))]}"
}

while true; do
  draw_world

  # random movement (Pokémon-style idle NPC)
  case $((RANDOM % 4)) in
    0) ((NX++));;
    1) ((NX--));;
    2) ((NY++));;
    3) ((NY--));;
  esac

  # clamp to world bounds
  ((NX < 1)) && NX=1
  ((NY < 1)) && NY=1
  ((NX > WIDTH)) && NX=$WIDTH
  ((NY > HEIGHT)) && NY=$HEIGHT

  sleep 0.4
done
