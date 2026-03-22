#!/bin/bash
set -e
echo "Setting up blackroad-chat training environment..."
if [ ! -d "blackroad-chat" ]; then gh repo clone BlackRoad-OS-Inc/blackroad-chat; fi
cd blackroad-chat

npm install 2>/dev/null || true
echo "Setup complete."
