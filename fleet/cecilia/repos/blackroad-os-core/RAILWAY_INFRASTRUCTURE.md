# 🚂 Railway Infrastructure - BlackRoad OS

**All Railway Projects for BlackRoad OS Ecosystem**

Last Updated: 2025-12-14

---

## 🔑 Railway Project IDs

### Active Projects (14 Total)

1. **Project 01:** `9d3d2549-3778-4c86-8afd-cefceaaa74d2`
2. **Project 02:** `6d4ab1b5-3e97-460e-bba0-4db86691c476`
3. **Project 03:** `aa968fb7-ec35-4a8b-92dc-1eba70fa8478`
4. **Project 04:** `e8b256aa-8708-4eb2-ba24-99eba4fe7c2e`
5. **Project 05:** `85e6de55-fefd-4e8d-a9ec-d20c235c2551`
6. **Project 06:** `8ac583cb-ffad-40bd-8676-6569783274d1`
7. **Project 07:** `b61ecd98-adb2-4788-a2e0-f98e322af53a`
8. **Project 08:** `47f557cf-09b8-40df-8d77-b34f91ba90cc`
9. **Project 09:** `1a039a7e-a60c-42c5-be68-e66f9e269209`
10. **Project 10:** `21f5c719-4d84-4647-83bb-eacdae864f09`
11. **Project 11:** `d7ff931b-1f04-4a9d-8f2a-66b33c369399`
12. **Project 12:** `ce5ff80f-fc2f-4757-8b19-51c5a2c16080`
13. **Project 13:** `a0a19f39-10e1-48d4-8873-c262cfd4c319`
14. **Project 14:** `e790fa90-b70f-463e-98ac-d545a5b2b620`

### Production URLs

- **RoadWork Production:** `roadwork-production.up.railway.app`

---

## 📋 Project Assignments

### Recommended Deployment Structure for BlackRoad OS Ecosystem

```
Project 01 (9d3d2549-3778-4c86-8afd-cefceaaa74d2) - RoadWork Production
├── roadwork-api (FastAPI server)
├── roadwork-worker (Celery worker)
├── roadwork-beat (Celery beat scheduler)
├── postgres (PostgreSQL database)
└── redis (Redis cache)

Project 02 (6d4ab1b5-3e97-460e-bba0-4db86691c476) - RoadWork Staging
├── roadwork-api-staging
├── postgres-staging
└── redis-staging

Project 03 (aa968fb7-ec35-4a8b-92dc-1eba70fa8478) - BlackRoad Core
├── blackroad-os-core (Core library services)
├── postgres
└── redis

Project 04 (e8b256aa-8708-4eb2-ba24-99eba4fe7c2e) - BlackRoad Operator
├── blackroad-os-operator (Orchestration layer - "Cece" agent)
└── postgres

Project 05 (85e6de55-fefd-4e8d-a9ec-d20c235c2551) - BlackRoad Master
├── blackroad-os-master (Master control services)
└── postgres

Project 06 (8ac583cb-ffad-40bd-8676-6569783274d1) - BlackRoad Beacon
├── blackroad-os-beacon (Monitoring and health checks)
└── redis

Project 07 (b61ecd98-adb2-4788-a2e0-f98e322af53a) - BlackRoad Packs
├── pack-finance (Financial pack services)
├── pack-legal (Legal pack services)
├── pack-research-lab (Research pack services)
├── pack-creator-studio (Creative pack services)
├── pack-infra-devops (DevOps pack services)
└── postgres

Project 08 (47f557cf-09b8-40df-8d77-b34f91ba90cc) - BlackRoad Dashboard
├── blackroad-dashboard (Monitoring UI)
└── Static hosting or Cloudflare Pages

Project 09 (1a039a7e-a60c-42c5-be68-e66f9e269209) - BlackRoad Home
├── blackroad-os-home (Marketing site)
└── Static hosting or Cloudflare Pages
```

---

## 🚀 Deployment Commands

### Link to Project

```bash
# Link to specific project
railway link 9d3d2549-3778-4c86-8afd-cefceaaa74d2

# Or use project name (if already linked)
railway link roadwork-production
```

### Deploy Services

```bash
# Deploy API
cd roadwork
railway up

# Deploy worker (switch project first)
railway link 6d4ab1b5-3e97-460e-bba0-4db86691c476
cd roadwork/worker
railway up
```

### Add Database & Redis

```bash
# In API project
railway add postgresql
railway add redis

# Get connection strings
railway variables
```

### Set Environment Variables

