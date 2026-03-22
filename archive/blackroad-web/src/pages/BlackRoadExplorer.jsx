import { useState, useEffect, useMemo, useRef } from "react";
import { trackEvent } from "../lib/analytics";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

// ─── Real BlackRoad infrastructure data ──────────────────────────
const AGENTS = ["Alice","Lucidia","Cecilia","Cece","Aria","Eve","Meridian","Sentinel"];

const ORGS = [
  { name: "blackroad-os",   repos: 42, color: "#FF2255" },
  { name: "lucidia",        repos: 18, color: "#8844FF" },
  { name: "roadchain",      repos: 12, color: "#FF6B2B" },
  { name: "infrastructure", repos: 24, color: "#00D4FF" },
  { name: "agents",         repos: 22, color: "#CC00AA" },
  { name: "platform",       repos: 28, color: "#4488FF" },
  { name: "services",       repos: 20, color: "#00D4FF" },
  { name: "tools",          repos: 20, color: "#FF6B2B" },
];

const INFRA = {
  pis: ["Alice (192.168.4.49)","Octavia (192.168.4.97)","Cecilia (192.168.4.96)","Aria (192.168.4.98)"],
  droplets: ["Gematria (159.65.43.12)","Anastasia (174.138.44.45)"],
  picoWs: ["Sentinel-W1","Meridian-W2"],
};

