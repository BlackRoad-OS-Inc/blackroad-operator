#!/bin/bash
clear
cat <<'MENU'

  💳💳💳 STRIPE 💳💳💳

  📊 1  Account Info
  💰 2  Balance
  📋 3  Recent Charges
  👤 4  Customers
  📦 5  Products
  💳 6  Subscriptions
  🔔 7  Webhooks
  📊 8  Dashboard Link
  🔑 9  API Key Status
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
API="https://api.stripe.com/v1"
case $c in
  1) curl -s "$API/account" -u "$STRIPE_SECRET_KEY:" 2>/dev/null | jq '{id,business_type,charges_enabled,country,default_currency}' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  2) curl -s "$API/balance" -u "$STRIPE_SECRET_KEY:" 2>/dev/null | jq '.available[] | "\(.amount/100) \(.currency)"' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  3) curl -s "$API/charges?limit=10" -u "$STRIPE_SECRET_KEY:" 2>/dev/null | jq '.data[] | "\(.amount/100) \(.currency) — \(.status) — \(.description // "no desc")"' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  4) curl -s "$API/customers?limit=10" -u "$STRIPE_SECRET_KEY:" 2>/dev/null | jq '.data[] | "\(.email // .id) — \(.name // "unnamed")"' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  5) curl -s "$API/products?limit=10" -u "$STRIPE_SECRET_KEY:" 2>/dev/null | jq '.data[] | "\(.name) — \(if .active then "active" else "inactive" end)"' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  6) curl -s "$API/subscriptions?limit=10" -u "$STRIPE_SECRET_KEY:" 2>/dev/null | jq '.data[] | "\(.id) — \(.status) — \(.items.data[0].price.unit_amount/100)/\(.items.data[0].price.recurring.interval)"' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  7) curl -s "$API/webhook_endpoints?limit=10" -u "$STRIPE_SECRET_KEY:" 2>/dev/null | jq '.data[] | "\(.url) — \(.status)"' 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  8) echo "  📊 https://dashboard.stripe.com"; read -p "  ↩ ";;
  9) echo "  🔑 STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:+✅ SET (${STRIPE_SECRET_KEY:0:10}...)}${STRIPE_SECRET_KEY:-❌ UNSET}"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./stripe.sh
