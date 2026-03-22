#!/bin/bash
# Setup blackroad-auth for training
set -e

echo 'Cloning blackroad-auth...'
gh repo clone BlackRoad-OS-Inc/blackroad-auth ~/training/blackroad-auth
cd ~/training/blackroad-auth
npm install
echo '✓ blackroad-auth ready for training'
