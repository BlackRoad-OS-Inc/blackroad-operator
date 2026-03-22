#!/bin/bash
set -e
echo "Setting up blackroad-portal training environment..."
if [ ! -d "blackroad-portal" ]; then gh repo clone BlackRoad-OS-Inc/blackroad-portal; fi
cd blackroad-portal
echo "Setup complete."
