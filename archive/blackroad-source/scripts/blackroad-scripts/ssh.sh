#!/bin/bash
clear
cat <<'MENU'

  🔌🔌🔌 SSH CONNECT 🔌🔌🔌

  🍓 1  alice     (Pi 400)     192.168.4.49
  🍓 2  aria      (Pi 5 EC)    192.168.4.64
  🍓 3  octavia   (Pi 5 PM)    192.168.4.74
  🍓 4  lucidia   (Pi 5 EC)    192.168.4.38
  🍓 5  anastasia (Pi 5 PM)    ..--.--
  🖥️  6  shellfish (DO)        174.138.44.45
  🔗 7  Tailscale Pi4B         100.95.120.67
  🔗 8  Tailscale lucidia      100.66.235.47
  🧪 9  Custom SSH
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) ssh pi@192.168.4.49;;
  2) ssh pi@192.168.4.64;;
  3) ssh pi@192.168.4.74;;
  4) ssh pi@192.168.4.38;;
  5) echo "  ⚠️  anastasia IP TBD"; read -p "  ↩ ";;
  6) ssh root@174.138.44.45;;
  7) ssh pi@100.95.120.67;;
  8) ssh pi@100.66.235.47;;
  9) read -p "  🧪 user@host: " h; ssh "$h";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./ssh.sh
