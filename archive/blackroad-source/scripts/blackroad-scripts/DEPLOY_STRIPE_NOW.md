# 🚀 Deploy Stripe Integration to Production - NOW!

**Get your payment system live in 10 minutes**

---

## ✅ Pre-Deployment Checklist

Both services are built and ready:
- [x] API service compiled successfully
- [x] Web service compiled successfully
- [x] TypeScript checks pass
- [x] All code is ready

---

## 🎯 Option 1: Deploy via GitHub (RECOMMENDED)

### Step 1: Push Code to GitHub

```bash
# From repo root
git add services/api services/web infra STRIPE*.md
git commit -m "feat: Add complete Stripe integration with pricing pages"
git push origin main
```

### Step 2: Deploy API Service (Railway)

1. **Go to Railway Dashboard**: https://railway.app
2. **Create New Project** → "Deploy from GitHub"
3. **Select Repository** → Choose your repo
4. **Select Root Directory**: `services/api`
5. **Add Environment Variables**:
   ```
   STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
   STRIPE_WEBHOOK_SECRET=whsec_...
   SERVICE_NAME=blackroad-os-api
   SERVICE_ENV=production
   ```
6. **Deploy** → Railway will auto-detect Next.js and deploy
7. **Copy Deployment URL** → Example: `https://blackroad-os-api-production.up.railway.app`

### Step 3: Configure Stripe Webhook

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/webhooks
2. **Add Endpoint**: `https://YOUR-API-URL.up.railway.app/api/webhooks/stripe`
3. **Select Events**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy Signing Secret** → Update `STRIPE_WEBHOOK_SECRET` in Railway

### Step 4: Create Stripe Products

1. **Go to Stripe Products**: https://dashboard.stripe.com/products
2. **Create "Professional" Product**:
   - Name: BlackRoad OS Professional
   - Price: $499/month (recurring)
   - Description: Full BlackRoad OS platform with 1,000 agents
3. **Copy Price ID** → Example: `price_1AbCdEfGhIjKlMnO`

### Step 5: Deploy Web Service (Railway or Cloudflare)

**Railway:**
1. **Create New Project** → Deploy from GitHub
2. **Select Root Directory**: `services/web`
3. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
   NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL=price_1AbCdEfGhIjKlMnO
   NEXT_PUBLIC_API_URL=https://YOUR-API-URL.up.railway.app
   SERVICE_NAME=blackroad-os-web
   SERVICE_ENV=production
   ```
4. **Deploy** → Get URL like `https://blackroad-os-web-production.up.railway.app`

**Cloudflare Pages:**
1. **Go to Cloudflare Pages**: https://dash.cloudflare.com/pages
2. **Connect GitHub** → Select repo
3. **Build Settings**:
   - Framework: Next.js
   - Build command: `cd services/web && npm install && npm run build`
   - Output directory: `services/web/.next`
4. **Environment Variables** (same as above)
5. **Deploy**

### Step 6: Test Live!

```bash
# Visit your pricing page
https://YOUR-WEB-URL/pricing

# Try test checkout with card: 4242 4242 4242 4242
# Any future expiry, any 3-digit CVC
```

---

## 🎯 Option 2: Manual Railway Deploy (If git push isn't ready)

### API Service
```bash
cd services/api

# Set environment variables first in Railway dashboard
# Then deploy
railway up

# Or link to existing project
railway link
railway up
```

### Web Service
```bash
cd services/web

# Set environment variables first
railway up
```

---

## 🎯 Option 3: Deploy via Cloudflare Workers/Pages

### API Service (Cloudflare Workers)
```bash
cd services/api

# Install adapter
npm install -D @cloudflare/next-on-pages

# Deploy
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static
```

### Web Service (Cloudflare Pages)
```bash
cd services/web
npm run build
npx wrangler pages deploy .next
```

---

## 🔧 Environment Variables Reference

### API Service
| Variable | Example | Where to Get |
|----------|---------|--------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard → Webhooks → Add Endpoint |
| `SERVICE_NAME` | `blackroad-os-api` | Fixed value |
| `SERVICE_ENV` | `production` | Fixed value |

### Web Service
| Variable | Example | Where to Get |
|----------|---------|--------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe Dashboard → API Keys |
| `NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL` | `price_...` | Stripe Dashboard → Products → Professional → Price ID |
| `NEXT_PUBLIC_API_URL` | `https://api.blackroad.io` | Your deployed API URL |
| `SERVICE_NAME` | `blackroad-os-web` | Fixed value |

---

## ✅ Post-Deployment Verification

### 1. Check API Health
```bash
curl https://YOUR-API-URL/api/health
# Should return: { "status": "ok" }
```

### 2. Test Webhook Endpoint
```bash
curl https://YOUR-API-URL/api/webhooks/stripe
# Should return 400 (because no signature)
# That's good - means endpoint exists!
```

### 3. Visit Pricing Page
```
https://YOUR-WEB-URL/pricing
```

### 4. Test Checkout Flow
1. Click "Subscribe Now" on Professional
2. Use test card: `4242 4242 4242 4242`
3. Complete checkout
4. Check Stripe Dashboard → Customers
5. Check Railway logs for webhook event

### 5. Check Webhook Logs
```bash
# In Railway dashboard
# Select API service → Logs tab
# Should see: "✅ Stripe webhook received: customer.subscription.created"
```

---

## 🎉 Success Checklist

- [ ] API service deployed and accessible
- [ ] Web service deployed and accessible
- [ ] Pricing page loads at `/pricing`
- [ ] Stripe checkout redirects work
- [ ] Webhooks fire successfully
- [ ] Can complete test purchase
- [ ] Customer appears in Stripe dashboard
- [ ] Account page shows subscription

---

## 🚨 Troubleshooting

### "Cannot find module" errors
```bash
# Make sure dependencies are installed
cd services/api && npm install
cd services/web && npm install
```

### Webhook signature verification fails
```bash
# Check STRIPE_WEBHOOK_SECRET matches Stripe dashboard
# Make sure using the webhook secret, not API secret key
```

### Checkout redirects to localhost
```bash
# Update NEXT_PUBLIC_API_URL to production URL
# Redeploy web service
```

### Build fails
```bash
# Test build locally first
cd services/api && npm run build
cd services/web && npm run build
```

---

## 💰 Switch to Production Mode

Once testing is done:

1. **Get Production Stripe Keys**
   - Dashboard → API Keys → "View live data"
   - Copy `pk_live_...` and `sk_live_...`

2. **Update All Environment Variables**
   - Replace all `_test_` keys with `_live_` keys
   - Redeploy both services

3. **Update Webhook to Production Mode**
   - Stripe Dashboard → Switch to "Live mode"
   - Add production webhook URL
   - Update `STRIPE_WEBHOOK_SECRET`

4. **Test with Real Card**
   - Use your own card
   - Verify charge appears in Stripe
   - Immediately refund if needed

---

## 🎊 YOU'RE LIVE!

Your payment system is now accepting real money! 💰

**Next Steps:**
- [ ] Add custom domain (e.g., blackroad.io, api.blackroad.io)
- [ ] Enable Stripe billing portal
- [ ] Set up tax collection (Stripe Tax)
- [ ] Configure email receipts
- [ ] Add subscription analytics

---

**Questions?** Check `STRIPE_INTEGRATION_GUIDE.md` for detailed docs.

**🚀 Ready to make money with BlackRoad OS! 🚀**
