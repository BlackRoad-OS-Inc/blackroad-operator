# Email Nurture Sequence: "Own Your Stack"

**Principle:** Commitment/Consistency (Foot-in-the-Door)
**Trigger:** New signup at auth.blackroad.io
**Sequence:** 5 emails over 14 days
**Sender:** Alexa Amundson <alexa@blackroad.io>

---

## Email 1: GIVE (Day 0 — Immediate)

**Principle:** Reciprocity — pure value, zero ask

**Subject:** Your Pi can run 16 AI models. Here's the exact setup.

**Body:**
```
Hey —

You just signed up for BlackRoad. Here's the thing I wish someone had sent me when I started self-hosting AI:

The complete hardware list + setup guide for running Ollama on a Raspberry Pi 5 with a Hailo-8 accelerator.

[LINK TO SETUP GUIDE]

What's in it:
- Exact hardware (Pi 5 8GB + Hailo-8 M.2 = $180 total)
- One-command Ollama install
- How to load 16 models simultaneously
- Hailo-8 driver setup (it's one line)
- Performance benchmarks we actually measured

No sales pitch in this email. Just the guide.

If you run into anything, reply to this — I read every one.

— Alexa

P.S. The guide includes the exact model list we run in production:
Llama 3, Mistral, CodeLlama, Phi-3, Gemma, and 11 more.
```

---

## Email 2: TEACH (Day 3)

**Principle:** Authority — establish expertise, small ask (reply)

**Subject:** 94% of IT leaders made the same mistake. Here's the fix.

**Body:**
```
94% of IT leaders are concerned about vendor lock-in with their cloud providers.

(Source: Parallels 2026 Survey — not our number, theirs.)

42% are considering moving workloads back on-premises.

The mistake isn't choosing the cloud. The cloud is great for some things. The mistake is putting EVERYTHING there — including workloads that run cheaper, faster, and more privately on hardware you own.

AI inference is the clearest example:

- Cloud GPU: $3.90/hour = $33,696/year for ONE instance
- Hailo-8: $99 one-time = 26 TOPS forever

The self-hosted cloud market hit $18.48 billion in 2025 because organizations are doing this math.

Here's a quick framework for deciding what belongs in the cloud vs. on your hardware:

CLOUD: bursty workloads, global distribution, things you need for 2 hours/month
LOCAL: always-on inference, private data, consistent workloads, anything metered by the hour

Reply with what you're currently running in the cloud — I'll tell you what I'd move local and what I'd keep.

— Alexa
```

---

## Email 3: PROVE (Day 6)

**Principle:** Social Validation — case study, medium ask (watch/read)

**Subject:** 30 websites, 50 AI skills, 207 repos — on $400 of hardware

**Body:**
```
People ask if self-hosted AI is "real" or just a hobby project.

Here's what BlackRoad's infrastructure looks like in production:

5 Raspberry Pis:
→ Alice: Gateway, Pi-hole DNS, PostgreSQL, Qdrant
→ Cecilia: 16 Ollama models, Hailo-8 (26 TOPS)
→ Octavia: Gitea (207 repos), Docker Swarm, Hailo-8 (26 TOPS)
→ Aria: Agent runtime, NATS pub/sub messaging
→ Lucidia: 334 web apps, CI/CD

What it serves:
→ 30 websites across 20 domains
→ 50 AI skills across 6 modules
→ RoadPay billing system (real payments)
→ Auth system (42 users, JWT)
→ RoadSearch (AI-powered search across 29 pages)
→ Squad Webhook (8 AI agents on 69 GitHub repos)

Total hardware: ~$400
Monthly cloud bill: $0
Power consumption: ~46 watts

This isn't a case study from someone else's company. This is what you signed up to use.

Want to see the full architecture? Here's the deep dive:

[LINK TO ARCHITECTURE PAGE]

— Alexa
```

---

## Email 4: DIFFERENTIATE (Day 9)

**Principle:** Two-sided messaging — honest comparison increases credibility

**Subject:** BlackRoad vs. cloud GPUs — honest comparison (they win on some things)

**Body:**
```
I'm going to be straight with you about where cloud GPUs beat us and where we beat them.

WHERE CLOUD WINS:
✓ Training large models (you need A100s/H100s — we can't match that on Pi hardware)
✓ Burst capacity (need 100 GPUs for 2 hours? Cloud is the only option)
✓ Global distribution (if you need inference in 12 regions simultaneously)

WHERE BLACKROAD WINS:
✓ Always-on inference cost ($99 once vs. $33,696/year)
✓ Privacy (data literally never leaves your hardware)
✓ Vendor independence (no API keys, no ToS changes, no surprise pricing)
✓ Latency (on-device = no network round trip)
✓ Total cost at steady state (hardware pays for itself in days, not months)

THE HONEST ANSWER:
If you're training foundation models, you need the cloud.
If you're running inference, RAG, classification, or agent orchestration — you're overpaying for cloud by 100x or more.

Most AI workloads are inference, not training. The edge AI market is $24.91B and growing at 21.7% because organizations are figuring this out.

Try it yourself — free account, no card required:

[LINK TO DEPLOY GUIDE]

— Alexa

P.S. Yes, I just told you where competitors are better. If I'm willing to be honest about that, you can trust what I say about where we're better.
```

---

## Email 5: ASK (Day 14)

**Principle:** Scarcity (genuine) + Commitment (they've invested attention)

**Subject:** You've been reading these emails for two weeks. Here's why that matters.

**Body:**
```
Over the past two weeks, you've:

- Received a complete Pi + Hailo-8 setup guide
- Learned why 94% of IT leaders fear vendor lock-in
- Seen our full production architecture (30 websites on $400 hardware)
- Read an honest comparison where we told you where cloud GPUs win

Here's the psychology of what just happened (I studied this — JOUR 4251, University of Minnesota):

It's called the commitment/consistency principle. Once you invest attention in something — opening emails, reading guides, evaluating architecture — your brain categorizes that attention as interest. Interest predicts action.

I'm not telling you this to manipulate you. I'm telling you because I think transparency about persuasion is more respectful than pretending it doesn't exist.

So here's the direct ask:

Deploy your first BlackRoad agent this week.

[LINK TO ONE-COMMAND DEPLOY]

It takes under 10 minutes. No credit card. No sales call. Just a Pi, Ollama, and one script.

If you do it and it doesn't work — reply and tell me why. I'll fix it or I'll tell you honestly that BlackRoad isn't the right fit.

If you do it and it does work — you'll know exactly what 52 TOPS on $200 of hardware feels like.

Either way, you'll have answered the question instead of wondering about it.

— Alexa

BlackRoad OS — Pave Tomorrow.
```

---

## Sequence Metrics

| Email | Success Metric | Target |
|-------|---------------|--------|
| 1 | Guide link click rate | 40%+ |
| 2 | Reply rate | 10%+ |
| 3 | Architecture page visit | 25%+ |
| 4 | Deploy guide click rate | 20%+ |
| 5 | First deploy completion | 10%+ |

## Segmentation Rules

- If they click the deploy guide in Email 4 → skip Email 5, send "Getting Started" onboarding instead
- If they reply to Email 2 → flag for personal follow-up before Email 3
- If they don't open Emails 1-3 → move to re-engagement sequence (different subject lines, same content)
- If they unsubscribe → respect it immediately, no "are you sure?" tricks
