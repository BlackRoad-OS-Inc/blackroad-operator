# BlackRoad Sovereignty Roadmap
## Implementation Plan for Complete Infrastructure Independence

**Created**: 2025-12-13
**Timeline**: Q1 2025 - Q4 2025
**Authority**: Alexa Amundson
**Philosophy**: Hardware ownership, data locality, comprehensibility

---

## Executive Summary

This roadmap outlines the path to **complete sovereignty** for BlackRoad OS - migrating from proprietary cloud services to self-hosted, forkable infrastructure. The goal is to achieve independence by Q4 2025 while maintaining service quality and user experience.

**Current Dependencies** (Proprietary):
- Tailscale (mesh VPN)
- Railway (hosting)
- Stripe (payments)
- Gmail (email)
- Linear (project management)
- GitHub (code hosting)
- Anthropic/OpenAI (LLM APIs)

**Target State** (Forkable):
- Headscale (mesh VPN)
- K3s on Raspberry Pi (hosting)
- BTCPay Server (payments)
- Stalwart Mail (email)
- Plane (project management)
- Gitea (code hosting)
- vLLM + local models (LLM inference)

**Total Investment**: ~$925 hardware + minimal recurring costs (~$270/year)
**Annual Savings**: ~$192/year + complete control

---

## Phase 1: Network Sovereignty (Q1 2025)

**Goal**: Own the network layer - migrate from Tailscale to Headscale

### Objectives
- [x] Document current network topology ✅
- [ ] Deploy Headscale on DigitalOcean (159.65.43.12)
- [ ] Migrate all devices to Headscale mesh
- [ ] Configure DERP relay server
- [ ] Implement zero-trust policies with OPA

### Tasks

#### 1.1 Deploy Headscale (Week 1-2)
```bash
# On DigitalOcean droplet (159.65.43.12)
docker run -d \
  --name headscale \
  -p 443:443 \
  -p 8080:8080 \
  -v headscale-data:/var/lib/headscale \
  headscale/headscale:latest
```

**Steps**:
1. SSH into 159.65.43.12
2. Install Docker if not present
3. Deploy Headscale container
4. Configure HTTPS with Let's Encrypt
5. Set up DNS records (headscale.blackroad.io)
6. Create initial admin user

**Success Criteria**: Headscale control panel accessible at https://headscale.blackroad.io

#### 1.2 Configure DERP Relay (Week 2)
DERP (Designated Encrypted Relay for Packets) enables NAT traversal.

```yaml
# headscale config.yaml
derp:
  servers:
    - url: https://derp.blackroad.io
      region_id: 1
      region_code: "us-west"
```

**Steps**:
1. Deploy DERP server alongside Headscale
2. Configure SSL certificates
3. Test relay connectivity
4. Update Headscale config

**Success Criteria**: Devices can connect even behind strict NAT

#### 1.3 Migrate Devices (Week 3-4)

**Order of Migration**:
1. **Test Device**: Raspberry Pi 5 #1 (192.168.4.49)
   - Join Headscale network
   - Verify connectivity to mesh
   - Keep Tailscale running for rollback

2. **Development Machine**: MacBook Pro (192.168.4.27)
   - Migrate dev environment
   - Update API endpoints
   - Test all services

3. **Production Devices**: Remaining Pi devices, iPhone
   - Batch migration
   - Monitor for issues

4. **Decommission Tailscale**
   - Export Tailscale config (backup)
   - Cancel Tailscale subscription
   - Archive access keys

**Per-Device Steps**:
```bash
# Generate pre-auth key on Headscale server
headscale preauthkeys create --user alexa --expiration 1h

# On client device
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/focal.list | sudo tee /etc/apt/sources.list.d/tailscale.list
sudo apt-get install tailscale
sudo tailscale up --login-server https://headscale.blackroad.io --authkey <KEY>
```

**Success Criteria**: All devices reachable on mesh network via Headscale

#### 1.4 Implement Zero-Trust Policies (Week 4)

**Install OPA (Open Policy Agent)**:
```bash
docker run -d \
  --name opa \
  -p 8181:8181 \
  openpolicyagent/opa:latest \
  run --server
```

