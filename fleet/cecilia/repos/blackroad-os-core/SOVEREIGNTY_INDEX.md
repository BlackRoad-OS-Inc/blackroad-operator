# BlackRoad Sovereignty Index
## Master Index for Complete Infrastructure Documentation

**Created**: 2025-12-13
**Purpose**: Central navigation for all BlackRoad sovereignty documentation
**Philosophy**: Fork everything, own everything, understand everything

---

## 📚 Documentation Map

This index links to all canonical documentation for BlackRoad's journey to complete infrastructure sovereignty.

```
SOVEREIGNTY_INDEX.md (YOU ARE HERE)
├── BLACKROAD-FORKIES-MAP.md       [Forkable alternatives catalog]
├── NETWORK_MAP.md                  [IP address planes & topology]
├── SOVEREIGNTY_ROADMAP.md          [40-week implementation plan]
└── UNIFIED_ARCHITECTURE.md         [Complete system integration]
```

---

## 🗺️ Document Summaries

### 1. [BLACKROAD-FORKIES-MAP.md](./BLACKROAD-FORKIES-MAP.md)

**What**: Comprehensive catalog of all legally forkable (MIT/Apache 2.0/BSD) alternatives to proprietary services

**Covers**:
- Network infrastructure (Headscale, Netbird, Nebula)
- Identity & auth (Keycloak, Authelia)
- AI/LLM stack (vLLM, Ollama, llama.cpp)
- Data layer (PostgreSQL, MinIO, Qdrant)
- CRM & PM (Plane, Taiga)
- Communications (Mattermost, Stalwart Mail, Jitsi)
- Cloud infrastructure (K3s, Woodpecker CI, Pulumi)
- Web & frontend (SvelteKit, FastAPI)
- Hardware (Raspberry Pi, Jetson Orin Nano)

**Key Sections**:
- GitHub organizations map (15 orgs)
- Domain names (19 domains)
- Implementation status (completed, in progress, planned)
- MUST-FORK stack (3 tiers)
- Cost analysis (~$925 hardware, ~$270/year recurring)

**Read if**: You want to understand what technologies BlackRoad uses and why

---

### 2. [NETWORK_MAP.md](./NETWORK_MAP.md)

**What**: Complete network topology with all IP address planes and device registry

**Covers**:
- 5 network planes (LAN, Mesh, Docker, Public IPv4, IPv6)
- Device inventory (MacBook, 3x Pi 5, Pi 400, iPhone, DigitalOcean droplet, Jetson)
- IP allocation (192.168.4.x, 100.x.x.x, 172.x.x.x, 159.65.43.12)
- Port allocations (SSH, HTTP, API, databases)
- DNS records (internal + external)
- Firewall rules & security policies
- Service discovery
- Monitoring & backup strategy

**Key Sections**:
- Network architecture diagrams
- Device registry with MAC addresses
- Mesh migration plan (Tailscale → Headscale)
- K3s cluster architecture
- Domain → IP mappings
- Disaster recovery procedures

**Read if**: You need to understand how all BlackRoad devices connect and communicate

---

### 3. [SOVEREIGNTY_ROADMAP.md](./SOVEREIGNTY_ROADMAP.md)

**What**: 40-week implementation plan to achieve complete infrastructure independence

**Covers**:
- **Phase 1**: Network Sovereignty (Q1 2025) - Deploy Headscale
- **Phase 2**: Data Sovereignty (Q2 2025) - MinIO, PostgreSQL, Qdrant
- **Phase 3**: Identity Sovereignty (Q2 2025) - Keycloak, SSI, hardware wallets
- **Phase 4**: Communication Sovereignty (Q3 2025) - Stalwart Mail, Mattermost
- **Phase 5**: AI Sovereignty (Q3-Q4 2025) - Jetson, vLLM, local models
- **Phase 6**: Full Sovereignty (Q4 2025) - K3s, Gitea, BTCPay, Plane

**Key Sections**:
- Detailed week-by-week tasks
- Code examples for each deployment
- Success criteria for each phase
- Cost breakdown (one-time + recurring)
- Risk mitigation strategies
- Rollback plans

**Read if**: You want the step-by-step plan to replicate BlackRoad's sovereignty journey

