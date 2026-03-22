# 🚀 applier-pro - Complete User Guide

**The AI-Powered Job Application Suite That Gets You Hired**

Version: 2.0
Date: December 20, 2025
Status: Production Ready ✅

---

## 🎯 What is applier-pro?

**applier-pro** is your complete AI job hunting assistant that combines:

1. **AI Cover Letter Generator** - Claude-powered personalized cover letters
2. **Batch Application System** - Apply to 10-20+ jobs automatically
3. **Interview Prep AI** - Mock interviews with real-time feedback
4. **Salary Negotiation Coach** - Data-driven negotiation strategies
5. **Company Research Automation** - Instant company insights

**Result:** Get more interviews, better offers, less time wasted.

---

## 📦 Installation

### Prerequisites

```bash
# Python 3.11+
python3 --version

# Install dependencies
pip install anthropic playwright requests

# Install Playwright browsers
playwright install
```

### Get Your API Key

1. Go to https://console.anthropic.com/
2. Create account (free trial available)
3. Generate API key
4. Set environment variable:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."

# Add to your shell profile for persistence
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc  # or ~/.bashrc
```

### Quick Start

```bash
cd ~/blackroad-sandbox

# Make executable
chmod +x applier-pro

# Run setup (if you haven't already)
./applier-real setup

# You're ready!
./applier-pro help
```

---

## 🚀 Features & Usage

### 1. AI Cover Letter Generator

**Generate personalized cover letters in seconds.**

```bash
# Basic usage
./applier-pro cover \
  --job-title "Senior Software Engineer" \
  --company "Anthropic" \
  --job-description job_description.txt \
  --resume ~/.applier/resume.txt

# Generate 3 variants with different tones
./applier-pro cover \
  --job-title "Senior SWE" \
  --company "Anthropic" \
  --job-description job.txt \
  --tone professional \
  --variants 3

# Different tones available
./applier-pro cover ... --tone enthusiastic
./applier-pro cover ... --tone technical
./applier-pro cover ... --tone creative

# Different lengths
./applier-pro cover ... --length short   # 2 paragraphs
./applier-pro cover ... --length medium  # 3-4 paragraphs (default)
./applier-pro cover ... --length long    # 5+ paragraphs
```

**What it does:**
- Analyzes job description for key requirements
- Extracts your relevant skills from resume
- Generates compelling cover letter
- Highlights 3-4 most relevant experiences
- Creates multiple variants for A/B testing
- Saves to `~/.applier/cover_letters/`

**Example workflow:**

```bash
# 1. Find job posting, copy URL
# 2. Get job description
curl "https://jobs.anthropic.com/..." | grep -A 1000 "Job Description" > job.txt

# 3. Generate cover letter
./applier-pro cover --job-title "Senior SWE" --company "Anthropic" \
                     --job-description job.txt --variants 2

# 4. Review both variants
# 5. Use the better one in your application
```

**Pro tips:**
- Generate 2-3 variants, pick the best
- Professional tone for traditional companies
- Enthusiastic tone for startups
- Technical tone for engineering-heavy roles

---

### 2. Batch Application System

**Apply to 10-20 jobs with one command.**

```bash
# First, search for jobs
./applier-real search

# Then batch apply
./applier-pro batch \
  --max 20 \                    # Apply to max 20 jobs
  --min-score 75 \               # Only 75+ match score
  --delay 60 \                   # 60s between applications
  --daily-goal 10                # Stop at 10 apps

# Filter by platform
./applier-pro batch --platforms linkedin ziprecruiter --max 15

