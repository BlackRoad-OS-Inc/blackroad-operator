import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackboxEnterprises() {
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
        .fork-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .fork-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative;transition:border-color .2s;display:block;text-decoration:none;color:var(--white)}
        .fork-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .fork-card:hover{border-color:#333}
        .fork-tag{font-family:var(--jb);font-size:9px;color:var(--white);opacity:.2;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px}
        .fork-name{font-size:18px;font-weight:700;color:var(--white);margin-bottom:8px}
        .fork-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:16px}
        .fork-stat{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .fleet-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
        .fleet-card{border:1px solid var(--border);border-radius:10px;padding:24px;position:relative}
        .fleet-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .fleet-node{font-size:16px;font-weight:700;color:var(--white);margin-bottom:4px}
        .fleet-spec{font-size:12px;color:var(--white);opacity:.35;line-height:1.6;margin-bottom:8px}
        .fleet-tag{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .int-list{border-top:1px solid var(--border)}
        .int-row{display:grid;grid-template-columns:160px 1fr auto;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .int-tool{font-size:14px;font-weight:600;color:var(--white)}
        .int-role{font-size:13px;color:var(--white);opacity:.4}
        .int-conn{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .auto-card{border:1px solid var(--border);border-radius:12px;overflow:hidden;position:relative}
        .auto-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);image-rendering:crisp-edges;z-index:1}
        .auto-header{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
        .auto-header h3{font-size:16px;font-weight:600;color:var(--white)}
        .auto-header span{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .auto-row{display:grid;grid-template-columns:140px 1fr auto;gap:16px;padding:14px 24px;border-bottom:1px solid var(--border);align-items:center;font-size:12px}
        .auto-row:last-child{border-bottom:none}
        .auto-node{font-weight:600;color:var(--white)}
        .auto-task{color:var(--white);opacity:.5}
        .auto-freq{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .cost-list{border-top:1px solid var(--border)}
        .cost-row{display:grid;grid-template-columns:180px 1fr auto auto;gap:16px;padding:14px 0;border-bottom:1px solid var(--border);align-items:center}
        .cost-tool{font-size:14px;font-weight:600;color:var(--white)}
        .cost-desc{font-size:12px;color:var(--white);opacity:.35}
        .cost-saas{font-family:var(--jb);font-size:12px;color:var(--white);opacity:.3}
        .cost-br{font-family:var(--jb);font-size:12px;font-weight:700;color:var(--white)}
        .infra-card{border:1px solid var(--border);border-radius:12px;padding:48px;position:relative}
        .infra-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .infra-title{font-size:24px;font-weight:700;color:var(--white);margin-bottom:16px}
        .infra-text{font-size:14px;color:var(--white);opacity:.4;line-height:2;max-width:600px}
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
          .section{padding:48px 20px}.fork-grid,.fleet-grid{grid-template-columns:1fr}
          .infra-card{padding:28px}
          .int-row,.cost-row{grid-template-columns:1fr}.int-conn,.cost-saas{display:none}
          .auto-row{grid-template-columns:1fr}.auto-freq{display:none}
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
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> Blackbox Enterprises</a>
  <div className="nav-links"><a href="#forks">Forks</a><a href="#docker">Docker Fleet</a><a href="#automation">Automation</a><a href="#costs">Savings</a><a href="#infrastructure">Infrastructure</a></div>
  <div style={{{ display: "flex", gap: 10 }}}><a href="#forks" className="btn-outline">View Forks</a><a href="https://github.com/blackboxprogramming" target="_blank" className="btn-solid">GitHub</a></div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div><div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 6 Enterprise Forks · 25 Containers · $550+/mo Saved</div>
  <h1>Enterprise tools without enterprise prices</h1>
  <p>Six open-source enterprise platforms forked and customized for BlackRoad infrastructure. Workflow automation, data pipelines, and orchestration — all self-hosted on Docker Swarm.</p>
  <div className="hero-cta"><a href="#forks" className="btn-lg btn-lg-solid">View Forks</a><a href="#costs" className="btn-lg btn-lg-outline">Cost Savings</a></div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">6</div><div className="metric-label">Enterprise Forks</div></div>
    <div className="metric-cell"><div className="metric-value">25</div><div className="metric-label">Containers Fleet-wide</div></div>
    <div className="metric-cell"><div className="metric-value">$0</div><div className="metric-label">License Fees</div></div>
    <div className="metric-cell"><div className="metric-value">$550+</div><div className="metric-label">Monthly SaaS Savings</div></div>
  </div>
</div>

<section className="section" id="forks">
  <div className="section-label">Forks</div>
  <div className="section-title">Six enterprise platforms, forked and modified</div>
  <div className="section-desc">Each fork is customized for BlackRoad's infrastructure. Real modifications, not just clones.</div>
  <div className="fork-grid">
    <div className="fork-card"><div className="fork-tag">Forked &amp; Modified</div><div className="fork-name">n8n</div><div className="fork-desc">Workflow automation with 1,400+ integrations. Visual workflow builder, webhook triggers, custom nodes for BlackRoad APIs.</div><div className="fork-stat">Workflow Automation</div></div>
    <div className="fork-card"><div className="fork-tag">Forked &amp; Modified</div><div className="fork-name">Temporal</div><div className="fork-desc">Durable workflow orchestration. Saga patterns, automatic retry policies, long-running workflow state management.</div><div className="fork-stat">Durable Orchestration</div></div>
    <div className="fork-card"><div className="fork-tag">Forked &amp; Modified</div><div className="fork-name">Airbyte</div><div className="fork-desc">Data integration platform with 300+ connectors. ELT pipelines from any source to any destination.</div><div className="fork-stat">Data Integration</div></div>
    <div className="fork-card"><div className="fork-tag">Forked &amp; Modified</div><div className="fork-name">Activepieces</div><div className="fork-desc">Open-source Zapier alternative. Visual workflow builder for non-technical automation.</div><div className="fork-stat">Low-Code Automation</div></div>
    <div className="fork-card"><div className="fork-tag">Forked &amp; Modified</div><div className="fork-name">Huginn</div><div className="fork-desc">Autonomous agent system. Event-driven triggers, web scraping, monitoring, automated responses.</div><div className="fork-stat">Agent Automation</div></div>
    <div className="fork-card"><div className="fork-tag">Forked &amp; Modified</div><div className="fork-name">Prefect</div><div className="fork-desc">Data pipeline orchestration. Scheduling, monitoring, lineage tracking, failure recovery.</div><div className="fork-stat">Pipeline Orchestration</div></div>
  </div>
</section>

<section className="section" id="docker">
  <div className="section-label">Docker Fleet</div>
  <div className="section-title">Container status across nodes</div>
  <div className="fleet-grid">
    <div className="fleet-card"><div className="fleet-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Octavia</a> — Swarm Leader</div><div className="fleet-spec">11 images (11.2GB) · 4 Swarm containers<br />Gitea, NATS, Ollama, edge-agent<br />1TB NVMe · <a href="https://blackroad-infra.pages.dev#accelerators" style={{{ color: "var(--white)", opacity: ".35", textDecoration: "underline", textUnderlineOffset: 3 }}}>Hailo-8</a></div><div className="fleet-tag">Docker v29.2.1 · Swarm leader</div></div>
    <div className="fleet-card"><div className="fleet-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Lucidia</a> — 11 Containers</div><div className="fleet-spec">14 images (3.3GB) · 11 containers<br />PowerDNS, RoadAPI, CarPool, edge-agent<br />334 web apps · 238GB SD</div><div className="fleet-tag">Docker v29.2.1 · worker</div></div>
    <div className="fleet-card"><div className="fleet-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Alice</a> — Idle</div><div className="fleet-spec">Docker installed, 0 images/containers<br />Pi 400 · 48+ domains · Pi-hole<br />PostgreSQL + Qdrant</div><div className="fleet-tag">Docker v29.2.1 · idle</div></div>
    <div className="fleet-card"><div className="fleet-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a> — Idle</div><div className="fleet-spec">Docker installed, 0 images/containers<br />Pi 5 · <a href="https://blackroad-infra.pages.dev#accelerators" style={{{ color: "var(--white)", opacity: ".35", textDecoration: "underline", textUnderlineOffset: 3 }}}>Hailo-8</a> · CECE API · TTS<br />16 Ollama models · MinIO</div><div className="fleet-tag">Docker v29.2.1 · idle</div></div>
  </div>
</section>

<section className="section" id="integration">
  <div className="section-label">Integration Layer</div>
  <div className="section-title">How the six tools connect</div>
  <div className="int-list">
    <div className="int-row"><div className="int-tool">n8n</div><div className="int-role">Orchestrates workflows across all other tools and BlackRoad APIs</div><div className="int-conn">→ all</div></div>
    <div className="int-row"><div className="int-tool">Airbyte</div><div className="int-role">Moves data between sources — databases, APIs, files, cloud services</div><div className="int-conn">→ Prefect</div></div>
    <div className="int-row"><div className="int-tool">Temporal</div><div className="int-role">Ensures durability — retries failed steps, manages long-running sagas</div><div className="int-conn">→ n8n</div></div>
    <div className="int-row"><div className="int-tool">Prefect</div><div className="int-role">Schedules and monitors data pipelines with dependency graphs</div><div className="int-conn">→ Airbyte</div></div>
    <div className="int-row"><div className="int-tool">Huginn</div><div className="int-role">Monitors external events — web changes, API responses, triggers</div><div className="int-conn">→ n8n</div></div>
    <div className="int-row"><div className="int-tool">Activepieces</div><div className="int-role">Simple automations for non-technical workflows — Zapier replacement</div><div className="int-conn">standalone</div></div>
  </div>
</section>

<section className="section" id="automation">
  <div className="section-label">Fleet Automation</div>
  <div className="auto-card">
    <div className="auto-header"><h3>Cron &amp; Systemd Automation</h3><span>fleet-wide · always running</span></div>
    <div className="auto-row"><div className="auto-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a></div><div className="auto-task">heartbeat ping + service health check</div><div className="auto-freq">every 1m</div></div>
    <div className="auto-row"><div className="auto-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a></div><div className="auto-task">heal — auto-restart stats-proxy + ollama if down</div><div className="auto-freq">every 5m</div></div>
    <div className="auto-row"><div className="auto-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Octavia</a></div><div className="auto-task">heartbeat ping + service health check</div><div className="auto-freq">every 1m</div></div>
    <div className="auto-row"><div className="auto-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Octavia</a></div><div className="auto-task">heal — auto-restart stats-proxy + ollama if down</div><div className="auto-freq">every 5m</div></div>
    <div className="auto-row"><div className="auto-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Alice</a></div><div className="auto-task">blackroad-watchdog.timer — Redis task queue monitoring</div><div className="auto-freq">every 30s</div></div>
    <div className="auto-row"><div className="auto-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Lucidia</a></div><div className="auto-task">brnode-heartbeat.timer — /opt/blackroad/bin/brnode heartbeat</div><div className="auto-freq">every 5m</div></div>
    <div className="auto-row"><div className="auto-node">Mac</div><div className="auto-task">Fleet health monitor — ping all nodes, check services</div><div className="auto-freq">every 5m</div></div>
    <div className="auto-row"><div className="auto-node">Mac</div><div className="auto-task">Cecilia sync — rclone, git mirror, config backup</div><div className="auto-freq">every 15m</div></div>
    <div className="auto-row"><div className="auto-node">All nodes</div><div className="auto-task">stats-proxy (:7890) — fleet telemetry collection</div><div className="auto-freq">always</div></div>
    <div className="auto-row"><div className="auto-node">All nodes</div><div className="auto-task">power-monitor.sh — CPU/voltage/thermal logging</div><div className="auto-freq">every 5m</div></div>
  </div>
</section>

<section className="section" id="costs">
  <div className="section-label">Cost Comparison</div>
  <div className="section-title">SaaS vs self-hosted</div>
  <div className="cost-list">
    <div className="cost-row"><div className="cost-tool">n8n Cloud</div><div className="cost-desc">Workflow automation</div><div className="cost-saas">$50/mo</div><div className="cost-br">$0</div></div>
    <div className="cost-row"><div className="cost-tool">Temporal Cloud</div><div className="cost-desc">Durable orchestration</div><div className="cost-saas">$200/mo</div><div className="cost-br">$0</div></div>
    <div className="cost-row"><div className="cost-tool">Airbyte Cloud</div><div className="cost-desc">Data integration</div><div className="cost-saas">$300/mo</div><div className="cost-br">$0</div></div>
    <div className="cost-row"><div className="cost-tool">Docker Hub Pro</div><div className="cost-desc">Container registry</div><div className="cost-saas">$9/mo</div><div className="cost-br">$0</div></div>
    <div className="cost-row"><div className="cost-tool">GitHub Actions</div><div className="cost-desc">CI/CD minutes</div><div className="cost-saas">$48/mo</div><div className="cost-br">$0</div></div>
    <div className="cost-row" style={{{ borderBottom: "none" }}}><div className="cost-tool" style={{{ fontSize: 16 }}}>Total</div><div className="cost-desc"><a href="https://finance-blackroad-io.pages.dev#economics" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Full economics breakdown</a></div><div className="cost-saas">$607/mo</div><div className="cost-br">$0</div></div>
  </div>
</section>

<section className="section" id="infrastructure">
  <div className="infra-card">
    <div className="infra-title">Runs on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Octavia</a> Docker Swarm</div>
    <div className="infra-text">
      All six enterprise tools run as Docker containers on Octavia's Docker Swarm cluster. 11 images (11.2GB total), 4 active Swarm services. Octavia has 1TB NVMe storage for data persistence and a <a href="https://blackroad-infra.pages.dev#accelerators" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Hailo-8 accelerator</a> for any <a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>ML workloads</a> these tools trigger.<br /><br />
      The entire enterprise automation stack runs on a single Raspberry Pi 5. No Kubernetes, no cloud VMs, no managed container services. Just Docker Swarm on ARM64 for <a href="https://finance-blackroad-io.pages.dev#economics" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>$136/mo total</a>.
    </div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroad-infra.pages.dev#fleet" className="pill"><div className="pill-dot"></div> Octavia (Swarm Host)</a>
    <a href="https://blackroad-infra.pages.dev#accelerators" className="pill"><div className="pill-dot"></div> Hailo-8 Accelerators</a>
    <a href="https://blackroadai-com.pages.dev" className="pill"><div className="pill-dot"></div> AI &amp; Ollama</a>
    <a href="https://blackroad-systems.pages.dev" className="pill"><div className="pill-dot"></div> Cloudflare Tunnels</a>
    <a href="https://blackroad-guardian-dashboard.pages.dev" className="pill"><div className="pill-dot"></div> Fleet Security</a>
    <a href="https://finance-blackroad-io.pages.dev#economics" className="pill"><div className="pill-dot"></div> $136/mo Economics</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">Blackbox Enterprises</a>
  <div className="footer-links"><a href="https://github.com/blackboxprogramming" target="_blank">GitHub</a><a href="https://blackroad-io.pages.dev">OS Inc</a><a href="https://blackroad-systems.pages.dev">Cloud</a><a href="https://blackroad-infra.pages.dev">Hardware</a><a href="https://blackroadai-com.pages.dev">AI</a></div>
  <div className="footer-copy">&copy; 2026 Blackbox Enterprises. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
