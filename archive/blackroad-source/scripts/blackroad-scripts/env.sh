#!/bin/bash
clear
cat <<'MENU'

  🔐🔐🔐 ENV & SECRETS 🔐🔐🔐

  📋 1  Show All ENV (filtered)
  🔍 2  Search ENV
  ➕ 3  Set Variable (session)
  📁 4  Edit .env File
  🔑 5  API Key Status
  📋 6  Show .bashrc Exports
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) env | grep -viE 'password|secret|token|key|api' | sort | head -40; echo "  (sensitive vars hidden)"; read -p "  ↩ ";;
  2) read -p "  🔍 Search: " q; env | grep -i "$q"; read -p "  ↩ ";;
  3) read -p "  ➕ NAME=value: " nv; export "$nv" && echo "  ✅ Set (session only)" || echo "  ❌ Failed"; read -p "  ↩ ";;
  4) read -p "  📁 .env path (./.env): " f; f=${f:-./.env}; ${EDITOR:-nano} "$f";;
  5) cat <<KEYS
  🔑 API Key Status:
  ────────────────────
  ANTHROPIC_API_KEY:   ${ANTHROPIC_API_KEY:+✅ SET}${ANTHROPIC_API_KEY:-❌ UNSET}
  OPENAI_API_KEY:      ${OPENAI_API_KEY:+✅ SET}${OPENAI_API_KEY:-❌ UNSET}
  XAI_API_KEY:         ${XAI_API_KEY:+✅ SET}${XAI_API_KEY:-❌ UNSET}
  GITHUB_TOKEN:        ${GITHUB_TOKEN:+✅ SET}${GITHUB_TOKEN:-❌ UNSET}
  CF_TOKEN:            ${CF_TOKEN:+✅ SET}${CF_TOKEN:-❌ UNSET}
  CF_ACCT:             ${CF_ACCT:+✅ SET}${CF_ACCT:-❌ UNSET}
  STRIPE_SECRET_KEY:   ${STRIPE_SECRET_KEY:+✅ SET}${STRIPE_SECRET_KEY:-❌ UNSET}
  HF_TOKEN:            ${HF_TOKEN:+✅ SET}${HF_TOKEN:-❌ UNSET}
  RAILWAY_TOKEN:       ${RAILWAY_TOKEN:+✅ SET}${RAILWAY_TOKEN:-❌ UNSET}
  DO_TOKEN:            ${DO_TOKEN:+✅ SET}${DO_TOKEN:-❌ UNSET}
  GOOGLE_API_KEY:      ${GOOGLE_API_KEY:+✅ SET}${GOOGLE_API_KEY:-❌ UNSET}
  ZAPIER_NLA_KEY:      ${ZAPIER_NLA_KEY:+✅ SET}${ZAPIER_NLA_KEY:-❌ UNSET}
KEYS
     read -p "  ↩ ";;
  6) grep "^export" ~/.bashrc 2>/dev/null || echo "  (none)"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./env.sh
