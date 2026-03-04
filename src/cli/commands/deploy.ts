// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { logger } from '../../core/logger.js'

const VALID_ENVS = ['production', 'staging', 'development'] as const

export const deployCommand = new Command('deploy')
  .description('Trigger a deployment')
  .argument('[service]', 'Service to deploy', 'all')
  .option('--env <environment>', 'Target environment', 'production')
  .option('--dry-run', 'Show what would be deployed without executing')
  .action((service: string, opts: { env: string; dryRun?: boolean }) => {
    if (!VALID_ENVS.includes(opts.env as (typeof VALID_ENVS)[number])) {
      logger.error(
        `Invalid environment "${opts.env}". Must be one of: ${VALID_ENVS.join(', ')}`,
      )
      process.exitCode = 1
      return
    }

    if (opts.dryRun) {
      logger.info(`[DRY RUN] Would deploy "${service}" to ${opts.env}`)
      return
    }

    logger.info(`Deploying ${service} to ${opts.env}...`)
    logger.warn(
      'Direct deployment not yet wired. Use CI/CD pipelines or deploy via Railway/Vercel/Cloudflare CLIs.',
    )
  })
