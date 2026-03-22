import { useState, useEffect } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

// ─── Code samples (neutral — no package refs) ─────────────────────
const SNIPPETS = {
  zPrimitive: [
    "# The Z primitive",
    "Z := yx - w",
    "",
    "# Where:",
    "#   y = system output",
    "#   x = system input",
    "#   w = disturbance / noise",
    "#   Z = corrective signal",
  ].join("\n"),

  initWorkspace: [
    "br init my-workspace",
    "cd my-workspace",
  ].join("\n"),

  apiKey: "export BR_API_KEY=br_live_xxxxxxxxxxxx",

  spawnAgent: [
    "const br = new BlackRoadClient({",
    "  apiKey: process.env.BR_API_KEY",
    "});",
    "",
    "const agent = await br.agents.spawn({",
    "  name: 'lucidia',",
    "  memory: true,",
    "  context: 'Sovereign AI assistant.',",
    "});",
    "",
    "const reply = await agent.chat('Hello.');",
    "console.log(reply.text);",
  ].join("\n"),

  dockerCompose: [
    "services:",
    "  blackroad:",
    "    image: blackroad/os:latest",
    "    ports:",
    '      - "8080:8080"',
    "    environment:",
    "      - BR_ENV=development",
    "    volumes:",
    "      - ./data:/data",
    "",
    "  roadcode:",
    "    image: blackroad/roadcode:latest",
    "    ports:",
    '      - "3000:3000"',
    "    environment:",
    "      - GIT_DATA=/srv/git",
  ].join("\n"),

  k3sSetup: [
    "# Install K3s on Alice (control plane / gateway)",
    "curl -sfL https://get.k3s.io | sh -",
    "",
    "# Get the join token",
    "cat /var/lib/rancher/k3s/server/node-token",
    "",
    "# Join Octavia (AI worker — 1TB NVMe, Hailo-8L)",
    "curl -sfL https://get.k3s.io | \\",
    "  K3S_URL=https://alice:6443 \\",
    "  K3S_TOKEN=<node-token> sh -",
    "",
    "# Join Cecilia (storage / build node)",
    "curl -sfL https://get.k3s.io | \\",
    "  K3S_URL=https://alice:6443 \\",
    "  K3S_TOKEN=<node-token> sh -",
    "",
    "# Join Aria (edge / sensor node)",
    "curl -sfL https://get.k3s.io | \\",
    "  K3S_URL=https://alice:6443 \\",
    "  K3S_TOKEN=<node-token> sh -",
  ].join("\n"),

  wireguardMesh: [
    "# WireGuard mesh — connects all nodes",
    "# Alice    10.0.0.1  (Pi 5 — gateway)",
    "# Octavia  10.0.0.2  (Pi 5 — AI worker)",
    "# Cecilia  10.0.0.3  (Pi 5 — storage)",
    "# Aria     10.0.0.4  (Pi 5 — edge)",
    "# Gematria 10.0.0.5  (DO droplet)",
    "# Anastasia 10.0.0.6 (DO droplet)",
    "",
    "[Interface]",
    "PrivateKey = <key>",
    "Address = 10.0.0.1/24",
    "ListenPort = 51820",
    "",
    "[Peer] # Octavia",
    "PublicKey = <key>",
    "AllowedIPs = 10.0.0.2/32",
    "Endpoint = octavia.blackroad.io:51820",
  ].join("\n"),

  cloudflareWorker: [
    "// Cloudflare Worker — api.blackroad.io",
    "export default {",
    "  async fetch(request, env) {",
    "    const url = new URL(request.url);",
    "    if (url.pathname.startsWith('/v1/agents')) {",
    "      return env.AGENT_SERVICE.fetch(request);",
    "    }",
    "    return new Response('BlackRoad API', {",
    "      headers: { 'X-Powered-By': 'Z:=yx-w' }",
    "    });",
    "  }",
    "};",
  ].join("\n"),

  eventBus: [
    "// Publish an event",
    "await br.events.publish('task.created', {",
    "  id: 'task_123',",
    "  priority: 'high',",
    "});",
    "",
    "// Subscribe to events",
    "br.events.on('task.created', async (event) => {",
    "  await lucidia.handle(event);",
    "});",
  ].join("\n"),

  restExample: [
    "POST /v1/agents/spawn",
    "Authorization: Bearer br_live_xxxx",
    "Content-Type: application/json",
    "",
    "{",
    '  "name": "lucidia",',
    '  "memory": true',
    "}",
  ].join("\n"),
};

