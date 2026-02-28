// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { program } from '../../src/cli/commands/index.js'

describe('CLI Commands', () => {
  it('should register all expected commands', () => {
    const commandNames = program.commands.map((c) => c.name())
    expect(commandNames).toContain('status')
    expect(commandNames).toContain('agents')
    expect(commandNames).toContain('deploy')
    expect(commandNames).toContain('logs')
    expect(commandNames).toContain('config')
    expect(commandNames).toContain('gateway')
    expect(commandNames).toContain('invoke')
    expect(commandNames).toContain('init')
    expect(commandNames).toContain('mesh')
  })

  it('should have version 0.2.0', () => {
    expect(program.version()).toBe('0.2.0')
  })

  it('should have correct program name', () => {
    expect(program.name()).toBe('br')
  })

  it('deploy should accept --target, --env, and --dry-run options', () => {
    const deploy = program.commands.find((c) => c.name() === 'deploy')
    expect(deploy).toBeDefined()
    const optionNames = deploy!.options.map((o) => o.long)
    expect(optionNames).toContain('--target')
    expect(optionNames).toContain('--env')
    expect(optionNames).toContain('--dry-run')
  })

  it('mesh should have check and watch subcommands', () => {
    const mesh = program.commands.find((c) => c.name() === 'mesh')
    expect(mesh).toBeDefined()
    const subcommands = mesh!.commands.map((c) => c.name())
    expect(subcommands).toContain('check')
    expect(subcommands).toContain('watch')
  })
})
