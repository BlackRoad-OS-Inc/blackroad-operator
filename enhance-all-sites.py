#!/usr/bin/env python3
"""Enhance all stub BlackRoad product sites into full interactive React apps."""
import os, json

WEBSITES_DIR = os.path.expanduser("~/blackroad-operator/websites")
SKIP = {"_shared", "_templates", "blackroad-io"}

PRODUCTS = {
    "boulevard": {"name": "Boulevard", "tagline": "Enterprise tools with human-scale design", "gradient": ["#4488FF", "#00D4FF"], "icon": "\u25A3",
        "features": [{"n": "CRM", "d": "Track every contact, deal, and interaction. Zero external APIs."},{"n": "Projects", "d": "Kanban, Gantt, timeline views. Assign to agents or humans."},{"n": "Team Chat", "d": "Real-time messaging built on NATS. Sovereign comms."},{"n": "Docs", "d": "Collaborative editing. Version history. Export to anything."}],
        "stats": [["Teams", "\u221E"], ["Storage", "Local"], ["APIs", "0"], ["Uptime", "99.9%"]],
        "terminal": ["$ br boulevard crm list", "> 142 contacts, 23 deals, 8 won this month", "$ br boulevard project create \"Q2 Launch\"", "> Project created. Board: kanban. Team: 5 assigned."]},
    "cruise": {"name": "Cruise", "tagline": "Set it. Forget it. It runs.", "gradient": ["#8844FF", "#4488FF"], "icon": "\u27F3",
        "features": [{"n": "Cron Jobs", "d": "Schedule anything. Monitor everything. Retry on failure."},{"n": "Workflows", "d": "Visual DAG builder. Chain tasks with conditional logic."},{"n": "Fleet Sync", "d": "Deploy schedules across all nodes simultaneously."},{"n": "Audit Log", "d": "Every execution logged. Every result stored. Full trace."}],
        "stats": [["Jobs", "47"], ["Nodes", "5"], ["Uptime", "100%"], ["Latency", "<1s"]],
        "terminal": ["$ br cruise list", "> 47 active jobs across 5 nodes", "$ br cruise add '*/5 * * * *' 'health-check --all'", "> Scheduled. Next run: 2 minutes. Retry: 3x."]},
    "detour": {"name": "Detour", "tagline": "Test everything. Ship what works.", "gradient": ["#FF2255", "#CC00AA"], "icon": "\u2442",
        "features": [{"n": "A/B Testing", "d": "Split traffic. Measure outcomes. Roll out winners."},{"n": "Feature Flags", "d": "Toggle features per user, device, or percentage."},{"n": "Canary Deploy", "d": "Send 1% of traffic first. Watch metrics. Then ship."},{"n": "Rollback", "d": "One click to revert. Previous version always warm."}],
        "stats": [["Tests", "12"], ["Flags", "34"], ["Deploy", "<30s"], ["Rollback", "1-click"]],
        "terminal": ["$ br detour flag create dark-mode --pct 10", "> Flag 'dark-mode' live for 10% of users", "$ br detour flag promote dark-mode --pct 100", "> Promoted to 100%. Monitoring metrics..."]},
    "family": {"name": "DropOff", "tagline": "Family logistics, simplified", "gradient": ["#FF6B2B", "#FF2255"], "icon": "\u25CE",
        "features": [{"n": "Shared Calendar", "d": "Everyone sees pickups, dropoffs, practices, events."},{"n": "Location Sharing", "d": "Know where everyone is. Privacy-first. Device-local."},{"n": "Task Lists", "d": "Groceries, chores, homework. Assign and track."},{"n": "Emergency Contacts", "d": "One tap to reach anyone. Offline-capable."}],
        "stats": [["Members", "\u221E"], ["Privacy", "100%"], ["Cloud", "None"], ["Cost", "Free"]],
        "terminal": ["$ dropoff calendar today", "> 3:30 Soccer practice (Maya)", "> 5:00 Piano lesson (Jake)", "$ dropoff task add groceries --assign mom", "> Added. Shared with family."]},
    "freeway": {"name": "Freeway", "tagline": "Open source. Open road.", "gradient": ["#00D4FF", "#4488FF"], "icon": "\u27F6",
        "features": [{"n": "Package Registry", "d": "Host your own npm/pip/cargo registry. No npmjs dependency."},{"n": "Mirror Manager", "d": "Mirror any public registry locally. Offline-first."},{"n": "License Scanner", "d": "Scan all dependencies for license compliance."},{"n": "Audit Trail", "d": "Every install logged. Every version pinned. Reproducible."}],
        "stats": [["Packages", "1.2K"], ["Mirrors", "3"], ["Scans", "Auto"], ["Storage", "Self"]],
        "terminal": ["$ br freeway mirror npmjs --packages react,next", "> Mirrored 2 packages + 847 deps (12MB)", "$ br freeway scan --license", "> 847 packages scanned. 0 GPL conflicts."]},
    "intersection": {"name": "Intersection", "tagline": "Where everything connects", "gradient": ["#CC00AA", "#8844FF"], "icon": "\u2726",
        "features": [{"n": "API Gateway", "d": "Route, rate-limit, and transform requests. One endpoint."},{"n": "Webhooks", "d": "Receive, validate, and forward events. Retry on failure."},{"n": "Event Bus", "d": "Pub/sub for every service. NATS-powered. Local-first."},{"n": "Health Dashboard", "d": "See every connection. Green/yellow/red. Real-time."}],
        "stats": [["Routes", "156"], ["Latency", "<5ms"], ["Protocols", "6"], ["Nodes", "5"]],
        "terminal": ["$ br intersection routes", "> 156 active routes across 5 nodes", "$ br intersection health", "> All green. 99.97% uptime this month."]},
    "median": {"name": "Median", "tagline": "Data that tells the truth", "gradient": ["#4488FF", "#8844FF"], "icon": "\u25C6",
        "features": [{"n": "Analytics", "d": "Page views, events, funnels. No cookies. No tracking pixels."},{"n": "Dashboards", "d": "Build custom views. Drag, drop, query. Real-time data."},{"n": "Reports", "d": "Scheduled exports. PDF, CSV, JSON. Email or save to disk."},{"n": "Privacy-First", "d": "All data stays on your hardware. GDPR by default."}],
        "stats": [["Events/s", "10K+"], ["Storage", "Local"], ["Cookies", "0"], ["Cost", "$0"]],
        "terminal": ["$ br median query 'pageviews last 7d'", "> 12,847 views | 3,201 unique | bounce: 34%", "$ br median export --format pdf --email team", "> Report generated. Sent to 3 recipients."]},
    "parkway": {"name": "Parkway", "tagline": "The scenic route to shipping", "gradient": ["#FF6B2B", "#8844FF"], "icon": "\u229E",
        "features": [{"n": "Code Review", "d": "Inline comments, suggestions, approvals. Gitea-native."},{"n": "PR Dashboard", "d": "See all open PRs across all repos. One view."},{"n": "Auto-merge", "d": "Green CI + approved = merged. No manual clicks."},{"n": "Release Notes", "d": "Auto-generated from commits. Markdown. Publishable."}],
        "stats": [["Repos", "239"], ["Reviews", "AI"], ["CI", "Self"], ["Deploy", "Auto"]],
        "terminal": ["$ br parkway prs --open", "> 7 open PRs across 4 repos", "$ br parkway release v2.4.0 --notes auto", "> Release notes generated from 23 commits. Published."]},
    "ramp": {"name": "Ramp", "tagline": "Zero to productive in minutes", "gradient": ["#FF6B2B", "#FF2255"], "icon": "\u25B3",
        "features": [{"n": "Guided Setup", "d": "Step-by-step onboarding. SSH keys, git config, tooling."},{"n": "Dev Environment", "d": "Pre-configured editor, terminal, debugger. Ready to code."},{"n": "Learning Paths", "d": "Curated guides per role. Backend, frontend, DevOps, AI."},{"n": "Checkpoints", "d": "Verify each step completed. Track progress. No gaps."}],
        "stats": [["Setup", "5min"], ["Paths", "8"], ["Steps", "Auto"], ["Cost", "Free"]],
        "terminal": ["$ br ramp init --role backend", "> Setting up: SSH keys... git config... toolchain...", "> Environment ready. 4/4 checks passed.", "$ br ramp path start 'rust-basics'", "> Lesson 1/12: Ownership & Borrowing. Ready."]},
    "route": {"name": "Route", "tagline": "Smart routing for everything", "gradient": ["#00D4FF", "#CC00AA"], "icon": "\u27E1",
        "features": [{"n": "DNS Routing", "d": "PowerDNS on your fleet. Authoritative and recursive."},{"n": "Load Balancer", "d": "Round-robin, least-connections, weighted. Health checks."},{"n": "Geo Routing", "d": "Route by location. Serve from the nearest node."},{"n": "Failover", "d": "Automatic fallback. If one node dies, traffic moves."}],
        "stats": [["Domains", "20"], ["Nodes", "7"], ["Failover", "Auto"], ["Latency", "<1ms"]],
        "terminal": ["$ br route status", "> 20 domains | 7 nodes | all healthy", "$ br route add api.blackroad.io --lb weighted", "> Route added. Weights: Alice 40%, Cecilia 35%, Octavia 25%"]},
    "shoulder": {"name": "Shoulder", "tagline": "When things break, we're here", "gradient": ["#FF2255", "#FF6B2B"], "icon": "\u25C7",
        "features": [{"n": "Incident Response", "d": "Detect, alert, triage, resolve. Automated runbooks."},{"n": "Status Page", "d": "Public-facing uptime. Auto-updates from health checks."},{"n": "Post-Mortems", "d": "Blameless analysis. Timeline reconstruction. Action items."},{"n": "On-Call", "d": "Rotation schedules. Escalation policies. PagerDuty-free."}],
        "stats": [["MTTR", "<5min"], ["Checks", "24/7"], ["Alerts", "Multi"], ["Cost", "$0"]],
        "terminal": ["$ br shoulder status", "> All systems operational. Last incident: 3 days ago.", "$ br shoulder oncall", "> Current: Alice (until 6am). Next: Octavia."]},
    "toll": {"name": "Toll", "tagline": "Metered access, sovereign billing", "gradient": ["#8844FF", "#CC00AA"], "icon": "\u22A1",
        "features": [{"n": "Usage Metering", "d": "Track API calls, compute time, storage per user."},{"n": "Rate Limiting", "d": "Per-key, per-IP, per-plan limits. Graceful degradation."},{"n": "Billing Engine", "d": "Stripe integration. Invoices. Usage-based pricing."},{"n": "Quotas", "d": "Set limits per tier. Warn at 80%. Block at 100%."}],
        "stats": [["Meters", "89"], ["Plans", "3"], ["Currency", "USD"], ["Reports", "Live"]],
        "terminal": ["$ br toll usage --user alex@example.com", "> API calls: 12,847/50,000 (25.7%)", "> Storage: 2.1GB/10GB (21%)", "$ br toll invoice generate --month march", "> Invoice #0042 generated. $47.20. Sent via Stripe."]},
    "stats": {"name": "BlackRoad Stats", "tagline": "Real-time fleet telemetry", "gradient": ["#00D4FF", "#4488FF"], "icon": "\u25C8",
        "features": [{"n": "Fleet Health", "d": "CPU, RAM, disk, temp for every node. Updated every 30s."},{"n": "Service Map", "d": "See which services run where. Dependencies visualized."},{"n": "Alerts", "d": "Threshold-based alerts. Multi-channel notifications."},{"n": "History", "d": "InfluxDB time series. Query any metric, any time range."}],
        "stats": [["Nodes", "7"], ["Metrics", "200+"], ["Interval", "30s"], ["Retention", "90d"]],
        "terminal": ["$ br stats fleet", "> Alice: CPU 12% | RAM 45% | Disk 67% | 42C", "> Cecilia: CPU 8% | RAM 38% | Disk 51% | 39C", "> Octavia: CPU 15% | RAM 52% | Disk 44% | 41C"]},
}