// ─── Sidebar structure ────────────────────────────────────────────
const SIDEBAR = [
  {
    section: "Getting Started",
    pages: [
      { id: "intro",      label: "Introduction",    badge: null      },
      { id: "quickstart", label: "Quick Start",     badge: "5 min"   },
      { id: "install",    label: "Installation",    badge: null      },
      { id: "concepts",   label: "Core Concepts",   badge: null      },
    ],
  },
  {
    section: "Agents",
    pages: [
      { id: "alice",      label: "Alice",            badge: null     },
      { id: "lucidia",    label: "Lucidia",          badge: null     },
      { id: "cecilia",    label: "Cecilia",          badge: null     },
      { id: "cece",       label: "Cece",             badge: null     },
      { id: "aria",       label: "Aria",             badge: null     },
      { id: "eve",        label: "Eve",              badge: "new"    },
      { id: "meridian",   label: "Meridian",         badge: null     },
      { id: "sentinel",   label: "Sentinel",         badge: null     },
    ],
  },
  {
    section: "Infrastructure",
    pages: [
      { id: "k3s",        label: "K3s Cluster",      badge: null     },
      { id: "docker",     label: "Docker Swarm",     badge: null     },
      { id: "wireguard",  label: "WireGuard Mesh",   badge: null     },
      { id: "cloudflare", label: "Cloudflare Edge",  badge: null     },
      { id: "hardware",   label: "Hardware Nodes",   badge: null     },
    ],
  },
  {
    section: "Products",
    pages: [
      { id: "brcloud",    label: "BlackRoad Cloud",  badge: null     },
      { id: "roadcode",   label: "RoadCode",         badge: null     },
      { id: "roadchain",  label: "RoadChain",        badge: "beta"   },
      { id: "lucidiaapp", label: "Lucidia",          badge: null     },
    ],
  },
  {
    section: "API Reference",
    pages: [
      { id: "rest",       label: "REST API",         badge: null     },
      { id: "sdk",        label: "SDK",              badge: null     },
      { id: "webhooks",   label: "Webhooks",         badge: "beta"   },
      { id: "errors",     label: "Error Codes",      badge: null     },
    ],
  },
  {
    section: "Z-Framework",
    pages: [
      { id: "zcore",      label: "Z Core",           badge: null     },
      { id: "primitives", label: "Primitives",       badge: null     },
      { id: "feedback",   label: "Feedback Loops",   badge: null     },
    ],
  },
];

