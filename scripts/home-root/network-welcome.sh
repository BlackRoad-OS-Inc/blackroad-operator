#!/bin/bash
# BlackRoad Network Welcome Center
# Watches for new devices joining the network and welcomes them to Slack
# Cron: */5 * * * * /Users/alexa/network-welcome.sh

set -e

KNOWN_DEVICES_FILE="$HOME/.blackroad/network/known-devices.json"
SLACK_WEBHOOK_URL="https://blackroad-slack.amundsonalexa.workers.dev/post"
SLACK_ASK_URL="https://blackroad-slack.amundsonalexa.workers.dev/ask"
LOG_FILE="$HOME/.blackroad/network/welcome.log"

mkdir -p "$(dirname "$KNOWN_DEVICES_FILE")"

# Initialize known devices file if missing
if [ ! -f "$KNOWN_DEVICES_FILE" ]; then
  cat > "$KNOWN_DEVICES_FILE" << 'EOF'
{
  "devices": {
    "192.168.4.1":   { "name": "Eero",       "emoji": "📡", "type": "router",     "welcomed": true },
    "192.168.4.22":  { "name": "Spark",       "emoji": "⚡", "type": "iot",        "welcomed": true },
    "192.168.4.26":  { "name": "BigScreen",   "emoji": "📺", "type": "roku",       "welcomed": true },
    "192.168.4.27":  { "name": "AppleTV",     "emoji": "🍎", "type": "appletv",    "welcomed": true },
    "192.168.4.28":  { "name": "Alexandria",  "emoji": "📚", "type": "mac",        "welcomed": true },
    "192.168.4.33":  { "name": "Streamer",    "emoji": "🎬", "type": "roku",       "welcomed": true },
    "192.168.4.38":  { "name": "Lucidia",     "emoji": "💡", "type": "pi",         "welcomed": true },
    "192.168.4.44":  { "name": "Pixel",       "emoji": "🟢", "type": "iot",        "welcomed": true },
    "192.168.4.45":  { "name": "Morse",       "emoji": "📟", "type": "iot",        "welcomed": true },
    "192.168.4.49":  { "name": "Alice",       "emoji": "🌐", "type": "pi",         "welcomed": true },
    "192.168.4.96":  { "name": "Cecilia",     "emoji": "🧠", "type": "pi",         "welcomed": true },
    "192.168.4.98":  { "name": "Aria",        "emoji": "🎵", "type": "pi",         "welcomed": true },
    "192.168.4.101": { "name": "Octavia",     "emoji": "🐙", "type": "pi",         "welcomed": true }
  },
  "last_scan": ""
}
EOF
fi

# Scan the network
ALIVE_IPS=$(nmap -sn 192.168.4.0/24 2>/dev/null | grep "Nmap scan report" | awk '{print $5}' | sort)

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

