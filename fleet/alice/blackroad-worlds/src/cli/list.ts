// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { agents } from '../definitions/index.js'

export const listCommand = new Command('list')
  .description('List all registered agents')
  .option('--json', 'Output as JSON')
  .action((opts: { json?: boolean }) => {
    const list = Array.from(agents.values())
    if (opts.json) {
      console.log(JSON.stringify(list, null, 2))
      return
    }
    console.log(`\n  BlackRoad Agents (${list.length})\n`)
    for (const agent of list) {
      console.log(`  ${agent.name.padEnd(10)} ${agent.title.padEnd(18)} ${agent.role}`)
    }
    console.log()
  })
