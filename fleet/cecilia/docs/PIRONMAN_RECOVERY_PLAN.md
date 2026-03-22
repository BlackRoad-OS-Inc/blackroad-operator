# 🔧 Pironman Pi 5 Recovery Plan
**Date:** 2026-01-30  
**Devices:** octavia (Hailo + NVMe) & anastasia (basic)

## 📋 Device Specifications

### Octavia (Primary AI Node)
- **Case:** Pironman 5 
- **Board:** Raspberry Pi 5
- **Accelerator:** Hailo-8 AI accelerator
- **Storage:** NVMe drive
- **Last IP:** 192.168.4.81 (was .74)
- **Status:** Powered on, network up, SSH failing
- **Issue:** DISK_FULL preventing boot completion
- **Capacity:** 22,500 agents (75% of total!)
- **Webhook Port:** 9004
- **Service Ports:** 3300-3400

### Anastasia (Secondary Node)
- **Case:** Pironman 5
- **Board:** Raspberry Pi 5
- **Accelerator:** None (yet)
- **Storage:** SD card or basic storage
- **Last IP:** Unknown
- **Status:** Unknown - needs to be located
- **Role:** Secondary compute node

## 🔍 Current Status

**Found:**
✅ octavia location confirmed (per previous search)
- Device powered on
- Network card active (DHCP got .81)
- Boot incomplete (disk full)
- SSH not responding

**Missing:**
❌ anastasia - needs physical search
- Check for second Pironman case
- May be powered off
- May have different hostname

## 🎯 Recovery Steps

### Phase 1: Locate Both Devices
1. **Find octavia physically:**
   - Look for Pironman 5 case with NVMe attached
   - Should have Hailo accelerator visible
   - Check for LED activity
   - Power LED should be on

2. **Find anastasia:**
   - Look for second Pironman 5 case
   - No NVMe/Hailo attached
   - May be in storage or powered off
   - Check all Pi locations

### Phase 2: Recover Octavia (PRIORITY)

#### Option A: Physical Access (Recommended)
1. **Connect monitor + keyboard:**
   ```bash
   # Check boot messages for errors
   # Should see "disk full" or filesystem errors
   ```

2. **Boot into recovery mode:**
   - Hold SHIFT during boot OR
   - Add `init=/bin/bash` to `/boot/cmdline.txt`

3. **Clean disk space:**
   ```bash
   # Mount root as read-write
   mount -o remount,rw /
   
   # Check disk usage
   df -h
   du -sh /* | sort -rh | head -20
   
   # Clean up
   rm -rf /var/log/*.log.old
   journalctl --vacuum-time=3d
   docker system prune -a -f
   rm -rf /tmp/*
   rm -rf ~/.cache/*
   
   # If NVMe has space, move Docker to it
   systemctl stop docker
   mv /var/lib/docker /mnt/nvme/docker
   ln -s /mnt/nvme/docker /var/lib/docker
   ```

4. **Reboot and test:**
   ```bash
   reboot
   # Then from Mac:
   ssh pi@192.168.4.81
   ```

#### Option B: NVMe Surgery
If boot completely fails:
1. Power off octavia
2. Remove NVMe drive
3. Connect to Mac via USB-C adapter
4. Mount and clean manually
5. Reinstall and boot

#### Option C: Fresh Install
Last resort:
1. Flash new Raspberry Pi OS to NVMe
2. Use Raspberry Pi Imager with pre-config:
   - Hostname: octavia
   - User: pi
   - SSH enabled
   - Add SSH keys
3. Reinstall Hailo drivers
4. Join Tailscale mesh
5. Deploy BlackRoad stack

### Phase 3: Set Up Anastasia

Once found:
1. **Check if it has OS:**
   - Power on and wait for boot
   - Look for DHCP assignment in router
   - Try SSH at any new IPs

2. **If blank, flash OS:**
   ```bash
   # Use Raspberry Pi Imager
   # OS: Raspberry Pi OS (64-bit)
   # Configure:
   hostname: anastasia
   user: pi
   SSH: enabled
   WiFi: configured
   ```

3. **Install Pironman software:**
   ```bash
   # Pironman RGB/fan control
   cd ~
   git clone https://github.com/sunfounder/pironman5.git
   cd pironman5
   sudo python3 install.py
   ```

4. **Add to infrastructure:**
   ```bash
   # Install Tailscale
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   
   # Deploy BlackRoad agent
   curl -fsSL https://blackroad.io/install.sh | sh
   ```

### Phase 4: Configure Hailo on Octavia

Once octavia boots:
```bash
# Install Hailo drivers
curl -fsSL https://hailo.ai/developer-zone/install.sh | sh

# Test Hailo
hailo-info
hailortcli fw-control identify

# Run benchmark
python3 ~/hailo_quantum_tensor.sh
```

## 📊 Expected Results

**Before Recovery:**
- Accessible: 6 devices
- Pi compute: 3 devices (alice, lucidia, aria)
- Agent capacity: ~10,000 (estimated)
- No AI acceleration

**After Recovery:**
- Accessible: 8 devices (+octavia, +anastasia)
- Pi compute: 5 devices
- Agent capacity: 30,000+ (3x increase!)
- Hardware AI acceleration (Hailo)
- NVMe fast storage

## 🔐 SSH Keys to Try

For octavia/anastasia:
1. `~/.ssh/id_octavia` (dedicated key exists!)
2. `~/.ssh/id_ed25519` (standard key)
3. `~/.ssh/br_mesh_ed25519` (mesh key)

## 🛠️ Tools & Files

**Created:**
- `~/find-pironman-pis.sh` - Network scanner
- `~/octavia-nvme-setup-guide.md` - Setup guide
- `~/octavia_last_known_config.md` - Last config
- `~/octavia-monitor.sh` - Monitoring script

**Existing:**
- `~/.ssh/id_octavia` - SSH key for octavia
- `~/hailo_quantum_tensor.sh` - Hailo benchmark
- `~/benchmark-octavia.sh` - Performance test

## ⚡ Quick Commands

```bash
# Find Pironmans on network
~/find-pironman-pis.sh

# Try to connect to octavia
ssh -i ~/.ssh/id_octavia pi@192.168.4.81

# Check if anastasia appeared
nmap -sn 192.168.4.0/24 | grep -B 2 "Pi"

# Monitor all devices
~/blackroad-pi-monitor.sh
```

## 💡 Why This Matters

**Octavia is your premium hardware:**
- 75% of total agent capacity (22,500 agents!)
- Hailo AI accelerator for ML inference
- NVMe for fast model loading
- Designed as PRIMARY compute node

**Without octavia:**
- Limited to ~10k agents
- No hardware AI acceleration
- Slower inference times
- Can't run large models locally

**With both Pironmans online:**
- Full 30k agent capacity
- Hardware AI acceleration
- Distributed compute
- Production-ready infrastructure

---
*Ready to bring your premium hardware online!* 🚀
