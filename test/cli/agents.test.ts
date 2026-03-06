// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'

describe('agents command', () => {
  it('should be importable and have correct name', async () => {
    const { agentsCommand } = await import('../../src/cli/commands/agents.js')
    expect(agentsCommand.name()).toBe('agents')
  })

  it('should have list and status subcommands', async () => {
    const { agentsCommand } = await import('../../src/cli/commands/agents.js')
    const subcommands = agentsCommand.commands.map((c) => c.name())
    expect(subcommands).toContain('list')
    expect(subcommands).toContain('status')
  })

  it('status subcommand should have --json option', async () => {
    const { agentsCommand } = await import('../../src/cli/commands/agents.js')
    const statusCmd = agentsCommand.commands.find((c) => c.name() === 'status')
    expect(statusCmd).toBeDefined()
    const jsonOpt = statusCmd?.options.find((o) => o.long === '--json')
    expect(jsonOpt).toBeDefined()
  })
})
