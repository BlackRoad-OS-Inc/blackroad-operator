# 🚀 FASTEST WAY TO DEPLOY (5 Minutes!)

Your Railway token expired, so here's the **WORKING** method:

## ✅ Option 1: Railway Web UI (RECOMMENDED - No CLI needed!)

### Step 1: Go to Railway Dashboard
👉 **https://railway.app/dashboard**

### Step 2: Create New Project
- Click "+ New Project"
- Select "Deploy from GitHub repo"
- Choose your BlackRoad repo

### Step 3: Deploy API Service
- Root directory: `services/api`
- Add environment variables:
  ```
  STRIPE_SECRET_KEY=sk_test_YOUR_KEY
  STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
  SERVICE_NAME=blackroad-os-api
  SERVICE_ENV=production
  ```
- Click Deploy!

### Step 4: Deploy Web Service  
- Create second service in same project
- Root directory: `services/web`
- Add environment variables:
  ```
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
  NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL=price_YOUR_PRICE_ID
  NEXT_PUBLIC_API_URL=https://YOUR_API_URL.railway.app
  SERVICE_NAME=blackroad-os-web
  SERVICE_ENV=production
  ```
- Click Deploy!

### Step 5: Get Your URLs
- API: `https://blackroad-api-production.up.railway.app`
- Web: `https://blackroad-web-production.up.railway.app`

### Step 6: Test It!
Visit: `https://blackroad-web-production.up.railway.app/pricing`

---

## 🎯 Get Stripe Keys First:

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy these:
   - Secret Key (sk_test_...)
   - Publishable Key (pk_test_...)
   
3. Create $499/mo product:
   - Go to: https://dashboard.stripe.com/test/products
   - Create new product: "Professional Plan"
   - Price: $499/month recurring
   - Copy price ID (price_...)

---

## 💡 That's It!

No CLI login needed! Just use the Railway web UI! 🎉

Total time: **5 minutes** ⚡
