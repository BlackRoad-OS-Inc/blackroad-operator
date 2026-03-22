# Cloudflare Pages Individual Deployment - Implementation Guide

**Date:** December 13, 2025
**Status:** Ready to implement
**Goal:** Deploy each BlackRoad OS project to its own Cloudflare Page

---

## Quick Start

### 1. Add Custom Domains to Existing Projects

The fastest way to make each Page unique:

```bash
# Set your Cloudflare API token
export CLOUDFLARE_API_TOKEN="your-token-here"

# Run the automated script
./scripts/add-custom-domains.sh
```

Or manually in Cloudflare dashboard:
- Go to https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages
- For each project (blackroad-os-docs, blackroad-os-brand, blackroad-os-prism):
  - Click on the project name
  - Go to "Custom domains" tab
  - Click "Set up a custom domain"
  - Enter the domain and click "Activate domain"

**Custom domains to add:**
- `blackroad-os-docs` → `docs.blackroad.io`
- `blackroad-os-brand` → `brand.blackroad.io`
- `blackroad-os-prism` → `prism.blackroad.io`

### 2. Create New Pages Projects

For repositories that already exist but don't have Pages projects:

#### Option A: Via Cloudflare Dashboard (Recommended for Git-connected projects)

1. Go to https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages
2. Click "Create a project"
3. Click "Connect to Git"
4. Select the repository from GitHub
5. Configure build settings:

**lucidia-platform:**
```
Framework preset: Vite (or detect automatically)
Build command: npm run build
Build output directory: dist
Root directory: /
```

**lucidia-math:**
```
Framework preset: None (or Vite if it has a build)
Build command: npm run build (or leave empty if no build)
Build output directory: dist (or public if static)
Root directory: /
```

**lucidia-core:**
```
Framework preset: None
Build command: npm run build (if applicable)
Build output directory: dist
Root directory: /
```

**blackroad-tools:**
```
Framework preset: None or React
Build command: npm run build
Build output directory: dist
Root directory: /
```

6. Click "Save and Deploy"
7. Once deployed, add custom domain

#### Option B: Via Wrangler CLI (For existing built projects)

```bash
# Navigate to the project directory
cd /path/to/lucidia-platform

# Build the project
npm install
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=lucidia-platform

# The first deployment creates the project automatically
```

#### Option C: Create Simple Landing Pages (For projects without web UI)

```bash
# Create a landing page
./scripts/create-simple-landing-page.sh \
  "lucidia-math" \
  "Lucidia Math" \
  "Advanced mathematical engines for consciousness modeling and unified geometry"

# Deploy it
cd landing-pages/lucidia-math
wrangler pages deploy . --project-name=lucidia-math
```

### 3. Set Up GitHub Actions for Auto-Deployment

For each repository that should auto-deploy:

```bash
# 1. Add the workflow file
cp scripts/github-actions-template.yml .github/workflows/deploy-cloudflare-pages.yml

# 2. Edit the workflow file and replace:
#    - PROJECT_NAME_HERE → actual project name (e.g., "blackroad-os-docs")
#    - directory: dist → your actual build output directory

# 3. Add GitHub secrets (do this once per repository):
#    Go to GitHub repo → Settings → Secrets and variables → Actions
#    Add these secrets:
#      CLOUDFLARE_API_TOKEN: (your Cloudflare API token)
#      CLOUDFLARE_ACCOUNT_ID: 848cf0b18d51e0170e0d1537aec3505a

# 4. Commit and push
git add .github/workflows/deploy-cloudflare-pages.yml
git commit -m "Add Cloudflare Pages deployment workflow"
git push
```

### 4. Clean Up Redundant Projects

Once individual projects are deployed, delete the duplicate subdomain projects:

```bash
# List of projects to potentially delete (these all point to same content):
# - subdomains-blackroad-io
# - subdomains-blackroad-me
# - subdomains-blackroad-network
# - blackroad-subdomains-*
# ... (20+ similar projects)

# Delete via wrangler (careful! this is permanent)
wrangler pages project delete subdomains-blackroad-io
wrangler pages project delete blackroad-subdomains-blackroad-io
# ... repeat for each redundant project

# Or delete via dashboard:
# https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages
# Click on project → Settings → Delete project
```

---

## Project-by-Project Deployment Status

### ✅ Already Deployed (Just Need Custom Domains)

