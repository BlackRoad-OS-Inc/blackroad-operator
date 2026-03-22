# applier-pro - Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Setup (One Time)
```bash
# Install dependencies
pip install anthropic playwright requests
playwright install

# Set API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Setup profile
./applier-real setup
```

### 2. Your Daily Workflow

```bash
# Morning: Search for jobs
./applier-real search

# Generate cover letter for top match
./applier-pro cover \
  --job-title "Your Target Role" \
  --company "Target Company" \
  --job-description job.txt \
  --variants 2

# Batch apply to others
./applier-pro batch --max 10 --min-score 75
```

### 3. When You Get Interview

```bash
# Research the company
./applier-pro research "Company Name"

# Practice interview
./applier-pro interview
```

### 4. When You Get Offer

```bash
# Analyze and negotiate
./applier-pro salary
```

---

## 📋 Command Cheat Sheet

| Command | What It Does | Example |
|---------|--------------|---------|
| `./applier-pro cover` | Generate AI cover letter | `--job-title "SWE" --company "Google"` |
| `./applier-pro batch` | Apply to multiple jobs | `--max 20 --min-score 80` |
| `./applier-pro interview` | Mock interview practice | Interactive mode |
| `./applier-pro salary` | Negotiate offers | Interactive mode |
| `./applier-pro research` | Company insights | `"Company Name"` |

---

## 💡 Pro Tips

1. **Generate 2-3 cover letter variants**, pick the best
2. **Set min-score to 75+** for quality applications
3. **Research companies** before interviews
4. **Practice interviews** 2-3 times before real ones
5. **Always negotiate** salary (worst case: they say no)

---

## 🎯 Weekly Goals

- **Week 1:** 50 applications, 5 custom cover letters
- **Week 2:** 3-5 phone screens, deep company research
- **Week 3:** 2-3 onsites, daily interview prep
- **Week 4:** 1-2 offers, negotiate, accept! 🎉

---

## 🆘 Quick Troubleshooting

**API Key Error?**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Permission Denied?**
```bash
chmod +x applier-pro applier-*.py
```

**Playwright Error?**
```bash
playwright install
```

---

## 📁 Important Files

- `~/.applier/resume.txt` - Your resume
- `~/.applier/jobs.json` - Search results
- `~/.applier/cover_letters/` - Generated letters
- `~/.applier/interviews/` - Practice sessions

---

**Full Guide:** See `APPLIER_PRO_GUIDE.md` for complete documentation

**Get Hired Faster with AI** 🚀
