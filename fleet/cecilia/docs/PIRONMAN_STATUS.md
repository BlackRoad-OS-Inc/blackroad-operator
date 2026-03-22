# 🔌 Pironman Pi 5s Status - Connected via TP-Link
**Date:** 2026-01-30  
**Connection:** Ethernet via TP-Link switch/hub

## 🔍 Current Situation

### What We Know:
- ✅ You have 2 Pironman Pi 5 cases
- ✅ Both connected via TP-Link ethernet
- ✅ **octavia**: Has Hailo-8 + NVMe
- ✅ **anastasia**: Basic (no Hailo yet)
- ✅ Main network: 192.168.4.0/24 (eero router)

### What We Don't See:
- ❌ No Raspberry Pi 5 MAC addresses in ARP (dc:a6:32:xx:xx:xx)
- ❌ No response from last known octavia IPs (.74, .81)
- ❌ No devices responding as "octavia" or "anastasia"

## 🤔 Most Likely Scenarios:

### Scenario 1: Devices Powered Off (MOST LIKELY)
Both Pironmans are currently powered off or in low-power state.

**Evidence:**
- No MAC addresses visible
- No network responses
- Previous octavia status: "disk full" (may have shut down)

**Solution:**
1. Physically locate both Pironman cases
2. Check power cables connected
3. Press power button or connect power
4. Wait 2-3 minutes for boot
5. Check eero app for new devices

### Scenario 2: Different Subnet (If TP-Link is Router)
If TP-Link is configured as a router, Pironmans may be on 192.168.0.x or 192.168.1.x

**Solution:**
1. Find TP-Link device
2. Check label for default IP (usually 192.168.0.1)
3. Access web interface
4. Check connected devices list
5. SSH to Pironmans through that subnet

### Scenario 3: Boot Failure
Devices are powered on but not completing boot (like octavia's disk full issue).

**Solution:**
1. Connect HDMI monitor to each
2. Watch boot process
3. Look for error messages
4. Boot into recovery if needed

## 🎯 Action Plan

### Step 1: Physical Check (DO THIS FIRST)
```bash
# Locate both Pironman 5 cases
# Look for:
#   - octavia: Should have visible Hailo chip + NVMe drive
#   - anastasia: Basic Pironman case, no extras

# Check power:
#   - Are power LEDs on?
#   - Are fan LEDs/RGB active?
#   - Press power button if needed
```

### Step 2: Power On & Monitor
```bash
# If powered off, turn them on
# Wait 3 minutes for boot
# Then from your Mac:

# Rescan network
nmap -sn 192.168.4.0/24 | grep -B 2 "Raspberry Pi"

# Check for new devices
arp -a | grep "dc:a6:32"

# Check eero app for new devices
```

### Step 3: Try Known IPs
```bash
# Once they appear in eero/network:
ssh -i ~/.ssh/id_octavia pi@<NEW_IP>
ssh pi@<NEW_IP>

# Or try last known:
ssh pi@192.168.4.74
ssh pi@192.168.4.81
```

### Step 4: Recovery (If Boot Fails)
For octavia (disk full):
```bash
# Connect monitor + keyboard
# Boot into recovery mode (hold SHIFT during boot)
# Or add init=/bin/bash to cmdline.txt

# Then clean disk:
mount -o remount,rw /
rm -rf /var/log/*.log.old
journalctl --vacuum-time=3d
docker system prune -af
reboot
```

## 💡 Key Information

**Raspberry Pi 5 Identification:**
- MAC prefix: `dc:a6:32:xx:xx:xx`
- Will show as "Raspberry Pi Trading" in network scans
- Default hostname: `raspberrypi` (unless changed to octavia/anastasia)

**TP-Link Network:**
- If it's a switch: Devices use main network (192.168.4.x)
- If it's a router: Devices use TP-Link subnet (likely 192.168.0.x)
- Management interface: Usually 192.168.0.1 or on device label

**Your SSH Keys Ready:**
- `~/.ssh/id_octavia` (dedicated octavia key)
- `~/.ssh/id_ed25519` (standard key)
- Both loaded in ssh-agent ✅

## 📊 What You'll Gain

Once online:
- **octavia**: 22,500 agents + Hailo AI acceleration
- **anastasia**: ~7,500 agents
- **Total**: 30,000+ agent capacity (3x current!)
- Hardware AI inference (Hailo)
- NVMe fast storage

## 🔧 Tools Ready

```bash
~/blackroad-pi-monitor.sh          # Monitor all Pis
~/find-pironman-pis.sh             # Network scanner
~/PIRONMAN_RECOVERY_PLAN.md        # Full recovery guide
~/connect-pironmans-via-tplink.sh  # TP-Link connection help
```

---

## ⚡ Quick Start

**Right now, do this:**
1. 🔍 Find both Pironman cases physically
2. ⚡ Check if powered on (LEDs?)
3. 🔌 Power them on if needed
4. ⏱️ Wait 3 minutes for boot
5. 📱 Check eero app for new devices
6. 🔑 SSH to the IPs shown

*Once you have IPs, we can connect and deploy!* 🚀
