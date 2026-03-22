# BlackRoad Network Device Summary

**Generated:** 2025-12-13T02:50:00Z
**Network:** 192.168.4.0/24
**Total Devices:** 11 active

---

## Quick Reference Table

| IP | Hostname | Vendor | Type | SSH | Notes |
|----|----------|--------|------|-----|-------|
| 192.168.4.1 | Gateway | Router | Infrastructure | - | Primary router |
| 192.168.4.26 | roku-1 | Roku | Media | ✗ | Streaming device |
| 192.168.4.27 | apple-device | Apple | Unknown | ✗ | Port 5000 open, investigate |
| 192.168.4.28 | Alexas-MacBook-Pro-2 | Apple | Mac Operator | ✓ | **Primary console** |
| 192.168.4.33 | roku-2 | Roku | Media | ✗ | Streaming device |
| 192.168.4.38 | lucidia | Raspberry Pi | Pi Node | ✗ | **Breath engine** |
| 192.168.4.49 | alice | Raspberry Pi | Pi Node | ✗ | **Alice Pi** |
| 192.168.4.64 | blackroad-pi | Raspberry Pi 5 | Pi Node | ✓ | **BlackRoad node** |
| 192.168.4.68 | iphone-koder | Apple iPhone | Mobile | - | Pyto SSH client |
| 192.168.4.69 | virtual-1 | Virtual | Network | - | Stale ARP entry |
| 192.168.4.70 | virtual-2 | Virtual | Network | - | Docker bridge |

---

## Device Categories

### **BlackRoad Infrastructure (3 devices)**
1. **Mac Operator** (192.168.4.28) - Primary control, SSH ✓
2. **BlackRoad Pi** (192.168.4.64) - Pi 5 node, SSH ✓
3. **Lucidia Pi** (192.168.4.38) - Breath engine, SSH ✗

### **Other Pi Nodes (1 device)**
4. **Alice Pi** (192.168.4.49) - Pi node, SSH ✗

### **Mobile/Client (1 device)**
5. **iPhone Koder** (192.168.4.68) - Pyto SSH client

### **Media Devices (2 devices)**
6. **Roku #1** (192.168.4.26) - Streaming
7. **Roku #2** (192.168.4.33) - Streaming

### **Unknown Apple Device (1 device)**
8. **Apple Device** (192.168.4.27) - Port 5000 open, needs investigation

### **Infrastructure (1 device)**
9. **Gateway** (192.168.4.1) - Router

### **Virtual/Stale (2 devices)**
10-11. Virtual interfaces or stale ARP entries

---

## Jetson Orin Status

**❌ NOT FOUND**

The NVIDIA Jetson Orin was not detected on the network.

**Next steps to locate it:**
1. Ensure Jetson is powered on
2. Verify Ethernet cable is connected
3. Connect via HDMI+keyboard and run: `ip addr show`
4. Check router admin panel (http://192.168.4.1) for new DHCP leases
5. The Apple device at .27 with port 5000 is suspicious - could be running a development service

---

## SSH Access Summary

| Device | IP | User | Status |
|--------|----|----|--------|
| Mac Operator | 192.168.4.28 | alexa | ✓ Working |
| BlackRoad Pi | 192.168.4.64 | pi | ✓ Working |
| Lucidia Pi | 192.168.4.38 | ? | ✗ No access |
| Alice Pi | 192.168.4.49 | ? | ✗ No access |

**Action Required:** Enable SSH on Lucidia and Alice Pi nodes, or verify credentials.

---

## Mystery Device: 192.168.4.27

**Vendor:** Apple
**Ping:** ✓ Responds
**SSH:** ✗ Not accessible
**Open Ports:** **5000**

**Possible identities:**
- Another Mac running a dev server (Flask/FastAPI default port)
- iPad with service running
- Apple TV (unlikely, wrong port)
- AirPlay service (port 5000 is used by some Apple services)

**Investigation commands:**
```bash
# Check what service is on port 5000
nc -v 192.168.4.27 5000

# Full port scan
sudo nmap -sV -p- 192.168.4.27

# Try mDNS discovery
dns-sd -B _services._dns-sd._udp local.
```

---

## Next Actions

### High Priority
1. ✅ **Enable SSH on Lucidia and Alice** - Connect via HDMI or existing keys
2. ✅ **Install Tailscale** on all devices for secure mesh networking
3. ✅ **Locate Jetson Orin** - Physical check + router admin panel

### Medium Priority
4. ⚠️ **Investigate Apple device at .27** - Identify what's running on port 5000
5. ⚠️ **Set up SSH keys** - Replace password auth with key-based
6. ⚠️ **Document Roku devices** - Add to mesh-hosts.txt for completeness

### Low Priority
7. 📋 **Schedule automated census** - Cron job every 6 hours
8. 📋 **Set up monitoring** - Alert on new devices
9. 📋 **Truth Engine integration** - Anchor inventory to PS-SHA∞

---

## Files & Scripts

### Generated Data
- `data/inventory.json` - Machine-readable full inventory
- `data/device_census_report.md` - Detailed analysis report
- `data/DEVICE_SUMMARY.md` - This quick reference

### Configuration
- `data/mesh-hosts.txt` - Known hosts (manually maintained)

### Scripts
- `scripts/discover_local_device.sh` - Run on any device
- `scripts/generate_inventory_json.sh` - Full mesh census
- `scripts/find_jetson_orin.sh` - Jetson-specific finder
- `scripts/safe_network_discovery.sh` - ARP-based discovery
- `scripts/probe_unknown_devices.sh` - Deep device probing
- `scripts/lookup_unknown_macs.sh` - MAC vendor lookup

### Documentation
- `docs/DEVICE_CENSUS.md` - Complete guide (400+ lines)
- `scripts/DEVICE_CENSUS_README.md` - Quick reference

---

## Quick Commands

### Run full census
```bash
cd ~/blackroad-sandbox
./scripts/generate_inventory_json.sh --scan
```

### View inventory
```bash
jq -r '.devices[] | "\(.lan_ip) - \(.hostname) [\(.role)]"' data/inventory.json
```

### Find unknown devices
```bash
./scripts/safe_network_discovery.sh
```

### Probe specific device
```bash
ssh pi@192.168.4.64 "hostname && uname -a"
```

---

**Built with ❤️ for BlackRoad OS**

Last updated: 2025-12-13T02:50:00Z
