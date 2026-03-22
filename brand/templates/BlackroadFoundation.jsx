import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadFoundation() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        
        *{margin:0;padding:0;box-sizing:border-box;shape-rendering:geometricPrecision}
        html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;-webkit-text-stroke:.2px rgba(255,255,255,.1)}
        :root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--white:#fff;--black:#000;--border:#1a1a1a;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
        body{background:var(--bg);color:var(--white);font-family:var(--sg);overflow-x:hidden}
        .grad-bar{height:4px;background:var(--g);image-rendering:crisp-edges}
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px;text-decoration:none}
        .nav-links{display:flex;gap:32px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--white);opacity:.5;text-decoration:none;transition:opacity .2s}
        .nav-links a:hover{opacity:1}
        a.btn-outline,a.btn-solid,a.btn-lg{text-decoration:none;display:inline-flex;align-items:center}
        .btn-outline{padding:8px 20px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-weight:600;font-family:var(--sg);transition:border-color .2s}
        .btn-outline:hover{border-color:#444}
        .btn-solid{padding:8px 20px;border:none;border-radius:6px;background:var(--white);color:var(--black);font-size:13px;font-weight:600;font-family:var(--sg)}
        .hero{text-align:center;padding:120px 48px 80px;position:relative}
        .orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:.06;pointer-events:none}
        .orb-1{width:400px;height:400px;background:#FF2255;top:-150px;left:-5%}
        .orb-2{width:350px;height:350px;background:#4488FF;top:-100px;right:-5%}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);margin-bottom:32px}
        .hero-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--g135)}
        .hero h1{font-size:64px;font-weight:700;color:var(--white);line-height:1.08;margin-bottom:24px;max-width:780px;margin-left:auto;margin-right:auto;letter-spacing:-.02em}
        .hero p{font-size:18px;color:var(--white);opacity:.45;max-width:520px;margin:0 auto 48px;line-height:1.7}
        .hero-cta{display:flex;gap:16px;justify-content:center}
        .btn-lg{padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;font-family:var(--sg)}
        .btn-lg-solid{background:var(--white);color:var(--black);border:none}
        .btn-lg-outline{background:transparent;color:var(--white);border:1px solid var(--border);transition:border-color .2s}
        .section{max-max-width:1100px;width:100%;margin:0 auto;padding:80px 48px}
        .section-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .section-desc{font-size:14px;color:var(--white);opacity:.4;max-width:460px;margin-bottom:48px}
        .metrics-strip{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .metric-cell{padding:28px 24px;border-right:1px solid var(--border)}
        .metric-cell:last-child{border-right:none}
        .metric-value{font-size:32px;font-weight:700;color:var(--white);margin-bottom:4px;letter-spacing:-.02em}
        .metric-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.06em;text-transform:uppercase}
        .tool-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .tool-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative;transition:border-color .2s}
        .tool-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .tool-card:hover{border-color:#333}
        .tool-name{font-size:18px;font-weight:700;color:var(--white);margin-bottom:8px}
        .tool-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:16px}
        .tool-file{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .repo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .repo-card{border:1px solid var(--border);border-radius:8px;padding:20px;position:relative}
        .repo-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:8px 8px 0 0;image-rendering:crisp-edges}
        .repo-name{font-size:14px;font-weight:700;color:var(--white);margin-bottom:4px}
        .repo-desc{font-size:11px;color:var(--white);opacity:.35;line-height:1.5;margin-bottom:8px}
        .repo-tag{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .repo-stats{border-top:1px solid var(--border);margin-top:24px}
        .repo-stat-row{display:grid;grid-template-columns:160px 1fr;gap:16px;padding:12px 0;border-bottom:1px solid var(--border)}
        .repo-stat-label{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.25;text-transform:uppercase;letter-spacing:.04em}
        .repo-stat-value{font-size:14px;color:var(--white);opacity:.5}
        .endow-list{border-top:1px solid var(--border)}
        .endow-row{display:grid;grid-template-columns:200px 1fr auto;gap:16px;padding:14px 0;border-bottom:1px solid var(--border);align-items:center}
        .endow-asset{font-size:14px;font-weight:600;color:var(--white)}
        .endow-desc{font-size:13px;color:var(--white);opacity:.4}
        .endow-cost{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.2}
        .impact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .impact-card{border:1px solid var(--border);border-radius:8px;padding:24px;text-align:center}
        .impact-value{font-size:28px;font-weight:700;color:var(--white);margin-bottom:4px}
        .impact-label{font-size:12px;color:var(--white);opacity:.35}
        .stack-list{border-top:1px solid var(--border)}
        .stack-row{display:grid;grid-template-columns:160px 1fr auto;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .stack-layer{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.25;text-transform:uppercase;letter-spacing:.04em}
        .stack-desc{font-size:14px;color:var(--white);opacity:.5}
        .stack-file{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .mission-card{border:1px solid var(--border);border-radius:12px;padding:48px;position:relative}
        .mission-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .mission-title{font-size:24px;font-weight:700;color:var(--white);margin-bottom:16px}
        .mission-text{font-size:14px;color:var(--white);opacity:.4;line-height:2;max-width:600px}
        .pill{text-decoration:none;padding:8px 18px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);opacity:.5;display:inline-flex;align-items:center;gap:8px}
        .pill-dot{width:6px;height:6px;border-radius:50%;background:var(--g135)}
        footer{border-top:1px solid var(--border);padding:48px;display:flex;justify-content:space-between;align-items:center}
        .footer-brand{font-weight:700;font-size:16px;color:var(--white);text-decoration:none}
        .footer-links{display:flex;gap:24px}
        .footer-links a{font-size:13px;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .2s}
        .footer-links a:hover{opacity:1}
        .footer-copy{font-size:12px;color:var(--white);opacity:.2}
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}.nav-links{display:none}
          .hero{padding:80px 20px 60px}.hero h1{font-size:36px}
          .section{padding:48px 20px}.tool-grid,.repo-grid,.impact-grid{grid-template-columns:1fr}
          .mission-card{padding:28px}
          .endow-row{grid-template-columns:1fr}.endow-cost{display:none}
          .stack-row{grid-template-columns:1fr}.stack-file{display:none}
          .metrics-strip{grid-template-columns:repeat(2,1fr)}
          footer{flex-direction:column;gap:16px;text-align:center;padding:32px 20px}
        }
        
        /* ═══ RESPONSIVE — fit to screen ═══ */
        @media(max-max-width:1024px;width:100%){
          .metrics-strip{grid-template-columns:repeat(3,1fr)}
          .org-grid,.grid-4,.tier-grid,.cap-grid,.stat-grid,.shield-grid,.surface-grid,.stats-row{grid-template-columns:repeat(2,1fr)}
          .node-grid{grid-template-columns:repeat(3,1fr)}
          .product-grid,.features-grid,.focus-grid,.gallery,.team-grid,.pricing{grid-template-columns:repeat(2,1fr)}
          .footer-grid{grid-template-columns:1fr 1fr}
          .cloud-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}
          .nav-links{display:none}
          .hero{padding:80px 20px 60px}
          .hero h1{font-size:36px}
          .hero-cta{flex-direction:column;align-items:center}
          .section,.section-wide{padding:48px 20px}
          .metrics-strip{grid-template-columns:repeat(2,1fr)}
          .product-featured{grid-template-columns:1fr}
          .product-grid,.features-grid,.focus-grid,.gallery,.team-grid,.pricing,.cap-grid,.tier-grid,.shield-grid{grid-template-columns:1fr}
          .org-grid,.grid-4,.stat-grid,.stats-row,.surface-grid{grid-template-columns:1fr}
          .node-grid{grid-template-columns:1fr 1fr}
          .cloud-grid{grid-template-columns:1fr}
          footer{padding:32px 20px}
          .footer-grid{grid-template-columns:1fr}
          .footer-bottom{flex-direction:column;gap:12px;text-align:center}
          .topnav{padding:10px 16px}
          .topnav-links{gap:8px;flex-wrap:wrap}
          .topnav-links a{font-size:11px}
        }
        
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#f5f5f5", overflowX: "hidden", width: "100%", fontFamily: grotesk }}>

