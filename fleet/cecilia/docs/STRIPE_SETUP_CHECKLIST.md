# ✅ Stripe Setup Checklist

**Goal:** Accept $499/month payments on BlackRoad.io

---

## 📍 Current Status

✅ **DONE:**
- [x] Code written and tested
- [x] Deployed to Vercel
- [x] Live at: https://web-mlpcifh70-alexa-amundsons-projects.vercel.app
- [x] Pricing page beautiful
- [x] Checkout button works (needs product setup)

🎯 **TODO:** (15 minutes total)
- [ ] Step 1: Test current checkout (2 min)
- [ ] Step 2: Create Stripe product (5 min)
- [ ] Step 3: Set up webhooks (3 min)
- [ ] Step 4: Add custom domain (5 min)

---

## 📝 Step 1: Test Checkout (2 min)

**Action:** Visit your live site and try to checkout

1. [ ] Open: https://web-mlpcifh70-alexa-amundsons-projects.vercel.app/pricing
2. [ ] Click "Subscribe Now" button
3. [ ] Note the error (expected: "Invalid price ID")
4. [ ] This confirms the button works, just needs a real product

**Why:** Verify the integration works before continuing

---

## 📝 Step 2: Create Stripe Product (5 min)

**Action:** Create $499/month Professional plan in Stripe

1. [ ] Go to: https://dashboard.stripe.com/test/products
2. [ ] Click "+ Add Product"
3. [ ] Enter product details:
   ```
   Name: BlackRoad Professional Plan
   Price: $499.00
   Billing: Monthly recurring
   Description: 1,000 agents, unlimited API, 99.5% SLA
   ```
4. [ ] Click "Save product"
5. [ ] Copy the Price ID (starts with `price_`)
6. [ ] Write it here: price_____________________

**Then update Vercel:**
7. [ ] Go to: https://vercel.com/alexa-amundsons-projects/web/settings/environment-variables
8. [ ] Find: `NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL`
9. [ ] Update with your price ID
10. [ ] Click "Save"
11. [ ] Go to Deployments → Redeploy latest

**Verification:**
- [ ] Vercel redeployed successfully
- [ ] Visit pricing page, click Subscribe Now
- [ ] Should now redirect to Stripe checkout!

---

## 📝 Step 3: Set Up Webhooks (3 min)

**Action:** Configure webhook to receive payment notifications

1. [ ] Go to: https://dashboard.stripe.com/test/webhooks
2. [ ] Click "+ Add endpoint"
3. [ ] Enter webhook URL:
   ```
   https://web-mlpcifh70-alexa-amundsons-projects.vercel.app/api/webhooks/stripe
   ```
4. [ ] Select these events:
   - [ ] checkout.session.completed
   - [ ] customer.subscription.created
   - [ ] customer.subscription.updated
   - [ ] customer.subscription.deleted
   - [ ] invoice.payment_succeeded
   - [ ] invoice.payment_failed
5. [ ] Click "Add endpoint"
6. [ ] Click "Reveal" next to Signing secret
7. [ ] Copy the secret (starts with `whsec_`)
8. [ ] Write it here: whsec_____________________

**Then update Vercel:**
9. [ ] Go to: https://vercel.com/alexa-amundsons-projects/web/settings/environment-variables
10. [ ] Find: `STRIPE_WEBHOOK_SECRET`
11. [ ] Update with your webhook secret
12. [ ] Save and redeploy

**Verification:**
- [ ] In Stripe webhook page, click "Send test webhook"
- [ ] Check Vercel logs: https://vercel.com/alexa-amundsons-projects/web/logs
- [ ] Should see "Webhook received" message

---

## 📝 Step 4: Add Custom Domain (5 min)

**Action:** Make it accessible at pay.blackroad.io

**In Vercel:**
1. [ ] Go to: https://vercel.com/alexa-amundsons-projects/web/settings/domains
2. [ ] Click "Add"
3. [ ] Enter: `pay.blackroad.io`
4. [ ] Vercel shows DNS records to add

**In Cloudflare:**
5. [ ] Go to: https://dash.cloudflare.com
6. [ ] Select: blackroad.io domain
7. [ ] Go to: DNS → Records
8. [ ] Click "Add record"
9. [ ] Enter:
   ```
   Type: CNAME
   Name: pay
   Target: cname.vercel-dns.com
   Proxy: OFF (grey cloud)
   ```
10. [ ] Click "Save"
11. [ ] Wait 5-10 minutes

**Verification:**
- [ ] Visit: https://pay.blackroad.io
- [ ] Should see your pricing page
- [ ] SSL should be active (https)
- [ ] Try a test checkout

---

## 🎉 Final Verification

Once all steps complete:

**Full Test:**
1. [ ] Visit: https://pay.blackroad.io/pricing
2. [ ] Click "Subscribe Now"
3. [ ] Fill in test card: 4242 4242 4242 4242
4. [ ] Complete checkout
5. [ ] Should redirect to success page
6. [ ] Check Stripe: https://dashboard.stripe.com/test/customers
7. [ ] Should see new customer created!
8. [ ] Check webhooks: https://dashboard.stripe.com/test/webhooks
9. [ ] Should see events fired!

**Dashboard checks:**
- [ ] Pricing page looks good
- [ ] Account page loads
- [ ] All buttons work
- [ ] Custom domain working
- [ ] SSL active

---

## ✨ Success!

Once all boxes checked:

✅ **You can now accept $499/month payments!**

**Next steps:**
- Share the link: https://pay.blackroad.io/pricing
- Monitor: https://dashboard.stripe.com/test/payments
- When ready, switch to live mode with real Stripe keys

---

## 💡 Quick Help

**If checkout fails:**
- Check price ID is correct in Vercel
- Redeploy after any env var changes
- Check Vercel logs for errors

**If webhooks don't fire:**
- Verify webhook URL is correct
- Check webhook secret in Vercel
- Send test webhook from Stripe dashboard

**If domain doesn't work:**
- Wait 10-15 minutes for DNS propagation
- Check Cloudflare proxy is OFF (grey cloud)
- Verify CNAME record is correct

---

**Time to complete: ~15 minutes**  
**Difficulty: Easy (just clicking through dashboards)**  
**Result: Live payment system accepting $499/month!** 🚀
