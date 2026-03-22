#!/bin/bash

BLOCK="⬜"
SIZE=255

clear
for ((y=0; y<SIZE; y++)); do
  line=""
  for ((x=0; x<SIZE; x++)); do
    line+="$BLOCK"
  done
  echo "$line"
done
