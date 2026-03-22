# BlackRoad Identification Numbering Framework (BR-ID)

**Version**: 1.0.0
**Last Updated**: 2025-12-12
**Status**: Active

## Overview

The BR-ID Framework provides a hierarchical identification system for all files, directories, services, and infrastructure components within the BlackRoad ecosystem.

## ID Structure

```
BR-[CATEGORY]-[SUBCATEGORY]-[NUMBER]
```

### Format Rules
- **BR**: BlackRoad prefix (all IDs start with this)
- **CATEGORY**: 2-3 letter category code (uppercase)
- **SUBCATEGORY**: 2-3 letter subcategory code (uppercase)
- **NUMBER**: 4-digit sequential number (0001-9999)

### Examples
- `BR-INF-SRV-0001` - Infrastructure > Service > #1
- `BR-SEC-ENV-0001` - Security > Environment > #1
- `BR-APP-WEB-0001` - Application > Web > #1

---

## Category Taxonomy

### 1. **INF** - Infrastructure
Physical and cloud infrastructure components

**Subcategories:**
- **SRV** - Servers (Droplets, VMs, Raspberry Pi)
- **NET** - Network (Tunnels, DNS, Load Balancers)
- **STR** - Storage (Databases, KV, Object Storage)
- **CNT** - Containers (Docker, K8s)
- **REG** - Registries (Container, NPM, Package)

### 2. **SEC** - Security
Secrets, credentials, and security components

**Subcategories:**
- **ENV** - Environment Variables
- **TKN** - Tokens & API Keys
- **CRT** - Certificates & Keys
- **CRD** - Credentials (Database, OAuth)
- **CRP** - Crypto Wallets & Holdings

### 3. **APP** - Applications
Deployed applications and services

**Subcategories:**
- **WEB** - Web Applications
- **API** - API Services
- **WRK** - Workers (Cloudflare, background)
- **CLI** - Command Line Tools
- **DSK** - Desktop Applications

### 4. **SRC** - Source Code
Code repositories and projects

**Subcategories:**
- **REP** - Repositories
- **PKG** - Packages/Libraries
- **MON** - Monorepo Workspaces
- **TMP** - Templates
- **SDK** - SDKs

### 5. **DAT** - Data
Data storage and management

**Subcategories:**
- **DBS** - Databases
- **KVS** - Key-Value Stores
- **FLS** - File Storage
- **BKP** - Backups
- **LOG** - Logs

### 6. **SVC** - Services (Running)
Active processes and services

**Subcategories:**
- **PRC** - Processes (Node, Python)
- **DMN** - Daemons (Cloudflared, systemd)
- **MCP** - MCP Servers
- **TUN** - Tunnels & Proxies
- **MON** - Monitoring Services

### 7. **ORG** - Organizations
GitHub orgs, teams, and organizational units

**Subcategories:**
- **GHO** - GitHub Organizations
- **CFO** - Cloudflare Organizations
- **RWO** - Railway Organizations
- **PRJ** - Projects
- **TEM** - Teams

### 8. **DOC** - Documentation
Documentation files and systems

**Subcategories:**
- **MKD** - Markdown Docs
- **API** - API Documentation
- **ARC** - Architecture Docs
- **OPS** - Operational Runbooks
- **POL** - Policies

### 9. **CFG** - Configuration
Configuration files and settings

**Subcategories:**
- **ENV** - Environment Configs
- **SYS** - System Configs
- **BLD** - Build Configs
- **DEP** - Deployment Configs
- **IDE** - IDE/Editor Configs

### 10. **INT** - Integrations
Third-party integrations and APIs

**Subcategories:**
- **PAY** - Payment (Stripe, etc.)
- **AUT** - Auth (Clerk, OAuth)
- **CLO** - Cloud Platforms
- **AIS** - AI Services
- **DEV** - Developer Tools

---

## Master Inventory

### Infrastructure (INF)

#### Servers (INF-SRV)
| ID | Name | Type | IP/Host | Location |
|----|------|------|---------|----------|
| BR-INF-SRV-0001 | codex-infinity | DigitalOcean Droplet | 159.65.43.12 | NYC |
| BR-INF-SRV-0002 | alice-pi | Raspberry Pi 4 | 192.168.4.49 | Local |
| BR-INF-SRV-0003 | iphone-koder | iPhone Dev Server | 192.168.4.68:8080 | Local |
| BR-INF-SRV-0004 | railway-postgres | Railway PostgreSQL | trolley.proxy.rlwy.net:47996 | Cloud |

