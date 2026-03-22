#!/bin/bash
set -e
echo "Setting up blackroad-stats training environment..."
if [ ! -d "blackroad-stats" ]; then gh repo clone BlackRoad-OS-Inc/blackroad-stats; fi
cd blackroad-stats && npm install 2>/dev/null || true
echo "Setup complete. Read src/worker.js and collect.sh."
