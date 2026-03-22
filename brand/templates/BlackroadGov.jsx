import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadGov() {
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
        :root{
          --g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
          --g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
          --bg:#000;--white:#fff;--black:#000;--border:#1a1a1a;
          --sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;
        }
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
        .hero p{font-size:18px;color:var(--white);opacity:.45;max-width:560px;margin:0 auto 48px;line-height:1.7}
        .hero-cta{display:flex;gap:16px;justify-content:center}
        .btn-lg{padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;font-family:var(--sg)}
        .btn-lg-solid{background:var(--white);color:var(--black);border:none}
        .btn-lg-outline{background:transparent;color:var(--white);border:1px solid var(--border);transition:border-color .2s}
        .btn-lg-outline:hover{border-color:#444}
        .section{max-max-width:1100px;width:100%;margin:0 auto;padding:80px 48px}
        .section-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .section-desc{font-size:14px;color:var(--white);opacity:.4;max-width:460px;margin-bottom:48px}
        .metrics-strip{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .metric-cell{padding:28px 24px;border-right:1px solid var(--border)}
        .metric-cell:last-child{border-right:none}
        .metric-value{font-size:32px;font-weight:700;color:var(--white);margin-bottom:4px;letter-spacing:-.02em}
        .metric-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.06em;text-transform:uppercase}
        .tool-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
        .tool-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative;transition:border-color .2s}
        .tool-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .tool-card:hover{border-color:#333}
        .tool-name{font-size:18px;font-weight:700;color:var(--white);margin-bottom:8px}
        .tool-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:16px}
        .tool-file{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .gov-list{border-top:1px solid var(--border)}
        .gov-row{display:grid;grid-template-columns:200px 1fr;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .gov-label{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.25;text-transform:uppercase;letter-spacing:.04em}
        .gov-value{font-size:14px;color:var(--white);opacity:.5}
        .identity-card{border:1px solid var(--border);border-radius:12px;padding:48px;position:relative}
        .identity-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .identity-title{font-size:24px;font-weight:700;color:var(--white);margin-bottom:16px}
        .identity-text{font-size:14px;color:var(--white);opacity:.4;line-height:2;max-width:600px}
        .policy-table{border-top:1px solid var(--border)}
        .policy-row{display:grid;grid-template-columns:220px 1fr auto auto;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .policy-name{font-size:14px;font-weight:600;color:var(--white)}
        .policy-detail{font-size:13px;color:var(--white);opacity:.4;line-height:1.6}
        .policy-id{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.15}
        .policy-tag{padding:3px 10px;border:1px solid var(--border);border-radius:4px;font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3}
        .transparency-card{border:1px solid var(--border);border-radius:12px;overflow:hidden;position:relative}
        .transparency-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);image-rendering:crisp-edges;z-index:1}
        .transparency-header{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
        .transparency-header h3{font-size:16px;font-weight:600;color:var(--white)}
        .transparency-header span{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .transparency-grid{display:grid;grid-template-columns:1fr 1fr;gap:0}
        .transparency-cell{padding:20px 24px;border-bottom:1px solid var(--border);border-right:1px solid var(--border)}
        .transparency-cell:nth-child(2n){border-right:none}
        .transparency-cell:nth-last-child(-n+2){border-bottom:none}
        .transparency-metric{font-size:24px;font-weight:700;color:var(--white);margin-bottom:4px}
        .transparency-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
        .transparency-detail{font-size:12px;color:var(--white);opacity:.35;line-height:1.6}
        .audit-card{border:1px solid var(--border);border-radius:12px;overflow:hidden;position:relative}
        .audit-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);image-rendering:crisp-edges;z-index:1}
        .audit-header{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
        .audit-header h3{font-size:16px;font-weight:600;color:var(--white)}
        .audit-header span{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .audit-list{padding:0}
        .audit-row{display:grid;grid-template-columns:140px 1fr auto;gap:16px;padding:14px 24px;border-bottom:1px solid var(--border);align-items:center;font-family:var(--jb);font-size:12px}
        .audit-row:last-child{border-bottom:none}
        .audit-time{color:var(--white);opacity:.2}
        .audit-event{color:var(--white);opacity:.5;font-family:var(--sg);font-size:13px}
        .audit-status{width:6px;height:6px;border-radius:50%;background:var(--g135)}
        .budget-table{border-top:1px solid var(--border)}
        .budget-row{display:grid;grid-template-columns:200px 1fr auto;gap:24px;border-bottom:1px solid var(--border);padding:14px 0;align-items:center}
        .budget-label{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.25;letter-spacing:.04em;text-transform:uppercase}
        .budget-value{font-size:14px;color:var(--white);opacity:.5}
        .budget-cost{font-family:var(--jb);font-size:12px;color:var(--white);opacity:.3}
        .link-pill{padding:8px 18px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);opacity:.5;display:inline-flex;align-items:center;gap:8px;text-decoration:none;transition:border-color .2s}
        .link-pill:hover{border-color:#444;opacity:.7}
        .link-dot{width:6px;height:6px;border-radius:50%;background:var(--g135)}
        footer{border-top:1px solid var(--border);padding:48px;display:flex;justify-content:space-between;align-items:center}
        .footer-brand{font-weight:700;font-size:16px;color:var(--white);text-decoration:none}
        .footer-links{display:flex;gap:24px}
        .footer-links a{font-size:13px;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .2s}
        .footer-links a:hover{opacity:1}
        .footer-copy{font-size:12px;color:var(--white);opacity:.2}
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}.nav-links{display:none}
          .hero{padding:80px 20px 60px}.hero h1{font-size:36px}
          .hero-cta{flex-direction:column;align-items:center}
          .section{padding:48px 20px}.tool-grid{grid-template-columns:1fr}
          .identity-card{padding:28px}
          .gov-row{grid-template-columns:1fr}.gov-label{margin-bottom:-8px}
          .policy-row{grid-template-columns:1fr}.policy-id{display:none}
          .transparency-grid{grid-template-columns:1fr}
          .transparency-cell{border-right:none}
          .transparency-cell:nth-last-child(-n+2){border-bottom:1px solid var(--border)}
          .transparency-cell:last-child{border-bottom:none}
          .audit-row{grid-template-columns:100px 1fr auto}
          .budget-row{grid-template-columns:1fr auto}.budget-label{display:none}
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
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Gov</a>
  <div className="nav-links">
    <a href="#tools">Tools</a>
    <a href="#policies">Policies</a>
    <a href="#transparency">Transparency</a>
    <a href="#compliance">Compliance</a>
    <a href="#identity">Identity</a>
  </div>
  <div style={{{ display: "flex", gap: 10 }}}>
    <a href="#governance" className="btn-outline">Governance Model</a>
    <a href="https://github.com/blackboxprogramming" target="_blank" className="btn-solid">GitHub</a>
  </div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div>
  <div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 4 Civic Tools &middot; 5 Governed Nodes &middot; $136/mo</div>
  <h1>Government that runs on git</h1>
  <p>Every policy versioned, every dollar traced, every infrastructure decision auditable. Self-governance for sovereign infrastructure.</p>
  <div className="hero-cta">
    <a href="#tools" className="btn-lg btn-lg-solid">View Tools</a>
    <a href="#policies" className="btn-lg btn-lg-outline">Policy Registry</a>
  </div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">4</div><div className="metric-label">Civic Tools</div></div>
    <div className="metric-cell"><div className="metric-value">207</div><div className="metric-label">Gitea Repos</div></div>
    <div className="metric-cell"><div className="metric-value">$136</div><div className="metric-label">Monthly Budget</div></div>
    <div className="metric-cell"><div className="metric-value">5</div><div className="metric-label">Governed Nodes</div></div>
  </div>
</div>

<section className="section" id="tools">
  <div className="section-label">Tools</div>
  <div className="section-title">Four civic technology tools</div>
  <div className="section-desc">Budget tracking, digital identity, FOIA management, and policy versioning. All open, all auditable.</div>
  <div className="tool-grid">
    <div className="tool-card"><div className="tool-name">Budget Tracker</div><div className="tool-desc">Budget planning, expense categorization, variance analysis, and forecasting. Every dollar has a line item, every change has a commit. Tracks the <a href="https://finance-blackroad-io.pages.dev#economics" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>$136/mo infrastructure spend</a> across 2 droplets, 5 Pis, and Cloudflare.</div><div className="tool-file">budget_tracker.py</div></div>
    <div className="tool-card"><div className="tool-name">Digital Identity</div><div className="tool-desc">Decentralized identity with verifiable credentials. DID resolution, self-sovereign identity. You own your identity, not a platform. Backed by the same <a href="https://blackroad-guardian-dashboard.pages.dev#encryption" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>encryption stack</a> that protects the fleet.</div><div className="tool-file">digital_identity.py</div></div>
    <div className="tool-card"><div className="tool-name">FOIA Manager</div><div className="tool-desc">FOIA request tracking, document redaction tools, response management. Transparency by default. All documents stored in the <a href="https://blackroad-assets.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>sovereign archive</a>.</div><div className="tool-file">foia_manager.py</div></div>
    <div className="tool-card"><div className="tool-name">Policy Tracker</div><div className="tool-desc">Policy drafting with version control. Public comment periods, voting records, amendment tracking. Git for governance. Every policy below lives as a versioned document in <a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Gitea</a>.</div><div className="tool-file">policy_tracker.py</div></div>
  </div>
</section>

<section className="section" id="policies">
  <div className="section-label">Policy Registry</div>
  <div className="section-title">Active fleet policies</div>
  <div className="section-desc">Every policy is a versioned document. Changes require a commit message explaining why.</div>
  <div className="policy-table">
    <div className="policy-row">
      <div className="policy-name">Infrastructure Budget</div>
      <div className="policy-detail"><a href="https://finance-blackroad-io.pages.dev#economics" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>$136/mo</a> total: 2 DigitalOcean droplets (gematria 4cpu/8GB, anastasia 1cpu/1GB), 5 Raspberry Pis (power + SD cards), Cloudflare Pro. Zero SaaS subscriptions.</div>
      <div className="policy-id">BR-GOV-001</div>
      <div className="policy-tag">enforced</div>
    </div>
    <div className="policy-row">
      <div className="policy-name">Power Optimization</div>
      <div className="policy-detail">All nodes: conservative CPU governor, gpu_mem=16, swappiness=10, dirty_ratio=40, WiFi power management on. Cecilia capped at 2.0GHz, Octavia overclock removed. Applied via <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>power-optimize.sh</a>.</div>
      <div className="policy-id">BR-GOV-002</div>
      <div className="policy-tag">enforced</div>
    </div>
    <div className="policy-row">
      <div className="policy-name">Security Incident Response</div>
      <div className="policy-detail">All incidents tracked with IDs (<a href="https://blackroad-guardian-dashboard.pages.dev#threats" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>BR-SEC-*</a>). Obfuscated cron droppers removed immediately. Leaked credentials rotated within 24h. PATs revoked at source.</div>
      <div className="policy-id">BR-GOV-003</div>
      <div className="policy-tag">enforced</div>
    </div>
    <div className="policy-row">
      <div className="policy-name">Service Lifecycle</div>
      <div className="policy-detail">Unused services disabled, not deleted. 16 skeleton microservices on Lucidia disabled (~800MB freed). Java HelloWorld + simpleweb disabled. Every disable logged with rationale.</div>
      <div className="policy-id">BR-GOV-004</div>
      <div className="policy-tag">enforced</div>
    </div>
    <div className="policy-row">
      <div className="policy-name">Data Sovereignty</div>
      <div className="policy-detail">All data on own hardware. No SaaS storage, no cloud databases. <a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cloudflare</a> for edge/CDN only. Gitea self-hosted (207 repos). PostgreSQL on Alice. MinIO on Cecilia. Backups via rclone to own Google Drive.</div>
      <div className="policy-id">BR-GOV-005</div>
      <div className="policy-tag">enforced</div>
    </div>
  </div>
</section>

<section className="section" id="budget">
  <div className="section-label">Budget Breakdown</div>
  <div className="section-title">Where the $136 goes</div>
  <div className="section-desc">Every line item tracked in budget_tracker.py. Variance analysis runs monthly.</div>
  <div className="budget-table">
    <div className="budget-row"><div className="budget-label">Droplet: Gematria</div><div className="budget-value">DigitalOcean NYC3 &middot; 4 vCPU / 8GB RAM &middot; WireGuard hub &middot; <a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Nginx reverse proxy</a></div><div className="budget-cost">$48/mo</div></div>
    <div className="budget-row"><div className="budget-label">Droplet: Anastasia</div><div className="budget-value">DigitalOcean NYC1 &middot; 1 vCPU / 1GB RAM &middot; Headscale &middot; blackroad.io &middot; 94% disk</div><div className="budget-cost">$6/mo</div></div>
    <div className="budget-row"><div className="budget-label">Cloudflare Pro</div><div className="budget-value">95+ Pages &middot; 40 KV &middot; 7 D1 &middot; 10 R2 &middot; 18 tunnels &middot; 48+ custom domains</div><div className="budget-cost">$25/mo</div></div>
    <div className="budget-row"><div className="budget-label">Raspberry Pi Fleet</div><div className="budget-value">5 Pis (Alice Pi400, Cecilia/Octavia/Aria/Lucidia Pi5) &middot; power + SD replacement</div><div className="budget-cost">$40/mo</div></div>
    <div className="budget-row"><div className="budget-label">Domain Renewals</div><div className="budget-value">blackroad.io, blackroadai.com, and associated domains &middot; amortized monthly</div><div className="budget-cost">$17/mo</div></div>
  </div>
</section>

<section className="section" id="transparency">
  <div className="section-label">Transparency Report</div>
  <div className="section-title">Fleet governance data</div>
  <div className="section-desc">What changed, when, and why. Every decision has a paper trail.</div>
  <div className="transparency-card">
    <div className="transparency-header"><h3>Governance Transparency</h3><span>as of 2026-03-09</span></div>
    <div className="transparency-grid">
      <div className="transparency-cell">
        <div className="transparency-metric">207</div>
        <div className="transparency-label">Gitea Repos Versioned</div>
        <div className="transparency-detail">181 active, 26 empty placeholders. 7 orgs: blackroad-os (127), lucidia (14), platform (29). Hosted on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".35", textDecoration: "underline", textUnderlineOffset: 3 }}}>Octavia</a> :3100.</div>
      </div>
      <div className="transparency-cell">
        <div className="transparency-metric">100%</div>
        <div className="transparency-label">Cron Changes Committed</div>
        <div className="transparency-detail">All crontab modifications across all 5 nodes tracked in git. Includes autonomy scripts (heartbeat 1m, heal 5m), stats-proxy, and the removed <a href="https://blackroad-guardian-dashboard.pages.dev#threats" style={{{ color: "var(--white)", opacity: ".35", textDecoration: "underline", textUnderlineOffset: 3 }}}>obfuscated cron</a>.</div>
      </div>
      <div className="transparency-cell">
        <div className="transparency-metric">3/3</div>
        <div className="transparency-label">PUSH_SECRET Migrated</div>
        <div className="transparency-detail">Moved from plaintext crontabs to /opt/blackroad/stats-push.env (chmod 600) on <a href="https://blackroad-guardian-dashboard.pages.dev#audit" style={{{ color: "var(--white)", opacity: ".35", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia, Octavia, Lucidia</a>. Migration logged in audit trail.</div>
      </div>
      <div className="transparency-cell">
        <div className="transparency-metric">16+</div>
        <div className="transparency-label">Services Disabled with Rationale</div>
        <div className="transparency-detail">Every service disable decision documented: 16 skeleton microservices on Lucidia, Java HelloWorld, simpleweb, world-engine (overheating), rpi-connect-wayvnc crash loop.</div>
      </div>
    </div>
  </div>
</section>

<section className="section" id="compliance">
  <div className="section-label">Compliance Audit</div>
  <div className="section-title">Governance actions timeline</div>
  <div className="section-desc">Chronological record of policy enforcement and infrastructure governance decisions.</div>
  <div className="audit-card">
    <div className="audit-header"><h3>Fleet Governance Log</h3><span>2026-03-09 &middot; 5 nodes</span></div>
    <div className="audit-list">
      <div className="audit-row"><div className="audit-time">2026-03-09 04:00</div><div className="audit-event">Power optimization applied fleet-wide &mdash; conservative governor, gpu_mem=16, swappiness=10 on all <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>5 nodes</a></div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 03:30</div><div className="audit-event"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Octavia</a> overclock removed (over_voltage=6, arm_freq 2600&rarr;2000) per power policy BR-GOV-002</div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 03:00</div><div className="audit-event"><a href="https://blackroad-guardian-dashboard.pages.dev#threats" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a> obfuscated cron removed &mdash; dropper exec from /tmp/op.py deleted, incident BR-SEC-001</div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 02:45</div><div className="audit-event">PUSH_SECRET secured to .env files (chmod 600) on Cecilia, Octavia, Lucidia per security policy BR-GOV-003</div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 02:30</div><div className="audit-event"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a> github-relay.sh credentials moved to ~/.github-relay.env (chmod 600)</div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 02:15</div><div className="audit-event"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Lucidia</a> 16 skeleton microservices disabled per service lifecycle policy BR-GOV-004 &mdash; ~800MB RAM freed</div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 01:30</div><div className="audit-event"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Lucidia</a> world-engine.py disabled &mdash; was calling Ollama /api/generate nonstop, caused 73.8&deg;C overheating</div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 01:00</div><div className="audit-event">Cecilia + Octavia rebooted to apply config.txt changes &mdash; Cecilia throttle 0x50000&rarr;0x0, Octavia voltage +95mV</div><div className="audit-status"></div></div>
    </div>
  </div>
</section>

<section className="section" id="governance">
  <div className="section-label">Governance Model</div>
  <div className="section-title">Git-based governance</div>
  <div className="gov-list">
    <div className="gov-row"><div className="gov-label">Policy Versioning</div><div className="gov-value">Every policy change is a commit. Every amendment is a diff. Full history, no hidden edits. 207 repos across 7 orgs on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>self-hosted Gitea</a>.</div></div>
    <div className="gov-row"><div className="gov-label">Budget Transparency</div><div className="gov-value">Every expense tracked in budget_tracker.py. <a href="https://finance-blackroad-io.pages.dev#economics" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>$136/mo</a> broken down to the dollar. Variance analysis shows exactly where money goes.</div></div>
    <div className="gov-row"><div className="gov-label">Public Comments</div><div className="gov-value">Policy drafts have comment periods. Comments are tracked, addressed, and resolved &mdash; like pull request reviews.</div></div>
    <div className="gov-row"><div className="gov-label">FOIA by Default</div><div className="gov-value">Documents are public unless redacted. Redaction is tracked and auditable. All stored in the <a href="https://blackroad-assets.pages.dev" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>sovereign archive</a>.</div></div>
    <div className="gov-row"><div className="gov-label">Voting Records</div><div className="gov-value">Every vote on every policy is recorded with timestamps and verifiable identity via <a href="#identity" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>decentralized ID</a>.</div></div>
    <div className="gov-row"><div className="gov-label">Incident Accountability</div><div className="gov-value">Every <a href="https://blackroad-guardian-dashboard.pages.dev#threats" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>security incident</a> has a governance decision attached. Cron droppers, leaked PATs, miner references &mdash; all traced to root cause.</div></div>
  </div>
</section>

<section className="section" id="identity">
  <div className="identity-card">
    <div className="identity-title">Decentralized Identity</div>
    <div className="identity-text">
      digital_identity.py implements W3C Decentralized Identifiers (DIDs) and Verifiable Credentials. Your identity is a cryptographic key pair you control &mdash; not a username on someone else's server. Issue credentials, verify claims, resolve DIDs &mdash; all without a central authority. Backed by <a href="https://blackroad-guardian-dashboard.pages.dev#encryption" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>the same encryption</a> that protects the fleet.<br /><br />
      This is the foundation for everything else in Gov: budget approvals need verified identities, policy votes need <a href="https://blackroad-guardian-dashboard.pages.dev#tools" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>authenticated participants</a>, FOIA responses need accountable officials. Every node in the <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>fleet</a> has a DID. Every governance action is signed.
    </div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related Divisions</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroad-guardian-dashboard.pages.dev" className="link-pill"><div className="link-dot"></div> Security &amp; Incidents</a>
    <a href="https://blackroad-infra.pages.dev#fleet" className="link-pill"><div className="link-dot"></div> Hardware Fleet</a>
    <a href="https://finance-blackroad-io.pages.dev#economics" className="link-pill"><div className="link-dot"></div> Cost Breakdown</a>
    <a href="https://blackroad-assets.pages.dev" className="link-pill"><div className="link-dot"></div> Document Archive</a>
    <a href="https://blackroad-company.pages.dev" className="link-pill"><div className="link-dot"></div> Foundation CRM</a>
    <a href="https://blackroad-systems.pages.dev" className="link-pill"><div className="link-dot"></div> Cloudflare Infrastructure</a>
    <a href="https://blackroad-guardian-dashboard.pages.dev#encryption" className="link-pill"><div className="link-dot"></div> Encryption Stack</a>
    <a href="https://blackroad-os-home.pages.dev" className="link-pill"><div className="link-dot"></div> CLI Tools</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">BlackRoad Gov</a>
  <div className="footer-links">
    <a href="https://github.com/blackboxprogramming" target="_blank">GitHub</a>
    <a href="https://blackroad-io.pages.dev">OS Inc</a>
    <a href="https://blackroad-guardian-dashboard.pages.dev">Security</a>
    <a href="https://blackroad-infra.pages.dev">Hardware</a>
    <a href="https://blackroad-systems.pages.dev">Cloud</a>
    <a href="https://blackroad-company.pages.dev">Foundation</a>
    <a href="https://blackroad-assets.pages.dev">Archive</a>
  </div>
  <div className="footer-copy">&copy; 2026 BlackRoad Gov. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>







      </div>
    </>
  );
}
