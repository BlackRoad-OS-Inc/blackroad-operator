#!/bin/bash
# Setup memory for training
set -e

echo 'Cloning memory...'
gh repo clone BlackRoad-OS-Inc/memory ~/training/memory
cd ~/training/memory
pip install -r requirements.txt 2>/dev/null || true
echo '✓ memory ready for training'
