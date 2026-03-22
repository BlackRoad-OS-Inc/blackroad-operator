# Cloudflare Redirects

## blackroad.io

- Redirect: / → /platform
- HTTP Status: 302
- Owner: Cloudflare Redirect Rule
- Defined in: Cloudflare Dashboard
- Notes: Active edge redirect, overrides DNS, Workers, and origin

## Planned Ownership Change

- Target: blackroad.io
- Desired Redirect: https://github.com/BlackRoad-OS
- New Owner: Cloudflare Worker (blackroad-redirect)
- Source of Truth: repos/blackroad-redirect/src/index.ts
- Status: Pending cutover
