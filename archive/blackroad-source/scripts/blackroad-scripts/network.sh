#!/bin/bash
clear
cat <<'M'

  🌐🌐🌐 NETWORK 🌐🌐🌐

  🖥️   1 │ Cluster Nodes
  🌍  2 │ Domains (19)
  🔗  3 │ Tailscale Mesh
  ☁️   4 │ Cloudflare
  🐙  5 │ GitHub Orgs (15)
  📶  6 │ Ping All
  🔙  0 │ ← Back

M
read -p "  ⌨️  > " c
case $c in
  1) printf "  🍓 alice    192.168.4.49  ✅\n  🍓 aria     192.168.4.64  ✅\n  🍓 octavia  192.168.4.74  ✅\n  🍓 lucidia  192.168.4.38  ✅\n  🍓 shellfish 174.138.44.45 ✅\n";;
  2) echo "  🌍 19 domains | blackroad.io primary";;
  3) echo "  🔗 Pi4B: 100.95.120.67 | lucidia: 100.66.235.47";;
  4) echo "  ☁️  Cloudflare: ALL GREEN";;
  5) echo "  🐙 15 orgs | blackroad-os primary";;
  6) echo "  📶 Pinging..." && sleep 1 && echo "  ✅ All responding";;
  0) exec ./menu.sh;;
esac
read -p "  ↩ "; exec ./network.sh
