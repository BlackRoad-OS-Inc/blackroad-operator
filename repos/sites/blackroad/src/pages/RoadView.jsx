import { useMemo, useState } from 'react'

const DEFAULT_ITEMS = [
  {
    id: 1,
    title: 'Quest Engine',
    agent: 'Athena',
    team: 'alpha',
    type: 'code',
    category: 'project',
    lastOpened: '2025-09-01T10:00:00Z'
  },
  {
    id: 2,
    title: 'City Skyline',
    agent: 'Apollo',
    team: 'beta',
    type: 'image',
    category: 'asset',
    lastOpened: '2025-09-02T14:30:00Z'
  },
  {
    id: 3,
    title: 'Retro Racer',
    agent: 'Zephyr',
    team: 'beta',
    type: 'video',
    category: 'game',
    lastOpened: '2025-08-29T09:45:00Z'
  },
  {
    id: 4,
    title: 'Debug Session',
    agent: 'Athena',
    team: 'alpha',
    type: 'code',
    category: 'session',
    lastOpened: '2025-09-03T08:15:00Z'
  },
  {
    id: 5,
    title: 'Soundscape Mix',
    agent: 'Echo',
    team: 'gamma',
    type: 'audio',
    category: 'asset',
    lastOpened: '2025-09-04T11:20:00Z'
  },
  {
    id: 6,
    title: 'Launch Brief',
    agent: 'Minerva',
    team: 'delta',
    type: 'document',
    category: 'brief',
    lastOpened: '2025-09-02T18:45:00Z'
  },
  {
    id: 7,
    title: 'Market Pulse Dashboard',
    agent: 'Atlas',
    team: 'growth',
    type: 'dashboard',
    category: 'analytics',
    lastOpened: '2025-09-05T09:10:00Z'
  },
  {
    id: 8,
    title: 'Onboarding Flow',
    agent: 'Helios',
    team: 'success',
    type: 'simulation',
    category: 'experience',
    lastOpened: '2025-09-04T21:05:00Z'
  },
  {
    id: 9,
    title: 'Launch Checklist',
    agent: 'Hermes',
    team: 'ops',
    type: 'workflow',
    category: 'project',
    lastOpened: '2025-08-31T07:30:00Z'
  },
  {
    id: 10,
    title: 'Render Farm Calibration',
    agent: 'Vulcan',
    team: 'gamma',
    type: 'code',
    category: 'maintenance',
    lastOpened: '2025-09-01T16:55:00Z'
  },
  {
    id: 11,
    title: 'Investor Deck',
    agent: 'Aurora',
    team: 'capital',
    type: 'presentation',
    category: 'asset',
    lastOpened: '2025-09-03T12:40:00Z'
  },
  {
    id: 12,
    title: 'Data Drift Report',
    agent: 'Orion',
    team: 'analytics',
    type: 'dataset',
    category: 'report',
    lastOpened: '2025-09-04T05:25:00Z'
  }
]

const STORAGE_KEY = 'roadview-items-v2'

export default function RoadView () {
  const [items] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {}
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS))
    }
    return DEFAULT_ITEMS
  })

  const [agentFilter, setAgentFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('last')

  const agents = useMemo(() => ['all', ...new Set(items.map(i => i.agent))], [items])
  const teams = useMemo(() => ['all', ...new Set(items.map(i => i.team))], [items])
  const types = useMemo(() => ['all', ...new Set(items.map(i => i.type))], [items])

  const filteredItems = useMemo(() => {
    let list = items
    if (agentFilter !== 'all') list = list.filter(i => i.agent === agentFilter)
    if (teamFilter !== 'all') list = list.filter(i => i.team === teamFilter)
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter)
    list = [...list].sort((a, b) => {
      if (sortOrder === 'last') {
        return new Date(b.lastOpened) - new Date(a.lastOpened)
      }
      return a.title.localeCompare(b.title)
    })
    return list
  }, [items, agentFilter, teamFilter, typeFilter, sortOrder])

  return (
    <div>
      <h2 className='text-lg font-semibold mb-4'>RoadView</h2>

      <div className='flex flex-wrap gap-2 mb-4'>
        <select
          aria-label='Agent'
          className='input'
          value={agentFilter}
          onChange={e => setAgentFilter(e.target.value)}
        >
          <option value='all'>All Agents</option>
          {agents.filter(a => a !== 'all').map(a => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          aria-label='Team'
          className='input'
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
        >
          <option value='all'>All Teams</option>
          {teams.filter(t => t !== 'all').map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          aria-label='Type'
          className='input'
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          {types.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        <select
          aria-label='Sort'
          className='input'
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
        >
          <option value='last'>Last Opened</option>
          <option value='name'>Alphabetical</option>
        </select>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredItems.map(item => (
          <div key={item.id} className='card flex flex-col gap-2'>
            <div className='font-semibold'>{item.title}</div>
            <div className='text-sm text-neutral-400 capitalize'>
              {item.category} • {item.type} • {item.agent} • {item.team}
            </div>
            <div className='text-xs text-neutral-500'>
              Last opened {new Date(item.lastOpened).toLocaleString()}
            </div>
            <div className='mt-auto'>
              <a
                href={`/lucidia?item=${item.id}`}
                className='btn-primary block text-center'
              >
                Open in Lucidia
              </a>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className='text-neutral-400'>No items match your filters.</div>
        )}
      </div>
    </div>
  )
}

