#!/bin/bash
clear
cat <<'MENU'

  🐍🐍🐍 PYTHON + PYTO 🐍🐍🐍

  ── SYSTEM ─────────────────
  📊 1  Python Version
  📦 2  Pip List
  ⬇️  3  Pip Install
  🔍 4  Search PyPI
  📋 5  Requirements Freeze
  🗑️  6  Pip Uninstall
  🏗️  7  Venv Create
  🔄 8  Venv Activate Path
  ── PYTO (iOS) ─────────────
  📱 9  Pyto Cheatsheet
  ── TOOLS ──────────────────
  🧪 a  Run Script
  📊 b  Python REPL
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) python3 --version 2>/dev/null; which python3; read -p "  ↩ ";;
  2) pip3 list 2>/dev/null | head -30; echo "  ..."; pip3 list 2>/dev/null | wc -l; echo " packages total"; read -p "  ↩ ";;
  3) read -p "  ⬇️  Package: " pkg; pip3 install "$pkg" --break-system-packages 2>/dev/null || pip3 install "$pkg"; read -p "  ↩ ";;
  4) read -p "  🔍 Search: " q; pip3 index versions "$q" 2>/dev/null || curl -s "https://pypi.org/pypi/$q/json" | jq -r '.info.summary' 2>/dev/null || echo "  ⚠️  Not found"; read -p "  ↩ ";;
  5) pip3 freeze > requirements.txt && echo "  ✅ Saved requirements.txt ($(wc -l < requirements.txt) packages)" || echo "  ❌ Failed"; read -p "  ↩ ";;
  6) read -p "  🗑️  Package: " pkg; pip3 uninstall "$pkg" -y; read -p "  ↩ ";;
  7) read -p "  🏗️  Venv name: " name; python3 -m venv "$name" && echo "  ✅ Created ./$name" || echo "  ❌ Failed"; read -p "  ↩ ";;
  8) echo "  source ./VENVNAME/bin/activate"; read -p "  ↩ ";;
  9) cat <<'PYTO'
  📱 Pyto — Python 3 on iOS
  ──────────────────────────
  Full Python 3.11+ on iPad Pro
  Supports: numpy, pandas, matplotlib, PIL
  UI: SwiftUI/UIKit widget builder
  Files: ~/Documents/Pyto/
  Shortcuts: Siri + Shortcuts.app integration
  SSH: paramiko for remote Pi scripting
  Tip: Write on iPad → push via Working Copy → pull on Pi
PYTO
     read -p "  ↩ ";;
  a) read -p "  🧪 Script path: " f; python3 "$f"; read -p "  ↩ ";;
  b) python3;;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./pip.sh
