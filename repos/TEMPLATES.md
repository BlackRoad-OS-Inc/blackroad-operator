# BlackRoad Marketing Templates

Fill-in-the-blank templates for every channel. Each template names its psychological principle, provides the structure with blanks (`[___]`), includes a BlackRoad example, and ends with a pre-ship checklist.

---

## 1. Video Script (60-second)

**Psychological Basis:** Primacy/Recency Effect + Elaboration Likelihood Model (ELM)

The first and last things people see carry disproportionate weight (primacy/recency). Under low-attention conditions (social feeds, pre-roll), the peripheral route dominates — visuals, music, and emotional tone do more than arguments. Hook peripherally in 3 seconds, then shift to central-route proof for the engaged viewer.

### Template

```
[0-3s] HOOK (peripheral — visual/sound/question that interrupts scroll)
"[Provocative question or striking visual description]"

[3-10s] PROBLEM
"[Describe the pain point the audience feels daily. Use 'you' language.]"

[10-20s] SOLUTION
"[Introduce the product/brand as the answer. One clear sentence.]"

[20-35s] PROOF
"[Show the product working. Data point, demo, or testimonial clip.]"
[On-screen text: ___]

[35-50s] EXPAND
"[Reinforce with a second proof point or emotional payoff.]"

[50-60s] CTA (recency — the last thing they remember)
"[Single, specific action. URL or next step on screen.]"
[End card: logo + tagline + URL]
```

### BlackRoad Example

```
[0-3s] HOOK
A black terminal cursor blinks. Text types itself: "What if your AI never phoned home?"

[3-10s] PROBLEM
"Every AI tool you use sends your data to someone else's server.
Your prompts. Your code. Your ideas. Gone."

[10-20s] SOLUTION
"BlackRoad OS runs 50 AI skills across your own hardware.
Five nodes. Zero cloud dependency."

[20-35s] PROOF
Show split-screen: 5 Raspberry Pis, terminal running queries.
On-screen text: "52 TOPS. 16 local models. 228 databases."

[35-50s] EXPAND
"Search your own knowledge. Deploy your own agents.
Own the road you're building on."

[50-60s] CTA
"Start at blackroad.io"
End card: BlackRoad logo + "Pave Tomorrow." + blackroad.io
```

### Pre-Ship Checklist

- [ ] Hook works with sound OFF (captions/visuals carry the message)
- [ ] Problem statement uses second-person ("you") not third-person
- [ ] Proof is verifiable — no inflated numbers
- [ ] CTA is one action, not two
- [ ] Total runtime is 58-62 seconds (platforms penalize exact boundaries)
- [ ] End card holds for minimum 3 seconds
- [ ] Tested on mobile at 9:16 AND desktop at 16:9
- [ ] Brand colors (black bg, white text, gradient accents) are present
- [ ] Tagline "Pave Tomorrow." appears in end card

---

## 2. Pitch Deck (10 Slides)

**Psychological Basis:** Commitment/Consistency (Cialdini)

Each slide is designed to extract a small mental "yes" from the audience. Once someone agrees the problem is real (slide 1), consistency pressure makes them more likely to agree your solution is valid (slide 2), and so on. By the Ask slide, they have said yes nine times already.

### Template

```
SLIDE 1 — PROBLEM
[One sentence describing a painful, widespread problem.]
[Data point proving it is real and large.]
[The micro-yes: "This problem exists and matters."]

SLIDE 2 — SOLUTION
[One sentence: what you built and what it does.]
[How it solves the problem from Slide 1 — direct causal link.]
[The micro-yes: "That would solve it."]

SLIDE 3 — MARKET
[TAM / SAM / SOM with sources.]
[Who is the buyer? What do they spend today?]
[The micro-yes: "There is money here."]

SLIDE 4 — PRODUCT
[Screenshot or diagram. What does the user actually see/do?]
[3 key features, each in one line.]
[The micro-yes: "This is real, not vaporware."]

SLIDE 5 — TRACTION
[Users, revenue, growth rate, retention — whatever you have.]
[Timeline: when did you start, where are you now?]
[The micro-yes: "Other people want this."]

SLIDE 6 — TEAM
[Founders + key hires. Why THIS team for THIS problem?]
[Relevant experience only — no padding.]
[The micro-yes: "They can execute."]

SLIDE 7 — BUSINESS MODEL
[How you make money. Price points. Unit economics if available.]
[Customer acquisition cost vs. lifetime value.]
[The micro-yes: "The math works."]

SLIDE 8 — COMPETITION
[2x2 matrix or comparison table. Be honest about competitors.]
[Your unique advantage in one phrase.]
[The micro-yes: "They have a defensible angle."]

SLIDE 9 — FINANCIALS
[18-month projection. Key assumptions stated explicitly.]
[Burn rate, runway, path to profitability.]
[The micro-yes: "This is a reasonable plan."]

SLIDE 10 — ASK
[Exactly how much you are raising and what it buys.]
[3 milestones the money will hit.]
[The micro-yes: "I should take the next meeting."]
```

### BlackRoad Example

```
SLIDE 1 — PROBLEM
"AI tools require you to surrender your data to third-party clouds.
87% of enterprises cite data sovereignty as their top AI concern."

SLIDE 2 — SOLUTION
"BlackRoad OS: a sovereign AI operating system that runs entirely
on local hardware. 50 skills, 16 models, zero external dependencies."

SLIDE 3 — MARKET
TAM: $47B (edge AI, 2027 est.)
SAM: $3.2B (self-hosted AI infrastructure)
SOM: $120M (privacy-first SMBs + agencies)

SLIDE 4 — PRODUCT
[Screenshot of terminal + dashboard]
- Mesh network across commodity hardware (Raspberry Pi fleet)
- RAG with local vector DB (Qdrant + nomic-embed-text)
- NATS pub/sub for real-time agent coordination

SLIDE 5 — TRACTION
- 275+ repos, 207 on self-hosted Gitea
- 42 authenticated users on auth.blackroad.io
- 20 custom domains, 95+ deployed sites
- 30 cross-linked ecosystem sites

SLIDE 6 — TEAM
Alexa — sales, finance, real estate background.
Built the entire stack solo: 5 nodes, 400+ scripts, full deployment pipeline.

SLIDE 7 — BUSINESS MODEL
RoadPay: 4 plans + 4 add-ons, self-hosted billing via D1.
Stripe handles card charging; we own the subscription logic.

SLIDE 8 — COMPETITION
[2x2: Sovereignty vs. Capability]
AWS/Azure: high capability, zero sovereignty.
Local LLM tools: some sovereignty, single-node only.
BlackRoad: full sovereignty + multi-node mesh + production tooling.

SLIDE 9 — FINANCIALS
Infrastructure cost: 5 Pis + 2 droplets = ~$60/mo.
Revenue target: $10K MRR by month 12.
Path: 200 users at $50/mo average plan.

SLIDE 10 — ASK
"Raising $500K to hire 2 engineers and scale to 1,000 nodes.
Milestones: (1) managed hosting product, (2) 500 users, (3) $50K MRR."
```

