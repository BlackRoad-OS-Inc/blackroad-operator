#!/bin/bash
clear
cat <<'MENU'

  ⚙️⚙️⚙️  PROCESSES ⚙️⚙️⚙️

  📊 1  Top 15 by CPU
  💾 2  Top 15 by Memory
  🔍 3  Find Process
  🔪 4  Kill Process
  🌳 5  Process Tree
  📋 6  All Running
  🧟 7  Zombie Processes
  📊 8  Load Average
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) ps aux --sort=-%cpu | head -16; read -p "  ↩ ";;
  2) ps aux --sort=-%mem | head -16; read -p "  ↩ ";;
  3) read -p "  🔍 Name: " name; pgrep -af "$name"; read -p "  ↩ ";;
  4) read -p "  🔪 PID or name: " target; if [[ "$target" =~ ^[0-9]+$ ]]; then kill "$target" && echo "  ✅ Killed PID $target"; else pkill -f "$target" && echo "  ✅ Killed $target"; fi; read -p "  ↩ ";;
  5) pstree -p | head -40; read -p "  ↩ ";;
  6) ps aux | wc -l; echo " processes running"; ps aux | head -30; read -p "  ↩ ";;
  7) ps aux | awk '$8=="Z"' || echo "  ✅ No zombies"; read -p "  ↩ ";;
  8) uptime; echo ""; cat /proc/loadavg; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./process.sh
