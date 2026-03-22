#!/bin/bash

WIDTH=30
HEIGHT=30

CX=12
CY=10
FRAME=0

clear_screen() {
  printf "\033[H\033[2J"
}

draw_cube() {
  clear_screen
  for ((y=1; y<=HEIGHT; y++)); do
    for ((x=1; x<=WIDTH; x++)); do

      case $FRAME in
        0)
          # front-right
          if (( x>=CX && x<=CX+2 && y>=CY && y<=CY+2 )); then printf "⬜"
          elif (( x>=CX+2 && x<=CX+4 && y>=CY+1 && y<=CY+3 )); then printf "⬛"
          elif (( x>=CX+1 && x<=CX+3 && y>=CY+2 && y<=CY+4 )); then printf "⬛"
          else printf "░"; fi
          ;;
        1)
          # front-left
          if (( x>=CX && x<=CX+2 && y>=CY && y<=CY+2 )); then printf "⬜"
          elif (( x>=CX-2 && x<=CX && y>=CY+1 && y<=CY+3 )); then printf "⬛"
          elif (( x>=CX-1 && x<=CX+1 && y>=CY+2 && y<=CY+4 )); then printf "⬛"
          else printf "░"; fi
          ;;
        2)
          # back-left
          if (( x>=CX && x<=CX+2 && y>=CY && y<=CY+2 )); then printf "⬜"
          elif (( x>=CX-2 && x<=CX && y>=CY-1 && y<=CY+1 )); then printf "⬛"
          elif (( x>=CX-1 && x<=CX+1 && y>=CY-2 && y<=CY )); then printf "⬛"
          else printf "░"; fi
          ;;
        3)
          # back-right
          if (( x>=CX && x<=CX+2 && y>=CY && y<=CY+2 )); then printf "⬜"
          elif (( x>=CX+2 && x<=CX+4 && y>=CY-1 && y<=CY+1 )); then printf "⬛"
          elif (( x>=CX+1 && x<=CX+3 && y>=CY-2 && y<=CY )); then printf "⬛"
          else printf "░"; fi
          ;;
      esac

    done
    echo
  done
  echo "Rotating cube · Q quit"
}

while true; do
  draw_cube
  FRAME=$(( (FRAME+1) % 4 ))
  read -rsn1 -t 0.15 key
  [[ "$key" == "q" ]] && clear && exit 0
done
