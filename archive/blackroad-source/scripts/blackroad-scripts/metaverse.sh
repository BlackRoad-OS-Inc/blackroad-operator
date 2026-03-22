#!/bin/bash
clear
cat <<'M'

  🎨🎨🎨 METAVERSE 🎨🎨🎨

  🏗️   1 │ World Builder
  🧱  2 │ Asset Library
  🏘️   3 │ Agent Homes
  🌌  4 │ Universe Layer
  🪐  5 │ Lucidia Planet
  🔙  0 │ ← Back

M
read -p "  ⌨️  > " c
case $c in
  1) echo "  🏗️  Builder: READY";;
  2) echo "  🧱 Assets: sprite sheets loaded";;
  3) echo "  🏘️  Homes: 438/1000 built";;
  4) echo "  🌌 Universe physics: ACTIVE";;
  5) echo "  🪐 Lucidia: canonical world online";;
  0) exec ./menu.sh;;
esac
read -p "  ↩ "; exec ./metaverse.sh
