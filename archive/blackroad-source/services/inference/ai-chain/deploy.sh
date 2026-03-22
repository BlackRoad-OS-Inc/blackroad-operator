#!/bin/bash
# Deploy AI Chain to Octavia
set -e
echo "=== BlackRoad AI Chain ==="
pip3 install -q fastapi uvicorn httpx 2>/dev/null
echo "Starting on :8100..."
cd /Users/alexa/experiments/ai-chain
python3 server.py