<div className="grad-bar"></div>
<nav>
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Foundation</a>
  <div className="nav-links"><a href="#tools">Tools</a><a href="#portfolio">Portfolio</a><a href="#endowment">Endowment</a><a href="#impact">Impact</a><a href="#mission">Mission</a></div>
  <div style={{{ display: "flex", gap: 10 }}}><a href="#mission" className="btn-outline">Mission</a><a href="https://github.com/blackboxprogramming" target="_blank" className="btn-solid">GitHub</a></div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div><div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 5 Operations Tools · 68 Active Repos · $136/mo</div>
  <h1>Run the org like you run the code</h1>
  <p>Five Python tools for CRM, HR, grants, donors, and events. 68 GitHub repos, 207 Gitea repos, 16 divisions — all on $136/mo infrastructure.</p>
  <div className="hero-cta"><a href="#tools" className="btn-lg btn-lg-solid">View Tools</a><a href="#portfolio" className="btn-lg btn-lg-outline">Open Source Portfolio</a></div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">5</div><div className="metric-label">Operations Tools</div></div>
    <div className="metric-cell"><div className="metric-value">68</div><div className="metric-label">Active Repos</div></div>
    <div className="metric-cell"><div className="metric-value">16</div><div className="metric-label">Divisions</div></div>
    <div className="metric-cell"><div className="metric-value">$136</div><div className="metric-label">Monthly Cost</div></div>
  </div>
