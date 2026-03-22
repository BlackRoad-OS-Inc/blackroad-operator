#!/bin/bash
clear
cat <<'MENU'

  ⚡⚡⚡ ZAPIER 🔗🔗🔗

  📊 1  List Zaps
  🔍 2  Zap History
  ▶️  3  Trigger Webhook
  📋 4  Connected Apps
  🔧 5  NLA (AI Actions) Test
  📊 6  Dashboard Link
  🔑 7  Key Status
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  📊 Zaps: https://zapier.com/app/zaps"; read -p "  ↩ ";;
  2) echo "  🔍 History: https://zapier.com/app/history"; read -p "  ↩ ";;
  3) read -p "  ▶️  Webhook URL: " url; read -p "  JSON payload: " data; curl -s -X POST "$url" -H "Content-Type: application/json" -d "$data" 2>/dev/null && echo "  ✅ Triggered" || echo "  ❌ Failed"; read -p "  ↩ ";;
  4) echo "  📋 Connected: Gmail, Google Drive, Slack, Notion, Stripe"; echo "  Manage: https://zapier.com/app/connections"; read -p "  ↩ ";;
  5) echo "  🔧 Testing NLA..."; curl -s "https://nla.zapier.com/api/v1/exposed/" -H "Authorization: Bearer $ZAPIER_NLA_KEY" 2>/dev/null | jq '.[].description' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  6) echo "  📊 https://zapier.com/app/dashboard"; read -p "  ↩ ";;
  7) echo "  🔑 ZAPIER_NLA_KEY: ${ZAPIER_NLA_KEY:+✅ SET}${ZAPIER_NLA_KEY:-❌ UNSET}"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./zapier.sh
