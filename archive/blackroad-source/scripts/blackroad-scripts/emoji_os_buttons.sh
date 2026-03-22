#!/bin/bash

WIDTH=30
SCREEN_TOP=3
SCREEN_BOTTOM=9
LINES=6

SCREEN_TEXT=(
  "ollama os v0.4"
  "use arrows + enter"
  ""
  ""
  ""
  "> "
)

BUTTONS=("help" "ls" "run")
FOCUS=0
CURSOR=1

clear() { printf "\033[H\033[2J"; }

draw_buttons() {
  local out=""
  for i in "${!BUTTONS[@]}"; do
    if (( i == FOCUS )); then
      out+="🟦[${BUTTONS[$i]}]🟦 "
    else
      out+="⬜ ${BUTTONS[$i]} ⬜ "
    fi
  done
  printf "%-30s\n" "$out"
}

draw() {
  clear
  local i=0
  while read -r row; do
    ((i++))
    if (( i >= SCREEN_TOP && i <= SCREEN_BOTTOM )); then
      local idx=$((i-SCREEN_TOP))
      local text="${SCREEN_TEXT[$idx]}"
      [[ $idx -eq $((LINES-1)) && $CURSOR -eq 1 ]] && text+="▌"
      printf "⬛⬜🟦%-24s🟦⬜⬛\n" "$text"
    else
      echo "$row"
    fi
  done <<'SCREEN'
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦⬜⬛
⬛⬜🟦⬜🙂⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🟦⬜⬛
⬛⬜🟦⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🟦⬜⬛
⬛⬜🟦⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🟦⬜⬛
⬛⬜🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
SCREEN
  draw_buttons
}

push() { SCREEN_TEXT=( "${SCREEN_TEXT[@]:1}" "$1" ); }

respond() {
  case "$1" in
    help) push "commands: help ls run";;
    ls)   push "models/ world/ sys/";;
    run)  push "ollama thinking...";;
  esac
}

while true; do
  draw
  CURSOR=$((1-CURSOR))
  sleep 0.35

  read -rsn1 key || continue
  case "$key" in
    $'\e') read -rsn2 k; [[ $k == "[C" ]] && FOCUS=$(( (FOCUS+1)%${#BUTTONS[@]} ))
           [[ $k == "[D" ]] && FOCUS=$(( (FOCUS-1+${#BUTTONS[@]})%${#BUTTONS[@]} ));;
    $'\n') respond "${BUTTONS[$FOCUS]}";;
  esac
done
