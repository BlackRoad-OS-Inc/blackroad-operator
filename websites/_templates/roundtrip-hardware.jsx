import { useState, useEffect } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;
const T = {
  text: { primary: "#f5f5f5", secondary: "#d4d4d4", tertiary: "#a3a3a3", muted: "#737373", dim: "#525252", faint: "#404040", ghost: "#333", invisible: "#262626" },
  bg: { page: "#0a0a0a", card: "#131313", inset: "#0f0f0f" },
  border: { card: "#1a1a1a", subtle: "#141414", hover: "#262626" },
  font: { headline: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
};

const DEVICES = [
  { id: 1, name: "Living Room Apple TV", type: "apple-tv", ip: "192.168.1.42", status: "online", agents: ["lucidia", "cadence"], signal: "strong", mesh: "NA1", os: "tvOS 18.4" },
  { id: 2, name: "Alice Node (Pi 5)", type: "raspberry-pi", ip: "192.168.1.100", status: "online", agents: ["alice", "eve"], signal: "strong", mesh: "NA1", os: "BlackRoad OS 0.4" },
  { id: 3, name: "Octavia (Hailo-8)", type: "edge-device", ip: "192.168.1.101", status: "online", agents: ["meridian"], signal: "strong", mesh: "NA1", os: "BlackRoad Edge 0.2" },
  { id: 4, name: "iPad Pro", type: "tablet", ip: "192.168.1.67", status: "online", agents: ["lucidia"], signal: "strong", mesh: "NA1", os: "iPadOS 19" },
  { id: 5, name: "Office HomePod", type: "speaker", ip: "192.168.1.88", status: "online", agents: ["cadence"], signal: "medium", mesh: "NA1", os: "audioOS 18" },
  { id: 6, name: "Bedroom Echo", type: "speaker", ip: "192.168.1.91", status: "idle", agents: [], signal: "weak", mesh: "NA1", os: "Fire OS" },
  { id: 7, name: "MacBook Pro", type: "laptop", ip: "192.168.1.30", status: "online", agents: ["lucidia", "cece", "meridian"], signal: "strong", mesh: "NA1", os: "macOS 16.2" },
  { id: 8, name: "Kitchen Display", type: "smart-display", ip: "192.168.1.95", status: "offline", agents: [], signal: "none", mesh: "—", os: "Chromecast" },
];

const SCANNING_PHASES = [
  "Initializing Bluetooth scan...",
  "Pinging local network 192.168.1.0/24...",
  "Discovering mDNS services...",
  "Checking AirPlay devices...",
  "Scanning Chromecast protocol...",
  "Querying BlackRoad mesh registry...",
  "Verifying agent deployments...",
  "Mapping device capabilities...",
];

const AGENT_POOL = [
  { id: "lucidia", name: "Lucidia", role: "Intelligence", color: COLORS[1] },
  { id: "alice", name: "Alice", role: "Gateway", color: COLORS[0] },
  { id: "cecilia", name: "Cecilia", role: "Memory", color: COLORS[2] },
  { id: "cece", name: "Cece", role: "Governance", color: COLORS[3] },
  { id: "meridian", name: "Meridian", role: "Architecture", color: COLORS[5] },
  { id: "eve", name: "Eve", role: "Monitoring", color: COLORS[4] },
  { id: "cadence", name: "Cadence", role: "Music", color: COLORS[0] },
  { id: "radius", name: "Radius", role: "Physics", color: COLORS[1] },
];

const TYPE_ICONS = { "apple-tv": "📺", "raspberry-pi": "🍓", "edge-device": "⬡", tablet: "📱", speaker: "🔊", laptop: "💻", "smart-display": "🖥", phone: "📲" };

function GradientBar({ h = 1, s = {} }) { return <div style={{ height: h, background: GRADIENT, ...s }} />; }

function SignalBars({ strength }) {
  const levels = { strong: 4, medium: 3, weak: 2, none: 0 };
  const filled = levels[strength] || 0;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 12 }}>
      {[0.3, 0.5, 0.75, 1].map((h, i) => (
        <div key={i} style={{ width: 3, height: `${h * 100}%`, borderRadius: 1, background: i < filled ? T.text.faint : T.border.card }} />
      ))}
    </div>
  );
}