// Real projects from the filesystem
const PROJECTS = [
  { name: "blackroad-cloud",              org: "platform",       type: "app",       agent: "Lucidia",  language: "JSX",    status: "active",  stars: 0,  lastCommit: new Date("2026-03-08T02:14:00") },
  { name: "blackroad-scripts",            org: "tools",          type: "scripts",   agent: "Alice",    language: "Bash",   status: "active",  stars: 0,  lastCommit: new Date("2026-03-07T18:30:00") },
  { name: "blackroad-agents",             org: "agents",         type: "service",   agent: "Eve",      language: "Python", status: "active",  stars: 0,  lastCommit: new Date("2026-03-06T14:22:00") },
  { name: "blackroad-os",                 org: "blackroad-os",   type: "core",      agent: "Lucidia",  language: "Bash",   status: "active",  stars: 3,  lastCommit: new Date("2026-03-07T09:15:00") },
  { name: "blackroad-infra",              org: "infrastructure", type: "infra",     agent: "Alice",    language: "YAML",   status: "active",  stars: 0,  lastCommit: new Date("2026-03-05T22:10:00") },
  { name: "blackroad-core",              org: "blackroad-os",   type: "core",      agent: "Cecilia",  language: "Go",     status: "active",  stars: 1,  lastCommit: new Date("2026-03-04T16:40:00") },
  { name: "blackroad-operator",          org: "infrastructure", type: "service",   agent: "Aria",     language: "Go",     status: "active",  stars: 0,  lastCommit: new Date("2026-03-03T11:00:00") },
  { name: "blackroad-dashboard",         org: "platform",       type: "app",       agent: "Lucidia",  language: "JSX",    status: "active",  stars: 0,  lastCommit: new Date("2026-03-02T08:45:00") },
  { name: "blackroad-cli",               org: "tools",          type: "tool",      agent: "Cece",     language: "Bash",   status: "active",  stars: 0,  lastCommit: new Date("2026-03-01T20:30:00") },
  { name: "blackroad-api-cloudflare",    org: "services",       type: "worker",    agent: "Sentinel", language: "JS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-28T17:00:00") },
  { name: "blackroad-memory-worker",     org: "agents",         type: "worker",    agent: "Lucidia",  language: "JS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-27T14:15:00") },
  { name: "blackroad-mcp-agent-manager", org: "agents",         type: "service",   agent: "Eve",      language: "Python", status: "active",  stars: 0,  lastCommit: new Date("2026-02-26T10:30:00") },
  { name: "blackroad-slack-bot",         org: "services",       type: "bot",       agent: "Meridian", language: "JS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-25T13:20:00") },
  { name: "blackroad-pi-ops",            org: "infrastructure", type: "ops",       agent: "Alice",    language: "Bash",   status: "active",  stars: 0,  lastCommit: new Date("2026-02-24T07:50:00") },
  { name: "blackroad-vault",             org: "infrastructure", type: "security",  agent: "Sentinel", language: "HCL",    status: "active",  stars: 0,  lastCommit: new Date("2026-02-23T19:00:00") },
  { name: "blackroad-web",               org: "platform",       type: "app",       agent: "Lucidia",  language: "JSX",    status: "active",  stars: 1,  lastCommit: new Date("2026-02-22T15:30:00") },
  { name: "blackroad-sdk",               org: "tools",          type: "library",   agent: "Cece",     language: "TS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-21T12:00:00") },
  { name: "blackroad-stripe-integration",org: "services",       type: "service",   agent: "Aria",     language: "JS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-20T09:45:00") },
  { name: "blackroad-keycloak",          org: "infrastructure", type: "auth",      agent: "Sentinel", language: "Java",   status: "active",  stars: 0,  lastCommit: new Date("2026-02-19T16:00:00") },
  { name: "blackroad-graphql-gateway",   org: "services",       type: "gateway",   agent: "Cecilia",  language: "TS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-18T11:20:00") },
  { name: "blackroad-status",            org: "platform",       type: "app",       agent: "Meridian", language: "JSX",    status: "active",  stars: 0,  lastCommit: new Date("2026-02-17T08:00:00") },
  { name: "blackroad-docs",              org: "blackroad-os",   type: "docs",      agent: "Lucidia",  language: "MDX",    status: "active",  stars: 0,  lastCommit: new Date("2026-02-16T21:30:00") },
  { name: "blackroad-localai",           org: "agents",         type: "model",     agent: "Eve",      language: "Python", status: "active",  stars: 0,  lastCommit: new Date("2026-02-15T14:00:00") },
  { name: "blackroad-synth",             org: "lucidia",        type: "tool",      agent: "Lucidia",  language: "Python", status: "active",  stars: 0,  lastCommit: new Date("2026-02-14T10:15:00") },
  { name: "blackroad-codex",             org: "lucidia",        type: "core",      agent: "Lucidia",  language: "Python", status: "active",  stars: 0,  lastCommit: new Date("2026-02-13T17:30:00") },
  { name: "blackroad-protocol",          org: "roadchain",      type: "protocol",  agent: "Cecilia",  language: "Rust",   status: "active",  stars: 2,  lastCommit: new Date("2026-02-12T12:45:00") },
  { name: "blackroad-chrome-extension",  org: "tools",          type: "extension", agent: "Cece",     language: "JS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-11T09:00:00") },
  { name: "blackroad-vscode-extension",  org: "tools",          type: "extension", agent: "Cece",     language: "TS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-10T15:00:00") },
  { name: "blackroad-raycast",           org: "tools",          type: "extension", agent: "Cece",     language: "TS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-09T11:30:00") },
  { name: "blackroad-deploy",            org: "infrastructure", type: "ops",       agent: "Alice",    language: "Bash",   status: "active",  stars: 0,  lastCommit: new Date("2026-02-08T07:00:00") },
  { name: "blackroad-cron",              org: "infrastructure", type: "ops",       agent: "Alice",    language: "Bash",   status: "active",  stars: 0,  lastCommit: new Date("2026-02-07T14:00:00") },
  { name: "blackroad-metrics-worker",    org: "services",       type: "worker",    agent: "Meridian", language: "JS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-06T10:00:00") },
  { name: "blackroad-webhooks",          org: "services",       type: "service",   agent: "Aria",     language: "JS",     status: "active",  stars: 0,  lastCommit: new Date("2026-02-05T18:00:00") },
  { name: "blackroad-mobile-app",        org: "platform",       type: "app",       agent: "Lucidia",  language: "Swift",  status: "dev",     stars: 0,  lastCommit: new Date("2026-02-04T13:30:00") },
  { name: "blackroad-desktop-app",       org: "platform",       type: "app",       agent: "Lucidia",  language: "TS",     status: "dev",     stars: 0,  lastCommit: new Date("2026-02-03T09:00:00") },
  { name: "blackroad-voice",             org: "agents",         type: "service",   agent: "Eve",      language: "Python", status: "dev",     stars: 0,  lastCommit: new Date("2026-02-02T16:45:00") },
  { name: "blackroad-arcade",            org: "platform",       type: "app",       agent: "Cece",     language: "TS",     status: "dev",     stars: 0,  lastCommit: new Date("2026-02-01T11:00:00") },
  { name: "blackroad-sandbox",           org: "tools",          type: "dev",       agent: "Cece",     language: "JS",     status: "active",  stars: 0,  lastCommit: new Date("2026-01-30T08:00:00") },
  { name: "blackroad-analytics",         org: "services",       type: "service",   agent: "Meridian", language: "Python", status: "active",  stars: 0,  lastCommit: new Date("2026-01-29T14:15:00") },
  { name: "blackroad-alfred",            org: "tools",          type: "workflow",  agent: "Cece",     language: "Ruby",   status: "active",  stars: 0,  lastCommit: new Date("2026-01-28T10:00:00") },
];

