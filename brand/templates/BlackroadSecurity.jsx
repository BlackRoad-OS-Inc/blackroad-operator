import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadSecurity() {
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
        .btn-outline{padding:8px 20px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg);transition:border-color .2s}
        .btn-outline:hover{border-color:#444}
        .btn-solid{padding:8px 20px;border:none;border-radius:6px;background:var(--white);color:var(--black);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .hero{text-align:center;padding:120px 48px 80px;position:relative}
        .orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:.06;pointer-events:none}
        .orb-1{width:400px;height:400px;background:#FF2255;top:-150px;left:-5%}
        .orb-2{width:350px;height:350px;background:#4488FF;top:-100px;right:-5%}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);margin-bottom:32px}
        .hero-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--g135)}
        .hero h1{font-size:64px;font-weight:700;color:var(--white);line-height:1.08;margin-bottom:24px;max-width:780px;margin-left:auto;margin-right:auto;letter-spacing:-.02em}
        .hero p{font-size:18px;color:var(--white);opacity:.45;max-width:520px;margin:0 auto 48px;line-height:1.7}
        .hero-cta{display:flex;gap:16px;justify-content:center}
        .btn-lg{padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .btn-lg-solid{background:var(--white);color:var(--black);border:none}
        .btn-lg-outline{background:transparent;color:var(--white);border:1px solid var(--border);transition:border-color .2s}
        .btn-lg-outline:hover{border-color:#444}
        .section{max-max-width:1100px;width:100%;margin:0 auto;padding:80px 48px}
        .section-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .section-desc{font-size:14px;color:var(--white);opacity:.4;max-width:460px;margin-bottom:48px}
        .threat-list{border-top:1px solid var(--border)}
        .threat-row{display:grid;grid-template-columns:auto 1fr auto auto;gap:16px;padding:18px 0;border-bottom:1px solid var(--border);align-items:center}
        .threat-severity{width:40px;height:4px;border-radius:2px;background:var(--g);image-rendering:crisp-edges}
        .threat-severity.high{opacity:1}
        .threat-severity.med{opacity:.5}
        .threat-severity.low{opacity:.2}
        .threat-info h4{font-size:14px;font-weight:600;color:var(--white);margin-bottom:2px}
        .threat-info p{font-size:11px;color:var(--white);opacity:.3}
        .threat-id{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.15}
        .threat-tag{padding:3px 10px;border:1px solid var(--border);border-radius:4px;font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3}
        .shield-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .shield-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative;transition:border-color .2s;display:block;text-decoration:none;color:var(--white)}
        .shield-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .shield-card:hover{border-color:#333}
        .shield-icon{font-size:20px;margin-bottom:16px;opacity:.5}
        .shield-name{font-size:18px;font-weight:700;color:var(--white);margin-bottom:8px}
        .shield-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:16px}
        .shield-stat{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .audit-card{border:1px solid var(--border);border-radius:12px;overflow:hidden;position:relative}
        .audit-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);image-rendering:crisp-edges;z-index:1}
        .audit-header{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
        .audit-header h3{font-size:16px;font-weight:600;color:var(--white)}
        .audit-header span{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .audit-list{padding:0}
        .audit-row{display:grid;grid-template-columns:140px 1fr auto;gap:16px;padding:14px 24px;border-bottom:1px solid var(--border);align-items:center;font-family:var(--jb);font-size:12px}
        .audit-row:last-child{border-bottom:none}
        .audit-time{color:var(--white);opacity:.2}
        .audit-event{color:var(--white);opacity:.5}
        .audit-status{width:6px;height:6px;border-radius:50%;background:var(--g135)}
        .encrypt-table{border-top:1px solid var(--border)}
        .encrypt-row{display:grid;grid-template-columns:200px 1fr auto;gap:24px;border-bottom:1px solid var(--border);padding:16px 0;align-items:center}
        .encrypt-label{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.25;letter-spacing:.04em;text-transform:uppercase}
        .encrypt-value{font-size:14px;color:var(--white);opacity:.6}
        .encrypt-tag{padding:3px 10px;border:1px solid var(--border);border-radius:4px;font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3}
        .metrics-strip{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .metric-cell{padding:28px 24px;border-right:1px solid var(--border)}
        .metric-cell:last-child{border-right:none}
        .metric-value{font-size:32px;font-weight:700;color:var(--white);margin-bottom:4px;letter-spacing:-.02em}
        .metric-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.06em;text-transform:uppercase}
        .cert-row{display:flex;gap:10px;flex-wrap:wrap}
        .cert-pill{padding:8px 18px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);opacity:.5;display:flex;align-items:center;gap:8px}
        .cert-dot{width:6px;height:6px;border-radius:50%;background:var(--g135)}
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
          .section{padding:48px 20px}
          .shield-grid{grid-template-columns:1fr}
          .threat-row{grid-template-columns:auto 1fr auto}.threat-id{display:none}
          .audit-row{grid-template-columns:100px 1fr auto}
          .encrypt-row{grid-template-columns:1fr auto}.encrypt-label{display:none}
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
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Security</a>
  <div className="nav-links">
    <a href="#tools">Tools</a>
    <a href="#threats">Threat Feed</a>
    <a href="#audit">Audit Log</a>
    <a href="#encryption">Encryption</a>
  </div>
  <div style={{{ display: "flex", gap: 10 }}}>
    <a href="#fleet" className="btn-outline">Fleet Status</a>
    <a href="https://github.com/blackroad-security" target="_blank" className="btn-solid">GitHub</a>
  </div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div>
  <div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 6 Security Tools · Zero Trust</div>
  <h1>Your infrastructure watches itself</h1>
  <p>Six Python tools that handle passwords, secrets, certificates, incidents, identity, and SIEM — running on your own hardware.</p>
  <div className="hero-cta">
    <a href="#tools" className="btn-lg btn-lg-solid">View Tools</a>
    <a href="https://github.com/blackroad-security" target="_blank" className="btn-lg btn-lg-outline">Source Code</a>
  </div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">6</div><div className="metric-label">Security Tools</div></div>
    <div className="metric-cell"><div className="metric-value">5</div><div className="metric-label">Nodes Monitored</div></div>
    <div className="metric-cell"><div className="metric-value">0</div><div className="metric-label">External Dependencies</div></div>
    <div className="metric-cell"><div className="metric-value">UFW</div><div className="metric-label">Firewall Active</div></div>
  </div>
</div>

<section className="section" id="threats">
  <div className="section-label">Threat Feed</div>
  <div className="section-title">Real incidents, real fixes</div>
  <div className="threat-list">
    <div className="threat-row"><div className="threat-severity high"></div><div className="threat-info"><h4>Obfuscated cron dropper on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3, opacity: ".7" }}}>Cecilia</a></h4><p>exec from /tmp/op.py — removed, source traced</p></div><div className="threat-id">BR-SEC-001</div><div className="threat-tag">resolved</div></div>
    <div className="threat-row"><div className="threat-severity high"></div><div className="threat-info"><h4>Leaked GitHub PAT on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3, opacity: ".7" }}}>Lucidia</a></h4><p>gho_Gfu* token in blackroad-git-worker.service — removed from service file</p></div><div className="threat-id">BR-SEC-002</div><div className="threat-tag">mitigated</div></div>
    <div className="threat-row"><div className="threat-severity med"></div><div className="threat-info"><h4>xmrig crypto miner reference on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3, opacity: ".7" }}}>Lucidia</a></h4><p>xmrig.service unit file was configured — unit gone, process terminated</p></div><div className="threat-id">BR-SEC-003</div><div className="threat-tag">resolved</div></div>
    <div className="threat-row"><div className="threat-severity med"></div><div className="threat-info"><h4>50+ SSH keys on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3, opacity: ".7" }}}>Alice</a> and <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3, opacity: ".7" }}}>Octavia</a></h4><p>pi@Alice=53 keys, pi@Octavia=52 keys — audit pending</p></div><div className="threat-id">BR-SEC-004</div><div className="threat-tag">open</div></div>
    <div className="threat-row"><div className="threat-severity low"></div><div className="threat-info"><h4>PUSH_SECRET in plaintext crontabs</h4><p>Moved to /opt/blackroad/stats-push.env (chmod 600) on all nodes</p></div><div className="threat-id">BR-SEC-005</div><div className="threat-tag">resolved</div></div>
    <div className="threat-row"><div className="threat-severity high"></div><div className="threat-info"><h4><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3, opacity: ".7" }}}>Cecilia</a> node unreachable</h4><p>SSH timed out — node down or network issue. Hailo-8 + CECE API + TTS + 16 Ollama models offline</p></div><div className="threat-id">BR-SEC-006</div><div className="threat-tag">active</div></div>
  </div>
