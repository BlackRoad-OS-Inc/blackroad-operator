#!/bin/bash
# Setup blackbox-n8n for training
set -e

echo 'Cloning blackbox-n8n...'
gh repo clone BlackRoad-OS-Inc/blackbox-n8n ~/training/blackbox-n8n
cd ~/training/blackbox-n8n
echo '✓ blackbox-n8n ready for training'
