# ROAD — Revenue-Backed Digital Currency

> **BlackRoad OS, Inc.** · Proprietary · Not a security · Not available for public trading

ROAD is a revenue-backed digital currency powered by the BlackRoad OS infrastructure. Every API call, AI inference session, OS license, agent identity registration, and edge-hosting minute earns ROAD at a fixed rate of **1 ROAD = $100,000 USD**.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Quick Start](#2-quick-start)
3. [Project Structure](#3-project-structure)
4. [Configuration](#4-configuration)
5. [npm Scripts](#5-npm-scripts)
6. [Stripe Integration](#6-stripe-integration)
7. [Deployment — Cloudflare Pages](#7-deployment--cloudflare-pages)
8. [End-to-End Tests](#8-end-to-end-tests)
9. [Revenue Streams](#9-revenue-streams)
10. [Economics Dashboard](#10-economics-dashboard)
11. [Proof of Reserve](#11-proof-of-reserve)
12. [Security & Legal](#12-security--legal)
13. [Contributing](#13-contributing)

---

## 1. Overview

| Property | Value |
|---|---|
| Currency | ROAD |
| Peg | 1 ROAD = $100,000 USD |
| BTC Reserve | `bc1qqf4l8mj0cjz6gqvvjdmqmdkez5x2gq4smu5fr4` |
| Max Supply | 21,000,000 ROAD |
| Infrastructure | Cloudflare Pages + Workers |
| Payment processor | Stripe |
| Dashboard | [roadcoin.blackroad.dev](https://roadcoin.pages.dev) |

---

## 2. Quick Start

**Prerequisites:** Node.js ≥ 18, npm ≥ 9

```bash
# Clone
git clone https://github.com/BlackRoad-OS/blackroad-os-roadcoin.git
cd blackroad-os-roadcoin

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# → fill in STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY

# Start local dev server
npm run dev

# Run end-to-end tests
npm run test:e2e
```

---

## 3. Project Structure

```
blackroad-os-roadcoin/
├── index.html              # Marketing & live-dashboard page
├── package.json            # npm manifest, scripts, dependencies
├── wrangler.toml           # Cloudflare Pages / Workers config
├── .env.example            # Environment variable template
├── tests/
│   └── e2e/
│       └── smoke.spec.js   # Playwright end-to-end smoke tests
├── LICENSE                 # BlackRoad OS Proprietary License v2
└── README.md               # This file
```

---

## 4. Configuration

Create a `.env` file (never commit it):

```env
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare (populated automatically by Wrangler)
CLOUDFLARE_ACCOUNT_ID=848cf0b18d51e0170e0d1537aec3505a
```

---

## 5. npm Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Wrangler local dev server |
| `npm run deploy` | Deploy to Cloudflare Pages via Wrangler |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:e2e:ui` | Run Playwright with interactive UI |
| `npm run lint` | Lint HTML with htmlhint |

---

## 6. Stripe Integration

ROAD access plans are sold via [Stripe Checkout](https://stripe.com/docs/payments/checkout).

### Products / Prices

| Plan | ROAD Amount | USD Price | Stripe Price ID |
|---|---|---|---|
| API Access — Starter | 0.001 ROAD / call | $0.01 / call | `price_api_per_call` |
| Agent Identity | 1 ROAD | $10 | `price_identity` |
| OS License — Annual | 100 ROAD | $1,000 | `price_os_annual` |
| Edge Hosting — Monthly | 0.1 ROAD / site | $1 / site / mo | `price_hosting_mo` |

### Checkout Flow

1. User clicks **Get Access** on the dashboard page.
2. Browser calls the Cloudflare Worker at `/api/checkout` with `{ priceId, quantity }`.
3. Worker creates a Stripe Checkout Session and returns `{ url }`.
4. Browser redirects to the hosted Stripe Checkout page.
5. On success, Stripe posts a webhook to `/api/webhook`.
6. Worker validates the `stripe-signature`, credits ROAD to the user's ledger entry.

### Webhook endpoint

Configure in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks):

```
https://roadcoin.pages.dev/api/webhook
Events: checkout.session.completed
```

---

## 7. Deployment — Cloudflare Pages

```bash
# Authenticate once
npx wrangler login

# Deploy
npm run deploy
```

`wrangler.toml` settings:

```toml
name = "blackroad-roadcoin"
account_id = "848cf0b18d51e0170e0d1537aec3505a"
compatibility_date = "2024-12-01"
pages_build_output_dir = "."
```

---

## 8. End-to-End Tests

Tests live in `tests/e2e/smoke.spec.js` and use [Playwright](https://playwright.dev).

```bash
# Install browsers once
npx playwright install chromium

# Run all e2e tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

### Test coverage

| Test | Description |
|---|---|
| Page loads | Verifies HTTP 200 and page title |
| Hero section | Checks ROAD heading and tagline |
| Nav links | All anchor links present |
| Balance display | Balance element exists and contains "ROAD" |
| Economics stats | Stats row renders |
| Revenue stream cards | 5 active-badge cards present |
| Proof of Reserve | BTC address visible |
| Payments section | Payment list renders |
| Get Access CTA | Stripe checkout button present |
| Mobile viewport | Page renders without overflow at 375 px |

---

## 9. Revenue Streams

| Stream | Rate | Status |
|---|---|---|
| BlackRoad API Access | 0.001 ROAD / call ($0.01) | ✅ Active |
| AI Inference (Pi Cluster) | 0.01 ROAD / inference ($0.10) | ✅ Active |
| BlackRoad OS License | 100 ROAD / year ($1,000) | ✅ Active |
| Agent Identity (SHA-2048) | 1 ROAD / identity ($10) | ✅ Active |
| Edge Hosting | 0.1 ROAD / site / mo ($1) | ✅ Active |

---

## 10. Economics Dashboard

Live at [roadcoin.pages.dev](https://roadcoin.pages.dev)

| Metric | Value |
|---|---|
| Total Earned | 207,017.90 ROAD |
| USD Equivalent | $20,701,790,000 |
| Blocks Mined | 3,849 |
| Total Mined | 20,949.93 ROAD |
| Hashrate | 1.6 M H/s |
| Cloudflare Projects | 205 |
| GitHub Repos | 1,085 |
| AI Agents | 30,000 |

---

## 11. Proof of Reserve

ROAD tokens are 1:1 BTC-backed. Reserve is publicly verifiable on-chain.

| Field | Value |
|---|---|
| BTC Deposit Address | `bc1qqf4l8mj0cjz6gqvvjdmqmdkez5x2gq4smu5fr4` |
| BTC Deposited | 0.22001506 |
| BTC In Reserve | 0.22001506 |
| ROAD Minted (Backed) | 0.22001506 |

---

## 12. Security & Legal

- ROAD is a **proprietary revenue-backed digital currency** of BlackRoad OS, Inc.
- **Not a security.** Not registered with any financial regulator.
- **Not available for public trading.** No derivatives, futures, options, or synthetic instruments permitted.
- All infrastructure, code, and assets are the exclusive property of BlackRoad OS, Inc.
- See [LICENSE](./LICENSE) for full terms.

---

## 13. Contributing

This repository is **proprietary and closed-source**. External contributions are not accepted without a signed Contributor License Agreement (CLA) with BlackRoad OS, Inc.

Internal team — submit changes via a feature branch and open a Pull Request against `main`. All PRs must pass e2e tests before merge.

---

© 2026 BlackRoad OS, Inc. All rights reserved.
