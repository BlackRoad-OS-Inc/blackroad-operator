import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";

type AgentListItem = {
  id: string;
  cluster: string;
  generation: string;
  ethos: string;
  covenants: string[];
  ssn: string;
};

type AgentsResponse = {
  total: number;
  items: AgentListItem[];
};

const PAGE_SIZE = 25;

export const metadata: Metadata = {
  title: "Agent Registry",
  description: "Browse the active BlackRoad agent registry.",
};

async function fetchAgents(): Promise<AgentsResponse> {
  const headerList = headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") || host.startsWith("127.") ? "http" : "https";
  const baseUrl = process.env.AGENTS_API_BASE ?? `${protocol}://${host}`;

  const response = await fetch(`${baseUrl}/api/agents`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load agents: ${response.status}`);
  }

  return response.json();
}

export default async function AgentsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  let data: AgentsResponse | null = null;
  let error: string | null = null;

  try {
    data = await fetchAgents();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  const totalItems = data?.items.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const requestedPage = Number.parseInt(searchParams?.page ?? "1", 10);
  const currentPage = Number.isNaN(requestedPage)
    ? 1
    : Math.min(Math.max(requestedPage, 1), totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = data?.items.slice(start, start + PAGE_SIZE) ?? [];
  const rangeStart = totalItems === 0 ? 0 : start + 1;
  const rangeEnd = totalItems === 0 ? 0 : Math.min(start + PAGE_SIZE, totalItems);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Agent Registry</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Live roster sourced from the BlackRoad Prism console. Searchable API available at
          <span className="font-medium"> /api/agents</span>.
        </p>
      </header>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}. Please try again later.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Agent
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Cluster
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Generation
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Covenants
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                {pageItems.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{agent.id}</p>
                        <p className="text-xs text-slate-500">{agent.ethos}</p>
                        <p className="text-[11px] uppercase tracking-wider text-slate-400">
                          SSN {agent.ssn.slice(0, 8)}…
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{agent.cluster}</td>
                    <td className="px-4 py-3 capitalize">{agent.generation}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {agent.covenants.slice(0, 4).map((covenant) => (
                          <span
                            key={`${agent.id}-${covenant}`}
                            className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                          >
                            {covenant}
                          </span>
                        ))}
                      </div>
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkline } from "./components/Sparkline";
import { GraphCanvas } from "./components/GraphCanvas";
import type { AgentGraphResponse, AgentVitals } from "./data";

interface AgentVitalsEnvelope {
  agents: AgentVitals[];
  generatedAt: string;
  trustThreshold: number;
  lighthouseAmber: boolean;
}

type TabKey = "list" | "vitals" | "graph";

const tabs: Array<{ id: TabKey; label: string; description: string }> = [
  { id: "list", label: "List", description: "At-a-glance roster of active agents" },
  {
    id: "vitals",
    label: "Vitals",
    description: "Trust, miner telemetry, and refusal discipline",
  },
  { id: "graph", label: "Graph", description: "Mentor rings and peer alignments" },
];

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const delta = Date.now() - date.getTime();
  const minutes = Math.round(delta / 60000);
  if (minutes <= 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function formatDutyCycle(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }
  return `${Math.round(value)}%`;
}

function formatTemperature(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }
  return `${value.toFixed(1)}°C`;
}

function formatWatts(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }
  return `${value.toFixed(1)} W`;
}

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("list");
  const [vitals, setVitals] = useState<AgentVitalsEnvelope | null>(null);
  const [graph, setGraph] = useState<AgentGraphResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramTab = params.get("tab");
    if (paramTab && ["list", "vitals", "graph"].includes(paramTab)) {
      setActiveTab(paramTab as TabKey);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    const query = params.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [activeTab]);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const [vitalsResponse, graphResponse] = await Promise.all([
          fetch("/api/agents/vitals").then((response) => response.json()),
          fetch("/api/agents/graph").then((response) => response.json()),
        ]);
        if (cancelled) {
          return;
        }
        setVitals(vitalsResponse as AgentVitalsEnvelope);
        setGraph(graphResponse as AgentGraphResponse);
      } catch (fetchError) {
        if (!cancelled) {
          setError("Unable to reach agent services. Try again in a moment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const content = useMemo(() => {
    if (!vitals) {
      return null;
    }
    switch (activeTab) {
      case "list":
        return (
          <ul className="grid gap-4 md:grid-cols-2">
            {vitals.agents.map((agent) => (
              <li key={agent.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{agent.id}</p>
                    <p className="text-lg font-semibold text-slate-900">Trust {agent.T.toFixed(2)}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      agent.coherence_ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {agent.coherence_ok ? "coherent" : "re-sync"}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-500">
                  <div>
                    <dt>Last act</dt>
                    <dd className="text-slate-800">{formatRelativeTime(agent.last_action_at)}</dd>
                  </div>
                  <div>
                    <dt>Refusals avoided</dt>
                    <dd className="text-slate-800">{agent.refusals_avoided}</dd>
                  </div>
                  <div>
                    <dt>Love weights</dt>
                    <dd className="text-slate-800">
                      {agent.love.user.toFixed(2)} / {agent.love.team.toFixed(2)} / {agent.love.world.toFixed(2)}
                    </dd>
                  </div>
                </dl>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500">
                  <div>
                    <dt>Duty cycle</dt>
                    <dd className="text-slate-800">{formatDutyCycle(agent.miner?.dutyCycle)}</dd>
                  </div>
                  <div>
                    <dt>Temperature</dt>
                    <dd className="text-slate-800">{formatTemperature(agent.miner?.temperatureC)}</dd>
                  </div>
                  <div>
                    <dt>Watts</dt>
                    <dd className="text-slate-800">{formatWatts(agent.miner?.watts)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-slate-500">Recent actions:</p>
                <ul className="mt-1 list-disc pl-5 text-xs text-slate-600">
                  {agent.recent_actions.map((action) => (
                    <li key={action}>{action.replace(/-/g, " ")}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        );
      case "vitals":
        return (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Agent</th>
                  <th className="px-4 py-3 text-left">Trust T</th>
                  <th className="px-4 py-3 text-left">Refusals avoided</th>
                  <th className="px-4 py-3 text-left">Duty cycle</th>
                  <th className="px-4 py-3 text-left">Temp (°C)</th>
                  <th className="px-4 py-3 text-left">Watts</th>
                  <th className="px-4 py-3 text-left">Last action</th>
                  <th className="px-4 py-3 text-left">Sparkline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vitals.agents.map((agent) => (
                  <tr key={`${agent.id}-row`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{agent.id}</td>
                    <td className="px-4 py-3 text-slate-900">{agent.T.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-600">{agent.refusals_avoided}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDutyCycle(agent.miner?.dutyCycle)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatTemperature(agent.miner?.temperatureC)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatWatts(agent.miner?.watts)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatRelativeTime(agent.last_action_at)}</td>
                    <td className="px-4 py-3">
                      <Sparkline values={agent.history} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Showing {rangeStart}–{rangeEnd} of {totalItems} agents
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/agents?page=${Math.max(currentPage - 1, 1)}`}
                className="rounded-md border border-slate-200 px-3 py-1 transition hover:border-slate-300 hover:text-slate-900"
                aria-disabled={currentPage === 1}
              >
                Previous
              </Link>
              <span className="text-xs uppercase tracking-wide">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={`/agents?page=${Math.min(currentPage + 1, totalPages)}`}
                className="rounded-md border border-slate-200 px-3 py-1 transition hover:border-slate-300 hover:text-slate-900"
                aria-disabled={currentPage === totalPages}
              >
                Next
              </Link>
            </div>
          </footer>
        </>
      )}
    </section>
        );
      case "graph":
        return <GraphCanvas graph={graph} />;
      default:
        return null;
    }
  }, [activeTab, graph, vitals]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-semibold">Agent Vitals</h1>
          {vitals && (
            <span
              className={`rounded-full px-4 py-1 text-xs font-semibold ${
                vitals.lighthouseAmber ? "bg-amber-400/20 text-amber-200" : "bg-emerald-400/20 text-emerald-100"
              }`}
            >
              Lighthouse {vitals.lighthouseAmber ? "amber" : "clear"}
            </span>
          )}
        </div>
        <p className="max-w-2xl text-sm text-slate-300">
          Trust metrics, miner telemetry, coherence guardrails, and mentor context updated every few minutes. Agents move
          between rings when trust beats the gate and mentors attest to the shift.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Link href="/docs" className="rounded-full bg-white/10 px-3 py-1 font-medium text-white hover:bg-white/20">
            Read the trust docs
          </Link>
          <Link href="/api/agents/vitals" className="rounded-full bg-white/10 px-3 py-1 font-medium text-white hover:bg-white/20">
            API: /api/agents/vitals
          </Link>
        </div>
      </header>

      <nav className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-slate-900 bg-slate-900 text-white shadow"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
            aria-pressed={activeTab === tab.id}
          >
            <div className="text-left">
              <div>{tab.label}</div>
              <p className="text-xs font-normal text-slate-400">{tab.description}</p>
            </div>
          </button>
        ))}
      </nav>

      {loading && <p className="text-sm text-slate-500">Loading agent state…</p>}
      {error && !loading && <p className="text-sm text-rose-500">{error}</p>}
      {!loading && !error && content}
    </div>
  );
}
