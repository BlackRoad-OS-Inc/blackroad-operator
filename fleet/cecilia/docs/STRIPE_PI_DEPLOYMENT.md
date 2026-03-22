# 🎯 Deploy Stripe to Your Pi Cluster

## ✅ What I Found:
- **Aria** (192.168.4.82) - ONLINE ✅
- **Lucidia** (192.168.4.38) - ONLINE ✅  
- **Octavia** (192.168.4.74) - offline ❌
- **Alice** (192.168.4.49) - offline ❌

## 🚀 Ready to Deploy!

I've created everything you need:

### Created Files:
1. `deploy-stripe-to-pi.sh` - Automated deployment script
2. `railway.json` - Backup cloud config
3. All Stripe integration code ready

### Quick Deploy Command:
```bash
./deploy-stripe-to-pi.sh aria pi
```

This will:
1. Package services/api + services/web
2. Transfer to Aria Pi
3. Install Node.js dependencies  
4. Build production bundles
5. Set up services

### Or Manual Deploy:
```bash
# 1. Package it
tar -czf stripe-deploy.tar.gz services/

# 2. Copy to Pi
scp stripe-deploy.tar.gz pi@192.168.4.82:/home/pi/

# 3. SSH and extract
ssh pi@192.168.4.82
cd ~
tar -xzf stripe-deploy.tar.gz

# 4. Install & run
cd services/api
npm install && npm run build
node .next/standalone/server.js &

cd ../web  
npm install && npm run build
node .next/standalone/server.js &
```

### Environment Variables Needed:
Create `.env.production` files with:

**services/api/.env.production:**
```
STRIPE_SECRET_KEY=rk_test_51SUDM8...  
STRIPE_WEBHOOK_SECRET=whsec_temp
PORT=3001
```

**services/web/.env.production:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SUDM8...
NEXT_PUBLIC_API_URL=http://192.168.4.82:3001
NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL=price_temp
PORT=3000
```

## 🎯 Want me to do it?

Just say "deploy" and I'll run the script to Aria!

Or tell me which Pi you want to use.
