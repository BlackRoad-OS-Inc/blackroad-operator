# BlackRoad Domain and Subdomain Scheme

This document defines a durable, domain-agnostic subdomain scheme for the BlackRoad ecosystem. It captures the canonical mapping for current domains plus a reserved namespace for future growth. Use it as the single reference when provisioning DNS, certificates, or routing rules.

## Global Rules

### Universal Subdomain Set
Reserve the following subdomains for every domain (create DNS records as needed over time):

- `www` – marketing or public landing
- `app` – primary signed-in surface
- `api` – public API
- `console` – admin or power-user UI
- `portal` – customer or partner portal
- `admin` – internal administration tools
- `auth` – authentication, OAuth, or SSO
- `login` – login entrypoint
- `docs` – documentation
- `status` – status page
- `demo` – demos or sandboxes
- `cdn` – CDN edge
- `static` – static assets
- `assets` – misc assets
- `media` – heavy media (video, audio)
- `dev` – development environment front door
- `stg` – staging environment front door
- `sandbox` – experimental environment front door
- `mail` – email or SMTP entry

### Environment Wildcards
Use wildcards where possible to simplify environment routing:

- `*.dev.<domain>`
- `*.stg.<domain>`
- `*.sandbox.<domain>`

## OS Spine: `blackroad.systems`

This domain anchors the OS. Each repository maps to a predictable subdomain: any repo named `blackroad-os-XYZ` should use `xyz.blackroad.systems`.

### Core and Environment Entrypoints
- `blackroad.systems` / `os.blackroad.systems` – OS router and default landing
- `master.blackroad.systems` – `blackroad-os-master`
- `core.blackroad.systems` – `blackroad-os-core`
- `dev.blackroad.systems` / `stg.blackroad.systems` / `sandbox.blackroad.systems` – environment routers (pair with wildcards)

### Repository Mappings
- `web.blackroad.systems` – `blackroad-os-web`
- `home.blackroad.systems` – `blackroad-os-home`
- `console.blackroad.systems` / `prism.blackroad.systems` – `blackroad-os-prism-console`
- `api.blackroad.systems` – `blackroad-os-api-gateway`
- `services.blackroad.systems` – `blackroad-os-api`
- `agents.blackroad.systems` – `blackroad-os-agents`
- `operator.blackroad.systems` / `ops.blackroad.systems` – `blackroad-os-operator`
- `infra.blackroad.systems` – `blackroad-os-infra`
- `devops.blackroad.systems` – `blackroad-os-pack-infra-devops`
- `beacon.blackroad.systems` / `status.blackroad.systems` – `blackroad-os-beacon`
- `archive.blackroad.systems` – `blackroad-os-archive`
- `brand.blackroad.systems` – `blackroad-os-brand`
- `docs.blackroad.systems` – `blackroad-os-docs`
- `demo.blackroad.systems` – `blackroad-os-demo`
- `research.blackroad.systems` – `blackroad-os-research`
- `lab.blackroad.systems` – `blackroad-os-pack-research-lab`
- `ideas.blackroad.systems` – `blackroad-os-ideas`
- `finance.blackroad.systems` – `blackroad-os-pack-finance`
- `education.blackroad.systems` – `blackroad-os-pack-education`
- `studio.blackroad.systems` – `blackroad-os-pack-creator-studio`
- `legal.blackroad.systems` – `blackroad-os-pack-legal`

### Reserved for Future Repos
- `roadchain.blackroad.systems`
- `ledger.blackroad.systems`
- `audit.blackroad.systems`
- `compliance.blackroad.systems`
- `identity.blackroad.systems` / `id.blackroad.systems`
- `metrics.blackroad.systems`
- `logs.blackroad.systems`
- `events.blackroad.systems`
- `worker.blackroad.systems`
- `queue.blackroad.systems`

## Domain-by-Domain Map
Each domain inherits the universal set above unless noted. External-facing domains typically CNAME into the OS spine.

