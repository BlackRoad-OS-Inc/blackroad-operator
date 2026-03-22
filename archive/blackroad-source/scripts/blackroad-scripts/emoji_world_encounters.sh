#!/bin/bash

WORLD=~/world.txt
WIDTH=30
HEIGHT=30

PX=15
PY=15

NPC_X=(8 22)
NPC_Y=(10 18)

DIALOGUE=(
  "Hey! This world is still loading."
  "One day this will be 3D."
  "Ollama watches everything."
  "This feels like Pokémon, right?"
)

ENCOUNTERS=(
  "A wild 🐍 appears!"
  "A wild 🐢 blocks your path!"
  "A wild 🐦 swoops down!"
  "A wild 🐺 growls..."
)

mapfile -t MAP < "$WORLD"

clear_screen() { printf "\033[H\033[2J"; }

type_text() {
  local t="$1"
  for ((i=0;i<${#t};i++)); do
    printf "%s" "${t:$i:1}"
    sleep 0.03
  done
  echo
}

tile_at() {
  echo "${MAP[$(( $2-1 ))]:$(( ($1-1)*2 )):2}"
}

is_blocked() {
  case "$(tile_at "$1" "$2")" in
    🌳|🪨|🟦|🏠) return 0;;
    *) return 1;;
  esac
}

draw() {
  clear_screen
  for ((y=1;y<=HEIGHT;y++)); do
    line="${MAP[$((y-1))]}"
    for i in "${!NPC_X[@]}"; do
      [[ ${NPC_Y[$i]} -eq $y ]] && {
        p=$(( (NPC_X[$i]-1)*2 ))
        line="${line:0:$p}🧑${line:$((p+2))}"
      }
    done
    [[ $y -eq $PY ]] && {
      p=$(( (PX-1)*2 ))
      line="${line:0:$p}🙂${line:$((p+2))}"
    }
    echo "$line"
  done
  echo "WASD move · E talk · Q quit"
}

npc_move() {
  for i in "${!NPC_X[@]}"; do
    nx=${NPC_X[$i]}
    ny=${NPC_Y[$i]}
    case $((RANDOM%4)) in
      0) ((nx++));;
      1) ((nx--));;
      2) ((ny++));;
      3) ((ny--));;
    esac
    ((nx<1||ny<1||nx>WIDTH||ny>HEIGHT)) && continue
    is_blocked "$nx" "$ny" || { NPC_X[$i]=$nx; NPC_Y[$i]=$ny; }
  done
}

talk() {
  for i in "${!NPC_X[@]}"; do
    dx=$((NPC_X[$i]-PX))
    dy=$((NPC_Y[$i]-PY))
    (( dx*dx + dy*dy <= 1 )) && {
      clear_screen
      type_text "${DIALOGUE[$((RANDOM%${#DIALOGUE[@]}))]}"
      sleep 1
      return
    }
  done
}

encounter_check() {
  [[ "$(tile_at "$PX" "$PY")" == "🌾" ]] || return
  (( RANDOM % 6 == 0 )) || return
  clear_screen
  type_text "${ENCOUNTERS[$((RANDOM%${#ENCOUNTERS[@]}))]}"
  sleep 1.5
}

while true; do
  draw
  read -rsn1 key

  NX=$PX; NY=$PY
  case "$key" in
    w) ((NY--));;
    s) ((NY++));;
    a) ((NX--));;
    d) ((NX++));;
    e) talk;;
    q) clear; exit 0;;
  esac

  ((NX<1)) && NX=1
  ((NY<1)) && NY=1
  ((NX>WIDTH)) && NX=$WIDTH
  ((NY>HEIGHT)) && NY=$HEIGHT

  is_blocked "$NX" "$NY" || { PX=$NX; PY=$NY; encounter_check; }

  npc_move
done
