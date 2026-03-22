// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { agents } from '../definitions/index.js'
import { AgentDefinitionSchema } from '../schemas/agent.js'

export const validateCommand = new Command('validate')
  .description('Validate all agent definitions against schema')
  .action(() => {
    const list = Array.from(agents.values())
    let valid = 0
    let invalid = 0

    for (const agent of list) {
      const result = AgentDefinitionSchema.safeParse(agent)
      if (result.success) {
        console.log(`  OK  ${agent.name}`)
        valid++
      } else {
        console.error(`  FAIL  ${agent.name}: ${result.error.message}`)
        invalid++
      }
    }

    console.log(`\n  ${valid} valid, ${invalid} invalid\n`)
    if (invalid > 0) process.exit(1)
  })
