#!/bin/bash
# Real-time Slack alerts for fleet/service issues
# Posts to SLACK_ALERTS_WEBHOOK_URL (or falls back to SLACK_WEBHOOK_URL)
#
# Usage: slack-alert.sh              — auto-detect issues from latest KPI data
#        slack-alert.sh "message"    — post a custom alert
#        slack-alert.sh git-patrol   — post git-agent patrol results

source "$(dirname "$0")/../lib/common.sh"
source "$(dirname "$0")/../lib/slack.sh"

slack_load

if ! slack_ready; then
  err "Slack not configured. Run: bash scripts/setup-slack.sh"
  exit 1
fi

# ─── Custom message mode ─────────────────────────────────────────────
if [ -n "${1:-}" ] && [ "$1" != "git-patrol" ]; then
  payload=$(python3 -c "
import json, sys
msg = ' '.join(sys.argv[1:])
blocks = [
    {'type': 'section', 'text': {'type': 'mrkdwn', 'text': f':rotating_light: *BlackRoad Alert*\n{msg}'}},
    {'type': 'context', 'elements': [{'type': 'mrkdwn', 'text': '$(date -u +%Y-%m-%dT%H:%M:%SZ) | slack-alert.sh'}]}
]
print(json.dumps({'blocks': blocks}))
" "$@")
  slack_alert "$payload"
  ok "Alert posted: $*"
  exit 0
fi

# ─── Git patrol mode ─────────────────────────────────────────────────
if [ "${1:-}" = "git-patrol" ]; then
  AGENT_SCRIPT="$(dirname "$0")/../agents/git-agent.sh"
  if [ ! -x "$AGENT_SCRIPT" ]; then
    err "git-agent.sh not found"
    exit 1
  fi

  patrol_output=$(bash "$AGENT_SCRIPT" health 2>&1)
  fleet_output=$(bash "$AGENT_SCRIPT" fleet status 2>&1)

  payload=$(python3 -c "
import json, sys, re

patrol = '''$patrol_output'''
fleet = '''$fleet_output'''

# Parse health output
issues = []
for line in patrol.split('\n'):
    if '✗' in line:
        # Strip ANSI codes
        clean = re.sub(r'\033\[[0-9;]*m', '', line).strip()
        if clean:
            issues.append(clean.lstrip('✗ '))

fleet_lines = []
for line in fleet.split('\n'):
    clean = re.sub(r'\033\[[0-9;]*m', '', line).strip()
    if 'repos=' in clean:
        fleet_lines.append(clean.lstrip('✓ '))

health_text = '\n'.join(f'• {i}' for i in issues) if issues else ':white_check_mark: All repos clean'
fleet_text = '\n'.join(f'• {l}' for l in fleet_lines) if fleet_lines else 'No fleet data'

blocks = [
    {'type': 'header', 'text': {'type': 'plain_text', 'text': 'Git Agent Patrol Report'}},
    {'type': 'section', 'fields': [
        {'type': 'mrkdwn', 'text': f':mag: *Local Repos*\n{health_text}'},
        {'type': 'mrkdwn', 'text': f':satellite: *Fleet Repos*\n{fleet_text}'},
    ]},
    {'type': 'context', 'elements': [
        {'type': 'mrkdwn', 'text': '$(date -u +%Y-%m-%dT%H:%M:%SZ) | git-agent patrol'}
    ]}
]
print(json.dumps({'blocks': blocks}))
")

  slack_alert "$payload"
  ok "Git patrol posted to Slack"
  exit 0
fi

# ─── Auto-detect mode — scan latest KPIs for alertable issues ────────
DAILY=$(today_file)
[ ! -f "$DAILY" ] && { err "No daily data"; exit 1; }

export DAILY
alerts=$(python3 << 'PYEOF'
import json, os

with open(os.environ['DAILY']) as f:
    s = json.load(f).get('summary', {})

alerts = []

# Fleet nodes down
offline = s.get('fleet_offline', [])
if offline:
    alerts.append({
        'severity': 'critical',
        'emoji': ':rotating_light:',
        'text': f"*Nodes offline*: {', '.join(offline)}"
    })

# Fleet degraded
online = s.get('fleet_online', 0)
total = s.get('fleet_total', 4)
if online < total and not offline:
    alerts.append({
        'severity': 'warning',
        'emoji': ':large_yellow_circle:',
        'text': f"*Fleet degraded*: {online}/{total} online"
    })

# Failed systemd units
failed = s.get('failed_units', 0)
if failed > 0:
    alerts.append({
        'severity': 'warning',
        'emoji': ':warning:',
        'text': f"*{failed} failed systemd units*"
    })

# Throttled nodes (undervoltage/thermal)
throttled = s.get('throttled_nodes', [])
if throttled:
    alerts.append({
        'severity': 'warning',
        'emoji': ':zap:',
        'text': f"*Throttled nodes*: {', '.join(throttled)}"
    })

# High temperature
temp = s.get('avg_temp_c', 0)
if temp > 70:
    alerts.append({
        'severity': 'critical' if temp > 80 else 'warning',
        'emoji': ':fire:',
        'text': f"*High fleet temp*: {temp:.1f}C avg"
    })

# Disk pressure (fleet)
disk_used = s.get('fleet_disk_used_gb', 0)
disk_total = s.get('fleet_disk_total_gb', 1)
if disk_total > 0 and (disk_used / disk_total) > 0.85:
    pct = round(disk_used / disk_total * 100)
    alerts.append({
        'severity': 'warning',
        'emoji': ':floppy_disk:',
        'text': f"*Fleet disk {pct}%*: {disk_used}/{disk_total} GB"
    })

# Mac disk pressure
mac_pct = s.get('mac_disk_pct', 0)
if mac_pct > 85:
    alerts.append({
        'severity': 'warning',
        'emoji': ':computer:',
        'text': f"*Mac disk at {mac_pct}%*"
    })

# Low autonomy score
score = s.get('autonomy_score', 0)
if score < 30:
    alerts.append({
        'severity': 'warning',
        'emoji': ':robot_face:',
        'text': f"*Low autonomy score*: {score}/100"
    })

# Too many service restarts (possible crash loop)
restarts = s.get('service_restarts_today', 0)
if restarts > 100:
    alerts.append({
        'severity': 'warning',
        'emoji': ':repeat:',
        'text': f"*{restarts} service restarts today* — possible crash loop"
    })

print(json.dumps(alerts))
PYEOF
)

if [ "$alerts" = "[]" ]; then
  log "No alerts to send"
  exit 0
fi

# Build and send alert payload
payload=$(python3 -c "
import json

alerts = json.loads('''$alerts''')

text_lines = []
for a in alerts:
    key = a['text']
    text_lines.append(f\"{a['emoji']} {a['text']}\")

severity = 'critical' if any(a['severity'] == 'critical' for a in alerts) else 'warning'
header_emoji = ':rotating_light:' if severity == 'critical' else ':warning:'

blocks = [
    {'type': 'header', 'text': {'type': 'plain_text', 'text': f'{header_emoji} BlackRoad Fleet Alert'}},
    {'type': 'section', 'text': {'type': 'mrkdwn', 'text': chr(10).join(text_lines)}},
    {'type': 'context', 'elements': [
        {'type': 'mrkdwn', 'text': '$(date -u +%Y-%m-%dT%H:%M:%SZ) | slack-alert.sh auto-detect'}
    ]}
]
print(json.dumps({'blocks': blocks}))
")

# Check dedup for the overall alert set
alert_key=$(echo "$alerts" | md5 2>/dev/null || echo "$alerts" | md5sum | cut -d' ' -f1)
if slack_dedup "$alert_key"; then
  slack_alert "$payload"
  ok "Alert posted to Slack ($(echo "$alerts" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))') issues)"
else
  log "Alert suppressed (already sent within 1 hour)"
fi
