# 🚀 BlackRoad OS - Go Live Instructions

## Quick Deploy (5 minutes)

### Option 1: Cloudflare Pages (Recommended - FREE!)

```bash
# 1. Login to Cloudflare
wrangler login

# 2. Deploy the store
cd ~/blackroad-app-store/web
npx wrangler pages deploy .next --project-name blackroad-store

# 3. Your store is LIVE!
# Visit: https://blackroad-store.pages.dev
```

### Option 2: Vercel (Also FREE!)

```bash
# 1. Login to Vercel
npx vercel login

# 2. Deploy
cd ~/blackroad-app-store/web
npx vercel --prod

# 3. Live at your-store.vercel.app
```

### Option 3: Netlify (Also FREE!)

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy
cd ~/blackroad-app-store/web
netlify deploy --prod --dir=.next

# 3. Live at your-store.netlify.app
```

## Deploy Individual Apps

Each app can be deployed separately:

```bash
# Deploy any app
cd ~/blackroad-apps/blackroad-dashboard
npx wrangler pages deploy . --project-name blackroad-dashboard

# Or use any static hosting
python3 -m http.server 8000
# Upload to: Cloudflare, Vercel, Netlify, GitHub Pages, etc.
```

## Get a Custom Domain

1. **Buy domain** ($10/year):
   - Namecheap.com
   - GoDaddy.com
   - Google Domains

2. **Point to your deployment**:
   - Cloudflare: Add in dashboard
   - Vercel: Auto-detects
   - Netlify: Add in settings

3. **Examples**:
   - `apps.yourname.com`
   - `getmyapps.io`
   - `yourappstore.com`

## Full Production Stack (Optional)

### Database (PostgreSQL)
- Railway: $5/mo
- Supabase: Free tier
- Neon: Free tier

### File Storage (App binaries)
- Cloudflare R2: $0.015/GB
- AWS S3: $0.023/GB
- Backblaze B2: $0.005/GB

### Payments (For paid apps)
- Stripe: 2.9% + 30¢ per transaction
- Connect your account via dashboard

### Analytics
- Cloudflare Analytics: Free
- Plausible: $9/mo
- Google Analytics: Free

## Total Cost Breakdown

### Free Tier (Forever!)
- Hosting: $0 (Cloudflare/Vercel/Netlify)
- SSL: $0 (Automatic)
- CDN: $0 (Included)
- Bandwidth: $0 (Unlimited on Cloudflare)
- **Total: $0/month**

### Paid Tier (When you grow)
- Domain: $10/year
- Database: $5/mo
- Storage: ~$1/mo
- **Total: ~$6/month**

Compare to:
- Apple App Store: $99/year + 30% of revenue
- Google Play: $25 one-time + 15-30% of revenue

## Environment Variables

Set these in your deployment dashboard:

```bash
NEXT_PUBLIC_STORE_URL=https://blackroad-store.pages.dev
NEXT_PUBLIC_API_URL=https://api.blackroad-store.pages.dev
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
```

## Ready to Go Live?

```bash
# One command to deploy:
cd ~/blackroad-app-store/web && npx wrangler pages deploy .next --project-name blackroad-store
```

That's it! Your store is live! 🎉

---

**BlackRoad OS** - Your store, your rules, your freedom.