</section>

<section className="section" id="tools">
  <div className="section-label">Tools</div>
  <div className="section-title">Six security tools, all Python</div>
  <div className="section-desc">Every tool runs locally. No SaaS, no cloud APIs, no third-party access to your secrets.</div>
  <div className="shield-grid">
    <div className="shield-card"><div className="shield-icon">◈</div><div className="shield-name">Password Manager</div><div className="shield-desc">PBKDF2 key derivation with Fernet symmetric encryption. Vault CRUD operations, master password authentication, encrypted storage at rest.</div><div className="shield-stat">password_manager.py</div></div>
    <div className="shield-card"><div className="shield-icon">△</div><div className="shield-name">SIEM Engine</div><div className="shield-desc">Real-time log ingestion from all 5 nodes. Correlation engine matches patterns across sources. Custom alert rules with severity classification.</div><div className="shield-stat">siem.py</div></div>
    <div className="shield-card"><div className="shield-icon">○</div><div className="shield-name">Certificate Manager</div><div className="shield-desc">X.509 certificate lifecycle management. Automated renewal with ACME integration. Tracks expiry dates across all domains and nodes.</div><div className="shield-stat">cert_manager.py</div></div>
    <div className="shield-card"><div className="shield-icon">□</div><div className="shield-name">Incident Response</div><div className="shield-desc">Incident tracking with severity classification. Runbook automation for common scenarios. Timeline reconstruction from audit logs.</div><div className="shield-stat">incident_response.py</div></div>
    <div className="shield-card"><div className="shield-icon">◇</div><div className="shield-name">Secret Scanner</div><div className="shield-desc">Regex and entropy-based scanning for leaked secrets across all repos. Catches API keys, tokens, passwords, and private keys before they ship.</div><div className="shield-stat">secret_scanner.py</div></div>
    <div className="shield-card"><div className="shield-icon">▽</div><div className="shield-name">Identity Provider</div><div className="shield-desc">OAuth2 and OpenID Connect provider. JWT token issuance, role-based access control, user management. Your own auth server.</div><div className="shield-stat">identity_provider.py</div></div>
  </div>
