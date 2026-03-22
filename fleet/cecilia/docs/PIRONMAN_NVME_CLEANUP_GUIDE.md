# 🔧 Octavia NVMe Cleanup Guide (Option A)

## What You'll Need
- Small screwdriver (for Pironman case)
- USB-C to NVMe adapter (or USB-C cable if NVMe has USB-C)
- 10-15 minutes

## Step 1: Remove NVMe from Octavia

1. **Power off octavia Pironman:**
   - Unplug power cable
   - Wait 10 seconds

2. **Open Pironman case:**
   - Remove top panel screws
   - Lift off case top
   - Locate NVMe drive (should be visible)

3. **Disconnect NVMe:**
   - Note how it's connected (M.2 slot or USB)
   - Gently remove (M.2: press clip and slide out)
   - Keep screws safe

## Step 2: Connect NVMe to Your Mac

1. **Connect via adapter:**
   ```bash
   # After plugging in, check if Mac sees it
   diskutil list
   # Look for a new disk (probably /dev/disk4 or /dev/disk5)
   ```

2. **Identify the NVMe:**
   ```bash
   # Should show partitions like:
   # /dev/disk4s1 - boot partition
   # /dev/disk4s2 - root partition (largest one)
   ```

## Step 3: Mount and Clean

```bash
# Mount the root partition (replace disk4s2 with your actual partition)
sudo mkdir -p /Volumes/octavia-root
sudo mount -t ext4 /dev/disk4s2 /Volumes/octavia-root

# Check disk usage
df -h /Volumes/octavia-root

# Navigate to it
cd /Volumes/octavia-root

# Find large files
sudo du -h . 2>/dev/null | sort -rh | head -20

# Clean logs (SAFE)
sudo rm -rf var/log/*.log
sudo rm -rf var/log/*.log.*
sudo rm -rf var/log/*.gz
sudo find var/log -name "*.old" -delete

# Clean journal logs (SAFE)
sudo rm -rf var/log/journal/*/*

# If Docker exists and is huge, clean it (CAREFUL)
sudo du -sh var/lib/docker
# If it's many GB and you're okay losing containers:
# sudo rm -rf var/lib/docker

# Clean temp files (SAFE)
sudo rm -rf tmp/*
sudo rm -rf var/tmp/*

# Check space now
df -h /Volumes/octavia-root
```

## Step 4: Unmount and Reinstall

```bash
# Unmount
cd ~
sudo umount /Volumes/octavia-root

# Eject NVMe safely
diskutil eject /dev/disk4
```

**Physical steps:**
1. Disconnect NVMe from Mac
2. Reinstall in octavia Pironman (same way it came out)
3. Close case
4. Connect power
5. Wait 2-3 minutes for boot

## Step 5: Test Connection

```bash
# After 3 minutes, try SSH
ssh pi@192.168.4.81
# or
ssh pi@192.168.4.74
# or scan for it:
nmap -sn 192.168.4.0/24 | grep -B 2 "Raspberry Pi"
```

## Troubleshooting

**If Mac can't mount ext4:**
```bash
# Install ext4 support
brew install ext4fuse
# Use ext4fuse to mount
sudo ext4fuse /dev/disk4s2 /Volumes/octavia-root -o allow_other
```

**If you see "Read-only file system":**
```bash
sudo mount -t ext4 -o rw,remount /dev/disk4s2 /Volumes/octavia-root
```

---
**Expected result:** Octavia should boot successfully and appear on network!
