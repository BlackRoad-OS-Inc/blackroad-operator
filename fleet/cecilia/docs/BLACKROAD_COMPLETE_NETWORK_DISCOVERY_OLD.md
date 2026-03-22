# 🖤 BlackRoad Complete Network Discovery

## Network Scan Results - January 30, 2026

---

## ✅ CONFIRMED DEVICES

### Raspberry Pi Cluster (5 Pis)
| Device | IP | MAC | Status | Notes |
|--------|-----|-----|--------|-------|
| **alice** | 192.168.4.49 | d8:3a:dd:ff:98:87 | ✅ ONLINE | Kubernetes master, web server |
| **lucidia** | 192.168.4.38 | 2c:cf:67:cf:fa:17 | ✅ ONLINE | Web server, Docker |
| **aria** | 192.168.4.82 | 88:a2:9e:0d:42:07 | ✅ ONLINE | Docker running |
| **octavia** | 192.168.4.74 | Unknown | ❌ OFFLINE | Hailo accelerator (FAILED neighbors) |
| **anastasia** | Unknown | Unknown | ❌ MISSING | Not found on network |

### Control Machine
| Device | IP | MAC | Tailscale | Type |
|--------|-----|-----|-----------|------|
| **lucidia-operator** | 192.168.4.28 | b0:be:83:66:cc:10 | 100.91.90.68 | MacBook (M1/M2) |

### Network Infrastructure
| Device | IP | MAC | Type |
|--------|-----|-----|------|
| **Router** | 192.168.4.1 | 44:ac:85:94:37:92 | Gateway |

---

## 🔍 NEWLY IDENTIFIED DEVICES

### From Pi Neighbor Tables:

| IP | MAC | Identified As | Seen By | Notes |
|----|-----|---------------|---------|-------|
| 192.168.4.22 | 30:be:29:5b:24:5f | Unknown #1 | alice | REACHABLE, all ports closed |
| 192.168.4.27 | 6c:4a:85:32:ae:72 | Unknown #2 | alice, aria | REACHABLE, **port 5000 OPEN** |
| 192.168.4.33 | 60:92:c8:11:cf:7c | Unknown #3 | alice, lucidia, aria | STALE |
| 192.168.4.44 | 98:17:3c:38:db:78 | Unknown #4 | alice | REACHABLE |
| 192.168.4.53 | 98:41:5c:aa:13:f2 | **Possible ESP32** | alice | STALE, MAC suggests IoT |
| 192.168.4.86 | 4a:2f:03:b3:1a:fa | Unknown #5 | alice, lucidia | REACHABLE/STALE |

### Additional Devices Found by lucidia:

| IP | MAC | Notes |
|----|-----|-------|
| 192.168.4.26 | d4:be:dc:6c:61:6b | Not in original scan |
| 192.168.4.83 | 54:4c:8a:9b:09:3d | Seen by lucidia & aria |
| 192.168.4.84 | 06:eb:f1:b1:d0:f7 | Seen by lucidia |

---

## 🎯 SUSPICIOUS/INTERESTING FINDINGS

1. **192.168.4.27** - Port 5000 OPEN
   - Possibly running a web service
   - UPnP or custom app
   - Should investigate further

2. **192.168.4.53** - Possible ESP32
   - MAC pattern suggests IoT device
   - Check if this is your SenseCAP Watcher or USB-C operator

3. **Multiple Unknown Devices (9+ total)**
   - Could be:
     - ESP32 development boards
     - Phones/tablets on WiFi
     - Smart home devices
     - Other IoT equipment

4. **192.168.4.81** - INCOMPLETE on multiple Pis
   - Device is partially visible but not responding to ARP
   - May be intermittent or security-filtered

---

## 🔬 DETAILED NEIGHBOR ANALYSIS

### alice's View (most comprehensive):
- Sees 12 IPv4 devices on local network
- Running Docker (172.17.0.x) and Kubernetes (10.42.x.x)
- Has Flannel CNI network (10.42.0.0)
- IPv6 enabled

### lucidia's View:
- Sees 10+ devices
- Multiple Docker networks (br-91c3f105919e, br-9985b8894e1b)
- Found device at .26 that wasn't in Mac scan

### aria's View:
- Sees 7 devices
- Running Docker (172.17.0.141)
- Confirms .27 and .83 as REACHABLE

---

## 📊 NETWORK TOPOLOGY

```
192.168.4.0/22 Network (1024 addresses)
├── .1       → Router (Gateway)
├── .22      → Unknown device #1
├── .26      → Unknown device (new)
├── .27      → Unknown device #2 (PORT 5000 OPEN) ⚠️
├── .28      → lucidia-operator (Mac)
├── .33      → Unknown device #3
├── .38      → lucidia (Pi)
├── .44      → Unknown device #4
├── .49      → alice (Pi)
├── .53      → Possible ESP32
├── .74      → octavia (OFFLINE)
├── .81      → INCOMPLETE (ghost device)
├── .82      → aria (Pi)
├── .83      → Unknown device (new)
├── .84      → Unknown device (new)
└── .86      → Unknown device #5
```

---

## 🚀 RECOMMENDED ACTIONS

1. **Investigate 192.168.4.27** (port 5000):
   ```bash
   curl http://192.168.4.27:5000
   nmap -sV -p 5000 192.168.4.27
   ```

2. **Check if .53 is ESP32**:
   - Look for SenseCAP Watcher
   - Check USB-C Operator device

3. **Wake up octavia**:
   ```bash
   # Power cycle or check physical connection
   ```

4. **Find anastasia**:
   - Check if it's powered on
   - May be on different VLAN or network

5. **Secure unknown devices**:
   - Identify all MACs
   - Add to network map or block if untrusted

---

## 🔐 SECURITY NOTES

- **9+ unknown devices** on network
- Some devices respond to ping but not to port scans (stealth mode?)
- IPv6 is active on network (potential security consideration)
- Multiple Docker/Kubernetes networks running

---

**Scan Method:** SSH to Pis + `ip neigh show`  
**Coverage:** 15+ devices discovered  
**Network Size:** /22 (1024 possible IPs)  
**Active Devices:** 15+  
**BlackRoad Infrastructure:** 7 devices (6 online, 1 offline)
