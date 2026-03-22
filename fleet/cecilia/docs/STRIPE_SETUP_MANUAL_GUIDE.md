# 💳 STRIPE SETUP - MANUAL GUIDE (5 MINUTES)

**Two Options:**

## Option A: Automated (RECOMMENDED) ⚡

```bash
# Make sure you're logged in to Stripe CLI
stripe login

# Run the automated script
~/setup-stripe-products-now.sh
```

This will create all 5 products and save payment links to `~/STRIPE_PAYMENT_LINKS_LIVE.txt`

---

## Option B: Manual Setup (via Dashboard) 🖱️

### Step 1: Open Stripe Dashboard
```bash
open https://dashboard.stripe.com/products
```

### Step 2: Toggle to **LIVE MODE** (top right)
⚠️ **CRITICAL:** Make sure the toggle says "LIVE" not "TEST"

### Step 3: Create 5 Products

Click **"+ Add product"** for each:

#### Product 1: Context Bridge - Monthly
- **Name:** Context Bridge - Monthly
- **Description:** Unlimited context bridges for AI coding assistants. Never re-explain yourself.
- **Pricing:**
  - Price: **$10.00 USD**
  - Billing: **Recurring**
  - Interval: **Monthly**
- Click **"Save product"**
- Click **"Create payment link"** → Copy the link

#### Product 2: Context Bridge - Annual
- **Name:** Context Bridge - Annual  
- **Description:** Unlimited context bridges (save $20/year)
- **Pricing:**
  - Price: **$100.00 USD**
  - Billing: **Recurring**
  - Interval: **Yearly**
- Click **"Save product"**
- Click **"Create payment link"** → Copy the link

#### Product 3: Lucidia Pro
- **Name:** Lucidia Pro
- **Description:** Advanced AI simulation engine with physics modeling
- **Pricing:**
  - Price: **$49.00 USD**
  - Billing: **Recurring**
  - Interval: **Monthly**
- Click **"Save product"**
- Click **"Create payment link"** → Copy the link

#### Product 4: RoadAuth - Starter
- **Name:** RoadAuth - Starter
- **Description:** Authentication for up to 1,000 users
- **Pricing:**
  - Price: **$29.00 USD**
  - Billing: **Recurring**
  - Interval: **Monthly**
- Click **"Save product"**
- Click **"Create payment link"** → Copy the link

#### Product 5: RoadAuth - Enterprise
- **Name:** RoadAuth - Enterprise
- **Description:** Authentication for unlimited users + SSO
- **Pricing:**
  - Price: **$299.00 USD**
  - Billing: **Recurring**
  - Interval: **Monthly**
- Click **"Save product"**
- Click **"Create payment link"** → Copy the link

### Step 4: Save All Links

Create `~/STRIPE_PAYMENT_LINKS_LIVE.txt` with all 5 payment links:

```
Context Bridge - Monthly: https://buy.stripe.com/...
Context Bridge - Annual: https://buy.stripe.com/...
Lucidia Pro: https://buy.stripe.com/...
RoadAuth - Starter: https://buy.stripe.com/...
RoadAuth - Enterprise: https://buy.stripe.com/...
```

---

## ✅ Success Checklist

- [ ] All 5 products created in **LIVE mode**
- [ ] Payment links generated for each
- [ ] Links saved to `~/STRIPE_PAYMENT_LINKS_LIVE.txt`
- [ ] Tested one checkout flow
- [ ] Ready to add to landing pages

---

## 💰 Revenue Summary

| Product | Price | Type |
|---------|-------|------|
| Context Bridge Monthly | $10/mo | Recurring |
| Context Bridge Annual | $100/yr | Recurring |
| Lucidia Pro | $49/mo | Recurring |
| RoadAuth Starter | $29/mo | Recurring |
| RoadAuth Enterprise | $299/mo | Recurring |

**Total Potential:** $387/month per customer (all products)

---

## 🎯 Next Steps

1. Add payment links to landing pages
2. Test checkout flow
3. Configure Stripe webhooks
4. Set up customer portal

---

**Time Estimate:** 5 minutes (automated) or 15 minutes (manual)  
**Difficulty:** Easy  
**Impact:** HIGH - Enables revenue! 💰
