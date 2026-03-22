# 🌐 BlackRoad OS - Subdomain Architecture (Visual Guide)

**Easy-to-understand visual map of how everything connects**

Last Updated: 2025-12-14

---

## 🎯 The Big Picture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        blackroad.io Domain                          │
│                                                                     │
│  Every subdomain = Frontend (Cloudflare) + Backend (Railway)       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Example: RoadWork (Job Hunter)

### How a User Interacts

```
1. User types in browser:
   → https://roadwork.blackroad.io

2. Cloudflare Pages serves the pretty website
   ┌─────────────────────────────────────┐
   │  🎨 RoadWork Frontend (FREE)        │
   │  ────────────────────────────────   │
   │  ✓ Landing page                     │
   │  ✓ Signup form                      │
   │  ✓ Login page                       │
   │  ✓ Dashboard UI                     │
   │                                     │
   │  Just HTML/CSS/JS - NO logic!      │
   └─────────────────────────────────────┘

3. User clicks "Find Jobs" button

4. Frontend makes API call:
   → https://api-roadwork.blackroad.io/api/jobs/search

5. Railway backend does the actual work
   ┌─────────────────────────────────────┐
   │  ⚙️  RoadWork Backend ($30/month)   │
   │  ────────────────────────────────   │
   │  ✓ Scrape Indeed, LinkedIn, etc.   │
   │  ✓ Store jobs in database          │
   │  ✓ Run Celery background workers   │
   │  ✓ Send email notifications        │
   │  ✓ Process AI resume matching      │
   │                                     │
   │  Python code + Database + Workers  │
   └─────────────────────────────────────┘

6. Backend returns JSON data:
   {
     "jobs": [
       {"title": "Software Engineer", "company": "Google", ...},
       {"title": "Full Stack Dev", "company": "Meta", ...}
     ]
   }

7. Frontend displays beautiful job cards

8. User sees the jobs on the website!
```

---

## 🗺️ Complete Subdomain Map

### Frontend Subdomains (Cloudflare Pages - All FREE)

```
┌──────────────────────────────────────────────────────────────────┐
│  blackroad.io                                                    │
│  ─────────────                                                   │
│  • Marketing/landing page                                        │
│  • "What is BlackRoad OS?"                                       │
│  • Pricing, features, blog                                       │
│  • Cost: $0/month                                                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  app.blackroad.io                                                │
│  ─────────────────                                               │
│  • Main agent dashboard/console                                  │
│  • Spawn agents, view status                                     │
│  • Monitor system health                                         │
│  • Cost: $0/month                                                │
│  • Calls: api.blackroad.io                                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  roadwork.blackroad.io                                           │
│  ──────────────────────                                          │
│  • Job hunter application                                        │
│  • Search, swipe, apply to jobs                                  │
│  • Dashboard with stats                                          │
│  • Cost: $0/month                                                │
│  • Calls: api-roadwork.blackroad.io                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  prism.blackroad.io                                              │
│  ───────────────────                                             │
│  • Real-time monitoring dashboard                                │
│  • View all services health                                      │
│  • Metrics, logs, alerts                                         │
│  • Cost: $0/month                                                │
│  • Calls: api.blackroad.io, operator, beacon                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  docs.blackroad.io                                               │
│  ──────────────────                                              │
│  • Technical documentation                                       │
│  • API reference, guides                                         │
│  • Developer docs                                                │
│  • Cost: $0/month                                                │
└──────────────────────────────────────────────────────────────────┘
```

### Backend Subdomains (Railway - Cost varies)

```
┌──────────────────────────────────────────────────────────────────┐
│  api.blackroad.io                                                │
│  ─────────────────                                               │
│  • Main BlackRoad OS API                                         │
│  • Agent spawning, management                                    │
│  • PostgreSQL + Redis                                            │
│  • Cost: $20/month                                               │
│  • Used by: app.blackroad.io, prism.blackroad.io                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  api-roadwork.blackroad.io                                       │
│  ──────────────────────────────                                  │
│  • RoadWork job scraping API                                     │
│  • 30+ job platforms                                             │
│  • Celery workers for background jobs                            │
│  • PostgreSQL + Redis                                            │
│  • Cost: $30/month                                               │
│  • Used by: roadwork.blackroad.io                                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  operator.blackroad.io                                           │
│  ──────────────────────                                          │
│  • Agent orchestration ("Cece")                                  │
│  • Manages agent lifecycle                                       │
│  • PostgreSQL database                                           │
│  • Cost: $10/month                                               │
│  • Used by: api.blackroad.io, agents                             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  master.blackroad.io                                             │
│  ────────────────────                                            │
│  • Master control plane                                          │
│  • System-wide coordination                                      │
│  • PostgreSQL database                                           │
│  • Cost: $10/month                                               │
│  • Used by: operator, api                                        │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  beacon.blackroad.io                                             │
│  ────────────────────                                            │
│  • Health check service                                          │
│  • Monitors all services                                         │
│  • Redis for metrics                                             │
│  • Cost: $8/month                                                │
│  • Used by: prism.blackroad.io, monitoring                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  packs.blackroad.io                                              │
│  ───────────────────                                             │
│  • Domain-specific agent packs                                   │
│  • Finance, Legal, Research, Creative, DevOps                    │
│  • PostgreSQL database                                           │
│  • Cost: $20/month                                               │
│  • Used by: agents, api                                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Breakdown (Visual)

```
Frontend (Cloudflare Pages)              Backend (Railway)
─────────────────────────────            ────────────────────────────

