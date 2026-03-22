#!/bin/bash
# BlackRoad Site Tester — runs on Alice Pi, tests all BlackRoad websites
# Posts results to chat.blackroad.io for viewing via /test command
# Usage: ./blackroad-site-tester.sh [--quiet]

set +e

QUIET="${1:-}"
RUNNER="$(hostname)"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
REPORT_URL="https://chat.blackroad.io/api/test-results"
MAX_TIME=15
SLOW_THRESHOLD=2000

RESULTS_FILE="/tmp/br-test-results.json"
echo "[" > "$RESULTS_FILE"
FIRST=true
TOTAL=0; UP=0; DOWN=0; DEGRADED=0
START_S=$(date +%s)

test_url() {
  local name="$1" url="$2" expect="$3"
  local http_code=0 time_ms=0 content_ok="true" status="up" error=""

  local tmpbody="/tmp/br-test-body"
  local curl_out
  curl_out=$(curl -s -o "$tmpbody" -w "%{http_code} %{time_total}" --max-time "$MAX_TIME" "$url" 2>/dev/null)
  local rc=$?

  if [ $rc -ne 0 ]; then
    status="down"; error="connection failed (curl exit $rc)"; content_ok="false"
  else
    http_code=$(echo "$curl_out" | awk '{print $1}')
    local time_float=$(echo "$curl_out" | awk '{print $2}')
    time_ms=$(echo "$time_float" | awk '{printf "%d", $1 * 1000}')

    if [ "$http_code" -ge 400 ] 2>/dev/null || [ "$http_code" = "000" ]; then
      status="down"; error="HTTP $http_code"; content_ok="false"
    fi

    if [ -n "$expect" ] && [ "$status" != "down" ]; then
      if ! grep -qi "$expect" "$tmpbody" 2>/dev/null; then
        content_ok="false"; error="missing: $expect"; status="degraded"
      fi
    fi

    if [ "$time_ms" -gt "$SLOW_THRESHOLD" ] && [ "$status" = "up" ]; then
      status="degraded"; error="slow: ${time_ms}ms"
    fi
  fi

  TOTAL=$((TOTAL + 1))
  case "$status" in
    up) UP=$((UP + 1)) ;;
    down) DOWN=$((DOWN + 1)) ;;
    degraded) DEGRADED=$((DEGRADED + 1)) ;;
  esac

  [ "$QUIET" != "--quiet" ] && printf "  %-30s %-8s %5dms  %s\n" "$name" "$status" "$time_ms" "$error"

  # Append JSON
  if [ "$FIRST" = true ]; then FIRST=false; else echo "," >> "$RESULTS_FILE"; fi
  cat >> "$RESULTS_FILE" <<JEOF
{"site":"$name","url":"$url","status":"$status","http_code":$http_code,"response_time_ms":$time_ms,"content_ok":$content_ok,"error":"$error"}
JEOF
}

[ "$QUIET" != "--quiet" ] && echo "BlackRoad Site Tester — $(date)"
[ "$QUIET" != "--quiet" ] && echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ "$QUIET" != "--quiet" ] && echo "Sites:"

test_url "chat.blackroad.io"     "https://chat.blackroad.io/"          "BlackRoad Chat"
test_url "portal.blackroad.io"   "https://portal.blackroad.io/"        "BlackRoad"
test_url "index.blackroad.io"    "https://index.blackroad.io/"         ""
test_url "images.blackroad.io"   "https://images.blackroad.io/"        ""
test_url "git.blackroad.io"      "https://git.blackroad.io/"           "Gitea"
test_url "docs.blackroad.io"     "https://docs.blackroad.io/"          ""
test_url "api.blackroad.io"      "https://api.blackroad.io/"           ""
test_url "ollama.blackroad.io"   "https://ollama.blackroad.io/api/tags" "models"

[ "$QUIET" != "--quiet" ] && echo ""
[ "$QUIET" != "--quiet" ] && echo "APIs:"

test_url "chat /api/health"      "https://chat.blackroad.io/api/health"    "status"
test_url "chat /api/models"      "https://chat.blackroad.io/api/models"    "models"
test_url "chat /api/groups"      "https://chat.blackroad.io/api/groups"    "groups"
test_url "chat /api/pipelines"   "https://chat.blackroad.io/api/pipelines" "pipelines"

echo "]" >> "$RESULTS_FILE"

END_S=$(date +%s)
DURATION=$(( (END_S - START_S) * 1000 ))

# Build payload
PAYLOAD="{\"timestamp\":\"$TIMESTAMP\",\"runner\":\"$RUNNER\",\"duration_ms\":$DURATION,\"results\":$(cat "$RESULTS_FILE"),\"summary\":{\"total\":$TOTAL,\"up\":$UP,\"down\":$DOWN,\"degraded\":$DEGRADED}}"

[ "$QUIET" != "--quiet" ] && echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ "$QUIET" != "--quiet" ] && echo "Summary: $UP up, $DOWN down, $DEGRADED degraded (${DURATION}ms)"

# Post results
curl -s -X POST "$REPORT_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  --max-time 10 > /dev/null 2>&1 || true

[ "$QUIET" != "--quiet" ] && echo "Results posted to chat.blackroad.io"

rm -f /tmp/br-test-body "$RESULTS_FILE"
