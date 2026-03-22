#!/bin/bash
echo "🧪 Testing All BlackRoad Sites"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_site() {
  local name=$1
  local ip=$2
  echo "Testing $name ($ip)..."
  
  if curl -s -m 3 "http://$ip" | grep -q "BlackRoad"; then
    echo "  ✅ $name is serving BlackRoad website"
  else
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m 3 "http://$ip")
    echo "  ⚠️  $name returned HTTP $STATUS"
  fi
  echo ""
}

test_site "alice" "192.168.4.49"
test_site "lucidia" "192.168.4.38"
test_site "codex-infinity" "159.65.43.12"
test_site "shellfish" "174.138.44.45"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
