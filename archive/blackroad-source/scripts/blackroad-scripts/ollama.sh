#!/bin/bash
clear
cat <<'MENU'

  🦙🦙🦙 OLLAMA 🦙🦙🦙

  📋 1  List Models
  💬 2  Chat (interactive)
  ⬇️  3  Pull Model
  🗑️  4  Remove Model
  📊 5  Running Models
  🔧 6  Server Status
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) ollama list 2>/dev/null || echo "  ⚠️  Ollama not running"; read -p "  ↩ ";;
  2) read -p "  💬 Model (e.g. phi3): " m; ollama run "$m" 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  3) read -p "  ⬇️  Model to pull: " m; ollama pull "$m"; read -p "  ↩ ";;
  4) read -p "  🗑️  Model to remove: " m; ollama rm "$m"; read -p "  ↩ ";;
  5) ollama ps 2>/dev/null || echo "  (none running)"; read -p "  ↩ ";;
  6) curl -s http://localhost:11434/api/tags 2>/dev/null | jq '.models[].name' 2>/dev/null && echo "  ✅ Ollama online" || echo "  ❌ Ollama offline"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./ollama.sh