### `blackroad.io` (public OS front door)
- Root: `blackroad.io` / `www.blackroad.io` → `web.blackroad.systems`
- `app.blackroad.io` → `home.blackroad.systems`
- `console.blackroad.io` / `portal.blackroad.io` → `console.blackroad.systems`
- `api.blackroad.io` → `api.blackroad.systems`
- `docs.blackroad.io` → `docs.blackroad.systems`
- `status.blackroad.io` → `status.blackroad.systems`
- `demo.blackroad.io` → `demo.blackroad.systems`
- Product packs → corresponding OS subs (finance, education, studio, legal, research, lab)

### `blackroad.systems` (OS spine)
- Use environment wildcards: `*.dev.blackroad.systems`, `*.stg.blackroad.systems`, `*.sandbox.blackroad.systems`
- Examples: `console.dev.blackroad.systems`, `api.stg.blackroad.systems`, `agents.sandbox.blackroad.systems`

### `blackroadinc.us` (corporate/compliance)
- Root: `blackroadinc.us` / `www.blackroadinc.us`
- `corp` – internal corp portal
- `legal` – policies, terms, compliance center
- `investor` – investor relations
- `careers` – jobs
- `portal` – customer/partner contracts and billing
- `status` – optional corp status mirror
- `docs` – compliance/legal docs
- `mail`, `admin` – email and admin entrypoints

### `blackroad.me` (personal)
- Root: `blackroad.me` / `www.blackroad.me`
- `app` – personal dashboard
- `lab` – personal experiments (may point to `lab.blackroad.systems`)
- `notes` – personal notes/wiki
- `journal` – writing space
- `status` – optional personal status/now page

### `blackroad.network` (infra/mesh)
- Root: `blackroad.network` / `www.blackroad.network`
- Aliases into OS: `os`, `agents`, `beacon`, `archive`
- `api` – alternative API host for infra/mesh
- `vpn` – mesh/VPN entry
- `metrics`, `logs`, `status` – observability and infra status

### `blackroadai.com` (AI flagship)
- Root: `blackroadai.com` / `www.blackroadai.com`
- `app` – AI workspace
- `api` – AI API (CNAME to `api.blackroad.systems`)
- `console` – admin/dev console
- `docs` – AI API docs
- `studio` – creator tools / Lucidia-style UI
- `research` – R&D blog/papers
- `status` – product status

### `aliceqi.com` (Alice/QI persona)
- Root: `aliceqi.com` / `www.aliceqi.com`
- `app` – Alice app surface (can route into Lucidia/OS)
- `portal` – Alice-specific tools
- `lab` – QI playground
- `api` – optional Alice API

### QI Domains: `blackroadqi.com` and `lucidiaqi.com`
- `blackroadqi.com` / `www.blackroadqi.com` – QI marketing
  - `app`, `api`, `console`, `lab`, `docs`, `status`
- `lucidiaqi.com` / `www.lucidiaqi.com` – Lucidia-flavored QI landing
  - `app`, `api`, `lab`, `docs`

### Quantum Cluster: `blackroadquantum.*`
Use `.com` as primary; others as alternates or specialized surfaces.

- `blackroadquantum.com` / `www` – quantum product hub
  - `app`, `api`, `lab`, `research`, `docs`, `status`
- `blackroadquantum.info` / `www` – educational/explainer
  - `docs`, `education`
- `blackroadquantum.net` / `www` – network-oriented view
  - `api`, `status`, `metrics`
- `blackroadquantum.shop` and `blackroadquantum.store` / `www` – commerce
  - `shop`, `checkout`, `cdn`

### Lucidia: `lucidia.earth` and `lucidia.studio`
- `lucidia.earth` / `www` – Lucidia main landing
  - `app` (→ `home.blackroad.systems`), `console`, `chat`, `agents`, `lab`, `research`, `docs`
- `lucidia.studio` / `www` – creative/brand studio
  - `studio` (→ `studio.blackroad.systems`), `editor`, `brand`, `kit`, `assets`, `cdn`, `docs`

## Operational Notes
- Prefer CNAMEs from public/product domains into the `*.blackroad.systems` spine for easier infra changes.
- Keep certificates wildcarded per domain where possible to simplify host onboarding.
- When adding a new repo, default to `blackroad-os-XYZ` + `xyz.blackroad.systems`, and optionally mirror to `blackroad.io` or other public domains based on audience.
