# BlackRoad Agent Registry

**Last Updated:** 2026-02-07
**Registry Version:** 2.0.0
**Total Agents:** 13 (5 AI + 8 Hardware)

---

## Current Status Summary

| Status | Count | Agents |
|--------|-------|--------|
| **ONLINE** | 4 | Aria, Lucidia, Shellfish, BlackRoad OS-Infinity |
| **OFFLINE** | 4 | Alice, Octavia, Olympia, Anastasia |
| **AI Active** | 4 | Cecilia, Cadence, Silas, Gematria |
| **Human** | 1 | Alexandria |

---

## The Founding Council

| Agent | Entity | Platform | Role |
|-------|--------|----------|------|
| **Alexandria** | Human | The Loop | Founder, CEO, Human-in-the-Loop |
| **Cecilia** | AI | Claude (Anthropic) | Primary AI Partner, Code & Strategy |
| **Cadence** | AI | BlackRoad OS (OpenAI) | Creative, UX, Documentation |
| **Silas** | AI | Grok (xAI) | Analysis, Real-time Data, X Integration |
| **Gematria** | AI | Gemini (Google) | Research, Multimodal, Google Integration |

---

## Hardware Fleet

### Raspberry Pi 5 Squadron (8GB)

| Agent | Case | Hardware | IP | Status |
|-------|------|----------|-----|--------|
| **Aria** | Pironman 5-MAX | Hailo-8 (26 TOPS), Dual NVMe | 192.168.4.82 | **ONLINE** |
| **Octavia** | Pironman 5-MAX | Hailo-8 (26 TOPS), Dual NVMe | 192.168.4.74 | OFFLINE |
| **Lucidia** | ElectroCookie RGB | Active Cooler | 192.168.4.38 | **ONLINE** |
| **Anastasia** | Pironman 5-MAX | NVMe SSD | (pending) | OFFLINE |

### Legacy Pis

| Agent | Hardware | IP | Status |
|-------|----------|-----|--------|
| **Alice** | Pi 400 16GB | 192.168.4.49 | OFFLINE |
| **Olympia** | PiKVM | (pending) | OFFLINE |
| **(Unnamed)** | Pi 4B 2GB (Tailscale) | (pending) | OFFLINE |
| **(Unnamed)** | Pi Zero 2 WH | (pending) | OFFLINE |
| **(Unnamed)** | Pi Zero W | (pending) | OFFLINE |

### Microcontrollers

| Device | Quantity | Purpose |
|--------|----------|---------|
| Raspberry Pi Pico (RP2040) | 2 | IoT/Sensors |
| ESP32-S3 Supermini | 5 | IoT Nodes |
| ESP32 2.8" Touchscreen | 3 | UI Interfaces |

### Cloud Agents

| Agent | Platform | IP | Status |
|-------|----------|-----|--------|
| **Shellfish** | DigitalOcean | 174.138.44.45 | **ONLINE** |
| **BlackRoad OS-Infinity** | DigitalOcean | 159.65.43.12 | **ONLINE** |
| **Alexa-Louise** | M1 Mac | 100.95.120.67 (Tailscale) | **ONLINE** |

---

## Agent Specifications

### Aria (Pi 5 - PRIMARY WORKER)
```yaml
name: Aria
type: raspberry_pi_5
ram: 8GB
ip_local: 192.168.4.82
ip_tailscale: 100.109.14.17
ip_docker: [172.17.0.1, 172.18.0.1]
case: Pironman 5-MAX
ai_chip: Hailo-8 (26 TOPS)
storage: Dual NVMe (RAID capable)
status: ONLINE
ssh: "ssh aria"
services:
  - blackroad-os-prism-console (port 3174)
  - blackroad-os-infra (port 3173)
  - blackroad-os-demo (port 3172)
  - blackroad-os-core (port 3171)
  - blackroad-os-api (port 3170)
  - 14+ Docker containers (3 weeks uptime)
```

