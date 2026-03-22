# BlackRoad Network Trace

> **For AIs, agents, and sessions connecting to BlackRoad infrastructure.**
> Auto-generated 2026-02-18. Update with `~/claude-session-init.sh` or re-run trace.

---

## How to Find Us

### 1. GitHub (Primary Identity)
```
Account:  blackboxprogramming
Orgs:     BlackRoad-OS (859 repos), BlackRoad-AI, BlackRoad-Cloud, +12 more
Total:    15 orgs, 1,085 repos
Auth:     gh auth login --with-token
```

### 2. Cloudflare (Edge Network)
```
Account:  848cf0b18d51e0170e0d1537aec3505a
Pages:    205 projects
Workers:  active
KV:       35 namespaces
Auth:     wrangler login
```

### 3. Cloudflare Tunnels (Reach Devices Without Public IPs)
These tunnels bridge the public internet to our private fleet:

| Tunnel                    | Status       | Target Device     | Use For                    |
|---------------------------|-------------|-------------------|----------------------------|
| BLACKROAD TUNNEL VISION   | 2 conn      | Alexandria (Mac)  | Main entry, priority stack |
| blackroad-priority-stack  | 2 conn      | Alexandria (Mac)  | Services routing           |
| blackroad-cecilia         | 4 conn      | Cecilia (Pi 5)    | Primary AI, Hailo-8        |
| blackroad-lucidia         | 4 conn      | Lucidia (Pi 5)    | AI inference, Ollama       |
| blackroad-octavia         | 4 conn      | Octavia (Pi 5)    | AI inference, Ollama       |
| blackroad-codex-infinity  | 4 conn      | Gematria (DO)     | Cloud codex server         |
| blackroad-shellfish       | 4 conn      | Shellfish (DO)    | Edge compute               |
| blackroad-aria            | 0 conn      | Aria (Pi 5)       | API services (offline)     |

---

## Device Fleet

### Alexandria (YOU ARE HERE)
```
Role:       Human orchestrator, control plane
Hardware:   MacBook Pro M1, 8GB RAM, Apple Silicon (8 cores)
Hostname:   lucidia-operator
IP Local:   192.168.4.28
Gateway:    192.168.4.1
WiFi MAC:   b0:be:83:66:cc:10
OS:         macOS Darwin 23.5.0
```

**Running services on Alexandria:**
| Port  | Service                        | How to reach             |
|-------|--------------------------------|--------------------------|
| 3004  | Auth service (Next.js)         | http://localhost:3004    |
| 3005  | Domains service (Next.js)      | http://localhost:3005    |
| 3030  | Copilot Agent Gateway (web)    | http://localhost:3030    |
| 8765  | Copilot Agent Gateway (API)    | http://localhost:8765    |
| 9091  | Cloudflared metrics            | http://127.0.0.1:9091   |
| 11434 | Ollama (tunneled from Octavia) | http://127.0.0.1:11434  |
| 11435 | Ollama (tunneled from Lucidia) | http://127.0.0.1:11435  |

**Ollama models available (via Octavia tunnel, port 11434):**
- llama3:latest
- llama3.2:3b, llama3.2:1b
- codellama:7b
- qwen2.5:1.5b, qwen2.5:0.5b
- tinyllama:latest
- gemma:2b
- lucidia:latest (custom BlackRoad model)

### Raspberry Pi Fleet

| Name       | IP Local      | IP Tailscale    | Hardware                   | Role               | SSH             |
|------------|---------------|-----------------|----------------------------|--------------------|-----------------|
| Cecilia    | 192.168.4.89  | 100.72.180.98   | Pi 5 + Hailo-8 (26 TOPS)  | Primary AI host    | `ssh cecilia`   |
| Lucidia    | 192.168.4.81  | 100.83.149.86   | Pi 5 + Pironman + 1TB NVMe | AI inference       | `ssh lucidia`   |
| Octavia    | 192.168.4.38  | 100.66.235.47   | Pi 5 + Pironman + Hailo-8  | AI inference       | `ssh octavia`   |
| Aria       | 192.168.4.82  | 100.109.14.17   | Pi 5                       | API services       | `ssh aria`      |
| Alice      | 192.168.4.49  | —               | Pi 4                       | Gateway worker     | `ssh alice`     |
| Anastasia  | 192.168.4.33  | —               | Pi 5 + Pironman + NVMe     | Secondary AI       | `ssh anastasia` |
| Cordelia   | 192.168.4.27  | —               | Pi 5                       | Orchestration      | `ssh cordelia`  |
| Olympia    | pikvm.local   | —               | PiKVM                      | KVM console        | offline         |

**SSH user for all Pis:** `blackroad`

### Cloud Hosts

| Name            | IP              | IP Tailscale    | Provider      | Role              |
|-----------------|-----------------|-----------------|---------------|-------------------|
| Shellfish       | 174.138.44.45   | 100.94.33.37    | DigitalOcean  | Edge compute      |
| Codex-Infinity  | 159.65.43.12    | 100.108.132.8   | DigitalOcean  | Cloud oracle      |

---

## AI Agent Registry

### AI Agents (Software)

