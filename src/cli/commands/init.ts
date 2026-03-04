// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { mkdir, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import { logger } from '../../core/logger.js'
import { templates } from '../../bootstrap/templates.js'

export const initCommand = new Command('init')
  .description('Initialize a new BlackRoad project')
  .argument('[name]', 'Project name', 'blackroad-project')
  .option(
    '-t, --template <template>',
    'Template to use (worker, api)',
    'worker',
  )
  .option('--list', 'List available templates')
  .action(async (name: string, opts: { template: string; list?: boolean }) => {
    if (opts.list) {
      for (const t of templates) {
        logger.info(`${t.name} — ${t.description}`)
      }
      return
    }

    const template = templates.find((t) => t.name === opts.template)
    if (!template) {
      logger.error(
        `Unknown template "${opts.template}". Use --list to see available templates.`,
      )
      process.exitCode = 1
      return
    }

    const projectDir = join(process.cwd(), name)
    try {
      await access(projectDir)
      logger.error(`Directory "${name}" already exists.`)
      process.exitCode = 1
      return
    } catch {
      // Directory doesn't exist — good
    }

    await mkdir(projectDir, { recursive: true })
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = join(projectDir, filePath)
      await mkdir(join(fullPath, '..'), { recursive: true })
      await writeFile(fullPath, content, 'utf-8')
    }

    logger.success(`Created project "${name}" from template "${template.name}"`)
    logger.info(`cd ${name} && npm install`)
  })
