#!/bin/bash
set -e
echo "Setting up squad-webhook training environment..."
if [ ! -d "squad-webhook" ]; then gh repo clone BlackRoad-OS-Inc/squad-webhook; fi
cd squad-webhook && npm install
echo "Setup complete. Read src/worker.js to see the agent router."
