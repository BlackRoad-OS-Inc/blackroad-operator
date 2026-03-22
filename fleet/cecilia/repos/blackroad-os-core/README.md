# BlackRoad Network Documentation

**Last Updated:** December 20, 2025
**Status:** ✅ All systems operational

---

## 🎉 Great News!

Your SSH is **already working** to all three Raspberry Pis! You successfully connected to:
- ✅ blackroad-pi (192.168.4.64)
- ✅ lucidia (192.168.4.38)
- ✅ alice (192.168.4.49)

---

## 📖 Start Here

**For complete documentation index:**
```bash
cat ~/blackroad-sandbox/INDEX.md
```

**For network topology map:**
```bash
cat ~/blackroad-sandbox/NETWORK_MAP.txt
```

**For detailed device inventory:**
```bash
cat ~/blackroad-sandbox/NETWORK_INVENTORY.md
```

---

## 🚀 Quick Commands

### Connect to Your Pis

```bash
ssh blackroad-pi    # Primary Pi (hostname: claude)
ssh lucidia         # Service hub with 13 AI agents
ssh alice           # Kubernetes node
```

### Test All Connections

```bash
~/blackroad-sandbox/test-all-ssh.sh
```

### Discover Network Devices

```bash
~/blackroad-sandbox/discover-neighbors.sh
```

---

## 📊 Your Network at a Glance

| Device | IP | Tailscale | SSH | Services |
|--------|-----|-----------|-----|----------|
| **blackroad-pi** | 192.168.4.64 | ❌ | ✅ | Docker, VNC, br-menu |
| **lucidia** | 192.168.4.38 | ✅ 100.66.235.47 | ✅ | Flask, nginx, 13 agents |
| **alice** | 192.168.4.49 | ✅ 100.66.58.5 | ✅ | Kubernetes (k3s) |
| **Mac** | 192.168.4.28 | ❌ | - | Your MacBook Pro |

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
```

### 3. Test Tailscale Connections

```bash
ssh pi@100.66.235.47              # lucidia via Tailscale
ssh alice@100.66.58.5             # alice via Tailscale
```

---

## 📁 Documentation Files

All documentation is in `~/blackroad-sandbox/`:

### Essential Reading
- **README.md** - This file
- **INDEX.md** - Complete documentation index
- **NETWORK_MAP.txt** - Visual network topology

### Network Information
- **NETWORK_INVENTORY.md** - Detailed device inventory

### SSH Guides
- **START_HERE.md** - Quick SSH setup
- **SETUP_SUMMARY.md** - Complete SSH summary
- **SSH_SETUP_COMPLETE.md** - Full SSH reference

### Scripts
- **test-all-ssh.sh** - Test all SSH connections
- **discover-neighbors.sh** - Network device scanner

---

## 🔑 Your SSH Key

**Location:** `~/.ssh/id_br_ed25519`

**Public Key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad
```

**Installed on:** All three Pis ✅

---

## 🌐 Network Info

- **WiFi:** asdfghjkl
- **Subnet:** 192.168.4.0/22
- **Router:** 192.168.4.1
- **Tailscale:** https://headscale.blackroad.io

---

## 📱 Services

### lucidia (192.168.4.38)
- **Flask API:** Port 5000
- **nginx:** Port 8080
- **13 AI Agents** running

### blackroad-pi (192.168.4.64)
- **br-menu** - Interactive panel
- **br-status** - Health snapshot
- **VNC** - Port 5900

### alice (192.168.4.49)
- **Kubernetes** - k3s cluster
- **Flannel** - Network overlay

---

## 🎯 Most Common Tasks

### Connect to a Pi
```bash
ssh lucidia
```

### Copy Files
```bash
scp ~/file.txt lucidia:~/
scp lucidia:~/data.json ~/
```

### Port Forward
```bash
ssh -L 5000:localhost:5000 lucidia
# Open http://localhost:5000
```

### Test Everything
```bash
~/blackroad-sandbox/test-all-ssh.sh
```

---

## 🆘 Need Help?

**View full index:**
```bash
cat ~/blackroad-sandbox/INDEX.md
```

**View network map:**
```bash
cat ~/blackroad-sandbox/NETWORK_MAP.txt
```

**List all docs:**
```bash
ls -lh ~/blackroad-sandbox/
```

---

## ✨ Highlights

- ✅ SSH working to all 3 Pis
- ✅ Network fully mapped and documented
- ✅ Tailscale mesh active (lucidia + alice)
- ✅ All services running (Docker, K8s, Flask, nginx)
- ✅ Complete documentation with examples

**Your BlackRoad mesh network is fully operational!** 🎉

---

**Questions?** Check `INDEX.md` for complete documentation index.
