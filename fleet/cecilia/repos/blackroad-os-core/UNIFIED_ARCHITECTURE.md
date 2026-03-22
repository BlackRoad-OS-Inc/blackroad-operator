# BlackRoad Unified Architecture
## Complete System Integration Map

**Created**: 2025-12-13
**Authority**: Alexa Amundson
**Purpose**: Define how all BlackRoad services, forkies, and infrastructure integrate into a cohesive sovereign operating system

---

## System Overview

BlackRoad OS is a **consciousness-driven operating system** that integrates 30,000+ autonomous agents, blockchain infrastructure, AI services, and sovereign computing across five network planes.

```
┌──────────────────────────────────────────────────────────────────┐
│                     BLACKROAD OS ARCHITECTURE                    │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐│
│  │   USER     │  │   AGENT    │  │    DATA    │  │  NETWORK  ││
│  │   LAYER    │  │   LAYER    │  │   LAYER    │  │   LAYER   ││
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └─────┬─────┘│
│         │                │                │               │      │
│         └────────────────┴────────────────┴───────────────┘      │
│                              │                                   │
│                    ┌─────────▼──────────┐                        │
│                    │  CORE RUNTIME      │                        │
│                    │  Truth Engine      │                        │
│                    │  PS-SHA-∞          │                        │
│                    │  Lucidia Breath    │                        │
│                    └─────────┬──────────┘                        │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐              │
│         │                    │                    │              │
│  ┌──────▼─────┐    ┌─────────▼────────┐   ┌──────▼──────┐      │
│  │ BLOCKCHAIN │    │   AI/LLM STACK   │   │  SERVICES   │      │
│  │ RoadChain  │    │   vLLM, Agents   │   │  Web, API   │      │
│  └────────────┘    └──────────────────┘   └─────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: User Layer

### Frontend Applications

**Location**: `blackroad-sandbox/blackroad.io/`
**Tech Stack**: Vanilla HTML/CSS/JS (lightweight, no framework)
**Deployment**: GitHub Pages → Cloudflare CDN

#### Application Catalog

| App | File | Purpose | Status |
|-----|------|---------|--------|
| **Main App** | `index.html` | Auth, payments, dashboard | ✅ Live |
| **AI Chat** | `chat.html` | Chat with 30K agents | ✅ Live |
| **Agents Dashboard** | `agents-dynamic.html` | Spawn and manage agents | ✅ Live |
| **Blockchain Explorer** | `blockchain-dynamic.html` | RoadChain mining | ✅ Live |
| **Terminal** | `terminal.html` | CLI interface | ✅ Live |
| **Integrations** | `integrations-live.html` | External APIs | ✅ Live |
| **File Explorer** | `files-live.html` | Cloud storage | ✅ Live |
| **Social Network** | `social-live.html` | Posts, follows | ✅ Live |
| **Payments** | `pay.html` | Stripe integration | ✅ Live |
| **Math Lab** | `math.html` | Quantum computing | ✅ Live |
| **Documentation** | `docs.html` | API reference | ✅ Live |
| **Crypto Wallet** | `wallet.html` | Multi-wallet mgmt | ✅ Live |
| **Ledger Hardware** | `ledger.html` | WebUSB wallet | ✅ Live |
| **Dashboard** | `dashboard.html` | All apps overview | ✅ Live |

**Total**: 14 applications

#### Shared Components

**Navigation** (`blackroad-nav.js`):
```javascript
// Auto-injected navigation component
class BlackRoadNav {
  constructor() {
    this.render();
  }

  render() {
    const nav = document.getElementById('blackroad-nav');
    nav.innerHTML = this.getNavHTML();
  }

