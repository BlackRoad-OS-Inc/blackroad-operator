# 🚀 BlackRoad Services - Phase 1 Fork Guide
## Foundation Layer (5 Critical Services - Next 30 Days)

**Date:** 2025-12-15
**Goal:** Fork and deploy the 5 foundational services everything else depends on
**Timeline:** 30 days (6 days per service)

---

## 🎯 Phase 1 Services (Priority Order)

### 1. blackroad-identity (Keycloak Fork)
**Why First:** Everything depends on auth
**Upstream:** https://github.com/keycloak/keycloak
**License:** Apache 2.0 ✅
**Est. Effort:** 6 days

### 2. blackroad-mesh (Headscale Fork)
**Why Second:** Network fabric before apps
**Upstream:** https://github.com/juanfont/headscale
**License:** MIT ✅
**Est. Effort:** 6 days

### 3. blackroad-git (Forgejo)
**Why Third:** Code hosting for all other forks
**Upstream:** https://codeberg.org/forgejo/forgejo
**License:** MIT ✅
**Est. Effort:** 6 days

### 4. blackroad-docs (Outline Fork)
**Why Fourth:** Document all the work
**Upstream:** https://github.com/outline/outline
**License:** BSD-3-Clause ✅
**Est. Effort:** 6 days

### 5. blackroad-chat (Matrix Synapse Fork)
**Why Fifth:** Team communication
**Upstream:** https://github.com/element-hq/synapse
**License:** Apache 2.0 ✅
**Est. Effort:** 6 days

---

## 📋 Standard Forking Procedure

### For Each Service, Follow This Workflow:

### Day 1-2: Fork & Analyze
```bash
# 1. Fork on GitHub
gh repo fork <upstream-org>/<upstream-repo> --clone=false --fork-name blackroad-<service>

# 2. Clone locally
git clone https://github.com/BlackRoad-OS/blackroad-<service>
cd blackroad-<service>

# 3. Add upstream remote
git remote add upstream https://github.com/<upstream-org>/<upstream-repo>

# 4. Analyze codebase
- Read LICENSE file
- Read CONTRIBUTING.md
- Review build system
- Check dependencies
- Identify hard-coded strings (branding)
```

### Day 3-4: Rebrand & Document
```bash
# 5. Create LINEAGE.md
cat > LINEAGE.md << 'EOF'
# Lineage

## Upstream

**Project:** <Upstream Name>
**Source:** https://github.com/<upstream-org>/<upstream-repo>
**License:** <License Type>
**Forked On:** <Date>

## Citation
```
<Citation from upstream docs>
```

## Modifications

### Branding
- Renamed <OldName> → BlackRoad <NewName>
- Updated logos, colors, text

### Features
- (List any feature additions)

### Deployment
- Added BlackRoad deployment configs

## Compliance

This fork complies with the <License> terms by:
- ✅ Preserving original LICENSE file
- ✅ Attributing upstream authors
- ✅ Documenting modifications
EOF

# 6. Rebrand
- Update package.json / pom.xml / Cargo.toml name
- Replace logo files
- Update README.md
- Update config defaults
- Search/replace branding strings

# 7. Add BlackRoad deployment configs
mkdir -p .blackroad/
# Add Dockerfiles, Helm charts, etc.
```

### Day 5: Deploy & Test
```bash
# 8. Local deployment
docker-compose up -d

# 9. Integration test
# - Test auth flow
# - Test core functionality
# - Test with blackroad-identity (if not first service)

# 10. Document
# - Update README.md with BlackRoad-specific setup
# - Add QUICKSTART.md
```

### Day 6: Production Prep
```bash
# 11. Railway/Cloudflare deployment
# - Create railway.toml
# - Test staging deploy
# - Configure custom domain

# 12. CI/CD
# - GitHub Actions for builds
# - Auto-deploy to staging on main branch

# 13. Commit & Tag
git add .
git commit -m "feat: BlackRoad fork complete"
git tag v1.0.0-blackroad.1
git push origin main --tags
```

