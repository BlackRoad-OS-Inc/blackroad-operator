# br-stats - BlackRoad Portfolio Statistics CLI

## 🚀 Quick Start

```bash
# Show full dashboard
br-stats

# Show specific section
br-stats agents
br-stats business
br-stats infra

# Export as JSON
br-stats json > portfolio-stats.json
```

## 📋 Installation

```bash
# Make it globally available
chmod +x /Users/alexa/br-stats

# Optional: Add to PATH
sudo ln -s /Users/alexa/br-stats /usr/local/bin/br-stats

# Or add alias to ~/.zshrc or ~/.bashrc
echo "alias br-stats='/Users/alexa/br-stats'" >> ~/.zshrc
source ~/.zshrc
```

## 🎯 Commands

### Full Dashboard
```bash
br-stats
```
Shows complete portfolio statistics:
- Infrastructure scale (1,094 repos, 15 orgs, 60GB+)
- AI agent platform (30k capacity, 74+ days uptime)
- Business impact ($23M+ sales, 97% satisfaction)
- Credentials (FINRA licenses)
- Agent distribution breakdown
- Quick links

### Infrastructure Section
```bash
br-stats infra
# or
br-stats infrastructure
```
Shows:
- Total repositories: 1,094
- GitHub organizations: 15
- Infrastructure size: 60GB+
- Components in BlackRoad OS: 8,789
- Automation scripts: 356
- Production domains: 8+

### Agent Platform Section
```bash
br-stats agents
```
Shows:
- Agent capacity: 30,000
- Documented agents: 1,000+
- Distributed nodes: 7
- Production containers: 27+
- Production uptime: 74+ days
- Load average: 27+
- Agent distribution breakdown (with progress bars)

### Business Impact Section
```bash
br-stats business
# or
br-stats sales
```
Shows:
- Enterprise sales: $23M+
- AUM opportunities: $18.4M
- Sales goal achievement: 92%
- Client satisfaction: 97%
- Efficiency improvement: 33%
- Workflow speed increase: 50%+

### JSON Export
```bash
br-stats json
```
Exports all statistics as structured JSON:
```json
{
  "name": "Alexa Amundson",
  "infrastructure": {
    "repositories": 1094,
    "organizations": 15,
    "size_gb": 60,
    "blackroad os_components": 8789,
    "scripts": 356
  },
  "agent_platform": {
    "capacity": 30000,
    "documented": 1000,
    "nodes": 7,
    "containers": 27,
    "uptime_days": 74
  },
  "business": {
    "sales_millions": 23,
    "aum_millions": 18.4,
    "goal_pct": 92,
    "satisfaction_pct": 97
  }
}
```

## 💡 Use Cases

### For Job Interviews
```bash
# Quick reference before interview
br-stats

# Show specific achievements
br-stats business
```

### For Resume Updates
```bash
# Export latest stats
br-stats json > stats.json

# Verify numbers before updating resume
br-stats
```

### For LinkedIn Posts
```bash
# Get current metrics
br-stats agents

# Screenshot the output for social media
```

### For Presentations
```bash
# Export JSON for slides
br-stats json > presentation-data.json
```

## 🎨 Features

### Color-Coded Output
- 🔴 Red: Errors
- 🟢 Green: Success/Active status
- 🟡 Yellow: Warnings/Highlights
- 🔵 Blue: Info
- 🟣 Magenta: Special metrics
- 🔷 Cyan: Headers
- 🌸 BlackRoad Pink: Brand color (primary metrics)

### Progress Bars
Agent distribution shown with visual progress bars:
```
AI Research Agents        [████████████░░░░░░░░░░░░░░░░░░]  41%
Code Deployment Agents    [████████░░░░░░░░░░░░░░░░░░░░░░]  28%
```

### Emojis
Visual indicators for each metric:
- 📦 Repositories
- 🤖 Agents
- 💰 Sales
- ✅ Credentials
- 🏗️ Infrastructure
- 🔗 Links

## 🛠️ Customization

Edit `/Users/alexa/br-stats` to customize:

### Update Statistics
```bash
# Line ~54-60: Infrastructure metrics
print_metric "📦" "Total Repositories" "1,094" "$BLACKROAD"

# Line ~64-70: Agent platform metrics
print_metric "🧠" "Agent Capacity" "30,000" "$BLACKROAD"

# Line ~74-80: Business metrics
print_metric "💵" "Enterprise Sales Generated" "\$23M+" "$GREEN"
```

### Change Colors
```bash
# Lines 8-18: Color definitions
BLACKROAD='\033[38;5;198m'  # Change to your brand color
```

### Add New Sections
```bash
# Add to show_section() function
portfolio)
    print_section "📄 PORTFOLIO"
    print_metric "📝" "Resumes" "5" "$GREEN"
    ;;
```

## 📊 Sample Output

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██████╗ ██╗      █████╗  ██████╗██╗  ██╗██████╗  ██████╗  ║
║   ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔═══██╗ ║
║   ██████╔╝██║     ███████║██║     █████╔╝ ██████╔╝██║   ██║ ║
║   ██╔══██╗██║     ██╔══██║██║     ██╔═██╗ ██╔══██╗██║   ██║ ║
║   ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗██║  ██║╚██████╔╝ ║
║   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ║
║                                                              ║
║              PORTFOLIO STATISTICS & ACHIEVEMENTS             ║
║                  Alexa Amundson - 2026                       ║
╚══════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════
  🏗️  INFRASTRUCTURE SCALE
═══════════════════════════════════════════════════════════════

  📦  Total Repositories                  1,094
  🏢  GitHub Organizations                15
  💾  Infrastructure Size                 60GB+
  ...
```

## 🔧 Troubleshooting

### Permission Denied
```bash
chmod +x /Users/alexa/br-stats
```

### Command Not Found
```bash
# Use full path
/Users/alexa/br-stats

# Or add to PATH
export PATH="$PATH:/Users/alexa"
```

### Colors Not Showing
Terminal must support ANSI colors. Most modern terminals do.

## 🎯 Integration Ideas

### Add to Shell Prompt
```bash
# ~/.zshrc
precmd() {
    if [[ $PWD == *"blackroad"* ]]; then
        br-stats infra
    fi
}
```

### Git Hook
```bash
# .git/hooks/post-commit
#!/bin/bash
echo "Updated stats:"
br-stats infra
```

### Alfred Workflow
Create Alfred workflow that runs `br-stats` and displays output.

### Cron Job
```bash
# Update stats daily
0 9 * * * /Users/alexa/br-stats json > ~/stats-$(date +\%Y\%m\%d).json
```

## 📝 Notes

- All statistics verified against source documents
- Updated: January 30, 2026
- Source: BlackRoad OS portfolio verification
- Accuracy: 100%

## 🔗 Related Files

- Resumes: `/Users/alexa/BlackRoad_Resume_*.md`
- Portfolio: `/Users/alexa/portfolio-website.html`
- Verification: `/Users/alexa/RESUME_VERIFICATION_REPORT.md`

## 👤 Author

**Alexa Amundson**
- Email: amundsonalexa@gmail.com
- GitHub: github.com/blackboxprogramming
- Website: blackroad.io
- LinkedIn: linkedin.com/in/alexaamundson

---

*Built 1,094 repositories in under 2 years using AI as engineering team*
