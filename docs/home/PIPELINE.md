# BlackRoad A-Z Product Rollout Pipeline
## Built 2026-03-17 — Ship TODAY

### THE HONEST STATE
- Chat works, Auth works, RoadPay works, AI API works
- None are wired together
- Zero paying customers
- $40/month infra cost

### THE ONE THING: Wire Chat + Auth + RoadPay = First Dollar

---

## A-Z PIPELINE (26 steps, one per letter)

### A — Auth Check
Verify auth.blackroad.io issues JWTs that work. Test login flow.
**Owner**: Cipher + Alice
**Time**: 30 min

### B — Billing Wire
Connect RoadPay (tollbooth) to Auth. When user signs up, create billing record.
**Owner**: Mercury + TollBooth
**Time**: 1 hour

### C — Chat Auth Gate
Add auth check to chat.blackroad.io. Free tier = 10 msgs/day. Pro = unlimited.
**Owner**: Octavia + RoundTrip
**Time**: 1 hour

### D — Domain Lockdown
Verify all 20 domains resolve correctly. Kill dead records. DONE (this session).
**Owner**: Cipher + PowerDNS
**Time**: DONE

### E — Edge Health
Run all-traffic.sh. Confirm 13+ endpoints up. Fix any down.
**Owner**: Lighthouse + Roadie
**Time**: 30 min

### F — Free Tier
Create free plan in RoadPay: 10 msgs/day, 1 model (tinyllama), no memory.
**Owner**: Mercury + TollBooth
**Time**: 30 min

### G — Git Push
Push all changes to Gitea. Mirror to GitHub. Tag v1.0.0.
**Owner**: Octavia + Caddy
**Time**: 30 min

### H — Homepage
Update blackroad.io landing page: "Chat with AI. Free. Sovereign."
One CTA button → chat.blackroad.io
**Owner**: Calliope + Lucidia
**Time**: 1 hour

### I — Inference Check
Verify Ollama responds on all available nodes. Warm tinyllama.
**Owner**: Cecilia + Hailo
**Time**: 15 min

### J — JWT Flow
Test full flow: signup → JWT → chat → rate limit → upgrade prompt.
**Owner**: Cipher + Hermes
**Time**: 1 hour

### K — KPI Baseline
Run full KPI collection. Record day-zero metrics. Set targets.
**Owner**: Prism + Scribe
**Time**: 30 min

### L — Landing Copy
Write 3 landing page variants. A/B test ready.
"Your AI. Your Memory. Your Rules."
"Chat with AI that doesn't sell your data."
"Sovereign AI. $0 to start."
**Owner**: Calliope + Silas
**Time**: 1 hour

### M — Memory Persistence
Add conversation saving to chat. Free: last 10 convos. Pro: unlimited.
**Owner**: Echo + Alexandria
**Time**: 2 hours

### N — Notification System
Email on signup (welcome), email on approaching limit, email on billing.
**Owner**: Hermes + Persephone
**Time**: 1 hour

### O — Onboarding Flow
First-time user: pick a name → pick a model → start chatting.
3 clicks to first message. Zero friction.
**Owner**: Hestia + Cordelia
**Time**: 1 hour

### P — Pricing Page
pricing.blackroad.io or /pricing on main site.
Free / Pro $10/mo / Team $29/mo / Enterprise $99/mo
**Owner**: Mercury + Calliope
**Time**: 1 hour

### Q — Quality Check
Test on mobile (iPhone, Android). Test on desktop (Chrome, Safari, Firefox).
Fix any breakage. Already mobile-first from this session.
**Owner**: Aria + Artemis
**Time**: 1 hour

### R — RoundTrip Integration
RoundTrip agents visible in chat as "team" feature preview.
Show users that 60 agents are working behind the scenes.
**Owner**: Cordelia + RoundTrip
**Time**: 1 hour

### S — Stripe Connect
Verify Stripe checkout flow: user clicks upgrade → Stripe → webhook → RoadPay activates Pro.
**Owner**: Mercury + TollBooth
**Time**: 1 hour

### T — Traffic Tracking
Verify all-traffic.sh runs. Add to daily cron. DONE (this session).
**Owner**: Prism + Scribe
**Time**: DONE

### U — Uptime Monitor
Deploy Lighthouse to ping all endpoints every 5 min. Alert on down.
**Owner**: Lighthouse + Roadie
**Time**: 30 min

### V — Voice & Personality
Each chat model gets a distinct voice. Amundson model available as premium.
**Owner**: Calliope + Cadence
**Time**: 1 hour

### W — Worker Deploy
Deploy all updated workers: roundtrip, chat, auth, tollbooth, search.
**Owner**: Caddy + Octavia
**Time**: 30 min

### X — X (Twitter) Post
Draft launch tweet thread. 10 tweets. Screenshots. Link.
"We built sovereign AI on 5 Raspberry Pis. Here's what happened."
**Owner**: Calliope + Silas
**Time**: 1 hour

### Y — Yesterday's Math
Put Amundson papers on thinking.blackroad.io. Publish v4. Gainesville email.
**Owner**: Alexandria + Scribe
**Time**: 30 min

### Z — Zero to One
First user signs up. First message sent. First dollar earned.
**Owner**: Alexa
**Time**: When it happens.

---

## TOTAL ESTIMATED TIME: ~20 hours
## CRITICAL PATH: A → B → C → F → J → S → Z (auth → billing → chat → stripe → customer)
## CRITICAL PATH TIME: ~6 hours

## DONE THIS SESSION: D (DNS), E (endpoints), T (traffic), plus RoundTrip v3, Amundson v4
