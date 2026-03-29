import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;
const T = {
  text: { primary: "#f5f5f5", secondary: "#d4d4d4", tertiary: "#a3a3a3", muted: "#737373", dim: "#525252", faint: "#404040", ghost: "#333", invisible: "#262626" },
  bg: { page: "#0a0a0a", card: "#131313", inset: "#0f0f0f" },
  border: { card: "#1a1a1a", subtle: "#141414", hover: "#262626" },
  font: { headline: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
};

const PROVIDERS = [
  { id: "anthropic", name: "Anthropic", models: ["claude-opus-4", "claude-sonnet-4", "claude-haiku"], status: "connected", color: COLORS[3], calls: "12.4K", spend: "$34.20", key: "sk-ant-•••••8f2a" },
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "o1", "o3"], status: "connected", color: COLORS[4], calls: "8.1K", spend: "$22.80", key: "sk-•••••v3x9" },
  { id: "google", name: "Google", models: ["gemini-2.5-pro", "gemini-2.5-flash"], status: "connected", color: COLORS[5], calls: "3.2K", spend: "$8.40", key: "AIza•••••Qm4n" },
  { id: "mistral", name: "Mistral", models: ["mistral-large", "codestral"], status: "disconnected", color: COLORS[0], calls: "—", spend: "—", key: null },
  { id: "cohere", name: "Cohere", models: ["command-r-plus"], status: "disconnected", color: COLORS[1], calls: "—", spend: "—", key: null },
  { id: "replicate", name: "Replicate", models: ["llama-3", "sdxl", "whisper"], status: "connected", color: COLORS[2], calls: "1.8K", spend: "$6.10", key: "r8_•••••Jk7p" },
];

const ROUTES = [
  { name: "Default Intelligence", provider: "anthropic", model: "claude-opus-4", use: "Primary reasoning, conversation, code", fallback: "openai/gpt-4o" },
  { name: "Fast Responses", provider: "anthropic", model: "claude-haiku", use: "Quick queries, classification, routing", fallback: "openai/gpt-4o-mini" },
  { name: "Code Generation", provider: "anthropic", model: "claude-sonnet-4", use: "Code scaffolding, refactoring, review", fallback: "google/gemini-2.5-pro" },
  { name: "Image Generation", provider: "replicate", model: "sdxl", use: "Visual content, thumbnails, assets", fallback: "none" },
  { name: "Transcription", provider: "replicate", model: "whisper", use: "Voice memos, audio processing", fallback: "none" },
  { name: "Deep Reasoning", provider: "openai", model: "o3", use: "Complex analysis, math proofs", fallback: "anthropic/claude-opus-4" },
];

const USAGE_LOG = [
  { time: "2m ago", route: "Default Intelligence", model: "claude-opus-4", tokens: "2,840", cost: "$0.042", latency: "1.2s" },
  { time: "5m ago", route: "Code Generation", model: "claude-sonnet-4", tokens: "4,120", cost: "$0.024", latency: "0.8s" },
  { time: "8m ago", route: "Fast Responses", model: "claude-haiku", tokens: "340", cost: "$0.001", latency: "0.3s" },
  { time: "12m ago", route: "Deep Reasoning", model: "o3", tokens: "8,200", cost: "$0.164", latency: "4.2s" },
  { time: "18m ago", route: "Transcription", model: "whisper", tokens: "—", cost: "$0.006", latency: "2.1s" },
  { time: "22m ago", route: "Default Intelligence", model: "claude-opus-4", tokens: "1,640", cost: "$0.025", latency: "1.0s" },
];

function GradientBar({ h = 1, s = {} }) { return <div style={{ height: h, background: GRADIENT, ...s }} />; }

