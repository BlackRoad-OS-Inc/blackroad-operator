#!/bin/bash

MAP=~/outside.txt
PLAYER_X=2
PLAYER_Y=2

draw() {
  clear
  cat "$MAP"
  echo
  echo "WASD move · T talk · Q quit"
}

while true; do
  draw
  read -rsn1 key
  case "$key" in
    t|T)
      ./npc-talk.sh ~/abigail.npc "Hi there"
      read -n1 -s
      ;;
    q|Q) exit ;;
  esac
done