const ALL_ROWS = PROJECTS.map((p, i) => ({
  id: `repo_${(i + 100).toString(36)}`,
  ...p,
}));

// ─── Column definitions ──────────────────────────────────────────
const COLS = [
  { id: "name",       label: "Project",     width: 240, sortable: true,  mono: true  },
  { id: "org",        label: "Org",          width: 120, sortable: true,  mono: true  },
  { id: "type",       label: "Type",         width: 90,  sortable: true,  mono: true  },
  { id: "agent",      label: "Agent",        width: 100, sortable: true,  mono: false },
  { id: "language",   label: "Language",     width: 80,  sortable: true,  mono: true  },
  { id: "status",     label: "Status",       width: 76,  sortable: true,  mono: true  },
  { id: "stars",      label: "Stars",        width: 60,  sortable: true,  mono: true  },
  { id: "lastCommit", label: "Last Commit",  width: 148, sortable: true,  mono: true  },
];

const PAGE_SIZE = 50;

// ─── Formatters ──────────────────────────────────────────────────
function fmtTs(d) {
  return d.toISOString().replace("T"," ").slice(0,19);
}
function fmtRelative(d) {
  const diff = Date.now() - d.getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + "d ago";
  return Math.floor(days / 30) + "mo ago";
}
function statusColor(s) {
  if (s === "active") return "#00D4FF";
  if (s === "dev") return "#8844FF";
  if (s === "archived") return "#2a2a2a";
  return "#525252";
}
function langColor(l) {
  const map = { Bash:"#4488FF", JSX:"#FF6B2B", Python:"#8844FF", Go:"#00D4FF", TS:"#4488FF", JS:"#FF6B2B", Rust:"#FF2255", YAML:"#CC00AA", HCL:"#00D4FF", Java:"#FF6B2B", MDX:"#4488FF", Swift:"#FF2255", Ruby:"#FF2255" };
  return map[l] || "#525252";
}
function orgColor(o) {
  const org = ORGS.find(x => x.name === o);
  return org ? org.color : "#525252";
}
function typeColor(t) {
  const map = { core:"#FF2255", app:"#4488FF", service:"#8844FF", worker:"#CC00AA", tool:"#FF6B2B", infra:"#00D4FF", ops:"#00D4FF", bot:"#8844FF", docs:"#4488FF", scripts:"#FF6B2B", library:"#4488FF", extension:"#CC00AA", protocol:"#FF2255", model:"#8844FF", security:"#FF2255", auth:"#FF2255", gateway:"#00D4FF", dev:"#525252", workflow:"#FF6B2B" };
  return map[t] || "#525252";
}
function agentColor(a) {
  const map = { Alice:"#00D4FF", Lucidia:"#8844FF", Cecilia:"#CC00AA", Cece:"#FF6B2B", Aria:"#4488FF", Eve:"#FF2255", Meridian:"#00D4FF", Sentinel:"#FF2255" };
  return map[a] || "#525252";
}

// ─── Utilities ────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

function useCopy(val) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(val).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return [copied, copy];
}

