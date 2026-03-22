#!/bin/bash
set -e
echo "=== RoadC Playground ==="
pip3 install -q fastapi uvicorn 2>/dev/null
cd /Users/alexa/experiments/roadc-playground
python3 server.py
