#!/bin/bash

WIDTH=40
HEIGHT=60   # 👈 change this freely (20, 100, 500, etc.)

border_row() {
  printf "🌳%.0s" $(seq 1 $WIDTH)
  echo
}

floor_row() {
  echo "🌳$(printf "⬜%.0s" $(seq 1 $((WIDTH-2))))🌳"
}

# write world
{
  border_row
  for ((i=1; i<=HEIGHT-2; i++)); do
    floor_row
  done
  border_row
} > ~/world.txt
