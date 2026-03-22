#!/bin/bash
source ~/npcs.sh

WIDTH=60
HEIGHT=25

declare -A X Y EMOJI

for n in "${NPCS[@]}"; do
  IFS=: read name emoji x y <<< "$n"
  X[$name]=$x
  Y[$name]=$y
  EMOJI[$name]=$emoji
done

draw() {
  clear
  y=0
  while IFS= read -r line; do
    row="$line"
    for name in "${!X[@]}"; do
      if [ "${Y[$name]}" -eq "$y" ]; then
        x=${X[$name]}
        row="${row:0:$x}${EMOJI[$name]}${row:$((x+1))}"
      fi
    done
    echo "$row"
    ((y++))
  done < ~/world.txt
}

npc_move() {
  ollama run qwen2.5:0.5b "
You are a character in a cozy farming game.
Reply with exactly ONE word:
up
down
left
right
stay
"
}

while true; do
  for name in "${!X[@]}"; do
    MOVE=$(npc_move | tr -d '\r')

    case "$MOVE" in
      up)    ((Y[$name]>1)) && ((Y[$name]--));;
      down)  ((Y[$name]<HEIGHT-2)) && ((Y[$name]++));;
      left)  ((X[$name]>1)) && ((X[$name]--));;
      right) ((X[$name]<WIDTH-2)) && ((X[$name]++));;
    esac
  done

  draw
  sleep 0.6
done
