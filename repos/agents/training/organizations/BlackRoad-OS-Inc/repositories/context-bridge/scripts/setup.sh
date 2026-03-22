#!/bin/bash
set -e
echo "Setting up context-bridge training environment..."
if [ ! -d "context-bridge" ]; then gh repo clone BlackRoad-OS-Inc/context-bridge; fi
cd context-bridge
echo "Setup complete."