### Pre-Ship Checklist

- [ ] Each slide has ONE idea, not three
- [ ] No slide has more than 30 words (the deck supports your voice, it does not replace it)
- [ ] Problem slide uses external data, not your opinion
- [ ] Traction slide uses real, verified numbers
- [ ] Competition slide acknowledges at least one competitor strength
- [ ] Ask slide states exact dollar amount and exact use of funds
- [ ] Fonts: Space Grotesk for headings, Inter for body
- [ ] Slides are black background, white text, gradient accents
- [ ] Exported as PDF (not just .pptx) for universal compatibility
- [ ] Deck tells a coherent story if read without narration

---

## 3. Press Release

**Psychological Basis:** Authority (Cialdini) + Earned Media Framing

A press release borrows the authority frame of journalism. By writing in the inverted pyramid structure that journalists expect, you make it easy for them to publish — and the resulting article carries the implicit authority of the publication. Third-party credibility is more persuasive than self-promotion.

### Template

```
FOR IMMEDIATE RELEASE

[HEADLINE: Action verb + company + what happened + why it matters]
[Subhead: One sentence expanding the headline with a specific detail]

[CITY, STATE] — [DATE] — [LEAD PARAGRAPH: Who did what, when, where,
why, and why anyone should care. The entire story in 2 sentences.]

[BODY PARAGRAPH 1: Context. Why does this matter to the industry or
audience? Include a data point or trend.]

[BODY PARAGRAPH 2: Details of the announcement. Features, availability,
pricing, partnerships — the specifics.]

[QUOTE from company leader:]
"[First sentence: vision or emotion. Second sentence: specific fact
or forward-looking statement.]"
— [Name], [Title], [Company]

[OPTIONAL: Quote from partner, customer, or analyst]

[BODY PARAGRAPH 3: Availability, pricing, how to access.]

ABOUT [COMPANY]
[Boilerplate: 3-4 sentences. What the company does, when founded,
key stats, mission. This stays the same across all releases.]

MEDIA CONTACT
[Name]
[Email]
[Phone]
[URL]
```

### BlackRoad Example

```
FOR IMMEDIATE RELEASE

BlackRoad OS Launches Sovereign AI Platform Running Entirely on Local Hardware
Self-hosted operating system delivers 50 AI skills across a 5-node
Raspberry Pi mesh with zero cloud dependency

MINNEAPOLIS, MN — March 14, 2026 — BlackRoad today announced the
general availability of BlackRoad OS, a sovereign AI operating system
that runs 16 language models, 50 AI skills, and a full knowledge graph
on commodity hardware without sending a single byte to external servers.

As enterprises face mounting pressure to control their AI data pipelines,
BlackRoad OS offers an alternative to cloud-dependent AI platforms.
The system runs on a mesh of Raspberry Pi nodes delivering 52 TOPS
of combined AI processing power.

Key capabilities include local RAG with Qdrant vector search, NATS-based
real-time agent coordination, and a self-hosted billing system (RoadPay)
for monetizing AI services without third-party payment logic dependencies.

"We built BlackRoad because sovereignty is not a feature — it is the
foundation. Every prompt, every model, every decision stays on hardware
you own."
— Alexa, Founder, BlackRoad

BlackRoad OS is available now at blackroad.io. Plans start at $50/month
through the RoadPay billing system.

ABOUT BLACKROAD
BlackRoad builds sovereign AI infrastructure for people who refuse to
rent their intelligence. Founded in 2025, the platform spans 275+
repositories, 20 custom domains, and a 5-node edge computing mesh.
BlackRoad OS — Pave Tomorrow.

MEDIA CONTACT
Alexa
amundsonalexa@gmail.com
blackroad.io
```

### Pre-Ship Checklist

- [ ] Headline contains an action verb (not "is" or "has")
- [ ] Lead paragraph answers who/what/when/where/why in two sentences
- [ ] All numbers are verified and sourced
- [ ] Quote sounds like a human said it, not like marketing wrote it
- [ ] Boilerplate is identical to the last press release you sent
- [ ] No exclamation marks anywhere in the document
- [ ] Contact info is current and monitored
- [ ] Sent to journalists BEFORE posting publicly (they want exclusivity)
- [ ] Formatted in plain text (no HTML, no attachments) for email distribution
- [ ] Dateline city matches your actual location

---

## 4. Product Launch Announcement

**Psychological Basis:** Scarcity (Cialdini) + Novelty Bias

Scarcity increases perceived value — limited availability, early access, and countdown timers all trigger urgency. Novelty bias means humans pay more attention to new things simply because they are new. Combine them: announce something new, then constrain access to it.

### Template

```
PHASE 1 — TEASER (1-2 weeks before launch)
Subject/Headline: "[Cryptic hint at what is coming. No product name yet.]"
Body: "[1-2 sentences hinting at the problem you are about to solve.
No details. End with a date.]"
CTA: "[Join waitlist / Follow for updates]"

PHASE 2 — REVEAL (Launch day)
Subject/Headline: "Introducing [Product Name]: [One-line value prop]"
Body:
"[Opening line: what it is in plain language.]

[3-5 key features, each as a single sentence with a bold lead word:]
- **[Feature 1]**: [What it does for the user.]
- **[Feature 2]**: [What it does for the user.]
- **[Feature 3]**: [What it does for the user.]
- **[Feature 4]**: [What it does for the user.]
- **[Feature 5]**: [What it does for the user.]

[Social proof: early users, beta results, or credible endorsement.]

[Availability + scarcity element:]
[Available now / Available to first N users / Early pricing until DATE]

[Price, if applicable.]"

CTA: "[Get started / Claim your spot / Try it free]"
URL: [___]

PHASE 3 — FOLLOW-UP (1-3 days post-launch)
Subject/Headline: "[Traction update: X users signed up / X features shipped]"
Body: "[Share momentum. What happened since launch? What is next?]"
CTA: "[Last chance / Still available / See what people are saying]"
```

### BlackRoad Example

```
PHASE 1 — TEASER
Subject: "What if search actually knew you?"
Body: "We have been building something for the past 6 months. It searches
everything you have ever written, built, or bookmarked — and it runs on
hardware you own. March 14."
CTA: "Join the waitlist at blackroad.io/search"

PHASE 2 — REVEAL
Subject: "Introducing RoadSearch: AI-Powered Search That Lives on Your Machine"
Body:
"RoadSearch is a self-hosted search engine with D1 FTS5 indexing
and AI-generated answers via local Ollama models.

- **Instant**: Full-text search across 29 pages in <50ms.
- **Private**: Queries never leave your network.
- **Smart**: AI answers synthesized from your own knowledge base.
- **Integrated**: /search route drops into any existing site.
- **Sovereign**: Runs on a Raspberry Pi. No cloud. No subscription to someone else.

Beta users indexed 156,675 entries across 228 databases in the first week.

Available now. Free during beta. Self-host at road-search on Gitea."

CTA: "Deploy RoadSearch: blackroad.io/search"

PHASE 3 — FOLLOW-UP
Subject: "RoadSearch: 156K entries indexed in week one"
Body: "Since launch, RoadSearch has indexed 156,675 entries across
228 SQLite databases. Next up: cross-node federated search across
the full BlackRoad mesh. Deploy yours before we close the beta."
CTA: "Get RoadSearch before beta closes"
```

