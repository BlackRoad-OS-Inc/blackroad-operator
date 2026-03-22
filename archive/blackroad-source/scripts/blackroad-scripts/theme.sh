#!/bin/bash
clear
cat <<'MENU'

  🎨🎨🎨 THEME 🎨🎨🎨

  🖤 1  BlackRoad Dark (default)
  ❤️  2  BlackRoad Red
  🧠 3  Lucidia Blue
  🌿 4  Matrix Green
  ☀️  5  Light Mode
  📊 6  Current Theme
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
THEME_FILE="$HOME/.blackroad/theme"
mkdir -p "$HOME/.blackroad"
case $c in
  1) echo "dark" > "$THEME_FILE"; echo "  🖤 Theme: BlackRoad Dark"; read -p "  ↩ ";;
  2) echo "red" > "$THEME_FILE"; echo "  ❤️  Theme: BlackRoad Red"; read -p "  ↩ ";;
  3) echo "blue" > "$THEME_FILE"; echo "  🧠 Theme: Lucidia Blue"; read -p "  ↩ ";;
  4) echo "green" > "$THEME_FILE"; echo "  🌿 Theme: Matrix Green"; read -p "  ↩ ";;
  5) echo "light" > "$THEME_FILE"; echo "  ☀️  Theme: Light Mode"; read -p "  ↩ ";;
  6) echo "  📊 Current: $(cat "$THEME_FILE" 2>/dev/null || echo 'dark (default)')"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./theme.sh
