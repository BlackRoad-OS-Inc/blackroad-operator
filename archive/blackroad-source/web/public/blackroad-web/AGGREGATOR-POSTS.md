# Aggregator & Directory Submissions

## 1. Lobsters (lobste.rs)
Invite-only but if you have access:

**Title**: `52 TOPS of AI inference on Raspberry Pi cluster with Hailo-8 accelerators`
**URL**: `https://blackroad.io/blog/52-tops-on-400-dollars`
**Tags**: `hardware`, `ai`, `networking`

---

## 2. Indie Hackers (indiehackers.com/post)

**Title**: `I built a $15/month AI inference cluster that replaces $1000/month of cloud compute`

**Body**:
```
I've been building an edge AI infrastructure on Raspberry Pis — 5 nodes, 2 Hailo-8 AI accelerators (52 TOPS combined), a custom mesh network, and self-healing automation.

The economics:
- Hardware: $1,140 one-time
- Electricity: $15/month
- 3-year total: $1,680

Cloud equivalent: $500-1000/month = $18K-36K over 3 years.

It runs 16 language models, handles vision inference at 300 FPS, and manages 207 git repositories on a self-hosted Gitea instance.

I wrote up the full technical build, including everything that broke (undervoltage, thermal throttling, SD card degradation, a node that's been offline for days):

https://blackroad.io/blog/52-tops-on-400-dollars

Also wrote about the sovereign computing philosophy behind it:
https://blackroad.io/blog/sovereign-computing-manifesto

Happy to answer questions about the Hailo-8 setup or the economics.
```

---

## 3. Hashnode

Cross-post the 52 TOPS article with canonical URL pointing to blackroad.io.
Use the markdown from `crosspost-devto-52tops.md` — same format works on Hashnode.
Set canonical_url to: https://blackroad.io/blog/52-tops-on-400-dollars

---

## 4. Medium

Cross-post the Sovereign Computing Manifesto.
Use the markdown from `crosspost-devto-manifesto.md`.
Import via Medium's story importer: https://medium.com/p/import
Set canonical URL in Medium's SEO settings.

---

## 5. Hacker Noon

Submit the RoadC language article — they love programming language content.
**Title**: `Designing a Programming Language for AI Agent Orchestration`
**URL**: https://blackroad.io/blog/roadc-language-for-agents

---

## 6. GitHub Awesome Lists (PRs to submit)

These are curated lists that drive significant traffic:

- **awesome-raspberry-pi** — Submit PR adding BlackRoad OS to the "Projects" section
  Repo: thibmaek/awesome-raspberry-pi
  Entry: `BlackRoad OS - Self-hosted edge AI operating system running 52 TOPS on Pi clusters`

- **awesome-selfhosted** — Submit PR adding to "Automation" or "Personal Dashboards"
  Repo: awesome-selfhosted/awesome-selfhosted
  Entry: `BlackRoad OS - Self-healing AI infrastructure with fleet monitoring and mesh networking`

- **awesome-home-assistant** / **awesome-sysadmin** — if applicable

---

## 7. AlternativeTo

Register BlackRoad OS as an alternative to:
- OpenDAN (Personal AI OS)
- AIOS
- CrewAI
URL: https://alternativeto.net/software/suggest/

---

## 8. Product Hunt

Save for a dedicated launch day. Need:
- A 2-minute demo video of the fleet dashboard
- 3-5 screenshots
- Tagline: "Self-hosted edge AI operating system on Raspberry Pi clusters"
- Description: Short version of the Sovereign Computing Manifesto

---

## 9. Dev.to

Already have markdown files ready:
- `crosspost-devto-52tops.md` → post first
- `crosspost-devto-manifesto.md` → post 2 days later

Both have canonical_url set to blackroad.io to avoid SEO duplicate content penalties.

---

## Priority Order

1. HN (highest impact, time-sensitive)
2. Reddit r/raspberry_pi + r/selfhosted (targeted audiences)
3. dev.to cross-posts (SEO backlinks)
4. LinkedIn (professional network)
5. Indie Hackers (founder community)
6. Awesome-list PRs (permanent backlinks)
7. Twitter thread (amplification)
8. Product Hunt (save for dedicated launch)
