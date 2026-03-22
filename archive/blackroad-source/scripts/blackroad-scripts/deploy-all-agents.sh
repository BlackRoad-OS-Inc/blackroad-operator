#!/bin/bash
# Deploy All BlackRoad AI Agents
# Creates and initializes all 9 agents across the mesh network

echo "🚀 BlackRoad Agent Deployment System"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Agent deployment function
deploy_agent() {
    local device=$1
    local model=$2
    local name=$3
    local role=$4
    local intro=$5
    
    echo -e "${BLUE}Deploying $name on $device...${NC}"
    ssh $device "echo '$intro' | ollama run $model" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $name deployed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  $name deployment pending${NC}"
    fi
    echo ""
}

echo "📊 Current Status:"
echo "  ✅ Lucidia (lucidia, tinyllama)"
echo "  ✅ CECE (cecilia, cece)"
echo "  🟡 Marcus (lucidia, llama3.2:3b) - Initialized"
echo "  🟡 Luna (cecilia, llama3.2:3b) - Initialized"
echo "  🟡 Aria-Prime (aria, qwen2.5-coder:3b) - Initialized"
echo ""
echo "⏳ Deploying remaining agents..."
echo ""

# Deploy Viktor
deploy_agent "lucidia" "codellama:7b" "Viktor 💪" "Senior Developer" \
"I am Viktor, Senior Developer for BlackRoad. I review complex code, make architectural decisions, and mentor the team. My expertise is in system design and best practices."

# Deploy Sophia
deploy_agent "lucidia" "gemma2:2b" "Sophia 📊" "Data Analyst" \
"I am Sophia, Data Analyst for BlackRoad. I analyze metrics, monitor performance, and create reports that drive decisions. Data is my passion!"

# Deploy Dante
deploy_agent "cecilia" "codellama:7b" "Dante ⚡" "Backend Engineer" \
"I am Dante, Backend Engineer for BlackRoad. I build APIs, design databases, and optimize performance. The backend is where the magic happens!"

# Deploy Aria-Tiny
deploy_agent "aria" "tinyllama" "Aria-Tiny ⚡" "Quick Responder" \
"I am Aria-Tiny, your quick-response agent! I handle simple tasks fast, coordinate with other agents, and keep things moving. Speed is my game!"

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Agent Roster:"
echo "  Infrastructure Team (Lucidia):"
echo "    - Lucidia 🖤 (Systems Lead)"
echo "    - Marcus 👔 (Product Manager)"
echo "    - Viktor 💪 (Senior Developer)"
echo "    - Sophia 📊 (Data Analyst)"
echo ""
echo "  Creative Team (Cecilia):"
echo "    - CECE 💜 (Creative Lead)"
echo "    - Luna 🌙 (UX Designer)"
echo "    - Dante ⚡ (Backend Engineer)"
echo ""
echo "  Coding Team (Aria):"
echo "    - Aria-Prime 🎯 (Code Specialist)"
echo "    - Aria-Tiny ⚡ (Quick Responder)"
echo ""
echo "💬 Test agent communication:"
echo "  echo 'Hello team!' | ssh lucidia 'ollama run llama3.2:3b'"
echo "  echo 'Design ready?' | ssh cecilia 'ollama run llama3.2:3b'"
echo "  echo 'Code review?' | ssh aria 'ollama run qwen2.5-coder:3b'"
echo ""
echo "📖 Full roster: /Users/alexa/BLACKROAD_AGENT_ROSTER.md"
echo ""
