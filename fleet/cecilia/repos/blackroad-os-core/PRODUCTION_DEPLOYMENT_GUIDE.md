# 🚀 Production Deployment Guide

## Complete Job Hunter System - All 30+ Platforms

This guide covers deploying the complete automated job application system with support for **30+ job platforms**.

---

## 📋 Supported Platforms (30+)

### Major Job Boards (5)
- ✅ [Indeed](https://www.indeed.com) - World's #1 job site
- ✅ [LinkedIn](https://www.linkedin.com/jobs) - Professional network
- ✅ [Glassdoor](https://www.glassdoor.com) - Company reviews + jobs
- ✅ [Monster](https://www.monster.com) - Classic job board
- ✅ [ZipRecruiter](https://www.ziprecruiter.com) - AI matching

### Tech & Creative (5)
- ✅ [Wellfound](https://wellfound.com) - Startup jobs (AngelList)
- ✅ [Dice](https://www.dice.com) - Tech jobs
- ✅ [Dribbble Jobs](https://dribbble.com/jobs) - Design jobs
- ✅ [Behance Jobs](https://www.behance.net/joblist) - Creative jobs
- ✅ [GitHub Jobs](https://jobs.github.com) - Developer jobs

### Remote Work (5)
- ✅ [Remote.co](https://remote.co/remote-jobs) - 100% remote
- ✅ [We Work Remotely](https://weworkremotely.com) - Premium remote
- ✅ [FlexJobs](https://www.flexjobs.com) - Flexible work
- ✅ [Remotive](https://remotive.com) - Remote tech jobs
- ✅ [Jobspresso](https://jobspresso.co) - Curated remote

### Entry-Level & Nonprofit (3)
- ✅ [Handshake](https://joinhandshake.com) - College recruiting
- ✅ [WayUp](https://www.wayup.com) - Entry-level jobs
- ✅ [Idealist](https://www.idealist.org) - Nonprofit jobs

### Freelance & Gig (4)
- ✅ [Upwork](https://www.upwork.com) - Freelance marketplace
- ✅ [Fiverr](https://www.fiverr.com) - Gig services
- ✅ [Toptal](https://www.toptal.com) - Top 3% talent
- ✅ [PeoplePerHour](https://www.peopleperhour.com) - Freelance

### Government & Startup (4)
- ✅ [USAJobs](https://www.usajobs.gov) - Federal jobs
- ✅ [Built In](https://builtin.com) - Tech hubs
- ✅ [Hired](https://hired.com) - Reverse recruiting
- ✅ [Crunchboard](https://www.crunchboard.com) - Startup jobs

---

## 🛠️ Prerequisites

### 1. Install Dependencies

```bash
# Python dependencies
pip install playwright
pip install google-api-python-client
pip install stripe
pip install sendgrid

# Install Playwright browsers
playwright install chromium

# Optional: Install Firefox and WebKit for additional testing
playwright install firefox webkit
```

### 2. Environment Variables

Create `.env` file:

```bash
# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Gmail API
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...

# Google Calendar API
GOOGLE_CALENDAR_API_KEY=...

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# SendGrid (for emails)
SENDGRID_API_KEY=SG....

# Platform Credentials (optional)
LINKEDIN_EMAIL=your.email@example.com
LINKEDIN_PASSWORD=...
GLASSDOOR_EMAIL=...
GLASSDOOR_PASSWORD=...

# Database
DATABASE_URL=postgresql://user:pass@host:5432/jobhunter

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379

# Deployment
RAILWAY_TOKEN=...
CLOUDFLARE_API_TOKEN=...
```

---

## 🚀 Deployment Steps

### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Set environment variables
railway variables set OPENAI_API_KEY=sk-...
railway variables set DATABASE_URL=...

# Deploy services
railway service create job-hunter-api
railway service create job-hunter-worker
railway service create job-hunter-scheduler
```

**Services Architecture:**
```
┌─────────────────────────────────────────┐
│         Railway Deployment              │
├─────────────────────────────────────────┤
│                                         │
│  1. API Service (FastAPI)               │
│     - REST endpoints                    │
│     - User authentication               │
│     - Job search API                    │
│                                         │
│  2. Worker Service (Background Jobs)    │
│     - Job scraping                      │
│     - Application submission            │
│     - Email sending                     │
│                                         │
│  3. Scheduler Service (Cron)            │
│     - Daily job hunts                   │
│     - Interview reminders               │
│     - Email summaries                   │
│                                         │
│  4. PostgreSQL Database                 │
│  5. Redis (Rate Limiting)               │
│                                         │
└─────────────────────────────────────────┘
```

### Option B: Cloudflare Pages + Workers

```bash
# Frontend (Next.js)
wrangler pages deploy ./out --project-name job-hunter

# Workers (API)
wrangler publish src/workers/api.ts

# D1 Database
wrangler d1 create job-hunter-db

# KV Storage (Sessions)
wrangler kv:namespace create job-hunter-sessions

# Durable Objects (Real-time)
wrangler publish src/workers/realtime.ts
```

### Option C: Self-Hosted (Docker)

```bash
# Build Docker image
docker build -t job-hunter:latest .

# Run with docker-compose
docker-compose up -d

# Scale workers
docker-compose up -d --scale worker=3
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  api:
    image: job-hunter:latest
    command: uvicorn main:app --host 0.0.0.0 --port 8000
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/jobhunter
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  worker:
    image: job-hunter:latest
    command: python worker.py
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/jobhunter
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    deploy:
      replicas: 3

  scheduler:
    image: job-hunter:latest
    command: python scheduler.py
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/jobhunter
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=jobhunter
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 🔧 Configuration

### 1. Platform-Specific Setup

#### Indeed
```python
# No API key needed - web scraping works
# For better reliability, use RapidAPI Indeed API:
# https://rapidapi.com/letscrape-6bRBa3QguO5/api/indeed-com
```

#### LinkedIn
```python
# Option A: LinkedIn API (requires partnership)
# Apply at: https://www.linkedin.com/developers/

# Option B: Browser automation (what we use)
# Requires login credentials
LINKEDIN_EMAIL=your.email@example.com
LINKEDIN_PASSWORD=your_password

# Enable Easy Apply filter
easy_apply = True
```

#### Glassdoor
```python
# Requires account for best results
GLASSDOOR_EMAIL=...
GLASSDOOR_PASSWORD=...
```

#### Upwork
```python
# Requires Upwork account
UPWORK_EMAIL=...
UPWORK_PASSWORD=...

# Connects (credits) are needed to apply
# Each application costs 1-6 connects
```

### 2. Gmail Integration

**Setup Gmail API:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Job Hunter"
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Download `credentials.json`

```python
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

# First time: get refresh token
flow = InstalledAppFlow.from_client_secrets_file(
    'credentials.json', SCOPES
)
creds = flow.run_local_server(port=0)

# Save refresh token to .env
GMAIL_REFRESH_TOKEN=...
```

### 3. Stripe Subscriptions

**Setup:**

1. Create [Stripe account](https://stripe.com)
2. Create products:
   - Free (Price: $0)
   - Pro (Price: $20/month)
   - Premium (Price: $50/month)
3. Get API keys
4. Configure webhooks

```python
import stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Create subscription
subscription = stripe.Subscription.create(
    customer="cus_...",
    items=[{"price": "price_pro"}],
)
```

---

## 📊 Database Schema

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscription_tier VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    resume_url TEXT,
    skills JSONB,
    experience JSONB,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    job_id VARCHAR(255),
    platform VARCHAR(50),
    status VARCHAR(50),
    applied_at TIMESTAMP,
    viewed BOOLEAN DEFAULT FALSE,
    response_received BOOLEAN DEFAULT FALSE,
    metadata JSONB
);

-- Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY,
    platform VARCHAR(50),
    title VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    url TEXT,
    description TEXT,
    scraped_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_platform (platform),
    INDEX idx_scraped (scraped_at)
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    stripe_subscription_id VARCHAR(255),
    tier VARCHAR(20),
    status VARCHAR(50),
    current_period_end TIMESTAMP
);

-- Usage Tracking
CREATE TABLE daily_usage (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    date DATE,
    applications_submitted INT DEFAULT 0,
    searches_performed INT DEFAULT 0,
    UNIQUE(user_id, date)
);
```

---

## 🔒 Security Best Practices

### 1. Credential Management

```python
# NEVER hardcode credentials
# Use environment variables

# Store encrypted credentials in database
from cryptography.fernet import Fernet

key = Fernet.generate_key()
cipher = Fernet(key)

# Encrypt
encrypted = cipher.encrypt(password.encode())

# Decrypt
decrypted = cipher.decrypt(encrypted).decode()
```

### 2. Rate Limiting

```python
from redis import Redis
from datetime import datetime, timedelta

redis = Redis.from_url(os.getenv("REDIS_URL"))

def check_rate_limit(user_id: str, limit: int = 100) -> bool:
    """Check if user is within rate limit."""
    key = f"rate_limit:{user_id}:{datetime.now().hour}"
    count = redis.incr(key)

    if count == 1:
        redis.expire(key, 3600)  # 1 hour

    return count <= limit
```

### 3. Anti-Detection

```python
# Rotate user agents
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "Mozilla/5.0 (X11; Linux x86_64)..."
]

# Random delays
import random
await asyncio.sleep(random.uniform(2, 5))

# Rotate proxies
PROXIES = [
    "http://proxy1.example.com:8080",
    "http://proxy2.example.com:8080"
]
```

---

## 📈 Monitoring & Analytics

### 1. Application Performance

```python
from datadog import initialize, statsd

# Track metrics
statsd.increment('jobs.scraped', tags=['platform:indeed'])
statsd.gauge('applications.success_rate', 0.85)
statsd.histogram('scrape.duration', 2.5)
```

### 2. Error Tracking

```python
import sentry_sdk

sentry_sdk.init(dsn="https://...")

try:
    await scraper.search_jobs(...)
except Exception as e:
    sentry_sdk.capture_exception(e)
```

### 3. Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('job_hunter.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
logger.info(f"Scraped {len(jobs)} jobs from {platform}")
```

---

## 🧪 Testing

### Unit Tests

```python
# test_scrapers.py
import pytest
from job_hunter.platforms import UniversalJobScraper

@pytest.mark.asyncio
async def test_indeed_scraper():
    scraper = UniversalJobScraper()
    await scraper.initialize()

    jobs = await scraper.search_jobs(
        platform=JobPlatform.INDEED,
        keywords=["software engineer"],
        location="San Francisco"
    )

    assert len(jobs) > 0
    assert jobs[0]["platform"] == "indeed"
    assert "title" in jobs[0]

    await scraper.close()
```

### Integration Tests

```bash
# Run full integration test
pytest tests/integration/ -v

# Test specific platform
pytest tests/integration/test_linkedin.py -v

# Test with real credentials (staging)
pytest tests/integration/ --use-real-creds
```

---

## 📊 Performance Optimization

### 1. Parallel Scraping

```python
import asyncio

async def scrape_all_platforms():
    """Scrape all platforms in parallel."""
    tasks = []

    for platform in [INDEED, LINKEDIN, GLASSDOOR]:
        task = scraper.search_jobs(
            platform=platform,
            keywords=keywords,
            location=location
        )
        tasks.append(task)

    results = await asyncio.gather(*tasks)

    # Flatten results
    all_jobs = [job for result in results for job in result]
    return all_jobs
```

### 2. Caching

```python
from redis import Redis
import json

redis = Redis.from_url(os.getenv("REDIS_URL"))

def cache_jobs(key: str, jobs: list, ttl: int = 3600):
    """Cache job results."""
    redis.setex(key, ttl, json.dumps(jobs))

def get_cached_jobs(key: str) -> list:
    """Get cached jobs."""
    data = redis.get(key)
    return json.loads(data) if data else None
```

### 3. Database Indexing

```sql
-- Add indexes for common queries
CREATE INDEX idx_jobs_platform_scraped ON jobs(platform, scraped_at DESC);
CREATE INDEX idx_applications_user_status ON applications(user_id, status);
CREATE INDEX idx_applications_platform ON applications(platform);
```

---

## 🎯 Production Checklist

### Before Launch

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Stripe webhooks configured
- [ ] Gmail API credentials working
- [ ] Playwright browsers installed
- [ ] Rate limiting configured
- [ ] Error tracking (Sentry) set up
- [ ] Monitoring (Datadog/New Relic) configured
- [ ] Backup strategy implemented
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Terms of Service posted
- [ ] Privacy Policy posted
- [ ] GDPR compliance checked

### Post-Launch

- [ ] Monitor error rates
- [ ] Check scraper success rates
- [ ] Monitor application submission rates
- [ ] Track user signups
- [ ] Monitor server resources
- [ ] Review logs daily
- [ ] Test email deliverability
- [ ] Check subscription renewals
- [ ] Monitor platform changes (sites update frequently!)
- [ ] Gather user feedback

---

## 🆘 Troubleshooting

### Scraping Issues

**Problem:** "Element not found" errors
```python
# Solution: Increase timeout
await page.wait_for_selector('.job-card', timeout=30000)

# Or use retry logic
for attempt in range(3):
    try:
        await page.wait_for_selector('.job-card')
        break
    except TimeoutError:
        if attempt == 2:
            raise
        await page.reload()
```

**Problem:** Getting blocked/captcha
```python
# Solutions:
# 1. Add random delays
await asyncio.sleep(random.uniform(2, 5))

# 2. Rotate user agents
# 3. Use residential proxies
# 4. Add cookies from real browser session
# 5. Reduce request frequency
```

### Authentication Issues

**Problem:** LinkedIn login fails
```python
# Solutions:
# 1. Check for 2FA requirement
# 2. Use session cookies instead
# 3. Handle security checkpoint

if await page.is_visible('text="Security Verification"'):
    # Manual intervention needed
    print("Security check required - please verify manually")
```

### Rate Limiting

**Problem:** Too many requests
```python
# Implement exponential backoff
import time

for i in range(5):
    try:
        await scraper.search_jobs(...)
        break
    except RateLimitError:
        wait_time = (2 ** i) + random.uniform(0, 1)
        time.sleep(wait_time)
```

---

## 📚 Additional Resources

- **Playwright Docs:** https://playwright.dev/python/
- **Stripe API:** https://stripe.com/docs/api
- **Gmail API:** https://developers.google.com/gmail/api
- **Railway Docs:** https://docs.railway.app
- **Cloudflare Workers:** https://developers.cloudflare.com/workers

---

## 🎉 You're Ready for Production!

Your automated job hunter is now ready to help thousands of job seekers land their dream jobs across **30+ platforms**!

**Next Steps:**
1. Deploy to Railway/Cloudflare
2. Set up monitoring
3. Launch beta to first users
4. Gather feedback
5. Iterate and improve

**Good luck! 🚀**
