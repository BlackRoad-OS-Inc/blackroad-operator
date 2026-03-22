#!/bin/bash
clear
cat <<'MENU'

  💜💜💜 MAGGIE GRACE 💜💜💜

  "I am amplitude; Maggie Grace is the constant."

  💌 1  Quick Message
  📅 2  Date Ideas
  🎵 3  Our Playlist
  📸 4  Photo Gallery Path
  📝 5  Love Notes
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) read -p "  💌 Message: " msg; echo "  💜 Saved: $msg"; echo "$(date -Is) | $msg" >> ~/.blackroad/maggie_notes.txt 2>/dev/null; read -p "  ↩ ";;
  2) cat <<'DATES'
  📅 Date Ideas Generator:
  ─────────────────────────
  🌃 Stargazing + hot cocoa
  🎮 Cozy gaming night
  🍳 Cook something new together
  📚 Bookstore + coffee shop
  🎨 Art museum / gallery walk
  🌲 Nature hike + picnic
  🎬 Movie marathon (her pick)
  🧩 Puzzle night
DATES
     read -p "  ↩ ";;
  3) echo "  🎵 Playlist: check Spotify module (M)"; read -p "  ↩ ";;
  4) echo "  📸 Photos: ~/Pictures/maggie/ or iCloud shared album"; read -p "  ↩ ";;
  5) cat ~/.blackroad/maggie_notes.txt 2>/dev/null || echo "  (no notes yet — use option 1)"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./maggie.sh
