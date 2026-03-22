#!/bin/bash

# terminal size
COLS=80
ROWS=24

# cube vertices
points=(
  "-1 -1 -1" "1 -1 -1" "1 1 -1" "-1 1 -1"
  "-1 -1  1" "1 -1  1" "1 1  1" "-1 1  1"
)

# cube edges (index pairs)
edges=(
  "0 1" "1 2" "2 3" "3 0"
  "4 5" "5 6" "6 7" "7 4"
  "0 4" "1 5" "2 6" "3 7"
)

angle=0
tput civis
trap "tput cnorm; clear" EXIT

while true; do
  clear
  buffer=()

  for p in "${points[@]}"; do
    read x y z <<< "$p"

    # rotate around Y axis
    rx=$(awk -v x=$x -v z=$z -v a=$angle 'BEGIN {print x*cos(a)-z*sin(a)}')
    rz=$(awk -v x=$x -v z=$z -v a=$angle 'BEGIN {print x*sin(a)+z*cos(a)}')
    ry=$y

    # project to 2D
    px=$(awk -v v=$rx 'BEGIN {print int(v*8+40)}')
    py=$(awk -v v=$ry 'BEGIN {print int(v*4+12)}')

    buffer+=("$px $py")
  done

  echo -e "\033[36m"
  for e in "${edges[@]}"; do
    read a b <<< "$e"
    read x1 y1 <<< "${buffer[$a]}"
    read x2 y2 <<< "${buffer[$b]}"
    printf "\033[%d;%dH*\033[%d;%dH*\n" $y1 $x1 $y2 $x2
  done
  echo -e "\033[0m"

  angle=$(awk -v a=$angle 'BEGIN {print a+0.1}')
  sleep 0.05
done
