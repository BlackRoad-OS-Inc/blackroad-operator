// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { logger } from '../../core/logger.js'
import { createSpinner } from '../../core/spinner.js'
import chalk from 'chalk'
import { execSync } from 'node:child_process'

interface DeployTarget {
  name: string
  command: string
  envVar: string
}

const TARGETS: Record<string, DeployTarget> = {
  railway: {
    name: 'Railway',
    command: 'railway up --detach',
    envVar: 'RAILWAY_TOKEN',
  },
  cloudflare: {
    name: 'Cloudflare',
    command: 'wrangler deploy',
    envVar: 'CLOUDFLARE_API_TOKEN',
  },
  vercel: {
    name: 'Vercel',
    command: 'vercel --prod --yes',
    envVar: 'VERCEL_TOKEN',
  },
  pi: {
    name: 'Raspberry Pi',
    command: 'echo "Pi deployment requires SSH — use br pi deploy"',
    envVar: 'DO_DROPLET_IP',
  },
}

const DEPLOY_ORDER = ['gateway', 'agents', 'web']

function checkToken(target: DeployTarget): boolean {
  return !!process.env[target.envVar]
}

async function deployService(
  service: string,
  targetName: string,
  env: string,
  dryRun: boolean,
): Promise<{ service: string; target: string; success: boolean; message: string }> {
  const target = TARGETS[targetName]
  if (!target) {
    return { service, target: targetName, success: false, message: `Unknown target: ${targetName}` }
  }

  if (!checkToken(target)) {
    return {
      service,
      target: targetName,
      success: false,
      message: `Missing ${target.envVar} — set it in your environment`,
    }
  }

  if (dryRun) {
    return { service, target: targetName, success: true, message: `Would run: ${target.command}` }
  }

  try {
    execSync(target.command, {
      env: { ...process.env, NODE_ENV: env },
      stdio: 'pipe',
      timeout: 120_000,
    })
    return { service, target: targetName, success: true, message: 'Deployed successfully' }
  } catch (err) {
    const msg = err instanceof Error ? err.message.split('\n')[0] : 'Unknown error'
    return { service, target: targetName, success: false, message: msg }
  }
}

export const deployCommand = new Command('deploy')
  .description('Deploy services to one or more targets')
  .argument('[service]', 'Service to deploy (gateway, agents, web, or all)', 'all')
  .option('--target <target>', 'Deploy target: railway, cloudflare, vercel, pi, or all', 'railway')
  .option('--env <environment>', 'Target environment', 'production')
  .option('--dry-run', 'Show what would be deployed without deploying')
  .action(async (service: string, opts: { target: string; env: string; dryRun?: boolean }) => {
    const services = service === 'all' ? DEPLOY_ORDER : [service]
    const targets = opts.target === 'all' ? Object.keys(TARGETS) : [opts.target]

    logger.info(
      `Deploying ${chalk.bold(services.join(', '))} → ${chalk.bold(targets.join(', '))} (${opts.env})`,
    )
    if (opts.dryRun) {
      logger.warn('Dry run mode — no actual deployments.')
    }
    console.log()

    let hasFailure = false

    for (const svc of services) {
      for (const tgt of targets) {
        const spinner = createSpinner(`Deploying ${svc} → ${TARGETS[tgt]?.name ?? tgt}...`)
        spinner.start()

        const result = await deployService(svc, tgt, opts.env, !!opts.dryRun)

        if (result.success) {
          spinner.succeed(`${svc} → ${TARGETS[tgt]?.name ?? tgt}: ${result.message}`)
        } else {
          spinner.fail(`${svc} → ${TARGETS[tgt]?.name ?? tgt}: ${result.message}`)
          hasFailure = true
        }
      }
    }

    console.log()
    if (hasFailure) {
      logger.error('Some deployments failed. Check output above.')
      process.exitCode = 1
    } else {
      logger.success('All deployments completed.')
    }
  })
