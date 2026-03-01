// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { logger } from '../../core/logger.js'
import { formatTable } from '../../formatters/table.js'
import { brand } from '../../formatters/brand.js'

const HEALTH_URL =
  process.env['BLACKROAD_HEALTH_URL'] ?? 'https://blackroad-worker-health.blackroad.workers.dev'

const TUNNEL_URL =
  process.env['BLACKROAD_TUNNEL_URL'] ?? 'https://blackroad-tunnel-proxy.blackroad.workers.dev'

async function apiFetch<T>(base: string, path: string): Promise<T> {
  const res = await fetch(`${base}${path}`)
  if (!res.ok) {
    throw new Error(`${path}: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const workersCommand = new Command('workers')
  .description('Manage and monitor all BlackRoad workers')

// br workers status
workersCommand
  .command('status')
  .description('Show health status of all workers')
  .option('--json', 'Output as JSON')
  .action(async (opts: { json?: boolean }) => {
    try {
      const data = await apiFetch<{
        total: number
        up: number
        degraded: number
        down: number
        avg_latency_ms: number
        checked_at: string
        services: {
          name: string
          type: string
          category: string
          status: string
          http_status: number
          latency_ms: number
        }[]
      }>(HEALTH_URL, '/status')

      if (opts.json) {
        console.log(JSON.stringify(data, null, 2))
        return
      }

      console.log(brand.header('Worker Health Status'))
      logger.info(`Total: ${data.total}  |  Up: ${data.up}  |  Degraded: ${data.degraded}  |  Down: ${data.down}`)
      logger.info(`Avg latency: ${data.avg_latency_ms}ms  |  Checked: ${data.checked_at}\n`)

      if (data.services?.length) {
        console.log(
          formatTable(
            ['Service', 'Type', 'Category', 'Status', 'HTTP', 'Latency'],
            data.services.map((s) => [
              s.name,
              s.type,
              s.category,
              s.status === 'up' ? 'UP' : s.status === 'degraded' ? 'WARN' : 'DOWN',
              String(s.http_status),
              `${s.latency_ms}ms`,
            ]),
          ),
        )
      }
    } catch {
      logger.error('Health service unreachable. Deploy blackroad-worker-health worker first.')
    }
  })

// br workers check
workersCommand
  .command('check')
  .description('Trigger an immediate health check of all workers')
  .action(async () => {
    try {
      logger.info('Running health check on all workers...')
      const res = await fetch(`${HEALTH_URL}/check`, { method: 'POST' })
      if (!res.ok) {
        logger.error(`Health check failed: ${res.status}`)
        return
      }
      const data = (await res.json()) as { total: number; up: number; degraded: number; down: number }
      logger.success(`Check complete: ${data.total} services — ${data.up} up, ${data.degraded} degraded, ${data.down} down`)
    } catch {
      logger.error('Health service unreachable.')
    }
  })

// br workers list
workersCommand
  .command('list')
  .description('List all known workers and services')
  .action(async () => {
    try {
      const data = await apiFetch<{
        builtin: { id: string; url: string; type: string }[]
        custom: { id: string; url: string; type: string }[]
      }>(TUNNEL_URL, '/routes')

      console.log(brand.header('All Registered Services'))

      if (data.builtin?.length) {
        console.log('\nBuilt-in:')
        console.log(
          formatTable(
            ['Name', 'URL', 'Type'],
            data.builtin.map((s) => [s.id, s.url, s.type]),
          ),
        )
      }

      if (data.custom?.length) {
        console.log('\nCustom:')
        console.log(
          formatTable(
            ['Name', 'URL', 'Type'],
            data.custom.map((s) => [s.id, s.url, s.type]),
          ),
        )
      }

      const total = (data.builtin?.length || 0) + (data.custom?.length || 0)
      logger.info(`\n${total} services registered`)
    } catch {
      logger.error('Tunnel proxy unreachable. Deploy blackroad-tunnel-proxy worker first.')
    }
  })

// br workers map
workersCommand
  .command('map')
  .description('Show full infrastructure topology map')
  .action(async () => {
    try {
      const data = await apiFetch<{
        summary: {
          builtin: number
          custom: number
          types: Record<string, number>
        }
        builtin: { id: string; url: string; type: string; tunnel_path: string }[]
      }>(TUNNEL_URL, '/map')

      console.log(brand.header('Infrastructure Topology'))

      logger.info(`Builtin services: ${data.summary.builtin}`)
      logger.info(`Custom services:  ${data.summary.custom}`)

      console.log('\nBy type:')
      for (const [type, count] of Object.entries(data.summary.types)) {
        logger.info(`  ${type}: ${count}`)
      }

      console.log('\nService map:')
      const byType: Record<string, typeof data.builtin> = {}
      for (const svc of data.builtin) {
        if (!byType[svc.type]) byType[svc.type] = []
        byType[svc.type].push(svc)
      }

      for (const [type, services] of Object.entries(byType)) {
        console.log(`\n  [${type.toUpperCase()}]`)
        for (const svc of services) {
          console.log(`    ${svc.id} → ${svc.url}`)
        }
      }
    } catch {
      logger.error('Tunnel proxy unreachable.')
    }
  })

// br workers tunnel <service> [path]
workersCommand
  .command('tunnel <service> [path]')
  .description('Tunnel a request to a named service')
  .action(async (service: string, path?: string) => {
    try {
      const subpath = path ? `/${path}` : ''
      const res = await fetch(`${TUNNEL_URL}/service/${service}${subpath}`)
      const text = await res.text()

      try {
        const data = JSON.parse(text)
        console.log(JSON.stringify(data, null, 2))
      } catch {
        console.log(text)
      }
    } catch {
      logger.error(`Failed to tunnel to service "${service}".`)
    }
  })
