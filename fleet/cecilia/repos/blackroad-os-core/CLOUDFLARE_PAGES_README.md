# Cloudflare Pages Individual Deployment System

**Status:** ✅ Ready to deploy
**Date:** December 13, 2025
**Goal:** Each BlackRoad OS project gets its own unique Cloudflare Page instead of all pointing to the same content

---

## Overview

This deployment system provides everything you need to:

1. **Add custom domains** to existing Cloudflare Pages projects
2. **Create new Pages projects** for repositories that need them
3. **Generate landing pages** for projects without web UI
4. **Set up automated deployments** via GitHub Actions
5. **Clean up redundant projects** that all point to the same content

---

## Quick Start

### Run the Master Script

```bash
cd /Users/alexa/blackroad-sandbox
./scripts/deploy-individual-pages.sh
```

This interactive menu will guide you through all deployment tasks.

### Or Read the Guides

1. **Quick Start** → [`INDIVIDUAL_PAGES_QUICK_START.md`](INDIVIDUAL_PAGES_QUICK_START.md)
   - Fast overview and common commands
   - Project mapping table
   - 5-minute setup instructions

2. **Deployment Plan** → [`CLOUDFLARE_PAGES_DEPLOYMENT_PLAN.md`](CLOUDFLARE_PAGES_DEPLOYMENT_PLAN.md)
   - Comprehensive strategy
   - Priority tiers for deployment
   - Build configuration for each project type

3. **Implementation Guide** → [`CLOUDFLARE_PAGES_IMPLEMENTATION_GUIDE.md`](CLOUDFLARE_PAGES_IMPLEMENTATION_GUIDE.md)
   - Step-by-step instructions
   - Detailed troubleshooting
   - Testing checklist

---

## What's Included

### Documentation (4 files)

- `CLOUDFLARE_PAGES_README.md` - This file (overview)
- `INDIVIDUAL_PAGES_QUICK_START.md` - Quick reference
- `CLOUDFLARE_PAGES_DEPLOYMENT_PLAN.md` - Strategic plan
- `CLOUDFLARE_PAGES_IMPLEMENTATION_GUIDE.md` - Detailed guide

### Scripts (6 files)

Located in `scripts/`:

1. **`deploy-individual-pages.sh`** ⭐ **START HERE**
   - Master orchestration script
   - Interactive menu for all tasks
   - Checks prerequisites

2. **`add-custom-domains.sh`**
   - Adds custom domains via Cloudflare API
   - Automates what you'd do in dashboard
   - Requires: `CLOUDFLARE_API_TOKEN` env var

3. **`create-simple-landing-page.sh`**
   - Generates static HTML landing pages
   - For projects without existing web UI
   - Creates ready-to-deploy pages

4. **`setup-individual-pages.sh`**
   - Setup helper and status checker
   - Lists what needs to be done
   - Shows repository status

5. **`cleanup-redundant-pages.sh`**
   - Deletes duplicate subdomain projects
   - Interactive with confirmation
   - ⚠️ DESTRUCTIVE - use carefully

6. **`github-actions-template.yml`**
   - Template for auto-deployment
   - Copy to `.github/workflows/` in each repo
   - Deploys on every push to main

---

## The Problem You're Solving

**Current State:**
- You have 30+ Cloudflare Pages projects
- Most point to the same `blackroad-os-web` repository
- All domains show identical content
- Subdomain projects like `subdomains-blackroad-io` are just placeholders

**Desired State:**
- Each project has its own unique Cloudflare Page
- Each domain shows project-specific content:
  - `docs.blackroad.io` → blackroad-os-docs content
  - `prism.blackroad.io` → blackroad-os-prism-console content
  - `lucidia.earth` → lucidia-platform content
- No duplicate/redundant projects

---

## Project Categories

### ✅ Already Deployed (Just Need Custom Domains)

These have Cloudflare Pages but need custom domains:

- **blackroad-os-docs** → add `docs.blackroad.io`
- **blackroad-os-brand** → add `brand.blackroad.io`
- **blackroad-os-prism** → add `prism.blackroad.io`

**Action:** Run script option 1 or add manually in dashboard

### 🆕 Need New Pages Projects

These repositories exist but need Cloudflare Pages:

- **lucidia-platform** → `lucidia.earth`
- **lucidia-math** → `math.lucidia.earth`
- **lucidia-core** → `core.lucidia.earth`
- **blackroad-tools** → `tools.blackroad.io`

**Action:** Create via dashboard (Connect to Git) or use wrangler

### 🎨 Need Landing Pages

These don't have web UI, so we'll create simple landing pages:

- **blackroad-os-archive** → `archive.blackroad.io`
- Any pack repos that need web presence

**Action:** Run `create-simple-landing-page.sh`

### 🧹 Need Cleanup

These are redundant (all point to same content):

- `subdomains-*` projects (~10 projects)
- `blackroad-subdomains-*` projects (~15 projects)

**Action:** Run `cleanup-redundant-pages.sh` after individual projects work

---

## Deployment Workflow

### Phase 1: Existing Projects (15 minutes)

