# BlackRoad.io SaaS Platform - Deployment Guide

## 🎯 What's Been Built

A complete SaaS platform for blackroad.io with:

### ✅ Features Implemented
1. **Pricing Page** (`/pricing`)
   - 3 tiers: Free, Pro ($49/mo), Enterprise ($299/mo)
   - Annual/monthly billing toggle
   - Clean, professional design

2. **Signup Flow** (`/signup`)
   - Email-based registration
   - Plan selection
   - Stripe checkout integration (for paid plans)

3. **Database (Cloudflare D1)**
   - Users table
   - Subscriptions table
   - Agent deployments table
   - API keys table
   - Template purchases table

4. **API Worker** (Cloudflare Workers)
   - `/api/auth/signup` - Create account
   - `/api/auth/login` - User login
   - `/api/user/me` - Get user profile
   - `/api/subscription/create-checkout` - Stripe checkout
   - `/api/subscription/portal` - Billing portal
   - `/api/webhooks/stripe` - Stripe event webhooks
   - `/api/agents` - Agent CRUD operations

5. **Stripe Integration**
   - Checkout sessions
   - Subscription management
   - Webhook handlers
   - Billing portal

## 🚀 Deployment Steps

### 1. Set up Stripe

```bash
# Create Stripe products and prices
# Go to: https://dashboard.stripe.com/products

# Create "BlackRoad Pro" product with $49/month price
# Note the Price ID (starts with price_)

# Update the Price ID in workers/api/src/index.ts line 213
```

### 2. Configure Cloudflare Secrets

```bash
cd workers/api

# Set Stripe secret key
wrangler secret put STRIPE_SECRET_KEY
# Paste your sk_live_... or sk_test_... key

# Set Stripe webhook secret (after creating webhook)
wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste your whsec_... key

# Set JWT secret (generate a random string)
wrangler secret put JWT_SECRET
# Paste a random 32+ character string
```

### 3. Deploy API Worker

```bash
cd workers/api
wrangler deploy
```

This deploys to: `https://blackroad-api.blackroad.workers.dev`

### 4. Build and Deploy Frontend

```bash
# From project root
pnpm install
pnpm build

# Deploy to Cloudflare Pages
wrangler pages deploy out --project-name=blackroad-os-web
```

### 5. Set up Stripe Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Create endpoint: `https://blackroad-api.blackroad.workers.dev/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret and update via `wrangler secret put STRIPE_WEBHOOK_SECRET`

### 6. Update API URL in Frontend

Update `/app/signup/page.tsx` line 25:
```typescript
const response = await fetch('https://blackroad-api.blackroad.workers.dev/api/auth/signup', {
```

### 7. Test the Flow

1. Visit https://blackroad.io/pricing
2. Click "Start Free" or "Start Pro Trial"
3. Fill out signup form
4. For Pro: Complete Stripe checkout
5. Verify user created in D1 database

## 📊 Verify Database

```bash
# Check users
wrangler d1 execute blackroad-saas --remote --command="SELECT * FROM users"

# Check subscriptions
wrangler d1 execute blackroad-saas --remote --command="SELECT * FROM subscriptions"
```

## 💰 Stripe Configuration

### Product Setup
1. **Free Tier**: No Stripe product (handled in app)
2. **Pro Tier**:
   - Price: $49/month
   - Trial: 14 days
   - Create Price ID in Stripe dashboard
3. **Enterprise**: Contact sales (manual)

### Test Mode
During development, use Stripe test mode:
- Use test API keys (sk_test_...)
- Use test card: 4242 4242 4242 4242

### Production Checklist
- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint to production API
- [ ] Test complete signup flow
- [ ] Test subscription updates
- [ ] Test cancellation flow

## 🔒 Security TODOs

1. **Add JWT Authentication**
   - Generate JWT tokens on login
   - Verify tokens in protected routes
   - Implement token refresh

2. **Add Cloudflare Access** (optional)
   - Protects dashboard with SSO
   - Integrates with corporate auth

3. **Verify Stripe Webhooks**
   - Implement signature verification
   - Prevent replay attacks

4. **Rate Limiting**
   - Add to API routes
   - Prevent abuse

## 📈 Next Steps

1. **Build Dashboard** (`/dashboard`)
   - Show subscription status
   - Display usage metrics
   - Agent management UI

2. **Agent Deployment UI**
   - One-click agent deployment
   - Template marketplace
   - Real-time monitoring

3. **Analytics**
   - Plausible or Google Analytics
   - Conversion tracking
   - User behavior

4. **Marketing**
   - SEO optimization
   - Blog/content
   - Email campaigns

## 🎯 Quick Deploy Script

```bash
#!/bin/bash
# deploy-saas.sh

echo "🚀 Deploying BlackRoad.io SaaS Platform"

# Deploy API
cd workers/api
echo "📡 Deploying API..."
wrangler deploy
cd ../..

# Build and deploy frontend
echo "🎨 Building frontend..."
pnpm build

echo "☁️  Deploying to Cloudflare Pages..."
wrangler pages deploy out --project-name=blackroad-os-web

echo "✅ Deployment complete!"
echo "🌐 Site: https://blackroad.io"
echo "📡 API: https://blackroad-api.blackroad.workers.dev"
```

## 📞 Support

Questions? Contact: blackroad.systems@gmail.com

---

**Database ID**: `c7bec6d8-42fa-49fb-9d8c-57d626dde6b9`
**API Worker**: `blackroad-api`
**Pages Project**: `blackroad-os-web`
