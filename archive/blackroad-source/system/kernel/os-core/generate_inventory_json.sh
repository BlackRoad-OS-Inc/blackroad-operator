#!/bin/bash
#
# generate_inventory_json.sh
#
# Aggregates device census from entire BlackRoad mesh.
# Runs from Mac (operator), SSH to all known hosts, collects device info.
# Outputs: data/inventory.json
#
# Usage:
#   ./generate_inventory_json.sh [--subnet 192.168.4.0/24] [--scan]
#
# Options:
#   --subnet CIDR    Override default subnet for discovery scan
#   --scan           Run network discovery scan to find unknown devices
#   --ssh-user USER  Override SSH username (default: alexa)
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="$PROJECT_ROOT/data"
OUTPUT_FILE="$DATA_DIR/inventory.json"
TEMP_DIR="$(mktemp -d)"
trap "rm -rf $TEMP_DIR" EXIT

# Defaults
DEFAULT_SUBNET="192.168.4.0/24"
SSH_USER="${SSH_USER:-alexa}"
RUN_SCAN=false
SUBNET="$DEFAULT_SUBNET"

# Parse args
while [ $# -gt 0 ]; do
  case "$1" in
    --subnet)
      SUBNET="$2"
      shift 2
      ;;
    --scan)
      RUN_SCAN=true
      shift
      ;;
    --ssh-user)
      SSH_USER="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [--subnet CIDR] [--scan] [--ssh-user USER]"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

# Ensure data dir exists
mkdir -p "$DATA_DIR"

echo "=== BlackRoad Device Census ===" >&2
echo "Subnet: $SUBNET" >&2
echo "SSH user: $SSH_USER" >&2
echo "" >&2

# --- Step 1: Discover local device (Mac operator) ---
echo "[1/4] Discovering local device (Mac)..." >&2
LOCAL_JSON="$TEMP_DIR/local.json"
if [ -f "$SCRIPT_DIR/discover_local_device.sh" ]; then
  "$SCRIPT_DIR/discover_local_device.sh" --role "mac-operator" --notes "BlackRoad operator console" > "$LOCAL_JSON"
else
  echo "Error: discover_local_device.sh not found" >&2
  exit 1
fi

# --- Step 2: Build known hosts list ---
echo "[2/4] Building known hosts list..." >&2

# Known BlackRoad nodes (from ARP scan + your infra)
KNOWN_HOSTS=(
  "192.168.4.38:lucidia:Lucidia breath engine Pi"
  "192.168.4.64:blackroad-pi:BlackRoad node"
  "192.168.4.49:alice:Alice Pi node"
  "192.168.4.68:iphone-koder:iPhone Koder (Pyto)"
)

# Optional: Add hosts from file if it exists
HOSTS_FILE="$DATA_DIR/mesh-hosts.txt"
if [ -f "$HOSTS_FILE" ]; then
  echo "  Reading additional hosts from $HOSTS_FILE" >&2
  while IFS= read -r line; do
    # Skip comments and empty lines
    line="$(echo "$line" | sed 's/#.*//' | xargs)"
    [ -z "$line" ] && continue

    # Expected format: IP[:hostname[:notes]]
    KNOWN_HOSTS+=("$line")
  done < "$HOSTS_FILE"
fi

# --- Step 3: Network discovery scan (optional) ---
if [ "$RUN_SCAN" = true ]; then
  echo "[3/4] Running network discovery scan on $SUBNET..." >&2
  SCAN_FILE="$TEMP_DIR/scan.txt"

  # Use nmap if available, otherwise fall back to ping sweep
  if command -v nmap >/dev/null 2>&1; then
    echo "  Using nmap for host discovery..." >&2
    sudo nmap -sn -oG - "$SUBNET" | grep "Up" | awk '{print $2}' > "$SCAN_FILE" || true
  else
    echo "  Using ping sweep (slower)..." >&2
    # Extract base IP and range
    BASE_IP="$(echo "$SUBNET" | cut -d/ -f1 | cut -d. -f1-3)"
    for i in $(seq 1 254); do
      IP="$BASE_IP.$i"
      if ping -c 1 -W 1 "$IP" >/dev/null 2>&1; then
        echo "$IP" >> "$SCAN_FILE"
      fi
    done
  fi

  # Add discovered IPs to known hosts if not already present
  if [ -f "$SCAN_FILE" ]; then
    while IFS= read -r ip; do
      # Check if IP already in KNOWN_HOSTS
      FOUND=false
      for host in "${KNOWN_HOSTS[@]}"; do
        if echo "$host" | grep -q "^$ip:"; then
          FOUND=true
          break
        fi
      done

      if [ "$FOUND" = false ]; then
        echo "  Discovered new host: $ip" >&2
        KNOWN_HOSTS+=("$ip::Discovered during scan")
      fi
    done < "$SCAN_FILE"
  fi
