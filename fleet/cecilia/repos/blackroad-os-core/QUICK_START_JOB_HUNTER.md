# 🚀 Quick Start - Job Hunter Pack

Get your automated job applier running in 5 minutes!

## Step 1: Run the Demo

```bash
# Make sure you're in the blackroad-sandbox directory
cd /Users/alexa/blackroad-sandbox

# Run the demo
python3 examples/job_hunter_demo.py
```

**Expected output:**
- ✅ 12 jobs found across 4 platforms
- ✅ 10 applications generated
- ✅ Cover letters and custom answers ready for review

## Step 2: Customize Your Profile

Edit `examples/job_hunter_demo.py` with your information:

```python
profile = UserProfile(
    # YOUR INFO
    full_name="Your Name",
    email="your.email@example.com",
    phone="+1-555-0000",
    location="Your City, State",

    # YOUR RESUME
    resume_url="https://your-resume-url.com/resume.pdf",
    resume_text="Copy your resume text here...",

    # YOUR SKILLS (be specific!)
    skills=["Python", "JavaScript", "React", "AWS", "Docker"],

    # YOUR TARGET ROLES
    target_roles=["Software Engineer", "Full Stack Developer"],
    target_locations=["Remote", "Your City"],
    min_salary=120000,  # Your minimum salary

    # YOUR COVER LETTER TEMPLATE
    cover_letter_template="""
    Dear Hiring Manager,

    [Your template here - use {company}, {position}, {skills} variables]

    Best regards,
    {your_name}
    """
)
```

## Step 3: Configure Your Search

```python
criteria = JobSearchCriteria(
    # What you're looking for
    keywords=["Software Engineer", "Python Developer", "Full Stack"],
    locations=["Remote", "San Francisco", "New York"],

    # Where to search
    platforms=[
        JobPlatform.LINKEDIN,      # Easy Apply
        JobPlatform.INDEED,        # Quick Apply
        JobPlatform.ZIPRECRUITER,  # 1-Click
        JobPlatform.GLASSDOOR      # Company ratings
    ],

    # Your filters
    remote_only=True,        # Only remote jobs
    min_salary=120000,       # Minimum salary
    max_days_old=7,          # Only recent postings

    # Safety settings
    auto_apply=False,        # IMPORTANT: Keep False for manual review!
    max_applications_per_day=10,
    require_manual_review=True
)
```

## Step 4: Review Applications

After running the demo, you'll see pending applications:

```
Application 1/10
ID: 470ac920-fe5f-4787-aa2c-482c81fdecef
Status: pending
Match Score: 67%

Cover Letter Preview:
------------------------------------------------------------
Dear Hiring Manager,

I am writing to express my strong interest in the
Software Engineer position at Tech Corp...
------------------------------------------------------------

Options:
  1. Approve and submit
  2. Edit and submit
  3. Reject
```

## Step 5: Approve and Submit (Future)

Once you're ready to enable real submissions:

```python
# In your code
for app in agent.pending_applications:
    # Review in terminal or dashboard
    print(f"Job: {app.metadata['job_title']}")
    print(f"Company: {app.metadata['company']}")
    print(f"Match: {app.metadata['match_score']:.0%}")
    print(app.cover_letter)

    # Get user input
    choice = input("Approve? (y/n): ")

    if choice.lower() == 'y':
        result = await agent.approve_and_submit(app.id)
        print(f"✅ Submitted: {result['message']}")
```

## 🌐 Web Dashboard Setup (Optional)

### 1. Create a page in your Next.js app

```tsx
// app/job-hunter/page.tsx
import { JobHunterDashboard } from '@/components/job-hunter/JobHunterDashboard'

export default function JobHunterPage() {
  const profile = {
    // Your profile data
    id: 'user-001',
    full_name: 'Your Name',
    email: 'you@example.com',
    // ... rest of profile
  }

  return (
    <div>
      <JobHunterDashboard
        profile={profile}
        onProfileUpdate={(updated) => {
          // Save updated profile
          console.log('Profile updated:', updated)
        }}
      />
    </div>
  )
}
```

### 2. Start the dev server

```bash
pnpm dev
```

### 3. Visit the dashboard

```
http://localhost:3000/job-hunter
```

## 🔧 Connect to Real Job Platforms

Currently using mock data. To connect to real platforms:

### Option A: Use APIs (Recommended)

```python
# LinkedIn - Requires LinkedIn partnership
# https://docs.microsoft.com/en-us/linkedin/

# Indeed Publisher API
# https://opensource.indeedeng.io/api-documentation/

# RapidAPI Job Search APIs
# https://rapidapi.com/search/job
```

### Option B: Browser Automation

```bash
# Install Playwright
pip install playwright
playwright install chromium

# In your scraper code
from playwright.async_api import async_playwright

async def scrape_linkedin(keywords, location):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(f'https://linkedin.com/jobs/search?keywords={keywords}')
        # ... scraping logic
```

## 🤖 Add AI Customization

### Option A: OpenAI

```python
from blackroad_core.llm import LLMRouter, OpenAIProvider, LLMConfig

config = LLMConfig(
    backend=LLMBackend.OPENAI,
    model_name="gpt-4",
    api_key=os.getenv("OPENAI_API_KEY")
)

router = LLMRouter()
router.register_provider("openai", OpenAIProvider(config), set_default=True)

agent = JobHunterAgent(
    user_profile=profile,
    llm_provider=router  # Now uses AI customization!
)
```

### Option B: Anthropic Claude

```python
config = LLMConfig(
    backend=LLMBackend.ANTHROPIC,
    model_name="claude-3-sonnet-20240229",
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

router.register_provider("anthropic", AnthropicProvider(config), set_default=True)
```