**Example Policy** (Rego):
```rego
package blackroad.network

# Allow SSH only from development machine
allow {
  input.source_ip == "100.x.x.1"  # MacBook
  input.destination_port == 22
  input.protocol == "tcp"
}

# Allow API access from all mesh nodes
allow {
  input.source_ip startswith "100."
  input.destination_port == 8000
  input.protocol == "tcp"
}

# Deny everything else by default
default allow = false
```

**Success Criteria**: Network policies enforced, unauthorized access blocked

### Deliverables
- ✅ NETWORK_MAP.md (completed)
- [ ] Headscale running on 159.65.43.12
- [ ] All devices migrated to Headscale
- [ ] OPA policies active
- [ ] Tailscale decommissioned
- [ ] Documentation: HEADSCALE_SETUP.md

### Cost
- DigitalOcean droplet: $6/month (existing)
- Domain (headscale.blackroad.io): Included in blackroad.io
- **Total**: $0 additional

---

## Phase 2: Data Sovereignty (Q2 2025)

**Goal**: Own the data layer - deploy MinIO, PostgreSQL replication, Qdrant

### Objectives
- [ ] Deploy 3-node MinIO cluster on Raspberry Pi
- [ ] Set up PostgreSQL streaming replication
- [ ] Deploy Qdrant vector database
- [ ] Implement encrypted backups
- [ ] Migrate from cloud storage to self-hosted

### Tasks

#### 2.1 MinIO Cluster (Week 5-7)

**Hardware Setup**:
- 3x Raspberry Pi 5 (8GB)
- 3x 1TB USB SSD drives
- Gigabit Ethernet switch

**Deployment**:
```bash
# On each Pi (192.168.4.49, .50, .51)
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -v /mnt/data:/data \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=<strong-password>" \
  minio/minio server \
  http://192.168.4.49/data \
  http://192.168.4.50/data \
  http://192.168.4.51/data
```

**Configuration**:
- Erasure coding: 3 drives, 1 parity (2+1)
- Replication: Automatic across nodes
- SSL: Let's Encrypt via Cloudflare
- Access: s3.blackroad.io

**Success Criteria**: S3-compatible object storage with 99.9% uptime

#### 2.2 PostgreSQL Replication (Week 7-8)

**Primary**: Raspberry Pi 5 #1 (192.168.4.49)
**Replicas**: Raspberry Pi 5 #2, #3

```bash
# Primary setup
docker run -d \
  --name postgres-primary \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=<password> \
  -e POSTGRES_REPLICATION_MODE=master \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15

# Replica setup (on #2, #3)
docker run -d \
  --name postgres-replica \
  -p 5432:5432 \
  -e POSTGRES_REPLICATION_MODE=slave \
  -e POSTGRES_MASTER_HOST=192.168.4.49 \
  -v postgres-replica-data:/var/lib/postgresql/data \
  postgres:15
```

**Configuration**:
- Streaming replication (async)
- Automatic failover with Patroni
- Backup to MinIO every 6 hours

**Success Criteria**: Database survives single-node failure with <30s downtime

#### 2.3 Qdrant Vector Database (Week 8-9)

**Deployment**:
```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v qdrant-data:/qdrant/storage \
  qdrant/qdrant:latest
```

**Integration**:
- AI agent embeddings
- Semantic search for documentation
- Knowledge base for 30,000 agents

**Success Criteria**: <100ms query latency for vector search

#### 2.4 Backup System (Week 9-10)

**Strategy**:
```yaml
Tier 1 (Critical):
  - PostgreSQL databases
  - User data
  - Agent state
  Frequency: Hourly
  Retention: 30 days
  Destination: MinIO + Cloudflare R2

Tier 2 (Important):
  - Redis state
  - Session data
  Frequency: Daily
  Retention: 7 days
  Destination: MinIO

Tier 3 (Code):
  - Application code
  - Configs
  Frequency: On commit
  Retention: Infinite
  Destination: GitHub
```

**Tools**:
- pgBackRest for PostgreSQL
- Restic for filesystem backups
- Rclone for off-site sync

**Success Criteria**: RPO <1 hour, RTO <2 hours

### Deliverables
- [ ] MinIO cluster operational (3TB usable)
- [ ] PostgreSQL with 2 replicas
- [ ] Qdrant vector DB
- [ ] Automated backup system
- [ ] Documentation: DATA_SOVEREIGNTY.md

### Cost
- 3x 1TB SSD: ~$180
- Cloudflare R2 (off-site backup): ~$1/month
- **Total**: $180 one-time + $1/month

