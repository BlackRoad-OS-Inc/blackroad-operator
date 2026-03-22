#!/bin/bash
# Setup blackroad-images for training
set -e

echo 'Cloning blackroad-images...'
gh repo clone BlackRoad-OS-Inc/blackroad-images ~/training/blackroad-images
cd ~/training/blackroad-images
npm install
echo '✓ blackroad-images ready for training'
