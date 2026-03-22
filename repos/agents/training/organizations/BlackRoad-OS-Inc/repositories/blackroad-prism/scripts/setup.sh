#!/bin/bash
set -e
echo "Setting up blackroad-prism training environment..."
if [ ! -d "blackroad-prism" ]; then gh repo clone BlackRoad-OS-Inc/blackroad-prism; fi
cd blackroad-prism && npm install
echo "Setup complete. Run 'npx wrangler dev' for local dev."
