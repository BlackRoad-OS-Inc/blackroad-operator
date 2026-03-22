# BlackRoad Device Census Guide

Complete guide for discovering and cataloging all devices in the BlackRoad mesh network.

## Overview

The BlackRoad device census system provides automated discovery and inventory management for:
- Raspberry Pi nodes (Alice, Lucidia, BR nodes)
- NVIDIA Jetson Orin (Ethernet-connected edge compute)
- macOS operator console
- iPhone Koder (Pyto-based SSH client)
- Other LAN and Tailscale devices

## Quick Start

### 1. Run Local Discovery (on any device)

```bash
# On Mac, Pi, or Jetson
./scripts/discover_local_device.sh

# With custom role/notes
./scripts/discover_local_device.sh --role "pi-node" --notes "Alice Pi"
```

### 2. Run Full Mesh Census (from Mac)

```bash
# Basic census (known hosts only)
./scripts/generate_inventory_json.sh

# With network scanning
./scripts/generate_inventory_json.sh --scan

# Custom subnet
./scripts/generate_inventory_json.sh --subnet 192.168.4.0/24 --scan

# Custom SSH user
./scripts/generate_inventory_json.sh --ssh-user pi
```

### 3. View Results

```bash
# Pretty-printed JSON
cat data/inventory.json

# Summary view
jq -r '.devices[] | "\(.role): \(.hostname) (\(.lan_ip))"' data/inventory.json
```

## Network Architecture

### Current BlackRoad Mesh

**Subnet:** 192.168.4.0/24

**Known Devices:**
- `192.168.4.28` - Mac operator console (this machine)
- `192.168.4.38` - Lucidia (Pi, breath engine)
- `192.168.4.64` - BlackRoad Pi (BR node)
- `192.168.4.49` - Alice (Pi node)
- `192.168.4.68` - iPhone Koder (Pyto SSH client)
- `192.168.4.1` - Gateway/router
- `TBD` - Jetson Orin (Ethernet, to be discovered)

**Tailscale Overlay:**
- Provides secure mesh connectivity between all nodes
- Preferred for SSH from iPhone (sandboxed Pyto)
- Each device has both LAN IP (192.168.4.x) and Tailscale IP (100.x.x.x)

## NVIDIA Jetson Orin Detection

### Hardware Overview

The Jetson Orin is an ARM-based edge compute device with:
- NVIDIA GPU (CUDA support)
- Ethernet connectivity (no WiFi by default on most models)
- Ubuntu-based OS (JetPack)
- Tegra chipset

### Detection Methods

#### 1. MAC Address Vendor Lookup

NVIDIA devices typically use these MAC prefixes:
- `48:B0:2D` - NVIDIA Jetson
- Check via ARP table: `arp -a | grep "48:b0:2d"`

#### 2. Hostname Pattern

Default Jetson hostnames:
- `jetson` (generic)
- `nvidia-desktop` (JetPack default)
- `orin` or `orin-agx` (custom)

#### 3. Tegra Release File

SSH to suspected Jetson and check:
```bash
cat /etc/nv_tegra_release
```

Example output:
```
# R35 (release), REVISION: 3.1, GCID: 32827747, BOARD: t186ref, EABI: aarch64
```

#### 4. CUDA/GPU Detection

```bash
# Check CUDA version
nvcc --version

# Check GPU info
nvidia-smi  # (if installed)

# Check device tree
cat /proc/device-tree/model
```

Expected output: `NVIDIA Jetson Orin...`

#### 5. Architecture

```bash
uname -m
# Output: aarch64 (ARM 64-bit)

dpkg --print-architecture
# Output: arm64
```

### Automatic Detection Logic

The `discover_local_device.sh` script auto-detects Jetson Orin via:

1. Check MAC vendor (48:B0:2D)
2. Check `/etc/nv_tegra_release` existence
3. Extract model info if present
4. Check for CUDA (`nvcc --version`)
5. Assign role `jetson-orin`

### Finding Jetson Orin on Your Network

If you don't know the Jetson's IP yet:

```bash
# Method 1: ARP scan (after network activity)
arp -a | grep -i nvidia
arp -a | grep "48:b0:2d"

# Method 2: Network scan with nmap
sudo nmap -sn 192.168.4.0/24 | grep -B 2 "NVIDIA"

# Method 3: Run full discovery scan
./scripts/generate_inventory_json.sh --scan

# Method 4: Ping sweep + MAC lookup
for i in {1..254}; do
  ping -c 1 -W 1 192.168.4.$i >/dev/null 2>&1 && echo "192.168.4.$i is up"
done
```

