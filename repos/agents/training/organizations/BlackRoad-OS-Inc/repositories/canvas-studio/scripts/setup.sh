#!/bin/bash
set -e
echo "Setting up canvas-studio training environment..."
if [ ! -d "canvas-studio" ]; then gh repo clone BlackRoad-OS-Inc/canvas-studio; fi
cd canvas-studio
echo "Setup complete."
