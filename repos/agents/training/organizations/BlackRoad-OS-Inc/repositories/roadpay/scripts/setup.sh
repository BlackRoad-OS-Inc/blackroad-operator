#!/bin/bash
# Setup roadpay for training
set -e

echo 'Cloning roadpay...'
gh repo clone BlackRoad-OS-Inc/roadpay ~/training/roadpay
cd ~/training/roadpay
npm install
echo '✓ roadpay ready for training'
