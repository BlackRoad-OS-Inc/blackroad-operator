# ⚡ Quick Action Guide

Copy-paste these commands and URLs as you work through setup.

---

## 📋 URLs to Open

**Stripe:**
```
https://dashboard.stripe.com/test/products
https://dashboard.stripe.com/test/webhooks
https://dashboard.stripe.com/test/apikeys
```

**Vercel:**
```
https://vercel.com/alexa-amundsons-projects/web/settings/environment-variables
https://vercel.com/alexa-amundsons-projects/web/settings/domains
https://vercel.com/alexa-amundsons-projects/web/logs
```

**Your Live Site:**
```
https://web-mlpcifh70-alexa-amundsons-projects.vercel.app/pricing
https://web-mlpcifh70-alexa-amundsons-projects.vercel.app/account
```

**Cloudflare DNS:**
```
https://dash.cloudflare.com/[your-account]/blackroad.io/dns
```

---

## 🔑 Environment Variables Needed

In Vercel, update these:

```bash
# After creating Stripe product:
NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL=price_XXXXXXXXXXXXX

# After creating webhook:
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXX

# Current (already set):
STRIPE_SECRET_KEY=rk_test_51SUDM8ChUUSEbzyh...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SUDM8...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🎯 Product Details (for Stripe)

**Professional Plan:**
- Name: `BlackRoad Professional Plan`
- Price: `$499.00`
- Billing: `Monthly recurring`
- Description: `Up to 1,000 concurrent agents, unlimited Lucidia agents, 99.5% SLA`

**Features to list:**
- Up to 1,000 concurrent agents
- Unlimited Lucidia agents
- Advanced Prism Console
- Email & chat support (24h)
- 100 GB RoadChain storage
- 10,000 API requests/day
- 99.5% uptime SLA
- 5 team members included

---

## 🔗 Webhook Configuration

**Endpoint URL:**
```
https://web-mlpcifh70-alexa-amundsons-projects.vercel.app/api/webhooks/stripe
```

**Events to select:**
- ✅ checkout.session.completed
- ✅ customer.subscription.created
- ✅ customer.subscription.updated
- ✅ customer.subscription.deleted
- ✅ invoice.payment_succeeded
- ✅ invoice.payment_failed

---

## 🌐 Domain Setup

**CNAME Record for Cloudflare:**
```
Type:    CNAME
Name:    pay
Target:  cname.vercel-dns.com
Proxy:   OFF (grey cloud)
TTL:     Auto
```

**Alternative subdomain options:**
- `pay.blackroad.io`
- `payments.blackroad.io`
- `subscribe.blackroad.io`
- `billing.blackroad.io`

---

## 💳 Test Card

**Always use:**
```
Number:  4242 4242 4242 4242
Exp:     Any future date (e.g., 12/34)
CVC:     Any 3 digits (e.g., 123)
ZIP:     Any 5 digits (e.g., 12345)
```

**Other test cards:**
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0027 6000 3184`
- Insufficient funds: `4000 0000 0000 9995`

---

## 🚀 Deploy Commands

**Redeploy after changes:**
```bash
cd ~/services/web
vercel --prod
```

**Check deployment status:**
```bash
vercel ls
```

**View logs:**
```bash
vercel logs
```

---

## ✅ Verification Steps

After each major step:

**1. After creating product:**
```bash
# Should see your price_ID in Stripe dashboard
# Update Vercel env var
# Redeploy
```

**2. After webhook setup:**
```bash
# Send test webhook from Stripe dashboard
# Check Vercel logs for "webhook received"
```

**3. After domain setup:**
```bash
# Wait 5-10 minutes
# Visit https://pay.blackroad.io
# Should see your pricing page
```

**4. Full test:**
```bash
# Click "Subscribe Now"
# Complete checkout with 4242 card
# Check Stripe dashboard for new customer
# Check webhook logs for events fired
```

---

## 🎯 Success Indicators

✅ Stripe product created (has price_ID)  
✅ Webhook endpoint responding (green in Stripe)  
✅ Custom domain shows pricing page  
✅ Test checkout completes successfully  
✅ Webhook events appear in Stripe logs  
✅ Customer created in Stripe dashboard  

---

**All set! Work through the main guide, use this for quick reference.** 🚀
