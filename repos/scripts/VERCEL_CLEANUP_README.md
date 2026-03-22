# 🧹 Vercel Deployment Cleanup Guide

## Problem Fixed

**Issue:** Missing comma in `sites/blackroad/vercel.json` (line 9) was causing all deployments to fail.

**Status:** ✅ **FIXED** - The JSON syntax error has been corrected.

---

## Quick Cleanup (Recommended)

The easiest way to clean up failed deployments is through the Vercel dashboard:

### Option 1: Vercel Dashboard (Web)

1. Go to https://vercel.com/alexa-amundsons-projects
2. Click on each project with failed deployments
3. Go to "Deployments" tab
4. Click the "..." menu on failed deployments
5. Select "Delete"

**Filter tip:** Use the status filter to show only "Error" or "Canceled" deployments.

### Option 2: Automated Cleanup Script

Use the provided script to bulk-delete failed deployments:

```bash
# First, make sure Vercel CLI is installed and authenticated
npm i -g vercel
vercel login

# Dry run - see what would be deleted (RECOMMENDED FIRST)
cd /home/user/blackroad-prism-console/scripts
node cleanup-vercel-deployments.cjs --dry-run --failed

# Delete only failed deployments
node cleanup-vercel-deployments.cjs --failed

# Delete failed deployments older than 7 days
node cleanup-vercel-deployments.cjs --failed --older-than 7

# Clean specific project
node cleanup-vercel-deployments.cjs --project blackroad --failed

# Nuclear option: Delete all deployments older than 30 days
node cleanup-vercel-deployments.cjs --older-than 30
```

---

## Script Options

```
--project <name>      Target specific project (default: all projects)
--failed              Remove only failed deployments
--older-than <days>   Remove deployments older than N days (default: 30)
--dry-run             Show what would be deleted without deleting
--team <id>           Specify team ID
```

---

## Prevent Future Failures

### 1. The JSON Syntax Error is Now Fixed ✅

The main issue causing failures was:
```json
// BEFORE (broken):
"github": {
  "silent": true
}
"rewrites": [  // ❌ Missing comma!

// AFTER (fixed):
"github": {
  "silent": true
},
"rewrites": [  // ✅ Comma added
```

### 2. Test Deployments Locally

Before pushing, test your builds locally:

```bash
# For sites/blackroad
cd sites/blackroad
npm install
npm run build

# For sites/blackroadinc
cd sites/blackroadinc
npm install
npm run build
```

### 3. Use Vercel CLI for Manual Deployments

```bash
# Deploy from local directory
cd sites/blackroad
vercel --prod

# Or preview deployment
vercel
```

### 4. Enable Build Caching

Your config already has this, but ensure build caching is working:
```json
{
  "installCommand": "npm ci --omit=optional"
}
```

---

## Projects in Your Vercel Account

Based on the config files found:

1. **blackroad** (`sites/blackroad/`)
   - Framework: Vite
   - Output: `dist/`
   - Status: ✅ Config fixed

2. **blackroadinc** (`sites/blackroadinc/`)
   - Simple redirect to blackroad.io
   - Status: ✅ Config looks good

3. **portals** (`apps/portals/`)
   - Project ID: `prj_RcWvIKQZm0gYpT2MemwRzfIWh6XA`
   - Status: Check for vercel.json

---

## Quick Commands Reference

```bash
# List all deployments
vercel ls

# List deployments for specific project
vercel ls blackroad

# Remove specific deployment
vercel rm <deployment-url> --yes

# Check current project
vercel project

# Link to Vercel project
vercel link
```

---

## Troubleshooting

### "Command not found: vercel"

```bash
npm i -g vercel
```

### "Error: Not authenticated"

```bash
vercel login
```

### "Error: No access to team"

Make sure you're logged in with the correct account:
```bash
vercel whoami
vercel logout
vercel login
```

### Deployments Still Failing After Fix?

1. Check build logs in Vercel dashboard
2. Verify package.json has correct scripts
3. Ensure dependencies are properly specified
4. Check environment variables are set

---

## Summary

**✅ Fixed:** JSON syntax error in vercel.json
**🧹 Cleanup:** Use the script or Vercel dashboard to remove failed deployments
**🚀 Next Deploy:** Should succeed now that the config is fixed

**Recommended Action:**
```bash
# 1. Clean up failed deployments (dry run first)
cd /home/user/blackroad-prism-console/scripts
node cleanup-vercel-deployments.cjs --failed --dry-run

# 2. If it looks good, run for real
node cleanup-vercel-deployments.cjs --failed

# 3. Test a fresh deployment
cd ../sites/blackroad
vercel --prod
```

---

**Note:** The cleanup script preserves production deployments unless they're explicitly failed. Preview deployments are cleaned based on age and status.
