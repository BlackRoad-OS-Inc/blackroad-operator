#!/bin/bash
set -e
echo "Setting up blackroad-analytics training environment..."
if [ ! -d "blackroad-analytics" ]; then gh repo clone BlackRoad-OS-Inc/blackroad-analytics; fi
cd blackroad-analytics && npm install 2>/dev/null || true
echo "Setup complete. Read src/worker.js and migrations/0001_init.sql."
