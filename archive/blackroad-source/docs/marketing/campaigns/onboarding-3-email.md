# Onboarding Email Sequence (Post-First-Deploy)

**Principle:** Behavioral Attitude Formation — do → believe → stay
**Trigger:** User completes first agent deploy
**Sequence:** 3 emails over 7 days
**Sender:** Alexa Amundson <alexa@blackroad.io>

---

## Email 1: WELCOME WIN (Day 0 — Immediate after first deploy)

**Principle:** Self-Perception Theory — reinforce the behavior they just took

**Subject:** You just deployed your first agent. Here's what happened under the hood.

**Body:**
```
You did it.

Your first BlackRoad agent is running. Here's exactly what just happened on your hardware:

1. Ollama loaded the model into memory on your Pi
2. The agent registered with the NATS mesh
3. It subscribed to its task topic
4. It's now listening for work — on YOUR hardware, on YOUR network

No cloud. No API call. No metered billing. The inference is happening on silicon you physically own.

Here's what you can do right now:

→ Query your agent: [COMMAND]
→ Check its status: [COMMAND]
→ See the logs: [COMMAND]

And here's the thing nobody tells you about self-hosted AI:

The second deploy is easier than the first. The third is automatic. By the fifth, you'll wonder why you ever rented compute.

If anything broke or feels unclear, reply to this email. I'll fix it personally.

— Alexa
```

---

## Email 2: FIRST WIN EXPANSION (Day 3)

**Principle:** Commitment/Consistency — they deployed one, now deploy another

**Subject:** 3 things your agent can do that you probably haven't tried yet

**Body:**
```
Your agent has been running for 3 days. Here are three things you can do with it right now that most new users don't discover until week two:

**1. Chain it with another agent**
Deploy a second agent on the same node (or a different Pi). Connect them via NATS pub/sub:

[COMMAND TO DEPLOY SECOND AGENT]
[COMMAND TO CONNECT VIA NATS]

Now Agent A can delegate tasks to Agent B. That's an AI pipeline running entirely on your hardware.

**2. Add RAG (Retrieval-Augmented Generation)**
Point your agent at a folder of documents:

[COMMAND TO INDEX DOCUMENTS]
[COMMAND TO QUERY WITH RAG]

Your agent now answers questions using YOUR data — not the internet's data, not a training set, YOUR documents.

**3. Set up a webhook trigger**
Make your agent respond to external events (GitHub push, form submission, cron schedule):

[COMMAND TO SET UP WEBHOOK]

Now your agent works while you sleep. On your hardware. For $0/month.

Each of these takes under 5 minutes. Which one are you trying first?

— Alexa
```

---

## Email 3: DEEPER ENGAGEMENT (Day 7)

**Principle:** Identity formation — "I am a BlackRoad operator"

**Subject:** You've been running self-hosted AI for a week. Here's what that makes you.

**Body:**
```
One week ago you deployed your first agent.

Here's what's different now:

- You have AI inference running on hardware you own
- Your data hasn't left your network once
- You've paid $0 in cloud compute
- You have a system that runs whether or not any vendor decides to change their pricing, terms, or API

You're not a BlackRoad "user." You're an operator.

The difference: users consume a service. Operators own infrastructure. You own yours now.

Here's where operators go from here:

**Level 1: Single agent** ← you are here
→ One agent, one model, one task

**Level 2: Agent mesh**
→ Multiple agents communicating via NATS pub/sub
→ Specialized agents (summarizer, classifier, coder, monitor)

**Level 3: Full stack**
→ Qdrant for vector search / RAG
→ PostgreSQL for persistent state
→ Pi-hole for network-level security
→ WireGuard for encrypted mesh
→ Monitoring + alerting

**Level 4: Production**
→ Multiple Pis in a Swarm
→ Hailo-8 accelerators for 26+ TOPS per node
→ Gitea for self-hosted git
→ Custom skills and workflows

The full architecture guide for Level 3-4 is here:
[LINK TO ARCHITECTURE PAGE]

And if you want to see what Level 4 looks like in production — that's what blackroad.io runs on. Five Pis. Thirty websites. Fifty skills. Zero cloud.

Welcome to the fleet.

— Alexa

BlackRoad OS — Pave Tomorrow.
```

---

## Sequence Metrics

| Email | Success Metric | Target |
|-------|---------------|--------|
| 1 | Log command usage (did they check their agent?) | 60%+ |
| 2 | Second deploy rate | 30%+ |
| 3 | Architecture page visit | 40%+ |

## Segmentation Rules

- If they deploy a second agent after Email 2 → send "Advanced Patterns" guide
- If they don't open Email 2 → resend with alternate subject: "Your agent is lonely. Deploy a friend."
- If they visit the architecture page after Email 3 → flag as "power user" for product feedback requests
