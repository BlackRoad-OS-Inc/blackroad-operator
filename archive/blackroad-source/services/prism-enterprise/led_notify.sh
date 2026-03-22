#!/usr/bin/env bash
# Usage: led_notify.sh emotion [ttl]
# emotion: ok|busy|error|thinking|celebrate|help
set -euo pipefail
EMO="${1:-ok}"; TTL="${2:-10}"
BASE="${LED_BASE:-http://127.0.0.1:4000}"
KEY="${LED_KEY:-}"  # set if BASE is not loopback
DEVICE_ID="${LED_DEVICE_ID:-pi-01}"

hdr=(-H 'content-type: application/json')
[ -n "$KEY" ] && hdr+=(-H "X-BlackRoad-Key: $KEY")

curl -sS "${hdr[@]}" \
  -d "{\"type\":\"led.emotion\",\"emotion\":\"$EMO\",\"ttl_s\":$TTL}" \
  "$BASE/api/devices/$DEVICE_ID/command" >/dev/null || true
