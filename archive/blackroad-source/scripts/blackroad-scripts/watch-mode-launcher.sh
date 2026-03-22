#!/usr/bin/env bash
# Launch watch mode on your top projects in separate terminals
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[WATCH-LAUNCHER]${NC} Setting up watch mode on top projects..."
echo ""

# Define your key projects
PROJECTS=(
  "$HOME/my-awesome-app"
  "$HOME/blackroad-os-api"
  "$HOME/blackroad-os-quantum"
  "$HOME/blackroad-os-infra"
)

echo "Starting watch mode for:"
for proj in "${PROJECTS[@]}"; do
  if [[ -d "$proj" ]]; then
    PROJECT_NAME=$(basename "$proj")
    echo -e "  ${GREEN}✓${NC} $PROJECT_NAME"
    
    # Start watch mode in background
    cd "$proj"
    nohup bash ~/scripts/memory-watch-mode.sh . 60 > ~/.codex/memory/watch-${PROJECT_NAME}.log 2>&1 &
    WATCH_PID=$!
    echo "    └─ PID: $WATCH_PID (log: ~/.codex/memory/watch-${PROJECT_NAME}.log)"
  fi
done

echo ""
echo -e "${GREEN}✅ Watch mode active on ${#PROJECTS[@]} projects!${NC}"
echo ""
echo "Monitor logs:"
echo "  tail -f ~/.codex/memory/watch-*.log"
echo ""
echo "Stop all:"
echo "  pkill -f memory-watch-mode"