// ─── Page content ─────────────────────────────────────────────────
const PAGES = {
  intro: {
    title: "Introduction", section: "Getting Started", readTime: "5 min read",
    prev: null, next: { id: "quickstart", label: "Quick Start" },
    content: [
      { type: "lead", text: "BlackRoad OS is the operating system for AI-native organizations — sovereign infrastructure, sentient agents, and spatial interfaces unified under the Z-framework. Built by Alexa Louise Amundson. BlackRoad OS, Inc. is a Delaware C-Corp." },
      { type: "h2", text: "What is BlackRoad OS?" },
      { type: "p", text: "Traditional cloud platforms optimize for scale at the cost of sovereignty. BlackRoad OS is built on a different premise: that organizations should own their compute, their data, and their intelligence layer outright." },
      { type: "callout", variant: "info", text: "BlackRoad OS is currently in private beta. Request access at blackroad.io to get started." },
      { type: "h2", text: "Core Pillars" },
      { type: "cards", items: [
        { color: "#8844FF", title: "Sovereign Infrastructure", body: "4 Raspberry Pi 5s (Alice, Octavia, Cecilia, Aria), 2 DigitalOcean droplets (Gematria, Anastasia), 2 Pico Ws — all meshed via WireGuard." },
        { color: "#00D4FF", title: "Sentient Agents",          body: "8 AI agents — Alice, Lucidia, Cecilia, Cece, Aria, Eve, Meridian, Sentinel — with persistent memory and real-time orchestration." },
        { color: "#FF2255", title: "Products",                 body: "BlackRoad Cloud, RoadCode (self-hosted Git), RoadChain, and Lucidia — all running on sovereign infrastructure." },
        { color: "#FF6B2B", title: "Edge Network",             body: "Cloudflare managing 20 zones and 141 domains. APIs at api.blackroad.io, gateway.blackroad.io, and codex.blackroad.io." },
      ]},
      { type: "h2", text: "The Z-Framework" },
      { type: "p", text: "Every system is modeled on Z:=yx−w — a unified feedback primitive that makes your infrastructure composable, predictable, and self-correcting." },
      { type: "code", lang: "bash", snippetKey: "zPrimitive" },
      { type: "h2", text: "Architecture Overview" },
      { type: "p", text: "BlackRoad OS runs on a K3s cluster across 4 Raspberry Pi 5 nodes: Alice (control plane / gateway), Octavia (AI worker with Hailo-8L NPU and 1TB NVMe), Cecilia (storage / build), and Aria (edge / sensor). Two DigitalOcean droplets — Gematria and Anastasia — provide cloud-side redundancy. Two Pico W microcontrollers handle IoT sensor data. All nodes are connected via a WireGuard mesh network." },
      { type: "p", text: "Cloudflare Workers provide the edge compute layer across 20 DNS zones and 48 subdomains. Docker Swarm handles container orchestration alongside K3s. Traefik manages all ingress routing with automatic TLS. Stripe powers billing for BlackRoad Cloud subscriptions." },
      { type: "h2", text: "API Endpoints" },
      { type: "cards", items: [
        { color: "#4488FF", title: "api.blackroad.io", body: "Primary REST API — agent spawning, events, memory, and infrastructure management." },
        { color: "#8844FF", title: "gateway.blackroad.io", body: "API gateway — authentication, rate limiting, and request routing to backend services." },
        { color: "#00D4FF", title: "codex.blackroad.io", body: "Knowledge API — documentation search, code indexing, and the Lucidia knowledge graph." },
      ]},
    ],
  },
  quickstart: {
    title: "Quick Start", section: "Getting Started", readTime: "5 min read",
    prev: { id: "intro", label: "Introduction" }, next: { id: "install", label: "Installation" },
    content: [
      { type: "lead", text: "Get BlackRoad OS running in under 5 minutes. Deploy your first agent and make your first API call." },
      { type: "h2", text: "Prerequisites" },
      { type: "list", items: ["Node.js 18+", "Docker installed", "BlackRoad API key (request at blackroad.io)", "kubectl for K3s deployment"] },
      { type: "h2", text: "1. Initialize your workspace" },
      { type: "code", lang: "bash", snippetKey: "initWorkspace" },
      { type: "h2", text: "2. Set your API key" },
      { type: "code", lang: "bash", snippetKey: "apiKey" },
      { type: "h2", text: "3. Spawn your first agent" },
      { type: "code", lang: "js", snippetKey: "spawnAgent" },
      { type: "callout", variant: "success", text: "Your first Lucidia agent is live. It has persistent memory across sessions by default." },
      { type: "h2", text: "Next steps" },
      { type: "list", items: ["Read the Installation guide", "Explore the Agent docs", "Set up your K3s cluster", "Browse the API Reference"] },
    ],
  },
  install: {
    title: "Installation", section: "Getting Started", readTime: "8 min read",
    prev: { id: "quickstart", label: "Quick Start" }, next: { id: "concepts", label: "Core Concepts" },
    content: [
      { type: "lead", text: "Full installation guide — from local Docker setup to sovereign K3s cluster deployment." },
      { type: "h2", text: "Docker Compose (local dev)" },
      { type: "code", lang: "yaml", snippetKey: "dockerCompose" },
      { type: "callout", variant: "warning", text: "Production deployments should use the full K3s cluster setup. Docker Compose is for local development only." },
      { type: "h2", text: "K3s Cluster (production)" },
      { type: "code", lang: "bash", snippetKey: "k3sSetup" },
      { type: "callout", variant: "info", text: "Alice is the control plane / gateway. Octavia is the AI worker (Hailo-8L NPU, 1TB NVMe). Cecilia handles storage and builds. Aria runs edge/sensor workloads. Gematria and Anastasia (DO droplets) provide cloud redundancy." },
    ],
  },
  concepts: {
    title: "Core Concepts", section: "Getting Started", readTime: "6 min read",
    prev: { id: "install", label: "Installation" }, next: { id: "alice", label: "Alice" },
    content: [
      { type: "lead", text: "The key concepts behind BlackRoad OS — understand these and the rest clicks into place." },
      { type: "h2", text: "Agents" },
      { type: "p", text: "BlackRoad runs 8 agents: Alice (orchestration / gateway), Lucidia (cognition / memory / knowledge graph), Cecilia (storage / build pipelines), Cece (compact variant of Cecilia for lightweight tasks), Aria (edge compute / sensor fusion), Eve (monitoring / observability), Meridian (routing / mesh coordination), and Sentinel (security / anomaly detection). Each agent maintains persistent memory across sessions and communicates via the event bus." },
      { type: "h2", text: "The Event Bus" },
      { type: "p", text: "All inter-agent communication flows through the BlackRoad event bus. Agents publish events and subscribe to topics — enabling composable, decoupled workflows." },
      { type: "code", lang: "js", snippetKey: "eventBus" },
      { type: "h2", text: "Memory" },
      { type: "p", text: "BlackRoad uses PS-SHA∞ hashing for memory persistence — an append-only journal with truth-state commits. Every agent decision is auditable and reversible." },
      { type: "callout", variant: "info", text: "Memory is enabled by default. Pass memory: false in spawn options to create a stateless session." },
    ],
  },
  rest: {
    title: "REST API", section: "API Reference", readTime: "4 min read",
    prev: null, next: { id: "sdk", label: "SDK" },
    content: [
      { type: "lead", text: "The BlackRoad REST API gives you direct HTTP access to every platform primitive — agents, events, memory, and infrastructure." },
      { type: "h2", text: "Base URLs" },
      { type: "cards", items: [
        { color: "#4488FF", title: "api.blackroad.io/v1", body: "Primary API — agents, events, memory." },
        { color: "#8844FF", title: "gateway.blackroad.io", body: "Gateway — auth, rate limiting, routing." },
        { color: "#00D4FF", title: "codex.blackroad.io", body: "Knowledge — docs search, code indexing." },
      ]},
      { type: "h2", text: "Authentication" },
      { type: "p", text: "All requests must include a Bearer token in the Authorization header. API keys are prefixed with br_live_ for production and br_test_ for staging." },
      { type: "h2", text: "Spawn Agent" },
      { type: "code", lang: "http", snippetKey: "restExample" },
    ],
  },
};

