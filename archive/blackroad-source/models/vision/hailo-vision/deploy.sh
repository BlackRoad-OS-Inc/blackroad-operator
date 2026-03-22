#!/bin/bash
set -e
echo "=== BlackRoad Hailo Vision ==="
pip3 install -q fastapi uvicorn python-multipart httpx 2>/dev/null
cd /Users/alexa/experiments/hailo-vision
python3 server.py
