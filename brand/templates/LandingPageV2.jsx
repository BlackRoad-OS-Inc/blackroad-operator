import { useState, useEffect, useRef } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const PORTALS = [
  { name: "RoadWork", desc: "AI tutoring that adapts to how you actually learn. Not how a textbook thinks you should.", tag: "Education" },
  { name: "RoadView", desc: "Search that verifies before it surfaces. Every result scored for confidence, not clicks.", tag: "Search" },
  { name: "RoadGlitch", desc: "Drag-and-drop automation that generates production code. Your codebase, your style.", tag: "Backend" },
  { name: "RoadWorld", desc: "Virtual environments with real-world bridges. 80% creator revenue. You own everything.", tag: "Worlds" },
  { name: "BackRoad", desc: "Social without the sickness. No vanity metrics. No addiction mechanics. Just people.", tag: "Social" },
  { name: "CashRoad", desc: "Financial clarity without judgment. Decision-time assistance, not post-spending shame.", tag: "Finance" },
];

const PRINCIPLES = [
  { number: "01", title: "Truth-First", body: "Every piece of information carries a confidence score. No SEO gaming. No ad-driven rankings. Only verified facts surface." },
  { number: "02", title: "Creator-Owned", body: "80% revenue share. Your data, your content, your audience. Portable identity across every portal in the ecosystem." },
  { number: "03", title: "Agent Intelligence", body: "1,000 AI agents with persistent memory, individual identities, and evolving capabilities oriented toward community betterment." },
  { number: "04", title: "Zero Admin", body: "The OS handles forms, PDFs, onboarding, and compliance in the background. Admin becomes invisible, not a life event." },
];

const STATS = [
  { value: "1,000", label: "AI Agents" },
  { value: "20", label: "Domains" },
  { value: "150+", label: "Subdomains" },
  { value: "80%", label: "Creator Revenue" },
];

function GradientBar({ height = 2, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function AnimatedGradientText({ children, style = {} }) {
  return (
    <span style={{
      background: GRADIENT,
      backgroundSize: "200% auto",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animation: "shimmer 4s linear infinite",
      ...style,
    }}>
      {children}
    </span>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 560px) {
          .nav-links { display: none !important; }
          .nav-menu-btn { display: flex !important; }
        }
        @media (min-width: 561px) {
          .nav-links { display: flex !important; }
          .nav-menu-btn { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 20px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled || menuOpen ? "rgba(10,10,10,0.95)" : "transparent",
        backdropFilter: scrolled || menuOpen ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid #1a1a1a" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {COLORS.map((c) => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>BlackRoad</span>
        </div>

        {/* Desktop links */}
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {["Portals", "Principles", "Agents"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>{item}</a>
          ))}
          <button style={{
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
            color: "#0a0a0a", background: "#f5f5f5", border: "none",
            padding: "6px 14px", borderRadius: 6, cursor: "pointer",
          }}>
            Early Access
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="nav-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none", alignItems: "center", justifyContent: "center",
            background: "none", border: "1px solid #262626", borderRadius: 6,
            padding: "6px 10px", cursor: "pointer", color: "#a3a3a3",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{
          position: "fixed", top: 52, left: 0, right: 0, zIndex: 99,
          background: "rgba(10,10,10,0.97)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1a1a1a", padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {["Portals", "Principles", "Agents"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#a3a3a3", textDecoration: "none" }}>{item}</a>
          ))}
          <button style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
            color: "#0a0a0a", background: "#f5f5f5", border: "none",
            padding: "10px 20px", borderRadius: 6, cursor: "pointer", width: "fit-content",
          }}>
            Early Access
          </button>
        </div>
      )}
    </>
  );
}