// Fill placeholders for all remaining pages
SIDEBAR.forEach(({ pages }) => pages.forEach(({ id, label }) => {
  if (!PAGES[id]) PAGES[id] = {
    title: label, section: "", readTime: "— min read", prev: null, next: null,
    content: [{ type: "lead", text: label + " documentation is coming soon." }],
  };
}));

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

function useCopy(val) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return [copied, copy];
}

// ─── Components ───────────────────────────────────────────────────
function CodeBlock({ lang, snippetKey }) {
  const text = SNIPPETS[snippetKey] || "";
  const [copied, copy] = useCopy(text);
  return (
    <div style={{ background: "#050505", border: "1px solid #1a1a1a", margin: "20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: "1px solid #111" }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: "#383838", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lang}</span>
        <button onClick={copy} style={{ fontFamily: mono, fontSize: 9, color: copied ? "#f5f5f5" : "#444", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.2s" }}>
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre style={{ fontFamily: mono, fontSize: 12, color: "#666", lineHeight: 1.8, margin: 0, padding: "16px 14px", whiteSpace: "pre-wrap", wordBreak: "break-word", overflowX: "hidden" }}>
        {text}
      </pre>
    </div>
  );
}

function Callout({ variant, text }) {
  const map = { info: ["#4488FF","ℹ"], success: ["#00D4FF","✓"], warning: ["#FF6B2B","△"], error: ["#FF2255","✕"] };
  const [color, icon] = map[variant] || map.info;
  return (
    <div style={{ display: "flex", gap: 12, padding: "14px 16px", background: color + "0d", border: `1px solid ${color}28`, margin: "20px 0" }}>
      <span style={{ fontFamily: mono, fontSize: 12, color, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontFamily: inter, fontSize: 13, color: "#909090", lineHeight: 1.65 }}>{text}</span>
    </div>
  );
}

function MiniCards({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px,1fr))", gap: 8, margin: "20px 0" }}>
      {items.map(item => (
        <div key={item.title} style={{ background: "#080808", border: "1px solid #161616", padding: "18px 16px" }}>
          <div style={{ height: 2, width: 24, background: item.color, marginBottom: 12 }} />
          <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 13, color: "#dedede", marginBottom: 6 }}>{item.title}</div>
          <div style={{ fontFamily: inter, fontSize: 12, color: "#484848", lineHeight: 1.6 }}>{item.body}</div>
        </div>
      ))}
    </div>
  );
}

