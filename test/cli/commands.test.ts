// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'

describe('command index', () => {
  it('should export a program with all commands registered', async () => {
    const { program } = await import('../../src/cli/commands/index.js')
    expect(program.name()).toBe('br')

    const names = program.commands.map((c) => c.name())
    expect(names).toContain('status')
    expect(names).toContain('agents')
    expect(names).toContain('deploy')
    expect(names).toContain('logs')
    expect(names).toContain('config')
    expect(names).toContain('gateway')
    expect(names).toContain('invoke')
    expect(names).toContain('init')
    expect(names).toContain('doctor')
    expect(names).toContain('mcp')
  })

  it('should have correct version', async () => {
    const { program } = await import('../../src/cli/commands/index.js')
    expect(program.version()).toBe('0.1.0')
  })
})

describe('status command', () => {
  it('should be importable and have correct name', async () => {
    const { statusCommand } = await import('../../src/cli/commands/status.js')
    expect(statusCommand.name()).toBe('status')
  })
})

describe('logs command', () => {
  it('should be importable and have correct name', async () => {
    const { logsCommand } = await import('../../src/cli/commands/logs.js')
    expect(logsCommand.name()).toBe('logs')
  })

  it('should have -n option', async () => {
    const { logsCommand } = await import('../../src/cli/commands/logs.js')
    const nOpt = logsCommand.options.find((o) => o.short === '-n')
    expect(nOpt).toBeDefined()
  })
})

describe('config command', () => {
  it('should be importable and have correct name', async () => {
    const { configCommand } = await import('../../src/cli/commands/config.js')
    expect(configCommand.name()).toBe('config')
  })
})

describe('gateway command', () => {
  it('should be importable and have correct name', async () => {
    const { gatewayCommand } = await import('../../src/cli/commands/gateway.js')
    expect(gatewayCommand.name()).toBe('gateway')
  })

  it('should have health and url subcommands', async () => {
    const { gatewayCommand } = await import('../../src/cli/commands/gateway.js')
    const subcommands = gatewayCommand.commands.map((c) => c.name())
    expect(subcommands).toContain('health')
    expect(subcommands).toContain('url')
  })
})

describe('invoke command', () => {
  it('should be importable and have correct name', async () => {
    const { invokeCommand } = await import('../../src/cli/commands/invoke.js')
    expect(invokeCommand.name()).toBe('invoke')
  })
})

describe('init command', () => {
  it('should be importable and have correct name', async () => {
    const { initCommand } = await import('../../src/cli/commands/init.js')
    expect(initCommand.name()).toBe('init')
  })
})
