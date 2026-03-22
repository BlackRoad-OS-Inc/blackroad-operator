#!/bin/bash
# Start Copilot Gateway with local Ollama

export OLLAMA_ENDPOINT=http://localhost:11434

cd ~/copilot-agent-gateway

echo "🚀 Starting BlackRoad Copilot Gateway"
echo "   Ollama: $OLLAMA_ENDPOINT"
echo ""
echo "Available models:"
curl -s http://localhost:11434/api/tags | jq -r '.models[].name' | head -10

echo ""
echo "Gateway running on stdio (waiting for Copilot CLI)..."
echo ""

node server.js
