#!/bin/bash
clear
cat <<'M'

  🔧🔧🔧 HARDWARE 🔧🔧🔧

  🍓  1 │ Pi Fleet
  🧊  2 │ Jetson Orin Nano
  🔌  3 │ MCU Array
  🎤  4 │ Audio/Haptic
  💽  5 │ Storage
  📺  6 │ Displays
  🔙  0 │ ← Back

M
read -p "  ⌨️  > " c
case $c in
  1) printf "  🍓 aria       Pi5  ElectroCookie\n  🍓 octavia    Pi5  Pironman+Hailo\n  🍓 alice      Pi400\n  🍓 anastasia  Pi5  Pironman+Hailo\n  🍓 lucidia    Pi5  ElectroCookie\n  🍓 olympia    Pi4B PiKVM\n";;
  2) echo "  🧊 Jetson Orin Nano: ONLINE";;
  3) echo "  🔌 5x ESP32-S3 | 2x Pico | 3x ATTINY88";;
  4) echo "  🎤 Bone conduction 8Ω | BCE-1 | 2x MAX98357A";;
  5) echo "  💽 P310 1TB+500GB NVMe | Hailo-8 26TOPS x2";;
  6) echo "  📺 10.1\" ROADOM | waveshare | OLEDs";;
  0) exec ./menu.sh;;
esac
read -p "  ↩ "; exec ./hardware.sh
