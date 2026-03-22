# 🚂 Railway Deployment Scripts

Automated deployment scripts for all 14 BlackRoad OS Railway projects.

---

## 📋 Available Scripts

### 1. Deploy Individual Project
```bash
./scripts/deploy-railway-project.sh <project_number>
```

**Examples:**
```bash
./scripts/deploy-railway-project.sh 01  # RoadWork Production
./scripts/deploy-railway-project.sh 03  # BlackRoad Core
./scripts/deploy-railway-project.sh 04  # BlackRoad Operator
```

**What it does:**
- Links to Railway project
- Adds required databases (PostgreSQL/Redis)
- Deploys service(s)
- Shows manual steps if needed

---

### 2. Deploy All Projects
```bash
./scripts/deploy-railway-all.sh
```

**What it does:**
- Deploys all 14 projects in recommended order
- Prompts between phases
- Skips optional services
- Shows cost summary

**Deployment phases:**
1. **Phase 1:** Core Infrastructure (Projects 01, 03)
2. **Phase 2:** Control Plane (Projects 04, 05, 06)
3. **Phase 3:** Domain Packs (Project 07)
4. **Phase 4:** Staging & Dashboards (Projects 02, 08, 09)

---

### 3. Set Environment Variables
```bash
./scripts/set-env-vars.sh <project_number>
```

**Examples:**
```bash
./scripts/set-env-vars.sh 01  # Set RoadWork API keys
./scripts/set-env-vars.sh 04  # Set Operator API keys
```

**What it does:**
- Links to Railway project
- Loads variables from `.env.local` (if exists)
- Prompts for required keys
- Sets all variables via Railway CLI

**For RoadWork (Projects 01, 02):**
```bash
# Create .env.local first
cp roadwork/.env.example roadwork/.env.local
# Edit with your API keys
vim roadwork/.env.local

# Then run script
./scripts/set-env-vars.sh 01
```

---

### 4. Check Service Health
```bash
./scripts/check-health.sh
```

**What it does:**
- Checks `/health` endpoint for all services
- Shows status (✅ Healthy / ❌ Unhealthy)
- Summary report

**Example output:**
```
Checking RoadWork API... ✅ Healthy
Checking Core Service... ✅ Healthy
Checking Operator... ❌ Not deployed
```

---

## 🚀 Quick Start

### Deploy RoadWork Production Only

```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Deploy project
./scripts/deploy-railway-project.sh 01

# 3. Set environment variables
cp roadwork/.env.example roadwork/.env.local
# Edit .env.local with your API keys
./scripts/set-env-vars.sh 01

# 4. Check health
./scripts/check-health.sh
```

---

### Deploy Full BlackRoad OS Ecosystem

```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Deploy all projects (interactive)
./scripts/deploy-railway-all.sh

# 3. Set variables for each project
./scripts/set-env-vars.sh 01  # RoadWork
./scripts/set-env-vars.sh 04  # Operator
./scripts/set-env-vars.sh 07  # Packs
# etc.

# 4. Check all services
./scripts/check-health.sh
```

---

## 📚 Script Details

### deploy-railway-project.sh

**Supported Projects:**
- `01` - RoadWork Production (API + Worker + Beat + DB + Redis)
- `02` - RoadWork Staging (API + DB + Redis)
- `03` - BlackRoad Core Services (Core + Core API + DB + Redis)
- `04` - BlackRoad Operator (Operator + DB)
- `05` - BlackRoad Master (Master + DB)
- `06` - BlackRoad Beacon (Beacon + Redis)
- `07` - BlackRoad Packs (5 pack services + DB)
- `08` - Prism Console (recommends Cloudflare Pages)
- `09` - BlackRoad Home (recommends Cloudflare Pages)
- `10-14` - Available for future use

**Exit codes:**
- `0` - Success
- `1` - Error (invalid project number, deployment failed)

---

### set-env-vars.sh

**Supports:**
- RoadWork (01, 02) - Loads from `.env.local`
- Core (03) - Basic variables
- Operator (04) - Prompts for API keys
- Master (05) - Basic variables
- Beacon (06) - Optional monitoring URLs
- Packs (07) - Prompts for API keys

**Required files:**
- `roadwork/.env.local` - For RoadWork projects (copy from `.env.example`)

**Variables set:**
- API keys (Anthropic, OpenAI, SendGrid, Stripe, Google)
- Secrets (JWT, Fernet)
- URLs (API_URL, FRONTEND_URL)
- Environment (production/staging)
- Rate limits
- Monitoring (Sentry)

---

### check-health.sh

**Checks:**
- RoadWork API (`/health`)
- RoadWork Staging (`/health`)
- Core Service (`/health`)
- Operator (`/health`)
- Master (`/health`)
- Beacon (`/health`)

**Update URLs after deployment:**
Edit the `SERVICES` array in `check-health.sh` with your actual Railway URLs.

---

## 🔐 Environment Variables

### Required API Keys

Get these before deploying:

**AI Services:**
- `ANTHROPIC_API_KEY` - https://console.anthropic.com
- `OPENAI_API_KEY` - https://platform.openai.com

**Email:**
- `SENDGRID_API_KEY` - https://app.sendgrid.com
- `SENDGRID_FROM_EMAIL` - Verified sender

**Payment:**
- `STRIPE_SECRET_KEY` - https://dashboard.stripe.com
- `STRIPE_PUBLISHABLE_KEY` - https://dashboard.stripe.com
- `STRIPE_WEBHOOK_SECRET` - Create webhook first

**Google:**
- `GOOGLE_CLIENT_ID` - https://console.cloud.google.com
- `GOOGLE_CLIENT_SECRET` - https://console.cloud.google.com

**Monitoring:**
- `SENTRY_DSN` - https://sentry.io

**Generate secrets:**
```bash
# JWT Secret
openssl rand -hex 32

# Fernet Key
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

## 💰 Cost Estimates

**Per Project:**
- Project 01: $30/month (5 services)
- Project 02: $15/month (3 services)
- Project 03: $20/month (4 services)
- Project 04: $10/month (2 services)
- Project 05: $10/month (2 services)
- Project 06: $8/month (2 services)
- Project 07: $20/month (6 services)
- Project 08: $5/month or $0 (Cloudflare Pages)
- Project 09: $5/month or $0 (Cloudflare Pages)

**Total: $113-123/month**

**Recommended start: $30/month (Project 01 only)**

---

## 🚨 Troubleshooting

### Script Permission Denied
```bash
chmod +x scripts/*.sh
```

### Railway CLI Not Found
```bash
npm install -g @railway/cli
railway login
```

### Deployment Fails
```bash
# Check logs
railway logs -f

# Verify environment
railway variables

# Redeploy
railway up --detach
```

### Health Check Fails
```bash
# Check service status
railway status

# View logs
railway logs -f

# Test manually
curl https://your-service.up.railway.app/health
```

---

## 📚 Related Documentation

- **RAILWAY_PROJECT_CONFIGURATION.md** - Complete configuration guide
- **RAILWAY_INFRASTRUCTURE.md** - All project IDs
- **RAILWAY_SERVICES_INVENTORY.md** - Services catalog
- **roadwork/DEPLOYMENT_STATUS.md** - RoadWork checklist

---

## 📞 Support

**Railway:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

**BlackRoad:**
- Email: blackroad.systems@gmail.com
- Primary: blackroad@gmail.com

---

**Happy deploying!** 🚀
