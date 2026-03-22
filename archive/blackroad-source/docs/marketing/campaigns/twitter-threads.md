# BlackRoad Twitter/X Threads

**Principle:** Peripheral Route + Social Validation + Build-in-Public
**Rule:** 80% educate, 20% promote

---

## Thread 1: The Stat-Flip (Vendor Lock-In)

**Type:** Educate (80%)

```
1/ 94% of IT leaders fear vendor lock-in with their cloud provider.

Not mildly uncomfortable. Concerned.

42% are considering moving workloads back on-premises.

Here's the math nobody's talking about: 🧵

2/ An H100 on AWS costs $3.90/hour.

Run it 24/7 for a year: $33,696.

For ONE GPU.

3/ A Hailo-8 AI accelerator costs $99.

It delivers 26 TOPS of neural inference.

It plugs into a Raspberry Pi 5.

It runs 24/7 forever on pennies of electricity.

4/ In 26 hours of cloud GPU time, you've spent more than the Hailo-8 costs to OWN.

26 hours vs. forever.

That's not a pricing comparison. That's a different economic model.

5/ We run 16 AI models on two of these.

52 TOPS total.

5 Raspberry Pis.

30 websites. 50 AI skills. 207 git repos.

Total monthly cloud bill: $0.

6/ The self-hosted cloud market hit $18.48B in 2025.

Growing at 11.9% CAGR.

Edge AI growing at 21.7%.

This isn't a hobby. It's where the market is going because the math requires it.

Source: Grand View Research, Parallels 2026 Survey
```

---

## Thread 2: Build-in-Public (Infrastructure Tour)

**Type:** Educate (80%)

```
1/ People ask what "self-hosted AI" actually looks like in production.

Here's our full infrastructure — every node, every service, every port.

Nothing hidden. 🧵

2/ NODE 1: Alice (.49)
- Gateway router
- Pi-hole DNS (blocks 120+ tracking domains)
- PostgreSQL database
- Qdrant vector database for RAG

Hardware: Raspberry Pi 5, 8GB RAM
Power: ~8 watts

3/ NODE 2: Cecilia (.96)
- 16 Ollama models (Llama, Mistral, CodeLlama, Phi, Gemma)
- Embedding engine (nomic-embed-text)
- Hailo-8 accelerator: 26 TOPS

Hardware: Raspberry Pi 5 + Hailo-8 M.2
Power: ~12 watts

4/ NODE 3: Octavia (.101)
- Gitea: 207 repositories (PRIMARY git host)
- Docker Swarm manager
- Hailo-8 accelerator: 26 TOPS

Hardware: Raspberry Pi 5 + Hailo-8 M.2
Power: ~12 watts

5/ NODE 4: Aria (.98)
- Agent runtime
- NATS v2.12.3 pub/sub messaging
- Agent-to-agent communication

Hardware: Raspberry Pi 5
Power: ~8 watts

6/ NODE 5: Lucidia (.38)
- 334 web applications
- GitHub Actions runner
- CI/CD pipeline

Hardware: Raspberry Pi 4
Power: ~6 watts

7/ THE MESH:
- WireGuard encrypts everything
- NATS connects 4 nodes for agent messaging
- Cloudflare Tunnels expose services (no open ports)
- Pi-hole filters DNS fleet-wide

Total power: ~46 watts
Total monthly bill: $0

8/ This serves 30 websites across 20 domains.

It processes 50 AI skills.

It hosts 207 repos on Gitea.

It runs a billing system (RoadPay) that processes real payments.

All on $400 of hardware.

9/ The question isn't whether this works.

You're reading this tweet on a device that loaded content served by this infrastructure.

It works.

The question is why you're still paying hourly for something that costs $400 once.

blackroad.io
```

---

## Thread 3: Psychology of Advertising (Educate)

**Type:** Educate (80%)

