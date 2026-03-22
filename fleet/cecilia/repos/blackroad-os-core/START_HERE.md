# 🎯 START HERE - Connect Your Mac to Lucidia

## What You're Doing

Adding your Mac's SSH key to Lucidia so you can SSH directly from your Mac to Lucidia.

**Current Status:**
- ✅ **blackroad-pi** (192.168.4.64) - SSH working from Mac
- ✅ **alice** (192.168.4.49) - SSH working from Mac
- ❌ **lucidia** (192.168.4.38) - **Needs your Mac's key** ← We're fixing this now!

---

## ⚡ Quick Setup (2 Commands)

### 1️⃣ On Lucidia (via Termius/VNC)

You're already logged into Lucidia as `pi@lucidia`. Copy and paste this **entire block**:

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

### 2️⃣ On Your Mac (in Terminal)

```bash
ssh -i ~/.ssh/id_br_ed25519 -o IdentitiesOnly=yes pi@192.168.4.38
```

**Expected result:** You should be connected to Lucidia!

---

## 🎉 That's It!

If step 2 works, you're done! SSH is now working from your Mac to Lucidia.

---

## 🌐 Bonus: Set Up Tailscale (Works from Anywhere)

Once LAN SSH works, set up Tailscale so you can connect from outside your home network:

### On Your Mac:

```bash
# Reconnect to Tailscale mesh
sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes

# Check status
tailscale status

# Test SSH over Tailscale
ssh -i ~/.ssh/id_br_ed25519 -o IdentitiesOnly=yes pi@100.66.235.47
```

**Lucidia's Tailscale IP:** `100.66.235.47`

---

## 🧪 Test All Your Connections

After setup, test everything:

```bash
~/blackroad-sandbox/test-all-ssh.sh
```

This will test SSH to:
- blackroad-pi (192.168.4.64)
- lucidia (192.168.4.38)
- alice (192.168.4.49)
- codex-infinity (159.65.43.12)
- shellfish-drop (174.138.44.45)
- Tailscale connections

---

## 🔍 Discover Your Network

To see all devices on your network:

```bash
~/blackroad-sandbox/discover-neighbors.sh
```

**Known active devices on your network:**
- ✅ 192.168.4.1 - Router
- ✅ 192.168.4.38 - lucidia (Raspberry Pi 5)
- ✅ 192.168.4.49 - alice (Raspberry Pi 400)
- ✅ 192.168.4.64 - blackroad-pi (Raspberry Pi 5)
- ✅ 192.168.4.68 - iPhone-Koder

---

## 🐛 Troubleshooting

### "Permission denied (publickey)"

Make sure you ran **step 1** on Lucidia correctly.

**On Lucidia, verify:**
```bash
ls -la /home/pi/.ssh
tail -n 1 /home/pi/.ssh/authorized_keys
```

Should show:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad
```

### "Connection refused"

**On Lucidia:**
```bash
sudo systemctl status ssh
sudo systemctl restart ssh
```

### "Connection timed out"

**On Mac:**
```bash
ping 192.168.4.38
```

If ping fails, make sure you're on the same WiFi network (asdfghjkl).

---

## 📚 More Documentation

All files are in `~/blackroad-sandbox/`:

| File | What It Does |
|------|--------------|
| **START_HERE.md** | This file - Quick 2-step setup |
| **SETUP_SUMMARY.md** | Complete summary with all details |
| **LUCIDIA_SETUP_CORRECTED.txt** | Text version of setup instructions |
| **test-all-ssh.sh** | Test script for all SSH connections |
| **discover-neighbors.sh** | Network device scanner |
| **SSH_SETUP_COMPLETE.md** | Full reference guide |

---

## 🚀 After SSH Works

### Simple Connections

```bash
# Connect to lucidia
ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.38

# Connect via Tailscale (from anywhere)
ssh -i ~/.ssh/id_br_ed25519 pi@100.66.235.47

# Connect to other Pis
ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.64        # blackroad-pi
ssh -i ~/.ssh/id_br_ed25519 alice@192.168.4.49     # alice
```

### Copy Files

```bash
# TO lucidia
scp -i ~/.ssh/id_br_ed25519 ~/myfile.txt pi@192.168.4.38:~/

# FROM lucidia
scp -i ~/.ssh/id_br_ed25519 pi@192.168.4.38:~/data.json ~/Downloads/
```

### Port Forward Lucidia Services

```bash
# Forward Flask (5000) and nginx (8080)
ssh -i ~/.ssh/id_br_ed25519 -L 5000:localhost:5000 -L 8080:localhost:8080 pi@192.168.4.38

# Then open in browser:
# http://localhost:5000 - Lucidia Core API
# http://localhost:8080 - nginx
```

---

## 🔑 Your SSH Key (for reference)

**File:** `~/.ssh/id_br_ed25519.pub`

**Contents:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad
```

This is the key we're adding to Lucidia in step 1.

---

## ✅ Success Checklist

- [ ] Ran setup commands on Lucidia (step 1)
- [ ] Can SSH from Mac: `ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.38`
- [ ] Reconnected Tailscale on Mac
- [ ] Can SSH via Tailscale: `ssh -i ~/.ssh/id_br_ed25519 pi@100.66.235.47`
- [ ] Ran test script: Shows ✅ for lucidia
- [ ] Can copy files to lucidia
- [ ] Can run remote commands on lucidia

---

## 🆘 Need Help?

**View full documentation:**
```bash
cat ~/blackroad-sandbox/SETUP_SUMMARY.md
```

**Test all connections:**
```bash
~/blackroad-sandbox/test-all-ssh.sh
```

**Scan network:**
```bash
~/blackroad-sandbox/discover-neighbors.sh
```

---

**Created:** December 20, 2025
**Author:** Claude Code
**Location:** `~/blackroad-sandbox/START_HERE.md`

---

## 🎯 TL;DR

**On Lucidia:** Paste the setup block from step 1
**On Mac:** Run `ssh -i ~/.ssh/id_br_ed25519 pi@192.168.4.38`
**Done!** 🎉