---

## Phase 3: Identity Sovereignty (Q2 2025)

**Goal**: Own authentication - deploy Keycloak SSO + SSI

### Objectives
- [ ] Deploy Keycloak on Raspberry Pi
- [ ] Migrate all apps to Keycloak OIDC
- [ ] Implement self-sovereign identity (SSI)
- [ ] Integrate Ledger hardware wallet
- [ ] Enable multi-factor authentication

### Tasks

#### 3.1 Deploy Keycloak (Week 11-12)

```bash
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=<password> \
  -e KC_DB=postgres \
  -e KC_DB_URL=jdbc:postgresql://192.168.4.49/keycloak \
  -e KC_HOSTNAME=auth.blackroad.io \
  quay.io/keycloak/keycloak:latest start
```

**Configuration**:
- Realm: `blackroad`
- Clients: web, api, terminal, agents
- Identity providers: Google (optional), GitHub (optional)
- OIDC + OAuth2 flows

**Success Criteria**: SSO working across all BlackRoad apps

#### 3.2 App Migration (Week 12-14)

**Order**:
1. Backend API (FastAPI + python-jose)
2. Web app (login flow)
3. Terminal (CLI auth)
4. Agent system (service accounts)

**FastAPI Integration**:
```python
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2AuthorizationCodeBearer
import jwt

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://auth.blackroad.io/realms/blackroad/protocol/openid-connect/auth",
    tokenUrl="https://auth.blackroad.io/realms/blackroad/protocol/openid-connect/token",
)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, verify=False)  # Verify with Keycloak public key
        return payload
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Success Criteria**: Users can log in once and access all services

#### 3.3 Self-Sovereign Identity (Week 14-15)

**Implement**:
- Decentralized Identifiers (DIDs)
- Verifiable Credentials (VCs)
- Integration with RoadChain

**Example DID**:
```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:blackroad:123456",
  "authentication": [{
    "id": "did:blackroad:123456#keys-1",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:blackroad:123456",
    "publicKeyMultibase": "z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"
  }],
  "service": [{
    "id": "did:blackroad:123456#agent",
    "type": "AgentService",
    "serviceEndpoint": "https://agent.blackroad.io/123456"
  }]
}
```

**Success Criteria**: Users own their identity, portable across platforms

#### 3.4 Hardware Wallet Integration (Week 15-16)

**Ledger Integration** (WebUSB):
```javascript
// ledger.html already exists!
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import AppBtc from "@ledgerhq/hw-app-btc";

async function signTransaction() {
  const transport = await TransportWebUSB.create();
  const btc = new AppBtc(transport);
  const signature = await btc.signMessageNew("44'/0'/0'/0/0", "Sign in to BlackRoad");
  return signature;
}
```

**Use Cases**:
- Sign in with hardware wallet
- Approve agent actions
- Authorize payments

**Success Criteria**: Users can authenticate with Ledger device

### Deliverables
- [ ] Keycloak SSO operational
- [ ] All apps migrated to OIDC
- [ ] SSI implemented (DIDs + VCs)
- [ ] Hardware wallet auth working
- [ ] Documentation: IDENTITY_SOVEREIGNTY.md

### Cost
- **Total**: $0 (uses existing hardware)

---

## Phase 4: Communication Sovereignty (Q3 2025)

**Goal**: Own communications - deploy Stalwart Mail + Mattermost

### Objectives
- [ ] Deploy Stalwart Mail (SMTP + IMAP)
- [ ] Migrate from Gmail to self-hosted
- [ ] Deploy Mattermost team chat
- [ ] Integrate with agent system
- [ ] Set up Jitsi for video calls

### Tasks

#### 4.1 Stalwart Mail (Week 17-19)

**Deployment**:
```bash
docker run -d \
  --name stalwart-mail \
  -p 25:25 \
  -p 465:465 \
  -p 587:587 \
  -p 993:993 \
  -v stalwart-data:/opt/stalwart-mail \
  stalw/mail-server:latest
