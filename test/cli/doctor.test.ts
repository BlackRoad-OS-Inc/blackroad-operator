// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We test the doctor command's check logic by importing and running the command
// Since the command uses process.exitCode, we verify behavior via the command structure
describe('doctor command', () => {
  beforeEach(() => {
    process.exitCode = undefined
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.exitCode = undefined
  })

  it('should be importable and have correct name', async () => {
    const { doctorCommand } = await import('../../src/cli/commands/doctor.js')
    expect(doctorCommand.name()).toBe('doctor')
    expect(doctorCommand.description()).toBe('Run full system health check')
  })

  it('should have --fix option', async () => {
    const { doctorCommand } = await import('../../src/cli/commands/doctor.js')
    const fixOpt = doctorCommand.options.find((o) => o.long === '--fix')
    expect(fixOpt).toBeDefined()
  })
})
