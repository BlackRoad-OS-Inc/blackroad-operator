#!/bin/bash
set -e
echo "Setting up blackroad-cli training environment..."
if [ ! -d "blackroad-cli" ]; then gh repo clone BlackRoad-OS-Inc/blackroad-cli; fi
cd blackroad-cli
python3 -m venv .venv 2>/dev/null || true
echo "Setup complete. Explore bots/ directory to see all bot modules."