#### Network (INF-NET)
| ID | Name | Type | Endpoint | Status |
|----|------|------|----------|--------|
| BR-INF-NET-0001 | cloudflare-tunnel | Cloudflare Tunnel | blackroad-systems | Active |
| BR-INF-NET-0002 | blackroad.io | Domain | NS Cloudflare | Active |
| BR-INF-NET-0003 | blackroadinc.us | Domain | NS Cloudflare | Active |

#### Storage (INF-STR)
| ID | Name | Type | Platform | ID/Namespace |
|----|------|------|----------|--------------|
| BR-INF-STR-0001 | railway-postgres | PostgreSQL | Railway | 602cb63b-6c98 |
| BR-INF-STR-0002 | blackroad-api-claims | Cloudflare KV | Cloudflare | ac869d3a3ae54cd4 |
| BR-INF-STR-0003 | gdrive-personal | Google Drive | Google | blackroad@gmail.com |
| BR-INF-STR-0004 | gdrive-blackroad | Google Drive | Google | blackroad.systems@gmail.com |

---

### Security (SEC)

#### Environment Variables (SEC-ENV)
| ID | Name | Location | Purpose |
|----|------|----------|---------|
| BR-SEC-ENV-0001 | .env | ~/blackroad-sandbox/.env | Main environment |
| BR-SEC-ENV-0002 | .env.company | ~/blackroad-sandbox/.env.company | Company vars |
| BR-SEC-ENV-0003 | .env.payment | ~/blackroad-sandbox/.env.payment | Payment credentials |
| BR-SEC-ENV-0004 | .env.production | ~/blackroad-sandbox/.env.production | Production settings |
| BR-SEC-ENV-0005 | .env.home | ~/blackroad-sandbox/.env.home | Home directory vars |

#### Tokens (SEC-TKN)
| ID | Name | Service | Scope |
|----|------|---------|-------|
| BR-SEC-TKN-0001 | railway-api-token | Railway | Project management |
| BR-SEC-TKN-0002 | cloudflare-api-primary | Cloudflare | Full account access |
| BR-SEC-TKN-0003 | cloudflare-dns-token | Cloudflare | DNS zone edit |
| BR-SEC-TKN-0004 | github-personal-token | GitHub | repo, workflow, gist |
| BR-SEC-TKN-0005 | openai-api-key | OpenAI | API access |
| BR-SEC-TKN-0006 | ngrok-authtoken | ngrok | Tunnel service |

#### Credentials (SEC-CRD)
| ID | Name | Type | Storage |
|----|------|------|---------|
| BR-SEC-CRD-0001 | credentials-inventory | YAML | _secrets/credentials-inventory.yaml |
| BR-SEC-CRD-0002 | clerk-test-keys | JSON | clerk-config.json |
| BR-SEC-CRD-0003 | stripe-config | JSON | stripe-config.json |

#### Crypto (SEC-CRP)
| ID | Asset | Amount | Wallet | Address |
|----|-------|--------|--------|---------|
| BR-SEC-CRP-0001 | ETH | 2.5 | MetaMask iPhone | 0x... |
| BR-SEC-CRP-0002 | SOL | 100 | Phantom | ... |
| BR-SEC-CRP-0003 | BTC | 0.1 | Coinbase | 1Ak2fc5N2q4imYxqVMqBNEQDFq8J2Zs9TZ |

---

### Applications (APP)

#### Web Apps (APP-WEB)
| ID | Name | Platform | URL | Repo |
|----|------|----------|-----|------|
| BR-APP-WEB-0001 | blackroad-os-web | Cloudflare Pages | blackroad.io | blackroad-os-web |
| BR-APP-WEB-0002 | blackroad-docs | Cloudflare Pages | docs.blackroad.io | blackroad-os-docs |
| BR-APP-WEB-0003 | blackroad-status | Cloudflare Pages | status.blackroad.io | - |
| BR-APP-WEB-0004 | blackroad-prism-console | Railway | - | blackroad-prism-console |

