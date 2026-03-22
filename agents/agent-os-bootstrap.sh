#!/bin/bash
# BlackRoad Agent OS Bootstrap
# Initializes the 4-layer agent infrastructure on any node
#
# Layer 1: RoadGate (LLM gateway) + RoadMem (memory) + RoadAgent (framework)
# Layer 2: RoadQuick (JS engine) + RoadPlugin (WASM plugins) + RoadSQL (browser DB)
# Layer 3: RoadLunatic (WASM runtime) + RoadActor (actor model)
# Layer 4: RoadShell (structured CLI) + RoadJust (command runner)

set -e
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

NODE=$(hostname)
echo -e "${PINK}╔════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  BlackRoad Agent OS — Bootstrap             ║${RESET}"
echo -e "${PINK}║  Node: ${NODE}                              ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════╝${RESET}"

# Check what's already running
echo -e "\n${PINK}Layer 1: Agent Infrastructure${RESET}"
echo -n "  Ollama: "; systemctl is-active ollama 2>/dev/null || echo "not running"
echo -n "  NATS: "; systemctl is-active nats-server 2>/dev/null || echo "not running" 
echo -n "  RoundTrip: "; systemctl is-active roundtrip 2>/dev/null || echo "not running"
echo -n "  Memory: "; [ -f /opt/blackroad/agents/memory-system.sh ] && echo "installed" || echo "not installed"

echo -e "\n${PINK}Layer 2: Runtime${RESET}"
echo -n "  Node.js: "; node --version 2>/dev/null || echo "not installed"
echo -n "  Python: "; python3 --version 2>/dev/null || echo "not installed"
echo -n "  Docker: "; docker --version 2>/dev/null | head -1 || echo "not installed"

echo -e "\n${PINK}Layer 3: Services${RESET}"
echo -n "  PostgreSQL: "; systemctl is-active postgresql 2>/dev/null || echo "not running"
echo -n "  Redis: "; systemctl is-active redis-server 2>/dev/null || echo "not running"
echo -n "  Qdrant: "; systemctl is-active qdrant 2>/dev/null || echo "not running"

echo -e "\n${PINK}Layer 4: Fleet${RESET}"
echo -n "  WireGuard: "; systemctl is-active wg-quick@wg0 2>/dev/null || echo "not running"
echo -n "  nginx/Caddy: "; systemctl is-active nginx 2>/dev/null || systemctl is-active caddy 2>/dev/null || echo "not running"

echo -e "\n${GREEN}Agent OS status check complete.${RESET}"
echo -e "Run ${AMBER}br fleet-audit${RESET} for all nodes."
