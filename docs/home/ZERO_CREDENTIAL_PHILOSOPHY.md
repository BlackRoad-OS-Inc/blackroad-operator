# 🔐 BLACKROAD ZERO-CREDENTIAL PHILOSOPHY

**Timestamp:** 2026-02-16 04:20 UTC  
**Status:** Active Standard  
**Memory Hash:** 49909fd1

---

## 🎯 THE RULE

**If a script asks a human for an API key, button click, or manual step - the automation is incomplete.**

---

## ✅ THE NEW STANDARD

### One-Time Setup (Per Service)
```bash
# Stripe
stripe login

# GitHub  
gh auth login

# Railway
railway login

# Cloudflare
wrangler login
```

### Forever After
```bash
# Every script automatically reads credentials from:
~/.blackroad/vault/

# No more:
# - "Please enter your API key"
# - "Go to dashboard and click..."
# - "Paste your webhook secret"
# - "Copy this token"
```

---

## 🏗️ ARCHITECTURE

### BlackRoad Vault (`~/blackroad-vault.sh`)

**Auto-discovers credentials from:**
- CLI tool configs (`~/.config/`, `~/.wrangler/`, etc.)
- Environment variables
- `.env` files in projects
- Service-specific config files

**Stores in:**
```
~/.blackroad/vault/
├── stripe_secret_key
├── stripe_publishable_key
├── clerk_secret_key
├── railway_token
├── github_token
├── cloudflare_api_token
├── openai_api_key
└── anthropic_api_key
```

**Scripts use:**
```bash
#!/bin/bash
# Load vault at start of any script
source <(~/blackroad-vault.sh load)

# Now use credentials
stripe products create \
    --name="My Product" \
    --api-key="$STRIPE_SECRET_KEY"  # Auto-loaded!
```

---

## 📋 SERVICES COVERED

| Service | CLI Tool | Vault Key | One-Time Setup |
|---------|----------|-----------|----------------|
| Stripe | `stripe` | `stripe_secret_key` | `stripe login` |
| Clerk | Manual | `clerk_secret_key` | Dashboard → API Keys |
| Railway | `railway` | `railway_token` | `railway login` |
| GitHub | `gh` | `github_token` | `gh auth login` |
| Cloudflare | `wrangler` | `cloudflare_api_token` | `wrangler login` |
| OpenAI | Manual | `openai_api_key` | Platform → API Keys |
| Anthropic | Manual | `anthropic_api_key` | Console → API Keys |

---

## 🚀 UPDATED SCRIPTS

### Before (BAD ❌)
```bash
echo "Enter your Stripe API key:"
read STRIPE_KEY

echo "Go to dashboard.stripe.com and create a product"
echo "Then paste the product ID:"
read PRODUCT_ID
```

### After (GOOD ✅)
```bash
# Load vault
source <(~/blackroad-vault.sh load)

# Auto-create product
PRODUCT_ID=$(stripe products create \
    --name="My Product" \
    --format=json | jq -r '.id')

echo "✅ Product created: $PRODUCT_ID"
```

---

## 📦 SCRIPTS UPDATED

### 1. `stripe-full-auto-setup.sh`
- ✅ Reads from vault
- ✅ Creates all products via API
- ✅ Zero manual steps

### 2. `clerk-stripe-railway-enhanced.js`
- ✅ Loads from vault on startup
- ✅ No config file needed

### 3. `railway-deploy-enhanced.sh`
- ✅ Auto-authenticated
- ✅ Deploys without prompts

### 4. All future scripts
- ✅ Must load vault at start
- ✅ Must never ask for keys
- ✅ Must auto-discover credentials

---

## 🔄 WORKFLOW

```
┌─────────────────────────┐
│  One-Time CLI Login     │
│  (stripe login, etc.)   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  blackroad-vault.sh     │
│  Auto-discovers keys    │
│  Stores in ~/.blackroad/│
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  All Scripts Forever    │
│  source vault → work    │
│  Zero manual input      │
└─────────────────────────┘
```

---

## 💡 BENEFITS

1. **One-Time Setup**  
   Login to each service once via CLI

2. **Forever Automated**  
   All scripts auto-load credentials

3. **No Copy/Paste**  
   Never paste API keys again

4. **No Dashboard Clicks**  
   All operations via API

5. **Secure Storage**  
   Credentials in `~/.blackroad/vault/` (gitignored)

6. **Easy Updates**  
   Rerun `blackroad-vault.sh discover` anytime

7. **Portable**  
   Generate `.env` for any project: `blackroad-vault.sh env`

---

## 🎯 ENFORCEMENT

### Code Review Checklist

- [ ] Script loads vault at start
- [ ] No `read` statements for credentials
- [ ] No "go to dashboard" instructions
- [ ] All API operations automated
- [ ] No manual button clicking
- [ ] Credentials from vault only

### If Script Asks for Manual Input

1. **Stop** - Don't commit
2. **Fix** - Make it read from vault
3. **Update** - Use service API instead of dashboard
4. **Test** - Run without any prompts
5. **Commit** - Only when fully automated

---

## 📚 EXAMPLES

### Stripe Product Creation
```bash
#!/bin/bash
source <(~/blackroad-vault.sh load)

# Create product via API (not dashboard)
stripe products create \
    --name="My Product" \
    --description="Auto-created" \
    --api-key="$STRIPE_SECRET_KEY"
```

### Railway Deployment
```bash
#!/bin/bash
source <(~/blackroad-vault.sh load)

# Deploy without prompts
railway up --service=my-service --detach
```

### GitHub Repo Creation
```bash
#!/bin/bash
source <(~/blackroad-vault.sh load)

# Create repo via API
gh repo create my-new-repo --public
```

---

## 🔐 SECURITY

1. **Vault Location:** `~/.blackroad/vault/` (mode 700)
2. **File Permissions:** Each key file is mode 600
3. **Git Ignore:** Vault is in `.gitignore`
4. **No Hardcoding:** Never put keys in scripts
5. **Env Isolation:** Each script gets fresh environment

---

## 🚀 GETTING STARTED

```bash
# 1. One-time service logins (as needed)
stripe login
gh auth login
railway login
wrangler login

# 2. Discover all credentials
~/blackroad-vault.sh discover

# 3. Check what was found
~/blackroad-vault.sh show

# 4. Use in any script
source <(~/blackroad-vault.sh load)
echo "Stripe key: $STRIPE_SECRET_KEY"  # Auto-loaded!
```

---

## 📊 IMPACT

### Before
- 🕐 5 minutes per script to paste keys
- ❌ Keys exposed in shell history
- ❌ Manual dashboard operations
- ❌ Forgotten where keys are stored

### After
- ⚡ 0 seconds - fully automated
- ✅ Keys secured in vault
- ✅ All operations via API
- ✅ Single source of truth

---

**Status:** ✅ ACTIVE STANDARD  
**Applies To:** All scripts, all services, forever  
**Exceptions:** None

*If you're asking a human for credentials, you're doing it wrong.* 🚀
