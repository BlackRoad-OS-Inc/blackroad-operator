# 80% of Advertisements Are Misunderstood. We Studied Why — Then Built a System That Can't Be.

**Published:** 2026-03-14
**Author:** Alexa Amundson
**Tags:** advertising psychology, marketing, JOUR 4251, transparency

---

According to research from Fennis & Stroebe's *The Psychology of Advertising* — the textbook used at the University of Minnesota's JOUR 4251 course — approximately 80% of advertisements are misunderstood in some way by their audience.

Not ignored. Not rejected. *Misunderstood.*

The audience sees the ad, processes it, and walks away with a belief the advertiser didn't intend. Sometimes better than intended. Usually worse.

## How Misunderstanding Works

There are four mechanisms, and advertisers use all of them — sometimes on purpose, sometimes accidentally:

**1. Omitted Comparisons**
"The most powerful AI platform." More powerful than what? Than your competitor? Than last year's version? Than a calculator? The claim means nothing because the comparison is missing. But your brain fills in "more powerful than everything" because that's the pragmatic inference.

**2. Pragmatic Inference**
"Brand X may be the best solution in the world." The word "may" makes this technically true about anything. Brand X may also be the worst. But your brain drops the "may" and stores "Brand X is the best."

**3. Juxtaposition**
"Smart developers choose BlackRoad." This implies that choosing BlackRoad makes you smart, or that being smart causes you to choose BlackRoad. Neither is stated. Both are inferred.

**4. Affirmation of the Consequent**
"If you want sovereignty, you need BlackRoad." Logical structure: If A then B. But this doesn't mean B requires A or that B is the only path. It sounds airtight. It's not.

## Why This Matters for Every Company

73% of consumers feel unfavorably toward brands associated with misinformation. 65% say they'd stop buying. The [Integral Ad Science research](https://integralads.com/insider/advertising-age-misinformation-consumer-research/) makes the cost clear: misunderstood claims don't just fail — they actively damage you when the audience figures out they were misled.

The "30K agents" problem is a real example. BlackRoad's early marketing referenced 30,000 agents. It wasn't true. It was aspirational language that became a claim through repetition. We caught it and purged it from every site, every README, every deploy.

Here's why that matters psychologically:

## The Truth Effect

The more people see a claim, the more true it seems. This is the *sleeper effect* combined with *hedonic fluency* — familiarity creates a mild positive feeling, and that feeling gets attributed to truthfulness. Repeat a lie enough times and the brain files it as fact.

This works on true claims too. Which is the ethical play: repeat things that are actually true, frequently, across every channel.

## What BlackRoad Does Instead

Every claim in BlackRoad marketing passes one test: **is this literally, specifically, and verifiably true?**

- "52 TOPS of neural inference" — true. Two Hailo-8 accelerators, 26 TOPS each.
- "16 Ollama models running on Cecilia" — true. Verified by `ollama list` on the machine.
- "5 Raspberry Pis, 30 websites, 50 AI skills" — true. Count them.
- "207 repos on Gitea" — true. Log into Octavia:3100 and count.

Compare this to "The #1 AI platform" or "Trusted by millions" or "Enterprise-grade." Those aren't claims. They're mood lighting.

## The Operations Manual

We didn't just learn this and move on. We built an [Advertising Psychology Operations Manual](/ADVERTISING-PSYCHOLOGY-OPS.md) that translates every principle from JOUR 4251 into a pre-ship checklist.

Before any marketing asset goes live, it runs through:

- **Processing route check** — is this designed for central (thinking) or peripheral (scrolling) processing?
- **Claim verification** — can every stat be sourced? Can every claim survive counterarguing?
- **Comprehension check** — are we using any of the four misunderstanding mechanisms, even accidentally?
- **Truth effect audit** — are we repeating true things or repeating things we want to be true?

This is not common practice. Most marketing teams optimize for clicks and conversions. We optimize for *accuracy of understanding* — because a customer who understands what they're getting is a customer who stays.

## The Deeper Point

The psychology of advertising isn't a weapon. It's a diagnostic tool. When you understand how people process, remember, and evaluate messages, you can design communication that *actually works* — not because it tricks people, but because it respects how their minds function.

80% of ads are misunderstood. Ours come with source links.

---

*BlackRoad OS — Pave Tomorrow.*

**Sources:**
- Fennis, B. M., & Stroebe, W. (2010/2016). *The Psychology of Advertising.* Psychology Press.
- [IAS: Consumer Perception of Misleading Content](https://integralads.com/insider/advertising-age-misinformation-consumer-research/)
- JOUR 4251 — Psychology of Advertising, University of Minnesota (Dr. Claire M. Segijn)
