import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadMedia() {
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
        .tool-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .tool-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative;transition:border-color .2s}
        .tool-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .tool-card:hover{border-color:#333}
        .tool-name{font-size:18px;font-weight:700;color:var(--white);margin-bottom:8px}
        .tool-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:16px}
        .tool-file{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .featured{border:1px solid var(--border);border-radius:12px;padding:48px;position:relative}
        .featured::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .featured-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}
        .featured-title{font-size:28px;font-weight:700;color:var(--white);margin-bottom:12px}
        .featured-desc{font-size:14px;color:var(--white);opacity:.4;line-height:1.8;margin-bottom:24px;max-width:600px}
        .featured-stats{display:flex;gap:32px;flex-wrap:wrap}
        .featured-stat{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.3}
        .dist-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        .dist-card{border:1px solid var(--border);border-radius:10px;padding:24px;position:relative}
        .dist-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .dist-value{font-size:24px;font-weight:700;color:var(--white);margin-bottom:4px}
        .dist-label{font-size:12px;color:var(--white);opacity:.4;line-height:1.5}
        .dist-tag{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2;margin-top:8px}
        .ai-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .ai-card{border:1px solid var(--border);border-radius:10px;padding:24px;position:relative}
        .ai-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .ai-name{font-size:16px;font-weight:700;color:var(--white);margin-bottom:6px}
        .ai-desc{font-size:12px;color:var(--white);opacity:.4;line-height:1.6}
        .pipe-list{border-top:1px solid var(--border)}
        .pipe-row{display:grid;grid-template-columns:40px 1fr auto;gap:16px;padding:18px 0;border-bottom:1px solid var(--border);align-items:center}
        .pipe-num{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.15}
        .pipe-info h4{font-size:14px;font-weight:600;color:var(--white);margin-bottom:2px}
        .pipe-info p{font-size:11px;color:var(--white);opacity:.3}
        .pipe-file{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .archive-list{border-top:1px solid var(--border)}
        .archive-row{display:grid;grid-template-columns:180px 1fr auto;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .archive-method{font-size:14px;font-weight:600;color:var(--white)}
        .archive-desc{font-size:13px;color:var(--white);opacity:.4}
        .archive-file{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
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
          .section{padding:48px 20px}.tool-grid,.ai-grid{grid-template-columns:1fr}
          .featured{padding:28px}
          .dist-grid{grid-template-columns:repeat(2,1fr)}
          .archive-row{grid-template-columns:1fr}.archive-method{margin-bottom:-8px}.archive-file{display:none}
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
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Media</a>
  <div className="nav-links"><a href="#tools">Tools</a><a href="#social">BackRoad Social</a><a href="#distribution">Distribution</a><a href="#ai-content">AI Content</a><a href="#pipeline">Pipeline</a></div>
  <div style={{{ display: "flex", gap: 10 }}}><a href="#social" className="btn-outline">BackRoad Social</a><a href="https://github.com/blackboxprogramming" target="_blank" className="btn-solid">GitHub</a></div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div><div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 7 Media Tools · 48+ Domains · 334 Web Apps</div>
  <h1>Your content, your distribution</h1>
  <p>Seven tools for social media, streaming, podcasts, video, and newsletters. BackRoad Social is the flagship — multi-platform publishing across 48+ domains and 334 web apps.</p>
  <div className="hero-cta"><a href="#tools" className="btn-lg btn-lg-solid">View Tools</a><a href="#distribution" className="btn-lg btn-lg-outline">Distribution Network</a></div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">7</div><div className="metric-label">Media Tools</div></div>
    <div className="metric-cell"><div className="metric-value">48+</div><div className="metric-label">Domains</div></div>
    <div className="metric-cell"><div className="metric-value">95</div><div className="metric-label">Pages Sites</div></div>
    <div className="metric-cell"><div className="metric-value">334</div><div className="metric-label">Web Apps</div></div>
  </div>
</div>

<section className="section" id="tools">
  <div className="section-label">Tools</div>
  <div className="section-title">Seven media tools, all Python</div>
  <div className="section-desc">From content creation to distribution. Every step runs on <a href="https://blackroad-infra.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>your hardware</a>.</div>
  <div className="tool-grid">
    <div className="tool-card"><div className="tool-name">Social Media API</div><div className="tool-desc">Multi-platform publishing to Twitter/X, Instagram, LinkedIn. Post scheduling, analytics aggregation, engagement tracking.</div><div className="tool-file">social_media_api.py · ~300 lines</div></div>
    <div className="tool-card"><div className="tool-name">Streaming Hub</div><div className="tool-desc">Live stream orchestration with RTMP ingest and HLS output. Chat overlay integration, multi-destination streaming.</div><div className="tool-file">streaming_hub.py</div></div>
    <div className="tool-card"><div className="tool-name">Podcast Platform</div><div className="tool-desc">RSS feed generation, episode management, transcription pipeline. Publish podcasts without a hosting service.</div><div className="tool-file">podcast_platform.py</div></div>
    <div className="tool-card"><div className="tool-name">RSS Aggregator</div><div className="tool-desc">Multi-source RSS aggregation with deduplication and keyword filtering. Build your own feed reader.</div><div className="tool-file">rss_aggregator.py</div></div>
    <div className="tool-card"><div className="tool-name">Video Transcoder</div><div className="tool-desc">FFmpeg pipeline for multi-resolution output. Thumbnail generation, format conversion, batch processing.</div><div className="tool-file">video_transcoder.py</div></div>
    <div className="tool-card"><div className="tool-name">Media Processor</div><div className="tool-desc">Image and video processing. Format conversion, metadata extraction, resize, crop, watermark.</div><div className="tool-file">media_processor.py</div></div>
    <div className="tool-card"><div className="tool-name">Newsletter Engine</div><div className="tool-desc">Email campaign builder with subscriber management. Template rendering, scheduling, open/click tracking.</div><div className="tool-file">newsletter_engine.py</div></div>
  </div>
</section>

<section className="section" id="social">
  <div className="featured">
    <div className="featured-label">Flagship Product</div>
    <div className="featured-title">BackRoad Social</div>
    <div className="featured-desc">The social media arm of BlackRoad. One Python API that publishes to Twitter/X, Instagram, and LinkedIn simultaneously. Schedule posts, aggregate analytics, track engagement — all from <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>your own infrastructure</a>. No Buffer, no Hootsuite, no <a href="https://finance-blackroad-io.pages.dev#economics" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>monthly fees</a>.</div>
    <div className="featured-stats">
      <div className="featured-stat">social_media_api.py</div>
      <div className="featured-stat">~300 lines</div>
      <div className="featured-stat">3 platforms</div>
      <div className="featured-stat">self-hosted</div>
    </div>
  </div>
</section>

<section className="section" id="distribution">
  <div className="section-label">Distribution Network</div>
  <div className="section-title">Where content ships</div>
  <div className="dist-grid">
    <div className="dist-card"><div className="dist-value">95+</div><div className="dist-label"><a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cloudflare Pages</a> deployments</div><div className="dist-tag">pages</div></div>
    <div className="dist-card"><div className="dist-value">48+</div><div className="dist-label">Custom domains across all orgs</div><div className="dist-tag">domains</div></div>
    <div className="dist-card"><div className="dist-value">334</div><div className="dist-label">Web apps on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Lucidia</a> /var/www</div><div className="dist-tag">lucidia</div></div>
    <div className="dist-card"><div className="dist-value">18</div><div className="dist-label"><a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cloudflare tunnels</a> (TLS everywhere)</div><div className="dist-tag">tunnels</div></div>
    <div className="dist-card"><div className="dist-value">65+</div><div className="dist-label">Hostnames through Alice tunnel</div><div className="dist-tag">alice</div></div>
    <div className="dist-card"><div className="dist-value">22</div><div className="dist-label">Hostnames through Cecilia tunnel</div><div className="dist-tag">cecilia</div></div>
    <div className="dist-card"><div className="dist-value">10</div><div className="dist-label">Hostnames through Octavia tunnel</div><div className="dist-tag">octavia</div></div>
    <div className="dist-card"><div className="dist-value">4</div><div className="dist-label">Hostnames through Lucidia tunnel</div><div className="dist-tag">lucidia</div></div>
  </div>
</section>

<section className="section" id="ai-content">
  <div className="section-label">AI Content Pipeline</div>
  <div className="section-title">Ollama-powered content creation</div>
  <div className="section-desc">39 local models generate, narrate, and summarize content without any cloud API calls.</div>
  <div className="ai-grid">
    <div className="ai-card"><div className="ai-name">AI Social Copy</div><div className="ai-desc">Generate post text, captions, and hashtags from <a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Ollama models</a> — Llama 3, Mistral, custom CECE models.</div></div>
    <div className="ai-card"><div className="ai-name">TTS Narration</div><div className="ai-desc">Text-to-speech API on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a> for podcast narration and video voiceover. Local inference, zero cost.</div></div>
    <div className="ai-card"><div className="ai-name">CECE Conversational</div><div className="ai-desc">4 custom CECE models on Cecilia for conversational content generation and dialogue scripting.</div></div>
    <div className="ai-card"><div className="ai-name">39 Fleet Models</div><div className="ai-desc">16 on Cecilia, 11 on Octavia, 6 on Aria, 6 on Lucidia. Different models for different content tasks.</div></div>
    <div className="ai-card"><div className="ai-name">Content Summarization</div><div className="ai-desc">Auto-summarize long-form content for social posts, newsletters, and RSS feeds.</div></div>
    <div className="ai-card"><div className="ai-name">Memory-Backed</div><div className="ai-desc"><a href="https://blackroad-assets.pages.dev#memory" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>156,675 entries</a> in FTS5 index provide context for all AI-generated content.</div></div>
  </div>
</section>

<section className="section" id="pipeline">
  <div className="section-label">Content Pipeline</div>
  <div className="section-title">How the tools chain together</div>
  <div className="pipe-list">
    <div className="pipe-row"><div className="pipe-num">01</div><div className="pipe-info"><h4>Generate</h4><p>AI writes drafts from Ollama models + 156K memory entries</p></div><div className="pipe-file">blackroad-ai.html</div></div>
    <div className="pipe-row"><div className="pipe-num">02</div><div className="pipe-info"><h4>Create</h4><p>Write content, record audio/video, capture media</p></div><div className="pipe-file">media_processor.py</div></div>
    <div className="pipe-row"><div className="pipe-num">03</div><div className="pipe-info"><h4>Process</h4><p>Transcode video, generate thumbnails, extract metadata</p></div><div className="pipe-file">video_transcoder.py</div></div>
    <div className="pipe-row"><div className="pipe-num">04</div><div className="pipe-info"><h4>Narrate</h4><p>TTS API on Cecilia adds voiceover to podcasts and video</p></div><div className="pipe-file">podcast_platform.py</div></div>
    <div className="pipe-row"><div className="pipe-num">05</div><div className="pipe-info"><h4>Publish</h4><p>Push to social platforms, generate RSS feeds, send newsletters</p></div><div className="pipe-file">social_media_api.py</div></div>
    <div className="pipe-row"><div className="pipe-num">06</div><div className="pipe-info"><h4>Distribute</h4><p>Deploy to 95+ Pages, serve through 18 tunnels, 48+ domains</p></div><div className="pipe-file">blackroad-cloud.html</div></div>
    <div className="pipe-row"><div className="pipe-num">07</div><div className="pipe-info"><h4>Archive</h4><p>Web archiver snapshots, IPFS pins, rclone to Google Drive</p></div><div className="pipe-file">blackroad-archive.html</div></div>
  </div>
</section>

<section className="section" id="archive">
  <div className="section-label">Content Archive</div>
  <div className="section-title">How media gets preserved</div>
  <div className="archive-list">
    <div className="archive-row"><div className="archive-method">Web Archiver</div><div className="archive-desc">Snapshots all published content with diff tracking between captures</div><div className="archive-file">web_archiver.py</div></div>
    <div className="archive-row"><div className="archive-method">IPFS Addressing</div><div className="archive-desc">Content-addressed storage — CIDs ensure permanence and integrity</div><div className="archive-file">ipfs_content_tracker.py</div></div>
    <div className="archive-row"><div className="archive-method">Google Drive</div><div className="archive-desc">rclone sync from Cecilia (4 instances) and Mac (every 6h)</div><div className="archive-file">rclone</div></div>
    <div className="archive-row"><div className="archive-method">SQLite Index</div><div className="archive-desc"><a href="https://blackroad-assets.pages.dev#memory" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>228 databases</a>, 156,675 FTS5 entries for instant content retrieval</div><div className="archive-file">~/.blackroad/</div></div>
    <div className="archive-row"><div className="archive-method">Gitea Mirror</div><div className="archive-desc">207 repos on Octavia, github-relay mirrors to GitHub every 30m</div><div className="archive-file">github-relay.sh</div></div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroad-systems.pages.dev" className="pill"><div className="pill-dot"></div> Cloudflare &amp; Tunnels</a>
    <a href="https://blackroadai-com.pages.dev" className="pill"><div className="pill-dot"></div> AI Agents &amp; Ollama</a>
    <a href="https://blackroad-infra.pages.dev#fleet" className="pill"><div className="pill-dot"></div> Hardware Fleet</a>
    <a href="https://creator-studio-blackroad-io.pages.dev" className="pill"><div className="pill-dot"></div> Brand System</a>
    <a href="https://blackroad-assets.pages.dev" className="pill"><div className="pill-dot"></div> Content Archive</a>
    <a href="https://finance-blackroad-io.pages.dev" className="pill"><div className="pill-dot"></div> Investment Thesis</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">BlackRoad Media</a>
  <div className="footer-links"><a href="https://github.com/blackboxprogramming" target="_blank">GitHub</a><a href="https://blackroad-io.pages.dev">OS Inc</a><a href="https://blackroad-os-home.pages.dev">BlackRoad OS</a><a href="https://blackroad-systems.pages.dev">Cloud</a><a href="https://blackroad-infra.pages.dev">Hardware</a></div>
  <div className="footer-copy">&copy; 2026 BlackRoad Media. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
