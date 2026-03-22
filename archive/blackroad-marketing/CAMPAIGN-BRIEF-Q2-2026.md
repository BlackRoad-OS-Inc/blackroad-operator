# BlackRoad Q2 2026 Campaign Brief: "Own Your Stack"

**Campaign Type:** Product awareness + sign-up conversion
**Duration:** April 1 – June 30, 2026
**Status:** Planning

---

## 1. Situation (SWOT)

**Strength we're leveraging:** Fully operational self-hosted AI infrastructure on commodity hardware — 52 TOPS, 16 models, 50 skills, 30 websites, $0/month cloud bill. No competitor has this running in production on Raspberry Pis.

**Weakness we're mitigating:** Low brand awareness outside the self-hosting/homelab community. Product packaging not yet optimized for non-technical users.

**Opportunity we're exploiting:** 94% of IT leaders fear vendor lock-in (Parallels 2026). Self-hosted market growing at 11.9% CAGR to $49.67B by 2034. Edge AI growing at 21.7%. The market is moving toward us.

**Threat we're adapting to:** Big cloud providers (AWS, GCP, Azure) launching "edge" and "hybrid" products that claim self-hosted benefits without actually being self-hosted. Message discipline required to differentiate.

## 2. Objective

**500 developers** will **sign up for a BlackRoad account** (auth.blackroad.io) by **June 30, 2026**.

**Secondary:** 50 of those developers will **deploy at least one agent** within 30 days of signup.

**Measurement:** auth.blackroad.io user count (baseline: 42), deploy telemetry, Gitea repo clone counts.

## 3. Audience

**Primary segment:** Sovereign Developers

- **Role:** Backend/infrastructure developers, DevOps engineers, homelab enthusiasts
- **Experience:** Intermediate to expert
- **Processing style:** Central Route — they read docs, evaluate architecture, counterargue claims
- **Attitude function:** Value-expressive — they want tools that reflect their belief in sovereignty, open source, and self-reliance
- **Purchasing goal:** Utilitarian + Identity — they need working infrastructure AND want to be part of a builder community
- **TPB bottleneck:** Perceived Behavioral Control — they believe in self-hosting but think setting up AI inference is too complex. Fix: show that it runs on a Pi, one-command deploy, comprehensive docs.

**Secondary segment:** AI-Curious Founders

- **Role:** Technical founders at seed/Series A startups
- **Processing style:** Peripheral then Central — skim first, deep-dive if hooked
- **Attitude function:** Adjustment — maximize capability, minimize cost
- **Purchasing goal:** Utilitarian — reduce cloud spend, increase control
- **TPB bottleneck:** Attitude — they don't believe Pi-based infrastructure can be "real" production infra. Fix: show the 30 websites, the billing system, the uptime metrics.

## 4. Strategy

**Key message 1:** "Self-hosted AI runs on $200 of hardware. Cloud AI costs $33,696/year for one GPU. Do the math."
*Route: Central. Targets: adjustment function, utilitarian goal.*

**Key message 2:** "94% of IT leaders fear vendor lock-in. The fix isn't multi-cloud — it's your cloud."
*Route: Central → Peripheral bridge. Targets: value-expressive function.*

**Key message 3:** "5 Pis. 52 TOPS. 50 AI skills. 30 websites. $0/month."
*Route: Peripheral (vivid, concrete, novel). Targets: ego-defensive function ("I could do this too").*

**Positioning statement:** BlackRoad is the only AI operating system that runs production workloads on Raspberry Pis for developers who believe infrastructure should be owned, not rented.

## 5. Tactics

