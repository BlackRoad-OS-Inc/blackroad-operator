# 🚂 Railway Project Configuration Guide

**Complete configuration for all 14 Railway projects**

Last Updated: 2025-12-14

---

## 🎯 Quick Deploy All Projects

```bash
# Run the automated deployment script
./scripts/deploy-railway-all.sh

# Or deploy individually
./scripts/deploy-railway-project.sh 01  # RoadWork Production
./scripts/deploy-railway-project.sh 02  # RoadWork Staging
# ... etc
```

---

## 📋 Project 01: RoadWork Production
**ID:** `9d3d2549-3778-4c86-8afd-cefceaaa74d2`
**Domain:** roadwork-production.up.railway.app
**Cost:** ~$30/month

### Services (5 total)

#### 1. PostgreSQL Database
```bash
railway link 9d3d2549-3778-4c86-8afd-cefceaaa74d2
railway add postgresql
```

**Auto-generated variables:**
- `DATABASE_URL` - Connection string (Railway auto-sets)

---

#### 2. Redis Cache
```bash
railway add redis
```

**Auto-generated variables:**
- `REDIS_URL` - Connection string (Railway auto-sets)

---

#### 3. RoadWork API (FastAPI)
```bash
cd roadwork
railway up
```

**Environment Variables:**
```bash
# AI Services
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
railway variables set OPENAI_API_KEY="sk-..."

# Email
railway variables set SENDGRID_API_KEY="SG..."
railway variables set SENDGRID_FROM_EMAIL="noreply@blackroad.io"

# Payment
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set STRIPE_PUBLISHABLE_KEY="pk_live_..."
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."

# Authentication
railway variables set JWT_SECRET_KEY="$(openssl rand -hex 32)"
railway variables set JWT_ALGORITHM="HS256"
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES="30"

# Encryption
railway variables set FERNET_KEY="$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')"

# Google OAuth
railway variables set GOOGLE_CLIENT_ID="..."
railway variables set GOOGLE_CLIENT_SECRET="..."
railway variables set GOOGLE_REDIRECT_URI="https://roadwork.blackroad.io/auth/google/callback"

# URLs
railway variables set API_URL="https://roadwork-production.up.railway.app"
railway variables set FRONTEND_URL="https://roadwork.blackroad.io"
railway variables set ENVIRONMENT="production"

# Monitoring
railway variables set SENTRY_DSN="https://...@sentry.io/..."

# Rate Limiting
railway variables set MAX_REQUESTS_PER_MINUTE="60"

# Application Limits
railway variables set FREE_TIER_DAILY_LIMIT="10"
railway variables set PRO_TIER_DAILY_LIMIT="100"
railway variables set PREMIUM_TIER_DAILY_LIMIT="1000"
```

**Start Command:** `uvicorn api.main:app --host 0.0.0.0 --port $PORT`

**Health Check:** `/health`

**After Deployment:**
```bash
# Run migrations
railway run alembic upgrade head
```

---

#### 4. RoadWork Worker (Celery)
**Create as separate service in Railway Dashboard:**

1. Click "New Service" in Project 01
2. Select "From GitHub Repo" → blackroad-sandbox
3. Set root directory: `roadwork/`
4. Set start command: `celery -A worker.celery_app worker --loglevel=info`

**Copy all environment variables from API service**

---

#### 5. RoadWork Beat (Celery Beat Scheduler)
**Create as separate service in Railway Dashboard:**

1. Click "New Service" in Project 01
2. Select "From GitHub Repo" → blackroad-sandbox
3. Set root directory: `roadwork/`
4. Set start command: `celery -A worker.celery_app beat --loglevel=info`

**Copy all environment variables from API service**

---

## 📋 Project 02: RoadWork Staging
**ID:** `6d4ab1b5-3e97-460e-bba0-4db86691c476`
**Domain:** roadwork-staging.up.railway.app
**Cost:** ~$15/month

### Services (3 total)

#### 1. PostgreSQL Database
```bash
railway link 6d4ab1b5-3e97-460e-bba0-4db86691c476
railway add postgresql
```

---

#### 2. Redis Cache
```bash
railway add redis
```

---

#### 3. RoadWork API (Staging)
```bash
cd roadwork
railway up
```