```bash
# Option A: Via script (requires API token)
export CLOUDFLARE_API_TOKEN="your-token"
./scripts/add-custom-domains.sh

# Option B: Via dashboard (manual)
# 1. Go to https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages
# 2. Click project → Custom domains → Add domain
```

### Phase 2: New Projects (30 minutes)

For each new project:

```bash
# Via dashboard (recommended):
# 1. Pages → Create project → Connect to Git
# 2. Select repo
# 3. Configure build settings
# 4. Deploy
# 5. Add custom domain

# Via CLI:
cd /path/to/repo
npm run build
wrangler pages deploy dist --project-name=project-name
```

### Phase 3: Landing Pages (15 minutes)

```bash
# Create landing page
./scripts/create-simple-landing-page.sh \
  "project-name" \
  "Project Title" \
  "Description here"

# Deploy it
cd landing-pages/project-name
wrangler pages deploy . --project-name=project-name
```

### Phase 4: Automation (1 hour, optional)

Set up GitHub Actions for each repo:

```bash
# 1. Copy template
cp scripts/github-actions-template.yml .github/workflows/deploy.yml

# 2. Edit and customize for your project

# 3. Add GitHub secrets:
#    CLOUDFLARE_API_TOKEN
#    CLOUDFLARE_ACCOUNT_ID (848cf0b18d51e0170e0d1537aec3505a)

# 4. Commit and push
```

### Phase 5: Cleanup (10 minutes)

After verifying individual projects work:

```bash
./scripts/cleanup-redundant-pages.sh
```

---

## Key Commands

```bash
# List all Pages projects
wrangler pages project list

# Deploy a project
wrangler pages deploy dist --project-name=name

# Add custom domain (via API)
export CLOUDFLARE_API_TOKEN="token"
./scripts/add-custom-domains.sh

# Create landing page
./scripts/create-simple-landing-page.sh name "Title" "Description"

# View logs
wrangler pages deployment tail --project-name=name

# Delete project (⚠️ permanent!)
wrangler pages project delete name
```

---

## Success Criteria

You'll know it's working when:

- [ ] `docs.blackroad.io` shows documentation content (not main website)
- [ ] `brand.blackroad.io` shows brand assets (not main website)
- [ ] `prism.blackroad.io` shows Prism Console (not main website)
- [ ] `lucidia.earth` shows Lucidia platform (not BlackRoad)
- [ ] Each domain has unique content from its repository
- [ ] SSL certificates are active for all domains
- [ ] No more duplicate `subdomains-*` projects

---

## Time Estimates

| Task | Time | Complexity |
|------|------|------------|
| Add custom domains | 15 min | Easy |
| Create new Pages projects | 30 min | Easy |
| Set up GitHub Actions | 1 hour | Medium |
| Create landing pages | 30 min | Easy |
| Clean up duplicates | 10 min | Easy |
| **Total (all phases)** | **2-3 hours** | Easy-Medium |

---

## Troubleshooting

### "Domain already exists on another project"

Remove it from the other project first:
1. Find which project has the domain
2. Go to that project → Custom domains
3. Remove the domain
4. Add it to the correct project

### "Build failed"

Check build logs in dashboard:
- Verify `package.json` has correct `build` script
- Test build locally: `npm run build`
- Check Node.js version compatibility
- Add missing environment variables

### "Site shows wrong content"

- Clear browser cache
- Verify domain CNAME points to correct `.pages.dev` URL
- Redeploy the correct project
- Check if domain is added to multiple projects (remove duplicates)

---

## Resources

### Cloudflare
- **Dashboard:** https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages
- **Pages Docs:** https://developers.cloudflare.com/pages
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler

### GitHub
- **BlackRoad-OS Org:** https://github.com/BlackRoad-OS
- **Pages Action:** https://github.com/cloudflare/pages-action

### Your Files
- Scripts: `/Users/alexa/blackroad-sandbox/scripts/`
- Guides: `/Users/alexa/blackroad-sandbox/CLOUDFLARE_PAGES_*.md`

---

## Next Steps

1. **Read:** `INDIVIDUAL_PAGES_QUICK_START.md` for fast overview
2. **Run:** `./scripts/deploy-individual-pages.sh` to start deployment
3. **Choose:** Manual (dashboard) or automated (scripts) approach
4. **Deploy:** Start with existing projects (add domains)
5. **Expand:** Create new projects and landing pages
6. **Automate:** Set up GitHub Actions (optional)
7. **Clean:** Remove redundant projects once done

---

## Questions?

Refer to:
- **Quick answers:** `INDIVIDUAL_PAGES_QUICK_START.md`
- **Detailed steps:** `CLOUDFLARE_PAGES_IMPLEMENTATION_GUIDE.md`
- **Strategy:** `CLOUDFLARE_PAGES_DEPLOYMENT_PLAN.md`

---

**Created:** December 13, 2025
**Account:** blackroad@gmail.com
**Account ID:** 848cf0b18d51e0170e0d1537aec3505a

🚀 Ready to deploy individual Cloudflare Pages!
