# BlackRoad SSH Setup - Complete Guide

## 🎯 Quick Start (What You Need to Do RIGHT NOW)

### On Lucidia (logged in via Termius):

Copy this entire command block and paste it into your Lucidia terminal:

```bash
mkdir -p $HOME/.ssh && chmod 700 $HOME/.ssh && touch $HOME/.ssh/authorized_keys && chmod 600 $HOME/.ssh/authorized_keys && echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJWIHlfOkBRPJjirPmhjckW2Rtz+X/Ss4norgWg/sBO alexa@blackroad' >> $HOME/.ssh/authorized_keys && tail -n 1 $HOME/.ssh/authorized_keys && sudo systemctl enable ssh && sudo systemctl restart ssh && echo "✅ Done! Test from Mac: ssh pi@192.168.4.38"
```

### Then on Your Mac:

```bash
# Test the connection
ssh pi@192.168.4.38 "echo '✅ SUCCESS!'"

# Or test all devices
~/blackroad-sandbox/test-all-ssh.sh
```

---

## 📊 Current Status

| Device | IP | Status | Access Method |
|--------|-----|--------|---------------|
| **blackroad-pi** | 192.168.4.64 | ✅ Working | Direct SSH |
| **alice** | 192.168.4.49 | ✅ Working | Direct SSH |
| **lucidia** | 192.168.4.38 | ❌ Needs key | Via Termius (for now) |
| **codex-infinity** | 159.65.43.12 | ❓ Unknown | Should work |
| **shellfish-drop** | 174.138.44.45 | ❓ Unknown | May be down |

---

## 🔑 Your SSH Keys

### Primary Key (Used by SSH Config): `~/.ssh/id_ed25519`
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJWIHlfOkBRPJjirPmhjckW2Rtz+X/Ss4norgWg/sBO alexa@blackroad
```
**This is the one we're adding to Lucidia.**

### Alternate Key: `~/.ssh/id_br_ed25519`
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad
```

---

## 📁 Files Created for You

All in `~/blackroad-sandbox/`:

| File | Purpose |
|------|---------|
| `ADD_MAC_KEY_TO_LUCIDIA.md` | **Main guide** - Read this for detailed instructions |
| `setup-lucidia-ssh.sh` | Interactive setup script (asks you to paste commands on Lucidia) |
| `test-all-ssh.sh` | **Test script** - Tests all SSH connections |
| `lucidia-oneliner.sh` | Single script to run on Lucidia (can paste whole file) |
| `SSH_SETUP_COMPLETE.md` | This file - Quick reference |

---

## 🚀 Usage Examples

### Connect to Devices

```bash
# Direct IP connections
ssh pi@192.168.4.64        # blackroad-pi
ssh pi@192.168.4.38        # lucidia (after setup)
ssh alice@192.168.4.49     # alice

# Using SSH config aliases (ProxyJump via blackroad-pi)
ssh blackroad-pi
ssh lucidia                # Hops through blackroad-pi
ssh alice                  # Hops through blackroad-pi

# Tailscale connections (works from anywhere)
ssh pi@100.66.235.47       # lucidia
ssh alice@100.66.58.5      # alice
```

### Port Forwarding

```bash
# Forward Lucidia's Flask (5000) and nginx (8080)
ssh -L 5000:localhost:5000 -L 8080:localhost:8080 lucidia

# Then open in browser:
# http://localhost:5000 - Lucidia Core API
# http://localhost:8080 - nginx
```

### File Transfer

```bash
# Copy TO a device
scp ~/file.txt lucidia:~/
scp -r ~/folder alice:/home/alice/

# Copy FROM a device
scp lucidia:/opt/lucidia/logs/app.log ~/Downloads/
scp alice:/home/alice/data.json ~/

# Sync directories with rsync
rsync -avz ~/projects/blackroad-os/ lucidia:/opt/blackroad/
rsync -avz lucidia:/opt/lucidia/data/ ~/backups/lucidia-$(date +%Y%m%d)/
```

### Remote Commands

```bash
# Run single command
ssh lucidia "docker ps"
ssh lucidia "systemctl status lucidia-core"
ssh alice "hostname && uptime"

# Run multiple commands
ssh lucidia "cd /opt/lucidia && git pull && docker-compose restart"

# Interactive session with port forwarding
ssh -L 5000:localhost:5000 lucidia
```

---

## 🧪 Testing

### Test All Connections

```bash
~/blackroad-sandbox/test-all-ssh.sh
```

This tests:
- ✅ 3 local Pi devices (192.168.4.x)
- ✅ 2 cloud servers (DigitalOcean)
- ✅ 2 Tailscale connections (100.x.x.x)

### Test Individual Connections

```bash
# Quick test
ssh blackroad-pi "echo OK"
ssh lucidia "echo OK"
ssh alice "echo OK"

# With system info
ssh blackroad-pi "hostname && uptime && df -h / | tail -1"
ssh lucidia "docker ps --format 'table {{.Names}}\t{{.Status}}'"
ssh alice "free -h"
```

---

## 🔧 Your SSH Config

Location: `~/.ssh/config`

