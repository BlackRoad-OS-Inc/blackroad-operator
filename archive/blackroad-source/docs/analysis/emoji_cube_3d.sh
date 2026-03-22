#!/bin/bash

WIDTH=30
HEIGHT=30

CX=12
CY=10

draw() {
  clear
  for ((y=1; y<=HEIGHT; y++)); do
    for ((x=1; x<=WIDTH; x++)); do

      # top face
      if (( x>=CX && x<=CX+2 && y>=CY && y<=CY+2 )); then
        printf "⬜"

      # right face (shadow)
      elif (( x>=CX+2 && x<=CX+4 && y>=CY+1 && y<=CY+3 )); then
        printf "⬛"

      # front face (darker)
      elif (( x>=CX+1 && x<=CX+3 && y>=CY+2 && y<=CY+4 )); then
        printf "⬛"

      else
        printf "░"
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
  ((CX>WIDTH-6)) && CX=$((WIDTH-6))
  ((CY>HEIGHT-6)) && CY=$((HEIGHT-6))
done
