#!/bin/bash
clear
cat <<'MENU'

  🌶️🌶️🌶️  WEB SERVERS 🌶️🌶️🌶️

  🌶️  1  Flask Dev Server
  ⚡ 2  FastAPI / Uvicorn
  🟩 3  Express.js
  🔥 4  Next.js Dev
  📡 5  Nginx Status
  📊 6  Port Scanner (local)
  🔧 7  Kill Port
  🌐 8  Caddy Status
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) read -p "  🌶️  App file (app.py): " f; f=${f:-app.py}; flask run --host=0.0.0.0 --port=5000 2>/dev/null || python3 -m flask run 2>/dev/null || echo "  ⚠️  Flask not installed"; read -p "  ↩ ";;
  2) read -p "  ⚡ App (main:app): " a; a=${a:-main:app}; uvicorn "$a" --host 0.0.0.0 --port 8000 --reload 2>/dev/null || echo "  ⚠️  uvicorn not installed"; read -p "  ↩ ";;
  3) echo "  🟩 Starting Express..."; node server.js 2>/dev/null || node index.js 2>/dev/null || echo "  ⚠️  No server.js/index.js"; read -p "  ↩ ";;
  4) echo "  🔥 Next.js dev..."; npx next dev 2>/dev/null || echo "  ⚠️  Not a Next.js project"; read -p "  ↩ ";;
  5) systemctl status nginx 2>/dev/null || nginx -t 2>/dev/null || echo "  ⚠️  Nginx not installed"; read -p "  ↩ ";;
  6) echo "  📊 Listening ports:"; ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null; read -p "  ↩ ";;
  7) read -p "  🔧 Port to kill: " p; fuser -k "$p"/tcp 2>/dev/null && echo "  ✅ Killed" || echo "  ⚠️  Nothing on port $p"; read -p "  ↩ ";;
  8) systemctl status caddy 2>/dev/null || echo "  ⚠️  Caddy not installed"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./flask.sh
