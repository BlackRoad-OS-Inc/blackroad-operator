// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'

describe('deploy command', () => {
  it('should be importable and have correct name', async () => {
    const { deployCommand } = await import('../../src/cli/commands/deploy.js')
    expect(deployCommand.name()).toBe('deploy')
  })

  it('should have --target option', async () => {
    const { deployCommand } = await import('../../src/cli/commands/deploy.js')
    const targetOpt = deployCommand.options.find((o) => o.long === '--target')
    expect(targetOpt).toBeDefined()
  })

  it('should have --env option with production default', async () => {
    const { deployCommand } = await import('../../src/cli/commands/deploy.js')
    const envOpt = deployCommand.options.find((o) => o.long === '--env')
    expect(envOpt).toBeDefined()
    expect(envOpt?.defaultValue).toBe('production')
  })

  it('should have --dry-run option', async () => {
    const { deployCommand } = await import('../../src/cli/commands/deploy.js')
    const dryRunOpt = deployCommand.options.find((o) => o.long === '--dry-run')
    expect(dryRunOpt).toBeDefined()
  })
})
