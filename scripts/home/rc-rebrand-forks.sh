#!/usr/bin/env bash
ORG="BlackRoad-OS-Inc"

push_readme() {
  local repo="$1" content="$2" msg="$3"
  local encoded sha
  encoded=$(printf '%s' "$content" | base64)
  sha=$(gh api "repos/$ORG/$repo/contents/README.md" --jq '.sha' 2>/dev/null || echo "")
  if [ -n "$sha" ] && [ "$sha" != "null" ]; then
    gh api -X PUT "repos/$ORG/$repo/contents/README.md" \
      -f message="$msg" -f content="$encoded" -f sha="$sha" --silent 2>/dev/null
  else
    gh api -X PUT "repos/$ORG/$repo/contents/README.md" \
      -f message="$msg" -f content="$encoded" --silent 2>/dev/null
  fi
}

echo "Rebranding all Road Fleet forks..."

# === PASSENGER (Ollama → Sovereign AI Inference) ===
echo "=== passenger (Ollama) ==="
push_readme "passenger" "# Passenger — BlackRoad Road Fleet

> **Sovereign AI inference engine.** Fork of [Ollama](https://github.com/ollama/ollama).

---

**Passenger** is BlackRoad's sovereign fork of Ollama — local-first AI inference running on your hardware. No API keys, no cloud dependency, no data leaving your network.

## What's Different

- **BlackRoad fleet integration** — auto-discovers nodes via NATS, routes to fastest GPU
- **Compressed system prompts** — 86 lines → 8 lines = 3x fewer prompt tokens
- **Road Fleet identity** — every model speaks as a BlackRoad Roadie
- **Hailo-8 awareness** — 52 TOPS across 2 accelerators (Cecilia + Octavia)
- **Fleet routing** — round-robin with failover across Alice, Cecilia, Octavia, Lucidia

## Fleet Deployment

\`\`\`bash
# On any Pi node
curl -fsSL https://ollama.com/install.sh | sh
ollama pull tinyllama:latest
ollama pull llama3.2:1b
ollama pull phi3:mini

# BlackRoad custom models
ollama create blackroad-road -f Modelfile.blackroad
\`\`\`

## Current Fleet Status

| Node | IP | Models | TOPS | RAM |
|------|----|--------|------|-----|
| Alice | 192.168.4.49 | tinyllama, llama3.2 | CPU | 8GB |
| Cecilia | 192.168.4.96 | 16 models | 26 (Hailo) | 8GB |
| Octavia | 192.168.4.101 | 227 models | 26 (Hailo) | 8GB |
| Lucidia | 192.168.4.38 | tinyllama | CPU | 8GB |
| Gematria | 159.65.43.12 | 6 models | CPU | 4GB |

## Configuration

\`\`\`bash
# Environment
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_MODELS=/usr/share/ollama/.ollama/models
OLLAMA_NUM_PARALLEL=2
OLLAMA_MAX_LOADED_MODELS=2
\`\`\`

## Upstream

Forked from [ollama/ollama](https://github.com/ollama/ollama) (MIT License upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
" "Rebrand Passenger — BlackRoad sovereign AI inference fork

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Done" || echo "  FAILED"

# === BACKROAD (Portainer → Container Management) ===
echo "=== backroad (Portainer) ==="
push_readme "backroad" "# BackRoad — BlackRoad Road Fleet

> **Sovereign container management.** Fork of [Portainer](https://github.com/portainer/portainer).

---

**BackRoad** is BlackRoad's sovereign fork of Portainer — manage Docker containers, stacks, and services across the entire Pi fleet from one dashboard.

## What's Different

- **Fleet-wide view** — see all containers across Alice, Cecilia, Octavia, Aria, Lucidia
- **BlackRoad branding** — hot pink (#FF1D6C) theme, Road Fleet identity
- **Pre-configured stacks** — Ollama, NATS, MinIO, Qdrant, Redis one-click deploy
- **Sovereign-first** — no Portainer Cloud, no telemetry, no external dependencies

## Quick Start

\`\`\`bash
docker run -d -p 9443:9443 --name backroad \\
  --restart=always \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v backroad_data:/data \\
  blackroad/backroad:latest
\`\`\`

## Fleet Endpoints

| Node | Docker | BackRoad UI |
|------|--------|-------------|
| Octavia | :2375 | :9443 |
| Alice | :2375 | — |
| Cecilia | :2375 | — |

## Upstream

Forked from [portainer/portainer](https://github.com/portainer/portainer) (zlib License upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
" "Rebrand BackRoad — BlackRoad sovereign container management fork

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Done" || echo "  FAILED"

# === CURB (MinIO → Object Storage) ===
echo "=== curb (MinIO) ==="
push_readme "curb" "# Curb — BlackRoad Road Fleet

> **Sovereign object storage.** Fork of [MinIO](https://github.com/minio/minio).

---

**Curb** is BlackRoad's sovereign fork of MinIO — S3-compatible object storage running on Pi hardware. CDN, backups, assets, and media — all self-hosted.

## What's Different

- **Pi-optimized** — tuned for ARM64, 8GB RAM, SD/USB storage
- **Fleet CDN** — serves images.blackroad.io, cdn.blackroad.io
- **4 buckets** — blackroad-assets, blackroad-backups, blackroad-media, blackroad-uploads
- **R2 replacement** — migrating from Cloudflare R2 to self-hosted Curb

## Deployment

\`\`\`bash
# On Cecilia (primary storage node)
minio server /data --address :9000 --console-address :9001
\`\`\`

## Current Storage

| Bucket | Size | Contents |
|--------|------|----------|
| blackroad-assets | 120MB | Pixel art, logos, brand kit |
| blackroad-backups | 2GB+ | Pi fleet backups |
| blackroad-media | 500MB | Videos, audio, images |
| blackroad-uploads | 100MB | User uploads |

## Fleet Access

- **S3 API**: \`http://cecilia:9000\`
- **Console**: \`http://cecilia:9001\`
- **CDN**: \`https://images.blackroad.io\` → Gematria → WireGuard → Cecilia

## Upstream

Forked from [minio/minio](https://github.com/minio/minio) (AGPL v3 upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
" "Rebrand Curb — BlackRoad sovereign object storage fork

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Done" || echo "  FAILED"

# === CARPOOL (NATS → Messaging) ===
echo "=== carpool (NATS) ==="
push_readme "carpool" "# CarPool — BlackRoad Road Fleet

> **Sovereign messaging and pub/sub.** Fork of [NATS](https://github.com/nats-io/nats-server).

---

**CarPool** is BlackRoad's sovereign fork of NATS — real-time messaging, pub/sub events, and inter-node communication across the entire fleet.

## What's Different

- **Fleet mesh** — 4/5 nodes connected via NATS cluster
- **Agent events** — deploy notifications, health alerts, task dispatch
- **BlackRoad topics** — \`blackroad.deploy.*\`, \`blackroad.health.*\`, \`blackroad.agents.*\`
- **RoundTrip integration** — agent chat events flow through NATS

## Deployment

\`\`\`bash
# On Octavia (NATS hub)
nats-server -c /etc/nats/nats.conf
# Port: 4222 (client), 6222 (cluster), 8222 (monitoring)
\`\`\`

## Fleet Topology

\`\`\`
Octavia (:4222) ← hub
  ├── Alice (:4222)
  ├── Cecilia (:4222)
  ├── Lucidia (:4222)
  └── Gematria (:4222)
\`\`\`

## Topics

| Topic Pattern | Purpose |
|--------------|---------|
| \`blackroad.deploy.>\` | Deployment events |
| \`blackroad.health.>\` | Node health checks |
| \`blackroad.agents.>\` | Agent communication |
| \`blackroad.chat.>\` | RoundTrip messages |
| \`blackroad.memory.>\` | Memory system events |

## Upstream

Forked from [nats-io/nats-server](https://github.com/nats-io/nats-server) (Apache 2.0 upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
" "Rebrand CarPool — BlackRoad sovereign messaging fork

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Done" || echo "  FAILED"

# === ROUNDABOUT (Headscale → VPN Coordination) ===
echo "=== roundabout (Headscale) ==="
push_readme "roundabout" "# RoundAbout — BlackRoad Road Fleet

> **Sovereign VPN coordination.** Fork of [Headscale](https://github.com/juanfont/headscale).

---

**RoundAbout** is BlackRoad's sovereign fork of Headscale — self-hosted WireGuard coordination replacing Tailscale's control plane. Manage the mesh from your own hardware.

## What's Different

- **Fleet mesh management** — coordinate WireGuard across all 7 nodes
- **No Tailscale dependency** — fully self-hosted control plane
- **ACL policies** — BlackRoad fleet access rules
- **Node discovery** — automatic peer configuration

## Fleet Mesh

| Node | WireGuard IP | Role |
|------|-------------|------|
| Gematria | 10.0.0.1 | Hub |
| Anastasia | 10.0.0.2 | Hub |
| Alice | 10.0.0.3 | Pi |
| Cecilia | 10.0.0.4 | Pi |
| Octavia | 10.0.0.5 | Pi |
| Aria | 10.0.0.6 | Pi |
| Lucidia | 10.0.0.7 | Pi |

## Upstream

Forked from [juanfont/headscale](https://github.com/juanfont/headscale) (BSD 3-Clause upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
" "Rebrand RoundAbout — BlackRoad sovereign VPN coordination fork

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Done" || echo "  FAILED"

# === ONEWAY (Caddy → TLS Edge) ===
echo "=== oneway (Caddy) ==="
push_readme "oneway" "# OneWay — BlackRoad Road Fleet

> **Sovereign TLS edge and reverse proxy.** Fork of [Caddy](https://github.com/caddyserver/caddy).

---

**OneWay** is BlackRoad's sovereign fork of Caddy — automatic HTTPS, reverse proxy, and edge routing for 151 domains from Gematria.

## What's Different

- **151 domains** — auto-TLS via Let's Encrypt for every BlackRoad domain
- **WireGuard routing** — Gematria edge → WireGuard tunnel → Pi fleet
- **Zero-config HTTPS** — automatic certificate provisioning and renewal
- **1,553 subdomains** — all proxied through OneWay on Gematria

## Deployment

\`\`\`bash
# On Gematria (edge server)
caddy run --config /etc/caddy/Caddyfile
\`\`\`

## Architecture

\`\`\`
Internet → Gematria (OneWay/Caddy) → WireGuard → Pi Fleet
              ↓ TLS termination
              ↓ Auto Let's Encrypt
              ↓ Reverse proxy to nodes
\`\`\`

## Key Routes

| Domain Pattern | Target |
|---------------|--------|
| \`*.blackroad.io\` | Various Pi services |
| \`*.blackroadai.com\` | AI inference nodes |
| \`*.blackroad.network\` | Infrastructure services |
| \`git.blackroad.io\` | Octavia :3100 (Gitea) |
| \`roundtrip.blackroad.io\` | Alice :8094 |

## Upstream

Forked from [caddyserver/caddy](https://github.com/caddyserver/caddy) (Apache 2.0 upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
" "Rebrand OneWay — BlackRoad sovereign TLS edge fork

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Done" || echo "  FAILED"

# === PITSTOP (Pi-hole → DNS Filtering) ===
echo "=== pitstop (Pi-hole) ==="
push_readme "pitstop" "# PitStop — BlackRoad Road Fleet

> **Sovereign DNS filtering and ad blocking.** Fork of [Pi-hole](https://github.com/pi-hole/pi-hole).

---

**PitStop** is BlackRoad's sovereign fork of Pi-hole — network-wide DNS filtering, ad blocking, and query logging on Alice (the gateway node).

## What's Different

- **Fleet DNS hub** — all Pi fleet DNS queries route through Alice
- **120+ blocked domains** — curated blocklist for the network
- **BlackRoad dashboard** — branded admin UI
- **Query logging** — full DNS audit trail

## Deployment

\`\`\`bash
# On Alice (gateway node)
# PitStop runs as pihole-FTL on ports 53 (DNS) and 443 (admin)
pihole status
pihole -c  # chronometer
\`\`\`

## Stats

- **DNS Server**: Alice (192.168.4.49:53)
- **Admin Panel**: https://alice:443/admin
- **Blocked**: 120+ domains
- **Queries/day**: ~10K

## Upstream

Forked from [pi-hole/pi-hole](https://github.com/pi-hole/pi-hole) (EUPL upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
" "Rebrand PitStop — BlackRoad sovereign DNS filtering fork

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Done" || echo "  FAILED"

# === TOLLBOOTH (WireGuard → VPN Mesh) ===
echo "=== tollbooth (WireGuard) ==="
push_readme "tollbooth" "# TollBooth — BlackRoad Road Fleet

> **Sovereign VPN mesh.** Fork of [WireGuard](https://www.wireguard.com/).

---

**TollBooth** is BlackRoad's sovereign fork of WireGuard tools — encrypted tunnel mesh connecting all 7 nodes across local network and cloud.

## What's Different

- **12/12 SSH connections** — full mesh verified
- **Hub-spoke topology** — Gematria + Anastasia as hubs
- **Auto-config** — pre-built configs for every node
- **BlackRoad mesh** — Internet → Gematria → WireGuard → Pi fleet

## Mesh Map

\`\`\`
Internet
    ↓
Gematria (159.65.43.12) ←→ Anastasia (174.138.44.45)
    ↓ WireGuard               ↓ WireGuard
    ├── Alice (10.0.0.3)      ├── Alice
    ├── Cecilia (10.0.0.4)    ├── Cecilia
    ├── Octavia (10.0.0.5)    ├── Octavia
    ├── Aria (10.0.0.6)       ├── Aria
    └── Lucidia (10.0.0.7)    └── Lucidia
\`\`\`

## Configuration

\`\`\`bash
# Each node has /etc/wireguard/wg0.conf
wg-quick up wg0
wg show    # verify peers
\`\`\`

## Upstream

Forked from [WireGuard/wireguard-tools](https://git.zx2c4.com/wireguard-tools) (GPL v2 upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
" "Rebrand TollBooth — BlackRoad sovereign VPN mesh fork

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Done" || echo "  FAILED"

# === REARVIEW (Qdrant → Vector DB) ===
echo "=== rearview (Qdrant) ==="
push_readme "rearview" "# RearView — BlackRoad Road Fleet

> **Sovereign vector database.** Fork of [Qdrant](https://github.com/qdrant/qdrant).

---

**RearView** is BlackRoad's sovereign fork of Qdrant — vector similarity search powering RAG, semantic search, and AI memory across the fleet.

## What's Different

- **RAG pipeline** — nomic-embed-text embeddings, academic citations, moral context
- **Memory system** — 36MB ledger indexed for semantic retrieval
- **BlackRoad search** — powers search.blackroad.io semantic queries
- **Fleet-local** — runs on Alice, no cloud vector DB dependency

## Deployment

\`\`\`bash
# On Alice
# Qdrant runs on ports 6333 (HTTP) and 6334 (gRPC)
curl http://localhost:6333/collections
\`\`\`

## Collections

| Collection | Vectors | Use |
|-----------|---------|-----|
| blackroad-docs | ~10K | Documentation search |
| blackroad-memory | ~50K | Memory/journal semantic search |
| blackroad-code | ~20K | Code search across 574 repos |

## Upstream

Forked from [qdrant/qdrant](https://github.com/qdrant/qdrant) (Apache 2.0 upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
" "Rebrand RearView — BlackRoad sovereign vector database fork

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Done" || echo "  FAILED"

# === ROADMAP (Grafana → Monitoring) ===
echo "=== roadmap (Grafana) ==="
push_readme "roadmap" "# RoadMap — BlackRoad Road Fleet

> **Sovereign monitoring and observability.** Fork of [Grafana](https://github.com/grafana/grafana).

---

**RoadMap** is BlackRoad's sovereign fork of Grafana — dashboards, alerts, and fleet monitoring. See every node, every service, every metric.

## What's Different

- **Fleet dashboards** — pre-built boards for all 7 nodes
- **BlackRoad theme** — hot pink (#FF1D6C) branded UI
- **Pi metrics** — CPU, RAM, disk, temperature, voltage, network
- **Service health** — Ollama, NATS, MinIO, Qdrant, Redis, PostgreSQL
- **AI metrics** — inference latency, model load times, TOPS utilization

## Deployment

\`\`\`bash
# On Alice
# Grafana runs on port 3000
# Access: http://alice:3000 or https://dash.blackroad.io
\`\`\`

## Dashboards

| Dashboard | Panels | Description |
|-----------|--------|-------------|
| Fleet Overview | 12 | All nodes at a glance |
| Node Detail | 8 | Per-node deep metrics |
| AI Inference | 6 | Ollama performance |
| Network | 8 | WireGuard, DNS, bandwidth |
| Storage | 6 | MinIO, disk, backups |

## Upstream

Forked from [grafana/grafana](https://github.com/grafana/grafana) (AGPL v3 upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
" "Rebrand RoadMap — BlackRoad sovereign monitoring fork

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Done" || echo "  FAILED"

echo ""
echo "All Road Fleet forks rebranded!"