# Quick apply (LinkedIn Easy Apply only)
./applier-pro batch --platforms linkedin --max 10 --delay 30
```

**What it does:**
- Loads jobs from search results
- Filters by match score and platform
- Applies smart rate limiting (avoid blocks)
- Auto-fills forms when possible
- Tracks progress and ETA
- Saves progress (can resume if interrupted)
- Respects daily goals

**Platforms supported:**
- ✅ LinkedIn Easy Apply (best automation)
- ✅ ZipRecruiter Quick Apply
- ⚠️  Indeed (opens for manual application)
- ⚠️  Glassdoor (opens for manual application)
- ⚠️  Others (opens browser for you)

**Example session:**

```bash
$ ./applier-pro batch --max 20 --min-score 80 --daily-goal 10

🚀 BATCH APPLICATION STARTED
======================================================================
📊 Total jobs: 15
🎯 Daily goal: 10
📈 Min match score: 80.0
⏱️  Rate limit: 60s between apps
======================================================================

[1/15] Senior Software Engineer at Anthropic
📊 Match: 92.5% | Platform: linkedin
──────────────────────────────────────────────────────────────
🌐 Opening: https://linkedin.com/jobs/view/...
✅ Application submitted!

⏳ Rate limiting: waiting 65s...

[2/15] Staff Engineer at Stripe
📊 Match: 88.3% | Platform: linkedin
──────────────────────────────────────────────────────────────
...

✅ Daily goal reached (10 applications)

📊 BATCH APPLICATION SUMMARY
======================================================================
✅ Submitted:    10
❌ Failed:       0
⏭️  Skipped:      0
⚠️  Rate Limited: 0
──────────────────────────────────────────────────────────────
📈 Success Rate: 100.0%
⏱️  Duration:     18.5 minutes
🎯 Today's Total: 10/10
======================================================================
```

**Pro tips:**
- Start with `--max 5` to test
- Use `--min-score 80` for quality over quantity
- LinkedIn Easy Apply has highest success rate
- Run once per day to hit your goal
- Check `~/.applier/batch/` for progress files

---

### 3. Interview Preparation

**Practice interviews with AI coach.**

```bash
# Interactive mock interview
./applier-pro interview

# Will prompt for:
# - Company name
# - Job title
# - Job description (paste, then Ctrl+D)

# Then starts interactive interview:
# - Predicts 10 likely questions
# - You answer each one
# - Get real-time AI feedback
# - Scored 0-10 with improvement tips
```

**What you get:**

```
🔮 Predicting interview questions...
✅ Generated 10 questions

──────────────────────────────────────────────────────────
QUESTION 1/10
──────────────────────────────────────────────────────────

Tell me about a time when you had to make a difficult technical
decision with limited information.

Type: behavioral | Difficulty: medium
💡 Tip: Use STAR method: Situation, Task, Action, Result

Your answer (type 'skip' to skip, 'quit' to end):
> [You answer here...]

⏳ Getting AI feedback...

📊 SCORE: 7.5/10

FEEDBACK:
Great use of the STAR method! You clearly outlined the situation
and your role. Your answer would be stronger if you:
- Quantified the impact (e.g., "reduced latency by 40%")
- Explained why the information was limited
- Mentioned what you learned from this experience

Specific suggestions:
- Add metrics to the Result section
- Explain your decision-making process in more detail
...
```

**Features:**
- Predicts company-specific questions
- Behavioral (STAR method)
- Technical questions
- Situational scenarios
- Real-time coaching
- Session saved for review

**Pro tips:**
- Practice 2-3 times before real interview
- Review saved sessions: `~/.applier/interviews/`
- Focus on questions you scored low on
- Use STAR method for behavioral questions
- Be specific with examples

---

### 4. Salary Negotiation

**Get the compensation you deserve.**

```bash
# Interactive negotiation assistant
./applier-pro salary

# Will prompt for:
# - Company name
# - Job title
# - Base salary offered
# - Equity value
# - Bonus percentage
# - Sign-on bonus
# - Your target total comp