</div>

<section className="section" id="tools">
  <div className="section-label">Tools</div>
  <div className="section-title">Six operations tools</div>
  <div className="section-desc">CRM, HR, grants, donors, events, and budgets. Everything an organization needs to run, built in Python.</div>
  <div className="tool-grid">
    <div className="tool-card"><div className="tool-name">CRM</div><div className="tool-desc">Contact management, interaction tracking, pipeline stages, deal scoring. Your own Salesforce in a Python file.</div><div className="tool-file">crm.py</div></div>
    <div className="tool-card"><div className="tool-name">HR System</div><div className="tool-desc">Employee records, onboarding workflows, performance reviews, time tracking. No BambooHR required.</div><div className="tool-file">hr_system.py</div></div>
    <div className="tool-card"><div className="tool-name">Grant Tracker</div><div className="tool-desc">Grant application lifecycle management. Deadline tracking, compliance reporting, funding pipeline.</div><div className="tool-file">grant_tracker.py</div></div>
    <div className="tool-card"><div className="tool-name">Donor Management</div><div className="tool-desc">Donor profiles, contribution tracking, recurring donations, tax receipt generation.</div><div className="tool-file">donor_management.py</div></div>
    <div className="tool-card"><div className="tool-name">Event Manager</div><div className="tool-desc">Event planning, RSVP tracking, venue management, agenda builder. From meetups to conferences.</div><div className="tool-file">event_manager.py</div></div>
    <div className="tool-card"><div className="tool-name">Budget Tracker</div><div className="tool-desc">Budget planning, expense categorization, variance analysis. Every dollar has a line item, every change a <a href="https://operations-blackroad-io.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>git commit</a>.</div><div className="tool-file">budget_tracker.py</div></div>
  </div>
</section>

