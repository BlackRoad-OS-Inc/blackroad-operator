import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const SERVICES = [
  { name: "app.blackroad.io", layer: "Experience", status: "operational", latency: "34ms", uptime: 99.97, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.5,1] },
  { name: "api.blackroad.io", layer: "Experience", status: "operational", latency: "12ms", uptime: 99.99, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: "ws.blackroad.io", layer: "Experience", status: "operational", latency: "8ms", uptime: 99.98, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: "console.blackroad.io", layer: "Experience", status: "operational", latency: "41ms", uptime: 99.95, history: [1,1,1,1,1,1,1,1,1,1,1,1,0.5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: "docs.blackroad.io", layer: "Experience", status: "operational", latency: "22ms", uptime: 100, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: "id.blackroad.io", layer: "Experience", status: "operational", latency: "18ms", uptime: 99.99, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: "app.lucidia.earth", layer: "Experience", status: "operational", latency: "38ms", uptime: 99.96, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.5,1,1,1,1,1,1,1,1,1] },
  { name: "ledger.blackroad.systems", layer: "Governance", status: "operational", latency: "18ms", uptime: 99.99, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: "policies.blackroad.systems", layer: "Governance", status: "operational", latency: "14ms", uptime: 99.99, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: "mesh.blackroad.network", layer: "Infrastructure", status: "operational", latency: "22ms", uptime: 99.95, history: [1,1,1,1,1,1,1,1,0.5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: "vectors.blackroad.systems", layer: "Data", status: "degraded", latency: "89ms", uptime: 99.84, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.5,0.5,1,0,0.5] },
  { name: "db.blackroad.systems", layer: "Data", status: "operational", latency: "6ms", uptime: 99.99, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: "cache.blackroad.systems", layer: "Data", status: "operational", latency: "2ms", uptime: 100, history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
];

const INCIDENTS = [
  {
    date: "Mar 6, 2026", title: "Elevated latency on vector database",
    status: "investigating", severity: "minor",
    updates: [
      { time: "14:45 UTC", text: "Investigating elevated p99 latency on vectors.blackroad.systems. Currently at 89ms, normal baseline is 22ms." },
      { time: "14:32 UTC", text: "Monitoring triggered alert for vector database response times. Auto-scaling initiated." },
    ],
  },
  {
    date: "Mar 2, 2026", title: "Brief connectivity issue on mesh.na1",
    status: "resolved", severity: "minor",
    updates: [
      { time: "16:22 UTC", text: "Resolved. Root cause: BGP route flap from upstream provider. Failover to secondary path completed in 47 seconds." },
      { time: "16:14 UTC", text: "Latency spike detected on NA1 mesh cluster. Auto-scaling triggered. Investigating." },
    ],
  },
  {
    date: "Feb 24, 2026", title: "Scheduled maintenance — database migration",
    status: "resolved", severity: "maintenance",
    updates: [
      { time: "04:00 UTC", text: "Migration complete. All services verified operational. Zero downtime achieved via rolling migration." },
      { time: "02:00 UTC", text: "Beginning scheduled database migration. Rolling migration — no expected downtime." },
    ],
  },
  {
    date: "Feb 18, 2026", title: "Console intermittent 502 errors",
    status: "resolved", severity: "minor",
    updates: [
      { time: "11:40 UTC", text: "Resolved. Prism Console pod restarted successfully. Root cause: memory leak in chart rendering module. Patch deployed." },
      { time: "11:12 UTC", text: "Reports of intermittent 502 errors on console.blackroad.io. Investigating pod health." },
    ],
  },
];

const REGIONS = [
  { id: "NA1", name: "North America", nodes: 412, latency: "12ms", status: "operational" },
  { id: "EU1", name: "Europe", nodes: 238, latency: "28ms", status: "operational" },
  { id: "AP1", name: "Asia Pacific", nodes: 197, latency: "34ms", status: "operational" },
];

function StatusDot({ status, size = 6 }) {
  const color = status === "operational" ? "#a3a3a3" : status === "degraded" ? "#737373" : "#404040";
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

function UptimeBar({ history }) {
  return (
    <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 24 }}>
      {history.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: "100%", borderRadius: 1, minWidth: 2,
          background: v === 1 ? "#1a1a1a" : v >= 0.5 ? "#333" : "#525252",
        }} title={`Day ${i + 1}: ${v === 1 ? "100%" : v === 0 ? "outage" : "degraded"}`} />
      ))}
    </div>
  );
}

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
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginLeft: 4 }}>Status</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a href="#incidents" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Incidents</a>
        <a href="#mesh" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Mesh</a>
      </div>
    </nav>
  );
}

