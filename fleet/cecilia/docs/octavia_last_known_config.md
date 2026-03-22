# 🚨 OCTAVIA - Last Known Configuration
**Priority:** CRITICAL - Primary compute node with 75% of agent capacity
**Status:** DISK_FULL_NEEDS_CLEANUP (per manifest.json)

---

## 📋 CONFIGURATION

### Network Configuration
- **Hostname:** octavia
- **Last Known IP:** 192.168.4.74
- **Role:** holo (holographic/simulation?)
- **Webhook Port:** 9004
- **Service Ports:** 3300-3400 (100 port range)
- **Domains:** None (pure compute node)

### Hardware Specifications
- **Type:** Raspberry Pi 5 (inferred)
- **Special Hardware:** AI Accelerator + NVMe
- **Storage:** NVMe drive (likely external M.2 or HAT)
- **Status:** PRIMARY compute node

### Agent Capacity
- **Total Capacity:** 22,500 agents (75% of 30k total!)
- **Infrastructure Role:** PRIMARY
- **Tasks Assigned:**
  - AI Research: ~9,444 agents
  - Code Deploy: ~6,305 agents
  - Infrastructure: ~4,050 agents
  - Monitoring: ~2,700 agents

---

## 🔴 LAST KNOWN STATUS

**Status:** `DISK_FULL_NEEDS_CLEANUP`

This is likely why octavia is offline! The manifest shows:
- Disk is full
- Needs cleanup
- Never added to Tailscale mesh (possibly couldn't finish setup due to disk space)

---

## 🔧 SSH ACCESS CONFIGURATION

From `~/.ssh/config`:
```
Host octavia
    HostName 192.168.4.74
    User pi
```

**Keys to try:**
- `~/.ssh/br_mesh_ed25519` (works for lucidia)
- `~/.ssh/id_sandbox_ed25519` (works for aria)
- `~/.ssh/id_ed25519` (standard key)

---

## 📊 COMPARISON WITH OTHER NODES

| Node | Capacity | Hardware | Status | Disk |
|------|----------|----------|--------|------|
| **octavia** | **22,500** | **AI Accel + NVMe** | **OFFLINE** | **FULL** |
| lucidia | 7,500 | Standard Pi 5 | ONLINE | 21GB free |
| shellfish | 0 | DO Droplet | STANDBY | Unknown |

**Impact of octavia being down:**
- Lost 75% of agent compute capacity
- All 22,500 agents offline
- AI research severely impacted
- No AI accelerator hardware in use

---

## 🎯 RECOVERY PLAN

### Step 1: Physical Locate
- **Check:** Is it plugged in? Power LED on?
- **MAC Address:** Unknown (need to check router DHCP leases)
- **Network Scan:** Already checked 192.168.4.74 - no response

### Step 2: If Powered On But Unreachable
- May have different IP due to DHCP (like aria moved to .82)
- Check router's DHCP lease table for "octavia" or "raspberrypi"
- Scan all unknown IPs: .22, .27, .33, .44, .45, .53, .86

### Step 3: If Accessible via SSH
```bash
# Once connected:
# 1. Check disk space
df -h

# 2. Find large files/dirs
du -sh /* 2>/dev/null | sort -rh | head -20

# 3. Clean up Docker
docker system prune -a -f
docker volume prune -f

# 4. Clean logs
sudo journalctl --vacuum-time=7d
rm -rf ~/blackroad/logs/*.log.old

# 5. Join Tailscale mesh
sudo tailscale up --login-server=https://mesh.blackroad.io
```

### Step 4: If Physical Access Needed
- Connect monitor + keyboard
- Boot into recovery/single-user mode
- Expand filesystem if needed
- Clear disk space manually
- Reboot

---

## 💡 WHY OCTAVIA MATTERS

**This is your premium hardware:**
- AI Accelerator (Coral TPU? Hailo-8? Intel Neural Stick?)
- NVMe storage (fast local storage for models)
- 3x capacity of lucidia
- Designed as PRIMARY node (not backup)

**Without octavia:**
- Can only run 7,500 agents (on lucidia)
- No hardware AI acceleration
- Slower model inference
- Limited compute capacity

---

## 🔍 NEXT STEPS

1. ✅ **Check Router DHCP Leases**
   - Login to 192.168.4.1
   - Look for "octavia" or unknown Raspberry Pi
   - Check MAC address assignments

2. ✅ **Physical Search**
   - Look for Pi with NVMe attached (external drive or HAT)
   - Check for green/red LEDs
   - May be in case labeled "octavia" or "AI"

3. ✅ **Network Discovery**
   - Try all unknown IPs with various SSH keys
   - Check for HTTP/HTTPS services on unknown IPs
   - Use nmap for service detection

4. ✅ **Power Cycle if Found**
   - If powered but unreachable, power cycle
   - May just need boot to clear disk space

---

## 📝 CONFIGURATION FILES REFERENCED

- **Infrastructure:** `~/blackroad/config/pi-infrastructure.yaml` (on lucidia)
- **Agent Manifest:** `~/blackroad/agents/manifest.json` (local)
- **SSH Config:** `~/.ssh/config` (local)
- **Repo:** `~/blackroad/repos/octavia/` (empty, just README)

