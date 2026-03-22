#!/bin/bash
clear
cat <<'MENU'

  📻📻📻 LoRa RADIO 📻📻📻

  Heltec WiFi LoRa 32 (ESP32+SX1276)

  📊 1  Device Info
  📡 2  Send Test Packet
  👂 3  Listen Mode
  🔧 4  Set Frequency
  📏 5  RSSI / Signal Check
  ⚡ 6  Flash Firmware
  📋 7  LoRa Parameters
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) cat <<'INFO'
  📻 Heltec WiFi LoRa 32
  ───────────────────────
  MCU:     ESP32 (240MHz dual core)
  LoRa:    SX1276 (868/915MHz)
  Display: 0.96" OLED (SSD1306)
  WiFi:    802.11 b/g/n
  BLE:     4.2
  Flash:   4MB
INFO
     read -p "  ↩ ";;
  2) echo "  📡 Sending test packet via serial..."; echo "TX:BLACKROAD:$(date +%s)" > /dev/ttyUSB0 2>/dev/null && echo "  ✅ Sent" || echo "  ⚠️  Device not connected"; read -p "  ↩ ";;
  3) echo "  👂 Listening (Ctrl+C to stop)..."; cat /dev/ttyUSB0 2>/dev/null || echo "  ⚠️  Device not connected"; read -p "  ↩ ";;
  4) echo "  🔧 Frequencies:"; echo "  US: 915MHz | EU: 868MHz | AS: 433MHz"; echo "  (set in firmware at flash time)"; read -p "  ↩ ";;
  5) echo "  📏 Check serial output for RSSI values"; echo "  Typical: -30dBm (strong) to -120dBm (weak)"; read -p "  ↩ ";;
  6) echo "  ⚡ Use espflash.sh (X) to flash Heltec"; read -p "  ↩ ";;
  7) cat <<'PARAMS'
  📋 LoRa Parameters:
  ────────────────────
  Spreading Factor: SF7-SF12 (higher=slower+longer range)
  Bandwidth:  125/250/500 kHz
  Coding Rate: 4/5 to 4/8
  TX Power:   2-20 dBm
  Range:      ~2km urban, ~15km+ LoS
PARAMS
     read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./lora.sh
