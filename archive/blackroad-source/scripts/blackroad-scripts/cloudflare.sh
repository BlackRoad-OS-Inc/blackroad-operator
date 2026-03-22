#!/bin/bash
clear
cat <<'MENU'

  ☁️☁️☁️  CLOUDFLARE ☁️☁️☁️

  🌐 1  List Zones
  📋 2  DNS Records
  ⚡ 3  Workers List
  🪣 4  R2 Buckets
  🗄️  5  KV Namespaces
  🛡️  6  Firewall Rules
  📊 7  Analytics
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
CF="https://api.cloudflare.com/client/v4"
case $c in
  1) echo "  🌐 Zones:"; curl -sH "Authorization: Bearer $CF_TOKEN" "$CF/zones" 2>/dev/null | jq -r '.result[].name' 2>/dev/null || echo "  ⚠️  Set CF_TOKEN"; read -p "  ↩ ";;
  2) read -p "  📋 Zone ID: " z; curl -sH "Authorization: Bearer $CF_TOKEN" "$CF/zones/$z/dns_records" 2>/dev/null | jq -r '.result[] | "\(.type) \(.name) → \(.content)"' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  3) echo "  ⚡ Workers:"; curl -sH "Authorization: Bearer $CF_TOKEN" "$CF/accounts/$CF_ACCT/workers/scripts" 2>/dev/null | jq -r '.result[].id' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  4) echo "  🪣 R2 Buckets:"; curl -sH "Authorization: Bearer $CF_TOKEN" "$CF/accounts/$CF_ACCT/r2/buckets" 2>/dev/null | jq -r '.result.buckets[].name' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  5) echo "  🗄️  KV:"; curl -sH "Authorization: Bearer $CF_TOKEN" "$CF/accounts/$CF_ACCT/storage/kv/namespaces" 2>/dev/null | jq -r '.result[].title' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  6) echo "  🛡️  Firewall: use dashboard"; read -p "  ↩ ";;
  7) echo "  📊 Analytics: use dashboard"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./cloudflare.sh
