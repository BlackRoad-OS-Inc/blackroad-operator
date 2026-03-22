# BlackRoad Advertising Psychology Operations Manual

**Source:** JOUR 4251 — Psychology of Advertising (University of Minnesota, Dr. Claire M. Segijn)
**Textbook:** Fennis & Stroebe, *The Psychology of Advertising*
**Adapted for:** BlackRoad OS marketing operations
**Classification:** Internal operations — not for distribution

---

## How to Use This Manual

This is not theory. This is a field guide. Every section follows the same format:

1. **The principle** — what the research proves
2. **Why it works** — the cognitive mechanism
3. **BlackRoad application** — exactly how we deploy it
4. **Checklist** — what to verify before shipping

If you are writing copy, designing a page, planning a campaign, or building a funnel — find the relevant section and run the checklist. Do not ship without it.

---

## Table of Contents

1. [Two Modes of Processing](#1-two-modes-of-processing)
2. [Attention Capture](#2-attention-capture)
3. [Memory Architecture](#3-memory-architecture)
4. [Attitude Formation & Change](#4-attitude-formation--change)
5. [Persuasion Models](#5-persuasion-models)
6. [Behavior Change Framework](#6-behavior-change-framework)
7. [Compliance Principles](#7-compliance-principles)
8. [Personalization Operations](#8-personalization-operations)
9. [Multiscreening & Synced Advertising](#9-multiscreening--synced-advertising)
10. [Packaging & Embodied Cognition](#10-packaging--embodied-cognition)
11. [Audience Segmentation Psychology](#11-audience-segmentation-psychology)
12. [Campaign Planning System](#12-campaign-planning-system)
13. [Channel Operations (PESO)](#13-channel-operations-peso)
14. [Crisis Response Protocol](#14-crisis-response-protocol)
15. [Measurement & Evaluation](#15-measurement--evaluation)

---

## 1. Two Modes of Processing

Every person who encounters BlackRoad content is in one of two states. Know which one you're designing for.

### Central Route (Systematic Processing)

**When it activates:** The person is motivated AND able to think carefully. They care about the topic, they have time, they have energy.

**What happens:** They read the arguments. They evaluate claims against what they already know. They counterargue. If the arguments win, attitude change is **deep and lasting.**

**What it requires from us:** Strong arguments. Real evidence. Verified statistics. Technical depth. No fluff — fluff triggers counterarguing and rejection.

**BlackRoad assets that use Central Route:**
- Flagship essay ("Intelligence routing, not intelligence replacement")
- Technical documentation
- Product comparisons with verified metrics (52 TOPS, 5 nodes, 50 skills)
- Blog posts with cited statistics
- Whitepaper content

### Peripheral Route (Heuristic Processing)

**When it activates:** The person lacks motivation OR ability to process deeply. They're scrolling. They're tired. They don't know the category yet.

**What happens:** They use shortcuts — visual quality, brand recognition, social proof, spokesperson attractiveness, design aesthetics. Attitude change is **real but temporary** unless reinforced.

**What it requires from us:** Clean design. Strong brand signals. Social proof numbers. Aesthetic consistency. Emotional resonance. Speed.

**BlackRoad assets that use Peripheral Route:**
- Landing pages (first 3 seconds)
- Social media posts
- Pixel art / metaverse visuals
- Logo treatments (neon, glitch, scanlines, holo)
- "Pave Tomorrow" tagline placement
- Status dashboard screenshots

### Operating Rule

Never mix the routes in the same piece. A landing page hero is peripheral. The section below the fold can transition to central. A blog post headline is peripheral. The body is central. Know which mode you're writing for at every line.

**Pre-ship checklist:**
- [ ] Is this piece designed for central or peripheral processing?
- [ ] If central: are all claims verified? Can every stat be sourced?
- [ ] If peripheral: does it resolve in under 3 seconds? Is the brand signal immediate?
- [ ] Does the page transition cleanly from peripheral (top) to central (scroll)?

---

## 2. Attention Capture

You are competing with every other stimulus in the person's environment. There are four levers.

### Lever 1: Motivation

People attend to what serves their current goals. A person actively looking for self-hosted AI infrastructure will find BlackRoad. You cannot manufacture motivation — but you can **intercept it** with SEO, paid search, and content that matches search intent.

**Application:** Every piece of content must answer the question "who is already motivated to find this?" If nobody, kill it.

### Lever 2: Salience

Noticeably different from the surrounding environment. Context-dependent — what's salient on Twitter is not salient on a terminal. The upward camera angle principle: figure-ground separation makes the subject dominant.

**Application:**
- BlackRoad's black background + gradient shapes = high salience against every white-background SaaS site
- Terminal-style UI screenshots stand out in social feeds full of polished mockups
- Hot pink (#FF1D6C) accent color breaks monotony on any page

**Salience matters MORE when the audience is NOT motivated.** This is why brand design matters for cold traffic.

### Lever 3: Vividness

Emotionally interesting. Concrete. Image-provoking. Temporally and spatially close to the reader.

**Application:**
- "Your Pi is running 16 models right now" is vivid. "AI infrastructure" is not.
- "52 TOPS of neural compute in your closet" is vivid. "Edge computing solution" is not.
- Pixel art of the 14-floor HQ is vivid. An org chart is not.

### Lever 4: Novelty

Unfamiliar or defies expectations. Novel stimuli make people think MORE (extended processing — this is how you bridge from peripheral to central).

**Application:**
- "BlackRoad OS" — an operating system for AI agents is novel in the market
- Self-hosted AI that runs on $50 Raspberry Pis defies the "you need a data center" expectation
- A CEO who writes shell scripts and deploys from a Mac Mini is novel positioning

**Repetition-variation principle:** Repeat the core message but vary the execution. Same tagline, different visual. Same stat, different context. This maintains novelty across impressions without losing brand consistency.

**Pre-ship checklist:**
- [ ] Who is motivated to find this? (If nobody — reconsider)
- [ ] Is this visually distinct from what surrounds it in context?
- [ ] Is there at least one vivid, concrete detail?
- [ ] Is there at least one element that defies expectation?

---

## 3. Memory Architecture

If they don't remember you, you don't exist. Understanding how memory works determines how we structure every piece of content.

### Preattentive Processing (They Don't Know They Saw You)

People are exposed to your brand without conscious awareness — scrolling past, background tab, glancing at a shared screen. This goes into **implicit memory.**

**Why it matters:** When they later encounter BlackRoad consciously, implicit memory creates **hedonic fluency** — a mild positive feeling from familiarity. "I've seen this before" feels good. Familiarity breeds preference.

**Application:**
- Consistent brand signals across all 30 websites = maximum preattentive exposure
- Logo on every page footer, every GitHub README, every deploy output
- "Pave Tomorrow" in 74 files = ambient repetition building implicit memory traces

### The Consideration Set

All AI platforms → All platforms they've heard of → All platforms they'd actually consider → **Purchase decision**

Our job is to be in the consideration set. Priming (exposure) increases the probability of inclusion.

**Application:**
- Presence on GitHub (275+ repos) = repeated exposure in developer contexts
- RoadSearch indexing = appears when people search adjacent terms
- Cross-linked ecosystem (30 sites) = multiple entry points into consideration

### Memory Encoding Strategy

Information must be encoded **semantically** (by meaning) to enter long-term memory. Surface features (color, font) enter short-term memory and decay.

**Application for content:**
- Headlines must convey meaning, not just look good
- Product descriptions must create mental models ("your agents talk to each other over NATS mesh") not just list features
- Stories encode better than lists — wrap stats in narrative

### Primacy and Recency

People remember the **first** and **last** things they see.

**Application:**
- First line of any page = most important claim
- Last line of any page = call to action or sticky tagline
- In a list of features, put the strongest first and the second-strongest last
- "Pave Tomorrow." always closes

### Retrieval Cues

Use the same images, phrases, and visual motifs across channels so that seeing one triggers recall of the others.

**Application:**
- Same gradient shapes on website, social, docs, presentations
- Same tagline structure ("Pick up your agent. Ride the BlackRoad together.")
- Same color palette (hot pink, amber, electric blue, violet)
- Pixel art style = instant BlackRoad recognition

**Pre-ship checklist:**
- [ ] Does this piece contribute to preattentive brand exposure?
- [ ] Does it help BlackRoad enter or stay in consideration sets?
- [ ] Is the first line the strongest claim? Is the last line sticky?
- [ ] Are retrieval cues (colors, tagline, visual style) consistent?

---

## 4. Attitude Formation & Change

Attitudes are evaluations — favorable or unfavorable — toward BlackRoad, our products, or our category. They form through three pathways.

### Cognitive Formation (Information-Based)

Built on beliefs. "BlackRoad runs 16 models locally on Raspberry Pis" → belief that it's technically capable → favorable attitude.

**Heuristic shortcuts people use:**
- **Brand name** = consumer version of stereotyping. "BlackRoad OS" sounds like infrastructure. Good.
- **Price** = quality signal. Free tier signals accessibility. Paid tier signals seriousness.
- **Category pioneer** = defines the space. Self-hosted AI agent OS is a category we can own.

**Application:** Every factual claim in our marketing is an attitude-forming input. False claims form attitudes that shatter on contact with reality. This is why we purged "30K agents" — broken claims create negative attitude change that is extremely resistant to correction.

### Affective Formation (Feeling-Based)

Built on emotional responses. The pixel art HQ makes people feel creative. The flagship essay makes people feel seen. The terminal aesthetic makes developers feel at home.

**Mere exposure effect:** Repeated exposure → increased positive evaluation. BUT there is a **wear-out threshold.** Too much repetition of the same execution makes people increasingly negative.

**Application:**
- Rotate creative executions while keeping brand constants
- Same tagline but different visual treatments across the 30 sites
- New pixel art, new logo CSS treatments — keep the brand fresh while the identity stays locked

**Classical conditioning in advertising:** Pair BlackRoad with stimuli that already evoke positive feelings:
- Developer culture (terminal, code, open source ethos)
- Sovereignty / independence (self-hosted, local-first, your data)
- Craftsmanship (hand-built on Pis, not rented from AWS)

### Behavioral Formation (Action-Based)

People infer attitudes from their own behavior. "I deployed a BlackRoad agent → I must think it's good."

**Application:** Get people to DO something with BlackRoad as early as possible.
- Free tier / trial
- One-click deploy templates
- Interactive demos
- "Try it now" CTAs that reduce friction to zero

### Attitude Strength

Strong attitudes resist change and predict behavior. Five factors:
1. **Accessibility** — how quickly they think of us (build with repetition)
2. **Importance** — how personally relevant (match to their problems)
3. **Knowledge** — how much they know (provide depth)
4. **Certainty** — how confident they are (social proof, testimonials)
5. **Ambivalence** — mixed feelings reduce prediction (eliminate confusion in messaging)

**Pre-ship checklist:**
- [ ] Does this piece form attitudes through cognition, affect, or behavior?
- [ ] Are all factual claims verified? (Cognitive pathway requires truth)
- [ ] Is there an emotional hook? (Affective pathway requires feeling)
- [ ] Is there a low-friction action? (Behavioral pathway requires doing)
- [ ] Does this increase attitude strength on at least one dimension?

---

## 5. Persuasion Models

Three operational models. Use the right one for the right situation.

### Model 1: Cognitive Response Model

The audience is actively processing. They generate thoughts — favorable or unfavorable — in response to your arguments.

**Strong arguments → favorable thoughts → persuasion**
**Weak arguments → unfavorable thoughts → rejection or negative change**

**Operating rule:** If the audience will think about your message, your arguments must be airtight. Weak arguments with a thinking audience is worse than no message at all.

**Application:**
- Blog posts, whitepapers, technical docs → strong arguments only
- Every claim must survive counterarguing: "But what about...?"
- Pre-test by asking: what would a skeptical developer think reading this?

**Distraction reduces counterarguing.** When people are distracted (scrolling, multitasking), they counterargue less. This means peripheral-route content (social posts, display ads) can get away with simpler claims. Central-route content cannot.

### Model 2: Elaboration Likelihood Model (ELM)

Decision tree for every piece of content:

```
Is the audience motivated AND able to process?
├── YES → Central Route
│   └── Use strong arguments, evidence, technical depth
│   └── Result: lasting attitude change
└── NO → Peripheral Route
    └── Use design quality, social proof, brand cues, emotion
    └── Result: temporary change (reinforce with repetition)
```

**Three differences between routes:**
1. Amount of cognitive effort (high vs. low)
2. Type of information used (arguments vs. cues)
3. Durability of change (lasting vs. temporary)

### Model 3: Theory of Planned Behavior (TPB)

For campaigns targeting specific behavior (sign up, deploy, purchase):

**Behavior is predicted by intention. Intention has three inputs:**

1. **Attitude** — "Do I think this is good?" (shaped by beliefs about outcomes)
2. **Subjective Norms** — "Do people like me do this?" (shaped by social proof)
3. **Perceived Behavioral Control** — "Can I actually do this?" (shaped by efficacy beliefs)

**Campaign design protocol:**
1. Define the target behavior (e.g., "deploy first BlackRoad agent")
2. Research which input is the bottleneck:
   - If attitude: they don't believe it works → show evidence
   - If norms: they think nobody else does it → show community, user counts, testimonials
   - If control: they think it's too hard → show tutorials, one-click deploys, support
3. Target the specific beliefs behind the bottleneck
4. Measure intention change, then behavior change

**Pre-ship checklist:**
- [ ] Which persuasion model applies to this audience/channel?
- [ ] If Cognitive Response: can every argument survive counterarguing?
- [ ] If ELM: is the route matched to audience motivation/ability?
- [ ] If TPB: which input (attitude/norms/control) is the bottleneck?

---

## 6. Behavior Change Framework

Attitude change is not behavior change. This section covers the gap.

### Explicit vs. Implicit Attitude-Behavior Link

- When people are **motivated and able** → explicit (conscious) attitudes drive behavior
- When people are **rushed, distracted, or depleted** → implicit (nonconscious) attitudes drive behavior

**Application:** Brand familiarity (implicit) matters MORE in impulse/low-consideration decisions. When someone is quickly choosing between tools, the one they've seen more often wins — even if they've never consciously evaluated it.

### Ego Depletion

When mental energy is low, self-control drops. People become more susceptible to persuasion and impulse.

**Application (ethical):** Do NOT exploit depletion. BlackRoad's brand is sovereignty and agency. We design for informed decisions, not depleted ones. This is a competitive differentiator — we're the brand that respects your attention.

### Habits and Brand Loyalty

Habits form when behavior is performed frequently under stable conditions. Once habitual, past behavior predicts future behavior better than intentions.

**Application:**
- Get users into a daily workflow with BlackRoad tools (monitoring dashboard, agent status, deploy scripts)
- Habitual users are immune to competitor marketing
- Breaking competitor habits requires disrupting the stable conditions (new category, new problem, new context)

### Goal Alignment

People have four purchasing goal types:
1. **Utilitarian** — "I need infrastructure" → show specs, reliability, cost
2. **Self-expression** — "I want to project technical competence" → show the aesthetic, the culture
3. **Identity** — "This is who I am" → "BlackRoad operators" as identity
4. **Hedonic** — "This is fun to use" → pixel art, HQ metaverse, the vibe

**Match the message to the goal.** A utilitarian buyer shown hedonic content bounces. A hedonic buyer shown spec sheets bounces.

**Pre-ship checklist:**
- [ ] Are we designing for conscious or automatic decision-making?
- [ ] Are we respecting the user's cognitive state? (No dark patterns)
- [ ] Does this create a habit loop? (Trigger → routine → reward)
- [ ] Which purchasing goal does this content serve?

---

## 7. Compliance Principles

Seven research-proven principles for getting someone to say yes. Use ethically — these work because they bypass conscious processing.

### 1. Reciprocity

Give first, then ask. Free tools, free content, free templates → they feel obligated to reciprocate (sign up, share, purchase).

**BlackRoad application:**
- Open source repos (275+) = massive reciprocity bank
- Free blog content with real insights (not gated fluff)
- Free tier of RoadPay / products
- "That's-not-all" technique: "4 plans + 4 add-ons, and the first month is free"

### 2. Commitment / Consistency

Once someone takes a small step, they're more likely to take the next consistent step.

**BlackRoad application:**
- **Foot-in-the-door:** Star a repo → try a deploy → become a user → become a paying customer
- **Four walls technique:** "Do you care about data sovereignty? Do you want to own your AI? Do you want to stop paying cloud bills? Then you need BlackRoad."
- Each yes builds commitment to the next yes

### 3. Social Validation

People do what similar others do. Especially under uncertainty.

**BlackRoad application:**
- User counts (real, verified)
- GitHub stars and forks
- Testimonials from developers in similar roles
- "Join X operators already running BlackRoad"
- Community channels showing real activity

### 4. Liking

People comply with people they like. Similarity, attractiveness, familiarity, association.

**BlackRoad application:**
- Alexa as relatable founder (developer who builds from a Mac Mini, not a VC-backed CEO)
- Brand personality = technically competent, unpretentious, builder culture
- "Pick up your agent. Ride the BlackRoad together." = friendship framing

### 5. Scarcity

Scarce opportunities are valued higher.

**BlackRoad application:**
- Early adopter pricing
- Limited beta access
- "Only X spots in the first cohort"
- Time-limited offers on RoadPay plans

### 6. Authority

People follow legitimate authorities.

**BlackRoad application:**
- Technical depth in content = expertise signal
- Series 7/24/65/66 licensing = financial authority (for RoadPay/fintech positioning)
- University credentials (UMN coursework) applied to marketing strategy
- "Built by someone who passed the same exams Wall Street requires"

### 7. Confusion (Disrupt-Then-Reframe)

Slight confusion disrupts counterarguing, then a clear reframe lands the message.

**BlackRoad application:**
- "52 TOPS of neural compute. That's 52 trillion operations per second. On two $50 boards in a closet. For the price of one month of cloud GPU."
- The disruption (TOPS) forces processing. The reframe (price comparison) lands.

**Pre-ship checklist:**
- [ ] Which compliance principles does this piece activate?
- [ ] Is reciprocity established before the ask?
- [ ] Is there a commitment ladder (small → medium → large ask)?
- [ ] Is social proof real and verifiable?
- [ ] Is scarcity genuine? (Never manufacture false scarcity)

---

## 8. Personalization Operations

Personalization increases effectiveness but creates a paradox: too personal = creepy. Too generic = irrelevant.

### The Privacy Calculus

Personalization works when **perceived benefits > perceived costs.**

Benefits: relevance, time saved, better recommendations
Costs: privacy loss, feeling surveilled, loss of control

**Operating rule:** Always make the value exchange explicit and fair. "We use your deploy history to suggest relevant agents" > silently tracking and retargeting.

### Self-Referencing Theory

People prefer messages that match their self-concept. "This message is for me" increases processing and positive evaluation.

**BUT:** When personalization is TOO obviously self-referential, it triggers scrutiny (shifts to central route processing). The person starts asking "how do they know this about me?" instead of processing the message.

**Application:**
- Segment by role (developer, founder, ops engineer) not by personal data
- Match content to declared interests, not inferred surveillance
- "For developers who self-host" = good personalization
- "Hey [name], we noticed you visited our pricing page 3 times" = creepy

### Seven Personalization Strategies (Ranked for BlackRoad)

1. **On-site personalization** — recommender systems based on behavior on our sites
2. **Email segmentation** — different content for different user types
3. **Social media targeting** — role/interest-based, not personal-data-based
4. **Content customization** — different landing pages for different entry points
5. **App notifications** — for RoadPay/product users based on usage patterns
6. **Price differentiation** — tiered pricing by usage, not by ability-to-pay surveillance
7. **Behavioral advertising** — use sparingly, always with clear value exchange

### Data Ethics

- **First-party data only** where possible (our own analytics, user surveys, deploy telemetry)
- **No third-party data purchasing** — this violates BlackRoad's sovereignty positioning
- Deterministic data > probabilistic data (know, don't guess)
- Explicit opt-in for all personalization
- Easy opt-out with no penalty

**Pre-ship checklist:**
- [ ] Is the personalization benefit > privacy cost for the user?
- [ ] Is this segment-based or surveillance-based? (Only segment-based)
- [ ] Would I feel comfortable if a user saw exactly how we targeted them?
- [ ] Is there explicit opt-in? Easy opt-out?

---

## 9. Multiscreening & Synced Advertising

People use multiple screens simultaneously. This is not a problem — it's an opportunity.

### The Research

- Multitasking **reduces memory** for ads (negative)
- Multitasking **reduces counterarguing** (positive for persuasion)
- **Related content across screens** improves brand memory vs. unrelated content

### Synced Advertising Strategy

When a user encounters BlackRoad on one screen, related content on a second screen creates synergy effects (1+1=3).

**Application:**
- Blog post on laptop + related social post on phone = reinforcement
- GitHub repo on desktop + newsletter in email = synced exposure
- Product page on browser + push notification about the same product = timed reinforcement

### Three Syncing Principles

1. **Task relevance** — second-screen content related to primary task increases processing
2. **Congruency** — matched themes across screens (don't show pixel art when they're reading technical docs)
3. **Repetition with variation** — same message, different format across screens

**Pre-ship checklist:**
- [ ] Does this content have a companion piece on another channel?
- [ ] Are cross-channel messages thematically congruent?
- [ ] Is the same message varied (not copy-pasted) across channels?

---

## 10. Packaging & Embodied Cognition

How things LOOK and FEEL affects what people THINK. This is not metaphor — it's neuroscience.

### The Principle

Cognition is embodied. Physical sensations influence abstract judgments:
- **Height = power** (upward camera angles convey authority)
- **Weight = importance** (heavier objects feel more significant)
- **Warmth = personality** (warm color palettes convey friendliness)
- **Smoothness = ease** (clean UI = easy-to-use product)

### BlackRoad Design Implications

- **Black background** = authority, premium, technical depth
- **Gradient shapes** = dynamic, modern, in motion (not static)
- **Space Grotesk font** = geometric, technical, confident
- **JetBrains Mono** = developer-native, honest, functional
- **Hot pink accents** = unexpected warmth against technical coldness
- **Terminal aesthetic** = "this is real software, not a marketing site"

### Packaging as Heuristic

Design is not consciously perceived as a persuasive cue — it functions as an **unconscious shortcut.** People don't think "this website looks professional, therefore the product is good." They just feel "this product is good" and the design is why.

**Pre-ship checklist:**
- [ ] Does the visual design match the product's intended perception?
- [ ] Are physical metaphors consistent? (Technical = angular. Friendly = rounded.)
- [ ] Would changing the design change what people think the product IS?

---

## 11. Audience Segmentation Psychology

Not all audiences process the same way. Segment by psychology, not just demographics.

### Psychological Segmentation Dimensions

**By processing style:**
- High involvement + low experience = **Extended Problem Solvers** → need comprehensive information, comparisons, guides
- High involvement + high experience = **Brand Loyal** → need reinforcement, community, identity
- Low involvement + low experience = **Limited Problem Solvers** → need simple value props, social proof
- Low involvement + high experience = **Habitual** → need availability, convenience, no friction

**By attitude function:**
- **Adjustment seekers** = maximize reward, minimize cost → show ROI, pricing, savings
- **Value-expressive** = reflect their values → show sovereignty, open source, self-hosted ethos
- **Ego-defensive** = protect self-esteem → show "you're not behind, the tools just moved without you"
- **Knowledge seekers** = understand the world → show architecture docs, technical deep-dives

**By purchasing goal:**
- Utilitarian → specs and reliability
- Self-expression → community and culture
- Identity → "BlackRoad operator" belonging
- Hedonic → pixel art, metaverse, the fun

### BlackRoad Primary Segments

1. **Sovereign Developers** — value: own their stack. Process: central route. Goal: utilitarian + identity.
2. **AI-Curious Founders** — value: competitive edge. Process: peripheral then central. Goal: utilitarian + self-expression.
3. **Privacy-First Users** — value: data sovereignty. Process: central (high motivation). Goal: value-expressive.
4. **Tinkerers / Hobbyists** — value: building cool things. Process: peripheral (browse, discover). Goal: hedonic + identity.

**Pre-ship checklist:**
- [ ] Which segment is this content for?
- [ ] Does the processing style match the content depth?
- [ ] Does the attitude function match the value proposition?
- [ ] Does the purchasing goal match the CTA?

---

## 12. Campaign Planning System

Every campaign follows this eight-element structure. No exceptions.

### Element 1: Situation Analysis (SWOT)

| | Positive | Negative |
|---|---|---|
| **Internal** | Strengths (we control) | Weaknesses (we control) |
| **External** | Opportunities (we exploit) | Threats (we adapt to) |

Run SWOT before every campaign. Update quarterly.

### Element 2: Objectives

Format: **[Who] will [do what] by [when]**

- Must be measurable
- Must have a deadline
- Must specify the audience
- "Increase awareness" is NOT an objective. "500 developers will star the main repo by Q2" IS.

### Element 3: Audience (STP)

1. **Segment** the market (use psychological dimensions above)
2. **Target** specific segments (max 2-3 per campaign)
3. **Position** BlackRoad distinctly for each segment

### Element 4: Strategy

- Key messages (max 3 per campaign)
- Tagline deployment
- Positioning statement
- Central vs. peripheral route decision per channel

### Element 5: Tactics

Specific deliverables:
- Blog posts (count, topics, publish dates)
- Social posts (platform, frequency, content type)
- Email sequences (segments, triggers, content)
- Landing pages (one per segment)
- Paid campaigns (budget, targeting, creative)

### Element 6: Calendar

Map tactics to dates. Include:
- Content creation deadlines
- Review/approval dates
- Publish dates
- Measurement checkpoints

### Element 7: Budget

Use **objective-task method**: what do we need to accomplish → what will it cost.

- Staff time = ~70% of budget
- Out-of-pocket = tools, ads, production
- Add 10% contingency
- Never budget by "what's left over"

### Element 8: Evaluation

Define success metrics BEFORE launch:
- Awareness metrics (impressions, reach, brand search volume)
- Consideration metrics (clicks, time on site, email opens)
- Conversion metrics (signups, deploys, purchases)
- Advocacy metrics (shares, referrals, reviews)

---

## 13. Channel Operations (PESO)

Every message reaches the audience through one of four channel types. Use all four.

### Paid

Money exchanged for placement.

**BlackRoad channels:** Google Ads (paid search), social media ads, sponsored content, display ads
**Psychology principle:** Peripheral route. Must capture attention in <3 seconds. Use salience + novelty.
**Measurement:** CPC, CPM, ROAS, conversion rate

### Earned

Third-party coverage without payment.

**BlackRoad channels:** Developer blog mentions, tech press, GitHub trending, community forums
**Psychology principle:** Authority + social validation. Earned media carries highest credibility because it's not paid.
**Measurement:** Media mentions, share of voice, backlinks, referral traffic

### Shared

Audience amplification through social platforms.

**BlackRoad channels:** Twitter/X, GitHub social features, Reddit, Discord, community Slack
**Psychology principle:** Social validation + liking. People share what makes them look good.
**Content rule:** 80% inform/educate/entertain, 20% promote. Violate this and engagement drops.
**Measurement:** Shares, comments, engagement rate, community growth

### Owned

Content we build and control.

**BlackRoad channels:** 30 websites, blog, documentation, email lists, RoadSearch, Gitea repos
**Psychology principle:** Central route. Owned content is where depth lives. This is where attitudes form and strengthen.
**Measurement:** Traffic, time on site, pages per session, email list growth, search rankings

### Integration Rule

A message in only one channel = wasted potential. Every key message should appear in all four:
- **Paid** drives discovery
- **Earned** builds credibility
- **Shared** creates social proof
- **Owned** provides depth and conversion

---

## 14. Crisis Response Protocol

Based on Coombs' Situational Crisis Communication Theory (SCCT).

### Phase 1: Information (Immediate)

**Step 1 — Instructing Information (First 30 minutes)**
- Protect users from harm (data, service, security)
- Be honest about what you know and don't know
- "We are investigating and will update within [timeframe]"
- NEVER say "no comment"

**Step 2 — Adjusting Information (First 24 hours)**
- Explain what happened
- Explain what is being done to prevent recurrence
- Show empathy for affected users

### Phase 2: Reputation Management (Days 2-7)

Choose response posture based on responsibility level:

| Responsibility | Posture | Actions |
|---|---|---|
| **Rumor/false claim** | Denial | Correct the record with facts. Attack the claim, not the person. |
| **Low responsibility** | Diminish | Explain context. "This was not intentional." Justify proportionality. |
| **Shared responsibility** | Rebuild | Compensate affected users. Explain fixes. |
| **Primary responsibility** | Rebuild + Apologize | Full apology. Compensation. Systemic fix. Public post-mortem. |

**Always available — Bolstering:** Remind stakeholders of track record, community contributions, past reliability.

### Standing Rules

- First response sets the frame — get it right
- Consistency across all channels (one voice, one message)
- Be available to the community
- Prioritize users over organization
- Social media requires monitoring AND response
- Document everything for post-incident review

---

## 15. Measurement & Evaluation

### Funnel Metrics

| Stage | Metric | Tool |
|---|---|---|
| Awareness | Impressions, reach, brand search volume | Analytics, Search Console |
| Interest | Click-through rate, time on site | Analytics |
| Consideration | Email signups, return visits, content downloads | CRM, Analytics |
| Intent | Pricing page visits, cart additions, demo requests | Analytics, RoadPay |
| Conversion | Signups, deploys, purchases | RoadPay, product analytics |
| Retention | Monthly active users, churn rate | Product analytics |
| Advocacy | Referrals, reviews, social shares | CRM, social monitoring |

### A/B Testing Protocol

1. Test ONE variable at a time
2. Send both versions simultaneously
3. Minimum sample size before declaring winner
4. Keep winner, iterate on next variable
5. Test: subject lines, CTAs, images, copy length, headlines, button colors, page layouts

### Attribution

- **Last-touch attribution** = which channel gets credit for the conversion
- **Multi-touch attribution** = which channels contributed along the journey
- Use multi-touch. A blog post (owned) that was found through search (earned/paid) and shared on social (shared) deserves distributed credit.

### Reporting Cadence

- **Weekly:** Channel performance, content performance, anomalies
- **Monthly:** Funnel conversion rates, audience growth, campaign progress vs. objectives
- **Quarterly:** SWOT update, strategy review, objective assessment, budget reallocation

---

## Appendix A: Comprehension Traps to Avoid

Research shows 80% of advertisements are misunderstood. Four tactics advertisers use that we should be AWARE of (to avoid accidentally deploying them AND to recognize when competitors use them):

1. **Omitted comparisons** — "The most powerful agent platform" → more powerful than what?
2. **Pragmatic inference** — "May be the best AI OS" → may also not be
3. **Juxtaposition** — "Smart developers choose BlackRoad" → implies causation
4. **Affirmation of the consequent** — "If you want sovereignty, you need BlackRoad" → false logical structure

**BlackRoad rule:** Make claims that are literally, specifically, and verifiably true. "Runs 16 Ollama models on a Raspberry Pi 5" is a fact. "The best AI platform" is nothing.

---

## Appendix B: The Truth Effect

The more people see a claim, the more true it seems — regardless of whether it IS true. This is the **sleeper effect** combined with **hedonic fluency.**

**Ethical application:** Repeat TRUE claims frequently. Our verified stats (52 TOPS, 5 nodes, 50 skills, 275+ repos) should appear everywhere, repeatedly, consistently. Repetition makes truth stickier.

**Ethical guardrail:** Never repeat claims we can't verify. The truth effect works on false claims too — which is why we killed "30K agents." Once a false claim gets repeated enough, correcting it becomes nearly impossible.

---

## Appendix C: Quick Reference — When to Use What

| Situation | Primary Model | Key Principle |
|---|---|---|
| Writing a blog post | Cognitive Response | Arguments must survive counterarguing |
| Designing a landing page hero | ELM (Peripheral) | 3-second salience + brand cue |
| Planning a sign-up campaign | TPB | Identify bottleneck: attitude, norms, or control |
| Creating social content | Compliance (Social Validation) | Show what similar others are doing |
| Pricing page | Compliance (Scarcity + Authority) | Limited offers + expertise signals |
| Email nurture sequence | Commitment/Consistency | Small yes → medium yes → big yes |
| Handling a security incident | Crisis Protocol (SCCT) | Instruct → adjust → rebuild |
| Launching a new product | Attention (Novelty + Vividness) | Defy expectations with concrete details |
| Retaining existing users | Behavior Change (Habits) | Build daily workflow integration |
| Expanding to new segment | Segmentation + Personalization | Match message to psychological profile |

---

*This manual is a living document. Update it when new research is applied, new campaigns teach us something, or when a principle is proven wrong in practice. Log updates through the memory system.*

*BlackRoad OS — Pave Tomorrow.*
