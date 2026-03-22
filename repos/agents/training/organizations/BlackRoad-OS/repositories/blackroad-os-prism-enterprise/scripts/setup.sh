#!/bin/bash
# Setup blackroad-os-prism-enterprise for training
set -e

echo 'Cloning blackroad-os-prism-enterprise...'
gh repo clone BlackRoad-OS-Inc/blackroad-os-prism-enterprise ~/training/blackroad-os-prism-enterprise
cd ~/training/blackroad-os-prism-enterprise
npm install
echo '✓ blackroad-os-prism-enterprise ready for training'
