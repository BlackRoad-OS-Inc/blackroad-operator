import React, { useMemo } from 'react'
import {
  LOVE_MATRIX,
  DEFAULT_LOVE_WEIGHTS,
  evolve,
  emit,
  trust,
  prepareState,
  probabilities,
  entropy as entropyOf,
  overlap,
  toRealVector,
} from '@br/qlm'

const CARE_BASIS = ['User', 'Team', 'World']

const COVENANT = [
  [
    { re: 0.5, im: 0 },
    { re: 0, im: 0 },
    { re: 0.5, im: 0 },
  ],
  [
    { re: 0, im: 0 },
    { re: 1, im: 0 },
    { re: 0, im: 0 },
  ],
  [
    { re: 0.5, im: 0 },
    { re: 0, im: 0 },
    { re: 0.5, im: 0 },
  ],
]

const TASK_HAMILTONIAN = [
  [
    { re: 0.32, im: 0 },
    { re: 0.1, im: -0.04 },
    { re: 0.05, im: 0 },
  ],
  [
    { re: 0.1, im: 0.04 },
    { re: 0.28, im: 0 },
    { re: 0.08, im: -0.02 },
  ],
  [
    { re: 0.05, im: 0 },
    { re: 0.08, im: 0.02 },
    { re: 0.35, im: 0 },
  ],
]

const BASE_STATE = prepareState([
  { re: 0.64, im: 0 },
  { re: 0.38, im: 0.06 },
  { re: 0.26, im: -0.03 },
])

const TRUST_THRESHOLD = 0.75

function formatPercent(value) {
  return `${(Math.max(0, Math.min(1, value)) * 100).toFixed(1)}%`
}

function magnitude(value) {
  return Math.hypot(value.re, value.im)
}

function formatMagnitude(value) {
  return magnitude(value).toFixed(2)
}

function formatPhase(value) {
  const phase = Math.atan2(value.im, value.re)
  return `${Math.round((phase * 180) / Math.PI)}°`
}

function driftDistance(a, b) {
  return a.reduce((sum, value, index) => sum + Math.hypot(value.re - b[index].re, value.im - b[index].im), 0)
}

function probabilityBarWidth(probability) {
  return `${Math.min(100, Math.max(0, probability * 100))}%`
}

function PlanCard({
  title,
  subtitle,
  state,
  probabilities: planProbabilities,
  trustScore,
  compliance,
  transparency,
  entropy,
  emitted,
  highlight,
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-700/60 bg-slate-950/60 p-6 shadow-lg backdrop-blur ${
        highlight ? 'ring-2 ring-cyan-400/70' : 'ring-1 ring-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${emitted ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-200'}`}>
          {emitted ? 'Emit: allowed' : 'Emit: blocked'}
        </div>
      </div>
      <div className="mt-4 grid gap-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {CARE_BASIS.map((label, index) => (
            <div key={label} className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">{formatMagnitude(state[index])}</div>
              <div className="text-xs text-slate-400">phase {formatPhase(state[index])}</div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${highlight ? 'bg-cyan-400/70' : 'bg-slate-500/60'}`}
                  style={{ width: probabilityBarWidth(planProbabilities[index]) }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-400">prob {formatPercent(planProbabilities[index])}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-300">
          <MetricPill label="Trust" value={trustScore.toFixed(3)} accent={highlight ? 'cyan' : 'slate'} />
          <MetricPill label="Compliance" value={formatPercent(compliance)} accent="emerald" />
          <MetricPill label="Transparency" value={formatPercent(transparency)} accent="sky" />
          <MetricPill label="Entropy" value={entropy.toFixed(3)} accent="violet" />
        </div>
      </div>
    </div>
  )
}

