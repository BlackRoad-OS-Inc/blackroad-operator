# Tailscale Complete Setup - BlackRoad Network

**Your Tailnet:** taile5d081.ts.net
**Mac (alexa-louise):** 100.95.120.67 ✅ Already connected

---

## 🎯 Current Tailscale Status

| Device | Tailscale IP | Magic DNS | Status |
|--------|--------------|-----------|--------|
| **Mac (alexa-louise)** | 100.95.120.67 | alexa-louise.taile5d081.ts.net | ✅ Connected |
| **lucidia** | 100.66.235.47 | lucidia.taile5d081.ts.net | ✅ Connected (verify) |
| **alice** | 100.66.58.5 | alice.taile5d081.ts.net | ✅ Connected (verify) |
| **blackroad-pi (claude)** | ❌ Not joined | claude.taile5d081.ts.net | ⏳ Need to join |
| **shellfish-drop** | ❌ Not connected | shellfish-drop.taile5d081.ts.net | ⏳ Need to join |
| **codex-infinity** | ❌ Unknown | codex-infinity.taile5d081.ts.net | ⏳ Need to check |

---

## 🚀 Setup Instructions

### 1. Connect blackroad-pi to Tailscale

**SSH into blackroad-pi:**
```bash
ssh blackroad-pi
```

**Install and connect Tailscale:**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

This will print a login URL. Open it on your Mac, sign in, and approve blackroad-pi.

**Verify:**
```bash
tailscale status
tailscale ip -4
hostname
```

**Expected result:**
- Tailscale IP: `100.x.x.x`
- Magic DNS: `claude.taile5d081.ts.net`

---

### 2. Connect shellfish-drop to Tailscale

**You're already connected to shellfish-drop as root!**

**Install and connect Tailscale:**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Open the login URL on your Mac, approve the droplet.

**Verify:**
```bash
tailscale status
tailscale ip -4
hostname
```

**Optional: Lock SSH to Tailscale only (recommended for security)**
```bash
# Allow SSH only via Tailscale
sudo ufw allow in on tailscale0 to any port 22
sudo ufw deny 22/tcp
sudo ufw enable
```

This prevents public SSH access - you can only connect via Tailscale.

---

### 3. Verify lucidia and alice

**Check lucidia:**
```bash
ssh pi@192.168.4.38
tailscale status
tailscale ip -4
```

**Check alice:**
```bash
ssh alice@192.168.4.49
tailscale status
tailscale ip -4
```

Both should already be connected based on the IPs we saw.

---

### 4. Check codex-infinity

**From your Mac:**
```bash
ssh root@159.65.43.12
```

**If connected, check Tailscale:**
```bash
tailscale status
```

**If not installed:**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

---

## 📝 After Setup - Update SSH Config

Once all devices are on Tailscale, update `~/.ssh/config` on your Mac:

```sshconfig
# BlackRoad Pis via Tailscale
Host lucidia
  HostName lucidia.taile5d081.ts.net
  User pi
  IdentityFile ~/.ssh/id_br_ed25519

Host alice
  HostName alice.taile5d081.ts.net
  User alice
  IdentityFile ~/.ssh/id_br_ed25519

Host blackroad-pi claude
  HostName claude.taile5d081.ts.net
  User pi
  IdentityFile ~/.ssh/id_br_ed25519

# DigitalOcean droplets via Tailscale
Host shellfish shellfish-drop
  HostName shellfish-drop.taile5d081.ts.net
  User root
  IdentityFile ~/.ssh/id_br_ed25519

Host codex codex-infinity
  HostName codex-infinity.taile5d081.ts.net
  User root
  IdentityFile ~/.ssh/id_br_ed25519
```

**Then you can simply:**
```bash
ssh lucidia
ssh alice
ssh claude
ssh shellfish
ssh codex
```

**Works from anywhere!** Coffee shop, airport, anywhere with internet.

---

## 🧪 Test Everything

**From your Mac, run these tests:**

### Test Tailscale mesh status
```bash
tailscale status
```

Should show all connected devices.

