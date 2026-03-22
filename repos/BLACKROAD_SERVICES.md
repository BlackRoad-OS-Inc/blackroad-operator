# Blackroad Corporation - Complete Service Catalog

This document provides a comprehensive overview of all Blackroad services and their integration.

## Table of Contents

1. [Infrastructure Services](#infrastructure-services)
2. [Blockchain Services](#blockchain-services)
3. [Department Automation Services](#department-automation-services)
4. [Metaverse Services](#metaverse-services)
5. [Collaborative Services](#collaborative-services)
6. [Getting Started](#getting-started)
7. [Service Architecture](#service-architecture)

---

## Infrastructure Services

### Backroad - Load Balancer & Router
**Port:** 4100
**Purpose:** Intelligent request routing and load balancing for all Blackroad services

**Features:**
- Multiple load balancing strategies (Round Robin, Least Connections, Weighted, Sticky Sessions)
- Service discovery and health monitoring
- Prometheus metrics
- Real-time traffic management

**Key Endpoints:**
- `POST /api/v1/register` - Register backend service
- `GET /api/v1/routes` - View routing table
- `GET /metrics` - Prometheus metrics

---

## Blockchain Services

### RoadChain - Blockchain Infrastructure
**Port:** 4221
**Purpose:** Proof-of-stake blockchain powering the Blackroad ecosystem

**Features:**
- Smart contract deployment and execution
- P2P consensus network
- Validator staking system
- WebSocket real-time sync
- Account state management

**Key Endpoints:**
- `GET /api/v1/chain/info` - Chain information
- `POST /api/v1/transactions` - Submit transaction
- `POST /api/v1/contracts/deploy` - Deploy smart contract
- `POST /api/v1/validators/register` - Register as validator

### RoadCoin - Cryptocurrency
**Port:** 4220
**Purpose:** Native digital currency for Blackroad ecosystem

**Features:**
- HD wallet generation (BIP39)
- Blockchain mining with rewards
- Transaction processing
- Token minting
- Balance tracking

**Key Endpoints:**
- `POST /api/v1/wallets` - Create wallet
- `POST /api/v1/transactions` - Send transaction
- `POST /api/v1/mine` - Mine block
- `GET /api/v1/wallets/:address/balance` - Check balance

**Token Details:**
- Symbol: ROAD
- Total Supply: 1,000,000,000
- Block Reward: 50 ROAD
- Block Time: 15 seconds

---

## Department Automation Services

### HR & Talent Management
**Port:** 4300
**Purpose:** Automated recruiting, onboarding, and performance management

**Features:**
- Employee lifecycle management
- AI-powered candidate screening
- Performance reviews
- Training & development tracking
- Automated onboarding workflows

**Key Endpoints:**
- `POST /api/v1/employees` - Add employee
- `POST /api/v1/candidates` - Submit application
- `POST /api/v1/candidates/:id/screen` - AI screening
- `POST /api/v1/reviews` - Create performance review

### Finance & Accounting
**Port:** 4301
**Purpose:** Automated financial operations and accounting

**Features:**
- Account management
- Automated invoicing
- Expense tracking with AI categorization
- Budget management
- RoadCoin payment integration
- Financial reporting

**Key Endpoints:**
- `POST /api/v1/transactions` - Create transaction
- `POST /api/v1/invoices` - Generate invoice
- `POST /api/v1/expenses` - Submit expense
- `GET /api/v1/reports/summary` - Financial summary

### Marketing & Sales
**Port:** 4302
**Purpose:** CRM, campaign management, and sales automation

**Features:**
- Lead management with AI scoring
- Campaign creation and tracking
- Email marketing automation
- Deal/opportunity pipeline
- Analytics dashboard

**Key Endpoints:**
- `POST /api/v1/leads` - Create lead
- `POST /api/v1/campaigns` - Create campaign
- `POST /api/v1/deals` - Create deal
- `GET /api/v1/analytics` - Marketing analytics

### Operations & Supply Chain
**Port:** 4303
**Purpose:** Inventory, logistics, and procurement automation

**Features:**
- Inventory management with auto-reordering
- Order fulfillment
- Shipment tracking
- Supplier management
- Warehouse operations

**Key Endpoints:**
- `POST /api/v1/inventory` - Add inventory item
- `POST /api/v1/orders` - Create order
- `GET /api/v1/shipments/:id/track` - Track shipment
- `POST /api/v1/procurement/auto-order` - Auto-reorder

### Legal & Compliance
**Port:** 4304
**Purpose:** Contract management, policy enforcement, and compliance

**Features:**
- AI-powered contract review
- Electronic signatures
- Policy management
- Risk assessment
- Compliance checking
- Legal document generation

**Key Endpoints:**
- `POST /api/v1/contracts` - Create contract
- `POST /api/v1/contracts/:id/review` - AI contract review
- `POST /api/v1/compliance/check` - Compliance check
- `POST /api/v1/risk-assessments` - Risk assessment

### R&D Innovation Lab
**Port:** 4305
**Purpose:** Research project management and innovation pipeline

**Features:**
- Project lifecycle tracking
- Experiment management
- Patent filing and tracking
- Research publications
- Collaboration tools
- AI-powered idea generation

**Key Endpoints:**
- `POST /api/v1/projects` - Create research project
- `POST /api/v1/experiments` - Create experiment
- `POST /api/v1/patents` - File patent
- `POST /api/v1/ideas/generate` - AI idea generation

---

## Metaverse Services

### Metaverse Campus
**Port:** 4400
**Purpose:** Virtual reality offices and collaborative 3D spaces

**Features:**
- Virtual campus creation
- VR/AR meeting rooms
- Avatar management
- Real-time spatial audio
- 3D asset management
- WebSocket synchronization
- Unity world integration

**Key Endpoints:**
- `POST /api/v1/campuses` - Create campus
- `POST /api/v1/spaces` - Create virtual space
- `POST /api/v1/avatars` - Create avatar
- `POST /api/v1/meetings` - Schedule virtual meeting
- `POST /api/v1/teleport` - Teleport to space

**WebSocket Events:**
- `avatar-move` - Avatar position updates
- `voice-data` - Spatial audio streaming
- `interact` - Object interactions
- `chat` - In-world chat

### City Portal
**Port:** 4401
**Purpose:** Location-based metaverse presence in cities worldwide

**Features:**
- City-based virtual hubs
- Portal/gateway system
- User location tracking
- Nearby user discovery
- City events
- Auto-campus creation

**Pre-configured Cities:**
- San Francisco, New York, London, Tokyo, Singapore, Berlin, Dubai, Sydney, Toronto, Mumbai

**Key Endpoints:**
- `GET /api/v1/cities` - List cities
- `POST /api/v1/portals` - Create portal
- `POST /api/v1/users/location` - Update location
- `POST /api/v1/portals/:id/travel` - Travel through portal
- `GET /api/v1/discover` - Discover cities

---

## Collaborative Services

### Co-Coding Portal
**Port:** 4200
**Purpose:** Real-time collaborative code editing

**Features:**
- CRDT-based collaborative editing (Yjs)
- Real-time cursor sharing
- Integrated chat
- Code execution
- Session management
- Multi-language support

**Key Endpoints:**
- `POST /api/v1/sessions` - Create coding session
- `GET /api/v1/sessions/:id` - Get session details

**WebSocket Events:**
- `join-session` - Join coding session
- `code-change` - Code updates
- `cursor-move` - Cursor position
- `execute-code` - Run code
- `chat-message` - Session chat

### RoadView Enhanced
**Port:** 4210
**Purpose:** Advanced spatial visualization and mapping

**Features:**
- 3D terrain rendering
- Dynamic map tiles
- Geocoding (forward & reverse)
- Route calculation
- Geospatial analysis (Turf.js)
- Points of interest
- Real-time WebSocket updates

**Key Endpoints:**
- `GET /api/v1/tiles/:z/:x/:y` - Map tiles
- `GET /api/v1/geocode` - Geocode address
- `POST /api/v1/routes` - Calculate route
- `POST /api/v1/analyze` - Geospatial analysis
- `GET /api/v1/terrain` - 3D terrain data

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Redis (included in docker-compose)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/blackboxprogramming/blackroad-prism-console.git
cd blackroad-prism-console
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Verify services are running**
```bash
# Check all service health endpoints
curl http://localhost:4100/health  # Backroad
curl http://localhost:4200/health  # Co-Coding Portal
curl http://localhost:4220/health  # RoadCoin
curl http://localhost:4221/health  # RoadChain
curl http://localhost:4300/health  # HR
curl http://localhost:4301/health  # Finance
curl http://localhost:4302/health  # Marketing
curl http://localhost:4303/health  # Operations
curl http://localhost:4304/health  # Legal
curl http://localhost:4305/health  # R&D
curl http://localhost:4400/health  # Metaverse
curl http://localhost:4401/health  # City Portal
curl http://localhost:4210/health  # RoadView
```

4. **Access services through Backroad**
```bash
# All services are accessible through the load balancer
curl http://localhost:4100/api/roadcoin/info
curl http://localhost:4100/api/roadchain/chain/info
```

### Development

Run individual services:
```bash
cd services/[service-name]
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:
```bash
# LLM Gateway
LLM_GATEWAY_URL=http://llm-gateway:4002

# Redis
REDIS_URL=redis://localhost:6379

# RoadCoin
AUTO_MINE=true
MINER_ADDRESS=0x...
ADMIN_KEY=your-secret-key

# Service Ports (default values)
BACKROAD_PORT=4100
COCODING_PORT=4200
ROADVIEW_PORT=4210
ROADCOIN_PORT=4220
ROADCHAIN_PORT=4221
HR_PORT=4300
FINANCE_PORT=4301
MARKETING_PORT=4302
OPERATIONS_PORT=4303
LEGAL_PORT=4304
RD_PORT=4305
METAVERSE_PORT=4400
CITY_PORTAL_PORT=4401
```

---

## Service Architecture

### Integration Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Backroad (4100)                       │
│             Load Balancer & API Gateway                  │
└────────────┬────────────────────────────────┬────────────┘
             │                                │
   ┌─────────▼────────┐            ┌─────────▼───────────┐
   │  Blockchain      │            │  Department         │
   │  Services        │            │  Automation         │
   ├──────────────────┤            ├─────────────────────┤
   │ RoadChain (4221) │            │ HR (4300)           │
   │ RoadCoin  (4220) │            │ Finance (4301)      │
   └──────────────────┘            │ Marketing (4302)    │
                                   │ Operations (4303)   │
   ┌──────────────────┐            │ Legal (4304)        │
   │  Metaverse       │            │ R&D (4305)          │
   │  Services        │            └─────────────────────┘
   ├──────────────────┤
   │ Campus (4400)    │            ┌─────────────────────┐
   │ City (4401)      │            │  Collaborative      │
   └──────────────────┘            │  Services           │
                                   ├─────────────────────┤
   ┌──────────────────┐            │ Co-Coding (4200)    │
   │  Visualization   │            │ RoadView (4210)     │
   │  Services        │            └─────────────────────┘
   ├──────────────────┤
   │ RoadView (4210)  │
   └──────────────────┘
```

### Data Flow

1. **Request enters through Backroad** (port 4100)
2. **Backroad routes to appropriate service** based on path
3. **Service processes request**, potentially calling:
   - LLM Gateway for AI features
   - Redis for caching/sessions
   - RoadCoin/RoadChain for payments
   - Other services for integrations
4. **Response returns through Backroad** to client

### Service Dependencies

**Critical (Tier 1):**
- Backroad
- RoadChain
- RoadCoin
- Finance

**Important (Tier 2):**
- All other services

### Service Configuration

All services are configured via YAML in `configs/services/`:
- Service ID and name
- Tier (criticality)
- SLI targets (uptime, latency)
- Dependencies

---

## Port Allocation

| Port Range | Purpose |
|------------|---------|
| 4100-4199  | Infrastructure (Backroad) |
| 4200-4299  | Collaborative Services |
| 4300-4399  | Department Automation |
| 4400-4499  | Metaverse Services |
| 4220-4229  | Blockchain Services |

---

## Monitoring & Observability

All services expose:
- `/health` - Health check endpoint
- `/metrics` - Prometheus metrics (where applicable)

Integrated with:
- **Prometheus** - Metrics collection
- **Grafana** - Dashboards
- **AlertManager** - Alert routing

---

## Security Considerations

- All services support JWT authentication via Auth Service
- RoadCoin/RoadChain use cryptographic signatures
- Legal/Compliance integrates with Policy Engine
- All inter-service communication should use TLS in production
- Secrets managed via environment variables

---

## Roadmap

### Phase 1: Core Infrastructure ✅
- Backroad load balancer
- RoadChain/RoadCoin blockchain
- Basic department services

### Phase 2: Enhanced Automation (In Progress)
- AI-powered workflows across all departments
- Advanced analytics
- Cross-service orchestration

### Phase 3: Metaverse Expansion
- Multi-city deployment
- VR/AR integration
- Spatial computing features

### Phase 4: Ecosystem Growth
- Third-party service integration
- Developer platform
- Public API gateway

---

## Support & Documentation

- **API Docs:** Each service includes a README.md
- **Issues:** https://github.com/blackboxprogramming/blackroad-prism-console/issues
- **Contributing:** See CONTRIBUTING.md

---

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ by the Blackroad Team**
