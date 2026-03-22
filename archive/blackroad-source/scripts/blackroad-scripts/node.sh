#!/bin/bash
clear
cat <<'MENU'

  🟩🟩🟩 NODE.JS 🟩🟩🟩

  📊 1  Node / NPM Versions
  📦 2  Global Packages
  ⬇️  3  NPM Install (global)
  🏗️  4  NPM Init Project
  🔄 5  NPM Install (local)
  🚀 6  NPM Run Script
  📋 7  Package.json Scripts
  🔍 8  NPM Search
  🗑️  9  NPM Prune
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) node --version 2>/dev/null; npm --version 2>/dev/null; which node; read -p "  ↩ ";;
  2) npm list -g --depth=0 2>/dev/null; read -p "  ↩ ";;
  3) read -p "  ⬇️  Package: " pkg; npm install -g "$pkg" && echo "  ✅ Installed" || echo "  ❌ Failed"; read -p "  ↩ ";;
  4) npm init -y && echo "  ✅ package.json created"; read -p "  ↩ ";;
  5) npm install && echo "  ✅ Dependencies installed"; read -p "  ↩ ";;
  6) read -p "  🚀 Script name: " s; npm run "$s"; read -p "  ↩ ";;
  7) cat package.json 2>/dev/null | jq '.scripts' 2>/dev/null || echo "  ⚠️  No package.json"; read -p "  ↩ ";;
  8) read -p "  🔍 Search: " q; npm search "$q" 2>/dev/null | head -10; read -p "  ↩ ";;
  9) npm prune && echo "  ✅ Pruned"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./node.sh