# Then provides:
# - Market analysis
# - Offer evaluation
# - Negotiation strategy
# - Counter-offer scripts
```

**Example output:**

```
📊 OFFER ANALYSIS
======================================================================
Your Offer Total Comp: $270,000
Market Median:         $280,000
Difference:            -$10,000
Base Percentile:       65.0%
Total Comp Percentile: 58.0%

Verdict: Fair - at market rate
Recommended Ask:       $207,000 base ($297,000 total)
======================================================================

💵 TOTAL COMPENSATION BREAKDOWN
──────────────────────────────────────────────────────────────
Year 1 Total:     $295,000  (includes sign-on)
Years 2-4 Total:  $270,000
Average Annual:   $275,000
4-Year Total:     $1,100,000
──────────────────────────────────────────────────────────────

🎯 NEGOTIATION STRATEGY
======================================================================

YOUR ASK: $297,000 total comp ($207,000 base)

JUSTIFICATION:
Based on my 5 years of experience in ML/AI and the current market
rates for this role at a Series B company in SF, I believe this
compensation reflects the value I'll bring to the team.

LEVERAGE POINTS:
  • 5 years ML experience with production systems
  • Similar offer at FAANG company
  • Specialized skills in LLMs (high demand)
  • Strong cultural fit demonstrated in interviews

📝 COUNTER-OFFER SCRIPT:
──────────────────────────────────────────────────────────────
Thank you so much for the offer - I'm really excited about
joining [Company] and contributing to [specific project].

I've done some research on market rates for this role, and based
on my experience level and the value I'll bring, I was hoping we
could discuss a base salary of $207,000, which would bring total
compensation to around $297,000.

I'm confident I can make an immediate impact on [specific area],
and I think this adjustment would reflect that value. What do you
think?
──────────────────────────────────────────────────────────────

🔄 IF THEY SAY NO:
──────────────────────────────────────────────────────────────
I understand budget constraints. Could we explore other
components? Perhaps:
- Additional equity to reach my target
- Performance bonus structure
- Earlier equity vesting schedule
- Professional development budget
- Sign-on bonus to bridge the gap

I'm flexible on how we structure it - what matters most is
reaching that $297k total comp target.
──────────────────────────────────────────────────────────────

💡 MINIMUM ACCEPTABLE: $267,300
🎯 IDEAL OUTCOME: $326,700
======================================================================
```

**Features:**
- Market data analysis
- Percentile calculation
- Total comp breakdown (4-year)
- Personalized scripts
- Multiple negotiation paths
- Walk-away point calculation

**Pro tips:**
- Always negotiate (worst case: they say no)
- Focus on total comp, not just base
- Have competing offer if possible
- Be professional and collaborative
- Know your minimum acceptable
- Consider equity, benefits, bonus

---

### 5. Company Research

**Know the company before you apply.**

```bash
# Quick research
./applier-pro research "Anthropic"

# Deep research with website scraping
./applier-pro research "Anthropic" --website "anthropic.com"

# Save to file
./applier-pro research "Stripe" --output stripe_research.md
```

**What you get:**

```
📊 COMPANY RESEARCH: Anthropic
======================================================================

# Anthropic

**Industry:** Artificial Intelligence / AI Safety
**Size:** 50-200 employees
**Location:** San Francisco, CA
**Funding:** Series B ($1.5B total raised)

**Mission:** Build reliable, interpretable, and steerable AI systems
that are safe and beneficial for humanity.

**Glassdoor Rating:** 4.5/5.0 (47 reviews)

**Pros:**
  • Cutting-edge AI research with real impact
  • Strong technical team and leadership
  • Mission-driven culture focused on safety
  • Competitive compensation and equity
  • Work-life balance respected

**Cons:**
  • Fast-paced startup environment
  • Ambiguity in roles and processes
  • Limited work-life balance during crunch times

**Interview Process:** Phone Screen → Technical (2 rounds) → Onsite (4-5 rounds) → Team Matching
**Difficulty:** Hard

**Tech Stack:** Python, PyTorch, TensorFlow, JAX, Rust, React, AWS

