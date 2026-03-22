# 🎯 Complete Stripe Setup - Step by Step

Your site is LIVE! Now let's complete the setup.

**Live Site:** https://web-mlpcifh70-alexa-amundsons-projects.vercel.app/pricing

---

## ✅ STEP 1: Test Checkout Flow (2 minutes)

### What to do:
1. Open: https://web-mlpcifh70-alexa-amundsons-projects.vercel.app/pricing
2. Click "Subscribe Now" on Professional plan
3. You'll see an error (expected - need to create real product)

**Expected:** "Invalid price ID" error
**Why:** We need to create the real product in Stripe first

---

## ✅ STEP 2: Create Real Stripe Products (5 minutes)

### Go to Stripe Dashboard:
👉 https://dashboard.stripe.com/test/products

### Create Product:
1. Click **"+ Add Product"**
2. Fill in:
   - **Name:** BlackRoad Professional Plan
   - **Description:** Up to 1,000 concurrent agents, unlimited API access
   - **Pricing Model:** Standard pricing
   - **Price:** $499.00
   - **Billing Period:** Monthly recurring
3. Click **"Save product"**

### Get the Price ID:
1. After saving, click on the product
2. Find the **Price** section
3. Copy the **Price ID** (starts with `price_`)
   - Example: `price_1OabcdEF2GhIjKlM`

### Update Environment Variables:

**Option A: Vercel Dashboard (Recommended)**
1. Go to: https://vercel.com/alexa-amundsons-projects/web/settings/environment-variables
2. Find: `NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL`
3. Change value to your new price ID
4. Click **"Save"**
5. Go to Deployments tab → Redeploy latest

**Option B: Command Line**
```bash
cd ~/services/web
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL production
# Paste your price_ID when prompted
vercel --prod
```

---

## ✅ STEP 3: Set Up Webhooks (3 minutes)

### Why Webhooks?
Webhooks notify your backend when payments succeed/fail so you can:
- Activate subscriptions
- Send confirmation emails
- Update user access

### Configure in Stripe:
👉 https://dashboard.stripe.com/test/webhooks

1. Click **"+ Add endpoint"**
2. **Endpoint URL:** 
   ```
   https://web-mlpcifh70-alexa-amundsons-projects.vercel.app/api/webhooks/stripe
   ```
3. **Description:** "BlackRoad Production Webhook"
4. **Events to send:** Select these:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**

### Get Webhook Secret:
1. After creating, click on your webhook
2. Click **"Reveal"** next to **Signing secret**
3. Copy the secret (starts with `whsec_`)

### Add to Vercel:
1. Go to: https://vercel.com/alexa-amundsons-projects/web/settings/environment-variables
2. Find: `STRIPE_WEBHOOK_SECRET`
3. Update with your `whsec_` secret
4. Save and redeploy

---

## ✅ STEP 4: Add Custom Domain (5 minutes)

### Option A: Add to Vercel (Easiest)

**In Vercel:**
1. Go to: https://vercel.com/alexa-amundsons-projects/web/settings/domains
2. Click **"Add"**
3. Enter: `pay.blackroad.io` (or `payments.blackroad.io`)
4. Vercel will show you DNS records to add

**In Cloudflare (or your DNS provider):**
1. Go to: https://dash.cloudflare.com
2. Select: `blackroad.io`
3. Go to: **DNS → Records**
4. Add the records Vercel showed you:
   - Type: `CNAME`
   - Name: `pay` (or `payments`)
   - Target: `cname.vercel-dns.com`
   - Proxy: OFF (grey cloud)
5. Wait 5-10 minutes for DNS propagation

### Result:
Your site will be available at: `https://pay.blackroad.io/pricing`

---

## 🎉 Final Test

Once all steps are done:

1. Visit: `https://pay.blackroad.io/pricing` (or your Vercel URL)
2. Click **"Subscribe Now"**
3. Enter test card: `4242 4242 4242 4242`
4. Complete checkout
5. Check webhook logs: https://dashboard.stripe.com/test/webhooks
6. Check your logs: https://vercel.com/alexa-amundsons-projects/web/logs

---

## 📊 Monitor Everything

**Stripe Dashboard:**
- Payments: https://dashboard.stripe.com/test/payments
- Customers: https://dashboard.stripe.com/test/customers
- Subscriptions: https://dashboard.stripe.com/test/subscriptions
- Webhooks: https://dashboard.stripe.com/test/webhooks

**Vercel Dashboard:**
- Deployments: https://vercel.com/alexa-amundsons-projects/web
- Logs: https://vercel.com/alexa-amundsons-projects/web/logs
- Analytics: https://vercel.com/alexa-amundsons-projects/web/analytics

---

## 🚀 Go Live (When Ready)

To accept real payments:

1. **Switch to Live Mode in Stripe:**
   - Get live keys: https://dashboard.stripe.com/apikeys
   - Create live product (same as test)
   
2. **Update Vercel env vars:**
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - `NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL` → `price_...` (live ID)
   - `STRIPE_WEBHOOK_SECRET` → `whsec_...` (live secret)

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

---

## ✅ Checklist

Before going live, verify:

- [ ] Test checkout works with 4242 card
- [ ] Webhooks are firing (check Stripe dashboard)
- [ ] Custom domain is working
- [ ] Pricing page looks correct
- [ ] Account page displays properly
- [ ] SSL certificate is active (https works)

---

**Need help with any step? Just ask!** 🎯
