#!/bin/bash
set -e
echo "Setting up blackroad-dashboards training environment..."
if [ ! -d "blackroad-dashboards" ]; then gh repo clone BlackRoad-OS-Inc/blackroad-dashboards; fi
cd blackroad-dashboards


echo "Setup complete."
