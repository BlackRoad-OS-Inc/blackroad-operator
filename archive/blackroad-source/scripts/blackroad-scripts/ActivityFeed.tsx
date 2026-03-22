import { useState, useEffect } from 'react'

interface Activity {
  id: string
  type: 'deploy' | 'task' | 'alert' | 'agent' | 'memory' | 'push' | 'pr' | 'issue'
  message: string
  timestamp: string
  agent?: string
  url?: string
}

interface ActivityFeedProps {
  activities?: Activity[]
  liveUpdates?: boolean
}

const typeIcons: Record<string, string> = {
  deploy: '🚀',
  task: '✅',
  alert: '⚠️',
  agent: '🤖',
  memory: '📚',
  push: '⬆️',
  pr: '🔀',
  issue: '📋',
}

const typeColors: Record<string, string> = {
  deploy: 'text-blue-400',
  task: 'text-green-400',
  alert: 'text-yellow-400',
  agent: 'text-purple-400',
  memory: 'text-pink-400',
  push: 'text-cyan-400',
  pr: 'text-orange-400',
  issue: 'text-red-400',
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function mapGitHubEvent(event: any): Activity | null {
  const repo = event.repo?.name?.replace('BlackRoad-OS/', '') || 'unknown'
  const base = { id: event.id, timestamp: timeAgo(event.created_at) }

  switch (event.type) {
    case 'PushEvent':
      const commits = event.payload?.commits?.length || 1
      return { ...base, type: 'push', message: `Pushed ${commits} commit${commits > 1 ? 's' : ''} to ${repo}` }
    case 'PullRequestEvent':
      return { ...base, type: 'pr', message: `${event.payload?.action} PR in ${repo}`, url: event.payload?.pull_request?.html_url }
    case 'IssuesEvent':
      return { ...base, type: 'issue', message: `${event.payload?.action} issue in ${repo}` }
    case 'CreateEvent':
      return { ...base, type: 'deploy', message: `Created ${event.payload?.ref_type} in ${repo}` }
    case 'WatchEvent':
      return { ...base, type: 'agent', message: `Starred ${repo}`, agent: event.actor?.login }
    case 'ForkEvent':
      return { ...base, type: 'task', message: `Forked ${repo}` }
    default:
      return null
  }
}

export default function ActivityFeed({ activities: initialActivities, liveUpdates = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities || [])
  const [loading, setLoading] = useState(!initialActivities)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialActivities) return

    const fetchActivity = async () => {
      try {
        // Fetch from GitHub API (public events, no auth needed)
        const res = await fetch('https://api.github.com/orgs/BlackRoad-OS/events?per_page=15')
        if (!res.ok) throw new Error('Failed to fetch')
        const events = await res.json()
        const mapped = events.map(mapGitHubEvent).filter(Boolean) as Activity[]
        setActivities(mapped.slice(0, 10))
        setError(null)
      } catch (err) {
        setError('Could not load activity')
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
    if (liveUpdates) {
      const interval = setInterval(fetchActivity, 60000) // Refresh every minute
      return () => clearInterval(interval)
    }
  }, [initialActivities, liveUpdates])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Live Activity</h2>
        <div className="flex items-center gap-2">
          {liveUpdates && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
          <a href="https://github.com/BlackRoad-OS" target="_blank" rel="noopener" className="text-xs text-text-muted hover:text-text">
            View GitHub
          </a>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {loading && (
          <div className="text-center py-8 text-text-dim">Loading activity...</div>
        )}
        {error && (
          <div className="text-center py-8 text-yellow-400">{error}</div>
        )}
        {!loading && !error && activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 hover:border-accent/50 transition-colors"
          >
            <span className={`text-lg ${typeColors[activity.type] || 'text-gray-400'}`}>
              {typeIcons[activity.type] || '📌'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{activity.message}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-text-dim">
                {activity.agent && (
                  <>
                    <span className="text-accent">{activity.agent}</span>
                    <span>•</span>
                  </>
                )}
                <span>{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