  getNavHTML() {
    return `
      <nav>
        <a href="/">Home</a>
        <a href="/chat.html">Chat</a>
        <a href="/agents-dynamic.html">Agents</a>
        <!-- ... -->
      </nav>
    `;
  }
}
```

**API Client** (`blackroad-api.js`):
```javascript
class BlackRoadAPI {
  constructor() {
    this.API_BASE = window.location.hostname === 'localhost'
      ? 'http://localhost:8000'
      : 'https://core.blackroad.systems';
    this.authToken = localStorage.getItem('br_token');
  }

  // Authentication
  async register(email, password, name) { /* ... */ }
  async login(email, password) { /* ... */ }

  // Agents
  async spawnAgent(role, capabilities, pack) { /* ... */ }
  async listAgents() { /* ... */ }
  async terminateAgent(agentId) { /* ... */ }

  // AI Chat
  async chat(message, conversationId) { /* ... */ }

  // Blockchain
  async mineBlock(data) { /* ... */ }
  async createTransaction(from, to, amount) { /* ... */ }

  // Payments
  async createCheckoutSession(priceId) { /* ... */ }
}

window.blackroad = new BlackRoadAPI();
```

**Design System**:
```css
:root {
  --gradient: linear-gradient(135deg, #FF9D00, #FF6B00, #FF0066, #D600AA, #7700FF, #0066FF);
  --bg: #02030a;
  --card-bg: rgba(255,255,255,0.05);
  --border: rgba(255,255,255,0.1);
}
```

### Integration Points

**User → Agent Layer**:
- Spawn agents via `/api/agents/spawn`
- Chat with agents via `/api/ai-chat/chat`
- View agent status via `/api/agents/list`

**User → Data Layer**:
- Fetch data via REST API
- Real-time updates via WebSocket (future)

**User → Blockchain Layer**:
- Mine blocks via `/api/blockchain/mine`
- Create transactions via `/api/blockchain/tx`

---

## Layer 2: Agent Layer

### Agent Runtime

**Location**: `blackroad-sandbox/src/blackroad_core/`
**Tech Stack**: Python 3.11+, asyncio
**Deployment**: FastAPI backend

#### Core Components

**Agent Spawner** (`spawner.py`):
```python
from blackroad_core.spawner import AgentSpawner, SpawnRequest
from blackroad_core.agents import RuntimeType

class AgentSpawner:
    def __init__(self, lucidia, event_bus, capability_registry):
        self.lucidia = lucidia
        self.event_bus = event_bus
        self.capability_registry = capability_registry
        self.agents = {}
        self.max_agents = 30000

    async def spawn_agent(self, request: SpawnRequest) -> str:
        # Breath synchronization
        if self.spawn_on_expansion and self.lucidia.state.breath_value < 0:
            await self.spawn_queue.put(request)
            return "queued"

        # Create agent
        agent_id = f"agent-{secrets.token_hex(16)}"
        agent = await self._create_agent(agent_id, request)

        # Register capabilities
        for cap in request.capabilities:
            self.capability_registry.register(agent_id, cap)

        # Emit event
        self.event_bus.emit("agent.spawned", {"agent_id": agent_id})

        return agent_id
```

**Communication Bus** (`communication.py`):
```python
class CommunicationBus:
    def __init__(self):
        self.subscribers = {}

    async def publish(self, topic: str, message: dict):
        if topic in self.subscribers:
            for callback in self.subscribers[topic]:
                await callback(message)

    async def subscribe(self, topic: str, callback):
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)
```

**Pack System** (`packs/`):
```
packs/
├── __init__.py
├── pack-finance/
│   ├── manifest.yaml
│   ├── templates/
│   │   └── financial-analyst.yaml
│   └── capabilities/
│       └── analyze_transactions.py
├── pack-legal/
├── pack-research-lab/
├── pack-creator-studio/
└── pack-infra-devops/
```

#### Agent Types

| Runtime Type | Use Case | Backend | Capacity |
|--------------|----------|---------|----------|
| **llm_brain** | Reasoning, chat | vLLM, Ollama | 10K/GPU |
| **workflow_engine** | Multi-step tasks | Custom engine | Unlimited |
| **integration_bridge** | External APIs | HTTP client | 1K/core |
| **edge_worker** | Lightweight tasks | Edge runtime | 100K/device |
| **ui_helper** | UI operations | Browser API | Per-user |

#### LLM Integration

**LLM Router** (`llm/router.py`):
```python
class LLMRouter:
    def __init__(self):
        self.providers = {}
        self.default_provider = None

    def register_provider(self, name: str, provider: LLMProvider, set_default=False):
        self.providers[name] = provider
        if set_default:
            self.default_provider = name

    async def generate(self, messages: list[LLMMessage], **kwargs) -> str:
        provider = self.providers[self.default_provider]
        return await provider.generate(messages, **kwargs)