---

## 🔧 Service-Specific Guides

### 1. blackroad-identity (Keycloak)

**Repository Structure:**
```
blackroad-identity/
├── LINEAGE.md                  (upstream attribution)
├── LICENSE                     (preserve Apache 2.0)
├── README.md                   (BlackRoad-specific)
├── .blackroad/
│   ├── railway.toml            (Railway deployment)
│   ├── docker-compose.yml      (local dev)
│   └── helm/                   (K8s deployment)
├── themes/
│   └── blackroad/              (custom theme)
│       ├── login/
│       ├── account/
│       └── admin/
└── <upstream Keycloak code>
```

**Key Modifications:**
- Custom BlackRoad theme (orange/pink gradient!)
- Default realm: `blackroad`
- Pre-configured clients for all BlackRoad services
- Branding: "BlackRoad Identity" instead of "Keycloak"

**Deployment:**
```bash
# Local
docker-compose up -d
# Access: http://localhost:8080

# Railway
railway up
# Access: https://identity.blackroad.io
```

**Integration:**
- All other BlackRoad services use this for auth
- OpenID Connect endpoint: `https://identity.blackroad.io/realms/blackroad`

---

### 2. blackroad-mesh (Headscale)

**Repository Structure:**
```
blackroad-mesh/
├── LINEAGE.md
├── LICENSE                     (preserve MIT)
├── README.md
├── .blackroad/
│   ├── railway.toml
│   ├── docker-compose.yml
│   └── config.yaml             (BlackRoad defaults)
└── <upstream Headscale code>
```

**Key Modifications:**
- Branding: "BlackRoad Mesh" instead of "Headscale"
- Default OIDC integration with blackroad-identity
- BlackRoad-themed web UI
- Pre-configured ACLs for BlackRoad services

**Deployment:**
```bash
# Local
docker-compose up -d
# Access: http://localhost:8085

# Railway
railway up
# Access: https://mesh.blackroad.io
```

**Integration:**
- All BlackRoad services connect via this mesh
- Replaces need for public IPs
- Zero-trust network by default

---

### 3. blackroad-git (Forgejo)

**Repository Structure:**
```
blackroad-git/
├── LINEAGE.md
├── LICENSE                     (preserve MIT)
├── README.md
├── .blackroad/
│   ├── railway.toml
│   ├── docker-compose.yml
│   └── app.ini                 (BlackRoad config)
└── <upstream Forgejo code>
```

**Key Modifications:**
- Branding: "BlackRoad Git" instead of "Forgejo"
- OAuth integration with blackroad-identity
- Custom landing page
- BlackRoad color scheme

**Deployment:**
```bash
# Local
docker-compose up -d
# Access: http://localhost:3000

# Railway
railway up
# Access: https://git.blackroad.io
```

**Integration:**
- Hosts all BlackRoad service repositories
- CI/CD integration with Woodpecker CI (future)
- Single sign-on with blackroad-identity

---

### 4. blackroad-docs (Outline)

**Repository Structure:**
```
blackroad-docs/
├── LINEAGE.md
├── LICENSE                     (preserve BSD-3-Clause)
├── README.md
├── .blackroad/
│   ├── railway.toml
│   ├── docker-compose.yml
│   └── .env.example
└── <upstream Outline code>
```

**Key Modifications:**
- Branding: "BlackRoad Docs" instead of "Outline"
- OAuth with blackroad-identity
- Custom logo + colors
- Default collections for BlackRoad domains

**Deployment:**
```bash
# Local
docker-compose up -d
# Access: http://localhost:3001

# Railway
railway up
# Access: https://docs.blackroad.io
```

**Integration:**
- Primary documentation platform
- All service docs live here
- Team wiki + knowledge base

---

### 5. blackroad-chat (Matrix Synapse)

