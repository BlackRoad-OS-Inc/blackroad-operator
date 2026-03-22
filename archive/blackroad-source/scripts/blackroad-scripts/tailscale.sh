#!/bin/bash
clear
cat <<'MENU'

  🔗🔗🔗 TAILSCALE 🔗🔗🔗

  📊 1  Status
  📋 2  Peer List
  🏓 3  Ping Peer
  🌐 4  IP Info
  🔌 5  Connect / Up
  ⏹️  6  Disconnect / Down
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) tailscale status 2>/dev/null || echo "  ⚠️  Tailscale not running"; read -p "  ↩ ";;
  2) tailscale status --peers 2>/dev/null; read -p "  ↩ ";;
  3) read -p "  🏓 Peer name/IP: " p; tailscale ping "$p" 2>/dev/null; read -p "  ↩ ";;
  4) tailscale ip -4 2>/dev/null; tailscale ip -6 2>/dev/null; read -p "  ↩ ";;
  5) sudo tailscale up 2>/dev/null && echo "  ✅ Connected" || echo "  ❌ Failed"; read -p "  ↩ ";;
  6) sudo tailscale down 2>/dev/null && echo "  ⏹️  Disconnected"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./tailscale.sh
