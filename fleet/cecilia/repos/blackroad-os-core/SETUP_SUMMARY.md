# BlackRoad SSH Setup - Complete Summary

## 🎯 What You Need to Do RIGHT NOW

### Step 1: Add Your Mac's Key to Lucidia

**On Lucidia** (logged in as `pi` via Termius), copy and paste this entire block:

```bash
mkdir -p /home/pi/.ssh
chmod 700 /home/pi/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad' >> /home/pi/.ssh/authorized_keys
chmod 600 /home/pi/.ssh/authorized_keys
tail -n 3 /home/pi/.ssh/authorized_keys
sudo systemctl enable --now ssh
sudo systemctl restart ssh
echo "✅ Setup complete! Test from Mac now."
```

### Step 2: Test SSH from Your Mac

```bash
ssh -i ~/.ssh/id_br_ed25519 -o IdentitiesOnly=yes pi@192.168.4.38
```

### Step 3: Reconnect Tailscale on Mac

```bash
sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes
tailscale status
```

### Step 4: Test Tailscale SSH

```bash
ssh -i ~/.ssh/id_br_ed25519 -o IdentitiesOnly=yes pi@100.66.235.47
```

---

## 📊 Current Network Status

**Your Mac IP:** 192.168.4.28

### Known Devices

| Device | LAN IP | Tailscale IP | User | Status |
|--------|---------|--------------|------|--------|
| **blackroad-pi** | 192.168.4.64 | - | pi | ✅ SSH Working |
| **lucidia** | 192.168.4.38 | 100.66.235.47 | pi | ❌ Needs key |
| **alice** | 192.168.4.49 | 100.66.58.5 | alice | ✅ SSH Working |
| **lucidia-alternate** | 192.168.4.99 | - | pi | ❓ Unknown |
| **iPhone-Koder** | 192.168.4.68 | - | - | ❓ Unknown |

---

## 🔑 Your SSH Keys

### Primary Key (id_br_ed25519) - **USE THIS ONE**

**Public Key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad
```

**Location:** `~/.ssh/id_br_ed25519.pub`

**This is the key we're adding to Lucidia.**

### Alternate Key (id_ed25519)

**Public Key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJWIHlfOkBRPJjirPmhjckW2Rtz+X/Ss4norgWg/sBO alexa@blackroad
```

**Location:** `~/.ssh/id_ed25519.pub`

---

## 📁 Files Created for You

All in `~/blackroad-sandbox/`:

| File | Purpose |
|------|---------|
| **LUCIDIA_SETUP_CORRECTED.txt** | ⭐ **START HERE** - Copy/paste commands |
| **discover-neighbors.sh** | Scan network for all devices |
| **test-all-ssh.sh** | Test SSH connections to all known devices |
| **SSH_SETUP_COMPLETE.md** | Complete reference guide with examples |
| **ADD_MAC_KEY_TO_LUCIDIA.md** | Detailed Lucidia setup (alternate key) |
| **README_SSH.md** | Documentation index |
| **SETUP_SUMMARY.md** | This file - Quick summary |

---

## 🚀 Quick Commands Reference

### After Setup is Complete

**Test all SSH connections:**
```bash
~/blackroad-sandbox/test-all-ssh.sh
```

**Discover network neighbors:**
```bash
~/blackroad-sandbox/discover-neighbors.sh
```

**Connect to devices:**
```bash
# Using specific key
ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.64        # blackroad-pi
ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.38        # lucidia
ssh -i ~/.ssh/id_br_ed25519 alice@192.168.4.49     # alice

# Via Tailscale (works from anywhere)
ssh -i ~/.ssh/id_br_ed25519 pi@100.66.235.47       # lucidia
ssh -i ~/.ssh/id_br_ed25519 alice@100.66.58.5      # alice
```

**Copy files:**
```bash
scp -i ~/.ssh/id_br_ed25519 ~/file.txt pi@192.168.4.38:~/
scp -i ~/.ssh/id_br_ed25519 pi@192.168.4.38:~/data.json ~/Downloads/
```

**Port forwarding:**
```bash
ssh -i ~/.ssh/id_br_ed25519 -L 5000:localhost:5000 -L 8080:localhost:8080 pi@192.168.4.38
# Then open http://localhost:5000 and http://localhost:8080
```

---

## 🔧 Understanding Your Setup

### Why Two SSH Keys?

You have two ED25519 keys on your Mac:
1. **id_ed25519** - Used by your SSH config (blackroad-pi, alice already have this)
2. **id_br_ed25519** - The one we're adding to Lucidia now

Both are valid, but we're using `id_br_ed25519` for Lucidia as recommended.

### Your SSH Config

Location: `~/.ssh/config`

Your current config uses:
- **IdentityFile:** `~/.ssh/id_ed25519`
- **ProxyJump:** Connects through `blackroad-pi` first

This means `ssh lucidia` will:
1. Connect to blackroad-pi
2. Jump to lucidia through it

To bypass ProxyJump and connect directly:
```bash
ssh -o ProxyJump=none -i ~/.ssh/id_br_ed25519 pi@192.168.4.38
```

---

## 🐛 Troubleshooting

### "Permission denied (publickey)"

