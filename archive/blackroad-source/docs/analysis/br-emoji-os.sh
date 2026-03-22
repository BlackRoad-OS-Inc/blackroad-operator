#!/bin/bash
# BlackRoad Emoji OS — v0 Safe Core

# ---------- COLORS (xterm-256) ----------
BR_ORANGE=208
BR_AMBER=202
BR_PINK=198
BR_MAGENTA=163
BR_BLUE=33
BR_WHITE=255

c() { printf "\033[38;5;%sm%s\033[0m" "$1" "$2"; }

# ---------- MAP (ASCII ONLY) ----------
# W = wall, F = floor, D = door
MAP=(
"WWWWWWWWWW"
"WFFFFFFFFW"
"WFFFFFFFFW"
"WFFFFFFFFW"
"WFFFFFFFFW"
"WFFFFFFFFW"
"WFFFFFFFFW"
"WFFFFFFFFW"
"WFFFFFFFFW"
"WWWWDWWWWW"
)

WIDTH=10
HEIGHT=10

PX=4
PY=4

# ---------- TILE RENDER ----------
tile() {
  case "$1" in
    W) printf "⬛";;
    F) printf "⬜";;
    D) printf "🚪";;
    P) printf "🧠";;
    *) printf " ";;
  esac
}

# ---------- DRAW ----------
draw() {
  clear
  echo
  c $BR_ORANGE "⚡ BlackRoad Emoji OS ⚡"
  echo -e "\n"

  for ((y=0; y<HEIGHT; y++)); do
    for ((x=0; x<WIDTH; x++)); do
      if [[ $x -eq $PX && $y -eq $PY ]]; then
        tile P
      else
        tile "${MAP[$y]:$x:1}"
      fi
    done
    echo
  done

  echo
  c $BR_AMBER "WASD move · Q quit"
  echo
}

# ---------- MOVE ----------
can_move() {
  [[ "${MAP[$2]:$1:1}" != "W" ]]
}

# ---------- LOOP ----------
draw
while true; do
  read -rsn1 key
  nx=$PX; ny=$PY

  case "$key" in
    w|W) ny=$((PY-1));;
    s|S) ny=$((PY+1));;
    a|A) nx=$((PX-1));;
    d|D) nx=$((PX+1));;
    q|Q) clear; exit 0;;
    *) continue;;
  esac

  if can_move "$nx" "$ny"; then
    PX=$nx; PY=$ny
  fi

  draw
done
