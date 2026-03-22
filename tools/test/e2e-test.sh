#!/bin/bash
# BlackRoad OS — End-to-End Infrastructure Test
# Run: bash ~/blackroad-operator/tools/test/e2e-test.sh

PASS=0; FAIL=0; TOTAL=0

check() {
  local name="$1" cmd="$2" expected="$3"
  TOTAL=$((TOTAL+1))
  result=$(eval "$cmd" 2>/dev/null)
  if echo "$result" | grep -q "$expected"; then
    PASS=$((PASS+1))
    printf "  ✓ %s\n" "$name"
  else
    FAIL=$((FAIL+1))
    printf "  ✗ %s (got: %s)\n" "$name" "${result:0:50}"
  fi
}

echo "╔══════════════════════════════════════════════╗"
echo "║  BlackRoad OS — E2E Infrastructure Test      ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

echo "── Pages (blackroad-io.pages.dev) ──"
for p in "" dashboard.html chat.html terminal.html status.html docs.html pay.html about.html cards.html search.html; do
  check "${p:-index}" "curl -so/dev/null -w '%{http_code}' --max-time 5 'https://blackroad-io.pages.dev/$p'" "200"
done

echo ""
echo "── Domains ──"
for d in blackroad.io lucidia.earth roadchain.io roadcoin.io blackroadai.com blackroad.company blackroad.me blackroad.network blackroad.systems; do
  check "$d" "curl -so/dev/null -w '%{http_code}' --max-time 5 'https://$d'" "200"
done

echo ""
echo "── Subdomains ──"
for s in chat roundtrip search hq images pay auth docs brand monitor git mesh cloud analytics status prism fleet; do
  check "$s.blackroad.io" "curl -so/dev/null -w '%{http_code}' --max-time 5 'https://$s.blackroad.io'" "200"
done

echo ""
echo "── API Endpoints ──"
for ep in /api/stats /api/agents /api/search /api/social /api/education /api/finance /api/infra /api/memory; do
  check "$ep" "curl -so/dev/null -w '%{http_code}' --max-time 10 'https://blackroad-live-stats.amundsonalexa.workers.dev$ep'" "200"
done

echo ""
echo "── Workers ──"
for w in chat-blackroad roundtrip-blackroad roadpay blackroad-live-stats blackroad-mesh auth-blackroad blackroad-gateway blackroad-slack hq-blackroad the-seam status-blackroad cloud-blackroad; do
  check "$w" "curl -so/dev/null -w '%{http_code}' --max-time 5 'https://$w.amundsonalexa.workers.dev'" "200"
done

echo ""
echo "── Fleet Nodes (Ping) ──"
for pair in "alice:192.168.4.49" "cecilia:192.168.4.96" "octavia:192.168.4.101" "aria:192.168.4.98" "lucidia:192.168.4.38"; do
  n="${pair%%:*}"; ip="${pair##*:}"
  check "$n" "ping -c1 -W2 $ip >/dev/null 2>&1 && echo UP" "UP"
done

echo ""
echo "── Fleet Nodes (SSH) ──"
check "alice-ssh" "ssh -o ConnectTimeout=3 -o BatchMode=yes pi@192.168.4.49 hostname" "alice"
check "cecilia-ssh" "ssh -o ConnectTimeout=3 -o BatchMode=yes blackroad@192.168.4.96 hostname" "cecilia"
check "octavia-ssh" "ssh -o ConnectTimeout=3 -o BatchMode=yes pi@192.168.4.101 hostname" "octavia"
check "aria-ssh" "ssh -o ConnectTimeout=3 -o BatchMode=yes pi@192.168.4.98 hostname" "aria"
check "lucidia-ssh" "ssh -o ConnectTimeout=3 -o BatchMode=yes blackroad@192.168.4.38 hostname" "lucidia"

echo ""
echo "── Fleet Services ──"
check "qdrant" "curl -so/dev/null -w '%{http_code}' --max-time 3 'http://192.168.4.49:6333/collections'" "200"
check "gitea" "curl -so/dev/null -w '%{http_code}' --max-time 3 'http://192.168.4.101:3100'" "200"
check "ollama-cecilia" "curl -s --max-time 5 'http://192.168.4.96:11434/api/tags' | python3 -c 'import sys,json; print(len(json.load(sys.stdin).get(\"models\",[])))'" "[0-9]"
check "postgres" "ssh -o ConnectTimeout=3 -o BatchMode=yes pi@192.168.4.49 'pg_isready'" "accepting"
check "redis" "ssh -o ConnectTimeout=3 -o BatchMode=yes pi@192.168.4.49 'redis-cli ping'" "PONG"

echo ""
echo "── Chat E2E ──"
check "roundtrip" "curl -s --max-time 15 -X POST 'https://roundtrip.blackroad.io/api/chat' -H 'Content-Type: application/json' -d '{\"agent\":\"alice\",\"message\":\"ping\",\"channel\":\"general\"}' | python3 -c 'import sys,json; d=json.load(sys.stdin); print(\"reply\" in d)'" "True"
check "chat-worker" "curl -s --max-time 15 -X POST 'https://chat-blackroad.amundsonalexa.workers.dev/api/chat' -H 'Content-Type: application/json' -d '{\"message\":\"hello\",\"model\":\"qwen2.5:1.5b\",\"stream\":false}' | python3 -c 'import sys,json; d=json.load(sys.stdin); print(\"message\" in d)'" "True"

echo ""
echo "══════════════════════════════════════════════"
printf "  Results: %d passed, %d failed, %d total\n" "$PASS" "$FAIL" "$TOTAL"
echo "══════════════════════════════════════════════"
[ "$FAIL" -gt 0 ] && exit 1 || exit 0
