#!/bin/bash
# Setup research for training
set -e

echo 'Cloning research...'
gh repo clone BlackRoad-OS-Inc/research ~/training/research
cd ~/training/research
echo '✓ research ready for training'
