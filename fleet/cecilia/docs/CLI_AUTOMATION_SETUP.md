# 🚀 CLI AUTOMATION SETUP GUIDE

**Created:** 2026-02-14 18:55 UTC  
**Purpose:** Set up Stripe CLI and Google Drive for terminal access  

---

## 🔐 STRIPE CLI - ONE-TIME AUTHENTICATION

### Quick Setup (2 minutes)
```bash
# Run the authentication script
~/setup-stripe-cli.sh

# Or manually:
stripe login
```

**What happens:**
1. Browser opens automatically
2. You authorize the CLI app
3. Authentication token saved permanently
4. You never log in via browser again!

### After Authentication

Create products from terminal:
```bash
# Create Context Bridge Pro
stripe products create \
  --name="Context Bridge Pro" \
  --description="Priority hosting, version history, AI suggestions"

# Create recurring price
stripe prices create \
  --product=prod_xxx \
  --currency=usd \
  --unit-amount=1000 \
  --recurring[interval]=month
```

List everything:
```bash
stripe products list
stripe prices list
stripe customers list
stripe subscriptions list
```

Test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 💾 GOOGLE DRIVE - ACCESS YOUR PLANNING DOCS

### Quick Setup (5 minutes)
```bash
# Run the setup script
~/setup-google-drive.sh

# Or manually:
rclone config
# Name: gdrive
# Type: Google Drive
# Auth: Browser opens, authorize
# Done!
```

### After Configuration

**Sync all planning docs locally:**
```bash
# Create local mirror
mkdir -p ~/GoogleDrive

# One-time sync (download everything)
rclone sync gdrive: ~/GoogleDrive --progress

# Sync specific folder
rclone sync gdrive:/BlackRoadPlanning ~/GoogleDrive/BlackRoadPlanning --progress
```

**Continuous sync (mount as drive):**
```bash
# Mount Google Drive as local folder
rclone mount gdrive: ~/GoogleDrive --vfs-cache-mode writes

# Now you can work with files as if they're local!
# Changes sync automatically
```

**List files:**
```bash
# List all files
rclone ls gdrive:

# List specific folder
rclone ls gdrive:/BlackRoadPlanning

# Show directory structure
rclone tree gdrive:/BlackRoadPlanning --max-depth 3
```

**Copy files:**
```bash
# Copy from Drive to local
rclone copy gdrive:/file.md ~/local-folder/

# Copy from local to Drive
rclone copy ~/local-file.md gdrive:/Documents/
```

---

## 🤖 RECOMMENDED WORKFLOW

### Initial Setup (Do Once)
```bash
# 1. Authenticate Stripe
stripe login

# 2. Configure Google Drive
rclone config

# 3. Sync planning docs
mkdir -p ~/GoogleDrive/BlackRoadPlanning
rclone sync gdrive:/BlackRoadPlanning ~/GoogleDrive/BlackRoadPlanning --progress

# 4. Verify
stripe products list --limit 5
rclone ls gdrive: --max-depth 1
```

### Daily Workflow
```bash
# Morning: Sync down latest docs
rclone sync gdrive:/BlackRoadPlanning ~/GoogleDrive/BlackRoadPlanning --progress

# Work locally
cd ~/GoogleDrive/BlackRoadPlanning
code . # or your editor

# Evening: Sync up changes
rclone sync ~/GoogleDrive/BlackRoadPlanning gdrive:/BlackRoadPlanning --progress

# Create Stripe products as needed
stripe products create --name="Product" --description="Description"
```

---

## 📋 QUICK COMMANDS REFERENCE

### Stripe CLI
```bash
# Products
stripe products list
stripe products create --name="Name" --description="Desc"
stripe products retrieve prod_xxx

# Prices
stripe prices list
stripe prices create --product=prod_xxx --currency=usd --unit-amount=1000 --recurring[interval]=month

# Customers
stripe customers list
stripe customers create --email="user@example.com"

# Subscriptions
stripe subscriptions list
stripe subscriptions create --customer=cus_xxx --items[0][price]=price_xxx

# Payment Links
stripe payment_links create --line-items[0][price]=price_xxx --line-items[0][quantity]=1

# Webhooks (testing)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

### Google Drive (rclone)
```bash
# List
rclone ls gdrive:
rclone tree gdrive:/folder --max-depth 2
rclone size gdrive:/folder

