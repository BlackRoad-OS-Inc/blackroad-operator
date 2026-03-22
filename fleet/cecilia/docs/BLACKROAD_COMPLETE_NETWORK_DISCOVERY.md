# 🌌 BlackRoad Complete Network Discovery
**Date:** 2026-02-11 23:58 UTC  
**Source:** SSH config + live network scan

## 🏠 LOCAL NETWORK (192.168.4.0/22)

### Production Cluster - 5 nodes discovered!
| Hostname | IP | Hardware | SSH User | Status | Notes |
|----------|-----|----------|----------|--------|-------|
| **alice** | 192.168.4.49 | Pi 400 (4GB) | alice | ✅ ONLINE | Keyboard computer |
| **lucidia** | 192.168.4.81 | Pi 5 (8GB) | lucidia | ✅ ONLINE | 🧠 **BRAIN** - NATS + Ollama |
| **octavia** | 192.168.4.38 | Pi 5 (8GB) | octavia | ✅ ONLINE | 169GB free (post-cleanup) |
| **aria** | 192.168.4.82 | Pi 5 (8GB) | aria | ✅ ONLINE | 9 containers, 4 weeks uptime |
| **cecilia** | 192.168.4.89 | Unknown | cecilia | ✅ ONLINE | 🆕 **NEW DISCOVERY** |

**Network:** asdfghjkl (WiFi)  
**Subnet:** /22 = 1022 usable IPs

---

## ☁️ CLOUD INFRASTRUCTURE - 2 DigitalOcean droplets

| Hostname | IP | SSH User |
|----------|-----|----------|
| **shellfish** | 174.138.44.45 | shellfish |
| **blackroad os-infinity** | 159.65.43.12 | root |

---

## 🔐 TAILSCALE VPN MESH - 3 endpoints configured

| Hostname | Tailscale IP | Local IP |
|----------|--------------|----------|
| cecilia-ts | 100.72.180.98 | 192.168.4.89 |
| lucidia-ts | 100.83.149.86 | 192.168.4.81 |
| aria-ts | 100.109.14.17 | 192.168.4.82 |

**⚠️ Tailscale NOT installed on operator (alexandria)**

---

## 🧠 LUCIDIA BRAIN - All services running!

| Service | Port | Status |
|---------|------|--------|
| NATS Event Bus | 4222 | ✅ RUNNING |
| Web Service | 3000 | ✅ RUNNING |
| Web Service | 8080 | ✅ RUNNING |

---

## 📊 TOTALS

- **Local Pi nodes:** 5 (4 confirmed + cecilia unknown)
- **Cloud droplets:** 2
- **Tailscale mesh:** 3 configured
- **Total infrastructure:** ~10 devices

## 🎯 NEXT: Investigate cecilia!

```bash
ssh cecilia "hostname && cat /proc/cpuinfo | grep Model && df -h /"
```