### Pre-Ship Checklist

- [ ] Teaser creates genuine curiosity without being annoyingly vague
- [ ] Reveal headline is understandable by someone who has never heard of you
- [ ] Features are benefits (what it does for the user), not specs
- [ ] Social proof is real — do not fabricate beta user counts
- [ ] Scarcity element is honest (if it is not actually limited, do not say it is)
- [ ] Price is clear or explicitly stated as free/beta
- [ ] CTA link works and lands on the right page
- [ ] Follow-up is scheduled and drafted before launch day
- [ ] All three phases use consistent visual branding
- [ ] Tested email rendering in Gmail, Apple Mail, and Outlook

---

## 5. Testimonial Request Email

**Psychological Basis:** Reciprocity (Cialdini) + Self-Perception Theory (Bem)

Reciprocity: if you have already helped them (good product, good support), they feel an obligation to give back. Self-Perception Theory: when people articulate why they like something, they convince themselves they like it even more. Asking for a testimonial strengthens the customer's own commitment.

### Template

```
Subject: [Quick question — would you share your experience with [Product]?]

Hi [First Name],

[Personalized opening referencing something specific they have done
with your product. Show you know them, not just their email address.]

[The ask — simple and specific:]
Would you be willing to share a sentence or two about your experience?
No pressure at all — I just think your perspective would help others
who are considering [Product].

[Make it easy — provide prompts:]
If it helps, here are a few questions to riff on (answer any, all, or none):
1. What problem were you trying to solve when you found [Product]?
2. What has been the biggest difference since you started using it?
3. Would you recommend it? Why?

[Reduce friction:]
A few sentences in a reply to this email is perfect. No formal anything needed.

[Reciprocity anchor — remind them of value they have received:]
[Reference a specific win they had, a feature they used heavily, or
support you provided.]

Thanks for being part of this,
[Your name]

P.S. [Optional: offer something small in return — early access to a
new feature, a shoutout, a discount. Keep it genuine, not transactional.]
```

### BlackRoad Example

```
Subject: Quick question — would you share your experience with BlackRoad OS?

Hi Jordan,

I noticed you have deployed RoadSearch across three of your internal
knowledge bases — that is exactly the kind of use case we built it for.

Would you be willing to share a sentence or two about your experience?
No pressure at all — I just think your perspective would help others
who are evaluating self-hosted AI search.

If it helps, here are a few questions to riff on:
1. What were you using for internal search before RoadSearch?
2. What changed after you deployed it?
3. Would you recommend it to other teams? Why?

A few sentences in a reply to this email is perfect.

I remember when you hit that FTS5 indexing issue last month and we
got it sorted in about 20 minutes — glad that has been smooth since.

Thanks for being part of this,
Alexa

P.S. If you are up for it, I would love to give you early access to
federated cross-node search before it goes public.
```

### Pre-Ship Checklist

- [ ] Opening line references something SPECIFIC to this person (not generic)
- [ ] The ask is clearly optional ("no pressure")
- [ ] Prompts are provided so they do not face a blank page
- [ ] Response format is low-effort (reply to this email, not fill out a form)
- [ ] Reciprocity anchor references a real interaction or value delivered
- [ ] P.S. offer is genuine, not manipulative
- [ ] You have permission to use their response publicly (state this or follow up)
- [ ] Sent to people who are actually happy (check support tickets first)
- [ ] Personalization fields are all filled in (no `[First Name]` going out)
- [ ] Follow-up scheduled for non-responders (once, not twice)

---

## 6. Competitive Comparison Page

**Psychological Basis:** Two-Sided Messaging (Hovland)

Research consistently shows that acknowledging the other side's strengths makes your overall argument more persuasive, especially with sophisticated audiences. One-sided messaging triggers skepticism. Two-sided messaging builds trust, which makes your advantages land harder.

### Template

```
# [Product] vs. [Competitor]: Honest Comparison

## Who Should Use [Competitor]
[2-3 genuine scenarios where the competitor is the better choice.
This is not sarcasm. Mean it.]

## Who Should Use [Product]
[2-3 scenarios where your product is the better choice.
Be specific about the type of user, not just "everyone."]

## Feature Comparison

| Feature | [Product] | [Competitor] |
|---------|-----------|--------------|
| [Feature 1] | [Your status: Yes/No/Partial + detail] | [Their status + detail] |
| [Feature 2] | [___] | [___] |
| [Feature 3] | [___] | [___] |
| [Feature 4] | [___] | [___] |
| [Feature 5] | [___] | [___] |
| [Feature 6] | [___] | [___] |
| Pricing | [___] | [___] |

## Where [Competitor] Wins
[1-2 paragraphs honestly stating what they do better and why.
This builds your credibility for the next section.]

## Where [Product] Wins
[2-3 paragraphs stating your advantages. Because you were honest above,
this section lands with more force.]

## The Bottom Line
[2-3 sentences summarizing: if you need X, go with them;
if you need Y, come with us.]
```

### BlackRoad Example

```
# BlackRoad OS vs. Replicate: Honest Comparison

## Who Should Use Replicate
- Teams that need access to hundreds of models without managing infrastructure.
- Projects that need GPU-scale compute for training or large batch inference.
- Developers who want to prototype fast and do not yet have privacy requirements.

## Who Should Use BlackRoad OS
- Teams where data sovereignty is non-negotiable (legal, medical, financial).
- Organizations that want to own their AI stack with zero recurring cloud costs.
- Builders who want to run, modify, and extend their models on their own terms.

## Feature Comparison

| Feature | BlackRoad OS | Replicate |
|---------|-------------|-----------|
| Data sovereignty | Full — nothing leaves your hardware | Data processed on Replicate servers |
| Model count | 16 local models (Ollama) | 100s of cloud models |
| GPU compute | 52 TOPS (2x Hailo-8) | Cloud GPU (A100, H100) |
| Setup time | ~2 hours (self-hosted) | Minutes (cloud) |
| Recurring cost | ~$60/mo (hardware + droplets) | Pay-per-inference |
| Offline capability | Full offline operation | Requires internet |
| Pricing | Flat (own your hardware) | Usage-based |

## Where Replicate Wins
Replicate is unbeatable for raw model variety and zero-ops prototyping.
If you need to test 50 different models this week or run a large
fine-tuning job, Replicate gives you instant access to GPU compute
that would cost tens of thousands to self-host. Their API is clean,
their docs are good, and their cold-start times have improved significantly.

## Where BlackRoad OS Wins
BlackRoad OS wins on sovereignty, cost predictability, and extensibility.
Your data never touches an external server. Your costs do not scale with
usage — you own the hardware. And because it is an operating system, not
a service, you can modify anything: routing logic, model selection,
knowledge retrieval, agent behavior. No vendor lock-in, no API rate
limits, no surprise bills.

## The Bottom Line
If you need massive GPU compute and do not have data residency requirements,
Replicate is excellent. If you need to own your AI infrastructure end-to-end
and your workloads fit on edge hardware, BlackRoad OS is what you want.
```

