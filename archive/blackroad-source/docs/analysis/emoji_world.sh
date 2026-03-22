#!/bin/bash

# ---------- LOAD MAP ----------
MAP=()
while IFS= read -r line; do MAP+=("$line"); done < ~/world_map.txt

HEIGHT=30
WIDTH=30

# ---------- FIND SPAWNS ----------
for y in "${!MAP[@]}"; do
  for ((x=0; x<${#MAP[$y]}; x++)); do
    case "${MAP[$y]:$x:1}" in
      P) PX=$x; PY=$y;;
      N) NX=$x; NY=$y;;
    esac
  done
done

DIALOGUE=(
  "Hey! Welcome to the BlackRoad world."
  "This is all emojis… for now."
  "One day this becomes 3D."
  "Ollama will live here."
)

clear_screen() { printf "\033[H\033[2J"; }

type_text() {
  local t="$1"
  for ((i=0; i<${#t}; i++)); do
    printf "%s" "${t:$i:1}"
    sleep 0.03
  done
}

draw() {
  clear_screen
  for ((y=0; y<HEIGHT; y++)); do
    for ((x=0; x<WIDTH; x++)); do
      if [[ $x -eq $PX && $y -eq $PY ]]; then
        printf "🙂"
      elif [[ $x -eq $NX && $y -eq $NY ]]; then
        printf "🧑"
      else
        case "${MAP[$y]:$x:1}" in
          "#") printf "⬛";;
          ".") printf "⬜";;
          *)   printf "⬜";;
        esac
      fi
    done
    echo
  done
  echo "──────────────────────────────"
  echo "WASD move · E talk · Q quit"
}

adjacent_to_npc() {
  (( (PX-NX)*(PX-NX) + (PY-NY)*(PY-NY) == 1 ))
}

can_move() { [[ "${MAP[$2]:$1:1}" != "#" ]]; }

npc_wander() {
  case $((RANDOM%4)) in
    0) tx=$((NX+1)); ty=$NY;;
    1) tx=$((NX-1)); ty=$NY;;
    2) tx=$NX; ty=$((NY+1));;
    3) tx=$NX; ty=$((NY-1));;
  esac
  can_move "$tx" "$ty" && NX=$tx && NY=$ty
}

talk() {
  clear_screen
  echo "🧑:"
  echo
  type_text "${DIALOGUE[$((RANDOM % ${#DIALOGUE[@]}))]}"
  echo
  echo
  echo "[press any key]"
  read -rsn1
}

# ---------- GAME LOOP ----------
while true; do
  draw
  read -rsn1 key
  case "$key" in
    w) tx=$PX; ty=$((PY-1));;
    s) tx=$PX; ty=$((PY+1));;
    a) tx=$((PX-1)); ty=$PY;;
    d) tx=$((PX+1)); ty=$PY;;
    e) adjacent_to_npc && talk;;
    q) clear; exit;;
    *) continue;;
  esac
  can_move "$tx" "$ty" && PX=$tx && PY=$ty
  npc_wander
done