| # | Tactic | Channel | Deadline | Owner |
|---|--------|---------|----------|-------|
| 1 | 6 stat-hook blog posts (written) | [x]O | Apr 7 | Alexa |
| 2 | Blog → social thread adaptations (1 per post) | [x]S | Apr 14 | Alexa |
| 3 | "Own Your Stack" landing page | [x]O | Apr 7 | Alexa |
| 4 | 5-email nurture sequence (commitment ladder) | [x]O | Apr 14 | Alexa |
| 5 | Reddit/HN launch post | [x]E [x]S | Apr 21 | Alexa |
| 6 | GitHub README updates (all 275+ repos) | [x]O [x]E | Apr 7 | Automated |
| 7 | Dev.to / Hashnode cross-posts (3 blog posts) | [x]E | Apr 21 | Alexa |
| 8 | One-command deploy script + tutorial | [x]O | Apr 7 | Alexa |
| 9 | 2 comparison pages (vs. AWS, vs. cloud GPUs) | [x]O | Apr 21 | Alexa |
| 10 | SMS announcement to existing users | [x]O | Apr 7 | Alexa |
| 11 | Weekly build-in-public social posts (12 total) | [x]S | Ongoing | Alexa |
| 12 | Influencer outreach (3 homelab YouTubers) | [x]E | May 1 | Alexa |

## 6. Calendar

| Date | Milestone |
|------|-----------|
| Apr 1 | Campaign launch: landing page + first 3 blog posts + deploy script live |
| Apr 7 | Email sequence begins (list: existing 42 users + new signups) |
| Apr 14 | Social threads + remaining blog posts |
| Apr 21 | Reddit/HN launch + dev.to cross-posts + comparison pages |
| May 1 | Influencer outreach begins |
| May 15 | Midpoint check: review metrics, adjust messaging if needed |
| Jun 15 | Final push: scarcity-based email (#5 in sequence) |
| Jun 30 | Campaign end: final report |

## 7. Budget

| Category | Amount |
|----------|--------|
| Staff time (Alexa, 15 hrs/week x 13 weeks) | ~195 hours |
| Paid media | $0 (organic only for Q2) |
| Tools (email platform, analytics) | $0 (self-hosted) |
| Influencer gifting (3x Pi kits) | $300 |
| Contingency (10%) | $30 |
| **TOTAL** | **$330 + time** |

## 8. Evaluation

| Stage | Metric | Target | Tool |
|---|---|---|---|
| Awareness | Blog post views | 10,000 total | analytics-blackroad Worker |
| Awareness | Social impressions | 50,000 total | Platform analytics |
| Consideration | Landing page visits | 2,500 | stats-blackroad KV |
| Consideration | Email list growth | 500 subscribers | Email platform |
| Conversion | Account signups | 500 | auth.blackroad.io |
| Activation | First agent deployed | 50 | Deploy telemetry |
| Advocacy | GitHub stars (main repo) | 200 | GitHub API |
| Advocacy | Social shares of blog posts | 100 | Platform analytics |

## 9. Pre-Launch Checklist

- [ ] All 6 blog posts published and sourced
- [ ] Landing page live with all three key messages
- [ ] Deploy script tested on clean Pi
- [ ] Email sequence loaded and segmented
- [ ] Social threads drafted for all 6 blog posts
- [ ] Analytics tracking verified on all pages
- [ ] auth.blackroad.io baseline recorded (42 users)
- [ ] Comparison pages fact-checked against current cloud pricing
- [ ] All claims pass truth verification (no omitted comparisons, no pragmatic inferences)

## 10. Psychological Principles Deployed

| Tactic | Principle | Mechanism |
|--------|-----------|-----------|
| Blog headlines | Truth Effect + Novelty | Verified stats create credibility; gap creates surprise |
| Email sequence | Commitment/Consistency | Small yes → medium yes → big yes |
| Landing page | ELM (Peripheral → Central) | Design hooks in 3 seconds; arguments convert on scroll |
| Social proof | Social Validation | User counts, GitHub stars, testimonials |
| Comparison pages | Two-sided messaging | Acknowledging competitor strengths increases our credibility |
| Deploy script | Behavioral attitude formation | Doing → believing ("I deployed, so I must think it's good") |
| "Own Your Stack" framing | Value-expressive attitude function | Matches the audience's identity as sovereign builders |
| Pi hardware specs | Disrupt-then-reframe | "52 TOPS" disrupts; "$200 total" reframes |
| Influencer kits | Reciprocity | Give hardware → get authentic coverage |
| SMS announcements | Channel psychology | 98% open rate vs. 25% real email open rate |

---

*BlackRoad OS — Pave Tomorrow.*
