'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Server, Cpu, HardDrive, Wifi, WifiOff, Activity, Radio } from 'lucide-react';

interface FleetNode {
  name: string;
  ip: string;
  role: string;
  accelerator: string;
  tops: number;
  status: string;
}

interface FleetData {
  nodes: FleetNode[];
  summary: {
    total_nodes: number;
    online_nodes: number;
    total_tops: number;
    ai_skills: number;
    repos: number;
  };
  timestamp: string;
}

const NODE_COLORS: Record<string, string> = {
  Alice: 'from-emerald-400 to-teal-600',
  Cecilia: 'from-violet-400 to-purple-600',
  Octavia: 'from-amber-400 to-orange-600',
  Aria: 'from-blue-400 to-indigo-600',
  Lucidia: 'from-[#2979FF] to-blue-700',
};

const NODE_SERVICES: Record<string, string[]> = {
  Alice: ['Qdrant', 'DNS', 'Agent Daemon', 'Nginx', 'Cloudflared'],
  Cecilia: ['Ollama (15 models)', 'Hailo-8 NPU', 'Agent Daemon', 'Cloudflared'],
  Octavia: ['Gitea', 'NATS', 'Docker Swarm', 'Hailo-8 NPU'],
  Aria: ['Portainer', 'Headscale', 'WireGuard'],
  Lucidia: ['Web Apps', 'GitHub Actions Runner'],
};

export default function FleetPage() {
  const [data, setData] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/fleet');
        const d = await res.json();
        setData(d);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="p-6 flex items-center gap-3 text-gray-400">
      <Radio className="h-4 w-4 animate-pulse text-[#FF1D6C]" />
      Scanning fleet...
    </div>
  );

  const nodes = data?.nodes ?? [];
  const summary = data?.summary;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Fleet</h1>
        <p className="text-gray-400 text-sm mt-1">
          {summary?.total_nodes ?? 0} nodes · {summary?.total_tops ?? 0} TOPS · {summary?.ai_skills ?? 0} AI skills
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Nodes', value: summary?.total_nodes ?? 5, icon: Server },
          { label: 'Online', value: summary?.online_nodes ?? 5, icon: Wifi },
          { label: 'TOPS', value: summary?.total_tops ?? 62, icon: Cpu },
          { label: 'AI Skills', value: summary?.ai_skills ?? 50, icon: Activity },
          { label: 'Repos', value: summary?.repos ?? 275, icon: HardDrive },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <s.icon className="h-4 w-4 text-gray-500 mb-2" />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Node cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {nodes.map(node => {
          const gradient = NODE_COLORS[node.name] ?? 'from-gray-500 to-gray-700';
          const services = NODE_SERVICES[node.name] ?? [];

          return (
            <Link
              key={node.name}
              href={`/fleet/${node.name.toLowerCase()}`}
              className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:bg-white/[0.07] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  {node.status === 'online' ? (
                    <Wifi className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-red-400" />
                  )}
                  <span className={`text-xs ${node.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                    {node.status}
                  </span>
                </div>
              </div>

              <h3 className="text-white font-bold text-lg">{node.name}</h3>
              <p className="text-gray-500 text-xs font-mono mb-1">{node.ip}</p>
              <p className="text-gray-400 text-sm mb-3">{node.role}</p>

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="font-mono">{node.accelerator}</span>
                <span className="text-gray-700">·</span>
                <span>{node.tops} TOPS</span>
              </div>

              <div className="flex flex-wrap gap-1.5 border-t border-white/5 pt-3">
                {services.map(svc => (
                  <span key={svc} className="text-xs px-2 py-0.5 bg-white/5 rounded text-gray-400">{svc}</span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="text-xs text-gray-600 text-center pt-2">
        Refreshes every 30s · Updated {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'now'}
      </div>
    </div>
  );
}
