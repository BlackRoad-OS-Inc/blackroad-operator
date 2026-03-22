#!/bin/bash
set -e
echo "Setting up blackroad-apps training environment..."
if [ ! -d "blackroad-apps" ]; then gh repo clone BlackRoad-OS-Inc/blackroad-apps; fi
cd blackroad-apps

npm install 2>/dev/null || true
echo "Setup complete."
