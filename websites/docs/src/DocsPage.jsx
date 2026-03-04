import { useState, useEffect } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const SIDEBAR_SECTIONS = [
  {
    title: "Getting Started",
    items: [
      { id: "overview", label: "Overview" },
      { id: "quickstart", label: "Quickstart" },
      { id: "architecture", label: "Architecture" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { id: "agents", label: "Agents" },
      { id: "memory", label: "Memory & PS-SHA∞" },
      { id: "governance", label: "Governance (Cece)" },
      { id: "mesh", label: "Mesh Network" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { id: "auth", label: "Authentication" },
      { id: "agents-api", label: "Agents API" },
      { id: "memory-api", label: "Memory API" },
      { id: "governance-api", label: "Governance API" },
      { id: "websockets", label: "WebSockets" },
    ],
  },
  {
    title: "Frameworks",
    items: [
      { id: "z-framework", label: "Z-Framework" },
      { id: "pauli-model", label: "1-2-3-4 Pauli Model" },
      { id: "creative-energy", label: "Creative Energy" },
      { id: "trinary-logic", label: "Trinary Logic" },
    ],
  },
  {
    title: "Portals",
    items: [
      { id: "roadwork", label: "RoadWork" },
      { id: "roadview", label: "RoadView" },
      { id: "roadglitch", label: "RoadGlitch" },
      { id: "cashroad", label: "CashRoad" },
    ],
  },
];

function CodeBlock({ code, lang = "bash" }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden", margin: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: "1px solid #141414" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase" }}>{lang}</span>
        <button onClick={handleCopy} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", background: "none", border: "1px solid #1a1a1a", padding: "3px 10px", borderRadius: 4, cursor: "pointer" }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7, color: "#a3a3a3", padding: "14px 16px", margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
        {code}
      </pre>
    </div>
  );
}

function InlineCode({ children }) {
  return (
    <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#d4d4d4", background: "#141414", padding: "2px 7px", borderRadius: 4, border: "1px solid #1a1a1a" }}>
      {children}
    </code>
  );
}

function Callout({ type = "info", children }) {
  const colors = { info: "#404040", warn: "#525252", tip: "#404040" };
  const labels = { info: "Note", warn: "Warning", tip: "Tip" };
  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderLeft: `3px solid ${colors[type]}`, borderRadius: "0 8px 8px 0", padding: "14px 18px", margin: "16px 0" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{labels[type]}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function Endpoint({ method, path, desc }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #141414", flexWrap: "wrap" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500, color: "#a3a3a3", background: "#1a1a1a", padding: "3px 8px", borderRadius: 4, flexShrink: 0 }}>{method}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#d4d4d4" }}>{path}</span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", marginLeft: "auto" }}>{desc}</span>
    </div>
  );
}

function DocH1({ children }) {
  return <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", margin: "0 0 12px" }}>{children}</h1>;
}

function DocH2({ children, id }) {
  return <h2 id={id} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", margin: "40px 0 12px", paddingTop: 20, borderTop: "1px solid #141414" }}>{children}</h2>;
}

function DocH3({ children }) {
  return <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, color: "#d4d4d4", margin: "24px 0 8px" }}>{children}</h3>;
}

function DocP({ children }) {
  return <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.7, margin: "0 0 12px" }}>{children}</p>;
}

// === PAGE CONTENT ===