#### APIs (APP-API)
| ID | Name | Endpoint | Port | Purpose |
|----|------|----------|------|---------|
| BR-APP-API-0001 | api-gateway | localhost:8000 | 8000 | Main API Gateway |
| BR-APP-API-0002 | service-registry | localhost:9900 | 9900 | Service Registry |
| BR-APP-API-0003 | service-mesh | localhost:9999 | 9999 | Service Mesh |
| BR-APP-API-0004 | event-bus | localhost:9800 | 9800 | Event Bus |
| BR-APP-API-0005 | auth-service | localhost:11000 | 11000 | Auth Service |
| BR-APP-API-0006 | orchestrator | localhost:10100 | 10100 | Orchestrator |
| BR-APP-API-0007 | integrations-hub | localhost:9700 | 9700 | Integrations |

#### Workers (APP-WRK)
| ID | Name | URL | Purpose |
|----|------|-----|---------|
| BR-APP-WRK-0001 | blackroad-auth | blackroad-auth.blackroad.workers.dev | Authentication |
| BR-APP-WRK-0002 | blackroad-gateway | blackroad-gateway.blackroad.workers.dev | API Gateway |
| BR-APP-WRK-0003 | blackroad-landing | blackroad-landing.blackroad.workers.dev | Landing Page |

---

### Source Code (SRC)

#### Repositories (SRC-REP)
| ID | Name | Type | Location | Status |
|----|------|------|----------|--------|
| BR-SRC-REP-0001 | blackroad-sandbox | Monorepo | ~/blackroad-sandbox | Active |
| BR-SRC-REP-0002 | blackroad-prism-console | Monorepo | ~/blackroad-sandbox/blackroad-prism-console | Submodule |
| BR-SRC-REP-0003 | blackboxprogramming | Repo | ~/blackroad-sandbox/blackboxprogramming | Nested |
| BR-SRC-REP-0004 | blackroad-os-operator | Repo | ~/blackroad-os-operator | External |
| BR-SRC-REP-0005 | blackroad-os-core | Repo | ~/blackroad-os-core | External |

#### Packages (SRC-PKG)
| ID | Name | Type | Location |
|----|------|------|----------|
| BR-SRC-PKG-0001 | @blackroad/config | TypeScript | packages/config |
| BR-SRC-PKG-0002 | @blackroad/sdk-py | Python | packages/sdk-py |
| BR-SRC-PKG-0003 | @blackroad/sdk-ts | TypeScript | packages/sdk-ts |
| BR-SRC-PKG-0004 | @blackroad/ui | React | packages/ui |

---

### Services (Running) (SVC)

#### Processes (SVC-PRC)
| ID | Name | Type | PID | Command |
|----|------|------|-----|---------|
| BR-SVC-PRC-0001 | mcp-playwright | Node | 4306 | mcp-server-playwright |
| BR-SVC-PRC-0002 | context7-mcp | Node | 2374 | @upstash/context7-mcp |
| BR-SVC-PRC-0003 | npm-playwright | NPM | 2235 | npm exec @playwright/mcp |
| BR-SVC-PRC-0004 | npm-context7 | NPM | 2234 | npm exec @upstash/context7-mcp |

#### Daemons (SVC-DMN)
| ID | Name | Type | PID | Status |
|----|------|------|-----|--------|
| BR-SVC-DMN-0001 | cloudflared-tunnel | Cloudflared | 764 | Running |

#### MCP Servers (SVC-MCP)
| ID | Name | Port | Protocol |
|----|------|------|----------|
| BR-SVC-MCP-0001 | playwright-mcp | stdio | MCP |
| BR-SVC-MCP-0002 | context7-mcp | stdio | MCP |

---

### Organizations (ORG)

#### GitHub Organizations (ORG-GHO)
| ID | Name | ID | Role |
|----|------|-----|------|
| BR-ORG-GHO-0001 | Blackbox-Enterprises | 118288010 | Admin |
| BR-ORG-GHO-0002 | BlackRoad-AI | 220280659 | Admin |
| BR-ORG-GHO-0003 | BlackRoad-OS | 244616883 | Admin |
| BR-ORG-GHO-0004 | BlackRoad-Labs | 245883241 | Admin |
| BR-ORG-GHO-0005 | BlackRoad-Cloud | 245884403 | Admin |
| BR-ORG-GHO-0006 | BlackRoad-Ventures | 245885950 | Admin |
| BR-ORG-GHO-0007 | BlackRoad-Foundation | 245886297 | Admin |
| BR-ORG-GHO-0008 | BlackRoad-Media | 245886601 | Admin |
| BR-ORG-GHO-0009 | BlackRoad-Hardware | 245886921 | Admin |
| BR-ORG-GHO-0010 | BlackRoad-Education | 245887147 | Admin |
| BR-ORG-GHO-0011 | BlackRoad-Gov | 245887424 | Admin |
| BR-ORG-GHO-0012 | BlackRoad-Security | 245887598 | Admin |
| BR-ORG-GHO-0013 | BlackRoad-Interactive | 245887798 | Admin |
| BR-ORG-GHO-0014 | BlackRoad-Archive | 245888150 | Admin |
| BR-ORG-GHO-0015 | BlackRoad-Studio | 245888433 | Admin |

