#!/bin/bash
# Setup blackroad-ai-api-gateway for training
set -e

echo 'Cloning blackroad-ai-api-gateway...'
gh repo clone BlackRoad-OS-Inc/blackroad-ai-api-gateway ~/training/blackroad-ai-api-gateway
cd ~/training/blackroad-ai-api-gateway
npm install
echo '✓ blackroad-ai-api-gateway ready for training'