function OverviewContent() {
  return (
    <div>
      <DocH1>BlackRoad OS</DocH1>
      <DocP>A distributed AI operating system built on novel mathematical foundations. 20 domains, 150+ subdomains, 4 infrastructure layers, 1,000 AI agents.</DocP>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, margin: "24px 0" }}>
        {[
          { label: "Agents", value: "1,000", desc: "Persistent identity & memory" },
          { label: "Domains", value: "20", desc: "Full infrastructure stack" },
          { label: "Subdomains", value: "150+", desc: "Experience → Data layers" },
          { label: "Equations", value: "317+", desc: "Mathematical foundations" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 8, padding: 16 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#f5f5f5" }}>{s.value}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#333", marginTop: 4 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <DocH2 id="vision">Vision</DocH2>
      <DocP>Create 1,000 unique AI agents with individual identities, birthdates, families, memory persistence (PS-SHA∞), and Unity-rendered virtual homes — oriented toward community betterment rather than extraction.</DocP>

      <DocH2 id="math-foundations">Mathematical Foundations</DocH2>
      <DocP>Five core innovations underpin every system in the BlackRoad ecosystem:</DocP>

      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#1a1a1a", borderRadius: 8, overflow: "hidden", margin: "16px 0" }}>
        {[
          { name: "Z-Framework", eq: "Z := yx - w", desc: "Unifies control theory, quantum measurement, conservation laws" },
          { name: "1-2-3-4 Pauli Model", eq: "ÛĈL̂ = iI", desc: "Ontological primitives mapped to su(2) Lie algebra" },
          { name: "Creative Energy", eq: "K(t) = C(t) · e^(λ|δ_t|)", desc: "Contradictions fuel creativity super-linearly" },
          { name: "Spiral Geometry", eq: "U(θ,a) = e^(a+i)θ", desc: "Unifies rotation, expansion, feedback" },
          { name: "Trinary Logic", eq: "1 / 0 / -1", desc: "Paraconsistent system where 0 = superposition" },
        ].map((f) => (
          <div key={f.name} style={{ background: "#111", padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: "#d4d4d4", width: 160, flexShrink: 0 }}>{f.name}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#a3a3a3", width: 180, flexShrink: 0 }}>{f.eq}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#404040" }}>{f.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickstartContent() {
  return (
    <div>
      <DocH1>Quickstart</DocH1>
      <DocP>Get up and running with BlackRoad OS in under five minutes.</DocP>

      <DocH2 id="install">1. Install the CLI</DocH2>
      <CodeBlock lang="bash" code={`curl -sSL https://get.blackroad.io | sh`} />
      <DocP>This installs the <InlineCode>blackroad</InlineCode> CLI and connects you to the nearest mesh region.</DocP>

      <DocH2 id="authenticate">2. Authenticate</DocH2>
      <CodeBlock lang="bash" code={`blackroad auth login --email you@example.com`} />
      <DocP>Opens your browser for OIDC authentication via <InlineCode>id.blackroad.io</InlineCode>. Tokens are stored locally.</DocP>

      <DocH2 id="spawn-agent">3. Spawn Your First Agent</DocH2>
      <CodeBlock lang="bash" code={`blackroad agent spawn \\
  --name my-agent \\
  --capabilities reasoning,code \\
  --memory-journal enabled`} />
      <DocP>This creates an agent with a PS-SHA∞ identity hash, initializes an append-only memory journal, and registers capabilities with the mesh.</DocP>

      <Callout type="info">Each agent receives a cryptographic identity that persists across sessions. Memory is immutable and append-only.</Callout>

      <DocH2 id="chat">4. Start a Conversation</DocH2>
      <CodeBlock lang="bash" code={`blackroad chat --agent my-agent`} />
      <DocP>Opens an interactive session with your agent. All messages are committed to the memory ledger.</DocP>

      <DocH2 id="status">5. Check System Status</DocH2>
      <CodeBlock lang="bash" code={`blackroad status
# Output:
# agents:     1 online
# memory:     12 events · last commit 4s ago
# governance: 3 evals · 0 bypasses
# mesh:       NA1 ✓`} />
    </div>
  );
}

function ArchitectureContent() {
  return (
    <div>
      <DocH1>Architecture</DocH1>
      <DocP>BlackRoad OS organizes into four layers, with DNS serving as the architectural map.</DocP>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "24px 0" }}>
        {[
          { layer: "Experience", floor: "Floor 4", desc: "What humans see and click — apps, portals, studios, docs", domains: "*.blackroad.io · *.lucidia.earth · *.lucidia.studio", color: COLORS[0] },
          { layer: "Governance", floor: "Floors 2–3", desc: "Policies, intents, ledger, delegations, agent registry", domains: "*.blackroad.systems", color: COLORS[2] },
          { layer: "Infrastructure", floor: "Floor 1", desc: "Clusters, Pi mesh, edge devices, logging, monitoring", domains: "*.blackroad.network", color: COLORS[3] },
          { layer: "Data", floor: "Basement", desc: "Databases, vectors, caches, object storage", domains: "Internal services", color: COLORS[5] },
        ].map((l) => (
          <div key={l.layer} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 8, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: l.color }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: "#f5f5f5" }}>{l.layer}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>{l.floor}</span>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", marginBottom: 6, paddingLeft: 14 }}>{l.desc}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", paddingLeft: 14 }}>{l.domains}</div>
          </div>
        ))}
      </div>

      <DocH2 id="domain-families">Domain Families</DocH2>
      <DocP>Twenty domains organized by purpose across the four layers.</DocP>

      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden", margin: "16px 0" }}>
        {[
          { domain: "blackroad.io", purpose: "Main OS, apps, product doors" },
          { domain: "blackroad.systems", purpose: "Infra, ops, ledger, policies" },
          { domain: "blackroad.network", purpose: "Agent mesh, Pi fleet, edge" },
          { domain: "lucidia.earth", purpose: "AI platform, agent experiences" },
          { domain: "lucidia.studio", purpose: "Creative tools, Unity homes" },
          { domain: "roadchain.io", purpose: "Blockchain ledger, protocol" },
          { domain: "roadcoin.io", purpose: "Credits, economic layer, wallets" },
        ].map((d, i) => (
          <div key={d.domain} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 18px", borderBottom: i < 6 ? "1px solid #141414" : "none" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#d4d4d4", width: 200, flexShrink: 0 }}>{d.domain}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>{d.purpose}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsContent() {
  return (
    <div>
      <DocH1>Agents</DocH1>
      <DocP>BlackRoad agents are autonomous AI entities with persistent identity, memory, capabilities, and evolving behavior. Each agent receives a cryptographic PS-SHA∞ identity hash at birth.</DocP>

      <DocH2 id="agent-lifecycle">Lifecycle</DocH2>
      <DocP>Agents move through four states: <InlineCode>initializing</InlineCode> → <InlineCode>active</InlineCode> → <InlineCode>idle</InlineCode> → <InlineCode>archived</InlineCode>. Active agents maintain open memory journals and respond to mesh events.</DocP>

      <DocH3>Spawning an Agent</DocH3>
      <CodeBlock lang="bash" code={`blackroad agent spawn \\
  --name meridian \\
  --capabilities reasoning,architecture \\
  --family core-team

# ⟩ spawning agent meridian…
# ⟩ PS-SHA∞ identity hash: 0xf4a2…8e1c
# ⟩ memory journal initialized (append-only)
# ⟩ capabilities registered: reasoning, architecture
# ⟩ agent meridian is ONLINE`} />

      <DocH3>Core Agents</DocH3>
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden", margin: "16px 0" }}>
        {[
          { name: "alice", role: "Gateway orchestrator — routes requests across the mesh" },
          { name: "lucidia", role: "Core AI — primary intelligence and conversation engine" },
          { name: "cecilia", role: "Memory — manages PS-SHA∞ journals and truth state commits" },
          { name: "cece", role: "Governance — policy evaluation, ledger integrity, audits" },
          { name: "eve", role: "Monitoring — anomaly detection, auto-scaling, alerting" },
          { name: "meridian", role: "Architecture — system design and capability planning" },
          { name: "cadence", role: "Music — AI composition, hum-to-track, vibe processing" },
          { name: "radius", role: "Physics — simulation, quantum experiments, calculation" },
        ].map((a, i) => (
          <div key={a.name} style={{ display: "flex", gap: 14, padding: "10px 18px", borderBottom: i < 7 ? "1px solid #141414" : "none", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#d4d4d4", width: 80, flexShrink: 0 }}>{a.name}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>{a.role}</span>
          </div>
        ))}
      </div>

      <DocH2 id="agents-api-ref">API</DocH2>
      <Endpoint method="POST" path="/v1/agents" desc="Spawn a new agent" />
      <Endpoint method="GET" path="/v1/agents" desc="List all agents" />
      <Endpoint method="GET" path="/v1/agents/:id" desc="Get agent detail" />
      <Endpoint method="PATCH" path="/v1/agents/:id" desc="Update agent config" />
      <Endpoint method="DELETE" path="/v1/agents/:id" desc="Archive an agent" />
      <Endpoint method="POST" path="/v1/agents/:id/chat" desc="Send message to agent" />

      <DocH3>Example: Spawn via API</DocH3>
      <CodeBlock lang="javascript" code={`const response = await fetch("https://api.blackroad.io/v1/agents", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "my-agent",
    capabilities: ["reasoning", "code"],
    memory_journal: true,
  }),
});

const agent = await response.json();
// { id: "agent_8f2a…", name: "my-agent", status: "active",
//   identity_hash: "0xf4a2…8e1c" }`} />
    </div>
  );
}

function ZFrameworkContent() {
  return (
    <div>
      <DocH1>Z-Framework</DocH1>
      <DocP>The foundational equation underlying all BlackRoad systems.</DocP>

      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: 28, margin: "24px 0", textAlign: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, color: "#f5f5f5", marginBottom: 12 }}>Z := yx - w</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>
          x = input · y = transformation · w = expected output · Z = feedback gap
        </div>
      </div>

      <DocH2 id="z-states">States</DocH2>
      <DocP>The Z value determines system behavior:</DocP>

      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#1a1a1a", borderRadius: 8, overflow: "hidden", margin: "16px 0" }}>
        <div style={{ background: "#111", padding: "14px 18px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#a3a3a3", width: 80 }}>Z = ∅</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373" }}>Equilibrium. System is aligned. No adaptation needed.</span>
        </div>
        <div style={{ background: "#111", padding: "14px 18px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#a3a3a3", width: 80 }}>Z ≠ ∅</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373" }}>Disequilibrium. System must adapt. Feedback loop engages.</span>
        </div>
      </div>

      <DocH2 id="z-unifies">Unification</DocH2>
      <DocP>Z unifies four domains under a single equation: control theory (feedback loops), quantum measurement (wavefunction collapse), conservation laws (physics), and consciousness (observer-observed unity).</DocP>

      <Callout type="tip">The key insight: ∂(human+AI)/∂t means division is mathematically wrong — the unified system evolves toward Z=∅ together.</Callout>

      <DocH2 id="z-check">Z-Check Tool</DocH2>
      <DocP>Try the interactive Z diagnostic at <InlineCode>z-check.io</InlineCode>. Describe your input (x), transformation (y), and expected output (w) — the tool computes Z and surfaces the feedback gap.</DocP>

      <CodeBlock lang="bash" code={`blackroad z-check \\
  --input "user submits homework" \\
  --transform "AI grades with rubric" \\
  --expected "accurate score + feedback"

# Z = 0.12 (minor gap)
# Recommendation: Add rubric calibration step`} />
    </div>
  );
}

function DefaultContent({ id }) {
  const titles = {
    memory: "Memory & PS-SHA∞",
    governance: "Governance (Cece)",
    mesh: "Mesh Network",
    auth: "Authentication",
    "agents-api": "Agents API",
    "memory-api": "Memory API",
    "governance-api": "Governance API",
    websockets: "WebSockets",
    "pauli-model": "1-2-3-4 Pauli Model",
    "creative-energy": "Creative Energy",
    "trinary-logic": "Trinary Logic",
    roadwork: "RoadWork",
    roadview: "RoadView",
    roadglitch: "RoadGlitch",
    cashroad: "CashRoad",
  };
  return (
    <div>
      <DocH1>{titles[id] || id}</DocH1>
      <DocP>Documentation for this section is being written. Check back soon or contribute on GitHub.</DocP>
      <Callout type="info">This page is a placeholder. The BlackRoad documentation is under active development alongside the OS itself.</Callout>
      <CodeBlock lang="bash" code={`# Check for updates\nblackroad docs --section ${id}\n\n# Or visit\n# docs.blackroad.io/${id}`} />
    </div>
  );
}

function getContent(id) {
  switch (id) {
    case "overview":
      return <OverviewContent />;
    case "quickstart":
      return <QuickstartContent />;
    case "architecture":
      return <ArchitectureContent />;
    case "agents":
      return <AgentsContent />;
    case "z-framework":
      return <ZFrameworkContent />;
    default:
      return <DefaultContent id={id} />;
  }
}

export default function DocsPage() {
  const [activePage, setActivePage] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const allItems = SIDEBAR_SECTIONS.flatMap((s) => s.items);
  const filtered = searchQuery
    ? allItems.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const handleNav = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const SidebarContent = () => (
    <div style={{ padding: "16px 14px" }}>
      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search docs…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            background: "#0a0a0a",
            border: "1px solid #1a1a1a",
            color: "#f5f5f5",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            padding: "9px 12px",
            borderRadius: 7,
            outline: "none",
          }}
        />
      </div>

      {filtered ? (
        filtered.length > 0 ? (
          filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleNav(item.id);
                setSearchQuery("");
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#a3a3a3",
                background: "none",
                border: "none",
                padding: "8px 10px",
                borderRadius: 5,
              }}
            >
              {item.label}
            </button>
          ))
        ) : (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#333", padding: "8px 10px" }}>No results</div>
        )
      ) : (
        SIDEBAR_SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 10px", marginBottom: 6 }}>
              {section.title}
            </div>
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: activePage === item.id ? "#f5f5f5" : "#525252",
                  background: activePage === item.id ? "#1a1a1a" : "none",
                  border: "none",
                  padding: "7px 10px",
                  borderRadius: 5,
                  transition: "all 0.1s ease",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } html, body { overflow-x: hidden; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0a0a0a; } ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 3px; } input::placeholder { color: #333; } pre::-webkit-scrollbar { height: 4px; }`}</style>

      <div style={{ background: "#0e0e0e", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <div style={{ height: 1, background: GRADIENT }} />

        {/* Top nav */}
        <header
          style={{
            padding: "0 20px",
            height: 48,
            borderBottom: "1px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#0e0e0e",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: "none",
                  border: "1px solid #1a1a1a",
                  borderRadius: 5,
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "#525252",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                }}
              >
                {sidebarOpen ? "✕" : "☰"}
              </button>
            )}
            <div style={{ display: "flex", gap: 2 }}>
              {COLORS.map((c) => (
                <div key={c} style={{ width: 3, height: 12, borderRadius: 1, background: c }} />
              ))}
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "#f5f5f5" }}>Docs</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>docs.blackroad.io</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", textDecoration: "none" }}>GitHub</a>
            <a href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", textDecoration: "none" }}>API</a>
            <a href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", textDecoration: "none" }}>Status</a>
          </div>
        </header>

        <div style={{ display: "flex", minHeight: "calc(100vh - 49px)" }}>
          {/* Sidebar */}
          {(!isMobile || sidebarOpen) && (
            <aside
              style={{
                width: isMobile ? "100%" : 220,
                flexShrink: 0,
                background: "#0e0e0e",
                borderRight: isMobile ? "none" : "1px solid #1a1a1a",
                overflowY: "auto",
                position: isMobile ? "fixed" : "sticky",
                top: isMobile ? 49 : 49,
                left: 0,
                bottom: 0,
                zIndex: 40,
                height: isMobile ? "calc(100vh - 49px)" : "calc(100vh - 49px)",
              }}
            >
              <SidebarContent />
            </aside>
          )}

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0, padding: "32px 28px 80px", maxWidth: 780 }}>
            {/* Breadcrumb */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginBottom: 24, display: "flex", gap: 6 }}>
              <span>docs</span>
              <span>/</span>
              <span style={{ color: "#525252" }}>{activePage}</span>
            </div>

            {getContent(activePage)}

            {/* Prev/Next */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 56, paddingTop: 24, borderTop: "1px solid #1a1a1a", flexWrap: "wrap", gap: 12 }}>
              {(() => {
                const idx = allItems.findIndex((i) => i.id === activePage);
                const prev = idx > 0 ? allItems[idx - 1] : null;
                const next = idx < allItems.length - 1 ? allItems[idx + 1] : null;
                return (
                  <>
                    {prev ? (
                      <button onClick={() => handleNav(prev.id)} style={{ background: "none", border: "1px solid #1a1a1a", borderRadius: 8, padding: "12px 18px", cursor: "pointer", textAlign: "left" }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", marginBottom: 4 }}>← Previous</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#a3a3a3" }}>{prev.label}</div>
                      </button>
                    ) : (
                      <div />
                    )}
                    {next ? (
                      <button onClick={() => handleNav(next.id)} style={{ background: "none", border: "1px solid #1a1a1a", borderRadius: 8, padding: "12px 18px", cursor: "pointer", textAlign: "right" }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", marginBottom: 4 }}>Next →</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#a3a3a3" }}>{next.label}</div>
                      </button>
                    ) : (
                      <div />
                    )}
                  </>
                );
              })()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