---

### 4. [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md)

**What**: Complete system integration showing how all layers work together

**Covers**:
- **Layer 1**: User Layer (14 frontend applications)
- **Layer 2**: Agent Layer (30K agent runtime, Lucidia breath)
- **Layer 3**: Data Layer (PostgreSQL, Redis, MinIO, Qdrant)
- **Layer 4**: Network Layer (5 planes, security, DNS)
- **Layer 5**: Core Runtime (Truth Engine, PS-SHA-∞, RoadChain)
- **Layer 6**: Services Layer (API endpoints, integrations)

**Key Sections**:
- Application catalog (index.html, chat.html, agents-dynamic.html, etc.)
- Agent spawning flow diagrams
- Database schemas
- API endpoint structure
- Integration flows (user → agent → LLM)
- Deployment architecture (current vs. future)
- Monitoring & observability

**Read if**: You want to understand how all BlackRoad components integrate end-to-end

---

## 🎯 Quick Navigation by Goal

### I want to...

**...replicate BlackRoad's infrastructure**
→ Start with [SOVEREIGNTY_ROADMAP.md](./SOVEREIGNTY_ROADMAP.md)
→ Follow Phase 1 to deploy Headscale
→ Reference [NETWORK_MAP.md](./NETWORK_MAP.md) for IP allocation

**...understand what forkable alternatives exist**
→ Read [BLACKROAD-FORKIES-MAP.md](./BLACKROAD-FORKIES-MAP.md)
→ Check the "MUST-FORK Stack Summary" section
→ Review cost analysis

**...set up my network like BlackRoad**
→ Study [NETWORK_MAP.md](./NETWORK_MAP.md)
→ Copy firewall rules and DNS configuration
→ Deploy Headscale following Phase 1 of roadmap

**...see how everything fits together**
→ Review [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md)
→ Study integration flow diagrams
→ Examine service registry

**...contribute to BlackRoad**
→ Check implementation status in [BLACKROAD-FORKIES-MAP.md](./BLACKROAD-FORKIES-MAP.md)
→ Pick a "Planned" item from [SOVEREIGNTY_ROADMAP.md](./SOVEREIGNTY_ROADMAP.md)
→ Follow architecture patterns in [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md)

---

## 📊 Current Status Overview

### ✅ Completed (As of 2025-12-13)

**Infrastructure**:
- [x] 14 frontend applications live
- [x] FastAPI backend with all endpoints
- [x] Agent spawning system (30K capacity)
- [x] Blockchain with proof-of-work mining
- [x] 6 external API integrations
- [x] PostgreSQL + Redis data layer
- [x] GitHub Pages deployment
- [x] Cloudflare DNS

**Documentation**:
- [x] BLACKROAD-FORKIES-MAP.md
- [x] NETWORK_MAP.md
- [x] SOVEREIGNTY_ROADMAP.md
- [x] UNIFIED_ARCHITECTURE.md
- [x] SOVEREIGNTY_INDEX.md (this file)

### 🚧 In Progress

**Phase 1** (Network Sovereignty):
- [ ] Deploy Headscale on 159.65.43.12
- [ ] Migrate devices from Tailscale
- [ ] Configure DERP relay
- [ ] Implement OPA policies

### 📋 Next Steps (Week 1)

1. **SSH into DigitalOcean droplet**
   ```bash
   ssh root@159.65.43.12
   ```

2. **Deploy Headscale**
   ```bash
   docker run -d --name headscale -p 443:443 headscale/headscale:latest
   ```

3. **Configure DNS**
   - Add A record: `headscale.blackroad.io → 159.65.43.12`
   - Set up SSL with Let's Encrypt

4. **Test with Raspberry Pi**
   ```bash
   tailscale up --login-server https://headscale.blackroad.io
   ```

