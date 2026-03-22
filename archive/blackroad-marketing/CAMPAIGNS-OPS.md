# BlackRoad Campaign Operations Manual

**Version 1.0 | BlackRoad OS Marketing Division**

---

## Table of Contents

1. [How to Use This Manual](#how-to-use-this-manual)
2. [Campaign Process Overview](#campaign-process-overview)
3. [Phase 1: Discovery and Research](#phase-1-discovery-and-research)
4. [Phase 2: Audience Analysis](#phase-2-audience-analysis)
5. [Phase 3: Competition Analysis](#phase-3-competition-analysis)
6. [Phase 4: SWOT Analysis](#phase-4-swot-analysis)
7. [Phase 5: Goals and Objectives](#phase-5-goals-and-objectives)
8. [Phase 6: PESO Media Plan](#phase-6-peso-media-plan)
9. [Phase 7: Content Strategy and Creative](#phase-7-content-strategy-and-creative)
10. [Phase 8: Timeline and Budget](#phase-8-timeline-and-budget)
11. [Phase 9: Measurement and Optimization](#phase-9-measurement-and-optimization)
12. [Campaign Brief Template (Fill-in-the-Blank)](#campaign-brief-template)
13. [Campaign Deck Template (Fill-in-the-Blank)](#campaign-deck-template)
14. [PESO Planning Template (Fill-in-the-Blank)](#peso-planning-template)
15. [Appendix: BlackRoad MarTech Stack](#appendix-blackroad-martech-stack)

---

## How to Use This Manual

This manual is the operational playbook for every BlackRoad marketing campaign. It covers the complete lifecycle from initial research through post-campaign measurement. Every section includes:

- **The principle** -- what this phase accomplishes and why it matters
- **The process** -- step-by-step instructions for executing the phase
- **Worked examples** -- real campaigns (Coinbase Crypto and Mercury Marine) showing how each step was actually done
- **BlackRoad application** -- how to apply each phase to BlackRoad products (RoadPay, RoadSearch, Squad Webhook, auth system) and infrastructure (5 Pis, Cloudflare, 30 websites)
- **Fill-in-the-blank templates** -- mad-lib style templates you can complete for any new campaign

---

## Campaign Process Overview

Every campaign follows a five-stage process. A thoughtful approach that combines the right audience on the right channels with the right messaging will drive the strongest results.

```
STAGE 1          STAGE 2          STAGE 3          STAGE 4          STAGE 5
DISCOVERY   -->  PLANNING    -->  CREATIVE    -->  CAMPAIGN    -->  MONITORING,
                                                   SETUP            REPORTING,
Audience         Ad Plan          Ad Design        Landing Page     OPTIMIZATION
Research         SWOT             & Copy           Tracking
Comp Audit       Goals/KPIs       Content          (Pixels,         Campaign
                 PESO Plan        Assets           Events)          Launch
```

The stages are sequential but iterative. Insights from later stages should feed back into earlier ones. A campaign is never "done" -- it is continuously optimized.

---

## Phase 1: Discovery and Research

### Principle

Before spending a dollar or writing a word of copy, you must understand the landscape. Discovery answers three foundational questions:

1. **What is the cultural and industry conversation right now?**
2. **What do stakeholders (internal and external) know that we do not?**
3. **What technology trends and tools are available to us?**

### Process

#### Step 1: Secondary Research

Gather existing data from public sources. This is desk research -- no original data collection yet.

- Industry reports and trend publications (Mintel, Statista, Pew Research)
- Google Trends for keyword interest over time
- Google Search Console for what people search to find your site
- News headlines and cultural conversations around the product category
- Academic and trade publications
- Competitor annual reports and press releases

#### Step 2: Stakeholder Interviews

Talk to people inside and outside the organization.

- Internal: sales team, product team, customer support (they hear the complaints)
- External: customers, retailers, dealers, partners
- Ask open-ended questions about motivations, frustrations, and unmet needs

#### Step 3: Primary Research

Collect original data through surveys, interviews, and focus groups.

- Online surveys (post to relevant communities: Reddit, Facebook groups, LinkedIn)
- In-person or phone interviews with consumers and industry experts
- Focus groups for qualitative depth

#### Step 4: Technology and Tool Audit

Identify what tools are available and what the martech stack looks like.

- CRM (customer relationship manager)
- MAP (marketing automation platform)
- CMS (content management system)
- Web analytics and tracking (pixels, events, heat mapping, call tracking)
- Social listening platforms (Sprout Social, Awario, Hootsuite, Keyhole)
- Access to data (what data do we already have?)

### Worked Example: Mercury Marine Campaign

The Jargon agency team conducted a multi-phase research effort for Mercury Marine's electric propulsion initiative:

**Secondary research** covered electrification trends across industries. Key findings included:
- Ford's EV myths study showed 80% of Americans falsely believed EVs could not handle extreme weather
- 49% of consumers were most concerned about lack of charging stations
- Latin American and Caribbean markets were adopting electric vehicles faster than expected
- Consumers increasingly expected brands to reduce environmental damage

**Primary research** cast a wide net:
- 230+ survey responses collected via Reddit, Facebook, boating groups, fishing groups, and parenting groups
- 15 unique consumer interviews across the United States
- 5 expert retailer interviews (marina managers, boat dealers, sales professionals)

**Key discovery insights from Mercury:**
- 56% of respondents chose "reduced carbon footprint" as the most appealing benefit of electric boating
- Price was the number one factor when boat shopping (178 respondents), followed by looks (76), then sustainability (48)
- Interest in electric cars did NOT predict interest in electric boats -- they are separate markets
- Retailer experts unanimously agreed electrification in boating was "the natural progression"
- 95% of respondents aged 21-35 who did not own a boat chose leisure as their primary boating activity
- Noise pollution was NOT a decision factor -- only 17 out of 230+ respondents cared about it

### Worked Example: Coinbase Crypto Campaign

Alexa's digital strategy plan for Coinbase focused on the Coinbase Earn product:

**Secondary research** findings:
- 37% of respondents ages 18-29 and 30-44 who had not purchased crypto were "somewhat" or "very interested" in investing
- 63% of "crypto-curious" adults included 53% women (contradicting assumptions about a male-dominated market)
- 74% of cryptocurrency owners fell between ages 25 and 44
- The biggest roadblock was lack of understanding on how to get started and concerns with market volatility

**Social media audit** (a form of secondary research):
- Coinbase Twitter: 3.5M followers, avg. 1,000 likes/post, avg. 100 RT/post
- Competitor Robinhood Twitter: 545K followers, avg. 750 likes/post, avg. 50 RT/post
- Coinbase Facebook: 370K followers, avg. 100-300 shares/post, avg. 2.5K comments/post
- Coinbase had 93% turnover from web search -- search was their dominant acquisition channel

### BlackRoad Application

For a BlackRoad campaign (e.g., launching RoadPay billing system), discovery would include:

- **Secondary research**: Review competitor billing platforms (Stripe, Paddle, LemonSqueezy). Check Google Trends for "self-hosted billing," "developer billing tools," "sovereign payments." Review HackerNews and Reddit r/selfhosted discussions.
- **Stakeholder interviews**: Talk to existing BlackRoad users across the 42 auth system accounts. Review Squad Webhook interactions from the 69 repos hooked to GitHub.
- **Primary research**: Survey developers in self-hosted communities. Interview users of the 30 BlackRoad websites.
- **Tech audit**: BlackRoad already runs a full martech stack -- D1 databases, KV stores, R2 object storage, Cloudflare Workers, analytics-blackroad Worker, stats-blackroad Worker + KV. Document what is live and what gaps exist.

---

## Phase 2: Audience Analysis

### Principle

You are not marketing to "everyone." You are marketing to specific human beings with specific demographics, psychographics, motivations, frustrations, and behaviors. Audience analysis produces two deliverables:

1. **Demographic and psychographic profiles** of your target segments
2. **Detailed personas** -- fictional but data-backed characters who represent your ideal customers

### Process

#### Step 1: Define Demographics

For each target segment, document:

| Factor | Description |
|--------|-------------|
| Age | Specific range (e.g., 25-34) |
| Gender | Distribution and any index differences |
| Location | Geographic targeting |
| Income | Household income range |
| Education | Level of education |
| Occupation | Job titles and industries |
| Race/Ethnicity | If relevant to targeting |
| Marital/Family Status | Household composition |

#### Step 2: Define Psychographics

Psychographics are the personal characteristics that demographics cannot capture:

- **Personality**: Are they adventurous? Risk-averse? Leaders or followers?
- **Attitudes**: What do they believe about your product category?
- **Values**: What matters most to them? (family, sustainability, status, independence)
- **Interests/Hobbies**: What do they do with their free time?
- **Lifestyle**: How do they spend their days?
- **Behavior**: How do they make purchasing decisions? What media do they consume?

Use index scores from tools like Simmons MRI when available. An index above 100 means over-representation in that segment.

#### Step 3: Build Personas

A persona is a fictional character sheet built from real data. Each persona needs:

- **Name and photo concept** (makes them real to the team)
- **Demographics** (age, race, income, gender, education, profession)
- **Profile/bio** (a paragraph describing their daily life)
- **Goals** (what they want to achieve)
- **Frustrations** (what blocks them)
- **Beliefs** (what they value and care about)
- **Dimensions** (rated scales showing their priorities: achievement, adventure, family, sustainability, etc.)

#### Step 4: Determine Product Fit

For each persona, answer:
- How and when will they use the product?
- What features are most appealing to them?
- What media do they consume for information?
- What barriers might prevent them from converting?

### Worked Example: Mercury Marine Campaign

Mercury targeted the 25-34 age demographic, all genders, for their electric propulsion initiative.

**Demographics:**
- Age: 25-34 years old
- Gender: All genders (women more likely to buy into Mercury as a brand, Index 112; men more likely to own a boat, Index 113)
- Race: African American (Index 127) and Latinx (Index 197) were over-indexed
- Income: $100K+ household annually
- Political association: Democratic party

**Psychographics (with index scores):**
- Adventurous (Index 125)
- Brands over price -- "Regardless of price, I want to have the brand I like" (Index 136)
- Environmentally conscious -- "I am prepared to spend more for environmentally conscious products" (Index 130)
- Status conscious -- "I like other people thinking I am financially successful" (Index 127)
- Mechanically inclined -- "I am good at fixing things" (Index 161)
- Family focused -- "Family is the most important thing in life to me" (Index 126)
- Tech guru -- "I try to keep up with technology" (Index 118)
- Advice giver -- "Friends and family always ask me what kind of car they should buy" (Index 139)

**Persona 1: Sophia (Adventure Connoisseur)**
- 28, Latina, HH Income $100K+, Female, 4-year degree, Regulatory Analyst
- Recently moved to Chicago to start her career at Blue Cross Blue Shield
- Lives in a townhouse with her boyfriend and their corgi, Max
- Values living in the moment, making new memories, weekend lake getaways
- Goals: Making memories with family, high achievement at work, spending more time outdoors, planning for the future
- Frustrations: Cramped lifestyle, feeling stuck, same day-to-day schedule, not seeing family enough
- Beliefs: Protecting the future, fast-paced lifestyle, healthy diet, family-centered, nature enthusiast

**Persona 2: Andre (Tech Guru)**
- 34, African American, HH Income $250K+, Male, 4-year degree, Software Engineer
- Married 10 years, dad for 8, lives outside a major city
- Fatherhood defines him -- his trophy case is filled with projects his kids made
- Looking for ways to get his kids off screens and into family activities outdoors
- Goals: Unforgettable summer memories, finding hobbies with his kids, getting outdoors, teaching his kids something new
- Frustrations: Internet consuming his family's lives, not knowing how something works, shopping becoming a chore
- Beliefs: Brands are self-expression, being a present father is essential, spending more for environmentally friendly products is worth it

### Worked Example: Coinbase Crypto Campaign

**Target Audience: Millennials (Age 25-40)**

Alexa identified several millennial sub-types:
- **Brandennial**: brand-conscious millennials
- **Futurennial**: future-focused, tech-forward millennials
- **Debtennial**: debt-burdened millennials looking for new financial paths
- **Constructennial**: anti-marketing, skeptical millennials

Key demographic insight: 53% of "crypto-curious" adults were women, challenging the assumption that crypto marketing should target only men.

**Persona: Ashley**
- Millennial, tech-savvy and focused on the future
- Very excited about learning and adaptive to change
- Grew up in the internet age, spends free time on social media and streaming services
- Completely digitally literate and adept with all forms of technology
- Loves innovation and adopting new ideas that will carry into the future
- Recently started working full-time, enjoying having a set salary
- Saving for a home and wants investment opportunities with future promise

### BlackRoad Application

For a RoadSearch campaign targeting self-hosted developers:

**Persona: Dev (The Sovereign Builder)**
- 29, any gender, $85K+ income, software engineer or DevOps
- Runs personal infrastructure (homelab, VPS fleet, self-hosted services)
- Values data sovereignty, open protocols, and owning their stack
- Frustrated by vendor lock-in, SaaS price increases, and black-box search APIs
- Spends time on HackerNews, Reddit r/selfhosted, GitHub, Mastodon
- Would use RoadSearch to add full-text search across their own sites and apps
- Most appealing features: D1-backed FTS5 search, AI answers via local Ollama, self-hosted deployment
- Barrier: needs to trust that BlackRoad infrastructure is real and battle-tested (the 5 Pis, 30 websites, 275+ repos are proof points)

---

## Phase 3: Competition Analysis

### Principle

You cannot position your brand without knowing where competitors stand. Competition analysis produces three deliverables:

1. **Competitor comparison matrix** (features, revenue, employees, customer satisfaction)
2. **Positioning grids** (where each brand sits on key dimensions)
3. **Competitive advantage and weakness summary** for each competitor

### Process

#### Step 1: Identify Direct and Indirect Competitors

- **Direct competitors**: Same product category, same audience
- **Indirect competitors**: Different product but solving the same problem
- **Best-in-class from another industry**: Audit their approach for ideas you can steal

#### Step 2: Build a Competitor Comparison Matrix

For each competitor, research:

| Dimension | Your Brand | Competitor A | Competitor B | Competitor C |
|-----------|-----------|-------------|-------------|-------------|
| Product/service offerings | | | | |
| Number of employees | | | | |
| Annual revenue | | | | |
| Customer satisfaction | | | | |
| Key differentiator | | | | |
| Primary weakness | | | | |

#### Step 3: Create Positioning Grids

Plot competitors on two-axis grids. Choose dimensions that matter to your audience.

Common axes:
- Budget <---> Innovative
- Stagnant <---> Quality
- Historic <---> New
- Boring <---> Exciting

#### Step 4: Analyze Each Competitor Deeply

For each competitor, document:
- **Products and services**: What do they offer? How does it compare?
- **Brand positioning**: What story do they tell? What is their identity?
- **Competitive advantages**: What are they best at?
- **Innovation status**: Where are they on the technology curve?
- **Weaknesses**: Where are they vulnerable?

#### Step 5: Identify White Space

Where is nobody competing? What audience is underserved? What positioning is unclaimed?

### Worked Example: Mercury Marine Campaign

**Competitor Comparison Matrix:**

| Dimension | Mercury Marine | Yamaha | Volvo Penta | Honda Marine |
|-----------|---------------|--------|-------------|-------------|
| Propulsion offerings | 39 | 71 | 72 | 15 |
| Employees | 5,200+ | 2,000+ | 230+ | 55+ |
| 2020 Revenue | $3.785B | $1.38B | $1.936B | $74M |
| Customer satisfaction | High | Medium | Medium | Medium-High |

**Positioning Grids:**

Business positioning: Mercury sat in the "Innovative + Quality" quadrant. Honda sat in "Budget + Stagnant." Yamaha in "Innovative + Budget." Volvo Penta in "Quality + Stagnant."

Brand positioning: Mercury sat in "Exciting + Historic." Yamaha in "Exciting + New." Honda in "Boring + Historic." Volvo Penta in "Boring + New."

**Competitor Deep Dives:**

*Yamaha:* Strong creative campaigns, identity focused on reliability and strength. Revenue from other markets funds R&D. Had an electric motor system (HARMO) in Europe, expected in U.S. by 2023. Weakness: so many branches caused loss of focus on boating; few distribution/service points generated complaints.

*Volvo Penta:* Largest product and service offerings. Parent company Volvo AB had the most capital for R&D. Decided to deprioritize outboard R&D in favor of electrification. Weakness: no clear brand identity -- "does not tell a story and tries to do too many things at once."

*Honda Marine:* Cheapest of all competitors, strong warranty program. Weakness: very small range (all four-stroke, 2-250 HP), low R&D investment, no electric offerings or messaging.

**White Space Identified:** Electric propulsion market was "anyone's for the taking." Previously prohibited bodies of water (electric motors only) were an untapped market. The demographic shift toward more diverse boaters was an opportunity competitors were ignoring.

### Worked Example: Coinbase Crypto Campaign

**Primary Competitor: Robinhood**

| Dimension | Coinbase | Robinhood |
|-----------|----------|-----------|
| Twitter followers | 3.5M | 545K |
| Avg. likes/post | 1,000 | 750 |
| Facebook followers | 370K | 240K |
| LinkedIn followers | 306K | 180K |
| Content strategy | Trendy posts, video ads, article links | Trendy posts, newsletters, article links |
| Weakness | Customer service, video frequency | Smaller social presence |

Coinbase outperformed Robinhood on nearly every social metric, but Robinhood got more media attention and social media conversation. The white space was educational content -- Coinbase Earn's video-based learning had no real competitor equivalent.

### BlackRoad Application

For a RoadPay campaign, the competitor matrix might include:

| Dimension | RoadPay | Stripe | LemonSqueezy | Paddle |
|-----------|---------|--------|-------------|--------|
| Self-hosted | Yes (D1 + Workers) | No | No | No |
| Pricing control | Full (you set plans) | Platform fees | Platform fees | Platform fees |
| Data sovereignty | Complete | Vendor-held | Vendor-held | Vendor-held |
| Setup complexity | Medium (Cloudflare) | Low | Low | Low |
| Infra required | Cloudflare account | None | None | None |

White space: No major billing platform lets you self-host with full data sovereignty on edge infrastructure. RoadPay owns this position.

---

## Phase 4: SWOT Analysis

### Principle

SWOT (Strengths, Weaknesses, Opportunities, Threats) synthesizes everything from discovery, audience, and competition into a single strategic snapshot. Strengths and Weaknesses are internal. Opportunities and Threats are external.

### Process

#### Step 1: List Strengths (Internal, Positive)

What does the brand do well? What assets, reputation, or capabilities give it an advantage?

#### Step 2: List Weaknesses (Internal, Negative)

Where does the brand fall short? What resources are lacking? What complaints exist?

#### Step 3: List Opportunities (External, Positive)

What market trends, cultural shifts, or competitor gaps create openings?

#### Step 4: List Threats (External, Negative)

What external forces could harm the brand? Regulatory changes? Competitor moves? Economic shifts?

#### Step 5: Cross-Reference

The real power of SWOT is in the intersections:
- **Strength + Opportunity** = your campaign core message (lean into this)
- **Weakness + Threat** = your biggest risk (mitigate this)
- **Strength + Threat** = your defensive position (protect this)
- **Weakness + Opportunity** = your growth investment (build here)

### Worked Example: Mercury Marine Campaign

| STRENGTHS | WEAKNESSES |
|-----------|------------|
| Rich history, 80+ successful years | Slightly behind competitors on electric engines |
| Market leader: 1/2 of boats on water are Mercury | Heavily reliant on OEM partners |
| Extremely loyal fanbase + word of mouth | |

| OPPORTUNITIES | THREATS |
|--------------|---------|
| Electric propulsion market is anyone's for the taking | Competitors are joining the race to electric |
| Most employed marine propulsion company (more R&D brainpower) | Consumer insecurity about electric engines |
| | Competitors do OEM in-house |

**Cross-reference insight:** Mercury's strength (market leader, brand trust) combined with the opportunity (electric market is open) pointed to a campaign positioning Mercury as THE leader in marine electrification -- getting ahead before competitors could claim that space.

### Worked Example: Coinbase Crypto Campaign

| STRENGTHS | WEAKNESSES |
|-----------|------------|
| Great user experience | Lack of customer service resources when problems arise |
| Engaging, educational videos -- "clean, not overly wordy, great visuals" | Less media attention than Robinhood |
| 93% turnover from web search | New videos not posted frequently enough |
| Twitter and YouTube accounts are successful | |

| OPPORTUNITIES | THREATS |
|--------------|---------|
| Crypto is a growing market gaining massive attention | Government could restrict crypto |
| Few legitimate ways to earn free crypto (Coinbase Earn is unique) | Competitors have news pages and blogs with similar educational content |
| Unique educational opportunity from a trusted source | |

**Cross-reference insight:** Coinbase's strength (educational content quality) combined with the opportunity (unique free-crypto earning) pointed to a campaign centered on Coinbase Earn as the gateway for crypto-curious millennials. The weakness (customer service) combined with the threat (competitor blogs) meant the campaign needed to build trust and legitimacy at every touchpoint.

### BlackRoad Application: RoadPay SWOT

| STRENGTHS | WEAKNESSES |
|-----------|------------|
| Fully self-hosted on Cloudflare edge (D1 tollbooth database) | Smaller user base (42 auth users currently) |
| 4 plans + 4 addons already built | Requires Cloudflare knowledge to deploy |
| Own the entire billing stack -- no platform fees | Less brand recognition than Stripe |
| Battle-tested infrastructure (5 Pis, 30 websites, 52 TOPS AI) | |

| OPPORTUNITIES | THREATS |
|--------------|---------|
| Growing "self-hosted everything" movement | Stripe continues to lower friction |
| Developer distrust of SaaS vendor lock-in increasing | Cloudflare could change Workers pricing |
| No major self-hosted billing competitor exists | Enterprise buyers default to known brands |

---

## Phase 5: Goals and Objectives

### Principle

Goals must be SMART: Specific, Measurable, Achievable, Relevant, Time-bound. Every campaign needs goals at three levels of the funnel:

1. **Awareness** -- Does the audience know we exist?
2. **Consideration** -- Is the audience thinking about us when making decisions?
3. **Conversion** -- Is the audience taking action (purchasing, signing up, engaging)?

Each goal needs defined KPIs (Key Performance Indicators) that you will actually measure.

### Process

#### Step 1: Set Awareness Goal

Format: Increase brand awareness of [PRODUCT/INITIATIVE] among [AUDIENCE SEGMENT] by [PERCENTAGE] by [DATE].

KPIs for awareness:
- Brand impressions
- Social media reach and follower growth
- Web traffic (total visits)
- Share of voice vs. competitors

#### Step 2: Set Consideration Goal

Format: Grow brand consideration of [PRODUCT] by [PERCENTAGE] among [AUDIENCE SEGMENT] by [DATE].

KPIs for consideration:
- Click-through rate (CTR)
- Visits by source
- Time on site
- Pages per session
- Email open rate

#### Step 3: Set Conversion Goal

Format: Increase [CONVERSION ACTION] by [PERCENTAGE/NUMBER] through [MECHANISM] by [DATE].

KPIs for conversion:
- Organic traffic to conversion pages
- Sales and revenue
- Sign-ups or account creation
- Cost per acquisition (CPA)
- Return on ad spend (ROAS)

#### Step 4: Define Tactics for Each Goal

Each goal needs specific tactics -- the actual actions you will take.

### Worked Example: Mercury Marine Campaign

**Goal 1 -- Awareness:** Drive brand awareness of the Mercury Marine electric propulsion initiative among the 25-34 year old, all gender demographic by 20% by December 2023.
- KPIs: Brand impressions, social media metrics, web traffic

**Goal 2 -- Consideration:** Grow brand consideration of Mercury electric propulsion by 15% among the 25-34 year old, all gender demographic by December 2023.
- KPIs: Click-through rate, visits by source, time on site

**Goal 3 -- Conversion:** Increase brand conversions through a stellar lineup of electric motors and the creative campaign as products roll out.
- KPIs: Organic traffic, sales and revenue

### Worked Example: Coinbase Crypto Campaign

**Goal 1 -- Awareness:** Increase brand awareness by 7-10% for 20-30 year olds by January 1, 2023, through paid ads on Twitter and Facebook.
- KPI: Percentage of market share

**Goal 2 -- Consideration:** Attract 2.5M new users by January 1, 2023, through display ads and paid search ads.
- KPI: Number of new users

**Goal 3 -- Conversion:** Increase site traffic on coinbase.com by 10-15% by January 1, 2023, through Coinbase Earn ads on YouTube and LinkedIn.
- KPI: Monthly site traffic

**Tactics:**
- Twitter and Facebook paid ads
- Organic social media posts
- Interactive display ads (matching game, spin wheel, pick-a-card)
- Promotion of Coinbase discussion groups
- Promotion of Coinbase Earn to entice new investors

### BlackRoad Application: RoadPay Goals

**Goal 1 -- Awareness:** Increase brand awareness of RoadPay among self-hosted developers and indie hackers by 25% by Q3 2026, through organic content on HackerNews, Reddit, and BlackRoad's 30 websites.
- KPIs: Impressions via analytics-blackroad Worker, RoadSearch query volume for "billing" and "payments"

**Goal 2 -- Consideration:** Drive 5,000 unique visits to the RoadPay landing page by Q3 2026, through technical blog posts and comparison content.
- KPIs: stats-blackroad Worker metrics, click-through rates from cross-linked ecosystem footer

**Goal 3 -- Conversion:** Convert 200 new RoadPay accounts by Q4 2026, through demo Workers and free-tier onboarding.
- KPIs: D1 tollbooth sign-ups, Stripe card-charge events, auth.blackroad.io new accounts

---

## Phase 6: PESO Media Plan

### Principle

PESO stands for Paid, Earned, Shared, and Owned media. A complete campaign uses all four channels in coordination. Each channel has different strengths:

- **Paid**: You pay to place content (ads, sponsored posts, influencer deals). Fast reach, full control of placement.
- **Earned**: Others talk about you without payment (press coverage, mentions, reviews, word of mouth). Most credible, least controllable.
- **Shared**: Social media content that gets distributed by your audience (shares, retweets, community posts). Organic reach through community.
- **Owned**: Content you control on your own platforms (website, blog, email, podcast, app). Full control, builds long-term equity.

### Process

For each of the three campaign goals (awareness, consideration, conversion), define a strategy in at least two PESO channels:

#### For Each PESO Channel:

1. **Strategy**: What approach will you use? (e.g., "paid social media advertising")
2. **Strategic Rationale**: Why this approach? What insight supports it?
3. **Tactics**: What specific actions on what specific platforms?
4. **Example**: What does an actual piece of content look like?

### Worked Example: Coinbase Crypto PESO Plan

**PAID:**
- Strategy: Social media native advertising
- Rationale: People use Twitter to connect with like-minded individuals; crypto conversation lives on Twitter
- Tactic: Twitter ad campaign promoting Coinbase Earn
- Tactic: Paid Twitch influencer livestream strategy to reach Gen Z crypto investors

**EARNED:**
- Strategy: Social media engagement strategy
- Rationale: Getting more mentions increases reach and brand awareness
- Tactic: Target social media mentions, retweets, and likes by creating relatable content that sparks conversation
- Tactic: Encourage word-of-mouth from satisfied Coinbase Earn users

**SHARED:**
- Strategy: Organic social media campaign
- Rationale: An organic campaign is trustworthy -- it combats serious questions people have about legitimacy
- Tactic: Promote the Coinbase Facebook discussion group
- Tactic: LinkedIn educational content about crypto

**OWNED:**
- Strategy: Email marketing strategy
- Rationale: Newsletters educate users and build excitement about new Coinbase Earn opportunities
- Tactic: Email campaigns with infographics and gifs
- Strategy: Podcast and audio curation
- Rationale: Hooks consumers through a customer-service-like experience
- Tactic: Distribute on Spotify and Apple Podcasts

### Worked Example: Mercury Marine PESO Plan (Reconstructed from Campaign Goals)

**PAID:**
- Strategy: Targeted digital ads for electric propulsion awareness
- Rationale: The 25-34 demographic is reachable via Instagram (Mercury's strongest social platform at 312K followers) and YouTube (13M views)
- Tactic: Instagram and YouTube video ads showcasing the Mercury Avator electric outboard

**EARNED:**
- Strategy: Retailer advocacy and word-of-mouth
- Rationale: The consumer journey research showed neighbors recommending Mercury to neighbors -- word of mouth is the most powerful driver in boating
- Tactic: Equip dealers and retailers with talking points about electric propulsion benefits

**SHARED:**
- Strategy: Community-driven sustainability content
- Rationale: Target audience psychographics show environmentally conscious values (Index 130) and status consciousness (Index 127) -- they want to be seen as eco-friendly
- Tactic: User-generated content campaigns on Instagram showing Mercury boats in nature

**OWNED:**
- Strategy: Product education and comparison tools on mercurymarine.com
- Rationale: "Every engine has loads of information, pictures, tutorial videos. Users should have no trouble finding the right engine for them."
- Tactic: Interactive comparison tools, electric vs. gas calculators, FAQ addressing range and charging concerns

### BlackRoad Application: RoadPay PESO Plan

**PAID:**
- Strategy: Targeted developer community sponsorships
- Rationale: Self-hosted developers trust community-vetted tools over display ads
- Tactic: Sponsor newsletters (Changelog, TLDR, Console.dev), Reddit r/selfhosted promoted posts

**EARNED:**
- Strategy: Technical thought leadership
- Rationale: Developers respect open technical writing more than marketing copy
- Tactic: Publish "how we built our own billing system on Cloudflare D1" posts; get covered by indie hacker publications

**SHARED:**
- Strategy: Ecosystem cross-promotion across 30 BlackRoad websites
- Rationale: Every BlackRoad site already links to the ecosystem footer -- this is 30 free distribution channels
- Tactic: Add RoadPay callouts to blackroad.io, embed billing demos in product pages

**OWNED:**
- Strategy: Documentation-as-marketing
- Rationale: Developers evaluate tools by reading docs before signing up
- Tactic: Comprehensive RoadPay docs, setup guides, and a working demo Worker anyone can fork

---

## Phase 7: Content Strategy and Creative

### Principle

Creative executes the strategy. Content must work across channels and be consistent in voice, visual identity, and messaging. Great creative has these hallmarks:

- **Visual impact**: Is it unique? Do components work together (visual, headline, copy, concept)?
- **Harmony**: Do photo style, font, tone, and concept feel unified?
- **Consistency**: Does every piece of the campaign feel like the same campaign?
- **Clear CTA**: Does the audience know exactly what to do next?

### Process

#### Step 1: Define Key Messages

Based on your insights, what is the single core message the campaign should convey? (This is your Single-Minded Proposition.)

Then define supporting messages:
- What claims can you make to support the core message?
- What proof points exist? (data, testimonials, case studies)

#### Step 2: Define Brand Voice

Choose 2-3 adjectives that define the tone of all campaign content. Examples from campaigns:
- Mercury Marine: Bold, adventurous, trustworthy
- Chobani: Wholesome, proud, authentic
- Coinbase: Modern, educational, accessible

#### Step 3: Plan Content by Channel

For each channel in your PESO plan, define what content is needed:

| Channel | Content Type | Format | Frequency |
|---------|-------------|--------|-----------|
| Twitter | Trending posts, video ads, article links | Short copy + image/video | Daily |
| Facebook | Discussion posts, customer service content | Longer copy + video | Monthly |
| LinkedIn | Educational videos, professional content | Article + video | Daily |
| Email | Newsletters with infographics and gifs | HTML email | Weekly |
| Website | Landing pages, blog posts, tools | Web pages | As needed |
| Display | Interactive ads (matching game, spin wheel) | Rich media | Continuous |
| Search | Paid search ads with targeted keywords | Text ads | Continuous |

#### Step 4: Define SEO Keywords

Group keywords by intent:

| Category | Keywords |
|----------|----------|
| Product | [your product name], [product category], [specific features] |
| Problem | [problem your product solves], [pain point phrases] |
| Action | [buy/sign up/try], [free trial], [demo], [compare] |

#### Step 5: Create Campaign Taglines

Develop 3-4 tagline options that capture the campaign essence. Test them with your team.

#### Step 6: Plan the Customer Journey Content

Map content to each stage of the customer journey:

| Stage | Customer Thinking | Content Needed |
|-------|------------------|----------------|
| Awareness | "I do not know this exists" | Social ads, brand videos, PR |
| Interest | "This might solve my problem" | Blog posts, comparison pages, webinars |
| Consideration | "Is this legit? Is it right for me?" | Case studies, demos, testimonials |
| Decision | "I am ready to try it" | Landing pages, free trials, onboarding |
| Advocacy | "I love this and want to share it" | Referral programs, community features |

### Worked Example: Mercury Marine Content Strategy

**Single-Minded Proposition:** Mercury is leading the wave in marine electrification.

**Tagline Options:**
- "The Best Behind You"
- "Reliability Starts Here"
- "Powering the Perfect Experience"
- "Go Boldly" (Mercury's existing global campaign)

**Customer Journey (mapped from research):**

1. MOTIVATION: Consumer recently purchased a cabin and is looking for a boat
2. RESEARCH: Consumer asks cabin neighbors about boats -- neighbor suggests Mercury
3. GOOGLE: Consumer looks up neighbor's recommendation
4. VISIT: Consumer finds Mercury showroom near his cabin
5. DISCOVERY: Consumer discovers several options, uses comparison tools
6. LEARN: Consumer learns about Mercury's products, warranties, financing
7. DECISION: Consumer decides Mercury Avator is right and is referred to a local OEM dealer
8. BLISS: Consumer is thrilled and recommends Mercury to a new neighbor

**Barrier-Busting Content:** The research identified four potential barriers that content needed to address:
- **Range anxiety**: "Will my battery run out on the water?"
- **High upfront costs**: "Why should I purchase an electric motor when it is more expensive?"
- **The Leap**: "I am afraid to go from gas to electric"
- **Charging infrastructure**: "How, when, and where will I charge my boat?"

### Worked Example: Coinbase Content Strategy

**SEO Keywords:**

| Category | Keywords |
|----------|----------|
| Investing | invest, investments, tech investments, future, market, growing investment markets, technology, finance, currency |
| Crypto | cryptocurrency, crypto coins, free crypto, best crypto, new crypto, alternative currency, bitcoin, altcoins |
| Earning | free, earn, reward, prize, bonus |

**Paid Search Ads:**
- Ad 1: "Start Your Crypto Journey! / Buy, Sell, and Trade Your Way. / Coinbase is the best way to start out. Learn about crypto with Coinbase Earn!"
- Ad 2: "Join the Most Secure Exchange. / Don't Risk Your Portfolio! / Coinbase has many options to keep your investments safe. Try Coinbase Wallet!"
- Ad 3: "Click to Learn About Crypto. / All Kinds of Coins Available! / Come to coinbase.com to find BTC, ETH, and all the altcoins you could ever need!"

**Rich Interactive Display Ads:**
- Matching game ad: Users match crypto coin pairs, then get linked to Coinbase Earn
- Spin wheel ad: Users spin to reveal crypto coins, then get linked to sign up
- Pick-a-card ad: Users choose cards to reveal crypto facts, then get linked to earn

**Email Marketing:**
- Subject: "You can earn how much?!"
- Body: "Coinbase Earn could be your opportunity to get a headstart with crypto. Learn about your options by watching our short crypto videos then answer questions to earn up to $20 in free crypto each week! All you need to get started is a Coinbase account and a desire to know more about all your favorite cryptocurrencies."

**Website Audit Findings (apply to your own sites):**
- Consistent branding throughout
- Clear CTA: "Start investing in crypto with Coinbase"
- Simple site navigation
- Clean, modern design
- Welcoming articles and banners that tell a story
- Improvement needed: more images in long informational pieces, page recommendations to reduce bounce

### BlackRoad Application: Content Strategy

**Brand Voice:** Sovereign, technical, direct. No fluff. Show the infrastructure. Prove everything.

**SEO Keywords for RoadPay:**

| Category | Keywords |
|----------|----------|
| Product | RoadPay, BlackRoad billing, self-hosted billing, edge billing |
| Problem | vendor lock-in billing, own your billing data, Stripe alternative self-hosted |
| Action | deploy billing Cloudflare, D1 billing setup, free billing platform |

**BlackRoad Design Standards (apply to all campaign creative):**
- Black background, white text, gradient shapes only
- Fonts: Space Grotesk + JetBrains Mono + Inter
- Colors: Hot pink (#FF1D6C), Amber (#F5A623), Electric blue (#2979FF), Violet (#9C27B0)
- Logo art available on R2: images.blackroad.io/pixel-art/[name].png (50 assets)
- 10 CSS logo treatments available: neon, glitch, scanlines, holo, orbit, matrix, gradient-ring

---

## Phase 8: Timeline and Budget

### Principle

A campaign without a timeline is a wish. A campaign without a budget is a fantasy. Both must be explicit and tracked.

### Process

#### Step 1: Define Campaign Phases

Most campaigns have 3-5 phases:

| Phase | Duration | Activities |
|-------|----------|-----------|
| Discovery | 2-4 weeks | Research, interviews, surveys, competitive audit |
| Strategy | 1-2 weeks | SWOT, goals, PESO plan, creative brief |
| Creative | 2-4 weeks | Content creation, ad design, landing pages |
| Launch | 1-2 weeks | Campaign setup, tracking, soft launch, QA |
| Optimization | Ongoing (4-12 weeks) | Monitoring, A/B testing, reporting, iteration |

#### Step 2: Set Milestones

Define specific deliverables and dates:

| Date | Milestone | Deliverable |
|------|-----------|-------------|
| Week 1 | Discovery kickoff | Research brief, interview schedule |
| Week 3 | Research complete | Research deck, insights summary |
| Week 4 | Strategy presentation | SWOT, goals, PESO plan |
| Week 6 | Creative review | Ad designs, copy, landing pages |
| Week 7 | Campaign launch | All ads live, tracking confirmed |
| Week 9 | First optimization report | Performance data, recommendations |
| Week 12 | Campaign wrap-up | Final report, learnings, next steps |

#### Step 3: Set Budget

Break budget into categories:

| Category | Percentage | Details |
|----------|-----------|---------|
| Paid media (ad spend) | 50-60% | Platform-specific allocation |
| Creative production | 15-20% | Design, video, copywriting |
| Tools and technology | 10-15% | Social listening, analytics, automation |
| Management and labor | 10-15% | Team time, agency fees |
| Contingency | 5% | Unexpected opportunities or pivots |

#### Step 4: Allocate Budget by Channel

Based on your PESO plan and audience research, allocate ad spend to specific platforms:

| Platform | Percent of Ad Spend | Rationale |
|----------|--------------|-----------|
| Primary platform | 40% | Audience is most active here |
| Secondary platform | 30% | Best for consideration-stage content |
| Tertiary platform | 20% | Testing and learning |
| Experimental | 10% | New channel test |

### Worked Example: Mercury Marine Campaign Timeline

| Date | Milestone |
|------|-----------|
| Feb 21, 2022 | Campaign Deck 1: Audience and Competition |
| Feb 22 | Conduct primary research (surveys, focus groups, interviews) |
| Feb 28 | Re-examine secondary research in light of primary findings |
| Mar 1 | Synthesize actionable insights |
| Mar 16 | Campaign Deck 2: Research and Insights presentation |
| Mar 22 | Deep dive into strategy |
| Apr 6 | Strategy and Creative Brief presentation |
| Apr 20 | Creative presentation |
| Apr 27 | Final pitch |

### Worked Example: Coinbase Campaign Phases

The Burger King "Side of Crypto" case study (analyzed in the Coinbase campaign) showed effective phase structure:

| Phase | Dates | Activity |
|-------|-------|----------|
| Prize Code Receipt Phase | Nov 1 - Nov 21, 2021 | Consumers make $5+ purchases to earn prize codes |
| Prize Claim Phase | Nov 1 - Dec 17, 2021 | Consumers redeem codes via Robinhood app |

Prize pool: 20 Bitcoin + 200 Ethereum + 2,000,000 Dogecoin = 2,000,220 total coins. Initial Twitter post: 388K views.

### BlackRoad Application: Campaign Timeline

BlackRoad campaigns benefit from automation. Use the existing cron infrastructure:

| Timing | Automated Action |
|--------|-----------------|
| Every 5 minutes | Health check and fleet collector (already running) |
| Every 30 minutes | Website monitoring and git-sync (already running) |
| Daily | Campaign performance data collection via stats-blackroad Worker |
| Weekly | Campaign optimization review, A/B test evaluation |
| Monthly | Full campaign report generation |

Budget for a BlackRoad campaign is mostly infrastructure (already paid) plus time. Cloudflare Workers (free tier: 100K requests/day), D1 (5GB free), R2 (10GB free), KV (free tier available). The 5 Pis, 2 DO droplets, and 20 domains are sunk costs. Primary campaign cost is content creation time and any paid media spend.

---

## Phase 9: Measurement and Optimization

### Principle

"Insights first. Data driven." Reporting is not about showing numbers -- it is about extracting insights that drive the next action. Every metric should answer a question, and every answer should lead to an optimization.

### Process

#### Step 1: Set Up Tracking

Before launch, ensure tracking is in place:
- Pixels on landing pages (Cloudflare Analytics, platform pixels)
- UTM parameters on all campaign links
- Event tracking for key conversions (sign-ups, purchases, downloads)
- Heat mapping on critical pages
- Call tracking if applicable

#### Step 2: Build a Reporting Dashboard

Organize metrics by funnel stage:

| Stage | Metrics | Tool |
|-------|---------|------|
| Awareness | Impressions, reach, share of voice | Social platforms, analytics |
| Consideration | CTR, time on site, pages/session | Web analytics, ad platforms |
| Conversion | Sign-ups, purchases, CPA, ROAS | CRM, payment system, analytics |

#### Step 3: Optimize Continuously

Optimization levers:
- **Global regions**: Where is performance strongest? Reallocate spend.
- **Channels**: Which platforms are most cost-effective? Shift budget.
- **Audiences**: Which segments convert best? Narrow or expand targeting.
- **Creative**: Which ads, copy, and visuals perform best? A/B test and iterate.

#### Step 4: Report Insights, Not Just Data

Every report should answer:
1. What happened? (the data)
2. Why did it happen? (the insight)
3. What should we do about it? (the recommendation)

### Worked Example: NVIDIA (Case Study from Industry)

NVIDIA executed campaigns promoting their GTC conference with a global audience in a short timeframe. They established an in-depth reporting dashboard to continuously optimize across:
- Global regions
- Channels
- Audiences
- Creative

This is the model -- optimize across all four dimensions simultaneously.

### Worked Example: Second Harvest Heartland (Case Study from Industry)

This nonprofit campaign for SNAP benefits demonstrates the optimization cycle:

**Challenge:** Only 25% of eligible seniors used SNAP benefits. Goal was to increase awareness and drive applications.

**Strategy:** Two-phase approach:
1. Awareness phase: Introduce SNAP to seniors
2. Lead generation phase: Test different messaging and creative

**Optimization findings:**
- Creative focused on budgeting and independence resonated most with senior and caregiver audiences
- Benefit videos drove more conversions (survey completions) than static content
- YouTube had greater performance with the senior population than Facebook (despite more budget going to Facebook)
- Areas with minimal population had the highest click-through rates -- less volume but greater interest

**Key lesson:** The data contradicted assumptions. They budgeted more for Facebook, but YouTube performed better. They expected urban areas to convert, but rural areas showed higher engagement. Reporting drove reallocation.

### Worked Example: 3M Med Tech (Case Study from Industry)

**Results after continuous optimization:**
- Expanded from 9 countries to 22 countries and 14 languages
- First four months of 2020 generated 41% more opportunities than all of 2018
- 12:1 ratio of opportunity value to ad spend
- CPC dropped 23% (end of 2019 to start of 2020)
- CPL dropped 37% in the same period

This is what continuous optimization looks like over years. The campaigns did not stop improving.

### BlackRoad Application: Measurement

BlackRoad already has the measurement infrastructure:

| Metric | Tool | Location |
|--------|------|----------|
| Site traffic | analytics-blackroad Worker + D1 | Cloudflare |
| API stats | stats-blackroad Worker + KV | Cloudflare |
| Search queries | RoadSearch D1 FTS5 | 29 indexed pages |
| Auth events | auth.blackroad.io | D1 (42 users) |
| Payment events | RoadPay (D1 tollbooth) | Cloudflare |
| Fleet health | Every-5-min cron health collector | 5 Pis |
| Git activity | Squad Webhook | 69 repos, 8 agents |

Reports should be generated automatically and pushed to Slack via the existing KPI cron system (daily 6am).

---

## Campaign Brief Template

Fill in every blank. If you cannot fill in a blank, that is a research gap you need to close before proceeding.

```
================================================================
BLACKROAD CAMPAIGN BRIEF
================================================================

PROJECT INFORMATION
-------------------
Client/Product:     _______________________________________________
Project Name:       _______________________________________________
Campaign Manager:   _______________________________________________
Start Date:         _______________________________________________
End Date:           _______________________________________________

OVERVIEW
--------
Summary (1-2 sentences of what this campaign does):
___________________________________________________________________
___________________________________________________________________

OBJECTIVES
----------
Business Objective:
___________________________________________________________________

Marketing/Campaign Objective:
___________________________________________________________________

Benchmarks (what does success look like?):
___________________________________________________________________

What do we want to learn/test/gain from running this campaign?
___________________________________________________________________

AUDIENCE
--------
Persona 1 Name:     _______________________________________________
  Age:              _______________________________________________
  Gender:           _______________________________________________
  Location:         _______________________________________________
  Income:           _______________________________________________
  Education:        _______________________________________________
  Occupation:       _______________________________________________
  Psychographics:   _______________________________________________
  Journey Stage:    _______________________________________________
  Wants/Goals:      _______________________________________________
  Why should they care about our product:
  _________________________________________________________________

Persona 2 Name:     _______________________________________________
  Age:              _______________________________________________
  Gender:           _______________________________________________
  Location:         _______________________________________________
  Income:           _______________________________________________
  Education:        _______________________________________________
  Occupation:       _______________________________________________
  Psychographics:   _______________________________________________
  Journey Stage:    _______________________________________________
  Wants/Goals:      _______________________________________________
  Why should they care about our product:
  _________________________________________________________________

MESSAGING AND CONTENT
---------------------
Single-Minded Proposition (one core message):
___________________________________________________________________

Key Messages (3-5 supporting points):
  1. ________________________________________________________________
  2. ________________________________________________________________
  3. ________________________________________________________________
  4. ________________________________________________________________
  5. ________________________________________________________________

Proof Points (data, testimonials, case studies):
  1. ________________________________________________________________
  2. ________________________________________________________________
  3. ________________________________________________________________

Content Assets Needed:
  [ ] Video          [ ] Blog posts      [ ] Social graphics
  [ ] Display ads    [ ] Email template   [ ] Landing page
  [ ] Search ads     [ ] Infographics     [ ] Interactive ads
  [ ] Other: __________________________________________________________

CHANNELS
--------
Past campaigns and results:
___________________________________________________________________

Channels selected (check all that apply):
  [ ] Twitter/X      [ ] LinkedIn        [ ] Facebook
  [ ] Instagram       [ ] YouTube         [ ] TikTok
  [ ] Google Search   [ ] Display Network [ ] Reddit
  [ ] Email           [ ] Podcast         [ ] Twitch
  [ ] Other: __________________________________________________________

MARTECH STACK
-------------
CMS:                 _______________________________________________
CRM:                 _______________________________________________
Email Automation:    _______________________________________________
Web Analytics:       _______________________________________________
Tracking:            _______________________________________________
Social Listening:    _______________________________________________
Access to Data:      _______________________________________________

CTAs AND CONVERSIONS
--------------------
Primary CTA:         _______________________________________________
Secondary CTA:       _______________________________________________
Landing Page URL:    _______________________________________________
Post-Conversion Journey (what happens after they convert):
___________________________________________________________________

COMPETITORS
-----------
Competitor 1:        _______________________________________________
  Their strength:    _______________________________________________
  Their weakness:    _______________________________________________

Competitor 2:        _______________________________________________
  Their strength:    _______________________________________________
  Their weakness:    _______________________________________________

Competitor 3:        _______________________________________________
  Their strength:    _______________________________________________
  Their weakness:    _______________________________________________

BUDGET
------
Total Budget:        $______________________________________________
Management included? [ ] Yes  [ ] No
Retainer style?      [ ] Yes  [ ] No
Creative needed?     [ ] Yes  [ ] No

Budget Allocation:
  Paid media:        $______________________________________________
  Creative:          $______________________________________________
  Tools:             $______________________________________________
  Labor:             $______________________________________________
  Contingency:       $______________________________________________

TIMING
------
Launch Goal Date:    _______________________________________________
Campaign Length:     _______________________________________________
Key Dates/Events to Incorporate:
___________________________________________________________________

PHASE DELIVERABLES
------------------
Phase 1 (Discovery):    ___________________________________________
Phase 2 (Strategy):     ___________________________________________
Phase 3 (Creative):     ___________________________________________
Phase 4 (Launch):       ___________________________________________
Phase 5 (Optimization): ___________________________________________

================================================================
```

---

## Campaign Deck Template

Use this template for presenting campaign strategy to stakeholders. Fill in every blank.

```
================================================================
BLACKROAD CAMPAIGN DECK TEMPLATE
================================================================

SLIDE 1: TITLE
--------------
Campaign Name:       _______________________________________________
Product/Brand:       _______________________________________________
Date:                _______________________________________________
Team Members and Roles:
  __________________ : _____________________________________________
  __________________ : _____________________________________________
  __________________ : _____________________________________________

SLIDE 2: AGENDA
---------------
  1. Background and Context
  2. Research and Insights
  3. Target Audience and Personas
  4. Competitive Landscape
  5. SWOT Analysis
  6. Campaign Goals and KPIs
  7. PESO Media Plan
  8. Content and Creative Strategy
  9. Timeline and Budget
  10. Measurement Plan
  11. Next Steps

SLIDE 3: BACKGROUND
--------------------
Company/Product Founded:    ________________________________________
Mission:                    ________________________________________
Vision:                     ________________________________________
Core Values:                ________________________________________
Key Stats:
  Revenue:                  ________________________________________
  Users/Customers:          ________________________________________
  Market Position:          ________________________________________

SLIDE 4: SOCIAL LANDSCAPE
--------------------------
Platform 1: ____________  Followers: _________  Engagement: ________
Platform 2: ____________  Followers: _________  Engagement: ________
Platform 3: ____________  Followers: _________  Engagement: ________
Platform 4: ____________  Followers: _________  Engagement: ________

Strengths:              ____________________________________________
Room to Grow:           ____________________________________________

SLIDE 5: WHAT MAKES [BRAND] UNIQUE
------------------------------------
Unique Factor 1:        ____________________________________________
Unique Factor 2:        ____________________________________________
Unique Factor 3:        ____________________________________________

SLIDE 6: COMPETITIVE LANDSCAPE
-------------------------------
Competitor 1: ______________
  Products:             ____________________________________________
  Positioning:          ____________________________________________
  Advantages:           ____________________________________________
  Weaknesses:           ____________________________________________

Competitor 2: ______________
  Products:             ____________________________________________
  Positioning:          ____________________________________________
  Advantages:           ____________________________________________
  Weaknesses:           ____________________________________________

Competitor 3: ______________
  Products:             ____________________________________________
  Positioning:          ____________________________________________
  Advantages:           ____________________________________________
  Weaknesses:           ____________________________________________

POSITIONING GRID (Business):
  Y-axis: _____________ <---> _____________
  X-axis: _____________ <---> _____________
  Our brand sits at:    ____________________________________________
  Competitors sit at:   ____________________________________________

POSITIONING GRID (Brand):
  Y-axis: _____________ <---> _____________
  X-axis: _____________ <---> _____________
  Our brand sits at:    ____________________________________________
  Competitors sit at:   ____________________________________________

SLIDE 7: SWOT
-------------
STRENGTHS:
  1. _________________________________________________________________
  2. _________________________________________________________________
  3. _________________________________________________________________

WEAKNESSES:
  1. _________________________________________________________________
  2. _________________________________________________________________

OPPORTUNITIES:
  1. _________________________________________________________________
  2. _________________________________________________________________

THREATS:
  1. _________________________________________________________________
  2. _________________________________________________________________

SLIDE 8: GOALS AND KPIs
------------------------
AWARENESS GOAL:
  "Increase brand awareness of [___________] among [___________]
   by [____]% by [___________]."
  KPIs: ____________________________________________________________

CONSIDERATION GOAL:
  "Grow brand consideration of [___________] by [____]% among
   [___________] by [___________]."
  KPIs: ____________________________________________________________

CONVERSION GOAL:
  "Increase [___________] by [____]% through [___________]
   by [___________]."
  KPIs: ____________________________________________________________

SLIDE 9: TARGET AUDIENCE
-------------------------
Demographics:
  Age: _____________  Gender: _____________  Income: _______________
  Location: ___________  Education: ___________  Race: _____________

Psychographics:
  1. _________________ (Index ___)
  2. _________________ (Index ___)
  3. _________________ (Index ___)
  4. _________________ (Index ___)

SLIDE 10: PERSONA 1
--------------------
Name:                   ____________________________________________
Tagline:                ____________________________________________
Age / Race / Gender:    ____________________________________________
Income / Education:     ____________________________________________
Occupation:             ____________________________________________

Bio (2-3 sentences):
___________________________________________________________________
___________________________________________________________________

Goals:
  1. _________________________________________________________________
  2. _________________________________________________________________

Frustrations:
  1. _________________________________________________________________
  2. _________________________________________________________________

Beliefs:
  1. _________________________________________________________________
  2. _________________________________________________________________

SLIDE 11: PERSONA 2
--------------------
Name:                   ____________________________________________
Tagline:                ____________________________________________
Age / Race / Gender:    ____________________________________________
Income / Education:     ____________________________________________
Occupation:             ____________________________________________

Bio (2-3 sentences):
___________________________________________________________________
___________________________________________________________________

Goals:
  1. _________________________________________________________________
  2. _________________________________________________________________

Frustrations:
  1. _________________________________________________________________
  2. _________________________________________________________________

Beliefs:
  1. _________________________________________________________________
  2. _________________________________________________________________

SLIDE 12: CUSTOMER JOURNEY
---------------------------
Stage 1 - MOTIVATION:      ________________________________________
Stage 2 - RESEARCH:        ________________________________________
Stage 3 - DISCOVERY:       ________________________________________
Stage 4 - LEARNING:        ________________________________________
Stage 5 - DECISION:        ________________________________________
Stage 6 - ADVOCACY:        ________________________________________

Potential Barriers:
  1. _________________________________________________________________
  2. _________________________________________________________________
  3. _________________________________________________________________
  4. _________________________________________________________________

SLIDE 13: PESO MEDIA PLAN
--------------------------
PAID:
  Strategy:             ____________________________________________
  Rationale:            ____________________________________________
  Tactics:              ____________________________________________

EARNED:
  Strategy:             ____________________________________________
  Rationale:            ____________________________________________
  Tactics:              ____________________________________________

SHARED:
  Strategy:             ____________________________________________
  Rationale:            ____________________________________________
  Tactics:              ____________________________________________

OWNED:
  Strategy:             ____________________________________________
  Rationale:            ____________________________________________
  Tactics:              ____________________________________________

SLIDE 14: CONTENT AND CREATIVE
-------------------------------
Brand Voice (3 words):  ____________________________________________
Tagline:                ____________________________________________

SEO Keywords:
  Product:              ____________________________________________
  Problem:              ____________________________________________
  Action:               ____________________________________________

Content Calendar Summary:
  Daily:                ____________________________________________
  Weekly:               ____________________________________________
  Monthly:              ____________________________________________

SLIDE 15: TIMELINE
-------------------
Week __: ____________  Deliverable: ________________________________
Week __: ____________  Deliverable: ________________________________
Week __: ____________  Deliverable: ________________________________
Week __: ____________  Deliverable: ________________________________
Week __: ____________  Deliverable: ________________________________
Week __: ____________  Deliverable: ________________________________

SLIDE 16: BUDGET
-----------------
Total:                  $___________________________________________
Paid Media:             $___________________________________________
Creative Production:    $___________________________________________
Tools and Technology:   $___________________________________________
Management:             $___________________________________________
Contingency:            $___________________________________________

SLIDE 17: MEASUREMENT PLAN
---------------------------
Reporting Frequency:    ____________________________________________
Dashboard Tool:         ____________________________________________

Optimization Levers:
  [ ] Regions           [ ] Channels
  [ ] Audiences         [ ] Creative

Success Criteria:
  Awareness:            ____________________________________________
  Consideration:        ____________________________________________
  Conversion:           ____________________________________________

SLIDE 18: NEXT STEPS
---------------------
Action 1:               ____________________________________________
  Owner:                ____________________________________________
  Due Date:             ____________________________________________

Action 2:               ____________________________________________
  Owner:                ____________________________________________
  Due Date:             ____________________________________________

Action 3:               ____________________________________________
  Owner:                ____________________________________________
  Due Date:             ____________________________________________

================================================================
```

---

## PESO Planning Template

Use this template to plan the PESO strategy for each campaign goal.

```
================================================================
PESO PLANNING TEMPLATE
================================================================

CAMPAIGN:            _______________________________________________
DATE:                _______________________________________________

--------------------------------------------------------------------
GOAL 1: [AWARENESS / CONSIDERATION / CONVERSION]
"___________________________________________________________________"

PAID Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Platform:          _______________________________________________
  Budget:            $______________________________________________
  KPI:               _______________________________________________

EARNED Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Target outlets:    _______________________________________________
  KPI:               _______________________________________________

SHARED Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Platform:          _______________________________________________
  KPI:               _______________________________________________

OWNED Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Platform:          _______________________________________________
  KPI:               _______________________________________________

--------------------------------------------------------------------
GOAL 2: [AWARENESS / CONSIDERATION / CONVERSION]
"___________________________________________________________________"

PAID Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Platform:          _______________________________________________
  Budget:            $______________________________________________
  KPI:               _______________________________________________

EARNED Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Target outlets:    _______________________________________________
  KPI:               _______________________________________________

SHARED Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Platform:          _______________________________________________
  KPI:               _______________________________________________

OWNED Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Platform:          _______________________________________________
  KPI:               _______________________________________________

--------------------------------------------------------------------
GOAL 3: [AWARENESS / CONSIDERATION / CONVERSION]
"___________________________________________________________________"

PAID Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Platform:          _______________________________________________
  Budget:            $______________________________________________
  KPI:               _______________________________________________

EARNED Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Target outlets:    _______________________________________________
  KPI:               _______________________________________________

SHARED Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Platform:          _______________________________________________
  KPI:               _______________________________________________

OWNED Strategy:
  What:              _______________________________________________
  Why:               _______________________________________________
  Platform:          _______________________________________________
  KPI:               _______________________________________________

================================================================
```

---

## Appendix: BlackRoad MarTech Stack

The BlackRoad marketing technology stack is self-hosted and sovereign. This is the infrastructure available for every campaign.

### Content Management
- **30 websites** across 20 root domains on Cloudflare Pages and Workers
- **Gitea** (Octavia :3100): 207 repos, primary git host
- **GitHub**: 275+ repos across 17 orgs (mirror)
- **R2 Object Storage**: images.blackroad.io -- 50+ pixel art assets, logo treatments, motion video

### Analytics and Tracking
- **analytics-blackroad Worker + D1**: Site-level analytics
- **stats-blackroad Worker + KV**: API and performance stats
- **RoadSearch D1 FTS5**: Search query analytics (29 pages indexed)
- **Cloudflare Analytics**: Built into every Workers deployment

### Customer and Auth
- **auth.blackroad.io**: JWT authentication, D1 backend, 42 users
- **RoadPay (D1 tollbooth)**: Billing system with 4 plans + 4 addons, Stripe as card charger

### Search and Discovery
- **RoadSearch**: D1 FTS5 full-text search, AI answers via Ollama, /search route
- **Memory Indexer**: FTS5 with 156,675 entries (~184MB), knowledge graph

### Automation and AI
- **Squad Webhook**: 8 AI agents respond to @blackboxprogramming on GitHub, 69 repos hooked
- **Ollama on Cecilia**: 16 local AI models for content generation
- **2x Hailo-8**: 52 TOPS AI inference (Cecilia + Octavia)
- **BlackRoad Studio**: studio.blackroad.io -- animated video platform (SDXL, Llama 3.1, MeloTTS)

### Communication
- **NATS v2.12.3**: Pub/sub messaging across 4/5 nodes
- **Slack Hub Worker**: Fleet + Stripe + GitHub routing, all 5 Pis connected
- **KPI System**: Daily 6am automated reports to Slack

### Infrastructure
- **5 Raspberry Pis**: Alice (.49), Cecilia (.96), Octavia (.101), Aria (.98), Lucidia (.38)
- **2 DigitalOcean Droplets**: gematria (nyc3), anastasia (nyc1)
- **WireGuard Mesh**: anastasia hub, 10.8.0.x
- **Cloudflare**: 95+ Pages, 40 KV, 8 D1, 10 R2, 18 tunnels

### Social Listening and Research Tools (External)
- Answer the Public (keyword questions)
- Google Trends (search interest)
- Google Search Console (organic search data)
- Simmons MRI (consumer media consumption)
- Kantar (competitive spending)

---

## Quick Reference: The Seven Questions Every Campaign Must Answer

These questions guide media planning, establish what you will test and learn, and tie efforts back to objectives:

1. **How much should we spend?**
2. **What channels should we use?**
3. **Who should we target?**
4. **Where should we target?**
5. **When should we advertise?**
6. **What content should we promote?**
7. **What are we getting for our investment?**

If you cannot answer all seven, go back to discovery.

---

## Quick Reference: The Three Insight Types

When synthesizing research, look for these three types of insights:

1. **Instinct** -- Follow your gut. What pattern do you see that the data has not explicitly stated?
2. **Tension** -- Today vs. the world people want. Where is the gap between current reality and desired future?
3. **Problem** -- Frustration = opportunity. What frustrates your audience that you can solve?

The Mercury campaign produced all three:
- **Instinct**: Young adults gravitate toward eco-friendly products because signaling environmentalism through purchases is easier than changing habits
- **Tension**: Consumers scrutinize electric battery range because it is hard to imagine a serene boating experience when you are constantly worried about getting stranded
- **Problem**: Buyers are drawn to cutting-edge tech that others do not have because we are taught to buy into exclusivity

---

## Quick Reference: Creative Hallmarks Checklist

Before approving any campaign creative, verify:

**Print and Digital Ads:**
- [ ] Visual impact -- is it unique?
- [ ] Do components work together (visual, headline, copy, concept)?
- [ ] Is it harmonious (photo style, font, tone)?
- [ ] Is the campaign consistent across all pieces?

**Out-of-Home:**
- [ ] Visual impact -- is it unique?
- [ ] No more than 3-5 elements

**Audio:**
- [ ] Theatre of the mind -- is the listener visualizing?
- [ ] Role of music defined
- [ ] Tells a story
- [ ] Consistent with other campaign assets

**Video:**
- [ ] Is it unique?
- [ ] Does it tell the story?
- [ ] Does it play well (length, style, channel)?
- [ ] What is the viewer supposed to do after watching?

---

*BlackRoad OS -- Pave Tomorrow.*