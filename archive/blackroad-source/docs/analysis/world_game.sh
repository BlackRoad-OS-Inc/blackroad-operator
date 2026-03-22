#!/bin/bash

WORLD=~/world.txt
WIDTH=30
HEIGHT=30

# Player start
PX=15
PY=15

# Read world into array
mapfile -t MAP < "$WORLD"

is_blocked() {
  local x=$1 y=$2
  local tile="${MAP[$((y-1))]:$(( (x-1)*2 )):2}"
  [[ "$tile" == "🌳" || "$tile" == "🪨" || "$tile" == "🟦" || "$tile" == "🏠" ]]
}

draw() {
  printf "\033[H\033[2J"
  for ((y=1; y<=HEIGHT; y++)); do
    line="${MAP[$((y-1))]}"
    if [[ $y -eq $PY ]]; then
      printf "%s🙂%s\n" \
        "${line:0:$(( (PX-1)*2 ))}" \
        "${line:$(( PX*2 ))}"
    else
      echo "$line"
    fi
  done
  echo
  echo "WASD move · Q quit"
}

while true; do
  draw
  read -rsn1 key

  NX=$PX
  NY=$PY

  case "$key" in
    w) ((NY--));;
    s) ((NY++));;
    a) ((NX--));;
    d) ((NX++));;
    q) clear; exit 0;;
  esac

  ((NX<1)) && NX=1
  ((NY<1)) && NY=1
  ((NX>WIDTH)) && NX=$WIDTH
  ((NY>HEIGHT)) && NY=$HEIGHT

  if ! is_blocked "$NX" "$NY"; then
    PX=$NX
    PY=$NY
  fi
done
