#!/bin/bash
clear
cat <<'MENU'

  📷📷📷 CAMERA (Pi V2 IMX219) 📷📷📷

  📸 1  Capture Still
  🎬 2  Record Video (10s)
  👁️  3  Preview (libcamera)
  🧿 4  Hailo Object Detection
  📊 5  Camera Info
  🔧 6  Test Modes
  📂 7  Browse Captures
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  📸 Capturing..."; libcamera-still -o /tmp/capture_$(date +%s).jpg 2>/dev/null && echo "  ✅ Saved to /tmp/" || echo "  ⚠️  Camera not found"; read -p "  ↩ ";;
  2) echo "  🎬 Recording 10s..."; libcamera-vid -t 10000 -o /tmp/video_$(date +%s).h264 2>/dev/null && echo "  ✅ Saved" || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  3) echo "  👁️  Preview (5s)..."; libcamera-hello -t 5000 2>/dev/null || echo "  ⚠️  No display / camera"; read -p "  ↩ ";;
  4) echo "  🧿 Running Hailo detection on octavia..."
     ssh -o ConnectTimeout=3 pi@192.168.4.74 "libcamera-still -o /tmp/detect.jpg 2>/dev/null && echo '  📷 Captured, running inference...'" || echo "  ⚠️  octavia offline"; read -p "  ↩ ";;
  5) echo "  📊 Camera Info:"; libcamera-hello --list-cameras 2>/dev/null || echo "  ⚠️  libcamera not found"; read -p "  ↩ ";;
  6) echo "  🔧 Modes:"; echo "  1920×1080 @30fps | 3280×2464 @15fps | 1640×1232 @40fps"; read -p "  ↩ ";;
  7) echo "  📂 Captures:"; ls -lh /tmp/capture_* /tmp/video_* 2>/dev/null || echo "  (none yet)"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./camera.sh
