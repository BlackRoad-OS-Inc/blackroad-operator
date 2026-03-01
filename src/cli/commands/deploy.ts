// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { logger } from '../../core/logger.js'
import { createSpinner } from '../../core/spinner.js'
import { brand } from '../../formatters/brand.js'
import { deployService, type DeployTarget } from '../../infra/deploy.js'

export const deployCommand = new Command('deploy')
  .description('Deploy to Cloudflare, Railway, Vercel, or Pi')
  .argument('[service]', 'Service to deploy', 'operator')
  .option(
    '--target <target>',
    'Deploy target (cloudflare|railway|vercel|pi|auto)',
    'auto',
  )
  .option('--env <environment>', 'Target environment', 'production')
  .option('--dry-run', 'Preview deployment without executing', false)
  .action(
    (
      service: string,
      opts: { target: string; env: string; dryRun: boolean },
    ) => {
      console.log(brand.header(`Deploy: ${service}`))

      const spinner = createSpinner(`Deploying ${service} to ${opts.target}...`)
      if (!opts.dryRun) spinner.start()

      const result = deployService({
        target: opts.target as DeployTarget,
        service,
        env: opts.env,
        dryRun: opts.dryRun,
      })

      if (!opts.dryRun) spinner.stop()

      if (result.success) {
        logger.success(`Deployed to ${result.provider}`)
        if (result.url) logger.info(`URL: ${result.url}`)
      } else {
        logger.error(`Deploy failed: ${result.error}`)
        process.exitCode = 1
      }
    },
  )
