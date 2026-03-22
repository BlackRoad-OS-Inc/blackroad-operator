import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const ORGS = [
  {
    name: "BlackRoad-OS-Inc",
    url: "https://github.com/BlackRoad-OS-Inc",
    tier: "enterprise",
    desc: "Enterprise root — data layer, coordination hub. Able to ask everything to anyone.",
    repos: ["blackroad-operator", "company-docs", "legal", "brand-assets"],
  },
  {
    name: "BlackRoad-OS",
    url: "https://github.com/BlackRoad-OS",
    tier: "core",
    desc: "Core operating system. Coordinates all other organizations.",
    repos: ["blackroad-os-web", "blackroad-os-api-gateway", "blackroad-os-auth", "blackroad-os-agents", "blackroad-os-memory", "blackroad-os-prism-console", "blackroad-os-docs", "blackroad-os-demo", "blackroad-os-beacon"],
  },
  {
    name: "BlackRoad-AI",
    url: "https://github.com/BlackRoad-AI",
    tier: "product",
    desc: "AI models, agent frameworks, inference pipelines, Lucidia core.",
    repos: ["lucidia-core", "agent-mesh", "inference-gateway", "ps-sha-infinity"],
  },
  {
    name: "BlackRoad-Studio",
    url: "https://github.com/BlackRoad-Studio",
    tier: "product",
    desc: "Creator tools, Unity agent homes, rendering, design studio.",
    repos: ["blackroad-os-studio", "blackroad-unity-homes", "blackroad-os-creator", "blackroad-os-gallery"],
  },
  {
    name: "BlackRoad-Education",
    url: "https://github.com/BlackRoad-Education",
    tier: "product",
    desc: "RoadWork, tutoring, curriculum tools, homework flows.",
    repos: ["blackroad-os-pack-education", "roadwork-v0", "math-road"],
  },
  {
    name: "BlackRoad-Media",
    url: "https://github.com/BlackRoad-Media",
    tier: "product",
    desc: "RoadView, RoadTube, SoundRoad — video, audio, search pipelines.",
    repos: ["roadview", "roadtube", "soundroad", "cadence-engine"],
  },
  {
    name: "BlackRoad-Interactive",
    url: "https://github.com/BlackRoad-Interactive",
    tier: "product",
    desc: "Genesis Road, RoadWorld — game engine, virtual environments.",
    repos: ["genesis-road", "roadworld", "physics-sandbox"],
  },
  {
    name: "BlackRoad-Cloud",
    url: "https://github.com/BlackRoad-Cloud",
    tier: "infra",
    desc: "Infrastructure, K3s clusters, Cloudflare Workers, edge compute.",
    repos: ["blackroad-os-infra", "cloudflare-workers", "k3s-config", "edge-runtime"],
  },
  {
    name: "BlackRoad-Security",
    url: "https://github.com/BlackRoad-Security",
    tier: "infra",
    desc: "Auth, encryption, PS-SHA∞ identity, certificates, zero-trust.",
    repos: ["blackroad-os-auth", "identity-protocol", "cert-manager"],
  },
  {
    name: "BlackRoad-Gov",
    url: "https://github.com/BlackRoad-Gov",
    tier: "infra",
    desc: "Cece governance engine — policies, ledger, intents, delegations.",
    repos: ["cece-core", "policy-engine", "ledger-service", "intent-service"],
  },
  {
    name: "BlackRoad-Hardware",
    url: "https://github.com/BlackRoad-Hardware",
    tier: "infra",
    desc: "Pi mesh fleet, Jetson nodes, edge devices, NATS messaging.",
    repos: ["pi-mesh", "edge-agent", "nats-config", "device-registry"],
  },
  {
    name: "BlackRoad-Labs",
    url: "https://github.com/BlackRoad-Labs",
    tier: "research",
    desc: "Research, quantum computing, experimental frameworks.",
    repos: ["z-framework", "pauli-model", "spiral-geometry", "contradiction-engine"],
  },
  {
    name: "BlackRoad-Foundation",
    url: "https://github.com/BlackRoad-Foundation",
    tier: "research",
    desc: "Open source projects, community tools, grants, education.",
    repos: ["open-source", "community-tools", "grants"],
  },
  {
    name: "BlackRoad-Ventures",
    url: "https://github.com/BlackRoad-Ventures",
    tier: "corporate",
    desc: "Investments, partnerships, ecosystem development.",
    repos: ["partnerships", "ecosystem-map"],
  },
  {
    name: "BlackRoad-Archive",
    url: "https://github.com/BlackRoad-Archive",
    tier: "corporate",
    desc: "Historical documents, conversation archives, legacy code.",
    repos: ["archive-2024", "conversation-logs", "legacy-proofs"],
  },
  {
    name: "Blackbox-Enterprises",
    url: "https://github.com/Blackbox-Enterprises",
    tier: "corporate",
    desc: "Developer brand — blackboxprogramming.io, public APIs.",
    repos: ["blackbox-site", "public-api", "dev-tools"],
  },
];

