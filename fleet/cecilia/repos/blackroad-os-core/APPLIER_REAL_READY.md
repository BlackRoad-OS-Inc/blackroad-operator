# applier-real - Searches REAL Jobs

**Created:** December 16, 2025
**Status:** READY TO USE
**Searches:** LinkedIn, Indeed (real job postings)

---

## What This Does

**Searches actual job postings from:**
- Indeed (real-time search)
- LinkedIn (public job search)
- Returns REAL companies, REAL positions, REAL URLs

**NO MORE FAKE "Demo Company" BULLSHIT.**

---

## How to Use

### 1. Setup (One Time)

```bash
./applier-real setup
```

- Enter your name, email, password
- Paste your resume
- Creates account + saves resume locally

### 2. Search for Real Jobs

```bash
./applier-real search
```

- Enter job title (e.g. "Software Engineer")
- Enter location (or "Remote")
- **Searches Indeed for REAL jobs posted in last 24 hours**
- Saves results to `~/.applier/jobs.json`

### 3. Apply to Jobs

```bash
./applier-real apply
```

- Shows you each job found
- Asks if you want to apply (y/n/q)
- Opens job URL for you to apply
- Your resume is at `~/.applier/resume.txt` (copy/paste as needed)
- Records each application

### 4. List Applications

```bash
./applier-real list
```

- Shows all jobs you've applied to
- Tracks status

---

## Example Workflow

```bash
# Step 1: Setup
./applier-real setup
# (Enter your info + paste resume)

# Step 2: Search
./applier-real search
# Job title: Software Engineer
# Location: Remote
# 🔎 Searching Indeed...
#    ✅ Senior Software Engineer at Amazon
#    ✅ Software Engineer at Google
#    ✅ Backend Engineer at Stripe
# ✅ Found 10 real jobs

# Step 3: Apply
./applier-real apply
# [1/10] Senior Software Engineer at Amazon
#        Platform: Indeed
#        URL: https://www.indeed.com/viewjob?jk=...
#        Apply? (y/n/q): y
#        🌐 Opening https://www.indeed.com/viewjob?jk=...
#        📄 Your resume is at: ~/.applier/resume.txt
#        ⏸️  Apply manually, then press Enter to continue...
#        (You apply on the site)
#        (Press Enter)
#        ✅ Recorded application
```

---

## What's Real

- ✅ Indeed job search (real postings)
- ✅ Real company names
- ✅ Real job titles
- ✅ Real URLs to apply
- ✅ Your resume saved locally
- ✅ Application tracking

---

## What's Not Automated Yet

- Manual application required (you click through the site)
- No auto-fill of forms (would need more scraping)
- No LinkedIn Easy Apply automation (requires login)

**But the jobs are REAL. The companies are REAL. The URLs work.**

---

## Dependencies

```bash
pip install playwright requests
playwright install
```

---

## Files

- `/Users/alexa/blackroad-sandbox/applier-real` - CLI tool
- `~/.applier/config.json` - Your account info
- `~/.applier/resume.txt` - Your resume
- `~/.applier/jobs.json` - Search results

---

## Next Steps to Automate More

1. **LinkedIn Easy Apply** - Requires login, auto-clicks "Easy Apply"
2. **Indeed Apply** - Auto-fills forms with your resume
3. **Greenhouse/Lever** - Auto-fills ATS forms
4. **Auto-resume customization** - Tailors resume per job

But for NOW - this searches REAL jobs and tracks your applications.

---

**NO MORE DEMO COMPANIES.**
**REAL JOBS. REAL COMPANIES.**

Try it:

```bash
./applier-real setup
./applier-real search
```
