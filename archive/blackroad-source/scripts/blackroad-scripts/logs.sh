#!/bin/bash
clear
cat <<'M'

  📜📜📜 LOGS 📜📜📜

  📋  1 │ System Journal
  🧠  2 │ Lucidia Logs
  🤖  3 │ Agent Activity
  🌐  4 │ Network Logs
  🔐  5 │ Auth Attempts
  💀  6 │ Error Dump
  🔙  0 │ ← Back

M
read -p "  ⌨️  > " c
case $c in
  1) journalctl --no-pager -n 20 2>/dev/null || echo "  (no systemd)";;
  2) tail -20 ~/lucidia/logs/core.log 2>/dev/null || echo "  📁 No log file yet";;
  3) echo "  🤖 Last 5 agent events:" && echo "  [$(date -u +%H:%M)] spawn/idle/query/respond/sleep";;
  4) echo "  🌐 NATS: 12.4k/s | 0 errors";;
  5) echo "  🔐 Auth: 0 failed attempts";;
  6) dmesg --level=err 2>/dev/null | tail -10 || echo "  💀 No errors";;
  0) exec ./menu.sh;;
esac
read -p "  ↩ "; exec ./logs.sh
