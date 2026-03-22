#!/bin/bash
# Collect Cloudflare KPIs: D1, KV, R2, Workers, Pages, Tunnels

source "$(dirname "$0")/../lib/common.sh"

log "Collecting Cloudflare KPIs..."

OUT=$(snapshot_file cloudflare)

CF_ACCOUNT="848cf0b18d51e0170e0d1537aec3505a"

# D1 databases
d1_count=0
d1_total_size=0
d1_json="[]"
d1_raw=$(npx wrangler d1 list --json 2>/dev/null || echo '[]')
if [ -n "$d1_raw" ]; then
  d1_count=$(echo "$d1_raw" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d))" 2>/dev/null || echo 0)
  d1_json=$(echo "$d1_raw" | python3 -c "
import json, sys
dbs = json.load(sys.stdin)
print(json.dumps([{'name': d.get('name',''), 'uuid': d.get('uuid','')} for d in dbs]))
" 2>/dev/null || echo '[]')
fi
ok "D1: $d1_count databases"

# KV namespaces
kv_count=0
kv_raw=$(npx wrangler kv namespace list 2>/dev/null || echo '[]')
if [ -n "$kv_raw" ]; then
  kv_count=$(echo "$kv_raw" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))" 2>/dev/null || echo 0)
fi
ok "KV: $kv_count namespaces"

# R2 buckets
r2_count=0
# R2 outputs text, not JSON — count "name:" lines
r2_count=$(npx wrangler r2 bucket list 2>/dev/null | grep -c "^name:" || echo 0)
ok "R2: $r2_count buckets"

# Pages projects (table output, count data rows)
pages_count=$(npx wrangler pages project list 2>/dev/null | grep -c "│" || echo 0)
# Subtract header rows (2 per table: header + separator)
pages_count=$((pages_count > 2 ? pages_count - 2 : 0))
ok "Pages: $pages_count projects"

# D1 total size
d1_total_size_kb=0
if [ -n "$d1_raw" ] && [ "$d1_raw" != "[]" ]; then
  d1_total_size_kb=$(echo "$d1_raw" | python3 -c "
import json, sys
dbs = json.load(sys.stdin)
total = sum(d.get('file_size', 0) for d in dbs)
print(total // 1024)
" 2>/dev/null || echo 0)
fi

cat > "$OUT" << ENDJSON
{
  "source": "cloudflare",
  "collected_at": "$TIMESTAMP",
  "date": "$TODAY",
  "d1": {
    "count": $d1_count,
    "total_size_kb": $d1_total_size_kb,
    "databases": $d1_json
  },
  "kv": {
    "count": $kv_count
  },
  "r2": {
    "count": $r2_count
  },
  "pages": {
    "count": $pages_count
  },
  "account_id": "$CF_ACCOUNT"
}
ENDJSON

ok "Cloudflare: ${d1_count} D1, ${kv_count} KV, ${r2_count} R2, ${pages_count} Pages"
