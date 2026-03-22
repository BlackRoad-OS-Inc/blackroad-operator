#!/bin/bash
# Setup cece-revival for training
set -e

echo 'Cloning cece-revival...'
gh repo clone BlackRoad-OS-Inc/cece-revival ~/training/cece-revival
cd ~/training/cece-revival
pip install -r requirements.txt 2>/dev/null || true
echo '✓ cece-revival ready for training'
