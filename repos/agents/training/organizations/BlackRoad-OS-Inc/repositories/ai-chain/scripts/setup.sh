#!/bin/bash
set -e
echo "Setting up ai-chain training environment..."
if [ ! -d "ai-chain" ]; then gh repo clone BlackRoad-OS-Inc/ai-chain; fi
cd ai-chain
python3 -m venv .venv 2>/dev/null && source .venv/bin/activate && pip install -r requirements.txt 2>/dev/null || true

echo "Setup complete."