<section className="section" id="portfolio">
  <div className="section-label">Open Source Portfolio</div>
  <div className="section-title">What the Foundation stewards</div>
  <div className="repo-grid">
    <div className="repo-card"><div className="repo-name">BlackRoad-Operating-System</div><div className="repo-desc">400+ shell scripts, CLI tools, the entire OS layer</div><div className="repo-tag">flagship</div></div>
    <div className="repo-card"><div className="repo-name">lucidia</div><div className="repo-desc">Lucidia API, FastAPI services, CarPool app</div><div className="repo-tag">platform</div></div>
    <div className="repo-card"><div className="repo-name">quantum-math-lab</div><div className="repo-desc">Mathematical frameworks, quantum computing research</div><div className="repo-tag">research</div></div>
    <div className="repo-card"><div className="repo-name">simulation-theory</div><div className="repo-desc">Simulation hypothesis mathematical models</div><div className="repo-tag">research</div></div>
    <div className="repo-card"><div className="repo-name">blackroad-api-sdks</div><div className="repo-desc">API SDKs for BlackRoad services</div><div className="repo-tag">developer</div></div>
    <div className="repo-card"><div className="repo-name">blackroad-operator</div><div className="repo-desc">Fleet operator — 48MB, largest repo</div><div className="repo-tag">infrastructure</div></div>
  </div>
  <div className="repo-stats">
    <div className="repo-stat-row"><div className="repo-stat-label">GitHub</div><div className="repo-stat-value">68 active repos (down from ~111, ~47 archived for being duplicates/templates/empty)</div></div>
    <div className="repo-stat-row"><div className="repo-stat-label">Gitea</div><div className="repo-stat-value">207 repos across 7 orgs on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Octavia</a> (181 active, 26 empty placeholders)</div></div>
    <div className="repo-stat-row"><div className="repo-stat-label">PRs</div><div className="repo-stat-value">All 1,200+ open PRs merged/closed across 17 owners</div></div>
    <div className="repo-stat-row"><div className="repo-stat-label">Documentation</div><div className="repo-stat-value">22 READMEs fully rewritten, 85+ repo descriptions updated</div></div>
  </div>
</section>

<section className="section" id="endowment">
  <div className="section-label">Infrastructure Endowment</div>
  <div className="section-title">Physical assets</div>
  <div className="endow-list">
    <div className="endow-row"><div className="endow-asset"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>5 Raspberry Pis</a></div><div className="endow-desc">Alice (Pi400), Cecilia, Octavia, Aria, Lucidia (all Pi5)</div><div className="endow-cost">$40/mo power</div></div>
    <div className="endow-row"><div className="endow-asset"><a href="https://blackroad-infra.pages.dev#accelerators" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>2x Hailo-8</a></div><div className="endow-desc">26 TOPS each = 52 TOPS total, on Cecilia and Octavia</div><div className="endow-cost">included</div></div>
    <div className="endow-row"><div className="endow-asset">1TB NVMe</div><div className="endow-desc">Primary data store on Octavia — Gitea, Docker, models</div><div className="endow-cost">included</div></div>
    <div className="endow-row"><div className="endow-asset">2 DO Droplets</div><div className="endow-desc">gematria (NYC3, 4cpu/8GB) + anastasia (NYC1, 1cpu/1GB)</div><div className="endow-cost">$54/mo</div></div>
    <div className="endow-row"><div className="endow-asset"><a href="https://blackroad-guardian-dashboard.pages.dev#encryption" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>WireGuard Mesh</a></div><div className="endow-desc">anastasia hub → alice, cecilia, octavia, aria, gematria (10.8.0.x)</div><div className="endow-cost">included</div></div>
    <div className="endow-row"><div className="endow-asset"><a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cloudflare</a></div><div className="endow-desc">95+ Pages, 40 KV, 7 D1, 10 R2, 18 tunnels, 48+ domains</div><div className="endow-cost">$25/mo</div></div>
    <div className="endow-row"><div className="endow-asset">Domains</div><div className="endow-desc">48+ custom domains across all orgs</div><div className="endow-cost">$17/mo</div></div>
  </div>
</section>

<section className="section" id="impact">
  <div className="section-label">Community Impact</div>
  <div className="section-title">By the numbers</div>
  <div className="impact-grid">
    <div className="impact-card"><div className="impact-value">16</div><div className="impact-label">Organizational divisions</div></div>
    <div className="impact-card"><div className="impact-value">400+</div><div className="impact-label">Shell scripts in <a href="https://blackroad-os-home.pages.dev" style={{{ color: "var(--white)", opacity: ".35", textDecoration: "underline", textUnderlineOffset: 3 }}}>BlackRoad OS</a></div></div>
    <div className="impact-card"><div className="impact-value">334</div><div className="impact-label">Web apps deployed</div></div>
    <div className="impact-card"><div className="impact-value">228</div><div className="impact-label"><a href="https://blackroad-assets.pages.dev#memory" style={{{ color: "var(--white)", opacity: ".35", textDecoration: "underline", textUnderlineOffset: 3 }}}>SQLite databases</a></div></div>
    <div className="impact-card"><div className="impact-value">156K</div><div className="impact-label">Memory entries (FTS5)</div></div>
    <div className="impact-card"><div className="impact-value">$0</div><div className="impact-label">SaaS spend</div></div>
  </div>
