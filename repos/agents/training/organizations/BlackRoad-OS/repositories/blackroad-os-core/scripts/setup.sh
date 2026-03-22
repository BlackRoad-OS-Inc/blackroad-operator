#!/bin/bash
# Setup blackroad-os-core for training
set -e

echo 'Cloning blackroad-os-core...'
gh repo clone BlackRoad-OS-Inc/blackroad-os-core ~/training/blackroad-os-core
cd ~/training/blackroad-os-core
npm install
echo '✓ blackroad-os-core ready for training'
