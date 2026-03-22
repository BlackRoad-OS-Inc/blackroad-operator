# BlackRoad SSH Setup - Documentation Index

## 🎯 Start Here

**If you just want to connect your Mac to Lucidia:**
1. Read: [`QUICK_START_SSH.txt`](./QUICK_START_SSH.txt) - **START HERE!**
2. Then: Run the commands shown in Step 1 and Step 2

**If you want detailed instructions:**
- Read: [`SSH_SETUP_COMPLETE.md`](./SSH_SETUP_COMPLETE.md) - Complete guide with examples

**If you want step-by-step Lucidia setup:**
- Read: [`ADD_MAC_KEY_TO_LUCIDIA.md`](./ADD_MAC_KEY_TO_LUCIDIA.md) - Detailed Lucidia instructions

---

## 📁 All Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **QUICK_START_SSH.txt** | Quick 2-step setup | Start here! Copy/paste commands |
| **SSH_SETUP_COMPLETE.md** | Complete reference guide | After setup, for examples and troubleshooting |
| **ADD_MAC_KEY_TO_LUCIDIA.md** | Detailed Lucidia setup | If you want step-by-step instructions |
| **test-all-ssh.sh** | Test all connections | After setup, to verify everything works |
| **setup-lucidia-ssh.sh** | Interactive setup script | If you want a guided setup process |
| **lucidia-oneliner.sh** | Complete script for Lucidia | Alternative to one-liner command |
| **README_SSH.md** | This file - Documentation index | Finding the right guide |

---

## 🚀 Quick Command Reference

### Test Everything
```bash
~/blackroad-sandbox/test-all-ssh.sh
```

### Connect to Devices
```bash
ssh pi@192.168.4.64        # blackroad-pi
ssh pi@192.168.4.38        # lucidia (after setup)
ssh alice@192.168.4.49     # alice
```

### Run Interactive Setup
```bash
~/blackroad-sandbox/setup-lucidia-ssh.sh
```

### View Quick Start Guide
```bash
cat ~/blackroad-sandbox/QUICK_START_SSH.txt
```

---

## 📊 Current Status

| Device | IP | SSH Status | Notes |
|--------|-----|------------|-------|
| **blackroad-pi** | 192.168.4.64 | ✅ Working | Direct access from Mac |
| **alice** | 192.168.4.49 | ✅ Working | Direct access from Mac |
| **lucidia** | 192.168.4.38 | ❌ **Needs setup** | Follow QUICK_START_SSH.txt |
| **codex-infinity** | 159.65.43.12 | ❓ Unknown | DigitalOcean droplet |
| **shellfish-drop** | 174.138.44.45 | ❓ Unknown | DigitalOcean droplet |

---

## 🎯 Your Mac's SSH Key

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJWIHlfOkBRPJjirPmhjckW2Rtz+X/Ss4norgWg/sBO alexa@blackroad
```

Located at: `~/.ssh/id_ed25519.pub`

This is the key used by your SSH config and needs to be added to Lucidia.

---

## 📡 Network Details

### Local Network (Home WiFi: asdfghjkl)
- **blackroad-pi:** 192.168.4.64
- **lucidia:** 192.168.4.38
- **alice:** 192.168.4.49

### Tailscale Mesh (Works from anywhere)
- **lucidia:** 100.66.235.47
- **alice:** 100.66.58.5

### Cloud Servers (Public Internet)
- **codex-infinity:** 159.65.43.12 (DigitalOcean)
- **shellfish-drop:** 174.138.44.45 (DigitalOcean)

---

## ✅ Success Checklist

After following the setup:

- [ ] Ran the one-liner command on Lucidia (via Termius)
- [ ] Tested `ssh pi@192.168.4.38` from Mac
- [ ] Ran `test-all-ssh.sh` - shows ✅ for all local Pis
- [ ] Can use SSH config aliases: `ssh lucidia`
- [ ] Can copy files: `scp ~/test.txt lucidia:~/`
- [ ] Can run remote commands: `ssh lucidia "docker ps"`
- [ ] Tailscale works: `ssh pi@100.66.235.47`

---

## 🆘 Help & Troubleshooting

### Common Issues

**"Permission denied (publickey)"**
- Solution: Make sure you ran the setup command on Lucidia
- Check: `cat ~/blackroad-sandbox/QUICK_START_SSH.txt`

**"Connection timed out"**
- Check: Are you on the same WiFi network? (asdfghjkl)
- Test: `ping 192.168.4.38`

**"Connection refused"**
- Check SSH service on Lucidia: `sudo systemctl status ssh`
- Restart if needed: `sudo systemctl restart ssh`

### Get Detailed Help

```bash
# View complete guide
cat ~/blackroad-sandbox/SSH_SETUP_COMPLETE.md

