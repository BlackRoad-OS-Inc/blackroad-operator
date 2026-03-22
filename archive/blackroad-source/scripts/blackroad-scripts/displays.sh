#!/bin/bash
clear
cat <<'MENU'

  📺📺📺 DISPLAYS 📺📺📺

  🖥️  1  10.1" ROADOM (main)
  📺 2  Waveshare LCD
  🔲 3  OLED Pironman (octavia)
  🔲 4  OLED Pironman (anastasia)
  📺 5  ESP32 2.8" Touchscreens
  🖥️  6  iPad Pro 12.9" (display)
  🔧 7  Test HDMI Output
  🔍 8  xrandr / Display Info
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  🖥️  ROADOM 10.1\" — 1280×800 IPS HDMI"; echo "  Primary workstation display"; read -p "  ↩ ";;
  2) echo "  📺 Waveshare — various sizes"; echo "  SPI/I2C/HDMI depending on model"; read -p "  ↩ ";;
  3) echo "  🔲 Pironman OLED (octavia):"; ssh -o ConnectTimeout=3 pi@192.168.4.74 "ls /dev/i2c-* 2>/dev/null; i2cdetect -y 1 2>/dev/null | grep -E '3c|3d'" || echo "  ⚠️  Offline"; read -p "  ↩ ";;
  4) echo "  ⚠️  anastasia IP TBD"; read -p "  ↩ ";;
  5) echo "  📺 ESP32 2.8\" ILI9341 — 3 units"; echo "  320×240, XPT2046 touch, SPI"; echo "  Flash via espflash.sh"; read -p "  ↩ ";;
  6) echo "  🖥️  iPad Pro 12.9\" — Sidecar / display mode"; read -p "  ↩ ";;
  7) echo "  🔧 Testing HDMI..."; xrandr 2>/dev/null || echo "  (headless / no X)"; read -p "  ↩ ";;
  8) xrandr --query 2>/dev/null || cat /sys/class/drm/*/status 2>/dev/null || echo "  ⚠️  No display info"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./displays.sh
