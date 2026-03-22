#!/bin/bash
# Quick memory index query tool
# Usage: ./query.sh <command> [args]

set -e

# Detect if running on Pi or Mac
if [ -d "/Users/alexa/BlackRoad-Private/memory-index" ]; then
  INDEX_DIR="/Users/alexa/BlackRoad-Private/memory-index"
else
  INDEX_DIR="$HOME/blackroad-memory-index"
fi
MEMORY_DIR="$HOME/.blackroad/memory/journals"

PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

case "$1" in
  actions)
    echo -e "${PINK}📊 Top Actions${RESET}"
    jq -r '.[] | "\(.count)\t\(.action)"' "$INDEX_DIR/actions-index.json" | head -20 | column -t
    ;;
    
  entities)
    echo -e "${PINK}👥 Top Entities${RESET}"
    jq -r '.[] | "\(.count)\t\(.entity)"' "$INDEX_DIR/entities-index.json" | head -20 | column -t
    ;;
    
  agents)
    echo -e "${PINK}🤖 Agent Profiles${RESET}"
    jq -r '.[] | "\(.total_actions)\t\(.entity)"' "$INDEX_DIR/agent-profiles.json" | head -20 | column -t
    ;;
    
  timeline)
    echo -e "${PINK}⏰ Recent Timeline${RESET}"
    jq -r '.[] | "\(.timestamp | split("T")[0])\t\(.action)\t\(.entity)"' "$INDEX_DIR/timeline-index.json" | head -30 | column -t
    ;;
    
  agent)
    if [ -z "$2" ]; then
      echo "Usage: $0 agent <agent-name>"
      exit 1
    fi
    echo -e "${PINK}🔍 Agent: $2${RESET}"
    jq ".[] | select(.entity | contains(\"$2\"))" "$INDEX_DIR/agent-profiles.json"
    ;;
    
  action)
    if [ -z "$2" ]; then
      echo "Usage: $0 action <action-type>"
      exit 1
    fi
    echo -e "${PINK}🔍 Action: $2${RESET}"
    grep "\"action\":\"$2\"" "$MEMORY_DIR"/*.jsonl | tail -20 | jq -r '{timestamp, entity, details}'
    ;;
    
  search)
    if [ -z "$2" ]; then
      echo "Usage: $0 search <keyword>"
      exit 1
    fi
    echo -e "${PINK}🔍 Searching for: $2${RESET}"
    grep -i "$2" "$MEMORY_DIR"/*.jsonl | tail -20 | jq -r '{timestamp, action, entity, details}'
    ;;
    
  stats)
    echo -e "${PINK}📈 Memory System Statistics${RESET}"
    echo ""
    total=$(cat "$MEMORY_DIR"/*.jsonl 2>/dev/null | wc -l | tr -d ' ')
    echo -e "Total entries:     ${GREEN}$total${RESET}"
    
    actions=$(jq length "$INDEX_DIR/actions-index.json")
    echo -e "Unique actions:    ${GREEN}$actions${RESET}"
    
    entities=$(jq length "$INDEX_DIR/entities-index.json")
    echo -e "Unique entities:   ${GREEN}$entities${RESET}"
    
    agents=$(jq length "$INDEX_DIR/agent-profiles.json")
    echo -e "Agent profiles:    ${GREEN}$agents${RESET}"
    
    echo ""
    echo -e "${BLUE}Top 5 Actions:${RESET}"
    jq -r '.[0:5] | .[] | "  • \(.action): \(.count)"' "$INDEX_DIR/actions-index.json"
    
    echo ""
    echo -e "${BLUE}Most Active Agents:${RESET}"
    jq -r '.[0:5] | .[] | "  • \(.entity): \(.total_actions) actions"' "$INDEX_DIR/agent-profiles.json"
    ;;
    
  rebuild)
    echo -e "${AMBER}🔄 Rebuilding indexes...${RESET}"
    python3 "$INDEX_DIR/build-indexes.py"
    ;;
    
  *)
    echo -e "${PINK}BlackRoad Memory Index Query Tool${RESET}"
    echo ""
    echo "Usage: $0 <command> [args]"
    echo ""
    echo "Commands:"
    echo "  actions          - List top actions"
    echo "  entities         - List top entities"
    echo "  agents           - List agent profiles"
    echo "  timeline         - Show recent timeline"
    echo "  agent <name>     - Show specific agent profile"
    echo "  action <type>    - Show recent actions of type"
    echo "  search <keyword> - Search memory entries"
    echo "  stats            - Show overall statistics"
    echo "  rebuild          - Rebuild all indexes"
    echo ""
    echo "Examples:"
    echo "  $0 stats"
    echo "  $0 agent erebus"
    echo "  $0 action deployed"
    echo "  $0 search cloudflare"
    ;;
esac
