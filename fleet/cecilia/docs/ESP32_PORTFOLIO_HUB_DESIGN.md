# ESP32 Portfolio Hub - Master Design Document

**Version:** 1.0
**Device:** ESP32-2432S028R (CEO Hub)
**Vision:** Transform the ESP32 CEO Hub into a literal portfolio showcase of all 199+ BlackRoad products

---

## 🎯 Concept: The World's First Hardware Portfolio

Instead of a traditional website portfolio, this ESP32 device IS the portfolio:
- Touch-interactive product showcase
- Live metrics from production systems
- Real-time API health monitoring
- Category-based navigation
- Investor demo mode

> *"This device runs our entire stack. Pick any product - I'll show you live data."*

---

## 📱 Screen Architecture

### Navigation Model
- **Swipe Left/Right:** Category navigation (8 categories)
- **Tap App:** Open product detail screen
- **Long Press:** Show product live status
- **Double Tap:** Demo mode (scripted walkthrough)

### Category Screens (8 total)

| Page | Category | Apps | Description |
|------|----------|------|-------------|
| 1 | **CORE** | 12 | Platform essentials: Auth, DB, API, CDN, Storage |
| 2 | **AI/ML** | 12 | AI products: vLLM, LocalAI, Embeddings, LangChain |
| 3 | **INFRA** | 12 | Infrastructure: Headscale, Keycloak, Prometheus |
| 4 | **DEVOPS** | 12 | CI/CD: ArgoCD, Flux, Jenkins, Harbor, GitLab |
| 5 | **COMM** | 12 | Communication: Chat, Meet, Mattermost, Matrix |
| 6 | **BIZ** | 12 | Business: CRM, Project Management, Analytics |
| 7 | **WEB3** | 12 | Blockchain: Crypto Exchange, NFT, DAO, Identity |
| 8 | **IOT** | 12 | Edge: IoT Cluster, Pi Network, Sensors |

**Total:** 96 primary apps (8 pages × 12 apps)

---

## 🎨 App Grid Layout

```
┌──────────────────────────────────────────┐
│ 🖤 CORE PLATFORM                    ●●○○ │  Status bar + page dots
├──────────────────────────────────────────┤
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐         │
│  │AUTH│  │ DB │  │API │  │CDN │   Row 1 │
│  └────┘  └────┘  └────┘  └────┘         │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐         │
│  │STOR│  │LOG │  │MAIL│  │PAY │   Row 2 │
│  └────┘  └────┘  └────┘  └────┘         │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐         │
│  │FORM│  │SRCH│  │QUEU│  │DOCS│   Row 3 │
│  └────┘  └────┘  └────┘  └────┘         │
├──────────────────────────────────────────┤
│ [⬅️]              [🏠]            [➡️]    │  Nav bar
└──────────────────────────────────────────┘
```

---

## 📊 App Detail Screen Template

When tapping any product, show:

```
┌──────────────────────────────────────────┐
│ ← ROADAUTH                          LIVE │
├──────────────────────────────────────────┤
│                                          │
│  🔐 Enterprise Authentication            │
│     OAuth 2.0 | SAML | OIDC              │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Status: ● PRODUCTION               │  │
│  │ Uptime: 99.97%                     │  │
│  │ Requests: 1.2M/day                 │  │
│  │ Latency: 23ms avg                  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  GitHub: ★ 142  Forks: 28                │
│  Deploy: Cloudflare + Railway            │
│                                          │
│  [VIEW DOCS]  [OPEN APP]  [METRICS]      │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🔗 Live API Integrations

### Per-Product Metrics
Each product app fetches real data:

```cpp
struct ProductMetrics {
    char name[32];
    char status[16];        // "LIVE", "BETA", "DEV"
    int github_stars;
    int github_forks;
    int uptime_percent;     // 0-100
    int requests_today;
    int avg_latency_ms;
    bool is_deployed;
    char deploy_target[32]; // "cloudflare", "railway", etc.
};
```

### API Endpoints
```
GET /api/v1/products              → All products
GET /api/v1/products/{id}/status  → Live status
GET /api/v1/products/{id}/metrics → Detailed metrics
GET /api/v1/portfolio/summary     → Portfolio overview
```

---

## 🏠 Portfolio Home Screen

Special "HOME" screen showing aggregate stats:

```
┌──────────────────────────────────────────┐
│ 🖤 BLACKROAD PORTFOLIO              HOME │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────┐  ┌──────────────┐     │
│  │   199+       │  │   15         │     │
│  │  PRODUCTS    │  │  ORGS        │     │
│  └──────────────┘  └──────────────┘     │
│                                          │
│  ┌──────────────┐  ┌──────────────┐     │
│  │   67         │  │   42         │     │
│  │  LIVE        │  │  SOVEREIGN   │     │
│  └──────────────┘  └──────────────┘     │
│                                          │
│  Infrastructure Sovereignty: 67%         │
│  ████████████████████░░░░░░░░           │
│                                          │
│  [CORE] [AI] [INFRA] [DEVOPS] [MORE]    │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🎬 Demo Mode

