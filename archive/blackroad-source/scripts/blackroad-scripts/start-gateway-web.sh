#!/bin/bash
# Start BlackRoad Copilot Gateway Web Dashboard

echo "🌐 Starting BlackRoad Copilot Gateway Web Dashboard..."

cd ~/copilot-agent-gateway

# Use local Ollama by default
export OLLAMA_ENDPOINT=${OLLAMA_ENDPOINT:-http://localhost:11434}

echo "🤖 BlackRoad AI endpoint: $OLLAMA_ENDPOINT"
echo "📊 Dashboard will be available at: http://localhost:3030"
echo ""

node web-server.js
