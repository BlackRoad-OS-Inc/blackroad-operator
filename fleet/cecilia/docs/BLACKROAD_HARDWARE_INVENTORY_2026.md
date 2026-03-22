# BlackRoad Hardware Inventory - Complete Build
**Updated:** 2026-02-11  
**Total Investment:** ~$3,500+ in new hardware  
**Status:** Ready for integration

---

## 🎯 MASTER SYSTEM ARCHITECTURE

### The Constellation Workstation Design

```
┌──────────────────────────────────────────────────────────┐
│                    BLACKROAD WORKSTATION                  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  LEFT                CENTER              RIGHT            │
│  ┌───────┐          ┌──────────┐       ┌───────┐        │
│  │ 4"    │          │ 10.1"    │       │ 7"    │        │
│  │ HOLO  │          │ AGENT    │       │ SIM   │        │
│  │ Pi-5  │          │ JETSON   │       │ Pi-0W │        │
│  └───▲───┘          └────▲─────┘       └───▲───┘        │
│      │                   │                 │             │
│  [Pyramid]           [Touch UI]       [Output]           │
│                                                           │
│              ┌────────────────┐                          │
│              │   9.3" OPS     │                          │
│              │   Pi-5 #2      │ ◄─── MQTT BROKER        │
│              └────────────────┘                          │
│                                                           │
│  ┌──────────────────────────────────┐                   │
│  │   Pi-400 KEYBOARD (Admin/KVM)    │                   │
│  └──────────────────────────────────┘                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 💻 COMPUTING NODES

### 🎯 CRITICAL DISCOVERY: LUCIDIA IS ALREADY THE BRAIN!

**Lucidia (192.168.4.81) is already running:**
- ✅ NATS event bus (port 4222)
- ✅ Ollama LLM server (port 11434)
- ✅ Edge agent

**This means:**
- ❌ Don't need MacBook #2 for LLM inference
- ✅ Use Lucidia as the orchestration brain
- ✅ MacBooks become monitoring/dev stations only

---

## 💻 COMPUTING NODES

### Current Production Cluster (Already Running ✅)
| Node | Hardware | IP | Role | Status | Details |
|------|----------|-----|------|--------|---------|
| **alice** | Raspberry Pi 400 (4GB) | 192.168.4.49 | Auth + Billing | ✅ Online | 7 containers, 93% disk full |
| **lucidia** | Raspberry Pi 5 (8GB) | 192.168.4.81 | NATS + Ollama Brain | ✅ Online | Already has event bus + LLM! |
| **octavia** | Raspberry Pi 5 (8GB) | 192.168.4.38 | Heavy Storage | ✅ Online (29d) | 235GB card, 90% full - needs cleanup |
| **aria** | Raspberry Pi 5 (8GB) | 192.168.4.82 | Web Services | ✅ Online (4wk!) | 9 containers, rock solid |

### New Constellation Boards (Ready to Deploy!)
| Node | Hardware | Purpose | Display | Status |
|------|----------|---------|---------|--------|
| **Pi-Holo** | Raspberry Pi 5 8GB (NEW) | Hologram Renderer | 4" 720×720 | 🆕 Flash today |
| **Pi-Ops** | Raspberry Pi 5 8GB (NEW) | MQTT Broker + Monitor | 9.3" 1600×600 | 🆕 Flash today |
| **Pi-Zero-Sim** | Raspberry Pi Zero W | Lightweight Sim Output | 7" 1024×600 | ✅ Ready |
| **Jetson-Agent** | Jetson Orin Nano | Agent UI | 10.1" Touch | ⏳ Waiting for display |

### Development Machines
| Device | Model | Role | Status |
|--------|-------|------|--------|
| **lucidia-operator** | MacBook Pro M1 8GB | Primary Dev | ✅ Current |
| **MacBook #1** | ~2014 Intel | Monitoring Station | Ready |
| **MacBook #2** | ~2014 Intel | Agent Orchestrator | Ready |

---

## 🖥️ DISPLAYS & INPUT

### Purchased Displays
| Size | Resolution | Model | Assigned To | Purpose |
|------|-----------|-------|-------------|---------|
| 10.1" | 1024×600 | ROADOM Touch IPS | Jetson | Agent UI (touch) |
| 9.3" | 1600×600 | Waveshare Ultrawide | Pi-Ops / Pi-400 | Ops Panel (shared via switch) |
| 7" | 1024×600 | Waveshare Touch | Pi Zero W | Sim Output |
| 4" | 720×720 | Waveshare Square | Pi-Holo | Hologram (under pyramid) |
| 2.8" | 240×320 | ESP32 Touch TFT | ESP32 | Standalone Sensor Display |

**Total Screens:** 5 dedicated + 2 shareable

### Input Devices
- **Apple Magic Keyboard** ($98.50) - Bluetooth to Jetson/Macs
- **Apple Magic Mouse** ($79.99) - Primary pointer
- **Logitech H390 USB Headset** ($28.84) - Voice I/O for agents
- **Pi 400 Keyboard** ($119) - Built-in admin console

### Video Signal Routing
- **UGREEN HDMI Switch 5-in-1** - Share 9.3" between Pi-Ops & Pi-400
- **WAVLINK HDMI Splitter** - Clone Pi-Holo to second display (optional)
- **WARRKY USB-C to HDMI Cables** (2-pack) - Mac→Display
- **JSAUX Micro HDMI Adapters** - Pi→Display
- **8K Right-Angle Micro HDMI** - Tight spaces (Pi-Holo)

---

## 🧠 AI ACCELERATORS

### Hailo-8 M.2 Module ($214.99)
- **26 TOPS AI Performance**
- Compatible with Raspberry Pi 5
- Linux/Windows support
- **Install on:** octavia OR new Pi-5 dedicated AI node

### Jetson Orin Nano ($114.29 base)
- **GPU-accelerated AI**
- Runs full LLMs
- Agent UI workstation
- Real-time inference

---

## 🔌 POWER & COOLING

### Power Supplies
| Device | PSU | Qty | Notes |
|--------|-----|-----|-------|
| Pi 5 | Geekworm 27W 5V/5A USB-C | 2 | Pi-Holo, Pi-Ops |
| Pi 5 (future) | Same | 1 | For Pironman build |
| Pi Zero | 5V/2A Micro USB | 1 | Pi-Zero-Sim |
| Pi 400 | 5V/3A USB-C | 1 | Built-in keyboard |
| Jetson | Barrel jack PSU | 1 | Comes with dev kit |
| Displays | Various 5V wall adapters | 5 | Don't draw from Pi USB! |
| ESP32 | DC 5V/4A | 2 | For projects |

### Cooling Solutions
- **GeeekPi Active Cooler RGB** ($9.99) - For Pi-Holo
- **ElectroCookie Radial Tower** ($13.99) - For Pi-Ops
- **Pironman 5-MAX Case** (ordered) - Dual fans + tower cooler

---

## 💾 STORAGE

### SSDs
| Drive | Capacity | Interface | Purpose |
|-------|----------|-----------|---------|
| Crucial P310 | 1TB | NVMe M.2 | For Pironman Pi-5 (ordered) |
| External SSD | ? | USB 3.0 | Jetson workspace OR Pi-Ops logs |

### SD Cards & Readers
- **Samsung EVO Select 256GB** - Main OS cards
- **Anker USB 3.0 SD Reader** (2x) - Flashing stations
- **Apple USB-C SD Reader** ($45) - Mac workflows

---

## 🌐 NETWORKING

### Current Network
- **Router:** TP-Link (192.168.4.1)
- **Switch:** TP-Link TL-SG105 (5-port gigabit)
- **WiFi Card:** TP-Link AX3000 PCIe WiFi 6

### Network Topology
```
                 [Router/WiFi]
                      |
              [TP-Link Switch]
               /    |    |    \
           Jetson  Pi5  Pi5  Pi400
                  Holo  Ops
                  
           [WiFi] ← Pi Zero W
