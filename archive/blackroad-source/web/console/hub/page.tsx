import Link from "next/link";

const APPS = [
  { id: "repos", name: "Repo Browser", desc: "Browse all repositories with search, filtering, sort, and live data", icon: "📂", color: "#FF1D6C", subdomain: "repos.blackroad.io", href: "/repos" },
  { id: "agents", name: "Agent Registry", desc: "All AI agents — names, roles, capabilities, and status", icon: "🤖", color: "#2979FF", subdomain: "agents.blackroad.io", href: "/agents" },
  { id: "fleet", name: "Fleet Dashboard", desc: "Pi fleet status — nodes, services, ports, health checks", icon: "🖥️", color: "#F5A623", subdomain: "fleet.blackroad.io", href: "/fleet" },
  { id: "issues", name: "Issue Tracker", desc: "All open issues across every repo — bugs, alerts, incidents", icon: "🔔", color: "#ef4444", subdomain: "issues.blackroad.io", href: "/issues" },
  { id: "status", name: "Service Status", desc: "Live health of all BlackRoad services and endpoints", icon: "💚", color: "#34d399", subdomain: "status.blackroad.io", href: "/status" },
  { id: "docs", name: "Documentation Hub", desc: "READMEs, guides, and API docs from every repo", icon: "📝", color: "#6b7280", subdomain: "docs.blackroad.io", href: "/docs" },
  { id: "workspace", name: "Workspace", desc: "Conversations with AI agents — Lucidia, Alice, Octavia, and more", icon: "💬", color: "#9C27B0", subdomain: "app.blackroad.io", href: "https://app.blackroad.io", external: true },
  { id: "earth", name: "Lucidia Earth", desc: "Immersive Three.js visualization — biomes, fractals, global network", icon: "🌍", color: "#00D4FF", subdomain: "lucidia.earth", href: "https://lucidia.earth", external: true },
  { id: "gitea", name: "Gitea", desc: "Self-hosted Git — 207 repos across 7 orgs on Octavia", icon: "🍵", color: "#34d399", subdomain: "git.blackroad.io", href: "https://git.blackroad.io", external: true },
  { id: "pitstop", name: "Pitstop", desc: "Quick-fix interface — health checks and one-click repairs", icon: "🔧", color: "#F5A623", subdomain: "pitstop.blackroad.io", href: "/status" },
  { id: "prism", name: "Prism Console", desc: "Enterprise ERP/CRM — ISI analysis, sales ops, PLM, CPQ", icon: "🏢", color: "#06b6d4", subdomain: "prism.blackroad.io", href: "/repos/blackroad-prism-console" },
  { id: "activity", name: "Activity Feed", desc: "Live timeline of pushes, PRs, issues, and changes across the org", icon: "📊", color: "#f97316", subdomain: "activity.blackroad.io", href: "/activity" },
  { id: "research", name: "Research Lab", desc: "Quantum geometry, Millennium Problems, consciousness modeling", icon: "🔬", color: "#7c3aed", subdomain: "research.blackroad.io", href: "/repos?cat=research" },
  { id: "simulation", name: "Simulation Hypothesis", desc: "The Trivial Zero — computational proof that reality is self-referential", icon: "🧬", color: "#FF1D6C", subdomain: "simulation.blackroad.io", href: "/simulation" },
  { id: "english", name: "English Revolution", desc: "28 emoji-based English courses — grammar visualized, no textbooks", icon: "🔥", color: "#F5A623", subdomain: "english.blackroad.io", href: "/english" },
  { id: "math", name: "Lucidia Math", desc: "Consciousness modeling, unified geometry, prime exploration, quantum finance", icon: "📐", color: "#2979FF", subdomain: "math.blackroad.io", href: "/math" },
  { id: "graph", name: "Dependency Graph", desc: "Repo relationship map — naming patterns, topics, category clusters", icon: "🕸️", color: "#7c3aed", subdomain: "graph.blackroad.io", href: "/graph" },
  { id: "compare", name: "Repo Compare", desc: "Side-by-side comparison of up to 4 repos", icon: "⚖️", color: "#06b6d4", subdomain: "compare.blackroad.io", href: "/compare" },
];

export default function AppsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Apps</h1>
        <p className="text-gray-400">Every BlackRoad service, one click away. No terminal needed.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {APPS.map((app) => {
          const Tag = (app as any).external ? "a" : Link;
          const extra = (app as any).external ? { target: "_blank", rel: "noopener" } : {};
          return (
            <Tag key={app.id} href={app.href} {...extra}
              className="group p-5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{app.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-white group-hover:text-white/90">{app.name}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: app.color }}>{app.subdomain}</div>
                  <div className="text-sm text-gray-500 mt-2">{app.desc}</div>
                </div>
              </div>
            </Tag>
          );
        })}
      </div>
    </div>
  );
}
