// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { logger } from '../../core/logger.js'
import { formatTable } from '../../formatters/table.js'
import { brand } from '../../formatters/brand.js'

const INDEX_URL =
  process.env['BLACKROAD_INDEX_URL'] ?? 'https://blackroad-repo-index.blackroad.workers.dev'

const SEARCH_URL =
  process.env['BLACKROAD_SEARCH_URL'] ?? 'https://blackroad-search.blackroad.workers.dev'

async function apiFetch<T>(base: string, path: string): Promise<T> {
  const res = await fetch(`${base}${path}`)
  if (!res.ok) {
    throw new Error(`${path}: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const indexCommand = new Command('index')
  .description('Search and browse the BlackRoad repo index')

// br index stats
indexCommand
  .command('stats')
  .description('Show index statistics')
  .action(async () => {
    try {
      const stats = await apiFetch<{
        total_repos: number
        total_orgs: number
        languages: Record<string, number>
        last_indexed: string
      }>(INDEX_URL, '/stats')

      console.log(brand.header('Repo Index Stats'))
      logger.info(`Total repos:  ${stats.total_repos}`)
      logger.info(`Total orgs:   ${stats.total_orgs}`)
      logger.info(`Last indexed: ${stats.last_indexed}`)

      if (stats.languages) {
        const sorted = Object.entries(stats.languages)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
        console.log('\nTop languages:')
        console.log(
          formatTable(
            ['Language', 'Count'],
            sorted.map(([lang, count]) => [lang, String(count)]),
          ),
        )
      }
    } catch {
      logger.error('Index service unreachable. Deploy blackroad-repo-index worker first.')
    }
  })

// br index orgs
indexCommand
  .command('orgs')
  .description('List all indexed organizations')
  .action(async () => {
    try {
      const data = await apiFetch<{
        orgs: { org: string; repo_count: number; indexed_at: string | null }[]
      }>(INDEX_URL, '/orgs')

      console.log(brand.header('Indexed Organizations'))
      console.log(
        formatTable(
          ['Organization', 'Repos', 'Indexed'],
          data.orgs.map((o) => [
            o.org,
            String(o.repo_count),
            o.indexed_at ? new Date(o.indexed_at).toLocaleDateString() : 'never',
          ]),
        ),
      )
    } catch {
      logger.error('Index service unreachable.')
    }
  })

// br index search <query>
indexCommand
  .command('search <query>')
  .description('Search repos by name, language, or topic')
  .option('--org <org>', 'Filter by organization')
  .option('--limit <n>', 'Max results', '20')
  .action(async (query: string, opts: { org?: string; limit: string }) => {
    try {
      const params = new URLSearchParams({ q: query, limit: opts.limit })
      if (opts.org) params.set('org', opts.org)

      const data = await apiFetch<{
        query: string
        count: number
        results: { name: string; org: string; language: string; stars: number }[]
      }>(INDEX_URL, `/search?${params}`)

      console.log(brand.header(`Search: "${query}"`))
      logger.info(`Found ${data.count} results`)

      if (data.results.length) {
        console.log(
          formatTable(
            ['Name', 'Org', 'Language', 'Stars'],
            data.results.map((r) => [r.name, r.org, r.language || '-', String(r.stars ?? 0)]),
          ),
        )
      }
    } catch {
      logger.error('Search failed. Is the index service running?')
    }
  })

// br index repo <org> <name>
indexCommand
  .command('repo <org> <name>')
  .description('Show details for a specific repo')
  .action(async (org: string, name: string) => {
    try {
      const repo = await apiFetch<{
        name: string
        full_name: string
        description: string
        language: string
        stars: number
        forks: number
        visibility: string
        html_url: string
        topics: string[]
        updated_at: string
      }>(INDEX_URL, `/repos/${org}/${name}`)

      console.log(brand.header(repo.full_name))
      logger.info(`Description: ${repo.description || '(none)'}`)
      logger.info(`Language:    ${repo.language}`)
      logger.info(`Stars:       ${repo.stars}`)
      logger.info(`Forks:       ${repo.forks}`)
      logger.info(`Visibility:  ${repo.visibility}`)
      logger.info(`URL:         ${repo.html_url}`)
      if (repo.topics?.length) {
        logger.info(`Topics:      ${repo.topics.join(', ')}`)
      }
      logger.info(`Updated:     ${repo.updated_at}`)
    } catch {
      logger.error(`Repo ${org}/${name} not found in index.`)
    }
  })

// br index find <query> — unified search across everything
indexCommand
  .command('find <query>')
  .description('Unified search across repos, code, agents, workers, and docs')
  .action(async (query: string) => {
    try {
      const data = await apiFetch<{
        query: string
        total_results: number
        agents: { name: string; role: string }[]
        workers: { name: string; description: string }[]
        orgs: { name: string; focus: string }[]
        docs: string[]
        code: { results: { name: string; path: string; repo: string }[] } | null
      }>(SEARCH_URL, `/search?q=${encodeURIComponent(query)}`)

      console.log(brand.header(`Find: "${query}"`))
      logger.info(`${data.total_results} total results\n`)

      if (data.agents.length) {
        console.log('Agents:')
        console.log(
          formatTable(
            ['Name', 'Role'],
            data.agents.map((a) => [a.name, a.role]),
          ),
        )
        console.log()
      }

      if (data.workers.length) {
        console.log('Workers:')
        console.log(
          formatTable(
            ['Name', 'Description'],
            data.workers.map((w) => [w.name, w.description]),
          ),
        )
        console.log()
      }

      if (data.orgs.length) {
        console.log('Organizations:')
        console.log(
          formatTable(
            ['Name', 'Focus'],
            data.orgs.map((o) => [o.name, o.focus]),
          ),
        )
        console.log()
      }

      if (data.docs.length) {
        console.log('Documentation:')
        for (const doc of data.docs) {
          logger.info(`  ${doc}`)
        }
        console.log()
      }

      if (data.code?.results?.length) {
        console.log('Code:')
        console.log(
          formatTable(
            ['File', 'Path', 'Repo'],
            data.code.results.slice(0, 10).map((c) => [c.name, c.path, c.repo]),
          ),
        )
      }
    } catch {
      logger.error('Search service unreachable.')
    }
  })
