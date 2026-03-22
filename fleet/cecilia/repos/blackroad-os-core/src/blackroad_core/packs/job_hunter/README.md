# 🎯 BlackRoad Job Hunter Pack

Automated job application system with AI-powered customization, integrated with BlackRoad OS agent infrastructure.

## Features

### 🔍 Multi-Platform Job Search
- **LinkedIn** - Easy Apply jobs with LinkedIn API
- **Indeed** - Quick Apply jobs
- **ZipRecruiter** - 1-Click Apply
- **Glassdoor** - Company insights + applications
- **Custom Sites** - Extensible scraper architecture

### 🤖 AI-Powered Customization
- **Hybrid Approach** - Combines templates with LLM customization
- **Smart Matching** - Calculates compatibility score for each job
- **Personalized Content** - Custom cover letters tailored to each job
- **Context-Aware Answers** - Intelligent responses to application questions

### ⚡ Automated Form Filling
- **Browser Automation** - Playwright/Selenium support
- **Intelligent Mapping** - Auto-maps profile data to form fields
- **Multi-Step Forms** - Handles complex application flows
- **Dry Run Mode** - Test before submitting

### 📊 Application Tracking
- **Status Monitoring** - Track every application
- **Follow-Up Scheduling** - Automated reminders
- **Analytics Dashboard** - Visualize your job search
- **Event Integration** - Full BlackRoad OS event bus integration

## Architecture

```
JobHunterAgent (Orchestrator)
├── JobScraperOrchestrator
│   ├── LinkedInScraper
│   ├── IndeedScraper
│   ├── ZipRecruiterScraper
│   └── GlassdoorScraper
├── ApplicationWriter (AI-Powered)
│   ├── Template Engine
│   └── LLM Customization
└── FormFiller
    └── Platform-Specific Handlers
```

## Quick Start

### Installation

```bash
# Install pack via BlackRoad OS
python3 -m pip install -e .

# Or install via pack registry
from blackroad_core.packs import PackRegistry

registry = PackRegistry()
pack = await registry.install_pack("pack-job-hunter")
```

### Basic Usage

```python
from blackroad_core.packs.job_hunter import (
    UserProfile,
    JobSearchCriteria,
    JobPlatform
)
from blackroad_core.packs.job_hunter.orchestrator import JobHunterAgent

# 1. Create your profile
profile = UserProfile(
    id="user-001",
    full_name="Your Name",
    email="you@example.com",
    phone="+1-555-0123",
    location="San Francisco, CA",
    resume_url="https://example.com/resume.pdf",
    resume_text="Your resume text...",
    summary="Your professional summary...",
    skills=["Python", "JavaScript", "React"],
    target_roles=["Software Engineer", "Full Stack Developer"],
    target_locations=["Remote", "San Francisco"],
    min_salary=120000,
    cover_letter_template="Dear Hiring Manager...",
    custom_answers={"why_interested": "I'm excited about..."}
)

# 2. Configure search criteria
criteria = JobSearchCriteria(
    keywords=["Software Engineer", "Python Developer"],
    locations=["Remote", "San Francisco"],
    platforms=[JobPlatform.LINKEDIN, JobPlatform.INDEED],
    remote_only=True,
    min_salary=120000,
    max_days_old=7,
    max_applications_per_day=10
)

# 3. Start job hunt
agent = JobHunterAgent(user_profile=profile)
session = await agent.start_job_hunt(criteria, auto_apply=False)

# 4. Review and approve applications
for app in agent.pending_applications:
    # Review in dashboard or CLI
    await agent.approve_and_submit(app.id)
```

## Configuration

### User Profile

Create a comprehensive profile for best results:

