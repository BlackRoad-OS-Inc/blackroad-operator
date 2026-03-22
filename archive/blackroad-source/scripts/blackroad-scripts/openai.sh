#!/bin/bash
clear
cat <<'MENU'

  🤖🤖🤖 OPENAI / CADENCE 🤖🤖🤖

  📊 1  Test API Connection
  💬 2  Quick Prompt (GPT-4o)
  💬 3  Quick Prompt (o1)
  📋 4  List Models
  💰 5  Usage / Billing
  🖼️  6  DALL·E Generate
  🔊 7  Whisper Transcribe
  🗣️  8  TTS Generate
  🔑 9  API Key Status
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
API="https://api.openai.com/v1"
case $c in
  1) echo "  📊 Testing OpenAI API..."; curl -s "$API/models" -H "Authorization: Bearer $OPENAI_API_KEY" 2>/dev/null | jq '.data | length' 2>/dev/null && echo " models available" || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  2) read -p "  💬 Prompt: " prompt; curl -s "$API/chat/completions" -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d "{\"model\":\"gpt-4o\",\"messages\":[{\"role\":\"user\",\"content\":\"$prompt\"}],\"max_tokens\":500}" 2>/dev/null | jq -r '.choices[0].message.content' 2>/dev/null; read -p "  ↩ ";;
  3) read -p "  💬 Prompt: " prompt; curl -s "$API/chat/completions" -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d "{\"model\":\"o1\",\"messages\":[{\"role\":\"user\",\"content\":\"$prompt\"}],\"max_tokens\":500}" 2>/dev/null | jq -r '.choices[0].message.content' 2>/dev/null; read -p "  ↩ ";;
  4) curl -s "$API/models" -H "Authorization: Bearer $OPENAI_API_KEY" 2>/dev/null | jq -r '.data[].id' 2>/dev/null | sort | grep -E 'gpt|o1|dall|whisper|tts' | head -20; read -p "  ↩ ";;
  5) echo "  💰 Check: https://platform.openai.com/usage"; read -p "  ↩ ";;
  6) read -p "  🖼️  Prompt: " prompt; curl -s "$API/images/generations" -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d "{\"model\":\"dall-e-3\",\"prompt\":\"$prompt\",\"n\":1,\"size\":\"1024x1024\"}" 2>/dev/null | jq -r '.data[0].url' 2>/dev/null; read -p "  ↩ ";;
  7) read -p "  🔊 Audio file: " f; curl -s "$API/audio/transcriptions" -H "Authorization: Bearer $OPENAI_API_KEY" -F "model=whisper-1" -F "file=@$f" 2>/dev/null | jq -r '.text' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  8) read -p "  🗣️  Text: " txt; curl -s "$API/audio/speech" -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d "{\"model\":\"tts-1\",\"input\":\"$txt\",\"voice\":\"nova\"}" --output /tmp/tts_out.mp3 2>/dev/null && echo "  ✅ Saved /tmp/tts_out.mp3" || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  9) echo "  🔑 OPENAI_API_KEY: ${OPENAI_API_KEY:+✅ SET (${OPENAI_API_KEY:0:8}...)}${OPENAI_API_KEY:-❌ UNSET}"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./openai.sh
