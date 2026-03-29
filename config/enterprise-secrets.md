# BlackRoad Enterprise Secrets Configuration
**Updated:** 2026-03-29
**Status:** Cloudflare deployed, GitHub org needs admin:org scope

---

## Secrets Registry (18 keys)

### Payment — Stripe (LIVE)
- `STRIPE_SECRET_KEY` — sk_live_51S70Z...
- `STRIPE_PUBLISHABLE_KEY` — pk_live_51S70Z...
- `STRIPE_PRICE_ID` — price_1TG8dW3e5FMFdlFwqeoU1gzs ($1 homework solve)
- `STRIPE_WEBHOOK_SECRET` — whsec_... (tutor.blackroad.io/webhook/stripe)
- `STRIPE_PRODUCT_ID` — prod_UEbr2LgQbasjm9

### Auth — Clerk
- `CLERK_SECRET_KEY` — sk_test_hJMM...
- `CLERK_PUBLISHABLE_KEY` — pk_test_ZGVh...
- `CLERK_FRONTEND_API` — https://dear-vulture-2.clerk.accounts.dev

### AI — Hugging Face
- `HF_TOKEN` — hf_dyir...

### Blockchain — Coinbase
- `COINBASE_PROJECT_ID` — cdd19041-797e-48bc-9e86-d7019f0786ff
- `COINBASE_WALLET_ID` — cebac1ca-c79b-44ef-aca2-8595c082fb30
- `COINBASE_PRIVATE_KEY` — (stored in .env.secrets only)

### Agent — Base44
- `BASE44_API_KEY` — c28cca...
- `BASE44_AGENT_ID` — 69c88d2bf3936f63eaf9d287

### Deploy — Railway
- `RAILWAY_PROJECT_ID` — c527106d-3519-49e0-8934-ccd5edc31f9c

### Deploy — Vercel
- `VERCEL_USER_ID` — L3xLLkuAJuw0hgzUyTyQ8KWN

### Registry — npm
- `NPM_TOKEN` — npm_Imz2... (authenticated as blackboxprogramming)

---

## Deployment Matrix

| Secret | CF Workers | GitHub Org | Local |
|---|---|---|---|
| STRIPE_SECRET_KEY | 5 workers | PENDING (need admin:org) | .env.secrets |
| CLERK_SECRET_KEY | 8 workers | PENDING | .env.secrets |
| HF_TOKEN | 4 workers | PENDING | .env.secrets |
| COINBASE_PROJECT_ID | 4 workers | PENDING | .env.secrets |
| BASE44_API_KEY | 4 workers | PENDING | .env.secrets |
| NPM_TOKEN | — | PENDING | ~/.npmrc |
| RAILWAY_PROJECT_ID | — | PENDING | .env.secrets |
| VERCEL_USER_ID | — | PENDING | .env.secrets |

## To complete GitHub org deployment:
```bash
gh auth refresh -h github.com -s admin:org
# Then run: bash ~/blackroad-operator/scripts/deploy-enterprise-secrets.sh
```

## Org hierarchy for secret propagation:
```
BlackRoad-OS-Inc (HQ — all secrets, visibility=all)
  └── BlackRoad-OS (inherits)
       └── 15 sub-orgs (inherit from OS-Inc)
```