```

**Configuration**:
- Domain: mail.blackroad.io
- MX record: `10 mail.blackroad.io`
- SPF, DKIM, DMARC records
- TLS certificates (Let's Encrypt)

**Accounts**:
- alexa@blackroad.io
- cece@blackroad.io
- agents@blackroad.io
- support@blackroad.io

**Migration Steps**:
1. Set up Stalwart Mail
2. Configure DNS records
3. Import Gmail archive (Google Takeout)
4. Test sending/receiving
5. Update email clients
6. Monitor for spam issues
7. Decommission Gmail forwarding

**Success Criteria**: All email flows through self-hosted server

#### 4.2 Mattermost (Week 19-20)

**Deployment**:
```bash
docker run -d \
  --name mattermost \
  -p 8065:8065 \
  -e MM_SQLSETTINGS_DRIVERNAME=postgres \
  -e MM_SQLSETTINGS_DATASOURCE=postgres://mattermost:password@192.168.4.49/mattermost \
  -v mattermost-data:/mattermost/data \
  mattermost/mattermost-team-edition:latest
```

**Features**:
- Team: BlackRoad Core Team
- Channels: #general, #dev, #agents, #research
- Integrations: Webhooks for agent notifications
- Bots: Cece agent integration

**Success Criteria**: Internal team communication on Mattermost

#### 4.3 Jitsi Video Calls (Week 20-21)

**Deployment**:
```bash
# Use docker-compose for Jitsi stack
docker-compose -f jitsi-docker-compose.yml up -d
```

**Domain**: meet.blackroad.io

**Use Cases**:
- Team meetings
- Agent demos
- User support

**Success Criteria**: Video calls working without Zoom/Google Meet

### Deliverables
- [ ] Stalwart Mail operational
- [ ] Gmail migration complete
- [ ] Mattermost deployed
- [ ] Jitsi video calls working
- [ ] Documentation: COMMUNICATION_SOVEREIGNTY.md

### Cost
- **Total**: $0 (uses existing hardware)

---

## Phase 5: AI Sovereignty (Q3-Q4 2025)

**Goal**: Own AI inference - deploy local LLMs with vLLM

### Objectives
- [ ] Acquire Jetson Orin Nano ($499)
- [ ] Deploy vLLM on Jetson
- [ ] Download and serve open-source models
- [ ] Migrate from Anthropic/OpenAI to local inference
- [ ] Fine-tune models for BlackRoad use cases

### Tasks

#### 5.1 Jetson Orin Nano Setup (Week 22-23)

**Hardware**:
- Jetson Orin Nano 8GB: $499
- Power supply: $20
- 128GB microSD: $20
- Cooling fan: $15
- **Total**: $554

**Software Setup**:
```bash
# Install JetPack (Ubuntu + CUDA)
sudo apt update && sudo apt upgrade
sudo apt install nvidia-jetpack

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install vLLM
pip3 install vllm
```

**Success Criteria**: Jetson running with CUDA support

#### 5.2 Model Deployment (Week 23-25)

**Models to Deploy**:

| Model | Size | License | Use Case |
|-------|------|---------|----------|
| **Mistral 7B** | 4.1GB | Apache 2.0 | General chat |
| **DeepSeek-Coder 6.7B** | 3.8GB | MIT | Code generation |
| **Qwen 2.5 7B** | 4.3GB | Apache 2.0 | Multilingual |
| **LLaMA 3.1 8B** | 4.7GB | Meta License | Advanced reasoning |

**vLLM Server**:
```bash
python -m vllm.entrypoints.api_server \
  --model mistralai/Mistral-7B-Instruct-v0.2 \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.9 \
  --port 8000
```

**API Compatibility**:
- OpenAI-compatible API
- Streaming support
- Multiple concurrent requests

**Success Criteria**: Serving 10+ requests/sec with <500ms latency

#### 5.3 Backend Migration (Week 25-26)

**Update LLM Router** (already exists in `blackroad_core/llm/`):
```python
from blackroad_core.llm import LLMConfig, LLMRouter, VLLMProvider, LLMBackend

# Add local vLLM provider
config = LLMConfig(
    backend=LLMBackend.VLLM,
    base_url="http://192.168.4.52:8000/v1",  # Jetson
    model_name="mistralai/Mistral-7B-Instruct-v0.2"
)
router = LLMRouter()
router.register_provider("vllm-local", VLLMProvider(config), set_default=True)

