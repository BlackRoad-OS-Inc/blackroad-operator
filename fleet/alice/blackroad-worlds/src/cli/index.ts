// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { invokeCommand } from './invoke.js'
import { listCommand } from './list.js'
import { validateCommand } from './validate.js'

export const program = new Command()
  .name('blackroad-agents')
  .description('BlackRoad agent definitions and orchestration CLI')
  .version('0.1.0')

program.addCommand(invokeCommand)
program.addCommand(listCommand)
program.addCommand(validateCommand)
