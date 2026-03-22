# BlackRoad Product Rollout Pipeline — A to Z

> Ship one product per hour. No talking. Just building.

## The Rule
Every product follows the same 8 steps. No exceptions. No shortcuts. No explaining.

## Pipeline Steps (per product)

```
A. mkdir websites/<product-name>
B. Write index.html (mobile-first, shared design.css, hamburger nav)
C. Add DNS record to PowerDNS (ns1 + ns2)
D. Add Caddy vhost on Gematria
E. Rsync to Gematria /var/www/<product-name>/
F. Verify HTTPS 200
G. Log to memory + codex + TIL
H. Next product.
```

## Today's Rollout Order

### Wave 1 — Revenue Products (ship first, make money)
| # | Product | URL | What It Does |
|---|---------|-----|-------------|
| 1 | **RoadPay** | pay.blackroad.io | Billing dashboard, plans, checkout |
| 2 | **RoadSearch** | search.blackroad.io | Search all BlackRoad content + AI answers |
| 3 | **Garage** | garage.blackroad.io | Dev sandbox, instant code preview |

### Wave 2 — Creator Tools (the core promise)
| # | Product | URL | What It Does |
|---|---------|-----|-------------|
| 4 | **Canvas Studio** | canvas.blackroad.io | AI design tool, brand DNA |
| 5 | **Writing Studio** | write.blackroad.io | Longform writing + publish |
| 6 | **RoadView** | video.blackroad.io | AI video editing |
| 7 | **Cadence** | music.blackroad.io | Describe → get music (upgrade existing) |

### Wave 3 — Education (90-day sprint vertical)
| # | Product | URL | What It Does |
|---|---------|-----|-------------|
| 8 | **RoadWork** | work.blackroad.io | Learn-then-earn, job placement |
| 9 | **Roadie** | tutor.blackroad.io | AI tutoring, teach-back |
| 10 | **Radius** | sim.blackroad.io | Physics/chem sims |
| 11 | **RoadBook** | book.blackroad.io | Knowledge graph, searchable wiki |

### Wave 4 — Social & Communication
| # | Product | URL | What It Does |
|---|---------|-----|-------------|
| 12 | **BackRoad** | social.blackroad.io | Anti-social network, circles of 12 |
| 13 | **RoadWave** | radio.blackroad.io | Podcasts, voice notes, audio |
| 14 | **BlackCast** | live.blackroad.io | Streaming + broadcasting |
| 15 | **TV Road** | tv.blackroad.io | Long-form video, curated |

### Wave 5 — Infrastructure Tools (for devs)
| # | Product | URL | What It Does |
|---|---------|-----|-------------|
| 16 | **Compass** | analytics.blackroad.io | BI dashboard |
| 17 | **Trailhead** | docs.blackroad.io | Documentation portal (upgrade existing) |
| 18 | **Signal** | alerts.blackroad.io | Notifications, monitoring alerts |
| 19 | **SunRoof** | dash.blackroad.io | Transparency dashboard, fleet overview |
| 20 | **GuardRail** | uptime.blackroad.io | Uptime monitoring |

### Wave 6 — Advanced Products
| # | Product | URL | What It Does |
|---|---------|-----|-------------|
| 21 | **Genesis Road** | game.blackroad.io | Voice-controlled game engine |
| 22 | **RoadTube** | tube.blackroad.io | Creator-first video, 60% rev share |
| 23 | **RoadWorld** | world.blackroad.io | Living metaverse |
| 24 | **RoadMind** | mind.blackroad.io | Reasoning engine |
| 25 | **Black Mode** | auto.blackroad.io | Full AI automation portal |

### Wave 7 — Parental & Safety
| # | Product | URL | What It Does |
|---|---------|-----|-------------|
| 26 | **CarSeat** | kids.blackroad.io | Kids-safe AI, parental controls |
| 27 | **DropOff** | family.blackroad.io | School comms, pickup coordination |

### Wave 8 — Finance & Governance
| # | Product | URL | What It Does |
|---|---------|-----|-------------|
| 28 | **RoadCoin** | coin.blackroad.io | Cryptocurrency (upgrade existing) |
| 29 | **RoadChain** | chain.blackroad.io | Blockchain governance (upgrade existing) |

## Agent Assignments
- **Session A**: Wave 1 + Wave 2 (products 1-7)
- **Session B**: Wave 3 + Wave 4 (products 8-15)
- **Session C**: Wave 5 + Wave 6 (products 16-25)
- **Session D**: Wave 7 + Wave 8 (products 26-29)

## Quality Checklist (every product)
- [ ] Mobile-first (min-width breakpoints)
- [ ] Hamburger nav on mobile
- [ ] BlackRoad design system (design.css)
- [ ] Gradient bar, Space Grotesk, black bg
- [ ] "Pave Tomorrow" tagline
- [ ] Real product content (not placeholder)
- [ ] Working features where possible
- [ ] HTTPS verified
