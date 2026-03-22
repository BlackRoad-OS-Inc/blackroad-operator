#!/bin/bash
#===============================================================================
# BLACKROAD AGENT SYSTEM - INSTALLER
# Sets up the agent system on Mac or Raspberry Pi
#===============================================================================

set -e

AGENT_HOME="${HOME}/.blackroad-agents"
BIN_DIR="${HOME}/bin"

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║         BLACKROAD AGENT SYSTEM INSTALLER                          ║"
echo "║     Your AI. Your Hardware. Zero Dependencies.                    ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Detect platform
PLATFORM=$(uname)
ARCH=$(uname -m)

echo "Platform: $PLATFORM ($ARCH)"

# Create directories
echo "Creating directories..."
mkdir -p "$AGENT_HOME"/{core,agents,models,memory,tools}
mkdir -p "$BIN_DIR"

# Make scripts executable
echo "Setting permissions..."
chmod +x "$AGENT_HOME/br"
chmod +x "$AGENT_HOME/br-octavia"
chmod +x "$AGENT_HOME/br-lucidia"
chmod +x "$AGENT_HOME/br-alice"
chmod +x "$AGENT_HOME/br-aria"
chmod +x "$AGENT_HOME/br-shellfish"
chmod +x "$AGENT_HOME/core/engine.sh"

# Create symlinks in ~/bin
echo "Creating command symlinks in ~/bin..."
ln -sf "$AGENT_HOME/br" "$BIN_DIR/br"
ln -sf "$AGENT_HOME/br-octavia" "$BIN_DIR/br-octavia"
ln -sf "$AGENT_HOME/br-lucidia" "$BIN_DIR/br-lucidia"
ln -sf "$AGENT_HOME/br-alice" "$BIN_DIR/br-alice"
ln -sf "$AGENT_HOME/br-aria" "$BIN_DIR/br-aria"
ln -sf "$AGENT_HOME/br-shellfish" "$BIN_DIR/br-shellfish"

# Add ~/bin to PATH if not already there
SHELL_RC=""
if [[ -f "$HOME/.zshrc" ]]; then
    SHELL_RC="$HOME/.zshrc"
elif [[ -f "$HOME/.bashrc" ]]; then
    SHELL_RC="$HOME/.bashrc"
fi

if [[ -n "$SHELL_RC" ]]; then
    if ! grep -q 'export PATH="$HOME/bin:$PATH"' "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# BlackRoad Agent System" >> "$SHELL_RC"
        echo 'export PATH="$HOME/bin:$PATH"' >> "$SHELL_RC"
        echo "Added ~/bin to PATH in $SHELL_RC"
    fi
fi

# Initialize agent memories
echo "Initializing agent memories..."
source "$AGENT_HOME/core/engine.sh"
for agent in octavia lucidia alice aria shellfish; do
    init_memory "$agent"
    echo "  ✓ $agent memory initialized"
done

# Check for inference backend
echo ""
echo "Checking for inference backend..."
BACKEND=$(detect_backend)

if [[ "$BACKEND" == "none" ]]; then
    echo ""
    echo "⚠ No inference backend found!"
    echo ""

    if [[ "$PLATFORM" == "Darwin" ]]; then
        echo "For macOS, recommended setup:"
        echo ""
        echo "  Option A - MLX (Apple Silicon, fastest):"
        echo "    pip3 install mlx-lm"
        echo ""
        echo "  Option B - llama.cpp (universal):"
        echo "    git clone https://github.com/BlackRoad-AI/llama.cpp ~/BlackRoad-AI/llama.cpp"
        echo "    cd ~/BlackRoad-AI/llama.cpp && make -j LLAMA_METAL=1"
        echo ""
        echo "  Option C - Ollama (easiest):"
        echo "    brew install ollama && ollama pull phi3:mini"
        echo ""
    else
        echo "For Raspberry Pi:"
        echo ""
        echo "  llama.cpp (CPU, optimized for ARM):"
        echo "    git clone https://github.com/BlackRoad-AI/llama.cpp ~/llama.cpp"
        echo "    cd ~/llama.cpp && make -j4"
        echo ""
        echo "  Then download a small model:"
        echo "    wget https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf"
        echo "    mv Phi-3-mini-4k-instruct-q4.gguf ~/.blackroad-agents/models/"
        echo ""
    fi
else
    echo "✓ Found backend: $BACKEND"
fi

# Download a starter model if none exist
if [[ ! -f "$AGENT_HOME/models/"*.gguf ]]; then
    echo ""
    echo "No models found. To download a starter model:"
    echo ""
    if [[ "$PLATFORM" == "Darwin" ]]; then
        echo "  # For 16GB+ Mac:"
        echo "  huggingface-cli download Qwen/Qwen2.5-7B-Instruct-GGUF \\"
        echo "    qwen2.5-7b-instruct-q4_k_m.gguf \\"
        echo "    --local-dir ~/.blackroad-agents/models"
        echo ""
        echo "  # For 8GB Mac or Pi:"
        echo "  huggingface-cli download microsoft/Phi-3-mini-4k-instruct-gguf \\"
        echo "    Phi-3-mini-4k-instruct-q4.gguf \\"
        echo "    --local-dir ~/.blackroad-agents/models"
    else
        echo "  wget -P ~/.blackroad-agents/models \\"
        echo "    https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf"
    fi
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                    INSTALLATION COMPLETE                          ║"
echo "╠═══════════════════════════════════════════════════════════════════╣"
echo "║                                                                   ║"
echo "║  Restart your terminal, then try:                                 ║"
echo "║                                                                   ║"
echo "║    br help              - Show all commands                       ║"
echo "║    br status            - Check system status                     ║"
echo "║    br-octavia hello     - Talk to Octavia                         ║"
echo "║    br chat lucidia      - Interactive chat with Lucidia           ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