```

### VPN Mesh (Tailscale)
- alice: 100.77.210.18
- lucidia: 100.66.235.47
- octavia: Already in mesh
- aria: 100.109.14.17
- **TODO:** Add new constellation nodes

---

## 🛠️ DEVELOPMENT KITS & COMPONENTS

### Microcontrollers
| Item | Purpose | Notes |
|------|---------|-------|
| **ELEGOO UNO R3 Starter Kit** (200+ components) | Arduino projects | Full sensor suite |
| **ELEGOO UNO R3 Super Kit** | Advanced projects | LCD, motors, relays |
| **ESP32 2.8" Touch TFT** | Standalone displays | WiFi + BT + screen |
| **Freenove Ultimate Kit** | Pi learning | 962-page tutorial, 128 projects |

### Electronics Components
- **BOJACK Breadboard Jumper Kit** (840 pcs) - All lengths
- **HiLetgo Logic Level Converters** (10x 4-ch) - 3.3V↔5V
- **Relay Modules** (2-channel 12V) - Switching
- **BTF-LIGHTING WS2812B LED Strip** (5m, 300 LEDs) - Addressable RGB

### Sensors (from ELEGOO kits)
- DHT11 Temperature/Humidity
- Ultrasonic sensors
- IR receivers
- PIR motion
- Photoresistors
- Tilt switches
- Joystick modules

---

## 🎨 HOLOGRAM BUILD MATERIALS

### Optics
- **50x 4" Square Glass Mirrors** ($21.38) - Pepper's Ghost reflectors
- **5x 6" Beveled Glass Mirrors** ($11.88) - Pyramid faces
- **100x Bamboo Sticks** (15.7") - Frame structure
- **Glass Cutter** - Custom sizing
- **RTV Silicone Sealant** (2-pack) - Assembly

### Display Bases
- **LED Light Bases** (multicolor) - Under hologram
- **Acrylic Cube Risers** (3", 4", 5") - Display stands
- **Clisela Display Stands** - Presentation

---

## 🔧 TOOLS & WORKSPACE

### Soldering Station
- **Soldering Iron Premium Kit** (60W, adjustable temp)
- **KOTTO Helping Hands** (4-arm magnetic)
- **SainSmart Helping Station** (5X LED magnifier)
- **Heat-Resistant Silicone Mat** (17.7" × 11.8")
- **Solder Smoke Absorber** - Fume extraction
- **Gikfun SMD Practice Board** - Skill training

### Organization
- **Akro-Mils 16-Drawer Cabinet** - Component storage
- **YHYZ Precision Tweezers** (7-pc ESD set)
- **Hebayy Breaker Panel Labels** - Cable management

### Power Distribution
- **Anker Power Banks** (10,000mAh 30W) - Portable power
- **TobenONE 15-in-1 USB-C Dock** ($129.99) - Hub for Jetson/Macs

---

## 📷 SENSORS & I/O

### Cameras
- **Pi Camera Module V2** (8MP, 1080p) - CSI on Pi-Holo for tracking
- (Universal camera mount for hologram input)

### Connectivity Modules
- **ELEGOO OLED Displays** (0.96" × 3) - Status screens
- **ELEGOO 2.8" TFT Touch** - Arduino UI

---

## 🏗️ BUILD PHASES

### Phase 1: Foundation (Current Week)
**Hardware READY NOW:**
- ✅ 4x Production Pis (alice, lucidia, octavia, aria) - Running
- ✅ 2x Raspberry Pi 5 8GB - **Can deploy immediately!**
- ✅ Jetson Orin Nano dev kit
- ✅ Pi Zero W
- ✅ Pi 400 keyboard
- ✅ M1 MacBook Pro
- ✅ Old MacBooks (2x)
- ✅ iPad Pro 2015
- ✅ ESP32 touchscreen (2.8")
- ✅ Arduino kits (ELEGOO x2, Freenove)
- ✅ 4" Waveshare 720×720 display
- ✅ 7" Waveshare touch display
- ✅ 9.3" Waveshare ultrawide
- ✅ Hailo-8 M.2 AI accelerator
- ✅ All electronics components
- ✅ Soldering station
- ✅ TP-Link switch
- ✅ UGREEN HDMI switch
- ✅ WAVLINK HDMI splitter
- ✅ All cables & adapters
- ✅ Glass mirrors & hologram materials

**Tasks (Can Start TODAY!):**
1. Flash 2x Pi 5s (Pi-Holo + Pi-Ops)
2. Wire constellation displays
3. Deploy MQTT broker on Pi-Ops
4. Set up Jetson with existing hardware
5. Build hologram pyramid
6. Install Tailscale on M1 Mac
7. Configure Arduino sensors

### Phase 2: Enhanced Build (When parts arrive)
**INCOMING (Ordered but not yet arrived):**
- Pironman 5-MAX case with dual fans
- Crucial 1TB NVMe M.2 SSD
- Third Pi 5 8GB (for Pironman build)
- 10.1" ROADOM touchscreen (2x total)
- Geekworm 27W USB-C PSU
- Terminator M (?)

**Tasks (When they arrive):**
1. Build Pironman Pi 5 with NVMe + Hailo-8
2. Add second 10.1" display (if needed)
3. Upgrade constellation with premium case
4. RAID storage options

### Phase 3: Integration (Week 3-4)
1. Network all constellation nodes
2. Deploy agent UI on Jetson
3. Build hologram pyramid
4. Wire Arduino sensors to Pi-Ops
5. Create web dashboards
6. Test MQTT pub/sub flows

### Phase 4: Production (Month 2)
1. Deploy agent coordination system
2. Set up PS-SHA∞ memory persistence
3. Build NATS event bus
4. Create capability registry
5. Polish all UIs
6. Documentation & runbooks

---

## 💰 TOTAL INVESTMENT BREAKDOWN

### Computing (~$800)
- Pi 5 8GB (3x): ~$270
- Jetson Orin Nano: $114
- Pi Zero W kit: $35
- Pi 400 kit: $119
- Hailo-8 accelerator: $215

### Displays (~$350)
- 10.1" touchscreen (2x): $170
- 9.3" ultrawide: $120
- 7" touch: $48
- 4" square: $75
- ESP32 touch: $20

### Storage & Power (~$200)
- Crucial 1TB NVMe: included in Pironman
- Pironman case: (ordered)
- PSUs & power banks: ~$150

### Development Kits (~$450)
- ELEGOO kits (3x): ~$160
- Freenove kit: $50
- ESP32 modules: ~$20
- Sensors & components: ~$100
- Soldering station: ~$120

### Networking & I/O (~$200)
- Switch, cables, adapters
- Docking stations
- Camera modules

### Materials & Tools (~$150)
- Glass mirrors & cutters
- Hologram build materials
- Organization & workspace

### Apple Accessories (~$300)
- Magic Keyboard: $98
- Magic Mouse: $80
- iPad accessories: ~$120

**GRAND TOTAL: ~$2,450 (not counting existing gear)**

---

## 🎯 KILLER FEATURES ENABLED

### With This Setup You Can:
1. **Run 1000+ agents** coordinated via MQTT
2. **Display holograms** with Pepper's Ghost optics
3. **Touch-based agent UI** on Jetson
4. **Real-time monitoring** across 5 displays
5. **AI inference** with Hailo-8 + Jetson GPU
6. **Sensor integration** via Arduino → MQTT
7. **Persistent memory** with PS-SHA∞
8. **Remote access** via Tailscale mesh
9. **Development** on M1 Mac + SSH to all nodes
10. **Learning/experiments** with comprehensive kits

---

## 📋 IMMEDIATE NEXT STEPS

### This Week (Hardware Present)
```bash
# 1. Organize workspace
# 2. Install Tailscale
brew install tailscale
sudo tailscale up