TEMPLATE = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%%NAME%% — BlackRoad OS</title>
<meta name="description" content="%%TAGLINE%%. Part of the BlackRoad OS ecosystem.">
<meta name="keywords" content="%%NAMELOWER%%,blackroad-os,sovereign-infrastructure,self-hosted">
<meta name="author" content="BlackRoad OS, Inc.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="%%CANONICAL%%">
<link rel="icon" type="image/png" sizes="32x32" href="https://images.blackroad.io/brand/br-square-32.png">
<meta property="og:title" content="%%NAME%% — BlackRoad OS">
<meta property="og:description" content="%%TAGLINE%%">
<meta property="og:type" content="website">
<meta property="og:url" content="%%CANONICAL%%">
<meta property="og:site_name" content="BlackRoad OS">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="%%NAME%% — BlackRoad OS">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebApplication","name":"%%NAME%%","url":"%%CANONICAL%%","description":"%%TAGLINE%%","author":{"@type":"Organization","name":"BlackRoad OS, Inc.","url":"https://blackroad.io"},"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}
</script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html,body{background:#0a0a0a;color:#f5f5f5;font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:#262626;border-radius:3px}
button{cursor:pointer}button:hover{opacity:0.88}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp 0.4s ease}
.seo-content{max-width:720px;margin:0 auto;padding:80px 20px}
.seo-content h1{font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:700;margin-bottom:16px}
.seo-content p{font-size:15px;color:#737373;line-height:1.65;margin-bottom:12px}
</style>
</head>
<body>
<div id="root">
<div class="seo-content">
  <h1>%%NAME%%</h1>
  <p>%%TAGLINE%%. Part of the BlackRoad OS ecosystem. Built by Alexa Amundson. BlackRoad OS, Inc.</p>
</div>
</div>
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
const { useState } = React;
const GRAD = `%%GRADCSS%%`;
const COLORS = %%COLORSJSON%%;
const T = {
  text: { primary: "#f5f5f5", secondary: "#d4d4d4", tertiary: "#a3a3a3", muted: "#737373", dim: "#525252", faint: "#404040", ghost: "#333", invisible: "#262626" },
  bg: { page: "#0a0a0a", card: "#131313", inset: "#0f0f0f" },
  border: { card: "#1a1a1a", subtle: "#141414", hover: "#262626" },
  font: { headline: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
};
const FEATURES = %%FEATURESJSON%%;
const STATS = %%STATSJSON%%;
const TERMINAL = %%TERMINALJSON%%;

function GradBar({ h = 2 }) { return <div style={{ height: h, background: GRAD }} />; }

function Nav() {
  return (
    <nav style={{ padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border.card}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 2 }}>{COLORS.map((c,i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />)}</div>
        <span style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700 }}>%%NAME%%</span>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <a href="https://blackroad.io" style={{ color: T.text.dim, fontSize: 13, textDecoration: "none" }}>BlackRoad</a>
        <a href="https://docs.blackroad.io" style={{ color: T.text.dim, fontSize: 13, textDecoration: "none" }}>Docs</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <div className="fade-up" style={{ maxWidth: 720, margin: "0 auto", padding: "100px 20px 60px", textAlign: "center" }}>
      <div style={{ fontFamily: T.font.mono, fontSize: 40, color: T.text.faint, marginBottom: 16 }}>%%ICON%%</div>
      <h1 style={{ fontFamily: T.font.headline, fontSize: "clamp(36px, 7vw, 56px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 16 }}>%%TAGLINE%%</h1>
      <p style={{ fontSize: 17, color: T.text.muted, maxWidth: 500, margin: "0 auto 40px" }}>%%NAME%% is part of BlackRoad OS. Self-hosted. Sovereign. No external dependencies.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="https://blackroad.io" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 8, fontFamily: T.font.mono, fontSize: 14, textDecoration: "none", background: GRAD, color: "#fff" }}>Get Started</a>
        <a href="https://docs.blackroad.io" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 8, fontFamily: T.font.mono, fontSize: 14, textDecoration: "none", border: `1px solid ${T.border.hover}`, color: T.text.secondary }}>Documentation</a>
      </div>
    </div>
  );
}

