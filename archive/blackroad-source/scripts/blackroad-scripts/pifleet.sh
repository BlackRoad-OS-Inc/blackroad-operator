#!/bin/bash
clear
cat <<'MENU'

  🍓🍓🍓 PI FLEET 🍓🍓🍓

  📊 1  Fleet Status (ping all)
  🖥️  2  alice      Pi 400       192.168.4.49
  🖥️  3  aria       Pi 5 EC      192.168.4.64
  🖥️  4  octavia    Pi 5 PM+H8   192.168.4.74
  🖥️  5  lucidia    Pi 5 EC      192.168.4.38
  🖥️  6  anastasia  Pi 5 PM+H8   ---.---.-.--
  🖥️  7  olympia    Pi 4B PiKVM  ---.---.-.--
  🌡️  8  Fleet Temps
  💾 9  Fleet Disk Usage
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  📊 Pinging fleet..."
     for h in "alice:192.168.4.49" "aria:192.168.4.64" "octavia:192.168.4.74" "lucidia:192.168.4.38"; do
       name="${h%%:*}"; ip="${h##*:}"
       ping -c1 -W1 "$ip" &>/dev/null && echo "  ✅ $name ($ip)" || echo "  ❌ $name ($ip)"
     done; read -p "  ↩ ";;
  2) echo "  🖥️  alice — Pi 400 — Gateway/DNS"; ssh pi@192.168.4.49 "hostname; uptime; vcgencmd measure_temp" 2>/dev/null || echo "  ⚠️  Offline"; read -p "  ↩ ";;
  3) echo "  🖥️  aria — Pi 5 ElectroCookie"; ssh pi@192.168.4.64 "hostname; uptime; vcgencmd measure_temp" 2>/dev/null || echo "  ⚠️  Offline"; read -p "  ↩ ";;
  4) echo "  🖥️  octavia — Pi 5 Pironman+Hailo-8"; ssh pi@192.168.4.74 "hostname; uptime; vcgencmd measure_temp" 2>/dev/null || echo "  ⚠️  Offline"; read -p "  ↩ ";;
  5) echo "  🖥️  lucidia — Pi 5 ElectroCookie"; ssh pi@192.168.4.38 "hostname; uptime; vcgencmd measure_temp" 2>/dev/null || echo "  ⚠️  Offline"; read -p "  ↩ ";;
  6) echo "  ⚠️  anastasia IP TBD"; read -p "  ↩ ";;
  7) echo "  ⚠️  olympia (PiKVM) IP TBD"; read -p "  ↩ ";;
  8) echo "  🌡️  Fleet Temperatures:"
     for h in "alice:192.168.4.49" "aria:192.168.4.64" "octavia:192.168.4.74" "lucidia:192.168.4.38"; do
       name="${h%%:*}"; ip="${h##*:}"
       t=$(ssh -o ConnectTimeout=2 pi@"$ip" "vcgencmd measure_temp" 2>/dev/null) && echo "  $name: $t" || echo "  $name: ⚠️  offline"
     done; read -p "  ↩ ";;
  9) echo "  💾 Fleet Disk:"
     for h in "alice:192.168.4.49" "aria:192.168.4.64" "octavia:192.168.4.74" "lucidia:192.168.4.38"; do
       name="${h%%:*}"; ip="${h##*:}"
       d=$(ssh -o ConnectTimeout=2 pi@"$ip" "df -h / | tail -1 | awk '{print \$3\"/\"\$2\" (\"\$5\")\"}'" 2>/dev/null) && echo "  $name: $d" || echo "  $name: ⚠️  offline"
     done; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./pifleet.sh