# Fallback to cloud APIs if local fails
router.register_provider("anthropic", AnthropicProvider(cloud_config), set_default=False)
```

**Success Criteria**: 90% of requests served locally, 10% fallback to cloud

#### 5.4 Model Fine-Tuning (Week 27-30)

**Dataset**:
- BlackRoad documentation
- Agent conversation logs
- User feedback

**Fine-tuning Process**:
```bash
# Using LoRA (Low-Rank Adaptation)
python -m llmtuner.fine_tune \
  --model_name mistralai/Mistral-7B-Instruct-v0.2 \
  --dataset blackroad-docs \
  --output_dir models/mistral-blackroad-v1 \
  --lora_rank 8 \
  --num_epochs 3
```

**Success Criteria**: Fine-tuned model outperforms base model on BlackRoad tasks

### Deliverables
- [ ] Jetson Orin Nano operational
- [ ] 4+ models deployed locally
- [ ] Backend using local inference
- [ ] Fine-tuned BlackRoad model
- [ ] Documentation: AI_SOVEREIGNTY.md

### Cost
- Jetson Orin Nano kit: $554
- Electricity: ~$3/month (30W * 24h * 30d * $0.12/kWh)
- **Total**: $554 one-time + $3/month

---

## Phase 6: Full Sovereignty (Q4 2025)

**Goal**: Eliminate all remaining cloud dependencies

### Objectives
- [ ] Migrate off Railway to K3s
- [ ] Deploy Gitea (GitHub alternative)
- [ ] Deploy BTCPay Server (Stripe alternative)
- [ ] Deploy Plane (Linear alternative)
- [ ] Achieve 100% forkability

### Tasks

#### 6.1 K3s Cluster Migration (Week 31-34)

**Cluster Setup**:
```bash
# On master node (Raspberry Pi 5 #1)
curl -sfL https://get.k3s.io | sh -

# Get node token
sudo cat /var/lib/rancher/k3s/server/node-token

# On worker nodes (#2, #3)
curl -sfL https://get.k3s.io | K3S_URL=https://192.168.4.49:6443 \
  K3S_TOKEN=<node-token> sh -
```

**Deploy Applications**:
```yaml
# blackroad-api deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blackroad-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: blackroad/api:latest
        ports:
        - containerPort: 8000
---
apiVersion: v1
kind: Service
metadata:
  name: blackroad-api
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
```

**Migrate Services**:
1. PostgreSQL → StatefulSet
2. Redis → StatefulSet
3. FastAPI → Deployment (3 replicas)
4. MinIO → Already deployed
5. Qdrant → StatefulSet

**Success Criteria**: All services running on K3s, Railway decommissioned

#### 6.2 Gitea (Week 34-35)

**Deployment**:
```bash
docker run -d \
  --name gitea \
  -p 3000:3000 \
  -p 2222:22 \
  -v gitea-data:/data \
  gitea/gitea:latest
```

**Configuration**:
- Domain: git.blackroad.io
- Organizations: Mirror all 15 GitHub orgs
- Webhooks: CI/CD to Woodpecker CI
- Mirroring: Bidirectional sync with GitHub

**Success Criteria**: All repos mirrored, pushes to both platforms

#### 6.3 BTCPay Server (Week 35-36)

**Deployment**:
```bash
git clone https://github.com/btcpayserver/btcpayserver-docker
cd btcpayserver-docker
export BTCPAY_HOST="pay.blackroad.io"
export REVERSEPROXY_DEFAULT_HOST="$BTCPAY_HOST"
./btcpay-setup.sh -i
```

**Features**:
- Bitcoin (on-chain + Lightning)
- Ethereum (ERC-20)
- Solana
- Point-of-Sale terminal
- Donation buttons

**Integration**:
```javascript
// Frontend integration
<form method="POST" action="https://pay.blackroad.io/api/v1/invoices">
  <input type="hidden" name="storeId" value="<store-id>" />
  <input type="hidden" name="price" value="10" />
  <input type="hidden" name="currency" value="USD" />
  <button type="submit">Pay with Crypto</button>
