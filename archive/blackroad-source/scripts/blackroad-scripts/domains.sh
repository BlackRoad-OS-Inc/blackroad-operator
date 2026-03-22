#!/bin/bash
clear
cat <<'MENU'

  🌍🌍🌍 DOMAINS (19) 🌍🌍🌍

  📋 1  List All Domains
  🔍 2  WHOIS Lookup
  🌐 3  DNS Dig
  📡 4  Check SSL Cert
  🏓 5  Ping Domain
  📊 6  HTTP Status Check
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) cat <<'DOMAINS'
  ⬛ blackboxprogramming.io
  🟥 blackroad.company  blackroad.io  blackroad.me
  🟥 blackroad.network  blackroad.systems
  🟥 blackroadai.com    blackroadinc.us
  🟥 blackroadqi.com    blackroadquantum.com
  🟥 blackroadquantum.info/.net/.shop/.store
  🟥 lucidia.earth      roadchain.io
  🟥 aliceqi.com
DOMAINS
     read -p "  ↩ ";;
  2) read -p "  🔍 Domain: " d; whois "$d" 2>/dev/null | head -30 || echo "  ⚠️  whois not found"; read -p "  ↩ ";;
  3) read -p "  🌐 Domain: " d; dig "$d" +short 2>/dev/null || echo "  ⚠️  dig not found"; read -p "  ↩ ";;
  4) read -p "  📡 Domain: " d; echo | openssl s_client -servername "$d" -connect "$d":443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  5) read -p "  🏓 Domain: " d; ping -c 3 "$d"; read -p "  ↩ ";;
  6) read -p "  📊 Domain: " d; curl -sI "https://$d" | head -5; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./domains.sh
