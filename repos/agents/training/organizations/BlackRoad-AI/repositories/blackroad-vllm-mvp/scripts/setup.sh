#!/bin/bash
# Setup blackroad-vllm-mvp for training
set -e

echo 'Cloning blackroad-vllm-mvp...'
gh repo clone BlackRoad-OS-Inc/blackroad-vllm-mvp ~/training/blackroad-vllm-mvp
cd ~/training/blackroad-vllm-mvp
pip install -r requirements.txt 2>/dev/null || true
echo '✓ blackroad-vllm-mvp ready for training'