function Nav({ view, setView }) {
  return (
    <nav style={{ padding: "0 16px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border.card}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 2 }}>{COLORS.map(c => <div key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />)}</div>
        <span style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary }}>OneWay</span>
        <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>BYO-API Gateway</span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {["providers", "routes", "usage", "test"].map(v => <button key={v} onClick={() => setView(v)} style={{ fontFamily: T.font.mono, fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: view === v ? T.text.primary : T.text.faint, background: view === v ? T.border.card : "transparent", border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer" }}>{v}</button>)}
      </div>
    </nav>
  );
}

function ProvidersView() {
  const [adding, setAdding] = useState(false);
  const [newProvider, setNewProvider] = useState("");
  const [newKey, setNewKey] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>API Providers</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Bring your own keys. We route through them. Your keys never leave your session.</p></div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1, background: T.border.card, borderRadius: 10, overflow: "hidden" }}>
        {[{ v: PROVIDERS.filter(p => p.status === "connected").length, l: "Connected" }, { v: "25.5K", l: "Total Calls" }, { v: "$71.50", l: "Total Spend" }, { v: "14", l: "Models" }].map(s => <div key={s.l} style={{ background: T.bg.inset, padding: "14px 12px", textAlign: "center" }}><div style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary }}>{s.v}</div><div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.faint, textTransform: "uppercase", marginTop: 4 }}>{s.l}</div></div>)}
      </div>

      {/* Provider cards */}
      {PROVIDERS.map(p => (
        <div key={p.id} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden", opacity: p.status === "connected" ? 1 : 0.55 }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: p.color, opacity: p.status === "connected" ? 1 : 0.2 }} />
          <div style={{ paddingLeft: 6 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: T.font.headline, fontSize: 17, fontWeight: 700, color: T.text.primary }}>{p.name}</span>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.status === "connected" ? T.text.tertiary : T.text.ghost }} />
                </div>
                <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{p.key || "No key configured"}</div>
              </div>
              <span style={{ fontFamily: T.font.mono, fontSize: 9, color: p.status === "connected" ? T.text.dim : T.text.ghost, background: T.bg.page, padding: "3px 8px", borderRadius: 4, border: `1px solid ${T.border.card}`, textTransform: "uppercase" }}>{p.status}</span>
            </div>

            {/* Models */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
              {p.models.map(m => <span key={m} style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.dim, background: T.bg.page, padding: "3px 8px", borderRadius: 4, border: `1px solid ${T.border.subtle}` }}>{m}</span>)}
            </div>

            {p.status === "connected" ? (
              <div style={{ display: "flex", gap: 16 }}>
                <div><span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>calls </span><span style={{ fontFamily: T.font.mono, fontSize: 12, color: T.text.tertiary }}>{p.calls}</span></div>
                <div><span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>spend </span><span style={{ fontFamily: T.font.mono, fontSize: 12, color: T.text.tertiary }}>{p.spend}</span></div>
              </div>
            ) : (
              <button style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 500, color: T.bg.page, background: T.text.primary, border: "none", padding: "8px 18px", borderRadius: 7, cursor: "pointer" }}>Add API Key</button>
            )}
          </div>
        </div>
      ))}

      {/* Add custom */}
      {!adding ? (
        <button onClick={() => setAdding(true)} style={{ background: T.bg.card, border: `1px dashed ${T.border.card}`, borderRadius: 12, padding: 22, cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 600, color: T.text.faint, marginBottom: 4 }}>Add Custom Provider</div>
          <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.ghost }}>Any OpenAI-compatible API endpoint</div>
        </button>
      ) : (
        <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Add Provider</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <input placeholder="Provider name" value={newProvider} onChange={e => setNewProvider(e.target.value)} style={{ background: T.bg.page, border: `1px solid ${T.border.card}`, borderRadius: 8, color: T.text.primary, fontFamily: T.font.body, fontSize: 14, padding: "10px 14px", outline: "none" }} />
            <input placeholder="API key" type="password" value={newKey} onChange={e => setNewKey(e.target.value)} style={{ background: T.bg.page, border: `1px solid ${T.border.card}`, borderRadius: 8, color: T.text.primary, fontFamily: T.font.mono, fontSize: 13, padding: "10px 14px", outline: "none" }} />
            <input placeholder="Base URL (optional)" style={{ background: T.bg.page, border: `1px solid ${T.border.card}`, borderRadius: 8, color: T.text.primary, fontFamily: T.font.mono, fontSize: 13, padding: "10px 14px", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 500, color: T.bg.page, background: T.text.primary, border: "none", padding: "8px 18px", borderRadius: 7, cursor: "pointer" }}>Save</button>
            <button onClick={() => setAdding(false)} style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 500, color: T.text.dim, background: "transparent", border: `1px solid ${T.border.card}`, padding: "8px 18px", borderRadius: 7, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RoutesView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Routes</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Map capabilities to providers. If one fails, the fallback kicks in automatically.</p></div>

      {ROUTES.map((r, i) => {
        const provider = PROVIDERS.find(p => p.id === r.provider);
        return (
          <div key={r.name} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: provider?.color || T.text.ghost }} />
            <div style={{ paddingLeft: 6 }}>
              <div style={{ fontFamily: T.font.headline, fontSize: 15, fontWeight: 700, color: T.text.primary, marginBottom: 2 }}>{r.name}</div>
              <div style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.dim, marginBottom: 10 }}>{r.use}</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost }}>PRIMARY</span>
                  <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.tertiary, background: T.bg.page, padding: "3px 8px", borderRadius: 4, border: `1px solid ${T.border.subtle}` }}>{r.provider}/{r.model}</span>
                </div>
                <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.invisible }}>→</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost }}>FALLBACK</span>
                  <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint, background: T.bg.page, padding: "3px 8px", borderRadius: 4, border: `1px solid ${T.border.subtle}` }}>{r.fallback}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button style={{ background: T.bg.card, border: `1px dashed ${T.border.card}`, borderRadius: 10, padding: 18, cursor: "pointer", textAlign: "center" }}>
        <div style={{ fontFamily: T.font.headline, fontSize: 14, fontWeight: 600, color: T.text.faint }}>Add Route</div>
      </button>
    </div>
  );
}

