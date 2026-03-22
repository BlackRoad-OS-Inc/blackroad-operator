#!/bin/bash
clear
cat <<'MENU'

  🌌🌌🌌 xAI / EVE (GROK) 🌌🌌🌌

  📊 1  Test API Connection
  💬 2  Quick Prompt (Grok)
  📋 3  List Models
  💰 4  Usage
  🔑 5  API Key Status
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
API="https://api.x.ai/v1"
case $c in
  1) echo "  📊 Testing xAI API..."; curl -s "$API/models" -H "Authorization: Bearer $XAI_API_KEY" 2>/dev/null | jq '.data | length' 2>/dev/null && echo " models" || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  2) read -p "  💬 Prompt: " prompt; curl -s "$API/chat/completions" -H "Authorization: Bearer $XAI_API_KEY" -H "Content-Type: application/json" -d "{\"model\":\"grok-2-latest\",\"messages\":[{\"role\":\"user\",\"content\":\"$prompt\"}],\"max_tokens\":500}" 2>/dev/null | jq -r '.choices[0].message.content' 2>/dev/null; read -p "  ↩ ";;
  3) curl -s "$API/models" -H "Authorization: Bearer $XAI_API_KEY" 2>/dev/null | jq -r '.data[].id' 2>/dev/null; read -p "  ↩ ";;
  4) echo "  💰 Check: https://console.x.ai"; read -p "  ↩ ";;
  5) echo "  🔑 XAI_API_KEY: ${XAI_API_KEY:+✅ SET (${XAI_API_KEY:0:8}...)}${XAI_API_KEY:-❌ UNSET}"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./xai.sh