</section>

<section className="section" id="audit">
  <div className="section-label">Audit Log</div>
  <div className="audit-card">
    <div className="audit-header"><h3>Fleet Security Events</h3><span>last 24h · 5 nodes</span></div>
    <div className="audit-list">
      <div className="audit-row"><div className="audit-time">2026-03-09 03:00</div><div className="audit-event"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a> obfuscated cron removed — dropper /tmp/op.py deleted</div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 02:45</div><div className="audit-event">PUSH_SECRET migrated to stats-push.env on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia, Octavia, Lucidia</a></div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 02:30</div><div className="audit-event"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a> github-relay.sh credentials moved to ~/.github-relay.env</div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 02:15</div><div className="audit-event"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Lucidia</a> 16 skeleton microservices disabled — ~800MB RAM freed</div><div className="audit-status"></div></div>
      <div className="audit-row"><div className="audit-time">2026-03-09 01:00</div><div className="audit-event"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a> rpi-connect-wayvnc crash loop fixed — system + user service masked</div><div className="audit-status"></div></div>
    </div>
  </div>
</section>

<section className="section" id="encryption">
  <div className="section-label">Encryption</div>
  <div className="section-title">What protects the fleet</div>
  <div className="encrypt-table">
    <div className="encrypt-row"><div className="encrypt-label">Vault Encryption</div><div className="encrypt-value">Fernet (AES-128-CBC + HMAC-SHA256)</div><div className="encrypt-tag">password_manager.py</div></div>
    <div className="encrypt-row"><div className="encrypt-label">Key Derivation</div><div className="encrypt-value">PBKDF2 with 100,000 iterations</div><div className="encrypt-tag">NIST SP 800-132</div></div>
    <div className="encrypt-row"><div className="encrypt-label">Network Mesh</div><div className="encrypt-value"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".6", textDecoration: "underline", textUnderlineOffset: 3 }}}>WireGuard</a> (ChaCha20-Poly1305)</div><div className="encrypt-tag">10.8.0.x subnet</div></div>
    <div className="encrypt-row"><div className="encrypt-label">SSH Keys</div><div className="encrypt-value">Ed25519 across all <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".6", textDecoration: "underline", textUnderlineOffset: 3 }}}>5 nodes</a></div><div className="encrypt-tag">openssh</div></div>
    <div className="encrypt-row"><div className="encrypt-label">TLS Termination</div><div className="encrypt-value"><a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".6", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cloudflare Edge</a> (18 tunnels, 48+ domains)</div><div className="encrypt-tag">cloudflared</div></div>
  </div>
