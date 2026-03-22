#!/bin/bash
set -e
echo "Setting up hailo-vision training environment..."
if [ ! -d "hailo-vision" ]; then gh repo clone BlackRoad-OS-Inc/hailo-vision; fi
cd hailo-vision
echo "Setup complete."
