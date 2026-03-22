import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadArchive() {
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
        .mem-card{border:1px solid var(--border);border-radius:12px;padding:48px;position:relative}
        .mem-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .mem-title{font-size:24px;font-weight:700;color:var(--white);margin-bottom:12px}
        .mem-desc{font-size:14px;color:var(--white);opacity:.4;line-height:1.8;margin-bottom:24px}
        .mem-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .mem-stat{border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center}
        .mem-stat-value{font-size:24px;font-weight:700;color:var(--white);margin-bottom:4px}
        .mem-stat-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;text-transform:uppercase;letter-spacing:.06em}
        .inv-list{border-top:1px solid var(--border)}
        .inv-row{display:grid;grid-template-columns:120px 1fr auto auto;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .inv-node{font-size:14px;font-weight:600;color:var(--white)}
        .inv-spec{font-size:13px;color:var(--white);opacity:.4}
        .inv-size{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.2}
        .inv-dot{width:8px;height:8px;border-radius:50%}
        .inv-dot.ok{background:var(--g135)}
        .inv-dot.warn{background:var(--g135);opacity:.4}
        .backup-list{border-top:1px solid var(--border)}
        .backup-row{display:grid;grid-template-columns:180px 1fr auto;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .backup-route{font-size:14px;font-weight:600;color:var(--white)}
        .backup-desc{font-size:13px;color:var(--white);opacity:.4}
        .backup-freq{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .health-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
        .health-card{border:1px solid var(--border);border-radius:10px;padding:24px;position:relative}
        .health-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .health-card.warn::before{opacity:.5}
        .health-card.advisory::before{opacity:.25}
        .health-name{font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px}
        .health-desc{font-size:12px;color:var(--white);opacity:.35;line-height:1.6}
        .health-tag{font-family:var(--jb);font-size:9px;color:var(--white);opacity:.2;text-transform:uppercase;letter-spacing:.08em;margin-top:10px}
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
          .section{padding:48px 20px}.tool-grid,.health-grid{grid-template-columns:1fr}
          .mem-card{padding:28px}.mem-stats{grid-template-columns:1fr}
          .inv-row{grid-template-columns:80px 1fr auto}.inv-size{display:none}
          .backup-row{grid-template-columns:1fr}.backup-route{margin-bottom:-8px}.backup-freq{display:none}
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
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Archive</a>
  <div className="nav-links"><a href="#tools">Tools</a><a href="#inventory">Inventory</a><a href="#memory">Memory</a><a href="#backups">Backups</a><a href="#health">Health</a></div>
  <div style={{{ display: "flex", gap: 10 }}}><a href="#memory" className="btn-outline">Memory System</a><a href="https://github.com/blackboxprogramming" target="_blank" className="btn-solid">GitHub</a></div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div><div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 5 Archive Tools · 228 Databases · 1TB NVMe</div>
  <h1>Nothing gets lost</h1>
  <p>Five tools for document archival, IPFS content addressing, web snapshots, and encrypted backups. 228 SQLite databases with 156,675 FTS5 entries across 7 nodes.</p>
  <div className="hero-cta"><a href="#tools" className="btn-lg btn-lg-solid">View Tools</a><a href="#inventory" className="btn-lg btn-lg-outline">Storage Map</a></div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">228</div><div className="metric-label">SQLite Databases</div></div>
    <div className="metric-cell"><div className="metric-value">156K</div><div className="metric-label">FTS5 Entries</div></div>
    <div className="metric-cell"><div className="metric-value">~184</div><div className="metric-label">MB Index Size</div></div>
    <div className="metric-cell"><div className="metric-value">1TB</div><div className="metric-label">NVMe Primary</div></div>
  </div>
</div>

<section className="section" id="tools">
  <div className="section-label">Tools</div>
  <div className="section-title">Five archive and backup tools</div>
  <div className="section-desc">Full-text search, IPFS pinning, web archival, and encrypted backups. All data stays local.</div>
  <div className="tool-grid">
    <div className="tool-card"><div className="tool-name">Document Archive</div><div className="tool-desc">FTS5 full-text search across all documents. Metadata tagging, version history, instant retrieval from 228 SQLite databases.</div><div className="tool-file">document_archive.py</div></div>
    <div className="tool-card"><div className="tool-name">IPFS Content Tracker</div><div className="tool-desc">IPFS CID tracking and pin management. Content-addressed storage ensures nothing changes or disappears.</div><div className="tool-file">ipfs_content_tracker.py</div></div>
    <div className="tool-card"><div className="tool-name">IPFS Pinner</div><div className="tool-desc">Automated IPFS pinning with garbage collection and replication. Keeps important content available.</div><div className="tool-file">ipfs_pinner.py</div></div>
    <div className="tool-card"><div className="tool-name">Web Archiver</div><div className="tool-desc">Website snapshots with Wayback Machine integration. Diff tracking shows what changed between captures.</div><div className="tool-file">web_archiver.py</div></div>
    <div className="tool-card"><div className="tool-name">Backup Manager</div><div className="tool-desc">Incremental backups with <a href="https://blackroad-guardian-dashboard.pages.dev#encryption" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>encryption</a>. Multi-destination: local disk, S3-compatible (<a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>MinIO on Cecilia</a>), rclone to Google Drive.</div><div className="tool-file">backup_manager.py</div></div>
    <div className="tool-card"><div className="tool-name">Memory System</div><div className="tool-desc">156,675 entries in FTS5 index. Every conversation, code snippet, and decision — searchable in milliseconds from ~/.blackroad/.</div><div className="tool-file">~/.blackroad/*.db</div></div>
  </div>
</section>

<section className="section" id="inventory">
  <div className="section-label">Database Inventory</div>
  <div className="section-title">Storage across the fleet</div>
  <div className="inv-list">
    <div className="inv-row"><div className="inv-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Alice</a></div><div className="inv-spec">PostgreSQL, Qdrant vector DB, Pi-hole DNS, 48+ domain configs</div><div className="inv-size">77% disk (3.2GB free)</div><div className="inv-dot warn"></div></div>
    <div className="inv-row"><div className="inv-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cecilia</a></div><div className="inv-spec">MinIO object storage, 4 rclone instances to Google Drive, 16 Ollama models</div><div className="inv-size">MinIO S3</div><div className="inv-dot ok"></div></div>
    <div className="inv-row"><div className="inv-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Octavia</a></div><div className="inv-spec">1TB NVMe primary store, Gitea (207 repos, 61MB blackroad-os), NATS messaging</div><div className="inv-size">931GB NVMe</div><div className="inv-dot ok"></div></div>
    <div className="inv-row"><div className="inv-node"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Lucidia</a></div><div className="inv-spec">334 web apps in /var/www, 21 GitHub runner dirs (19GB), 14 Docker images</div><div className="inv-size">42% disk (238GB SD)</div><div className="inv-dot warn"></div></div>
    <div className="inv-row"><div className="inv-node">Mac</div><div className="inv-spec">228 SQLite databases in ~/.blackroad/, 156,675 FTS5 entries (~184MB index)</div><div className="inv-size">~184MB index</div><div className="inv-dot ok"></div></div>
    <div className="inv-row"><div className="inv-node">gematria</div><div className="inv-spec">DO droplet NYC3, 4cpu/8GB — SSH down but WireGuard alive, rsync target</div><div className="inv-size">droplet</div><div className="inv-dot warn"></div></div>
    <div className="inv-row"><div className="inv-node">anastasia</div><div className="inv-spec">DO droplet NYC1, 1cpu/1GB — WG hub, Headscale, Nginx, 94% disk full</div><div className="inv-size">94% full</div><div className="inv-dot warn"></div></div>
  </div>
</section>

<section className="section" id="memory">
  <div className="section-label">Memory System</div>
  <div className="mem-card">
    <div className="mem-title">228 databases, 156,675 memories</div>
    <div className="mem-desc">The BlackRoad memory system stores everything in SQLite with FTS5 full-text search indexes. Every conversation, every code snippet, every decision — searchable in milliseconds. Located at ~/.blackroad/ on all nodes.</div>
    <div className="mem-stats">
      <div className="mem-stat"><div className="mem-stat-value">228</div><div className="mem-stat-label">SQLite DBs</div></div>
      <div className="mem-stat"><div className="mem-stat-value">156,675</div><div className="mem-stat-label">FTS5 Entries</div></div>
      <div className="mem-stat"><div className="mem-stat-value">~184MB</div><div className="mem-stat-label">Total Index</div></div>
    </div>
  </div>
</section>

<section className="section" id="backups">
  <div className="section-label">Backup Topology</div>
  <div className="section-title">Where data flows</div>
  <div className="backup-list">
    <div className="backup-row"><div className="backup-route">Mac → Google Drive</div><div className="backup-desc">rclone sync of all project files and databases</div><div className="backup-freq">every 6h</div></div>
    <div className="backup-row"><div className="backup-route">Mac → gematria</div><div className="backup-desc">rsync to DigitalOcean droplet (NYC3) via WireGuard</div><div className="backup-freq">every 12h</div></div>
    <div className="backup-row"><div className="backup-route">Cecilia → Google Drive</div><div className="backup-desc">4 concurrent rclone instances (needs consolidation)</div><div className="backup-freq">continuous</div></div>
    <div className="backup-row"><div className="backup-route">Cecilia → GitHub</div><div className="backup-desc">github-relay.sh mirrors Gitea repos to GitHub</div><div className="backup-freq">every 30m</div></div>
    <div className="backup-row"><div className="backup-route">Octavia NVMe</div><div className="backup-desc">1TB primary data store — Gitea, Docker volumes, model weights</div><div className="backup-freq">primary</div></div>
    <div className="backup-row"><div className="backup-route">Daily backup-sync</div><div className="backup-desc">Comprehensive fleet backup + sovereign-mesh sync</div><div className="backup-freq">daily 3am</div></div>
    <div className="backup-row"><div className="backup-route">Memory sync</div><div className="backup-desc">Nightly memory database consolidation across nodes</div><div className="backup-freq">daily 6am</div></div>
  </div>
</section>

<section className="section" id="health">
  <div className="section-label">Storage Health</div>
  <div className="section-title">Known issues</div>
  <div className="health-grid">
    <div className="health-card">
      <div className="health-name"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Lucidia</a> SD card degrading</div>
      <div className="health-desc">"mmc0: Card stuck being busy!" in dmesg. Swap growing to 1.3GB/8.5GB. SD card showing wear.</div>
      <div className="health-tag">critical</div>
    </div>
    <div className="health-card">
      <div className="health-name"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Alice</a> SD 77% full</div>
      <div className="health-desc">Only 3.2GB free. Kernel 6.1.21 (2023) — needs full OS migration to Bookworm.</div>
      <div className="health-tag">critical</div>
    </div>
    <div className="health-card warn">
      <div className="health-name">Lucidia 21 runner dirs = 19GB</div>
      <div className="health-desc">Old GitHub Actions runner directories under /home/blackroad/runners/. Could reclaim 19GB.</div>
      <div className="health-tag">degraded</div>
    </div>
    <div className="health-card warn">
      <div className="health-name">Lucidia swap growing</div>
      <div className="health-desc">1.3GB/8.5GB used. Swap on degrading SD card accelerates wear.</div>
      <div className="health-tag">degraded</div>
    </div>
    <div className="health-card advisory">
      <div className="health-name">anastasia 94% disk</div>
      <div className="health-desc">DigitalOcean droplet NYC1 nearly full. 1cpu/1GB — limited capacity.</div>
      <div className="health-tag">advisory</div>
    </div>
    <div className="health-card advisory">
      <div className="health-name">Cecilia 4 rclone instances</div>
      <div className="health-desc">All syncing same Google Drive. Should consolidate to 1 instance with proper scheduling.</div>
      <div className="health-tag">advisory</div>
    </div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroad-guardian-dashboard.pages.dev#encryption" className="pill"><div className="pill-dot"></div> Encryption &amp; Security</a>
    <a href="https://blackroad-infra.pages.dev#fleet" className="pill"><div className="pill-dot"></div> Hardware Fleet</a>
    <a href="https://blackroad-systems.pages.dev" className="pill"><div className="pill-dot"></div> Cloud Storage</a>
    <a href="https://blackroad-company.pages.dev" className="pill"><div className="pill-dot"></div> Foundation (CRM &amp; Data)</a>
    <a href="https://research-lab-blackroad-io.pages.dev" className="pill"><div className="pill-dot"></div> Research Papers</a>
    <a href="https://blackroadai-com.pages.dev" className="pill"><div className="pill-dot"></div> AI &amp; Ollama</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">BlackRoad Archive</a>
  <div className="footer-links"><a href="https://github.com/blackboxprogramming" target="_blank">GitHub</a><a href="https://blackroad-io.pages.dev">OS Inc</a><a href="https://blackroad-systems.pages.dev">Cloud</a><a href="https://blackroad-guardian-dashboard.pages.dev">Security</a><a href="https://blackroad-infra.pages.dev">Hardware</a></div>
  <div className="footer-copy">&copy; 2026 BlackRoad Archive. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
