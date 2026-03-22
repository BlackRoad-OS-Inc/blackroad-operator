'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Server, Cpu, HardDrive, Wifi, Activity, Clock, Terminal } from 'lucide-react';

const NODE_DETAILS: Record<string, {
  fullName: string; os: string; arch: string; ram: string; storage: string;
  gradient: string; services: { name: string; port: number; status: string }[];
  tunnels: string[]; description: string;
}> = {
  alice: {
    fullName: 'Alice', os: 'Raspberry Pi OS (Bullseye)', arch: 'aarch64', ram: '8 GB', storage: '128 GB SD',
    gradient: 'from-emerald-400 to-teal-600',
    services: [
      { name: 'Qdrant Vector DB', port: 6333, status: 'running' },
      { name: 'Agent Daemon', port: 8095, status: 'running' },
      { name: 'Nginx Reverse Proxy', port: 8080, status: 'running' },
      { name: 'Cloudflared Tunnel', port: 0, status: 'running' },
      { name: 'Pi-hole DNS', port: 53, status: 'running' },
    ],
    tunnels: ['agents.blackroad.io', 'dashboard.blackroad.io', 'git.blackroad.io'],
    description: 'Primary gateway node. Handles DNS, vector search, and agent daemon routing via Cloudflare tunnel.',
  },
  cecilia: {
    fullName: 'Cecilia', os: 'Raspberry Pi OS (Bookworm)', arch: 'aarch64', ram: '8 GB', storage: '256 GB NVMe',
    gradient: 'from-violet-400 to-purple-600',
    services: [
      { name: 'Ollama (15 models)', port: 11434, status: 'running' },
      { name: 'Hailo-8 NPU Runtime', port: 0, status: 'running' },
      { name: 'Agent Daemon (backup)', port: 4010, status: 'running' },
      { name: 'Cloudflared Tunnel', port: 0, status: 'running' },
    ],
    tunnels: ['ollama.blackroad.io', 'api.blackroad.io', 'gateway.blackroad.io'],
    description: 'AI compute node with Hailo-8 NPU. Runs 15 Ollama models and handles all inference workloads.',
  },
  octavia: {
    fullName: 'Octavia', os: 'Raspberry Pi OS (Bookworm)', arch: 'aarch64', ram: '8 GB', storage: '256 GB NVMe',
    gradient: 'from-amber-400 to-orange-600',
    services: [
      { name: 'Gitea', port: 3100, status: 'running' },
      { name: 'NATS Server', port: 4222, status: 'running' },
      { name: 'NATS Monitoring', port: 8222, status: 'running' },
      { name: 'Docker Swarm Manager', port: 2377, status: 'running' },
      { name: 'Hailo-8 NPU Runtime', port: 0, status: 'running' },
    ],
    tunnels: ['git.blackroad.io (origin)'],
    description: 'Infrastructure node. Hosts Gitea (275+ repos), NATS message bus, and Docker Swarm orchestration.',
  },
  aria: {
    fullName: 'Aria', os: 'Raspberry Pi OS (Bookworm)', arch: 'aarch64', ram: '4 GB', storage: '64 GB SD',
    gradient: 'from-blue-400 to-indigo-600',
    services: [
      { name: 'Portainer', port: 9443, status: 'running' },
      { name: 'Headscale', port: 8080, status: 'running' },
      { name: 'WireGuard', port: 51820, status: 'running' },
    ],
    tunnels: ['aria.blackroad.io'],
    description: 'Network management node. Runs Portainer for container management and Headscale for mesh VPN.',
  },
  lucidia: {
    fullName: 'Lucidia', os: 'Raspberry Pi OS (Bullseye)', arch: 'aarch64', ram: '4 GB', storage: '32 GB SD',
    gradient: 'from-[#2979FF] to-blue-700',
    services: [
      { name: 'Web Apps Server', port: 3000, status: 'running' },
      { name: 'GitHub Actions Runner', port: 0, status: 'running' },
    ],
    tunnels: ['lucidia.blackroad.io'],
    description: 'Edge web apps node. Runs lightweight web services and CI/CD runners. SD card degrading — replacement planned.',
  },
};

export default function FleetNodePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const node = NODE_DETAILS[name.toLowerCase()];

  if (!node) {
    return (
      <div className="p-6">
        <Link href="/fleet" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Fleet
        </Link>
        <div className="text-red-400">Node &quot;{name}&quot; not found.</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <Link href="/fleet" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Fleet
      </Link>

      {/* Hero */}
      <div className={`relative rounded-2xl bg-gradient-to-br ${node.gradient} p-px`}>
        <div className="rounded-2xl bg-black/90 p-6">
          <div className="flex items-start gap-5">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${node.gradient} flex items-center justify-center shrink-0`}>
              <Server className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">{node.fullName}</h1>
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
                  <span className="text-xs text-green-400">online</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-2 leading-relaxed">{node.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System info */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'OS', value: node.os, icon: Cpu },
          { label: 'Arch', value: node.arch, icon: HardDrive },
          { label: 'RAM', value: node.ram, icon: Activity },
          { label: 'Storage', value: node.storage, icon: HardDrive },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-sm text-white font-mono">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Services */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-gray-400" />
          Services
        </h2>
        <div className="space-y-2">
          {node.services.map(svc => (
            <div key={svc.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${svc.status === 'running' ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-gray-300">{svc.name}</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {svc.port > 0 ? `:${svc.port}` : 'system'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tunnels */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Wifi className="h-4 w-4 text-gray-400" />
          Cloudflare Tunnels
        </h2>
        <div className="flex flex-wrap gap-2">
          {node.tunnels.map(t => (
            <span key={t} className="text-xs px-3 py-1.5 bg-white/5 rounded-lg text-gray-300 font-mono border border-white/10">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