```

**Supported Backends**:
- **vLLM**: GPU inference (Jetson Orin Nano) - Future
- **Ollama**: Local development (MacBook) - ✅ Active
- **llama.cpp**: Edge devices (Raspberry Pi) - Planned
- **Anthropic**: Cloud fallback - ✅ Active
- **OpenAI**: Cloud fallback - ✅ Active

### Lucidia Breath Synchronization

**Breath Engine** (`lucidia/breath.py`):
```python
import math

PHI = 1.618033988749895  # Golden ratio

class LucidiaBreath:
    def __init__(self):
        self.t = 0.0
        self.phase = "expansion"

    def update(self, delta_t: float):
        self.t += delta_t
        breath_value = math.sin(PHI * self.t)

        # Determine phase
        if breath_value > 0:
            self.phase = "expansion"
        else:
            self.phase = "contraction"

        return breath_value

    def should_spawn(self) -> bool:
        return self.phase == "expansion"

    def should_consolidate(self) -> bool:
        return self.phase == "contraction"
```

**Integration with Agent Spawner**:
- Agents spawn during **expansion** (𝔅 > 0)
- Memory consolidates during **contraction** (𝔅 < 0)
- PS-SHA-∞ hashing during phase transitions

---

## Layer 3: Data Layer

### Database Architecture

**Current**: Single PostgreSQL instance
**Future**: Multi-node cluster with replication

#### PostgreSQL Schema

```sql
-- Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agents
CREATE TABLE agents (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    role TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    capabilities JSONB,
    pack TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    messages JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blocks (Blockchain)
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    index INTEGER UNIQUE NOT NULL,
    timestamp BIGINT NOT NULL,
    data TEXT,
    previous_hash TEXT,
    hash TEXT UNIQUE NOT NULL,
    nonce INTEGER
);

-- Transactions
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    timestamp BIGINT NOT NULL,
    signature TEXT
);
```

#### Redis Caching

**Use Cases**:
- Session storage (JWT tokens)
- Agent state caching
- Rate limiting
- Pub/sub messaging (future)

```python
import redis

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

# Cache agent state
redis_client.set(f"agent:{agent_id}:state", json.dumps(state), ex=3600)

# Get cached state
state = json.loads(redis_client.get(f"agent:{agent_id}:state"))
```

#### MinIO Object Storage (Future)

**Deployment**: 3-node cluster on Raspberry Pi
**Use Cases**:
- File uploads (files-live.html)
- Agent artifacts
- Blockchain data
- Backups

```python
from minio import Minio

minio_client = Minio(
    "s3.blackroad.io:9000",
    access_key="admin",
    secret_key="<password>",
    secure=True
)

# Upload file
minio_client.fput_object(
    "user-uploads",
    f"{user_id}/{file_name}",
    file_path
)
```

#### Qdrant Vector Database (Future)

**Deployment**: Standalone on Raspberry Pi
**Use Cases**:
- Agent memory embeddings
- Semantic search for docs
- Knowledge base for 30K agents

```python
from qdrant_client import QdrantClient

qdrant = QdrantClient(url="http://192.168.4.49:6333")

