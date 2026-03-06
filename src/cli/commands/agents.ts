// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { GatewayClient } from '../../core/client.js'
import { logger } from '../../core/logger.js'
import { formatTable } from '../../formatters/table.js'
import chalk from 'chalk'

interface Agent {
  name: string
  title: string
  role: string
  status?: string
  lastSeen?: string
  tasksCompleted?: number
}

const CORE_AGENTS: Agent[] = [
  { name: 'LUCIDIA', title: 'The Dreamer', role: 'Coordinator', status: 'unknown' },
  { name: 'ALICE', title: 'The Operator', role: 'Router', status: 'unknown' },
  { name: 'OCTAVIA', title: 'The Architect', role: 'Compute', status: 'unknown' },
  { name: 'PRISM', title: 'The Analyst', role: 'Analyst', status: 'unknown' },
  { name: 'ECHO', title: 'The Memory', role: 'Memory', status: 'unknown' },
  { name: 'CIPHER', title: 'The Hacker', role: 'Security', status: 'unknown' },
]

function colorStatus(status: string): string {
  switch (status) {
    case 'online':
      return chalk.green(status)
    case 'offline':
      return chalk.red(status)
    case 'busy':
      return chalk.yellow(status)
    default:
      return chalk.gray(status)
  }
}

export const agentsCommand = new Command('agents')
  .description('Agent management')

agentsCommand
  .command('list')
  .description('List all agents')
  .option('--json', 'Output as JSON')
  .action(async (opts: { json?: boolean }) => {
    const client = new GatewayClient()
    try {
      const data = await client.get<{ agents: Agent[] }>('/v1/agents')
      if (opts.json) {
        console.log(JSON.stringify(data.agents, null, 2))
        return
      }
      console.log(
        formatTable(
          ['Name', 'Title', 'Role'],
          data.agents.map((a) => [a.name, a.title, a.role]),
        ),
      )
    } catch {
      logger.warn('Gateway unreachable — showing known core agents.')
      if (opts.json) {
        console.log(JSON.stringify(CORE_AGENTS, null, 2))
        return
      }
      console.log(
        formatTable(
          ['Name', 'Title', 'Role'],
          CORE_AGENTS.map((a) => [a.name, a.title, a.role]),
        ),
      )
    }
  })

agentsCommand
  .command('status')
  .description('Show live agent status with health indicators')
  .option('--json', 'Output as JSON')
  .action(async (opts: { json?: boolean }) => {
    const client = new GatewayClient()
    let agents: Agent[]

    try {
      const data = await client.get<{ agents: Agent[] }>('/v1/agents')
      agents = data.agents
    } catch {
      logger.warn('Registry unreachable — showing core agents with unknown status.')
      agents = CORE_AGENTS
    }

    if (opts.json) {
      console.log(JSON.stringify(agents, null, 2))
      return
    }

    console.log(chalk.bold('\n  Agent Status\n'))
    console.log(
      formatTable(
        ['Name', 'Role', 'Status', 'Last Seen', 'Tasks'],
        agents.map((a) => [
          a.name,
          a.role,
          colorStatus(a.status ?? 'unknown'),
          a.lastSeen ?? '—',
          String(a.tasksCompleted ?? '—'),
        ]),
      ),
    )
    console.log()

    const online = agents.filter((a) => a.status === 'online').length
    const total = agents.length
    logger.info(`${online}/${total} agents online`)
  })

// Default action when no subcommand is given — list agents
agentsCommand.action(async () => {
  await agentsCommand.commands.find((c) => c.name() === 'list')?.parseAsync([], { from: 'user' })
})
