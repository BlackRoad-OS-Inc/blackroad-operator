'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitBranch, Star, Clock, Code, Radio, ExternalLink } from 'lucide-react';

interface Repo {
  name: string;
  description: string;
  language: string;
  stars: number;
  updated: string;
  org: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572a5',
  Shell: '#89e051', Go: '#00ADD8', Rust: '#dea584', HTML: '#e34c26',
  CSS: '#563d7c', Dockerfile: '#384d54', YAML: '#cb171e',
};

export default function ReposPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        // Try Gitea API first
        const res = await fetch('https://git.blackroad.io/api/v1/repos/search?limit=50&sort=updated', {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          setRepos((data.data || []).map((r: any) => ({
            name: r.name,
            description: r.description || '',
            language: r.language || 'Unknown',
            stars: r.stars_count || 0,
            updated: r.updated_at,
            org: r.owner?.login || 'blackroad',
          })));
          setLoading(false);
          return;
        }
      } catch { /* Gitea unreachable */ }

      // Fallback: static repo list
      setRepos([
        { name: 'blackroad-os-web', description: 'Dashboard & docs site (Next.js)', language: 'TypeScript', stars: 0, updated: '2026-03-14', org: 'blackroad' },
        { name: 'chat-blackroad', description: 'Voice-first AI chat on Cloudflare Workers', language: 'JavaScript', stars: 0, updated: '2026-03-14', org: 'blackroad' },
        { name: 'blackroad-operator', description: 'Sync engine, memory system, fleet management', language: 'Shell', stars: 0, updated: '2026-03-14', org: 'blackroad' },
        { name: 'blackroad-os-kpis', description: 'Daily KPI tracking — 60+ metrics across fleet', language: 'Shell', stars: 0, updated: '2026-03-14', org: 'blackroad' },
        { name: 'blackroad-agent-daemon', description: 'Python HTTP daemon for Pi fleet remote execution', language: 'Python', stars: 0, updated: '2026-03-14', org: 'blackroad' },
        { name: 'lucidia-core', description: 'Lucidia reasoning engine and philosophy framework', language: 'Python', stars: 0, updated: '2026-03-13', org: 'blackroad' },
        { name: 'cipher-scan', description: 'Security scanning and vulnerability detection', language: 'Go', stars: 0, updated: '2026-03-12', org: 'blackroad' },
        { name: 'echo-memory', description: 'Vector-based memory and recall system', language: 'Python', stars: 0, updated: '2026-03-12', org: 'blackroad' },
        { name: 'prism-analytics', description: 'Pattern recognition and data analysis pipelines', language: 'TypeScript', stars: 0, updated: '2026-03-11', org: 'blackroad' },
        { name: 'mesh-webrtc', description: 'WebRTC mesh networking for browser compute nodes', language: 'TypeScript', stars: 0, updated: '2026-03-10', org: 'blackroad' },
      ]);
      setLoading(false);
    }
    load();
  }, []);

  const languages = [...new Set(repos.map(r => r.language))].sort();
  const filtered = repos.filter(r => {
    if (filter !== 'all' && r.language !== filter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return (
    <div className="p-6 flex items-center gap-3 text-gray-400">
      <Radio className="h-4 w-4 animate-pulse text-[#FF1D6C]" />
      Loading repositories...
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Repositories</h1>
          <p className="text-gray-400 text-sm mt-1">{repos.length} repos across BlackRoad orgs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search repos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF1D6C]/50 w-64"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            All
          </button>
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => setFilter(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${filter === lang ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: LANGUAGE_COLORS[lang] ?? '#666' }} />
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Repo list */}
      <div className="space-y-2">
        {filtered.map(repo => (
          <Link
            key={`${repo.org}/${repo.name}`}
            href={`/repos/${repo.name}`}
            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.07] transition-all group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="text-white font-medium truncate">{repo.org}/{repo.name}</span>
              </div>
              <p className="text-gray-500 text-xs mt-1 truncate">{repo.description}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0 ml-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: LANGUAGE_COLORS[repo.language] ?? '#666' }} />
                {repo.language}
              </div>
              {repo.stars > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="h-3 w-3" /> {repo.stars}
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {new Date(repo.updated).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-xs text-gray-600 text-center pt-2">
        Primary host: <a href="https://git.blackroad.io" target="_blank" rel="noreferrer" className="hover:text-gray-400">git.blackroad.io</a> · GitHub mirror
      </div>
    </div>
  );
}