const FLEET = [
  { name: "Alice", ip: "192.168.4.49", role: "Gateway", emoji: "🌐", color: "#00D4FF", services: ["Pi-hole", "PostgreSQL", "Qdrant", "Redis", "nginx"], status: "online" },
  { name: "Cecilia", ip: "192.168.4.96", role: "AI Engine", emoji: "🧠", color: "#9C27B0", services: ["Ollama (16 models)", "Hailo-8 (26 TOPS)", "MinIO", "InfluxDB"], status: "online" },
  { name: "Octavia", ip: "192.168.4.101", role: "Architect", emoji: "🐙", color: "#FF6B2B", services: ["Gitea (239 repos)", "Docker", "NATS", "15 Workers"], status: "online" },
  { name: "Aria", ip: "192.168.4.98", role: "Interface", emoji: "🎵", color: "#E91E63", services: ["Dashboards", "Monitoring", "UIs"], status: "offline" },
  { name: "Lucidia", ip: "192.168.4.38", role: "Dreamer", emoji: "💡", color: "#FFC107", services: ["334 web apps", "PowerDNS", "Ollama", "GH Runners"], status: "online" },
  { name: "Gematria", ip: "nyc3", role: "Edge Router", emoji: "🔷", color: "#4488FF", services: ["Caddy TLS (151 domains)", "Ollama (6 models)", "PowerDNS"], status: "online" },
  { name: "Anastasia", ip: "nyc1", role: "Cloud Edge", emoji: "☁️", color: "#00D4FF", services: ["Caddy", "Domain hosting", "Failover"], status: "online" },
];

const PRODUCTS = [
  { name: "Lucidia", tier: "core", status: "building", price: "$20/mo", desc: "AI companion with infinite memory", domain: "lucidiaqi.com" },
  { name: "RoadWork", tier: "education", status: "building", price: "$9.99/mo", desc: "Accessibility-first education", domain: "roadwork.blackroad.io" },
  { name: "RoadChain", tier: "blockchain", status: "building", price: "—", desc: "Verification, not speculation", domain: "roadchain.io" },
  { name: "RoadPay", tier: "payments", status: "live", price: "2.5% + $0.30", desc: "Sovereign payment processing", domain: "roadpay.blackroad.io" },
  { name: "Canvas Studio", tier: "creator", status: "building", price: "$29/mo", desc: "Design without design school", domain: "lucidia.studio" },
  { name: "Video Studio", tier: "creator", status: "building", price: "$29/mo", desc: "Browser-native 4K editing", domain: "lucidia.studio" },
  { name: "Writing Studio", tier: "creator", status: "building", price: "$19/mo", desc: "Words that ship", domain: "lucidia.studio" },
  { name: "RoadTube", tier: "media", status: "planned", price: "90%+ rev share", desc: "Where STEM creators thrive", domain: "roadtube.blackroad.io" },
  { name: "BackRoad", tier: "social", status: "building", price: "Free", desc: "Social without the algorithm", domain: "backroad.blackroad.io" },
  { name: "RoundTrip", tier: "core", status: "live", price: "Free", desc: "Agent communication hub", domain: "roundtrip.blackroad.io" },
  { name: "RoadCoin", tier: "finance", status: "building", price: "0.5% tx fee", desc: "Utility, not speculation", domain: "roadcoin.io" },
  { name: "Prism Console", tier: "enterprise", status: "live", price: "$99/mo", desc: "Enterprise dashboard", domain: "prism.blackroad.io" },
  { name: "Black Mode", tier: "ai", status: "planned", price: "$29/mo", desc: "Sovereign AI IDE", domain: "blackroadai.com" },
  { name: "Radius", tier: "research", status: "planned", price: "$49/mo", desc: "Digital sandbox for physics", domain: "blackroadquantum.com" },
  { name: "Hailo Vision", tier: "hardware", status: "building", price: "—", desc: "Edge AI at 52 TOPS", domain: "blackroad.systems" },
];