### Jetson Orin SSH Setup

Default credentials (change immediately!):
- Username: `nvidia` or `jetson`
- Password: `nvidia`

If SSH is disabled:
```bash
# Connect via serial console or HDMI+keyboard
sudo systemctl enable ssh
sudo systemctl start ssh
```

### Confirming It's the Orin

Once you SSH in:
```bash
ssh alexa@<jetson-ip>

# Run full diagnostic
cat /etc/nv_tegra_release
cat /proc/device-tree/model
nvcc --version
nvidia-smi
uname -a
```

Should show:
- Tegra release with "Orin" model
- CUDA toolkit (if installed)
- ARM aarch64 architecture
- Ubuntu 20.04 or 22.04 (typically)

## iPhone Pyto Role and Limitations

### What is Pyto?

Pyto is a Python IDE and shell for iOS with:
- Python 3.11+ runtime
- Basic Unix commands
- SSH client capabilities
- **Sandboxed environment** (no root/sudo access)

### Capabilities

✅ **What Pyto CAN do:**
- SSH to remote hosts (Pi, Jetson, Mac)
- Run Python scripts locally
- Execute remote commands via SSH
- Use Tailscale VPN
- Git operations (via SSH)
- Text file editing
- Network diagnostics (ping, traceroute)

❌ **What Pyto CANNOT do:**
- Run `sudo` commands (sandboxed)
- Install system packages (no `apt`, `brew`)
- Direct LAN scanning (use SSH to Mac instead)
- Background services/daemons
- Raw socket access (no nmap, no ARP manipulation)
- Docker (iOS limitation)

### Recommended Pyto Workflow

#### 1. Use Tailscale IPs (Not LAN)

Pyto is sandboxed and may have restricted LAN access. Always use Tailscale IPs for SSH:

```bash
# ✅ GOOD (Tailscale)
ssh alexa@100.95.120.67  # Mac via Tailscale

# ❌ BAD (may not work from Pyto)
ssh alexa@192.168.4.28   # LAN IP (router may block)
ssh alexa@127.0.0.1      # Never works (localhost ≠ remote host)
```

#### 2. Pyto as Remote Controller

Think of Pyto as a "remote control" for your Mac or Pi nodes:

```bash
# From Pyto, SSH to Mac
ssh alexa@100.95.120.67

# Then run discovery FROM the Mac
cd ~/blackroad-sandbox
./scripts/generate_inventory_json.sh --scan
```

#### 3. Pyto-Optimized Commands

```bash
# Check Tailscale status
tailscale status

# Get Tailscale IP of Mac
tailscale status | grep "blackroad-mac"

# Quick SSH test
ssh alexa@100.95.120.67 "hostname && uptime"

# Remote script execution
ssh alexa@100.95.120.67 "cd ~/blackroad-sandbox && ./scripts/discover_local_device.sh"
```

#### 4. Pyto Inventory Collection

Since Pyto can't run `discover_local_device.sh` locally (no access to iOS internals), add iPhone manually:

```bash
# On Mac, add iPhone to known hosts
echo "192.168.4.68:iphone-koder:iPhone Koder (Pyto SSH client)" >> data/mesh-hosts.txt
```

The aggregation script will mark it as "unreachable" (SSH not available on iOS) but catalog it.

### Pyto Device Info

