# ⚡ Stripe Integration - Quick Start

## 🎯 5-Minute Setup

### 1. Get Your Stripe Keys
```bash
# From https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Set Environment Variables

**API Service** (`.env`):
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Web Service** (`.env`):
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### 3. Start Services
```bash
# Terminal 1
cd services/api && npm run dev

# Terminal 2
cd services/web && npm run dev

# Terminal 3 (for webhook testing)
stripe listen --forward-to localhost:3003/api/webhooks/stripe
```

### 4. Test
- Visit: http://localhost:3000/pricing
- Click "Subscribe Now" on Professional
- Use test card: `4242 4242 4242 4242`

---

## 📁 What Was Added

### API Service (`services/api/`)
```
lib/
  ├── stripe.ts                    # Stripe utilities
app/api/
  ├── webhooks/stripe/route.ts     # Webhook handler
  ├── checkout/route.ts            # Checkout sessions
  └── portal/route.ts              # Billing portal
```

### Web Service (`services/web/`)
```
app/
  ├── pricing/page.tsx             # Pricing page
  ├── account/page.tsx             # Account dashboard
  └── api/
      ├── checkout/route.ts        # Checkout proxy
      └── portal/route.ts          # Portal proxy
lib/
  └── stripe-config.ts             # Product definitions
```

### Configuration
```
infra/
  └── stripe-products.json         # Product data
```

---

## 🎨 Pages Created

| Page | URL | Description |
|------|-----|-------------|
| Pricing | `/pricing` | 3-tier pricing display |
| Account | `/account` | Subscription dashboard |
| Success | `/success` | Post-checkout redirect |

---

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/checkout` | POST | Create checkout session |
| `/api/portal` | POST | Create portal session |
| `/api/webhooks/stripe` | POST | Handle Stripe events |

---

## 💳 Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0025 0000 3155` | 3D Secure |

**Expiry:** Any future date  
**CVC:** Any 3 digits

---

## 🚀 Deploy to Production

### 1. Create Products in Stripe
- Developer (Free) - No price needed
- Professional - Create $499/month price
- Enterprise - Contact only

### 2. Get Production Keys
```bash
# From https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 3. Add Webhook
- URL: `https://api.blackroad.io/api/webhooks/stripe`
- Events: `customer.subscription.*`, `invoice.payment.*`

### 4. Update Environment Variables
Replace all test keys with live keys in Railway/Cloudflare.

---

## 📊 Pricing Tiers

| Tier | Price | Key Features |
|------|-------|--------------|
| **Developer** | Free | 10 agents, 1K API/day |
| **Professional** | $499/mo | 1K agents, 10K API/day, SLA |
| **Enterprise** | Custom | Unlimited, 24/7 support |

---

## ✅ Testing Checklist

- [ ] View `/pricing` page
- [ ] Click "Subscribe Now"
- [ ] Complete test checkout
- [ ] Webhook fires successfully
- [ ] View `/account` page
- [ ] Click "Manage Billing"
- [ ] Access billing portal

---

## 🆘 Common Issues

**Webhook not firing?**
```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3003/api/webhooks/stripe
```

**TypeScript errors?**
```bash
cd services/api && npm run type-check
cd services/web && npm run type-check
```

**Build failing?**
```bash
cd services/api && npm run build
cd services/web && npm run build
```

---

## 📚 Full Documentation

See `STRIPE_INTEGRATION_GUIDE.md` for complete docs.

---

**Ready to accept payments! 🎉**
