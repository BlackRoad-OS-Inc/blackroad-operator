# BlackRoad Network Inventory - Complete Map

**Last Updated:** December 20, 2025
**Verified:** All devices confirmed online and accessible via SSH

---

## 🗺️ Network Topology

```
Internet
    │
    └── Router (192.168.4.1)
         │
         ├── Mac-Operator (192.168.4.28) - Alexa's MacBook Pro
         │
         ├── blackroad-pi (192.168.4.64) - hostname: claude
         │   └── No Tailscale (needs setup!)
         │
         ├── lucidia (192.168.4.38)
         │   └── Tailscale: 100.66.235.47
         │
         ├── alice (192.168.4.49)
         │   └── Tailscale: 100.66.58.5
         │
         └── iPhone-Koder (192.168.4.68)
```

---

## 📋 Device Details

### 1. blackroad-pi (hostname: claude)

**Hardware:** Raspberry Pi 5 8GB

**Network Interfaces:**
- **wlan0:** 192.168.4.64/22
- **tailscale0:** ❌ **NOT CONNECTED** (only IPv6 link-local)
- **docker0:** 172.17.0.1/16
- **br-72f6d1669ac6:** 172.18.0.1/16 (Docker custom bridge)

**SSH Access:**
```bash
ssh blackroad-pi
ssh pi@192.168.4.64
```

**Services:**
- Docker running
- BlackRoad custom welcome banner
- Commands: `br-status`, `br-menu`

**IPv6:**
- ULA: `fdbc:b2ba:6fa5:1:3a3d:5a9b:5a2d:c64d/64`
- Global: `2001:1960:7000:9fcd:64c6:306:d1bb:101/64`

**Action Needed:** ⚠️ Add to Tailscale mesh

---

### 2. lucidia

**Hardware:** Raspberry Pi 5 8GB

**Network Interfaces:**
- **wlan0:** 192.168.4.38/22
- **tailscale0:** 100.66.235.47/32 ✅
- **docker0:** 172.17.0.1/16
- **br-91c3f105919e:** 172.18.0.1/16 (Docker custom bridge)

**SSH Access:**
```bash
# LAN
ssh lucidia
ssh pi@192.168.4.38

# Tailscale (from anywhere)
ssh pi@100.66.235.47
```

**Services:**
- Lucidia Core (Flask on port 5000)
- nginx (port 8080)
- Docker with 3+ containers running
- 13 AI agents

**Docker Containers (veth interfaces):**
- vethf653733@if2
- vetheb0160b@if2
- veth6e3ec18@if2

**IPv6:**
- Tailscale: `fd7a:115c:a1e0::5401:eb6c/128`
- ULA: `fdbc:b2ba:6fa5:1:1372:6bd8:d802:639e/64`
- Global: `2001:1960:7000:9fcd:b20b:7849:4210:3315/64`

---

### 3. alice

**Hardware:** Raspberry Pi 400 4GB

**Network Interfaces:**
- **wlan0:** 192.168.4.49/22
- **tailscale0:** 100.66.58.5/32 ✅
- **docker0:** 172.17.0.1/16
- **flannel.1:** 10.42.0.0/32 (Kubernetes overlay)
- **cni0:** 10.42.0.1/24 (Kubernetes CNI)

**SSH Access:**
```bash
# LAN
ssh alice
ssh alice@192.168.4.49

# Tailscale (from anywhere)
ssh alice@100.66.58.5
```

**Services:**
- Docker
- Kubernetes (k3s or similar)
- CNI networking
- Flannel overlay network

**Kubernetes Pods (veth interfaces):**
- veth90be1a56@if2 (169.254.140.217/16)
- veth41eb1027@if2 (169.254.117.137/16)
- vethba9caf3d@if2 (169.254.236.5/16)

**IPv6:**
- Tailscale: `fd7a:115c:a1e0::8501:3a12/128`
- ULA: `fdbc:b2ba:6fa5:1:d4e9:1c49:ed24:7bd0/64`
- Global: `2001:1960:7000:9fcd:6a1a:51a7:8135:237a/64`

---

### 4. Mac-Operator (Alexa's MacBook Pro)

**Network:**
- **en0 (WiFi):** 192.168.4.28/22
- **Tailscale:** ❌ Logged out (needs reconnection)

**SSH Keys:**
- Primary: `~/.ssh/id_br_ed25519`
- Alternate: `~/.ssh/id_ed25519`

**SSH Config:** `~/.ssh/config` (uses ProxyJump through blackroad-pi)

---

### 5. iPhone-Koder

**Network:**
- **IP:** 192.168.4.68

**SSH Access:** Via Termius app

**Status:** Active, responds to ping

---

## 🌐 Tailscale Mesh Network

**Headscale Server:** https://headscale.blackroad.io

