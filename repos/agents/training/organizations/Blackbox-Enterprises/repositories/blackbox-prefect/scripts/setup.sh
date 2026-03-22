#!/bin/bash
# Setup blackbox-prefect for training
set -e

echo 'Cloning blackbox-prefect...'
gh repo clone BlackRoad-OS-Inc/blackbox-prefect ~/training/blackbox-prefect
cd ~/training/blackbox-prefect
pip install -r requirements.txt 2>/dev/null || true
echo '✓ blackbox-prefect ready for training'
