// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import {
  classifyGitHubEvent,
  classifyDriveEvent,
  shouldExecuteRoute,
} from '../../workers/roadbridge/src/classifier.js'

describe('classifyGitHubEvent', () => {
  it('should classify a release published event', () => {
    const route = classifyGitHubEvent('release', {
      action: 'published',
      repository: { name: 'blackroad-core' },
      release: { tag_name: 'v1.0.0' },
    })

    expect(route.artifactType).toBe('release_artifact')
    expect(route.direction).toBe('github_to_drive')
    expect(route.drivePath).toBe('/releases/blackroad-core/v1.0.0/')
    expect(route.transformation).toBe('none')
    expect(route.witness).toBe(true)
  })

  it('should classify a lucidia memory journal push', () => {
    const route = classifyGitHubEvent('push', {
      repository: { name: 'lucidia-memory' },
      commits: [
        {
          added: ['memory/journals/2026-02-28.jsonl'],
          modified: [],
        },
      ],
    })

    expect(route.artifactType).toBe('memory_journal')
    expect(route.direction).toBe('github_to_drive')
    expect(route.drivePath).toMatch(/^\/lucidia\/journals\/\d{4}-\d{2}-\d{2}\.gdoc$/)
    expect(route.transformation).toBe('journal_to_doc')
    expect(route.witness).toBe(true)
  })

  it('should classify a roadchain push', () => {
    const route = classifyGitHubEvent('push', {
      repository: { name: 'blackroad-core' },
      commits: [
        {
          added: ['roadchain/block-0042.json'],
          modified: [],
        },
      ],
    })

    expect(route.artifactType).toBe('roadchain_entry')
    expect(route.direction).toBe('github_to_drive')
    expect(route.drivePath).toMatch(/^\/roadchain\/audit\/\d{4}\/\d{2}\/$/)
    expect(route.transformation).toBe('block_to_doc')
    expect(route.witness).toBe(true)
  })

  it('should classify a merged PR as design_asset', () => {
    const route = classifyGitHubEvent('pull_request', {
      action: 'closed',
      pull_request: { merged: true },
      repository: {
        name: 'blackroad-os-web',
        owner: { login: 'BlackRoad-OS' },
      },
    })

    expect(route.artifactType).toBe('design_asset')
    expect(route.direction).toBe('github_to_drive')
    expect(route.drivePath).toBe('/assets/BlackRoad-OS/blackroad-os-web/')
    expect(route.witness).toBe(true)
  })

  it('should classify an agent report push', () => {
    const route = classifyGitHubEvent('push', {
      repository: { name: 'blackroad-operator' },
      commits: [
        {
          added: ['reports/octavia/2026-02-28.md'],
          modified: [],
        },
      ],
    })

    expect(route.artifactType).toBe('agent_report')
    expect(route.direction).toBe('github_to_drive')
    expect(route.drivePath).toBe('/reports/blackroad-operator/')
  })

  it('should classify a plain source code push as non-witnessed', () => {
    const route = classifyGitHubEvent('push', {
      repository: { name: 'blackroad-core' },
      commits: [
        {
          added: ['src/index.ts'],
          modified: ['package.json'],
        },
      ],
    })

    expect(route.artifactType).toBe('source_code')
    expect(route.witness).toBe(false)
  })

  it('should classify an unmerged PR as unknown', () => {
    const route = classifyGitHubEvent('pull_request', {
      action: 'closed',
      pull_request: { merged: false },
    })

    // Not merged — falls through to unknown
    expect(route.artifactType).toBe('unknown')
    expect(route.witness).toBe(false)
  })

  it('should handle ping event gracefully (no crash)', () => {
    const route = classifyGitHubEvent('ping', { zen: 'test' })
    expect(route.artifactType).toBe('unknown')
  })
})

describe('classifyDriveEvent', () => {
  it('should classify a new agent report doc', () => {
    const route = classifyDriveEvent('created', {
      name: 'Sprint Report Q1',
      mimeType: 'application/vnd.google-apps.document',
      parents: [],
    })

    expect(route.artifactType).toBe('agent_report')
    expect(route.direction).toBe('drive_to_github')
    expect(route.transformation).toBe('doc_to_markdown')
    expect(route.witness).toBe(true)
  })

  it('should classify a modified strategy doc', () => {
    const route = classifyDriveEvent('modified', {
      name: 'Product Strategy 2026',
      mimeType: 'application/vnd.google-apps.document',
      parents: [],
    })

    expect(route.artifactType).toBe('strategy_doc')
    expect(route.direction).toBe('drive_to_github')
    expect(route.githubPath).toMatch(/^\/knowledge\//)
    expect(route.transformation).toBe('doc_to_markdown')
  })

  it('should return unknown for unrecognized Drive events', () => {
    const route = classifyDriveEvent('modified', {
      name: 'random-spreadsheet.xlsx',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [],
    })

    expect(route.artifactType).toBe('unknown')
    expect(route.witness).toBe(false)
  })
})

describe('shouldExecuteRoute', () => {
  it('should execute witnessed routes when no config exists', () => {
    const route = {
      artifactType: 'release_artifact' as const,
      direction: 'github_to_drive' as const,
      drivePath: '/releases/test/v1/',
      githubPath: '',
      transformation: 'none',
      witness: true,
      classifierSource: 'rule-based',
    }
    expect(shouldExecuteRoute(route, null)).toBe(true)
  })

  it('should skip non-witnessed routes when no config exists', () => {
    const route = {
      artifactType: 'source_code' as const,
      direction: 'github_to_drive' as const,
      drivePath: '',
      githubPath: '',
      transformation: 'none',
      witness: false,
      classifierSource: 'rule-based',
    }
    expect(shouldExecuteRoute(route, null)).toBe(false)
  })

  it('should respect exclusion patterns from config', () => {
    const route = {
      artifactType: 'release_artifact' as const,
      direction: 'github_to_drive' as const,
      drivePath: '/releases/test/v1/',
      githubPath: '',
      transformation: 'none',
      witness: true,
      classifierSource: 'rule-based',
    }

    const config = {
      drive: {
        exclude: ['/releases/test/**'],
        on_release: true,
      },
      github: {},
      witness: true,
    }

    expect(shouldExecuteRoute(route, config)).toBe(false)
  })

  it('should skip releases when on_release is false', () => {
    const route = {
      artifactType: 'release_artifact' as const,
      direction: 'github_to_drive' as const,
      drivePath: '/releases/test/v1/',
      githubPath: '',
      transformation: 'none',
      witness: true,
      classifierSource: 'rule-based',
    }

    const config = {
      drive: {
        exclude: [],
        on_release: false,
      },
      github: {},
      witness: true,
    }

    expect(shouldExecuteRoute(route, config)).toBe(false)
  })
})