blackroad.io           $0                (none)
app.blackroad.io       $0       →        api.blackroad.io        $20
roadwork.blackroad.io  $0       →        api-roadwork.b...       $30
prism.blackroad.io     $0       →        (uses other APIs)
docs.blackroad.io      $0                (none)

                                         operator.blackroad.io   $10
                                         master.blackroad.io     $10
                                         beacon.blackroad.io     $8
                                         packs.blackroad.io      $20

────────────────────────────────────────────────────────────────────
Total Frontend:        $0/month
Total Backend:         $98/month
────────────────────────────────────────────────────────────────────
GRAND TOTAL:           $98/month for complete BlackRoad OS!
```

---

## 🔌 How They Connect (Data Flow)

### Example: Searching for Jobs

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: User visits roadwork.blackroad.io                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Cloudflare Pages serves static HTML/CSS/JS             │
│         User sees beautiful job search interface                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: User types "Software Engineer" and clicks "Search"     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Frontend JavaScript makes API call:                    │
│         POST https://api-roadwork.blackroad.io/api/jobs/search  │
│         Body: { keywords: ["Software Engineer"], ... }          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Railway backend receives request                       │
│         - FastAPI server validates request                      │
│         - Queues scraping job in Celery                         │
│         - Returns: { job_id: "abc123", status: "processing" }   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: Celery worker starts scraping                          │
│         - Launches Playwright browser                           │
│         - Scrapes Indeed: 50 jobs found                         │
│         - Scrapes LinkedIn: 35 jobs found                       │
│         - Scrapes Glassdoor: 42 jobs found                      │
│         - Stores all 127 jobs in PostgreSQL                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: Frontend polls for results                             │
│         GET https://api-roadwork.blackroad.io/api/jobs/abc123   │
│         Response: { status: "complete", jobs: [...] }           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 8: Frontend displays beautiful job cards                  │
│         User can now swipe, save, apply!                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Order

### Start with RoadWork ($30/month)

```bash
# 1. Backend is already deployed to Railway
./scripts/deploy-railway-project.sh 01

# 2. Frontend is already on Cloudflare Pages
# Already deployed: https://478adf74.roadwork.pages.dev

# 3. Configure custom domains
# Add in Cloudflare DNS:
#   roadwork → roadwork.pages.dev
#   api-roadwork → roadwork-production.up.railway.app

# 4. Test!
# Visit: https://roadwork.blackroad.io
# API: https://api-roadwork.blackroad.io/health
```

### Then add Core Platform (+$20/month)

```bash
# Deploy backend
./scripts/deploy-railway-project.sh 03

# Deploy frontend
cd _personal/BlackRoad-Operating-System/prism-console
npm run build
npx wrangler pages deploy out --project-name=blackroad-console

# Configure domains
# app → blackroad-console.pages.dev
# api → blackroad-core-production.up.railway.app
```

### Finally add Control Plane (+$48/month)

```bash
# Deploy all control services
./scripts/deploy-railway-project.sh 04  # Operator
./scripts/deploy-railway-project.sh 05  # Master
./scripts/deploy-railway-project.sh 06  # Beacon
./scripts/deploy-railway-project.sh 07  # Packs
```

---

## ✅ Quick Test Checklist

### After Configuration

**Frontend Tests (should load immediately):**
- [ ] https://roadwork.blackroad.io loads
- [ ] https://app.blackroad.io loads
- [ ] https://blackroad.io loads
- [ ] https://prism.blackroad.io loads
- [ ] https://docs.blackroad.io loads

**Backend Tests (after Railway deployment):**
- [ ] https://api-roadwork.blackroad.io/health returns 200
- [ ] https://api.blackroad.io/health returns 200
- [ ] https://operator.blackroad.io/health returns 200
- [ ] https://master.blackroad.io/health returns 200
- [ ] https://beacon.blackroad.io/health returns 200

**Integration Tests:**
- [ ] Frontend can call backend API
- [ ] Jobs search returns results
- [ ] Signup creates user in database
- [ ] Dashboard shows real data

---

## 🎯 Summary

**Each subdomain has TWO parts:**

1. **Frontend** (what user sees)
   - Hosted on Cloudflare Pages
   - Static HTML/CSS/JavaScript
   - FREE

2. **Backend** (what does the work)
   - Hosted on Railway
   - Python/Node.js servers
   - Databases, workers, background jobs
   - $8-30/month per service

**They're separate but work together:**
- Frontend makes API calls to backend
- Backend does heavy lifting, returns data
- Frontend displays data beautifully

**Total cost: $98/month** for entire BlackRoad OS ecosystem with 5+ user-facing apps!

---

**Use the setup script to configure everything:**
```bash
./scripts/setup-subdomains.sh
```

---

**Now you understand the complete architecture!** 🚀
