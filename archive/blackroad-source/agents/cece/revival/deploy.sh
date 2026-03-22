#!/bin/bash
set -e
echo "=== CECE Revival ==="
pip3 install -q fastapi uvicorn httpx 2>/dev/null
cd /Users/alexa/experiments/cece-revival
python3 server.py