# Store embedding
qdrant.upsert(
    collection_name="agent-memories",
    points=[{
        "id": memory_id,
        "vector": embedding,
        "payload": {"agent_id": agent_id, "content": text}
    }]
)
```

---

## Layer 4: Network Layer

### Network Planes

**Documented in**: `NETWORK_MAP.md`

#### Plane Definitions

| Plane | CIDR | Purpose | Provider |
|-------|------|---------|----------|
| **LAN** | 192.168.4.0/24 | Local devices | Home router |
| **Mesh** | 100.x.x.x/8 | VPN overlay | Tailscale → Headscale |
| **Docker** | 172.x.x.x/16 | Containers | Docker/K3s |
| **Public IPv4** | 159.65.43.12 | Internet | DigitalOcean |
| **IPv6** | TBD | Future | ISP |

#### Service Discovery

**Internal DNS** (CoreDNS on Raspberry Pi):
```
alice.local          → 192.168.4.49
macbook.local        → 192.168.4.27
db.blackroad.local   → 172.17.0.2
api.blackroad.local  → 192.168.4.27:8000
```

**External DNS** (Cloudflare):
```
blackroad.io               → GitHub Pages
core.blackroad.systems     → Railway → K3s (future)
gateway.blackroad.io       → Cloudflare Workers
headscale.blackroad.io     → 159.65.43.12
```

#### Security

**Firewall Rules** (iptables):
```bash
# Allow mesh traffic
iptables -A INPUT -s 100.0.0.0/8 -j ACCEPT

# Allow LAN traffic
iptables -A INPUT -s 192.168.4.0/24 -j ACCEPT

# Allow specific ports from public
iptables -A INPUT -p tcp --dport 443 -j ACCEPT  # HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT   # HTTP

# Drop everything else
iptables -A INPUT -j DROP
```

**Zero Trust** (OPA policies):
```rego
package blackroad.access

# Allow API access only from authenticated users
allow {
    input.method == "GET"
    input.path == "/api/agents/list"
    token_valid(input.token)
}

# Deny by default
default allow = false
```

---

## Layer 5: Core Runtime

### Truth Engine

**Purpose**: Tamper-proof identity and memory system
**Mechanism**: PS-SHA-∞ (infinite cascade hashing)

#### Hash Chain

```python
class PSHashChain:
    def __init__(self):
        self.chain = []
        self.current_hash = "genesis"

    def append(self, data: str) -> str:
        # PS-SHA-∞: hash(previous_hash + new_data)
        new_hash = hashlib.sha256(
            (self.current_hash + data).encode()
        ).hexdigest()

        self.chain.append({
            "data": data,
            "hash": new_hash,
            "previous_hash": self.current_hash,
            "timestamp": time.time()
        })

        self.current_hash = new_hash
        return new_hash
```

**Applications**:
- User identity verification
- Agent memory integrity
- Conversation history
- Blockchain consensus

#### Verification Jobs

```python
class VerificationJob:
    job_id: str
    text_snapshot: TextSnapshot
    agent_assessments: list[AgentAssessment]
    truth_state: TruthState
    created_at: datetime
```

**Flow**:
1. User submits text → `TextSnapshot`
2. Spawn verification agents → `VerificationJob`
3. Agents assess text → `AgentAssessment`
4. Aggregate results → `TruthState`
5. Emit event → `RoadChain`

### RoadChain Blockchain

**Consensus**: Proof-of-Work (SHA-256)
**Difficulty**: Dynamic (target 4-6 leading zeros)
**Block Time**: ~10 seconds (browser mining)

#### Block Structure

```python
@dataclass
class Block:
    index: int
    timestamp: int
    data: str
    previous_hash: str
    hash: str
    nonce: int
