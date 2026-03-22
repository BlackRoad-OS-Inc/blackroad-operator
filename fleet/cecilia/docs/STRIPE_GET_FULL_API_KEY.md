# 🔑 Get Full Stripe API Key for Product Creation

## Problem
The current key (`rk_live_...`) is a **restricted key** and can't create products.

## Solution
Get a full **secret key** (`sk_live_...`) with write permissions.

## Steps (2 minutes)

### 1. Open Stripe Dashboard
```bash
open https://dashboard.stripe.com/apikeys
```
Or manually go to: **Dashboard → Developers → API Keys**

### 2. Create New Secret Key
- Click **"+ Create secret key"**
- Name: `CLI Product Creation`
- Permissions: **Full access** (or at least: Products, Prices, Payment Links)
- Click **"Create key"**

### 3. Copy the key (starts with `sk_live_...`)
**IMPORTANT**: Save this immediately - you can only see it once!

### 4. Authenticate Stripe CLI
```bash
stripe login --interactive --project-name=blackroad-os
```
Paste the `sk_live_...` key when prompted

### 5. Run Product Creation
```bash
~/create-stripe-products-now.sh
```

## Security Note
- Never commit the `sk_live_` key to git
- Keep it in `~/.config/stripe/config.toml` only
- It will expire in 90 days (CLI auto-renews)

