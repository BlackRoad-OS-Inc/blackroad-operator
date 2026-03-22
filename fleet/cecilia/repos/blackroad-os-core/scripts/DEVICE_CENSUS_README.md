# BlackRoad Device Census Scripts

Quick reference for network discovery and device inventory scripts.

## Scripts Overview

### 1. `discover_local_device.sh`
**Purpose:** Discover and report info about the local device (Mac/Pi/Jetson)

**Usage:**
```bash
# Basic usage
./discover_local_device.sh

# With custom role and notes
./discover_local_device.sh --role "pi-node" --notes "Alice Pi"
```

**Output:** JSON object with device details (hostname, IPs, MAC, role, etc.)

**Platforms:** macOS, Linux (Debian/Ubuntu), Raspberry Pi OS, NVIDIA JetPack

---

### 2. `generate_inventory_json.sh`
**Purpose:** Aggregate device census from entire BlackRoad mesh via SSH

**Usage:**
```bash
# Basic census (known hosts only)
./generate_inventory_json.sh

# With network scanning
./generate_inventory_json.sh --scan

# Custom subnet
./generate_inventory_json.sh --subnet 192.168.4.0/24 --scan

# Custom SSH user
./generate_inventory_json.sh --ssh-user pi
```

**Output:** `data/inventory.json` with all discovered devices

**Requirements:**
- SSH access to remote hosts
- `discover_local_device.sh` in same directory
- Optional: `jq` for pretty JSON output
- Optional: `nmap` for network scanning

---

### 3. `find_jetson_orin.sh`
**Purpose:** Specialized script to locate NVIDIA Jetson Orin on network

**Usage:**
```bash
# Default subnet (192.168.4.0/24)
./find_jetson_orin.sh

# Custom subnet
./find_jetson_orin.sh 192.168.10.0/24
```

**Detection methods:**
1. ARP table scan for NVIDIA MAC prefixes
2. mDNS/DNS hostname resolution
3. Network scan with nmap (if available)
4. SSH probe for `/etc/nv_tegra_release`

**Output:** IP address and details of detected Jetson Orin

---

## Quick Start

### First-time setup

1. **Run local discovery to test:**
   ```bash
   ./discover_local_device.sh
   ```

2. **Create mesh hosts file:**
   ```bash
   cat > ../data/mesh-hosts.txt <<EOF
   192.168.4.38:lucidia:Lucidia breath engine Pi
   192.168.4.64:blackroad-pi:BlackRoad node
   192.168.4.49:alice:Alice Pi node
   EOF
   ```

3. **Find Jetson Orin (if not yet discovered):**
   ```bash
   ./find_jetson_orin.sh
   ```

4. **Run full census:**
   ```bash
   ./generate_inventory_json.sh --scan
   ```

5. **View results:**
   ```bash
   cat ../data/inventory.json
   jq -r '.devices[] | "\(.role): \(.hostname) (\(.lan_ip))"' ../data/inventory.json
   ```

---

## Configuration Files

### `data/mesh-hosts.txt`
List of known hosts to inventory. Format:
```
IP:hostname:notes
```

Example:
```
192.168.4.38:lucidia:Lucidia breath engine Pi
192.168.4.64:blackroad-pi:BlackRoad node
192.168.4.55:jetson-orin:NVIDIA Jetson Orin edge compute
```

### `data/inventory.json`
Output file from `generate_inventory_json.sh`. Contains:
- Metadata (timestamp, subnet, device count)
- Array of device objects with full details

---

## Common Tasks

### Find all Raspberry Pi nodes
```bash
jq '.devices[] | select(.role == "pi-node")' ../data/inventory.json
```

### Find SSH-reachable devices
```bash
jq '.devices[] | select(.ssh_reachable == true)' ../data/inventory.json
```

### Get device count by role
```bash
jq -r '.devices | group_by(.role) | .[] | "\(.[0].role): \(length)"' ../data/inventory.json
```

### Export to CSV
```bash
jq -r '.devices[] | [.hostname, .lan_ip, .role, .os, .ssh_reachable] | @csv' ../data/inventory.json > devices.csv
```

---

## Troubleshooting

### "Permission denied" when running scripts
```bash
chmod +x *.sh
```

### "SSH connection refused"
Enable SSH on target device:
- **macOS:** `sudo systemsetup -setremotelogin on`
- **Linux:** `sudo systemctl enable ssh && sudo systemctl start ssh`

### "jq: command not found"
Install jq for JSON processing:
- **macOS:** `brew install jq`
- **Linux:** `sudo apt install jq`

### "nmap: command not found"
Install nmap for network scanning:
- **macOS:** `brew install nmap`
- **Linux:** `sudo apt install nmap`

### Jetson Orin not found
1. Check physical connection (Ethernet cable)
2. Check router DHCP leases
3. Connect via HDMI and check `ip addr show`
4. Ensure SSH is enabled

---

## Environment Variables

### `SSH_USER`
Override default SSH username:
```bash
SSH_USER=pi ./generate_inventory_json.sh
```

---

## Integration Examples

### Cron job for periodic census
```bash
# Add to crontab: crontab -e
0 */6 * * * cd ~/blackroad-sandbox/scripts && ./generate_inventory_json.sh --scan >> ../logs/census.log 2>&1
```

### Slack/Discord notification on new devices
```bash
#!/bin/bash
PREV_COUNT=$(jq '.device_count' ../data/inventory_prev.json)
./generate_inventory_json.sh
NEW_COUNT=$(jq '.device_count' ../data/inventory.json)

if [ "$NEW_COUNT" -gt "$PREV_COUNT" ]; then
  NEW_DEVICES=$((NEW_COUNT - PREV_COUNT))
  curl -X POST "$SLACK_WEBHOOK" -d "{\"text\": \"🚨 $NEW_DEVICES new device(s) detected on BlackRoad mesh!\"}"
fi

cp ../data/inventory.json ../data/inventory_prev.json
```

### Ansible inventory export
```bash
jq -r '.devices[] | select(.ssh_reachable == true) | "\(.hostname) ansible_host=\(.lan_ip) ansible_user=alexa"' ../data/inventory.json > ../ansible/hosts.ini
```

---

## Security Notes

- Scripts use `StrictHostKeyChecking=no` for automation
  - **Only safe on trusted private networks**
  - For production, use known_hosts verification
- Network scans are non-intrusive (`-sn` host discovery only)
- Discovery scripts are read-only (no writes, no sudo)
- Store inventory.json securely (contains MAC addresses)

---

## Documentation

Full documentation: `../docs/DEVICE_CENSUS.md`

Topics covered:
- Detailed architecture
- Jetson Orin detection methods
- iPhone Pyto role and limitations
- JSON schema reference
- Advanced usage patterns
- Tailscale integration
- BlackRoad OS integration

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Test local discovery | `./discover_local_device.sh` |
| Full census | `./generate_inventory_json.sh --scan` |
| Find Jetson Orin | `./find_jetson_orin.sh` |
| View inventory | `jq '.' ../data/inventory.json` |
| List devices | `jq -r '.devices[] \| "\(.hostname): \(.lan_ip)"' ../data/inventory.json` |
| Count devices | `jq '.device_count' ../data/inventory.json` |
| Filter by role | `jq '.devices[] \| select(.role == "pi-node")' ../data/inventory.json` |

---

## Support

Issues/questions: `blackroad.systems@gmail.com` or GitHub Issues
