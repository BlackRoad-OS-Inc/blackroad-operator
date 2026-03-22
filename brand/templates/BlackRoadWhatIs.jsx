import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

// ─── Utilities ────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 390);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

function useVisible(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function FadeIn({ children, delay = 0, dir = "up", style = {} }) {
  const [ref, vis] = useVisible();
  const from = dir === "up" ? "translateY(24px)" : dir === "left" ? "translateX(-24px)" : dir === "right" ? "translateX(24px)" : "translateY(0)";
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translate(0)" : from, transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────
function Nav() {
  const w = useWidth();
  const mobile = w < 640;
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 }}>
      <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: mobile ? "0 16px" : "0 40px",
        height: 56,
        background: scrolled ? "rgba(0,0,0,0.97)" : "rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid #141414" : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <a href="https://blackroad.io" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {STOPS.map((c, i) => (
              <div key={c} style={{ width: 3, height: 18, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />
            ))}
          </div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f5f5f5", letterSpacing: "-0.03em" }}>BlackRoad</span>
        </a>
        {!mobile && (
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {["The Problem","The Fix","How It Works","Why Now"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "#686868", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#f0f0f0"}
                onMouseLeave={e => e.target.style.color = "#686868"}
              >{l}</a>
            ))}
          </div>
        )}
        <a href="https://blackroad.io" style={{
          fontFamily: inter, fontWeight: 600, fontSize: 12,
          padding: "8px 18px",
          background: GRAD, backgroundSize: "200% 100%",
          border: "none", color: "#fff", cursor: "pointer",
          textDecoration: "none",
          letterSpacing: "0.01em",
          boxShadow: "0 4px 16px rgba(136,68,255,0.2)",
        }}>Get Started</a>
      </nav>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────
function Hero() {
  const w = useWidth();
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 50); return () => clearInterval(id); }, []);
  const angle = (tick * 0.5) % 360;

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: w < 480 ? "100px 20px 60px" : "120px 40px 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(136,68,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", left: "20%", width: 300, height: 300, background: "radial-gradient(circle, rgba(255,34,85,0.06) 0%, transparent 70%)", pointerEvents: "none", animation: "orb1 8s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "25%", right: "15%", width: 280, height: 280, background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)", pointerEvents: "none", animation: "orb2 10s ease-in-out infinite" }} />

      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", border: "1px solid #1e1e1e", background: "rgba(255,255,255,0.02)", marginBottom: 36, animation: "fadeUp 0.6s ease 0.1s both" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4FF", animation: "ping 1.8s ease-out infinite" }} />
        <span style={{ fontFamily: mono, fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.14em" }}>A New Path</span>
      </div>

      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(36px, 10vw, 80px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 8, animation: "fadeUp 0.6s ease 0.2s both", maxWidth: 900 }}>
        What is
      </h1>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(36px, 10vw, 80px)", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 32, animation: "fadeUp 0.6s ease 0.25s both" }}>
        <span style={{ background: `linear-gradient(${angle}deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          BlackRoad OS?
        </span>
      </h1>

      <p style={{ fontFamily: inter, fontSize: "clamp(15px, 3vw, 19px)", color: "#606060", lineHeight: 1.7, maxWidth: 580, marginBottom: 48, animation: "fadeUp 0.6s ease 0.35s both" }}>
        Decades of pain points. One operating system built to fix them all. Own your infrastructure. Own your data. Own your intelligence.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s ease 0.45s both" }}>
        <a href="#the-problem" style={{
          fontFamily: inter, fontWeight: 600, fontSize: 15,
          padding: "14px 36px",
          background: GRAD, backgroundSize: "200% 100%",
          border: "none", color: "#fff", cursor: "pointer",
          textDecoration: "none",
          boxShadow: "0 4px 16px rgba(136,68,255,0.2)",
          letterSpacing: "0.01em",
        }}>See the Problem</a>
        <a href="#the-fix" style={{
          fontFamily: inter, fontWeight: 600, fontSize: 15,
          padding: "14px 32px",
          background: "transparent",
          border: "1px solid #2a2a2a",
          color: "#a0a0a0",
          cursor: "pointer",
          textDecoration: "none",
        }}>See the Fix</a>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: GRAD, opacity: 0.3 }} />
    </section>
  );
}

// ─── Pain Point Card ──────────────────────────────────────────────
function PainCard({ number, title, body, color, delay }) {
  const [hover, setHover] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: "#080808",
          border: `1px solid ${hover ? color + "44" : "#141414"}`,
          padding: "28px 24px",
          transition: "border-color 0.25s, box-shadow 0.25s, transform 0.2s",
          boxShadow: hover ? `0 0 40px ${color}18` : "none",
          transform: hover ? "translateY(-3px)" : "none",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, right: 0, fontFamily: grotesk, fontWeight: 700, fontSize: 72, color: color + "08", lineHeight: 1, pointerEvents: "none" }}>{number}</div>
        <div style={{ height: 2, width: 32, background: color, marginBottom: 18, transition: "width 0.3s", ...(hover && { width: 56 }) }} />
        <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#ebebeb", letterSpacing: "-0.02em", marginBottom: 10 }}>{title}</div>
        <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7 }}>{body}</div>
      </div>
    </FadeIn>
  );
}

// ─── The Problem Section ──────────────────────────────────────────
function TheProblem() {
  const w = useWidth();
  const cols = w >= 900 ? "repeat(3,1fr)" : w >= 580 ? "repeat(2,1fr)" : "1fr";

  const pains = [
    { number: "01", color: "#FF2255", title: "Vendor Lock-In", body: "AWS, GCP, Azure own your stack. Your data lives on their servers, your compute runs on their terms. One pricing change and your business model breaks overnight." },
    { number: "02", color: "#FF6B2B", title: "Tool Fragmentation", body: "14+ apps to get one thing done. Slack, Notion, GitHub, Figma, Vercel, Stripe, Linear, Jira — every switch loses context. 5 seconds to think, 50 hours to produce." },
    { number: "03", color: "#CC00AA", title: "Per-Seat Pricing Trap", body: "Every tool charges per seat per month. Scale your team and your costs scale faster. A 50-person org pays $50K-$200K/year just for SaaS subscriptions." },
    { number: "04", color: "#8844FF", title: "No Data Sovereignty", body: "Your code on GitHub's servers. Your docs on Notion's servers. Your conversations on Slack's servers. You own nothing. They own your workflow." },
    { number: "05", color: "#4488FF", title: "AI That Forgets You", body: "Every ChatGPT session starts from zero. No persistent memory. No context of who you are, what you're building, or what you said five minutes ago. You repeat yourself forever." },
    { number: "06", color: "#00D4FF", title: "Creators Don't Own Their Work", body: "YouTube takes 45%. Spotify pays $0.003/stream. Platforms own the audience, the algorithm, and the revenue. Creators are tenants in someone else's building." },
  ];

  return (
    <section id="the-problem" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn delay={0}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>01 — The Problem</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 20 }}>
              Decades of<br />pain points.
            </h2>
            <p style={{ fontFamily: inter, fontSize: 16, color: "#555", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              The modern tech stack is broken. You pay more every year for tools that own more of your data. Here's what we're fixing.
            </p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8 }}>
          {pains.map((p, i) => <PainCard key={p.title} {...p} delay={i * 70} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────
function Marquee() {
  const words = ["Sovereign", "Self-Hosted", "AI-Native", "Persistent Memory", "One OS", "Zero Lock-In", "Creator-First", "Pave Tomorrow"];
  const repeated = [...words, ...words];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid #0d0d0d", borderBottom: "1px solid #0d0d0d", padding: "18px 0", background: "#040404" }}>
      <div style={{ display: "flex", gap: 0, animation: "marquee 22s linear infinite", whiteSpace: "nowrap" }}>
        {repeated.map((w, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
            <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(14px, 3vw, 18px)", color: i % 2 === 0 ? "#1c1c1c" : "#161616", letterSpacing: "-0.02em", padding: "0 24px" }}>
              {w}
            </span>
            <span style={{ color: STOPS[i % STOPS.length], fontSize: 10 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Fix Card ─────────────────────────────────────────────────────
function FixCard({ icon, title, replaces, body, color, delay }) {
  const [hover, setHover] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: "#080808",
          border: `1px solid ${hover ? color + "44" : "#141414"}`,
          padding: "28px 24px",
          transition: "border-color 0.25s, box-shadow 0.25s, transform 0.2s",
          boxShadow: hover ? `0 0 40px ${color}18` : "none",
          transform: hover ? "translateY(-3px)" : "none",
          height: "100%",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
        <div style={{ height: 2, width: 32, background: color, marginBottom: 14, transition: "width 0.3s", ...(hover && { width: 56 }) }} />
        <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#ebebeb", letterSpacing: "-0.02em", marginBottom: 6 }}>{title}</div>
        <div style={{ fontFamily: mono, fontSize: 10, color: color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Replaces {replaces}</div>
        <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7 }}>{body}</div>
      </div>
    </FadeIn>
  );
}

// ─── The Fix Section ──────────────────────────────────────────────
function TheFix() {
  const w = useWidth();
  const cols = w >= 900 ? "repeat(3,1fr)" : w >= 580 ? "repeat(2,1fr)" : "1fr";

  const fixes = [
    { icon: "⬡", color: "#8844FF", title: "Sovereign Infrastructure", replaces: "AWS / GCP / Azure", body: "Your own compute cluster. Raspberry Pi fleet, edge servers, WireGuard mesh — all connected, all yours. No monthly cloud bill. No vendor dependency." },
    { icon: "◈", color: "#00D4FF", title: "AI With Memory", replaces: "ChatGPT / Copilot", body: "Lucidia remembers every conversation, every decision, every context. Persistent memory across sessions. Your AI actually knows who you are." },
    { icon: "◉", color: "#FF2255", title: "Self-Hosted Git", replaces: "GitHub / GitLab", body: "RoadCode — your own Gitea instance with 239+ repos, full-text code search, CI/CD runners, and package registry. Your code on your hardware." },
    { icon: "△", color: "#FF6B2B", title: "Own Your DNS & Edge", replaces: "Cloudflare / Vercel", body: "PowerDNS, Caddy TLS, edge routing — 151 domains served from your own servers. Let's Encrypt certificates. Zero dependency on any CDN provider." },
    { icon: "⊞", color: "#4488FF", title: "One Workspace", replaces: "Slack + Notion + Linear", body: "Chat, docs, tasks, agents — all in one sovereign platform. No more context-switching across 14 tabs. Everything in one window." },
    { icon: "◐", color: "#CC00AA", title: "Creator-First Revenue", replaces: "YouTube / Spotify", body: "RoadTube, RoadWork, Studio — platforms where creators own the audience and keep the revenue. 60%+ creator share. Your content, your terms." },
  ];

  return (
    <section id="the-fix" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn delay={0}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>02 — The Fix</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 20 }}>
              One OS.<br />Everything replaced.
            </h2>
            <p style={{ fontFamily: inter, fontSize: 16, color: "#555", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              BlackRoad OS isn't another SaaS tool. It's the operating system that replaces your entire stack with infrastructure you actually own.
            </p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8 }}>
          {fixes.map((f, i) => <FixCard key={f.title} {...f} delay={i * 70} />)}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────
function HowItWorks() {
  const w = useWidth();

  const steps = [
    { num: "01", color: "#FF6B2B", title: "Deploy the OS", body: "One command spins up your sovereign stack — compute nodes, DNS, storage, AI models, git hosting. Everything on your hardware or your VPS." },
    { num: "02", color: "#FF2255", title: "Connect Your Fleet", body: "WireGuard mesh links all your devices. Raspberry Pis, cloud VPS, your laptop — one encrypted network. Every node contributes compute." },
    { num: "03", color: "#CC00AA", title: "Meet Your Agents", body: "Lucidia (memory), Cece (orchestration), Sentinel (security), Eve (intelligence) — AI agents that know your stack, remember your decisions, and work 24/7." },
    { num: "04", color: "#8844FF", title: "Build & Ship", body: "Push to your own git. CI/CD runs on your runners. Sites deploy to your edge. Billing through your payment system. The entire pipeline is yours." },
    { num: "05", color: "#4488FF", title: "Scale Sovereign", body: "Add a Pi, add a VPS, add a node. The mesh grows. Your agents distribute. Your capacity expands. No pricing tier upgrades. No permission from anyone." },
  ];

  return (
    <section id="how-it-works" style={{ padding: w < 480 ? "80px 20px" : "120px 40px", borderTop: "1px solid #0d0d0d", background: "#030303" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>03 — How It Works</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>
              Five steps to<br />sovereignty.
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 80}>
              <div style={{ display: "flex", gap: w < 480 ? 16 : 32, padding: "32px 0", borderBottom: i < steps.length - 1 ? "1px solid #0d0d0d" : "none", alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 48 }}>
                  <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 32, background: `linear-gradient(135deg, ${s.color}, ${s.color}88)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.num}</div>
                  <div style={{ width: 2, height: 24, background: s.color + "33", marginTop: 8, marginLeft: 14 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 20, color: "#ebebeb", letterSpacing: "-0.02em", marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontFamily: inter, fontSize: 15, color: "#505050", lineHeight: 1.7 }}>{s.body}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── The Stack (visual comparison) ────────────────────────────────
function TheStack() {
  const w = useWidth();

  const before = [
    { name: "GitHub", cost: "$21/user/mo" },
    { name: "Slack", cost: "$12.50/user/mo" },
    { name: "Notion", cost: "$10/user/mo" },
    { name: "Vercel", cost: "$20/user/mo" },
    { name: "AWS", cost: "$2K-50K/mo" },
    { name: "OpenAI API", cost: "$500-5K/mo" },
    { name: "Cloudflare", cost: "$25-200/mo" },
    { name: "Linear", cost: "$8/user/mo" },
    { name: "Stripe", cost: "2.9% + $0.30" },
  ];

  const after = [
    { name: "RoadCode (Git)", color: "#FF6B2B" },
    { name: "RoundTrip (Chat)", color: "#FF2255" },
    { name: "RoadWork (Docs)", color: "#CC00AA" },
    { name: "Caddy (Edge)", color: "#8844FF" },
    { name: "Pi Fleet (Compute)", color: "#4488FF" },
    { name: "Lucidia (AI)", color: "#00D4FF" },
    { name: "PowerDNS (DNS)", color: "#FF6B2B" },
    { name: "RoadPay (Billing)", color: "#FF2255" },
    { name: "WireGuard (Network)", color: "#CC00AA" },
  ];

  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>04 — The Stack</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(28px, 6vw, 48px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>
              Their stack vs. yours.
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: w >= 700 ? "1fr 48px 1fr" : "1fr", gap: w < 700 ? 24 : 0, alignItems: "start" }}>
          <FadeIn delay={0} dir="left">
            <div style={{ background: "#050505", border: "1px solid #0d0d0d", padding: "24px 24px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: "#252525", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20 }}>Before — SaaS Stack</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {before.map(b => (
                  <div key={b.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 1, background: "#1a1a1a" }} />
                      <span style={{ fontFamily: inter, fontSize: 13, color: "#2a2a2a" }}>{b.name}</span>
                    </div>
                    <span style={{ fontFamily: mono, fontSize: 11, color: "#1a1a1a" }}>{b.cost}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #0d0d0d", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: "#2a2a2a" }}>Total (50 users)</span>
                <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#2a2a2a" }}>$7K-55K/mo</span>
              </div>
            </div>
          </FadeIn>

          {w >= 700 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", paddingTop: 40 }}>
              <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 20, color: "#1a1a1a" }}>vs</div>
            </div>
          )}

          <FadeIn delay={120} dir="right">
            <div style={{ background: "#070707", border: "1px solid #1e1e1e", padding: "24px 24px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20 }}>After — BlackRoad OS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {after.map(a => (
                  <div key={a.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />
                      <span style={{ fontFamily: inter, fontSize: 13, color: "#c0c0c0" }}>{a.name}</span>
                    </div>
                    <span style={{ fontFamily: mono, fontSize: 11, color: "#444" }}>self-hosted</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: "#666" }}>Total (unlimited)</span>
                <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>$0/mo</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Why Now ──────────────────────────────────────────────────────
function WhyNow() {
  const w = useWidth();

  const reasons = [
    { color: "#FF6B2B", title: "Hardware got cheap", body: "A $75 Raspberry Pi 5 runs a full AI inference stack. Five of them outperform a $500/mo cloud bill. The economics flipped." },
    { color: "#FF2255", title: "AI models went local", body: "Llama, Qwen, Mistral — open-weight models that run on your hardware. You don't need OpenAI's servers anymore." },
    { color: "#CC00AA", title: "Self-hosting matured", body: "Gitea, Caddy, WireGuard, MinIO, PowerDNS — every cloud service has a self-hosted equivalent that actually works now." },
    { color: "#8844FF", title: "The cloud bill is unsustainable", body: "Enterprise SaaS spend hit $200B in 2025. Per-seat pricing is a tax on growth. Companies are looking for the exit." },
  ];

  return (
    <section id="why-now" style={{ padding: w < 480 ? "80px 20px" : "120px 40px", borderTop: "1px solid #0d0d0d", background: "#030303" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>05 — Why Now</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>
              The window<br />is open.
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: w >= 600 ? "1fr 1fr" : "1fr", gap: 8 }}>
          {reasons.map((r, i) => (
            <FadeIn key={r.title} delay={i * 80}>
              <div style={{ background: "#060606", border: "1px solid #141414", padding: "28px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: r.color }} />
                <div style={{ paddingLeft: 16 }}>
                  <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#ebebeb", letterSpacing: "-0.02em", marginBottom: 10 }}>{r.title}</div>
                  <div style={{ fontFamily: inter, fontSize: 14, color: "#505050", lineHeight: 1.7 }}>{r.body}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Organization Map ─────────────────────────────────────────────
function OrgMap() {
  const w = useWidth();
  const cols = w >= 900 ? "repeat(4,1fr)" : w >= 580 ? "repeat(3,1fr)" : w >= 400 ? "repeat(2,1fr)" : "1fr";

  const orgs = [
    { name: "OS Inc", desc: "Parent org & data layer", color: "#FF6B2B" },
    { name: "OS", desc: "Coordinates all orgs", color: "#FF2255" },
    { name: "Studio", desc: "Creative tools & media", color: "#CC00AA" },
    { name: "AI", desc: "Models & inference", color: "#8844FF" },
    { name: "Labs", desc: "Research & experiments", color: "#4488FF" },
    { name: "Cloud", desc: "Infrastructure & compute", color: "#00D4FF" },
    { name: "Security", desc: "Auth, audit, compliance", color: "#FF6B2B" },
    { name: "Education", desc: "Learning & tutoring", color: "#FF2255" },
    { name: "Interactive", desc: "Games & spatial", color: "#CC00AA" },
    { name: "Media", desc: "Publishing & content", color: "#8844FF" },
    { name: "Hardware", desc: "Devices & fleet", color: "#4488FF" },
    { name: "Gov", desc: "Governance protocol", color: "#00D4FF" },
    { name: "Foundation", desc: "Community & grants", color: "#FF6B2B" },
    { name: "Ventures", desc: "Investments & partners", color: "#FF2255" },
    { name: "Archive", desc: "History & preservation", color: "#CC00AA" },
    { name: "Blackbox", desc: "Enterprise mesh", color: "#8844FF" },
  ];

  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>06 — The Organization</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(28px, 6vw, 48px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 20 }}>
              16 verticals.<br />One source of truth.
            </h2>
            <p style={{ fontFamily: inter, fontSize: 15, color: "#555", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              Every organization has a <span style={{ fontFamily: mono, fontSize: 13, color: "#666" }}>source-code</span> repo. Every repo feeds downstream. Turtles all the way down.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 6 }}>
          {orgs.map((o, i) => (
            <FadeIn key={o.name} delay={i * 40}>
              <div style={{ background: "#060606", border: "1px solid #111", padding: "16px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: o.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 13, color: "#c0c0c0", letterSpacing: "-0.01em" }}>{o.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 9, color: "#333", marginTop: 2 }}>{o.desc}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────
function CTA() {
  const w = useWidth();
  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "120px 40px", borderTop: "1px solid #0d0d0d", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(136,68,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FadeIn>
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>Pave Tomorrow</div>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(34px, 8vw, 68px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24 }}>
            Stop renting.<br />Start owning.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 44 }}>
            BlackRoad OS is the operating system for organizations that refuse to be tenants. Sovereign compute, persistent AI, and a stack that's actually yours.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://blackroad.io" style={{
              fontFamily: inter, fontWeight: 600, fontSize: 15,
              padding: "14px 36px",
              background: GRAD, backgroundSize: "200% 100%",
              border: "none", color: "#fff", cursor: "pointer",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(136,68,255,0.2)",
            }}>Get BlackRoad OS</a>
            <a href="https://github.com/BlackRoad-OS-Inc" style={{
              fontFamily: inter, fontWeight: 600, fontSize: 15,
              padding: "14px 32px",
              background: "transparent",
              border: "1px solid #2a2a2a",
              color: "#a0a0a0",
              cursor: "pointer",
              textDecoration: "none",
            }}>View Source Code</a>
          </div>
          <div style={{ marginTop: 40, fontFamily: mono, fontSize: 10, color: "#252525" }}>
            BlackRoad OS, Inc. — Delaware C-Corp — Pave Tomorrow.
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────
function Footer() {
  const w = useWidth();
  return (
    <footer style={{ borderTop: "1px solid #0d0d0d", padding: w < 480 ? "40px 20px 32px" : "48px 40px 36px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ height: 1, background: GRAD, marginBottom: 40, opacity: 0.4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map(c => <div key={c} style={{ width: 2, height: 14, background: c, borderRadius: 2 }} />)}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb", letterSpacing: "-0.03em" }}>BlackRoad</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#252525" }}>Pave Tomorrow.</div>
          </div>
          <div style={{ display: "flex", gap: w < 480 ? 20 : 40, flexWrap: "wrap" }}>
            {["blackroad.io","blackroadinc.us","blackroadai.com","lucidia.earth","roadchain.io"].map(l => (
              <a key={l} href={`https://${l}`} style={{ fontFamily: inter, fontSize: 12, color: "#353535", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#888"}
                onMouseLeave={e => e.target.style.color = "#353535"}
              >{l}</a>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>© 2026 BlackRoad OS, Inc. All rights reserved.</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>Remember the Road. Pave Tomorrow.</div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadWhatIs() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }

        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50%       { opacity: 0.45; transform: scaleY(0.65); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-30px) scale(1.08); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(20px) scale(0.94); }
        }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#f0f0f0", overflowX: "hidden", width: "100%" }}>
        <Nav />
        <Hero />
        <TheProblem />
        <Marquee />
        <TheFix />
        <HowItWorks />
        <TheStack />
        <WhyNow />
        <OrgMap />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
