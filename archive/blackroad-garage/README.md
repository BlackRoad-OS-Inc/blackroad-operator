# BlackRoad Garage

[![Infrastructure](https://img.shields.io/badge/infra-5_nodes-FF6B2B.svg)](https://blackroad.io)
[![WireGuard](https://img.shields.io/badge/WireGuard-mesh-88171A.svg)](https://wireguard.com)
[![Docker](https://img.shields.io/badge/Docker-Swarm-2496ED.svg)](https://docker.com)



Private infrastructure documentation for the BlackRoad fleet.

## Fleet Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BLACKROAD INFRASTRUCTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  👤 HUMAN IN THE LOOP                                               │
│  └── alexandria (Mac) ─── Control Center                           │
│                                                                     │
│  🤖 AI COMPUTE (Hailo-8)                                           │
│  ├── octavia (Pi 5) ─── 26 TOPS                                    │
│  └── cecilia (Pi 5) ─── 26 TOPS                                    │
│                                                                     │
│  🖥️ COMPUTE CLUSTER                                                 │
│  ├── alice (Pi 4) ─── Headscale mesh server                        │
│  ├── lucidia (Pi 4) ─── 15 containers                              │
│  └── aria (Pi 5) ─── 142 containers                                │
│                                                                     │
│  ☁️ CLOUD                                                           │
│  ├── codex-infinity (DO) ─── 8GB/4vCPU                             │
│  └── shellfish (DO) ─── 1GB/1vCPU                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Access

```bash
# SSH Commands
ssh alexandria      # Your Mac
ssh octavia         # AI Node 1 (Hailo-8)
ssh cecilia         # AI Node 2 (Hailo-8)
ssh alice           # Pi cluster
ssh lucidia         # Pi cluster
ssh aria            # Pi cluster (142 containers!)
ssh codex-infinity  # DigitalOcean
ssh shellfish       # DigitalOcean
```

## Documentation

- [Fleet Inventory](./FLEET.md) - Complete device specifications
- [Network Map](./NETWORK.md) - IPs, Tailscale, ports
- [SSH Config](./SSH_CONFIG.md) - SSH configuration reference
- [Hailo Setup](./HAILO.md) - AI accelerator documentation
