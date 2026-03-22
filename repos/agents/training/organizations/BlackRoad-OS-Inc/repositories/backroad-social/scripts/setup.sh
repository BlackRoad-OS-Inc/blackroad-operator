#!/bin/bash
set -e
echo "Setting up backroad-social training environment..."
if [ ! -d "backroad-social" ]; then gh repo clone BlackRoad-OS-Inc/backroad-social; fi
cd backroad-social
python3 -m venv .venv 2>/dev/null && source .venv/bin/activate && pip install -r requirements.txt 2>/dev/null || true

echo "Setup complete."
