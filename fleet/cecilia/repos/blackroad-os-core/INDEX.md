# BlackRoad Network & SSH Documentation - Index

**Created:** December 20, 2025
**Status:** ✅ All SSH connections working
**Location:** `~/blackroad-sandbox/`

---

## 🎯 Quick Start

**Your SSH is already working!** All three Pis are accessible from your Mac.

**Test connections:**
```bash
ssh blackroad-pi    # or: ssh pi@192.168.4.64
ssh lucidia         # or: ssh pi@192.168.4.38
ssh alice           # or: ssh alice@192.168.4.49
```

---

## 📚 Documentation Files

### 🗺️ Network Maps & Inventory

| File | Description | When to Use |
|------|-------------|-------------|
| **NETWORK_MAP.txt** | Visual network topology with ASCII art | Quick reference, printing |
| **NETWORK_INVENTORY.md** | Complete device inventory with all details | Deep dive into network config |

### 🔑 SSH Setup Guides

| File | Description | When to Use |
|------|-------------|-------------|
| **START_HERE.md** | Quick 2-step SSH setup (if needed) | Setting up new devices |
| **SETUP_SUMMARY.md** | Complete SSH setup summary | Reference guide |
| **LUCIDIA_SETUP_CORRECTED.txt** | Plain text Lucidia setup | Copy/paste to Termius |
| **SSH_SETUP_COMPLETE.md** | Full SSH reference guide | Troubleshooting |
| **ADD_MAC_KEY_TO_LUCIDIA.md** | Detailed Lucidia instructions | Alternate setup method |
| **QUICK_START_SSH.txt** | Quick reference card | Fast lookup |
| **README_SSH.md** | SSH documentation index | Finding SSH docs |

### 🧪 Testing & Discovery Scripts

| File | Description | Command |
|------|-------------|---------|
| **test-all-ssh.sh** | Test SSH to all devices | `~/blackroad-sandbox/test-all-ssh.sh` |
| **discover-neighbors.sh** | Scan network for devices | `~/blackroad-sandbox/discover-neighbors.sh` |
| **setup-lucidia-ssh.sh** | Interactive SSH setup | `~/blackroad-sandbox/setup-lucidia-ssh.sh` |
| **lucidia-oneliner.sh** | One-script Lucidia setup | Run on Lucidia |

### 📖 This Index

| File | Description |
|------|-------------|
| **INDEX.md** | This file - Master documentation index |

---

## 🖥️ Your BlackRoad Network

### Devices

| Device | IP | Tailscale | Role |
|--------|-----|-----------|------|
| **blackroad-pi** | 192.168.4.64 | ❌ Not joined | Primary Pi, hostname: "claude" |
| **lucidia** | 192.168.4.38 | ✅ 100.66.235.47 | Service hub, 13 AI agents |
| **alice** | 192.168.4.49 | ✅ 100.66.58.5 | Kubernetes node (k3s) |
| **Mac-Operator** | 192.168.4.28 | ❌ Logged out | Your MacBook Pro |
| **iPhone-Koder** | 192.168.4.68 | ? | iPhone with Termius |

### Network Info

- **WiFi SSID:** asdfghjkl
- **Subnet:** 192.168.4.0/22 (1024 IPs)
- **Router:** 192.168.4.1
- **Tailscale Server:** https://headscale.blackroad.io

---

## 🚀 Common Commands

### Connect to Devices

```bash
# LAN connections
ssh blackroad-pi                  # or: ssh pi@192.168.4.64
ssh lucidia                       # or: ssh pi@192.168.4.38
ssh alice                         # or: ssh alice@192.168.4.49

# Tailscale (from anywhere - after rejoining)
ssh pi@100.66.235.47              # lucidia
ssh alice@100.66.58.5             # alice
```

### Test Everything

```bash
# Test all SSH connections
~/blackroad-sandbox/test-all-ssh.sh

# Discover network devices
~/blackroad-sandbox/discover-neighbors.sh
```

### File Transfer

```bash
# Copy TO a Pi
scp ~/file.txt lucidia:~/
scp -r ~/folder alice:/home/alice/

# Copy FROM a Pi
scp lucidia:~/data.json ~/Downloads/
scp alice:~/output.txt ~/

# Sync directories
rsync -avz ~/local/ lucidia:~/remote/
```

### Port Forwarding

```bash
# Lucidia services (Flask 5000, nginx 8080)
ssh -L 5000:localhost:5000 -L 8080:localhost:8080 lucidia

# blackroad-pi VNC
ssh -L 5900:localhost:5900 blackroad-pi
```

---

## 🔧 Next Steps

### 1. Add blackroad-pi to Tailscale