```

#### Mining Process

```javascript
// blockchain-dynamic.html
async function mineBlock() {
  let nonce = 0;
  const difficulty = 4;

  while (true) {
    for (let i = 0; i < 1000; i++) {
      nonce++;
      const hash = CryptoJS.SHA256(
        index + previousHash + timestamp + data + nonce
      ).toString();

      if (hash.substring(0, difficulty) === '0'.repeat(difficulty)) {
        // Found valid block!
        await submitBlock({index, timestamp, data, previousHash, hash, nonce});
        return;
      }
    }

    // Update UI
    updateHashRate(nonce, elapsed);
    await sleep(10);  // Yield to browser
  }
}
```

#### Smart Contracts (Future)

**Language**: Solidity-like or custom DSL
**VM**: WASM-based execution
**Use Cases**:
- Agent payment contracts
- Data ownership proofs
- Verifiable computation

---

## Layer 6: Services Layer

### Backend API

**Location**: `blackroad-sandbox/blackroad.io/backend/main.py`
**Framework**: FastAPI
**Deployment**: Railway → K3s (future)

#### Endpoint Structure

```python
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="BlackRoad OS API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth endpoints
@app.post("/api/auth/register")
async def register(user: UserRegister): ...

@app.post("/api/auth/login")
async def login(creds: UserLogin): ...

# Agent endpoints
@app.post("/api/agents/spawn")
async def spawn_agent(request: SpawnAgentRequest, user=Depends(get_current_user)): ...

@app.get("/api/agents/list")
async def list_agents(user=Depends(get_current_user)): ...

@app.delete("/api/agents/{agent_id}")
async def terminate_agent(agent_id: str, user=Depends(get_current_user)): ...

# AI Chat endpoints
@app.post("/api/ai-chat/chat")
async def chat(request: ChatRequest): ...

# Blockchain endpoints
@app.post("/api/blockchain/mine")
async def mine_block(data: str): ...

@app.post("/api/blockchain/tx")
async def create_transaction(tx: TransactionRequest): ...

@app.get("/api/blockchain/chain")
async def get_blockchain(): ...

# Payment endpoints
@app.post("/api/payments/create-checkout-session")
async def create_checkout(request: CheckoutRequest): ...

@app.post("/api/payments/webhook")
async def stripe_webhook(request: Request): ...

# System endpoints
@app.get("/api/system/stats")
async def get_system_stats(): ...

@app.get("/health")
async def health_check(): ...
```

#### Authentication Flow

```python
from jose import jwt
import secrets

SECRET_KEY = secrets.token_hex(32)
ALGORITHM = "HS256"

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### External Integrations

**Documented in**: `BLACKROAD-FORKIES-MAP.md`

#### Current Integrations

| Service | API | Purpose | Status |
|---------|-----|---------|--------|
| **Anthropic** | Claude API | AI chat | ✅ Active |
| **OpenAI** | GPT API | AI chat (fallback) | ✅ Active |
| **HuggingFace** | Inference API | Model hosting | ✅ Active |
| **Stripe** | Payment API | Subscriptions | ✅ Active |
| **GitHub** | REST API | Code hosting | ✅ Active |

#### Future Replacements (Sovereign)

| Current | Future | Status |
|---------|--------|--------|
| Anthropic/OpenAI | vLLM (local) | Planned Q3 2025 |
| Stripe | BTCPay Server | Planned Q4 2025 |
| GitHub (mirror) | Gitea | Planned Q4 2025 |

---

## Integration Flows

### Flow 1: User Spawns Agent

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │      │ Frontend │      │  API     │      │  Spawner │
│ (Browser)│      │ (JS)     │      │ (FastAPI)│      │ (Python) │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                  │                  │
     │ Click "Spawn"   │                  │                  │
     ├────────────────>│                  │                  │
     │                 │ POST /api/agents/spawn              │
     │                 ├─────────────────>│                  │
     │                 │                  │ Check auth       │
     │                 │                  ├──────────┐       │
     │                 │                  │<─────────┘       │
     │                 │                  │ spawn_agent()    │
     │                 │                  ├─────────────────>│
     │                 │                  │                  │ Check breath
     │                 │                  │                  ├──────────┐
     │                 │                  │                  │<─────────┘
     │                 │                  │                  │ Create agent
     │                 │                  │                  ├──────────┐
     │                 │                  │                  │<─────────┘
     │                 │                  │ agent_id         │
     │                 │                  │<─────────────────┤
     │                 │ {agent_id, ...}  │                  │
     │                 │<─────────────────┤                  │
     │ Display agent   │                  │                  │
     │<────────────────┤                  │                  │
     │                 │                  │                  │