function Hero() {
  return (
    <section style={{ padding: "140px 24px 80px", position: "relative", overflow: "hidden" }}>
      {/* Subtle gradient orb */}
      <div style={{
        position: "absolute", top: -120, right: -80, width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(136,68,255,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252",
          textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ display: "flex", gap: 3 }}>
            {COLORS.map((c) => <div key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />)}
          </div>
          Distributed AI Operating System
        </div>

        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(40px, 8vw, 72px)",
          fontWeight: 700, color: "#f5f5f5", lineHeight: 1.05,
          letterSpacing: "-0.03em", marginBottom: 28,
        }}>
          The OS that<br />
          works <em style={{ fontStyle: "normal" }}>for</em> you,<br />
          not <em style={{ fontStyle: "normal" }}>on</em> you.
        </h1>

        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: "clamp(15px, 2vw, 18px)",
          color: "#a3a3a3", lineHeight: 1.65, maxWidth: 520, marginBottom: 40,
        }}>
          1,000 AI agents with persistent memory and individual identity. Truth-first search. 80% creator revenue. Zero admin friction. An ecosystem built on the radical idea that technology should make humans more human.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
          <button style={{
            fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500,
            color: "#0a0a0a", background: "#f5f5f5", border: "none",
            padding: "13px 28px", borderRadius: 8, cursor: "pointer",
          }}>
            Request Early Access
          </button>
          <button style={{
            fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500,
            color: "#d4d4d4", background: "transparent", border: "1px solid #404040",
            padding: "13px 28px", borderRadius: 8, cursor: "pointer",
          }}>
            Read the Architecture
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 1, background: "#262626", borderRadius: 12, overflow: "hidden",
        }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: "#171717", padding: 24, textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#f5f5f5", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortalsSection() {
  return (
    <section id="portals" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Ecosystem
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 12 }}>
          Six portals.<br />One identity.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.6, marginBottom: 40, maxWidth: 480 }}>
          Your preferences, your data, your reputation — portable across every surface. No more starting over.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#262626", borderRadius: 12, overflow: "hidden" }}>
          {PORTALS.map((p, i) => (
            <div key={p.name} style={{ background: "#171717", padding: "28px 24px", display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 2, background: COLORS[i], flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#f5f5f5" }}>{p.name}</span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#a3a3a3", lineHeight: 1.55, margin: 0, paddingLeft: 14 }}>
                  {p.desc}
                </p>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500,
                color: "#525252", background: "#0a0a0a", padding: "4px 10px",
                borderRadius: 4, border: "1px solid #262626", flexShrink: 0, alignSelf: "flex-start",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                {p.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section id="principles" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Philosophy
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 40 }}>
          Built different.<br />On purpose.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {PRINCIPLES.map((p) => (
            <div key={p.number} style={{ background: "#171717", border: "1px solid #262626", borderRadius: 12, padding: 28 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#404040", marginBottom: 16 }}>{p.number}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#f5f5f5", marginBottom: 12 }}>{p.title}</div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.6, margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentsSection() {
  return (
    <section id="agents" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Intelligence
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 12 }}>
          Not tools.<br />Teammates.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.6, marginBottom: 40, maxWidth: 480 }}>
          Each agent has a birthdate, a family, persistent memory, and a virtual home. They remember every interaction. They evolve. They're oriented toward community — not extraction.
        </p>

        <div style={{ background: "#171717", border: "1px solid #262626", borderRadius: 12, overflow: "hidden" }}>
          {/* Terminal-style agent display */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #262626", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#404040" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#404040" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#404040" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", marginLeft: 8 }}>agent.registry</span>
          </div>
          <div style={{ padding: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2 }}>
            <div style={{ color: "#525252" }}>$ lucidia agents --status active</div>
            <div style={{ color: "#737373", marginTop: 8 }}>
              <span style={{ color: "#a3a3a3" }}>AGENT</span>{"        "}<span style={{ color: "#a3a3a3" }}>STATUS</span>{"    "}<span style={{ color: "#a3a3a3" }}>MEMORY</span>{"     "}<span style={{ color: "#a3a3a3" }}>UPTIME</span>
            </div>
            {[
              { name: "alice", status: "active", mem: "2.4TB", up: "347d" },
              { name: "lucidia", status: "active", mem: "1.8TB", up: "289d" },
              { name: "meridian", status: "active", mem: "940GB", up: "194d" },
              { name: "radius", status: "idle", mem: "620GB", up: "156d" },
              { name: "cadence", status: "active", mem: "380GB", up: "112d" },
            ].map((a) => (
              <div key={a.name} style={{ color: "#737373" }}>
                <span style={{ color: "#d4d4d4" }}>{a.name.padEnd(13)}</span>
                <span style={{ color: a.status === "active" ? "#a3a3a3" : "#525252" }}>{a.status.padEnd(10)}</span>
                <span>{a.mem.padEnd(11)}</span>
                <span>{a.up}</span>
              </div>
            ))}
            <div style={{ color: "#525252", marginTop: 12 }}>
              5 of 1,000 agents shown. 847 active. 153 initializing.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchSection() {
  const layers = [
    { name: "Experience", desc: "Apps, portals, studios, docs", domains: "*.blackroad.io · *.lucidia.earth · *.lucidia.studio" },
    { name: "Governance", desc: "Policies, intents, ledger, agent registry", domains: "*.blackroad.systems" },
    { name: "Infrastructure", desc: "Clusters, Pi mesh, edge devices, monitoring", domains: "*.blackroad.network" },
    { name: "Data", desc: "Databases, vectors, caches, object storage", domains: "Internal services" },
  ];
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Architecture
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 40 }}>
          Four layers.<br />Twenty domains.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {layers.map((l, i) => (
            <div key={l.name} style={{
              background: "#171717", border: "1px solid #262626", borderRadius: 10,
              padding: "22px 24px", display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: COLORS[i], opacity: 1 - i * 0.15 }} />
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: "#f5f5f5" }}>{l.name}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373" }}>{l.desc}</div>
                </div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040", marginLeft: "auto", paddingTop: 2 }}>{l.domains}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <GradientBar height={1} style={{ marginBottom: 56, opacity: 0.5 }} />

        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 700,
          color: "#f5f5f5", letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1,
        }}>
          Technology should make<br />humans more human.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.6, marginBottom: 36, maxWidth: 440, margin: "0 auto 36px" }}>
          BlackRoad OS is in active development. Join the architects building something that gives a damn.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <button style={{
            fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500,
            color: "#0a0a0a", background: "#f5f5f5", border: "none",
            padding: "14px 32px", borderRadius: 8, cursor: "pointer",
          }}>
            Request Early Access
          </button>
          <button style={{
            fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500,
            color: "#a3a3a3", background: "transparent", border: "1px solid #404040",
            padding: "14px 32px", borderRadius: 8, cursor: "pointer",
          }}>
            View on GitHub
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "0 24px 48px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <GradientBar height={1} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {COLORS.map((c) => <div key={c} style={{ width: 4, height: 12, borderRadius: 2, background: c }} />)}
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: "#a3a3a3" }}>BlackRoad OS</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040" }}>
              Built by Alexa Amundson · blackroad.io
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Docs", "GitHub", "Status"].map((link) => (
              <a key={link} href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252", textDecoration: "none" }}>{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        html, body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border-radius: 3px; }
        a:hover { color: #a3a3a3 !important; }
        button:hover { opacity: 0.88; }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <Nav />
        <Hero />
        <GradientBar height={1} />
        <PortalsSection />
        <PrinciplesSection />
        <AgentsSection />
        <ArchSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