**Repository Structure:**
```
blackroad-chat/
├── LINEAGE.md
├── LICENSE                     (preserve Apache 2.0)
├── README.md
├── .blackroad/
│   ├── railway.toml
│   ├── docker-compose.yml
│   └── homeserver.yaml         (BlackRoad config)
└── <upstream Synapse code>
```

**Key Modifications:**
- Server name: `blackroad.io`
- OIDC integration with blackroad-identity
- Default rooms for each pack
- Custom Element client theme (future)

**Deployment:**
```bash
# Local
docker-compose up -d
# Access: http://localhost:8008

# Railway
railway up
# Access: https://chat.blackroad.io
```

**Integration:**
- Team communication
- Per-pack channels
- Federation with other Matrix servers

---

## 🧪 Testing Matrix

### After Each Fork:

**Functional Tests:**
- ✅ Service starts successfully
- ✅ Core features work
- ✅ Auth integration (if not first)
- ✅ Database migrations
- ✅ API endpoints respond

**Integration Tests:**
- ✅ blackroad-identity login works
- ✅ Services can discover each other via blackroad-mesh
- ✅ Logs sent to central logging (future)
- ✅ Metrics collected (future)

**Deployment Tests:**
- ✅ Local (docker-compose)
- ✅ Staging (Railway)
- ✅ Custom domain works
- ✅ SSL certificates valid
- ✅ Health checks pass

---

## 📊 Progress Tracking

| Service | Status | Fork Date | Deploy Date | Domain |
|---------|--------|-----------|-------------|---------|
| blackroad-identity | ⏳ Planned | - | - | identity.blackroad.io |
| blackroad-mesh | ⏳ Planned | - | - | mesh.blackroad.io |
| blackroad-git | ⏳ Planned | - | - | git.blackroad.io |
| blackroad-docs | ⏳ Planned | - | - | docs.blackroad.io |
| blackroad-chat | ⏳ Planned | - | - | chat.blackroad.io |

---

## 🎯 Success Criteria

**Phase 1 Complete When:**
- ✅ All 5 services forked and rebranded
- ✅ All 5 services deployed to Railway
- ✅ Custom domains working
- ✅ Single sign-on across all services
- ✅ Zero-trust mesh network operational
- ✅ Documentation complete

**Expected Timeline:** 30 days (6 days per service)

**Expected Cost:**
- GitHub: $0 (open-source repos)
- Railway: $25/month (5 services @ $5 each)
- Cloudflare: $0 (DNS + SSL)
- Total: $25/month

---

## 🧱 Core Principles (Reminder)

**For every fork:**
1. ✅ Preserve upstream LICENSE
2. ✅ Create LINEAGE.md attribution
3. ✅ Document ALL modifications
4. ✅ Integrate with blackroad-identity
5. ✅ Deploy to blackroad.io subdomain
6. ✅ Self-hostable (no SaaS dependencies)
7. ✅ Offline-capable where possible
8. ✅ No telemetry by default

---

## 🚀 Quick Start Commands

```bash
# Create Phase 1 workspace
mkdir -p ~/blackroad-services-phase1
cd ~/blackroad-services-phase1

# Fork all 5 services
gh repo fork keycloak/keycloak --clone=false --fork-name blackroad-identity
gh repo fork juanfont/headscale --clone=false --fork-name blackroad-mesh
gh repo fork forgejo/forgejo --clone=false --fork-name blackroad-git
gh repo fork outline/outline --clone=false --fork-name blackroad-docs
gh repo fork element-hq/synapse --clone=false --fork-name blackroad-chat

# Clone locally
for service in identity mesh git docs chat; do
  git clone https://github.com/BlackRoad-OS/blackroad-$service
done

# Start with identity
cd blackroad-identity
```

---

**Status:** 🎯 Ready to Execute Phase 1!
**Next:** Fork blackroad-identity (Keycloak) and begin Day 1 workflow

**Maintained By:** BlackRoad Platform Architecture
**Date:** 2025-12-15

**Questions?** blackroad.systems@gmail.com
