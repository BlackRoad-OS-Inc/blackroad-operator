#!/bin/bash
# Setup blackbox-temporal for training
set -e

echo 'Cloning blackbox-temporal...'
gh repo clone BlackRoad-OS-Inc/blackbox-temporal ~/training/blackbox-temporal
cd ~/training/blackbox-temporal
echo '✓ blackbox-temporal ready for training'
