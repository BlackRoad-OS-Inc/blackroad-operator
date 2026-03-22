#!/bin/bash
clear
cat <<'MENU'

  🌐🌐🌐 DNS TOOLS 🌐🌐🌐

  🔍 1  Dig A Record
  📧 2  Dig MX Record
  📝 3  Dig TXT Record
  🔗 4  Dig CNAME
  📋 5  Dig NS
  🌍 6  Reverse Lookup
  ⚡ 7  DNS Propagation Check
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) read -p "  🔍 Domain: " d; dig "$d" A +short; read -p "  ↩ ";;
  2) read -p "  📧 Domain: " d; dig "$d" MX +short; read -p "  ↩ ";;
  3) read -p "  📝 Domain: " d; dig "$d" TXT +short; read -p "  ↩ ";;
  4) read -p "  🔗 Domain: " d; dig "$d" CNAME +short; read -p "  ↩ ";;
  5) read -p "  📋 Domain: " d; dig "$d" NS +short; read -p "  ↩ ";;
  6) read -p "  🌍 IP: " ip; dig -x "$ip" +short; read -p "  ↩ ";;
  7) read -p "  ⚡ Domain: " d; for ns in 8.8.8.8 1.1.1.1 9.9.9.9; do echo "  $ns →"; dig @"$ns" "$d" +short; done; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./dns.sh