function DocContent({ content }) {
  return (
    <div>
      {content.map((block, i) => {
        if (block.type === "lead")     return <p key={i} style={{ fontFamily: inter, fontSize: 17, color: "#909090", lineHeight: 1.75, marginBottom: 28 }}>{block.text}</p>;
        if (block.type === "h2")      return <h2 key={i} style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 22, color: "#ebebeb", letterSpacing: "-0.02em", margin: "36px 0 14px" }}>{block.text}</h2>;
        if (block.type === "p")       return <p key={i} style={{ fontFamily: inter, fontSize: 14, color: "#646464", lineHeight: 1.8, marginBottom: 16 }}>{block.text}</p>;
        if (block.type === "code")    return <CodeBlock key={i} lang={block.lang} snippetKey={block.snippetKey} />;
        if (block.type === "callout") return <Callout key={i} variant={block.variant} text={block.text} />;
        if (block.type === "cards")   return <MiniCards key={i} items={block.items} />;
        if (block.type === "list")    return (
          <ul key={i} style={{ listStyle: "none", padding: 0, margin: "12px 0 20px" }}>
            {block.items.map((item, j) => (
              <li key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: STOPS[j % STOPS.length], flexShrink: 0, marginTop: 7 }} />
                <span style={{ fontFamily: inter, fontSize: 14, color: "#646464", lineHeight: 1.7 }}>{item}</span>
              </li>
            ))}
          </ul>
        );
        return null;
      })}
    </div>
  );
}

