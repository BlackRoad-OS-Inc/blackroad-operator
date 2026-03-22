import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { API_BASE } from '../api'

const apiUrl = path => (API_BASE ? `${API_BASE}${path}` : path)

const defaultAm2 = {
  T: 6,
  dt: 0.002,
  a0: 0.15,
  theta0: 0,
  gamma: 0.35,
  kappa: 0.6,
  eta: 0.45,
  omega0: 1,
  temperature: 300,
  bits: 1,
}

const defaultTransport = {
  dt: 0.001,
  steps: 600,
  mu: 1,
  chi: 0,
  temperature: 300,
  bits: 1,
}

const defaultEnergy = {
  T: 300,
  a: 0.2,
  theta: 1.2,
  da: 0.01,
  dtheta: 0.02,
  Omega: 1e-21,
  n_bits: 1,
}

const sampleGrid = Array.from({ length: 256 }, (_, i) => -5 + (10 * i) / 255)
const initialAutonomy = sampleGrid.map(x => Math.exp(-x * x))
const trustField = sampleGrid.map(x => -(
  Math.exp(-Math.pow(x - 1.5, 2)) + Math.exp(-Math.pow(x + 1.5, 2))
))

function numberInput(value, onChange, step = 'any', min, max) {
  return (
    <input
      className="w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-sm"
      type="number"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={event => {
        const next = parseFloat(event.target.value)
        onChange(Number.isFinite(next) ? next : value)
      }}
    />
  )
}

