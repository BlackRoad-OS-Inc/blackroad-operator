# 🔐 How to Add Domains to Clerk Dashboard

## Quick Steps

1. **Visit Clerk Dashboard**
   - Go to: https://dashboard.clerk.com
   - Log in with your account

2. **Select Your Application**
   - You should see your app (fine-wallaby-96 based on your keys)
   - Click on it

3. **Go to Domains Section**
   - In the left sidebar, click **"Domains"**
   - Or look for **"Configure"** → **"Domains"**

4. **Add Production Domains**
   - Click **"Add domain"** or **"Add production domain"**
   - Enter each domain one by one:

### Domains to Add (20 total):

```
blackroad.io
blackroad.systems
blackroadquantum.com
blackroadquantum.info
blackroadquantum.net
blackroadquantum.shop
blackroadquantum.store
blackroadai.com
blackroadqi.com
lucidia.earth
lucidiaqi.com
lucidia.studio
aliceqi.com
blackroad.me
blackroad.company
blackroadinc.us
blackroad.network
roadchain.io
roadcoin.io
blackboxprogramming.io
```

5. **Verify Each Domain** (if required)
   - Clerk may ask you to verify ownership
   - Usually via DNS TXT record or CNAME
   - Follow the on-screen instructions

6. **Enable for Production**
   - Make sure each domain is marked as "Production"
   - Toggle any switches to enable them

## Alternative: Bulk Add via API

If you want to do this programmatically:

```bash
# Get your Clerk Secret Key
CLERK_SECRET="sk_test_8YUC3WTdI3xJs2qQP0TyXWsAKuVlXWXRzaWCm0QlB8"

# Add a domain via API
curl -X POST https://api.clerk.com/v1/domains \
  -H "Authorization: Bearer $CLERK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "blackroad.io",
    "is_satellite": false
  }'
```

## What This Does

- **Allows authentication** to work on those domains
- **Prevents errors** when users try to sign in/up
- **Enables SSO** across all your domains (if configured)

## Expected Time

- **Manual**: ~5-10 minutes for all 20 domains
- **API**: ~2 minutes with a script

---

## 🚨 Important Notes

1. **Satellite vs Primary**
   - Use "Primary" for main domains
   - Use "Satellite" only if you have a complex multi-domain setup

2. **Development vs Production**
   - Mark all as "Production" since you're using pk_test keys
   - Or upgrade to production keys if ready

3. **Verification**
   - Some domains may require DNS verification
   - Keep your Cloudflare dashboard open to add records if needed

---

**Once domains are added, authentication will work across all 20 sites!** ✅