For investor presentations, enable "Demo Mode":

1. **Auto-rotate** through all 8 categories
2. **Highlight** key products with metrics
3. **Show** real-time API calls happening
4. **Display** infrastructure diagram
5. **End** with sovereignty score

Trigger: Triple-tap home button or serial command `DEMO`

---

## 📦 Product Mapping

### Page 1: CORE PLATFORM
| Icon | Name | Product | Status |
|------|------|---------|--------|
| AUTH | roadauth | Enterprise auth | LIVE |
| DB | roaddb | Distributed database | LIVE |
| API | roadapi | API gateway | LIVE |
| CDN | roadcdn | Content delivery | LIVE |
| STOR | roadstorage | Object storage | LIVE |
| LOG | roadlog | Log aggregation | LIVE |
| MAIL | roadmail | Email platform | BETA |
| PAY | roadpay | Payment processing | DEV |
| FORM | roadforms | Form builder | LIVE |
| SRCH | roadsearch | Search engine | BETA |
| QUEU | roadqueue | Message queue | LIVE |
| DOCS | roaddocs | Documentation | LIVE |

### Page 2: AI/ML
| Icon | Name | Product | Status |
|------|------|---------|--------|
| VLLM | vllm | LLM serving | LIVE |
| LOCAL | localai | Local inference | LIVE |
| EMBED | embeddings | Vector embeddings | LIVE |
| LANG | langchain-studio | LangChain workflows | BETA |
| FINE | fine-tuner | LLM fine-tuning | BETA |
| PRMPT | prompt-studio | Prompt engineering | LIVE |
| INFER | inference-accel | Inference optimizer | DEV |
| OPTIM | model-optimizer | Model compression | BETA |
| PIPE | pipeline-orch | ML pipelines | LIVE |
| VISION | computer-vision | CV platform | BETA |
| CHAT | chatbot-builder | Chatbot creation | LIVE |
| AGENT | ai-platform | Unified AI | LIVE |

### Page 3: INFRASTRUCTURE
| Icon | Name | Product | Status |
|------|------|---------|--------|
| VPN | headscale | Mesh VPN | LIVE |
| SSO | keycloak | Identity server | LIVE |
| PROM | prometheus | Monitoring | LIVE |
| GRAF | grafana | Dashboards | LIVE |
| MINIO | minio | Object storage | LIVE |
| REDIS | redis | In-memory cache | LIVE |
| PSQL | postgresql | Database | LIVE |
| RMQB | rabbitmq | Message broker | LIVE |
| ETCD | etcd | Key-value store | LIVE |
| CONS | consul | Service mesh | BETA |
| TRAEF | traefik | Edge router | LIVE |
| BLACKROAD OS | blackroad os | Web server | LIVE |

### Page 4: DEVOPS
| Icon | Name | Product | Status |
|------|------|---------|--------|
| ARGO | argocd | GitOps CD | LIVE |
| FLUX | flux | GitOps | LIVE |
| JENK | jenkins | CI/CD | LIVE |
| HARB | harbor | Container registry | LIVE |
| GITL | gitlab | DevOps platform | LIVE |
| ANSI | ansible | Automation | LIVE |
| BACK | backstage | Developer portal | BETA |
| VELR | velero | Backup for K8s | LIVE |
| AIRFL | airflow | Workflow orch | LIVE |
| TEMP | temporal | Workflow engine | BETA |
| PREF | prefect | Data workflows | BETA |
| CHAOS | chaos-eng | Chaos testing | DEV |

### Page 5: COMMUNICATION
| Icon | Name | Product | Status |
|------|------|---------|--------|
| CHAT | roadchat | Real-time chat | LIVE |
| MEET | meet | Video conferencing | LIVE |
| MATT | mattermost | Team messaging | LIVE |
| SYNAP | synapse | Matrix server | BETA |
| DENDR | dendrite | Matrix homeserver | DEV |
| SLACK | slack-int | Slack integration | LIVE |
| PAGER | pager | Emergency alerts | LIVE |
| MSG | messages | Unified inbox | LIVE |
| BROAD | live-broadcast | Live streaming | BETA |
| JITSI | jitsi | Video calling | LIVE |
| NOTIF | notifications | Push system | LIVE |
| FEED | activity-feed | Activity streams | BETA |

### Page 6: BUSINESS
| Icon | Name | Product | Status |
|------|------|---------|--------|
| CRM | espocrm | CRM platform | LIVE |
| SUITE | suitecrm | Advanced CRM | BETA |
| TAIGA | taiga | Project management | LIVE |
| FOCAL | focalboard | Kanban boards | LIVE |
| ANAL | analytics | Business analytics | LIVE |
| PRICE | pricing | Dynamic pricing | BETA |
| SALES | sales | Sales automation | DEV |
| VOLUN | volunteer | Volunteer portal | DEV |
| FUND | fundraising | Fundraising | BETA |
| CHAR | charity | Charity platform | DEV |
| IMPACT | impact-tracker | Social impact | DEV |
| LEND | lending | P2P lending | DEV |