</form>
```

**Success Criteria**: Accept crypto payments without Stripe

#### 6.4 Plane (Week 36-37)

**Deployment**:
```bash
git clone https://github.com/makeplane/plane
cd plane
docker-compose -f docker-compose.yml up -d
```

**Configuration**:
- Domain: pm.blackroad.io
- Workspaces: BlackRoad OS
- Projects: Core, AI, Cloud, Web, etc.
- Integration: GitHub issues sync

**Success Criteria**: Team using Plane instead of Linear

#### 6.5 Final Independence Audit (Week 38-40)

**Checklist**:
- [ ] No Tailscale dependency → Headscale ✅
- [ ] No Railway dependency → K3s ✅
- [ ] No Stripe dependency → BTCPay ✅
- [ ] No Gmail dependency → Stalwart ✅
- [ ] No Linear dependency → Plane ✅
- [ ] No GitHub dependency (mirrored) → Gitea ✅
- [ ] No Anthropic/OpenAI dependency (fallback) → vLLM ✅
- [ ] No Cloudflare dependency (optional) → Can self-host ✅

**Sovereignty Score**: 100% (with optional cloud services for performance)

### Deliverables
- [ ] K3s cluster operational
- [ ] Gitea mirroring all repos
- [ ] BTCPay Server accepting payments
- [ ] Plane for project management
- [ ] Complete independence achieved
- [ ] Documentation: FULL_SOVEREIGNTY.md

### Cost
- **Total**: $0 additional (uses existing hardware)

---

## Timeline Summary

```
Q1 2025: Network Sovereignty
├─ Week 1-2:   Deploy Headscale
├─ Week 3-4:   Migrate devices
└─ Week 4:     Zero-trust policies

Q2 2025: Data + Identity Sovereignty
├─ Week 5-7:   MinIO cluster
├─ Week 7-8:   PostgreSQL replication
├─ Week 8-9:   Qdrant vector DB
├─ Week 9-10:  Backup system
├─ Week 11-12: Keycloak deployment
├─ Week 12-14: App migration to OIDC
├─ Week 14-15: Self-sovereign identity
└─ Week 15-16: Hardware wallet auth

Q3 2025: Communication + AI Sovereignty
├─ Week 17-19: Stalwart Mail
├─ Week 19-20: Mattermost
├─ Week 20-21: Jitsi video
├─ Week 22-23: Jetson setup
├─ Week 23-25: Model deployment
├─ Week 25-26: Backend migration
└─ Week 27-30: Model fine-tuning