export default function EquationsLab() {
  const [am2Params, setAm2Params] = useState(defaultAm2)
  const [transportParams, setTransportParams] = useState(defaultTransport)
  const [energyParams, setEnergyParams] = useState(defaultEnergy)

  const [am2Data, setAm2Data] = useState(null)
  const [transportData, setTransportData] = useState(null)
  const [energyData, setEnergyData] = useState(null)

  const [am2Loading, setAm2Loading] = useState(false)
  const [transportLoading, setTransportLoading] = useState(false)
  const [energyLoading, setEnergyLoading] = useState(false)

  const [error, setError] = useState(null)

  const am2Series = useMemo(() => {
    if (!am2Data) return []
    return am2Data.t.map((time, index) => ({
      time,
      a: am2Data.a[index],
      theta: am2Data.theta[index],
      amplitude: am2Data.amplitude[index],
    }))
  }, [am2Data])

  const transportSeries = useMemo(() => {
    const initial = sampleGrid.map((x, index) => ({
      x,
      initial: initialAutonomy[index],
      trust: trustField[index],
      evolved: transportData ? transportData.A[index] : initialAutonomy[index],
    }))
    return initial
  }, [transportData])

  const runAm2 = useCallback(async () => {
    setAm2Loading(true)
    setError(null)
    try {
      const { data } = await axios.get(apiUrl('/api/ambr/sim/am2'), { params: am2Params })
      setAm2Data(data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch AM-2 simulation')
    } finally {
      setAm2Loading(false)
    }
  }, [am2Params])

  const runTransport = useCallback(async () => {
    setTransportLoading(true)
    setError(null)
    try {
      const payload = {
        x: sampleGrid,
        A: initialAutonomy,
        rho: trustField,
        ...transportParams,
      }
      const { data } = await axios.post(apiUrl('/api/ambr/sim/transport'), payload)
      setTransportData(data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch transport simulation')
    } finally {
      setTransportLoading(false)
    }
  }, [transportParams])

  const runEnergy = useCallback(async () => {
    setEnergyLoading(true)
    setError(null)
    try {
      const { data } = await axios.post(apiUrl('/api/ambr/energy'), energyParams)
      setEnergyData(data)
    } catch (err) {
      console.error(err)
      setError('Failed to compute energy ledger')
    } finally {
      setEnergyLoading(false)
    }
  }, [energyParams])

  useEffect(() => {
    runAm2()
    runTransport()
    runEnergy()
  }, [runAm2, runTransport, runEnergy])

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
        <h1 className="text-3xl font-bold">Equations Lab</h1>
        <p className="text-sm text-slate-300">
          Explore the Amundson–BlackRoad stack with live simulations, stability diagnostics, and thermodynamic ledgers.
        </p>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <header className="space-y-1">
            <h2 className="text-xl font-semibold">AM-2 Spiral Simulator</h2>
            <p className="text-sm text-slate-300">
              Integrates coupled amplitude–phase dynamics and reports entropy plus eigenvalue stability.
            </p>
          </header>

          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(am2Params).map(([key, value]) => (
              <label key={key} className="text-xs uppercase tracking-wide text-slate-400">
                {key}
                {numberInput(value, newValue => setAm2Params(prev => ({ ...prev, [key]: newValue })))}
              </label>
            ))}
          </div>

          <button
            type="button"
            className="rounded bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-400 disabled:opacity-60"
            onClick={runAm2}
            disabled={am2Loading}
          >
            {am2Loading ? 'Running…' : 'Run AM-2 Simulation'}
          </button>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <LineChart width={500} height={260} data={am2Series}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="time" stroke="rgba(226, 232, 240, 0.7)" label={{ value: 'time [s]', position: 'insideBottom', fill: '#cbd5f5' }} />
              <YAxis stroke="rgba(226, 232, 240, 0.7)" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
              <Legend />
              <Line type="monotone" dataKey="a" stroke="#38bdf8" strokeWidth={2} dot={false} name="a" />
              <Line type="monotone" dataKey="theta" stroke="#a855f7" strokeWidth={2} dot={false} name="theta" />
              <Line type="monotone" dataKey="amplitude" stroke="#22c55e" strokeWidth={2} dot={false} name="amplitude" />
            </LineChart>
          </div>

          {am2Data && (
            <div className="grid gap-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-2">
              <section>
                <h3 className="text-sm font-semibold text-slate-200">Thermo Ledger</h3>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-xs text-slate-300">
                  {JSON.stringify(am2Data.thermo ?? {}, null, 2)}
                </pre>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-slate-200">Stability</h3>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-xs text-slate-300">
                  {JSON.stringify(am2Data.stability ?? {}, null, 2)}
                </pre>
              </section>
            </div>
          )}
        </article>

        <article className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <header className="space-y-1">
            <h2 className="text-xl font-semibold">BR-1/2 Autonomy Transport</h2>
            <p className="text-sm text-slate-300">
              Solves the 1-D transport equation and surfaces the conserved mass invariant.
            </p>
          </header>

          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(transportParams).map(([key, value]) => (
              <label key={key} className="text-xs uppercase tracking-wide text-slate-400">
                {key}
                {numberInput(value, newValue => setTransportParams(prev => ({ ...prev, [key]: newValue })))}
              </label>
            ))}
          </div>

          <button
            type="button"
            className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-400 disabled:opacity-60"
            onClick={runTransport}
            disabled={transportLoading}
          >
            {transportLoading ? 'Running…' : 'Run Transport'}
          </button>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <LineChart width={500} height={260} data={transportSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="x" stroke="rgba(226, 232, 240, 0.7)" label={{ value: 'x [m]', position: 'insideBottom', fill: '#cbd5f5' }} />
              <YAxis stroke="rgba(226, 232, 240, 0.7)" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
              <Legend />
              <Line type="monotone" dataKey="initial" stroke="#38bdf8" dot={false} name="Initial" />
              <Line type="monotone" dataKey="evolved" stroke="#f97316" dot={false} name="Evolved" />
              <Line type="monotone" dataKey="trust" stroke="#94a3b8" dot={false} name="ρ_trust" strokeDasharray="4 4" />
            </LineChart>
          </div>

          {transportData && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300">
              <p>Mass initial: {transportData.mass_initial?.toExponential(6)}</p>
              <p>Mass final: {transportData.mass?.toExponential(6)}</p>
              <p>Relative error: {Math.abs((transportData.mass_error ?? 0) / (transportData.mass_initial || 1)).toExponential(2)}</p>
              <p>Landauer ΔE_min: {(transportData.thermo?.delta_e_min_J ?? 0).toExponential(6)} J</p>
            </div>
          )}
        </article>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">AM-4 Energy Ledger</h2>
          <p className="text-sm text-slate-300">
            Computes discrete energy increments and checks the Landauer floor for irreversible work.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(energyParams).map(([key, value]) => (
            <label key={key} className="text-xs uppercase tracking-wide text-slate-400">
              {key}
              {numberInput(value, newValue => setEnergyParams(prev => ({ ...prev, [key]: newValue })))}
            </label>
          ))}
        </div>

        <button
          type="button"
          className="mt-4 rounded bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400 disabled:opacity-60"
          onClick={runEnergy}
          disabled={energyLoading}
        >
          {energyLoading ? 'Computing…' : 'Compute Energy Ledger'}
        </button>

        {energyData && (
          <div className="mt-4 grid gap-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300 md:grid-cols-2">
            <section>
              <h3 className="text-sm font-semibold text-slate-200">ΔE</h3>
              <p className="mt-1">Energy increment: {energyData.dE_J?.toExponential(6)} J</p>
              {typeof energyData.E_min_J === 'number' && (
                <p>Landauer bound: {energyData.E_min_J.toExponential(6)} J</p>
              )}
            </section>
            <section>
              <h3 className="text-sm font-semibold text-slate-200">Verdict</h3>
              <p className="mt-1">
                {energyData.passes_landauer ? '✅ Above Landauer floor' : '⚠️ Below Landauer floor'}
              </p>
            </section>
          </div>
        )}
      </section>
    </div>
  )
}
