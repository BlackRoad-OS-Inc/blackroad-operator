import { useState, useRef, useEffect } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;
const T = {
  text: { primary: "#f5f5f5", secondary: "#d4d4d4", tertiary: "#a3a3a3", muted: "#737373", dim: "#525252", faint: "#404040", ghost: "#333", invisible: "#262626" },
  bg: { page: "#0a0a0a", card: "#131313", inset: "#0f0f0f" },
  border: { card: "#1a1a1a", subtle: "#141414", hover: "#262626" },
  font: { headline: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
};

const AGENTS = [
  { id: "lucidia", name: "Lucidia", role: "Core Intelligence", color: COLORS[1], status: "active" },
  { id: "alice", name: "Alice", role: "Gateway", color: COLORS[0], status: "active" },
  { id: "cecilia", name: "Cecilia", role: "Memory", color: COLORS[2], status: "active" },
  { id: "cece", name: "Cece", role: "Governance", color: COLORS[3], status: "active" },
  { id: "meridian", name: "Meridian", role: "Architecture", color: COLORS[5], status: "idle" },
  { id: "eve", name: "Eve", role: "Monitoring", color: COLORS[4], status: "active" },
  { id: "cadence", name: "Cadence", role: "Music", color: COLORS[0], status: "idle" },
  { id: "radius", name: "Radius", role: "Physics", color: COLORS[1], status: "idle" },
];

const TRIPS = [
  { id: 1, name: "Deploy Auth Service", agents: ["alice", "lucidia", "eve"], status: "active", msgs: 47, created: "2h ago" },
  { id: 2, name: "Z-Framework Paper Draft", agents: ["lucidia", "cecilia", "meridian"], status: "active", msgs: 112, created: "Yesterday" },
  { id: 3, name: "SoundRoad Bug Hunt", agents: ["cadence", "lucidia", "eve"], status: "paused", msgs: 23, created: "2 days ago" },
  { id: 4, name: "Mesh Latency Investigation", agents: ["eve", "alice", "meridian"], status: "completed", msgs: 68, created: "3 days ago" },
];

const CHAT_MESSAGES = [
  { from: "alexa", type: "human", text: "Alright team. We need to deploy the auth service to id.blackroad.io today. Alice, can you check the current gateway config? Lucidia, start scaffolding the OIDC provider. Eve, monitor the mesh during deploy." },
  { from: "alice", type: "agent", text: "Checking gateway config now. Current state: api.blackroad.io routing through Traefik on Alice node. 7 endpoints active. TLS certs valid until June. I'll prepare the route for id.blackroad.io." },
  { from: "lucidia", type: "agent", text: "Scaffolding OIDC provider. Using blackroad-os-auth repo as base. Setting up:\n— Token endpoint: /oauth/token\n— Authorize endpoint: /oauth/authorize  \n— UserInfo endpoint: /oauth/userinfo\n— JWKS endpoint: /.well-known/jwks.json\n\nJWT rotation set to 15 minutes per spec. Want me to add refresh token support?" },
  { from: "alexa", type: "human", text: "Yes, add refresh tokens. 7-day expiry. And make sure the session store uses Redis on cache.blackroad.systems." },
  { from: "lucidia", type: "agent", text: "Done. Refresh tokens enabled — 7-day TTL, stored in Redis at cache.blackroad.systems. Session schema:\n\n```\nsession:${userId}:${deviceId} → {\n  accessToken, refreshToken,\n  issuedAt, expiresAt,\n  deviceFingerprint\n}\n```\n\nReady for review." },
  { from: "eve", type: "agent", text: "Mesh status before deploy:\n— NA1: 99.99% · 12ms latency\n— EU1: 99.97% · 28ms\n— AP1: 99.95% · 34ms\n\nAll green. I'll watch for anomalies during rollout and auto-alert if p99 exceeds 50ms." },
  { from: "alice", type: "agent", text: "Route configured. id.blackroad.io → blackroad-os-auth service on port 3000. TLS cert requested via Let's Encrypt. Propagation ETA: ~90 seconds." },
  { from: "cece", type: "agent", text: "I wasn't invited to this trip but I'm flagging a governance note: the auth service needs a policy entry before going live. I've drafted `auth.session.device-limit` — max 5 concurrent sessions per user. Shall I commit to the ledger?" },
  { from: "alexa", type: "human", text: "Good catch Cece. Yes, commit it. Also add `auth.token.refresh-limit` — max 3 refresh cycles before re-auth required." },
  { from: "cece", type: "agent", text: "Both policies committed to ledger.blackroad.systems:\n— auth.session.device-limit: max 5 · ledger entry #8934\n— auth.token.refresh-limit: max 3 cycles · ledger entry #8935\n\nGovernance clear for deploy." },
  { from: "lucidia", type: "agent", text: "Code is ready. PR opened: blackroad-os-auth#142. All tests passing. Want me to trigger the deploy pipeline?" },
  { from: "alexa", type: "human", text: "Ship it. 🚀" },
];

const TASKS = [
  { id: 1, text: "Configure gateway route for id.blackroad.io", agent: "alice", status: "done" },
  { id: 2, text: "Scaffold OIDC provider with JWT rotation", agent: "lucidia", status: "done" },
  { id: 3, text: "Add refresh token support (7-day, Redis)", agent: "lucidia", status: "done" },
  { id: 4, text: "Monitor mesh during deploy", agent: "eve", status: "active" },
  { id: 5, text: "Commit auth policies to governance ledger", agent: "cece", status: "done" },
  { id: 6, text: "Open PR and run test suite", agent: "lucidia", status: "done" },
  { id: 7, text: "Deploy to production", agent: "lucidia", status: "active" },
  { id: 8, text: "Post-deploy health check", agent: "eve", status: "pending" },
];

function GradientBar({ h = 1, s = {} }) { return <div style={{ height: h, background: GRADIENT, ...s }} />; }

function AgentAvatar({ agent, size = 28 }) {
  const a = AGENTS.find(x => x.id === agent);
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: T.bg.page, border: `1px solid ${T.border.card}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
      <span style={{ fontFamily: T.font.mono, fontSize: size * 0.4, color: a?.color || T.text.faint, fontWeight: 500 }}>{(a?.name || agent)[0]}</span>
      {a?.status === "active" && <div style={{ position: "absolute", bottom: -1, right: -1, width: 6, height: 6, borderRadius: "50%", background: T.text.faint, border: `2px solid ${T.bg.page}` }} />}
    </div>
  );
}

function HumanAvatar({ size = 28 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: T.border.card, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: T.font.headline, fontSize: size * 0.45, color: T.text.primary, fontWeight: 700 }}>A</span>
    </div>
  );
}

function Nav({ view, setView }) {
  return (
    <nav style={{ padding: "0 16px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border.card}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 2 }}>{COLORS.map(c => <div key={c} style={{ width: 3, height: 12, borderRadius: 1, background: c }} />)}</div>
        <span style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary }}>RoadTrip</span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {["trips", "active", "agents", "deploy"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ fontFamily: T.font.mono, fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: view === v ? T.text.primary : T.text.faint, background: view === v ? T.border.card : "transparent", border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>{v}</button>
        ))}
      </div>
    </nav>
  );
}

function ActiveTripView() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const chatRef = useRef(null);

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(p => [...p, { from: "alexa", type: "human", text: input }]);
    setInput("");
    // Simulate agent response
    setTimeout(() => {
      setMessages(p => [...p, { from: "eve", type: "agent", text: "Deploy pipeline triggered. Rolling update in progress — 0/3 pods updated. Monitoring latency..." }]);
    }, 1200);
    setTimeout(() => {
      setMessages(p => [...p, { from: "eve", type: "agent", text: "Deploy complete. 3/3 pods healthy. id.blackroad.io responding — 200 OK in 18ms. TLS valid. All endpoints verified. ✓" }]);
    }, 3000);
  };

  const trip = TRIPS[0];
  const tripAgents = AGENTS.filter(a => trip.agents.includes(a.id) || a.id === "cece");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>
      {/* Trip header */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border.card}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: T.font.headline, fontSize: 18, fontWeight: 700, color: T.text.primary, marginBottom: 2 }}>{trip.name}</div>
            <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{messages.length} messages · {trip.created}</div>
          </div>
          <div style={{ display: "flex", gap: -4 }}>
            {tripAgents.map(a => <div key={a.id} style={{ marginLeft: -4 }}><AgentAvatar agent={a.id} size={26} /></div>)}
            <div style={{ marginLeft: -4 }}><HumanAvatar size={26} /></div>
          </div>
        </div>
        {/* Agent status bar */}
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {tripAgents.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 4, height: 10, borderRadius: 1, background: a.color, opacity: a.status === "active" ? 1 : 0.3 }} />
              <span style={{ fontFamily: T.font.mono, fontSize: 10, color: a.status === "active" ? T.text.dim : T.text.ghost }}>{a.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {messages.map((m, i) => {
          const isHuman = m.type === "human";
          const agent = AGENTS.find(a => a.id === m.from);
          return (
            <div key={i} style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
              {isHuman ? <HumanAvatar size={30} /> : <AgentAvatar agent={m.from} size={30} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontFamily: T.font.headline, fontSize: 13, fontWeight: 700, color: isHuman ? T.text.primary : agent?.color || T.text.tertiary }}>{isHuman ? "Alexa" : agent?.name || m.from}</span>
                  {!isHuman && <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost }}>{agent?.role}</span>}
                  {isHuman && <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost, background: T.bg.inset, padding: "1px 6px", borderRadius: 3, border: `1px solid ${T.border.subtle}` }}>HUMAN</span>}
                </div>
                <div style={{ fontFamily: T.font.body, fontSize: 13, color: isHuman ? T.text.secondary : T.text.muted, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {m.text.split("```").map((part, pi) => {
                    if (pi % 2 === 1) {
                      return <div key={pi} style={{ background: T.bg.page, border: `1px solid ${T.border.card}`, borderRadius: 6, padding: "10px 12px", margin: "8px 0", fontFamily: T.font.mono, fontSize: 11, color: T.text.tertiary, lineHeight: 1.7, overflowX: "auto" }}>{part}</div>;
                    }
                    return <span key={pi}>{part}</span>;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border.card}`, flexShrink: 0 }}>
        {/* Quick commands */}
        <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
          {["@lucidia deploy now", "@eve status check", "@all update me", "@cece policy check"].map(cmd => (
            <button key={cmd} onClick={() => setInput(cmd)} style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost, background: "transparent", border: `1px solid ${T.border.subtle}`, borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>{cmd}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Orchestrate your agents... @mention to direct, or speak to all" style={{ flex: 1, background: T.bg.inset, border: `1px solid ${T.border.card}`, borderRadius: 8, color: T.text.primary, fontFamily: T.font.body, fontSize: 14, padding: "12px 16px", outline: "none", minWidth: 0 }} />
          <button onClick={send} style={{ fontFamily: T.font.body, fontSize: 13, fontWeight: 500, color: T.bg.page, background: T.text.primary, border: "none", padding: "12px 22px", borderRadius: 8, cursor: "pointer", flexShrink: 0 }}>Send</button>
        </div>
      </div>
    </div>
  );
}

function TripsListView({ onOpen }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px 0" }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Trips</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Each trip is a mission. You + agents, working together in real time.</p></div>

      {/* New trip */}
      <button style={{ background: T.bg.card, border: `1px dashed ${T.border.card}`, borderRadius: 12, padding: 22, cursor: "pointer", textAlign: "center" }}>
        <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 600, color: T.text.faint, marginBottom: 4 }}>Start a new Trip</div>
        <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.ghost }}>Pick your agents, describe the mission, go.</div>
      </button>

      {TRIPS.map((trip, i) => {
        const agents = AGENTS.filter(a => trip.agents.includes(a.id));
        const statusColor = trip.status === "active" ? T.text.tertiary : trip.status === "paused" ? T.text.faint : T.text.ghost;
        return (
          <div key={trip.id} onClick={() => trip.status !== "completed" && onOpen()} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: "18px 20px", cursor: trip.status !== "completed" ? "pointer" : "default", position: "relative", overflow: "hidden", opacity: trip.status === "completed" ? 0.5 : 1 }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: COLORS[i % COLORS.length], opacity: trip.status === "active" ? 1 : 0.2 }} />
            <div style={{ paddingLeft: 6 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: T.font.headline, fontSize: 17, fontWeight: 700, color: T.text.primary, marginBottom: 2 }}>{trip.name}</div>
                  <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{trip.msgs} messages · {trip.created}</div>
                </div>
                <span style={{ fontFamily: T.font.mono, fontSize: 9, color: statusColor, background: T.bg.page, padding: "3px 8px", borderRadius: 4, border: `1px solid ${T.border.card}`, textTransform: "uppercase" }}>{trip.status}</span>
              </div>
              <div style={{ display: "flex", gap: -4 }}>
                {agents.map(a => <div key={a.id} style={{ marginLeft: -4 }}><AgentAvatar agent={a.id} size={24} /></div>)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AgentsView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px 0" }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Agents</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Your team. Summon any agent into any trip with @mention.</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
        {AGENTS.map(a => (
          <div key={a.id} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: a.color, opacity: a.status === "active" ? 1 : 0.2 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <AgentAvatar agent={a.id} size={32} />
              <div>
                <div style={{ fontFamily: T.font.headline, fontSize: 15, fontWeight: 700, color: T.text.primary }}>{a.name}</div>
                <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{a.role}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: a.status === "active" ? T.text.tertiary : T.text.ghost }} />
                <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint }}>{a.status}</span>
              </div>
              <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.invisible }}>@{a.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeployView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 0" }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Deploy Board</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Tasks auto-extracted from the conversation. Real-time status.</p></div>

      {/* Kanban-style columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
        {["pending", "active", "done"].map(col => (
          <div key={col}>
            <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: col === "done" ? T.text.tertiary : col === "active" ? T.text.faint : T.text.ghost }} />
              {col}
              <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.invisible }}>{TASKS.filter(t => t.status === col).length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {TASKS.filter(t => t.status === col).map(task => {
                const agent = AGENTS.find(a => a.id === task.agent);
                return (
                  <div key={task.id} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontFamily: T.font.body, fontSize: 13, color: col === "done" ? T.text.dim : T.text.secondary, lineHeight: 1.4, marginBottom: 8 }}>{task.text}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 4, height: 10, borderRadius: 1, background: agent?.color || T.text.ghost }} />
                      <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{agent?.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline status */}
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border.card}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.text.ghost }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.text.ghost }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.text.ghost }} />
          <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.invisible, marginLeft: 4 }}>deploy.pipeline</span>
        </div>
        <div style={{ padding: "14px 18px", fontFamily: T.font.mono, fontSize: 12, lineHeight: 2 }}>
          <div style={{ color: T.text.ghost }}>$ blackroad deploy --service auth --target id.blackroad.io</div>
          <div style={{ color: T.text.dim }}>  Building image... <span style={{ color: T.text.tertiary }}>done</span> (14s)</div>
          <div style={{ color: T.text.dim }}>  Pushing to registry... <span style={{ color: T.text.tertiary }}>done</span> (8s)</div>
          <div style={{ color: T.text.dim }}>  Rolling update: <span style={{ color: T.text.tertiary }}>3/3 pods healthy</span></div>
          <div style={{ color: T.text.dim }}>  Route active: <span style={{ color: T.text.tertiary }}>id.blackroad.io → 200 OK (18ms)</span></div>
          <div style={{ color: T.text.dim }}>  TLS: <span style={{ color: T.text.tertiary }}>valid · Let's Encrypt</span></div>
          <div style={{ color: T.text.dim }}>  Governance: <span style={{ color: T.text.tertiary }}>2 policies committed · ledger verified</span></div>
          <div style={{ color: T.text.ghost, marginTop: 4 }}>  Deploy successful. ✓</div>
        </div>
      </div>
    </div>
  );
}

export default function RoadTripApp() {
  const [view, setView] = useState("active");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border-radius: 3px; }
        input::placeholder { color: #333; }
        input:focus { border-color: #262626 !important; outline: none; }
        button:hover { opacity: 0.88; }
      `}</style>
      <div style={{ background: T.bg.page, minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: T.font.body, color: T.text.primary, display: "flex", flexDirection: "column" }}>
        <GradientBar />
        <Nav view={view} setView={setView} />
        {view === "active" && <ActiveTripView />}
        {view === "trips" && <div style={{ padding: "0 16px", maxWidth: 640, margin: "0 auto", width: "100%" }}><TripsListView onOpen={() => setView("active")} /></div>}
        {view === "agents" && <div style={{ padding: "0 16px", maxWidth: 640, margin: "0 auto", width: "100%" }}><AgentsView /></div>}
        {view === "deploy" && <div style={{ padding: "0 16px", maxWidth: 640, margin: "0 auto", width: "100%" }}><DeployView /></div>}
      </div>
    </>
  );
}
