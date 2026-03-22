#!/bin/bash
echo "Block test: 0 ≤ {x,y,z} < 16"
echo ""
for x in -1 0 8 15 16; do
  for y in 0 15; do
    for z in 0 15 16; do
      if (( x >= 0 && x < 16 && y >= 0 && y < 16 && z >= 0 && z < 16 )); then
        r="■"
      else
        r="·"
      fi
      printf "(%2d,%2d,%2d)=%s  " $x $y $z $r
    done
    echo ""
  done
done
