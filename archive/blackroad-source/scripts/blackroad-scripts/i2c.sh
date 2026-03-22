#!/bin/bash
clear
cat <<'MENU'

  🔌🔌🔌 I2C / GPIO 🔌🔌🔌

  🔍 1  I2C Scan (bus 1)
  🔍 2  I2C Scan (bus 0)
  📋 3  GPIO Readall
  💡 4  GPIO Set Pin
  📖 5  GPIO Read Pin
  🔧 6  I2C Read Register
  📊 7  Known Addresses
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) i2cdetect -y 1 2>/dev/null || echo "  ⚠️  i2c-tools not installed"; read -p "  ↩ ";;
  2) i2cdetect -y 0 2>/dev/null || echo "  ⚠️  Bus 0 not available"; read -p "  ↩ ";;
  3) gpio readall 2>/dev/null || pinctrl 2>/dev/null || echo "  ⚠️  No GPIO tool found"; read -p "  ↩ ";;
  4) read -p "  💡 Pin (BCM): " pin; read -p "  Value (0/1): " val; gpio -g write "$pin" "$val" 2>/dev/null || pinctrl set "$pin" op dl 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  5) read -p "  📖 Pin (BCM): " pin; gpio -g read "$pin" 2>/dev/null || pinctrl get "$pin" 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  6) read -p "  🔧 Addr (hex, e.g. 0x3c): " addr; read -p "  Reg (hex): " reg; i2cget -y 1 "$addr" "$reg" 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  7) cat <<'ADDRS'
  📊 Common I2C Addresses:
  ─────────────────────────
  0x3C/0x3D  SSD1306 OLED
  0x27/0x3F  LCD I2C backpack
  0x29       VL53L0X ToF
  0x39       AS7341 spectral
  0x48       ADS1115 ADC
  0x50       EEPROM
  0x68       MPU6050 / DS3231 RTC
  0x76/0x77  BME280/BMP280
ADDRS
     read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./i2c.sh
