#!/bin/bash
# Test BlackRoad OS API

echo "🧪 Testing BlackRoad OS API..."
echo ""

# Test health
echo "1. Health Check"
curl -s http://localhost:8000/health | python3 -m json.tool
echo ""

# Test registration
echo "2. Register User"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@blackroad.io","password":"demo123","name":"Demo User"}')
echo "$REGISTER_RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")
echo ""

# Test chat
if [ -n "$TOKEN" ]; then
  echo "3. AI Chat"
  curl -s -X POST http://localhost:8000/api/ai-chat/chat \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"message":"Hello!"}' | python3 -m json.tool
  echo ""

  # Test agent spawn
  echo "4. Spawn Agent"
  curl -s -X POST http://localhost:8000/api/agents/spawn \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"role":"Test Agent","capabilities":["testing"]}' | python3 -m json.tool
  echo ""

  # Test system stats
  echo "5. System Stats"
  curl -s http://localhost:8000/api/system/stats | python3 -m json.tool
fi

echo "✅ API tests complete!"
