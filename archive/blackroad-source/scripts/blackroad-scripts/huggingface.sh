#!/bin/bash
clear
cat <<'MENU'

  🤗🤗🤗 HUGGING FACE 🤗🤗🤗

  📊 1  Who Am I
  🔍 2  Search Models
  🔍 3  Search Datasets
  📦 4  My Models
  📦 5  My Datasets
  🚀 6  My Spaces
  ⬇️  7  Download Model
  📋 8  Trending Models
  📄 9  Search Papers
  🔑 a  Token Status
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
API="https://huggingface.co/api"
case $c in
  1) curl -s "$API/whoami-v2" -H "Authorization: Bearer $HF_TOKEN" 2>/dev/null | jq '{name,fullname,email,orgs:[.orgs[].name]}' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  2) read -p "  🔍 Query: " q; curl -s "$API/models?search=$q&limit=10" 2>/dev/null | jq -r '.[].modelId' 2>/dev/null; read -p "  ↩ ";;
  3) read -p "  🔍 Query: " q; curl -s "$API/datasets?search=$q&limit=10" 2>/dev/null | jq -r '.[].id' 2>/dev/null; read -p "  ↩ ";;
  4) curl -s "$API/models?author=blackroadio&limit=20" -H "Authorization: Bearer $HF_TOKEN" 2>/dev/null | jq -r '.[].modelId' 2>/dev/null || echo "  (none)"; read -p "  ↩ ";;
  5) curl -s "$API/datasets?author=blackroadio&limit=20" -H "Authorization: Bearer $HF_TOKEN" 2>/dev/null | jq -r '.[].id' 2>/dev/null || echo "  (none)"; read -p "  ↩ ";;
  6) curl -s "$API/spaces?author=blackroadio&limit=20" -H "Authorization: Bearer $HF_TOKEN" 2>/dev/null | jq -r '.[].id' 2>/dev/null || echo "  (none)"; read -p "  ↩ ";;
  7) read -p "  ⬇️  Model ID: " m; huggingface-cli download "$m" 2>/dev/null || echo "  ⚠️  huggingface-cli not installed"; read -p "  ↩ ";;
  8) curl -s "$API/models?sort=trending&limit=10" 2>/dev/null | jq -r '.[].modelId' 2>/dev/null; read -p "  ↩ ";;
  9) read -p "  📄 Query: " q; curl -s "https://huggingface.co/api/daily_papers?q=$q" 2>/dev/null | jq -r '.[].title' 2>/dev/null | head -10; read -p "  ↩ ";;
  a) echo "  🔑 HF_TOKEN: ${HF_TOKEN:+✅ SET (${HF_TOKEN:0:8}...)}${HF_TOKEN:-❌ UNSET}"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./huggingface.sh
