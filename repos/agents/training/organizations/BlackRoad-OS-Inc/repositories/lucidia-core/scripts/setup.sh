#!/bin/bash
set -e
echo "Setting up lucidia-core training environment..."
if [ ! -d "lucidia-core" ]; then gh repo clone BlackRoad-OS-Inc/lucidia-core; fi
cd lucidia-core
echo "Setup complete."