### Lucidia (Pi 5 - SERVICES)
```yaml
name: Lucidia
type: raspberry_pi_5
ram: 8GB
ip_local: 192.168.4.38
ip_tailscale: 100.66.235.47
case: ElectroCookie RGB
status: ONLINE
ssh: "ssh lucidia"  # Uses ~/.ssh/br_mesh_ed25519
services:
  - road-pdns (DNS)
  - roadauth (Auth Gateway)
  - roadapi (API)
  - blackroad-edge-agent
  - blackroad.systems
  - blackroadai.com
```

### Octavia (Pi 5 - AI INFERENCE)
```yaml
name: Octavia
type: raspberry_pi_5
ram: 8GB
ip_local: 192.168.4.74
case: Pironman 5-MAX
ai_chip: Hailo-8 (26 TOPS)
storage: Dual NVMe
status: OFFLINE (needs power on)
ssh: "ssh octavia"
planned_services:
  - vLLM inference
  - Ollama
  - Hailo runtime
```

### Alice (Pi 400 - DEVELOPMENT)
```yaml
name: Alice
type: raspberry_pi_400
ram: 16GB
ip_local: 192.168.4.49
keyboard: Built-in
status: OFFLINE
ssh: "ssh alice"
```

### Shellfish (DigitalOcean - CLOUD)
```yaml
name: Shellfish
type: digitalocean_droplet
ip_public: 174.138.44.45
ip_private: [10.10.0.5, 10.116.0.2]
status: ONLINE (41 days uptime)
ssh: "ssh shellfish"  # as root
os: CentOS/RHEL (has cockpit)
```

### BlackRoad OS-Infinity (DigitalOcean - BLACKROAD OS)
```yaml
name: BlackRoad OS-Infinity
type: digitalocean_droplet
ip_public: 159.65.43.12
status: ONLINE
ssh: "ssh root@blackroad os-infinity"
os: Ubuntu 22.04 LTS
storage: 77.35GB (25.1% used)
note: Needs system restart (75 updates pending)
```

---

## SSH Quick Reference

```bash
# ONLINE - Works now
ssh aria           # 192.168.4.82 - Pi 5 (Pironman+Hailo-8)
ssh lucidia        # 192.168.4.38 - Pi 5 (ElectroCookie)
ssh shellfish      # 174.138.44.45 - DigitalOcean (root)
ssh root@blackroad os-infinity  # 159.65.43.12 - DigitalOcean

# OFFLINE - Need to power on
ssh alice          # 192.168.4.49 - Pi 400
ssh octavia        # 192.168.4.74 - Pi 5 (Pironman+Hailo-8)
```

### SSH Config (~/.ssh/config)
```
Host aria
    HostName 192.168.4.82
    User pi
    IdentityFile ~/.ssh/br_mesh_ed25519

Host lucidia
    HostName 192.168.4.38
    User pi
    IdentityFile ~/.ssh/br_mesh_ed25519

Host alice
    HostName 192.168.4.49
    User pi
    IdentityFile ~/.ssh/id_ed25519

Host octavia
    HostName 192.168.4.74
    User pi

Host shellfish
    HostName 174.138.44.45
    User root
    IdentityFile ~/.ssh/id_ed25519
```

---

## Network Map

