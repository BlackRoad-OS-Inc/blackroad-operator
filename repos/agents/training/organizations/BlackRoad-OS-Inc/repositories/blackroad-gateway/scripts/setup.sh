#!/bin/bash
set -e
echo "Setting up blackroad-gateway training environment..."

if [ ! -d "blackroad-gateway" ]; then
  gh repo clone BlackRoad-OS-Inc/blackroad-gateway
fi

cd blackroad-gateway
npm install
echo "Setup complete. Run 'npm test' to verify, or 'npx wrangler dev' for local dev."