function OverallStatus() {
  const allOperational = SERVICES.every((s) => s.status === "operational");
  const degradedCount = SERVICES.filter((s) => s.status === "degraded").length;

  return (
    <section style={{ padding: "56px 20px 48px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {COLORS.map((c) => <div key={c} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />)}
          </div>
          System Status
        </div>

        <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, padding: "28px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <StatusDot status={allOperational ? "operational" : "degraded"} size={10} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#f5f5f5", marginBottom: 4 }}>
              {allOperational ? "All Systems Operational" : `${degradedCount} Service${degradedCount > 1 ? "s" : ""} Degraded`}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040" }}>
              Last checked 12 seconds ago · {SERVICES.length} services monitored
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginTop: 12 }}>
          {[
            { label: "Overall Uptime", value: "99.97%" },
            { label: "Avg Latency", value: "23ms" },
            { label: "Active Incidents", value: INCIDENTS.filter((i) => i.status !== "resolved").length.toString() },
            { label: "Mesh Regions", value: `${REGIONS.length} online` },
          ].map((s) => (
            <div key={s.label} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const layers = ["Experience", "Governance", "Infrastructure", "Data"];
  const layerColors = { Experience: COLORS[0], Governance: COLORS[2], Infrastructure: COLORS[3], Data: COLORS[5] };

  return (
    <section style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 24 }}>
          Services
        </div>

        {layers.map((layer) => {
          const layerServices = SERVICES.filter((s) => s.layer === layer);
          if (layerServices.length === 0) return null;
          return (
            <div key={layer} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 3, height: 14, borderRadius: 1, background: layerColors[layer] }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: "#d4d4d4" }}>{layer}</span>
              </div>

              <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
                {layerServices.map((s, i) => (
                  <div key={s.name} style={{
                    padding: "14px 18px",
                    borderBottom: i < layerServices.length - 1 ? "1px solid #141414" : "none",
                  }}>
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <StatusDot status={s.status} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#d4d4d4", flex: "1 1 180px", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040", width: 50 }}>{s.latency}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: s.status === "operational" ? "#525252" : "#737373", width: 56, textAlign: "right" }}>{s.uptime}%</span>
                    </div>
                    {/* Uptime bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#262626", flexShrink: 0 }}>30d</span>
                      <div style={{ flex: 1 }}>
                        <UptimeBar history={s.history} />
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#262626", flexShrink: 0 }}>now</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
          {[
            { color: "#1a1a1a", label: "Operational" },
            { color: "#333", label: "Degraded" },
            { color: "#525252", label: "Outage" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 8, borderRadius: 1, background: l.color }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MeshSection() {
  return (
    <section id="mesh" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 24 }}>
          Mesh Regions
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {REGIONS.map((r, i) => (
            <div key={r.id} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: COLORS[i * 2] }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <StatusDot status={r.status} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5" }}>{r.id}</span>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", marginBottom: 14 }}>{r.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2a2a2a", marginBottom: 3 }}>NODES</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#a3a3a3" }}>{r.nodes}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2a2a2a", marginBottom: 3 }}>LATENCY</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#a3a3a3" }}>{r.latency}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IncidentsSection() {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const severityStyles = {
    minor: { color: "#525252", bg: "#131313", border: "#1a1a1a" },
    major: { color: "#737373", bg: "#171717", border: "#262626" },
    maintenance: { color: "#404040", bg: "#0f0f0f", border: "#1a1a1a" },
  };

  return (
    <section id="incidents" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 24 }}>
          Incidents
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {INCIDENTS.map((inc, i) => {
            const sty = severityStyles[inc.severity];
            return (
              <div key={i} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
                <button
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  style={{
                    width: "100%", textAlign: "left", cursor: "pointer",
                    background: "none", border: "none", padding: "16px 18px",
                    display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 500,
                        color: inc.status === "resolved" ? "#333" : "#737373",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        background: inc.status === "resolved" ? "#0f0f0f" : "#1a1a1a",
                        padding: "3px 8px", borderRadius: 3,
                        border: `1px solid ${inc.status === "resolved" ? "#1a1a1a" : "#262626"}`,
                      }}>
                        {inc.status}
                      </span>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                        color: "#333", textTransform: "uppercase",
                      }}>
                        {inc.severity}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500, color: inc.status === "resolved" ? "#737373" : "#d4d4d4" }}>
                      {inc.title}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, paddingTop: 4 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333" }}>{inc.date}</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#333",
                      transform: expandedIdx === i ? "rotate(45deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}>+</span>
                  </div>
                </button>

                {expandedIdx === i && (
                  <div style={{ padding: "0 18px 18px" }}>
                    <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 14 }}>
                      {inc.updates.map((u, ui) => (
                        <div key={ui} style={{ display: "flex", gap: 14, padding: "8px 0", borderBottom: ui < inc.updates.length - 1 ? "1px solid #111" : "none" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", flexShrink: 0, width: 70 }}>{u.time}</span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", lineHeight: 1.5 }}>{u.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SubscribeSection() {
  return (
    <section style={{ padding: "48px 20px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <GradientBar height={1} style={{ marginBottom: 40, opacity: 0.4 }} />
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 12 }}>
          Get notified when things change.
        </h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.6, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
          Subscribe to status updates via email. We only send when something actually happens.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", maxWidth: 400, margin: "0 auto" }}>
          <input
            type="email" placeholder="you@example.com"
            style={{
              flex: "1 1 200px", minWidth: 0, background: "#131313", border: "1px solid #1a1a1a",
              color: "#f5f5f5", fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
              padding: "12px 16px", borderRadius: 8, outline: "none",
            }}
          />
          <button style={{
            fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
            color: "#0a0a0a", background: "#f5f5f5", border: "none",
            padding: "12px 24px", borderRadius: 8, cursor: "pointer", flexShrink: 0,
          }}>
            Subscribe
          </button>
        </div>
      </div>
    </section>
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
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: "#a3a3a3" }}>BlackRoad Status</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>
              status.blackroad.io · Powered by BlackRoad Beacon
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Home", "Docs", "API", "GitHub"].map((link) => (
              <a key={link} href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252", textDecoration: "none" }}>{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function StatusPage() {
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
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <GradientBar />
        <Nav />
        <OverallStatus />
        <GradientBar />
        <ServicesSection />
        <MeshSection />
        <IncidentsSection />
        <SubscribeSection />
        <Footer />
      </div>
    </>
  );
}