### Pre-Ship Checklist

- [ ] "Where they win" section is genuinely honest (not backhanded compliments)
- [ ] Feature comparison table is factually accurate and current
- [ ] Competitor information is up to date (check their site today)
- [ ] No trademark violations (use their name correctly, no altered logos)
- [ ] Your advantages are specific and verifiable, not vague ("better")
- [ ] Bottom line gives clear decision criteria, not "we are always better"
- [ ] Page has a date stamp so readers know the comparison is current
- [ ] Legal has reviewed for any defamation or false claims
- [ ] CTA for your product is present but not aggressive
- [ ] You would be comfortable if the competitor's CEO read this page

---

## 7. Onboarding Email Sequence (3 Emails)

**Psychological Basis:** Behavioral Attitude Formation (Bem's Self-Perception Theory)

People form attitudes by observing their own behavior. If you get a new user to DO something (even small), they will perceive themselves as someone who uses your product — and then believe they like it. The sequence: act first, reinforce after. Do not explain why they should like you; help them do something, and they will conclude it themselves.

### Template

```
EMAIL 1 — WELCOME (Sent immediately after signup)
Subject: "[Welcome to [Product] — here is your one thing to do]"

Hi [First Name],

[1 sentence: you are in.]

[1 sentence: here is the single most important thing to do right now.
Not three things. One thing.]

[Button/link to do the thing.]

[1 sentence: what happens after they do it. Set the expectation.]

[Sign-off]

---

EMAIL 2 — FIRST WIN (Sent 24-48 hours after signup)
Subject: "[Did you [do the thing]? Here is what to try next.]"

Hi [First Name],

[If they did the thing: acknowledge it. If not: gentle nudge with
the same link.]

[Introduce the second action — something that produces a visible result.
The user should feel a "win" after completing it.]

[Button/link.]

[Social proof: "X other users did this in their first week."]

[Sign-off]

---

EMAIL 3 — DEEPER ENGAGEMENT (Sent 5-7 days after signup)
Subject: "[You have done X — here is what power users do next]"

Hi [First Name],

[Reference what they have accomplished so far.]

[Introduce a more advanced feature or use case. Frame it as leveling up,
not as "you have not used this yet."]

[Link to guide, tutorial, or advanced feature.]

[Community element: invite them to join a group, forum, or channel.]

[Sign-off with personal touch]
```

### BlackRoad Example

```
EMAIL 1 — WELCOME
Subject: "Welcome to BlackRoad OS — deploy your first skill"

Hi Jordan,

You are in. Your BlackRoad OS account is active.

Here is your one thing: deploy your first AI skill. Run this in your terminal:
  blackroad-skills deploy summarize

[Deploy Your First Skill]

Once it is running, you will have a local summarization model responding
to queries in under 2 seconds. Tomorrow I will show you how to connect
it to your knowledge base.

— Alexa

---

EMAIL 2 — FIRST WIN
Subject: "Your summarizer is live — now connect your data"

Hi Jordan,

If you deployed the summarize skill yesterday, nice — you are running
local AI. If not, here is the one-liner again: blackroad-skills deploy summarize

Now try this: point RoadSearch at a folder of documents.
  road-search index ~/documents

[Index Your Documents]

In about 30 seconds, you will be able to search everything in that folder
with AI-powered answers — entirely on your hardware. 89% of BlackRoad
users index their first folder within 48 hours of signup.

— Alexa

---

EMAIL 3 — DEEPER ENGAGEMENT
Subject: "You are indexing locally — here is what power users do next"

Hi Jordan,

You have deployed a skill and indexed your documents. You are running
sovereign AI. Most people never get this far with self-hosted tools.

Power users connect multiple nodes into a mesh. If you have got a second
Pi (or even an old laptop), you can federate your search:
  blackroad-mesh join --node 192.168.x.x

[Set Up Your Mesh]

We also have a community channel where people share their node configs
and custom skills. No spam, no sales — just builders:
blackroad.io/community

— Alexa
```

### Pre-Ship Checklist

- [ ] Email 1 asks for exactly ONE action, not multiple
- [ ] The one action is completable in under 5 minutes
- [ ] Email 2 references Email 1's action (creates continuity)
- [ ] Email 2's "first win" produces a visible result the user can see
- [ ] Email 3 frames advanced features as progression, not neglected features
- [ ] Social proof numbers in Email 2 are real
- [ ] All links/buttons work and go to the right destination
- [ ] Unsubscribe link is present and functional in every email
- [ ] Emails render correctly in plain text (not just HTML)
- [ ] Timing automation is tested (24h, 48h, 5d triggers verified)
- [ ] If the user has not done Email 1's action, Email 2 adapts (branch logic)

---

## 8. Tagline Generator

**Psychological Basis:** Hedonic Fluency (easy to process = feels good) + Mere Exposure (repetition breeds preference)

Taglines that are short, rhythmic, and easy to say get processed more fluently — which the brain interprets as liking. Mere exposure means the more someone encounters your tagline, the more they prefer it. Optimize for brevity and phonetic smoothness.

### Template

```
FORMULA 1 — IMPERATIVE VERB + OBJECT
"[Verb] [Object]."
Structure: Command the audience to do something aspirational.
Examples: "Think Different." / "Just Do It." / "Pave Tomorrow."

FORMULA 2 — [IDENTITY] + FOR + [AUDIENCE]
"[What you are] for [who you serve]."
Structure: Category claim + specific audience.
Examples: "Sovereign AI for sovereign builders."

FORMULA 3 — [CONTRAST] + [RESOLUTION]
"[Unexpected pairing or contradiction that resolves into your value prop.]"
Structure: Tension then release in one phrase.
Examples: "Small hardware. Infinite intelligence."

FORMULA 4 — QUESTION
"[Question that the audience answers with your product.]"
Structure: Interrogative that implies the answer.
Examples: "What if your AI never phoned home?"

FORMULA 5 — [METAPHOR]
"[Concrete image that stands for your abstract value.]"
Structure: Physical thing representing intangible benefit.
Examples: "Your road. Your rules."

FORMULA 6 — RHYME / RHYTHM
"[Phrase with internal rhyme, alliteration, or metric pattern.]"
Structure: Sound pattern that makes it stick.
Examples: "Own the code. Own the road."

FORMULA 7 — [NUMBER] + [CLAIM]
"[Specific number] + [what it represents]."
Structure: Precision implies credibility.
Examples: "52 TOPS. Zero clouds."

QUALITY TEST — Run every candidate through these filters:
1. Can you say it in one breath?
2. Does it sound good spoken aloud (not just written)?
3. Does it work WITHOUT the company name attached?
4. Would it still make sense in 5 years?
5. Can a customer finish the sentence if you start it?
```

### BlackRoad Example Candidates

```
Formula 1: "Pave Tomorrow." (SELECTED)
Formula 2: "Sovereign AI for people who build."
Formula 3: "Five nodes. Infinite reach."
Formula 4: "What if you owned every byte?"
Formula 5: "The road you build on is yours."
Formula 6: "Own the code. Own the road."
Formula 7: "52 TOPS. Zero clouds."

Quality test on "Pave Tomorrow.":
1. One breath? Yes (2 words).
2. Sounds good aloud? Yes — strong P, open vowel, clean M-ending.
3. Works without company name? Yes — aspirational standalone.
4. Makes sense in 5 years? Yes — future-facing by definition.
5. Customer can finish it? "BlackRoad OS — ..." then "Pave Tomorrow." Yes.
```

### Pre-Ship Checklist

- [ ] Tagline is 5 words or fewer
- [ ] Passes the "say it aloud" test — no awkward syllable clusters
- [ ] Does not require explanation to convey the emotional tone
- [ ] Checked for existing trademarks (USPTO TESS search)
- [ ] Works in all contexts: website header, email footer, slide deck, merchandise
- [ ] Tested with 5 people who have never seen your product — do they get the vibe?
- [ ] Not a pun (puns age poorly)
- [ ] Domain and social handles available (or already owned)
- [ ] Consistent with brand voice (Space Grotesk, black bg, white text)
- [ ] Punctuation is intentional (period adds finality; no period adds openness)

---

## 9. Ad Copy (Paid Search)

**Psychological Basis:** Salience (attention goes to what stands out) + Keyword Relevance (matching the searcher's intent reduces cognitive load)

In paid search, you are competing for attention in a wall of text results. Salience means your ad must visually and semantically stand out. Keyword relevance means echoing the exact words the searcher used — this creates a recognition match that feels like "this is for me."

### Template

```
HEADLINE 1 (30 chars max):
[Primary keyword phrase + value prop]

HEADLINE 2 (30 chars max):
[Differentiator or specific benefit]

HEADLINE 3 (30 chars max):
[Social proof or urgency element]

DESCRIPTION 1 (90 chars max):
[Expand on the value prop. Include a reason to click NOW. Use the keyword naturally.]

DESCRIPTION 2 (90 chars max):
[Address an objection or add a second benefit. End with CTA verb.]

DISPLAY URL PATH:
[domain.com]/[keyword-relevant-path]/[sub-path]

SITELINK EXTENSIONS:
1. [Feature page — descriptive title] | [1-line description]
2. [Pricing page] | [1-line description]
3. [Case study or proof page] | [1-line description]
4. [Getting started / free trial] | [1-line description]

CALLOUT EXTENSIONS:
- [Short benefit phrase 1]
- [Short benefit phrase 2]
- [Short benefit phrase 3]
- [Short benefit phrase 4]
```

### BlackRoad Example

```
Target keyword: "self-hosted AI platform"

HEADLINE 1: Self-Hosted AI Platform
HEADLINE 2: Zero Cloud Dependencies
HEADLINE 3: 50 AI Skills — Deploy Today

DESCRIPTION 1:
Run 16 language models on your own hardware. Full sovereignty,
no data leaves your network. Start in under 2 hours.

DESCRIPTION 2:
Open infrastructure, not a walled garden. 275+ repos,
active community. Deploy your first AI skill free.

DISPLAY URL:
blackroad.io/self-hosted-ai/get-started

SITELINK EXTENSIONS:
1. AI Skills Library | Browse 50 deployable AI skills
2. Pricing & Plans | Starts at $50/mo — own your stack
3. How It Works | 5-node mesh, local models, sovereign data
4. Deploy Now | From zero to AI in one terminal command

CALLOUT EXTENSIONS:
- 52 TOPS Processing
- No Vendor Lock-In
- Runs on Raspberry Pi
- Full Offline Capable
```

### Pre-Ship Checklist

- [ ] Headlines are within character limits (30/30/30)
- [ ] Descriptions are within character limits (90/90)
- [ ] Target keyword appears in Headline 1 and Description 1
- [ ] No trademarked competitor names in ad copy (policy violation risk)
- [ ] Display URL path is real and resolves to a relevant page
- [ ] Landing page matches the ad's promise (Quality Score depends on this)
- [ ] Sitelinks point to four DIFFERENT pages (not all to the homepage)
- [ ] Ad copy does not make claims you cannot substantiate
- [ ] Callout extensions are unique (no overlap with headlines)
- [ ] Negative keywords list is set up to prevent irrelevant matches
- [ ] Mobile preview checked — headlines may truncate differently

---

## 10. Ad Copy (Social/Display)

**Psychological Basis:** Peripheral Route Processing (ELM) + Social Validation

On social platforms, users are not actively searching — they are scrolling. Processing happens via the peripheral route: emotional tone, visual appeal, social signals, and source credibility matter more than argument quality. Social validation (likes, shares, comments visible on the ad) acts as a heuristic: "others liked this, so it must be good."

### Template

```
PRIMARY TEXT (125 chars visible before "See more"):
[Hook that creates curiosity or states a bold, relatable truth.
Must work in the first line — everything after gets truncated.]

[Expanded text (visible after "See more"):]
[2-3 sentences expanding on the hook. Include one specific detail
or data point. End with CTA.]

HEADLINE (40 chars max):
[Clear, benefit-driven statement.]

DESCRIPTION (30 chars max):
[Supporting detail or urgency.]

CTA BUTTON:
[Learn More / Sign Up / Get Started / Download / Shop Now]

IMAGE/VIDEO GUIDANCE:
[Describe the visual. High contrast. Human faces increase engagement.
Text on image: 6 words max. Brand colors present.]

AD VARIATIONS (always test at least 3):
Variation A: [Curiosity hook — question or surprising statement]
Variation B: [Social proof hook — number or testimonial]
Variation C: [Pain point hook — problem the audience recognizes]
```

### BlackRoad Example

```
PRIMARY TEXT:
Your AI prompts are someone else's training data.

Unless you run the models yourself. BlackRoad OS puts 50 AI skills
on your own hardware — Raspberry Pis, not rented GPUs. 16 local
models, zero external API calls. Deploy your first skill in 10 minutes.

HEADLINE: Own Your AI. Own Your Data.
DESCRIPTION: Self-hosted. Sovereign. Ready.
CTA BUTTON: Learn More

IMAGE GUIDANCE:
Black background. 5 Raspberry Pis arranged in a V formation,
LED status lights glowing. White text overlay: "52 TOPS. Zero Clouds."
BlackRoad logo bottom-right corner. No human faces (brand aesthetic).

VARIATIONS:
A: "What leaves your network when you use AI?" (curiosity)
B: "275+ repos. 50 skills. 0 cloud dependencies." (social proof via scale)
C: "Tired of AI tools that own your data?" (pain point)
```

### Pre-Ship Checklist

- [ ] First line of primary text hooks within 125 characters
- [ ] Headline is within 40-character limit
- [ ] Description is within 30-character limit
- [ ] CTA button matches the landing page action (do not say "Shop Now" for a free tool)
- [ ] Image has less than 20% text (Meta penalizes text-heavy images)
- [ ] Visual works at mobile thumbnail size (small screens dominate)
- [ ] At least 3 variations created for A/B testing
- [ ] Landing page loads in under 3 seconds (slow pages kill conversion)
- [ ] Pixel/tracking is installed on the landing page
- [ ] Audience targeting is defined (do not run to "everyone")
- [ ] Daily budget and bid strategy are set before going live
- [ ] Brand colors (black, white, gradient) are present in visual

---

## 11. Webinar/Event Invitation

**Psychological Basis:** Authority (Cialdini) + Scarcity + Social Proof

Authority: the speaker's expertise is the primary reason to attend. Scarcity: limited seats (or limited replay window) create urgency. Social proof: showing who else is attending or endorsing reduces risk ("if other smart people are going, it must be worth my time").

### Template

```
Subject: "[Problem-focused hook] — Live on [Date]"

HEADER:
[Event name or topic — not your company name]
[Date] | [Time + timezone] | [Duration]
[Free / $X / By invitation]

PROBLEM HOOK:
"[1-2 sentences describing a problem your audience faces.
This is why they should care enough to block their calendar.]"

SPEAKER(S):
[Name] — [Title], [Company]
[1 sentence of credibility: what they have built, published, or achieved
that makes them worth listening to on this topic.]

[Optional: additional speakers with same format]

WHAT YOU WILL LEARN:
1. [Specific takeaway — something actionable, not vague]
2. [Specific takeaway]
3. [Specific takeaway]

SOCIAL PROOF:
"[X people have registered / Past events attended by teams at Company A,
Company B, Company C / Quote from past attendee]"

SCARCITY:
"[Limited to X attendees / No replay available / Early-bird pricing
ends DATE]"

CTA:
[Register Now / Save Your Seat / Claim Your Spot]
[Button/link]

LOGISTICS:
Platform: [Zoom / Google Meet / YouTube Live / In-person venue]
Duration: [X minutes, including Q&A]
Recording: [Available to registrants / Not recorded / Available for 48h]
```

### BlackRoad Example

```
Subject: "Your AI Data Is Leaving Your Network — Here Is How to Stop It"

HEADER:
Building Sovereign AI on Commodity Hardware
Thursday, April 10, 2026 | 2:00 PM CT | 45 minutes
Free — limited to 100 attendees

PROBLEM HOOK:
"Every time you call an AI API, your prompts and data travel to servers
you do not control. For many teams, that is not a compliance checkbox —
it is an existential risk. There is another way."

SPEAKER:
Alexa — Founder, BlackRoad
Built a 5-node sovereign AI mesh running 16 models and 50 skills
on Raspberry Pi hardware. 275+ repos. Zero cloud dependencies.

WHAT YOU WILL LEARN:
1. How to run production AI workloads on a $75 Raspberry Pi
2. The architecture behind a multi-node AI mesh with NATS pub/sub
3. How to deploy your first local AI skill in under 10 minutes (live demo)

SOCIAL PROOF:
"Our last session on edge computing had 87 attendees from 12 countries."

SCARCITY:
"Limited to 100 live attendees. No replay will be available —
this is a live-only session with interactive Q&A."

CTA:
[Save Your Seat]
blackroad.io/events/sovereign-ai-workshop

LOGISTICS:
Platform: Zoom
Duration: 45 minutes (30 min presentation + 15 min Q&A)
Recording: Not available — attend live or miss it.
```

### Pre-Ship Checklist

- [ ] Subject line focuses on the PROBLEM, not your company name
- [ ] Date and time include timezone (and ideally an "Add to Calendar" link)
- [ ] Speaker bio is 1-2 sentences of relevant credibility, not a life story
- [ ] "What you will learn" items are specific and actionable
- [ ] Scarcity claim is real (if you say 100 seats, actually cap it at 100)
- [ ] Social proof is verified (past event numbers, real company names)
- [ ] CTA button goes to a working registration page
- [ ] Registration page collects minimal info (name + email, not 12 fields)
- [ ] Reminder emails are scheduled (24h before + 1h before)
- [ ] Tech check completed: mic, screen share, backup internet plan
- [ ] Follow-up email drafted for post-event (send within 2 hours of ending)

---

## 12. Partnership Pitch

**Psychological Basis:** Reciprocity (Cialdini) + Liking (people agree with people they like)

Reciprocity: lead with what YOU offer them, not what you want. Liking: show genuine familiarity with their work — people partner with people who understand and appreciate them. The pitch should feel like you are already aligned, not like you are cold-selling.

### Template

```
Subject: "[Specific thing you admire about them] + partnership idea"

Hi [Name],

WHY THEM:
[2-3 sentences showing you genuinely know their work. Reference something
specific: a blog post, a product feature, a talk they gave. This cannot
be generic or it fails immediately.]

WHY US:
[2-3 sentences on who you are and what you bring. Focus on capabilities
that COMPLEMENT theirs, not compete. Show the gap you fill for them.]

WHAT WE PROPOSE:
[Specific partnership structure. Not "let us explore synergies" — give them
a concrete proposal they can say yes or no to:]
- [Action 1: who does what]
- [Action 2: who does what]
- [Timeline: when]
- [Format: integration / co-marketing / content / bundle / referral]

MUTUAL BENEFIT:
[What THEY get — state this first and in more detail.]
[What you get — state this second and more briefly.]

NEXT STEP:
[One specific, low-commitment ask: 15-minute call, async reply,
review a one-pager. Not "let me know your thoughts."]

[Sign-off]

[P.S. — Optional: offer something immediately with no strings attached.
A genuine gift of value before they have agreed to anything.]
```

### BlackRoad Example

```
Subject: "Your edge compute docs are the best I have read — collaboration idea"

Hi Sarah,

WHY YOU:
I have been following Tinkerbell's work on bare-metal Kubernetes provisioning
for two years. Your PXE boot workflow is something we reference constantly.
The talk you gave at KubeCon on "Kubernetes Without the Cloud" is basically
our operating thesis.

WHY US:
BlackRoad OS is a sovereign AI operating system that runs on commodity
hardware — 5 Raspberry Pis, 16 local models, 50 AI skills. We have built
the AI application layer but we want better bare-metal provisioning
underneath it. That is your territory.

WHAT WE PROPOSE:
- We write a joint tutorial: "Deploy Sovereign AI on Bare Metal with
  Tinkerbell + BlackRoad OS"
- You provide the provisioning workflow; we provide the AI deployment layer
- Published on both our blogs + submitted to KubeCon CFP for October
- Timeline: draft by May 1, publish by June 1

MUTUAL BENEFIT:
For you: access to the growing "sovereign AI" audience that is searching
for edge deployment tools. Our 275+ repos and 20 domains give the tutorial
distribution.
For us: credibility through association with the best bare-metal tooling
in the ecosystem, plus better provisioning docs for our users.

NEXT STEP:
Would a 15-minute call next week work to see if this makes sense?
I am open any afternoon CT. Or if you would rather, I can send a one-page
outline of the tutorial and you can react async.

— Alexa

P.S. I already linked to your PXE boot guide from our infrastructure docs.
It was the right thing to do regardless of whether we partner.
```

### Pre-Ship Checklist

- [ ] "Why them" section references something SPECIFIC (not "I love your company")
- [ ] "Why us" section focuses on complementary value, not competition
- [ ] Proposal is concrete enough to say yes/no to (not "let us explore")
- [ ] Mutual benefit section leads with THEIR benefit, not yours
- [ ] Next step is low-commitment (15 min call or async response)
- [ ] Tone is peer-to-peer, not supplicant-to-authority
- [ ] No buzzwords ("synergy," "leverage," "ecosystem play")
- [ ] Email is under 300 words total
- [ ] You have verified the recipient is the right person to pitch
- [ ] P.S. gift (if included) is already done, not conditional on their reply

---

## 13. Referral Program

**Psychological Basis:** Reciprocity (Cialdini) + Social Validation

Reciprocity: reward the referrer so they feel the exchange is fair. Social validation: people are more likely to try a product that someone they know recommends — personal referrals carry more weight than any ad. The program structure should make sharing feel natural, not transactional.

### Template

```
PROGRAM NAME:
[Name that implies community, not salesmanship.
"Invite a friend" > "Referral program"]

REWARD STRUCTURE:
Referrer gets: [Specific reward — credits, free months, cash, swag]
Referred gets: [Specific benefit — discount, extended trial, bonus feature]
[Both sides must benefit. One-sided rewards feel exploitative.]

Tiers (optional):
- [1 referral: reward A]
- [5 referrals: reward B]
- [10 referrals: reward C]

SHARING MECHANISM:
Unique referral link: [domain.com/invite/USERNAME]
Shareable formats:
- Direct link (copy to clipboard)
- Pre-written email template (one click to send)
- Social share buttons (Twitter, LinkedIn — pre-populated text)
- QR code (for in-person sharing)

Pre-written share text:
"[Short message the referrer can send. Should sound like a personal
recommendation, not an ad. Include the referral link.]"

TRACKING:
- Referral link tracks: [clicks, signups, conversions]
- Dashboard: [Where the referrer can see their stats]
- Attribution window: [How long after clicking the link does a signup count? 30 days recommended.]
- Payout trigger: [When does the reward activate? On signup? On paid conversion? After 30 days?]

TERMS:
- [No self-referrals]
- [No spam or purchased traffic]
- [Rewards expire after X months if unclaimed]
- [Company reserves right to modify program terms]
```

### BlackRoad Example

```
PROGRAM NAME:
"Pave It Forward"

REWARD STRUCTURE:
Referrer gets: 1 free month of BlackRoad OS for each friend who signs up
Referred friend gets: 14-day extended trial (instead of 7-day standard)

Tiers:
- 1 referral: 1 free month
- 5 referrals: 3 free months + BlackRoad sticker pack
- 10 referrals: 6 free months + "Road Builder" badge on profile + early access to new features

SHARING MECHANISM:
Unique link: blackroad.io/invite/[username]

Pre-written share text:
"I have been running AI models on my own hardware with BlackRoad OS —
no cloud, no data leaving my network. If you want to try it, here is
an extended trial: [referral link]"

Shareable via: copy link, email template, Twitter, LinkedIn, QR code

TRACKING:
- Dashboard at blackroad.io/referrals showing clicks, signups, earned rewards
- 30-day attribution window
- Reward activates when referred user completes their first AI skill deployment
  (not just signup — actual usage ensures quality referrals)

TERMS:
- No self-referrals. No bulk email blasts. No purchased traffic.
- Rewards expire after 12 months if unclaimed.
- BlackRoad reserves the right to modify program terms with 30 days notice.
```

### Pre-Ship Checklist

- [ ] Both referrer AND referred person receive a benefit
- [ ] Reward is valuable enough to motivate sharing but sustainable for the business
- [ ] Share text sounds like a friend talking, not a marketing email
- [ ] Referral link is short and clean (no 50-character tracking parameters visible)
- [ ] Dashboard is functional and updates in real time
- [ ] Attribution window is clearly stated
- [ ] Payout trigger prevents gaming (e.g., require actual usage, not just signup)
- [ ] Terms of service are written and accessible
- [ ] Anti-fraud measures are in place (duplicate detection, velocity limits)
- [ ] Email notifications work (referrer notified when friend signs up)
- [ ] Program has been tested end-to-end with a real referral before launch

---

## 14. README for Open Source Repo

**Psychological Basis:** Reciprocity (give first) + Authority (technical depth signals competence)

Open source READMEs work through reciprocity: you give away valuable software and documentation, which creates goodwill and obligation. Authority comes through technical depth — the README signals whether the maintainer knows what they are doing. A well-structured README converts browsers into users and users into contributors.

### Template

````
# [Project Name]

[One sentence: what this project does. Not what it IS — what it DOES for the user.]

[Badge row: build status, version, license, downloads — only if they link to real data]

## Quick Start

[The fastest path from zero to working. Ideally 3 commands or fewer.]

```bash
[install command]
[config command, if needed]
[run command]
```

## What It Does

[2-3 paragraphs explaining the project in plain language.
Include: what problem it solves, who it is for, and what makes it
different from alternatives.]

## Features

- [Feature 1 — one line each, benefit-oriented]
- [Feature 2]
- [Feature 3]
- [Feature 4]
- [Feature 5]

## Installation

[Step-by-step for each supported platform.
Include prerequisites (Node version, OS, etc.).]

## Usage

[Code examples for the most common use cases.
Show input AND expected output.]

## Configuration

[Table or list of configuration options with defaults and descriptions.]

## Architecture

[Brief overview of how the code is structured.
Helps contributors understand where to look.]

## Contributing

[How to contribute: fork, branch, PR process.
Include: code style, testing requirements, review process.]

## FAQ

[3-5 real questions that users ask. Do not make these up —
pull from actual support conversations.]

## License

[License name + link to LICENSE file.
State it clearly: "This project is licensed under [X]."]
````

### BlackRoad Example

````
# RoadSearch

AI-powered full-text search that runs entirely on your own hardware.

## Quick Start

```bash
git clone https://gitea.blackroad.io/blackroad/road-search.git
cd road-search
npm install && npm run deploy
```

Your search engine is now live at your-domain.com/search.

## What It Does

RoadSearch indexes your content into a D1 SQLite database with FTS5
full-text search, then generates AI-powered answers using local Ollama
models. Every query, every index entry, and every AI response stays
on hardware you control.

It is built for teams and individuals who need search but will not send
their data to Algolia, Elasticsearch Cloud, or any external service.

## Features

- FTS5 full-text search across 29+ page types in <50ms
- AI-generated answers via local Ollama models (no API keys needed)
- /search route that drops into any existing site
- 156,675+ entries indexed across 228 databases in production
- Runs on a Raspberry Pi (tested on Pi 4 and Pi 5)

## Installation

Prerequisites: Node.js 18+, Wrangler CLI, Ollama (for AI answers)

[Full installation steps...]

## License

Proprietary. See LICENSE file. All rights reserved.
````

### Pre-Ship Checklist

- [ ] First sentence says what it DOES, not what it IS
- [ ] Quick Start works if someone copies and pastes it right now
- [ ] Quick Start is 3 commands or fewer
- [ ] All code examples are tested and produce the expected output
- [ ] Prerequisites are listed with version numbers
- [ ] Architecture section exists (contributors need this)
- [ ] Contributing guide includes code style and PR process
- [ ] License is clearly stated (not "see LICENSE" with no LICENSE file)
- [ ] Badges link to real data (not placeholder shields.io badges)
- [ ] No broken links anywhere in the document
- [ ] FAQ answers are from real user questions, not invented
- [ ] Spelling and grammar are clean (this is your first impression)

---

## 15. Job Posting

**Psychological Basis:** Identity Goal (Katz) + Value-Expressive Attitude Function

People do not just want a job — they want a job that expresses who they are. The value-expressive function of attitudes means people adopt positions (including employment) that communicate their identity to themselves and others. A job posting should make the reader think "this is who I am" — not just "this pays well."

### Template

```
# [Role Title]

[Location: Remote / City / Hybrid]
[Type: Full-time / Part-time / Contract]
[Compensation: Range or "Competitive" — range is always better]

## The Mission

[2-3 sentences about what the COMPANY is trying to do in the world.
Not what the role does — why the company exists and why it matters.
This is the identity anchor: "Do I want to be part of THIS?"]

## What You Will Do

[5-7 bullet points of specific responsibilities. Use action verbs.
Be honest about the ratio of exciting work to mundane work.
People respect honesty more than a glamorized list.]

- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]
- [Responsibility 4]
- [Responsibility 5]

## What You Will Need

[Split into required and preferred. Do not list 15 "requirements"
that are actually preferences. Inflated requirements filter out
good candidates, especially from underrepresented groups.]

Required:
- [Skill/experience 1]
- [Skill/experience 2]
- [Skill/experience 3]

Preferred (not required):
- [Nice-to-have 1]
- [Nice-to-have 2]

## How We Work

[3-4 sentences about culture. Be specific, not aspirational.
"We do standups Mon/Wed/Fri at 10am CT" is better than
"We value collaboration." Describe what actually happens.]

## Compensation and Benefits

[Salary range — actual range, not $60K-$200K]
[Equity, if applicable]
[Benefits: health, PTO, hardware, learning budget — specifics]

## How to Apply

[Exact instructions. What to send, where to send it.
"Send a resume and a short note about why this interests you to
[email]" is better than "Apply through our portal."]
```

### BlackRoad Example

```
# Infrastructure Engineer

Location: Remote (US timezones preferred)
Type: Full-time
Compensation: $120K-$150K + equity

## The Mission

BlackRoad is building AI infrastructure that belongs to the people
who use it — not to a cloud provider. We run 16 language models
across a 5-node Raspberry Pi mesh with zero external dependencies.
We believe sovereignty over your tools is a prerequisite for
sovereignty over your work.

## What You Will Do

- Design and maintain the multi-node mesh network (NATS, WireGuard)
- Deploy and optimize local AI models on edge hardware (Ollama, Hailo-8)
- Build and maintain CI/CD pipelines across 275+ repositories
- Write tooling in Bash and Python for fleet management
- Contribute to RoadSearch, RoadPay, and the BlackRoad skills system
- Debug hardware issues on live Raspberry Pi nodes (yes, sometimes it is a bad SD card)
- Write documentation that other engineers actually want to read

## What You Will Need

Required:
- Experience managing Linux servers in production (2+ years)
- Comfort with networking: DNS, firewalls, VPNs, SSH tunneling
- Bash scripting proficiency (we have 400+ shell scripts)
- Ability to work independently with minimal supervision

Preferred (not required):
- Experience with edge computing or IoT deployments
- Familiarity with Cloudflare Workers, D1, KV, R2
- Contributions to open source projects
- Experience with AI/ML deployment (model serving, inference optimization)

## How We Work

We are a small team that ships daily. Communication is async-first —
Slack for quick questions, GitHub issues for everything else.
No meetings without agendas. No standups (we use automated daily
status via our memory system). You will have root access to production
nodes from day one. We trust you to use it wisely.

## Compensation and Benefits

- $120K-$150K salary (based on experience)
- 0.5-1.5% equity
- $3,000/year hardware budget (build your own lab)
- $1,500/year learning budget (conferences, courses, books)
- Unlimited PTO (with a minimum of 15 days enforced)
- Health insurance (US-based employees)

## How to Apply

Send an email to alexa@blackroad.io with:
1. Your resume or LinkedIn
2. A link to something you have built (GitHub, blog post, side project — anything)
3. One paragraph on why self-hosted AI infrastructure interests you

No cover letter template needed. We read every application.
```

### Pre-Ship Checklist

- [ ] Role title is searchable (what candidates actually search for)
- [ ] Compensation range is real and specific (not $60K-$200K)
- [ ] Mission section answers "why does this company exist?" not "what is the role?"
- [ ] Responsibilities are honest — include the unglamorous parts
- [ ] Required skills are truly REQUIRED (would you reject someone without them?)
- [ ] Preferred skills are clearly marked as NOT required
- [ ] Culture section describes what actually happens, not aspirational values
- [ ] Application instructions are specific (what to send, where)
- [ ] No gendered language (run through a gender decoder)
- [ ] Requirements list is 3-5 items, not 15 (long lists reduce diverse applicants)
- [ ] Benefits are specific (dollar amounts, not "competitive package")
- [ ] Posting has been proofread by someone who is not the hiring manager
- [ ] Equal opportunity statement is included
- [ ] Job is posted where your target candidates actually look

---

## Usage Notes

1. **Fill in the blanks.** Every `[___]` is a decision you need to make. Do not ship brackets.
2. **Run every checklist.** The checklist is the quality gate. If you cannot check a box, fix the template or explicitly decide to skip it.
3. **Adapt, do not copy.** These templates encode psychological principles, not magic words. Change the words to fit your voice. Keep the structure.
4. **Test with humans.** Show the final version to someone who matches your target audience. If they do not respond the way you expected, revise before shipping.
5. **Be honest.** Every template here works because it builds trust. The moment you inflate a number, fabricate a testimonial, or create artificial scarcity, you undermine the psychology the template is built on.

---

BlackRoad OS — Pave Tomorrow.