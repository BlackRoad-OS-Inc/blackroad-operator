#!/bin/bash

# --- Grid (10x10) ---
GRID=(
"⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛"
)

# Player start
PX=4
PY=4

draw() {
  clear
  for y in "${!GRID[@]}"; do
    row="${GRID[$y]}"
    if [[ $y -eq $PY ]]; then
      # replace character at PX with 🧠
      echo "${row:0:$PX}🧠${row:$((PX+1))}"
    else
      echo "$row"
    fi
  done
  echo
  echo "WASD to move · Q to quit"
}

can_move() {
  local nx=$1 ny=$2
  [[ "${GRID[$ny]:$nx:1}" != "⬛" ]]
}

draw
while true; do
  read -rsn1 key
  case "$key" in
    w|W) nx=$PX; ny=$((PY-1));;
    s|S) nx=$PX; ny=$((PY+1));;
    a|A) nx=$((PX-1)); ny=$PY;;
    d|D) nx=$((PX+1)); ny=$PY;;
    q|Q) clear; exit 0;;
    *) continue;;
  esac
  if can_move "$nx" "$ny"; then
    PX=$nx; PY=$ny
  fi
  draw
done