#### Cloudflare (ORG-CFO)
| ID | Name | ID | Type |
|----|------|-----|------|
| BR-ORG-CFO-0001 | blackroad-account | 848cf0b18d51e0170e0d1537aec3505a | Account |
| BR-ORG-CFO-0002 | blackroad-systems | - | Zero Trust Org |

#### Railway Projects (ORG-RWO)
| ID | Name | Project ID |
|----|------|------------|
| BR-ORG-RWO-0001 | blackroad-os-core | 602cb63b-6c98-4032-9362-64b7a90f7d94 |
| BR-ORG-RWO-0002 | BlackRoad OS | 03ce1e43-5086-4255-b2bc-0146c8916f4c |
| BR-ORG-RWO-0003 | blackroad-os-api | f9116368-9135-418c-9050-39496aa9079a |
| BR-ORG-RWO-0004 | blackroad-os-docs | a4efb8cd-0d67-4b19-a7f3-b6dbcedf2079 |
| BR-ORG-RWO-0005 | blackroad-os-prism-console | 70ce678e-1e2f-4734-9024-6fb32ee5c8eb |
| BR-ORG-RWO-0006 | blackroad-os-web | ced8da45-fcdd-4a86-8f3e-093f5a0723ff |
| BR-ORG-RWO-0007 | lucidia-platform | 5c99157a-ff22-496c-b295-55e98145540f |

---

### Documentation (DOC)

#### Markdown Docs (DOC-MKD)
| ID | Name | Location | Purpose |
|----|------|----------|---------|
| BR-DOC-MKD-0001 | README.md | ~/blackroad-sandbox/README.md | Main README |
| BR-DOC-MKD-0002 | ARCHITECTURE.md | ~/blackroad-sandbox/ARCHITECTURE.md | System Architecture |
| BR-DOC-MKD-0003 | SECRETS_QUICK_REFERENCE.md | ~/blackroad-sandbox/SECRETS_QUICK_REFERENCE.md | Secrets Guide |
| BR-DOC-MKD-0004 | BR-ID-FRAMEWORK.md | ~/blackroad-sandbox/BR-ID-FRAMEWORK.md | This Document |
| BR-DOC-MKD-0005 | _secrets/README.md | ~/blackroad-sandbox/_secrets/README.md | Secrets Directory |
| BR-DOC-MKD-0006 | CONSOLIDATION_SUMMARY.md | ~/blackroad-sandbox/_secrets/CONSOLIDATION_SUMMARY.md | Secrets Summary |

---

### Configuration (CFG)

#### System Configs (CFG-SYS)
| ID | Name | Type | Location |
|----|------|------|----------|
| BR-CFG-SYS-0001 | .blackroad.yml | YAML | .blackroad.yml |
| BR-CFG-SYS-0002 | package.json | JSON | package.json |
| BR-CFG-SYS-0003 | pyproject.toml | TOML | pyproject.toml |
| BR-CFG-SYS-0004 | tsconfig.json | JSON | tsconfig.json |
| BR-CFG-SYS-0005 | pnpm-workspace.yaml | YAML | pnpm-workspace.yaml |

#### Build Configs (CFG-BLD)
| ID | Name | Type | Purpose |
|----|------|------|---------|
| BR-CFG-BLD-0001 | turbo.json | JSON | Turborepo config |
| BR-CFG-BLD-0002 | wrangler.toml | TOML | Cloudflare Workers |
| BR-CFG-BLD-0003 | Dockerfile | Docker | Container build |

