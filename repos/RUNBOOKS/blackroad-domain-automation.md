# BlackRoad Domain Automation Runbook

_Last updated: 2025-XX-XX_

## Purpose

This runbook bundles the Codex prompt kits for automating DNS, email, app routing, mailboxes, subdomains, CI/CD, and baseline security for the BlackRoad constellation of domains. Use it to hand tasks to infra agents without rewriting specifications.

### Domain Inventory

- `blackroad.network`
- `blackroad.systems`
- `blackroad.me`
- `blackroadai.com`
- `blackroadqi.com`
- `blackroadquantum.com`
- `lucidia.earth`
- `lucidia.studio`
- `aliceqi.com`
- `lucidiaqi.com`

> **Note:** All domains are registered at GoDaddy. DNS authority is moved to Cloudflare, and Microsoft 365 provides email. Substitute `<tenant>` with the Microsoft 365 tenant hostname (e.g., `blackroad-net.mail.protection.outlook.com`). Create or share a `dmarc@<domain>` mailbox for aggregate/forensic reports.

---

## 1. DNS + Email Bootstrap (GoDaddy → Cloudflare/M365)

**Codex Prompt — `DNS + Email Bootstrap`**

```
You are an infra engineer. Apply the following DNS plan.
Registrars: GoDaddy (all domains)
DNS Hosting: Cloudflare (authoritative)
Email: Microsoft 365 (Exchange Online)
Domains:
  - blackroad.network
  - blackroad.systems
  - blackroad.me
  - blackroadai.com
  - blackroadqi.com
  - blackroadquantum.com
  - lucidia.earth
  - lucidia.studio
  - aliceqi.com
  - lucidiaqi.com

For EACH domain:
1) Cloudflare zone: create and import existing DNS from GoDaddy; set Cloudflare as nameservers.
2) Root and www routing:
   - APEX → host app default (Vercel) via CNAME to `cname.vercel-dns.com` (or the Vercel-provided target).
   - www → CNAME to the same Vercel target.
3) Email (Microsoft 365):
   - MX: `0 <tenant>.mail.protection.outlook.com`
   - SPF (TXT @): `v=spf1 include:spf.protection.outlook.com -all`
   - DKIM: enable in M365 admin, add 2 CNAMEs returned by M365 (selector1/selector2).
   - DMARC (TXT _dmarc): `v=DMARC1; p=quarantine; rua=mailto:dmarc@<domain>; ruf=mailto:dmarc@<domain>; fo=1; sp=quarantine; aspf=s; adkim=s`
4) Security:
   - TLS-only (HTTPS redirect), HSTS preload off initially, on after validation.
   - Cloudflare proxied orange-cloud for public hosts; DNS-only for MX/DKIM/DMARC.
5) Utility records (per domain):
   - `_github-challenge-<org>` TXT (if GitHub pages/verification needed)
   - `_acme-challenge` TXT wildcard ready for Let’s Encrypt if not using Vercel auto
6) Verification:
   - Output `dig +short` checks for APEX, www, MX, SPF, DKIM, DMARC for each domain.
   - Report any propagation or CAA conflicts; set CAA if needed:
     `CAA 0 issue "letsencrypt.org"`
     `CAA 0 issuewild "letsencrypt.org"`
```

---

## 2. Multi-domain App Routing

Choose the Vercel or self-hosted Nginx plan depending on the deployment target.

### Codex Prompt — `Multi-Domain Router (Vercel)`

```
You are a Vercel engineer. Configure one monorepo with these projects and domains:

Projects:
- core-app (Next.js): blackroad.network (apex + www), blackroad.systems/docs
- research (Next.js): blackroadquantum.com, blackroadqi.com, blackroadai.com
- campus (Next.js): lucidia.earth, lucidia.studio
- persona (Next.js): aliceqi.com, lucidiaqi.com

Steps:
1) For each project, add domains in Vercel -> Settings -> Domains.
2) In each Next.js project, add `vercel.json`:
   {
     "rewrites": [
       { "source": "/docs/:path*", "destination": "/api/docs?path=:path" }
     ],
     "headers": [
       { "source": "/(.*)", "headers": [{ "key": "X-Frame-Options", "value": "DENY" }] }
     ]
   }
3) Environment variables per project:
   - ORG_NAME=BlackRoad
   - PRIMARY_DOMAIN=<project domain>
   - EMAIL_FROM="noreply@<project domain>"
   - NEXTAUTH_URL=https://<project domain> (if auth)
4) Add domain verification TXT if prompted by Vercel and confirm DNS.
5) Output a summary: project → bound domains, CNAME targets, and HTTPS status.
```

