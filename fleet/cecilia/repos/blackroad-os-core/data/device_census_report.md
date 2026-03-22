# BlackRoad Device Census Report

Generated: 2025-12-13T02:47:00Z
Network: 192.168.4.0/24
Total Devices Discovered: 11

## Summary by Status

- **Identified & Accessible**: 2 devices
- **Identified & Unreachable**: 2 devices
- **Unknown/Unidentified**: 5 devices
- **Infrastructure**: 1 device (gateway)
- **Virtual/Stale**: 1 device

---

## Identified Devices (Accessible via SSH)

### 1. Mac Operator (Alexa's MacBook Pro)
- **IP**: 192.168.4.28
- **MAC**: b0:be:83:66:cc:10
- **Vendor**: Apple
- **Role**: mac-operator
- **OS**: macOS (Darwin)
- **Arch**: arm64 (Apple Silicon)
- **SSH**: Enabled (user: alexa)
- **Tailscale**: Not configured
- **Docker**: Yes (172.17.0.0/16)
- **Notes**: Primary operator console, running census scripts

### 2. BlackRoad Pi
- **IP**: 192.168.4.64
- **MAC**: 88:a2:9e:0d:42:07
- **Vendor**: Unknown (Pi 5 or newer model)
- **Role**: pi-node
- **OS**: Debian (Bookworm)
- **Arch**: aarch64 (64-bit ARM)
- **Kernel**: Linux 6.12.47+rpt-rpi-2712
- **SSH**: Enabled (user: pi)
- **Tailscale**: Not configured
- **Docker**: Yes (172.17.0.0/16)
- **Notes**: BlackRoad node, Raspberry Pi running latest 64-bit kernel

---

## Identified Devices (Unreachable/No SSH)

### 3. Lucidia Pi
- **IP**: 192.168.4.38
- **MAC**: 2c:cf:67:cf:fa:17
- **Vendor**: Raspberry Pi Foundation
- **Role**: pi-node (breath engine)
- **SSH**: Not accessible (tried users: alexa, pi)
- **Notes**: Lucidia breath engine Pi - SSH may be disabled or different credentials

### 4. Alice Pi
- **IP**: 192.168.4.49
- **MAC**: d8:3a:dd:ff:98:87
- **Vendor**: Raspberry Pi Foundation
- **Role**: pi-node
- **SSH**: Not accessible (tried users: alexa, pi)
- **Notes**: Alice Pi node - SSH may be disabled or different credentials

