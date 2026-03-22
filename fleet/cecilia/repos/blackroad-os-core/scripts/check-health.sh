#!/bin/bash

# Check health of all deployed Railway services
# Usage: ./scripts/check-health.sh

echo "🏥 BlackRoad OS - Health Check"
echo "=============================="
echo ""

# Service URLs (update after deployment)
declare -A SERVICES=(
  ["RoadWork API"]="https://roadwork-production.up.railway.app/health"
  ["RoadWork Staging"]="https://roadwork-staging.up.railway.app/health"
  ["Core Service"]="https://blackroad-os-core-production.up.railway.app/health"
  ["Operator"]="https://blackroad-os-operator-production.up.railway.app/health"
  ["Master"]="https://blackroad-os-master-production.up.railway.app/health"
  ["Beacon"]="https://blackroad-os-beacon-production.up.railway.app/health"
)

check_health() {
  local name=$1
  local url=$2

  echo -n "Checking $name... "

  if command -v curl &> /dev/null; then
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" = "200" ]; then
      echo "✅ Healthy"
      return 0
    elif [ "$response" = "000" ]; then
      echo "❌ Not deployed"
      return 1
    else
      echo "⚠️  Status: $response"
      return 1
    fi
  else
    echo "⚠️  curl not found, skipping"
    return 1
  fi
}

# Check all services
healthy=0
unhealthy=0
total=0

for service in "${!SERVICES[@]}"; do
  url="${SERVICES[$service]}"
  total=$((total + 1))

  if check_health "$service" "$url"; then
    healthy=$((healthy + 1))
  else
    unhealthy=$((unhealthy + 1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total services: $total"
echo "✅ Healthy: $healthy"
echo "❌ Unhealthy: $unhealthy"
echo ""

if [ $unhealthy -eq 0 ]; then
  echo "🎉 All services healthy!"
  exit 0
else
  echo "⚠️  Some services need attention"
  echo ""
  echo "Check Railway logs:"
  echo "  railway logs -f"
  exit 1
fi
