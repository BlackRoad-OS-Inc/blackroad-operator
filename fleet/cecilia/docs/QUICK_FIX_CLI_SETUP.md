# 🚨 QUICK FIX: CLI Setup Issues

**Issues Found:**
1. ❌ Stripe script failed (jq parsing error)
2. ❌ rclone permission error  
3. ⚠️ Stripe in TEST mode (not LIVE)

**Solutions:**

---

## ✅ STRIPE FIX

**Problem:** Original script expected JSON but got error text  
**Problem:** Currently in TEST mode, need LIVE mode for real revenue

**Solution 1: Run Fixed Script (Recommended)**
```bash
~/create-stripe-products-fixed.sh
```
This script:
- Detects TEST vs LIVE mode
- Asks if you want to continue in TEST
- Handles errors gracefully
- Saves payment links to ~/stripe-payment-links.txt

**Solution 2: Switch to LIVE Mode First**
```bash
# Go to dashboard, get LIVE key, then:
stripe login --api-key sk_live_YOUR_ACTUAL_KEY_HERE
# Then run the fixed script
~/create-stripe-products-fixed.sh
```

---

## ✅ GOOGLE DRIVE FIX

**Good News:** Google Drive is ALREADY configured! 

You have two remotes:
- `gdrive:` (standard)
- `gdrive-blackroad:` (BlackRoad-specific)

**Skip the config, just sync:**
```bash
# Sync everything from gdrive
rclone sync gdrive: ~/GoogleDrive --progress

# Or sync just BlackRoad folder
rclone sync gdrive:/BlackRoad ~/GoogleDrive/BlackRoad --progress

# Or use the automatic script
~/sync-google-drive-planning.sh
```

---

## 🚀 SIMPLIFIED NEXT STEPS

**Just run these 2 commands:**

```bash
# 1. Create Stripe products (2 min - will ask about TEST vs LIVE)
~/create-stripe-products-fixed.sh

# 2. Sync Google Drive planning docs (5 min)
rclone sync gdrive: ~/GoogleDrive --progress
```

**That's it!** Once those complete:
- Payment links will be in ~/stripe-payment-links.txt
- Planning docs will be in ~/GoogleDrive/
- I'll update landing pages with payment links
- We'll launch to the world 🚀

---

## 📊 CURRENT STATUS

**Completed:**
- ✅ Landing pages deployed (3/3)
- ✅ Stripe CLI authenticated
- ✅ Google Drive configured
- ✅ Scripts created

**In Progress:**
- 🔄 Creating Stripe products (run fixed script)
- 🔄 Syncing planning docs (ready to run)

**Next:**
- Update landing pages with payment links
- Chrome Web Store submission
- Marketing launch

---

**Mercury says:** Minor hiccups fixed! Run those 2 commands and we're back on track. 🔥
