#!/bin/bash

MODEL="qwen2.5:0.5b"

# --------- xterm-256 COLORS ---------
C_TREE=34
C_GRASS=82
C_WALL=240
C_FLOOR=255
C_DOOR=208
C_PLAYER=198
C_NPC=33
C_TEXT=202

c() { printf "\033[38;5;%sm%s\033[0m" "$1" "$2"; }

# ---------- ROOMS ----------
ROOM_OUTSIDE=(
"🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳"
"🌳⬜⬜⬜⬜⬜⬜⬜⬜🌳"
"🌳⬜🧑⬜⬜⬜⬜⬜⬜🌳"
"🌳⬜⬜⬜⬜⬜⬜⬜⬜🌳"
"🌳⬜⬜⬜🌾🌾⬜⬜⬜🌳"
"🌳⬜⬜⬜🌾🌾⬜⬜⬜🌳"
"🌳⬜⬜⬜⬜⬜⬜⬜⬜🌳"
"🌳⬜⬜⬜⬜⬜⬜⬜⬜🌳"
"🌳⬜⬜⬜⬜⬜⬜⬜⬜🌳"
"🌳🌳🌳🌳🚪🌳🌳🌳🌳🌳"
)

ROOM_HOUSE=(
"⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛"
"⬛🪟⬜⬜⬜⬜⬜⬜🪟⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜🛋️⬜⬜🪑⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜📺⬜⬜⬜🛏️⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬛⬛⬛🚪⬛⬛⬛⬛⬛"
)

# ---------- STATE ----------
CURRENT_ROOM="outside"
GRID=("${ROOM_OUTSIDE[@]}")
PX=4; PY=8
NPCX=2; NPCY=2
MESSAGE=""

tile() {
  case "$1" in
    🌳) c $C_TREE "$1";;
    🌾) c $C_GRASS "$1";;
    ⬛) c $C_WALL "$1";;
    ⬜) c $C_FLOOR "$1";;
    🚪) c $C_DOOR "$1";;
    *) echo -n "$1";;
  esac
}

load_room() {
  CURRENT_ROOM="$1"
  if [[ "$1" == "outside" ]]; then
    GRID=("${ROOM_OUTSIDE[@]}")
    PX=4; PY=8; NPCX=2; NPCY=2
  else
    GRID=("${ROOM_HOUSE[@]}")
    PX=4; PY=1; NPCX=-1; NPCY=-1
  fi
}

draw() {
  clear
  for y in "${!GRID[@]}"; do
    row="${GRID[$y]}"
    for ((x=0; x<${#row}; x++)); do
      ch="${row:$x:1}"
      if [[ $x -eq $PX && $y -eq $PY ]]; then
        c $C_PLAYER "🧠"
      elif [[ $x -eq $NPCX && $y -eq $NPCY ]]; then
        c $C_NPC "🧑"
      else
        tile "$ch"
      fi
    done
    echo
  done
  echo
  c $C_TEXT "Room: $CURRENT_ROOM · WASD move · E talk · Q quit"
  echo
  [[ -n "$MESSAGE" ]] && c $C_TEXT "💬 $MESSAGE" && echo
}

can_move() {
  [[ "${GRID[$2]:$1:1}" != "⬛" && "${GRID[$2]:$1:1}" != "🌳" ]]
}

handle_door() {
  [[ "${GRID[$PY]:$PX:1}" == "🚪" ]] && \
  [[ "$CURRENT_ROOM" == "outside" ]] && load_room house || load_room outside
}

ai_talk() {
  MESSAGE="$(ollama run "$MODEL" \
    "You are a friendly NPC in BlackRoad Emoji OS. Say one short sentence.")"
}

load_room outside
draw

while true; do
  read -rsn1 key
  MESSAGE=""
  nx=$PX; ny=$PY
  case "$key" in
    w|W) ny=$((PY-1));;
    s|S) ny=$((PY+1));;
    a|A) nx=$((PX-1));;
    d|D) nx=$((PX+1));;
    e|E)
      (( (PX-NPCX)**2 + (PY-NPCY)**2 == 1 )) && ai_talk
      draw; continue;;
    q|Q) clear; exit;;
  esac
  can_move "$nx" "$ny" && PX=$nx PY=$ny && handle_door
  draw
done