**Remote Policy:** Hybrid (3 days in office)

**Key Considerations:**
- Excellent for AI/ML specialists wanting to work on frontier models
- Strong emphasis on AI safety and alignment research
- Competitive with FAANG for compensation
- Hiring bar is very high - technical interviews are challenging
- Mission-driven culture attracts passionate people

**Bottom Line:**
If you're passionate about AI safety and want to work on some of
the most advanced language models in the world, Anthropic is an
excellent choice. Be prepared for rigorous interviews and a
fast-paced environment.
======================================================================
```

**Features:**
- Company overview
- Culture insights
- Glassdoor summary
- Interview process
- Red flag detection
- Tech stack
- Benefits analysis

**Pro tips:**
- Research before applying (shows interest)
- Use insights in cover letter
- Prepare for interview process
- Reference company values in interviews
- Check for red flags

---

## 📊 Complete Workflow Example

**Goal: Get hired as Senior Software Engineer**

### Week 1: Search & Apply

```bash
# Day 1: Setup
./applier-real setup
./applier-real search

# Day 1-2: Generate cover letters for top matches
./applier-pro cover --job-title "Senior SWE" --company "Anthropic" \
                     --job-description anthropic_job.txt --variants 2

./applier-pro cover --job-title "Senior SWE" --company "Stripe" \
                     --job-description stripe_job.txt --variants 2

# Day 3-7: Batch apply to remaining jobs
./applier-pro batch --max 10 --min-score 75 --daily-goal 10
# Repeat daily until you hit 50-100 applications
```

### Week 2: Interviews Start

```bash
# Got interview invite from Anthropic!

# Research the company
./applier-pro research "Anthropic" --output anthropic_research.md

# Prepare for interview
./applier-pro interview
# Enter: Anthropic, Senior SWE, [paste job description]
# Practice 10 questions with AI feedback
```

### Week 3: Offer Negotiation

```bash
# Got offer from Anthropic!

# Analyze and negotiate
./applier-pro salary
# Enter offer details
# Get negotiation strategy
# Use provided scripts
```

### Week 4: Accepted!

```bash
# Review stats
./applier-pro stats

# Results:
# - 75 applications sent
# - 12 responses (16% response rate)
# - 8 phone screens
# - 3 onsite interviews
# - 2 offers
# - 1 amazing job! 🎉
```

---

## 🔧 Advanced Usage

### Chaining Commands

```bash
# Research → Cover Letter → Apply pipeline
COMPANY="Anthropic"
JOB_TITLE="Senior SWE"

# 1. Research
./applier-pro research "$COMPANY" --output ${COMPANY}_research.md

# 2. Generate cover letter
./applier-pro cover \
  --company "$COMPANY" \
  --job-title "$JOB_TITLE" \
  --job-description job.txt \
  --variants 2

# 3. Manual apply with generated materials
```

### Automation with Cron

```bash
# Apply to 10 jobs every morning
0 9 * * * cd ~/blackroad-sandbox && ./applier-pro batch --max 10 --min-score 80
```

### Custom Scripts

```python
# custom_workflow.py
from pathlib import Path
import subprocess

# Your custom job hunting workflow
def daily_applications():
    # Search
    subprocess.run(["./applier-real", "search"])

    # Batch apply
    subprocess.run([
        "./applier-pro", "batch",
        "--max", "15",
        "--min-score", "75"
    ])

    # Generate report
    subprocess.run(["./applier-pro", "stats"])
