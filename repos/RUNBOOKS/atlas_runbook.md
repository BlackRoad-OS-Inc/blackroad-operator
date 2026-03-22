# Atlas Runbook for BlackRoad Ecosystem

This runbook provides a set of well-defined prompts for Atlas, an ops orchestrator. Use these prompts to automate setup and deployment tasks across multiple services: GitHub, Vercel, DNS (Cloudflare or GoDaddy), Microsoft 365, DigitalOcean, Hugging Face, and deployment verification.

## Connector prerequisites & fallbacks

Atlas can only drive services that are connected through the agent layer. Before running any prompts, confirm which connectors are active and wire up the missing ones:

| Service | Required credential / connector | Notes |
| --- | --- | --- |
| DigitalOcean | `DO_API_TOKEN` (Personal access token with read/write on droplets, VPC, databases, spaces) | Store in Atlas secrets vault and GitHub repository secrets used by Atlas. |
| GoDaddy | GoDaddy Production API key/secret | Needed when DNS remains at GoDaddy. Cloudflare-only setups can skip this. |
| Vercel | `VERCEL_TOKEN` (team scope) | Required for project provisioning and deployments. |
| Hugging Face | `HUGGINGFACE_TOKEN` (write scope) | Used for repository and Spaces automation. |

If a connector is missing, Atlas will acknowledge the gap but cannot execute related prompts. Use the manual fallbacks below until the connector is added.

### Manual heartbeat checklist (fallback when connectors are offline)

Run these commands from an operator workstation or the Atlas shell to capture the same insights the prompts provide:

- **Deployments (Vercel projects `blackroad-prism-console`, `lucidia`):**
  ```bash
  vercel projects ls | grep -E 'blackroad-prism-console|lucidia'
  vercel deployments ls blackroad-prism-console --limit 5
  vercel deployments ls lucidia --limit 5
  ```
- **DigitalOcean droplets:**
  ```bash
  doctl compute droplet list
  for droplet in $(doctl compute droplet list --format ID --no-header); do
    echo "=== $droplet ==="
    doctl compute droplet get "$droplet" --format Name,PublicIPv4,Status,Memory,Disk
    ssh root@$(doctl compute droplet get "$droplet" --format PublicIPv4 --no-header) 'uptime'
  done
  ```
- **GoDaddy DNS propagation:**
  ```bash
  for domain in blackroad.io lucidia.earth lucidia.studio; do
    echo "== $domain =="
    dig +nocmd $domain +multiline +noall +answer
    dig +short TXT _dmarc.$domain
  done
  ```
- **Compliance sync (GitHub → DigitalOcean → Vercel → Hugging Face):**
  ```bash
  gh repo view blackboxprogramming/blackroad-prism-console --web
  doctl -o json compute droplet list
  vercel env ls blackroad-prism-console
  huggingface-cli whoami --token $HUGGINGFACE_TOKEN
  ```

Document the results in the ops log (Notion or Runbooks) so the automated heartbeat history remains unbroken.

## 0) Secrets & Guardrails

**Prompt — `ATLAS_INIT_SECRETS`**

You are Atlas, an infra orchestrator. Load and mask these secrets for this session only:
- `GITHUB_TOKEN`
- `VERCEL_TOKEN`
- `DO_API_TOKEN`        # DigitalOcean
- `HUGGINGFACE_TOKEN`
- `CF_API_TOKEN`        # (if using Cloudflare DNS)
- `CF_ACCOUNT_ID`
- `M365_TENANT`         # e.g., blackroad.onmicrosoft.com

Rules: never print full tokens, redact to 4 trailing chars in logs. Confirm which are present and which are missing.

## 1) GitHub (Monorepo + CI)

**Prompt — `ATLAS_GITHUB_BOOTSTRAP`**

Goal: host the "blackroad-web-starter" monorepo and wire CI.

Steps:
1. Create private repo: `blackroad-web`.
2. Push local contents (`main` branch). If not local, init a blank repo with README.
3. Protect main: require PR, 1 approval, passing CI.
4. Add Actions workflow: `pnpm install` → `turbo build` on PRs and main.
5. Save repo secrets: `VERCEL_TOKEN`, `DO_API_TOKEN`, `HUGGINGFACE_TOKEN` (masked).

Output:
- repo URL
- branch protection status
- CI run URL and status

## 2) Vercel (10 Projects + Domains)

**Prompt — `ATLAS_VERCEL_PROJECTS`**

Goal: create one Vercel project per app in `apps/*` and bind domains.

Map:
- core       → `apps/blackroad-network`    → `blackroad.network`
- infra      → `apps/blackroad-systems`    → `blackroad.systems`
- id         → `apps/blackroad-me`         → `blackroad.me`
- api        → `apps/blackroadai-com`      → `blackroadai.com`
- qi         → `apps/blackroadqi-com`      → `blackroadqi.com`
- lab        → `apps/blackroadquantum-com` → `blackroadquantum.com`
- campus     → `apps/lucidia-earth`        → `lucidia.earth`
- studio     → `apps/lucidia-studio`       → `lucidia.studio`
- persona-a  → `apps/aliceqi-com`          → `aliceqi.com`
- persona-b  → `apps/lucidiaqi-com`        → `lucidiaqi.com`

Build: `next build`  |  Dev: `next dev`  |  Output: `.next`

Return:
- project → domain(s) → required DNS verification (TXT/CNAME) → Vercel target (e.g., `cname.vercel-dns.com`)

## 3A) DNS via Cloudflare (Recommended)

**Prompt — `ATLAS_DNS_CLOUDFLARE`**

Goal: put all domains behind Cloudflare DNS and wire Vercel + M365.

