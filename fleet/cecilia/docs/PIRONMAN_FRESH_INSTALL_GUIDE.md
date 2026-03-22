# 🔄 Pironman Fresh OS Install Guide (Option B)

## What You'll Need
- Raspberry Pi Imager (install if needed: `brew install --cask raspberry-pi-imager`)
- USB-C to NVMe adapter (for octavia)
- SD card reader (if anastasia uses SD card)
- 30-45 minutes total

## Prep: Install Raspberry Pi Imager

```bash
brew install --cask raspberry-pi-imager
# Then open it: open -a "Raspberry Pi Imager"
```

## Step 1: Remove Storage from Both Pironmans

**Octavia (NVMe):**
1. Power off
2. Open case
3. Remove NVMe drive
4. Connect to Mac via USB-C adapter

**Anastasia (SD card or NVMe):**
1. Power off
2. Open case
3. Remove storage
4. Connect to Mac

## Step 2: Flash Octavia's NVMe

**In Raspberry Pi Imager:**

1. **Choose OS:**
   - Raspberry Pi OS (64-bit) - Recommended
   - (Full version with desktop, or Lite if you want minimal)

2. **Choose Storage:**
   - Select your NVMe drive (be VERY careful to pick right one!)

3. **Click Settings Gear ⚙️** (IMPORTANT!)

   **General tab:**
   - ✅ Set hostname: `octavia`
   - ✅ Enable SSH: Use password authentication
   - ✅ Set username: `pi`
   - ✅ Set password: [your choice]
   - ✅ Configure wireless LAN:
     - SSID: [your WiFi name]
     - Password: [your WiFi password]
     - Country: US
   - ✅ Set locale: America/Chicago, US keyboard

   **Services tab:**
   - ✅ Enable SSH (with password or public key)
   - Add your SSH public key from: `~/.ssh/id_ed25519.pub`

4. **Write** and wait (~10 minutes)

## Step 3: Flash Anastasia's Storage

Repeat same process but:
- Hostname: `anastasia`
- Username: `pi`  
- Same WiFi/SSH settings

## Step 4: Reinstall Storage & Boot

**Octavia:**
1. Eject NVMe from Mac safely
2. Reinstall in Pironman case
3. Close case
4. Connect ethernet cable (to TP-Link)
5. Power on
6. Wait 2-3 minutes

**Anastasia:**
1. Same steps as octavia
2. Power on
3. Wait 2-3 minutes

## Step 5: Find Them on Network

```bash
# Wait 3 minutes, then scan
nmap -sn 192.168.4.0/24 | grep -B 2 "Raspberry Pi"

# Or try hostnames
ping octavia.local
ping anastasia.local

# Or check eero app for new devices
```

## Step 6: First Login

```bash
# Once you find the IPs (let's say .100 and .101):
ssh pi@octavia.local
# or
ssh pi@192.168.4.100

# Check it booted correctly:
hostname
df -h
cat /proc/device-tree/model
```

## Step 7: Install BlackRoad Stack

**On each Pi after SSH connection:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essentials
sudo apt install -y git curl wget htop vim

# Join Tailscale mesh
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Install Docker (for octavia mainly)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker pi

# For octavia: Install Hailo drivers
# (We'll do this after it's online)

# Install BlackRoad agent
curl -fsSL https://blackroad.io/install.sh | sh
# or manually deploy from working Pis
```

## Step 8: Static IP (Recommended)

```bash
# On each Pi, set static IP to avoid DHCP changes
sudo nano /etc/dhcpcd.conf

# Add at bottom:
interface eth0
static ip_address=192.168.4.100/22  # .100 for octavia, .101 for anastasia
static routers=192.168.4.1
static domain_name_servers=192.168.4.1

# Save and reboot
sudo reboot
```

## Expected Timeline

- Imaging each drive: 10 minutes
- First boot: 3 minutes each
- Finding on network: 2 minutes
- SSH setup: 5 minutes
- Installing stack: 15-20 minutes

**Total: ~45 minutes for both**

## Benefits of Fresh Install

✅ Clean slate - no disk full issues
✅ Latest Raspberry Pi OS
✅ SSH enabled from start
✅ Known credentials
✅ Proper network config
✅ Can install Hailo drivers properly

---
**After this, both Pironmans will be online and accessible!**
