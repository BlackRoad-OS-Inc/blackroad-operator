#!/bin/bash
# Setup script to run on each Pi - creates local agent access

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
echo -e "${PINK}    🤖 BLACKROAD PI AGENT SETUP 🤖${RESET}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
echo ""

INSTALL_DIR="/home/operator/blackroad-memory-index"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${RESET}"
sudo apt-get update -qq
sudo apt-get install -y jq python3 python3-pip rsync > /dev/null 2>&1

# Create local memory directory
echo -e "${BLUE}📁 Creating local memory structure...${RESET}"
mkdir -p ~/.blackroad/memory/journals
mkdir -p ~/.blackroad/memory/agent-state

# Get hostname for agent identity
HOSTNAME=$(hostname)
echo -e "${GREEN}🏷️  Agent hostname: $HOSTNAME${RESET}"

# Create agent config
cat > ~/.blackroad/memory/agent-config.json << AGENT_EOF
{
  "hostname": "$HOSTNAME",
  "role": "pi-agent",
  "memory_index_path": "$INSTALL_DIR",
  "sync_enabled": true,
  "last_sync": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
AGENT_EOF

# Add to shell profile
if ! grep -q "blackroad-memory-index" ~/.bashrc; then
  echo -e "${BLUE}🔧 Adding to shell profile...${RESET}"
  cat >> ~/.bashrc << 'BASH_EOF'

# BlackRoad Memory Index
export BLACKROAD_MEMORY_INDEX="/home/operator/blackroad-memory-index"
alias memory-query='$BLACKROAD_MEMORY_INDEX/query.sh'
alias memory-entities='$BLACKROAD_MEMORY_INDEX/view-entities.sh'
alias memory-stats='memory-query stats'
alias memory-agents='memory-entities agents'

BASH_EOF
fi

# Create local query wrapper
cat > ~/memory-local-query << 'LOCAL_EOF'
#!/bin/bash
# Local memory query with fallback to upstream

LOCAL_INDEX="/home/operator/blackroad-memory-index"

if [ -d "$LOCAL_INDEX" ]; then
  "$LOCAL_INDEX/query.sh" "$@"
else
  echo "❌ Local memory index not found. Run sync first."
  exit 1
fi
LOCAL_EOF
chmod +x ~/memory-local-query

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}    ✅ PI AGENT SETUP COMPLETE ✅${RESET}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${RESET}"
echo ""
echo -e "${BLUE}Available commands:${RESET}"
echo "  memory-query stats        - Show statistics"
echo "  memory-query agents       - List agents"
echo "  memory-query search <x>   - Search memory"
echo "  memory-entities summary   - View entities"
echo ""
echo -e "${BLUE}Config saved to:${RESET} ~/.blackroad/memory/agent-config.json"
echo ""
echo "Reload shell: source ~/.bashrc"