**Connected Devices:**
- ✅ **lucidia:** 100.66.235.47
- ✅ **alice:** 100.66.58.5
- ❌ **blackroad-pi:** NOT on Tailscale
- ❌ **Mac-Operator:** Logged out (needs `tailscale up`)

**Tailscale IPv6 Network:** fd7a:115c:a1e0::/48

---

## 🚀 Quick Connection Reference

### Connect to All Pis

```bash
# LAN connections
ssh pi@192.168.4.64        # blackroad-pi
ssh pi@192.168.4.38        # lucidia
ssh alice@192.168.4.49     # alice

# Or use SSH config aliases
ssh blackroad-pi
ssh lucidia
ssh alice
```

### Connect via Tailscale (from anywhere)

```bash
# First, reconnect your Mac to Tailscale
sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes

# Then connect
ssh pi@100.66.235.47       # lucidia
ssh alice@100.66.58.5      # alice
```

---

## 🔧 Network Configuration

**WiFi Network:** asdfghjkl
**Subnet:** 192.168.4.0/22 (192.168.4.0 - 192.168.7.255)
**Router:** 192.168.4.1

**IPv6:**
- **ULA Prefix:** fdbc:b2ba:6fa5:1::/64 (Unique Local Address)
- **Global Prefix:** 2001:1960:7000:9fcd::/64 (Public IPv6)

---

## 📊 Service Map

### lucidia (192.168.4.38)

| Service | Port | Access |
|---------|------|--------|
| Lucidia Core (Flask) | 5000 | http://192.168.4.38:5000 |
| nginx | 8080 | http://192.168.4.38:8080 |
| SSH | 22 | ssh pi@192.168.4.38 |

**Port Forwarding from Mac:**
```bash
ssh -L 5000:localhost:5000 -L 8080:localhost:8080 lucidia
# Then open http://localhost:5000 and http://localhost:8080
```

### blackroad-pi (192.168.4.64)

| Service | Port | Access |
|---------|------|--------|
| VNC (wayvnc) | 5900 | localhost:5900 (via SSH tunnel) |
| SSH | 22 | ssh pi@192.168.4.64 |
| br-menu | - | Command-line interactive panel |

**Port Forwarding for VNC:**
```bash
ssh -L 5900:localhost:5900 blackroad-pi
# Then connect VNC viewer to localhost:5900
```

### alice (192.168.4.49)

| Service | Port | Access |
|---------|------|--------|
| Kubernetes API | 6443 | (varies by k3s config) |
| Docker | 2375/2376 | (if exposed) |
| SSH | 22 | ssh alice@192.168.4.49 |

---

## 🐳 Docker Networks

All three Pis have Docker running:

### Standard Docker Networks
- **docker0:** 172.17.0.1/16 (default bridge)

### Custom Docker Networks
- **blackroad-pi:** br-72f6d1669ac6 (172.18.0.1/16)
- **lucidia:** br-91c3f105919e (172.18.0.1/16)

### Kubernetes Networks (alice only)
- **flannel.1:** 10.42.0.0/32 (overlay)
- **cni0:** 10.42.0.1/24 (container network)

---

## ⚠️ Action Items

1. **Add blackroad-pi to Tailscale:**
   ```bash
   # On blackroad-pi
   sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes
   ```

2. **Reconnect Mac to Tailscale:**
   ```bash
   # On Mac
   sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes
   ```

3. **Verify all connections:**
   ```bash
   # On Mac
   ~/blackroad-sandbox/test-all-ssh.sh
   ```

---

## 🔑 SSH Key Distribution

Your `~/.ssh/id_br_ed25519.pub` key is installed on:
- ✅ blackroad-pi (192.168.4.64)
- ✅ lucidia (192.168.4.38)
- ✅ alice (192.168.4.49)

**Public key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad
```

---

## 📱 Mobile Access

**Termius (iPhone):**
- Can connect to all Pis via LAN
- ECDSA keys labeled `@blackroad-sandbox` installed

**Shellfish:**
- Keys labeled `ShellFish@Master-Key`

---

## 🧪 Testing Scripts

All located in `~/blackroad-sandbox/`:

**Test all SSH connections:**
```bash
~/blackroad-sandbox/test-all-ssh.sh
```

**Discover network neighbors:**
```bash
~/blackroad-sandbox/discover-neighbors.sh
```

---

## 📝 Notes

- **blackroad-pi hostname:** "claude" (interesting naming!)
- **alice:** Running Kubernetes - full container orchestration platform
- **lucidia:** Primary service hub with 13 AI agents
- All devices on same WiFi, same subnet (/22)
- Tailscale provides mesh connectivity when away from home
- All Pis have eth0 ports available but not connected (NO-CARRIER)

---

**Created:** December 20, 2025
**Source:** Live `ip address` output from all devices
**Verified:** SSH working to all devices from Mac
