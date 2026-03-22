#!/bin/bash
clear
cat <<'M'

  🤖🤖🤖 AGENT HUB 🤖🤖🤖

  👥  1 │ Registry (1000)
  📋  2 │ Capabilities
  🚌  3 │ Event Bus
  📢  4 │ Pub/Sub
  🏠  5 │ Agent Homes
  👤  6 │ Spawn Agent
  🔙  0 │ ← Back

M
read -p "  ⌨️  > " c
case $c in
  1) echo "  👥 1000 reg | 247 active";;
  2) echo "  📋 84 skills indexed";;
  3) echo "  🚌 NATS ✅ | 12.4k msg/s";;
  4) echo "  📢 36 channels | 0 stale";;
  5) echo "  🏠 438/1000 rendered";;
  6) echo "  👤 Spawning..." && sleep 1 && echo "  ✅ Ready";;
  0) exec ./menu.sh;;
esac
read -p "  ↩ "; exec ./agents.sh
