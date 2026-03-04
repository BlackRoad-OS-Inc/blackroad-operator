"use client";

import { useState, useEffect } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const AGENTS = [
  { name: "alice", role: "Gateway", status: "active", mem: "2.4TB", uptime: "347d", load: 34 },
  { name: "lucidia", role: "Core AI", status: "active", mem: "1.8TB", uptime: "289d", load: 61 },
  { name: "cecilia", role: "Memory", status: "active", mem: "1.2TB", uptime: "289d", load: 28 },
  { name: "cece", role: "Governance", status: "active", mem: "940GB", uptime: "245d", load: 12 },
  { name: "meridian", role: "Architecture", status: "active", mem: "620GB", uptime: "194d", load: 45 },
  { name: "eve", role: "Monitoring", status: "active", mem: "380GB", uptime: "156d", load: 72 },
  { name: "cadence", role: "Music", status: "idle", mem: "290GB", uptime: "112d", load: 3 },
  { name: "radius", role: "Physics", status: "idle", mem: "210GB", uptime: "98d", load: 0 },
];

const SERVICES = [
  { name: "api.blackroad.io", status: "operational", latency: "12ms", uptime: "99.99%" },
  { name: "app.blackroad.io", status: "operational", latency: "34ms", uptime: "99.97%" },
  { name: "ws.blackroad.io", status: "operational", latency: "8ms", uptime: "99.98%" },
  { name: "mesh.blackroad.network", status: "operational", latency: "22ms", uptime: "99.95%" },
  { name: "ledger.blackroad.systems", status: "operational", latency: "18ms", uptime: "99.99%" },
  { name: "vectors.blackroad.systems", status: "degraded", latency: "89ms", uptime: "99.84%" },
];

const EVENTS = [
  { time: "2m ago", agent: "cecilia", action: "Memory commit #4821 — 3 entries written to PS-SHA\u221E chain" },
  { time: "8m ago", agent: "cece", action: "Policy deployed: edu.review.teacher-only scope updated" },
  { time: "15m ago", agent: "eve", action: "Latency spike on mesh.na1 — auto-scaled, resolved in 2m" },
  { time: "34m ago", agent: "system", action: "DNS propagation complete for edu.blackroad.io" },
  { time: "1h ago", agent: "cadence", action: "Composition #42 exported — 3:42, C minor, 108 BPM" },
  { time: "2h ago", agent: "alice", action: "Gateway health check passed — 7 endpoints, 2.4k concurrent WS" },
  { time: "3h ago", agent: "cece", action: "Weekly governance: 12,400 evals, 0 bypasses, ledger verified" },
];

