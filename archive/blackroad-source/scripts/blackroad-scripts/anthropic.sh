#!/bin/bash
clear
cat <<'MENU'

  🧠🧠🧠 ANTHROPIC / CLAUDE 🧠🧠🧠

  ── API ────────────────────
  📊 1  Test API Connection
  💬 2  Quick Prompt (Sonnet)
  💬 3  Quick Prompt (Opus)
  💬 4  Quick Prompt (Haiku)
  📋 5  List Models
  💰 6  Usage / Billing
  ── CLAUDE CODE ────────────
  🖥️  7  Claude Code Status
  🚀 8  Launch Claude Code
  ── CONFIG ─────────────────
  🔑 9  API Key Status
  📖 a  Pricing Reference
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
API="https://api.anthropic.com/v1"
case $c in
  1) echo "  📊 Testing Anthropic API..."; curl -s "$API/messages" -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" -d '{"model":"claude-sonnet-4-5-20250929","max_tokens":10,"messages":[{"role":"user","content":"ping"}]}' 2>/dev/null | jq -r '.content[0].text // .error.message' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  2) read -p "  💬 Prompt: " prompt; curl -s "$API/messages" -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" -d "{\"model\":\"claude-sonnet-4-5-20250929\",\"max_tokens\":500,\"messages\":[{\"role\":\"user\",\"content\":\"$prompt\"}]}" 2>/dev/null | jq -r '.content[0].text' 2>/dev/null; read -p "  ↩ ";;
  3) read -p "  💬 Prompt: " prompt; curl -s "$API/messages" -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" -d "{\"model\":\"claude-opus-4-6\",\"max_tokens\":500,\"messages\":[{\"role\":\"user\",\"content\":\"$prompt\"}]}" 2>/dev/null | jq -r '.content[0].text' 2>/dev/null; read -p "  ↩ ";;
  4) read -p "  💬 Prompt: " prompt; curl -s "$API/messages" -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" -d "{\"model\":\"claude-haiku-4-5-20251001\",\"max_tokens\":500,\"messages\":[{\"role\":\"user\",\"content\":\"$prompt\"}]}" 2>/dev/null | jq -r '.content[0].text' 2>/dev/null; read -p "  ↩ ";;
  5) echo "  📋 Claude Models:"; echo "  claude-opus-4-6"; echo "  claude-sonnet-4-5-20250929"; echo "  claude-haiku-4-5-20251001"; read -p "  ↩ ";;
  6) echo "  💰 Check: https://console.anthropic.com/settings/billing"; read -p "  ↩ ";;
  7) claude --version 2>/dev/null || echo "  ⚠️  Claude Code not installed"; read -p "  ↩ ";;
  8) claude 2>/dev/null || echo "  ⚠️  Claude Code not installed. npm install -g @anthropic-ai/claude-code"; read -p "  ↩ ";;
  9) echo "  🔑 ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:+✅ SET (${ANTHROPIC_API_KEY:0:8}...)}${ANTHROPIC_API_KEY:-❌ UNSET}"; read -p "  ↩ ";;
  a) cat <<'PRICE'
  📖 Anthropic Pricing (per 1M tokens):
  ──────────────────────────────────────
  Opus 4:    $15 input / $75 output
  Sonnet 4:  $3 input  / $15 output
  Haiku 4:   $0.80 input / $4 output
  (check console for current rates)
PRICE
     read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./anthropic.sh
