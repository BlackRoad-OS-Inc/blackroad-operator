#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/var/log/verizon-check.log"
STATE_FILE="/var/run/verizon-check.state"
INTERFACE="vzw0"
PING_HOST="8.8.8.8"
COUNT=3
TIMEOUT=3
ENV_FILE="/etc/default/verizon-check"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

check_conn() {
  if command -v nmcli >/dev/null 2>&1; then
    if nmcli -t -f DEVICE,STATE device status | grep -q "^${INTERFACE}:connected"; then
      return 0
    fi
  fi
  if command -v mmcli >/dev/null 2>&1; then
    if mmcli -m 0 2>/dev/null | grep -qi 'state.*connected'; then
      return 0
    fi
  fi
  return 1
}

ping_test() {
  ping -I "$INTERFACE" "$PING_HOST" -c "$COUNT" -W "$TIMEOUT" >/dev/null 2>&1
}

status="up"
if [[ -f "$STATE_FILE" ]]; then
  status=$(cat "$STATE_FILE")
fi

if ! check_conn || ! ping_test; then
  sleep 2
  if ! check_conn || ! ping_test; then
    if [[ "$status" != "down" ]]; then
      echo "VERIZON_DOWN $(timestamp)" >> "$LOG_FILE"
      if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' --data '{"text":":red_circle: Verizon LTE connection is down."}' "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
      fi
      echo "down" > "$STATE_FILE"
    fi
    exit 1
  fi
fi

if [[ "$status" == "down" ]]; then
  echo "VERIZON_RESTORED $(timestamp)" >> "$LOG_FILE"
  if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
    curl -X POST -H 'Content-type: application/json' --data '{"text":":white_check_mark: Verizon LTE connection restored."}' "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
  fi
fi

echo "up" > "$STATE_FILE"
exit 0
DEVICE=${DEVICE:-vzw0}
PING_HOST=${PING_HOST:-8.8.8.8}
LOG_FILE=/var/log/verizon-check.log
STATE_DIR=/var/run/verizon-check
STATE_FILE="$STATE_DIR/state"
FAIL_FILE="$STATE_DIR/failcount"

mkdir -p "$STATE_DIR" /var/log

# Source environment variables if present
if [ -f /etc/default/verizon-check ]; then
  # shellcheck disable=SC1091
  source /etc/default/verizon-check
fi

check_device() {
  if command -v nmcli >/dev/null 2>&1; then
    set +e
    nmcli device status | awk -v dev="$DEVICE" '$1==dev {print $3}' | grep -q "connected"
    status=$?
    set -e
    return $status
  elif command -v mmcli >/dev/null 2>&1; then
    set +e
    mmcli -m 0 | grep -q "state:.*connected"
    status=$?
    set -e
    return $status
  else
    return 0
  fi
}

ping_test() {
  set +e
  ping -I "$DEVICE" "$PING_HOST" -c3 -W3 >/dev/null 2>&1
  status=$?
  set -e
  return $status
}

prev_state=$(cat "$STATE_FILE" 2>/dev/null || echo "unknown")
fail_count=$(cat "$FAIL_FILE" 2>/dev/null || echo 0)

if ! check_device || ! ping_test; then
  fail_count=$((fail_count + 1))
  echo "$fail_count" > "$FAIL_FILE"
  if [ "$fail_count" -ge 2 ] && [ "$prev_state" != "down" ]; then
    echo "VERIZON_DOWN $(date -Is)" >> "$LOG_FILE"
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
      curl -s -X POST "$SLACK_WEBHOOK_URL" -H 'Content-type: application/json' \
        --data '{"text":":red_circle: Verizon LTE connection is down."}' >/dev/null
    fi
    echo "down" > "$STATE_FILE"
  fi
else
  if [ "$prev_state" = "down" ]; then
    echo "VERIZON_RESTORED $(date -Is)" >> "$LOG_FILE"
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
      curl -s -X POST "$SLACK_WEBHOOK_URL" -H 'Content-type: application/json' \
        --data '{"text":":white_check_mark: Verizon LTE connection restored."}' >/dev/null
    fi
  fi
  echo "up" > "$STATE_FILE"
  echo 0 > "$FAIL_FILE"
fi
