# BlackRoad OS Consolidation Plan

> Collapsing 70+ repos into 18 canonical repos under `BlackRoad-OS`.

## Executive Summary

We're consolidating the BlackRoad ecosystem from a sprawling 70+ repository chaos into a clean 18-repo spine. This document tracks what goes where and the execution order.

---

## Phase 0: Declare Canonical Org & Spine ✅

**Status: COMPLETE**

- [x] `BlackRoad-OS` is the only canonical home for the OS
- [x] ARCHITECTURE.md created listing the spine
- [x] CI/CD workflows deployed to all 37 repos

---

## Phase 1: Core Repo Merges

### Priority 1: Duplicate Cores (MERGE → ARCHIVE)

| Source Repo | Target Repo | Status | Notes |
|-------------|-------------|--------|-------|
| `blackroad-agent-os` | `blackroad-os-core` + `blackroad-os-operator` | ⏳ Pending | Split kernel vs orchestration |
| `blackroad-agents` | `blackroad-os-agents` | ⏳ Pending | Merge agent definitions |
| `blackroad-os-helper` | `blackroad-os-core` / `blackroad-tools` | ⏳ Pending | Evaluate utility code |
| `blackroad-os-beacon` | `blackroad-os-mesh` | ⏳ Pending | Health/presence service |

### Priority 2: Content & Demo (MERGE → ARCHIVE)

| Source Repo | Target Repo | Status | Notes |
|-------------|-------------|--------|-------|
| `blackroad-os-demo` | `blackroad-os-web` `/demo` | ⏳ Pending | Demo pages |
| `blackroad-os-home` | `blackroad-os-web` `/` | ⏳ Pending | Landing content |
| `blackroad-hello` | `blackroad-os-core` `/examples/hello-world` | ⏳ Pending | Sample app |
| `blackroad-os-ideas` | `blackroad-os-docs` `/ideas` | ⏳ Pending | Ideation docs |
| `blackroad-os-research` | `blackroad-os-docs` `/research` | ⏳ Pending | Research notes |

### Priority 3: CLI & Tools (MERGE)

| Source Repo | Target Repo | Status | Notes |
|-------------|-------------|--------|-------|
| `blackroad-cli` | `blackroad-tools` `/cli` | ⏳ Pending | CLI tool |

---

## Phase 2: Personal Account Cleanup

### Repos in `blackboxprogramming` to Archive

| Repo | Action | Target | Status |
|------|--------|--------|--------|
| `BLACKROAD-OS-MASTER` | ARCHIVE | N/A - reference only | ⏳ |
| `BlackRoad-Operating-System` | ARCHIVE | Superseded by org | ⏳ |
| `blackroad` | ARCHIVE | `BlackRoad-OS/blackroad` | ⏳ |
| `blackroad-api` | ARCHIVE | `BlackRoad-OS/blackroad-os-api` | ⏳ |
| `blackroad-operator` | ARCHIVE | `BlackRoad-OS/blackroad-os-operator` | ⏳ |
| `blackroad-prism-console` | ARCHIVE | `BlackRoad-OS/blackroad-os-prism-console` | ⏳ |
| `blackroad.io` | MERGE → ARCHIVE | Content to `blackroad-os-web` | ⏳ |
| `blackroadinc.us` | ARCHIVE | Domain config only | ⏳ |

### Repos to Leave Alone (Personal/Experimental)

These stay in `blackboxprogramming` as personal projects:

- `BlackStream`
- `Chit-Chat-Cadillac`
- `Holiday-Activity`
- `codex-agent-runner`
- `codex-infinity`
- `lucidia` (legacy)
- `lucidia-lab`
- `quantum-math-lab`
- `universal-computer`
- `next-video-starter`
- `nextjs-ai-chatbot`

---

## Phase 3: Domain & Routing Consolidation

### Cloudflare Tunnel Setup

