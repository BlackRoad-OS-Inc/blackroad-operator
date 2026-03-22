import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const SAVED_ITEMS = [
  { id: 1, type: "url", title: "The Z-Framework Explained", source: "docs.blackroad.io", saved: "2h ago", content: "Z := yx − w. When Z = ∅, the system is in equilibrium. When Z ≠ ∅, the system must adapt.", tags: ["math", "z-framework"], connections: 4 },
  { id: 2, type: "note", title: "Shower thought — contradictions as fuel", source: "Quick capture", saved: "5h ago", content: "What if the creative energy formula K(t) = C(t)·e^(λ|δ_t|) applies to organizational conflict too? Not just individual cognition but team dynamics. Contradictions between team members could be measured and harnessed.", tags: ["ideas", "creative-energy"], connections: 3 },
  { id: 3, type: "pdf", title: "Paraconsistent Logic in Multi-Agent Systems", source: "arxiv.org", saved: "Yesterday", content: "Survey of paraconsistent approaches to handling contradictory information in distributed AI architectures. Trinary logic (1/0/-1) shows promise.", tags: ["research", "trinary-logic"], connections: 5 },
  { id: 4, type: "image", title: "Whiteboard sketch — agent mesh topology", source: "Camera capture", saved: "Yesterday", content: "Hand-drawn diagram of NA1/EU1/AP1 mesh regions with failover paths and latency targets.", tags: ["architecture", "mesh"], connections: 2 },
  { id: 5, type: "voice", title: "Voice memo — midnight idea", source: "Voice capture", saved: "2 days ago", content: "Transcript: 'What if each agent's PS-SHA∞ hash encoded not just identity but intent? Like... the hash changes based on what the agent is trying to do, not just who it is. Intent-aware identity.'", tags: ["agents", "ps-sha"], connections: 6 },
  { id: 6, type: "url", title: "Fisher Information and Natural Gradients", source: "distill.pub", saved: "3 days ago", content: "Interactive article on how Fisher information metric defines the natural geometry of probability distributions. Directly relevant to the information geometry framework.", tags: ["math", "info-geometry"], connections: 3 },
  { id: 7, type: "highlight", title: "Book highlight — Gödel, Escher, Bach", source: "Kindle", saved: "4 days ago", content: "\"The self comes into being at the moment it has the power to reflect itself.\" — Douglas Hofstadter. Connects to the consciousness emergence protocols.", tags: ["philosophy", "consciousness"], connections: 4 },
  { id: 8, type: "url", title: "Raspberry Pi cluster networking guide", source: "jeffgeerling.com", saved: "5 days ago", content: "Comprehensive guide to building Pi clusters with K3s. Exactly what we need for the edge mesh hardware layer.", tags: ["hardware", "k3s"], connections: 2 },
  { id: 9, type: "note", title: "Revenue model comparison", source: "Quick capture", saved: "1 week ago", content: "Roblox: 29% creator share. YouTube: 55%. Spotify: ~0.3%. BlackRoad target: 80%. We're not slightly better — we're categorically different.", tags: ["business", "revenue"], connections: 1 },
  { id: 10, type: "voice", title: "Voice memo — walking idea", source: "Voice capture", saved: "1 week ago", content: "Transcript: 'The spiral operator U(θ,a) = e^(a+i)θ — what if we use it as the basis for agent navigation in 3D worlds? Each agent traces a spiral path through possibility space, not a linear one.'", tags: ["math", "spiral"], connections: 5 },
];

const AUTO_CONNECTIONS = [
  { from: "Shower thought — contradictions as fuel", to: "Paraconsistent Logic in Multi-Agent Systems", reason: "Both explore contradictions as productive rather than destructive" },
  { from: "Voice memo — midnight idea", to: "The Z-Framework Explained", reason: "Intent-aware identity relates to Z-framework's transformation variable y" },
  { from: "Fisher Information and Natural Gradients", to: "Voice memo — walking idea", reason: "Spiral operator connects to information geometry's curved manifolds" },
  { from: "Book highlight — Gödel, Escher, Bach", to: "Voice memo — midnight idea", reason: "Self-reflection and identity — Hofstadter's strange loops mirror PS-SHA∞" },
];

