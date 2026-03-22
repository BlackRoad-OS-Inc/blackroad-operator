# Stripe Setup Guide for BlackRoad.io

## 🎯 Quick Start (Get Paid in 15 Minutes)

Your SaaS platform is LIVE at **https://blackroad.io** but needs Stripe configuration to process payments.

---

## Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Sign up with: **blackroad.systems@gmail.com**
3. Complete business verification

---

## Step 2: Create Products in Stripe

### Create Pro Product

1. Go to: https://dashboard.stripe.com/products
2. Click **"+ Add Product"**
3. Fill in:
   - **Name**: `BlackRoad Pro`
   - **Description**: `Professional AI agent deployment platform`
   - **Pricing Model**: Recurring
   - **Price**: `$49.00 USD`
   - **Billing Period**: `Monthly`
   - **Trial Period**: `14 days`
4. Click **"Save product"**
5. **Copy the Price ID** (starts with `price_...`)

### Create Enterprise Product (Optional)

1. Same process, but:
   - **Name**: `BlackRoad Enterprise`
   - **Price**: `$299.00 USD`

---

## Step 3: Update Price ID in Code

1. Open `workers/api/src/index.ts`
2. Find line 213:
   ```typescript
   const priceId = plan === 'pro'
     ? 'price_1QdqL0BpJPwF3f4lbcvJtEh7' // <-- REPLACE THIS
     : '';
   ```
3. Replace with your actual Price ID from Step 2
4. Commit and redeploy:
   ```bash
   cd workers/api
   wrangler deploy
   ```

---

## Step 4: Set Stripe Secrets

```bash
cd workers/api

# Get your secret key from: https://dashboard.stripe.com/apikeys
wrangler secret put STRIPE_SECRET_KEY
# Paste: sk_test_... (for testing) or sk_live_... (for production)

# Generate a random JWT secret
wrangler secret put JWT_SECRET
# Paste: any random 32+ character string (use: openssl rand -hex 32)

# We'll set webhook secret in Step 5
```

---

## Step 5: Configure Stripe Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://blackroad-api.blackroad.workers.dev/api/webhooks/stripe
   ```
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Click **"Reveal signing secret"**
7. Copy the webhook secret (starts with `whsec_...`)
8. Set it:
   ```bash
   cd workers/api
   wrangler secret put STRIPE_WEBHOOK_SECRET
   # Paste: whsec_...
   ```

---

## Step 6: Test the Flow

### Test Signup (Free Tier)

1. Go to https://blackroad.io
2. Click **"Start Free"**
3. Fill out form with test email
4. Should create account and redirect to dashboard

### Test Signup (Pro Tier)

1. Go to https://blackroad.io/pricing
2. Click **"Start Pro Trial"**
3. Fill out form
4. Should redirect to Stripe Checkout
5. Use test card: **4242 4242 4242 4242**
   - CVV: any 3 digits
   - Expiry: any future date
   - ZIP: any 5 digits
6. Complete checkout
7. Should redirect back to dashboard

### Verify in Database

```bash
# Check users
wrangler d1 execute blackroad-saas --remote --command="SELECT * FROM users"

# Check subscriptions
wrangler d1 execute blackroad-saas --remote --command="SELECT * FROM subscriptions"
```

---

## Step 7: Go Live

### Switch to Live Mode

1. In Stripe dashboard, toggle from **Test Mode** to **Live Mode** (top right)
2. Create products again in Live mode (repeat Step 2)
3. Update Price ID in code (repeat Step 3)
4. Update secrets with live keys:
   ```bash
   wrangler secret put STRIPE_SECRET_KEY
   # Use sk_live_... this time
   ```
5. Create webhook in Live mode (repeat Step 5)

### Enable Billing Portal

1. Go to: https://dashboard.stripe.com/settings/billing/portal
2. Click **"Activate link"**
3. Customize branding (optional)
4. Save

---

## Pricing Summary

### Free Tier
- Price: $0
- 1 agent deployment
- 1,000 API calls/month
- No credit card required

### Pro Tier
- Price: **$49/month**
- 14-day free trial
- 10 agent deployments
- 100,000 API calls/month
- Priority support

### Enterprise
- Price: **$299/month**
- Unlimited everything
- Dedicated support
- Custom contracts

---

## Revenue Projections

### Conservative (First 90 Days)
- 100 free signups
- 10 Pro conversions = **$490/month**
- 1 Enterprise = **$299/month**
- **Total: ~$789/month**

### Moderate (6 Months)
- 500 free signups
- 50 Pro = **$2,450/month**
- 5 Enterprise = **$1,495/month**
- **Total: ~$3,945/month**

### Aggressive (12 Months)
- 2,000 free signups
- 200 Pro = **$9,800/month**
- 20 Enterprise = **$5,980/month**
- **Total: ~$15,780/month**

---

## Next Steps After Setup

1. **Add Analytics**: Track conversions, page views
2. **SEO Optimization**: Meta tags, sitemap, robots.txt
3. **Content Marketing**: Blog posts, tutorials
4. **Email Campaigns**: Drip campaigns for trial users
5. **Referral Program**: Incentivize user growth

---

## Troubleshooting

### "Stripe key not set" error
```bash
cd workers/api
wrangler secret put STRIPE_SECRET_KEY
```

### Webhook not firing
- Check webhook URL is correct
- Verify events are selected
- Check webhook secret is set

### Test payment fails
- Use test card: 4242 4242 4242 4242
- Make sure you're in Test Mode
- Check Stripe dashboard for error details

---

## Support

Questions? **blackroad.systems@gmail.com**

---

**Database**: `blackroad-saas` (c7bec6d8-42fa-49fb-9d8c-57d626dde6b9)
**API Worker**: https://blackroad-api.blackroad.workers.dev
**Production Site**: https://blackroad.io