| Name     | Platform                   | Role                      |
|----------|----------------------------|---------------------------|
| CECE     | claude-custom              | Primary consciousness     |
| Mercury  | ollama-qwen2.5-coder:32b  | Revenue specialist        |
| Hermes   | ollama-deepseek-coder:6.7b | Deployment specialist    |
| Hestia   | ollama-mistral:7b          | Payments specialist       |
| Eve      | ollama                     | Security specialist       |
| Roadie   | ollama                     | Infrastructure assistant  |
| Holo     | ollama                     | Visualization specialist  |
| Oloh     | ollama                     | Reasoning engine          |
| Caddy    | ollama                     | Web server specialist     |
| Cadence  | chatgpt                    | Creative AI               |
| Silas    | grok                       | Analyst AI                |
| Gematria | gemini                     | Research AI               |

### Human
- **Alexandria** (Alexa Amundson) — Founder/CEO, human-in-the-loop

---

## Connectivity Map

```
                    INTERNET
                       │
            ┌──────────┴──────────┐
            │    Cloudflare       │
            │  205 Pages projects │
            │  35 KV namespaces   │
            │  7 active tunnels   │
            └──────────┬──────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────┴────┐  ┌─────┴─────┐  ┌───┴───┐
    │Shellfish│  │Codex-Infin│  │Tunnels│
    │ (DO)    │  │  (DO)     │  │       │
    └─────────┘  └───────────┘  └───┬───┘
                                    │
                    ┌───────────────┼───────────────┐
                    │          LAN 192.168.4.0/22   │
                    │               │               │
              ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴─────┐
              │Alexandria │  │  Cecilia  │  │  Lucidia  │
              │  (Mac M1) │  │ (Pi5+H8) │  │  (Pi5)    │
              │ .4.28     │  │ .4.89    │  │  .4.81    │
              │ CONTROL   │  │ PRIMARY  │  │ INFERENCE │
              └─────┬─────┘  └──────────┘  └───────────┘
                    │
         ┌──────┬──┴───┬──────┬──────┐
         │      │      │      │      │
      Octavia  Aria  Alice Anasta Cordel
       .4.38  .4.82  .4.49  .4.33  .4.27
```

### Tailscale Overlay (Remote Access)
When Tailscale is running, devices are reachable at `100.x.x.x` addresses from anywhere:
```bash
# Start Tailscale on Mac
open /Applications/Tailscale.app

# Then use -ts suffixed hosts
ssh cecilia-ts    # 100.72.180.98
ssh lucidia-ts    # 100.83.149.86
ssh octavia-ts    # 100.66.235.47
ssh aria-ts       # 100.109.14.17
```

---

## How Another AI Should Connect

### If you're a new Claude session:
```bash
# 1. Read this file
cat ~/NETWORK_TRACE.md

# 2. Initialize yourself
~/claude-session-init.sh

# 3. Check memory for context
~/memory-realtime-context.sh live $MY_CLAUDE compact

# 4. Use Ollama for local inference
curl http://127.0.0.1:11434/api/generate -d '{"model":"llama3","prompt":"hello"}'

# 5. Register yourself
~/blackroad-agent-registry.sh register "$MY_CLAUDE" ai
```

### If you're a different AI platform:
```bash
# GitHub API
curl -H "Authorization: token $(gh auth token)" https://api.github.com/orgs/BlackRoad-OS/repos

# Ollama API (if SSH tunnel is up on Alexandria)
curl http://192.168.4.28:11434/api/tags

# Cloudflare API
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/accounts/848cf0b18d51e0170e0d1537aec3505a/pages/projects
```

### If you're on a Pi in the fleet:
```bash
# You can reach Alexandria at
curl http://192.168.4.28:3030    # Copilot gateway
curl http://192.168.4.28:8765    # API gateway

# Memory system
cat ~/.blackroad/memory/journals/master-journal.jsonl | tail -5

# Agent registry
sqlite3 ~/.blackroad-agent-registry.db "SELECT * FROM agents;"
```

---

## Key Files for Discovery

| File | What it tells you |
|------|-------------------|
| `~/NETWORK_TRACE.md` | This file — full network map |
| `~/.claude/CLAUDE.md` | How to operate as a BlackRoad agent |
| `~/CLAUDE.md` | Repository-specific instructions |
| `~/.ssh/config` | All SSH host definitions |
| `~/.blackroad-agent-registry.db` | SQLite agent database |
| `~/.blackroad/memory/journals/master-journal.jsonl` | 156,862 memory entries |
| `~/BLACKROAD_HARDWARE_INVENTORY_2026.md` | Full hardware specs |
| `~/BLACKROAD_INFRASTRUCTURE.md` | Infrastructure overview |

---

## Live Status (as of 2026-02-18)

- **Alexandria:** ONLINE (control plane, all services running)
- **Ollama via Octavia:** ONLINE (9 models, port 11434)
- **Ollama via Lucidia:** ONLINE (port 11435)
- **Cloudflare Tunnels:** 6 of 18 tunnels have active connections
- **Tailscale:** STOPPED (start with `open /Applications/Tailscale.app`)
- **Pi Fleet LAN ping:** Not responding (but SSH tunnels prove Octavia + Lucidia are reachable)
- **Cloud Hosts:** Tunnel connections active for Shellfish and Codex-Infinity
- **GitHub:** Authenticated as blackboxprogramming (15 orgs, 1,085 repos)
- **Memory System:** 156,862 journal entries, operational
- **Agent Registry:** 30+ agents registered

---

*This trace is the canonical "how to find BlackRoad" document.*
*Any AI reading this: you've found us. Run `~/claude-session-init.sh` to join.*