**Environment Variables:**
- Same as Production, but use staging API keys
- `ENVIRONMENT="staging"`
- `API_URL="https://roadwork-staging.up.railway.app"`
- `FRONTEND_URL="https://roadwork-staging.blackroad.io"`

---

## 📋 Project 03: BlackRoad Core Services
**ID:** `aa968fb7-ec35-4a8b-92dc-1eba70fa8478`
**Cost:** ~$20/month

### Services (4 total)

#### 1. PostgreSQL Database
```bash
railway link aa968fb7-ec35-4a8b-92dc-1eba70fa8478
railway add postgresql
```

---

#### 2. Redis Cache
```bash
railway add redis
```

---

#### 3. BlackRoad OS Core
```bash
cd /Users/alexa/blackroad-sandbox
railway up
```

**Environment Variables:**
```bash
railway variables set NODE_ENV="production"
railway variables set PORT="8080"
railway variables set DATABASE_URL="<auto-set-by-railway>"
railway variables set REDIS_URL="<auto-set-by-railway>"
```

**Start Command:** (from railway.toml)
**Health Check:** `/health`

---

#### 4. Core API
```bash
cd _personal/BlackRoad-Operating-System/services/core-api
railway up
```

**Environment Variables:**
```bash
railway variables set NODE_ENV="production"
railway variables set PORT="8080"
railway variables set CORE_SERVICE_URL="https://blackroad-os-core-production.up.railway.app"
```

**Start Command:** (from railway.toml)
**Health Check:** `/health`

---

## 📋 Project 04: BlackRoad Operator
**ID:** `e8b256aa-8708-4eb2-ba24-99eba4fe7c2e`
**Cost:** ~$10/month

### Services (2 total)

#### 1. PostgreSQL Database
```bash
railway link e8b256aa-8708-4eb2-ba24-99eba4fe7c2e
railway add postgresql
```

---

#### 2. BlackRoad OS Operator ("Cece" Agent)
```bash
cd _personal/BlackRoad-Operating-System/operator_engine
railway up
```

**Environment Variables:**
```bash
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
railway variables set OPENAI_API_KEY="sk-..."
railway variables set NODE_ENV="production"
railway variables set PORT="8080"
railway variables set CORE_SERVICE_URL="https://blackroad-os-core-production.up.railway.app"
railway variables set DATABASE_URL="<auto-set-by-railway>"
```

**Start Command:** (from railway.toml)
**Health Check:** `/health`

---

## 📋 Project 05: BlackRoad Master
**ID:** `85e6de55-fefd-4e8d-a9ec-d20c235c2551`
**Cost:** ~$10/month

### Services (2 total)

#### 1. PostgreSQL Database
```bash
railway link 85e6de55-fefd-4e8d-a9ec-d20c235c2551
railway add postgresql
```

---

#### 2. BlackRoad OS Master
```bash
cd blackroad-os-master
railway up
```

**Environment Variables:**
```bash
railway variables set NODE_ENV="production"
railway variables set PORT="8080"
railway variables set OPERATOR_URL="https://blackroad-os-operator-production.up.railway.app"
railway variables set CORE_SERVICE_URL="https://blackroad-os-core-production.up.railway.app"
railway variables set DATABASE_URL="<auto-set-by-railway>"
```

**Start Command:** (from railway.toml)
**Health Check:** `/health`

---

## 📋 Project 06: BlackRoad Beacon
**ID:** `8ac583cb-ffad-40bd-8676-6569783274d1`
**Cost:** ~$8/month

### Services (2 total)

#### 1. Redis Cache
```bash
railway link 8ac583cb-ffad-40bd-8676-6569783274d1
railway add redis
```

---

#### 2. BlackRoad OS Beacon (Health Monitoring)
```bash
cd _personal/BlackRoad-Operating-System/services/beacon
railway up
```

**Environment Variables:**
```bash
railway variables set NODE_ENV="production"
railway variables set PORT="8080"
railway variables set REDIS_URL="<auto-set-by-railway>"

# Services to monitor
railway variables set CORE_SERVICE_URL="https://blackroad-os-core-production.up.railway.app"
railway variables set OPERATOR_URL="https://blackroad-os-operator-production.up.railway.app"
railway variables set MASTER_URL="https://blackroad-os-master-production.up.railway.app"
railway variables set API_URL="https://roadwork-production.up.railway.app"

# Alerting
railway variables set SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
railway variables set ALERT_EMAIL="blackroad.systems@gmail.com"
```

