# BlackRoad Organizations - Quick Reference

**Last Updated:** 2026-02-14
**Total Orgs:** 15 (14 active + 1 legacy)
**Total Repos:** 1,197
**Activity Rate:** 86%

---

## The 15 Organizations at a Glance

| # | Org | Created | Repos | Activity | Purpose |
|---|-----|---------|-------|----------|---------|
| 1 | **BlackRoad-OS** | Nov 17, 2025 | 1,000 | 82% | 🏢 Umbrella & Infrastructure |
| 2 | **BlackRoad-AI** | Jul 11, 2025 | 53 | 100% | 🤖 AI/ML Platform |
| 3 | **BlackRoad-Foundation** | Nov 24, 2025 | 15 | 100% | 🏛️ Enterprise B2B & Community |
| 4 | **BlackRoad-Cloud** | Nov 24, 2025 | 20 | 100% | ☁️ Cloud Infrastructure |
| 5 | **BlackRoad-Security** | Nov 24, 2025 | 17 | 100% | 🔒 Cybersecurity |
| 6 | **BlackRoad-Media** | Nov 24, 2025 | 17 | 100% | 📺 Content & Social |
| 7 | **BlackRoad-Education** | Nov 24, 2025 | 11 | 100% | 🎓 EdTech |
| 8 | **BlackRoad-Interactive** | Nov 24, 2025 | 14 | 100% | 🎮 Gaming & Metaverse |
| 9 | **BlackRoad-Labs** | Nov 24, 2025 | 13 | 100% | 🔬 Research & Data Science |
| 10 | **BlackRoad-Hardware** | Nov 24, 2025 | 13 | 100% | ⚡ IoT & Embedded |
| 11 | **BlackRoad-Studio** | Nov 24, 2025 | 13 | 100% | 🎨 Creative SaaS Tools |
| 12 | **BlackRoad-Ventures** | Nov 24, 2025 | 12 | 100% | 💼 VC & Partnerships |
| 13 | **BlackRoad-Gov** | Nov 24, 2025 | 10 | 100% | 🏛️ Civic Tech & Compliance |
| 14 | **BlackRoad-Archive** | Nov 24, 2025 | 9 | 100% | 📦 Long-term Storage |
| 15 | **Blackbox-Enterprises** | Nov 15, 2022 | 9 | 100% | 🖤 Legacy (Pre-BlackRoad) |

---

## Key Products by Org

### BlackRoad-AI
- **BlackRoad.io** - Main website ⚠️ (should move to OS org)
- **Lucidia Platform** - AI companion ($X/mo)
- **AI API Gateway** - Unified model access with [MEMORY]
- **AI Cluster** - Pi network orchestration

### BlackRoad-Studio
- **Canvas Studio** - Design tool (Canva replacement, free)
- **Video Studio** - Creator video editor ($X/mo)
- **Writing Studio** - AI writing assistant

### BlackRoad-Education
- **RoadWork** - AI tutoring platform ($X/mo, Chegg replacement)

### BlackRoad-Media
- **BackRoad Social** - Social platform (no ads, chronological)

### BlackRoad-Gov
- **RoadCoin** - Creator payment system (no fees)
- **Compliance Framework** - Regulatory tools

---

## Org Relationships

```
Blackbox (2022) → BlackRoad-AI (Jul 2025) → BlackRoad-OS (Nov 2025) → 13 Domain Orgs (Nov 2025)
     ↑                   ↑                          ↑
  Origin          First BR Org              Umbrella Hub
```

**Source of Truth:** BlackRoad-OS (1,000 repos, infra, brand, Private/Public workspaces)

**Governance:** All orgs have `.github` repos with shared templates + bot-based CODEOWNERS

---

## Fork vs Original Breakdown