function StatsBar() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto 48px", padding: "0 20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${STATS.length}, 1fr)`, gap: 1, background: T.border.card, borderRadius: 10, overflow: "hidden" }}>
        {STATS.map(([label, value], i) => (
          <div key={i} style={{ background: T.bg.inset, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontFamily: T.font.headline, fontSize: 24, fontWeight: 700 }}>{value}</div>
            <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint, textTransform: "uppercase", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 48px" }}>
      <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Features</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {FEATURES.map((f, i) => (
          <div key={i} className="fade-up" onClick={() => setExpanded(expanded === i ? null : i)} style={{
            background: T.bg.card, border: `1px solid ${expanded === i ? T.border.hover : T.border.card}`, borderRadius: 12, padding: "20px 22px",
            cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: expanded === i ? GRAD : "transparent", transition: "all 0.3s" }} />
            <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{f.n}</div>
            <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.muted, lineHeight: 1.6 }}>{f.d}</div>
            {expanded === i && (
              <div className="fade-up" style={{ marginTop: 12, padding: "10px 14px", background: T.bg.inset, borderRadius: 8, border: `1px solid ${T.border.subtle}` }}>
                <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim, lineHeight: 1.8 }}>
                  Self-hosted on your hardware. No cloud dependency. Full audit trail. Works offline.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Terminal() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 48px" }}>
      <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>In Action</div>
      <div style={{ background: "#0d0d0d", border: `1px solid ${T.border.card}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.border.card}`, display: "flex", alignItems: "center", gap: 6 }}>
          {COLORS.slice(0,3).map((c,i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.6 }} />)}
          <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.ghost, marginLeft: 8 }}>terminal</span>
        </div>
        <div style={{ padding: "16px 20px", fontFamily: T.font.mono, fontSize: 13, lineHeight: 2 }}>
          {TERMINAL.map((line, i) => (
            <div key={i} style={{ color: line.startsWith("$") ? T.text.secondary : T.text.faint }}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px", textAlign: "center", borderTop: `1px solid ${T.border.card}` }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16 }}>
        {["blackroad.io", "docs.blackroad.io", "github.com/BlackRoad-OS-Inc"].map(u => (
          <a key={u} href={"https://" + u} style={{ color: T.text.faint, fontSize: 12, textDecoration: "none" }}>{u.split("/").pop() || u.split(".")[0]}</a>
        ))}
      </div>
      <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>&copy; 2024-2026 BlackRoad OS, Inc. All rights reserved.</div>
    </footer>
  );
}

function App() {
  return (
    <div style={{ background: T.bg.page, minHeight: "100vh" }}>
      <GradBar />
      <Nav />
      <Hero />
      <StatsBar />
      <Features />
      <Terminal />
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
</script>
</body>
</html>'''


def generate_html(dirname, product):
    p = product
    grad_css = "linear-gradient(135deg, " + ", ".join(p["gradient"]) + ")"
    canonical = "https://" + dirname + ".blackroad.io"
    html = TEMPLATE
    html = html.replace("%%NAME%%", p["name"])
    html = html.replace("%%NAMELOWER%%", p["name"].lower())
    html = html.replace("%%TAGLINE%%", p["tagline"])
    html = html.replace("%%CANONICAL%%", canonical)
    html = html.replace("%%ICON%%", p["icon"])
    html = html.replace("%%GRADCSS%%", grad_css)
    html = html.replace("%%COLORSJSON%%", json.dumps(p["gradient"]))
    html = html.replace("%%FEATURESJSON%%", json.dumps(p["features"]))
    html = html.replace("%%STATSJSON%%", json.dumps(p["stats"]))
    html = html.replace("%%TERMINALJSON%%", json.dumps(p["terminal"]))
    return html


def main():
    enhanced = 0
    skipped = 0
    for dirname in sorted(os.listdir(WEBSITES_DIR)):
        if dirname in SKIP or dirname.startswith("."):
            continue
        index_path = os.path.join(WEBSITES_DIR, dirname, "index.html")
        if not os.path.isfile(index_path):
            continue
        size = os.path.getsize(index_path)
        if size >= 16384:
            skipped += 1
            continue
        if dirname not in PRODUCTS:
            skipped += 1
            continue
        product = PRODUCTS[dirname]
        html = generate_html(dirname, product)
        with open(index_path, "w") as f:
            f.write(html)
        new_size = os.path.getsize(index_path)
        print(f"  Enhanced {dirname}: {size//1024}KB -> {new_size//1024}KB ({product['name']})")
        enhanced += 1
    print(f"\nDone. Enhanced: {enhanced} | Skipped: {skipped}")


if __name__ == "__main__":
    main()
