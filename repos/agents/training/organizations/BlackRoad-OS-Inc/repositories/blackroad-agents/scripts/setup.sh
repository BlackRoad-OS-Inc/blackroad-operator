#!/bin/bash
# Setup script for blackroad-agents certification training
set -e

echo "Setting up blackroad-agents training environment..."

# Clone if not already present
if [ ! -d "blackroad-agents" ]; then
  gh repo clone BlackRoad-OS-Inc/blackroad-agents
fi

cd blackroad-agents

# Verify Ollama is available (needed to test Modelfiles)
if command -v ollama &>/dev/null; then
  echo "Ollama: $(ollama --version)"
else
  echo "WARNING: Ollama not installed locally. You can still read Modelfiles but cannot test them."
fi

echo "Setup complete. Start with: cat modelfiles/ to see agent definitions"
