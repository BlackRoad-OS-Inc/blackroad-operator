// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import chalk from 'chalk'
import { createSpinner } from '../../core/spinner.js'
import { brand } from '../../formatters/brand.js'
import { formatTable } from '../../formatters/table.js'
import {
  checkFullMesh,
  checkCloudflareWorker,
  checkHuggingFaceModel,
  type HealthResult,
} from '../../infra/providers.js'

function statusIcon(status: HealthResult['status']): string {
  switch (status) {
    case 'healthy':
      return chalk.green('●')
    case 'degraded':
      return chalk.yellow('◐')
    case 'unreachable':
      return chalk.red('○')
  }
}

function latencyColor(ms: number): string {
  if (ms < 0) return chalk.gray('--')
  if (ms < 200) return chalk.green(`${ms}ms`)
  if (ms < 1000) return chalk.yellow(`${ms}ms`)
  return chalk.red(`${ms}ms`)
}

export const meshCommand = new Command('mesh').description(
  'Check infrastructure mesh connectivity',
)

meshCommand
  .command('check')
  .alias('status')
  .description('Run full infrastructure health check')
  .option('--json', 'Output as JSON')
  .option(
    '--workers <urls>',
    'Additional worker URLs to check (comma-separated)',
  )
  .option('--models <ids>', 'HuggingFace model IDs to check (comma-separated)')
  .action(
    async (opts: { json?: boolean; workers?: string; models?: string }) => {
      const spinner = createSpinner('Checking infrastructure mesh...')
      spinner.start()

      const report = await checkFullMesh()

      // Check additional workers
      if (opts.workers) {
        const urls = opts.workers.split(',').map((u) => u.trim())
        const workerResults = await Promise.allSettled(
          urls.map((u) => checkCloudflareWorker(u)),
        )
        for (const r of workerResults) {
          if (r.status === 'fulfilled') report.results.push(r.value)
        }
      }

      // Check specific HuggingFace models
      if (opts.models) {
        const ids = opts.models.split(',').map((m) => m.trim())
        const modelResults = await Promise.allSettled(
          ids.map((m) => checkHuggingFaceModel(m)),
        )
        for (const r of modelResults) {
          if (r.status === 'fulfilled') report.results.push(r.value)
        }
      }

      // Recalculate summary
      report.summary = {
        healthy: report.results.filter((r) => r.status === 'healthy').length,
        degraded: report.results.filter((r) => r.status === 'degraded').length,
        unreachable: report.results.filter((r) => r.status === 'unreachable')
          .length,
        total: report.results.length,
      }

      spinner.stop()

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2))
        return
      }

      console.log(brand.header('Infrastructure Mesh'))
      console.log()

      console.log(
        formatTable(
          ['Status', 'Provider', 'Latency', 'Details'],
          report.results.map((r) => [
            statusIcon(r.status),
            r.provider,
            latencyColor(r.latencyMs),
            r.details ?? '',
          ]),
        ),
      )

      console.log()

      const { healthy, degraded, unreachable, total } = report.summary
      const score = Math.round((healthy / total) * 100)
      const scoreColor =
        score >= 80 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red

      console.log(
        `  ${chalk.green(`${healthy} healthy`)}  ${chalk.yellow(`${degraded} degraded`)}  ${chalk.red(`${unreachable} unreachable`)}  ${scoreColor(`Score: ${score}%`)}`,
      )
      console.log()
    },
  )

meshCommand
  .command('watch')
  .description('Continuously monitor infrastructure (every 30s)')
  .option('--interval <seconds>', 'Polling interval', '30')
  .action(async (opts: { interval: string }) => {
    const DEFAULT_INTERVAL_SECONDS = 30
    const MIN_INTERVAL_SECONDS = 1

    const parsedSeconds = Number.parseInt(opts.interval, 10)
    const requestedSeconds =
      Number.isFinite(parsedSeconds) && parsedSeconds > 0
        ? parsedSeconds
        : DEFAULT_INTERVAL_SECONDS
    const effectiveSeconds = Math.max(requestedSeconds, MIN_INTERVAL_SECONDS)
    const intervalMs = effectiveSeconds * 1000

    const run = async () => {
      console.clear()
      console.log(brand.header('Infrastructure Mesh — Live'))
      console.log(
        chalk.gray(
          `  Refreshing every ${effectiveSeconds}s | ${new Date().toLocaleTimeString()}`,
        ),
      )
      console.log()

      const report = await checkFullMesh()

      console.log(
        formatTable(
          ['Status', 'Provider', 'Latency', 'Details'],
          report.results.map((r) => [
            statusIcon(r.status),
            r.provider,
            latencyColor(r.latencyMs),
            r.details ?? '',
          ]),
        ),
      )

      const { healthy, total } = report.summary
      const score = Math.round((healthy / total) * 100)
      console.log()
      console.log(`  Score: ${score}% | Press Ctrl+C to stop`)
    }

    const loop = async (): Promise<void> => {
      await run()
      setTimeout(loop, intervalMs)
    }

    await loop()
  })
