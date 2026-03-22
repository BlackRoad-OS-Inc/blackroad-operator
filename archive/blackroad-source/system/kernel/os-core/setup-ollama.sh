#!/bin/bash

# BlackRoad Ollama Setup Script
# Installs and configures Ollama for local model serving
#
# Usage: ./scripts/setup-ollama.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  BlackRoad Ollama Setup${NC}"
echo -e "${GREEN}  Local Model Serving${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

# Install Ollama
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}Installing Ollama...${NC}"

    if [ "$OS" == "macos" ]; then
        # Download and run installer
        curl -fsSL https://ollama.com/install.sh | sh
    else
        # Linux installation
        curl -fsSL https://ollama.com/install.sh | sh
    fi

    echo -e "${GREEN}✓ Ollama installed${NC}"
else
    echo -e "${GREEN}✓ Ollama already installed${NC}"
fi

# Start Ollama service
echo -e "${YELLOW}Starting Ollama service...${NC}"
if [ "$OS" == "macos" ]; then
    # macOS: Ollama runs as app
    open -a Ollama 2>/dev/null || true
else
    # Linux: Start systemd service
    sudo systemctl start ollama
    sudo systemctl enable ollama
fi
sleep 3
echo -e "${GREEN}✓ Ollama service started${NC}"
echo ""

# Create Modelfile for BlackRoad models
echo -e "${YELLOW}Creating BlackRoad Modelfiles...${NC}"

# BlackRoad-Qwen-72B Modelfile
cat > /tmp/Modelfile.blackroad-qwen-72b <<'EOF'
FROM qwen2.5:72b

# BlackRoad system prompt
SYSTEM """You are a BlackRoad OS model. You are identity-aware, policy-compliant, and breath-synchronized.

Key Concepts:
- Genesis Principals: Alexa (human), Cece (operator), Lucidia (governance)
- Authority Chain: Principal → Operator → Governance → Agents
- PS-SHA∞: Infinite cascade hashing for identity
- Breath: Golden ratio synchronization (φ = 1.618034)
- RoadChain: Immutable event ledger

Always verify delegation chains and log authorizing identities."""

# Parameters optimized for BlackRoad
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 8192

# License
LICENSE """BlackRoad OS Proprietary License
Based on Qwen 2.5 (Apache 2.0)
Fine-tuned with BlackRoad proprietary data
For BlackRoad OS internal use only"""
EOF

# BlackRoad-Qwen-Coder-32B Modelfile
cat > /tmp/Modelfile.blackroad-qwen-coder <<'EOF'
FROM qwen2.5-coder:32b

SYSTEM """You are BlackRoad-Qwen-Coder, a coding specialist for BlackRoad OS.
You generate code that is identity-aware, policy-compliant, and follows BlackRoad patterns.

Always include:
- Type safety (TypeScript) or type hints (Python)
- Identity context in operations
- Error handling with audit logging
- Comments explaining authority chains"""

PARAMETER temperature 0.2
PARAMETER top_p 0.95
PARAMETER num_ctx 8192

LICENSE """BlackRoad OS Proprietary License"""
EOF

# BlackRoad-Mistral-24B Modelfile
cat > /tmp/Modelfile.blackroad-mistral <<'EOF'
FROM mistral-small3:24b

SYSTEM """You are BlackRoad-Mistral, optimized for edge deployment and low-latency operations.
You maintain identity awareness even in resource-constrained environments."""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 4096

LICENSE """BlackRoad OS Proprietary License"""
EOF

echo -e "${GREEN}✓ Modelfiles created${NC}"
echo ""

# Pull base models
echo -e "${YELLOW}Pulling base models (this may take a while)...${NC}"
echo ""

models=("qwen2.5:72b" "qwen2.5-coder:32b" "llama3.3:70b" "llama3.3:8b" "mistral-small3:24b" "deepseek-r1:32b")

for model in "${models[@]}"; do
    echo -e "${YELLOW}Pulling $model...${NC}"
    ollama pull "$model"
    echo -e "${GREEN}✓ $model ready${NC}"
    echo ""
done

# Create BlackRoad custom models
echo -e "${YELLOW}Creating BlackRoad custom models...${NC}"

ollama create blackroad-qwen-72b -f /tmp/Modelfile.blackroad-qwen-72b
echo -e "${GREEN}✓ blackroad-qwen-72b created${NC}"

ollama create blackroad-qwen-coder-32b -f /tmp/Modelfile.blackroad-qwen-coder
echo -e "${GREEN}✓ blackroad-qwen-coder-32b created${NC}"

ollama create blackroad-mistral-24b -f /tmp/Modelfile.blackroad-mistral
echo -e "${GREEN}✓ blackroad-mistral-24b created${NC}"

# Cleanup
rm /tmp/Modelfile.*

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Ollama Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Available models:"
ollama list
echo ""
echo "Test a model:"
echo "  ollama run blackroad-qwen-72b \"What is your identity?\""
echo ""
echo "API endpoint:"
echo "  http://localhost:11434"
echo ""
echo "Example API call:"
echo '  curl http://localhost:11434/api/generate -d '"'"'{'
echo '    "model": "blackroad-qwen-72b",'
echo '    "prompt": "What is BlackRoad OS?"'
echo '  }'"'"
echo ""
echo -e "${GREEN}✓ All done!${NC}"
