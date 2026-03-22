# BlackRoad Node Recovery Plan
**Date:** January 27, 2026

## ✅ ONLINE NODES (2/6+)

### LUCIDIA (192.168.4.38)
- **Status:** ✅ ONLINE
- **SSH:** `ssh -i ~/.ssh/br_mesh_ed25519 pi@192.168.4.38`
- **Uptime:** 14+ days
- **Services:** 13 Docker containers + 3 agent processes

### ARIA (192.168.4.82)
- **Status:** ✅ ONLINE  
- **SSH:** `ssh -i ~/.ssh/id_sandbox_ed25519 pi@192.168.4.82`
- **Uptime:** 14+ days
- **Services:** 14 Docker containers + 2 agent processes
- **Special:** Has pironman5 installed

---

## 🔴 PRIORITY: OCTAVIA RECOVERY (AI Accelerator Node!)

### OCTAVIA (192.168.4.74)
- **Status:** 🔴 OFFLINE - "Host is down"
- **Hardware:** **AI ACCELERATOR + NVMe** 🚀
- **SSH Config:** `Host octavia` → `192.168.4.74` user `pi`
- **Recovery Steps:**
  1. **Physical access required** - Power cycle
  2. Check power LED/status on pironman case
  3. Connect via physical display/keyboard if needed
  4. Verify network cable connected
  5. Once booted, SSH with: `ssh -i ~/.ssh/br_mesh_ed25519 pi@192.168.4.74`
  6. Install pironman5 if not present (like on aria)

---

## 🟡 NEEDS INVESTIGATION

### ALICE (192.168.4.49)
- **Status:** 🟡 DETECTED but "No route to host"
- **Possible Issue:** Network misconfiguration or firewall
- **SSH Config:** Multiple entries (alice, alice@alice, alice64?)
- **Recovery:** Check routing table, may need physical access

### ANASTASIA (IP: Unknown)
- **Status:** 🔴 IP not configured in SSH config
- **SSH Config:** `Host anastasia` → `192.168.4.XX` user `pi`
- **Recovery:** Need to find actual IP address

### ALICE64 
- **Status:** 🔴 Not found in SSH config
- **Possible:** Alias for alice or separate node

---

## ❓ MYSTERY DEVICES (Responding to ping, SSH refused)

Found 5 devices responding to ping but refusing SSH:
- 192.168.4.22
- 192.168.4.27
- 192.168.4.33
- 192.168.4.44
- 192.168.4.45

**Candidates:**
- PiKVM (may use different port or web interface only)
- Network switches/APs
- Other IoT devices
- Phones/tablets

**Next steps:**
- Check if any have web interfaces (PiKVM typically on port 443/80)
- Try port 80/443/8080 for web UIs
- Use `nmap` for detailed port scan

---

## 🔍 FINDING PiKVM

PiKVM typically runs:
- Web interface on port 80/443
- Default login: admin/admin
- May not have SSH enabled by default
- Look for web UI at: http://192.168.4.XX

**Command to test:**
```bash
for ip in 192.168.4.{22,27,33,44,45}; do
  echo "Testing $ip..."
  curl -s -m 2 http://$ip | grep -i "pikvm\|kvm" && echo "Found at $ip"
done
```

---

## 📋 IMMEDIATE ACTIONS

1. **⭐ PRIORITY:** Physically locate and power on **OCTAVIA** (AI Accelerator)
2. Check pironman5 status on aria to understand setup
3. Investigate alice routing issue
4. Scan for PiKVM web interface
5. Determine what devices .22, .27, .33, .44, .45 are

---

## 🔑 SSH KEYS THAT WORK

- `~/.ssh/br_mesh_ed25519` - Works for lucidia
- `~/.ssh/id_sandbox_ed25519` - Works for aria
- `~/.ssh/id_ed25519` - May work for others

