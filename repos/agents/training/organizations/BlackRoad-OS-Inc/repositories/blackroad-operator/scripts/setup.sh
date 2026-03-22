#!/bin/bash
# Setup blackroad-operator for training
set -e

echo 'Cloning blackroad-operator...'
gh repo clone BlackRoad-OS-Inc/blackroad-operator ~/training/blackroad-operator
cd ~/training/blackroad-operator
echo '✓ blackroad-operator ready for training'