function Badge({ label }) {
  const map = { new: "#00D4FF", beta: "#FF6B2B", "5 min": "#8844FF" };
  const color = map[label] || "#444";
  return (
    <span style={{ fontFamily: mono, fontSize: 8, color: "#f5f5f5", background: color + "18", border: `1px solid ${color}30`, padding: "2px 6px", borderRadius: 2, letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
      {label}
    </span>
  );
}

function Sidebar({ active, onNav }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", overflowY: "auto", padding: "20px 0 40px" }}>
      <div style={{ padding: "0 14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#080808", border: "1px solid #1a1a1a", padding: "9px 12px" }}>
          <span style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>⌘K</span>
          <span style={{ fontFamily: inter, fontSize: 12, color: "#2a2a2a" }}>Search docs…</span>
        </div>
      </div>
      {SIDEBAR.map(({ section, pages }) => (
        <div key={section} style={{ marginBottom: 4 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#2e2e2e", textTransform: "uppercase", letterSpacing: "0.14em", padding: "8px 14px 6px" }}>
            {section}
          </div>
          {pages.map(p => {
            const isActive = active === p.id;
            return (
              <button key={p.id} onClick={() => onNav(p.id)}
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: isActive ? "#0d0d0d" : "none", borderLeft: isActive ? "2px solid #4488FF" : "2px solid transparent", border: "none", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#080808"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "none"; }}
              >
                <span style={{ fontFamily: inter, fontSize: 13, color: isActive ? "#e0e0e0" : "#484848", flex: 1 }}>{p.label}</span>
                {p.badge && <Badge label={p.badge} />}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function TOC({ content }) {
  const headings = content.filter(b => b.type === "h2");
  if (!headings.length) return null;
  return (
    <div style={{ position: "sticky", top: 72 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>On this page</div>
      {headings.map((h, i) => (
        <div key={i} style={{ fontFamily: inter, fontSize: 12, color: "#383838", padding: "4px 0", lineHeight: 1.4, cursor: "pointer", transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#a0a0a0"}
          onMouseLeave={e => e.currentTarget.style.color = "#383838"}
        >{h.text}</div>
      ))}
      <div style={{ marginTop: 24, height: 1, background: "#111" }} />
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {["Edit this page →", "Report an issue →", "Changelog →"].map(l => (
          <div key={l} style={{ fontFamily: inter, fontSize: 11, color: "#2a2a2a", cursor: "pointer", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#686868"}
            onMouseLeave={e => e.currentTarget.style.color = "#2a2a2a"}
          >{l}</div>
        ))}
      </div>
    </div>
  );
}

function PrevNext({ prev, next, onNav }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 48, paddingTop: 24, borderTop: "1px solid #111", flexWrap: "wrap" }}>
      {prev
        ? <button onClick={() => onNav(prev.id)} style={{ flex: 1, minWidth: 130, textAlign: "left", background: "#080808", border: "1px solid #1a1a1a", padding: "14px 16px", cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#2a2a2a"} onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>← Previous</div>
            <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 13, color: "#c0c0c0" }}>{prev.label}</div>
          </button>
        : <div style={{ flex: 1 }} />
      }
      {next
        ? <button onClick={() => onNav(next.id)} style={{ flex: 1, minWidth: 130, textAlign: "right", background: "#080808", border: "1px solid #1a1a1a", padding: "14px 16px", cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#4488FF44"} onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Next →</div>
            <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 13, color: "#c0c0c0" }}>{next.label}</div>
          </button>
        : <div style={{ flex: 1 }} />
      }
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadDocs() {
  const [active, setActive] = useState("intro");
  const [menuOpen, setMenuOpen] = useState(false);
  const w = useWidth();
  const desktop = w >= 900;
  const wide    = w >= 1240;
  const page    = PAGES[active] || PAGES["intro"];

  const navigate = (id) => {
    setActive(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        button { appearance: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        @keyframes gradShift {
          0%   { background-position: 0% 50%;   }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1;    transform: scaleY(1);    }
          50%       { opacity: 0.4; transform: scaleY(0.6); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#ebebeb", overflowX: "hidden", width: "100%" }}>

        {/* ── Nav ─────────────────────────────────────────────── */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 }}>
          <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: w < 640 ? "0 14px" : "0 24px", height: 52, gap: 12, background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid #141414" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              {!desktop && (
                <button onClick={() => setMenuOpen(o => !o)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>☰</button>
              )}
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map((c, i) => (
                  <div key={c} style={{ width: 2, height: 15, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />
                ))}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 15, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#252525", letterSpacing: "0.06em" }}>Docs</span>
            </div>
            {w >= 640 && (
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                {["Guides","API","Changelog","GitHub"].map(l => (
                  <a key={l} href="#" style={{ fontFamily: inter, fontSize: 12, fontWeight: 500, color: "#484848", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "#d0d0d0"}
                    onMouseLeave={e => e.target.style.color = "#484848"}
                  >{l}</a>
                ))}
              </div>
            )}
            <div style={{ fontFamily: mono, fontSize: 9, color: "#252525", background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "4px 10px", flexShrink: 0 }}>v2.4.1</div>
          </nav>
        </div>

        {/* ── Mobile drawer ────────────────────────────────────── */}
        {!desktop && menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "fixed", top: 54, left: 0, bottom: 0, width: 256, zIndex: 160, background: "#040404", borderRight: "1px solid #141414", overflowY: "auto", animation: "slideIn 0.22s ease" }}>
              <Sidebar active={active} onNav={navigate} />
            </div>
          </>
        )}

        {/* ── Layout ───────────────────────────────────────────── */}
        <div style={{ display: "flex", paddingTop: 54, minHeight: "100vh" }}>

          {desktop && (
            <div style={{ width: 236, flexShrink: 0, borderRight: "1px solid #0d0d0d", position: "fixed", top: 54, bottom: 0, overflowY: "auto" }}>
              <Sidebar active={active} onNav={navigate} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0, marginLeft: desktop ? 236 : 0, display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 860, padding: desktop ? "44px 36px 80px" : "28px 16px 56px", display: "flex", gap: 48 }}>

              {/* Main body */}
              <div style={{ flex: 1, minWidth: 0 }}>

                {/* Breadcrumb */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
                  {["Docs", page.section, page.title].filter(Boolean).map((crumb, i, arr) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: i === arr.length - 1 ? "#444" : "#242424" }}>{crumb}</span>
                      {i < arr.length - 1 && <span style={{ fontFamily: mono, fontSize: 10, color: "#1c1c1c" }}>/</span>}
                    </span>
                  ))}
                </div>

                {/* Page header */}
                <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #0d0d0d" }}>
                  <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(24px, 6vw, 38px)", color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10 }}>
                    {page.title}
                  </h1>
                  <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>{page.readTime}</span>
                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#1c1c1c", display: "inline-block" }} />
                    <span style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>Last updated Mar 2026</span>
                  </div>
                </div>

                <DocContent content={page.content} />
                <PrevNext prev={page.prev} next={page.next} onNav={navigate} />

                <div style={{ marginTop: 44, paddingTop: 18, borderTop: "1px solid #0a0a0a", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>BlackRoad OS — Pave Tomorrow. · Docs</span>
                  <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>v2.4.1 · 2026</span>
                </div>
              </div>

              {/* TOC */}
              {wide && (
                <div style={{ width: 172, flexShrink: 0 }}>
                  <TOC content={page.content} />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
