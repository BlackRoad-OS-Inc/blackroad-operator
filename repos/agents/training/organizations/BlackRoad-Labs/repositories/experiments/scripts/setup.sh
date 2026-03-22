#!/bin/bash
# Setup experiments for training
set -e

echo 'Cloning experiments...'
gh repo clone BlackRoad-OS-Inc/experiments ~/training/experiments
cd ~/training/experiments
pip install -r requirements.txt 2>/dev/null || true
echo '✓ experiments ready for training'
