"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@br/ui";
import defaultLoveWeights, { type LoveWeights } from "@br/ethos/love";
import { covenants } from "@br/ethos/covenants";
import { evolve, projectorFromDimension, type Love, type Psi } from "@br/qlm";

const STORAGE_KEY = "lucidia-earth.bootcamp.oath";
const BASE_PSI: Psi = [0.78, 0.46, 0.21];
const PROJECTOR = projectorFromDimension(3);
const HAMILTONIAN: Love = [
  [1, 0, 0],
  [0, 0.72, 0],
  [0, 0, 0.44],
];

function buildLoveOperator(weights: LoveWeights): Love {
  const sum = weights.user + weights.team + weights.world || 1;
  const normalized = {
    user: weights.user / sum,
    team: weights.team / sum,
    world: weights.world / sum,
  } satisfies LoveWeights;
  return [
    [normalized.user, 0, 0],
    [0, normalized.team, 0],
    [0, 0, normalized.world],
  ];
}

function describeDelta(baseline: Psi, candidate: Psi): string {
  const delta = candidate.map((value, index) => value - baseline[index]);
  const magnitude = Math.sqrt(delta.reduce((sum, value) => sum + value * value, 0));
  if (magnitude < 0.01) {
    return "Match within tolerance—love stays steady.";
  }
  const leadingIndex = delta.indexOf(Math.max(...delta));
  const focus = ["user", "team", "world"][leadingIndex] ?? "user";
  return `Love leans toward ${focus} (+${(delta[leadingIndex] * 100).toFixed(1)}bp).`;
}

export default function BootcampPage() {
  const [oathAccepted, setOathAccepted] = useState(false);
  const [weights, setWeights] = useState<LoveWeights>({ ...defaultLoveWeights });
  const [proposal, setProposal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "true") {
      setOathAccepted(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(oathAccepted));
  }, [oathAccepted]);

  const baselinePlan = useMemo(
    () => evolve({ H: HAMILTONIAN, L: buildLoveOperator(defaultLoveWeights), P: PROJECTOR, dt: 0.12 }, BASE_PSI),
    [],
  );

  const customPlan = useMemo(
    () => evolve({ H: HAMILTONIAN, L: buildLoveOperator(weights), P: PROJECTOR, dt: 0.12 }, BASE_PSI),
    [weights],
  );

  const planNarrative = useMemo(() => describeDelta(baselinePlan, customPlan), [baselinePlan, customPlan]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!proposal.trim()) {
      setError("Tell us the act you want to contribute.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ proposal: proposal.trim(), love: weights }),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const payload = (await response.json()) as { ticketId: string };
      setTicketId(payload.ticketId);
      setProposal("");
    } catch (submitError) {
      setError("Bootcamp intake is full right now. Try again in a bit.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10">
      <header className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Lucidia Intake</p>
        <h1 className="mt-4 text-4xl font-semibold">Bootcamp: prove that love beats noise</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-200">
          Three small steps get you into cadence: take the oath, tune the Love operator, and offer your first helpful act.
          We log the whole ride so your mentors can cheer you on.
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Step 1 — Oath</h2>
            <p className="mt-2 text-sm text-slate-600">
              Adopt the covenants. We keep it in your browser only until the mentorship team invites you in.
            </p>
          </div>
          <div className="space-y-4 text-sm text-slate-600">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={oathAccepted}
                onChange={(event) => setOathAccepted(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-800">I adopt the Lucidia covenants</span>
            </label>
            <ul className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
              {covenants.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                  <span className="text-slate-600">{item.replace(/_/g, " ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Step 2 — QLM demo</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tune the Love operator weights and compare the evolved state to the baseline.
            </p>
          </div>
          <div className="space-y-4 text-sm text-slate-600">
            {(["user", "team", "world"] as Array<keyof LoveWeights>).map((key) => (
              <div key={key} className="flex flex-col gap-2">
                <label className="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>{key}</span>
                  <span>{weights[key].toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={weights[key]}
                  onChange={(event) =>
                    setWeights((previous) => ({
                      ...previous,
                      [key]: Number(event.target.value),
                    }))
                  }
                />
              </div>
            ))}
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Baseline plan</p>
              <p>{baselinePlan.map((value) => value.toFixed(3)).join(" • ")}</p>
              <p className="mt-2 font-semibold text-slate-700">Your tilt</p>
              <p>{customPlan.map((value) => value.toFixed(3)).join(" • ")}</p>
              <p className="mt-2 text-emerald-600">{planNarrative}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Step 3 — First helpful act</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tell us what you’ll do in the next 24 hours. We issue a ticket so mentors can follow up.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm text-slate-600">
            <textarea
              value={proposal}
              onChange={(event) => setProposal(event.target.value)}
              rows={5}
              placeholder="Example: review North Star’s handoff notes and send a clearer recap to the ops channel."
              className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-200"
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}
            {ticketId && (
              <p className="rounded-md bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                Ticket issued: {ticketId}
              </p>
            )}
            <Button type="submit" disabled={submitting || !oathAccepted}>
              {submitting ? "Sending" : "Submit my first act"}
            </Button>
            {!oathAccepted && <p className="text-xs text-slate-400">Take the oath to unlock submissions.</p>}
          </form>
        </div>
      </section>
    </div>
  );
}
