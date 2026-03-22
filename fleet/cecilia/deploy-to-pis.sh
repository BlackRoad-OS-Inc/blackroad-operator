#!/bin/bash
# Deploy memory index to all Raspberry Pi nodes

set -e

PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RED='\033[38;5;196m'
RESET='\033[0m'

SOURCE_DIR="/Users/alexa/BlackRoad-Private/memory-index"
REMOTE_DIR="~/blackroad-memory-index"

# List of Pi nodes (all reachable nodes in the fleet)
NODES=(
  "cecilia"
  "lucidia" 
  "alice"
  "octavia"
  "gematria"
  "aria"
  "anastasia"
  "cadence"
  "alexandria"
)

echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
echo -e "${PINK}    🚀 DEPLOYING MEMORY INDEX TO RASPBERRY PI FLEET 🚀${RESET}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
echo ""

# Build fresh indexes first
echo -e "${BLUE}📊 Building fresh indexes...${RESET}"
cd "$SOURCE_DIR"
python3 build-indexes.py
python3 resolve-entity-names.py
echo ""

# Deploy to each node
for node in "${NODES[@]}"; do
  echo -e "${AMBER}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${AMBER}📡 Deploying to: $node${RESET}"
  echo -e "${AMBER}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  
  # Check if node is reachable
  if ! ssh -o ConnectTimeout=5 "$node" "echo 'connected' > /dev/null 2>&1"; then
    echo -e "${RED}❌ Cannot reach $node - skipping${RESET}"
    echo ""
    continue
  fi
  
  # Create directory on remote
  echo "  📁 Creating remote directory..."
  ssh "$node" "mkdir -p $REMOTE_DIR"
  
  # Sync memory index files
  echo "  📤 Syncing index files..."
  rsync -avz --progress \
    --exclude='.git' \
    --exclude='__pycache__' \
    "$SOURCE_DIR/" "$node:$REMOTE_DIR/"
  
  # Also sync raw memory journals
  echo "  📤 Syncing memory journals..."
  ssh "$node" "mkdir -p ~/.blackroad/memory/journals"
  rsync -avz --progress \
    ~/.blackroad/memory/journals/*.jsonl \
    "$node:~/.blackroad/memory/journals/" || echo "  ⚠️  No journals to sync"
  
  # Make scripts executable
  echo "  🔧 Setting permissions..."
  ssh "$node" "chmod +x $REMOTE_DIR/*.sh $REMOTE_DIR/*.py"
  
  # Create symlink for easy access
  echo "  🔗 Creating symlink..."
  ssh "$node" "ln -sf $REMOTE_DIR/query.sh ~/memory-query && chmod +x ~/memory-query" || true
  ssh "$node" "ln -sf $REMOTE_DIR/view-entities.sh ~/memory-entities && chmod +x ~/memory-entities" || true
  
  # Test the deployment
  echo "  ✅ Testing deployment..."
  ssh "$node" "$REMOTE_DIR/query.sh stats" > /dev/null 2>&1 && \
    echo -e "  ${GREEN}✓ Deployment successful!${RESET}" || \
    echo -e "  ${RED}✗ Deployment test failed${RESET}"
  
  echo ""
done

echo -e "${GREEN}════════════════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}    ✅ MEMORY INDEX DEPLOYED TO ALL REACHABLE NODES ✅${RESET}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${RESET}"
echo ""
echo -e "${BLUE}Usage on Pis:${RESET}"
echo "  memory-query stats              # Show statistics"
echo "  memory-query agents             # List agents"
echo "  memory-query search <keyword>   # Search memory"
echo "  memory-entities summary         # View named entities"
echo "  memory-entities agents          # List agent entities"
echo ""
echo -e "${AMBER}Full path:${RESET} $REMOTE_DIR/"
