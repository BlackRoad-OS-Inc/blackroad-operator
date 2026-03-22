import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const RELEASES = [
  {
    version: "0.4.0", date: "Mar 6, 2026", tag: "latest",
    title: "Prism Console & Mesh Regions",
    summary: "Full operator console with real-time agent monitoring, governance dashboard, and multi-region mesh support.",
    changes: [
      { type: "feature", text: "Prism Console with 5 switchable views — overview, agents, infra, governance, activity" },
      { type: "feature", text: "Mesh regions NA1, EU1, AP1 with per-region latency and node counts" },
      { type: "feature", text: "Real-time agent load monitoring with sparkline visualizations" },
      { type: "feature", text: "Governance dashboard — policy table with eval counts and bypass tracking" },
      { type: "improved", text: "Agent spawn now supports capability arrays and family grouping" },
      { type: "improved", text: "WebSocket connections stable at 2,400+ concurrent on ws.blackroad.io" },
      { type: "fixed", text: "Console memory leak in chart rendering module patched" },
    ],
  },
  {
    version: "0.3.2", date: "Feb 24, 2026", tag: "",
    title: "Database Migration & Auth Hardening",
    summary: "Zero-downtime rolling database migration and improved authentication flows.",
    changes: [
      { type: "improved", text: "Rolling database migration with zero downtime achieved" },
      { type: "improved", text: "OIDC authentication via id.blackroad.io with token refresh" },
      { type: "improved", text: "Session management hardened — JWT rotation every 15 minutes" },
      { type: "fixed", text: "BGP route flap failover reduced from 2m to 47 seconds" },
      { type: "fixed", text: "DNS propagation for edu.blackroad.io and homework.blackroad.io" },
    ],
  },
  {
    version: "0.3.0", date: "Feb 10, 2026", tag: "",
    title: "Governance Spine & Policy Engine",
    summary: "Cece governance engine online with policy evaluation, ledger integrity, and audit trails.",
    changes: [
      { type: "feature", text: "Cece governance engine — policy evaluation with zero-bypass design" },
      { type: "feature", text: "Append-only governance ledger on ledger.blackroad.systems" },
      { type: "feature", text: "Policy DSL for defining scoped access rules (edu.review.teacher-only)" },
      { type: "feature", text: "Audit trail — every evaluation logged with subject, action, resource, decision" },
      { type: "improved", text: "Agent registry now supports capability-based routing" },
      { type: "docs", text: "Governance API documentation published at docs.blackroad.io" },
    ],
  },
  {
    version: "0.2.0", date: "Jan 18, 2026", tag: "",
    title: "Agent Memory & PS-SHA∞",
    summary: "Persistent memory system with cryptographic identity hashing and append-only journals.",
    changes: [
      { type: "feature", text: "PS-SHA∞ identity hash protocol — each agent receives a unique cryptographic identity" },
      { type: "feature", text: "Append-only memory journals with truth state commits" },
      { type: "feature", text: "Memory commit verification — hash chain integrity checks" },
      { type: "feature", text: "Cecilia agent online — dedicated memory management and journal operations" },
      { type: "improved", text: "Agent spawn time reduced from 12s to 1.4s" },
      { type: "improved", text: "Memory event throughput increased to 10K writes/second" },
    ],
  },
  {
    version: "0.1.0", date: "Dec 21, 2025", tag: "",
    title: "Genesis — Core App Shell",
    summary: "First deployment. Lucidia Core with chat, memory, and code execution. The beginning of everything.",
    changes: [
      { type: "feature", text: "Core app shell deployed at app.blackroad.io" },
      { type: "feature", text: "Lucidia Core — chat, reasoning, and code execution" },
      { type: "feature", text: "Auth baseline with role system (user, teacher, admin)" },
      { type: "feature", text: "API gateway live at api.blackroad.io" },
      { type: "feature", text: "Alice gateway agent — request orchestration across mesh" },
      { type: "feature", text: "Eve monitoring agent — basic health checks and alerting" },
      { type: "docs", text: "Initial documentation published at docs.blackroad.io" },
      { type: "docs", text: "Architecture overview — 4 layers, 20 domains, 150+ subdomains mapped" },
    ],
  },
];

const TYPE_STYLES = {
  feature: { label: "New", color: "#f5f5f5", bg: "#1a1a1a" },
  improved: { label: "Improved", color: "#a3a3a3", bg: "#141414" },
  fixed: { label: "Fixed", color: "#737373", bg: "#111" },
  docs: { label: "Docs", color: "#525252", bg: "#0f0f0f" },
};

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function Nav() {
  return (
    <nav style={{
      padding: "0 20px", height: 52,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid #1a1a1a",
    }}>
      <a href="#" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
        <div style={{ display: "flex", gap: 2 }}>
          {COLORS.map((c) => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>BlackRoad</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginLeft: 4 }}>Changelog</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Docs</a>
        <a href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Status</a>
      </div>
    </nav>
  );
}

