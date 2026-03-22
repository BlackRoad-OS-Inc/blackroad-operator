#!/bin/bash
clear
cat <<'MENU'

  📳📳📳 HAPTIC & AUDIO 📳📳📳

  🔊 1  Bone Conduction Test (8Ω)
  🔊 2  Dayton BCE-1 Exciter
  🔊 3  MAX98357A I2S Test (×2)
  📳 4  Vibration Motors (×20)
  🎧 5  Logitech H390 Test
  🔧 6  ALSA Devices
  📊 7  Audio Levels
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  🔊 Bone Conduction — 8Ω transducer"; echo "  Playing test tone..."; speaker-test -t sine -f 440 -l 1 2>/dev/null || echo "  ⚠️  No audio output"; read -p "  ↩ ";;
  2) echo "  🔊 Dayton BCE-1 — surface exciter"; echo "  Turns any surface into a speaker"; echo "  4Ω, 1W, 200Hz-20kHz"; read -p "  ↩ ";;
  3) echo "  🔊 MAX98357A I2S Amp — 2 units"; echo "  3W Class D, I2S input, mono"; echo "  Testing..."; speaker-test -D plughw:1,0 -t sine -f 1000 -l 1 2>/dev/null || echo "  ⚠️  I2S not configured"; read -p "  ↩ ";;
  4) echo "  📳 Mini Vibration Motors — 20 units"; echo "  3V coin/pancake type"; echo "  Drive via GPIO + transistor/MOSFET"; echo "  PWM for variable intensity"; read -p "  ↩ ";;
  5) echo "  🎧 Logitech H390 USB Headset"; arecord -l 2>/dev/null | grep -i logitech || echo "  ⚠️  Not detected"; read -p "  ↩ ";;
  6) echo "  🔧 ALSA Playback:"; aplay -l 2>/dev/null; echo ""; echo "  ALSA Capture:"; arecord -l 2>/dev/null; read -p "  ↩ ";;
  7) echo "  📊 Mixer:"; amixer 2>/dev/null | head -20 || echo "  ⚠️  amixer not found"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./haptic.sh
