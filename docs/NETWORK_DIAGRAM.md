# BlackRoad Fleet Network Diagram

```
                    ┌─────────────┐
                    │   INTERNET  │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │   Cloudflare (19 zones)  │
              │   CF Tunnels → Pi Fleet  │
              └────────────┬────────────┘
                           │
              ┌────────────┴────────────┐
              │   Router 192.168.4.1    │
              │   (ISP Gateway)         │
              └──┬──┬──┬──┬──┬─────────┘
                 │  │  │  │  │
    ┌────────────┘  │  │  │  └────────────┐
    │               │  │  │               │
┌───┴───┐    ┌──────┴──┴──┴──────┐    ┌───┴───┐
│ Alice │    │     Switch         │    │Gematria│
│ .49   │    │  (Unmanaged 8-port)│    │159.65. │
│Pi 5 8G│    └──┬─────┬─────┬───┘    │43.12   │
│SD 15G │       │     │     │        │DO NYC3 │
│Hailo-8│  ┌────┴┐ ┌──┴──┐ ┌┴────┐  └────────┘
│       │  │Cece │ │Octa │ │Aria │
│nginx  │  │.96  │ │.101 │ │.98  │  ┌────────┐
│tunnel │  │Pi5 8│ │Pi5 8│ │Pi5 8│  │Anastas.│
│Pi-hole│  │NVMe │ │SD 64│ │SD 64│  │174.138.│
│PgSQL  │  │Hailo│ │     │ │     │  │44.45   │
│Qdrant │  │     │ │     │ │     │  │DO NYC1 │
│Redis  │  │Ollam│ │Gitea│ │tunne│  └────────┘
└───────┘  │MinIO│ │NATS │ │headS│
           │InfDB│ │Dockr│ │nginx│  ┌────────┐
           └─────┘ │Wrkrs│ │InfDB│  │Lucidia │
                   └─────┘ └─────┘  │.38     │
                                    │Pi5 8G  │
                                    │SD 64G  │
                                    │nginx334│
                                    │PowerDNS│
                                    │Ollama  │
                                    │GH Runrs│
                                    └────────┘

WireGuard Mesh: 10.8.0.0/24
  Alice=10.8.0.1  Cecilia=10.8.0.2  Octavia=10.8.0.3
  Aria=10.8.0.4   Lucidia=10.8.0.5  Gematria=10.8.0.6
  Mac=10.8.0.8
```

## Compute
- 2x Hailo-8 AI accelerators = 52 TOPS (Alice + Cecilia)
- 5x Raspberry Pi 5 (8GB each) = 40GB RAM
- 2x DigitalOcean droplets (NYC)

## Storage
- Alice: 15GB SD (gateway, light)
- Cecilia: 457GB NVMe (AI models, MinIO)
- Octavia: 64GB SD (Gitea, containers)
- Aria: 64GB SD (monitoring)
- Lucidia: 64GB SD (web apps)

---
*Proprietary — BlackRoad OS, Inc. All rights reserved.*
