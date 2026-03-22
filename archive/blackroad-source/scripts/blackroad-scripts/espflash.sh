#!/bin/bash
clear
cat <<'MENU'

  ⚡⚡⚡ ESP FLASH ⚡⚡⚡

  Supports: esptool / arduino-cli / PlatformIO

  🔍 1  Detect ESP Device
  📦 2  esptool — Flash Binary
  🔵 3  arduino-cli — Compile+Upload
  🟣 4  PlatformIO — Build+Upload
  🗑️  5  Erase Flash
  📋 6  Read Flash Info
  📡 7  Serial Monitor
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  🔍 Detecting ESP..."; esptool.py chip_id 2>/dev/null || python3 -m esptool chip_id 2>/dev/null || echo "  ⚠️  No ESP found / esptool missing"; read -p "  ↩ ";;
  2) read -p "  📦 Bin file path: " bin; read -p "  Port (/dev/ttyUSB0): " port; port=${port:-/dev/ttyUSB0}; esptool.py --port "$port" write_flash 0x0 "$bin" 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  3) read -p "  🔵 Sketch dir: " dir; read -p "  Board FQBN: " fqbn; read -p "  Port: " port; port=${port:-/dev/ttyUSB0}; arduino-cli compile --fqbn "$fqbn" "$dir" && arduino-cli upload -p "$port" --fqbn "$fqbn" "$dir" && echo "  ✅ Done" || echo "  ❌ Failed"; read -p "  ↩ ";;
  4) read -p "  🟣 Project dir: " dir; cd "$dir" 2>/dev/null && pio run -t upload && echo "  ✅ Done" || echo "  ❌ Failed"; read -p "  ↩ ";;
  5) read -p "  🗑️  Port (/dev/ttyUSB0): " port; port=${port:-/dev/ttyUSB0}; echo "  Erasing..."; esptool.py --port "$port" erase_flash 2>/dev/null && echo "  ✅ Erased" || echo "  ❌ Failed"; read -p "  ↩ ";;
  6) read -p "  📋 Port: " port; port=${port:-/dev/ttyUSB0}; esptool.py --port "$port" flash_id 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  7) read -p "  📡 Port (/dev/ttyUSB0): " port; port=${port:-/dev/ttyUSB0}; read -p "  Baud (115200): " baud; baud=${baud:-115200}; screen "$port" "$baud" 2>/dev/null || minicom -D "$port" -b "$baud" 2>/dev/null || echo "  ⚠️  No serial tool"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./espflash.sh