```bash
# For API
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set OPENAI_API_KEY=sk-...
railway variables set SENDGRID_API_KEY=SG...
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set JWT_SECRET_KEY=your-secret
railway variables set FERNET_KEY=your-fernet-key

# Database URL (automatically set by Railway)
# REDIS_URL (automatically set by Railway)
```

### Run Migrations

```bash
# After deploying API
railway run alembic upgrade head
```

---

## 📊 Project Monitoring

### Check Status

```bash
# View all projects
railway status

# View logs
railway logs

# View recent deployments
railway deployments
```

### Access Services

```bash
# Get service URLs
railway domain

# Example outputs:
# API: roadwork-api-production.up.railway.app
# Worker: roadwork-worker-production.up.railway.app
```

---

## 🔒 Security

### Environment Variables to Set

**Required:**
- `DATABASE_URL` (auto-set by PostgreSQL addon)
- `REDIS_URL` (auto-set by Redis addon)
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `JWT_SECRET_KEY`
- `FERNET_KEY`

**Email:**
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`

**Payment:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Google OAuth:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

**Monitoring:**
- `SENTRY_DSN`

---

## 💰 Cost Tracking

### Estimated Costs per Project

**Project 1 (API + DB + Redis):**
- PostgreSQL: $5/month
- Redis: $5/month
- API Service: $5-10/month
- **Total: $15-20/month**

**Project 2 (Workers):**
- Worker Service: $5-10/month
- Beat Scheduler: $2-5/month
- **Total: $7-15/month**

**Grand Total: $22-35/month**

---

## 🔄 Scaling Strategy

### Vertical Scaling (Increase Resources)

```bash
# Increase memory/CPU for service
railway service scale --memory 2GB --cpu 2
```

### Horizontal Scaling (More Replicas)

```bash
# Scale to multiple instances
railway service scale --replicas 2
```

### Auto-scaling

Configure in Railway dashboard:
- Min replicas: 1
- Max replicas: 3
- Target CPU: 70%

---

## 🛠️ Maintenance

### Database Backups

```bash
# Manual backup
railway run pg_dump > backup.sql

# Restore
railway run psql < backup.sql
```

Railway automatically creates daily backups.

### Logs

```bash
# View recent logs
railway logs

# Follow logs (live)
railway logs -f

# Filter by service
railway logs --service roadwork-api
```

### Health Checks

All services should expose:
- `/health` - Basic health check
- `/ready` - Readiness check (DB connected, etc.)

Railway auto-monitors these endpoints.

---

## 📝 Project Naming Convention

**Recommended naming:**
- `roadwork-production` (Project 1)
- `roadwork-workers` (Project 2)
- `roadwork-staging` (Project 3 - for testing)
- `blackroad-core` (Project 4)
- `blackroad-services` (Project 5)

---

## 🔗 Custom Domains

### API Domain

```bash
# Add custom domain
railway domain add api-roadwork.blackroad.io

# Railway provides:
# CNAME: roadwork-api-production.up.railway.app
```

### DNS Configuration (Cloudflare)

```
Type: CNAME
Name: api-roadwork
Content: roadwork-api-production.up.railway.app
Proxy: Yes (orange cloud)
```

---

## 🚨 Troubleshooting

### Deployment Failed

```bash
# View build logs
railway logs --deployment <deployment-id>

# Check environment variables
railway variables

# Redeploy
railway up --detach
```

### Database Connection Issues

```bash
# Test connection
railway run psql

# Check DATABASE_URL
railway variables | grep DATABASE_URL
```

### Service Not Starting

```bash
# Check logs
railway logs -f

# Verify start command
railway service settings

# Common issues:
# - Missing environment variables
# - Port not set ($PORT)
# - Migrations not run
```

---

## 📚 Resources

- **Railway Docs:** https://docs.railway.app
- **Railway CLI:** https://docs.railway.app/develop/cli
- **Railway Status:** https://status.railway.app
- **Community:** https://discord.gg/railway

---

## 🎯 Quick Reference

```bash
# Login
railway login

# Link project
railway link <PROJECT_ID>

# Deploy
railway up

# Add service
railway add postgresql
railway add redis

# Set variables
railway variables set KEY=value

# View logs
railway logs -f

# Run command
railway run alembic upgrade head

# Check status
railway status

# Open dashboard
railway open
```

---

## 📞 Support

**Railway Support:**
- Email: team@railway.app
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

**BlackRoad Support:**
- Email: blackroad.systems@gmail.com
- Primary: blackroad@gmail.com

---

**All Railway projects tracked and ready for deployment!** 🚂✨

**Last verified:** 2025-12-14