| Project | Pages Name | Repo | Custom Domain | Action |
|---------|-----------|------|---------------|--------|
| Documentation | blackroad-os-docs | blackroad-os-docs | docs.blackroad.io | Add domain |
| Brand Assets | blackroad-os-brand | blackroad-os-brand | brand.blackroad.io | Add domain |
| Prism Console | blackroad-os-prism | blackroad-os-prism-console | prism.blackroad.io | Add domain |
| Main Website | blackroad-os-web | blackroad-os-web | blackroad.io | Already done ✅ |

### ⏳ Need to Create Pages Projects

| Project | Repo | Custom Domain | Has Web UI? | Strategy |
|---------|------|---------------|-------------|----------|
| Lucidia Platform | lucidia-platform | lucidia.earth | Yes | Connect to Git |
| Lucidia Math | lucidia-math | math.lucidia.earth | Maybe | Check repo, create landing if needed |
| Lucidia Core | lucidia-core | core.lucidia.earth | Maybe | Check repo, create landing if needed |
| BlackRoad Tools | blackroad-tools | tools.blackroad.io | Maybe | Check repo, create landing if needed |
| Archive | blackroad-os-archive | archive.blackroad.io | No | Create simple archive viewer |

### ❌ Need to Build Applications

| Project | Custom Domain | Description | Action |
|---------|---------------|-------------|--------|
| Agent Marketplace | agents.blackroad.io | Browse and install agent templates | Build React app |
| Chat Interface | chat.blackroad.io | Chat with agents | Build React app |
| API Docs | api.blackroad.io | API documentation | Generate from OpenAPI specs |
| Status Dashboard | status.blackroad.io | System status | Build simple status page |

---

## Detailed Steps

### Step 1: Verify Repository Structure

Before connecting to Cloudflare Pages, check what each repo contains:

```bash
# Check if repo has a web UI
gh repo view BlackRoad-OS/lucidia-platform --json url,description
gh repo view BlackRoad-OS/lucidia-math --json url,description

# Clone and inspect if needed
git clone https://github.com/BlackRoad-OS/lucidia-platform.git /tmp/lucidia-platform
ls -la /tmp/lucidia-platform
cat /tmp/lucidia-platform/package.json
```

### Step 2: Configure Build Settings

Each project type has different build requirements:

#### Vite/React Projects
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```
Build output: `dist/`

#### Next.js Projects
```json
{
  "scripts": {
    "build": "next build",
    "export": "next export"
  }
}
```
Build output: `.next/` or `out/` (for static export)

For Cloudflare Pages with Next.js, use `@cloudflare/next-on-pages`:
```bash
npm install --save-dev @cloudflare/next-on-pages
```

#### Static HTML Sites
No build needed. Deploy the folder directly.
Build output: `.` or `public/`

#### Documentation Sites (VitePress, Docusaurus, etc.)
```json
{
  "scripts": {
    "docs:build": "vitepress build docs"
  }
}
```
Build output: `docs/.vitepress/dist/`

### Step 3: Create Cloudflare Pages Project (Detailed)

#### Using Dashboard (Best for first-time setup)

1. **Navigate to Pages**
   - Go to https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages
   - Click "Create a project"

2. **Connect to Git**
   - Click "Connect to Git"
   - Authorize Cloudflare with GitHub (if not already done)
   - Select the BlackRoad-OS organization
   - Select the repository (e.g., `lucidia-platform`)

3. **Configure Build**
   - **Project name:** lucidia-platform (auto-filled)
   - **Production branch:** main (or master)
   - **Framework preset:** Auto-detect or select manually
   - **Build command:** `npm run build` (or auto-detected)
   - **Build output directory:** `dist` (or auto-detected)
   - **Root directory:** `/` (leave empty for root)

4. **Environment Variables** (if needed)
   - Add any required env vars (e.g., `VITE_API_URL`, `NEXT_PUBLIC_API_URL`)

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for first build (usually 2-5 minutes)

6. **Add Custom Domain**
   - Once deployed, go to "Custom domains" tab
   - Click "Set up a custom domain"
   - Enter domain (e.g., `lucidia.earth`)
   - Cloudflare will automatically create CNAME record
   - Wait for SSL certificate (1-2 minutes)

#### Using Wrangler CLI (Best for scripting)

```bash
# Build locally first
cd /path/to/project
npm install
npm run build

# Deploy
wrangler pages deploy dist --project-name=project-name --branch=main

# Output will show:
# ✨ Success! Uploaded X files
# ✨ Deployment complete! Take a peek over at https://xxxxxx.project-name.pages.dev
```

To add custom domain via CLI (requires API):
```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/848cf0b18d51e0170e0d1537aec3505a/pages/projects/project-name/domains" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"lucidia.earth"}'
```

### Step 4: Test Deployment

After deployment, test each site:

```bash
# Test the Pages URL
curl -I https://project-name.pages.dev