### Codex Prompt — `Multi-Domain Router (Nginx, optional self-host)`

```
Create an Nginx config that routes based on Host header:

server_names:
  blackroad.network -> proxy_pass http://core-app:3000
  blackroad.systems -> proxy_pass http://core-app:3000/docs
  blackroadai.com, blackroadqi.com, blackroadquantum.com -> proxy_pass http://research:3001
  lucidia.earth, lucidia.studio -> proxy_pass http://campus:3002
  aliceqi.com, lucidiaqi.com -> proxy_pass http://persona:3003

Include:
- automatic HTTPS via certbot nginx plugin with separate certificates per domain
- HTTP → HTTPS redirect
- HSTS max-age=31536000 includeSubDomains preload (commented initially)
- Rate limits: 200r/m per IP on /api/*
- Security headers (CSP default-src 'self'; frame-ancestors 'none'; referrer-policy same-origin)

Output a ready-to-run `/etc/nginx/sites-available/blackroad.conf` and symlink command.
```

---

## 3. Microsoft 365 Mailboxes & Aliases

**Codex Prompt — `Mailbox + Alias Setup`**

```
In Microsoft 365:
Create shared mailboxes and aliases:

Domains → blackroad.network
- hello@, admin@, security@, billing@, careers@, ops@
Domains → blackroadquantum.com
- research@, papers@, lab@
Domains → lucidia.earth
- studio@, learn@, community@
Domains → aliceqi.com
- alexa@, press@

Catch-all (transport rule): if recipient not found and domain in {blackroad.network, lucidia.earth, blackroadquantum.com, aliceqi.com, lucidiaqi.com}, redirect to catchall@blackroad.network.

Enable DKIM per domain; enforce SPF hard-fail (-all).
Create DMARC reports to dmarc@<domain> and external aggregator (optional).
Return a CSV of created mailboxes + aliases.
```

---

## 4. Agents & Services Subdomain Map

**Codex Prompt — `Agents & Services Subdomain Plan`**

```
Define and create the following subdomains in Cloudflare DNS with proxied CNAMEs to Vercel/Nginx targets:

blackroad.network
- api.blackroad.network
- app.blackroad.network
- id.blackroad.network (OIDC/Keycloak or Clerk)
- status.blackroad.network (Statuspage/BetterStack)
- docs.blackroad.network (Docusaurus)

blackroadquantum.com
- lab.blackroadquantum.com (internal R&D)
- data.blackroadquantum.com (object store or LakeFS)
- zk.blackroadquantum.com (zkVM demos)

lucidia.earth
- city.lucidia.earth (campus map)
- studio.lucidia.earth (creator tools)
- learn.lucidia.earth (courses)

aliceqi.com
- journal.aliceqi.com
- hub.aliceqi.com

lucidiaqi.com
- portal.lucidiaqi.com (persona/agent portal)

Create records and output a table: host, type, target, proxied, TTL.
```

---

## 5. CI/CD + Preview Links

**Codex Prompt — `GitHub → Vercel CI/CD`**

```
Set up GitHub repos (monorepo or multi-repo). For each project:
- GitHub → install Vercel app, connect repo.
- Branch preview domains pattern: <branch>--<project>.vercel.app
- Env var sync from Vercel to GitHub Actions (if needed).
- Protect main with required checks: build, tests, Lighthouse ≥ 85.
Output: list of repos, connected Vercel projects, preview URL patterns.
```

---

## 6. Security & Telemetry Baseline

**Codex Prompt — `Security + Telemetry Baseline`**

```
Across all apps, enable:
- CSP, XFO, Referrer-Policy, Permissions-Policy headers
- Structured audit logs (JSON) to a central sink (e.g., Loki)
- Request IDs (traceparent), error sampling (Sentry)
- Privacy page per domain at /privacy, Terms at /terms
Return code snippets (Next.js middleware or Nginx) and a checklist per domain.
```

---

## How to Use This Runbook

1. Pick the relevant prompt and paste it into Codex/Copilot when delegating to an automation agent.
2. Pair with the Terraform and JSON stubs in `infra/cloudflare/` to keep DNS records source-controlled.
3. Track outputs (dig checks, CSVs, tables) in the incident or change ticket for traceability.
4. Once DNS propagates and mail is validated, enable HSTS preload and tighten DMARC policies as needed.

**Contacts:** Platform Engineering for Cloudflare/M365 admin rights, Creative Ops for lucidia.* content, and R&D for blackroadquantum.* environments.