else
  echo "[3/4] Skipping network scan (use --scan to enable)..." >&2
fi

# --- Step 4: SSH to each host and collect device info ---
echo "[4/4] Collecting device info from remote hosts..." >&2

DEVICES_JSON="["
FIRST=true

# Add local device first
if [ -f "$LOCAL_JSON" ]; then
  DEVICES_JSON="$DEVICES_JSON$(cat "$LOCAL_JSON")"
  FIRST=false
fi

# Process each known host
for host_entry in "${KNOWN_HOSTS[@]}"; do
  # Parse entry: IP[:hostname[:notes]]
  IP="$(echo "$host_entry" | cut -d: -f1)"
  HOSTNAME_HINT="$(echo "$host_entry" | cut -d: -f2 -s)"
  NOTES_HINT="$(echo "$host_entry" | cut -d: -f3- -s)"

  echo "  Probing $IP ($HOSTNAME_HINT)..." >&2

  # Test SSH connectivity first
  SSH_OPTS="-o ConnectTimeout=3 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR"

  if ssh $SSH_OPTS "$SSH_USER@$IP" "echo 'SSH OK'" >/dev/null 2>&1; then
    echo "    SSH connected, running discovery..." >&2

    # Copy discovery script to remote host
    REMOTE_SCRIPT="/tmp/discover_local_device_$$.sh"
    scp $SSH_OPTS "$SCRIPT_DIR/discover_local_device.sh" "$SSH_USER@$IP:$REMOTE_SCRIPT" >/dev/null 2>&1

    # Run discovery script
    REMOTE_JSON="$TEMP_DIR/remote_${IP}.json"
    if ssh $SSH_OPTS "$SSH_USER@$IP" "chmod +x $REMOTE_SCRIPT && $REMOTE_SCRIPT --notes '$NOTES_HINT'" > "$REMOTE_JSON" 2>/dev/null; then
      # Add to devices array
      if [ "$FIRST" = false ]; then
        DEVICES_JSON="$DEVICES_JSON,"
      fi
      DEVICES_JSON="$DEVICES_JSON$(cat "$REMOTE_JSON")"
      FIRST=false
      echo "    ✓ Success" >&2
    else
      echo "    ✗ Discovery script failed" >&2
    fi

    # Cleanup remote script
    ssh $SSH_OPTS "$SSH_USER@$IP" "rm -f $REMOTE_SCRIPT" >/dev/null 2>&1 || true
  else
    echo "    ✗ SSH not reachable" >&2

    # Add minimal entry for unreachable host
    if [ "$FIRST" = false ]; then
      DEVICES_JSON="$DEVICES_JSON,"
    fi
    DEVICES_JSON="$DEVICES_JSON{\"hostname\":\"$HOSTNAME_HINT\",\"lan_ip\":\"$IP\",\"role\":\"unreachable\",\"ssh_reachable\":false,\"notes\":\"$NOTES_HINT\"}"
    FIRST=false
  fi
done

DEVICES_JSON="$DEVICES_JSON]"

# --- Step 5: Write final inventory ---
echo "" >&2
echo "Writing inventory to $OUTPUT_FILE..." >&2

cat > "$OUTPUT_FILE" <<EOF
{
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "generated_by": "$(whoami)@$(hostname -s)",
  "subnet": "$SUBNET",
  "device_count": $(echo "$DEVICES_JSON" | jq '. | length'),
  "devices": $DEVICES_JSON
}
EOF

# Pretty-print with jq if available
if command -v jq >/dev/null 2>&1; then
  TMP_PRETTY="$TEMP_DIR/pretty.json"
  jq '.' "$OUTPUT_FILE" > "$TMP_PRETTY"
  mv "$TMP_PRETTY" "$OUTPUT_FILE"
fi

echo "✓ Inventory generated: $OUTPUT_FILE" >&2
echo "" >&2
echo "Summary:" >&2
if command -v jq >/dev/null 2>&1; then
  jq -r '.devices[] | "  \(.role): \(.hostname) (\(.lan_ip))"' "$OUTPUT_FILE" >&2
else
  cat "$OUTPUT_FILE" >&2
fi