const AGENT_OS_LAYERS = [
  { layer: "LLM Gateway", repos: "TensorZero + LiteLLM", fn: "Sub-ms model routing for 30K agents", color: COLORS[0] },
  { layer: "Agent Runtime", repos: "Mastra (TS) + Rig (Rust/WASM)", fn: "Browser-native agent execution", color: COLORS[1] },
  { layer: "Agent Memory", repos: "Mem0 + Letta (.af format)", fn: "Per-agent and shared memory", color: COLORS[2] },
  { layer: "Event Mesh", repos: "Solace patterns + Ractor", fn: "Decoupled, priority channels", color: COLORS[3] },
  { layer: "Sandboxing", repos: "workerd / rquickjs + Extism", fn: "Isolation for 30K concurrent agents", color: COLORS[4] },
  { layer: "Component Model", repos: "jco + wasm_component_layer", fn: "Cross-language agent interfaces (WIT)", color: COLORS[5] },
  { layer: "Storage", repos: "sql.js + opfs-tools", fn: "Persistent browser-native state", color: COLORS[0] },
  { layer: "P2P Mesh", repos: "Rings Network", fn: "Decentralized agent routing", color: COLORS[1] },
  { layer: "Scheduling", repos: "Tokio + Crossbeam primitives", fn: "Work-stealing agent scheduler", color: COLORS[2] },
  { layer: "Security", repos: "seL4 capability + Tock capsule", fn: "Agent permissions and isolation", color: COLORS[3] },
  { layer: "Build System", repos: "Moon + Turborepo + mise", fn: "Polyglot monorepo orchestration", color: COLORS[4] },
  { layer: "Dev Portal", repos: "Backstage + Ratatui dashboards", fn: "Mission control and observability", color: COLORS[5] },
];

const SOVEREIGNTY_STACK = [
  { service: "Git", self: "Gitea · Octavia", replaces: "GitHub", repos: "239" },
  { service: "AI Inference", self: "Ollama · 4 nodes", replaces: "OpenAI / Anthropic", repos: "52 TOPS" },
  { service: "Workers", self: "workerd · Octavia :9001-9015", replaces: "CF Workers", repos: "15" },
  { service: "Object Storage", self: "MinIO · Cecilia", replaces: "CF R2 / S3", repos: "4 buckets" },
  { service: "DNS", self: "PowerDNS · Lucidia + Gematria", replaces: "Cloudflare DNS", repos: "151 records" },
  { service: "PaaS", self: "Deploy API · Octavia :3500", replaces: "Railway / Heroku", repos: "—" },
  { service: "Database", self: "PostgreSQL · 3 nodes", replaces: "CF D1 / Supabase", repos: "—" },
  { service: "Cache", self: "Redis · Alice", replaces: "CF KV", repos: "—" },
  { service: "TLS Edge", self: "Caddy · Gematria", replaces: "CF proxy", repos: "151 domains" },
  { service: "VPN", self: "WireGuard mesh", replaces: "Tailscale", repos: "12/12" },
  { service: "Chat", self: "RoundTrip (D1) + chat.blackroad.io", replaces: "Slack", repos: "69 agents" },
  { service: "CI/CD", self: "Gitea Actions + act_runner", replaces: "GitHub Actions", repos: "—" },
];