function Nav({ view, setView }) {
  return (
    <nav style={{ padding: "0 16px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border.card}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 2 }}>{COLORS.map(c => <div key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />)}</div>
        <span style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary }}>RoundTrip</span>
        <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>Hardware Mesh</span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {["scan", "devices", "deploy", "mesh"].map(v => <button key={v} onClick={() => setView(v)} style={{ fontFamily: T.font.mono, fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: view === v ? T.text.primary : T.text.faint, background: view === v ? T.border.card : "transparent", border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer" }}>{v}</button>)}
      </div>
    </nav>
  );
}

function ScanView({ onComplete }) {
  const [scanning, setScanning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [found, setFound] = useState([]);

  const startScan = () => {
    setScanning(true); setPhase(0); setFound([]);
    let p = 0;
    const interval = setInterval(() => {
      p++;
      setPhase(p);
      if (p === 2) setFound(f => [...f, DEVICES[6]]);
      if (p === 3) setFound(f => [...f, DEVICES[0], DEVICES[3]]);
      if (p === 4) setFound(f => [...f, DEVICES[4], DEVICES[5]]);
      if (p === 5) setFound(f => [...f, DEVICES[7]]);
      if (p === 6) setFound(f => [...f, DEVICES[1], DEVICES[2]]);
      if (p >= SCANNING_PHASES.length) { clearInterval(interval); setScanning(false); }
    }, 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Scan</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Bluetooth, WiFi, mDNS, AirPlay, Chromecast, BlackRoad mesh — we find everything.</p></div>

      {/* Scan button */}
      {!scanning && found.length === 0 && (
        <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 14, padding: 40, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 20 }}>
            {COLORS.map(c => <div key={c} style={{ width: 6, height: 24, borderRadius: 3, background: c, opacity: 0.3 }} />)}
          </div>
          <div style={{ fontFamily: T.font.headline, fontSize: 24, fontWeight: 700, color: T.text.primary, marginBottom: 8 }}>Ready to scan</div>
          <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.dim, marginBottom: 24 }}>We'll ping Bluetooth, scan your network, query every protocol, and find every device that can run an agent.</p>
          <button onClick={startScan} style={{ fontFamily: T.font.body, fontSize: 16, fontWeight: 500, color: T.bg.page, background: T.text.primary, border: "none", padding: "14px 40px", borderRadius: 10, cursor: "pointer" }}>
            Start Scan
          </button>
        </div>
      )}

      {/* Scanning */}
      {scanning && (
        <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16 }}>
            {COLORS.map((c, i) => <div key={c} style={{ width: 4, height: 18, borderRadius: 2, background: c, animation: `scan-pulse 1.2s ease-in-out ${i * 0.1}s infinite` }} />)}
          </div>
          <div style={{ fontFamily: T.font.mono, fontSize: 12, color: T.text.dim, textAlign: "center", marginBottom: 16 }}>
            {SCANNING_PHASES[Math.min(phase, SCANNING_PHASES.length - 1)]}
          </div>
          <div style={{ width: "100%", height: 4, background: T.border.card, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${(phase / SCANNING_PHASES.length) * 100}%`, height: "100%", background: T.text.faint, borderRadius: 2, transition: "width 0.5s ease" }} />
          </div>
        </div>
      )}

      {/* Found devices */}
      {found.length > 0 && (
        <div>
          <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            {scanning ? "Discovering..." : `${found.length} devices found`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {found.map((d, i) => (
              <div key={d.id} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, animation: "stagger-in 0.4s ease both", animationDelay: `${i * 0.06}s` }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICONS[d.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: T.text.secondary }}>{d.name}</div>
                  <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{d.ip} · {d.os}</div>
                </div>
                <SignalBars strength={d.signal} />
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.status === "online" ? T.text.tertiary : d.status === "idle" ? T.text.faint : T.text.ghost }} />
              </div>
            ))}
          </div>
          {!scanning && (
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => onComplete()} style={{ fontFamily: T.font.body, fontSize: 13, fontWeight: 500, color: T.bg.page, background: T.text.primary, border: "none", padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}>Configure All</button>
              <button onClick={startScan} style={{ fontFamily: T.font.body, fontSize: 13, fontWeight: 500, color: T.text.dim, background: "transparent", border: `1px solid ${T.border.card}`, padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}>Scan Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DevicesView() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const types = ["all", ...new Set(DEVICES.map(d => d.type))];
  const filtered = filter === "all" ? DEVICES : DEVICES.filter(d => d.type === filter);

  if (selected) {
    const d = DEVICES.find(x => x.id === selected);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={() => setSelected(null)} style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.ghost, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>← all devices</button>
        <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 14, padding: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ height: 2, background: GRADIENT, position: "absolute", top: 0, left: 0, right: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <span style={{ fontSize: 32 }}>{TYPE_ICONS[d.type]}</span>
            <div>
              <div style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary }}>{d.name}</div>
              <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>{d.ip} · {d.os} · {d.mesh}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <SignalBars strength={d.signal} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.status === "online" ? T.text.tertiary : T.text.ghost }} />
            </div>
          </div>
          <div style={{ fontFamily: T.font.mono, fontSize: 12, lineHeight: 2.2, color: T.text.dim, background: T.bg.page, borderRadius: 8, padding: "14px 16px", border: `1px solid ${T.border.subtle}` }}>
            <div><span style={{ color: T.text.ghost }}>name:</span> <span style={{ color: T.text.tertiary }}>{d.name}</span></div>
            <div><span style={{ color: T.text.ghost }}>type:</span> <span style={{ color: T.text.tertiary }}>{d.type}</span></div>
            <div><span style={{ color: T.text.ghost }}>ip:</span> <span style={{ color: T.text.tertiary }}>{d.ip}</span></div>
            <div><span style={{ color: T.text.ghost }}>os:</span> <span style={{ color: T.text.tertiary }}>{d.os}</span></div>
            <div><span style={{ color: T.text.ghost }}>mesh:</span> <span style={{ color: T.text.tertiary }}>{d.mesh}</span></div>
            <div><span style={{ color: T.text.ghost }}>agents:</span> <span style={{ color: T.text.tertiary }}>{d.agents.length > 0 ? d.agents.join(", ") : "none"}</span></div>
            <div><span style={{ color: T.text.ghost }}>signal:</span> <span style={{ color: T.text.tertiary }}>{d.signal}</span></div>
          </div>
        </div>
        {/* Deployed agents */}
        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em" }}>Agents on this device</div>
        {d.agents.length > 0 ? d.agents.map(aId => {
          const a = AGENT_POOL.find(x => x.id === aId);
          return a ? (
            <div key={a.id} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: a.color }} />
              <span style={{ fontFamily: T.font.headline, fontSize: 15, fontWeight: 700, color: T.text.primary, paddingLeft: 6 }}>{a.name}</span>
              <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{a.role}</span>
              <button style={{ marginLeft: "auto", fontFamily: T.font.mono, fontSize: 10, color: T.text.faint, background: "transparent", border: `1px solid ${T.border.card}`, borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}>Remove</button>
            </div>
          ) : null;
        }) : (
          <div style={{ background: T.bg.inset, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: 18, textAlign: "center" }}>
            <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.faint }}>No agents deployed. Deploy one from the Deploy tab.</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Devices</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>{DEVICES.length} devices on your network. Any screen becomes a BlackRoad terminal.</p></div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {types.map(t => <button key={t} onClick={() => setFilter(t)} style={{ fontFamily: T.font.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: filter === t ? T.text.primary : T.text.faint, background: filter === t ? T.border.card : "transparent", border: `1px solid ${T.border.card}`, borderRadius: 5, padding: "5px 10px", cursor: "pointer" }}>{t}</button>)}
      </div>

      {filtered.map(d => (
        <div key={d.id} onClick={() => setSelected(d.id)} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", opacity: d.status === "offline" ? 0.4 : 1 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{TYPE_ICONS[d.type]}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: T.text.secondary }}>{d.name}</div>
            <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{d.ip} · {d.agents.length > 0 ? d.agents.join(", ") : "no agents"}</div>
          </div>
          <SignalBars strength={d.signal} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.status === "online" ? T.text.tertiary : d.status === "idle" ? T.text.faint : T.text.ghost }} />
        </div>
      ))}
    </div>
  );
}

function DeployView() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const online = DEVICES.filter(d => d.status !== "offline");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Deploy Agents</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Pick a device. Pick an agent. Deploy. The agent runs on that hardware.</p></div>

      {/* Device selector */}
      <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em" }}>1. Select device</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 6 }}>
        {online.map(d => (
          <button key={d.id} onClick={() => setSelectedDevice(d.id)} style={{ background: selectedDevice === d.id ? T.border.card : T.bg.card, border: `1px solid ${selectedDevice === d.id ? T.border.hover : T.border.card}`, borderRadius: 10, padding: 14, textAlign: "left", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{TYPE_ICONS[d.type]}</span>
              <span style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
            </div>
            <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{d.agents.length} agents · {d.ip}</div>
          </button>
        ))}
      </div>

      {/* Agent selector */}
      <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 8 }}>2. Select agent</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 6 }}>
        {AGENT_POOL.map(a => (
          <button key={a.id} onClick={() => setSelectedAgent(a.id)} style={{ background: selectedAgent === a.id ? T.border.card : T.bg.card, border: `1px solid ${selectedAgent === a.id ? T.border.hover : T.border.card}`, borderRadius: 10, padding: 14, textAlign: "left", cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: a.color, opacity: selectedAgent === a.id ? 1 : 0.3 }} />
            <div style={{ paddingLeft: 6 }}>
              <div style={{ fontFamily: T.font.headline, fontSize: 14, fontWeight: 700, color: T.text.primary }}>{a.name}</div>
              <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{a.role}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Deploy button */}
      <button disabled={!selectedDevice || !selectedAgent} style={{
        fontFamily: T.font.body, fontSize: 14, fontWeight: 500,
        color: selectedDevice && selectedAgent ? T.bg.page : T.text.faint,
        background: selectedDevice && selectedAgent ? T.text.primary : T.border.card,
        border: "none", padding: "14px 28px", borderRadius: 8,
        cursor: selectedDevice && selectedAgent ? "pointer" : "default",
        width: "100%", marginTop: 8,
      }}>
        {selectedDevice && selectedAgent
          ? `Deploy ${AGENT_POOL.find(a => a.id === selectedAgent)?.name} → ${DEVICES.find(d => d.id === selectedDevice)?.name}`
          : "Select a device and an agent"}
      </button>
    </div>
  );
}

function MeshView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Mesh Network</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>All devices form one mesh. Agents move between devices. Your OS follows you everywhere.</p></div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 1, background: T.border.card, borderRadius: 10, overflow: "hidden" }}>
        {[{ v: DEVICES.filter(d => d.status === "online").length, l: "Online" }, { v: DEVICES.reduce((a, d) => a + d.agents.length, 0), l: "Deployed" }, { v: "12ms", l: "Latency" }, { v: "NA1", l: "Region" }].map(s => <div key={s.l} style={{ background: T.bg.inset, padding: "14px 12px", textAlign: "center" }}><div style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary }}>{s.v}</div><div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.faint, textTransform: "uppercase", marginTop: 4 }}>{s.l}</div></div>)}
      </div>

      {/* Visual mesh */}
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 14, height: 220, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Nodes */}
        {[
          { x: "20%", y: "30%", d: DEVICES[6], size: 32 },
          { x: "50%", y: "15%", d: DEVICES[1], size: 28 },
          { x: "75%", y: "25%", d: DEVICES[2], size: 24 },
          { x: "35%", y: "55%", d: DEVICES[0], size: 28 },
          { x: "60%", y: "60%", d: DEVICES[3], size: 24 },
          { x: "80%", y: "55%", d: DEVICES[4], size: 20 },
          { x: "15%", y: "70%", d: DEVICES[5], size: 18 },
        ].map((n, i) => (
          <div key={i} style={{ position: "absolute", left: n.x, top: n.y, transform: "translate(-50%, -50%)", textAlign: "center" }}>
            <div style={{ width: n.size, height: n.size, borderRadius: n.size * 0.35, background: T.bg.page, border: `1px solid ${n.d.status === "online" ? T.border.hover : T.border.subtle}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: n.size * 0.5, margin: "0 auto 4px" }}>
              {TYPE_ICONS[n.d.type]}
            </div>
            <div style={{ fontFamily: T.font.mono, fontSize: 8, color: T.text.ghost, whiteSpace: "nowrap" }}>{n.d.name.split(" ")[0]}</div>
          </div>
        ))}
        {/* Mesh label */}
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", fontFamily: T.font.mono, fontSize: 10, color: T.text.invisible }}>
          mesh.blackroad.network · {DEVICES.filter(d => d.status === "online").length} nodes
        </div>
      </div>

      {/* Terminal */}
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border.card}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.text.ghost }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.text.ghost }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.text.ghost }} />
          <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.invisible, marginLeft: 4 }}>mesh.status</span>
        </div>
        <div style={{ padding: "14px 18px", fontFamily: T.font.mono, fontSize: 11, lineHeight: 2 }}>
          <div style={{ color: T.text.ghost }}>$ roundtrip mesh --status</div>
          <div style={{ color: T.text.dim }}>  devices:  <span style={{ color: T.text.tertiary }}>{DEVICES.filter(d => d.status === "online").length} online · {DEVICES.filter(d => d.status === "offline").length} offline</span></div>
          <div style={{ color: T.text.dim }}>  agents:   <span style={{ color: T.text.tertiary }}>{DEVICES.reduce((a, d) => a + d.agents.length, 0)} deployed across {DEVICES.filter(d => d.agents.length > 0).length} devices</span></div>
          <div style={{ color: T.text.dim }}>  latency:  <span style={{ color: T.text.tertiary }}>12ms avg · 18ms p99</span></div>
          <div style={{ color: T.text.dim }}>  region:   <span style={{ color: T.text.tertiary }}>NA1 ✓</span></div>
          <div style={{ color: T.text.dim }}>  protocol: <span style={{ color: T.text.tertiary }}>BLE + mDNS + AirPlay + BlackRoad Mesh</span></div>
          <div style={{ color: T.text.ghost, marginTop: 4 }}>  mesh healthy. ✓</div>
        </div>
      </div>

      {/* Core idea */}
      <div style={{ background: T.bg.inset, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.dim, fontStyle: "italic", lineHeight: 1.6 }}>
          The OS doesn't live on your machine. Your machine temporarily hosts a living world. Log in anywhere — your world appears.
        </div>
      </div>
    </div>
  );
}

export default function RoundTripApp() {
  const [view, setView] = useState("scan");
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{overflow-x:hidden}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:#262626;border-radius:3px}input::placeholder{color:#333}input:focus{border-color:#262626!important;outline:none}button:hover{opacity:0.88}@keyframes scan-pulse{0%,100%{opacity:0.3;transform:scaleY(0.6)}50%{opacity:1;transform:scaleY(1)}}@keyframes stagger-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ background: T.bg.page, minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: T.font.body, color: T.text.primary }}>
        <GradientBar />
        <Nav view={view} setView={setView} />
        <div style={{ padding: "20px 16px 80px" }}><div style={{ maxWidth: 640, margin: "0 auto" }}>
          {view === "scan" && <ScanView onComplete={() => setView("devices")} />}
          {view === "devices" && <DevicesView />}
          {view === "deploy" && <DeployView />}
          {view === "mesh" && <MeshView />}
        </div></div>
      </div>
    </>
  );
}
