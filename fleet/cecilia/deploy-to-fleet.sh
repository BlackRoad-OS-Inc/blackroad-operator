#!/bin/bash
# Deploy agent army system to all 8 Pi nodes

NODES=(cecilia lucidia alice octavia gematria aria anastasia cadence)
SOURCE_DIR="$HOME/BlackRoad-Private/agent-army"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Deploying Agent Army to Pi Fleet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create local agent-army package if needed
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Source directory not found: $SOURCE_DIR"
    exit 1
fi

for node in "${NODES[@]}"; do
    echo "📦 Deploying to $node..."
    
    # Deploy agent army scripts
    rsync -avz --delete \
        --exclude '.git' \
        --exclude '__pycache__' \
        --exclude '*.pyc' \
        "$SOURCE_DIR/" \
        "blackroad@$node:~/agent-army/"
    
    # Create necessary directories on Pi
    ssh "blackroad@$node" "mkdir -p ~/.blackroad/agent-army ~/.blackroad/agent-tasks ~/.blackroad/agent-comm"
    
    # Copy shared state (task queue)
    rsync -avz \
        "$HOME/.blackroad/agent-tasks/" \
        "blackroad@$node:~/.blackroad/agent-tasks/" 2>/dev/null || true
    
    echo "✅ $node deployed"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Agent Army deployed to all 8 nodes!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
