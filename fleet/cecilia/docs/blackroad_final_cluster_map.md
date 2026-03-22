# 🎯 BlackRoad Complete Cluster Discovery
**Date:** January 27, 2026

## 🌟 TAILSCALE VPN MESH DISCOVERED!

Your Pis communicate via **Tailscale** (not just local IPs)!

---

## ✅ CONFIRMED ONLINE NODES

### 1. LUCIDIA (Primary Service Hub)
- **Local IP:** 192.168.4.38
- **Tailscale IP:** 100.66.235.47
- **SSH:** `ssh -i ~/.ssh/br_mesh_ed25519 pi@192.168.4.38`
- **Role:** Primary (per pi-infrastructure.yaml)
- **Uptime:** 14+ days
- **Services:** 13 Docker containers
- **Webhook:** Port 9001
- **Ports:** 3000-3100
- **Domains Hosted:** blackroad.io, carpool, os, app, home, demo, docs, brand

### 2. ARIA (Compute Node)
- **Local IP:** 192.168.4.82 (config says .64 but actually at .82!)
- **Tailscale IP:** 100.109.14.17
- **SSH:** `ssh -i ~/.ssh/id_sandbox_ed25519 pi@192.168.4.82`
- **Role:** "sim" (simulation/compute)
- **Uptime:** 14+ days
- **Load:** 🔥 27+ (AI workload)
- **Services:** 14 Docker containers
- **Webhook:** Port 9003
- **Ports:** 3100-3200
- **Hardware:** AI Accelerator + NVMe
- **Note:** IP changed from .64 → .82 (DHCP?)

---

## ⚠️  OFFLINE BUT IN TAILSCALE MESH

### 3. ALICE
- **Tailscale IP:** 100.77.210.18
- **Last Seen:** 2 days ago (via Tailscale)
- **Status:** In mesh but offline
- **Local IP:** Unknown (possibly 192.168.4.49 but not responding)
- **Recovery:** May need physical power cycle

### 4. BLACKROAD OS-INFINITY  
- **Tailscale IP:** 100.108.132.8
- **Last Seen:** Unknown
- **Status:** In Tailscale mesh but offline
- **Type:** Possibly cloud server (name suggests infinity/large compute)
- **User:** Likely `root@` (per SSH config)

### 5. SHELLFISH (DigitalOcean Droplet)
- **Tailscale IP:** 100.94.33.37
- **Public IP:** 174.138.44.45
- **Last Seen:** 14 days ago on Tailscale
- **Status:** Actually ONLINE via public IP! (31 days uptime)
- **SSH:** `ssh -i ~/.ssh/id_ed25519 root@174.138.44.45`
- **Note:** Tailscale may be disconnected but droplet is running

---

## 🔍 STILL SEARCHING FOR

### OCTAVIA (AI Accelerator) 🚀
- **Status:** NOT in Tailscale mesh!
- **Expected:** 192.168.4.74 (but offline)
- **Hardware:** AI Accelerator + NVMe
- **Action:** MUST find physically - this is your premium hardware!

### ANASTASIA
- **Status:** NOT in Tailscale mesh
- **IP:** Unknown (config shows 192.168.4.XX)
- **Action:** Physical search needed

---

## ❓ UNKNOWN NETWORK DEVICES

| IP | Status | Notes |
|----|--------|-------|
| 192.168.4.22 | Alive, no SSH | Unknown device |
| 192.168.4.27 | Alive, no SSH | Unknown device |
| 192.168.4.33 | Alive, no SSH | Unknown device |
| 192.168.4.44 | Alive, no SSH | Unknown device |
| 192.168.4.45 | Alive, no SSH | Unknown device |
| 192.168.4.53 | Alive, no SSH | Unknown device |
| **192.168.4.86** | **Alive, SSH refused** | **High ping (46-68ms) - Wireless?** |

**Note on .86:** High latency suggests WiFi device, not a Pi. Possibly:
- PiKVM (often WiFi, SSH disabled, HTTPS only)
- Phone/Tablet
- IoT device

---

## 🔧 KEY FINDINGS FROM CONFIG

From `~/blackroad/config/pi-infrastructure.yaml` on lucidia:

**Infrastructure Design:**
- Each Pi has dedicated port ranges
- Webhook ports for GitHub webhooks
- Domain → Pi → Port mapping
- Role-based assignment (primary, sim, etc.)

**IP Address Issue:**
- Config shows aria at 192.168.4.64
- Actually running at 192.168.4.82
- **Likely DHCP causing IP changes!**

---

## 📋 IMMEDIATE ACTIONS

1. **⭐ FIND OCTAVIA** - Physical search for AI Accelerator Pi
   - Not in Tailscale mesh
   - Not responding on network
   - Critical hardware!

2. **Enable Tailscale on your Mac**
   - You have `lucidia-operator` in mesh (offline 5h ago)
   - Reconnect to access all Pis via Tailscale IPs
   - Command: `tailscale up`

3. **Wake up ALICE**
   - In Tailscale mesh, offline 2 days
   - Try: `ssh pi@100.77.210.18` after reconnecting Tailscale

4. **Check BLACKROAD OS-INFINITY**
   - In mesh but status unknown
   - Try: `ssh root@100.108.132.8`

5. **Fix DHCP → Static IPs**
   - aria changed from .64 to .82
   - Configure static IPs on router or use Tailscale IPs exclusively

6. **Investigate .86**
   - Try HTTPS: `https://192.168.4.86`
   - Could be PiKVM

---

## 🌐 RECOMMENDED: USE TAILSCALE FOR EVERYTHING

Instead of chasing DHCP IPs, use Tailscale hostnames:

```bash
# Enable Tailscale on your Mac first
tailscale up

# Then connect via Tailscale IPs (stable!)
ssh pi@100.66.235.47  # lucidia
ssh pi@100.109.14.17  # aria  
ssh pi@100.77.210.18  # alice (when online)
ssh root@100.108.132.8  # blackroad os-infinity
```

---

## 🏆 VERIFIED PRODUCTION STATS

**Active Now:** 2-3 nodes (lucidia, aria, shellfish)  
**In Mesh:** 5 nodes (+ 2 offline: alice, shellfish tailscale down)  
**Docker Containers:** 27+  
**Uptime:** 59+ days cumulative  
**Network:** Hybrid local + Tailscale VPN mesh  