for ip in $ALIVE_IPS; do
  # Check if this IP is known
  IS_KNOWN=$(python3 -c "
import json,sys
with open('$KNOWN_DEVICES_FILE') as f:
    d = json.load(f)
print('yes' if '$ip' in d.get('devices',{}) else 'no')
" 2>/dev/null)

  if [ "$IS_KNOWN" = "no" ]; then
    # NEW DEVICE DETECTED!
    MAC=$(arp -a | grep "($ip)" | awk '{print $4}' | head -1)
    MAC=${MAC:-"unknown"}

    # Try to identify vendor
    MAC_PREFIX=$(echo "$MAC" | cut -d: -f1-3)
    VENDOR=$(curl -s "https://api.macvendors.com/$MAC_PREFIX" 2>/dev/null | head -1)
    # Clean up vendor response
    echo "$VENDOR" | grep -q "errors" && VENDOR="Unknown"
    [ -z "$VENDOR" ] && VENDOR="Unknown"

    # Check for open ports (quick)
    PORTS=""
    for port in 80 443 8060 22 5000 7000; do
      (echo >/dev/tcp/$ip/$port) 2>/dev/null && PORTS="$PORTS $port"
    done

    # Detect device type
    DEVICE_TYPE="unknown"
    EMOJI="🆕"
    SUGGESTED_NAME=""

    # Roku?
    ROKU_INFO=$(curl -s "http://$ip:8060/query/device-info" -m 2 2>/dev/null)
    if echo "$ROKU_INFO" | grep -q "Roku"; then
      DEVICE_TYPE="roku"
      EMOJI="📺"
      ROKU_MODEL=$(echo "$ROKU_INFO" | grep -o '<model-name>[^<]*' | sed 's/<model-name>//')
      SUGGESTED_NAME="Roku-${ip##*.}"
    fi

    # Apple device?
    if echo "$VENDOR" | grep -qi "apple"; then
      DEVICE_TYPE="apple"
      EMOJI="🍎"
      SUGGESTED_NAME="Apple-${ip##*.}"
    fi

    # Raspberry Pi?
    if echo "$VENDOR" | grep -qi "raspberry"; then
      DEVICE_TYPE="pi"
      EMOJI="🍓"
      SUGGESTED_NAME="Pi-${ip##*.}"
    fi

    # Random MAC = phone/tablet
    FIRST_BYTE=$(echo "$MAC" | cut -d: -f1)
    IS_RANDOM=$(python3 -c "print('yes' if int('$FIRST_BYTE', 16) & 0x02 else 'no')" 2>/dev/null)
    if [ "$IS_RANDOM" = "yes" ]; then
      DEVICE_TYPE="mobile"
      EMOJI="📱"
      SUGGESTED_NAME="Mobile-${ip##*.}"
    fi

    # IoT (no ports, private MAC)
    if [ -z "$PORTS" ] && [ "$DEVICE_TYPE" = "unknown" ]; then
      DEVICE_TYPE="iot"
      EMOJI="🔌"
      SUGGESTED_NAME="IoT-${ip##*.}"
    fi

    [ -z "$SUGGESTED_NAME" ] && SUGGESTED_NAME="Device-${ip##*.}"

    # Welcome message to Slack!
    WELCOME_MSG="🎉 *NEW DEVICE DETECTED!*

${EMOJI} *${SUGGESTED_NAME}* just joined the network!
  IP: \`$ip\`
  MAC: \`$MAC\`
  Vendor: $VENDOR
  Type: $DEVICE_TYPE
  Open ports:${PORTS:-" none"}
  First seen: $NOW

_Welcome to the BlackRoad, friend. You're home now._"

    curl -s -X POST "$SLACK_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"text\": $(echo "$WELCOME_MSG" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}" \
      >/dev/null 2>&1

    # Have Hestia (hearth keeper) welcome them
    curl -s -X POST "$SLACK_ASK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"agent\": \"hestia\", \"message\": \"A new device just joined our home network: ${SUGGESTED_NAME} at ${ip} (${VENDOR}, type: ${DEVICE_TYPE}). Welcome them warmly in one sentence.\", \"slack\": true}" \
      >/dev/null 2>&1

    # Add to known devices
    python3 -c "
import json
with open('$KNOWN_DEVICES_FILE', 'r') as f:
    data = json.load(f)
data['devices']['$ip'] = {
    'name': '$SUGGESTED_NAME',
    'emoji': '$EMOJI',
    'type': '$DEVICE_TYPE',
    'mac': '$MAC',
    'vendor': '$VENDOR',
    'ports': '${PORTS}'.strip(),
    'first_seen': '$NOW',
    'welcomed': True
}
data['last_scan'] = '$NOW'
with open('$KNOWN_DEVICES_FILE', 'w') as f:
    json.dump(data, f, indent=2)
" 2>/dev/null

    echo "[$NOW] WELCOMED: $ip ($SUGGESTED_NAME, $VENDOR, $DEVICE_TYPE)" >> "$LOG_FILE"
  fi
done

# Check for devices that went away (were known, now offline)
python3 << PYEOF
import json, subprocess, sys

with open("$KNOWN_DEVICES_FILE") as f:
    data = json.load(f)

alive_set = set("$ALIVE_IPS".split())
gone = []
back = []

for ip, info in data["devices"].items():
    was_online = info.get("online", True)
    is_online = ip in alive_set

    if was_online and not is_online and info.get("type") not in ("mobile",):
        gone.append(f"{info.get('emoji','?')} *{info['name']}* ({ip})")
        data["devices"][ip]["online"] = False
    elif not was_online and is_online:
        back.append(f"{info.get('emoji','?')} *{info['name']}* ({ip})")
        data["devices"][ip]["online"] = True

with open("$KNOWN_DEVICES_FILE", "w") as f:
    json.dump(data, f, indent=2)

# Report comings and goings (only if something changed)
if gone:
    msg = "👋 *Devices left the network:*\\n" + "\\n".join(f"  {g}" for g in gone)
    subprocess.run(["curl", "-s", "-X", "POST", "$SLACK_WEBHOOK_URL",
        "-H", "Content-Type: application/json",
        "-d", json.dumps({"text": msg})], capture_output=True)

if back:
    msg = "🏠 *Welcome back!*\\n" + "\\n".join(f"  {b}" for b in back)
    subprocess.run(["curl", "-s", "-X", "POST", "$SLACK_WEBHOOK_URL",
        "-H", "Content-Type: application/json",
        "-d", json.dumps({"text": msg})], capture_output=True)
PYEOF
