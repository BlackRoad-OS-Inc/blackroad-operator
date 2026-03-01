// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { indexCommand } from '../../src/cli/commands/index-cmd.js'

describe('indexCommand', () => {
  it('should be named "index"', () => {
    expect(indexCommand.name()).toBe('index')
  })

  it('should have subcommands', () => {
    const names = indexCommand.commands.map((c) => c.name())
    expect(names).toContain('stats')
    expect(names).toContain('orgs')
    expect(names).toContain('search')
    expect(names).toContain('repo')
    expect(names).toContain('find')
  })

  it('should have a description', () => {
    expect(indexCommand.description()).toBeTruthy()
  })
})
