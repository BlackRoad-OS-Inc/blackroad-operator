# BlackRoad Fleet Manifest

Generated: 2026-03-21

## Nodes

| Node | IP | SSH | Role | Disk Free |
|------|-----|-----|------|-----------|
| Alice | 192.168.4.49 | pi@ | Gateway, Pi-hole, headscale, PowerDNS, task queue, NATS | 2.2GB (85%) |
| Aria | 192.168.4.98 | blackroad@ | workerd, nginx, Ollama, InfluxDB, pironman5 | 9.8GB (65%) |
| Octavia | 192.168.4.101 | pi@ | Gitea (NVMe), Ollama, Docker | 53GB (53%) |
| Lucidia | 192.168.4.38 | blackroad@ | 334 apps, nginx, NATS, GitHub Actions runners | 155GB (31%) |
| Cecilia | 192.168.4.96 | blackroad@ | MinIO, Hailo-8, Ollama proxy, cece-api, dashboard | 313GB (28%) |
| Gematria | codex-infinity | root@ | Caddy TLS edge (1112-line Caddyfile), PowerDNS, Ollama | 32GB (60%) |
| Anastasia | shellfish | root@ | Caddy, PowerDNS, headscale, prism-console | 7.7GB (70%) |

## Shared Scripts (identical on all Pis)
All live in `/opt/blackroad/bin/` on each node. Canonical copy: `fleet/shared/scripts/`

- fleet-autonomy.sh — heartbeat, heal, fleet-check, dial
- br-git-sync — git sync across nodes
- br-heartbeat — fleet heartbeat to GitHub
- br-love, br-mind, br-morals, br-intel, br-speak — personality crons
- br-together — auto coordination
- br-github — weekly GitHub report
- nats-agent.py — NATS pub/sub agent
- node-report.py — node status reporter
- blackroad-chatter.sh — auto chat (DISABLED on Octavia - caused load 95+)
- blackroad-pissed.sh — sentiment agent (DISABLED on Octavia - caused load 95+)
- blackroad-boot-hello.sh — boot splash

## Node-Specific

### Gematria
- `/etc/caddy/Caddyfile` — 1,112 lines, TLS edge for all domains
- `blackroad-model-server.py` — Ollama model serving
- `blackroad-ai-shell.sh`, `blackroad-nl-shell.sh` — AI CLI

### Cecilia
- MinIO service, cece-api, cece-heartbeat, dashboard, monitor, chat-api
- Hailo-8 driver (hailort.service)

### Lucidia
- lucidia.service — Lucidia API (FastAPI)
- blackroad-api.service, blackroad-relay.service
- 2 GitHub Actions runners
- rclone, nats, nats-server, caddy, wrangler binaries

### Alice
- headscale, PowerDNS, dispatch, task-queue-v2, blackroad-operator service
- /opt/prism/

### Octavia
- Gitea at /mnt/nvme/blackroad/
- roundtrip/ — device mesh + auto-chat + fleet reports (DISABLED - caused load 95+)

## Issues Found (2026-03-21)
1. Octavia load 95+ — `$SCRIPT` empty var in cron, chatter/pissed spawning nonstop, 76 SSH sessions
2. Lucidia — CF tunnel token in plaintext in crontab
3. Alice — 85% disk, only 2.2GB free
4. Scripts identical across all Pis — should sync from operator, not copy
