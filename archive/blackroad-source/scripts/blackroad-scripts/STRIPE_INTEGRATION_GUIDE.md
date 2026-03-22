# 🚀 BlackRoad OS - Stripe Integration Guide

Complete guide for implementing payments, subscriptions, and billing across BlackRoad OS.

## 📦 What's Included

### API Service (`services/api`)
- ✅ Stripe webhook handlers (subscriptions, invoices)
- ✅ Customer creation utilities
- ✅ Checkout session management
- ✅ Billing portal integration

### Web Service (`services/web`)
- ✅ Beautiful pricing page with 3 tiers
- ✅ Account/subscription management dashboard
- ✅ Checkout flow integration
- ✅ Usage tracking display

### Configuration
- ✅ Product definitions in `infra/stripe-products.json`
- ✅ Feature comparison matrix
- ✅ Pricing tiers (Free, $499/mo, Enterprise)

---

## 🎯 Quick Start

### 1. Install Dependencies

Both services already have Stripe installed. If starting fresh:

```bash
# API Service
cd services/api
npm install stripe svix

# Web Service
cd services/web
npm install stripe
```

### 2. Configure Environment Variables

**API Service** (`services/api/.env`):
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Web Service** (`services/web/.env`):
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL=price_...
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### 3. Create Stripe Products

In your Stripe Dashboard:

1. **Create Products:**
   - Developer (Free) - No payment required
   - Professional - $499/month
   - Enterprise - Contact sales

2. **Get Price IDs:**
   - Copy the price ID for Professional plan
   - Update `NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL`

3. **Set up Webhooks:**
   - Add endpoint: `https://your-api-domain.com/api/webhooks/stripe`
   - Subscribe to:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 4. Test Locally

```bash
# Terminal 1: API Service
cd services/api
npm run dev

# Terminal 2: Web Service
cd services/web
npm run dev

# Terminal 3: Stripe webhook forwarding
stripe listen --forward-to localhost:3003/api/webhooks/stripe
```

Visit:
- Pricing: http://localhost:3000/pricing
- Account: http://localhost:3000/account

---

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│  Web App    │────────▶│  API Service│────────▶│   Stripe    │
│  (Next.js)  │         │  (Next.js)  │         │             │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
     │                        │                        │
     │                        │                        │
     ▼                        ▼                        ▼
 User clicks             Processes              Webhooks back
 "Subscribe"             payment                to update status
```

### Request Flow

1. **User visits `/pricing`**
   - Web service renders pricing tiers
   - Shows features for each plan

2. **User clicks "Subscribe"**
   - POST to `/api/checkout` (web service)
   - Forwards to API service with customer + price ID
   - API creates Stripe checkout session
   - Redirects user to Stripe hosted checkout

3. **User completes payment**
   - Stripe processes payment
   - Sends webhook to `/api/webhooks/stripe` (API service)
   - API updates subscription status
   - User redirected to success page

4. **User manages subscription**
   - Visits `/account` page
   - Clicks "Manage Billing"
   - Opens Stripe customer portal
   - Can update payment, cancel, etc.

---

## 📄 API Endpoints

### API Service (`services/api`)

#### `POST /api/checkout`
Create Stripe checkout session for subscription.

**Request:**
```json
{
  "customerId": "cus_...",
  "priceId": "price_...",
  "successUrl": "https://app.blackroad.io/success",
  "cancelUrl": "https://app.blackroad.io/pricing"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

#### `POST /api/portal`
Create Stripe billing portal session.

**Request:**
```json
{
  "customerId": "cus_...",
  "returnUrl": "https://app.blackroad.io/account"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

#### `POST /api/webhooks/stripe`
Handle Stripe webhook events.

**Headers:**
- `stripe-signature`: Webhook signature for verification

**Events Handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## 🎨 Pages

### `/pricing`
Beautiful pricing page with 3 tiers.

**Features:**
- Responsive 3-column layout
- Highlights "Most Popular" plan
- Feature comparison
- Direct checkout integration

### `/account`
Subscription and usage dashboard.

**Features:**
- Current plan display
- Usage metrics (agents, API calls, storage)
- Upgrade/manage buttons
- Visual usage bars

---

## 🔐 Security Best Practices

✅ **Implemented:**
- Webhook signature verification
- Environment variable secrets
- Server-side Stripe API calls only

⚠️ **TODO for Production:**
- [ ] Add authentication (Clerk or similar)
- [ ] Verify user owns customerId before operations
- [ ] Rate limit API endpoints
- [ ] Add CORS restrictions
- [ ] Use production Stripe keys
- [ ] Enable HTTPS for all endpoints

---

## 🧪 Testing

### Test Cards

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.

### Test Webhooks

```bash
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### Local Testing Checklist

- [ ] Can view pricing page
- [ ] Can click subscribe
- [ ] Redirects to Stripe checkout
- [ ] Can complete test payment
- [ ] Webhook fires and logs received
- [ ] Can access billing portal
- [ ] Can cancel subscription from portal

---

## 🚀 Deployment

### Railway Deployment

1. **Deploy API Service:**
```bash
cd services/api
railway up
```

2. **Add Environment Variables in Railway:**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

3. **Deploy Web Service:**
```bash
cd services/web
railway up
```

4. **Add Environment Variables:**
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL`
   - `NEXT_PUBLIC_API_URL` (URL of deployed API service)

5. **Update Stripe Webhook URL:**
   - Change webhook endpoint to production API URL
   - Example: `https://blackroad-api.up.railway.app/api/webhooks/stripe`

### Cloudflare Pages

Follow similar steps, using Cloudflare's environment variable system.

---

## 📊 Product Tiers

| Feature | Developer | Professional | Enterprise |
|---------|-----------|--------------|------------|
| Price | Free | $499/mo | Custom |
| Agents | 10 | 1,000 | Unlimited |
| API Calls/Day | 1,000 | 10,000 | Unlimited |
| Storage | 1 GB | 100 GB | Unlimited |
| Support | Community | Email/Chat | 24/7 Phone |
| SLA | None | 99.5% | 99.99% |
| Team Members | 1 | 5 | Unlimited |

---

## 🆘 Troubleshooting

### Webhook Not Firing

1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check API service logs
4. Test with Stripe CLI: `stripe trigger customer.subscription.created`

### Payment Fails

1. Verify Stripe publishable key is correct
2. Check browser console for errors
3. Ensure test mode matches (test keys = test cards)
4. Verify price ID exists in Stripe

### TypeScript Errors

```bash
cd services/api
npm run type-check

cd services/web
npm run type-check
```

---

## 📚 Additional Resources

- [Stripe Docs](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

---

## 🎉 What's Next?

- [ ] Integrate with Clerk for auth + billing sync
- [ ] Add usage-based billing for overages
- [ ] Implement team management
- [ ] Add analytics dashboard
- [ ] Create admin panel for subscription management

---

**Built with ❤️ by BlackRoad OS, Inc.**
**Last Updated:** 2026-01-28