function GradientBar({ height = 1 }: { height?: number }) {
  return <div style={{ height, background: GRADIENT }} />;
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "active" || status === "operational"
      ? "#a3a3a3"
      : status === "degraded"
        ? "#737373"
        : "#404040";
  return (
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function MiniBar({ value, max = 100 }: { value: number; max?: number }) {
  return (
    <div
      style={{
        width: 48,
        height: 4,
        background: "#1a1a1a",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${(value / max) * 100}%`,
          height: "100%",
          background: value > 60 ? "#a3a3a3" : "#404040",
          borderRadius: 2,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

function Sparkline({
  data,
  width = 64,
  height = 20,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`
    )
    .join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        points={points}
        fill="none"
        stroke="#404040"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ViewId = "overview" | "agents" | "infra" | "governance" | "activity";

function Sidebar({
  activeView,
  setActiveView,
}: {
  activeView: ViewId;
  setActiveView: (v: ViewId) => void;
}) {
  const views: { id: ViewId; icon: string; label: string }[] = [
    { id: "overview", icon: "\u25EB", label: "Overview" },
    { id: "agents", icon: "\u25CE", label: "Agents" },
    { id: "infra", icon: "\u2B21", label: "Infra" },
    { id: "governance", icon: "\u229E", label: "Governance" },
    { id: "activity", icon: "\u2261", label: "Activity" },
  ];
  return (
    <aside
      style={{
        width: 56,
        background: "#0a0a0a",
        borderRight: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 16,
        gap: 4,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginBottom: 20,
        }}
      >
        {COLORS.map((c) => (
          <div
            key={c}
            style={{
              width: 3,
              height: 6,
              borderRadius: 1,
              background: c,
            }}
          />
        ))}
      </div>

      {views.map((v) => (
        <button
          key={v.id}
          onClick={() => setActiveView(v.id)}
          title={v.label}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            background: activeView === v.id ? "#1a1a1a" : "transparent",
            color: activeView === v.id ? "#f5f5f5" : "#404040",
            transition: "all 0.15s ease",
          }}
        >
          {v.icon}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "#171717",
          border: "1px solid #262626",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "#525252",
          marginBottom: 16,
        }}
      >
        A
      </div>
    </aside>
  );
}

function MobileTabs({
  activeView,
  setActiveView,
}: {
  activeView: ViewId;
  setActiveView: (v: ViewId) => void;
}) {
  const views: { id: ViewId; icon: string }[] = [
    { id: "overview", icon: "\u25EB" },
    { id: "agents", icon: "\u25CE" },
    { id: "infra", icon: "\u2B21" },
    { id: "governance", icon: "\u229E" },
    { id: "activity", icon: "\u2261" },
  ];
  return (
    <div
      style={{
        display: "flex",
        background: "#0a0a0a",
        borderBottom: "1px solid #1a1a1a",
        padding: "6px 12px",
        gap: 2,
        overflowX: "auto",
      }}
    >
      {views.map((v) => (
        <button
          key={v.id}
          onClick={() => setActiveView(v.id)}
          style={{
            flex: "1 0 auto",
            padding: "8px 14px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            background: activeView === v.id ? "#1a1a1a" : "transparent",
            color: activeView === v.id ? "#f5f5f5" : "#404040",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {v.icon}
        </button>
      ))}
    </div>
  );
}

function TopBar() {
  return (
    <header
      style={{
        padding: "0 20px",
        height: 48,
        borderBottom: "1px solid #1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: "#f5f5f5",
          }}
        >
          Prism Console
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#404040",
            background: "#141414",
            padding: "3px 8px",
            borderRadius: 4,
          }}
        >
          v0.4.0
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#525252",
          }}
        >
          app.blackroad.io
        </span>
        <StatusDot status="active" />
      </div>
    </header>
  );
}

function OverviewView() {
  const kpis = [
    {
      label: "Agents Online",
      value: "847",
      sub: "of 1,000",
      spark: [800, 812, 830, 825, 841, 847],
    },
    {
      label: "Memory Events",
      value: "2.4M",
      sub: "last commit 2m ago",
      spark: [2.0, 2.1, 2.15, 2.2, 2.3, 2.4],
    },
    {
      label: "Policy Evals",
      value: "12.4K",
      sub: "0 bypasses",
      spark: [10.1, 10.8, 11.2, 11.5, 12.0, 12.4],
    },
    {
      label: "Mesh Latency",
      value: "22ms",
      sub: "p99 \u00B7 3 regions",
      spark: [28, 24, 26, 22, 25, 22],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
        }}
      >
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{
              background: "#131313",
              border: "1px solid #1a1a1a",
              borderRadius: 10,
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: "#525252",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {k.label}
              </div>
              <Sparkline data={k.spark} />
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#f5f5f5",
                lineHeight: 1,
              }}
            >
              {k.value}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: "#404040",
                marginTop: 4,
              }}
            >
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 10,
        }}
      >
        {/* Top Agents */}
        <div
          style={{
            background: "#131313",
            border: "1px solid #1a1a1a",
            borderRadius: 10,
            padding: 18,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "#525252",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}
          >
            Top Agents
          </div>
          {AGENTS.slice(0, 5).map((a, i) => (
            <div
              key={a.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: i < 4 ? "1px solid #141414" : "none",
              }}
            >
              <StatusDot status={a.status} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "#d4d4d4",
                  flex: 1,
                }}
              >
                {a.name}
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  color: "#404040",
                  width: 70,
                }}
              >
                {a.role}
              </span>
              <MiniBar value={a.load} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: "#404040",
                  width: 30,
                  textAlign: "right",
                }}
              >
                {a.load}%
              </span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: "#131313",
            border: "1px solid #1a1a1a",
            borderRadius: 10,
            padding: 18,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "#525252",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}
          >
            Activity
          </div>
          {EVENTS.slice(0, 5).map((e, i) => (
            <div
              key={i}
              style={{
                padding: "8px 0",
                borderBottom: i < 4 ? "1px solid #141414" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "#a3a3a3",
                  }}
                >
                  {e.agent}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "#2a2a2a",
                  }}
                >
                  {"\u00B7"}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "#404040",
                  }}
                >
                  {e.time}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#525252",
                  lineHeight: 1.4,
                }}
              >
                {e.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div
        style={{
          background: "#131313",
          border: "1px solid #1a1a1a",
          borderRadius: 10,
          padding: 18,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#525252",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          Services
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 8,
          }}
        >
          {SERVICES.map((s) => (
            <div
              key={s.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: "#0f0f0f",
                borderRadius: 6,
                border: "1px solid #151515",
              }}
            >
              <StatusDot status={s.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "#a3a3a3",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "#333",
                  }}
                >
                  {s.latency} {"\u00B7"} {s.uptime}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentsView() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <input
          type="text"
          placeholder="search agents\u2026"
          style={{
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            color: "#f5f5f5",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            padding: "9px 14px",
            borderRadius: 7,
            outline: "none",
            flex: "1 1 200px",
            minWidth: 0,
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "Active", "Idle"].map((f) => (
            <button
              key={f}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: f === "All" ? "#a3a3a3" : "#404040",
                background: f === "All" ? "#1a1a1a" : "transparent",
                border: "1px solid #1a1a1a",
                padding: "5px 12px",
                borderRadius: 5,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        {AGENTS.map((a, i) => (
          <div
            key={a.name}
            style={{
              background: "#131313",
              border: "1px solid #1a1a1a",
              borderRadius: 10,
              padding: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: COLORS[i % COLORS.length],
                opacity: a.status === "active" ? 1 : 0.2,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <StatusDot status={a.status} />
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#f5f5f5",
                }}
              >
                {a.name}
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: "#525252",
                marginBottom: 16,
              }}
            >
              {a.role}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "#333",
                    marginBottom: 3,
                  }}
                >
                  MEMORY
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: "#a3a3a3",
                  }}
                >
                  {a.mem}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "#333",
                    marginBottom: 3,
                  }}
                >
                  UPTIME
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: "#a3a3a3",
                  }}
                >
                  {a.uptime}
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: "#333",
                    }}
                  >
                    LOAD
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: "#404040",
                    }}
                  >
                    {a.load}%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 4,
                    background: "#1a1a1a",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${a.load}%`,
                      height: "100%",
                      background: "#404040",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfraView() {
  const layers = [
    {
      name: "Experience",
      domains: [
        "app.blackroad.io",
        "console.blackroad.io",
        "docs.blackroad.io",
        "demo.blackroad.io",
      ],
      status: "operational",
    },
    {
      name: "Governance",
      domains: [
        "ledger.blackroad.systems",
        "policies.blackroad.systems",
        "intents.blackroad.systems",
      ],
      status: "operational",
    },
    {
      name: "Infrastructure",
      domains: [
        "infra.blackroad.systems",
        "monitoring.blackroad.systems",
        "logs.blackroad.systems",
      ],
      status: "operational",
    },
    {
      name: "Data",
      domains: [
        "db.blackroad.systems",
        "cache.blackroad.systems",
        "vectors.blackroad.systems",
      ],
      status: "degraded",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {layers.map((l, i) => (
        <div
          key={l.name}
          style={{
            background: "#131313",
            border: "1px solid #1a1a1a",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 4,
                height: 20,
                borderRadius: 2,
                background: COLORS[i],
              }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                color: "#f5f5f5",
                flex: 1,
              }}
            >
              {l.name}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: l.status === "operational" ? "#525252" : "#737373",
                textTransform: "uppercase",
              }}
            >
              {l.status}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {l.domains.map((d) => {
              const svc = SERVICES.find((s) => s.name === d);
              return (
                <div
                  key={d}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    background: "#0f0f0f",
                    borderRadius: 5,
                    border: "1px solid #151515",
                  }}
                >
                  <StatusDot status={svc?.status || "operational"} />
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: "#737373",
                    }}
                  >
                    {d}
                  </span>
                  {svc && (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: "#2a2a2a",
                      }}
                    >
                      {svc.latency}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Mesh status */}
      <div
        style={{
          background: "#131313",
          border: "1px solid #1a1a1a",
          borderRadius: 10,
          padding: 20,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#525252",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          Mesh Regions
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 8,
          }}
        >
          {[
            { region: "NA1", nodes: 412, latency: "12ms" },
            { region: "EU1", nodes: 238, latency: "28ms" },
            { region: "AP1", nodes: 197, latency: "34ms" },
          ].map((r) => (
            <div
              key={r.region}
              style={{
                background: "#0f0f0f",
                border: "1px solid #151515",
                borderRadius: 6,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#f5f5f5",
                  marginBottom: 4,
                }}
              >
                {r.region}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "#404040",
                }}
              >
                {r.nodes} nodes {"\u00B7"} {r.latency}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GovernanceView() {
  const policies = [
    { name: "edu.review.teacher-only", evals: 3240, bypasses: 0, last: "8m ago" },
    { name: "content.publish.moderation", evals: 2180, bypasses: 0, last: "22m ago" },
    { name: "agent.spawn.capability-check", evals: 1840, bypasses: 0, last: "1h ago" },
    { name: "finance.transaction.limit", evals: 1620, bypasses: 0, last: "3h ago" },
    { name: "mesh.node.auth-required", evals: 1410, bypasses: 0, last: "4h ago" },
    { name: "data.export.rate-limit", evals: 1110, bypasses: 0, last: "5h ago" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 8,
        }}
      >
        {[
          { label: "Total Evals", value: "12,400" },
          { label: "Bypasses", value: "0" },
          { label: "Active Policies", value: "24" },
          { label: "Ledger Integrity", value: "Verified" },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              background: "#131313",
              border: "1px solid #1a1a1a",
              borderRadius: 8,
              padding: 14,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: "#333",
                marginBottom: 6,
              }}
            >
              {k.label}
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#f5f5f5",
              }}
            >
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Policy table */}
      <div
        style={{
          background: "#131313",
          border: "1px solid #1a1a1a",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#525252",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "14px 18px",
            borderBottom: "1px solid #1a1a1a",
          }}
        >
          Policies
        </div>
        {policies.map((p, i) => (
          <div
            key={p.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              borderBottom:
                i < policies.length - 1 ? "1px solid #141414" : "none",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: "#a3a3a3",
                flex: "1 1 200px",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {p.name}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#404040",
                width: 70,
              }}
            >
              {p.evals} evals
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#333",
                width: 50,
              }}
            >
              {p.bypasses} bp
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: "#2a2a2a",
                width: 60,
              }}
            >
              {p.last}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityView() {
  return (
    <div
      style={{
        background: "#131313",
        border: "1px solid #1a1a1a",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#333",
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#333",
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#333",
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#333",
            marginLeft: 6,
          }}
        >
          event.stream
        </span>
      </div>
      <div
        style={{
          padding: 18,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          lineHeight: 2.2,
        }}
      >
        {EVENTS.map((e, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
          >
            <span
              style={{
                color: "#2a2a2a",
                width: 60,
                flexShrink: 0,
                fontSize: 10,
                paddingTop: 2,
              }}
            >
              {e.time}
            </span>
            <span style={{ color: "#525252", width: 66, flexShrink: 0 }}>
              {e.agent}
            </span>
            <span style={{ color: "#737373", flex: 1, minWidth: 0 }}>
              {e.action}
            </span>
          </div>
        ))}
        <div style={{ color: "#1a1a1a", marginTop: 8 }}>
          {"\u2014"} end of stream {"\u00B7"} watching for new events {"\u2014"}
        </div>
      </div>
    </div>
  );
}

function ViewContent({ activeView }: { activeView: ViewId }) {
  const titles: Record<ViewId, string> = {
    overview: "Overview",
    agents: "Agents",
    infra: "Infrastructure",
    governance: "Governance",
    activity: "Activity",
  };
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <TopBar />
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "#333",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 6,
            }}
          >
            Console
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#f5f5f5",
              margin: 0,
            }}
          >
            {titles[activeView]}
          </h1>
        </div>

        {activeView === "overview" && <OverviewView />}
        {activeView === "agents" && <AgentsView />}
        {activeView === "infra" && <InfraView />}
        {activeView === "governance" && <GovernanceView />}
        {activeView === "activity" && <ActivityView />}
      </div>
    </div>
  );
}

export default function MonitoringDashboard() {
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } html, body { overflow-x: hidden; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0a0a0a; } ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 3px; } input::placeholder { color: #333; }`}</style>

      <div
        style={{
          background: "#0a0a0a",
          height: "100vh",
          width: "100vw",
          maxWidth: "100vw",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Inter', sans-serif",
          color: "#f5f5f5",
        }}
      >
        <GradientBar />

        {isMobile ? (
          <>
            <MobileTabs
              activeView={activeView}
              setActiveView={setActiveView}
            />
            <div
              style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
            >
              <ViewContent activeView={activeView} />
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <Sidebar
              activeView={activeView}
              setActiveView={setActiveView}
            />
            <ViewContent activeView={activeView} />
          </div>
        )}
      </div>
    </>
  );
}
