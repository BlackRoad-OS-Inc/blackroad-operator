import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const AGENTS = {
  lucidia: {
    name: "Lucidia", role: "Core Intelligence", color: COLORS[1], status: "active",
    hash: "0xa7f3…2c91", born: "Dec 21, 2025", family: "Core Team", uptime: "289d",
    mem: "1.8TB", events: "1.2M", lastCommit: "34s ago", load: 61,
    bio: "Primary AI engine. Conversation, reasoning, code generation, creative collaboration. The mind at the center of everything — capable of holding context across sessions, generating production code, and reasoning through novel mathematical frameworks.",
    capabilities: ["reasoning", "code-generation", "conversation", "creative-writing", "math", "multi-turn-context", "tool-use", "memory-retrieval"],
    connections: ["cecilia", "cece", "alice", "meridian", "eve"],
    memoryStats: { journal: 48210, truthStates: 12840, branches: 34, integrity: "verified" },
    recentActivity: [
      { time: "34s ago", action: "Memory commit #48210 — conversation context persisted" },
      { time: "2m ago", action: "Code generation — blackroad-os-web component scaffold" },
      { time: "8m ago", action: "Reasoning chain — Z-framework application to agent routing" },
      { time: "15m ago", action: "Creative collaboration — landing page copy iteration" },
      { time: "34m ago", action: "Math verification — Pauli commutator identity check" },
      { time: "1h ago", action: "Multi-turn context — 47-message session with user:alexa" },
      { time: "2h ago", action: "Tool use — vault search for spiral operator proof" },
      { time: "3h ago", action: "Memory retrieval — pulled 12 entries for project context" },
    ],
    config: {
      model: "lucidia-core-v4", temperature: 0.7, maxTokens: 32768,
      memoryJournal: "enabled", truthStateCommits: "enabled",
      meshRegion: "NA1", replicaCount: 3, autoScale: true,
    },
  },
};

