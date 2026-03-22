# Flash Raspberry Pi 5 - Quick Start Guide
**For BlackRoad Constellation Workstation**  
**Flash 2 cards: Pi-Holo + Pi-Ops**

---

## 🎯 What You Need

**Hardware:**
- 2x Raspberry Pi 5 8GB boards
- 2x microSD cards (32GB+ recommended, you have 256GB!)
- Anker USB 3.0 SD card reader
- M1 Mac (current workstation)

**Software:**
- Raspberry Pi Imager (free)

---

## 📝 Quick Steps

### 1. Install Raspberry Pi Imager
```bash
# On your M1 Mac:
brew install --cask raspberry-pi-imager

# Or download from:
# https://www.raspberrypi.com/software/
```

### 2. Flash Card #1 - Pi-Holo

**Open Raspberry Pi Imager:**

1. **Choose OS:**
   - Raspberry Pi OS (64-bit)
   - **Recommended:** "Raspberry Pi OS (64-bit)" (full desktop)

2. **Choose Storage:**
   - Select your SD card (Samsung EVO 256GB)

3. **Settings (⚙️ icon):**
   ```
   Hostname: pi-holo.local
   Enable SSH: ✅ (use password or public key)
   Username: pi
   Password: [your password]
   
   Configure WiFi: ❌ (will use Ethernet)
   
   Locale Settings:
   - Timezone: America/Chicago (or your TZ)
   - Keyboard: us
   ```

4. **Advanced Settings:**
   ```
   Enable SSH: ✅
   Use password authentication: ✅ (or paste your SSH public key)
   ```

5. **Write!**
   - Takes ~10 minutes for 256GB card

### 3. Flash Card #2 - Pi-Ops

**Repeat with second card:**

Settings difference:
```
Hostname: pi-ops.local
(Everything else same as Pi-Holo)
```

---

## 🔌 First Boot Setup

### Pi-Holo (Hologram Renderer)

**Connect:**
```
1. Insert SD card
2. Connect 4" Waveshare to micro-HDMI 0
3. Connect Ethernet to TP-Link switch
4. Connect Geekworm 5V/5A USB-C PSU
5. Power on
```

**First Login (via SSH from Mac):**
```bash
# Wait 2 minutes for first boot
ssh pi@pi-holo.local

# Update system
sudo apt update && sudo apt upgrade -y

# Install essentials
sudo apt install -y git vim tmux htop mosquitto-clients python3-pip

# Install cooling control
sudo apt install -y rpi-update
# GeeekPi cooler should auto-activate

# Test display
vcgencmd get_config int | grep display
```

**Set Static IP:**
```bash
sudo nano /etc/dhcpcd.conf

# Add at end:
interface eth0
static ip_address=192.168.4.200/24
static routers=192.168.4.1
static domain_name_servers=192.168.4.1 8.8.8.8

# Save & reboot
sudo reboot
```

---

### Pi-Ops (MQTT Broker + Monitor)

**Connect:**
```
1. Insert SD card
2. Connect 9.3" Waveshare to micro-HDMI 0 via UGREEN switch
3. Connect Arduino Uno via USB-A
4. Connect Ethernet to TP-Link switch
5. Connect Geekworm 5V/5A USB-C PSU
6. Power on
```

**First Login:**
```bash
ssh pi@pi-ops.local

# Update system
sudo apt update && sudo apt upgrade -y

# Install MQTT broker
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Test broker
mosquitto_pub -t "test/hello" -m "Pi-Ops Online"
mosquitto_sub -t "test/#" -C 1

# Install monitoring tools
sudo apt install -y btop python3-pip python3-serial

# Install Arduino tools
sudo usermod -a -G dialout pi
sudo apt install -y arduino

# Install cooling
# ElectroCookie cooler is passive + fan, should work auto
```

**Set Static IP:**
```bash
sudo nano /etc/dhcpcd.conf

# Add at end:
interface eth0
static ip_address=192.168.4.202/24
static routers=192.168.4.1
static domain_name_servers=192.168.4.1 8.8.8.8

# Save & reboot
sudo reboot
```

