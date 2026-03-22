#!/bin/bash
clear
cat <<'MENU'

  📶📶📶 WiFi 📶📶📶

  📊 1  Current Connection
  🔍 2  Scan Networks
  📋 3  Saved Networks
  🔗 4  Connect to Network
  📡 5  Signal Strength
  🌐 6  IP Info
  🏓 7  Speed Test (ping)
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) iwgetid 2>/dev/null || nmcli d wifi show 2>/dev/null || echo "  ⚠️  No WiFi tool"; read -p "  ↩ ";;
  2) sudo iwlist wlan0 scan 2>/dev/null | grep -E "ESSID|Quality" || nmcli d wifi list 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  3) nmcli c show 2>/dev/null || cat /etc/wpa_supplicant/wpa_supplicant.conf 2>/dev/null | grep ssid || echo "  ⚠️  No saved networks found"; read -p "  ↩ ";;
  4) read -p "  🔗 SSID: " ssid; read -p "  Password: " pass; nmcli d wifi connect "$ssid" password "$pass" 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  5) iwconfig wlan0 2>/dev/null | grep -E "Signal|Quality" || echo "  ⚠️  No signal info"; read -p "  ↩ ";;
  6) echo "  🌐 Local:"; ip addr show 2>/dev/null | grep "inet " | head -5; echo ""; echo "  🌍 Public:"; curl -s ifconfig.me 2>/dev/null; echo; read -p "  ↩ ";;
  7) echo "  🏓 Pinging Google DNS..."; ping -c 5 8.8.8.8; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./wifi.sh
