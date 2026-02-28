// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.

import { existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { logger } from '../core/logger.js'
import type { DeployResult } from './providers.js'

export type DeployTarget = 'cloudflare' | 'railway' | 'vercel' | 'pi' | 'auto'

interface DeployOptions {
  target: DeployTarget
  service: string
  env: string
  dryRun: boolean
}

function detectTarget(cwd: string): DeployTarget {
  if (existsSync(`${cwd}/wrangler.toml`)) return 'cloudflare'
  if (existsSync(`${cwd}/railway.toml`)) return 'railway'
  if (existsSync(`${cwd}/vercel.json`)) return 'vercel'

  logger.error(
    `Unable to auto-detect deploy target: no wrangler.toml, railway.toml, or vercel.json found in ${cwd}. ` +
      'Please specify --target explicitly.',
  )
  throw new Error(
    'Deploy target detection failed. No provider config files found. Please specify --target explicitly.',
  )
}

function exec(cmd: string): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(cmd, { encoding: 'utf8', timeout: 120_000 })
    return { stdout, stderr: '', code: 0 }
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number }
    return {
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
      code: e.status ?? 1,
    }
  }
}

export function deployToCloudflare(opts: DeployOptions): DeployResult {
  if (opts.dryRun) {
    logger.info(
      `[dry-run] Would deploy to Cloudflare Workers (env: ${opts.env})`,
    )
    return {
      provider: 'cloudflare',
      success: true,
      url: 'https://<worker>.workers.dev',
    }
  }

  const envFlag = opts.env !== 'production' ? ` --env ${opts.env}` : ''
  const result = exec(`npx wrangler deploy${envFlag}`)

  if (result.code !== 0) {
    return {
      provider: 'cloudflare',
      success: false,
      error: result.stderr || result.stdout,
    }
  }

  const urlMatch = result.stdout.match(/https:\/\/[^\s]+\.workers\.dev/)
  return {
    provider: 'cloudflare',
    success: true,
    url: urlMatch?.[0] ?? 'deployed',
  }
}

export function deployToRailway(opts: DeployOptions): DeployResult {
  if (opts.dryRun) {
    logger.info(`[dry-run] Would deploy to Railway (service: ${opts.service})`)
    return {
      provider: 'railway',
      success: true,
      url: 'https://<service>.railway.app',
    }
  }

  const result = exec('railway up --detach')
  if (result.code !== 0) {
    return {
      provider: 'railway',
      success: false,
      error: result.stderr || result.stdout,
    }
  }
  return { provider: 'railway', success: true, url: result.stdout.trim() }
}

export function deployToVercel(opts: DeployOptions): DeployResult {
  if (opts.dryRun) {
    logger.info(`[dry-run] Would deploy to Vercel (env: ${opts.env})`)
    return {
      provider: 'vercel',
      success: true,
      url: 'https://<project>.vercel.app',
    }
  }

  const prodFlag = opts.env === 'production' ? ' --prod' : ''
  const result = exec(`npx vercel${prodFlag} --yes`)

  if (result.code !== 0) {
    return {
      provider: 'vercel',
      success: false,
      error: result.stderr || result.stdout,
    }
  }

  const urlMatch = result.stdout.match(/https:\/\/[^\s]+\.vercel\.app/)
  return {
    provider: 'vercel',
    success: true,
    url: urlMatch?.[0] ?? result.stdout.trim(),
  }
}

export function deployToPi(host: string, opts: DeployOptions): DeployResult {
  if (opts.dryRun) {
    logger.info(`[dry-run] Would deploy to Pi @ ${host}`)
    return { provider: `pi:${host}`, success: true }
  }

  const result = exec(
    `rsync -az --exclude node_modules --exclude .git . pi@${host}:~/blackroad/${opts.service}/ && ` +
      `ssh pi@${host} "cd ~/blackroad/${opts.service} && npm install --production 2>/dev/null; sudo systemctl restart ${opts.service} 2>/dev/null || true"`,
  )

  return {
    provider: `pi:${host}`,
    success: result.code === 0,
    error: result.code !== 0 ? result.stderr : undefined,
  }
}

export function deployService(opts: DeployOptions): DeployResult {
  const target =
    opts.target === 'auto' ? detectTarget(process.cwd()) : opts.target

  switch (target) {
    case 'cloudflare':
      return deployToCloudflare(opts)
    case 'railway':
      return deployToRailway(opts)
    case 'vercel':
      return deployToVercel(opts)
    case 'pi':
      return deployToPi('192.168.4.64', opts)
    default:
      return {
        provider: target,
        success: false,
        error: `Unknown target: ${target}`,
      }
  }
}
