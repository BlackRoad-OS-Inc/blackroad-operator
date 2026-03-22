#!/bin/bash
# Quick test of gateway with local Ollama

echo "🧪 Testing Gateway → Local Ollama"
echo ""

# Test 1: Ollama connectivity
echo "1️⃣ Testing Ollama connection..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
  MODEL_COUNT=$(curl -s http://localhost:11434/api/tags | jq '.models | length')
  echo "   ✅ Ollama is running ($MODEL_COUNT models available)"
else
  echo "   ❌ Ollama not responding"
  exit 1
fi

# Test 2: Check if qwen2.5-coder is available
echo ""
echo "2️⃣ Checking for qwen2.5-coder:7b..."
if curl -s http://localhost:11434/api/tags | jq -r '.models[].name' | grep -q "qwen2.5-coder:7b"; then
  echo "   ✅ qwen2.5-coder:7b found"
else
  echo "   ⚠️  qwen2.5-coder:7b not found (using fallback)"
fi

# Test 3: Gateway configuration
echo ""
echo "3️⃣ Checking gateway config..."
if grep -q "localhost:11434" ~/.copilot/mcp-config.json 2>/dev/null; then
  echo "   ✅ Gateway configured for localhost"
else
  echo "   ⚠️  Gateway may still point to octavia"
fi

echo ""
echo "🚀 Ready to test!"
echo ""
echo "Run in one terminal:"
echo "  ~/start-copilot-gateway.sh"
echo ""
echo "Then in another terminal:"
echo "  copilot"
echo "  > /mcp"
echo "  > @blackroad-gateway list_models"
echo ""
echo "Or use MCP Inspector:"
echo "  mcp dev ~/copilot-agent-gateway/server.js"
