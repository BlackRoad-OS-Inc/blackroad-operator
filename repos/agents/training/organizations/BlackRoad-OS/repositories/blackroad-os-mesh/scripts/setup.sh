#!/bin/bash
# Setup blackroad-os-mesh for training
set -e

echo 'Cloning blackroad-os-mesh...'
gh repo clone BlackRoad-OS-Inc/blackroad-os-mesh ~/training/blackroad-os-mesh
cd ~/training/blackroad-os-mesh
npm install
echo '✓ blackroad-os-mesh ready for training'
