// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'

describe('mcp command', () => {
  it('should be importable and have correct name', async () => {
    const { mcpCommand } = await import('../../src/cli/commands/mcp.js')
    expect(mcpCommand.name()).toBe('mcp')
  })

  it('should have rotate-token and status subcommands', async () => {
    const { mcpCommand } = await import('../../src/cli/commands/mcp.js')
    const subcommands = mcpCommand.commands.map((c) => c.name())
    expect(subcommands).toContain('rotate-token')
    expect(subcommands).toContain('status')
  })
})