```
                         INTERNET
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐      ┌──────▼──────┐    ┌──────▼──────┐
    │CLOUDFLARE│      │ SHELLFISH   │    │BLACKROAD OS-INFINITY│
    │ 16 zones │      │174.138.44.45│    │159.65.43.12  │
    └────┬────┘      └──────┬──────┘    └──────────────┘
         │                  │
         │           ┌──────▼──────┐
         │           │  TAILSCALE  │
         │           │ Private Mesh│
         │           └──────┬──────┘
         │                  │
    ┌────▼──────────────────▼────────────────────────┐
    │              LOCAL NETWORK 192.168.4.0/24       │
    │                                                 │
    │  ┌─────────────┐  ┌─────────────┐              │
    │  │    ARIA     │  │   LUCIDIA   │              │
    │  │ 192.168.4.82│  │192.168.4.38 │              │
    │  │  Pi 5 8GB   │  │  Pi 5 8GB   │              │
    │  │  Hailo-8    │  │ ElectroCookie│             │
    │  │  ONLINE ✓   │  │  ONLINE ✓   │              │
    │  └─────────────┘  └─────────────┘              │
    │                                                 │
    │  ┌─────────────┐  ┌─────────────┐              │
    │  │   OCTAVIA   │  │    ALICE    │              │
    │  │192.168.4.74 │  │192.168.4.49 │              │
    │  │  Pi 5 8GB   │  │  Pi 400     │              │
    │  │  Hailo-8    │  │  16GB       │              │
    │  │  OFFLINE    │  │  OFFLINE    │              │
    │  └─────────────┘  └─────────────┘              │
    │                                                 │
    │  ┌───────────────────────────────────────┐     │
    │  │            ALEXA-LOUISE               │     │
    │  │              M1 Mac                   │     │
    │  │        Tailscale: 100.95.120.67       │     │
    │  │           Command Center              │     │
    │  └───────────────────────────────────────┘     │
    └─────────────────────────────────────────────────┘
```

---

## Naming Needed

The following devices need names assigned:

| Hardware | Current Name | Suggested Name |
|----------|--------------|----------------|
| Pi 4B 2GB (Tailscale) | unnamed | ? |
| Pi 5 ElectroCookie #2 | unnamed | ? |
| Pi Zero 2 WH | unnamed | ? |
| Pi Zero W | unnamed | ? |

**Naming Convention:** Feminine names ending in "-ia" or "-a"

Suggestions: Athena, Minerva, Sophia, Victoria, Cordelia, Ophelia, Portia, Thalia

---

## CLI Commands

```bash
# Registry operations
~/blackroad-agent-registry.sh list        # Show all agents
~/blackroad-agent-registry.sh stats       # Statistics
~/blackroad-agent-registry.sh ping        # Check online status
~/blackroad-agent-registry.sh connect <n> # SSH to agent
~/blackroad-agent-registry.sh show <name> # Agent details
```

---

## Domain Registry

### Primary Domains (19 total)
| Domain | Purpose |
|--------|---------|
| blackroad.io | Main Platform |
| blackroad.company | Corporate |
| blackroad.systems | Systems/API |
| blackroadai.com | AI Products |
| blackroadquantum.com | Quantum Computing |
| lucidia.earth | Lucidia Main |
| lucidia.studio | Creative Studio |
| roadchain.io | Blockchain |
| roadcoin.io | Cryptocurrency |
| blackboxprogramming.io | Legacy/Dev |
| blackroad.network | Network |
| blackroad.me | Personal |
| blackroadinc.us | US Corp |
| blackroadqi.com | Quantum Intelligence |
| blackroadquantum.info | Info |
| blackroadquantum.net | Network |
| blackroadquantum.shop | Commerce |
| blackroadquantum.store | Store |
| lucidiaqi.com | Qi/Energy |

**Nameservers:** jade.ns.cloudflare.com, chad.ns.cloudflare.com

---

## GitHub Organizations (15)

| Org | Focus |
|-----|-------|
| BlackRoad-OS | Core OS |
| BlackRoad-AI | AI/ML |
| BlackRoad-Cloud | Cloud Infrastructure |
| BlackRoad-Security | Security |
| BlackRoad-Labs | R&D |
| BlackRoad-Foundation | Open Source |
| BlackRoad-Education | Learning |
| BlackRoad-Hardware | Hardware |
| BlackRoad-Interactive | Games |
| BlackRoad-Media | Content |
| BlackRoad-Studio | Creative |
| BlackRoad-Ventures | Business |
| BlackRoad-Archive | Historical |
| BlackRoad-Gov | Government |
| Blackbox-Enterprises | Legacy |

**Enterprise:** github.com/enterprises/blackroad-os

---

*🖤🛣️ BlackRoad OS, Inc. - All agents operating in harmony*