### 5. iPhone Koder
- **IP**: 192.168.4.68
- **MAC**: 54:4c:8a:9b:09:3d
- **Vendor**: Apple iPhone
- **Role**: mobile-client (Pyto SSH client)
- **SSH**: Not accessible (iOS doesn't run SSH server)
- **Notes**: iPhone running Pyto, used as SSH client to other devices

---

## Infrastructure

### 6. Gateway/Router
- **IP**: 192.168.4.1
- **MAC**: 44:ac:85:94:37:92
- **Vendor**: Router/Gateway
- **Role**: router
- **Notes**: Primary network gateway, DHCP server

---

## Unknown Devices (Require Investigation)

### 7. Unknown Device at .26
- **IP**: 192.168.4.26
- **MAC**: d4:be:dc:6c:61:6b
- **Vendor**: Generic/Unknown
- **Ping**: Responds
- **SSH**: Not accessible (tried: alexa, pi, ubuntu, nvidia, jetson, admin, root)
- **Ports**: Standard ports closed
- **Possible Identity**:
  - Smart home device (IoT camera, sensor, etc.)
  - Media device (TV, streaming box)
  - Could be Jetson Orin with non-standard setup
- **Action Required**:
  - Check router admin panel for device name
  - Look up full MAC address for vendor
  - Try web interface: http://192.168.4.26

### 8. Unknown Device at .27
- **IP**: 192.168.4.27
- **MAC**: 6c:4a:85:32:ae:72
- **Vendor**: Generic/Unknown
- **Ping**: Responds
- **SSH**: Not accessible
- **Ports**: **Port 5000 OPEN** (no HTTP response)
- **Possible Identity**:
  - Development server (Flask, FastAPI default port)
  - Custom service or API
  - Could be a Pi or Jetson running a service
  - Could be Jetson Orin with custom service
- **Action Required**:
  - Investigate port 5000 service further
  - Try: `nc -v 192.168.4.27 5000` for banner
  - Check for other open ports: `nmap 192.168.4.27`
  - Look up MAC vendor online

### 9. Unknown Device at .33
- **IP**: 192.168.4.33
- **MAC**: 60:92:c8:11:cf:7c
- **Vendor**: Generic/Unknown
- **Ping**: Responds
- **SSH**: Not accessible
- **Ports**: Standard ports closed
- **Possible Identity**:
  - IoT device
  - Network printer
  - Smart home hub
  - Could be Jetson Orin with default config
- **Action Required**:
  - Check router DHCP leases for hostname
  - Look up MAC address online
  - Try web interface

### 10. Unknown Device at .69
- **IP**: 192.168.4.69
- **MAC**: fe:c0:62:ce:53:49
- **Vendor**: Unknown (MAC prefix FE = likely virtual)
- **Ping**: No response
- **Status**: Likely stale ARP entry or virtual interface
- **Action Required**: Monitor - may be transient

### 11. Unknown Device at .70
- **IP**: 192.168.4.70
- **MAC**: fe:65:91:05:7c:a8
- **Vendor**: Virtual/Bridge (FE prefix)
- **Ping**: No response
- **Status**: Likely Docker bridge or virtual interface
- **Action Required**: None - appears to be virtual

---

## Jetson Orin Status: NOT FOUND

**Search Methods Used:**
1. ✅ ARP table scan for NVIDIA MAC (48:b0:2d, 00:04:4b)
2. ✅ Hostname resolution (jetson, orin, nvidia-desktop, tegra)
3. ✅ SSH probe for /etc/nv_tegra_release on all devices
4. ✅ Port scanning on active devices

**Possible Reasons:**
1. Jetson Orin is not powered on
2. Ethernet cable not connected
3. Jetson is on different subnet
4. Jetson hasn't obtained DHCP lease yet
5. Jetson might be one of the unknown devices (.26, .27, .33) with non-standard config

**Next Steps to Find Jetson:**
1. **Physical check**: Ensure Jetson is powered on and Ethernet connected
2. **Router admin**: Check DHCP leases at http://192.168.4.1 for new devices
3. **Direct connection**: Connect Jetson via HDMI/keyboard and run `ip addr show`
4. **Investigate .27**: The device with port 5000 open could be Jetson running a service
5. **Deep scan**: Run `sudo nmap -sV 192.168.4.26 192.168.4.27 192.168.4.33` for service detection
6. **MAC lookup**: Search full MAC addresses online:
   - d4:be:dc:6c:61:6b
   - 6c:4a:85:32:ae:72
   - 60:92:c8:11:cf:7c

---

## Network Topology

```
Internet
   │
   └─ Gateway/Router (192.168.4.1)
      │
      ├─ Mac Operator (192.168.4.28) [SSH ✓]
      ├─ BlackRoad Pi (192.168.4.64) [SSH ✓]
      ├─ Lucidia Pi (192.168.4.38) [SSH ✗]
      ├─ Alice Pi (192.168.4.49) [SSH ✗]
      ├─ iPhone Koder (192.168.4.68) [Mobile]
      ├─ Unknown .26 [?]
      ├─ Unknown .27 [Port 5000]
      ├─ Unknown .33 [?]
      ├─ Virtual .69 [Stale]
      └─ Virtual .70 [Bridge]
```

---

## Recommendations

### Immediate Actions

1. **Enable SSH on Pi nodes:**
   ```bash
   # On Lucidia (192.168.4.38) and Alice (192.168.4.49)
   # Connect via HDMI or use existing SSH key
   sudo systemctl enable ssh
   sudo systemctl start ssh
   ```

2. **Install Tailscale on all devices:**
   - Mac: `brew install tailscale && sudo tailscale up`
   - Pi: `curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up`
   - iPhone: Install Tailscale app from App Store

3. **Investigate unknown devices:**
   ```bash
   # Deep scan .27 (port 5000)
   sudo nmap -sV -p- 192.168.4.27

   # Check all unknown devices
   sudo nmap -sV 192.168.4.26 192.168.4.27 192.168.4.33

   # MAC lookup
   curl "https://api.macvendors.com/d4:be:dc:6c:61:6b"
   ```

4. **Find Jetson Orin:**
   - Check router admin panel for device list
   - Power cycle Jetson and watch ARP table
   - Connect via HDMI to get IP directly

### Security Improvements

1. **SSH key setup:**
   ```bash
   ssh-copy-id pi@192.168.4.64
   ssh-copy-id alexa@192.168.4.38  # Once SSH enabled
   ssh-copy-id alexa@192.168.4.49  # Once SSH enabled
   ```

2. **Disable password auth after key setup:**
   ```bash
   # In /etc/ssh/sshd_config
   PasswordAuthentication no
   ```

3. **Update mesh-hosts.txt:**
   ```bash
   # Add BlackRoad Pi as accessible
   # Update status for Lucidia and Alice
   # Add unknown devices once identified
   ```

### Ongoing Monitoring

1. **Scheduled census:**
   ```bash
   # Add to crontab
   0 */6 * * * cd ~/blackroad-sandbox && ./scripts/generate_inventory_json.sh --scan >> logs/census.log 2>&1
   ```

2. **Alert on new devices:**
   - Monitor inventory.json device_count
   - Send notification when count increases
   - Auto-identify new devices

---

## Files Generated

- `data/inventory.json` - Machine-readable inventory
- `data/mesh-hosts.txt` - Known hosts configuration
- `data/device_census_report.md` - This report

## Scripts Available

- `scripts/discover_local_device.sh` - Local device discovery
- `scripts/generate_inventory_json.sh` - Mesh-wide census
- `scripts/find_jetson_orin.sh` - Jetson-specific finder
- `scripts/safe_network_discovery.sh` - ARP-based discovery
- `scripts/probe_unknown_devices.sh` - Deep probe unknown devices

---

## Appendix: MAC Vendor Lookup Results

| MAC Address | Vendor | Likely Device Type |
|-------------|--------|-------------------|
| b0:be:83:66:cc:10 | Apple | MacBook Pro |
| 88:a2:9e:0d:42:07 | Unknown | Raspberry Pi 5 |
| 2c:cf:67:cf:fa:17 | Raspberry Pi Foundation | Raspberry Pi |
| d8:3a:dd:ff:98:87 | Raspberry Pi Foundation | Raspberry Pi |
| 54:4c:8a:9b:09:3d | Apple | iPhone |
| 44:ac:85:94:37:92 | Unknown | Router |
| d4:be:dc:6c:61:6b | **Unknown** | **To be identified** |
| 6c:4a:85:32:ae:72 | **Unknown** | **To be identified** |
| 60:92:c8:11:cf:7c | **Unknown** | **To be identified** |
| fe:c0:62:ce:53:49 | Virtual | Docker/VM |
| fe:65:91:05:7c:a8 | Virtual | Docker/VM |

---

**Report End**

For detailed documentation, see: `docs/DEVICE_CENSUS.md`
