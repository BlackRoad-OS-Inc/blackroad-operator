import Link from "next/link";
import type { Metadata } from "next";
import { getAllAgents } from "@br/registry";

export const metadata: Metadata = {
  title: "Agent API Catalog",
  description: "Explore available agents and connect to their BlackRoad Network profiles.",
};

export default async function AgentsCatalogPage() {
  const agents = await getAllAgents();

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Agent API Catalog</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Browse the public roster of BlackRoad agents. Tap into each agent's ethos and covenants before integrating with
          the BlackRoad Network API.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <article
            key={agent.id}
            className="flex h-full flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Cluster {agent.cluster}</p>
                <h2 className="text-xl font-semibold text-slate-900">{agent.id}</h2>
                <p className="text-sm text-slate-600">{agent.ethos}</p>
              </div>
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
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span className="capitalize">{agent.generation} generation</span>
              <Link
                href={`https://blackroad.network/agents/${agent.id}`}
                className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
              >
                View on blackroad.network
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>

const endpoints = [
  {
    method: "GET",
    path: "/api/agents",
    description: "Returns paginated registry entries with summary trust metrics.",
  },
  {
    method: "GET",
    path: "/api/agents/:id",
    description: "Retrieves a single agent record including mentor ring membership and current love weights.",
  },
  {
    method: "GET",
    path: "/api/agents/vitals",
    description: "Aggregated vitals with trust score T, refusal avoidance counts, and sparkline history.",
  },
  {
    method: "GET",
    path: "/api/agents/graph",
    description: "Mentor graph DAG with node metadata and radial layout coordinates.",
  },
];

const curlExamples = `curl https://blackroad.network/api/agents/vitals | jq
curl https://blackroad.network/api/agents/graph | jq`;

const schemaLinks = [
  { label: "Agent", href: "https://blackroad.network/api/agents/schema.json" },
  { label: "Vitals", href: "https://blackroad.network/api/agents/vitals/schema.json" },
  { label: "Graph", href: "https://blackroad.network/api/agents/graph/schema.json" },
];

export default function AgentsDocsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Agent API surface</h1>
      <p>
        Blackroad agent APIs center on trust: every response carries coherence signals and Love operator weights so teams
        can steer mentorship. The endpoints below mirror the dashboards on <Link href="https://blackroad.network/agents">blackroad.network/agents</Link>.
      </p>

      <h2>Endpoints</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((endpoint) => (
            <tr key={endpoint.path}>
              <td>{endpoint.method}</td>
              <td>{endpoint.path}</td>
              <td>{endpoint.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Quick start</h2>
      <p>
        The vitals and graph endpoints stream JSON that stays under 10 KB so you can poll them in under a second.
        Example fetch calls:
      </p>
      <pre>
        <code>{curlExamples}</code>
      </pre>

      <h2>Schema links</h2>
      <p>
        Each response ships with a JSON Schema that the trust gate validates before emit. You can download them below and
        bake into your client tests.
      </p>
      <ul>
        {schemaLinks.map((schema) => (
          <li key={schema.href}>
            <Link href={schema.href} className="text-indigo-600 hover:text-indigo-500">
              {schema.label} schema
            </Link>
          </li>
        ))}
      </ul>

      <h2>Trust guardrails</h2>
      <p>
        Every write-bound request must present <code>X-Agent-Trust</code> and clear the gate at
        <code>TRUST_THRESHOLD</code> (currently 0.62). The vitals endpoint surfaces the same threshold so you can tune
        your automation without guessing.
      </p>
    </article>
  );
}