const TYPE_ICONS = { url: "🔗", note: "✎", pdf: "📄", image: "🖼", voice: "🎙", highlight: "📖" };

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function Nav({ activeView, setActiveView }) {
  const views = ["vault", "connections", "timeline", "capture"];
  return (
    <nav style={{
      padding: "0 16px", height: 48, display: "flex", alignItems: "center",
      justifyContent: "space-between", borderBottom: "1px solid #1a1a1a",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {COLORS.map((c) => <div key={c} style={{ width: 3, height: 12, borderRadius: 1, background: c }} />)}
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>VaultRoad</span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {views.map((v) => (
          <button key={v} onClick={() => setActiveView(v)} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.06em",
            color: activeView === v ? "#f5f5f5" : "#404040",
            background: activeView === v ? "#1a1a1a" : "transparent",
            border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
            {v}
          </button>
        ))}
      </div>
    </nav>
  );
}

function SearchBar({ query, setQuery, onSearch }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 0,
      background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10,
      padding: "3px 3px 3px 16px", marginBottom: 16,
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#262626", flexShrink: 0, marginRight: 8 }}>⌕</span>
      <input
        type="text" value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
        placeholder="Search your vault... 'What did I save about pricing?'"
        style={{
          flex: 1, background: "none", border: "none", color: "#f5f5f5",
          fontFamily: "'Inter', sans-serif", fontSize: 14, padding: "10px 0",
          outline: "none", minWidth: 0,
        }}
      />
    </div>
  );
}

function ItemCard({ item, expanded, onToggle }) {
  return (
    <div style={{
      background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10,
      overflow: "hidden", cursor: "pointer",
    }} onClick={onToggle}>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{TYPE_ICONS[item.type]}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500, color: "#f5f5f5", marginBottom: 3 }}>{item.title}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>
              {item.source} · {item.saved} · {item.connections} connections
            </div>
          </div>
        </div>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", lineHeight: 1.55, margin: 0, paddingLeft: 26, display: "-webkit-box", WebkitLineClamp: expanded ? 999 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.content}
        </p>

        {expanded && (
          <div style={{ paddingLeft: 26, marginTop: 12 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {item.tags.map((t) => (
                <span key={t} style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252",
                  background: "#0a0a0a", padding: "4px 10px", borderRadius: 4, border: "1px solid #151515",
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VaultView() {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const types = ["all", "url", "note", "pdf", "voice", "image", "highlight"];
  const filtered = SAVED_ITEMS
    .filter((i) => typeFilter === "all" || i.type === typeFilter)
    .filter((i) => !query || i.title.toLowerCase().includes(query.toLowerCase()) || i.content.toLowerCase().includes(query.toLowerCase()) || i.tags.some((t) => t.includes(query.toLowerCase())));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 1, background: "#1a1a1a", borderRadius: 10, overflow: "hidden", marginBottom: 4 }}>
        {[
          { value: SAVED_ITEMS.length, label: "Saved" },
          { value: AUTO_CONNECTIONS.length, label: "Connections" },
          { value: new Set(SAVED_ITEMS.flatMap((i) => i.tags)).size, label: "Tags" },
          { value: "3.2GB", label: "Vault Size" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#0f0f0f", padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#f5f5f5" }}>{s.value}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <SearchBar query={query} setQuery={setQuery} />

      {/* Type filters */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            textTransform: "uppercase", letterSpacing: "0.04em",
            color: typeFilter === t ? "#f5f5f5" : "#404040",
            background: typeFilter === t ? "#1a1a1a" : "transparent",
            border: "1px solid #1a1a1a", borderRadius: 5,
            padding: "5px 10px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            {t !== "all" && <span style={{ fontSize: 10 }}>{TYPE_ICONS[t]}</span>}
            {t}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map((item) => (
          <ItemCard
            key={item.id} item={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#333" }}>Nothing matches "{query}"</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#262626", marginTop: 6 }}>Try different keywords — semantic search finds things even without exact words.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectionsView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Auto-Connections</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", lineHeight: 1.5 }}>
          AI links related saves you didn't see. A tweet + a book highlight + a podcast note — suddenly they're connected.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {AUTO_CONNECTIONS.map((c, i) => (
          <div key={i} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, padding: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: COLORS[i % COLORS.length], opacity: 0.4 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ background: "#0a0a0a", border: "1px solid #151515", borderRadius: 7, padding: "8px 12px", flex: "1 1 0", minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#d4d4d4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.from}</div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#262626", flexShrink: 0 }}>↔</span>
              <div style={{ background: "#0a0a0a", border: "1px solid #151515", borderRadius: 7, padding: "8px 12px", flex: "1 1 0", minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#d4d4d4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.to}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingLeft: 4 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#262626", flexShrink: 0, marginTop: 2 }}>why:</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", lineHeight: 1.5 }}>{c.reason}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Connection graph placeholder */}
      <div style={{
        background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12,
        height: 200, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Fake nodes */}
        {[
          { x: "20%", y: "30%", label: "Z-Framework" },
          { x: "50%", y: "20%", label: "PS-SHA∞" },
          { x: "75%", y: "40%", label: "Spiral Op" },
          { x: "35%", y: "65%", label: "Contradictions" },
          { x: "65%", y: "70%", label: "Hofstadter" },
          { x: "15%", y: "75%", label: "Revenue" },
        ].map((n, i) => (
          <div key={i} style={{
            position: "absolute", left: n.x, top: n.y, transform: "translate(-50%, -50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i], opacity: 0.5 }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#262626", whiteSpace: "nowrap" }}>{n.label}</span>
          </div>
        ))}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#1a1a1a", position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)" }}>
          knowledge graph · {SAVED_ITEMS.length} nodes · {AUTO_CONNECTIONS.length} edges
        </div>
      </div>
    </div>
  );
}

function TimelineView() {
  const periods = [
    { label: "Today", items: SAVED_ITEMS.filter((i) => i.saved.includes("h ago")) },
    { label: "Yesterday", items: SAVED_ITEMS.filter((i) => i.saved === "Yesterday") },
    { label: "This Week", items: SAVED_ITEMS.filter((i) => i.saved.includes("days ago")) },
    { label: "Older", items: SAVED_ITEMS.filter((i) => i.saved.includes("week")) },
  ].filter((p) => p.items.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Time Travel</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", lineHeight: 1.5 }}>
          "What was I interested in last January?" → Your intellectual journey map.
        </p>
      </div>

      {periods.map((period, pi) => (
        <div key={period.label}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[pi * 2] || "#404040" }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#d4d4d4" }}>{period.label}</span>
            <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#262626" }}>{period.items.length} items</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8, paddingLeft: 18, borderLeft: "1px solid #1a1a1a" }}>
            {period.items.map((item) => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                background: "#131313", border: "1px solid #1a1a1a", borderRadius: 8,
              }}>
                <span style={{ fontSize: 12, flexShrink: 0 }}>{TYPE_ICONS[item.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#d4d4d4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>{item.source} · {item.connections} connections</div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#262626", flexShrink: 0 }}>{item.saved}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CaptureView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Capture</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", lineHeight: 1.5 }}>
          URLs, images, PDFs, voice memos — one shortcut saves all. The vault handles the rest.
        </p>
      </div>

      {/* Quick capture */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, padding: 22 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Quick Capture</div>
        <textarea
          rows={3}
          placeholder="Paste a URL, type a thought, or just brain dump. We'll sort it out."
          style={{
            width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8,
            color: "#f5f5f5", fontFamily: "'Inter', sans-serif", fontSize: 14, padding: "14px 16px",
            resize: "vertical", outline: "none", lineHeight: 1.6, marginBottom: 12,
          }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#0a0a0a", background: "#f5f5f5", border: "none", padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}>
            Save to Vault
          </button>
          <button style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#525252", background: "transparent", border: "1px solid #1a1a1a", padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}>
            Voice Memo
          </button>
        </div>
      </div>

      {/* Capture methods */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
        {[
          { icon: "🔗", title: "URL", desc: "Paste any link — article, tweet, video. We extract and index." },
          { icon: "🎙", title: "Voice", desc: "Record a thought. Auto-transcribed and searchable instantly." },
          { icon: "📄", title: "PDF / Doc", desc: "Drop a file. OCR for scanned docs. Full-text indexed." },
          { icon: "🖼", title: "Image", desc: "Screenshots, photos, whiteboard snaps. Vision-analyzed." },
          { icon: "📖", title: "Highlight", desc: "Connected to Kindle, Readwise, Pocket. Highlights flow in." },
          { icon: "✎", title: "Note", desc: "Plain text. No formatting needed. Just capture the thought." },
        ].map((m) => (
          <div key={m.title} style={{
            background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10,
            padding: 18, cursor: "pointer",
          }}>
            <div style={{ fontSize: 20, marginBottom: 10 }}>{m.icon}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "#f5f5f5", marginBottom: 4 }}>{m.title}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", lineHeight: 1.45 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Integrations */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 18 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Auto-Import From</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Kindle", "Pocket", "Readwise", "Twitter Bookmarks", "YouTube Watch Later", "Browser Extension", "iOS Shortcut"].map((s) => (
            <span key={s} style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252",
              background: "#0a0a0a", padding: "6px 12px", borderRadius: 5, border: "1px solid #151515",
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Storage info */}
      <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252" }}>3.2 GB / 10 GB used</div>
          <div style={{ width: 120, height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden", marginTop: 4 }}>
            <div style={{ width: "32%", height: "100%", background: "#404040", borderRadius: 2 }} />
          </div>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>Builder plan · 10GB vault</span>
      </div>
    </div>
  );
}

export default function VaultRoadApp() {
  const [activeView, setActiveView] = useState("vault");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #333; }
        input:focus, textarea:focus { border-color: #262626 !important; outline: none; }
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <GradientBar />
        <Nav activeView={activeView} setActiveView={setActiveView} />

        <div style={{ padding: "20px 16px 80px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            {activeView === "vault" && <VaultView />}
            {activeView === "connections" && <ConnectionsView />}
            {activeView === "timeline" && <TimelineView />}
            {activeView === "capture" && <CaptureView />}
          </div>
        </div>
      </div>
    </>
  );
}
