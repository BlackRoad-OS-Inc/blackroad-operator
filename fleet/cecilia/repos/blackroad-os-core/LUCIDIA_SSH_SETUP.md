# Add Mac SSH Key to Lucidia

## Quick Setup (Run on Lucidia as user `pi`)

Since you're already logged into Lucidia as `pi@lucidia`, just run these commands:

```bash
# Create SSH directory if it doesn't exist
mkdir -p $HOME/.ssh
chmod 700 $HOME/.ssh
touch $HOME/.ssh/authorized_keys
chmod 600 $HOME/.ssh/authorized_keys

# Add your Mac's public key (all one line)
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad' >> $HOME/.ssh/authorized_keys

# Verify it was added
tail -n 3 $HOME/.ssh/authorized_keys

# Ensure SSH is running
sudo systemctl enable ssh
sudo systemctl restart ssh
sudo systemctl status ssh
```

## Verify It Worked

After running the above commands on Lucidia, test from your Mac:

```bash
# Test LAN connection
ssh pi@192.168.4.38 "echo 'Success!'"

# Test Tailscale connection
ssh pi@100.66.235.47 "echo 'Success!'"
```

## Using the Automated Script

Alternatively, run this from your Mac (it will show you what to do):

```bash
~/blackroad-sandbox/setup-lucidia-ssh.sh
```

## Your Mac's Public Key

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad
```

## Clean Up Duplicates (Optional)

Your current `authorized_keys` has some duplicate entries. After adding the Mac key, clean them up:

```bash
# Backup first
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup

# Remove duplicates
awk '!seen[$0]++' ~/.ssh/authorized_keys > ~/.ssh/authorized_keys.tmp
mv ~/.ssh/authorized_keys.tmp ~/.ssh/authorized_keys

# Verify
cat ~/.ssh/authorized_keys
```

## Expected Result

After setup, you should have these keys in Lucidia's `authorized_keys`:

1. **ED25519 key** (original)
2. **ECDSA @blackroad-sandbox** (from Termius iPhone) - 2 keys
3. **ED25519 from Mac** (the one we just added) ← This is the new one

## Test All Connections

From your Mac, run:

```bash
~/blackroad-sandbox/test-all-ssh.sh
```

This will test connections to:
- blackroad-pi (already working ✅)
- lucidia (will work after this setup ✅)
- alice (already working ✅)
- codex-infinity
- shellfish-drop
- Tailscale connections

## Troubleshooting

### If SSH still doesn't work:

1. **Check SSH service on Lucidia:**
   ```bash
   sudo systemctl status ssh
   ```

2. **Check firewall:**
   ```bash
   sudo ufw status
   ```

3. **View auth logs:**
   ```bash
   sudo tail -f /var/log/auth.log
   ```

4. **Try verbose SSH from Mac:**
   ```bash
   ssh -vvv pi@192.168.4.38
   ```

5. **Verify key permissions on Lucidia:**
   ```bash
   ls -la ~/.ssh/
   # Should show:
   # drwx------ (700) for .ssh/
   # -rw------- (600) for authorized_keys
   ```

## Quick Reference

| Connection Type | Command                        |
|----------------|--------------------------------|
| LAN            | `ssh pi@192.168.4.38`          |
| Tailscale      | `ssh pi@100.66.235.47`         |
| With alias     | `ssh lucidia` (if configured)  |

## Next Steps

After SSH is working:

1. **Set up SSH config** for easier connection (optional)
2. **Test Tailscale** connection from outside your home network
3. **Set up port forwarding** for Lucidia services (Flask on 5000, nginx on 8080)
4. **Enable SSH key forwarding** to allow hopping between devices

---

**Need help?** Run the test script to see what's working:
```bash
~/blackroad-sandbox/test-all-ssh.sh
```