**Current setup uses ProxyJump:**
- Connects to `blackroad-pi` first
- Then jumps to `lucidia` or `alice` through it

**Advantages:**
- Single entry point (blackroad-pi must have all keys)
- Can use blackroad-pi as a gateway/bastion

**Disadvantages:**
- If blackroad-pi is down, can't reach others
- Extra hop adds latency

**To bypass ProxyJump:**
```bash
# Method 1: Use IP directly
ssh pi@192.168.4.38

# Method 2: Override on command line
ssh -o ProxyJump=none lucidia

# Method 3: Edit ~/.ssh/config and remove ProxyJump lines
```

---

## 📡 Tailscale Setup

Lucidia and Alice are already on Tailscale:

| Device | Tailscale IP | LAN IP |
|--------|--------------|---------|
| lucidia | 100.66.235.47 | 192.168.4.38 |
| alice | 100.66.58.5 | 192.168.4.49 |

**To connect from anywhere (not just home WiFi):**
```bash
# Make sure Tailscale is running on your Mac
tailscale status

# If logged out, reconnect
sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes

# Then connect
ssh pi@100.66.235.47
ssh alice@100.66.58.5
```

---

## 🐛 Troubleshooting

### "Permission denied (publickey)"

**On the Pi that's failing:**
```bash
# Check authorized_keys exists and has your key
cat ~/.ssh/authorized_keys

# Check permissions
ls -la ~/.ssh/
# Should show: drwx------ .ssh/ and -rw------- authorized_keys

# Fix permissions if needed
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**On your Mac:**
```bash
# Verify which key is being used
ssh -v pi@192.168.4.38 2>&1 | grep "Offering public key"

# Try specifying key explicitly
ssh -i ~/.ssh/id_ed25519 pi@192.168.4.38
```

### "Connection timed out"

```bash
# Check if device is reachable
ping 192.168.4.38

# Check if on same network (WiFi: asdfghjkl)
ipconfig getifaddr en0

# Try Tailscale instead
ssh pi@100.66.235.47
```

### "Host key verification failed"

```bash
# Remove old host key
ssh-keygen -R 192.168.4.38
ssh-keygen -R lucidia

# Try again
ssh lucidia
```

### Check SSH Service on Pi

```bash
# On the Pi (via Termius/VNC/direct access)
sudo systemctl status ssh
sudo systemctl restart ssh
sudo journalctl -u ssh -n 50
```

### View Connection Attempts in Real-Time

**On the Pi:**
```bash
sudo tail -f /var/log/auth.log
```

**On your Mac (verbose):**
```bash
ssh -vvv pi@192.168.4.38
```

---

## 🎯 Next Steps After SSH is Working

1. **Test all connections:**
   ```bash
   ~/blackroad-sandbox/test-all-ssh.sh
   ```

2. **Set up SSH agent forwarding** (optional):
   ```bash
   # Add to ~/.ssh/config
   Host *
       ForwardAgent yes
   ```

3. **Create convenient aliases** in `~/.zshrc` or `~/.bashrc`:
   ```bash
   alias sshbr='ssh blackroad-pi'
   alias sshluc='ssh lucidia'
   alias sshal='ssh alice'
   ```

4. **Set up automated backups:**
   ```bash
   # Example cron job to backup Lucidia daily
   0 2 * * * rsync -avz lucidia:/opt/lucidia/data/ ~/backups/lucidia/
   ```

5. **Monitor all devices:**
   ```bash
   # Create a monitoring script
   for host in blackroad-pi lucidia alice; do
       echo "=== $host ==="
       ssh $host "hostname && uptime && df -h / | tail -1"
   done
   ```

---

## 📚 Additional Resources

- **SSH Config Guide:** `man ssh_config`
- **Tailscale Docs:** https://tailscale.com/kb/
- **Your Infrastructure Docs:** `~/blackroad-sandbox/INFRASTRUCTURE_INVENTORY.md`
- **Cloudflare Setup:** `~/blackroad-sandbox/CLOUDFLARE_FINAL_CONFIGURATION.md`

---

## ✅ Success Checklist

- [ ] Ran the setup command on Lucidia (as user `pi`)
- [ ] Tested `ssh pi@192.168.4.38` from Mac - got SUCCESS
- [ ] Ran `~/blackroad-sandbox/test-all-ssh.sh` - shows all green ✅
- [ ] Can copy files: `scp ~/test.txt lucidia:~/`
- [ ] Can run remote commands: `ssh lucidia "docker ps"`
- [ ] Tailscale works: `ssh pi@100.66.235.47`

---

## 🆘 Need Help?

1. Check the detailed guide:
   ```bash
   cat ~/blackroad-sandbox/ADD_MAC_KEY_TO_LUCIDIA.md
   ```

2. Run the interactive setup:
   ```bash
   ~/blackroad-sandbox/setup-lucidia-ssh.sh
   ```

3. Test connections:
   ```bash
   ~/blackroad-sandbox/test-all-ssh.sh
   ```

---

**Last Updated:** December 20, 2025
**Created by:** Claude Code
**Location:** `~/blackroad-sandbox/SSH_SETUP_COMPLETE.md`
