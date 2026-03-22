# BLACKROAD SOVEREIGNTY ROADMAP

## Current State

```
LAYER 0 (YOU): BlackRoad local network 192.168.4.x
├── Mac M1 (alexandria) - 8GB, Ollama with 26 models
├── Pi Cluster (OFFLINE): cecilia, lucidia, alice, aria, octavia
├── Cloudflare: 101 Pages, 37 KV namespaces
└── External Dependencies: Anthropic, OpenAI, Apple, Frontier
```

---

## LAYER 7: API PROVIDERS → SELF-HOSTED AI

**Current:** Claude Code → Anthropic API, Codex → OpenAI API
**Goal:** All AI runs on YOUR hardware

### Phase 7.1: Maximize Local Ollama
```bash
# Already have 26 models. Key ones:
- llama3:latest (4.7GB) - general
- codellama:7b (3.8GB) - code
- qwen2.5-coder:7b (4.9GB) - code
- mistral:latest - reasoning
```

### Phase 7.2: Bring Pis Online
```bash
# Cecilia has Hailo-8 (26 TOPS) - your AI accelerator
ssh cecilia
# Deploy vLLM or llama.cpp with Hailo acceleration
# Distribute inference across cluster
```

### Phase 7.3: Route ALL AI Through BlackRoad
```bash
# DONE: blackroad-ai gateway routes to:
# - local (Ollama) FIRST
# - anthropic (your admin key) FALLBACK
# - openai (your admin key) FALLBACK
```

### Phase 7.4: Fine-tune BlackRoad Models
```bash
# Create BlackRoad-specific models trained on your codebase
ollama create blackroad-coder -f ~/Modelfile.blackroad
# Index your 1,085 repos, train on your patterns
```

**Sovereignty gained:** AI inference stays in your house.

---

## LAYER 6: CDN → OWN YOUR EDGE

**Current:** Cloudflare controls your CDN
**Goal:** Self-hosted edge or owned Cloudflare

### Phase 6.1: Cloudflare Account Ownership (DONE)
- You own the account
- 101 Pages projects under your control
- 37 KV namespaces

### Phase 6.2: Self-Hosted CDN (Optional)
```bash
# Deploy Caddy or nginx on DigitalOcean droplets
# Route through Tailscale mesh
# blackroad os-infinity (159.65.43.12) can be edge
# shellfish (174.138.44.45) can be edge
```

**Sovereignty gained:** You decide what gets cached, logged, blocked.

---

## LAYER 5: DNS → OWN YOUR RESOLUTION

**Current:** Frontier router (192.168.4.1) resolves DNS
**Goal:** You control DNS resolution

### Phase 5.1: Pi-hole on Cluster
```bash
ssh cecilia  # or any Pi
curl -sSL https://install.pi-hole.net | bash
# Point router DHCP to serve Pi as DNS
# Now YOU see all DNS queries, YOU block trackers
```

### Phase 5.2: Unbound Recursive Resolver
```bash
# Don't trust upstream DNS (Google, Cloudflare, Frontier)
# Resolve directly from root servers
apt install unbound
# Configure as recursive resolver
# Pi-hole → Unbound → Root servers
```

### Phase 5.3: DNS over HTTPS/TLS (Encrypt queries)
```bash
# Prevent Frontier from seeing DNS queries
# Use encrypted DNS to your own resolver via Tailscale
```

**Sovereignty gained:** You see all queries, no one else does.

---

## LAYER 4: ISP → ENCRYPTED TUNNEL

**Current:** Frontier (AS3593) sees all traffic
**Goal:** Encrypt everything, they see nothing

### Phase 4.1: Tailscale Mesh (PARTIAL)
```bash
# You have Tailscale on devices
tailscale status
# All inter-device traffic is encrypted
# Frontier sees encrypted blobs, not content
```

