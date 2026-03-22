#!/bin/bash
# Setup lucidia-core for training
set -e

echo 'Cloning lucidia-core...'
gh repo clone BlackRoad-OS-Inc/lucidia-core ~/training/lucidia-core
cd ~/training/lucidia-core
pip install -r requirements.txt 2>/dev/null || true
echo '✓ lucidia-core ready for training'
