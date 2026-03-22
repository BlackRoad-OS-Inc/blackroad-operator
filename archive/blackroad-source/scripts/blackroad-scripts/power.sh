#!/bin/bash
clear
cat <<'MENU'

  🔋🔋🔋 POWER 🔋🔋🔋

  ⚡ 1  USB Power Delivery Status
  🔌 2  Pi Voltage Check
  🌡️  3  Throttle Status
  📊 4  Power Draw Estimate
  🔋 5  UPS / Battery Status
  💡 6  GPIO Pin Power
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  ⚡ USB PD:"; lsusb -t 2>/dev/null | head -20 || echo "  ⚠️  lsusb not found"; read -p "  ↩ ";;
  2) echo "  🔌 Voltage:"; vcgencmd measure_volts core 2>/dev/null; vcgencmd measure_volts sdram_c 2>/dev/null || echo "  ⚠️  Not a Pi"; read -p "  ↩ ";;
  3) echo "  🌡️  Throttle flags:"; vcgencmd get_throttled 2>/dev/null || echo "  ⚠️  Not a Pi"; echo "  0x0 = all clear, 0x50005 = throttled"; read -p "  ↩ ";;
  4) echo "  📊 Estimated power:"; echo "  Pi 5: ~5W idle, ~12W load"; echo "  Hailo-8: ~2.5W active"; echo "  NVMe: ~3W per drive"; read -p "  ↩ ";;
  5) echo "  🔋 No UPS detected (future: PiJuice/Waveshare)"; read -p "  ↩ ";;
  6) echo "  💡 GPIO Power Pins:"; echo "  Pin 1,17: 3.3V | Pin 2,4: 5V | Pin 6,9,14,20,25: GND"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./power.sh