# View Lucidia-specific instructions
cat ~/blackroad-sandbox/ADD_MAC_KEY_TO_LUCIDIA.md

# Run interactive setup
~/blackroad-sandbox/setup-lucidia-ssh.sh
```

---

## 🔍 Understanding Your Setup

### SSH Config Location
`~/.ssh/config`

Your current config uses:
- **Identity:** `~/.ssh/id_ed25519` (primary key)
- **ProxyJump:** Connects through `blackroad-pi` first, then hops to other Pis
- **Aliases:** `blackroad-pi`, `lucidia`, `alice`, etc.

### ProxyJump Behavior

When you run `ssh lucidia`:
1. Mac connects to `blackroad-pi` (192.168.4.64)
2. Then jumps from `blackroad-pi` to `lucidia` (192.168.4.38)

To bypass ProxyJump:
```bash
ssh pi@192.168.4.38              # Direct IP
ssh -o ProxyJump=none lucidia    # Override config
```

---

## 📚 Additional Documentation

Related docs in `~/blackroad-sandbox/`:
- `INFRASTRUCTURE_INVENTORY.md` - All devices and IPs
- `CLOUDFLARE_FINAL_CONFIGURATION.md` - Cloudflare setup
- `TRUTH_SYSTEM.md` - BlackRoad infrastructure hierarchy
- `MESH_STATUS.md` - Network mesh overview

---

## 🎓 Next Steps After Setup

1. **Test everything:**
   ```bash
   ~/blackroad-sandbox/test-all-ssh.sh
   ```

2. **Set up port forwarding** for Lucidia services:
   ```bash
   ssh -L 5000:localhost:5000 -L 8080:localhost:8080 lucidia
   ```

3. **Create shell aliases** (add to `~/.zshrc`):
   ```bash
   alias sshbr='ssh blackroad-pi'
   alias sshluc='ssh lucidia'
   alias sshal='ssh alice'
   ```

4. **Set up automated backups:**
   ```bash
   # Daily backup of Lucidia data
   rsync -avz lucidia:/opt/lucidia/data/ ~/backups/lucidia-$(date +%Y%m%d)/
   ```

5. **Monitor all devices:**
   ```bash
   # Create a simple monitoring script
   for host in blackroad-pi lucidia alice; do
       ssh $host "hostname && uptime"
   done
   ```

---

**Created:** December 20, 2025
**Last Updated:** December 20, 2025
**Author:** Claude Code
**Location:** `~/blackroad-sandbox/README_SSH.md`

---

## 🚀 TL;DR - Just Get Me Connected!

**1. On Lucidia (via Termius), paste this:**
```bash
mkdir -p $HOME/.ssh && chmod 700 $HOME/.ssh && touch $HOME/.ssh/authorized_keys && chmod 600 $HOME/.ssh/authorized_keys && echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJWIHlfOkBRPJjirPmhjckW2Rtz+X/Ss4norgWg/sBO alexa@blackroad' >> $HOME/.ssh/authorized_keys && sudo systemctl restart ssh && echo "✅ Done!"
```

**2. On your Mac, test it:**
```bash
ssh pi@192.168.4.38 "echo '✅ SUCCESS!'"
```

**Done!** 🎉
