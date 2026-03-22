# Constellation Workstation - Complete Wiring Guide
**BlackRoad Multi-Display AI System**  
**Version:** 1.0  
**Date:** 2026-02-11

---

## ⚡ DEPLOYMENT STATUS

**READY TO WIRE NOW:**
- ✅ 2x Raspberry Pi 5 8GB (in hand)
- ✅ Jetson Orin Nano (in hand)
- ✅ Pi Zero W (in hand)
- ✅ Pi 400 (in hand)
- ✅ All displays (4", 7", 9.3")
- ✅ TP-Link switch, HDMI switch/splitter
- ✅ All cables, adapters, power supplies

**WAITING FOR:**
- 10.1" touchscreen for Jetson (ordered)
- Pironman case (ordered)
- Third Pi 5 for future expansion (ordered)

**You can build the full constellation TODAY except for the Jetson touch display!**

---

## 🎯 SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONSTELLATION TOPOLOGY                        │
└─────────────────────────────────────────────────────────────────┘

LEFT TOWER          CENTER STACK           RIGHT PANEL
┌─────────┐        ┌──────────────┐       ┌─────────┐
│  4" □   │        │  10.1" Touch │       │  7" □   │
│ HOLO    │        │  AGENT UI    │       │  SIM    │
│ Pi-5 #1 │        │  JETSON      │       │  Pi-0W  │
└────┬────┘        └──────┬───────┘       └────┬────┘
     │                    │                     │
  [Pyramid]           [Touch UI]           [Viewer]
     │                    │                     │
     └────────────┬───────┴──────┬──────────────┘
                  │              │
            ┌─────▼──────────────▼─────┐
            │    9.3" ULTRAWIDE OPS    │
            │    Pi-5 #2 (MQTT Hub)    │
            └──────────────────────────┘
                        │
            ┌───────────▼────────────┐
            │   Pi-400 KEYBOARD      │
            │   (Admin Console)      │
            └────────────────────────┘

     [TP-Link 5-Port Gigabit Switch]
            │
     [Router 192.168.4.1]
```

---

## 🔌 PORT-BY-PORT WIRING MAP

### Node A: Pi-Holo (Raspberry Pi 5) — Hologram Renderer

**Purpose:** 4-quadrant Pepper's Ghost display  
**IP:** 192.168.4.200 (assign static)  
**Hostname:** pi-holo.local

| Port | Cable | Destination | Notes |
|------|-------|-------------|-------|
| **micro-HDMI 0** | JSAUX Micro→HDMI | 4" Waveshare 720×720 | Primary hologram output |
| **micro-HDMI 1** | (unused) | — | Reserve for clone/debug |
| **CSI Camera** | Ribbon cable | Pi Camera v2 8MP | Tracks objects for hologram input |
| **USB-A #1** | USB 3.0 | (optional) Arduino for local sensors | Or plug Arduino into Pi-Ops |
| **USB-A #2** | (free) | — | Reserve |
| **USB-C Power** | Geekworm 5V/5A | Wall outlet | Dedicated PSU |
| **Ethernet** | Cat6 | TP-Link Switch | Gigabit LAN |
| **GPIO** | (free) | — | Optional: WS2812B LED control |

**Cooling:** GeeekPi Active Cooler RGB (temp-controlled fan)

**Optional: HDMI Splitter for Clone Output**
```
Pi-Holo micro-HDMI → HDMI cable → WAVLINK Splitter IN
  ├─ WAVLINK OUT A → 4" Waveshare (primary)
  └─ WAVLINK OUT B → Spare monitor (clone for demo)
```
(Splitter mirrors one signal to two displays; OS sees single screen)

---

### Node B: Jetson-Agent (Jetson Orin Nano) — Main Agent UI

**Purpose:** Touch-based agent control center  
**IP:** 192.168.4.201 (assign static)  
**Hostname:** jetson-agent.local

| Port | Cable | Destination | Notes |
|------|-------|-------------|-------|
| **HDMI** | Standard HDMI | 10.1" ROADOM Touch | Main agent workspace |
| **USB-A #1** | USB 3.0 | External SSD (1TB) | /srv/agent workspace, ext4 |
| **USB-A #2** | USB 3.0 | Anker SD Card Reader | For imaging/data transfer |
| **USB-A #3** | USB-A | Logitech H390 Headset | Voice I/O (optional) |
| **USB-C** | (or USB-A hub) | TobenONE 15-in-1 Dock | Expands USB/SD/Ethernet |
| **Barrel Jack** | DC PSU | Wall outlet | Jetson dedicated power |
| **Ethernet** | Cat6 | TP-Link Switch | Gigabit LAN |

**Bluetooth:** Pair Apple Magic Keyboard + Mouse here

**Storage Mount:**
```bash
# Auto-mount SSD at boot
sudo mkdir -p /srv/agent
sudo blkid  # Find UUID of SSD
sudo nano /etc/fstab
# Add: UUID=xxx /srv/agent ext4 defaults 0 2
```

---

### Node C: Pi-Ops (Raspberry Pi 5 #2) — Operations Hub + MQTT Broker

**Purpose:** System monitoring + message bus  
**IP:** 192.168.4.202 (assign static)  
**Hostname:** pi-ops.local

| Port | Cable | Destination | Notes |
|------|-------|-------------|-------|
| **micro-HDMI 0** | JSAUX Micro→HDMI | UGREEN Switch IN-1 | Shares 9.3" with Pi-400 |
| **micro-HDMI 1** | (unused) | — | Reserve |
| **USB-A #1** | USB-A | Arduino Uno R3 | Sensors → serial → MQTT bridge |
| **USB-A #2** | USB 3.0 | External SSD OR Anker SD Reader | Logs/backups OR card flashing |
| **USB-A #3** | USB 3.0 | Anker USB-C Hub (7-in-1) | Extra peripherals |
| **USB-C Power** | Geekworm 5V/5A | Wall outlet | Dedicated PSU |
| **Ethernet** | Cat6 | TP-Link Switch | Gigabit LAN |
| **GPIO** | (free) | — | Optional: Status LEDs |

**Cooling:** ElectroCookie Radial Tower (passive heatsink + active fan)

**Services Running:**
- Mosquitto MQTT Broker (port 1883)
- btop++ system monitor
- Arduino serial bridge (sensors → JSON → MQTT)
- Logs aggregation

**HDMI Switching:**
```
Pi-Ops micro-HDMI → JSAUX adapter → UGREEN Switch IN-1
Pi-400 micro-HDMI → JSAUX adapter → UGREEN Switch IN-2
UGREEN OUT → 9.3" Waveshare Ultrawide (1600×600)
```
Use IR remote to toggle which source shows on 9.3" display.

---

### Node D: Pi-Zero-Sim (Raspberry Pi Zero W) — Simulation Output

**Purpose:** Lightweight visualization renderer  
**IP:** 192.168.4.203 (assign static)  
**Hostname:** pi-zero-sim.local

| Port | Cable | Destination | Notes |
|------|-------|-------------|-------|
| **mini-HDMI** | Adapter → HDMI | 7" Waveshare Touch | Sim output display |
| **micro-USB Power** | 5V/2A PSU | Wall outlet | Dedicated PSU |
| **WiFi** | — | LAN (no Ethernet) | Joins 192.168.4.x network |
| **USB-OTG** | (optional) micro-USB hub | Keyboard during setup | Disconnect after config |

**Software:**
- Minimal Raspbian Lite
- Python 3 + pygame OR SDL2
- MQTT subscriber for `sim/output` topic
- Renders frames pushed from Jetson

---

### Node E: Pi-400 (Keyboard Computer) — Admin Console

**Purpose:** Emergency access + admin shell  
**IP:** 192.168.4.204 (assign static)  
**Hostname:** pi-400.local

| Port | Cable | Destination | Notes |
|------|-------|-------------|-------|
| **micro-HDMI 0** | JSAUX Micro→HDMI | UGREEN Switch IN-2 | Shares 9.3" with Pi-Ops |
| **USB-A #1** | USB 3.0 | Anker SD Card Reader | Backup card flasher |
| **USB-A #2** | (free) | — | Reserve |
| **USB-C Power** | 5V/3A PSU | Wall outlet | Dedicated PSU |
| **Ethernet** | Cat6 | TP-Link Switch | Gigabit LAN |
| **Bluetooth** | (optional) | Apple Magic devices | Or hard-wire via USB |

**Role:**
- Not in visual path 24/7
- Press UGREEN remote → steal 9.3" display
- SSH into all other nodes
- Emergency rescue console

---

## 🌐 NETWORK WIRING

### TP-Link TL-SG105 (5-Port Switch)

| Port | Device | IP | Notes |
|------|--------|-----|-------|
| **Port 1** | Uplink to Router | 192.168.4.1 | Gateway |
| **Port 2** | Jetson-Agent | 192.168.4.201 | 1 Gbps |
| **Port 3** | Pi-Ops | 192.168.4.202 | 1 Gbps |
| **Port 4** | Pi-Holo | 192.168.4.200 | 1 Gbps |
| **Port 5** | Pi-400 | 192.168.4.204 | 1 Gbps |

**WiFi Devices:**
- Pi-Zero-Sim: 192.168.4.203
- Old MacBooks (if used): 192.168.4.205+
- iPad Pro 2015: 192.168.4.210

---

## 🎞️ VIDEO SIGNAL ROUTING

### Primary Display Connections
```
Pi-Holo ───HDMI──► 4" Waveshare (720×720)
Jetson  ───HDMI──► 10.1" ROADOM Touch (1024×600)
Pi-Zero ───HDMI──► 7" Waveshare Touch (1024×600)
```

### Shared Display (9.3" Ultrawide)
```
┌─────────┐
│ Pi-Ops  │──micro-HDMI──┐
└─────────┘              │
                         ├──► UGREEN Switch ──► 9.3" Waveshare
┌─────────┐              │        (1600×600)
│ Pi-400  │──micro-HDMI──┘
└─────────┘
       ▲
       │
   [IR Remote] Select Input 1 or 2
```

**Label Inputs on UGREEN:**
- Input 1 = Pi-Ops (default/always on)
- Input 2 = Pi-400 (admin mode)

### Optional: Hologram Clone (for demos)
```
Pi-Holo ──► WAVLINK Splitter ──┬──► 4" Primary
                               └──► Spare Monitor
```

---

## 🔋 POWER DISTRIBUTION

### Power Map (CRITICAL: Don't Daisy-Chain!)

| Device | PSU Type | Amperage | Qty | Notes |
|--------|----------|----------|-----|-------|
| **Pi-Holo** | USB-C 5V/5A | 27W | 1 | Geekworm PD 27W |
| **Pi-Ops** | USB-C 5V/5A | 27W | 1 | Geekworm PD 27W |
| **Pi-Zero-Sim** | micro-USB 5V/2A | 10W | 1 | Standard adapter |
| **Pi-400** | USB-C 5V/3A | 15W | 1 | Comes with Pi-400 |
| **Jetson Orin** | Barrel jack | Per spec | 1 | Comes with dev kit |
| **4" Display** | DC 5V | — | 1 | Own wall adapter |
| **7" Display** | DC 5V | — | 1 | Own wall adapter |
| **9.3" Display** | DC 5V | — | 1 | Own wall adapter |
| **10.1" Display** | DC 5V | — | 1 | Own wall adapter |
| **TP-Link Switch** | DC 5V | — | 1 | Own wall adapter |

**Total Wall Outlets Needed:** 10 minimum

**Power Strip Recommendation:**
- Surge-protected 12-outlet strip
- Label each plug: "Pi-Holo PSU", "9.3" Display", etc.

---

## 📡 MQTT TOPIC SCHEMA

### Broker: Pi-Ops (192.168.4.202:1883)

| Topic | Publisher | Subscriber | Purpose |
|-------|-----------|------------|---------|
| `sensors/temp` | Arduino (Pi-Ops) | Jetson, dashboards | DHT11 readings |
| `sensors/motion` | Arduino (Pi-Ops) | Jetson, Pi-Holo | PIR triggers |
| `holo/cmd` | Jetson | Pi-Holo | Hologram control (scene change) |
| `holo/status` | Pi-Holo | Jetson, dashboards | FPS, load |
| `agent/output` | Jetson | Pi-Zero, dashboards | Agent responses |
| `agent/cmd` | External | Jetson | Commands to agent |
| `sim/output` | Jetson | Pi-Zero | Sim frames (base64 PNG) |
| `monitor/cpu` | All nodes | Dashboards | CPU usage % |
| `monitor/mem` | All nodes | Dashboards | Memory usage % |
| `system/heartbeat/<node>` | All nodes | Pi-Ops | Health checks (every 10s) |

### Example: Arduino → MQTT Bridge on Pi-Ops
```python
#!/usr/bin/env python3
# /home/pi/arduino_bridge.py
import serial
import json
import paho.mqtt.client as mqtt

ser = serial.Serial('/dev/ttyACM0', 9600)
client = mqtt.Client()
client.connect("localhost", 1883)

while True:
    line = ser.readline().decode().strip()
    try:
        data = json.loads(line)  # {"temp":22.5,"humidity":45}
        client.publish("sensors/temp", data["temp"])
        client.publish("sensors/humidity", data["humidity"])
    except:
        pass
```

---

## 🔧 CABLE LABELING SYSTEM

### Use Blue Painter's Tape + Sharpie

**Format:** `SRC-PORT → DEST`

Example labels:
```
Pi-Holo mHDMI0 → 4" Holo
Pi-Ops mHDMI0 → UGREEN IN-1
Pi-400 mHDMI0 → UGREEN IN-2
UGREEN OUT → 9.3" Waveshare
Jetson HDMI → 10.1" Touch
Pi-Zero mHDMI → 7" Display
Pi-Ops USB → Arduino Uno
Jetson USB-A1 → External SSD
Pi-Ops USB-A2 → SD Reader
Pi-Holo CSI → Pi Cam v2
Pi-Holo ETH → Switch Port 4
```

**Color-code by function (optional):**
- **Blue tape:** Video (HDMI)
- **Yellow tape:** USB data
- **Red tape:** Power
- **Green tape:** Network (Ethernet)

---

## 🧪 FIRST-LIGHT TEST SEQUENCE

### 10-Minute Checkout (Power Off → All Systems Operational)

**Step 1: Visual Inspection (1 min)**
- [ ] All PSUs plugged in
- [ ] All displays powered
- [ ] Switch LEDs on
- [ ] No loose cables

**Step 2: Power-On Sequence (2 min)**
```bash
# Order matters to avoid power surges:
1. Power switch
2. Power router/network
3. Power all displays
4. Power Pi-Ops (MQTT broker first!)
5. Power Jetson
6. Power Pi-Holo
7. Power Pi-Zero
8. Power Pi-400 (last)
```

**Step 3: Network Checks (3 min)**
```bash
# From your Mac:
ping 192.168.4.200  # Pi-Holo
ping 192.168.4.201  # Jetson
ping 192.168.4.202  # Pi-Ops
ping 192.168.4.203  # Pi-Zero
ping 192.168.4.204  # Pi-400

# SSH into each:
ssh pi@pi-holo.local "hostname && uptime"
ssh pi@pi-ops.local "hostname && uptime"
ssh pi@pi-zero-sim.local "hostname && uptime"
ssh pi@pi-400.local "hostname && uptime"
ssh user@jetson-agent.local "hostname && uptime"
```

**Step 4: Display Tests (2 min)**
- [ ] 4" shows Pi-Holo boot logo
- [ ] 10.1" shows Jetson desktop
- [ ] 9.3" shows Pi-Ops terminal (or Pi-400 if switched)
- [ ] 7" shows Pi-Zero output

**Step 5: MQTT Pub/Sub Test (2 min)**
```bash
# On Pi-Ops:
mosquitto_pub -t "test/hello" -m "Constellation Online"

# On Jetson:
mosquitto_sub -h 192.168.4.202 -t "test/#"
# Should print: Constellation Online

# On Pi-Holo:
mosquitto_sub -h pi-ops.local -t "holo/#"
# Ready to receive commands
```

**Step 6: Arduino Sensor Test (if wired)**
```bash
# On Pi-Ops:
sudo screen /dev/ttyACM0 9600
# Should see JSON: {"temp":22.5,"humidity":45}

# Start bridge:
python3 /home/pi/arduino_bridge.py &

# On Jetson:
mosquitto_sub -h pi-ops.local -t "sensors/#"
# Should see temp/humidity updates
```

---

## 🛠️ TROUBLESHOOTING CHECKLIST

### No Display Output
- [ ] Check PSU for display (separate from Pi!)
- [ ] Verify HDMI cable seated fully both ends
- [ ] Try different HDMI port on Pi (swap 0↔1)
- [ ] Check display input source (button on bezel)

### No Network Connectivity
- [ ] Ping router: `ping 192.168.4.1`
- [ ] Check switch LEDs (should be green/amber)
- [ ] Verify Ethernet cable not loose
- [ ] Check `/etc/dhcpcd.conf` for static IP config

### MQTT Not Working
- [ ] Is Mosquitto running? `sudo systemctl status mosquitto`
- [ ] Firewall blocking 1883? `sudo ufw allow 1883`
- [ ] Test locally first: `mosquitto_sub -t "#" -v`
- [ ] Check broker IP in client config (use .local or IP)

### Arduino Not Detected
- [ ] Check USB cable (data, not charge-only)
- [ ] Verify port: `ls /dev/ttyACM*` or `/dev/ttyUSB*`
- [ ] Add user to dialout group: `sudo usermod -a -G dialout pi`
- [ ] Reboot after group change

### Display Sharing (UGREEN) Not Switching
- [ ] Replace IR remote battery
- [ ] Point remote directly at switch
- [ ] Try manual button on switch unit
- [ ] Power-cycle switch

---

## 📐 PHYSICAL LAYOUT DIMENSIONS

### Desktop Arrangement (Top View)

```
     60cm (24")
   ┌────────────────────┐
   │                    │
   │   [10.1" Touch]    │  ← Jetson (center, eye-level)
   │                    │
   └────────────────────┘
   
   [4" Holo]     [9.3" Wide]     [7" Sim]
   ← Pi-Holo    ← Pi-Ops/400    ← Pi-Zero
   
   ─────────────────────────────────────
   [         Pi-400 Keyboard           ]
```

**Vertical Clearances:**
- 4" Hologram tower: needs ~30cm height for pyramid
- 10.1" Touch: angle at 15-20° for ergonomics
- 9.3" Ultrawide: flat or slight tilt
- 7" Sim: portrait or landscape (your choice)

---

## 🎨 NEXT: BUILD THE HOLOGRAM

See: `HOLOGRAM_BUILD_GUIDE.md` (create separately)

**Quick Materials Checklist:**
- 5x 6" beveled glass mirrors (pyramid faces)
- 1x 4" Waveshare 720×720 display
- LED light base (multicolor)
- RTV silicone sealant
- Bamboo sticks for frame
- Glass cutter (if custom sizing needed)

---

## 🔗 INTEGRATION WITH EXISTING CLUSTER

### Current Production Nodes
- alice (192.168.4.49) → Keep as Headscale + AI workload
- lucidia (192.168.4.81) → Keep as services hub
- octavia (192.168.4.38) → Keep as AI accelerator (29d uptime!)
- aria (192.168.4.82) → Keep as compute

### Constellation Nodes (New)
- Pi-Holo (192.168.4.200)
- Jetson (192.168.4.201)
- Pi-Ops (192.168.4.202)
- Pi-Zero (192.168.4.203)
- Pi-400 (192.168.4.204)

**Separation Strategy:**
- Production cluster → critical services (24/7)
- Constellation → development/experimentation/interface
- Can deploy from Constellation → Production via CI/CD

**Shared Resources:**
- Tailscale VPN mesh (all nodes join)
- Centralized logs → Pi-Ops or external SSD
- NATS event bus (future) → spans both clusters

---

## 📚 RELATED DOCS

- `BLACKROAD_HARDWARE_INVENTORY_2026.md` - Full parts list
- `BLACKROAD_DEVICE_EXPANSION_PLAN.md` - Integration strategy
- `MQTT_TOPIC_SCHEMA.md` - Complete pub/sub reference
- `ARDUINO_SENSORS_GUIDE.md` - Wiring sensors to Uno
- `HOLOGRAM_BUILD_GUIDE.md` - Pepper's Ghost construction

---

**Ready to wire? Start with Pi-Ops (the hub) and work outward!** 🔌