| Org | Total | Original | Forks | Fork % |
|-----|-------|----------|-------|--------|
| BlackRoad-OS | 1,000 | 896 | 104 | 10% |
| BlackRoad-AI | 53 | 15 | 38 | 72% |
| BlackRoad-Cloud | 20 | 3 | 17 | 85% |
| BlackRoad-Security | 17 | 3 | 14 | 82% |
| BlackRoad-Media | 17 | 4 | 13 | 76% |
| BlackRoad-Foundation | 15 | 3 | 12 | 80% |
| BlackRoad-Interactive | 14 | 3 | 11 | 79% |
| BlackRoad-Labs | 13 | 3 | 10 | 77% |
| BlackRoad-Hardware | 13 | 3 | 10 | 77% |
| BlackRoad-Studio | 13 | 6 | 7 | 54% |
| BlackRoad-Ventures | 12 | 3 | 9 | 75% |
| BlackRoad-Education | 11 | 4 | 7 | 64% |
| BlackRoad-Gov | 10 | 4 | 6 | 60% |
| BlackRoad-Archive | 9 | 3 | 6 | 67% |
| Blackbox-Enterprises | 9 | 1 | 8 | 89% |
| **TOTAL** | **1,197** | **958** | **239** | **20%** |

**Pattern:** Most forks are immediately archived (reference only, not active development)

---

## Recommended Actions

### ✅ Priority 1: Move BlackRoad.io
- **From:** BlackRoad-AI/BlackRoad.io
- **To:** BlackRoad-OS/BlackRoad.io
- **Effort:** 1 hour
- **Risk:** Low

### ✅ Priority 2: Consolidate Blackbox
- **Action:** Merge Blackbox-Enterprises → BlackRoad-Foundation
- **Repos:** 9 repos (automation forks)
- **Effort:** 4.5 hours
- **Risk:** Low-Medium

### ⏸️ Deferred: Studio + Media Merge
- **Reason:** Both have strong identities, different product focus

### ⏸️ Deferred: Gov + Foundation Merge
- **Reason:** "Foundation" has specific OSS meaning

---

## Bot-Based Governance

From `blackroad-os-infra/.github/CODEOWNERS`:

| Bot | Domain |
|-----|--------|
| @alexa | Default owner (human) |
| @claude-bot | AI code review |
| @athena-bot | Infrastructure (CI/CD, Docker, K8s) |
| @silas-bot | Security (auth, secrets) |
| @blackroad os-bot | Performance optimization |
| @ophelia-bot | Documentation |
| @elias-bot | Testing |
| @cecilia-bot | Analytics/metrics |
| @felix-bot | Dependencies (package.json, requirements.txt) |
| @octavia-bot | Agent configurations |
| @cordelia-bot | Issue/PR templates |

---

## Timeline of Events

```
2022-11-15  Blackbox-Enterprises created (original entity)
2025-07-11  BlackRoad-AI created (first BlackRoad org, has main website)
2025-11-17  BlackRoad-OS created (umbrella org, 1,000 repos)
2025-11-24  13 domain orgs created in 67 minutes (13:53-14:20 UTC)
2026-02-14  This analysis completed
```

---

## Contact Info

- **GitHub Account:** blackboxprogramming (manages BlackRoad-OS org)
- **Main Org:** https://github.com/BlackRoad-OS
- **Main Website:** https://github.com/BlackRoad-AI/BlackRoad.io (⚠️ should move)
- **Private Workspace:** https://github.com/BlackRoad-OS/BlackRoad-Private

---

## For New Contributors

1. **Want to contribute?** Start at **BlackRoad-OS** org
2. **Looking for products?** Check **BlackRoad-AI**, **Studio**, **Education**, **Media**
3. **Need infrastructure?** See **BlackRoad-Cloud**, **Hardware**, **Security**
4. **Interested in research?** Visit **BlackRoad-Labs**
5. **Government/civic tech?** Check **BlackRoad-Gov**

---

**Full Analysis:** See `/Users/alexa/BLACKROAD_ORG_ECOSYSTEM_ANALYSIS.md`
**Consolidation Plan:** See `/Users/alexa/BLACKROAD_ORG_CONSOLIDATION_ROADMAP.md`
**Visual Diagrams:** See `/Users/alexa/BLACKROAD_ORG_RELATIONSHIP_DIAGRAM.md`