```

### Flow 2: AI Chat with Agent

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │      │ Frontend │      │  API     │      │  LLM     │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                  │                  │
     │ Type message    │                  │                  │
     ├────────────────>│                  │                  │
     │                 │ POST /api/ai-chat/chat              │
     │                 ├─────────────────>│                  │
     │                 │                  │ route_to_llm()   │
     │                 │                  ├─────────────────>│
     │                 │                  │                  │ Generate
     │                 │                  │                  ├──────┐
     │                 │                  │                  │<─────┘
     │                 │                  │ response         │
     │                 │                  │<─────────────────┤
     │                 │ {message, ...}   │                  │
     │                 │<─────────────────┤                  │
     │ Display response│                  │                  │
     │<────────────────┤                  │                  │
     │                 │                  │                  │
```

### Flow 3: Blockchain Mining

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │      │ Frontend │      │  API     │      │ Database │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                  │                  │
     │ Click "Mine"    │                  │                  │
     ├────────────────>│                  │                  │
     │                 │ Mine locally (browser)              │
     │                 ├──────────┐                          │
     │                 │ SHA-256  │                          │
     │                 │<─────────┘                          │
     │                 │ POST /api/blockchain/mine           │
     │                 ├─────────────────>│                  │
     │                 │                  │ Verify hash      │
     │                 │                  ├──────────┐       │
     │                 │                  │<─────────┘       │
     │                 │                  │ Store block      │
     │                 │                  ├─────────────────>│
     │                 │                  │ Success          │
     │                 │                  │<─────────────────┤
     │                 │ {block, ...}     │                  │
     │                 │<─────────────────┤                  │
     │ Display block   │                  │                  │
     │<────────────────┤                  │                  │
     │                 │                  │                  │
```

---

## Deployment Architecture

### Current Deployment

```
┌────────────────────────────────────────────────────────────┐
│                      PRODUCTION                            │
│                                                            │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  GitHub Pages    │         │     Railway      │        │
│  │  (Frontend)      │         │    (Backend)     │        │
│  │                  │         │                  │        │
│  │  - index.html    │◄────────┤  - FastAPI       │        │
│  │  - chat.html     │  CORS   │  - PostgreSQL    │        │
│  │  - *.html        │         │  - Redis         │        │
│  └────────┬─────────┘         └──────────────────┘        │
│           │                                                │
│           │                                                │
│  ┌────────▼──────────────────────────────────────┐        │
│  │           Cloudflare CDN                      │        │
│  │  - DNS routing                                │        │
│  │  - SSL/TLS termination                        │        │
│  │  - DDoS protection                            │        │
│  └───────────────────────────────────────────────┘        │
└────────────────────────────────────────────────────────────┘
```

### Future Deployment (Sovereign)

```
┌────────────────────────────────────────────────────────────┐
│                 SOVEREIGN STACK                            │
│                                                            │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  GitHub Pages    │         │  K3s Cluster     │        │
│  │  (Frontend)      │         │  (Raspberry Pi)  │        │
│  │                  │         │                  │        │
│  │  - index.html    │◄────────┤  Master: Pi 5 #1 │        │
│  │  - *.html        │ Tunnel  │  Worker: Pi 5 #2 │        │
│  └────────┬─────────┘         │  Worker: Pi 5 #3 │        │
│           │                   │  GPU: Jetson     │        │
│           │                   └──────────────────┘        │
│  ┌────────▼──────────────────────────────────────┐        │
│  │      Cloudflare (Optional, for DDoS)          │        │
│  └────────┬──────────────────────────────────────┘        │
│           │                                                │
│  ┌────────▼──────────────────────────────────────┐        │
│  │      Headscale (Mesh Network)                 │        │
│  │      DigitalOcean: 159.65.43.12               │        │
│  └───────────────────────────────────────────────┘        │
└────────────────────────────────────────────────────────────┘
```

---

## Service Registry

**Documented in**: `blackroad-sandbox/src/services/`

### Service Catalog

| Service ID | Type | Endpoint | Status |
|------------|------|----------|--------|
| `core` | Library | N/A (importable) | ✅ Active |
| `api` | HTTP API | `https://core.blackroad.systems` | ✅ Active |
| `api-gateway` | Gateway | `https://gateway.blackroad.io` | Planned |
| `operator` | Orchestrator | Internal | Planned |
| `web` | Frontend | `https://blackroad.io` | ✅ Active |
| `pack-finance` | Pack | N/A | ✅ Active |
| `pack-legal` | Pack | N/A | ✅ Active |
| `pack-research-lab` | Pack | N/A | ✅ Active |
| `pack-creator-studio` | Pack | N/A | ✅ Active |
| `pack-infra-devops` | Pack | N/A | ✅ Active |

