# BlackRoad Network Map

## IP Address Reference

### Local Network (192.168.4.0/24)

| Device | Local IP | MAC Address | Type |
|--------|----------|-------------|------|
| alexandria (Mac) | 192.168.4.28 | b0:be:83:66:cc:10 | Workstation |
| alice | 192.168.4.49 | d8:3a:dd:ff:98:87 | Pi 4 |
| lucidia | 192.168.4.38 | 2c:cf:67:cf:fa:17 | Pi 4 |
| aria | 192.168.4.82 | 88:a2:9e:d:42:7 | Pi 5 |
| octavia | 192.168.4.81 | 88:a2:9e:10:a:3a | Pi 5 |
| cecilia | 192.168.4.89 | 88:a2:9e:3b:eb:72 | Pi 5 |

### Tailscale Mesh (100.x.x.x)

| Device | Tailscale IP | Status |
|--------|--------------|--------|
| alexandria | 100.91.90.68 | Connected |
| alice | 100.77.210.18 | Connected |
| lucidia | 100.66.235.47 | Connected |
| aria | 100.109.14.17 | Connected |
| octavia | 100.83.149.86 | Connected |
| cecilia | 100.72.180.98 | Connected |
| shellfish | 100.94.33.37 | Connected |
| codex-infinity | 100.108.132.8 | Connected |

### Public IPs (Cloud)

| Device | Public IP | Provider | Region |
|--------|-----------|----------|--------|
| codex-infinity | 159.65.43.12 | DigitalOcean | NYC3 |
| shellfish | 174.138.44.45 | DigitalOcean | NYC1 |

## Network Diagram

```
                         INTERNET
                            │
            ┌───────────────┴───────────────┐
            │                               │
      ┌─────┴─────┐                   ┌─────┴─────┐
      │ shellfish │                   │  codex-   │
      │ (DO NYC1) │                   │ infinity  │
      │174.138.44.│                   │(DO NYC3)  │
      │    45     │                   │159.65.43. │
      └─────┬─────┘                   │    12     │
            │                         └─────┬─────┘
            │         TAILSCALE MESH        │
            └───────────────┬───────────────┘
                            │
                     ┌──────┴──────┐
                     │   ROUTER    │
                     │192.168.4.1  │
                     └──────┬──────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────┴────┐        ┌─────┴─────┐       ┌────┴────┐
   │alexandria│        │  Pi Rack  │       │Pironman │
   │  (Mac)   │        │           │       │  Rack   │
   │.28       │        │alice .49  │       │octavia  │
   └──────────┘        │lucidia.38 │       │  .81    │
                       │aria .82   │       │cecilia  │
                       └───────────┘       │  .89    │
                                           └─────────┘
```

## Port Assignments

| Port | Service | Device |
|------|---------|--------|
| 22 | SSH | All |
| 3000 | BlackRoad Deploy API | aria |
| 5000 | Control Center | alexandria |
| 8080 | Headscale | alice |

## DNS / Hostnames

All devices are accessible via:
1. **Local hostname**: `ssh alice`, `ssh octavia`, etc.
2. **Tailscale hostname**: `ssh alice-ts`, `ssh octavia-ts` (when remote)
3. **IP address**: Direct connection
