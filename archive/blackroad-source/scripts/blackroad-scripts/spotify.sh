#!/bin/bash
clear
cat <<'MENU'

  🎵🎵🎵 AUDIO / SPOTIFY 🎵🎵🎵

  ▶️  1  Now Playing
  ⏭️  2  Next Track
  ⏮️  3  Previous Track
  ⏸️  4  Play/Pause
  🔊 5  Volume
  🔍 6  Search Track
  📋 7  Playlists
  🎧 8  Audio Devices
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) playerctl metadata 2>/dev/null || echo "  ⚠️  No player running (install playerctl)"; read -p "  ↩ ";;
  2) playerctl next 2>/dev/null && echo "  ⏭️  Next" || echo "  ⚠️  No player"; read -p "  ↩ ";;
  3) playerctl previous 2>/dev/null && echo "  ⏮️  Previous" || echo "  ⚠️  No player"; read -p "  ↩ ";;
  4) playerctl play-pause 2>/dev/null && echo "  ⏸️  Toggled" || echo "  ⚠️  No player"; read -p "  ↩ ";;
  5) read -p "  🔊 Volume (0-100): " vol; pactl set-sink-volume @DEFAULT_SINK@ "${vol}%" 2>/dev/null && echo "  ✅ Set to ${vol}%" || amixer set Master "${vol}%" 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  6) echo "  🔍 Spotify search requires API token"; echo "  https://developer.spotify.com/dashboard"; read -p "  ↩ ";;
  7) echo "  📋 Spotify playlists: use app or API"; read -p "  ↩ ";;
  8) echo "  🎧 Audio devices:"; pactl list short sinks 2>/dev/null || aplay -l 2>/dev/null; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./spotify.sh
