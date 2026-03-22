import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadLabs() {
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
        html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;-webkit-text-stroke:.2px rgba(255,255,255,.1);scroll-behavior:smooth}
        :root{
          --g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
          --g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
          --bg:#000;--white:#fff;--black:#000;--border:#1a1a1a;
          --sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;
        }
        body{background:var(--bg);color:var(--white);font-family:var(--sg);overflow-x:hidden}
        
        /* ═══ GRAD BAR ═══ */
        .grad-bar{height:4px;background:var(--g);image-rendering:crisp-edges}
        
        /* ═══ NAV ═══ */
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px}
        .nav-logo-mark{width:28px;height:4px;border-radius:2px;background:var(--g);image-rendering:crisp-edges}
        .nav-links{display:flex;gap:32px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--white);opacity:.5;text-decoration:none;transition:opacity .2s}
        .nav-links a:hover{opacity:1}
        .btn-outline{padding:8px 20px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg);transition:border-color .2s}
        .btn-outline:hover{border-color:#444}
        
        /* ═══ HERO ═══ */
        .hero{text-align:center;padding:120px 48px 80px;position:relative}
        .orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:.06;pointer-events:none}
        .orb-1{width:400px;height:400px;background:#4488FF;top:-150px;left:-5%}
        .orb-2{width:350px;height:350px;background:#CC00AA;top:-100px;right:-5%}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);margin-bottom:32px}
        .hero-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--g135)}
        .hero h1{font-size:64px;font-weight:700;color:var(--white);line-height:1.08;margin-bottom:24px;max-width:780px;margin-left:auto;margin-right:auto;letter-spacing:-.02em}
        .hero p{font-size:18px;color:var(--white);opacity:.45;max-width:520px;margin:0 auto 48px;line-height:1.7}
        .hero-cta{display:flex;gap:16px;justify-content:center}
        .btn-lg{padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .btn-lg-solid{background:var(--white);color:var(--black);border:none}
        .btn-lg-outline{background:transparent;color:var(--white);border:1px solid var(--border);transition:border-color .2s}
        .btn-lg-outline:hover{border-color:#444}
        
        /* ═══ SECTIONS ═══ */
        .section{max-max-width:1100px;width:100%;margin:0 auto;padding:80px 48px}
        .section-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .section-desc{font-size:14px;color:var(--white);opacity:.4;max-width:460px;margin-bottom:48px}
        
        /* ═══ RESEARCH PAPERS — lined rows with number ═══ */
        .paper-list{border-top:1px solid var(--border)}
        .paper{display:grid;grid-template-columns:48px 1fr auto;gap:20px;padding:24px 0;border-bottom:1px solid var(--border);align-items:start;transition:opacity .15s}
        .paper:hover{opacity:.8}
        .paper-num{font-family:var(--jb);font-size:28px;font-weight:700;color:var(--white);opacity:.08}
        .paper-title{font-size:16px;font-weight:600;color:var(--white);margin-bottom:4px}
        .paper-abstract{font-size:13px;color:var(--white);opacity:.4;line-height:1.7;max-width:600px}
        .paper-meta{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
        .paper-tag{padding:3px 8px;border:1px solid var(--border);border-radius:3px;font-family:var(--jb);font-size:10px;color:var(--white);opacity:.35}
        .paper-date{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.2;white-space:nowrap;padding-top:4px}
        
        /* ═══ FOCUS AREAS — outlined cards with gradient line ═══ */
        .focus-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .focus-card{border:1px solid var(--border);border-radius:10px;padding:28px;transition:border-color .2s}
        .focus-card:hover{border-color:#333}
        .focus-line{width:32px;height:3px;border-radius:1px;background:var(--g);margin-bottom:20px;image-rendering:crisp-edges}
        .focus-card h3{font-size:15px;font-weight:600;color:var(--white);margin-bottom:8px}
        .focus-card p{font-size:13px;color:var(--white);opacity:.4;line-height:1.7}
        .focus-card .focus-stat{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.2;margin-top:14px;letter-spacing:.04em}
        
        /* ═══ TIMELINE — vertical line with gradient dots ═══ */
        .timeline{position:relative;padding-left:32px}
        .timeline::before{content:'';position:absolute;left:0;top:0;bottom:0;width:1px;background:var(--border)}
        .tl-item{position:relative;padding:0 0 48px}
        .tl-item:last-child{padding-bottom:0}
        .tl-dot{position:absolute;left:-37px;top:6px;width:12px;height:12px;border-radius:50%;background:var(--g135)}
        .tl-dot.minor{width:8px;height:8px;left:-35px;top:8px;opacity:.4}
        .tl-date{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.2;margin-bottom:6px}
        .tl-title{font-size:16px;font-weight:600;color:var(--white);margin-bottom:6px}
        .tl-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.7;max-width:560px}
        
        /* ═══ COLLABORATORS — outlined pill row ═══ */
        .collab-row{display:flex;gap:12px;flex-wrap:wrap}
        .collab{display:flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--border);border-radius:20px;transition:border-color .2s}
        .collab:hover{border-color:#333}
        .collab-dot{width:6px;height:6px;border-radius:50%;background:var(--g135)}
        .collab-name{font-size:13px;font-weight:500;color:var(--white);opacity:.6}
        
        /* ═══ CTA ═══ */
        .cta{text-align:center;padding:80px 48px}
        .cta-box{max-width:700px;margin:0 auto;padding:64px;border:1px solid var(--border);border-radius:16px;position:relative;overflow:hidden}
        .cta-box::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g)}
        .cta-box h2{font-size:28px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .cta-box p{font-size:14px;color:var(--white);opacity:.4;margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto}
        
        /* ═══ FOOTER ═══ */
        footer{border-top:1px solid var(--border);padding:48px;display:flex;justify-content:space-between;align-items:center}
        .footer-brand{font-weight:700;font-size:16px;color:var(--white)}
        .footer-links{display:flex;gap:24px}
        .footer-links a{font-size:13px;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .2s}
        .footer-links a:hover{opacity:1}
        .footer-copy{font-size:12px;color:var(--white);opacity:.2}
        
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}.nav-links{display:none}
          .hero{padding:80px 20px 60px}.hero h1{font-size:36px}
          .hero-cta{flex-direction:column;align-items:center}
          .section{padding:48px 20px}
          .paper{grid-template-columns:1fr;gap:8px}.paper-num{display:none}
          .focus-grid{grid-template-columns:1fr}
          .cta{padding:48px 20px}
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
  <div className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Labs</div>
  <div className="nav-links">
    <a href="#papers">Papers</a>
    <a href="#focus">Focus Areas</a>
    <a href="#timeline">Timeline</a>
    <a href="https://blackroad-io.pages.dev">BlackRoad OS Inc</a>
  </div>
  <a className="btn-outline" href="https://github.com/blackboxprogramming/quantum-math-lab" target="_blank" style={{{ textDecoration: "none" }}}>View on GitHub</a>
</nav>





<section className="hero">
  <div className="orb orb-1"></div>
  <div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> Foundational Research</div>
  <h1>Where math meets machine</h1>
  <p>BlackRoad Labs explores quantum computing, simulation theory, gematria computation, and experimental mathematics. 94 sections of foundational theory. 1,012 verified equations.</p>
  <div className="hero-cta">
    <a className="btn-lg btn-lg-solid" href="#papers" style={{{ textDecoration: "none" }}}>Read Papers</a>
    <a className="btn-lg btn-lg-outline" href="#focus" style={{{ textDecoration: "none" }}}>View Experiments</a>
  </div>
</section>








<section className="section">
  <div className="section-label" id="papers">Publications</div>
  <div className="section-title">Research papers</div>
  <div className="section-desc">Original research in computational theory, quantum simulation, and mathematical foundations.</div>
  <div className="paper-list">
    <div className="paper">
      <div className="paper-num">01</div>
      <div>
        <div className="paper-title">The Trivial Zero: A Computational Proof That Reality Is Self-Referential</div>
        <div className="paper-abstract">SHA-256 hash chains as evidence of computational reality. Connects Gödel incompleteness, Riemann zeta functions, DNA encoding, and operating system ontology across 94 sections with 1,012 verified equations.</div>
        <div className="paper-meta"><span className="paper-tag">Simulation Theory</span><span className="paper-tag">Gödel</span><span className="paper-tag">Riemann</span><span className="paper-tag">94 Sections</span></div>
      </div>
      <div className="paper-date">Feb 2026</div>
    </div>
    <div className="paper">
      <div className="paper-num">02</div>
      <div>
        <div className="paper-title">Quantum Framework: State-Vector Circuit Simulation</div>
        <div className="paper-abstract">Dense complex NumPy state-vector simulator implementing Hadamard, Pauli-X/Y/Z, CNOT gates with projective measurement and state collapse. Includes VQE, QAOA, Grover's, and QFT algorithm implementations.</div>
        <div className="paper-meta"><span className="paper-tag">Quantum Computing</span><span className="paper-tag">VQE</span><span className="paper-tag">Grover's</span></div>
      </div>
      <div className="paper-date">Jan 2026</div>
    </div>
    <div className="paper">
      <div className="paper-num">03</div>
      <div>
        <div className="paper-title">Unsolved Problem Compendium</div>
        <div className="paper-abstract">Computational approaches to 10 landmark unsolved problems: Riemann Hypothesis, P vs NP, Navier-Stokes existence and smoothness, Birch and Swinnerton-Dyer conjecture, and six others. Each with numerical experiments.</div>
        <div className="paper-meta"><span className="paper-tag">P vs NP</span><span className="paper-tag">Navier-Stokes</span><span className="paper-tag">Number Theory</span></div>
      </div>
      <div className="paper-date">Dec 2025</div>
    </div>
    <div className="paper">
      <div className="paper-num">04</div>
      <div>
        <div className="paper-title">Gematria Computation Engine</div>
        <div className="paper-abstract">Numerical encoding system mapping alphabetic characters to mathematical values. 156,675 FTS5 index entries across <a href="https://blackroad-assets.pages.dev#memory" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>228 SQLite databases</a> powering pattern recognition and cross-reference analysis.</div>
        <div className="paper-meta"><span className="paper-tag">Gematria</span><span className="paper-tag">FTS5</span><span className="paper-tag">Pattern Analysis</span></div>
      </div>
      <div className="paper-date">2025</div>
    </div>
  </div>
</section>







<section className="section">
  <div className="section-label" id="focus">Disciplines</div>
  <div className="section-title">Focus areas</div>
  <div className="section-desc">Six research domains spanning pure mathematics, quantum computing, and computational philosophy.</div>
  <div className="focus-grid">
    <div className="focus-card"><div className="focus-line"></div><h3>Quantum Simulation</h3><p>State-vector circuit simulator with Bell states, entanglement, and projective measurement. Real quantum algorithm implementations.</p><div className="focus-stat">VQE · QAOA · Grover's · QFT</div></div>
    <div className="focus-card"><div className="focus-line"></div><h3>Simulation Theory</h3><p>Computational evidence for self-referential reality. Hash chains, Gödel encoding, and operating system ontology as proof framework.</p><div className="focus-stat">94 sections · 1,012 equations</div></div>
    <div className="focus-card"><div className="focus-line"></div><h3>Gematria Computation</h3><p>Algorithmic number-letter mapping with FTS5 full-text search across 228 databases. Pattern recognition at scale.</p><div className="focus-stat">156,675 indexed entries</div></div>
    <div className="focus-card"><div className="focus-line"></div><h3>Number Theory</h3><p>Riemann zeta function analysis, prime distribution, and computational approaches to the Riemann Hypothesis.</p><div className="focus-stat">Riemann · Primes · Zeta zeros</div></div>
    <div className="focus-card"><div className="focus-line"></div><h3>Emergence Research</h3><p>Experimental trinary logic and emergence simulations. Investigating how complex behavior arises from simple computational rules.</p><div className="focus-stat">Trinary · Cellular automata</div></div>
    <div className="focus-card"><div className="focus-line"></div><h3>Computational Philosophy</h3><p>Formal proofs connecting Gödel incompleteness, Lorenz attractors, Mandelbrot sets, and DNA encoding to computational substrates.</p><div className="focus-stat">Gödel · Lorenz · Mandelbrot</div></div>
  </div>
</section>








<section className="section">
  <div className="section-label" id="timeline">History</div>
  <div className="section-title">Research timeline</div>
  <div className="section-desc">Major milestones from the founding of the research program to present.</div>
  <div className="timeline">
    <div className="tl-item"><div className="tl-dot"></div><div className="tl-date">February 2026</div><div className="tl-title">The Trivial Zero published</div><div className="tl-desc">94-section paper connecting SHA-256 hash chains, Gödel incompleteness, Riemann zeta, and DNA encoding into a unified computational proof of self-referential reality.</div></div>
    <div className="tl-item"><div className="tl-dot minor"></div><div className="tl-date">January 2026</div><div className="tl-title">Quantum Framework v1.0</div><div className="tl-desc">State-vector simulator with VQE, QAOA, Grover's, and QFT implementations. Full pytest suite. Open-sourced on GitHub.</div></div>
    <div className="tl-item"><div className="tl-dot"></div><div className="tl-date">December 2025</div><div className="tl-title">Unsolved problem compendium</div><div className="tl-desc">Computational approaches to 10 landmark unsolved problems including P vs NP, Riemann Hypothesis, and Navier-Stokes. Numerical experiments for each.</div></div>
    <div className="tl-item"><div className="tl-dot minor"></div><div className="tl-date">2025</div><div className="tl-title">Gematria engine reaches 156K entries</div><div className="tl-desc">FTS5 full-text search index across 228 SQLite databases. Pattern recognition and cross-reference analysis at scale.</div></div>
    <div className="tl-item"><div className="tl-dot"></div><div className="tl-date">2024</div><div className="tl-title">BlackRoad Labs founded</div><div className="tl-desc">Research division established within BlackRoad OS Inc. Initial focus: computational philosophy, gematria systems, and mathematical foundations.</div></div>
  </div>
</section>






<section className="section">
  <div className="section-label">Tools</div>
  <div className="section-title">Research stack</div>
  <div className="section-desc">Open-source tools and frameworks powering our research.</div>
  <div className="collab-row">
    <div className="collab"><div className="collab-dot"></div><span className="collab-name">Python</span></div>
    <div className="collab"><div className="collab-dot"></div><span className="collab-name">NumPy</span></div>
    <div className="collab"><div className="collab-dot"></div><span className="collab-name">SQLite / FTS5</span></div>
    <a href="https://blackroadai-com.pages.dev#models" className="collab" style={{{ textDecoration: "none" }}}><div className="collab-dot"></div><span className="collab-name">Ollama</span></a>
    <a href="https://blackroad-infra.pages.dev#accelerators" className="collab" style={{{ textDecoration: "none" }}}><div className="collab-dot"></div><span className="collab-name">Hailo-8</span></a>
    <div className="collab"><div className="collab-dot"></div><span className="collab-name">pytest</span></div>
    <a href="https://blackroad-infra.pages.dev#fleet" className="collab" style={{{ textDecoration: "none" }}}><div className="collab-dot"></div><span className="collab-name">Raspberry Pi 5</span></a>
  </div>
</section>






<section className="cta">
  <div className="cta-box">
    <h2>Explore the source</h2>
    <p>All research code is open-source. Clone the repos, run the simulations, verify the proofs.</p>
    <a className="btn-lg btn-lg-solid" href="https://github.com/blackboxprogramming/quantum-math-lab" target="_blank" style={{{ textDecoration: "none" }}}>View on GitHub</a>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroadai-com.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 6 AI Agents</a>
    <a href="https://blackroad-infra.pages.dev#accelerators" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 52 TOPS Hailo-8</a>
    <a href="https://blackroad-assets.pages.dev#memory" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 228 SQLite Databases</a>
    <a href="https://blackroad-metaverse.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Simulation Engine</a>
    <a href="https://education-blackroad-io.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Education Platform</a>
    <a href="https://blackroad-infra.pages.dev#fleet" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Compute Fleet</a>
  </div>
</section>

<footer>
  <div className="footer-brand"><a href="https://blackroad-io.pages.dev" style={{{ color: "inherit", textDecoration: "none" }}}>BlackRoad Labs</a></div>
  <div className="footer-links">
    <a href="#papers">Papers</a>
    <a href="https://blackroadai-com.pages.dev">AI</a>
    <a href="https://blackroad-assets.pages.dev">Archive</a>
    <a href="https://blackroad-metaverse.pages.dev">Interactive</a>
    <a href="https://github.com/blackboxprogramming/simulation-theory" target="_blank">GitHub</a>
    <a href="https://blackroad-io.pages.dev">OS Inc</a>
  </div>
  <div className="footer-copy">&copy; 2026 BlackRoad Labs. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>







      </div>
    </>
  );
}
