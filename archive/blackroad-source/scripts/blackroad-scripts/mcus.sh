#!/bin/bash
clear
cat <<'MENU'

  🔌🔌🔌 MCU FLEET 🔌🔌🔌

  ESP32:
  ⚡ 1  ESP32-S3 SuperMini  (×5)
  ⚡ 2  ESP32-S3 N8R8       (×2)
  📺 3  ESP32 Touchscreen   (×3)
  📻 4  Heltec WiFi LoRa 32
  🔴 5  M5Stack Atom Lite   (×2)
  Other:
  🟢 6  Pico                (×2)
  🟡 7  ATTINY88            (×3)
  🔵 8  ELEGOO UNO R3       (×2)
  🟣 9  WCH CH32V003
  Tools:
  🔍 a  Scan USB Devices
  📡 b  Serial Monitor
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  ⚡ ESP32-S3 SuperMini — 5 units"; echo "  WiFi+BLE, USB-C, tiny form factor"; echo "  Flash: esptool / arduino-cli / platformio"; read -p "  ↩ ";;
  2) echo "  ⚡ ESP32-S3 N8R8 — 2 units"; echo "  8MB PSRAM, 8MB Flash, OTG USB"; read -p "  ↩ ";;
  3) echo "  📺 ESP32 2.8\" Touchscreen — 3 units"; echo "  ILI9341, XPT2046 touch, 320×240"; read -p "  ↩ ";;
  4) echo "  📻 Heltec WiFi LoRa 32"; echo "  ESP32+SX1276, 0.96\" OLED, 868/915MHz"; read -p "  ↩ ";;
  5) echo "  🔴 M5Stack Atom Lite — 2 units"; echo "  ESP32-PICO, button, RGB LED, Grove port"; read -p "  ↩ ";;
  6) echo "  🟢 Raspberry Pi Pico — 2 units"; echo "  RP2040, 264KB SRAM, MicroPython/C"; read -p "  ↩ ";;
  7) echo "  🟡 ATTINY88 — 3 units"; echo "  8-bit AVR, 8KB flash, Arduino compatible"; read -p "  ↩ ";;
  8) echo "  🔵 ELEGOO UNO R3 — 2 kits"; echo "  ATmega328P, full starter kits w/ sensors"; read -p "  ↩ ";;
  9) echo "  🟣 WCH Linke CH32V003"; echo "  RISC-V, 16KB flash, 2KB SRAM, ultra cheap"; read -p "  ↩ ";;
  a) echo "  🔍 USB Devices:"; lsusb 2>/dev/null || echo "  ⚠️  lsusb not found"; read -p "  ↩ ";;
  b) read -p "  📡 Port (e.g. /dev/ttyUSB0): " p; read -p "  Baud (default 115200): " baud; baud=${baud:-115200}; screen "$p" "$baud" 2>/dev/null || minicom -D "$p" -b "$baud" 2>/dev/null || echo "  ⚠️  No serial tool found (screen/minicom)"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./mcus.sh