function UsageView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Usage</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Every call logged. Your keys, your spend, full transparency.</p></div>

      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 70px 60px 50px", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${T.border.card}` }}>
          {["Time", "Route", "Model", "Tokens", "Cost", "Latency"].map(h => <span key={h} style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost, textTransform: "uppercase" }}>{h}</span>)}
        </div>
        {USAGE_LOG.map((log, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 70px 60px 50px", gap: 8, padding: "10px 16px", borderBottom: i < USAGE_LOG.length - 1 ? `1px solid ${T.border.subtle}` : "none", alignItems: "center" }}>
            <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{log.time}</span>
            <span style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.route}</span>
            <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim }}>{log.model}</span>
            <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>{log.tokens}</span>
            <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.tertiary }}>{log.cost}</span>
            <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>{log.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestView() {
  const [prompt, setPrompt] = useState("");
  const [route, setRoute] = useState("Default Intelligence");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const test = () => {
    if (!prompt.trim()) return;
    setLoading(true); setResponse(null);
    setTimeout(() => {
      setResponse({ text: `Response from ${route} route: This is a simulated response to "${prompt}". In production, this would route through your configured API key to the selected provider.`, tokens: "1,240", cost: "$0.019", latency: "0.9s", model: ROUTES.find(r => r.name === route)?.model });
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Test Playground</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Send a prompt through any route. See which provider handles it and how much it costs.</p></div>

      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 14, padding: 22, overflow: "hidden", position: "relative" }}>
        <div style={{ height: 2, background: GRADIENT, position: "absolute", top: 0, left: 0, right: 0 }} />
        {/* Route selector */}
        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Route</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
          {ROUTES.map(r => <button key={r.name} onClick={() => setRoute(r.name)} style={{ fontFamily: T.font.mono, fontSize: 10, color: route === r.name ? T.text.primary : T.text.faint, background: route === r.name ? T.border.card : "transparent", border: `1px solid ${T.border.card}`, borderRadius: 5, padding: "5px 10px", cursor: "pointer" }}>{r.name}</button>)}
        </div>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter a test prompt..." rows={3} style={{ width: "100%", background: T.bg.page, border: `1px solid ${T.border.card}`, borderRadius: 8, color: T.text.primary, fontFamily: T.font.body, fontSize: 14, padding: "12px 16px", resize: "vertical", outline: "none", lineHeight: 1.6, marginBottom: 14 }} />
        <button onClick={test} style={{ fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: prompt.trim() && !loading ? T.bg.page : T.text.faint, background: prompt.trim() && !loading ? T.text.primary : T.border.card, border: "none", padding: "12px 28px", borderRadius: 8, cursor: prompt.trim() && !loading ? "pointer" : "default", width: "100%" }}>
          {loading ? "Routing..." : "Send Test"}
        </button>
      </div>

      {response && (
        <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${T.border.card}`, flexWrap: "wrap" }}>
            {[{ l: "Model", v: response.model }, { l: "Tokens", v: response.tokens }, { l: "Cost", v: response.cost }, { l: "Latency", v: response.latency }].map(s => (
              <div key={s.l}><span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost }}>{s.l} </span><span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.tertiary }}>{s.v}</span></div>
            ))}
          </div>
          <div style={{ padding: 16 }}><p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted, lineHeight: 1.65 }}>{response.text}</p></div>
        </div>
      )}
    </div>
  );
}

export default function OneWayApp() {
  const [view, setView] = useState("providers");
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{overflow-x:hidden}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:#262626;border-radius:3px}input::placeholder,textarea::placeholder{color:#333}input:focus,textarea:focus{border-color:#262626!important;outline:none}button:hover{opacity:0.88}`}</style>
      <div style={{ background: T.bg.page, minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: T.font.body, color: T.text.primary }}>
        <GradientBar />
        <Nav view={view} setView={setView} />
        <div style={{ padding: "20px 16px 80px" }}><div style={{ maxWidth: 640, margin: "0 auto" }}>
          {view === "providers" && <ProvidersView />}
          {view === "routes" && <RoutesView />}
          {view === "usage" && <UsageView />}
          {view === "test" && <TestView />}
        </div></div>
      </div>
    </>
  );
}