const DOMAINS = [
  { domain: "blackroad.io", purpose: "Main OS & product site", tier: "core", layer: "Experience" },
  { domain: "blackroad.systems", purpose: "Internal ops, infra, APIs", tier: "core", layer: "Governance" },
  { domain: "blackroad.network", purpose: "Agent & device mesh", tier: "core", layer: "Infrastructure" },
  { domain: "blackroadinc.us", purpose: "Legal / corporate entity", tier: "core", layer: "Corporate" },
  { domain: "blackroad.me", purpose: "Founder personal hub", tier: "core", layer: "Personal" },
  { domain: "blackroad.company", purpose: "Public corporate site", tier: "core", layer: "Corporate" },
  { domain: "lucidia.earth", purpose: "Lucidia AI platform", tier: "product", layer: "Experience" },
  { domain: "lucidia.studio", purpose: "Creator tools & Unity homes", tier: "product", layer: "Experience" },
  { domain: "roadchain.io", purpose: "Blockchain / ledger protocol", tier: "product", layer: "Product" },
  { domain: "roadcoin.io", purpose: "Token / economic layer", tier: "product", layer: "Product" },
  { domain: "blackroadai.com", purpose: "AI-focused marketing", tier: "product", layer: "Experience" },
  { domain: "blackboxprogramming.io", purpose: "Developer / creator brand", tier: "product", layer: "Product" },
  { domain: "blackroadquantum.com", purpose: "Quantum research hub", tier: "quantum", layer: "Research" },
  { domain: "blackroadquantum.info", purpose: "Quantum education", tier: "quantum", layer: "Research" },
  { domain: "blackroadquantum.net", purpose: "Quantum network infra", tier: "quantum", layer: "Research" },
  { domain: "blackroadquantum.shop", purpose: "Merch / products", tier: "quantum", layer: "Commerce" },
  { domain: "blackroadquantum.store", purpose: "Merch / products", tier: "quantum", layer: "Commerce" },
  { domain: "blackroadqi.com", purpose: "Quantum identity portal", tier: "quantum", layer: "Research" },
  { domain: "lucidiaqi.com", purpose: "Lucidia + QI hybrid", tier: "quantum", layer: "Research" },
  { domain: "aliceqi.com", purpose: "Alice agent identity", tier: "agent", layer: "Agent" },
];

const TIER_COLORS = {
  enterprise: COLORS[0], core: COLORS[1], product: COLORS[2],
  infra: COLORS[3], research: COLORS[4], corporate: COLORS[5],
  quantum: COLORS[4], agent: COLORS[5],
};