function ReleaseCard({ release, index, expanded, onToggle }) {
  return (
    <div style={{ display: "flex", gap: 20, paddingBottom: 0 }}>
      {/* Timeline */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0, paddingTop: 4 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: index === 0 ? "#f5f5f5" : "#262626",
          border: index === 0 ? "none" : "1px solid #333",
          flexShrink: 0,
        }} />
        <div style={{ width: 1, flex: 1, background: "#1a1a1a", marginTop: 6 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 32, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#f5f5f5" }}>v{release.version}</span>
          {release.tag && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 500,
              color: "#a3a3a3", background: "#1a1a1a", padding: "3px 8px",
              borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {release.tag}
            </span>
          )}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginLeft: "auto", flexShrink: 0 }}>{release.date}</span>
        </div>

        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#d4d4d4", marginBottom: 8, lineHeight: 1.25 }}>
          {release.title}
        </div>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", lineHeight: 1.6, marginBottom: 16 }}>
          {release.summary}
        </p>

        {/* Expand/collapse */}
        <button
          onClick={onToggle}
          style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040",
            background: "none", border: "1px solid #1a1a1a", borderRadius: 6,
            padding: "6px 14px", cursor: "pointer", marginBottom: expanded ? 14 : 0,
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <span style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.15s ease", display: "inline-block" }}>→</span>
          {expanded ? "Hide" : "Show"} {release.changes.length} changes
        </button>

        {/* Changes list */}
        {expanded && (
          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
            {release.changes.map((c, ci) => {
              const sty = TYPE_STYLES[c.type];
              return (
                <div key={ci} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 16px",
                  borderBottom: ci < release.changes.length - 1 ? "1px solid #141414" : "none",
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 500,
                    color: sty.color, background: sty.bg, padding: "3px 8px",
                    borderRadius: 4, border: "1px solid #1a1a1a",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    flexShrink: 0, minWidth: 58, textAlign: "center", marginTop: 2,
                  }}>
                    {sty.label}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", lineHeight: 1.5 }}>{c.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function VersionNav({ releases, filter, setFilter }) {
  const types = ["all", "feature", "improved", "fixed", "docs"];
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1, background: "#1a1a1a", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        {[
          { value: releases.length, label: "Releases" },
          { value: releases.reduce((a, r) => a + r.changes.filter((c) => c.type === "feature").length, 0), label: "Features" },
          { value: releases.reduce((a, r) => a + r.changes.filter((c) => c.type === "improved").length, 0), label: "Improvements" },
          { value: releases.reduce((a, r) => a + r.changes.filter((c) => c.type === "fixed").length, 0), label: "Fixes" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#131313", padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5" }}>{s.value}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.06em",
            color: filter === t ? "#f5f5f5" : "#404040",
            background: filter === t ? "#1a1a1a" : "transparent",
            border: "1px solid #1a1a1a", borderRadius: 5,
            padding: "5px 12px", cursor: "pointer",
          }}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function SubscribeBar() {
  return (
    <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, padding: "22px 24px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 200px" }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5", marginBottom: 4 }}>Stay updated</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>Get notified when we ship something new.</div>
      </div>
      <div style={{ display: "flex", gap: 8, flex: "1 1 280px" }}>
        <input type="email" placeholder="you@example.com" style={{
          flex: 1, minWidth: 0, background: "#0a0a0a", border: "1px solid #1a1a1a",
          color: "#f5f5f5", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
          padding: "10px 14px", borderRadius: 7, outline: "none",
        }} />
        <button style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
          color: "#0a0a0a", background: "#f5f5f5", border: "none",
          padding: "10px 20px", borderRadius: 7, cursor: "pointer", flexShrink: 0,
        }}>
          Subscribe
        </button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "0 20px 48px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <GradientBar />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {COLORS.map((c) => <div key={c} style={{ width: 3, height: 10, borderRadius: 2, background: c }} />)}
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: "#a3a3a3" }}>BlackRoad OS</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>
              blackroad.io/changelog
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Home", "Docs", "Status", "GitHub"].map((link) => (
              <a key={link} href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252", textDecoration: "none" }}>{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function ChangelogPage() {
  const [filter, setFilter] = useState("all");
  const [expandedVersions, setExpandedVersions] = useState(new Set(["0.4.0"]));

  const toggleExpanded = (version) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) next.delete(version);
      else next.add(version);
      return next;
    });
  };

  const filteredReleases = filter === "all"
    ? RELEASES
    : RELEASES.filter((r) => r.changes.some((c) => c.type === filter)).map((r) => ({
        ...r,
        changes: r.changes.filter((c) => c.type === filter),
      }));

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
        input::placeholder { color: #333; }
        input:focus { border-color: #262626 !important; }
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <GradientBar />
        <Nav />

        {/* Hero */}
        <section style={{ padding: "56px 20px 48px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {COLORS.map((c) => <div key={c} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />)}
              </div>
              Changelog
            </div>

            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 7vw, 48px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
              What we shipped.
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.6, maxWidth: 460, marginBottom: 32 }}>
              Every feature, improvement, and fix across the BlackRoad OS ecosystem. No marketing — just what actually changed.
            </p>

            <SubscribeBar />
          </div>
        </section>

        <GradientBar />

        {/* Releases */}
        <section style={{ padding: "48px 20px 64px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <VersionNav releases={RELEASES} filter={filter} setFilter={setFilter} />

            {filteredReleases.map((r, i) => (
              <ReleaseCard
                key={r.version}
                release={r}
                index={i}
                expanded={expandedVersions.has(r.version)}
                onToggle={() => toggleExpanded(r.version)}
              />
            ))}

            {filteredReleases.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#333" }}>No changes match this filter.</div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
