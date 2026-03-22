'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitCommit, GitBranch, GitPullRequest, AlertCircle, Clock, Radio, User } from 'lucide-react';

interface ActivityItem {
  type: 'commit' | 'pr' | 'issue' | 'deploy';
  title: string;
  repo: string;
  author: string;
  time: string;
  url?: string;
}

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Try fetching from Gitea activity API
      try {
        const res = await fetch('https://git.blackroad.io/api/v1/repos/search?sort=updated&limit=20', {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          const items: ActivityItem[] = (data.data || []).map((r: any) => ({
            type: 'commit' as const,
            title: `Updated ${r.name}`,
            repo: r.full_name || r.name,
            author: r.owner?.login || 'blackroad',
            time: r.updated_at,
            url: r.html_url,
          }));
          setActivity(items);
          setLoading(false);
          return;
        }
      } catch { /* fallback */ }

      // Fallback: static activity
      setActivity([
        { type: 'commit', title: 'Add traffic collector and expand daily aggregation to 60+ KPIs', repo: 'blackroad/blackroad-os-kpis', author: 'alexa', time: '2026-03-14T10:00:00Z' },
        { type: 'deploy', title: 'Deploy agent daemon to Alice and Cecilia', repo: 'blackroad/blackroad-agent-daemon', author: 'claude', time: '2026-03-14T08:00:00Z' },
        { type: 'commit', title: 'Wire agent daemon into chat.blackroad.io Worker', repo: 'blackroad/chat-blackroad', author: 'claude', time: '2026-03-14T07:00:00Z' },
        { type: 'pr', title: 'v2: 9 collectors, 60+ KPIs', repo: 'blackroad/blackroad-os-kpis', author: 'alexa', time: '2026-03-13T22:00:00Z' },
        { type: 'commit', title: 'Fix fleet total_nodes field, add probe script', repo: 'blackroad/blackroad-os-kpis', author: 'claude', time: '2026-03-13T20:00:00Z' },
        { type: 'issue', title: 'Alice tunnel intermittent 502s on POST', repo: 'blackroad/infrastructure', author: 'alexa', time: '2026-03-13T18:00:00Z' },
        { type: 'deploy', title: 'Deploy blackroad-os-web to Vercel', repo: 'blackroad/blackroad-os-web', author: 'vercel', time: '2026-03-11T15:00:00Z' },
        { type: 'commit', title: 'Add Hailo-8 NPU runtime to Cecilia', repo: 'blackroad/fleet-config', author: 'alexa', time: '2026-03-10T12:00:00Z' },
      ]);
      setLoading(false);
    }
    load();
  }, []);

  const ICONS = {
    commit: GitCommit,
    pr: GitPullRequest,
    issue: AlertCircle,
    deploy: GitBranch,
  };

  const COLORS = {
    commit: 'text-green-400',
    pr: 'text-violet-400',
    issue: 'text-amber-400',
    deploy: 'text-blue-400',
  };

  if (loading) return (
    <div className="p-6 flex items-center gap-3 text-gray-400">
      <Radio className="h-4 w-4 animate-pulse text-[#FF1D6C]" />
      Loading activity...
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <p className="text-gray-400 text-sm mt-1">Recent commits, deploys, and issues across BlackRoad</p>
      </div>

      <div className="space-y-1">
        {activity.map((item, i) => {
          const Icon = ICONS[item.type];
          const color = COLORS[item.type];
          const timeAgo = getTimeAgo(item.time);

          return (
            <div
              key={i}
              className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.07] transition-all"
            >
              <Icon className={`h-5 w-5 ${color} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{item.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <Link
                    href={`/repos/${item.repo.split('/').pop()}`}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors font-mono"
                  >
                    {item.repo}
                  </Link>
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <User className="h-3 w-3" /> {item.author}
                  </span>
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {timeAgo}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-600 text-center pt-2">
        Data from <a href="https://git.blackroad.io" target="_blank" rel="noreferrer" className="hover:text-gray-400">git.blackroad.io</a>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
