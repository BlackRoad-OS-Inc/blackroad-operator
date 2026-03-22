#!/bin/bash

MAP=~/world.txt
WIDTH=10
HEIGHT=8

X=4
Y=3

draw() {
  clear
  y=0
  while IFS= read -r line; do
    if [ $y -eq $Y ]; then
      echo "${line:0:$X}🧑${line:$((X+1))}"
    else
      echo "$line"
    fi
    ((y++))
  done < "$MAP"
}

while true; do
  MOVE=$(./npc-brain.sh | tr -d '\r')

  case "$MOVE" in
    up)    ((Y>1)) && ((Y--));;
    down)  ((Y<HEIGHT-2)) && ((Y++));;
    left)  ((X>1)) && ((X--));;
    right) ((X<WIDTH-2)) && ((X++));;
    stay)  ;;
  esac

  draw
  sleep 0.6
done