---

## 🧪 Verify Both Nodes

**From your M1 Mac:**
```bash
# Ping test
ping -c 3 192.168.4.200  # Pi-Holo
ping -c 3 192.168.4.202  # Pi-Ops

# SSH test
ssh pi@192.168.4.200 "hostname && uptime"
ssh pi@192.168.4.202 "hostname && uptime"

# MQTT test (from Pi-Ops to Pi-Holo)
ssh pi@192.168.4.202
mosquitto_pub -t "holo/test" -m "Hello from Pi-Ops"

# From another terminal:
ssh pi@192.168.4.200
mosquitto_sub -h 192.168.4.202 -t "holo/#"
# Should print: Hello from Pi-Ops
```

---

## 📦 Install Camera Support (Pi-Holo Only)

```bash
ssh pi@192.168.4.200

# Enable camera
sudo raspi-config
# Interface Options → Camera → Enable

# Install camera tools
sudo apt install -y python3-picamera2

# Test camera (if connected)
libcamera-hello --list-cameras
libcamera-still -o test.jpg
```

---

## 🎨 Install Display Drivers (Both Nodes)

**For Waveshare displays:**
```bash
# Usually works out-of-box on Pi 5
# If not:

# On Pi-Holo (4" 720×720):
sudo nano /boot/config.txt
# Add if needed:
# hdmi_group=2
# hdmi_mode=87
# hdmi_cvt=720 720 60 1 0 0 0

# On Pi-Ops (9.3" 1600×600):
# Usually auto-detects via EDID
# If issues:
# hdmi_group=2
# hdmi_mode=87
# hdmi_cvt=1600 600 60 6 0 0 0
```

---

## 🔧 Optional: Tailscale (Recommended)

**On both Pi 5s:**
```bash
# Install
curl -fsSL https://tailscale.com/install.sh | sh

# Connect
sudo tailscale up

# Get IP
tailscale ip -4
# Will show 100.x.x.x address

# From your Mac (after installing Tailscale):
ssh pi@pi-holo  # Uses Tailscale name!
ssh pi@pi-ops
```

---

## 🚀 Next Steps

After both Pi 5s are flashed and online:

1. **Wire displays** per `CONSTELLATION_WIRING_GUIDE.md`
2. **Set up Arduino** sensors on Pi-Ops
3. **Deploy hologram** renderer on Pi-Holo
4. **Build MQTT bridge** on Pi-Ops
5. **Set up Jetson** when touchscreen arrives

---

## 📊 Expected Boot Times

- **First boot:** ~2 minutes (resizes filesystem)
- **Subsequent boots:** ~30 seconds
- **SSH available:** ~1 minute after power-on

---

## 🔍 Troubleshooting

**Can't SSH after first boot:**
```bash
# Check if Pi is on network
ping pi-holo.local
# If timeout, check Ethernet cable

# Find IP via router or:
arp -a | grep -i "2c:cf:67"  # Look for Pi MAC address
```

**Display not working:**
- Check HDMI cable seated fully
- Try other micro-HDMI port (0 vs 1)
- Check display power (separate PSU!)
- Try different HDMI cable

**MQTT not working:**
```bash
# Check service
sudo systemctl status mosquitto

# Check port
sudo netstat -tulpn | grep 1883

# Check firewall (usually off by default on Pi)
sudo ufw status
```

**Arduino not detected:**
```bash
# Check USB connection
ls /dev/ttyACM*
# Should show /dev/ttyACM0

# Check permissions
groups
# Should include 'dialout'

# If not:
sudo usermod -a -G dialout pi
# Logout and back in
```

---

## 🎯 Success Checklist

After flashing, you should have:

- [x] Pi-Holo at 192.168.4.200, hostname pi-holo.local
- [x] Pi-Ops at 192.168.4.202, hostname pi-ops.local
- [x] Both pingable from Mac
- [x] SSH works to both
- [x] MQTT broker running on Pi-Ops (port 1883)
- [x] Displays working on both
- [x] Static IPs configured
- [x] System updated to latest

**Ready to wire the constellation!** 🎨