### Test SSH via Magic DNS
```bash
# Pis
ssh pi@lucidia.taile5d081.ts.net "hostname"
ssh alice@alice.taile5d081.ts.net "hostname"
ssh pi@claude.taile5d081.ts.net "hostname"

# Droplets
ssh root@shellfish-drop.taile5d081.ts.net "hostname"
ssh root@codex-infinity.taile5d081.ts.net "hostname"
```

### Test SSH via Tailscale IP
```bash
ssh pi@100.66.235.47 "hostname"      # lucidia
ssh alice@100.66.58.5 "hostname"     # alice
ssh pi@100.95.120.67 "hostname"      # Your Mac (loopback test)
```

---

## 🔐 Security Benefits

**With Tailscale:**
- ✅ Encrypted WireGuard VPN tunnel
- ✅ No open ports to the internet
- ✅ Works behind NAT/firewall
- ✅ Automatic key rotation
- ✅ Magic DNS for easy hostnames
- ✅ Access from anywhere

**Recommended: Lock droplets to Tailscale-only SSH**

On **each DigitalOcean droplet:**
```bash
# Allow SSH only via Tailscale interface
sudo ufw allow in on tailscale0 to any port 22
sudo ufw deny 22/tcp
sudo ufw enable
sudo ufw status
```

This means you can **only** SSH via Tailscale - no public SSH access.

---

## 📊 Complete Network Topology

```
INTERNET
    │
    └── Your Tailnet (taile5d081.ts.net)
         │
         ├── alexa-louise (Mac) ──────── 100.95.120.67 ✅
         │   └── LAN: 192.168.4.28
         │
         ├── lucidia (Pi) ────────────── 100.66.235.47 ✅
         │   └── LAN: 192.168.4.38
         │
         ├── alice (Pi) ──────────────── 100.66.58.5 ✅
         │   └── LAN: 192.168.4.49
         │
         ├── claude (Pi) ─────────────── 100.x.x.x ⏳
         │   └── LAN: 192.168.4.64
         │
         ├── shellfish-drop (DO) ──────── 100.x.x.x ⏳
         │   └── Public: 174.138.44.45
         │
         └── codex-infinity (DO) ───────── 100.x.x.x ⏳
             └── Public: 159.65.43.12
```

---

## 🎯 Quick Reference Commands

**Check Tailscale status:**
```bash
tailscale status              # See all peers
tailscale ip -4               # Your IPv4
tailscale ip -6               # Your IPv6
tailscale ping alice          # Ping another device
```

**Connect to Tailscale:**
```bash
sudo tailscale up             # Connect
sudo tailscale down           # Disconnect
sudo tailscale logout         # Log out
```

**SSH via Tailscale:**
```bash
# By Magic DNS
ssh pi@lucidia.taile5d081.ts.net
ssh alice@alice.taile5d081.ts.net

# By Tailscale IP
ssh pi@100.66.235.47
ssh alice@100.66.58.5
```

---

## ✅ Completion Checklist

- [ ] blackroad-pi connected to Tailscale
- [ ] shellfish-drop connected to Tailscale
- [ ] codex-infinity connected to Tailscale (if needed)
- [ ] Updated `~/.ssh/config` with Magic DNS names
- [ ] Tested SSH to all devices via Tailscale
- [ ] (Optional) Locked droplets to Tailscale-only SSH
- [ ] Run `tailscale status` to see complete mesh

---

## 🆘 Troubleshooting

**Device not showing in `tailscale status`?**
```bash
# On that device:
sudo tailscale up
tailscale status
```

**Can't reach device by Magic DNS?**
```bash
# Try IP directly first:
ssh pi@100.66.235.47

# Check DNS:
ping lucidia.taile5d081.ts.net
```

**SSH still asks for password?**
```bash
# Make sure SSH key is installed:
ssh-copy-id -i ~/.ssh/id_br_ed25519.pub pi@lucidia.taile5d081.ts.net
```

---

**Your Tailnet:** taile5d081.ts.net
**Documentation:** https://tailscale.com/kb/
**Admin Console:** https://login.tailscale.com/admin/machines

---

**Created:** December 20, 2025
**Location:** `~/blackroad-sandbox/TAILSCALE_COMPLETE_SETUP.md`