```bash
ssh blackroad-pi
sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes
```

### 2. Reconnect Your Mac to Tailscale

```bash
sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes
tailscale status
```

### 3. Test Tailscale Connections

```bash
ssh pi@100.66.235.47              # lucidia
ssh alice@100.66.58.5             # alice
```

---

## 📊 Network Status at a Glance

**LAN Status:**
- ✅ All 3 Pis online and accessible via SSH
- ✅ Router (192.168.4.1) online
- ✅ Mac (192.168.4.28) on network
- ✅ iPhone (192.168.4.68) online

**Tailscale Status:**
- ✅ lucidia (100.66.235.47) - Connected
- ✅ alice (100.66.58.5) - Connected
- ❌ blackroad-pi - Not joined (needs setup)
- ❌ Mac-Operator - Logged out (needs reconnect)

**SSH Status:**
- ✅ All keys installed on all Pis
- ✅ SSH working from Mac to all Pis via LAN
- ⏳ Tailscale SSH pending (Mac needs to rejoin)

---

## 🔑 SSH Key Info

**Your Primary Key:** `~/.ssh/id_br_ed25519`

**Public Key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad
```

**Installed On:**
- ✅ blackroad-pi (192.168.4.64)
- ✅ lucidia (192.168.4.38)
- ✅ alice (192.168.4.49)

---

## 📱 Services Running

### lucidia (192.168.4.38)
- **Lucidia Core Flask API:** Port 5000
- **nginx:** Port 8080
- **Docker:** 3+ containers
- **AI Agents:** 13 agents running

### blackroad-pi (192.168.4.64)
- **BlackRoad Panel:** `br-menu`, `br-status`
- **VNC (wayvnc):** Port 5900
- **Docker:** 3+ containers

### alice (192.168.4.49)
- **Kubernetes (k3s):** API on port 6443
- **Docker:** Container runtime
- **Flannel:** Kubernetes networking

---

## 🐛 Troubleshooting

**Can't connect via SSH?**
```bash
# Test basic connectivity
ping 192.168.4.38

# Try verbose SSH
ssh -vvv pi@192.168.4.38

# Check your SSH config
cat ~/.ssh/config
```

**Tailscale not working?**
```bash
# Check status
tailscale status

# Reconnect
sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes
```

**Need to reset everything?**
```bash
# View all documentation
ls -lh ~/blackroad-sandbox/*.md
ls -lh ~/blackroad-sandbox/*.txt
ls -lh ~/blackroad-sandbox/*.sh
```

---

## 📖 Where to Find Specific Info

**Want to know:**
- Network topology? → `NETWORK_MAP.txt`
- All device details? → `NETWORK_INVENTORY.md`
- SSH setup steps? → `START_HERE.md`
- Complete SSH guide? → `SETUP_SUMMARY.md`
- Quick SSH reference? → `QUICK_START_SSH.txt`
- How to test? → `test-all-ssh.sh`

---

## 🎓 Interesting Findings

- **blackroad-pi is named "claude"** - Has custom welcome banner
- **alice runs Kubernetes** - Full k3s cluster on a Pi 400
- **lucidia is the hub** - 13 AI agents, Flask API, nginx
- **All on WiFi** - Ethernet ports not used on any Pi
- **IPv6 enabled** - Both global and ULA addresses
- **Docker everywhere** - All three Pis running containers

---

## 📝 Quick Reference

### File Locations
```
~/blackroad-sandbox/
├── Network Documentation
│   ├── NETWORK_MAP.txt
│   ├── NETWORK_INVENTORY.md
│   └── INDEX.md (this file)
│
├── SSH Guides
│   ├── START_HERE.md
│   ├── SETUP_SUMMARY.md
│   ├── SSH_SETUP_COMPLETE.md
│   └── LUCIDIA_SETUP_CORRECTED.txt
│
└── Scripts
    ├── test-all-ssh.sh
    ├── discover-neighbors.sh
    └── setup-lucidia-ssh.sh
```

### SSH Config Location
```
~/.ssh/config
~/.ssh/id_br_ed25519 (private key)
~/.ssh/id_br_ed25519.pub (public key)
```

---

## ✅ Success!

Your BlackRoad mesh network is fully operational with:
- ✅ 3 Raspberry Pis online
- ✅ SSH working to all devices
- ✅ Tailscale mesh (lucidia + alice)
- ✅ Docker running on all Pis
- ✅ Services running (Flask, nginx, Kubernetes)

**Next step:** Add blackroad-pi to Tailscale and reconnect your Mac!

---

**Last Updated:** December 20, 2025
**Verified:** All SSH connections tested and working
**Source:** Live network scans and `ip address` outputs from all devices
