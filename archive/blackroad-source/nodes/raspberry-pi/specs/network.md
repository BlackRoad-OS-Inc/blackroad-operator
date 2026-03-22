# BlackRoad Hardware Network Map

```
Internet
    │
    ▼
Cloudflare Edge ──── Tunnel (QUIC) ──► blackroad-pi (192.168.4.64)
                                           │
                                     Local Network (192.168.4.0/24)
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
              aria64                     alice               lucidia
           (192.168.4.38)           (192.168.4.49)       (192.168.4.99)
           22,500 agents             Tertiary node        Alternate Pi
```

## Network Details

| Device | IP | Role | Open Ports |
|--------|-----|------|------------|
| blackroad-pi | 192.168.4.64 | Primary + Tunnel | 22, 8787, 11434 |
| aria64 | 192.168.4.38 | AI compute | 22, 11434 |
| alice | 192.168.4.49 | Tertiary | 22 |
| lucidia | 192.168.4.99 | Alternate | 22 |
| cloud | 159.65.43.12 | Failover | 22, 80, 443 |

## SSH Access
```bash
ssh pi@192.168.4.64   # blackroad-pi (primary)
ssh pi@192.168.4.38   # aria64 (AI compute)
ssh alice@192.168.4.49 # alice
ssh lucidia@192.168.4.99 # lucidia
```
