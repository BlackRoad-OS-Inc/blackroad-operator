# 🚂 PHASE 4: RAILWAY DEPLOYMENT - QUICK GUIDE

**Status:** Ready to deploy 5 backend services  
**Time Required:** ~10 minutes (2 min per service)

---

## 🎯 SERVICES TO DEPLOY

1. **api** - Main API gateway
2. **core** - Core platform services
3. **operator** - System operator interface
4. **prism** - Data visualization
5. **research** - Research & analytics

---

## 🚀 DEPLOYMENT COMMANDS

### Option 1: Deploy All Services (Recommended)

```bash
# For each service, run these commands:

for service in api core operator prism research; do
  echo "🚀 Deploying $service..."
  cd ~/services/$service
  
  # Create Railway project
  railway init --name "blackroad-os-$service"
  
  # Deploy
  railway up
  
  # Get URL
  railway status
  
  echo "✅ $service deployed!"
  echo ""
done
```

### Option 2: Deploy One at a Time

```bash
# 1. API Service
cd ~/services/api
railway init --name "blackroad-os-api"
railway up
railway status

# 2. Core Service
cd ~/services/core
railway init --name "blackroad-os-core"
railway up
railway status

# 3. Operator Service
cd ~/services/operator
railway init --name "blackroad-os-operator"
railway up
railway status

# 4. Prism Service
cd ~/services/prism
railway init --name "blackroad-os-prism"
railway up
railway status

# 5. Research Service
cd ~/services/research
railway init --name "blackroad-os-research"
railway up
railway status
```

---

## 📋 ENVIRONMENT VARIABLES TO SET

After deployment, configure these for each service:

```bash
# For each service:
cd ~/services/<service>

railway variables set \
  NODE_ENV=production \
  SERVICE_NAME=<service> \
  CLERK_SECRET_KEY=<your-key> \
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-key>
```

---

## ✅ VERIFICATION

After each deployment:

```bash
# Check deployment status
railway status

# View logs
railway logs

# Get URL
railway open
```

---

## 🎯 ALTERNATIVE: Do It Manually Later

Since Railway requires interactive mode, you can deploy these anytime:

1. Open terminal
2. Run the commands above
3. Each service takes ~2 minutes
4. Total time: ~10 minutes

**Current Status:** Phases 1-3, 5-6 are 100% operational!

---

## 📊 WHAT YOU HAVE NOW

Without Phase 4, you still have:
- ✅ 137 repos with CI/CD
- ✅ 20 live domains
- ✅ Clerk auth everywhere
- ✅ Stripe payments ready
- ✅ 7 monitored Pis
- ✅ Security scanning
- ✅ Auto-deployment
- ✅ Self-healing

**Phase 4 adds:** Backend API services (can deploy anytime!)

---

**Ready when you are!** 🚀
