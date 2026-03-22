# Landing Page: "Own Your Stack"

**URL:** blackroad.io/own-your-stack
**Principle:** ELM (Peripheral hero → Central scroll) + Primacy/Recency
**Purpose:** Campaign landing page for Q2 2026 "Own Your Stack"

---

## HERO (Peripheral — 3 seconds)

```
# 52 TOPS of AI inference. $200 of hardware. $0/month.

Your AI should run on your hardware, answer to your rules,
and cost you nothing after the first week.

[Deploy Your First Agent →]     [See the Architecture →]
```

**Design:** Black background. White text. Hot pink CTA button. Terminal cursor animation behind the headline. No images — just typography and the gradient shape.

---

## PROBLEM (Bridge — stat hook)

```
## 94% of IT leaders fear vendor lock-in. You should too.

A 2026 Parallels survey found that 94% of organizations are concerned
about vendor lock-in — and 42% are actively moving workloads back on-premises.

The math is simple:

| | Cloud GPU | BlackRoad |
|---|---|---|
| Cost | $3.90/hour | $99 one-time (Hailo-8) |
| Annual | $33,696 | ~$70 electricity |
| Data privacy | Policy-dependent | Physics-guaranteed |
| Vendor dependency | Complete | Zero |
| Cancellation | Lose access | You own the hardware |

The self-hosted cloud market hit $18.48 billion in 2025.
Edge AI is growing at 21.7% CAGR.

This isn't early. This is right on time.
```

---

## SOLUTION (Central Route — arguments that survive counterarguing)

```
## What BlackRoad OS Actually Does

BlackRoad is a self-hosted AI operating system that runs on Raspberry Pis.
Not a demo. Production infrastructure.

### 16 AI Models, Locally
Ollama serves Llama 3, Mistral, CodeLlama, Phi-3, Gemma, and 11 more.
On your Pi. On your network. No API key.

### 52 TOPS Neural Inference
Two Hailo-8 accelerators ($99 each) deliver 52 trillion operations per second.
Classification, detection, embedding, and inference — all on-device.

### 50 AI Skills Across 6 Modules
Summarization. Classification. Code generation. Content creation.
Analysis. Monitoring. Pre-built and extensible.

### Agent Mesh Network
NATS v2.12.3 connects agents across nodes via pub/sub messaging.
Agents delegate, collaborate, and report — without a central server.

### Complete Infrastructure
Gitea (207 repos). PostgreSQL. Qdrant vector search.
Pi-hole DNS. WireGuard encryption. Docker Swarm orchestration.

Everything you need. Nothing you rent.
```

---

## PROOF (Social Validation + Authority)

```
## This Is What It Looks Like in Production

Five Raspberry Pis serve:
→ 30 websites across 20 domains
→ 207 git repositories on Gitea
→ 50 AI skills across 6 modules
→ A billing system processing real payments (RoadPay)
→ An auth system with 42 users (auth.blackroad.io)
→ 334 web applications
→ 8 AI agents responding to GitHub events across 69 repos

Total power consumption: 46 watts.
Total monthly cloud bill: $0.

This page was served by this infrastructure.
```

---

## COMPARISON (Two-sided messaging — honesty builds credibility)

```
## Where Cloud Wins vs. Where BlackRoad Wins

We'll be straight with you.

CLOUD IS BETTER FOR:
✓ Training large models (you need H100 clusters)
✓ Burst capacity (100 GPUs for 2 hours)
✓ Global distribution (12 regions simultaneously)

BLACKROAD IS BETTER FOR:
✓ Always-on inference ($99 once vs. $33,696/year)
✓ Privacy (data never leaves your hardware)
✓ Vendor independence (no API keys, no ToS changes)
✓ Latency (on-device = no network round trip)
✓ Steady-state cost (hardware pays for itself in days)

Most AI workloads are inference, not training.
If you're running models 24/7, you're overpaying by 100x.
```

---

## CTA (Commitment/Consistency — small ask)

```
## Deploy Your First Agent in Under 10 Minutes

No credit card. No sales call. No "enterprise pricing" email.

One command. Your Pi. Your model. Your data. Your agent.

[Deploy Now →]

What happens when you click:
1. You'll get the setup guide (Pi 5 + Ollama + Hailo-8)
2. You'll run one command to deploy your first agent
3. Your agent starts listening for tasks — on YOUR hardware
4. You'll wonder why you ever rented compute

Already have a Pi? Skip to step 2. → [Quick Deploy →]
```

---

## FOOTER (Recency — last thing they remember)

```
BlackRoad OS — Pave Tomorrow.

"Pick up your agent. Ride the BlackRoad together.
Remember the Road. Pave Tomorrow."
```

---

## Page Specs

- **Load time target:** <1 second (served via Cloudflare)
- **Mobile-first:** All sections stack cleanly
- **No JavaScript required** for core content (progressive enhancement only)
- **Dark mode only** — black background, white text, hot pink CTAs
- **Fonts:** Space Grotesk (headlines), JetBrains Mono (code/stats), Inter (body)
- **Analytics:** stats-blackroad Worker + KV (self-hosted, no Google Analytics)

## A/B Test Plan

| Test | Variable | Hypothesis |
|------|----------|------------|
| 1 | Hero headline: "52 TOPS..." vs. "Your AI shouldn't need permission" | Concrete stat outperforms abstract claim (vividness principle) |
| 2 | CTA text: "Deploy Now" vs. "Deploy Your First Agent" | Specific verb + object outperforms generic (commitment specificity) |
| 3 | Comparison section: present vs. absent | Two-sided messaging increases conversion (credibility boost) |