```python
profile = UserProfile(
    # Basic info
    full_name="Alex Johnson",
    email="alex@example.com",
    phone="+1-555-0123",
    location="San Francisco, CA",

    # Resume
    resume_url="https://example.com/resume.pdf",
    resume_text="Full resume text for parsing...",

    # Summary
    summary="Passionate engineer with 5+ years experience...",

    # Skills (be specific!)
    skills=["Python", "TypeScript", "React", "AWS", "Docker"],

    # Experience
    experience=[{
        "company": "Tech Corp",
        "title": "Senior Engineer",
        "duration": "2021-Present",
        "highlights": ["Built X", "Improved Y by 50%"]
    }],

    # Preferences
    target_roles=["Senior Engineer", "Tech Lead"],
    target_locations=["Remote", "SF Bay Area"],
    min_salary=150000,
    remote_only=True,

    # Templates (customized per application)
    cover_letter_template="""...""",
    custom_answers={
        "why_interested": "...",
        "strengths": "..."
    }
)
```

### Search Criteria

Fine-tune your job search:

```python
criteria = JobSearchCriteria(
    # What to search for
    keywords=["Software Engineer", "Full Stack"],
    locations=["Remote", "San Francisco", "New York"],

    # Where to search
    platforms=[
        JobPlatform.LINKEDIN,      # Easy Apply
        JobPlatform.INDEED,        # Quick Apply
        JobPlatform.ZIPRECRUITER,  # 1-Click
        JobPlatform.GLASSDOOR      # Company ratings
    ],

    # Filters
    remote_only=True,              # Remote jobs only
    min_salary=120000,             # Minimum salary
    max_days_old=7,                # Only recent postings
    exclude_companies=["BadCorp"], # Companies to avoid

    # Application behavior
    auto_apply=False,              # Require manual approval
    max_applications_per_day=10,   # Rate limit
    require_manual_review=True     # Review before submit
)
```

## AI Customization

### Template Mode

Uses your templates with variable substitution:

```python
cover_letter_template = """
Dear Hiring Manager,

I am excited to apply for the {position} position at {company}.
With my expertise in {skills}, I believe I would be a strong fit.

{summary}

Best regards,
{your_name}
"""
```

### AI Mode (Hybrid)

Combines templates with LLM customization:

```python
# Provide LLM provider
from blackroad_core.llm import LLMRouter, OllamaProvider

router = LLMRouter()
router.register_provider("ollama", OllamaProvider(), set_default=True)

agent = JobHunterAgent(
    user_profile=profile,
    llm_provider=router  # Enable AI customization
)

# Agent will:
# 1. Use template as structure
# 2. Analyze job description
# 3. Highlight relevant skills/experience
# 4. Personalize for company/role
# 5. Generate custom answers
```

## Platform Handlers

### LinkedIn

```python
# Searches for Easy Apply jobs
# Multi-step application flow:
# 1. Contact info (pre-filled from profile)
# 2. Resume upload
# 3. Additional questions
# 4. Review and submit
```

### Indeed

```python
# Searches for Quick Apply jobs
# Single-page application
# Supports resume upload + cover letter
```

### ZipRecruiter

```python
# 1-Click Apply with ZipRecruiter profile
# Optional custom message
```

### Glassdoor

```python
# Company ratings + job applications
# Includes company culture insights
```

## Safety Features

### Manual Review Mode (Recommended)

```python
criteria.require_manual_review = True
criteria.auto_apply = False

# Applications go to review queue
# You approve before submission
```

### Dry Run Mode

```python
result = await form_filler.fill_and_submit(
    application,
    job,
    profile,
    dry_run=True  # Don't actually submit
)

# Returns what WOULD be submitted
```

### Rate Limiting

```python
criteria.max_applications_per_day = 10  # Prevent spam
```

### Company Exclusions

```python
profile.excluded_companies = ["Company X", "Bad Corp"]
criteria.exclude_companies = ["Another Bad Co"]
```

## Dashboard Integration

### Web Dashboard

```typescript
import { JobHunterDashboard } from '@/components/job-hunter'

<JobHunterDashboard
  profile={userProfile}
  onProfileUpdate={handleUpdate}
/>
```

### Components

- **JobSearchForm** - Configure search criteria
- **ApplicationQueue** - Review pending applications
- **ApplicationCard** - View/edit application details
- **JobList** - Browse discovered jobs
- **StatsWidget** - Track progress

## Event Integration

Integrates with BlackRoad OS event bus:

