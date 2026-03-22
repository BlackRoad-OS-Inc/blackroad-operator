#!/bin/bash
# Push latest KPI data to Cloudflare KV for live resume dashboards

source "$(dirname "$0")/../lib/common.sh"

DAILY=$(today_file)

if [ ! -f "$DAILY" ]; then
  err "No daily data. Run collection first."
  exit 1
fi

log "Pushing KPIs to Cloudflare KV..."

# Build the KV payload with summary + metadata
python3 << PYEOF
import json, subprocess, sys

with open('$DAILY') as f:
    daily = json.load(f)

s = daily['summary']
s['_date'] = daily['date']
s['_collected_at'] = daily['collected_at']

payload = json.dumps(s)

# Write to temp file for wrangler
with open('/tmp/kpi-kv-payload.json', 'w') as f:
    f.write(payload)

print(f"  Payload: {len(payload)} bytes, {len(s)} keys")
PYEOF

# Push to KV namespace
wrangler kv key put "latest" --namespace-id="750d4fb38d874133aebca49b697db2ef" --path="/tmp/kpi-kv-payload.json" --remote 2>&1

if [ $? -eq 0 ]; then
  ok "KPIs pushed to KV (resume-kpis/latest)"
else
  err "Failed to push KPIs to KV"
fi