// ─── Detail drawer ────────────────────────────────────────────────
function DetailDrawer({ row, onClose }) {
  const [copied, copy] = useCopy(row ? JSON.stringify({ ...row, lastCommit: fmtTs(row.lastCommit) }, null, 2) : "");
  if (!row) return null;
  const pairs = [
    ["Project",     row.name],
    ["Org",         row.org],
    ["Type",        row.type],
    ["Agent",       row.agent],
    ["Language",    row.language],
    ["Status",      row.status],
    ["Stars",       row.stars],
    ["Last commit", fmtTs(row.lastCommit)],
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 340, zIndex: 201, background: "#050505", borderLeft: "1px solid #141414", display: "flex", flexDirection: "column", animation: "drawerIn 0.22s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #0d0d0d", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Project detail</div>
            <div style={{ fontFamily: mono, fontSize: 13, color: "#888" }}>{row.name}</div>
          </div>
          <button onClick={onClose} style={{ fontFamily: mono, fontSize: 14, color: "#333", background: "none", border: "none", cursor: "pointer", padding: 4, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#888"}
            onMouseLeave={e => e.currentTarget.style.color = "#333"}
          >✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {pairs.map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #0a0a0a" }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", width: 72, flexShrink: 0, paddingTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: "#888", wordBreak: "break-all", lineHeight: 1.5 }}>{v}</span>
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Raw JSON</div>
            <pre style={{ fontFamily: mono, fontSize: 10, color: "#404040", background: "#030303", border: "1px solid #0d0d0d", padding: "12px", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {JSON.stringify({ ...row, lastCommit: fmtTs(row.lastCommit) }, null, 2)}
            </pre>
          </div>
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid #0d0d0d", flexShrink: 0 }}>
          <button onClick={copy} style={{ width: "100%", fontFamily: mono, fontSize: 9, color: copied ? "#f5f5f5" : "#484848", background: "none", border: `1px solid ${copied ? "#00D4FF33" : "#1a1a1a"}`, padding: "9px 0", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}>
            {copied ? "✓ JSON copied" : "Copy JSON"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────
function FilterChip({ label, value, onClear, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 9, color: color || "#888", background: (color || "#888") + "12", border: `1px solid ${(color || "#888")}28`, padding: "4px 8px 4px 10px", flexShrink: 0 }}>
      <span style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}: {value}</span>
      <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", color: color || "#888", fontSize: 10, padding: 0, lineHeight: 1 }}>✕</button>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────
function StatsBar({ rows }) {
  const total    = rows.length;
  const active   = rows.filter(r => r.status === "active").length;
  const agentsUsed = [...new Set(rows.map(r => r.agent))].length;

  const stats = [
    { label: "Repos",     value: "207",                           color: "#4488FF" },
    { label: "Shown",     value: total.toLocaleString(),          color: "#00D4FF" },
    { label: "Active",    value: active.toLocaleString(),         color: "#00D4FF" },
    { label: "Orgs",      value: "8",                             color: "#8844FF" },
    { label: "Agents",    value: agentsUsed.toLocaleString(),     color: "#CC00AA" },
    { label: "Infra",     value: "4 Pis · 2 VPS · 2 Picos",      color: "#FF6B2B" },
  ];

  return (
    <div style={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {stats.map(s => (
        <div key={s.label} style={{ flex: "1 1 80px", background: "#080808", border: "1px solid #0d0d0d", padding: "10px 14px" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>{s.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 3, height: 14, background: s.color, borderRadius: 1, flexShrink: 0 }} /><span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f5f5f5", letterSpacing: "-0.02em", transition: "color 0.3s" }}>{s.value}</span></div>
        </div>
      ))}
    </div>
  );
}

// ─── Column visibility picker ─────────────────────────────────────
function ColPicker({ visible, setVisible, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#080808", border: "1px solid #1a1a1a", zIndex: 50, minWidth: 180, padding: "8px 0" }}>
      {COLS.map(c => {
        const on = visible.includes(c.id);
        return (
          <button key={c.id} onClick={() => setVisible(v => on ? v.filter(x => x !== c.id) : [...v, c.id])}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 14px", background: "none", border: "none", cursor: "pointer", transition: "background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#0d0d0d"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <div style={{ width: 12, height: 12, border: `1px solid ${on ? "#4488FF" : "#1a1a1a"}`, background: on ? "#4488FF22" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              {on && <span style={{ fontFamily: mono, fontSize: 8, color: "#f5f5f5" }}>✓</span>}
            </div>
            <span style={{ fontFamily: inter, fontSize: 12, color: on ? "#c0c0c0" : "#484848" }}>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadExplorer() {
  const [search,      setSearch]      = useState("");
  const [sortCol,     setSortCol]     = useState("lastCommit");
  const [sortDir,     setSortDir]     = useState("desc");
  const [page,        setPage]        = useState(0);
  const [selected,    setSelected]    = useState(null);
  const [filterAgent, setFilterAgent] = useState("");
  const [filterStatus,setFilterStatus]= useState("");
  const [filterOrg,   setFilterOrg]   = useState("");
  const [filterLang,  setFilterLang]  = useState("");
  const [visibleCols, setVisibleCols] = useState(COLS.map(c => c.id));
  const [showColPick, setShowColPick] = useState(false);
  const [liveRefresh, setLiveRefresh] = useState(false);
  const [tick,        setTick]        = useState(0);

  const w      = useWidth();
  const mobile = w < 720;

  // Live refresh sim
  useEffect(() => {
    if (!liveRefresh) return;
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, [liveRefresh]);

  // Filter + sort
  const filtered = useMemo(() => {
    let rows = ALL_ROWS;
    if (search)       rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
    if (filterAgent)  rows = rows.filter(r => r.agent === filterAgent);
    if (filterStatus) rows = rows.filter(r => r.status === filterStatus);
    if (filterOrg)    rows = rows.filter(r => r.org === filterOrg);
    if (filterLang)   rows = rows.filter(r => r.language === filterLang);

    rows = [...rows].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (av instanceof Date) { av = av.getTime(); bv = bv?.getTime?.() ?? 0; }
      if (typeof av === "string") av = av.toLowerCase(), bv = bv.toLowerCase();
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return rows;
  }, [search, filterAgent, filterStatus, filterOrg, filterLang, sortCol, sortDir, tick]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const activeCols = COLS.filter(c => visibleCols.includes(c.id));

  const setSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
    setPage(0);
  };

  const clearFilters = () => { setFilterAgent(""); setFilterStatus(""); setFilterOrg(""); setFilterLang(""); setSearch(""); setPage(0); };
  const hasFilters = filterAgent || filterStatus || filterOrg || filterLang || search;

  const activeFilters = [
    filterAgent  && { label: "Agent",    value: filterAgent,  clear: () => setFilterAgent(""),  color: agentColor(filterAgent) },
    filterStatus && { label: "Status",   value: filterStatus, clear: () => setFilterStatus(""), color: statusColor(filterStatus) },
    filterOrg    && { label: "Org",      value: filterOrg,    clear: () => setFilterOrg(""),    color: orgColor(filterOrg) },
    filterLang   && { label: "Language", value: filterLang,   clear: () => setFilterLang(""),   color: langColor(filterLang) },
  ].filter(Boolean);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; }
        button { appearance: none; font-family: inherit; }
        input, select { appearance: none; font-family: inherit; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        @keyframes gradShift {
          0%   { background-position: 0% 50%;   }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1;    transform: scaleY(1);    }
          50%       { opacity: 0.45; transform: scaleY(0.6); }
        }
        @keyframes drawerIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        tr:hover td { background: #080808 !important; }
        input::placeholder { color: #242424; }
        select option { background: #080808; color: #c0c0c0; }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#ebebeb", display: "flex", flexDirection: "column" }}>

        {/* ── Nav ──────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 48, background: "#000", borderBottom: "1px solid #0d0d0d" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map((c, i) => <div key={c} style={{ width: 2, height: 13, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 13, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
              <span style={{ fontFamily: mono, fontSize: 8, color: "#1c1c1c" }}>· Explorer</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Live toggle */}
              <button onClick={() => setLiveRefresh(l => !l)}
                style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 9, color: liveRefresh ? "#f5f5f5" : "#2a2a2a", background: "none", border: `1px solid ${liveRefresh ? "#00D4FF33" : "#1a1a1a"}`, padding: "5px 10px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.2s" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: liveRefresh ? "#00D4FF" : "#1a1a1a", animation: liveRefresh ? "barPulse 1s infinite" : "none" }} />
                {liveRefresh ? "Live" : "Live"}
              </button>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>{filtered.length.toLocaleString()} rows</span>
            </div>
          </nav>
        </div>

        {/* ── Toolbar ──────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, padding: "12px 20px", borderBottom: "1px solid #0a0a0a", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ flex: "1 1 200px", position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontFamily: mono, fontSize: 10, color: "#242424" }}>⌕</span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search projects, agents, orgs…"
              style={{ width: "100%", background: "#080808", border: "1px solid #141414", outline: "none", padding: "8px 12px 8px 28px", fontFamily: inter, fontSize: 13, color: "#c0c0c0", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = "#2a2a2a"}
              onBlur={e => e.target.style.borderColor = "#141414"}
            />
          </div>

          {/* Filter dropdowns */}
          {[
            { label: "Agent",    val: filterAgent,  set: setFilterAgent,  opts: AGENTS },
            { label: "Status",   val: filterStatus, set: setFilterStatus, opts: ["active","dev","archived"] },
            { label: "Org",      val: filterOrg,    set: setFilterOrg,    opts: ORGS.map(o => o.name) },
            { label: "Language", val: filterLang,    set: setFilterLang,   opts: [...new Set(PROJECTS.map(p => p.language))].sort() },
          ].map(f => (
            <select key={f.label} value={f.val} onChange={e => { f.set(e.target.value); setPage(0); }}
              style={{ fontFamily: mono, fontSize: 9, color: f.val ? "#c0c0c0" : "#2a2a2a", background: "#080808", border: `1px solid ${f.val ? "#2a2a2a" : "#141414"}`, padding: "8px 12px", cursor: "pointer", outline: "none", transition: "border-color 0.15s", minWidth: 90 }}
            >
              <option value="">{f.label}</option>
              {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          {hasFilters && (
            <button onClick={clearFilters} style={{ fontFamily: mono, fontSize: 9, color: "#f5f5f5", background: "none", border: "1px solid #FF225522", padding: "8px 12px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#FF22550d"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >Clear</button>
          )}

          {/* Column picker */}
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <button onClick={() => setShowColPick(o => !o)}
              style={{ fontFamily: mono, fontSize: 9, color: "#333", background: "none", border: "1px solid #1a1a1a", padding: "8px 12px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#888"}
              onMouseLeave={e => e.currentTarget.style.color = "#333"}
            >Columns ▾</button>
            {showColPick && <ColPicker visible={visibleCols} setVisible={setVisibleCols} onClose={() => setShowColPick(false)} />}
          </div>
        </div>

        {/* ── Active filter chips ───────────────────────────────── */}
        {activeFilters.length > 0 && (
          <div style={{ padding: "8px 20px", borderBottom: "1px solid #0a0a0a", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {activeFilters.map(f => (
              <FilterChip key={f.label} label={f.label} value={f.value} onClear={f.clear} color={f.color} />
            ))}
          </div>
        )}

        {/* ── Stats ────────────────────────────────────────────── */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid #0a0a0a", flexShrink: 0 }}>
          <StatsBar rows={filtered} />
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: mobile ? "auto" : activeCols.reduce((a,c) => a+c.width, 0) }}>
            {/* Head */}
            <thead>
              <tr style={{ borderBottom: "1px solid #0d0d0d" }}>
                {activeCols.map(c => (
                  <th key={c.id}
                    onClick={() => c.sortable && setSort(c.id)}
                    style={{
                      width: c.width, minWidth: c.width,
                      padding: "8px 14px",
                      fontFamily: mono, fontSize: 9, color: sortCol === c.id ? "#c0c0c0" : "#242424",
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      textAlign: "left", background: "#000",
                      cursor: c.sortable ? "pointer" : "default",
                      userSelect: "none",
                      borderBottom: sortCol === c.id ? "1px solid #4488FF44" : "none",
                      transition: "color 0.15s",
                      whiteSpace: "nowrap",
                      position: "sticky", top: 0, zIndex: 10,
                    }}
                  >
                    {c.label}
                    {c.sortable && sortCol === c.id && (
                      <span style={{ marginLeft: 4, color: "#f5f5f5" }}>{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            {/* Body */}
            <tbody>
              {pageRows.map((row, ri) => (
                <tr key={row.id} onClick={() => { setSelected(row); trackEvent('explorer_select', { repo: row.name || row.id }); }}
                  style={{ borderBottom: "1px solid #060606", cursor: "pointer", animation: `fadeUp 0.15s ease ${(ri % 20) * 0.01}s both` }}
                >
                  {activeCols.map(c => {
                    let cell;
                    let cellColor = "#484848";

                    if (c.id === "name") {
                      cellColor = "#888";
                      cell = row.name;
                    }
                    else if (c.id === "org") {
                      cellColor = "#888";
                      cell = <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 3, height: 10, background: orgColor(row.org), borderRadius: 1, flexShrink: 0 }} /><span style={{ color: "#888" }}>{row.org}</span></span>;
                    }
                    else if (c.id === "type") {
                      cellColor = "#888";
                      cell = <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 4, height: 4, borderRadius: 1, background: typeColor(row.type), flexShrink: 0 }} /><span style={{ color: "#888" }}>{row.type}</span></span>;
                    }
                    else if (c.id === "agent") {
                      cellColor = "#888";
                      cell = (
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: agentColor(row.agent), flexShrink: 0, display: "inline-block" }} />
                          <span style={{ color: "#f5f5f5", fontFamily: inter, fontSize: 12 }}>{row.agent}</span>
                        </span>
                      );
                    }
                    else if (c.id === "language") {
                      cellColor = "#888";
                      cell = <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: langColor(row.language), flexShrink: 0 }} /><span style={{ color: "#888" }}>{row.language}</span></span>;
                    }
                    else if (c.id === "status") {
                      cellColor = "#888";
                      cell = <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: statusColor(row.status), flexShrink: 0 }} /><span style={{ color: "#f5f5f5" }}>{row.status}</span></span>;
                    }
                    else if (c.id === "stars") {
                      cellColor = row.stars > 0 ? "#f5f5f5" : "#1e1e1e";
                      cell = row.stars > 0 ? "\u2605 " + row.stars : "\u2014";
                    }
                    else if (c.id === "lastCommit") {
                      cellColor = "#2a2a2a";
                      cell = fmtRelative(row.lastCommit);
                    }

                    return (
                      <td key={c.id} style={{
                        padding: "7px 14px",
                        fontFamily: c.mono ? mono : inter,
                        fontSize: c.mono ? 11 : 12,
                        color: cellColor,
                        background: "#000",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: c.width,
                        transition: "background 0.1s",
                      }}>
                        {cell || (typeof cell === "string" ? cell : null)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.12em" }}>No results</div>
            </div>
          )}
        </div>

        {/* ── Pagination ───────────────────────────────────────── */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderTop: "1px solid #0a0a0a", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>
              {page * PAGE_SIZE + 1}–{Math.min((page+1)*PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage(0)} disabled={page === 0}
              style={{ fontFamily: mono, fontSize: 9, color: page > 0 ? "#484848" : "#1a1a1a", background: "none", border: "1px solid #0d0d0d", padding: "5px 10px", cursor: page > 0 ? "pointer" : "not-allowed", transition: "color 0.15s" }}>«</button>
            <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page === 0}
              style={{ fontFamily: mono, fontSize: 9, color: page > 0 ? "#484848" : "#1a1a1a", background: "none", border: "1px solid #0d0d0d", padding: "5px 10px", cursor: page > 0 ? "pointer" : "not-allowed", transition: "color 0.15s" }}>‹</button>

            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const pg = Math.max(0, Math.min(totalPages - 7, page - 3)) + i;
              const active = pg === page;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  style={{ fontFamily: mono, fontSize: 9, color: active ? "#f0f0f0" : "#333", background: active ? "#4488FF22" : "none", border: `1px solid ${active ? "#4488FF44" : "#0d0d0d"}`, padding: "5px 10px", cursor: "pointer", minWidth: 28, transition: "all 0.15s" }}>
                  {pg + 1}
                </button>
              );
            })}

            <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page >= totalPages-1}
              style={{ fontFamily: mono, fontSize: 9, color: page < totalPages-1 ? "#484848" : "#1a1a1a", background: "none", border: "1px solid #0d0d0d", padding: "5px 10px", cursor: page < totalPages-1 ? "pointer" : "not-allowed", transition: "color 0.15s" }}>›</button>
            <button onClick={() => setPage(totalPages-1)} disabled={page >= totalPages-1}
              style={{ fontFamily: mono, fontSize: 9, color: page < totalPages-1 ? "#484848" : "#1a1a1a", background: "none", border: "1px solid #0d0d0d", padding: "5px 10px", cursor: page < totalPages-1 ? "pointer" : "not-allowed", transition: "color 0.15s" }}>»</button>
          </div>
        </div>

      </div>

      {/* ── Detail drawer ────────────────────────────────────────── */}
      <DetailDrawer row={selected} onClose={() => setSelected(null)} />
    </>
  );
}
