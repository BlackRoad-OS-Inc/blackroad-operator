"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@br/ui";

type AgentResult = {
  id: string;
  cluster: string;
  generation: string;
  ethos: string;
  covenants: string[];
  ssn: string;
};

type AgentsResponse = {
  total: number;
  items: AgentResult[];
};

const INITIAL_FORM = {
  name: "",
  email: "",
  reason: "",
};

function covenantNeedsReview(covenants: string[]): boolean {
  return !covenants.some((item) => item.toLowerCase() === "transparency".toLowerCase());
}

export default function AdmissionsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<AgentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalAgent, setModalAgent] = useState<AgentResult | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submission, setSubmission] = useState<{ status: "idle" | "success" | "error"; message?: string; ticketId?: string }>({
    status: "idle",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function runSearch() {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("/api/agents", window.location.origin);
        if (debouncedQuery.trim()) {
          url.searchParams.set("q", debouncedQuery.trim());
        }
        const response = await fetch(url.toString(), { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Search failed (${response.status})`);
        }
        const data = (await response.json()) as AgentsResponse;
        if (!isCancelled) {
          setResults(data.items);
        }
      } catch (err) {
        if (!isCancelled) {
          if ((err as Error).name !== "AbortError") {
            setError(err instanceof Error ? err.message : "Search failed");
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [debouncedQuery]);

  const covenantSummary = useMemo(() => {
    return results.reduce<Record<string, number>>((acc, agent) => {
      agent.covenants.forEach((covenant) => {
        acc[covenant] = (acc[covenant] ?? 0) + 1;
      });
      return acc;
    }, {});
  }, [results]);

  function openModal(agent: AgentResult) {
    setModalAgent(agent);
    setForm(INITIAL_FORM);
    setSubmission({ status: "idle" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modalAgent) return;

    if (new Blob([form.reason]).size > 2048) {
      setSubmission({ status: "error", message: "Reason must be under 2KB." });
      return;
    }

    setIsSubmitting(true);
    setSubmission({ status: "idle" });

    try {
      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: modalAgent.id,
          applicant: {
            name: form.name,
            email: form.email,
            reason: form.reason,
          },
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Submission failed");
      }

      const payload = (await response.json()) as { ticketId: string; agentId: string; ts: string };
      setSubmission({ status: "success", message: `Ticket created at ${payload.ts}`, ticketId: payload.ticketId });
      setForm(INITIAL_FORM);
    } catch (err) {
      setSubmission({ status: "error", message: err instanceof Error ? err.message : "Submission failed" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">Agent Admissions</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Choose an agent to sponsor your application. We will review your request against the BlackRoad Agent Framework
          (BRAF) covenants before reaching out.
        </p>
        <div className="relative max-w-xl">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by agent, cluster, ethos, or covenant"
            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Search agents"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Searching…</span>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((agent) => (
          <article
            key={agent.id}
            className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{agent.cluster}</p>
                <h2 className="text-xl font-semibold text-slate-900">{agent.id}</h2>
                <p className="text-sm text-slate-600">{agent.ethos}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.covenants.map((covenant) => (
                  <span
                    key={`${agent.id}-${covenant}`}
                    className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                  >
                    {covenant}
                  </span>
                ))}
              </div>
              {covenantNeedsReview(agent.covenants) && (
                <p className="flex items-center gap-2 text-xs text-amber-600">
                  <span aria-hidden>⚠︎</span> Needs review — covenant set omits Transparency.
                </p>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Generation {agent.generation}</span>
              <Button onClick={() => openModal(agent)}>Apply</Button>
            </div>
          </article>
        ))}
        {!loading && results.length === 0 && (
          <p className="text-sm text-slate-500">No agents matched your search. Try a different query.</p>
        )}
      </div>

      {modalAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Apply to {modalAgent.id}</h2>
                <p className="text-sm text-slate-500">Cluster {modalAgent.cluster} · Generation {modalAgent.generation}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalAgent(null)}
                className="text-sm text-slate-500 transition hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Your name</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Why this agent?</span>
                <textarea
                  required
                  value={form.reason}
                  maxLength={4000}
                  onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
                  className="h-32 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <span className="mt-1 block text-xs text-slate-400">
                  2KB max. HTML will be stripped before review.
                </span>
              </label>

              {submission.status === "error" && submission.message && (
                <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600">{submission.message}</p>
              )}

              {submission.status === "success" && (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">
                  Ticket {submission.ticketId} received. We will reach out soon.
                </p>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setModalAgent(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Covenant signal</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(covenantSummary).map(([name, count]) => (
              <span key={name} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                {name} · {count}
              </span>
            ))}
          </div>
        </aside>
      )}
    </section>
  );
}