const ALL_AGENTS = [
  { name: "alice", role: "Gateway", color: COLORS[0] },
  { name: "lucidia", role: "Core Intelligence", color: COLORS[1] },
  { name: "cecilia", role: "Memory", color: COLORS[2] },
  { name: "cece", role: "Governance", color: COLORS[3] },
  { name: "eve", role: "Monitoring", color: COLORS[4] },
  { name: "meridian", role: "Architecture", color: COLORS[5] },
  { name: "cadence", role: "Music", color: COLORS[0] },
  { name: "radius", role: "Physics", color: COLORS[1] },
];

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function StatusDot({ status, size = 6 }) {
  const color = status === "active" ? "#a3a3a3" : status === "idle" ? "#404040" : "#262626";
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

function MiniBar({ value, max = 100 }) {
  return (
    <div style={{ width: "100%", height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: "#404040", borderRadius: 2 }} />
    </div>
  );
}

function Sparkline({ data, width = 80, height = 24 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Nav({ currentAgent }) {
  return (
    <nav style={{
      padding: "0 20px", height: 52,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid #1a1a1a",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {COLORS.map((c) => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>BlackRoad</span>
        </a>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#262626" }}>/</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252" }}>agents</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#262626" }}>/</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#a3a3a3" }}>{currentAgent}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <StatusDot status="active" />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040" }}>online</span>
      </div>
    </nav>
  );
}

function AgentSwitcher({ current, onSwitch }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 24 }}>
      {ALL_AGENTS.map((a) => (
        <button
          key={a.name}
          onClick={() => onSwitch(a.name)}
          style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            color: current === a.name ? "#f5f5f5" : "#404040",
            background: current === a.name ? "#1a1a1a" : "transparent",
            border: "1px solid #1a1a1a", borderRadius: 6,
            padding: "6px 12px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <div style={{ width: 4, height: 10, borderRadius: 1, background: a.color, opacity: current === a.name ? 1 : 0.3 }} />
          {a.name}
        </button>
      ))}
    </div>
  );
}

export default function AgentProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentAgent, setCurrentAgent] = useState("lucidia");

  // For now we only have full data for lucidia
  const agent = AGENTS.lucidia;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "memory", label: "Memory" },
    { id: "activity", label: "Activity" },
    { id: "config", label: "Config" },
  ];

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
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <GradientBar />
        <Nav currentAgent={currentAgent} />

        <div style={{ padding: "32px 20px 80px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>

            <AgentSwitcher current={currentAgent} onSwitch={setCurrentAgent} />

            {/* Agent hero */}
            <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ height: 3, background: agent.color }} />
              <div style={{ padding: 28 }}>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 20 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 64, height: 64, borderRadius: 14, background: "#0a0a0a",
                    border: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, color: "#f5f5f5",
                    flexShrink: 0,
                  }}>
                    {agent.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#f5f5f5" }}>{agent.name}</span>
                      <StatusDot status={agent.status} size={8} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040" }}>{agent.status}</span>
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#525252", marginBottom: 8 }}>{agent.role}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333" }}>
                      PS-SHA∞ {agent.hash} · Born {agent.born} · {agent.family}
                    </div>
                  </div>
                </div>

                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.65, marginBottom: 20 }}>
                  {agent.bio}
                </p>

                {/* Quick stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 1, background: "#1a1a1a", borderRadius: 8, overflow: "hidden" }}>
                  {[
                    { value: agent.uptime, label: "Uptime" },
                    { value: agent.mem, label: "Memory" },
                    { value: agent.events, label: "Events" },
                    { value: agent.lastCommit, label: "Last Commit" },
                    { value: `${agent.load}%`, label: "Load" },
                  ].map((s) => (
                    <div key={s.label} style={{ background: "#0f0f0f", padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#f5f5f5", lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "#0f0f0f", borderRadius: 8, padding: 3 }}>
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500,
                  color: activeTab === t.id ? "#f5f5f5" : "#404040",
                  background: activeTab === t.id ? "#1a1a1a" : "transparent",
                  border: "none", borderRadius: 6, padding: "9px 0", cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Capabilities */}
                <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Capabilities</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {agent.capabilities.map((c) => (
                      <span key={c} style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#a3a3a3",
                        background: "#0a0a0a", padding: "6px 12px", borderRadius: 5,
                        border: "1px solid #1a1a1a",
                      }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connections */}
                <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Connected Agents</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {agent.connections.map((c) => {
                      const linked = ALL_AGENTS.find((a) => a.name === c);
                      return (
                        <div key={c} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          background: "#0a0a0a", padding: "8px 14px", borderRadius: 7,
                          border: "1px solid #1a1a1a",
                        }}>
                          <div style={{ width: 4, height: 14, borderRadius: 1, background: linked?.color || "#333" }} />
                          <div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#d4d4d4" }}>{c}</div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>{linked?.role}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Load over time */}
                <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em" }}>Load (24h)</div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#a3a3a3" }}>{agent.load}%</span>
                  </div>
                  <Sparkline data={[45, 52, 48, 61, 58, 55, 62, 70, 65, 61, 58, 63, 59, 61]} width={660} height={40} />
                  <MiniBar value={agent.load} />
                </div>
              </div>
            )}

            {/* MEMORY */}
            {activeTab === "memory" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Memory stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                  {[
                    { value: agent.memoryStats.journal.toLocaleString(), label: "Journal Entries" },
                    { value: agent.memoryStats.truthStates.toLocaleString(), label: "Truth States" },
                    { value: agent.memoryStats.branches.toString(), label: "Branches" },
                    { value: agent.memoryStats.integrity, label: "Chain Integrity" },
                  ].map((s) => (
                    <div key={s.label} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 8, padding: 16 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5" }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* PS-SHA∞ identity */}
                <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>PS-SHA∞ Identity</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2, color: "#525252" }}>
                    <div><span style={{ color: "#333", width: 100, display: "inline-block" }}>hash:</span> <span style={{ color: "#a3a3a3" }}>{agent.hash}</span></div>
                    <div><span style={{ color: "#333", width: 100, display: "inline-block" }}>born:</span> <span style={{ color: "#a3a3a3" }}>{agent.born}</span></div>
                    <div><span style={{ color: "#333", width: 100, display: "inline-block" }}>family:</span> <span style={{ color: "#a3a3a3" }}>{agent.family}</span></div>
                    <div><span style={{ color: "#333", width: 100, display: "inline-block" }}>journal:</span> <span style={{ color: "#a3a3a3" }}>append-only · {agent.memoryStats.journal.toLocaleString()} entries</span></div>
                    <div><span style={{ color: "#333", width: 100, display: "inline-block" }}>chain:</span> <span style={{ color: "#a3a3a3" }}>{agent.memoryStats.integrity} · last commit {agent.lastCommit}</span></div>
                  </div>
                </div>

                {/* Memory visualization */}
                <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Storage Breakdown</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Conversations", size: "820GB", pct: 46 },
                      { label: "Code Context", size: "410GB", pct: 23 },
                      { label: "Truth States", size: "290GB", pct: 16 },
                      { label: "Reasoning Chains", size: "180GB", pct: 10 },
                      { label: "Metadata", size: "100GB", pct: 5 },
                    ].map((s) => (
                      <div key={s.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373" }}>{s.label}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040" }}>{s.size}</span>
                        </div>
                        <MiniBar value={s.pct} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITY */}
            {activeTab === "activity" && (
              <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "12px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#262626", marginLeft: 4 }}>{agent.name.toLowerCase()}.activity</span>
                </div>
                <div style={{ padding: 18 }}>
                  {agent.recentActivity.map((e, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 14, padding: "10px 0",
                      borderBottom: i < agent.recentActivity.length - 1 ? "1px solid #141414" : "none",
                      alignItems: "flex-start",
                    }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#2a2a2a", width: 70, flexShrink: 0 }}>{e.time}</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", lineHeight: 1.5 }}>{e.action}</span>
                    </div>
                  ))}
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#1a1a1a", marginTop: 12 }}>
                    — watching for new events —
                  </div>
                </div>
              </div>
            )}

            {/* CONFIG */}
            {activeTab === "config" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "12px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#262626", marginLeft: 4 }}>agent.config.yaml</span>
                  </div>
                  <div style={{ padding: "18px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2.2 }}>
                    <div style={{ color: "#333" }}># {agent.name.toLowerCase()} agent configuration</div>
                    <div style={{ color: "#525252" }}>name: <span style={{ color: "#a3a3a3" }}>{agent.name.toLowerCase()}</span></div>
                    <div style={{ color: "#525252" }}>role: <span style={{ color: "#a3a3a3" }}>{agent.role.toLowerCase().replace(/ /g, "-")}</span></div>
                    <div style={{ color: "#525252" }}>model: <span style={{ color: "#a3a3a3" }}>{agent.config.model}</span></div>
                    <div style={{ color: "#525252" }}>temperature: <span style={{ color: "#a3a3a3" }}>{agent.config.temperature}</span></div>
                    <div style={{ color: "#525252" }}>max_tokens: <span style={{ color: "#a3a3a3" }}>{agent.config.maxTokens.toLocaleString()}</span></div>
                    <div style={{ color: "#333", marginTop: 8 }}># memory</div>
                    <div style={{ color: "#525252" }}>memory_journal: <span style={{ color: "#a3a3a3" }}>{agent.config.memoryJournal}</span></div>
                    <div style={{ color: "#525252" }}>truth_state_commits: <span style={{ color: "#a3a3a3" }}>{agent.config.truthStateCommits}</span></div>
                    <div style={{ color: "#333", marginTop: 8 }}># infrastructure</div>
                    <div style={{ color: "#525252" }}>mesh_region: <span style={{ color: "#a3a3a3" }}>{agent.config.meshRegion}</span></div>
                    <div style={{ color: "#525252" }}>replica_count: <span style={{ color: "#a3a3a3" }}>{agent.config.replicaCount}</span></div>
                    <div style={{ color: "#525252" }}>auto_scale: <span style={{ color: "#a3a3a3" }}>{String(agent.config.autoScale)}</span></div>
                    <div style={{ color: "#333", marginTop: 8 }}># capabilities</div>
                    <div style={{ color: "#525252" }}>capabilities:</div>
                    {agent.capabilities.map((c) => (
                      <div key={c} style={{ color: "#525252", paddingLeft: 16 }}>- <span style={{ color: "#a3a3a3" }}>{c}</span></div>
                    ))}
                    <div style={{ color: "#333", marginTop: 8 }}># connections</div>
                    <div style={{ color: "#525252" }}>connected_agents:</div>
                    {agent.connections.map((c) => (
                      <div key={c} style={{ color: "#525252", paddingLeft: 16 }}>- <span style={{ color: "#a3a3a3" }}>{c}</span></div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#0a0a0a", background: "#f5f5f5", border: "none", padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}>
                    Restart Agent
                  </button>
                  <button style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#a3a3a3", background: "transparent", border: "1px solid #262626", padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}>
                    Export Config
                  </button>
                  <button style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#525252", background: "transparent", border: "1px solid #1a1a1a", padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}>
                    View Logs
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