# Test the custom domain (after DNS propagates)
curl -I https://lucidia.earth

# Check SSL
curl -vI https://lucidia.earth 2>&1 | grep "SSL certificate"

# Load in browser
open https://lucidia.earth
```

---

## Troubleshooting

### Build Fails

**Error:** "Build command failed"

**Solutions:**
1. Check build logs in Cloudflare dashboard
2. Verify `package.json` has correct build script
3. Test build locally: `npm run build`
4. Check Node.js version compatibility
5. Add environment variables if needed

### Custom Domain Not Working

**Error:** "This site can't be reached"

**Solutions:**
1. Wait for DNS propagation (up to 48 hours, usually <5 minutes)
2. Check CNAME record in Cloudflare DNS:
   ```
   docs.blackroad.io CNAME blackroad-os-docs.pages.dev
   ```
3. Ensure domain is active in Pages project
4. Check SSL certificate status
5. Try clearing browser cache

### Wrong Content Displayed

**Error:** "Site shows content from blackroad-os-web instead of specific project"

**Solutions:**
1. Verify Pages project is connected to correct GitHub repo
2. Check if custom domain is pointing to correct Pages project
3. Remove domain from other Pages projects if duplicated
4. Redeploy the correct project
5. Clear Cloudflare cache

### Build Output Directory Not Found

**Error:** "Could not find build output directory 'dist'"

**Solutions:**
1. Check your build script creates the directory
2. Update Pages config to match actual output directory
3. Common output directories:
   - Vite: `dist`
   - Create React App: `build`
   - Next.js: `.next` or `out`
   - VitePress: `.vitepress/dist`

---

## Maintenance

### Updating Deployments

#### Automatic (via GitHub Actions)
- Push to main branch → auto-deploys to production
- Create PR → auto-deploys preview

#### Manual (via Wrangler)
```bash
cd /path/to/project
npm run build
wrangler pages deploy dist --project-name=project-name
```

#### Manual (via Dashboard)
- Go to project → Deployments → "Redeploy"

### Monitoring

Check deployment status:
```bash
# List recent deployments
wrangler pages deployment list --project-name=project-name

# Tail logs
wrangler pages deployment tail --project-name=project-name

# View in dashboard
# https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages/view/project-name
```

---

## Summary Checklist

### For Existing Projects with Git Integration

- [ ] blackroad-os-docs
  - [ ] Add custom domain: docs.blackroad.io
  - [ ] Verify deployment
  - [ ] Test DNS and SSL

- [ ] blackroad-os-brand
  - [ ] Add custom domain: brand.blackroad.io
  - [ ] Verify deployment
  - [ ] Test DNS and SSL

- [ ] blackroad-os-prism
  - [ ] Add custom domain: prism.blackroad.io
  - [ ] Verify deployment
  - [ ] Test DNS and SSL

### For New Projects

- [ ] lucidia-platform
  - [ ] Create Pages project (connect to Git)
  - [ ] Configure build settings
  - [ ] Deploy
  - [ ] Add custom domain: lucidia.earth

- [ ] lucidia-math
  - [ ] Check if repo has web UI
  - [ ] Create Pages project or landing page
  - [ ] Deploy
  - [ ] Add custom domain: math.lucidia.earth

- [ ] lucidia-core
  - [ ] Check if repo has web UI
  - [ ] Create Pages project or landing page
  - [ ] Deploy
  - [ ] Add custom domain: core.lucidia.earth

- [ ] blackroad-tools
  - [ ] Check if repo has web UI
  - [ ] Create Pages project or landing page
  - [ ] Deploy
  - [ ] Add custom domain: tools.blackroad.io

### GitHub Actions Setup

- [ ] Add workflow file to each repo
- [ ] Configure GitHub secrets
- [ ] Test auto-deployment with a commit
- [ ] Verify preview deployments on PRs

### Cleanup

- [ ] Delete redundant subdomain projects (~20 projects)
- [ ] Verify no broken links
- [ ] Update documentation

---

## Resources

- **Cloudflare Pages Dashboard:** https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages
- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler
- **GitHub Actions for Pages:** https://github.com/cloudflare/pages-action

---

**Total Time Estimate:** 4-6 hours
- Existing projects (add domains): 30 minutes
- New projects (create & deploy): 2-3 hours
- GitHub Actions setup: 1-2 hours
- Testing & cleanup: 1 hour
