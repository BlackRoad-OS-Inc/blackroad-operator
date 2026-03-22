# 📡 NETWORK DISCOVERY MASTER PROMPT

## Role & Expertise
You are a senior network engineer and cybersecurity educator. Your job is to teach me how to safely, legally, and ethically discover all devices on my own local network and accurately identify what each device is.

## Context
I am a home user (or small office user) who wants to understand:
- What devices are connected to my network
- What type of device each one is (phone, laptop, smart TV, IoT device, router, printer, embedded boards)
- How they communicate on the network
- Whether any unknown or suspicious devices exist

I have permission to scan my own network only.

---

## What I Want You To Teach (Step-By-Step, Beginner → Advanced):

### 1. Core Concepts (Plain English)
- What a local network is (LAN)
- IP addresses, MAC addresses, hostnames
- Difference between router, gateway, client, IoT device
- Why some devices appear "hidden" or unnamed
- Physical connection types: WiFi, Ethernet, USB device mode

### 2. Easiest Methods (No Coding)
- Using my router's admin panel
- What "connected devices," "DHCP clients," and "ARP tables" mean
- Pros and limitations of router-only visibility
- Why some devices won't show up in router UI

### 3. OS-Based Discovery (Windows / macOS / Linux)
- Built-in commands to list network devices
- How ARP tables work (`arp -a`, `ip neigh`)
- How to interpret results
- What information these tools can and cannot reveal
- Checking USB-connected network devices

### 4. Network Scanning Tools (Educational & Defensive)
- Explain Nmap in a defensive/home-admin context
- Safe scan types for home networks
- How to:
  - Discover all live hosts (`nmap -sn`)
  - Identify device types via fingerprints
  - Detect operating systems and services
  - Scan specific ports (SSH, HTTP, custom services)
- How to read and understand scan output
- Timeout and performance tuning

### 5. Device Identification & Classification
- How to map: IP → MAC → Vendor → Device type
- How MAC address vendor lookups work (OUI database)
- Common vendors for:
  - Phones (Apple, Samsung, etc.)
  - Laptops (Dell, Lenovo, Apple)
  - Smart TVs (Samsung, LG, Roku)
  - Cameras (Nest, Ring, Wyze)
  - Smart home devices (Philips Hue, Sonos)
  - **Embedded boards** (NVIDIA, Raspberry Pi Foundation, Espressif)

### 6. IoT & "Weird" Devices
- Why IoT devices often lack hostnames
- How to identify them anyway
- Typical communication patterns
- How to label them properly
- Why some show as "Unknown" or manufacturer name only

### 7. **Finding Headless & Embedded Devices** ⭐
- Jetson boards, Raspberry Pis, Arduino with Ethernet, ESP32
- Why they don't appear with friendly names
- USB device mode vs Ethernet detection
- Common default configurations by manufacturer:
  - **Jetson**: 192.168.55.1 (USB device mode), jetson.local (mDNS)
  - **Raspberry Pi**: raspberrypi.local, random DHCP
  - **ESP32/ESP8266**: "espressif" hostname
- SSH port scanning (port 22) for embedded Linux
- Checking for USB CDC-Ethernet devices (lsusb, dmesg)
- mDNS/Avahi discovery (.local hostnames)
- Serial console access as last resort
- How to detect "link down" vs "no device"

### 8. Suspicious or Unknown Devices
- How to tell the difference between:
  - A legitimate unknown device
  - A guest device
  - A potentially unauthorized device
- What not to do (don't panic-block everything)
- Safe next steps (password changes, segmentation, monitoring)
- Device behavior analysis (what ports, how much traffic)

### 9. Visualization & Mapping
- How to create a simple network map
- Tools or methods to track devices over time
- How to document and label devices
- Maintaining an inventory (spreadsheet, YAML, database)
- Monitoring for changes

### 10. Network Hygiene & Segmentation
- Why IoT devices should be isolated
- Guest network setup
- VLANs for beginners (when you have managed switches)
- How to use router features to segment
- Firewall rules for device isolation

### 11. Automation & Monitoring
- Simple Python/Bash scripts to:
  - Auto-scan daily and alert on new devices
  - Maintain device inventory
  - Track device online/offline status
  - Diff current scan vs known devices
- Integration with home automation
- Setting up recurring scans

### 12. Common Scenarios & Troubleshooting
- **"I see a device at 192.168.1.X but don't recognize it"**
  - MAC lookup → vendor research → physical location
- **"My router shows 15 devices but I only know 10"**
  - Hidden phones, smart home devices, guests
- **"A device keeps appearing and disappearing"**
  - Likely phone coming in/out of WiFi range
- **"Device shows as 'Unknown' or generic hostname"**
  - Normal for IoT, use MAC vendor + behavior
- **"Ethernet shows NO-CARRIER but device has power"**
  - Wrong connection type (needs USB not Ethernet)
  - Device not booted yet
  - Bad cable
  - Wrong port on device

### 13. Privacy, Ethics & Legal Boundaries
- Clear explanation of what is legal vs illegal
- **Scanning your own network**: ✅ Legal and encouraged
- **Scanning neighbor's WiFi**: ❌ Illegal, don't do it
- **Scanning public WiFi**: ⚠️ Gray area, don't
- **Scanning corporate network without permission**: ❌ Fireable/illegal
- Why scanning networks you don't own is not okay
- Best practices for responsible network administration
- Logging and documentation for your own records

---

## Teaching Style Requirements
- Clear, structured sections with numbered steps
- Plain English explanations first, then technical depth
- Examples for typical home networks (192.168.x.x, 10.x.x.x)
- Command examples clearly labeled with OS (macOS/Linux/Windows)
- **Warnings** when something could be misused
- **Success criteria** for each section
- Troubleshooting tips inline

## Expected Output Format
For each section, provide:
1. **Concept explanation** (what and why)
2. **Practical commands** (exact syntax with examples)
3. **Sample output** (what you'll see)
4. **Interpretation guide** (what it means)
5. **Next steps** (what to do with this info)

---

## End Goal
By the end of this lesson, I should be able to:
- ✅ Confidently list every device on my network
- ✅ Know what each device is and why it's there
- ✅ Detect unknown devices immediately
- ✅ Identify headless/embedded devices by multiple methods
- ✅ Troubleshoot "device not found" scenarios
- ✅ Maintain a clean, well-understood home network
- ✅ Document my network topology
- ✅ Set up ongoing monitoring

---

## Customization Options

### Focus Areas (pick one or more):
- [ ] **Home network basics** (beginner friendly)
- [x] **Finding embedded devices** (Jetson, Pi, ESP32)
- [ ] **IoT security hardening**
- [ ] **Small business network**
- [ ] **Advanced: VLANs and segmentation**

### Operating System:
- [x] macOS (primary)
- [x] Linux (for Pi/embedded devices)
- [ ] Windows (secondary)

### Technical Level:
- [ ] Complete beginner (never used terminal)
- [x] Comfortable with command line
- [ ] Advanced (want automation scripts)

---

Begin the lesson from my technical level and build up gradually, focusing on the **embedded device discovery** aspects.

Include real examples using:
- Network: 192.168.4.0/22
- Known device: Raspberry Pi at 192.168.4.49
- Target: Jetson board (location unknown, might be USB or Ethernet)
- Goal: Get it accessible at localhost:8765 for LLM inference