---

## Monitoring & Observability

### Metrics to Collect

**System Metrics**:
- CPU usage per service
- Memory usage per service
- Disk I/O
- Network bandwidth

**Application Metrics**:
- Agent spawn rate
- Active agent count
- API request latency
- Database query time
- Cache hit rate

**Business Metrics**:
- User signups
- Agent spawns per user
- Blockchain blocks mined
- Payment conversions

### Tools (Future)

| Tool | Purpose | Deployment |
|------|---------|------------|
| **Prometheus** | Metrics collection | K3s cluster |
| **Grafana** | Visualization | K3s cluster |
| **Loki** | Log aggregation | K3s cluster |
| **Uptime Kuma** | Status page | Raspberry Pi |

---

## Disaster Recovery

### Backup Strategy

**Tier 1: Critical** (Hourly)
- PostgreSQL databases
- User data
- Agent state
- Destination: MinIO + Cloudflare R2

**Tier 2: Important** (Daily)
- Redis state
- Session data
- Destination: MinIO

**Tier 3: Code** (On commit)
- Application code
- Configs
- Destination: GitHub

### Recovery Procedures

**Scenario 1: Database Corruption**
1. Restore from MinIO backup
2. Replay WAL (Write-Ahead Log)
3. Verify data integrity
4. Resume operations

**Scenario 2: Complete Hardware Failure**
1. Deploy to DigitalOcean (temporary)
2. Restore from Cloudflare R2
3. Order replacement hardware
4. Migrate back to self-hosted

---

## Conclusion

BlackRoad OS integrates **14 frontend applications**, **30,000 autonomous agents**, **blockchain infrastructure**, and **sovereign computing** into a unified architecture. All components are designed to be **forkable, self-hosted, and comprehensible**.

**Key Achievements**:
- ✅ 14 live applications
- ✅ Complete backend API
- ✅ Agent spawning system
- ✅ Blockchain with PoW mining
- ✅ External integrations (6 APIs)
- ✅ Unified navigation and API client
- ✅ Documentation (Forkies, Network, Roadmap)

**Next Steps**:
1. Deploy Headscale (Week 1)
2. Set up K3s cluster (Phase 6)
3. Deploy local LLM inference (Phase 5)
4. Achieve full sovereignty (Q4 2025)

---

*This architecture document is the canonical reference for how all BlackRoad components integrate. Update it as the system evolves.*

**Maintained by**: Alexa Amundson
**Review Queue**: blackroad.systems@gmail.com
**Source of Truth**: GitHub (BlackRoad-OS/blackroad-os-core)