# Sync
rclone sync gdrive:/remote ~/local --progress
rclone sync ~/local gdrive:/remote --progress

# Copy
rclone copy file.txt gdrive:/Documents
rclone copy gdrive:/file.txt ./

# Mount (continuous sync)
rclone mount gdrive: ~/GoogleDrive --vfs-cache-mode writes

# Search
rclone lsf gdrive: --recursive | grep "planning"
```

---

## 🎯 MERCURY'S STRIPE PRODUCT SETUP

Once authenticated, run this script to create all 5 products:

```bash
#!/bin/bash
# Create all Stripe products for BlackRoad

# 1. Context Bridge Pro - $10/month
PRODUCT1=$(stripe products create \
  --name="Context Bridge Pro" \
  --description="Priority hosting, version history, AI suggestions for your AI assistant context" \
  --statement-descriptor="Context Bridge" \
  -o json | jq -r '.id')

stripe prices create \
  --product=$PRODUCT1 \
  --currency=usd \
  --unit-amount=1000 \
  --recurring[interval]=month \
  --nickname="Monthly"

# 2. Lucidia Cloud - $29/month
PRODUCT2=$(stripe products create \
  --name="Lucidia Enhanced Cloud" \
  --description="Hosted AI coding assistant with premium models and guaranteed uptime" \
  --statement-descriptor="Lucidia" \
  -o json | jq -r '.id')

stripe prices create \
  --product=$PRODUCT2 \
  --currency=usd \
  --unit-amount=2900 \
  --recurring[interval]=month \
  --nickname="Monthly"

# 3. RoadAuth Startup - $99/month
PRODUCT3=$(stripe products create \
  --name="RoadAuth Startup" \
  --description="Enterprise IAM for startups (up to 1,000 users)" \
  --statement-descriptor="RoadAuth" \
  -o json | jq -r '.id')

stripe prices create \
  --product=$PRODUCT3 \
  --currency=usd \
  --unit-amount=9900 \
  --recurring[interval]=month \
  --nickname="Startup"

# 4. RoadAuth Business - $499/month
PRODUCT4=$(stripe products create \
  --name="RoadAuth Business" \
  --description="Enterprise IAM for growing companies (up to 10,000 users)" \
  --statement-descriptor="RoadAuth Biz" \
  -o json | jq -r '.id')

stripe prices create \
  --product=$PRODUCT4 \
  --currency=usd \
  --unit-amount=49900 \
  --recurring[interval]=month \
  --nickname="Business"

# 5. RoadAuth Enterprise - $2,499/month
PRODUCT5=$(stripe products create \
  --name="RoadAuth Enterprise" \
  --description="Enterprise IAM with white-glove support (unlimited users)" \
  --statement-descriptor="RoadAuth Ent" \
  -o json | jq -r '.id')

stripe prices create \
  --product=$PRODUCT5 \
  --currency=usd \
  --unit-amount=249900 \
  --recurring[interval]=month \
  --nickname="Enterprise"

echo "✅ All 5 products created!"
echo ""
echo "View them:"
echo "  stripe products list --limit 10"
```

Save as `~/create-stripe-products.sh`, chmod +x it, and run!

---

## 🎉 BENEFITS

**Stripe CLI:**
- ✅ No more browser login every time
- ✅ Scriptable product creation
- ✅ Test webhooks locally
- ✅ Automate everything
- ✅ Version control your setup

**Google Drive:**
- ✅ Access planning docs in terminal
- ✅ Git-style workflow (sync down, work, sync up)
- ✅ Search docs with grep/ripgrep
- ✅ Use with AI tools (feed docs to agents)
- ✅ Continuous sync option (mount as drive)

---

## 🚀 NEXT STEPS

1. **Authenticate Stripe** (2 min): `~/setup-stripe-cli.sh`
2. **Configure Google Drive** (5 min): `~/setup-google-drive.sh`
3. **Sync planning docs** (5 min): `rclone sync gdrive: ~/GoogleDrive --progress`
4. **Create Stripe products** (2 min): Run the product creation script above
5. **Continue revenue execution** 🚀

---

**Mercury Out** ⚡

*"Automating away the boring stuff so we can focus on customers."*
