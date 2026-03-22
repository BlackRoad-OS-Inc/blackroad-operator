#!/usr/bin/env bash
clear

tile() {
  case "$1" in
    G) printf "\033[48;5;34m  " ;;   # grass
    D) printf "\033[48;5;94m  " ;;   # dirt
    R) printf "\033[48;5;250m  " ;;  # road
    W) printf "\033[48;5;27m  " ;;   # water
    S) printf "\033[48;5;117m  " ;;  # sky
    O) printf "\033[48;5;208m  " ;;  # roof
    H) printf "\033[48;5;180m  " ;;  # wall
    P) printf "\033[48;5;130m  " ;;  # path
    *) printf "\033[0m  " ;;
  esac
}

scene=(
"SSSSSSSSSSSSSSSSSSSS"
"SSSSSSSSSSSSSSSSSSSS"
"GGGGGGGGGGGGGGGGGGGG"
"GGGGGGGGRRRRGGGGGGGG"
"GGGGGGGGDHHHDGGGGGGG"
"GGGGGGGGDHOHDGGGGGGG"
"GGGGGGGGDHHHDGGGGGGG"
"GGGGGGGGRRRRGGGGGGGG"
"GGGGGGGGGGGGGGGGGGGG"
"GGGGGGGGGGGGGGGGGGGG"
)

for row in "${scene[@]}"; do
  for ((i=0;i<${#row};i++)); do
    tile "${row:i:1}"
  done
  printf "\033[0m\n"
done
