#!/bin/bash
# Setup source for training
set -e

echo 'Cloning source...'
gh repo clone BlackRoad-OS-Inc/source ~/training/source
cd ~/training/source
echo '✓ source ready for training'