Q4 2025: Full Sovereignty
├─ Week 31-34: K3s cluster + migration
├─ Week 34-35: Gitea deployment
├─ Week 35-36: BTCPay Server
├─ Week 36-37: Plane
└─ Week 38-40: Independence audit
```

**Total Duration**: 40 weeks (10 months)
**Completion Target**: October 2025

---

## Cost Breakdown

### One-Time Costs
| Item | Cost | Phase |
|------|------|-------|
| 3x Raspberry Pi 5 (8GB) | $240 | Already owned ✅ |
| Raspberry Pi 400 | $70 | Already owned ✅ |
| Raspberry Pi Zero 2 W | $15 | Already owned ✅ |
| 3x 1TB USB SSD | $180 | Phase 2 |
| Jetson Orin Nano kit | $554 | Phase 5 |
| Miscellaneous (cables, etc.) | $50 | Various |
| **Total** | **$1,109** | **$234 remaining** |

### Recurring Costs (Annual)

**Current** (Proprietary):
| Service | Cost/year |
|---------|-----------|
| Railway | $240 |
| DigitalOcean | $72 |
| Domains | $150 |
| Tailscale (if paid) | $0 (free tier) |
| **Total** | **$462** |

**Future** (Sovereign):
| Service | Cost/year |
|---------|-----------|
| DigitalOcean (Headscale only) | $72 |
| Domains | $150 |
| Electricity (Pi cluster + Jetson) | $36 |
| Cloudflare R2 (backup) | $12 |
| **Total** | **$270** |

**Annual Savings**: $192/year + complete control

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hardware failure (Pi) | High | RAID, replication, spare devices |
| Network outage | Medium | Mesh continues P2P, failover to cloud |
| Model performance | Medium | Keep cloud APIs as fallback |
| Storage capacity | Low | MinIO scales horizontally |
| Power outage | Low | UPS for critical devices |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complexity overwhelm | High | Incremental rollout, good docs |
| Time commitment | High | Automate everything, monitoring |
| Knowledge gaps | Medium | Learning resources, community |
| Vendor lock-in reversal | Low | Keep cloud accounts for 6 months |

### Rollback Plan

Each phase can be rolled back independently:
- **Phase 1**: Revert to Tailscale (keep account active during migration)
- **Phase 2**: Restore from backups to cloud databases
- **Phase 3**: Keep JWT auth as fallback during Keycloak migration
- **Phase 4**: Gmail forwarding remains active during transition
- **Phase 5**: Cloud APIs remain as fallback
- **Phase 6**: Railway account kept open until K3s proven stable

---

## Success Metrics

### Technical Metrics
- **Uptime**: >99.9% (43 minutes downtime/month)
- **Latency**: <100ms for local services, <500ms for AI inference
- **Throughput**: 100+ requests/sec
- **Storage**: 3TB usable with redundancy
- **Bandwidth**: <500GB/month public

### Sovereignty Metrics
- **Forkability**: 100% (all components MIT/Apache 2.0/BSD)
- **Data Locality**: 100% (all data on-premises or known location)
- **Vendor Independence**: 100% (no required proprietary services)
- **Hardware Ownership**: 100% (all compute owned)

### Cost Metrics
- **Hardware ROI**: Break-even in 6 months vs cloud
- **Operational Cost**: <$30/month recurring
- **Total Cost of Ownership**: $1,109 + $270/year

---

## Documentation Requirements

Each phase requires comprehensive documentation:

### Per-Phase Deliverables
1. **Setup Guide**: Step-by-step deployment instructions
2. **Architecture Diagram**: Visual representation of components
3. **Configuration Files**: All configs in version control
4. **Runbook**: Operational procedures (startup, shutdown, backup, restore)
5. **Troubleshooting Guide**: Common issues and solutions
6. **Monitoring Dashboard**: Grafana dashboards for health metrics

### Central Documentation Hub
- **SOVEREIGNTY_INDEX.md**: Links to all phase documentation
- **ARCHITECTURE_OVERVIEW.md**: High-level system design
- **OPERATIONAL_HANDBOOK.md**: Day-to-day operations guide
- **INCIDENT_RESPONSE.md**: Disaster recovery procedures

---

## Community & Governance

### Open Source Strategy

**Repositories**:
- `blackroad-os/headscale-deployment` (Ansible playbooks)
- `blackroad-os/k3s-manifests` (Kubernetes YAML)
- `blackroad-os/sovereignty-toolkit` (Scripts and tools)

**Documentation**:
- Public wiki: wiki.blackroad.io
- Tutorial videos: YouTube channel
- Blog posts: blog.blackroad.io

**Philosophy**:
> Make it trivial for anyone to fork BlackRoad and run it themselves. The easier it is to fork, the more sovereign the system.

### Contribution Guidelines

**We welcome**:
- Bug reports and fixes
- Performance optimizations
- Documentation improvements
- New Forkie suggestions
- Hardware compatibility testing

**We reject**:
- Proprietary dependencies
- Closed-source integrations
- Vendor lock-in features
- Privacy-invasive telemetry

---

## Next Actions (Immediate)

### Week 1 Tasks (This Week)
1. ✅ Document current state (FORKIES_MAP.md, NETWORK_MAP.md)
2. [ ] SSH into DigitalOcean droplet (159.65.43.12)
3. [ ] Install Docker on droplet
4. [ ] Deploy Headscale container
5. [ ] Configure DNS for headscale.blackroad.io
6. [ ] Generate first pre-auth key
7. [ ] Join Raspberry Pi 5 #1 to Headscale

### Week 2 Tasks
1. [ ] Configure DERP relay
2. [ ] Test mesh connectivity
3. [ ] Migrate MacBook to Headscale
4. [ ] Document migration process
5. [ ] Update NETWORK_MAP.md with new IPs

---

## Conclusion

This roadmap transforms BlackRoad OS from a cloud-dependent system to a fully sovereign, forkable operating system. By Q4 2025, BlackRoad will run entirely on owned hardware with open-source software, demonstrating that **hardware ownership beats cloud rental** for individuals and small teams.

**The Three Pillars of Sovereignty**:
1. ✅ **Hardware Ownership**: Own every device
2. ✅ **Data Locality**: Know where every byte lives
3. ✅ **Comprehensibility**: Understand the full stack

**The Promise**:
> Any individual can clone BlackRoad, deploy it on their own hardware, and run independently. No vendor lock-in. No kill switches. No rent-seeking. Just sovereign computing.

---

*This roadmap is a living document. Update it as we progress through the phases.*

**Maintained by**: Alexa Amundson
**Review Queue**: blackroad.systems@gmail.com
**Source of Truth**: GitHub (BlackRoad-OS/blackroad-os-core)
**Verification**: PS-SHA-∞ hash chain
