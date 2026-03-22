#!/bin/bash
# Setup blackroad-os-deploy for training
set -e

echo 'Cloning blackroad-os-deploy...'
gh repo clone BlackRoad-OS-Inc/blackroad-os-deploy ~/training/blackroad-os-deploy
cd ~/training/blackroad-os-deploy
npm install
echo '✓ blackroad-os-deploy ready for training'
