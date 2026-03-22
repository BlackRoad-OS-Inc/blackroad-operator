#!/bin/bash
# Setup road-search for training
set -e

echo 'Cloning road-search...'
gh repo clone BlackRoad-OS-Inc/road-search ~/training/road-search
cd ~/training/road-search
npm install
echo '✓ road-search ready for training'
