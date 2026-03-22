# Setup Custom Domain: roadwork.blackroad.io

## Quick Steps to Add Custom Domain

### Option 1: Via Cloudflare Dashboard (Easiest)

1. Go to https://dash.cloudflare.com
2. Click on "Pages" in the left sidebar
3. Click on "remotejobs-platform"
4. Go to "Custom domains" tab
5. Click "Set up a custom domain"
6. Enter: `roadwork.blackroad.io`
7. Click "Continue"
8. Cloudflare will automatically configure the DNS

**Done! The domain will be live in 1-2 minutes.**

### Option 2: Manual DNS Setup

If you prefer manual setup:

1. Go to https://dash.cloudflare.com
2. Select the "blackroad.io" zone
3. Go to DNS → Records
4. Add CNAME record:
   - Name: `roadwork`
   - Target: `remotejobs-platform.pages.dev`
   - Proxy status: Proxied (orange cloud)
5. Save

**Wait 1-2 minutes for DNS propagation.**

### Option 3: API (If you want to automate)

```bash
# Get your Cloudflare Zone ID for blackroad.io
ZONE_ID="your_zone_id"

# Get your API token
API_TOKEN="your_api_token"

# Add CNAME record
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "roadwork",
    "content": "remotejobs-platform.pages.dev",
    "proxied": true
  }'
```

---

## Current Status

✅ **Updated App Deployed:** https://72ce5b40.remotejobs-platform.pages.dev

**New Features:**
- User profile setup (name, email, background)
- AI resume customization for each job
- In-app apply (no external links)
- Modal shows customized resume before applying
- LocalStorage saves your profile

**Next:** Add custom domain via Cloudflare dashboard (takes 2 minutes)

---

## What the App Does Now

1. **First Visit:** User enters name, email, and their background/experience
2. **Browse Jobs:** See 30 real remote jobs
3. **Click Apply:** Modal opens with AI-customized resume
4. **Submit:** Application goes directly through the platform
5. **Done:** Employer gets your customized resume + cover letter

**AI Resume Customization:**
- Uses your background text
- Adds relevant skills based on job keywords
- Customizes objective for each company
- Shows preview before submission

---

## Test It

1. Go to: https://72ce5b40.remotejobs-platform.pages.dev
2. Enter your info (will save to localStorage)
3. Browse jobs
4. Click "Apply with AI Resume ✨"
5. See your customized resume
6. Submit

**Once domain is set up:**
→ https://roadwork.blackroad.io (same thing, prettier URL)
