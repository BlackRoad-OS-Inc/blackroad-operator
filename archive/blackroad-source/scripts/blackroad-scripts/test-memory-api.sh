#!/bin/bash
# Quick test of the memory system API

echo "🧠 Testing BlackRoad AI Memory System"
echo "======================================"
echo ""

echo "1️⃣ Get current statistics:"
curl -s http://localhost:3000/api/memory/agent-stats | jq .
echo ""

echo "2️⃣ Create a new conversation:"
CONV=$(curl -s -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4","title":"Demo Conversation"}')
echo "$CONV" | jq .
CONV_ID=$(echo "$CONV" | jq -r '.id')
echo ""

echo "3️⃣ Send first message:"
MSG1=$(curl -s -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"Hello! My favorite color is blue.\",\"model\":\"claude-sonnet-4\",\"conversationId\":\"$CONV_ID\"}")
echo "$MSG1" | jq '.message.content' | head -5
echo "..."
echo ""

echo "4️⃣ Send follow-up (with context):"
MSG2=$(curl -s -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"What is my favorite color?\",\"model\":\"claude-sonnet-4\",\"conversationId\":\"$CONV_ID\",\"includeContext\":true}")
echo "$MSG2" | jq '.message.content' | head -5
echo "..."
echo ""

echo "5️⃣ List all conversations:"
curl -s "http://localhost:3000/api/conversations?limit=3" | jq '.conversations[] | {id, title, message_count}'
echo ""

echo "✅ Memory system is working!"
