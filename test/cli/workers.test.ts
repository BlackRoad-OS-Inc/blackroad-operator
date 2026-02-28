// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { workersCommand } from '../../src/cli/commands/workers.js'

describe('workersCommand', () => {
  it('should be named "workers"', () => {
    expect(workersCommand.name()).toBe('workers')
  })

  it('should have subcommands', () => {
    const names = workersCommand.commands.map((c) => c.name())
    expect(names).toContain('status')
    expect(names).toContain('check')
    expect(names).toContain('list')
    expect(names).toContain('map')
    expect(names).toContain('tunnel')
  })

  it('should have a description', () => {
    expect(workersCommand.description()).toBeTruthy()
  })
})
