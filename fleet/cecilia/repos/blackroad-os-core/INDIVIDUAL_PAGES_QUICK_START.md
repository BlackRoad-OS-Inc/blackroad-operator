# Individual Cloudflare Pages - Quick Start

**Date:** December 13, 2025
**Goal:** Each BlackRoad OS project gets its own unique Cloudflare Page

---

## The Problem

Currently, most of your Cloudflare Pages projects point to the same `blackroad-os-web` repository, so all domains show identical content.

## The Solution

Deploy each project individually with its own:
- Dedicated Cloudflare Pages project
- Unique content from its own repository
- Custom domain pointing to that specific deployment

---

## Quick Actions

### 1. Run the Master Script

```bash
cd /Users/alexa/blackroad-sandbox
./scripts/deploy-individual-pages.sh
```

This interactive script will guide you through:
- Adding custom domains to existing projects
- Creating landing pages for projects without web UI
- Setting up GitHub Actions for auto-deployment
- Cleaning up redundant projects

### 2. Or Do It Manually

#### Add Custom Domains (2 minutes per project)

Go to https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages

For each project:
1. Click on project name (e.g., `blackroad-os-docs`)
2. Go to "Custom domains" tab
3. Click "Set up a custom domain"
4. Enter domain: `docs.blackroad.io`
5. Click "Activate domain"

**Projects to configure:**
- `blackroad-os-docs` → `docs.blackroad.io`
- `blackroad-os-brand` → `brand.blackroad.io`
- `blackroad-os-prism` → `prism.blackroad.io`

#### Create New Pages Projects (5 minutes per project)

For repos that need new Cloudflare Pages:

1. Go to https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages
2. Click "Create a project" → "Connect to Git"
3. Select repository (e.g., `lucidia-platform`)
4. Configure build settings:
   - Build command: `npm run build`
   - Build output: `dist`
5. Click "Save and Deploy"
6. Add custom domain once deployed

**Projects to create:**
- `lucidia-platform` → `lucidia.earth`
- `lucidia-math` → `math.lucidia.earth`
- `lucidia-core` → `core.lucidia.earth`
- `blackroad-tools` → `tools.blackroad.io`

---

## File Reference

All scripts and documentation are in `/Users/alexa/blackroad-sandbox/`:

### Documentation
- `CLOUDFLARE_PAGES_DEPLOYMENT_PLAN.md` - Comprehensive plan
- `CLOUDFLARE_PAGES_IMPLEMENTATION_GUIDE.md` - Step-by-step guide
- `INDIVIDUAL_PAGES_QUICK_START.md` - This file

### Scripts
- `scripts/deploy-individual-pages.sh` - **Master script** (start here)
- `scripts/add-custom-domains.sh` - Add domains via API
- `scripts/create-simple-landing-page.sh` - Generate landing pages
- `scripts/setup-individual-pages.sh` - Setup helper
- `scripts/cleanup-redundant-pages.sh` - Delete duplicate projects
- `scripts/github-actions-template.yml` - Auto-deployment template

---

## Project Mapping

| Repository | Cloudflare Pages | Custom Domain | Status |
|-----------|-----------------|---------------|--------|
| blackroad-os-web | blackroad-os-web | blackroad.io | ✅ Done |
| blackroad-os-docs | blackroad-os-docs | docs.blackroad.io | ⚠️ Add domain |
| blackroad-os-brand | blackroad-os-brand | brand.blackroad.io | ⚠️ Add domain |
| blackroad-os-prism-console | blackroad-os-prism | prism.blackroad.io | ⚠️ Add domain |
| lucidia-platform | ❌ Create new | lucidia.earth | ❌ Create |
| lucidia-math | ❌ Create new | math.lucidia.earth | ❌ Create |
| lucidia-core | ❌ Create new | core.lucidia.earth | ❌ Create |
| blackroad-tools | ❌ Create new | tools.blackroad.io | ❌ Create |

---

## Common Commands

### List all Pages projects
```bash
wrangler pages project list
```

### Deploy a project manually
```bash
cd /path/to/project
npm run build
wrangler pages deploy dist --project-name=project-name
```

### Add custom domain via API
```bash
export CLOUDFLARE_API_TOKEN="your-token"
./scripts/add-custom-domains.sh
```

### Create a landing page
```bash
./scripts/create-simple-landing-page.sh \
  "project-name" \
  "Project Title" \
  "Project description"
```

### Clean up duplicates (⚠️ DESTRUCTIVE)
```bash
./scripts/cleanup-redundant-pages.sh
```

---

## Next Steps

1. **Immediate** (5 minutes):
   - Run `./scripts/deploy-individual-pages.sh`
   - Select option 1 to add custom domains

2. **Short-term** (30 minutes):
   - Create Pages projects for lucidia-platform, lucidia-math, etc.
   - Add custom domains to each

3. **Optional** (1-2 hours):
   - Set up GitHub Actions for auto-deployment
   - Create landing pages for projects without web UI
   - Clean up redundant subdomain projects

---

## Troubleshooting

**"Domain already exists"**
→ Remove it from the other Pages project first

**"Build failed"**
→ Check build logs in Cloudflare dashboard
→ Verify `package.json` has correct build command

**"Custom domain not resolving"**
→ Wait 1-5 minutes for DNS propagation
→ Check CNAME record points to correct `.pages.dev` URL

**"Still showing old content"**
→ Clear browser cache
→ Verify domain points to correct Pages project
→ Redeploy the project

---

## Support

- **Cloudflare Dashboard:** https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a
- **Cloudflare Docs:** https://developers.cloudflare.com/pages
- **Questions?** Check the implementation guide: `CLOUDFLARE_PAGES_IMPLEMENTATION_GUIDE.md`

---

**Estimated Time:** 30 minutes to 2 hours (depending on how many projects you deploy)