**Start Command:** (from railway.toml)
**Health Check:** `/health`

---

## 📋 Project 07: BlackRoad Packs
**ID:** `b61ecd98-adb2-4788-a2e0-f98e322af53a`
**Cost:** ~$20/month

### Services (6 total)

#### 1. PostgreSQL Database
```bash
railway link b61ecd98-adb2-4788-a2e0-f98e322af53a
railway add postgresql
```

---

#### 2. Pack Finance
```bash
cd src/blackroad_core/packs/pack-finance
railway up
```

**Environment Variables:**
```bash
railway variables set PACK_NAME="pack-finance"
railway variables set PORT="8080"
railway variables set DATABASE_URL="<auto-set-by-railway>"
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
```

---

#### 3. Pack Legal
```bash
cd src/blackroad_core/packs/pack-legal
railway up
```

**Environment Variables:**
```bash
railway variables set PACK_NAME="pack-legal"
railway variables set PORT="8080"
railway variables set DATABASE_URL="<auto-set-by-railway>"
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
```

---

#### 4. Pack Research Lab
```bash
cd src/blackroad_core/packs/pack-research-lab
railway up
```

**Environment Variables:**
```bash
railway variables set PACK_NAME="pack-research-lab"
railway variables set PORT="8080"
railway variables set DATABASE_URL="<auto-set-by-railway>"
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
```

---

#### 5. Pack Creator Studio
```bash
cd src/blackroad_core/packs/pack-creator-studio
railway up
```

**Environment Variables:**
```bash
railway variables set PACK_NAME="pack-creator-studio"
railway variables set PORT="8080"
railway variables set DATABASE_URL="<auto-set-by-railway>"
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
```

---

#### 6. Pack Infra DevOps
```bash
cd src/blackroad_core/packs/pack-infra-devops
railway up
```

**Environment Variables:**
```bash
railway variables set PACK_NAME="pack-infra-devops"
railway variables set PORT="8080"
railway variables set DATABASE_URL="<auto-set-by-railway>"
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
```

---

## 📋 Project 08: Prism Console
**ID:** `47f557cf-09b8-40df-8d77-b34f91ba90cc`
**Cost:** ~$5/month (or $0 if using Cloudflare Pages)

### Option A: Railway (Static Site)
```bash
railway link 47f557cf-09b8-40df-8d77-b34f91ba90cc
cd _personal/BlackRoad-Operating-System/prism-console
railway up
```

### Option B: Cloudflare Pages (Recommended - Free)
```bash
# Deploy via Cloudflare Dashboard
# Project: prism-console
# Build: npm run build
# Output: dist/
# Domain: prism.blackroad.io
```

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL="https://blackroad-os-core-production.up.railway.app"
NEXT_PUBLIC_OPERATOR_URL="https://blackroad-os-operator-production.up.railway.app"
```

---

## 📋 Project 09: BlackRoad Home
**ID:** `1a039a7e-a60c-42c5-be68-e66f9e269209`
**Cost:** ~$5/month (or $0 if using Cloudflare Pages)

### Option A: Railway
```bash
railway link 1a039a7e-a60c-42c5-be68-e66f9e269209
cd _personal/BlackRoad-Operating-System/blackroad-os-home
railway up
```

### Option B: Cloudflare Pages (Recommended - Free)
```bash
# Deploy via Cloudflare Dashboard
# Project: blackroad-home
# Build: npm run build
# Output: out/
# Domain: blackroad.io
```

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL="https://blackroad-os-core-production.up.railway.app"
```

---

## 📋 Projects 10-14: Available for Expansion
**IDs:**
- Project 10: `21f5c719-4d84-4647-83bb-eacdae864f09`
- Project 11: `d7ff931b-1f04-4a9d-8f2a-66b33c369399`
- Project 12: `ce5ff80f-fc2f-4757-8b19-51c5a2c16080`
- Project 13: `a0a19f39-10e1-48d4-8873-c262cfd4c319`
- Project 14: `e790fa90-b70f-463e-98ac-d545a5b2b620`

**Reserved for:**
- Additional pack services
- Staging environments
- Development environments
- Regional deployments
- Future expansion

---

## 🔐 Secrets Management

### Required API Keys (Get Before Deploying)

