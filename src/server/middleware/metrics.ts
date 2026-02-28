// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Hono } from 'hono'
import type { Context, Next } from 'hono'

interface RequestMetric {
  method: string
  path: string
  status: number
  durationMs: number
  ts: number
}

class MetricsCollector {
  private requests: RequestMetric[] = []
  private counters = {
    totalRequests: 0,
    totalErrors: 0,
    byPath: new Map<string, number>(),
    byStatus: new Map<number, number>(),
  }
  private startTime = Date.now()

  record(metric: RequestMetric) {
    this.counters.totalRequests++
    if (metric.status >= 400) this.counters.totalErrors++

    const pathCount = this.counters.byPath.get(metric.path) ?? 0
    this.counters.byPath.set(metric.path, pathCount + 1)

    const statusCount = this.counters.byStatus.get(metric.status) ?? 0
    this.counters.byStatus.set(metric.status, statusCount + 1)

    // Keep last 1000 requests for recent metrics
    this.requests.push(metric)
    if (this.requests.length > 1000) this.requests.shift()
  }

  snapshot() {
    const now = Date.now()
    const lastMinute = this.requests.filter((r) => now - r.ts < 60_000)
    const avgLatency =
      lastMinute.length > 0
        ? Math.round(lastMinute.reduce((sum, r) => sum + r.durationMs, 0) / lastMinute.length)
        : 0

    return {
      uptime_seconds: Math.floor((now - this.startTime) / 1000),
      total_requests: this.counters.totalRequests,
      total_errors: this.counters.totalErrors,
      error_rate:
        this.counters.totalRequests > 0
          ? +(this.counters.totalErrors / this.counters.totalRequests).toFixed(4)
          : 0,
      requests_last_minute: lastMinute.length,
      avg_latency_ms: avgLatency,
      by_path: Object.fromEntries(this.counters.byPath),
      by_status: Object.fromEntries(this.counters.byStatus),
    }
  }
}

export const collector = new MetricsCollector()

export function metricsMiddleware() {
  return async (c: Context, next: Next) => {
    const start = Date.now()
    await next()
    const duration = Date.now() - start
    collector.record({
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: duration,
      ts: start,
    })
  }
}

export const metricsRoutes = new Hono()

metricsRoutes.get('/', (c) => c.json({ status: 'ok', metrics: collector.snapshot() }))
