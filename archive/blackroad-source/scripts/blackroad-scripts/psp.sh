#!/bin/bash
clear
cat <<'MENU'

  🎮🎮🎮 SONY PSP 3000 🎮🎮🎮

  📋 1  Device Info
  🎮 2  Homebrew Launcher
  📂 3  File Manager (USB)
  🌐 4  PSP WiFi Config
  🔧 5  Plugin Manager
  🎵 6  Media Sync
  💾 7  Save Backup
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) cat <<'INFO'
  🎮 Sony PSP-3000
  ───────────────
  CPU: MIPS R4000 333MHz
  RAM: 64MB
  Display: 4.3" 480×272
  WiFi: 802.11b
  Storage: Memory Stick PRO Duo
INFO
     read -p "  ↩ ";;
  2) echo "  🎮 Homebrew: mount PSP via USB first"; echo "  Check /PSP/GAME/ for installed apps"; read -p "  ↩ ";;
  3) echo "  📂 Looking for PSP mount..."; ls /media/*/PSP 2>/dev/null || ls /mnt/psp 2>/dev/null || echo "  ⚠️  PSP not mounted — connect USB"; read -p "  ↩ ";;
  4) echo "  🌐 WiFi config is on-device: Settings → Network"; read -p "  ↩ ";;
  5) echo "  🔧 Plugins in ms0:/seplugins/"; read -p "  ↩ ";;
  6) echo "  🎵 Sync to ms0:/MUSIC/ and ms0:/VIDEO/"; read -p "  ↩ ";;
  7) echo "  💾 Saves in ms0:/PSP/SAVEDATA/"; echo "  Backup:"; cp -rv /media/*/PSP/SAVEDATA ~/.blackroad/psp-saves/ 2>/dev/null || echo "  ⚠️  PSP not mounted"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./psp.sh
