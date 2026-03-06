// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { GatewayClient } from '../../core/client.js'
import { logger } from '../../core/logger.js'
import { loadConfig } from '../../core/config.js'
import chalk from 'chalk'

interface CheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
}

async function checkGateway(client: GatewayClient): Promise<CheckResult> {
  try {
    const health = await client.get<{ status: string; version: string }>('/v1/health')
    return { name: 'Gateway', status: 'pass', message: `Reachable (${health.status}, v${health.version})` }
  } catch {
    return { name: 'Gateway', status: 'fail', message: 'Unreachable — is the gateway running?' }
  }
}

async function checkAgentsRegistry(client: GatewayClient): Promise<CheckResult> {
  try {
    const data = await client.get<{ agents: unknown[] }>('/v1/agents')
    return { name: 'Agents Registry', status: 'pass', message: `${data.agents.length} agents registered` }
  } catch {
    return { name: 'Agents Registry', status: 'warn', message: 'Agent registry unreachable' }
  }
}

async function checkOllama(): Promise<CheckResult> {
  const url = process.env['OLLAMA_URL'] ?? 'http://localhost:11434'
  try {
    const res = await fetch(`${url}/api/tags`)
    if (res.ok) {
      const data = (await res.json()) as { models?: unknown[] }
      const count = data.models?.length ?? 0
      return { name: 'Ollama', status: 'pass', message: `Running at ${url} (${count} models)` }
    }
    return { name: 'Ollama', status: 'warn', message: `Responded with ${res.status}` }
  } catch {
    return { name: 'Ollama', status: 'warn', message: `Not reachable at ${url}` }
  }
}

function checkEnvVars(): CheckResult {
  const required = ['BLACKROAD_GATEWAY_URL']
  const optional = [
    'CLOUDFLARE_API_TOKEN',
    'RAILWAY_TOKEN',
    'VERCEL_TOKEN',
    'DIGITALOCEAN_ACCESS_TOKEN',
    'GITHUB_TOKEN',
  ]
  const missingRequired = required.filter((k) => !process.env[k])
  const missingOptional = optional.filter((k) => !process.env[k])

  if (missingRequired.length > 0) {
    return { name: 'Env Vars', status: 'fail', message: `Missing required: ${missingRequired.join(', ')}` }
  }
  if (missingOptional.length > 0) {
    return { name: 'Env Vars', status: 'warn', message: `Missing optional: ${missingOptional.join(', ')}` }
  }
  return { name: 'Env Vars', status: 'pass', message: 'All environment variables set' }
}

function checkNodeVersion(): CheckResult {
  const major = parseInt(process.versions.node.split('.')[0], 10)
  if (major >= 22) {
    return { name: 'Node.js', status: 'pass', message: `v${process.versions.node}` }
  }
  if (major >= 20) {
    return { name: 'Node.js', status: 'warn', message: `v${process.versions.node} (>=22 recommended)` }
  }
  return { name: 'Node.js', status: 'fail', message: `v${process.versions.node} (>=22 required)` }
}

function formatCheck(check: CheckResult): string {
  const icons = { pass: chalk.green('✓'), warn: chalk.yellow('⚠'), fail: chalk.red('✗') }
  const colors = { pass: chalk.green, warn: chalk.yellow, fail: chalk.red }
  return `  ${icons[check.status]} ${chalk.bold(check.name.padEnd(20))} ${colors[check.status](check.message)}`
}

export const doctorCommand = new Command('doctor')
  .description('Run full system health check')
  .option('--fix', 'Auto-fix common issues')
  .action(async (opts: { fix?: boolean }) => {
    const config = loadConfig()
    const client = new GatewayClient(config.get('gatewayUrl'))

    logger.info('Running BlackRoad system health check...\n')

    const checks: CheckResult[] = [
      checkNodeVersion(),
      checkEnvVars(),
      await checkGateway(client),
      await checkAgentsRegistry(client),
      await checkOllama(),
    ]

    for (const check of checks) {
      console.log(formatCheck(check))
    }

    const fails = checks.filter((c) => c.status === 'fail').length
    const warns = checks.filter((c) => c.status === 'warn').length
    const passes = checks.filter((c) => c.status === 'pass').length

    console.log()
    console.log(`  ${chalk.bold('Summary')}: ${chalk.green(`${passes} passed`)}, ${chalk.yellow(`${warns} warnings`)}, ${chalk.red(`${fails} failures`)}`)

    if (opts.fix && fails > 0) {
      console.log()
      logger.info('Attempting auto-fixes...')
      logger.warn('Auto-fix not yet available for detected issues.')
    }

    process.exitCode = fails > 0 ? 2 : warns > 0 ? 1 : 0
  })
