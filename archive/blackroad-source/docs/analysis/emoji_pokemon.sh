#!/bin/bash

WIDTH=30
HEIGHT=30

# Player
PX=5
PY=5

# NPC
NX=15
NY=10

DIALOGUE=(
  "Hey there!"
  "This world is still loading..."
  "One day this will be 3D."
  "Ollama lives here."
)

clear_screen() {
  printf "\033[H\033[2J"
}

type_text() {
  local text="$1"
  for ((i=0; i<${#text}; i++)); do
    printf "%s" "${text:$i:1}"
    sleep 0.03
  done
  echo
}

tile_at() {
  local x=$1 y=$2

  # borders
  if (( x==1 || y==1 || x==WIDTH || y==HEIGHT )); then
    echo "🌳"; return
  fi

  # path
  if (( x==8 && y>3 && y<15 )); then
    echo "🟫"; return
  fi

  echo "⬜"
}

is_solid() {
  [[ "$(tile_at "$1" "$2")" == "🌳" ]]
}

adjacent_to_npc() {
  (( (PX-NX)*(PX-NX) + (PY-NY)*(PY-NY) == 1 ))
}

draw_world() {
  clear_screen
  for ((y=1; y<=HEIGHT; y++)); do
    for ((x=1; x<=WIDTH; x++)); do
      if [[ $x -eq $PX && $y -eq $PY ]]; then
        printf "🙂"
      elif [[ $x -eq $NX && $y -eq $NY ]]; then
        printf "🧑"
      else
        printf "%s" "$(tile_at "$x" "$y")"
      fi
    done
    echo
  done
  echo "WASD move · E talk · Q quit"
}

npc_move() {
  case $((RANDOM % 4)) in
    0) ((NX++));;
    1) ((NX--));;
    2) ((NY++));;
    3) ((NY--));;
  esac

  ((NX<2)) && NX=2
  ((NY<2)) && NY=2
  ((NX>WIDTH-1)) && NX=$((WIDTH-1))
  ((NY>HEIGHT-1)) && NY=$((HEIGHT-1))
}

while true; do
  draw_world
  read -rsn1 key

  NX_PX=$PX
  NX_PY=$PY

  case "$key" in
    w) ((NX_PY--));;
    s) ((NX_PY++));;
    a) ((NX_PX--));;
    d) ((NX_PX++));;
    e)
      if adjacent_to_npc; then
        clear_screen
        type_text "${DIALOGUE[$((RANDOM % ${#DIALOGUE[@]}))]}"
        sleep 1
      fi
      ;;
    q) clear; exit 0;;
  esac

  if ! is_solid "$NX_PX" "$NX_PY"; then
    PX=$NX_PX
    PY=$NX_PY
  fi

  npc_move
done
