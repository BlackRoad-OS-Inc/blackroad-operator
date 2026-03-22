#!/bin/bash

MODEL="qwen2.5:0.5b"

ROOM=(
"⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜🧑⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬜⬜⬜⬜⬜⬜⬜⬜⬛"
"⬛⬛⬛⬛🚪⬛⬛⬛⬛⬛"
)

PX=4
PY=4
NPCX=2
NPCY=2
MESSAGE=""

draw() {
  clear
  for y in "${!ROOM[@]}"; do
    row="${ROOM[$y]}"
    line="$row"
    if [[ $y -eq $NPCY ]]; then
      line="${line:0:$NPCX}🧑${line:$((NPCX+1))}"
    fi
    if [[ $y -eq $PY ]]; then
      line="${line:0:$PX}🧠${line:$((PX+1))}"
    fi
    echo "$line"
  done
  echo
  echo "WASD move · E talk · Q quit"
  [[ -n "$MESSAGE" ]] && echo "💬 $MESSAGE"
}

can_move() {
  [[ "$1" -ne "$NPCX" || "$2" -ne "$NPCY" ]] && \
  [[ "${ROOM[$2]:$1:1}" != "⬛" ]]
}

ai_talk() {
  MESSAGE="$(ollama run "$MODEL" "You are an NPC in BlackRoad Emoji OS. Speak in one short sentence. Greet the operator.")"
}

draw
while true; do
  read -rsn1 key
  case "$key" in
    w|W) nx=$PX; ny=$((PY-1));;
    s|S) nx=$PX; ny=$((PY+1));;
    a|A) nx=$((PX-1)); ny=$PY;;
    d|D) nx=$((PX+1)); ny=$PY;;
    e|E)
      if (( (PX-NPCX)*(PX-NPCX) + (PY-NPCY)*(PY-NPCY) == 1 )); then
        ai_talk
      fi
      draw
      continue
      ;;
    q|Q) clear; exit 0;;
    *) continue;;
  esac
  if can_move "$nx" "$ny"; then
    PX=$nx; PY=$ny
  fi
  MESSAGE=""
  draw
done