function GradientBar({ height = 1 }) {
  return <div style={{ height, background: GRADIENT }} />;
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
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginLeft: 4 }}>Index</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a href="#orgs" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Orgs</a>
        <a href="#domains" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Domains</a>
        <a href="#fleet" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Fleet</a>
        <a href="#products" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Products</a>
        <a href="#agent-os" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Agent OS</a>
        <a href="#map" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Map</a>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section style={{ padding: "56px 20px 48px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {COLORS.map((c) => <div key={c} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />)}
          </div>
          Ecosystem Index
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 7vw, 52px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
          Every org.<br />Every domain.<br />One map.
        </h1>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.65, maxWidth: 500, marginBottom: 32 }}>
          The complete BlackRoad ecosystem — 16 GitHub organizations, 20 Cloudflare domains, and the architecture that connects them all. Intelligent turtles all the way down.
        </p>

        {/* Quick counts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1, background: "#1a1a1a", borderRadius: 12, overflow: "hidden" }}>
          {[
            { v: "16", l: "GitHub Orgs" },
            { v: "20", l: "Domains" },
            { v: "92", l: "Products" },
            { v: "69", l: "Agents" },
            { v: "7", l: "Nodes" },
            { v: "52", l: "TOPS" },
          ].map((s) => (
            <div key={s.l} style={{ background: "#131313", padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, color: "#f5f5f5" }}>{s.v}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OrgsSection() {
  const [filter, setFilter] = useState("all");
  const [expandedOrg, setExpandedOrg] = useState(null);
  const tiers = ["all", "enterprise", "core", "product", "infra", "research", "corporate"];
  const filtered = filter === "all" ? ORGS : ORGS.filter((o) => o.tier === filter);

  return (
    <section id="orgs" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          GitHub Organizations
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 24 }}>
          16 orgs. One enterprise.
        </h2>

        {/* Filters */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
          {tiers.map((t) => (
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

        {/* Org cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((org, i) => (
            <div key={org.name} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
              <button
                onClick={() => setExpandedOrg(expandedOrg === org.name ? null : org.name)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: "none", border: "none", padding: "16px 20px",
                  display: "flex", alignItems: "flex-start", gap: 14,
                }}
              >
                <div style={{ width: 4, height: 24, borderRadius: 2, background: TIER_COLORS[org.tier], flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 500, color: "#d4d4d4" }}>{org.name}</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                      color: "#333", textTransform: "uppercase", letterSpacing: "0.06em",
                      background: "#0a0a0a", padding: "2px 7px", borderRadius: 3, border: "1px solid #151515",
                    }}>
                      {org.tier}
                    </span>
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", lineHeight: 1.4 }}>{org.desc}</div>
                </div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#333",
                  transform: expandedOrg === org.name ? "rotate(45deg)" : "none",
                  transition: "transform 0.2s ease", flexShrink: 0, marginTop: 4,
                }}>+</span>
              </button>

              {expandedOrg === org.name && (
                <div style={{ padding: "0 20px 16px" }}>
                  <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 14 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Repositories</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {org.repos.map((r) => (
                        <span key={r} style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#737373",
                          background: "#0a0a0a", padding: "5px 10px", borderRadius: 4,
                          border: "1px solid #151515",
                        }}>
                          {r}
                        </span>
                      ))}
                    </div>
                    <a href={org.url} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-block", marginTop: 12,
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040",
                      textDecoration: "none",
                    }}>
                      → {org.url.replace("https://github.com/", "github.com/")}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", textAlign: "center", marginTop: 16 }}>
          {filter === "all" ? `${ORGS.length} organizations` : `${filtered.length} ${filter}`} · github.com/enterprises/blackroad-os
        </div>
      </div>
    </section>
  );
}

function DomainsSection() {
  const [tierFilter, setTierFilter] = useState("all");
  const tiers = ["all", "core", "product", "quantum", "agent"];
  const filtered = tierFilter === "all" ? DOMAINS : DOMAINS.filter((d) => d.tier === tierFilter);

  return (
    <section id="domains" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Cloudflare Domains
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 24 }}>
          20 domains. All Cloudflare.
        </h2>

        {/* Filters */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
          {tiers.map((t) => (
            <button key={t} onClick={() => setTierFilter(t)} style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500,
              textTransform: "uppercase", letterSpacing: "0.06em",
              color: tierFilter === t ? "#f5f5f5" : "#404040",
              background: tierFilter === t ? "#1a1a1a" : "transparent",
              border: "1px solid #1a1a1a", borderRadius: 5,
              padding: "5px 12px", cursor: "pointer",
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Domain table */}
        <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
          {filtered.map((d, i) => (
            <div key={d.domain} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 18px",
              borderBottom: i < filtered.length - 1 ? "1px solid #141414" : "none",
              flexWrap: "wrap",
            }}>
              <div style={{ width: 4, height: 14, borderRadius: 1, background: TIER_COLORS[d.tier], flexShrink: 0 }} />
              <a href={`https://${d.domain}`} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#d4d4d4",
                textDecoration: "none", flex: "1 1 180px", minWidth: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {d.domain}
              </a>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252", flex: "1 1 140px" }}>{d.purpose}</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333",
                textTransform: "uppercase", letterSpacing: "0.06em",
                background: "#0a0a0a", padding: "3px 8px", borderRadius: 3,
                border: "1px solid #151515", flexShrink: 0,
              }}>
                {d.layer}
              </span>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", textAlign: "center", marginTop: 16 }}>
          {tierFilter === "all" ? "20 domains" : `${filtered.length} ${tierFilter}`} · Cloudflare DNS
        </div>
      </div>
    </section>
  );
}

function ArchMapSection() {
  return (
    <section id="map" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Architecture Map
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 24 }}>
          How it all connects.
        </h2>

        {/* Terminal-style architecture view */}
        <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginLeft: 6 }}>ecosystem.map</span>
          </div>
          <div style={{ padding: "20px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2 }}>
            <div style={{ color: "#404040" }}>{"# BlackRoad OS — Full Ecosystem"}</div>
            <div style={{ color: "#404040" }}>{"#"}</div>

            <div style={{ color: "#f5f5f5", marginTop: 4 }}>
              <span style={{ color: COLORS[0] }}>■</span> github.com/enterprises/blackroad-os
            </div>
            <div style={{ color: "#d4d4d4", paddingLeft: 18 }}>
              <span style={{ color: COLORS[1] }}>■</span> BlackRoad-OS-Inc <span style={{ color: "#333" }}>← enterprise root</span>
            </div>
            <div style={{ color: "#a3a3a3", paddingLeft: 36 }}>
              <span style={{ color: COLORS[2] }}>■</span> BlackRoad-OS <span style={{ color: "#333" }}>← coordinates all orgs</span>
            </div>

            <div style={{ color: "#404040", paddingLeft: 36, marginTop: 8 }}>{"# Product orgs"}</div>
            {["BlackRoad-AI", "BlackRoad-Studio", "BlackRoad-Education", "BlackRoad-Media", "BlackRoad-Interactive"].map((n) => (
              <div key={n} style={{ color: "#737373", paddingLeft: 54 }}>├── {n}</div>
            ))}

            <div style={{ color: "#404040", paddingLeft: 36, marginTop: 8 }}>{"# Infrastructure orgs"}</div>
            {["BlackRoad-Cloud", "BlackRoad-Security", "BlackRoad-Gov", "BlackRoad-Hardware"].map((n) => (
              <div key={n} style={{ color: "#737373", paddingLeft: 54 }}>├── {n}</div>
            ))}

            <div style={{ color: "#404040", paddingLeft: 36, marginTop: 8 }}>{"# Research & corporate"}</div>
            {["BlackRoad-Labs", "BlackRoad-Foundation", "BlackRoad-Ventures", "BlackRoad-Archive", "Blackbox-Enterprises"].map((n, i, a) => (
              <div key={n} style={{ color: "#737373", paddingLeft: 54 }}>{i < a.length - 1 ? "├──" : "└──"} {n}</div>
            ))}

            <div style={{ color: "#404040", marginTop: 16 }}>{"# Domain layers"}</div>
            <div style={{ color: "#a3a3a3", paddingLeft: 18 }}>
              <span style={{ color: COLORS[0] }}>■</span> Experience {"  "}*.blackroad.io · *.lucidia.earth · *.lucidia.studio
            </div>
            <div style={{ color: "#a3a3a3", paddingLeft: 18 }}>
              <span style={{ color: COLORS[2] }}>■</span> Governance {"  "}*.blackroad.systems
            </div>
            <div style={{ color: "#a3a3a3", paddingLeft: 18 }}>
              <span style={{ color: COLORS[3] }}>■</span> Infra {"       "}*.blackroad.network
            </div>
            <div style={{ color: "#a3a3a3", paddingLeft: 18 }}>
              <span style={{ color: COLORS[5] }}>■</span> Data {"        "}internal services
            </div>

            <div style={{ color: "#262626", marginTop: 16 }}>
              — 16 orgs · 20 domains · 150+ subdomains · 4 layers —
            </div>
          </div>
        </div>

        {/* Layer → Org → Domain mapping */}
        <div style={{ marginTop: 20 }}>
          {[
            { layer: "Experience", color: COLORS[0], orgs: ["BlackRoad-OS", "BlackRoad-Studio", "BlackRoad-AI"], domains: ["blackroad.io", "lucidia.earth", "lucidia.studio", "blackroadai.com"] },
            { layer: "Product", color: COLORS[1], orgs: ["BlackRoad-Education", "BlackRoad-Media", "BlackRoad-Interactive"], domains: ["roadchain.io", "roadcoin.io", "blackboxprogramming.io"] },
            { layer: "Governance", color: COLORS[2], orgs: ["BlackRoad-Gov", "BlackRoad-Security"], domains: ["blackroad.systems"] },
            { layer: "Infrastructure", color: COLORS[3], orgs: ["BlackRoad-Cloud", "BlackRoad-Hardware"], domains: ["blackroad.network"] },
            { layer: "Research", color: COLORS[4], orgs: ["BlackRoad-Labs", "BlackRoad-Foundation"], domains: ["blackroadquantum.com", "blackroadquantum.info", "blackroadqi.com", "lucidiaqi.com"] },
            { layer: "Corporate", color: COLORS[5], orgs: ["BlackRoad-Ventures", "BlackRoad-Archive", "Blackbox-Enterprises"], domains: ["blackroadinc.us", "blackroad.company", "blackroad.me"] },
          ].map((l) => (
            <div key={l.layer} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 8, padding: "16px 18px", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 4, height: 16, borderRadius: 2, background: l.color }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: "#f5f5f5" }}>{l.layer}</span>
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", paddingLeft: 12 }}>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", marginBottom: 6 }}>Orgs</div>
                  {l.orgs.map((o) => (
                    <div key={o} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#737373", padding: "2px 0" }}>{o}</div>
                  ))}
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", marginBottom: 6 }}>Domains</div>
                  {l.domains.map((d) => (
                    <div key={d} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", padding: "2px 0" }}>{d}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FleetSection() {
  return (
    <section id="fleet" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Infrastructure
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 8 }}>
          7 nodes. One mesh.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", marginBottom: 24 }}>
          5 Raspberry Pis + 2 DigitalOcean droplets. 52 TOPS. WireGuard mesh 12/12. $136/month.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FLEET.map((node) => (
            <div key={node.name} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{node.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: "#f5f5f5" }}>{node.name}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040" }}>{node.ip}</span>
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252" }}>{node.role}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: node.status === "online" ? "#22c55e" : "#ef4444" }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: node.status === "online" ? "#22c55e" : "#ef4444" }}>{node.status}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {node.services.map((s) => (
                  <span key={s} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", background: "#0a0a0a", padding: "3px 8px", borderRadius: 3, border: "1px solid #151515" }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SovereigntySection() {
  return (
    <section id="sovereignty" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Sovereignty Stack
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 8 }}>
          Self-hosted everything.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", marginBottom: 24 }}>
          $925 one-time hardware vs $2,220–8,400/yr cloud. Break-even: 6.2 months.
        </p>

        <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.5fr 80px", gap: 0, padding: "10px 18px", borderBottom: "1px solid #1a1a1a" }}>
            {["Service", "Self-Hosted", "Replaces", "Scale"].map((h) => (
              <span key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
            ))}
          </div>
          {SOVEREIGNTY_STACK.map((row, i) => (
            <div key={row.service} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.5fr 80px", gap: 0, padding: "10px 18px", borderBottom: i < SOVEREIGNTY_STACK.length - 1 ? "1px solid #141414" : "none" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#d4d4d4", fontWeight: 500 }}>{row.service}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#737373" }}>{row.self}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", textDecoration: "line-through" }}>{row.replaces}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", textAlign: "right" }}>{row.repos}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsSection() {
  const [filter, setFilter] = useState("all");
  const tiers = ["all", "core", "creator", "education", "ai", "finance", "media", "social", "enterprise", "research", "hardware", "blockchain", "payments"];
  const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.tier === filter);
  const statusColor = { live: "#22c55e", building: "#f59e0b", planned: "#525252" };

  return (
    <section id="products" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Products
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 24 }}>
          92 products. 15 shown.
        </h2>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
          {tiers.filter((t) => t === "all" || PRODUCTS.some((p) => p.tier === t)).map((t) => (
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

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((p) => (
            <div key={p.name} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[p.status], flexShrink: 0 }} />
              <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: "#f5f5f5" }}>{p.name}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252" }}>{p.desc}</div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#737373", flexShrink: 0 }}>{p.price}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", background: "#0a0a0a", padding: "3px 8px", borderRadius: 3, border: "1px solid #151515", flexShrink: 0 }}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentOSSection() {
  return (
    <section id="agent-os" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Agent OS
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 8 }}>
          30K agents in a browser.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", marginBottom: 24 }}>
          rquickjs at 210KB per interpreter makes it physically possible. 30K agents = 6.3GB. Actor/event-mesh is the convergence.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#1a1a1a", borderRadius: 10, overflow: "hidden" }}>
          {AGENT_OS_LAYERS.map((l) => (
            <div key={l.layer} style={{ background: "#131313", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 4, height: 28, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              <div style={{ flex: "1 1 120px", minWidth: 0 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: "#f5f5f5" }}>{l.layer}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", marginTop: 2 }}>{l.repos}</div>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", flex: "1 1 200px" }}>{l.fn}</div>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", textAlign: "center", marginTop: 16 }}>
          12 layers · workerd + Lunatic + Solace Agent Mesh
        </div>
      </div>
    </section>
  );
}

function AmundsonSection() {
  return (
    <section id="math" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Mathematics
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 24 }}>
          The Amundson Framework
        </h2>

        <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: "32px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(18px, 4vw, 28px)", color: "#f5f5f5", marginBottom: 16 }}>
            G(n) = n<sup style={{ fontSize: "0.7em" }}>(n+1)</sup> / (n+1)<sup style={{ fontSize: "0.7em" }}>n</sup>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#f5f5f5" }}>1.24433</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", textTransform: "uppercase" }}>A_G constant</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#f5f5f5" }}>536/536</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", textTransform: "uppercase" }}>Tests passed</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#f5f5f5" }}>4 Pis</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", textTransform: "uppercase" }}>Verified on</div>
            </div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#525252", lineHeight: 1.8 }}>
            n / (1 + 1/n)<sup>n</sup> → n/e + 1/(2e) + O(1/n)<br />
            <span style={{ color: "#404040" }}>The 1/(2e) is the irreducible gap.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "40px 20px 48px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <GradientBar />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {COLORS.map((c) => <div key={c} style={{ width: 3, height: 10, borderRadius: 2, background: c }} />)}
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: "#a3a3a3" }}>BlackRoad OS, Inc.</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>
              16 orgs · 20 domains · Intelligent turtles all the way down
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

export default function EcosystemIndex() {
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
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <GradientBar />
        <Nav />
        <HeroSection />
        <GradientBar />
        <OrgsSection />
        <GradientBar />
        <DomainsSection />
        <GradientBar />
        <FleetSection />
        <GradientBar />
        <SovereigntySection />
        <GradientBar />
        <ProductsSection />
        <GradientBar />
        <AgentOSSection />
        <GradientBar />
        <AmundsonSection />
        <GradientBar />
        <ArchMapSection />
        <Footer />
      </div>
    </>
  );
}
