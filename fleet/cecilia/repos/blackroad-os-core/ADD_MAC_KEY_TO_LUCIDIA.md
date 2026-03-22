# Add Mac SSH Key to Lucidia - Final Instructions

## Current Status

✅ **blackroad-pi** (192.168.4.64) - SSH working
✅ **alice** (192.168.4.49) - SSH working
❌ **lucidia** (192.168.4.38) - **Needs your Mac key**

## Your Mac Has Two SSH Keys

You have two different ED25519 keys on your Mac:

### Key 1: `~/.ssh/id_ed25519` (Currently used by SSH config)
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJWIHlfOkBRPJjirPmhjckW2Rtz+X/Ss4norgWg/sBO alexa@blackroad
```

### Key 2: `~/.ssh/id_br_ed25519`
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad
```

**Recommendation:** Add the first one (`id_ed25519`) since that's what your SSH config uses.

---

## STEP 1: Run This on Lucidia (as user `pi`)

Since you're already logged into Lucidia via Termius/VNC, copy and paste this entire block:

```bash
# Create SSH directory if needed
mkdir -p $HOME/.ssh
chmod 700 $HOME/.ssh
touch $HOME/.ssh/authorized_keys
chmod 600 $HOME/.ssh/authorized_keys

# Add your Mac's primary SSH key
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJWIHlfOkBRPJjirPmhjckW2Rtz+X/Ss4norgWg/sBO alexa@blackroad' >> $HOME/.ssh/authorized_keys

# Verify it was added
echo ""
echo "✅ Key added! Last 3 lines of authorized_keys:"
tail -n 3 $HOME/.ssh/authorized_keys

# Ensure SSH is running
sudo systemctl enable ssh
sudo systemctl restart ssh
echo ""
echo "✅ SSH service restarted"
echo ""
echo "Now test from your Mac with:"
echo "   ssh pi@192.168.4.38"
```

---

## STEP 2: Test from Your Mac

After running the above on Lucidia, test the connection:

```bash
# Test direct connection
ssh pi@192.168.4.38 "echo '✅ Lucidia SSH is working!'"

# Test via SSH config alias
ssh lucidia "echo '✅ SSH config alias is working!' && hostname && uptime"

# Test Tailscale connection
ssh pi@100.66.235.47 "echo '✅ Tailscale is working!'"
```

---

## STEP 3: Run the Full Mesh Test

```bash
~/blackroad-sandbox/test-all-ssh.sh
```

This should now show:
- ✅ blackroad-pi
- ✅ lucidia
- ✅ alice
- And test your cloud servers

---

## Understanding Your SSH Setup

### Your SSH Config (`~/.ssh/config`)

Your current config has:

```ssh
Host lucidia
  HostName 192.168.4.38
  User pi
  IdentityFile ~/.ssh/id_ed25519
  ProxyJump blackroad-pi    # <-- This hops through blackroad-pi first!
```

This means:
1. You connect to **blackroad-pi** first
2. Then jump to **lucidia** through it

This is fine if:
- blackroad-pi is always available
- You want to use blackroad-pi as a gateway

But you can also connect **directly** to lucidia without the hop.

### To Connect Directly (bypass ProxyJump)

```bash
# Method 1: Override ProxyJump
ssh -o ProxyJump=none lucidia

# Method 2: Use IP directly
ssh pi@192.168.4.38

# Method 3: Update SSH config (remove ProxyJump line)
```

---

## Optional: Clean Up Duplicate Keys on Lucidia

Your `authorized_keys` file has some duplicates. After adding the Mac key, clean them up:

```bash
# On Lucidia, run:
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup
awk '!seen[$0]++' ~/.ssh/authorized_keys > ~/.ssh/authorized_keys.tmp
mv ~/.ssh/authorized_keys.tmp ~/.ssh/authorized_keys
echo "✅ Duplicates removed"
cat ~/.ssh/authorized_keys
```

---

## Expected Keys on Lucidia After Setup

After adding your Mac key, Lucidia should have:

1. **Original ED25519 key** (unknown source)
2. **ECDSA key #1** from Termius (`@blackroad-sandbox`)
3. **ECDSA key #2** from Termius (`@blackroad-sandbox`)
4. **Mac ED25519 key** ← **The one we just added**

---

## Troubleshooting

### If it still doesn't work:

1. **Check SSH is running on Lucidia:**
   ```bash
   sudo systemctl status ssh
   sudo systemctl restart ssh
   ```

2. **Check permissions on Lucidia:**
   ```bash
   ls -la ~/.ssh/
   # Should show:
   # drwx------ .ssh/
   # -rw------- authorized_keys
   ```

3. **View SSH logs on Lucidia:**
   ```bash
   sudo journalctl -u ssh -f
   # Or:
   sudo tail -f /var/log/auth.log
   ```

4. **Test with verbose SSH from Mac:**
   ```bash
   ssh -vvv pi@192.168.4.38
   ```

5. **Check firewall on Lucidia:**
   ```bash
   sudo ufw status
   # If enabled and blocking, allow SSH:
   sudo ufw allow 22/tcp
   ```

---

## Quick Reference Card

| Device | IP | User | Test Command |
|--------|-----|------|--------------|
| **lucidia** (LAN) | 192.168.4.38 | pi | `ssh pi@192.168.4.38` |
| **lucidia** (Tailscale) | 100.66.235.47 | pi | `ssh pi@100.66.235.47` |
| **lucidia** (alias) | - | pi | `ssh lucidia` |
| **blackroad-pi** | 192.168.4.64 | pi | `ssh blackroad-pi` |
| **alice** | 192.168.4.49 | alice | `ssh alice` |

---

## After SSH is Working

Once SSH works, you can:

1. **Port forward Lucidia services:**
   ```bash
   ssh -L 5000:localhost:5000 -L 8080:localhost:8080 lucidia
   # Then open http://localhost:5000 in browser
   ```

2. **Copy files to/from Lucidia:**
   ```bash
   scp ~/myfile.txt lucidia:~/
   scp lucidia:~/data.json ~/Downloads/
   ```

3. **Run commands remotely:**
   ```bash
   ssh lucidia "docker ps"
   ssh lucidia "systemctl status lucidia-core"
   ```

4. **Use rsync for backups:**
   ```bash
   rsync -avz lucidia:/opt/lucidia/data/ ~/backups/lucidia/
   ```

---

## Summary of What to Do Right Now

1. **On Lucidia** (via Termius/VNC), run the bash block from STEP 1
2. **On your Mac**, test with: `ssh pi@192.168.4.38`
3. **Celebrate** when you see: `✅ Lucidia SSH is working!`

---

Need help? Run the automated setup script:
```bash
~/blackroad-sandbox/setup-lucidia-ssh.sh
```

Or test all connections:
```bash
~/blackroad-sandbox/test-all-ssh.sh
```