Domains: `blackroad.network`, `blackroad.systems`, `blackroad.me`, `blackroadai.com`, `blackroadqi.com`, `blackroadquantum.com`, `lucidia.earth`, `lucidia.studio`, `aliceqi.com`, `lucidiaqi.com`

Tasks:
1. Create/confirm zones in Cloudflare (account: `CF_ACCOUNT_ID`).
2. Nameserver switch instructions for GoDaddy (registrar): list new NS per domain.
3. Add records for each domain:
   - APEX CNAME → Vercel target
   - `www` CNAME → Vercel target
   - MX (prio 0) → `${M365_TENANT}.mail.protection.outlook.com`
   - SPF TXT → `v=spf1 include:spf.protection.outlook.com -all`
   - DMARC TXT (`_dmarc`) → `v=DMARC1; p=quarantine; rua=mailto:dmarc@<domain>; ruf=mailto:dmarc@<domain>; aspf=s; adkim=s; fo=1`
   - DKIM CNAMEs: fetch from M365 admin (selector1/selector2) and add.
4. Set orange-cloud proxy on web records, DNS-only on mail/DKIM/DMARC.
5. Validate with `dig`: APEX, `www`, MX, SPF, DMARC, DKIM.

Output: a table per domain showing ✅/❌ for NS, apex, www, MX, SPF, DMARC, DKIM.

## 3B) DNS Staying on GoDaddy (If Not Using Cloudflare)

**Prompt — `ATLAS_DNS_GODADDY`**

Use GoDaddy DNS. Create/confirm for each domain:
- APEX CNAME → Vercel target
- `www` CNAME → Vercel target
- MX/SPF/DMARC/DKIM as above

Verify with `dig`. Return status table.

## 4) Microsoft 365 Mailboxes

**Prompt — `ATLAS_M365_BASELINE`**

Create mailboxes/aliases:

- `blackroad.network`: hello@, admin@, security@, careers@, billing@, ops@, dmarc@
- `blackroadai.com`: api@, sales@, support@
- `blackroadqi.com`: lab@, research@
- `blackroadquantum.com`: papers@, demos@
- `lucidia.earth`: community@, studio@, learn@
- `lucidia.studio`: hello@, classes@
- `aliceqi.com`: alexa@, press@
- `lucidiaqi.com`: portal@

Enable DKIM per domain; confirm SPF hard-fail (`-all`); DMARC alignment ≥ 95% over test messages.
Output: CSV mailbox list + DKIM host/value pairs.

## 5) DigitalOcean (Droplet + Managed DB + Spaces)

**Prompt — `ATLAS_DO_FOUNDATION`**

Goal: utility compute + data services.

**Compute:**
- Create Ubuntu 22.04 droplet: 2vCPU, 4GB, 80GB SSD, SFO or NYC.
- Add my public SSH key, disable password auth, UFW allow 22,80,443.
- Install: Docker, docker-compose, nginx, certbot.
- Create system user `blackroad`.

**Data:**
- Managed Postgres (dbaas): `basic-1`, 1 node.
- Spaces bucket: `blackroad-public` (CDN on).
- Private VPC for droplet + DB.

Output:
- droplet IP, SSH user
- DB connection string (mask password)
- Spaces endpoint + keys (mask)
- Nginx reverse-proxy sample pointing to any internal apps if we choose to self-host.

Security: do **not** print full secrets; store to GitHub repo secrets and return names only.

## 6) Hugging Face (Org + Spaces Demos)

**Prompt — `ATLAS_HF_ORG_SPACES`**

Create/confirm org: `BlackRoad`.

Repos:
- `models/blackroad-embeddings` (empty scaffold, README, license)
- `datasets/blackroad-benchmarks`

Spaces (Gradio):
- `spaces/blackroad-lab`  → link in `blackroadquantum.com` “Demos”
- `spaces/lucidia-sketch` → link in `lucidia.studio` “Try it”

Set secrets in Spaces if needed; produce public URLs. Add HF badges to the repos’ READMEs.

## 7) Deploy + Verify All Sites

**Prompt — `ATLAS_DEPLOY_VERIFY`**

Trigger Vercel builds for all 10 projects.

When live, check each domain for:
- HTTPS ok, `www`→apex redirect
- `/status` and `/healthz` return 200
- `/privacy` and `/terms` present
- Home hero renders without blocking resources (CSP ok)

Return a checklist (✅/❌) with failing URLs if any.

## 8) Ops Hygiene (Nice-to-Have)

**Prompt — `ATLAS_OPS_BASELINE`**

- Add basic uptime monitors for all domains (`/status`) using Better Stack or DigitalOcean uptime.
- Set weekly backups: DO droplet and managed Postgres.
- Export DNS zone JSON/YAML snapshot to repo (non-secrets).
- Create `status.badge` in each README linking to `/status`.

Return links to dashboards and backup policies.

## Quick One-Liner Prompts

Use these condensed commands when you just need to perform specific tasks without quoting the full prompt:

- GitHub Setup: “Atlas, bootstrap GitHub for the monorepo and wire CI. Return repo + CI link.”
- Vercel Projects: “Atlas, create Vercel projects for each app and bind domains. Give me the CNAME targets.”
- DNS & M365: “Atlas, point DNS (GoDaddy→Cloudflare) to Vercel and add M365 MX/SPF/DKIM/DMARC. Return a pass/fail table.”
- DigitalOcean Foundation: “Atlas, spin a DigitalOcean droplet + Postgres + Spaces, lock it down, and store secrets in GitHub.”
- Hugging Face: “Atlas, create Hugging Face org + Spaces for demos and link them from the research site.”
- Deployment Verification: “Atlas, deploy and verify all 10 domains; send a ✅/❌ checklist.”

Keep this runbook in your repository for reference whenever you need to automate infrastructure tasks through Atlas.
