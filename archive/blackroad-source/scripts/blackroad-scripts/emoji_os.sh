#!/bin/bash

WIDTH=30
HEIGHT=30

SCREEN_TOP=3
SCREEN_BOTTOM=9
LINES=6

SCREEN_TEXT=(
  "ollama os v0.3"
  "type: help"
  ""
  ""
  ""
  ""
)

CURSOR=1

clear() { printf "\033[H\033[2J"; }

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
}

push() {
  SCREEN_TEXT=( "${SCREEN_TEXT[@]:1}" "$1" )
}

respond() {
  case "$1" in
    help)
      push "commands: help ls run"
      ;;
    ls)
      push "models/ world/ sys/"
      ;;
    run)
      push "ollama thinking..."
      ;;
    *)
      push "unknown command"
      ;;
  esac
}

while true; do
  draw
  CURSOR=$((1-CURSOR))
  sleep 0.4

  read -rsn1 key || continue

  [[ "$key" == $'\n' ]] && {
    cmd="${SCREEN_TEXT[-1]#> }"
    respond "$cmd"
    SCREEN_TEXT[-1]=""
    continue
  }

  [[ "$key" == $'\177' ]] && {
    SCREEN_TEXT[-1]="${SCREEN_TEXT[-1]%?}"
    continue
  }

  SCREEN_TEXT[-1]+="$key"
done
