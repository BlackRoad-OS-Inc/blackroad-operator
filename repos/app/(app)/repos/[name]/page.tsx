'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitBranch, GitCommit, Star, Clock, Code, ExternalLink, FileText, Radio } from 'lucide-react';

interface RepoDetail {
  name: string;
  full_name: string;
  description: string;
  language: string;
  default_branch: string;
  stars_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  clone_url: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572a5',
  Shell: '#89e051', Go: '#00ADD8', Rust: '#dea584',
};

export default function RepoDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [repo, setRepo] = useState<RepoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [readme, setReadme] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`https://git.blackroad.io/api/v1/repos/blackroad/${name}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          setRepo(await res.json());
        }
      } catch { /* fallback */ }

      try {
        const res = await fetch(`https://git.blackroad.io/api/v1/repos/blackroad/${name}/raw/README.md`, {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) setReadme(await res.text());
      } catch { /* no readme */ }

      setLoading(false);
    }
    load();
  }, [name]);

  if (loading) return (
    <div className="p-6 flex items-center gap-3 text-gray-400">
      <Radio className="h-4 w-4 animate-pulse text-[#FF1D6C]" />
      Loading {name}...
    </div>
  );

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <Link href="/repos" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Repos
      </Link>

      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-5 w-5 text-gray-400" />
              <h1 className="text-2xl font-bold text-white">{repo?.full_name ?? `blackroad/${name}`}</h1>
            </div>
            <p className="text-gray-400 text-sm">{repo?.description ?? 'BlackRoad repository'}</p>
          </div>
          {repo?.html_url && (
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-xs hover:text-white transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Gitea
            </a>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Language', value: repo?.language ?? 'Unknown', icon: Code },
          { label: 'Branch', value: repo?.default_branch ?? 'main', icon: GitBranch },
          { label: 'Issues', value: repo?.open_issues_count ?? 0, icon: FileText },
          { label: 'Size', value: repo?.size ? `${Math.round(repo.size / 1024)} MB` : '—', icon: Star },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
            <s.icon className="h-3.5 w-3.5 text-gray-500 mb-1" />
            <div className="text-sm text-white font-mono">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Clone */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="text-xs text-gray-500 mb-2">Clone</div>
        <code className="text-sm text-gray-300 font-mono">
          git clone https://git.blackroad.io/blackroad/{name}.git
        </code>
      </div>

      {/* README */}
      {readme && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" /> README
          </h2>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
            {readme}
          </pre>
        </div>
      )}
    </div>
  );
}
