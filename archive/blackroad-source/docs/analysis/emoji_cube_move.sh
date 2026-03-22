#!/bin/bash

WIDTH=30
HEIGHT=30

CX=12
CY=10

draw() {
  clear
  for ((y=1; y<=HEIGHT; y++)); do
    for ((x=1; x<=WIDTH; x++)); do
      if (( x==CX && y==CY )); then
        printf "⬜"
      elif (( x==CX+1 && y==CY )); then
        printf "⬜"
      elif (( x==CX && y==CY+1 )); then
        printf "⬜"
      elif (( x==CX+1 && y==CY+1 )); then
        printf "⬛"
      else
        printf "⬜"
      fi
    done
    echo
  done
  echo "WASD move · Q quit"
}

while true; do
  draw
  read -rsn1 key
  case "$key" in
    w) ((CY--));;
    s) ((CY++));;
    a) ((CX--));;
    d) ((CX++));;
    q) clear; exit 0;;
  esac

  ((CX<2)) && CX=2
  ((CY<2)) && CY=2
  ((CX>WIDTH-2)) && CX=$((WIDTH-2))
  ((CY>HEIGHT-2)) && CY=$((HEIGHT-2))
done