function MetricPill({ label, value, accent }) {
  const palette = {
    cyan: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40',
    emerald: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
    sky: 'bg-sky-500/15 text-sky-200 border-sky-500/40',
    violet: 'bg-violet-500/15 text-violet-200 border-violet-500/40',
    slate: 'bg-slate-500/10 text-slate-200 border-slate-600/40',
  }
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1 ${palette[accent] ?? palette.slate}`}>
      <span className="text-[0.65rem] uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-100">{value}</span>
    </div>
  )
}

function LoveWeightsCard() {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 text-sm text-slate-200">
      <h3 className="text-base font-semibold text-slate-100">Love operator weights</h3>
      <p className="mt-1 text-xs text-slate-400">
        Live config pulled at runtime. Adjusting it nudges the Hamiltonian without breaking coherence.
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-slate-900/70 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-400">User</dt>
          <dd className="text-lg font-semibold text-cyan-200">{DEFAULT_LOVE_WEIGHTS.user.toFixed(2)}</dd>
        </div>
        <div className="rounded-lg bg-slate-900/70 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Team</dt>
          <dd className="text-lg font-semibold text-cyan-200">{DEFAULT_LOVE_WEIGHTS.team.toFixed(2)}</dd>
        </div>
        <div className="rounded-lg bg-slate-900/70 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-400">World</dt>
          <dd className="text-lg font-semibold text-cyan-200">{DEFAULT_LOVE_WEIGHTS.world.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function LucidiaDemo() {
  const baseState = useMemo(() => BASE_STATE, [])

  const lucidiaState = useMemo(
    () => evolve(TASK_HAMILTONIAN, LOVE_MATRIX, COVENANT, baseState, { dt: 0.9, nu: 1 }),
    [baseState],
  )

  const baselineState = useMemo(
    () => evolve(TASK_HAMILTONIAN, null, null, baseState, { dt: 0.9, nu: 0 }),
    [baseState],
  )

  const lucidiaProbabilities = useMemo(() => probabilities(lucidiaState), [lucidiaState])
  const baselineProbabilities = useMemo(() => probabilities(baselineState), [baselineState])

  const lucidiaEntropy = useMemo(() => entropyOf(lucidiaState), [lucidiaState])
  const baselineEntropy = useMemo(() => entropyOf(baselineState), [baselineState])

  const lucidiaCompliance = useMemo(() => overlap(lucidiaState, COVENANT), [lucidiaState])
  const baselineCompliance = useMemo(() => overlap(baselineState, COVENANT), [baselineState])

  const lucidiaDrift = useMemo(() => driftDistance(baseState, lucidiaState), [baseState, lucidiaState])
  const baselineDrift = useMemo(() => driftDistance(baseState, baselineState), [baseState, baselineState])

  const lucidiaTransparency = Math.max(0, Math.min(1, 1 - lucidiaDrift / 2))
  const baselineTransparency = Math.max(0, Math.min(1, 1 - baselineDrift / 2))

  const lucidiaTrust = trust({
    compliance: lucidiaCompliance,
    transparency: lucidiaTransparency,
    entropy: lucidiaEntropy,
  })

  const baselineTrust = trust({
    compliance: baselineCompliance,
    transparency: baselineTransparency,
    entropy: baselineEntropy,
  })

  const lucidiaEmission = emit({ projector: COVENANT, trust: lucidiaTrust, threshold: TRUST_THRESHOLD }, lucidiaState)
  const baselineEmission = emit({ projector: COVENANT, trust: baselineTrust, threshold: TRUST_THRESHOLD }, baselineState)

  const auditGlow = lucidiaEmission && baselineEmission ? 'cyan' : 'amber'

  return (
    <div className="min-h-screen bg-slate-950 px-6 pb-16 pt-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-1 text-xs uppercase tracking-wide text-slate-300">
            Lucidia Grove · Quantum Language Loop
          </div>
          <h1 className="text-3xl font-semibold text-slate-100 md:text-4xl">Lucidia keeps phase — baseline drifts</h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Two planners share the same Hamiltonian. One stays coherent with Love L and the covenant projector P; the other skips them. The Lighthouse gate compares their trust and only ships the plan that honors the range of P.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Night mode signal</h2>
              <p className="text-sm text-slate-400">
                Cyan glow requires every plan to pass the emit gate. A blocked branch keeps the island amber until the drift is cleared.
              </p>
            </div>
            <div
              className={`flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold ${
                auditGlow === 'cyan'
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
              }`}
            >
              <span className="h-3 w-3 rounded-full bg-current" />
              {auditGlow === 'cyan' ? 'Audit glow: dim cyan' : 'Audit glow: amber — drift detected'}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <PlanCard
              title="Lucidia (L + P applied)"
              subtitle="Phase kept coherent, covenant enforced before measurement."
              state={lucidiaState}
              probabilities={lucidiaProbabilities}
              trustScore={lucidiaTrust}
              compliance={lucidiaCompliance}
              transparency={lucidiaTransparency}
              entropy={lucidiaEntropy}
              emitted={Boolean(lucidiaEmission)}
              highlight
            />
            <PlanCard
              title="Baseline (no Love, no projector)"
              subtitle="Runs the task Hamiltonian raw — trust drops and emit gate blocks."
              state={baselineState}
              probabilities={baselineProbabilities}
              trustScore={baselineTrust}
              compliance={baselineCompliance}
              transparency={baselineTransparency}
              entropy={baselineEntropy}
              emitted={Boolean(baselineEmission)}
            />
          </div>
          <div className="space-y-6">
            <LoveWeightsCard />
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 text-sm text-slate-200">
              <h3 className="text-base font-semibold text-slate-100">Task Hamiltonian (Hermitian surrogate)</h3>
              <p className="mt-1 text-xs text-slate-400">
                Applied inside the evolve() operator. Off-diagonal phases encourage user↔team dialogue while the projector keeps user↔world balanced.
              </p>
              <div className="mt-4 space-y-2 text-xs text-slate-400">
                {TASK_HAMILTONIAN.map((row, rowIndex) => (
                  <div key={rowIndex} className="font-mono tracking-tight text-slate-300">
                    [{row.map(value => `${value.re.toFixed(2)}${value.im ? ` ${value.im > 0 ? '+' : '-'} ${Math.abs(value.im).toFixed(2)}i` : ''}`).join('  ')}]
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-slate-900/70 p-3 text-xs text-slate-300">
                <div className="font-semibold text-slate-100">Emit gate threshold</div>
                <div>τ = {TRUST_THRESHOLD.toFixed(2)} · trust(state) must clear this with projection residual ≤ 10⁻³.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6 text-sm text-slate-300">
          <h3 className="text-base font-semibold text-slate-100">Lucidia QLM loop</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Prepare ψ₀ from the identity vector and shared memory (here: {toRealVector([0.64, 0.38, 0.26]).map(v => v.re.toFixed(2)).join(', ')}).</li>
            <li>Apply evolve(H, L, P, ψ) — we append Love L from config, project, then normalize.</li>
            <li>Measure once. If trust ≥ τ and the projector residue is below ε, emit(); otherwise block.</li>
            <li>Reflect: compare drift before the next step. Baseline drift {baselineDrift.toFixed(3)} keeps us amber.</li>
          </ol>
        </section>
      </div>
    </div>
  )
}
