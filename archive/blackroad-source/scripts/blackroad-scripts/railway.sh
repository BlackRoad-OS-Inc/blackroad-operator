#!/bin/bash
clear
cat <<'MENU'

  🚂🚂🚂 RAILWAY 🚂🚂🚂

  📊 1  Status
  📦 2  List Projects
  📋 3  Service Logs
  🚀 4  Deploy (railway up)
  🌐 5  Open Dashboard
  🔧 6  Environment Vars
  📡 7  Service Domains
  🔗 8  Link Project
  🔑 9  Auth Status
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) railway status 2>/dev/null || echo "  ⚠️  railway CLI not installed. npm i -g @railway/cli"; read -p "  ↩ ";;
  2) railway list 2>/dev/null || echo "  ⚠️  Not authed"; read -p "  ↩ ";;
  3) railway logs 2>/dev/null || echo "  ⚠️  No project linked"; read -p "  ↩ ";;
  4) echo "  🚀 Deploying..."; railway up 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  5) railway open 2>/dev/null || echo "  📊 https://railway.app/dashboard"; read -p "  ↩ ";;
  6) railway variables 2>/dev/null || echo "  ⚠️  No project linked"; read -p "  ↩ ";;
  7) railway domain 2>/dev/null || echo "  ⚠️  No project linked"; read -p "  ↩ ";;
  8) railway link 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  9) railway whoami 2>/dev/null || echo "  ⚠️  Not logged in. railway login"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./railway.sh
