# BlackRoad Edge — Be Your Own Cloudflare

Self-hosted edge platform running on the Pi fleet. Serves sites, runs Workers,
resolves DNS, caches assets, balances load. Zero cloud dependency.

## Architecture

```
Internet → Cloudflare Tunnel (TLS termination)
    ↓
Alice (192.168.4.49) — Edge Router
├── nginx reverse proxy (48+ domains)
├── Pi-hole DNS (ad-blocking + local zones)
├── Qdrant vector DB
└── Static file CDN (/var/www)
    ↓ (routes to fleet)
├── Cecilia — AI inference + MinIO object storage
├── Octavia — NATS + Gitea + workerd Workers runtime
├── Aria — Portainer + Headscale
└── Lucidia — PowerDNS + web apps + GitHub Actions
```

## Components

| Component           | Service   | Node    | Port   |
| ------------------- | --------- | ------- | ------ |
| Edge Router         | nginx     | Alice   | 80/443 |
| DNS (authoritative) | PowerDNS  | Lucidia | 53     |
| DNS (ad-blocking)   | Pi-hole   | Alice   | 53     |
| Object Storage      | MinIO     | Cecilia | 9000   |
| Workers Runtime     | workerd   | Octavia | 8787   |
| Message Bus         | NATS      | Octavia | 4222   |
| Vector DB           | Qdrant    | Alice   | 6333   |
| Container Mgmt      | Portainer | Aria    | 9443   |
| VPN Mesh            | Headscale | Aria    | 443    |
| Git Hosting         | Gitea     | Octavia | 3100   |
| AI Gateway          | ai-router | Cecilia | 7000   |

## Self-Hosting Capability

What Cloudflare does → What we run instead:

- **Pages** → nginx + static files on Alice/Lucidia
- **Workers** → workerd on Octavia (V8 isolates)
- **R2** → MinIO on Cecilia (S3-compatible)
- **D1** → SQLite on any node
- **KV** → NATS JetStream KV on Octavia
- **DNS** → PowerDNS on Lucidia
- **Tunnels** → WireGuard mesh + Headscale on Aria
- **CDN** → nginx caching + RoadNet WiFi mesh

BlackRoad OS — Pave Tomorrow.
