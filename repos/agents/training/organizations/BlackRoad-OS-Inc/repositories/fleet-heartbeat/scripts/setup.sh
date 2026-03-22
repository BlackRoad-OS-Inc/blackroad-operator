#!/bin/bash
set -e
echo "Setting up fleet-heartbeat training environment..."
if [ ! -d "fleet-heartbeat" ]; then gh repo clone BlackRoad-OS-Inc/fleet-heartbeat; fi
cd fleet-heartbeat
echo "Setup complete."
