#!/bin/bash
set -e
echo "=== Fleet Heartbeat ==="
pip3 install -q fastapi uvicorn 2>/dev/null
cd /Users/alexa/experiments/fleet-heartbeat
python3 server.py
