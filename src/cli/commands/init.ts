// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { access, mkdir, writeFile } from 'node:fs/promises'
import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { Command } from 'commander'
import { logger } from '../../core/logger.js'
import { createSpinner } from '../../core/spinner.js'
import { templates } from '../../bootstrap/templates.js'

export const initCommand = new Command('init')
  .description('Initialize a new BlackRoad project')
  .argument('[name]', 'Project name', 'blackroad-project')
  .option(
    '-t, --template <template>',
    'Template to use (worker, api)',
    'worker',
  )
  .option('--force', 'Overwrite existing files')
  .action(async (name: string, opts: { template: string; force?: boolean }) => {
    const template = templates.find((t) => t.name === opts.template)
    if (!template) {
      logger.error(
        `Unknown template "${opts.template}". Available: ${templates.map((t) => t.name).join(', ')}`,
      )
      return
    }

    const spinner = createSpinner(
      `Scaffolding ${name} from "${template.name}" template...`,
    )
    spinner.start()

    try {
      const dir = join(process.cwd(), name)
      // Guard against overwriting existing directory unless --force
      try {
        await access(dir)
        const entries = await readdir(dir)
        if (entries.length > 0 && !opts.force) {
          spinner.fail(`Directory "${name}" already exists and is not empty. Use --force to overwrite.`)
          return
        }
      } catch {
        // Directory doesn't exist — safe to proceed
      }
      for (const [filePath, content] of Object.entries(template.files)) {
        const fullPath = join(dir, filePath)
        await mkdir(dirname(fullPath), { recursive: true })
        await writeFile(fullPath, content + '\n')
      }
      spinner.succeed(
        `Project "${name}" created with template "${template.name}"`,
      )
      logger.info(`  cd ${name} && npm install`)
    } catch (err) {
      spinner.fail('Failed to scaffold project')
      logger.error(err instanceof Error ? err.message : String(err))
    }
  })
