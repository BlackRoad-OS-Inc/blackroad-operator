# 🚂 Railway Recovery Plan

## Issue
All 7 Railway production services returning 404 - projects appear deleted/suspended.

## Current Status
- ✅ Railway CLI authenticated (amundsonalexa@gmail.com)
- ✅ 1 active project: blackroad-os-orchestrator
- ❌ All production services missing

## Services to Recreate
1. blackroad-os-api-production
2. blackroad-os-brand-production
3. blackroad-os-prism-console-production
4. blackroad-os-core-production
5. blackroad-os-docs-production
6. blackroad-os-ideas-production
7. blackroad-os-infra-production

## Recovery Steps

### Option A: Web Dashboard (RECOMMENDED)
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose BlackRoad-OS organization
5. Select repo (e.g., blackroad-os-api)
6. Configure environment variables
7. Deploy!

### Option B: CLI (if dashboard works)
```bash
cd ~/workspace/blackroad-fix/blackroad-os-api
railway login
railway init
railway up
```

### Option C: Quick Deploy Script
```bash
#!/bin/bash
SERVICES=(api brand prism-console core docs ideas infra)

for service in "${SERVICES[@]}"; do
    cd ~/workspace/blackroad-fix/blackroad-os-$service
    railway init --name "blackroad-$service-production"
    railway up
done
```

## Notes
- Railway may have billing limits
- Check account status first
- May need to upgrade plan for multiple services
- Consider using Cloudflare Pages as primary (it's working!)