```

---

## 📁 File Structure

```
~/.applier/
├── config.json                 # Your profile
├── resume.txt                  # Your resume
├── jobs.json                   # Latest search results
│
├── cover_letters/              # Generated cover letters
│   ├── Anthropic_Senior_SWE_abc123.json
│   ├── Stripe_Staff_Engineer_def456.json
│   └── ...
│
├── interviews/                 # Mock interview sessions
│   ├── session_20251220_143022.json
│   └── ...
│
├── company_research/           # Company profiles
│   ├── anthropic.json
│   ├── stripe.json
│   └── ...
│
├── batch/                      # Batch application progress
│   ├── batch_20251220_090000.json
│   ├── count_20251220.txt      # Today's count
│   └── ...
│
└── negotiation_*/              # Salary negotiation analyses
```

---

## 🐛 Troubleshooting

### API Key Issues

```bash
# Check if key is set
echo $ANTHROPIC_API_KEY

# Set temporarily
export ANTHROPIC_API_KEY="sk-ant-..."

# Set permanently
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
source ~/.zshrc
```

### Playwright Issues

```bash
# Reinstall browsers
playwright install

# Check if working
python3 -c "from playwright.async_api import async_playwright; print('OK')"
```

### Permission Denied

```bash
# Make scripts executable
chmod +x applier-pro
chmod +x applier-*.py
```

### Import Errors

```bash
# Install all dependencies
pip install anthropic playwright requests

# Or use requirements file if available
pip install -r requirements.txt
```

---

## 💡 Pro Tips & Best Practices

### For Maximum Success

1. **Quality over quantity**
   - Apply to 10 great matches > 50 poor matches
   - Use `--min-score 75` or higher
   - Customize cover letters for top choices

2. **Timing matters**
   - Apply early morning (before 11 AM)
   - Tuesday-Thursday best days
   - Fresh postings get more attention

3. **Track everything**
   - Use the built-in analytics
   - Review what's working
   - Iterate on your approach

4. **Prepare thoroughly**
   - Research every company you interview with
   - Practice with AI before real interviews
   - Always negotiate offers

5. **Stay organized**
   - One search per day
   - Batch apply consistently
   - Follow up on applications

### Success Metrics to Track

- **Response rate:** Aim for 15-20%
- **Interview rate:** Aim for 5-10% of applications
- **Offer rate:** Aim for 1-2% of applications
- **Time to offer:** Typically 2-4 weeks

### Red Flags to Avoid

- Companies with <3.0 Glassdoor rating
- Jobs reposted every week (high turnover)
- Vague job descriptions
- No salary range listed
- Multiple interview rounds (>6)

---

## 🎯 Goal Setting

### Recommended Targets

**Week 1:**
- 50 applications
- 5 cover letters customized
- 3 companies researched

**Week 2:**
- 3-5 phone screens
- 2 companies researched deeply
- 1 mock interview session

**Week 3:**
- 2-3 onsite interviews
- Interview prep daily
- Salary research for target companies

**Week 4:**
- 1-2 offers
- Negotiate both
- Accept best offer 🎉

---

## 🆘 Support

### Getting Help

- Check this guide first
- Run `./applier-pro help`
- Check `~/.applier/` for logs
- Review individual tool docs

### Contributing

Found a bug or have a feature request? This is part of the BlackRoad OS project.

---

## 📈 What's Next

After you're using applier-pro successfully:

1. **Optimize your resume** - Based on what's getting responses
2. **Refine your targeting** - Focus on platforms/companies that work
3. **Build your network** - Use LinkedIn connections
4. **Track your progress** - Use analytics to improve

---

## ✨ Success Stories

**Expected results after 2 weeks:**

- 75-100 applications sent
- 12-18 responses (15-18% response rate)
- 5-8 phone screens
- 2-3 onsite interviews
- 1-2 offers
- **One amazing new job** 🚀

---

## 🎉 You Got This!

With applier-pro, you have:
- ✅ AI-powered cover letters
- ✅ Automated batch applications
- ✅ Interview preparation system
- ✅ Salary negotiation coaching
- ✅ Company research automation

**Everything you need to land your dream job.**

Now go get hired! 💪

---

**Built with Claude Code • Powered by Claude Sonnet 4**
**Version 2.0 • December 2025**
