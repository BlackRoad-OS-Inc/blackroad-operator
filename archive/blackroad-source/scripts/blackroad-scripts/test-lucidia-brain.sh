#!/bin/bash
# Test Lucidia's existing NATS + Ollama services

echo "🧠 Testing Lucidia Brain Services"
echo "=================================="
echo ""

LUCIDIA="192.168.4.81"

echo "1. Testing NATS (event bus)..."
curl -s http://$LUCIDIA:4222 2>/dev/null && echo "✅ NATS is responding" || echo "❌ NATS not reachable"
echo ""

echo "2. Testing Ollama (LLM)..."
if curl -s http://$LUCIDIA:11434/api/tags 2>/dev/null | grep -q "models"; then
    echo "✅ Ollama is running!"
    echo ""
    echo "Available models:"
    curl -s http://$LUCIDIA:11434/api/tags | python3 -m json.tool 2>/dev/null || echo "  (Install jq to see models)"
else
    echo "❌ Ollama not responding"
fi
echo ""

echo "3. Testing Docker services..."
ssh pi@$LUCIDIA "docker ps --format 'table {{.Names}}\t{{.Status}}'" 2>/dev/null
echo ""

echo "4. Quick LLM inference test..."
curl -s http://$LUCIDIA:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Say hello in 5 words",
  "stream": false
}' 2>/dev/null | python3 -c "import sys, json; print(json.load(sys.stdin).get('response', 'No response'))" 2>/dev/null || echo "  (Model not loaded or different version)"
echo ""

echo "✅ Lucidia brain test complete!"
echo ""
echo "To connect agents:"
echo "  NATS: nats://192.168.4.81:4222"
echo "  Ollama: http://192.168.4.81:11434"