### Page 7: WEB3/BLOCKCHAIN
| Icon | Name | Product | Status |
|------|------|---------|--------|
| CEXCH | crypto-exchange | Crypto exchange | DEV |
| NFT | nft-generator | NFT minting | LIVE |
| DAO | dao-governance | DAO voting | BETA |
| DID | decentralized-id | Self-sovereign ID | BETA |
| BLOCK | blockchain-expl | Chain explorer | LIVE |
| IPFS | ipfs-gateway | IPFS gateway | LIVE |
| WEB3 | web3-auth | Wallet auth | LIVE |
| W3AN | web3-analytics | Chain analytics | BETA |
| SMART | smart-audit | Contract auditing | DEV |
| TOKEN | tokenomics | Token management | DEV |
| DEFI | defi-platform | DeFi protocols | DEV |
| BRIDG | bridge | Cross-chain bridge | DEV |

### Page 8: IOT/EDGE
| Icon | Name | Product | Status |
|------|------|---------|--------|
| IOT | iot-cluster | IoT hub (THIS!) | LIVE |
| FLEET | iot-devices | Device fleet | LIVE |
| PI | pi-ecosystem | Pi network | LIVE |
| SENSOR | nano-sensor | Sensor platform | DEV |
| CORAL | coral-reef | Reef monitoring | DEV |
| OCEAN | ocean-data | Ocean sensors | DEV |
| SOLAR | solar-optimizer | Solar energy | DEV |
| DRONE | underwater-drone | Underwater drones | DEV |
| LIGHT | smart-lighting | Smart lights | BETA |
| WASTE | waste-management | Smart waste | DEV |
| PARK | parking-system | Smart parking | DEV |
| URBAN | urban-analytics | City analytics | DEV |

---

## 🚀 Implementation Plan

### Phase 1: Core Refactor (Week 1)
- [ ] Extend `Screen` enum to 100+ screens
- [ ] Create `ProductScreen` base class
- [ ] Implement category navigation (8 pages)
- [ ] Add portfolio home screen

### Phase 2: API Integration (Week 2)
- [ ] Create `/api/v1/products` endpoint on Railway
- [ ] Add GitHub API aggregation (all 15 orgs)
- [ ] Implement per-product status fetching
- [ ] Add caching layer for offline mode

### Phase 3: UI Polish (Week 3)
- [ ] Product detail screen template
- [ ] Live status indicators
- [ ] Notification badges from real data
- [ ] Category icons and colors

### Phase 4: Demo Mode (Week 4)
- [ ] Auto-rotate showcase
- [ ] Scripted walkthrough
- [ ] Key metrics highlighting
- [ ] Investor presentation mode

---

## 🔧 Technical Requirements

### Memory Budget
- Current: 51,928 bytes RAM (15.8% used)
- Available: ~275KB RAM
- Each ProductMetrics struct: ~100 bytes
- 96 products × 100 bytes = 9.6KB (fits easily!)

### Flash Budget
- Current: 929,869 bytes (70.9% used)
- Available: ~380KB Flash
- Additional screens: ~100KB estimated
- Total after: ~85% used (acceptable)

### Network
- WiFi: Auto-reconnect enabled
- API calls: Staggered to avoid rate limits
- Caching: 5-minute refresh cycle
- Fallback: Static data when offline

---

## 📋 Serial Commands

```bash
# Portfolio commands
PORTFOLIO       # Show full product list
DEMO            # Start demo mode
DEMO STOP       # Stop demo mode
CATEGORY 1-8    # Jump to category
PRODUCT <name>  # Show product details
STATS           # Portfolio statistics
DEPLOY          # Deployment summary
SOVEREIGN       # Sovereignty score
```

---

## 🎯 Success Metrics

This device becomes the ultimate portfolio piece when:

1. ✅ All 199 products are accessible
2. ✅ Live metrics from production systems
3. ✅ < 2 second load time per product
4. ✅ Investor demo mode works flawlessly
5. ✅ "This runs our entire stack" is literally true

---

## 📄 Files to Create/Modify

### New Files
- `src/portfolio_hub.h` - Portfolio navigation system
- `src/product_metrics.h` - Product data structures
- `src/demo_mode.h` - Investor demo system
- `src/api_aggregator.h` - Multi-API aggregation

### Modified Files
- `src/main.cpp` - Add new screens and navigation
- `src/dynamic_nav.h` - Extend for 8 categories
- `platformio.ini` - Memory optimizations

---

**This is what sovereignty looks like.** 🖤🛣️
