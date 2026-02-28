# BlackRoad OS Product Ecosystem

> **Your AI. Your Hardware. Your Rules.**
>
> © 2026 BlackRoad OS, Inc. All rights reserved. PROPRIETARY.

## Products

| Product | Port | Equivalent | Description |
|---------|------|-----------|-------------|
| **RoadOS Portal** | 3000 | App Store | Unified product launcher and ecosystem dashboard |
| **RoadChain** | 3001 | Coinbase/Binance | Blockchain explorer, wallet, ROAD token, Bitcoin Lottery |
| **RoadStream** | 3002 | YouTube | Video platform, live streaming, creator studio |
| **RoadFeed** | 3003 | Facebook/Reddit | Social network, communities (Roads), marketplace |
| **RoadSearch** | 3004 | Google | Search engine with AI-powered answers |
| **RoadCode** | 3005 | GitHub | Code hosting, repos, PRs, issues, CI/CD |
| **RoadComms** | 3006 | Teams/Slack | Team messaging, video calls, AI agent channels |
| **RoadVerse** | 3007 | Oculus/Meta | 3D metaverse, VR support, 14 zones, avatar creator |
| **RoadDesk** | 3008 | Windows/macOS | Virtual desktop OS in the browser |

## Extended Ecosystem (Existing)

| Product | Description |
|---------|-------------|
| **RoadWorld** | Street-level maps (MapLibre GL) |
| **Lucidia** | AI learning platform |
| **BlackStream** | Streaming aggregator |
| **Mission Control** | Ecosystem monitoring dashboard |
| **Prism Console** | Enterprise ERP/CRM |
| **Road Wallet** | Browser extension |

## Quick Start

```bash
cd products

# Install all workspaces
npm install

# Run a specific product
npm run dev:portal    # http://localhost:3000
npm run dev:chain     # http://localhost:3001
npm run dev:stream    # http://localhost:3002
npm run dev:feed      # http://localhost:3003
npm run dev:search    # http://localhost:3004
npm run dev:code      # http://localhost:3005
npm run dev:comms     # http://localhost:3006
npm run dev:verse     # http://localhost:3007
npm run dev:desk      # http://localhost:3008
```

## Deployment

All products deploy to Cloudflare Pages via `wrangler.toml` configuration.

```bash
# Deploy individual product
cd products/<product>
wrangler pages deploy dist

# Deploy all
npm run build --workspaces
```

## Tech Stack

- **Framework:** React 18 + Vite
- **3D Engine:** Three.js (RoadVerse)
- **Deployment:** Cloudflare Pages
- **CI/CD:** GitHub Actions
- **Design System:** BlackRoad Brand (Golden Ratio φ)

## Architecture

```
products/
├── portal/      → RoadOS Portal (unified launcher)
├── roadchain/   → RoadChain (blockchain/crypto)
├── roadstream/  → RoadStream (video platform)
├── roadfeed/    → RoadFeed (social network)
├── roadsearch/  → RoadSearch (search engine)
├── roadcode/    → RoadCode (code hosting)
├── roadcomms/   → RoadComms (communication)
├── roadverse/   → RoadVerse (metaverse + VR)
├── roaddesk/    → RoadDesk (virtual desktop)
└── package.json → Workspace root
```

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Amber | `#F5A623` | Accents, highlights |
| Hot Pink | `#FF1D6C` | Primary brand |
| Violet | `#9C27B0` | Secondary |
| Electric Blue | `#2979FF` | Links, interactive |
| Black | `#050508` | Background |