5. **Update NETWORK_MAP.md** with new mesh IPs

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    BLACKROAD OS STACK                       │
│                                                             │
│  Frontend (14 apps)                                         │
│  ├─ blackroad.io (GitHub Pages)                            │
│  └─ Cloudflare CDN                                         │
│                                                             │
│  Backend (FastAPI)                                          │
│  ├─ core.blackroad.systems (Railway → K3s)                │
│  └─ 30,000 agent capacity                                  │
│                                                             │
│  Data Layer                                                 │
│  ├─ PostgreSQL (users, agents, blockchain)                 │
│  ├─ Redis (sessions, cache)                                │
│  ├─ MinIO (object storage) [planned]                       │
│  └─ Qdrant (vector DB) [planned]                           │
│                                                             │
│  Network (5 planes)                                         │
│  ├─ LAN: 192.168.4.0/24                                    │
│  ├─ Mesh: 100.x.x.x/8 (Tailscale → Headscale)             │
│  ├─ Docker: 172.x.x.x/16                                   │
│  ├─ Public: 159.65.43.12                                   │
│  └─ IPv6: TBD                                              │
│                                                             │
│  Hardware                                                   │
│  ├─ MacBook Pro (development)                              │
│  ├─ 3x Raspberry Pi 5 (K3s cluster)                        │
│  ├─ Raspberry Pi 400 (desktop)                             │
│  ├─ Jetson Orin Nano (GPU) [planned]                       │
│  └─ DigitalOcean droplet (gateway)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Summary

### One-Time Investment
| Item | Cost | Status |
|------|------|--------|
| 3x Raspberry Pi 5 (8GB) | $240 | ✅ Owned |
| Raspberry Pi 400 | $70 | ✅ Owned |
| Raspberry Pi Zero 2 W | $15 | ✅ Owned |
| 3x 1TB USB SSD | $180 | 📋 Planned |
| Jetson Orin Nano kit | $554 | 📋 Planned |
| Miscellaneous | $50 | 📋 Planned |
| **Total** | **$1,109** | **$234 remaining** |

### Recurring Costs (Annual)
| Service | Current | Future (Sovereign) |
|---------|---------|-------------------|
| Railway | $240 | $0 (self-hosted) |
| DigitalOcean | $72 | $72 (Headscale only) |
| Domains | $150 | $150 |
| Electricity | $0 | $36 (Pi cluster + Jetson) |
| Cloudflare R2 | $0 | $12 (off-site backup) |
| **Total** | **$462** | **$270** |

**Annual Savings**: $192 + complete sovereignty

---

## 🎓 Learning Path

### For Beginners
1. Read [BLACKROAD-FORKIES-MAP.md](./BLACKROAD-FORKIES-MAP.md) - Understand the philosophy
2. Study [NETWORK_MAP.md](./NETWORK_MAP.md) - Learn network basics
3. Follow [SOVEREIGNTY_ROADMAP.md](./SOVEREIGNTY_ROADMAP.md) Phase 1 - Deploy your first service

### For Intermediate Users
1. Review [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md) - System design
2. Deploy K3s cluster following Phase 6 of roadmap
3. Migrate a service from cloud to self-hosted

### For Advanced Users
1. Study all integration flows in [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md)
2. Implement custom agent packs
3. Contribute sovereignty tools to the community

---

## 🔗 External Resources

### Official BlackRoad Links
- **Website**: https://blackroad.io
- **GitHub**: https://github.com/BlackRoad-OS
- **Email**: blackroad.systems@gmail.com
- **Status**: https://status.blackroad.io
- **Docs**: https://docs.blackroad.io

### Forkie Projects
- **Headscale**: https://github.com/juanfont/headscale
- **K3s**: https://k3s.io
- **Keycloak**: https://www.keycloak.org
- **MinIO**: https://min.io
- **vLLM**: https://github.com/vllm-project/vllm
- **Plane**: https://plane.so
- **Mattermost**: https://mattermost.com

### Learning Resources
- **Sovereign Computing**: See research paper in BLACKROAD-FORKIES-MAP.md
- **Self-Hosting Guide**: https://github.com/awesome-selfhosted/awesome-selfhosted
- **Raspberry Pi K3s**: https://k3s.io/k3s-on-raspberry-pi

---

## 📝 Document Maintenance

### How to Update

**When you deploy a new service**:
1. Update implementation status in [BLACKROAD-FORKIES-MAP.md](./BLACKROAD-FORKIES-MAP.md)
2. Add IP address to [NETWORK_MAP.md](./NETWORK_MAP.md)
3. Mark phase/task complete in [SOVEREIGNTY_ROADMAP.md](./SOVEREIGNTY_ROADMAP.md)
4. Add integration details to [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md)