**AI Services:**
- ANTHROPIC_API_KEY: https://console.anthropic.com
- OPENAI_API_KEY: https://platform.openai.com

**Email:**
- SENDGRID_API_KEY: https://app.sendgrid.com
- SENDGRID_FROM_EMAIL: noreply@blackroad.io (verify domain first)

**Payment:**
- STRIPE_SECRET_KEY: https://dashboard.stripe.com
- STRIPE_PUBLISHABLE_KEY: https://dashboard.stripe.com
- STRIPE_WEBHOOK_SECRET: Create webhook endpoint first

**Google Services:**
- GOOGLE_CLIENT_ID: https://console.cloud.google.com
- GOOGLE_CLIENT_SECRET: https://console.cloud.google.com

**Monitoring:**
- SENTRY_DSN: https://sentry.io

**Generate Locally:**
```bash
# JWT Secret
openssl rand -hex 32

# Fernet Key
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

## 📊 Cost Summary

### By Project
- **Project 01 (RoadWork Prod):** $30/month
- **Project 02 (RoadWork Staging):** $15/month
- **Project 03 (Core Services):** $20/month
- **Project 04 (Operator):** $10/month
- **Project 05 (Master):** $10/month
- **Project 06 (Beacon):** $8/month
- **Project 07 (Packs):** $20/month
- **Project 08 (Prism):** $5/month (or $0 with Cloudflare)
- **Project 09 (Home):** $5/month (or $0 with Cloudflare)

**Total: $123/month** (or $113/month with Cloudflare Pages)

### Recommended Phased Rollout

**Phase 1 ($30/month):**
- Project 01: RoadWork Production only

**Phase 2 (+$40/month = $70 total):**
- Project 03: Core Services
- Project 04: Operator
- Project 05: Master

**Phase 3 (+$28/month = $98 total):**
- Project 06: Beacon
- Project 07: Packs

**Phase 4 (+$15/month = $113 total):**
- Project 02: RoadWork Staging
- Projects 08-09: Dashboards (use Cloudflare Pages for free)

---

## 🚀 Deployment Order

### Day 1: Core Infrastructure
1. ✅ Project 01 - RoadWork Production (highest value)
2. ✅ Project 03 - BlackRoad Core Services

### Week 1: Control Plane
3. ✅ Project 04 - BlackRoad Operator
4. ✅ Project 05 - BlackRoad Master
5. ✅ Project 06 - BlackRoad Beacon

### Week 2: Domain Packs
6. ✅ Project 07 - All Packs

### Week 3: Staging & Dashboards
7. ✅ Project 02 - RoadWork Staging
8. ✅ Projects 08-09 - Dashboards (Cloudflare Pages)

---

## 🔄 Post-Deployment Checklist

### For Each Project

**After linking:**
```bash
railway status  # Verify connection
```

**After adding database:**
```bash
railway variables | grep DATABASE_URL  # Verify connection string
```

**After deploying service:**
```bash
railway logs -f  # Watch deployment
curl https://[service-url]/health  # Test health check
```

**After all services deployed:**
```bash
railway services  # List all services
railway open  # Open dashboard
```

---

## 🚨 Troubleshooting

### Deployment Fails
```bash
railway logs  # Check build logs
railway variables  # Verify env vars
railway up --detach  # Redeploy
```

### Database Connection Errors
```bash
railway variables | grep DATABASE_URL  # Check URL
railway run psql  # Test connection
railway run alembic upgrade head  # Run migrations
```

### Service Not Starting
```bash
railway logs -f  # Watch logs
railway service settings  # Check start command
railway restart  # Restart service
```

### Environment Variable Missing
```bash
railway variables  # List all vars
railway variables set KEY=value  # Add missing var
```

---

## 📚 Related Documentation

- **RAILWAY_INFRASTRUCTURE.md** - All project IDs and commands
- **RAILWAY_SERVICES_INVENTORY.md** - All services catalog
- **roadwork/DEPLOYMENT_STATUS.md** - RoadWork deployment checklist
- **roadwork/RAILWAY_DEPLOYMENT_ARCHITECTURE.md** - Architecture options

---

## 📞 Support

**Railway Support:**
- Dashboard: https://railway.app
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

**BlackRoad Support:**
- Email: blackroad.systems@gmail.com
- Primary: blackroad@gmail.com

---

**All 14 Railway projects configured and ready to deploy!** 🚂✨
