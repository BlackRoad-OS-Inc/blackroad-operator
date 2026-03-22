#!/bin/bash
clear
cat <<'MENU'

  📡📡📡 SENSORS 📡📡📡

  🌡️  1  DHT22 (Temp/Humidity)
  📡 2  Radar Module
  🛰️  3  GPS Module
  📏 4  ToF Distance
  🌈 5  Spectral Sensor
  🎤 6  Microphones
  🔍 7  I2C Scan
  📋 8  Sensor Inventory
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  🌡️  DHT22 — Temp & Humidity"
     python3 -c "import Adafruit_DHT; h,t=Adafruit_DHT.read_retry(22,4); print(f'  Temp: {t:.1f}°C  Humidity: {h:.1f}%')" 2>/dev/null || echo "  ⚠️  Not connected or lib missing"; read -p "  ↩ ";;
  2) echo "  📡 Radar: HLK-LD2410 / RCWL-0516"; echo "  Presence/motion detection"; read -p "  ↩ ";;
  3) echo "  🛰️  GPS: reading NMEA..."
     cat /dev/ttyAMA0 2>/dev/null | head -5 || echo "  ⚠️  GPS not connected"; read -p "  ↩ ";;
  4) echo "  📏 ToF (VL53L0X/VL53L1X):"
     python3 -c "import board,adafruit_vl53l0x; i2c=board.I2C(); s=adafruit_vl53l0x.VL53L0X(i2c); print(f'  Distance: {s.range}mm')" 2>/dev/null || echo "  ⚠️  Not connected"; read -p "  ↩ ";;
  5) echo "  🌈 Spectral: AS7341 11-channel"; echo "  Visible + NIR light measurement"; read -p "  ↩ ";;
  6) echo "  🎤 Mics: USB + I2S MEMS"; echo "  Recording test:"; arecord -d 2 -f S16_LE /tmp/mic_test.wav 2>/dev/null && echo "  ✅ Recorded 2s → /tmp/mic_test.wav" || echo "  ⚠️  No mic detected"; read -p "  ↩ ";;
  7) echo "  🔍 I2C Bus Scan:"; i2cdetect -y 1 2>/dev/null || echo "  ⚠️  i2c-tools not installed"; read -p "  ↩ ";;
  8) cat <<'INV'
  📋 Sensor Inventory:
  ─────────────────────
  🌡️  DHT22          Temp/Humidity
  📡 Radar           Presence detect
  🛰️  GPS             NMEA location
  📏 ToF VL53Lx      Distance (mm)
  🌈 AS7341          Spectral 11-ch
  🎤 USB+I2S mics    Audio capture
  📷 Pi Camera V2    8MP IMX219
INV
     read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./sensors.sh
