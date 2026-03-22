# 🚀 applier.blackroad.io - Complete Deployment Guide

**Deploy the entire applier system to production**

---

## 📋 Prerequisites

- [x] Node.js 18+ and pnpm installed
- [x] Wrangler CLI installed (`npm install -g wrangler`)
- [x] Railway CLI installed (`npm install -g @railway/cli`)
- [x] Cloudflare account with blackroad.io domain
- [x] Railway account

---

## 🎯 Quick Deploy (5 minutes)

### Step 1: Deploy Frontend to Cloudflare Pages

```bash
cd /Users/alexa/blackroad-sandbox/applier-frontend

# Install dependencies
pnpm install

# Build static site
pnpm build

# Login to Cloudflare (if not already)
wrangler login

# Deploy to Cloudflare Pages
wrangler pages deploy out --project-name applier-blackroad

# Or use the shortcut
pnpm pages:deploy
```

**Expected Output:**
```
✨ Success! Uploaded 42 files
🌎 Deploying to production...
✅ Deployment complete!
🔗 https://applier-blackroad.pages.dev
```

### Step 2: Configure Custom Domain

1. Go to Cloudflare Pages dashboard
2. Select `applier-blackroad` project
3. Go to **Custom Domains** tab
4. Click **Set up a custom domain**
5. Enter: `applier.blackroad.io`
6. Click **Continue**
7. Cloudflare automatically configures DNS ✅

**DNS will propagate in 1-5 minutes**

### Step 3: Verify Deployment

```bash
# Check if site is live
curl -I https://applier-blackroad.pages.dev

# Check custom domain (after DNS propagates)
curl -I https://applier.blackroad.io
```

**Expected:** HTTP 200 OK

---

## 🔧 Backend API Deployment (Optional - if not already deployed)

### Deploy to Railway

```bash
cd /Users/alexa/blackroad-sandbox/roadwork

# Login to Railway
railway login

# Create new project or link existing
railway link applier-production

# Deploy API
railway up

# Get deployed URL
railway status
```

### Configure Environment Variables

```bash
# In Railway dashboard, add these environment variables:
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG....
STRIPE_SECRET_KEY=sk_live_...
JWT_SECRET=your-jwt-secret-here
FERNET_KEY=your-fernet-key-here
```

### Update Frontend API URL

Update `applier-frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://applier-production.up.railway.app
```

Rebuild and redeploy frontend:

```bash
cd /Users/alexa/blackroad-sandbox/applier-frontend
pnpm build
pnpm pages:deploy
```

---

## 🌐 Complete Infrastructure Map

After deployment, you'll have:

### Frontend
- **Production**: https://applier.blackroad.io
- **Preview**: https://applier-blackroad.pages.dev
- **Hosting**: Cloudflare Pages (FREE, global CDN)

### Backend API
- **Production**: https://api-applier.blackroad.io (or Railway URL)
- **Hosting**: Railway ($20-40/month)

### Services
- **Database**: PostgreSQL (Railway)
- **Cache**: Redis (Railway)
- **Email**: SendGrid (FREE tier)
- **Payments**: Stripe
- **Monitoring**: Sentry (FREE tier)

---

## ✅ Post-Deployment Checklist

### Frontend Health Check

- [ ] Visit https://applier.blackroad.io
- [ ] Landing page loads correctly
- [ ] All images display
- [ ] Navigation works
- [ ] Pricing section visible
- [ ] CTA buttons work
- [ ] Mobile responsive

### Backend Health Check (if deployed)

```bash
# Check API health
curl https://api-applier.blackroad.io/health

# Expected response:
# {"status": "healthy", "timestamp": "..."}
```

### DNS Configuration

```bash
# Check DNS propagation
dig applier.blackroad.io

# Should show Cloudflare IPs:
# applier.blackroad.io.  300  IN  A  172.64.80.1
```

### SSL/HTTPS

- [ ] https://applier.blackroad.io shows padlock icon
- [ ] No mixed content warnings
- [ ] Certificate valid

---

## 🔄 Update & Redeploy

### Update Frontend

```bash
cd /Users/alexa/blackroad-sandbox/applier-frontend

# Make your changes...

# Build and deploy
pnpm build
pnpm pages:deploy
```

### Update Backend

```bash
cd /Users/alexa/blackroad-sandbox/roadwork

# Make your changes...

# Deploy to Railway
railway up
```

---

## 📊 Monitoring & Analytics

### Cloudflare Analytics

1. Go to Cloudflare Pages dashboard
2. Select `applier-blackroad`
3. Click **Analytics** tab
4. View:
   - Page views
   - Unique visitors
   - Bandwidth usage
   - Top pages

### Railway Metrics

```bash
# View logs
railway logs

# View metrics
railway status

# Monitor in dashboard
open https://railway.app/dashboard
```

---

## 🐛 Troubleshooting

### Frontend Not Deploying

```bash
# Clean and rebuild
rm -rf .next out node_modules
pnpm install
pnpm build
pnpm pages:deploy
```

### DNS Not Resolving

```bash
# Check DNS records in Cloudflare
wrangler pages project list

# Verify custom domain configured
# Go to Cloudflare dashboard → Pages → applier-blackroad → Custom Domains
```

### Build Errors

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for ESLint errors
pnpm lint

# View full build logs
pnpm build --verbose
```

### Backend API Not Responding

```bash
# Check Railway deployment status
railway status

# View logs
railway logs --tail

# Restart service
railway restart
```

---

## 💰 Cost Breakdown

### Monthly Costs

**Frontend (Cloudflare Pages):** $0
- Unlimited bandwidth (FREE)
- Unlimited requests (FREE)
- Global CDN (FREE)
- Custom domain (FREE)
- SSL certificate (FREE)

**Backend (Railway):** $20-40
- API server: $5-10
- Workers: $10-15
- PostgreSQL: $5
- Redis: $5

**External Services:** Variable
- SendGrid: $0 (12K emails/month FREE)
- Sentry: $0 (5K errors/month FREE)
- Stripe: 2.9% + $0.30 per transaction

**Total: $20-40/month** (mostly backend)

---

## 🎯 Performance Targets

### Frontend (Cloudflare Pages)
- **Page Load**: < 1 second
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Lighthouse Score**: 95+

### Backend (Railway)
- **API Response Time**: < 100ms (avg)
- **Uptime**: 99.9%+
- **Error Rate**: < 0.1%

---

## 🚀 Next Steps

1. **Test the deployment**
   - Visit https://applier.blackroad.io
   - Sign up for an account
   - Test the onboarding flow

2. **Set up monitoring**
   - Configure Sentry error tracking
   - Set up uptime monitoring
   - Create status page

3. **Launch marketing**
   - Product Hunt launch
   - Social media announcement
   - Email to beta users

4. **Start applying to jobs for you!**
   - Complete your profile
   - Configure job preferences
   - Activate daily automation
   - Track applications in dashboard

---

## 📧 Support

Need help deploying?

- **Email**: blackroad.systems@gmail.com
- **Documentation**: This file
- **Railway Support**: https://railway.app/help
- **Cloudflare Support**: https://community.cloudflare.com

---

## ✨ Deployment Complete!

You now have:

✅ Frontend deployed to https://applier.blackroad.io
✅ Global CDN via Cloudflare Pages
✅ Custom domain configured
✅ SSL/HTTPS enabled
✅ Production-ready infrastructure

**Time to start applying to jobs automatically! 🎉**

---

Built with ❤️ by BlackRoad Systems
