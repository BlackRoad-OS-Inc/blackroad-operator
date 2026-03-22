# 📚 Documentation Site Deployment Instructions

## ✅ Your Docs Site is Built and Ready!

**Location:** `~/blackroad-docs-site/dist/`  
**Size:** 5.3 KB (optimized)  
**Status:** Production build complete

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Cloudflare Pages (Use Existing Project)

You already have a `blackroad-os-docs` project! Just redeploy to it:

```bash
cd ~/blackroad-docs-site
wrangler pages deploy dist --project-name=blackroad-os-docs
```

**After deployment:**
- Live URL: https://blackroad-os-docs.pages.dev
- Configure custom domain: docs.blackroad.io

---

### Option 2: Vercel (Alternative)

```bash
cd ~/blackroad-docs-site

# Install Vercel CLI if needed
npm install -g vercel

# Deploy
vercel deploy dist --prod
```

**After deployment:**
- Vercel will give you a production URL
- Add custom domain in Vercel dashboard

---

### Option 3: Railway (Alternative)

```bash
cd ~/blackroad-docs-site

# Install Railway CLI if needed
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

---

### Option 4: Netlify (Alternative)

```bash
cd ~/blackroad-docs-site

# Install Netlify CLI if needed
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

### Option 5: GitHub Pages (Free & Simple)

```bash
cd ~/blackroad-docs-site

# Create a new repo for docs
gh repo create blackroad-docs --public --source=. --remote=origin

# Push dist folder to gh-pages branch
cd dist
git init
git add .
git commit -m "Deploy docs"
git branch -M gh-pages
git remote add origin https://github.com/BlackRoad-OS/blackroad-docs.git
git push -u origin gh-pages

# Enable GitHub Pages in repo settings
# Settings → Pages → Source: gh-pages branch
```

**Live URL:** https://blackroad-os.github.io/blackroad-docs/

---

## 🎯 RECOMMENDED: Use Existing Cloudflare Project

Since you already have `blackroad-os-docs` on Cloudflare Pages, that's the fastest option:

```bash
cd ~/blackroad-docs-site
wrangler pages deploy dist --project-name=blackroad-os-docs
```

This will:
1. Upload your built files
2. Deploy to: https://blackroad-os-docs.pages.dev
3. Keep your existing custom domain configs

---

## 📊 What Gets Deployed

Your documentation site includes:
- ✅ Landing page
- ✅ 8 documentation sections:
  - Getting Started
  - API Reference  
  - Guides
  - Architecture
  - Products
  - Security
  - Support
  - About
- ✅ Search functionality
- ✅ Responsive design
- ✅ SEO optimized

---

## 🔗 After Deployment

1. **Verify the site loads:** Visit your deployment URL
2. **Configure custom domain:** 
   - Go to Cloudflare/Vercel dashboard
   - Add custom domain: `docs.blackroad.io`
   - Update DNS records if needed
3. **Test all pages:** Click through each documentation section
4. **Announce!** Share the docs link in your marketing

---

## 💡 Quick Local Preview

Want to see it locally first?

```bash
cd ~/blackroad-docs-site
npx serve dist
# Opens at http://localhost:3000
```

---

## ✅ Next Steps After Docs Deploy

1. ✅ Documentation site live
2. Deploy webhook hub: `cd ~/webhook-hub && pm2 start server.js`
3. Launch marketing campaign
4. Drive traffic to products
5. Get first customers!

---

**Status:** 🟢 Ready to deploy in under 2 minutes!

Choose your preferred platform above and run the commands. The Cloudflare Pages option (using your existing `blackroad-os-docs` project) is recommended.