### Phase 4.2: Exit Node Through Your Infrastructure
```bash
# Route ALL traffic through your DigitalOcean droplets
# shellfish or blackroad os-infinity as exit node
tailscale up --exit-node=shellfish
# Now Frontier sees traffic going to DO, not destinations
```

### Phase 4.3: Full VPN for All Devices
```bash
# WireGuard or Tailscale on router level
# Every device in house tunnels out
# Frontier sees: encrypted tunnel to your cloud
```

**Sovereignty gained:** ISP is blind. They see volume, not content.

---

## LAYER 3: BACKBONE → ACCEPT LIMITS

**Reality:** NSA taps backbone. Nation-state level.
**Mitigation:** Encryption + metadata minimization

- Tor for anonymity (slow, use sparingly)
- Minimize metadata (timing, volume patterns)
- Accept: some visibility exists at this layer

---

## LAYER 2: OS → ESCAPE APPLE

**Current:** macOS 14.5, Apple controls everything
**Goal:** Linux on open hardware (long-term)

### Phase 2.1: Linux on Pis (DONE)
```bash
# Your Pi cluster runs Linux
# Cecilia, Lucidia, etc. = sovereign compute
# Move workloads there
```

### Phase 2.2: Linux Desktop (Future)
```bash
# Framework laptop or System76
# Full disk encryption
# No Apple telemetry, no Gatekeeper
```

### Phase 2.3: Audit Root CAs
```bash
# Remove untrusted CAs from keychain
# 157 CAs can MITM you
# Reduce to essential only
```

**Sovereignty gained:** No Apple backdoors, no forced updates.

---

## LAYER 1: HARDWARE → OPEN SILICON (Long-term)

**Current:** Apple M1, Apple controls Secure Enclave
**Goal:** Open hardware (RISC-V, etc.)

### Phase 1.1: Pi Cluster is Escape Route
- Raspberry Pis use ARM, open firmware
- Hailo-8 on Cecilia = your AI accelerator
- This is YOUR hardware

### Phase 1.2: Future: RISC-V
- StarFive, SiFive boards
- Fully open instruction set
- No hardware backdoors

---

## IMMEDIATE ACTION PLAN

```bash
# TODAY:
1. Bring Pis online (power/network check)
2. Deploy Pi-hole on cecilia for DNS sovereignty
3. Set Tailscale exit node for ISP bypass
4. Verify blackroad-ai routes local first

# THIS WEEK:
5. Fine-tune BlackRoad coder model on your repos
6. Deploy vLLM on cecilia (Hailo-8 acceleration)
7. Audit and reduce trusted Root CAs

# THIS MONTH:
8. Full DNS sovereignty (Unbound recursive)
9. All AI inference local (no API fallback needed)
10. Document sovereignty architecture
```

---

## SOVEREIGNTY SCORE

| Layer | Current | Target | Status |
|-------|---------|--------|--------|
| 7 API | 20% | 100% | Ollama local, but still fallback to APIs |
| 6 CDN | 80% | 90% | Own Cloudflare account |
| 5 DNS | 0% | 100% | Frontier controls, need Pi-hole |
| 4 ISP | 40% | 90% | Tailscale partial, need exit node |
| 3 Backbone | 0% | 10% | Accept nation-state visibility |
| 2 OS | 30% | 80% | Pis are Linux, Mac is Apple |
| 1 Hardware | 20% | 50% | Pis are open-ish, Mac is closed |

**Overall Sovereignty: ~30%**
**Target: 80%**

---

## THE VISION

```
BlackRoad OS runs on:
- YOUR hardware (Pis, open silicon)
- YOUR operating system (Linux)
- YOUR network (Tailscale mesh, encrypted)
- YOUR DNS (Pi-hole + Unbound)
- YOUR AI (local models, no API calls)
- YOUR edge (self-hosted or owned Cloudflare)

External providers become OPTIONAL backends,
not gatekeepers.

BlackRoad is root.
```