### Option C: Local LLM (Ollama)

```bash
# Install Ollama
brew install ollama

# Start Ollama
ollama serve

# Pull a model
ollama pull llama2
```

```python
config = LLMConfig(
    backend=LLMBackend.OLLAMA,
    model_name="llama2",
    base_url="http://localhost:11434"
)

router.register_provider("ollama", OllamaProvider(config), set_default=True)
```

## 📅 Schedule Automated Job Searches

### Using Python Schedule

```python
import schedule
import time
from datetime import datetime

def daily_job_hunt():
    """Run job hunt every weekday at 9am"""
    print(f"Starting daily job hunt at {datetime.now()}")

    agent = JobHunterAgent(user_profile=profile)
    session = await agent.start_job_hunt(criteria)

    print(f"Found {session['jobs_found']} jobs")
    print(f"Generated {session['applications_generated']} applications")

# Schedule for weekdays at 9am
schedule.every().monday.at("09:00").do(daily_job_hunt)
schedule.every().tuesday.at("09:00").do(daily_job_hunt)
schedule.every().wednesday.at("09:00").do(daily_job_hunt)
schedule.every().thursday.at("09:00").do(daily_job_hunt)
schedule.every().friday.at("09:00").do(daily_job_hunt)

# Run forever
while True:
    schedule.run_pending()
    time.sleep(60)
```

### Using Cron

```bash
# Edit crontab
crontab -e

# Add job hunt at 9am on weekdays
0 9 * * 1-5 cd /Users/alexa/blackroad-sandbox && python3 examples/job_hunter_demo.py
```

## 🔔 Add Notifications

### Email Notifications

```python
import smtplib
from email.mime.text import MIMEText

def send_notification(session):
    msg = MIMEText(f"""
    Job Hunt Complete!

    Jobs Found: {session['jobs_found']}
    Applications Generated: {session['applications_generated']}
    Pending Review: {session['pending_review']}

    Review applications at: http://localhost:3000/job-hunter
    """)

    msg['Subject'] = f"🎯 Job Hunt: {session['jobs_found']} Jobs Found"
    msg['From'] = 'jobhunter@blackroad.io'
    msg['To'] = 'your.email@example.com'

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('your.email@example.com', 'your-app-password')
        server.send_message(msg)
```

### Slack Notifications

```python
import requests

def notify_slack(session):
    webhook_url = os.getenv('SLACK_WEBHOOK_URL')

    message = {
        "text": f"🎯 Job Hunt Complete!",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Jobs Found:* {session['jobs_found']}\n*Applications:* {session['applications_generated']}\n*Pending Review:* {session['pending_review']}"
                }
            }
        ]
    }

    requests.post(webhook_url, json=message)
```

## 📊 Track Your Progress

The system automatically tracks:

- **Jobs discovered** - Total jobs found across all platforms
- **Applications generated** - How many applications created
- **Applications submitted** - Successfully submitted
- **Pending review** - Waiting for your approval
- **Match scores** - How well each job fits your profile

Access stats:

```python
stats = agent.get_stats()
print(f"Total jobs discovered: {stats['total_jobs_discovered']}")
print(f"Applications generated: {stats['applications_generated']}")
print(f"Applications submitted: {stats['applications_submitted']}")
```

## ⚠️ Best Practices

### 1. Start Conservative
```python
# First week
max_applications_per_day = 5
require_manual_review = True

# After reviewing quality
max_applications_per_day = 10
```

### 2. Test Your Templates
```python
# Generate a few test applications
# Review the output quality
# Iterate on your templates
```

### 3. Monitor Match Scores
```python
# Only apply to high-match jobs
for app in pending_apps:
    if app.metadata['match_score'] >= 0.7:  # 70%+ match
        await agent.approve_and_submit(app.id)
```

### 4. Update Profile Regularly
```python
# Add new skills as you learn them
# Update experience section
# Refine cover letter template
```

### 5. Respect Rate Limits
```python
# Don't spam - you'll get flagged
max_applications_per_day = 10  # Good
max_applications_per_day = 100  # Bad!
```

## 🆘 Troubleshooting

### No jobs found?
```python
# Broaden your search
criteria.max_days_old = 30  # Look back further
criteria.keywords.append("Developer")  # More keywords
criteria.remote_only = False  # Include on-site
```

### Low match scores?
```python
# Review your profile skills
# Make sure they match job requirements
# Be more specific: "React 18" not "Frontend"
```

### Demo not working?
```bash
# Reinstall dependencies
cd /Users/alexa/blackroad-sandbox
python3 -m pip install -e .

# Run demo again
python3 examples/job_hunter_demo.py
```

## 📚 Learn More

- **Full Documentation**: `src/blackroad_core/packs/job_hunter/README.md`
- **Architecture**: `JOB_HUNTER_PACK_SUMMARY.md`
- **Example Code**: `examples/job_hunter_demo.py`
- **TypeScript Types**: `src/packs/job-hunter.ts`
- **Dashboard Component**: `src/components/job-hunter/JobHunterDashboard.tsx`

## 🎯 Next Steps

1. ✅ **Run the demo** - See it in action
2. ✅ **Customize your profile** - Add your resume and preferences
3. ✅ **Test applications** - Review generated cover letters
4. ⬜ **Connect real APIs** - LinkedIn, Indeed, etc.
5. ⬜ **Add LLM provider** - OpenAI, Anthropic, or Ollama
6. ⬜ **Deploy to production** - Railway, Cloudflare, etc.
7. ⬜ **Schedule daily runs** - Automated job hunting!

**Happy job hunting! 🚀**