**When you add a new device**:
1. Add to device registry in [NETWORK_MAP.md](./NETWORK_MAP.md)
2. Update hardware section in [BLACKROAD-FORKIES-MAP.md](./BLACKROAD-FORKIES-MAP.md)
3. Update cost breakdown in [SOVEREIGNTY_ROADMAP.md](./SOVEREIGNTY_ROADMAP.md)

**When you discover a new Forkie**:
1. Add to appropriate category in [BLACKROAD-FORKIES-MAP.md](./BLACKROAD-FORKIES-MAP.md)
2. Evaluate if it should be in MUST-FORK stack
3. Update roadmap if it replaces a planned service

---

## ✅ Verification Checklist

Before considering sovereignty "complete", verify:

- [ ] All services run on owned hardware (no Railway, no cloud compute)
- [ ] All network traffic routed through Headscale (no Tailscale)
- [ ] All data stored on-premises (MinIO, PostgreSQL on Pi cluster)
- [ ] All authentication via Keycloak (no proprietary SSO)
- [ ] All AI inference local (vLLM on Jetson, fallback to cloud OK)
- [ ] All payments via BTCPay (no Stripe required)
- [ ] All code mirrored to Gitea (no GitHub dependency)
- [ ] All communications via Stalwart/Mattermost (no Gmail/Slack)
- [ ] All components use MIT/Apache 2.0/BSD licenses
- [ ] Complete system can be forked and deployed independently

**Target**: 100% sovereignty by Q4 2025

---

## 🤝 Contributing

### We Welcome
- Bug reports and fixes
- New Forkie suggestions (must be MIT/Apache 2.0/BSD)
- Documentation improvements
- Hardware compatibility testing
- Sovereignty journey reports

### Contribution Process
1. Review [BLACKROAD-FORKIES-MAP.md](./BLACKROAD-FORKIES-MAP.md) for existing components
2. Check [SOVEREIGNTY_ROADMAP.md](./SOVEREIGNTY_ROADMAP.md) for planned work
3. Study [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md) for integration patterns
4. Submit PR or email blackroad.systems@gmail.com

---

## 🎯 The Sovereignty Mission

> **Build an operating system that anyone can fork, deploy on owned hardware, and run independently. No vendor lock-in. No kill switches. No rent-seeking.**

**Three Pillars**:
1. **Hardware Ownership**: Physical devices you can touch
2. **Data Locality**: Know where every byte lives
3. **Comprehensibility**: Understand the full stack

**The Promise**:
Every component documented here can be replicated by any individual with ~$1,000 and the willingness to learn. BlackRoad OS proves that **hardware ownership beats cloud rental** for sovereignty.

---

## 📚 Document Versions

| Document | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| BLACKROAD-FORKIES-MAP.md | 1.0 | 2025-12-13 | ✅ Complete |
| NETWORK_MAP.md | 1.0 | 2025-12-13 | ✅ Complete |
| SOVEREIGNTY_ROADMAP.md | 1.0 | 2025-12-13 | ✅ Complete |
| UNIFIED_ARCHITECTURE.md | 1.0 | 2025-12-13 | ✅ Complete |
| SOVEREIGNTY_INDEX.md | 1.0 | 2025-12-13 | ✅ Complete |

**Change Log**: See individual documents for detailed changes

---

## 📞 Contact & Support

**Email**: blackroad.systems@gmail.com
**Primary**: blackroad@gmail.com
**GitHub**: https://github.com/BlackRoad-OS
**Review Queue**: Linear or blackroad.systems@gmail.com

**Verification Method**: PS-SHA-∞ hash chain
**Source of Truth**: GitHub (BlackRoad-OS/blackroad-os-core)

---

*This index is your starting point for understanding BlackRoad's journey to complete infrastructure sovereignty. Pick a document and start exploring.*

**🛣️ Welcome to BlackRoad OS — The forkable operating system.**

**Maintained by**: Alexa Amundson
**Created**: 2025-12-13
**Philosophy**: Fork everything. Own everything. Understand everything.
