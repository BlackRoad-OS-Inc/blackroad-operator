#!/bin/bash
set -e
echo "Setting up lucidia-cli training environment..."
if [ ! -d "lucidia-cli" ]; then gh repo clone BlackRoad-OS-Inc/lucidia-cli; fi
cd lucidia-cli
echo "Setup complete."