When the aggregation script runs, iPhone will be detected via:
- MAC address: `54:4c:8a:*` (Apple vendor)
- Role: `phone` or `iphone-koder`
- SSH reachable: `false` (iOS doesn't run sshd)
- Notes: Manual entry via mesh-hosts.txt

### Pyto Best Practices

1. **Always use Tailscale IPs** for SSH from Pyto
2. **Use Mac as orchestrator** - run scans from Mac, view results on iPhone
3. **SSH key setup** - add Pyto's SSH key to Mac/Pi `~/.ssh/authorized_keys`
4. **Terminal apps** - Use Pyto or Blink Shell for better terminal experience
5. **Git workflow** - Clone repos on Mac, SSH from iPhone to edit

## Inventory Output Schema

### JSON Structure

```json
{
  "generated_at": "2025-12-12T19:00:00Z",
  "generated_by": "alexa@blackroad-mac",
  "subnet": "192.168.4.0/24",
  "device_count": 6,
  "devices": [
    {
      "hostname": "blackroad-mac",
      "lan_ip": "192.168.4.28",
      "tailscale_ip": "100.95.120.67",
      "mac_address": "b0:be:83:66:cc:10",
      "mac_vendor": "Apple",
      "role": "mac-operator",
      "os": "macos",
      "arch": "arm64",
      "ssh_reachable": true,
      "notes": "BlackRoad operator console",
      "jetson_model": "",
      "jetson_cuda": "",
      "docker_bridges": "172.17.0.0/16",
      "timestamp": "2025-12-12T19:00:00Z"
    },
    {
      "hostname": "lucidia",
      "lan_ip": "192.168.4.38",
      "tailscale_ip": "100.95.120.68",
      "mac_address": "2c:cf:67:cf:fa:17",
      "mac_vendor": "Raspberry Pi Foundation",
      "role": "pi-node",
      "os": "raspbian",
      "arch": "armv7l",
      "ssh_reachable": true,
      "notes": "Lucidia breath engine Pi",
      "jetson_model": "",
      "jetson_cuda": "",
      "docker_bridges": "",
      "timestamp": "2025-12-12T19:00:05Z"
    },
    {
      "hostname": "jetson-orin",
      "lan_ip": "192.168.4.55",
      "tailscale_ip": "100.95.120.75",
      "mac_address": "48:b0:2d:12:34:56",
      "mac_vendor": "NVIDIA (Jetson)",
      "role": "jetson-orin",
      "os": "ubuntu",
      "arch": "aarch64",
      "ssh_reachable": true,
      "notes": "Edge compute node",
      "jetson_model": "NVIDIA Jetson Orin NX",
      "jetson_cuda": "11.4",
      "docker_bridges": "172.17.0.0/16",
      "timestamp": "2025-12-12T19:00:10Z"
    }
  ]
}
```

### Field Descriptions

- `generated_at` - ISO 8601 timestamp of inventory generation
- `generated_by` - User and hostname that ran the census
- `subnet` - Network subnet scanned
- `device_count` - Total devices discovered
- `devices[]` - Array of device objects

**Device Object:**
- `hostname` - Device hostname (from `hostname -s`)
- `lan_ip` - Primary LAN IP (192.168.4.x)
- `tailscale_ip` - Tailscale VPN IP (100.x.x.x) if available
- `mac_address` - MAC address of primary interface
- `mac_vendor` - Vendor name from MAC OUI lookup
- `role` - Auto-detected role (see Roles section)
- `os` - Operating system ID (macos, raspbian, ubuntu, etc.)
- `arch` - CPU architecture (arm64, aarch64, armv7l, x86_64)
- `ssh_reachable` - Boolean, SSH server running
- `notes` - Human-readable notes (from manual entry or auto-detection)
- `jetson_model` - NVIDIA Jetson model (Jetson Orin only)
- `jetson_cuda` - CUDA version (Jetson Orin only)
- `docker_bridges` - Docker bridge subnets (if Docker installed)
- `timestamp` - ISO 8601 timestamp of device discovery

## Device Roles

Auto-detected roles:
- `mac-operator` - macOS host (operator console)
- `pi-node` - Raspberry Pi (generic)
- `jetson-orin` - NVIDIA Jetson Orin edge compute
- `iphone-koder` - iPhone with Pyto
- `router` - Network gateway
- `unreachable` - Known host, SSH failed
- `unknown-linux` - Linux device, unable to classify

## Manual Host Configuration

Create `data/mesh-hosts.txt` to add known devices:

```bash
# Format: IP:hostname:notes
192.168.4.38:lucidia:Lucidia breath engine Pi
192.168.4.64:blackroad-pi:BlackRoad node
192.168.4.49:alice:Alice Pi node
192.168.4.68:iphone-koder:iPhone Koder (Pyto)

# With just IP (auto-detect hostname)
192.168.4.55

# Comments are ignored
# 192.168.4.99:disabled:Old device
```

The aggregation script will:
1. Read this file
2. SSH to each IP
3. Run discovery script remotely
4. Merge results into inventory.json

## Troubleshooting

### "SSH connection refused"

- Check if SSH is enabled: `sudo systemsetup -getremotelogin` (macOS)
- Enable SSH: `sudo systemsetup -setremotelogin on` (macOS)
- On Pi/Jetson: `sudo systemctl enable ssh && sudo systemctl start ssh`

### "Discovery script failed on remote host"

- Ensure script is POSIX sh compatible (no bashisms)
- Check remote host has `sh`, `hostname`, `date`, `cat` commands
- Test manually: `ssh user@host "sh -c 'hostname && date'"`

### "Jetson Orin not detected"

- Verify Ethernet cable connected
- Check router DHCP leases: `http://192.168.4.1` (router admin)
- Ping sweep: `nmap -sn 192.168.4.0/24`
- Look for MAC prefix `48:b0:2d`

### "iPhone shows as unreachable"

- Expected behavior (iOS doesn't run SSH server)
- iPhone is cataloged via MAC address from ARP table
- Use iPhone as SSH client only (not server)

### "Docker bridge IPs appear as devices"

- Docker bridges (172.17.x.x, 172.18.x.x) are filtered automatically
- Discovery script excludes these from LAN IP detection
- Only real 192.168.4.x IPs are considered LAN devices

### "Tailscale IP not detected"

- Check Tailscale running: `tailscale status`
- Install Tailscale: `https://tailscale.com/download`
- Authenticate: `sudo tailscale up`

## Advanced Usage

### Scheduled Inventory Updates

Add to crontab on Mac:
```bash
# Run census every 6 hours
0 */6 * * * cd ~/blackroad-sandbox && ./scripts/generate_inventory_json.sh --scan >> logs/census.log 2>&1
```

### Custom SSH Keys

```bash
# Use specific SSH key
ssh-add ~/.ssh/blackroad_key

# Or specify in script
SSH_OPTS="-i ~/.ssh/blackroad_key" ./scripts/generate_inventory_json.sh
```

### Filtering by Role

```bash
# List all Pi nodes
jq '.devices[] | select(.role == "pi-node")' data/inventory.json

# List SSH-reachable devices
jq '.devices[] | select(.ssh_reachable == true)' data/inventory.json

# List Jetson Orin devices
jq '.devices[] | select(.role == "jetson-orin")' data/inventory.json
```

### Diff Between Runs

```bash
# Save timestamped snapshots
cp data/inventory.json data/inventory_$(date +%Y%m%d_%H%M%S).json

# Compare device counts
jq '.device_count' data/inventory_20251212_190000.json
jq '.device_count' data/inventory_20251212_200000.json
```

## Security Considerations

### SSH Access

- Use SSH keys (not passwords)
- Disable password auth: `PasswordAuthentication no` in `/etc/ssh/sshd_config`
- Use Tailscale for encrypted mesh (don't expose SSH to internet)

### Script Safety

- Discovery scripts are read-only (no writes, no sudo)
- Network scans use `-sn` (no port scanning by default)
- All SSH connections use `StrictHostKeyChecking=no` for automation
  - **Warning:** Only safe on trusted private networks
  - For production, use known_hosts verification

### Data Privacy

- Inventory contains MAC addresses (could identify devices)
- Store `data/inventory.json` securely (don't commit to public repos)
- Add to `.gitignore`: `data/inventory*.json`

## Integration with BlackRoad OS

### Truth System Integration

Future: Anchor inventory to PS-SHA∞ for immutable device registry:
```bash
# Compute hash of inventory
INVENTORY_HASH=$(sha256sum data/inventory.json | awk '{print $1}')

# Store in RoadChain
echo "inventory_snapshot:$INVENTORY_HASH" | blackroad-cli truth anchor
```

### Agent Assignment

Use inventory to assign agents to devices:
```bash
# Deploy agent to Lucidia Pi
jq '.devices[] | select(.hostname == "lucidia") | .lan_ip' data/inventory.json
# Output: "192.168.4.38"

# SSH and deploy
ssh alexa@192.168.4.38 "python3 -m blackroad_agent --role breath-engine"
```

### Monitoring

Track device health via inventory:
- SSH reachable = device online
- Timestamp = last seen
- Missing devices = potential offline nodes

## Next Steps

1. **Run initial census:**
   ```bash
   ./scripts/generate_inventory_json.sh --scan
   ```

2. **Find Jetson Orin:**
   ```bash
   jq '.devices[] | select(.role == "jetson-orin")' data/inventory.json
   ```

3. **Set up Tailscale on all devices:**
   - Mac: `brew install tailscale && sudo tailscale up`
   - Pi/Jetson: `curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up`
   - iPhone: Install Tailscale app from App Store

4. **Configure SSH keys:**
   ```bash
   ssh-copy-id alexa@192.168.4.38  # Lucidia
   ssh-copy-id alexa@192.168.4.64  # BlackRoad Pi
   ssh-copy-id alexa@192.168.4.49  # Alice
   # (Jetson Orin once discovered)
   ```

5. **Automate census:**
   - Add to cron for periodic updates
   - Integrate with monitoring system
   - Set up alerts for device offline events

## References

- NVIDIA Jetson Orin Docs: https://developer.nvidia.com/embedded/jetson-orin
- Tailscale Mesh VPN: https://tailscale.com/
- Pyto for iOS: https://apps.apple.com/app/pyto-python-3/id1436650069
- nmap Network Scanning: https://nmap.org/book/man.html
