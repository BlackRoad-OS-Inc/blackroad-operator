# CONNECTING

**Source:** google-docs

---

Yes. Across all your repos/apps, we can use one canonical pattern and it will work every time as long as we fill in the colored pieces correctly.

I’ll give you a color-coded template you can reuse for any app: OS, infra, docs, Lucidia, whatever.

🎨 Color legend (super important)

🟥 Provider value – you must copy exactly from Railway / GitHub / Cloudflare.

🟦 Your chosen name – you decide it once (subdomain / app name) and reuse identically.

🟨 Verify after setup – run curl / browser / health check.

1. Global assumptions (same for every app)

These are fixed rules we’re adopting:

All domains’ nameservers = Cloudflare (GoDaddy is registrar only).

All dynamic apps = Railway behind Cloudflare.

All static sites = GitHub Pages behind Cloudflare.

Every app gets one canonical subdomain:

Example dynamic app:

🟦 APP_DOMAIN = os.blackroad.systems

🟦 APP_SUBDOMAIN = os (the part before blackroad.systems)

Example infra app:

🟦 APP_DOMAIN = infra.blackroad.systems

🟦 APP_SUBDOMAIN = infra

2. Template: “New Railway app on a subdomain”

This is the pattern you’ll use for any Railway-backed app from any repo.

Step 1 – Choose names

🟦 APP_DOMAIN = <subdomain>.blackroad.systems
e.g. os.blackroad.systems, infra.blackroad.systems, api.blackroad.systems

🟦 APP_SUBDOMAIN = <subdomain>
e.g. os, infra, api

Step 2 – Railway

In the correct Railway service:

Get the default host:

🟥 RAILWAY_HOST = whatever Railway shows, e.g.
blackroad-operating-system-production.up.railway.app

Add custom domain:

In Railway → Service → Custom Domains:

Add 🟦 APP_DOMAIN (e.g. os.blackroad.systems).

For multiple apps that share the same service, they can all point to the same 🟥 RAILWAY_HOST.

Step 3 – Cloudflare DNS (for blackroad.systems zone)

In Cloudflare → DNS → blackroad.systems:

App subdomain record:

Type: CNAME

Name: 🟦 APP_SUBDOMAIN

Target: 🟥 RAILWAY_HOST

Proxy: Proxied (orange)

Example for infra.blackroad.systems:

Name: infra 🟦

Target: blackroad-operating-system-production.up.railway.app 🟥

Optional root mapping (for OS only):
If the app is the main OS (🟦 APP_SUBDOMAIN = os):

Either:

CNAME @ → 🟥 RAILWAY_HOST (root serves OS directly), or

Keep @ as default and create a redirect rule:
hostname equals blackroad.systems → 301 → https://os.blackroad.systems.

Optional www:

Type: CNAME

Name: www

Target: blackroad.systems (or the specific app domain)

Proxy: Proxied.

Step 4 – App env vars (same pattern per repo)

In that app’s config (Railway env vars):

PUBLIC_URL = https:// + 🟦 APP_DOMAIN
(e.g. https://os.blackroad.systems)

If your framework needs host whitelists:

ALLOWED_HOSTS (or equivalent) includes:

🟦 APP_DOMAIN

localhost for dev

If you have API vs frontend:

API_BASE_URL in frontend = https://api.blackroad.systems (another app following this same pattern).

Step 5 – Verify (🟨)

For each new app:

🟨 In browser: go to https:// + 🟦 APP_DOMAIN.

🟨 In terminal (or I can approximate from here):
curl -I https://<APP_DOMAIN>

curl -s https://<APP_DOMAIN>/health || curl -s https://<APP_DOMAIN>/api/health

Expect 200 (or 3xx → 200) and real HTML/JSON, not a fallback.

3. Template: GitHub Pages app on a subdomain

Used for static docs/marketing apps (any repo).

Step 1 – Choose names

🟦 APP_DOMAIN = <subdomain>.blackroad.systems (e.g. docs.blackroad.systems)

🟦 APP_SUBDOMAIN = <subdomain> (e.g. docs)

Step 2 – GitHub Pages

In the repo that serves this static site:

Enable Pages:

Settings → Pages:

🟥 PAGES_HOST (GitHub shows it), e.g.
blackboxprogramming.github.io
or blackboxprogramming.github.io/blackroad-docs

Set custom domain:

Custom domain: 🟦 APP_DOMAIN (docs.blackroad.systems).

Step 3 – Cloudflare DNS

In Cloudflare → DNS → blackroad.systems:

Type: CNAME

Name: 🟦 APP_SUBDOMAIN

Target: 🟥 PAGES_HOST (usually user.github.io)

Proxy: DNS only (gray) is safest for Pages.

Example:

Name: docs 🟦

Target: blackboxprogramming.github.io 🟥

Step 4 – Verify (🟨)

🟨 Browser: https://docs.blackroad.systems loads your Pages site.

🟨 GitHub Pages settings show the green “Domain is verified” badge.

4. Template: Pure redirect domain (alias)

For any domain where you don’t want a separate app, just an alias.

Example: blackroad.io → https://os.blackroad.systems

Step 1 – Nameservers

In GoDaddy, set NS → the two Cloudflare ones (🟥 from Cloudflare).

Step 2 – DNS (minimal)

Leave the default A/AAAA Cloudflare creates or add a dummy A to 192.0.2.1 if needed (doesn’t matter because we’ll only redirect).

Step 3 – Cloudflare Redirect Rules

In Cloudflare → Rules → Redirect Rules:

Rule 1:

If: Hostname equals blackroad.io

Then: 301 → https://os.blackroad.systems

Optional Rule 2:

If: Hostname equals www.blackroad.io

Then: 301 → https://os.blackroad.systems

Repeat this exact pattern for:

blackroad.network

blackroadai.com

blackroadqi.com

blackroadquantum.*

lucidia.earth → maybe https://os.blackroad.systems/lucidia

lucidia.studio → maybe /studio

aliceqi.com → maybe /alice

lucidiaqi.com → maybe /lucidiaqi

(🟦 you choose those final paths, but once chosen reuse them.)

5. Putting it all together – “Color 1 / Color 2” example

Let’s do your example:

“Railway domain color 1, infra.blackroad.systems color 2”

🟥 Color 1 (provider)
RAILWAY_HOST = blackroad-operating-system-production.up.railway.app

🟦 Color 2 (your domain)
APP_DOMAIN = infra.blackroad.systems
APP_SUBDOMAIN = infra

DNS:

CNAME infra 🟦 → blackroad-operating-system-production.up.railway.app 🟥 (proxied)

Env vars:

PUBLIC_URL = https://infra.blackroad.systems 🟦

Verification:

🟨 https://infra.blackroad.systems returns the app.

6. Answering your “across all repos” question explicitly

Yes:

Every repo that ships a dynamic service follows the Railway template above.

Every repo that ships a pure static site follows the GitHub Pages template above.

Every extra domain that’s just there for branding uses the redirect template.

The only things that ever change per app/domain are:

🟥 Provider values:

RAILWAY_HOST

PAGES_HOST

Cloudflare NS pair for that zone

🟦 Your choices:

APP_SUBDOMAIN / APP_DOMAIN

Path you redirect to (/, /lucidia, /docs, etc.)

If you want, I can now take your full domain list and spit out a big color-coded matrix like:

OS → 🟦 os.blackroad.systems → 🟥 <railway-host>

Infra → 🟦 infra.blackroad.systems → 🟥 <railway-host>

Docs → 🟦 docs.blackroad.systems → 🟥 <pages-host>

that you can literally work through line-by-line.
