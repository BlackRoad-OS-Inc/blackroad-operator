# RemoteJobs Platform

**Your own job board. No scraping. No bullshit. Actually works.**

Created: December 16, 2025
Cost: $0/month (Cloudflare Free Tier)

---

## What This Is

A simple remote job board where:
- **Employers** post jobs for free (30-day listings)
- **Job seekers** browse and apply
- **You** control everything

No scraping Indeed. No fighting Cloudflare. You OWN the platform.

---

## How to Deploy

### 1. Create KV Namespaces

```bash
cd remotejobs-platform

# Create storage
wrangler kv:namespace create "JOBS"
wrangler kv:namespace create "APPLICATIONS"
```

This will give you IDs like:
```
{ binding = "JOBS", id = "abc123..." }
{ binding = "APPLICATIONS", id = "def456..." }
```

### 2. Update wrangler.toml

Replace the `TO_BE_CREATED` placeholders with your actual KV namespace IDs.

### 3. Deploy Worker

```bash
wrangler deploy
```

Your API will be live at: `https://remotejobs-platform.blackroad.workers.dev`

### 4. Deploy Frontend to Cloudflare Pages

```bash
# Create git repo
git init
git add .
git commit -m "RemoteJobs platform"

# Push to GitHub
gh repo create remotejobs-platform --public --source=. --push

# Deploy to Cloudflare Pages via dashboard or CLI
wrangler pages project create remotejobs-platform
wrangler pages deploy . --project-name=remotejobs-platform
```

Or just upload `index.html` directly to Cloudflare Pages dashboard.

---

## Features

### For Employers
- Post jobs for free
- 30-day listings
- Track application count
- Email or custom URL for applications

### For Job Seekers
- Browse all remote jobs
- Search by keyword
- Filter by category
- Apply directly (email or URL)

### For You
- $0/month hosting cost
- Complete control
- No scraping needed
- Simple API
- Easy to extend

---

## API Endpoints

**GET /api/jobs**
- List all jobs
- Query params: `?category=Tech&search=engineer`

**POST /api/jobs**
- Post a new job
- Body: `{ title, company, description, category, salary, email, url }`

**GET /api/jobs/:id**
- Get single job

**POST /api/jobs/:id/apply**
- Track application
- Body: `{ name, email, resume, cover_letter }`

**GET /api/stats**
- Platform statistics

---

## How to Get Employers to Use It

### Option 1: Seed with Your Own Jobs
Post 20-30 real remote jobs from RemoteOK/Remotive to make it look active.

### Option 2: Reach Out to Companies
Email small companies:
> "Hey, I built a free remote job board. Want to post your openings? No cost, just trying to help people find remote work."

### Option 3: Reddit/Twitter
Post on:
- r/remotework
- r/forhire
- r/entrepreneur
- Twitter with #remotejobs

### Option 4: Charge $25/posting
After you have traffic, charge employers $25 to post (vs $299 on Indeed).

---

## Monetization Ideas

1. **Free for employers, charge job seekers $10/month for premium**
   - Email alerts
   - Early access to jobs
   - Resume review

2. **Charge employers $25/posting after 100 free jobs**
   - Still way cheaper than Indeed ($299)
   - You keep 100% of revenue

3. **Affiliate with remote work tools**
   - Time tracking software
   - VPNs
   - Coworking spaces

---

## Cost to Run

**Current: $0/month**
- Cloudflare Workers: Free tier (100k requests/day)
- KV Storage: Free tier (100k reads/day)
- Pages: Free hosting

**At Scale (10k jobs, 100k views/month): $5/month**
- Workers: Still free
- KV: $0.50
- Pages: Free

---

## Next Steps

1. ✅ Deploy worker (5 min)
2. ✅ Deploy frontend (5 min)
3. Seed with 20-30 real jobs from other boards (30 min)
4. Share on Reddit/Twitter (10 min)
5. Email 10 companies to post jobs (1 hour)

**Total time to launch: 2 hours**

---

## Files

- `worker.js` - Cloudflare Worker API
- `index.html` - Frontend (single page)
- `wrangler.toml` - Deployment config

That's it. No frameworks. No build steps. Just works.

---

## Why This Works

Instead of fighting with Indeed/LinkedIn's anti-scraping:
- You build the platform
- Employers come to YOU
- Job seekers come to YOU
- You control everything
- Costs $0

Even if you only get 50 jobs posted, that's 50 jobs you can apply to without dealing with Cloudflare blocking bullshit.

---

**Deploy it. Seed it. Share it. Own it.**
