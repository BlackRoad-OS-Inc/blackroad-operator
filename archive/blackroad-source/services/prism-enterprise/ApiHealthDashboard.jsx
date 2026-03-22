import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, RefreshCcw, ServerCog } from 'lucide-react'

import { fetchApiHealthSummary } from '../api.js'

const STATUS_MAP = {
  pass: { label: 'Operational', className: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40' },
  warn: { label: 'Degraded', className: 'bg-amber-500/10 text-amber-300 border border-amber-500/40' },
  pending: { label: 'Pending', className: 'bg-slate-500/10 text-slate-200 border border-slate-500/40' },
}

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) {
    return '0 B'
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return '0s'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const parts = []
  if (hrs) parts.push(`${hrs}h`)
  if (mins) parts.push(`${mins}m`)
  if (secs || parts.length === 0) parts.push(`${secs}s`)
  return parts.join(' ')
}

function StatusBadge({ status }) {
  const variant = STATUS_MAP[status] || STATUS_MAP.pending
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variant.className}`}>{variant.label}</span>
}

function SummaryCard({ title, value, helper, icon }) {
  return (
    <div className="card p-5 border border-slate-800/40">
      <div className="flex items-center gap-3 text-slate-300">
        {icon}
        <span className="text-sm uppercase tracking-[0.25em]">{title}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {helper && <p className="mt-2 text-xs text-slate-400">{helper}</p>}
    </div>
  )
}

export default function ApiHealthDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const data = await fetchApiHealthSummary()
      setSummary(data)
      setError('')
    } catch (err) {
      const message = err?.message || 'Unable to load health data'
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!cancelled) {
        await load()
      }
    })()

    const interval = setInterval(() => {
      if (!cancelled) {
        load()
      }
    }, 20000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [load])

  const generatedAt = useMemo(() => {
    if (!summary?.generatedAt) return null
    return new Date(summary.generatedAt)
  }, [summary])

  const summaryCards = useMemo(() => {
    if (!summary) {
      return []
    }
    return [
      {
        title: 'Environment',
        value: summary.environment || 'unknown',
        helper: `Node ${summary.nodeVersion || 'n/a'}`,
        icon: <ServerCog size={16} />,
      },
      {
        title: 'Uptime',
        value: formatDuration(summary.uptimeSeconds),
        helper: `PID ${summary.metrics?.process?.pid ?? 'n/a'}`,
        icon: <Activity size={16} />,
      },
      {
        title: 'Memory',
        value: formatBytes(summary.metrics?.memory?.rssBytes),
        helper: `${formatBytes(summary.metrics?.memory?.heapUsedBytes)} heap used`,
        icon: <ServerCog size={16} />,
      },
    ]
  }, [summary])

  if (loading) {
    return <div className="space-y-4 text-slate-300">Loading API health dashboard…</div>
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Prism Console API Health</h1>
          <p className="text-sm text-slate-400">
            Aggregated health checks emitted by the backend orchestrator. Data refreshes every 20 seconds.
          </p>
          {generatedAt && (
            <p className="mt-1 text-xs text-slate-500">Last generated {generatedAt.toLocaleString()}</p>
          )}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-500 hover:text-white"
          onClick={load}
          disabled={refreshing}
        >
          <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh now'}
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          <p className="mt-2 text-xs text-rose-200/80">
            Check server logs or verify the /api/status/health route is reachable from this workspace.
          </p>
        </div>
      )}

      {summary && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {summaryCards.map((card) => (
              <SummaryCard key={card.title} {...card} />
            ))}
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Service checks</h2>
            <div className="space-y-3">
              {summary.checks?.map((check) => (
                <div key={check.name} className="card border border-slate-800/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{check.name}</p>
                      <p className="text-sm text-slate-400">{check.description}</p>
                      <p className="mt-2 text-xs text-slate-500">Endpoint: {check.endpoint}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={check.status} />
                      <span className="text-xs text-slate-400">
                        Latency: {check.latencyMs !== null && check.latencyMs !== undefined ? `${check.latencyMs} ms` : 'n/a'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card border border-slate-800/40 p-5">
            <h2 className="text-lg font-semibold text-white">Runtime metrics</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Metric
                label="CPU cores"
                value={summary.metrics?.cpu?.cores ?? 'n/a'}
                helper={`Load (1m): ${summary.metrics?.cpu?.load1 ?? '0.00'}`}
              />
              <Metric
                label="CPU utilisation"
                value={summary.metrics?.cpu?.utilizationPercent ? `${summary.metrics.cpu.utilizationPercent}%` : 'n/a'}
                helper="Estimated using 1-minute load average"
              />
              <Metric
                label="Process uptime"
                value={formatDuration(summary.metrics?.process?.uptimeSeconds)}
                helper={`Host ${summary.host || 'unknown'}`}
              />
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function Metric({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-slate-800/40 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
    </div>
  )
}