#### Deployment Configs (CFG-DEP)
| ID | Name | Platform | Config File |
|----|------|----------|-------------|
| BR-CFG-DEP-0001 | railway-config | Railway | railway.json |
| BR-CFG-DEP-0002 | vercel-config | Vercel | vercel.json |
| BR-CFG-DEP-0003 | cloudflare-wrangler | Cloudflare | wrangler.toml |

---

### Integrations (INT)

#### Payment (INT-PAY)
| ID | Name | Service | Config |
|----|------|---------|--------|
| BR-INT-PAY-0001 | stripe-integration | Stripe | stripe-config.json |

#### Auth (INT-AUT)
| ID | Name | Service | Config |
|----|------|---------|--------|
| BR-INT-AUT-0001 | clerk-auth | Clerk | clerk-config.json |
| BR-INT-AUT-0002 | cloudflare-access | Cloudflare | Zero Trust |

#### AI Services (INT-AIS)
| ID | Name | Service | Purpose |
|----|------|---------|---------|
| BR-INT-AIS-0001 | openai-api | OpenAI | GPT Models |
| BR-INT-AIS-0002 | anthropic-api | Anthropic | Claude Models |

---

## Directory Structure Map

```
~/blackroad-sandbox/                    [BR-SRC-REP-0001]
├── _secrets/                           [BR-SEC-CRD-0001]
│   ├── credentials-inventory.yaml
│   ├── crypto-holdings.yaml
│   ├── README.md                       [BR-DOC-MKD-0005]
│   └── CONSOLIDATION_SUMMARY.md        [BR-DOC-MKD-0006]
├── .env                                [BR-SEC-ENV-0001]
├── .env.company                        [BR-SEC-ENV-0002]
├── .env.payment                        [BR-SEC-ENV-0003]
├── .env.production                     [BR-SEC-ENV-0004]
├── .env.home                           [BR-SEC-ENV-0005]
├── .cloudflare_dns_token               [BR-SEC-TKN-0003]
├── README.md                           [BR-DOC-MKD-0001]
├── ARCHITECTURE.md                     [BR-DOC-MKD-0002]
├── BR-ID-FRAMEWORK.md                  [BR-DOC-MKD-0004]
├── SECRETS_QUICK_REFERENCE.md          [BR-DOC-MKD-0003]
├── package.json                        [BR-CFG-SYS-0002]
├── tsconfig.json                       [BR-CFG-SYS-0004]
├── wrangler.toml                       [BR-CFG-BLD-0002]
├── apps/
│   ├── web/                            [BR-APP-WEB-0001]
│   ├── desktop/
│   └── prism-portal/
├── packages/
│   ├── config/                         [BR-SRC-PKG-0001]
│   ├── sdk-py/                         [BR-SRC-PKG-0002]
│   ├── sdk-ts/                         [BR-SRC-PKG-0003]
│   └── ui/                             [BR-SRC-PKG-0004]
├── backends/                           [Domain backends]
└── blackroad-prism-console/            [BR-SRC-REP-0002]
```

---

## Usage Guidelines

### 1. Assigning New IDs
When creating new resources:
1. Determine the category and subcategory
2. Find the next available number in that subcategory
3. Document the ID in this file
4. Tag the resource with the ID (in metadata, comments, or tags)

### 2. Referencing IDs
In documentation, use BR-IDs to reference components:
```markdown
Deploy [BR-APP-WEB-0001] to production using [BR-CFG-DEP-0003]
Authenticate via [BR-INT-AUT-0001] using [BR-SEC-TKN-0004]
```

### 3. Searching by ID
```bash
# Find all references to a specific ID
grep -r "BR-INF-SRV-0001" ~/blackroad-sandbox/

# List all IDs in a category
grep "BR-SEC-" ~/blackroad-sandbox/BR-ID-FRAMEWORK.md
```

### 4. ID Retirement
When a resource is decommissioned:
- Mark as `[RETIRED]` in the inventory
- Keep the ID reserved (do not reuse)
- Document retirement date and reason

---

## Maintenance

### Update Frequency
- Review quarterly (every 3 months)
- Update immediately when new resources added
- Archive retired IDs annually

### Version Control
- This file is tracked in git
- Changes require documentation in commit message
- Major changes increment version number

### Contact
For ID assignment questions or conflicts:
- **Primary**: blackroad@gmail.com
- **Company**: blackroad.systems@gmail.com

---

**Framework Version**: 1.0.0
**Last Updated**: 2025-12-12
**Next Review**: 2026-03-12