| Subdomain | Service | Header |
|-----------|---------|--------|
| `blackroad.io` | `blackroad-os-web` | `X-BR-Context: marketing` |
| `app.blackroad.io` | `blackroad-os-web` | `X-BR-Context: workspace` |
| `console.blackroad.io` | `blackroad-os-web` | `X-BR-Context: console` |
| `finance.blackroad.io` | `blackroad-os-web` | `X-BR-Context: finance` |
| `studio.blackroad.io` | `blackroad-os-web` | `X-BR-Context: studio` |
| `edu.blackroad.io` | `blackroad-os-web` | `X-BR-Context: education` |
| `api.blackroad.io` | `blackroad-os-api-gateway` | - |

### DNS Cleanup

- [ ] Remove legacy A records pointing to old Droplet IPs
- [ ] Configure Tunnel hostnames for each subdomain
- [ ] Verify SSL certificates auto-provision

---

## Phase 4: Railway Service Registry

Create these services in Railway:

```
Project: blackroad-os-production
├── blackroad-os-web (port 3000)
├── blackroad-os-api-gateway (port 8080)
├── blackroad-os-core (port 9000, internal)
├── blackroad-os-operator (port 9001, internal)
└── blackroad-os-mesh (port 9002, internal)

Project: blackroad-os-staging
├── (same services with -staging suffix)
```

---

## Phase 5: Agent & Pack Standardization

### Agent Migration

1. Create unified agent structure in `blackroad-os-agents`
2. Move agent definitions from scattered repos
3. Standardize config format

### Pack Migration

For each pack:
1. Create `flows/`, `policies/`, `agents/`, `templates/` structure
2. Move content from any scattered locations
3. Remove runtime code (packs are config-only)

---

## Execution Checklist

### Week 1: Core Cleanup
- [ ] Merge `blackroad-agent-os` → `blackroad-os-core`
- [ ] Merge `blackroad-agents` → `blackroad-os-agents`
- [ ] Archive personal duplicates with banner README
- [ ] Set up Cloudflare Tunnel for `app.blackroad.io`

### Week 2: Web Consolidation
- [ ] Merge `blackroad-os-home` content → `blackroad-os-web`
- [ ] Merge `blackroad-os-demo` content → `blackroad-os-web`
- [ ] Configure entry context routing in web app
- [ ] Verify all subdomains route correctly

### Week 3: Infrastructure
- [ ] Set up Railway service registry
- [ ] Configure inter-service communication
- [ ] Deploy health checks via `blackroad-os-mesh`
- [ ] Set up staging environment

### Week 4: Polish
- [ ] Update all docs to reflect new structure
- [ ] Archive remaining legacy repos
- [ ] Verify CI/CD across all repos
- [ ] Celebrate 🎉

---

## Archive Script

Run this to archive a repo:

```bash
#!/bin/bash
REPO=$1
TARGET=$2
DATE=$(date +%Y-%m-%d)

# Clone the repo
gh repo clone blackboxprogramming/$REPO /tmp/$REPO

# Update README
cat > /tmp/$REPO/README.md << EOF
# ⚠️ This Repository Has Been Archived

> **Superseded by [\`BlackRoad-OS/$TARGET\`](https://github.com/BlackRoad-OS/$TARGET) as of $DATE.**

This repository has been consolidated into the unified BlackRoad OS spine.
All active development now happens in the canonical repository linked above.

See [ARCHITECTURE.md](https://github.com/BlackRoad-OS/blackroad-os-core/blob/main/ARCHITECTURE.md) for the full system design.

---
*Archived as part of the BlackRoad OS Consolidation - $DATE*
EOF

# Commit and push
cd /tmp/$REPO
git add README.md
git commit -m "chore: mark as archived, superseded by BlackRoad-OS/$TARGET"
git push

# Archive the repo
gh repo archive blackboxprogramming/$REPO --yes

echo "✅ $REPO archived, pointing to BlackRoad-OS/$TARGET"
```

---

## Success Metrics

After consolidation:

- [ ] Only 18 active repos in `BlackRoad-OS`
- [ ] All legacy repos archived with clear pointers
- [ ] Single web app serving all `*.blackroad.io`
- [ ] CI/CD green across all repos
- [ ] Docs up to date in `blackroad-os-docs`

---

*Created: 2024-11-30*
*Owner: @blackboxprogramming*