# 3. Test soldering station
# 4. Sort components into drawers
# 5. Prep SD cards for new Pis
# 6. Flash test OS on spare SD
```

### When Parts Arrive
1. Unbox & inventory
2. Build Pironman Pi 5
3. Flash all new boards
4. Wire constellation
5. Deploy MQTT broker
6. Test hologram display

### First Integration Test
```bash
# On Pi-Ops (when ready):
sudo apt install mosquitto mosquitto-clients
sudo systemctl enable mosquitto
mosquitto_pub -t "test/hello" -m "BlackRoad Online"

# On Jetson:
mosquitto_sub -h pi-ops.local -t "test/#"

# Confirm: Message received!
```

---

## 🎓 LEARNING PATH

Perfect for Maggie's Dad:
1. **Week 1:** Arduino basics (ELEGOO starter kit)
2. **Week 2:** Soldering practice (SMD board)
3. **Week 3:** Pi basics (Freenove kit)
4. **Week 4:** ESP32 projects (touchscreen display)
5. **Week 5:** Sensors → MQTT → web dashboard
6. **Week 6:** Build your own hologram display

---

## 🔒 SECURITY NOTES

### Network Segmentation
- Production Pis (alice, lucidia, octavia, aria) on main LAN
- Constellation workstation on main LAN
- Old MacBooks on guest WiFi (if security concerns)
- Tailscale for secure remote access

### Access Control
- SSH keys only (no passwords)
- Firewall rules on router
- MQTT ACLs for topic permissions
- Regular security updates

---

## 📚 DOCUMENTATION TO CREATE

1. **Wiring Diagram** - Full constellation map
2. **MQTT Topic Schema** - All pub/sub topics
3. **Setup Runbooks** - Step-by-step for each node
4. **Troubleshooting Guide** - Common issues
5. **Component Inventory** - Drawer-by-drawer list
6. **Safety Guidelines** - Soldering, power, handling

---

**Ready to wire the constellation? Start with Phase 1 tasks!** 🚀