</section>

<section className="section" id="operations">
  <div className="section-label">Operations Stack</div>
  <div className="section-title">How the tools connect</div>
  <div className="stack-list">
    <div className="stack-row"><div className="stack-layer">Contacts</div><div className="stack-desc">CRM tracks every person — donors, employees, partners, applicants</div><div className="stack-file">crm.py</div></div>
    <div className="stack-row"><div className="stack-layer">People</div><div className="stack-desc">HR system manages internal team from onboarding through reviews</div><div className="stack-file">hr_system.py</div></div>
    <div className="stack-row"><div className="stack-layer">Funding</div><div className="stack-desc">Grant tracker manages applications, donor management tracks contributions</div><div className="stack-file">grant_tracker.py + donor_management.py</div></div>
    <div className="stack-row"><div className="stack-layer">Budget</div><div className="stack-desc">$136/mo tracked with variance analysis, versioned in <a href="https://operations-blackroad-io.pages.dev" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>git governance</a></div><div className="stack-file">budget_tracker.py</div></div>
    <div className="stack-row"><div className="stack-layer">Events</div><div className="stack-desc">Event manager pulls contacts from CRM for invites and RSVP tracking</div><div className="stack-file">event_manager.py</div></div>
    <div className="stack-row"><div className="stack-layer">Storage</div><div className="stack-desc">All data in <a href="https://blackroad-assets.pages.dev#memory" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>SQLite</a> — portable, backupable, no database server needed</div><div className="stack-file">~/.blackroad/</div></div>
  </div>
</section>

<section className="section" id="mission">
  <div className="mission-card">
    <div className="mission-title">Open infrastructure for everyone</div>
    <div className="mission-text">The Foundation exists to prove that organizations can run on open-source tools instead of enterprise SaaS. Every tool in this stack is a Python file backed by <a href="https://blackroad-assets.pages.dev#memory" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>SQLite</a>. No vendor lock-in, no per-seat pricing, no data leaving your machines. If a nonprofit can run on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>five Raspberry Pis</a> for <a href="https://finance-blackroad-io.pages.dev#economics" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>$136/mo</a>, so can yours.</div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://operations-blackroad-io.pages.dev" className="pill"><div className="pill-dot"></div> Governance &amp; Policy</a>
    <a href="https://blackroad-assets.pages.dev#memory" className="pill"><div className="pill-dot"></div> SQLite &amp; Archive</a>
    <a href="https://blackroad-guardian-dashboard.pages.dev" className="pill"><div className="pill-dot"></div> Security Tools</a>
    <a href="https://finance-blackroad-io.pages.dev#economics" className="pill"><div className="pill-dot"></div> $136/mo Economics</a>
    <a href="https://blackroad-infra.pages.dev" className="pill"><div className="pill-dot"></div> Hardware Fleet</a>
    <a href="https://blackroad-os-home.pages.dev" className="pill"><div className="pill-dot"></div> 400+ CLI Tools</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">BlackRoad Foundation</a>
  <div className="footer-links"><a href="https://github.com/blackboxprogramming" target="_blank">GitHub</a><a href="https://blackroad-io.pages.dev">OS Inc</a><a href="https://finance-blackroad-io.pages.dev">Ventures</a><a href="https://operations-blackroad-io.pages.dev">Gov</a><a href="https://blackroad-assets.pages.dev">Archive</a><a href="https://blackroad-os-home.pages.dev">OS</a></div>
  <div className="footer-copy">&copy; 2026 BlackRoad Foundation. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
