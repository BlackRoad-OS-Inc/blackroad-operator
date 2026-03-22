#!/bin/bash
set -e
echo "Setting up blackroad-index training environment..."
if [ ! -d "blackroad-index" ]; then gh repo clone BlackRoad-OS-Inc/blackroad-index; fi
cd blackroad-index
echo "Setup complete."
