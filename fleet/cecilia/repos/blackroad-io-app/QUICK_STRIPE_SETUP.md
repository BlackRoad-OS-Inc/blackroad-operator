# 💰 GET PAID IN 10 MINUTES - Quick Stripe Setup

## ⚡ FASTEST PATH TO MONEY

### Step 1: Create Stripe Account (2 minutes)
1. Go to https://stripe.com
2. Sign up with **blackroad.systems@gmail.com**
3. Skip verification for now (can do later)

### Step 2: Get Your Secret Key (1 minute)
1. Go to https://dashboard.stripe.com/test/apikeys
2. Click "Reveal test key" under "Secret key"
3. Copy it (starts with `sk_test_...`)

### Step 3: Set Secrets (2 minutes)
```bash
cd /tmp/blackroad-io-app/workers/api

# Stripe secret key
wrangler secret put STRIPE_SECRET_KEY
# Paste your sk_test_... key

# JWT secret (any random string)
wrangler secret put JWT_SECRET
# Paste: blackroad-jwt-super-secret-2025

# Webhook secret (set later after creating webhook)
# wrangler secret put STRIPE_WEBHOOK_SECRET
```

### Step 4: Create Products in Stripe (3 minutes)
1. Go to https://dashboard.stripe.com/test/products
2. Click "+ Add product"

**Pro Product:**
- Name: `BlackRoad Pro`
- Description: `Professional AI agent deployment platform`
- Pricing model: Recurring
- Price: `49.00 USD`
- Billing period: Monthly
- Click "Save product"
- **COPY THE PRICE ID** (starts with `price_...`)

**Enterprise Product (optional):**
- Name: `BlackRoad Enterprise`
- Price: `299.00 USD`
- Same process

### Step 5: Update Price ID in Code (1 minute)
Open `/tmp/blackroad-io-app/workers/api/src/index.ts` and find line ~213:

```typescript
const priceId = plan === 'pro'
  ? 'price_YOUR_ACTUAL_PRICE_ID_HERE' // <-- REPLACE THIS
  : '';
```

Replace with your actual Price ID from Step 4.

### Step 6: Deploy (1 minute)
```bash
cd /tmp/blackroad-io-app/workers/api
wrangler deploy
```

## ✅ DONE! You can now accept payments!

### Test It:
1. Go to https://blackroad.io/pricing
2. Click "Start Pro Trial"
3. Fill out form
4. Use test card: `4242 4242 4242 4242`
   - CVV: any 3 digits
   - Expiry: any future date
   - ZIP: any 5 digits
5. Complete checkout
6. You should see success page!

## 💸 Go Live (When Ready)

1. Toggle from Test Mode to Live Mode in Stripe (top right)
2. Get your LIVE secret key (`sk_live_...`)
3. Create products again in Live mode
4. Update secrets:
```bash
wrangler secret put STRIPE_SECRET_KEY
# Use sk_live_... this time
```

## 🎯 Expected Revenue

### Month 1 (Conservative)
- 50 signups → 5 Pro conversions = **$245/month**

### Month 3 (Moderate)
- 200 signups → 20 Pro + 2 Enterprise = **$1,578/month**

### Month 6 (Aggressive)
- 1,000 signups → 100 Pro + 10 Enterprise = **$7,890/month**

## 🚨 CRITICAL NOTES

- **Test Mode**: No real charges, perfect for testing
- **Live Mode**: Real charges, real money
- **Webhook**: Set up later for subscription updates
- **Verification**: Complete when you're ready to withdraw money

## 📞 Need Help?

Email: blackroad.systems@gmail.com

---

**Your platform is READY TO MAKE MONEY!** 🚀💰
