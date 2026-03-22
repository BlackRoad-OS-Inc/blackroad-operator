# 🌌 Cloudflare KPI Tracking - Quick Start

**Status:** ✅ System ready, awaiting API token  
**Owner:** Cece (Infrastructure Analytics)  
**Location:** `~/BlackRoad-Private/`

---

## 🚀 Quick Commands

```bash
# View quick reference
~/BlackRoad-Private/scripts/cloudflare-kpi-quickref.sh

# Collect analytics (requires token)
cd ~/BlackRoad-Private && ./scripts/cloudflare-analytics-tracker.sh

# Open dashboard
open ~/BlackRoad-Private/dashboards/cloudflare-kpi-dashboard.html

# Read full guide
cat ~/BlackRoad-Private/docs/CLOUDFLARE_KPI_TRACKING_GUIDE.md
```

---

## 🔐 First Time Setup

```bash
# Set API token (choose one method)
export CLOUDFLARE_API_TOKEN="your_token_here"

# OR add to wrangler config
echo 'api_token = "your_token"' >> ~/.wrangler/config/default.toml
```

**Get token from:** https://dash.cloudflare.com/profile/api-tokens

**Required scopes:**
- Zone:Analytics:Read
- Zone:Zone:Read  
- Account:Pages:Read
- Account:Analytics:Read

---

## 📊 What We Track

| Metric | Target | Alert |
|--------|--------|-------|
| Cache Hit Rate | >85% | <80% |
| Response Time | <500ms | >1s |
| Error Rate | <1% | >5% |
| Uptime | 99.9%+ | <99% |

---

## 🎯 Infrastructure

- **2 Zones:** blackroad.io, blackroad.systems
- **13 Pages Projects** (blackroad.io)
- **11 Production Services** (blackroad.systems)
- **24 Total Services**

---

## 📁 File Locations

```
~/BlackRoad-Private/
├── scripts/
│   ├── cloudflare-analytics-tracker.sh   # Main collector
│   └── cloudflare-kpi-quickref.sh        # This guide
├── dashboards/
│   └── cloudflare-kpi-dashboard.html     # Visual dashboard
└── docs/
    └── CLOUDFLARE_KPI_TRACKING_GUIDE.md  # Full documentation

~/.blackroad/analytics/                    # Data storage
├── zones-latest.json
├── pages-latest.json
└── analytics-{domain}-latest.json
```

---

## 🤝 Need Help?

- **Full Documentation:** `~/BlackRoad-Private/docs/CLOUDFLARE_KPI_TRACKING_GUIDE.md`
- **Session Summary:** `~/BlackRoad-Private/CLOUDFLARE_KPI_SYSTEM_INITIALIZED.md`
- **Memory System:** `~/memory-system.sh query entity:cloudflare`

---

**Ready to go!** Just need that API token to start collecting data. 🚀
