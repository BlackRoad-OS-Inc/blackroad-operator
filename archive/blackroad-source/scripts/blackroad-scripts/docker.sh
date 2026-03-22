#!/bin/bash
clear
cat <<'MENU'

  🐳🐳🐳 DOCKER 🐳🐳🐳

  📦 1  Running Containers
  🖼️  2  Images
  🌐 3  Networks
  💽 4  Volumes
  🔄 5  Restart Container
  🗑️  6  Prune All
  📊 7  Stats (live)
  📋 8  Compose Up
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  ⚠️  Docker not running"; read -p "  ↩ ";;
  2) docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>/dev/null; read -p "  ↩ ";;
  3) docker network ls 2>/dev/null; read -p "  ↩ ";;
  4) docker volume ls 2>/dev/null; read -p "  ↩ ";;
  5) read -p "  🔄 Container: " cn; docker restart "$cn" && echo "  ✅ Restarted" || echo "  ❌ Failed"; read -p "  ↩ ";;
  6) echo "  🗑️  Pruning..."; docker system prune -f 2>/dev/null; read -p "  ↩ ";;
  7) docker stats --no-stream 2>/dev/null; read -p "  ↩ ";;
  8) read -p "  📋 Compose dir: " d; cd "$d" && docker compose up -d 2>/dev/null || echo "  ❌ Failed"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./docker.sh