**On Lucidia, check:**
```bash
ls -la /home/pi/.ssh
cat /home/pi/.ssh/authorized_keys
```

Expected permissions:
- `drwx------` (700) for `/home/pi/.ssh/`
- `-rw-------` (600) for `/home/pi/.ssh/authorized_keys`

**View auth logs:**
```bash
sudo tail -n 20 /var/log/auth.log
```

### "Connection refused"

**On Lucidia, check SSH service:**
```bash
sudo systemctl status ssh
sudo systemctl restart ssh
```

### "Connection timed out"

**From Mac, check network:**
```bash
ping 192.168.4.38
ipconfig getifaddr en0   # Should show 192.168.4.x
```

---

## ✅ Success Checklist

After completing the setup:

- [ ] Ran setup commands on Lucidia (Step 1)
- [ ] Can SSH to Lucidia from Mac: `ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.38`
- [ ] Reconnected Tailscale: `sudo tailscale up ...`
- [ ] Can SSH via Tailscale: `ssh -i ~/.ssh/id_br_ed25519 pi@100.66.235.47`
- [ ] Ran test script: `~/blackroad-sandbox/test-all-ssh.sh`
- [ ] All local Pis show ✅ green
- [ ] Can copy files to Lucidia: `scp -i ~/.ssh/id_br_ed25519 test.txt pi@192.168.4.38:~/`

---

## 📡 Tailscale Info

**Your Headscale Server:** https://headscale.blackroad.io

**Connect command:**
```bash
sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes
```

**Check status:**
```bash
tailscale status
```

**Known Tailscale IPs:**
- **lucidia:** 100.66.235.47
- **alice:** 100.66.58.5

---

## 🎓 Next Steps After SSH Works

1. **Update SSH config** to use `id_br_ed25519` for all devices:
   ```bash
   # Edit ~/.ssh/config
   # Change all: IdentityFile ~/.ssh/id_ed25519
   # To: IdentityFile ~/.ssh/id_br_ed25519
   ```

2. **Add convenient shell aliases** (`~/.zshrc`):
   ```bash
   alias sshluc='ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.38'
   alias sshal='ssh -i ~/.ssh/id_br_ed25519 alice@192.168.4.49'
   alias sshbr='ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.64'
   ```

3. **Set up automated backups:**
   ```bash
   # Daily backup of Lucidia
   rsync -avz -e "ssh -i ~/.ssh/id_br_ed25519" pi@192.168.4.38:/opt/lucidia/data/ ~/backups/lucidia/
   ```

4. **Monitor all devices:**
   ```bash
   for ip in 192.168.4.64 192.168.4.38 192.168.4.49; do
       echo "=== $ip ==="
       ssh -i ~/.ssh/id_br_ed25519 -o ConnectTimeout=3 pi@$ip "hostname && uptime"
   done
   ```

---

## 🆘 Need More Help?

**View detailed guide:**
```bash
cat ~/blackroad-sandbox/SSH_SETUP_COMPLETE.md
```

**View corrected setup:**
```bash
cat ~/blackroad-sandbox/LUCIDIA_SETUP_CORRECTED.txt
```

**Discover network devices:**
```bash
~/blackroad-sandbox/discover-neighbors.sh
```

**Test all connections:**
```bash
~/blackroad-sandbox/test-all-ssh.sh
```

---

## 📝 Quick Reference Card

### Connection Strings

| Device | LAN SSH | Tailscale SSH |
|--------|---------|---------------|
| **lucidia** | `ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.38` | `ssh -i ~/.ssh/id_br_ed25519 pi@100.66.235.47` |
| **blackroad-pi** | `ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.64` | - |
| **alice** | `ssh -i ~/.ssh/id_br_ed25519 alice@192.168.4.49` | `ssh -i ~/.ssh/id_br_ed25519 alice@100.66.58.5` |

### File Transfer

```bash
# TO device
scp -i ~/.ssh/id_br_ed25519 ~/file.txt pi@192.168.4.38:~/

# FROM device
scp -i ~/.ssh/id_br_ed25519 pi@192.168.4.38:~/data.json ~/

# Sync directory
rsync -avz -e "ssh -i ~/.ssh/id_br_ed25519" ~/local/ pi@192.168.4.38:~/remote/
```

### Port Forwarding

```bash
# Lucidia Flask (5000) + nginx (8080)
ssh -i ~/.ssh/id_br_ed25519 -L 5000:localhost:5000 -L 8080:localhost:8080 pi@192.168.4.38

# Then open in browser:
# http://localhost:5000
# http://localhost:8080
```

---

**Created:** December 20, 2025
**Last Updated:** December 20, 2025
**Author:** Claude Code
**Location:** `~/blackroad-sandbox/SETUP_SUMMARY.md`

---

## 🎯 TL;DR

**1. On Lucidia (via Termius):**
```bash
mkdir -p /home/pi/.ssh && chmod 700 /home/pi/.ssh && echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad' >> /home/pi/.ssh/authorized_keys && chmod 600 /home/pi/.ssh/authorized_keys && sudo systemctl restart ssh
```

**2. On your Mac:**
```bash
ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.38
```

**3. Celebrate!** 🎉
