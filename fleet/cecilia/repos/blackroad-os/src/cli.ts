#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { loadManifest, withContext } from './schema.js'
import { render } from './render.js'

function usage() {
  return `br-orchestrate <command>\n\nCommands:\n  lint            Validate orchestra.yml with the schema\n  render          Emit .matrix.json, .envrc, README.md\n`
}

function lint(manifestPath?: string) {
  const manifest = withContext(loadManifest(manifestPath))
  const summary = [
    `version: ${manifest.version}`,
    `repos: ${Object.keys(manifest.repos).length}`,
    `services: ${Object.keys(manifest.services).length}`,
    `packs: ${manifest.packs.length}`,
    `envs: ${Object.keys(manifest.environments).length}`,
  ]
  process.stdout.write(`orchestra.yml is valid\n${summary.join('\n')}\n`)
}

function runRender(manifestPath?: string) {
  const manifest = withContext(loadManifest(manifestPath))
  render(manifest)
  process.stdout.write('Rendered .matrix.json, .envrc, and README.md\n')
  // TODO(orchestrator-next): add drift detection and multi-tenant shards
}

function main() {
  const [, , command, manifestPath] = process.argv
  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(usage())
    return
  }
  if (command === 'lint' || command === 'render') {
    if (!fs.existsSync(path.join(process.cwd(), 'orchestra.yml'))) {
      throw new Error('orchestra.yml not found in current directory')
    }
  }
  if (command === 'lint') {
    lint(manifestPath)
    return
  }
  if (command === 'render') {
    runRender(manifestPath)
    return
  }
  process.stderr.write(`Unknown command: ${command}\n`)
  process.stderr.write(usage())
  process.exitCode = 1
}

main()
