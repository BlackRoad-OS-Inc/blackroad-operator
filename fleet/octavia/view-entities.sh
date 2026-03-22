#!/bin/bash
# View entities with human-readable names

# Detect if running on Pi or Mac
if [ -d "/Users/alexa/BlackRoad-Private/memory-index" ]; then
  INDEX_DIR="/Users/alexa/BlackRoad-Private/memory-index"
else
  INDEX_DIR="$HOME/blackroad-memory-index"
fi

PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
VIOLET='\033[38;5;135m'
RESET='\033[0m'

case "$1" in
  agents)
    echo -e "${PINK}🤖 Agent Entities${RESET}"
    jq -r '.agent[] | "\(.count)\t\(.name)\t(\(.id))"' "$INDEX_DIR/entities-by-category.json" | column -t -s $'\t' | head -30
    ;;
  
  systems)
    echo -e "${BLUE}⚙️  System Entities${RESET}"
    jq -r '.system[] | "\(.count)\t\(.name)"' "$INDEX_DIR/entities-by-category.json" | column -t -s $'\t' | head -30
    ;;
  
  projects)
    echo -e "${GREEN}📦 Project Entities${RESET}"
    jq -r '.project[] | "\(.count)\t\(.name)"' "$INDEX_DIR/entities-by-category.json" | column -t -s $'\t' | head -30
    ;;
  
  services)
    echo -e "${AMBER}🔧 Service Entities${RESET}"
    jq -r '.service[] | "\(.count)\t\(.name)"' "$INDEX_DIR/entities-by-category.json" | column -t -s $'\t' | head -30
    ;;
  
  top)
    echo -e "${PINK}🏆 Top 50 Entities (All Categories)${RESET}"
    jq -r '.[] | "\(.count)\t\(.name)\t[\(.category)]"' "$INDEX_DIR/entities-named.json" | sort -rn | head -50 | column -t -s $'\t'
    ;;
  
  search)
    if [ -z "$2" ]; then
      echo "Usage: $0 search <keyword>"
      exit 1
    fi
    echo -e "${PINK}🔍 Searching entities for: $2${RESET}"
    jq -r ".[] | select(.name | ascii_downcase | contains(\"$2\" | ascii_downcase)) | \"\(.count)\t\(.name)\t[\(.category)]\"" "$INDEX_DIR/entities-named.json" | column -t -s $'\t'
    ;;
  
  summary)
    echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${PINK}         📊 ENTITY SUMMARY WITH REAL NAMES 📊${RESET}"
    echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
    echo ""
    
    total=$(jq 'length' "$INDEX_DIR/entities-named.json")
    agents=$(jq '.agent | length' "$INDEX_DIR/entities-by-category.json")
    systems=$(jq '.system | length' "$INDEX_DIR/entities-by-category.json")
    projects=$(jq '.project | length' "$INDEX_DIR/entities-by-category.json")
    services=$(jq '.service | length' "$INDEX_DIR/entities-by-category.json")
    other=$(jq '.other | length' "$INDEX_DIR/entities-by-category.json")
    
    echo -e "${GREEN}Total Entities:${RESET} $total"
    echo ""
    echo -e "${BLUE}By Category:${RESET}"
    echo -e "  🤖 Agents:     ${GREEN}$agents${RESET}"
    echo -e "  ⚙️  Systems:    ${GREEN}$systems${RESET}"
    echo -e "  📦 Projects:   ${GREEN}$projects${RESET}"
    echo -e "  🔧 Services:   ${GREEN}$services${RESET}"
    echo -e "  📝 Other:      ${GREEN}$other${RESET}"
    echo ""
    echo -e "${VIOLET}Top 10 Most Active Entities:${RESET}"
    jq -r '.[] | "\(.count)\t\(.name)\t[\(.category)]"' "$INDEX_DIR/entities-named.json" | sort -rn | head -10 | nl | sed 's/^/  /' | column -t -s $'\t'
    ;;
  
  *)
    echo -e "${PINK}Entity Viewer - Human-Readable Names${RESET}"
    echo ""
    echo "Usage: $0 <command> [args]"
    echo ""
    echo "Commands:"
    echo "  summary          - Show overview with statistics"
    echo "  agents           - List agent entities"
    echo "  systems          - List system entities"
    echo "  projects         - List project entities"
    echo "  services         - List service entities"
    echo "  top              - Show top 50 entities"
    echo "  search <keyword> - Search entities by name"
    echo ""
    echo "Examples:"
    echo "  $0 summary"
    echo "  $0 agents"
    echo "  $0 search cloudflare"
    ;;
esac