</section>

<section className="section" id="fleet">
  <div className="section-label">Fleet Security</div>
  <div className="section-title">Node security posture</div>
  <div className="cert-row">
    <a href="https://blackroad-infra.pages.dev#fleet" style={{{ textDecoration: "none" }}}><div className="cert-pill"><div className="cert-dot"></div> Lucidia — UFW active (INPUT DROP)</div></a>
    <a href="https://blackroad-infra.pages.dev#fleet" style={{{ textDecoration: "none" }}}><div className="cert-pill"><div className="cert-dot"></div> All nodes — WireGuard encrypted mesh</div></a>
    <a href="https://blackroad-infra.pages.dev#fleet" style={{{ textDecoration: "none" }}}><div className="cert-pill"><div className="cert-dot"></div> Cecilia — NOPASSWD sudo (blackroad)</div></a>
    <a href="https://blackroad-infra.pages.dev#fleet" style={{{ textDecoration: "none" }}}><div className="cert-pill"><div className="cert-dot"></div> Alice — NOPASSWD sudo (alice, pi)</div></a>
    <a href="https://blackroad-infra.pages.dev#fleet" style={{{ textDecoration: "none" }}}><div className="cert-pill"><div className="cert-dot"></div> Octavia — NOPASSWD sudo (pi only)</div></a>
    <a href="https://blackroad-systems.pages.dev" style={{{ textDecoration: "none" }}}><div className="cert-pill"><div className="cert-dot"></div> 18 Cloudflare tunnels — TLS everywhere</div></a>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related Divisions</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroad-infra.pages.dev#fleet" className="cert-pill" style={{{ textDecoration: "none" }}}><div className="cert-dot"></div> Hardware Fleet</a>
    <a href="https://blackroad-systems.pages.dev" className="cert-pill" style={{{ textDecoration: "none" }}}><div className="cert-dot"></div> Cloudflare Infrastructure</a>
    <a href="https://blackroadai-com.pages.dev" className="cert-pill" style={{{ textDecoration: "none" }}}><div className="cert-dot"></div> AI Agents</a>
    <a href="https://blackroad-assets.pages.dev" className="cert-pill" style={{{ textDecoration: "none" }}}><div className="cert-dot"></div> Archive &amp; Backup</a>
    <a href="https://operations-blackroad-io.pages.dev#identity" className="cert-pill" style={{{ textDecoration: "none" }}}><div className="cert-dot"></div> Digital Identity</a>
    <a href="https://blackroad-operator.pages.dev" className="cert-pill" style={{{ textDecoration: "none" }}}><div className="cert-dot"></div> Enterprise Automation</a>
    <a href="https://blackroad-os-home.pages.dev" className="cert-pill" style={{{ textDecoration: "none" }}}><div className="cert-dot"></div> CLI Tools</a>
    <a href="https://finance-blackroad-io.pages.dev#economics" className="cert-pill" style={{{ textDecoration: "none" }}}><div className="cert-dot"></div> Cost Breakdown</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">BlackRoad Security</a>
  <div className="footer-links">
    <a href="https://github.com/blackroad-security" target="_blank">GitHub</a>
    <a href="https://blackroad-io.pages.dev">OS Inc</a>
    <a href="https://blackroad-infra.pages.dev">Hardware</a>
    <a href="https://blackroad-systems.pages.dev">Cloud</a>
    <a href="https://blackroadai-com.pages.dev">AI</a>
    <a href="https://blackroad-os-home.pages.dev">BlackRoad OS</a>
  </div>
  <div className="footer-copy">&copy; 2026 BlackRoad Security. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>







      </div>
    </>
  );
}