```python
# Events emitted:
# - job_application_submitted
# - job_application_viewed
# - job_application_rejected
# - interview_scheduled

# Subscribe to events
async def on_application_submitted(event):
    print(f"Application submitted: {event['data']['job_title']}")

event_bus.subscribe("job_hunter.applications", on_application_submitted)
```

## Agent Templates

The pack includes 4 agent templates:

### 1. job-scraper
- **Role**: Job Scraper
- **Capabilities**: `search_jobs`
- **Runtime**: `integration_bridge`
- **Purpose**: Search job platforms

### 2. application-writer
- **Role**: Application Writer
- **Capabilities**: `customize_applications`
- **Runtime**: `llm_brain`
- **Purpose**: AI-powered customization

### 3. form-filler
- **Role**: Form Filler
- **Capabilities**: `fill_forms`
- **Runtime**: `workflow_engine`
- **Purpose**: Automated submission

### 4. job-hunter-orchestrator
- **Role**: Job Hunter Orchestrator
- **Capabilities**: All of the above
- **Runtime**: `llm_brain`
- **Purpose**: Coordinate entire workflow

## Production Deployment

### Requirements

```bash
# Browser automation
pip install playwright selenium

# LLM integration (choose one)
pip install openai anthropic  # Cloud LLMs
# OR
# Install Ollama for local LLMs

# Job platform APIs
# - LinkedIn API (requires partnership)
# - Indeed Publisher API
# - RapidAPI subscriptions
```

### Setup Playwright

```bash
playwright install chromium
```

### Environment Variables

```bash
# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Job Platform APIs
LINKEDIN_API_KEY=...
INDEED_PUBLISHER_ID=...
RAPIDAPI_KEY=...

# Application
JOB_HUNTER_MAX_APPLICATIONS_PER_DAY=10
JOB_HUNTER_REQUIRE_REVIEW=true
```

## Best Practices

### 1. Start Conservative

```python
# Begin with manual review
criteria.require_manual_review = True
criteria.max_applications_per_day = 5

# Review first 10-20 applications
# Adjust templates based on results
```

### 2. Optimize Your Profile

```python
# Be specific with skills
skills = ["Python 3.11", "React 18", "AWS Lambda"]  # Good
# vs
skills = ["Python", "Frontend", "Cloud"]  # Too vague

# Include metrics in experience
highlights = ["Reduced latency by 40%", "Led team of 5"]
```

### 3. Test Templates

```python
# Generate test applications
test_app = await writer.generate_application(job, profile, use_ai=False)

# Review output
print(test_app.cover_letter)

# Iterate on template
```

### 4. Monitor Match Scores

```python
# Only apply to high-match jobs
ranked_jobs = await agent._rank_jobs(jobs)
high_matches = [job for job, score in ranked_jobs if score > 0.7]
```

### 5. Schedule Wisely

```python
# Run during business hours
# Mon-Fri, 9am-5pm in target timezone

import schedule

schedule.every().monday.at("09:00").do(lambda: agent.start_job_hunt(criteria))
schedule.every().tuesday.at("09:00").do(lambda: agent.start_job_hunt(criteria))
# etc.
```

## Troubleshooting

### Issue: No jobs found

```python
# Check criteria
print(f"Keywords: {criteria.keywords}")
print(f"Locations: {criteria.locations}")

# Broaden search
criteria.max_days_old = 30  # Look back further
criteria.remote_only = False  # Include on-site
```

### Issue: Low match scores

```python
# Review profile skills
# Make sure they match job requirements

# Check job requirements
for job in jobs:
    print(f"{job.title}: {job.requirements}")
```

### Issue: Form submission fails

```python
# Use dry run mode
result = await filler.fill_and_submit(..., dry_run=True)
print(result)

# Check platform handler
# May need browser automation setup
```

## Examples

See `examples/job_hunter_demo.py` for complete working example.

## License

MIT - Part of BlackRoad OS

## Support

- Documentation: https://blackroad.io/docs/packs/job-hunter
- Issues: https://github.com/BlackRoad-OS/blackroad-os-core/issues
- Email: blackroad.systems@gmail.com

## Credits

Built with BlackRoad OS agent infrastructure
