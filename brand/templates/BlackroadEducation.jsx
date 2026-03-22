import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadEducation() {
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
        .algo-card{border:1px solid var(--border);border-radius:12px;padding:48px;position:relative}
        .algo-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .algo-title{font-size:24px;font-weight:700;color:var(--white);margin-bottom:12px}
        .algo-desc{font-size:14px;color:var(--white);opacity:.4;line-height:1.8;margin-bottom:24px;max-width:600px}
        .algo-formula{font-family:var(--jb);font-size:13px;color:var(--white);opacity:.3;border:1px solid var(--border);border-radius:8px;padding:20px;line-height:2}
        .featured{border:1px solid var(--border);border-radius:12px;padding:48px;position:relative}
        .featured::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .featured-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}
        .featured-title{font-size:28px;font-weight:700;color:var(--white);margin-bottom:12px}
        .featured-desc{font-size:14px;color:var(--white);opacity:.4;line-height:1.8;margin-bottom:24px;max-width:600px}
        .featured-stats{display:flex;gap:32px;flex-wrap:wrap}
        .featured-stat{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.3}
        .track-list{border-top:1px solid var(--border)}
        .track-row{display:grid;grid-template-columns:180px 1fr auto;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .track-name{font-size:14px;font-weight:600;color:var(--white)}
        .track-desc{font-size:13px;color:var(--white);opacity:.4}
        .track-tag{padding:3px 10px;border:1px solid var(--border);border-radius:4px;font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3}
        .progress-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .progress-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative}
        .progress-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .progress-title{font-size:18px;font-weight:700;color:var(--white);margin-bottom:16px}
        .progress-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)}
        .progress-row:last-child{border-bottom:none}
        .progress-label{font-size:13px;color:var(--white);opacity:.4}
        .progress-value{font-size:13px;font-weight:600;color:var(--white)}
        .tutor-card{border:1px solid var(--border);border-radius:12px;padding:48px;position:relative}
        .tutor-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .tutor-title{font-size:24px;font-weight:700;color:var(--white);margin-bottom:12px}
        .tutor-desc{font-size:14px;color:var(--white);opacity:.4;line-height:1.8;margin-bottom:24px;max-width:600px}
        .tutor-nodes{border-top:1px solid var(--border)}
        .tutor-row{display:grid;grid-template-columns:120px 1fr auto;gap:16px;padding:12px 0;border-bottom:1px solid var(--border);align-items:center}
        .tutor-node{font-size:14px;font-weight:600;color:var(--white)}
        .tutor-spec{font-size:12px;color:var(--white);opacity:.4}
        .tutor-tops{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
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
          .section{padding:48px 20px}.tool-grid{grid-template-columns:1fr}
          .algo-card,.featured,.tutor-card{padding:28px}
          .metrics-strip{grid-template-columns:repeat(2,1fr)}
          .progress-grid{grid-template-columns:1fr}
          .track-row{grid-template-columns:1fr}.track-name{margin-bottom:-8px}.track-tag{display:none}
          .tutor-row{grid-template-columns:1fr}.tutor-tops{display:none}
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
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Education</a>
  <div className="nav-links"><a href="#tools">Tools</a><a href="#curriculum">Curriculum</a><a href="#roadwork">RoadWork</a><a href="#tutor">AI Tutor</a><a href="#algorithm">Algorithm</a></div>
  <div style={{{ display: "flex", gap: 10 }}}><a href="#roadwork" className="btn-outline">RoadWork</a><a href="https://github.com/blackboxprogramming" target="_blank" className="btn-solid">GitHub</a></div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div><div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 3 Education Tools · 6 Learning Tracks · 39 Ollama Models</div>
  <h1>Learn by building, not watching</h1>
  <p>Three tools for quizzes, code challenges, and skill tracking. Powered by the SM-2 spaced repetition algorithm and 39 local Ollama models for AI hints.</p>
  <div className="hero-cta"><a href="#tools" className="btn-lg btn-lg-solid">View Tools</a><a href="#curriculum" className="btn-lg btn-lg-outline">Learning Tracks</a></div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">3</div><div className="metric-label">Education Tools</div></div>
    <div className="metric-cell"><div className="metric-value">SM-2</div><div className="metric-label">Spaced Repetition</div></div>
    <div className="metric-cell"><div className="metric-value">39</div><div className="metric-label">Ollama Models</div></div>
    <div className="metric-cell"><div className="metric-value">6</div><div className="metric-label">Learning Tracks</div></div>
  </div>
</div>

<section className="section" id="tools">
  <div className="section-label">Tools</div>
  <div className="section-title">Three education tools</div>
  <div className="section-desc">Quizzes that adapt, code challenges with AI hints, and a skill tracker that maps your progress.</div>
  <div className="tool-grid">
    <div className="tool-card"><div className="tool-name">Quiz Platform</div><div className="tool-desc">SM-2 spaced repetition algorithm for adaptive difficulty. Tracks recall accuracy, adjusts intervals, optimizes review schedules. Progress persists in <a href="https://blackroad-assets.pages.dev#memory" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>SQLite</a>.</div><div className="tool-file">quiz_platform.py</div></div>
    <div className="tool-card"><div className="tool-name">Code Challenge</div><div className="tool-desc">Code execution sandbox with <a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Ollama-powered</a> hint generation. Multi-language support. AI reviews your code and suggests improvements without giving answers.</div><div className="tool-file">code_challenge.py</div></div>
    <div className="tool-card"><div className="tool-name">Skill Tracker</div><div className="tool-desc">Competency mapping with skill tree visualization. Learning path optimization based on prerequisites and completion data.</div><div className="tool-file">skill_tracker.py</div></div>
  </div>
</section>

<section className="section" id="curriculum">
  <div className="section-label">Curriculum</div>
  <div className="section-title">Six learning tracks</div>
  <div className="section-desc">Each track maps to real infrastructure. You learn by operating the systems you're studying.</div>
  <div className="track-list">
    <div className="track-row"><div className="track-name">Python Fundamentals</div><div className="track-desc">400+ shell scripts rewritten as Python tools. Quiz platform tracks mastery of stdlib, data structures, algorithms.</div><div className="track-tag">quiz_platform.py</div></div>
    <div className="track-row"><div className="track-name">Systems Programming</div><div className="track-desc">Fleet management scripts — power optimization, service lifecycle, cron automation across <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>5 Raspberry Pis</a>.</div><div className="track-tag">code_challenge.py</div></div>
    <div className="track-row"><div className="track-name">AI/ML Pipeline</div><div className="track-desc"><a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Ollama model deployment</a>, prompt engineering, <a href="https://blackroad-infra.pages.dev#accelerators" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Hailo-8 inference</a> (52 TOPS), CECE custom models.</div><div className="track-tag">39 models</div></div>
    <div className="track-row"><div className="track-name">DevOps &amp; Infrastructure</div><div className="track-desc">Docker Swarm on Octavia, WireGuard mesh, <a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cloudflare tunnels</a> (18 tunnels, 95+ Pages), systemd services.</div><div className="track-tag">skill_tracker.py</div></div>
    <div className="track-row"><div className="track-name">Web Development</div><div className="track-desc"><a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>334 web apps</a> on Lucidia, 48+ custom domains, plain HTML/CSS brand system, Cloudflare Workers.</div><div className="track-tag">334 apps</div></div>
    <div className="track-row"><div className="track-name">Security</div><div className="track-desc"><a href="https://blackroad-guardian-dashboard.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>6 security tools</a> — password manager, SIEM, certificates, incident response, secret scanning, identity provider.</div><div className="track-tag">6 tools</div></div>
  </div>
</section>

<section className="section" id="progress">
  <div className="section-label">Progress Dashboard</div>
  <div className="section-title">Learning metrics</div>
  <div className="progress-grid">
    <div className="progress-card">
      <div className="progress-title">Review Stats</div>
      <div className="progress-row"><div className="progress-label">Total cards reviewed</div><div className="progress-value">2,847</div></div>
      <div className="progress-row"><div className="progress-label">Retention rate</div><div className="progress-value">91.3%</div></div>
      <div className="progress-row"><div className="progress-label">Current streak</div><div className="progress-value">34 days</div></div>
      <div className="progress-row"><div className="progress-label">Cards due today</div><div className="progress-value">18</div></div>
      <div className="progress-row"><div className="progress-label">Avg session</div><div className="progress-value">22 min</div></div>
    </div>
    <div className="progress-card">
      <div className="progress-title">Skill Progress</div>
      <div className="progress-row"><div className="progress-label">Active learning paths</div><div className="progress-value">4 / 6</div></div>
      <div className="progress-row"><div className="progress-label">Modules completed</div><div className="progress-value">38 / 90</div></div>
      <div className="progress-row"><div className="progress-label">Code challenges solved</div><div className="progress-value">127</div></div>
      <div className="progress-row"><div className="progress-label">Skills unlocked</div><div className="progress-value">64</div></div>
      <div className="progress-row"><div className="progress-label">AI hints used</div><div className="progress-value">203</div></div>
    </div>
  </div>
</section>

<section className="section" id="roadwork">
  <div className="featured">
    <div className="featured-label">Platform</div>
    <div className="featured-title">RoadWork</div>
    <div className="featured-desc">The education platform built from these three tools. Quiz yourself with spaced repetition, solve code challenges with AI hints from your local <a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Ollama models</a>, and track your skill progression over time. All data stays on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>your hardware</a> — no Coursera, no Udemy, no subscriptions.</div>
    <div className="featured-stats">
      <div className="featured-stat">quiz_platform.py + code_challenge.py + skill_tracker.py</div>
      <div className="featured-stat">self-hosted</div>
      <div className="featured-stat">Ollama-powered</div>
    </div>
  </div>
</section>

<section className="section" id="tutor">
  <div className="section-label">AI Tutor</div>
  <div className="tutor-card">
    <div className="tutor-title">39 models, zero API calls</div>
    <div className="tutor-desc">The code challenge hint engine runs entirely on local <a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Ollama models</a> across the fleet. CodeLlama for code review, Llama 3 and Mistral for explanations. Your learning data never leaves your machines — no OpenAI, no cloud inference, no per-token billing.</div>
    <div className="tutor-nodes">
      <div className="tutor-row"><div className="tutor-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a></div><div className="tutor-spec">16 Ollama models (4 custom CECE) · CECE API · TTS API</div><div className="tutor-tops">Hailo-8 · 26 TOPS</div></div>
      <div className="tutor-row"><div className="tutor-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Octavia</a></div><div className="tutor-spec">11 Ollama models · 1TB NVMe · Docker Swarm leader</div><div className="tutor-tops">Hailo-8 · 26 TOPS</div></div>
      <div className="tutor-row"><div className="tutor-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Aria</a></div><div className="tutor-spec">6 Ollama models · Portainer · Headscale</div><div className="tutor-tops">CPU inference</div></div>
      <div className="tutor-row"><div className="tutor-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Lucidia</a></div><div className="tutor-spec">6 Ollama models · Ollama Bridge (SSE proxy)</div><div className="tutor-tops">CPU inference</div></div>
    </div>
  </div>
</section>

<section className="section" id="algorithm">
  <div className="section-label">Algorithm</div>
  <div className="algo-card">
    <div className="algo-title">SM-2 Spaced Repetition</div>
    <div className="algo-desc">The quiz platform uses the SuperMemo SM-2 algorithm to calculate optimal review intervals. Items you struggle with appear more often. Items you know well space out to days, then weeks.</div>
    <div className="algo-formula">
      EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))<br />
      where q = quality of response (0-5)<br />
      EF = easiness factor (min 1.3)<br />
      interval(1) = 1 day<br />
      interval(2) = 6 days<br />
      interval(n) = interval(n-1) * EF
    </div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroadai-com.pages.dev" className="pill"><div className="pill-dot"></div> AI Agents &amp; Ollama</a>
    <a href="https://research-lab-blackroad-io.pages.dev" className="pill"><div className="pill-dot"></div> Research &amp; Math</a>
    <a href="https://blackroad-metaverse.pages.dev" className="pill"><div className="pill-dot"></div> Game Engine (ECS)</a>
    <a href="https://blackroad-assets.pages.dev#memory" className="pill"><div className="pill-dot"></div> 228 Databases</a>
    <a href="https://blackroad-infra.pages.dev#fleet" className="pill"><div className="pill-dot"></div> Hardware Fleet</a>
    <a href="https://blackroad-guardian-dashboard.pages.dev" className="pill"><div className="pill-dot"></div> Security Tools</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">BlackRoad Education</a>
  <div className="footer-links"><a href="https://github.com/blackboxprogramming" target="_blank">GitHub</a><a href="https://blackroad-io.pages.dev">OS Inc</a><a href="https://blackroadai-com.pages.dev">AI</a><a href="https://research-lab-blackroad-io.pages.dev">Labs</a><a href="https://blackroad-metaverse.pages.dev">Interactive</a><a href="https://blackroad-guardian-dashboard.pages.dev">Security</a></div>
  <div className="footer-copy">&copy; 2026 BlackRoad Education. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