```
1/ I studied the Psychology of Advertising at the University of Minnesota.

Here are 7 things I learned that changed how I think about every ad I see:

🧵

2/ 80% OF ADS ARE MISUNDERSTOOD.

Not ignored. Misunderstood.

The audience sees the ad, processes it, and walks away believing something the advertiser didn't intend.

(Fennis & Stroebe, Psychology of Advertising)

3/ There are TWO PROCESSING ROUTES.

Central Route: you think carefully, evaluate arguments, counterargue.

Peripheral Route: you use shortcuts — design, social proof, brand recognition.

Most ads are designed for peripheral. Most claims need central.

4/ THE TRUTH EFFECT.

The more you see a claim, the more true it seems.

This works on true AND false claims.

Ethical play: repeat things that are actually true, frequently, everywhere.

5/ COMPLIANCE PRINCIPLE: COMMITMENT/CONSISTENCY.

Once you say yes to a small thing, you're more likely to say yes to a bigger thing.

"Star this repo" → "try a deploy" → "become a user" → "become a customer."

Every funnel is a commitment ladder.

6/ 94% OF IT LEADERS FEAR VENDOR LOCK-IN.

Not because of a marketing campaign.

Because the math is bad and the contracts are worse.

The best marketing amplifies a truth people already feel.

7/ PERSONALIZATION HAS A CREEPY THRESHOLD.

"For developers who self-host" = good.

"Hey [name], we noticed you visited our pricing page 3 times" = creepy.

Segment by role, not by surveillance.

8/ THE MOST POWERFUL MARKETING ISN'T PERSUASION.

It's accurate comprehension.

A customer who understands what they're getting stays.

A customer who was tricked leaves — and tells everyone.

We cite our sources. We verify our stats. We show our infrastructure.

blackroad.io/blog
```

---

## Thread 4: Product Launch (RoadPay)

**Type:** Promote (20%)

```
1/ We built our own billing system.

Not because Stripe is bad. Because Stripe is the card charger — not the billing brain.

RoadPay is live. Here's what it does: 🧵

2/ RoadPay runs on Cloudflare D1.

4 plans. 4 add-ons. Usage tracking. Invoice generation.

Stripe handles the card charge. RoadPay handles everything else.

3/ Why not just use Stripe Billing?

Because Stripe Billing is $0.50/invoice + 0.4% of revenue.

At scale, your billing platform takes a cut of every dollar.

RoadPay costs $0/month. It runs on a D1 database. We own it.

4/ The stack:
- D1 (Cloudflare) for the database
- Workers for the API
- Stripe for card processing only
- Auth at auth.blackroad.io (JWT, 42 users)

5/ 4 plans:

Starter → Builder → Pro → Enterprise

Each tier unlocks more agents, more compute, more skills.

No "contact sales" wall. No enterprise pricing email. Pick a plan. Start building.

6/ This is what "own your stack" means in practice.

We don't rent our billing system.
We don't rent our git hosting.
We don't rent our AI inference.
We don't rent our DNS.

We built it. We own it. We run it.

RoadPay is at tollbooth.blackroad.io
```

---

## Thread 5: Edge AI Market (Educate)

**Type:** Educate (80%)

```
1/ The edge AI market is about to 5x.

$24.91 billion in 2025.
$118.69 billion by 2033.
21.7% CAGR.

Here's why — and why the hardware costs $99: 🧵

2/ LATENCY.

Cloud inference = network round trip.

Edge inference = on-device.

For real-time AI (agents, sensors, interactive), the speed of light is too slow when your data center is 2,000 miles away.

3/ PRIVACY.

Edge inference = data never leaves the device.

Not "encrypted in transit."
Not "processed in a secure enclave."

Never. Leaves. The. Device.

4/ COST.

Cloud inference: metered, billed hourly, scales linearly.

Edge inference: buy once, run forever. The more you use it, the cheaper per inference.

A Hailo-8 costs $99. An H100 on AWS costs $3.90/hour.

In 26 hours, the cloud costs more than owning the edge hardware forever.

5/ The AI inference market is $106B in 2025.

Most of that is cloud inference — metered by the hour.

Edge AI hardware is $26B, growing at 17.6%.

The shift is happening because the economics are undeniable.

6/ We run 52 TOPS of edge inference on two $99 accelerators.

16 language models. 50 AI skills. Production workloads.

On Raspberry Pis. In a closet. In Minnesota.

The future of inference is local. It always should have been.

Sources: Grand View Research, MarketsandMarkets
```

---

## Single Posts (Rotation)

### Build-in-Public
```
Shipped today: [FEATURE/FIX/IMPROVEMENT]

[ONE LINE: what it does]

[SCREENSHOT]
```

### Stat-Flip
```
[X]% of [people] [do something painful].

We [do the opposite]. Here's the result: [NUMBER].

[LINK]
```

### Community Highlight
```
[USER] just [deployed/built/created] [THING] with BlackRoad.

[THEIR QUOTE — 1 sentence]

This is what "own your stack" looks like.
```

### 80/20 Educate
```
Things I wish I knew before self-hosting AI:

1. [INSIGHT]
2. [INSIGHT]
3. [INSIGHT]

Learned from running 16 models on Raspberry Pis for [MONTHS].
```

---

## Posting Schedule

| Day | Type | Ratio |
|-----|------|-------|
| Monday | Educate (thread or insight) | 80% |
| Tuesday | Build-in-public | 80% |
| Wednesday | Educate (stat or framework) | 80% |
| Thursday | Promote (product/feature) | 20% |
| Friday | Engage (question/poll/community) | 80% |
