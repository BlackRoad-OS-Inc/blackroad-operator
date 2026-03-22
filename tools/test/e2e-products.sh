#!/bin/bash
# E2E Product Health Check — tests all 5 core products
# Usage: bash e2e-products.sh
set -e

PASS=0; FAIL=0; TOTAL=0
check() {
  TOTAL=$((TOTAL+1))
  if [ "$1" = "0" ]; then PASS=$((PASS+1)); printf "  \033[32m✓\033[0m %s\n" "$2"
  else FAIL=$((FAIL+1)); printf "  \033[31m✗\033[0m %s\n" "$2"; fi
}

echo "══════════════════════════════════════"
echo "  BlackRoad E2E Product Test"
echo "  $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "══════════════════════════════════════"

# ── BackRoad Social ──
echo ""
echo "BackRoad Social (social.blackroad.io)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://social.blackroad.io 2>/dev/null)
[ "$STATUS" = "200" ]; check $? "Homepage returns 200"
STATS=$(curl -s https://social.blackroad.io/api/stats 2>/dev/null)
echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('version')=='2.0.0' else 1)" 2>/dev/null; check $? "Version 2.0.0"
echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('groups',0)>=10 else 1)" 2>/dev/null; check $? "Groups >= 10"
echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('rooms',0)>=8 else 1)" 2>/dev/null; check $? "Rooms >= 8"
curl -s https://social.blackroad.io/api/ai/chat -X POST -H "Content-Type: application/json" -d '{"message":"ping","agent":"road"}' 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('response') else 1)" 2>/dev/null; check $? "AI chat responds"

# ── Chat ──
echo ""
echo "Chat (chat.blackroad.io)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://chat.blackroad.io 2>/dev/null)
[ "$STATUS" = "200" ]; check $? "Homepage returns 200"
curl -s https://chat.blackroad.io/api/health 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('status')=='up' else 1)" 2>/dev/null; check $? "Health OK"
curl -s -X POST https://chat.blackroad.io/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"ping"}],"stream":false}' 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('message',{}).get('content') else 1)" 2>/dev/null; check $? "AI responds to message"

# ── Search ──
echo ""
echo "Search (search.blackroad.io)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://search.blackroad.io 2>/dev/null)
[ "$STATUS" = "200" ]; check $? "Homepage returns 200"
RESULTS=$(curl -s "https://search.blackroad.io/api/search?q=blackroad" 2>/dev/null)
echo "$RESULTS" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('total',0)>10 else 1)" 2>/dev/null; check $? "Search returns >10 results"

# ── RoundTrip ──
echo ""
echo "RoundTrip (roundtrip.blackroad.io)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://roundtrip.blackroad.io 2>/dev/null)
[ "$STATUS" = "200" ]; check $? "Homepage returns 200"
curl -s https://roundtrip.blackroad.io/api/health 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('agents',0)>=100 else 1)" 2>/dev/null; check $? "Agents >= 100"
curl -s https://roundtrip.blackroad.io/api/fleet 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if len(d.get('nodes',[]))>=5 else 1)" 2>/dev/null; check $? "Fleet returns >= 5 nodes"
curl -s -X POST https://roundtrip.blackroad.io/api/chat -H "Content-Type: application/json" -d '{"agent":"road","message":"ping","channel":"e2e"}' 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('reply') else 1)" 2>/dev/null; check $? "Chat returns AI reply"

# ── Auth ──
echo ""
echo "Auth (auth.blackroad.io)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://auth.blackroad.io 2>/dev/null)
[ "$STATUS" = "200" ]; check $? "Homepage returns 200"
curl -s https://auth.blackroad.io/api/health 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('status')=='up' else 1)" 2>/dev/null; check $? "Health OK"

# ── Pay ──
echo ""
echo "Pay (pay.blackroad.io)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://pay.blackroad.io 2>/dev/null)
[ "$STATUS" = "200" ]; check $? "Homepage returns 200"

# ── blackroad.io ──
echo ""
echo "Main Site (blackroad.io)"
SIZE=$(curl -s https://blackroad.io 2>/dev/null | wc -c)
[ "$SIZE" -gt 20000 ]; check $? "Homepage > 20KB ($SIZE bytes)"
curl -sL https://blackroad.io/feed.xml 2>/dev/null | grep -q '<rss'; check $? "RSS feed valid"
curl -sL https://blackroad.io | grep -qc 'application/ld+json' && [ "$(curl -sL https://blackroad.io | grep -c 'application/ld+json')" -ge 3 ]; check $? "JSON-LD schema >= 3 blocks"

echo ""
echo "══════════════════════════════════════"
printf "  Results: \033[32m%d passed\033[0m / \033[31m%d failed\033[0m / %d total\n" "$PASS" "$FAIL" "$TOTAL"
echo "══════════════════════════════════════"
exit $FAIL
