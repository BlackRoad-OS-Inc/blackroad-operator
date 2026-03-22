import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadStudio() {
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
        .hero p{font-size:18px;color:var(--white);opacity:.45;max-width:560px;margin:0 auto 48px;line-height:1.7}
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
        .rule-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
        .rule-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative;transition:border-color .2s}
        .rule-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .rule-card:hover{border-color:#333}
        .rule-name{font-size:18px;font-weight:700;color:var(--white);margin-bottom:8px}
        .rule-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:16px}
        .rule-code{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.2;border:1px solid var(--border);border-radius:6px;padding:12px;line-height:1.8}
        .identity-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .identity-card{border:1px solid var(--border);border-radius:12px;padding:36px;position:relative}
        .identity-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .identity-title{font-size:20px;font-weight:700;color:var(--white);margin-bottom:8px}
        .identity-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:12px}
        .identity-tag{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .tmpl-list{border-top:1px solid var(--border)}
        .tmpl-row{display:grid;grid-template-columns:40px 180px 1fr auto;gap:16px;padding:12px 0;border-bottom:1px solid var(--border);align-items:center}
        .tmpl-num{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.15}
        .tmpl-name a{font-size:13px;font-weight:600;color:var(--white);text-decoration:underline;text-underline-offset:3px;opacity:.7}
        .tmpl-desc{font-size:12px;color:var(--white);opacity:.35}
        .tmpl-size{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .org-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .org-card{border:1px solid var(--border);border-radius:8px;padding:20px;display:block;text-decoration:none;color:var(--white);transition:border-color .2s;position:relative}
        .org-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:8px 8px 0 0;image-rendering:crisp-edges}
        .org-card:hover{border-color:#333}
        .org-name{font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px}
        .org-desc{font-size:11px;color:var(--white);opacity:.35;line-height:1.5}
        .css-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
        .css-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative}
        .css-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .css-title{font-size:16px;font-weight:700;color:var(--white);margin-bottom:8px}
        .css-desc{font-size:12px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:12px}
        .css-code{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2;border:1px solid var(--border);border-radius:6px;padding:10px;line-height:1.8}
        .enforce-list{border-top:1px solid var(--border)}
        .enforce-row{display:grid;grid-template-columns:200px 1fr;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .enforce-label{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.25;text-transform:uppercase;letter-spacing:.04em}
        .enforce-value{font-size:14px;color:var(--white);opacity:.5}
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
          .section{padding:48px 20px}.rule-grid,.identity-grid,.css-grid{grid-template-columns:1fr}
          .org-grid{grid-template-columns:repeat(2,1fr)}
          .tmpl-row{grid-template-columns:1fr}.tmpl-num,.tmpl-size{display:none}
          .enforce-row{grid-template-columns:1fr}.enforce-label{margin-bottom:-8px}
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
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Studio</a>
  <div className="nav-links"><a href="#rules">Rules</a><a href="#templates">Templates</a><a href="#orgs">Orgs</a><a href="#css">CSS</a><a href="#enforcement">Enforcement</a></div>
  <div style={{{ display: "flex", gap: 10 }}}><a href="https://blackroad-brand-kit.pages.dev" className="btn-outline">Brand Guide</a><a href="https://blackroad-io.pages.dev" className="btn-solid">OS Inc</a></div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div><div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 15 Templates · 16 Org Sites · 131KB Brand Guide</div>
  <h1>Design rules that cannot be broken</h1>
  <p>One brand system enforced across 16 orgs and 48+ domains. Plain HTML, no build step, no JSX. The rules are the product.</p>
  <div className="hero-cta"><a href="#rules" className="btn-lg btn-lg-solid">View Rules</a><a href="https://blackroad-brand-kit.pages.dev" className="btn-lg btn-lg-outline">Full Brand Guide</a></div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">15</div><div className="metric-label">Base Templates</div></div>
    <div className="metric-cell"><div className="metric-value">16</div><div className="metric-label">Org Sites</div></div>
    <div className="metric-cell"><div className="metric-value">48+</div><div className="metric-label">Domains</div></div>
    <div className="metric-cell"><div className="metric-value">131KB</div><div className="metric-label">Brand Guide</div></div>
  </div>
</div>

<section className="section" id="rules">
  <div className="section-label">Brand Rules</div>
  <div className="section-title">Four rules, zero exceptions</div>
  <div className="section-desc">Every template, every page, every org follows these exact rules. No interpretation needed.</div>
  <div className="rule-grid">
    <div className="rule-card"><div className="rule-name">Colors</div><div className="rule-desc">Only white and black text. The gradient is for decorative elements only — bars, dots, accents. Never colored text, never colored backgrounds on containers.</div><div className="rule-code">#FF6B2B → #FF2255 → #CC00AA<br />→ #8844FF → #4488FF → #00D4FF</div></div>
    <div className="rule-card"><div className="rule-name">Typography</div><div className="rule-desc">Space Grotesk for display and body text. JetBrains Mono for code, labels, and metadata. No other fonts, no system fallbacks visible.</div><div className="rule-code">--sg: 'Space Grotesk', sans-serif<br />--jb: 'JetBrains Mono', monospace</div></div>
    <div className="rule-card"><div className="rule-name">Containers</div><div className="rule-desc">Containers are outlined (1px border) or lined (border-top/bottom). Never color-filled. Black backgrounds only. Gradient accent bars on top of cards via ::before pseudo-elements.</div><div className="rule-code">border: 1px solid var(--border)<br />background: transparent | var(--bg)</div></div>
    <div className="rule-card"><div className="rule-name">Sharpness</div><div className="rule-desc">All text gets a subtle text stroke for crispness. All gradient bars get crisp-edges rendering. Anti-aliasing is explicit, never left to browser defaults.</div><div className="rule-code">-webkit-text-stroke: .2px rgba(255,255,255,.1)<br />image-rendering: crisp-edges</div></div>
  </div>
</section>

<section className="section" id="templates">
  <div className="section-label">Template Inventory</div>
  <div className="section-title">15 base templates</div>
  <div className="section-desc">Every page type an org needs. Open in any browser, edit in any editor.</div>
  <div className="tmpl-list">
    <div className="tmpl-row"><div className="tmpl-num">01</div><div className="tmpl-name"><a href="https://blackroad-web.pages.dev">landing-hero.html</a></div><div className="tmpl-desc">Hero landing page with gradient orbs and CTA</div><div className="tmpl-size">10K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">02</div><div className="tmpl-name"><a href="https://blackroad-web.pages.dev">landing-light.html</a></div><div className="tmpl-desc">Alternative landing page variant</div><div className="tmpl-size">9.1K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">03</div><div className="tmpl-name"><a href="https://signup-blackroad-io.pages.dev">auth-login.html</a></div><div className="tmpl-desc">Authentication and login page</div><div className="tmpl-size">6.3K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">04</div><div className="tmpl-name"><a href="https://blackroad-store.pages.dev">pricing-page.html</a></div><div className="tmpl-desc">Pricing table with tier comparison</div><div className="tmpl-size">9K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">05</div><div className="tmpl-name"><a href="https://support-blackroad-io.pages.dev">contact-page.html</a></div><div className="tmpl-desc">Contact form with validation</div><div className="tmpl-size">7.1K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">06</div><div className="tmpl-name"><a href="https://hr-blackroad-io.pages.dev">team-page.html</a></div><div className="tmpl-desc">Team member showcase grid</div><div className="tmpl-size">7.9K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">07</div><div className="tmpl-name"><a href="https://blackroad-research.pages.dev">blog-listing.html</a></div><div className="tmpl-desc">Blog index with post cards</div><div className="tmpl-size">7.4K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">08</div><div className="tmpl-name"><a href="https://blackroad-research.pages.dev">blog-article.html</a></div><div className="tmpl-desc">Single blog article layout</div><div className="tmpl-size">8.4K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">09</div><div className="tmpl-name"><a href="https://design-blackroad-io.pages.dev">portfolio-gallery.html</a></div><div className="tmpl-desc">Gallery grid with lightbox</div><div className="tmpl-size">8.3K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">10</div><div className="tmpl-name"><a href="https://blackroad-docs-hub.pages.dev">docs-page.html</a></div><div className="tmpl-desc">Documentation with sidebar nav</div><div className="tmpl-size">11K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">11</div><div className="tmpl-name"><a href="https://blackroad-dashboard.pages.dev">dashboard.html</a></div><div className="tmpl-desc">Analytics dashboard with charts</div><div className="tmpl-size">13K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">12</div><div className="tmpl-name"><a href="https://blackroad-status.pages.dev">status-page.html</a></div><div className="tmpl-desc">Service status monitoring</div><div className="tmpl-size">12K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">13</div><div className="tmpl-name"><a href="https://admin-blackroad-io.pages.dev">settings-page.html</a></div><div className="tmpl-desc">User settings and preferences</div><div className="tmpl-size">8.3K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">14</div><div className="tmpl-name"><a href="https://blackroad-progress-dashboard.pages.dev">changelog.html</a></div><div className="tmpl-desc">Version changelog timeline</div><div className="tmpl-size">7.2K</div></div>
    <div className="tmpl-row"><div className="tmpl-num">15</div><div className="tmpl-name"><a href="https://blackroad-portals.pages.dev">error-404.html</a></div><div className="tmpl-desc">Error page with gradient animation</div><div className="tmpl-size">5.1K</div></div>
  </div>
</section>

<section className="section" id="orgs">
  <div className="section-label">Organization Sites</div>
  <div className="section-title">16 divisions, one brand</div>
  <div className="org-grid">
    <a href="https://blackroad-io.pages.dev" className="org-card"><div className="org-name">OS Inc</div><div className="org-desc">Corporate hub — 41K flagship</div></a>
    <a href="https://blackroadai-com.pages.dev" className="org-card"><div className="org-name">AI</div><div className="org-desc">39 Ollama models, CECE, Hailo-8</div></a>
    <a href="https://blackroad-os-home.pages.dev" className="org-card"><div className="org-name">BlackRoad OS</div><div className="org-desc">400+ CLI scripts, RoadC language</div></a>
    <a href="https://blackroad-systems.pages.dev" className="org-card"><div className="org-name">Cloud</div><div className="org-desc">Cloudflare, 95 Pages, 18 tunnels</div></a>
    <a href="https://research-lab-blackroad-io.pages.dev" className="org-card"><div className="org-name">Labs</div><div className="org-desc">Quantum math, simulation theory</div></a>
    <a href="https://blackroad-guardian-dashboard.pages.dev" className="org-card"><div className="org-name">Security</div><div className="org-desc">6 tools, threat feed, audit log</div></a>
    <a href="https://blackroad-infra.pages.dev" className="org-card"><div className="org-name">Hardware</div><div className="org-desc">5 Pis, 2 Hailo-8, 52 TOPS</div></a>
    <a href="https://finance-blackroad-io.pages.dev" className="org-card"><div className="org-name">Ventures</div><div className="org-desc">$136/mo economics, thesis</div></a>
    <a href="https://education-blackroad-io.pages.dev" className="org-card"><div className="org-name">Education</div><div className="org-desc">SM-2 quizzes, RoadWork platform</div></a>
    <a href="https://operations-blackroad-io.pages.dev" className="org-card"><div className="org-name">Gov</div><div className="org-desc">Git governance, DID identity</div></a>
    <a href="https://blackroad-assets.pages.dev" className="org-card"><div className="org-name">Archive</div><div className="org-desc">228 DBs, IPFS, backup topology</div></a>
    <a href="https://blackroad-metaverse.pages.dev" className="org-card"><div className="org-name">Interactive</div><div className="org-desc">ECS game engine, RoadC scripting</div></a>
    <a href="https://content-blackroad-io.pages.dev" className="org-card"><div className="org-name">Media</div><div className="org-desc">BackRoad Social, 7 media tools</div></a>
    <a href="https://blackroad-company.pages.dev" className="org-card"><div className="org-name">Foundation</div><div className="org-desc">CRM, HR, grants, donors, events</div></a>
    <a href="https://blackroad-operator.pages.dev" className="org-card"><div className="org-name">Enterprises</div><div className="org-desc">n8n, Temporal, Airbyte, Swarm</div></a>
    <a href="https://creator-studio-blackroad-io.pages.dev" className="org-card"><div className="org-name">Studio</div><div className="org-desc">This page — brand lock system</div></a>
  </div>
</section>

<section className="section" id="identity">
  <div className="section-label">Identity System</div>
  <div className="section-title">Two faces of BlackRoad</div>
  <div className="identity-grid">
    <div className="identity-card"><div className="identity-title">Robot Mascot</div><div className="identity-desc">The memeable face of BlackRoad. Used in social media, stickers, community content. Approachable, weird, recognizable.</div><div className="identity-tag">From issue #168 — "the face"</div></div>
    <div className="identity-card"><div className="identity-title">BR Mark</div><div className="identity-desc">The enterprise identity. Used in nav bars, favicons, official documentation. Clean, minimal, professional.</div><div className="identity-tag">From issue #168 — "the suit"</div></div>
  </div>
</section>

<section className="section" id="css">
  <div className="section-label">CSS Architecture</div>
  <div className="section-title">How the brand is encoded</div>
  <div className="css-grid">
    <div className="css-card"><div className="css-title">CSS Variables</div><div className="css-desc">7 root variables define the entire brand. Every template inherits from these.</div><div className="css-code">--g: linear-gradient(90deg, ...6 colors)<br />--g135: linear-gradient(135deg, ...)<br />--bg: #000 · --white: #fff<br />--black: #000 · --border: #1a1a1a<br />--sg: 'Space Grotesk' · --jb: 'JetBrains Mono'</div></div>
    <div className="css-card"><div className="css-title">Shared Patterns</div><div className="css-desc">Every template uses these exact CSS classes. No variation between orgs.</div><div className="css-code">.grad-bar · nav · .hero · .section<br />.section-label · .section-title<br />.btn-outline · .btn-solid · .btn-lg<br />.metric-cell · .pill · footer</div></div>
    <div className="css-card"><div className="css-title">No Build Step</div><div className="css-desc">Zero dependencies. No webpack, no PostCSS, no Tailwind, no framework. Raw CSS in style tags.</div><div className="css-code">plain .html files<br />inline &lt;style&gt; blocks<br />no node_modules<br />no package.json</div></div>
    <div className="css-card"><div className="css-title">Brand Guide Spec</div><div className="css-desc">The master reference at 131KB, 1,420 lines. Every color, font, component documented.</div><div className="css-code">blackroad-brand-guide.html (131KB)<br />blackroad-color-preview.html (30KB)<br />DESIGN-RULES.md (1.2KB)<br />BLACKROAD-OS-BRAND-LOCK repo</div></div>
  </div>
</section>

<section className="section" id="enforcement">
  <div className="section-label">Enforcement</div>
  <div className="section-title">Why plain HTML</div>
  <div className="enforce-list">
    <div className="enforce-row"><div className="enforce-label">No Interpretation</div><div className="enforce-value">CSS variables define the brand. If you follow the vars, you follow the brand.</div></div>
    <div className="enforce-row"><div className="enforce-label">16 Orgs, 1 System</div><div className="enforce-value">Every org template uses the same CSS foundation. Same gradient, same fonts, same container rules.</div></div>
    <div className="enforce-row"><div className="enforce-label">48+ Domains</div><div className="enforce-value">Every domain ships these rules. Served through <a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cloudflare</a> (95+ Pages, 18 tunnels).</div></div>
    <div className="enforce-row"><div className="enforce-label">Lock, Not Guide</div><div className="enforce-value">This is not a suggestion. It is a lock. The templates enforce the rules by construction.</div></div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroad-brand-kit.pages.dev" className="pill"><div className="pill-dot"></div> Full Brand Guide (131KB)</a>
    <a href="https://blackroad-io.pages.dev" className="pill"><div className="pill-dot"></div> Ecosystem Hub</a>
    <a href="https://blackroad-systems.pages.dev" className="pill"><div className="pill-dot"></div> 48+ Domains</a>
    <a href="https://content-blackroad-io.pages.dev" className="pill"><div className="pill-dot"></div> Media &amp; Social</a>
    <a href="https://finance-blackroad-io.pages.dev#portfolio" className="pill"><div className="pill-dot"></div> 16 Org Portfolio</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">BlackRoad Studio</a>
  <div className="footer-links"><a href="https://blackroad-brand-kit.pages.dev">Brand Guide</a><a href="https://blackroad-io.pages.dev">OS Inc</a><a href="https://blackroad-os-home.pages.dev">BlackRoad OS</a><a href="https://blackroad-systems.pages.dev">Cloud</a><a href="https://content-blackroad-io.pages.dev">Media</a></div>
  <div className="footer-copy">&copy; 2026 BlackRoad Studio. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
