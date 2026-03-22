'use client';

import Link from 'next/link';
import { Book, Code, Server, Shield, Cpu, Zap, Terminal, Globe, ArrowRight } from 'lucide-react';

const DOCS = [
  {
    category: 'Getting Started',
    items: [
      { title: 'Introduction', description: 'What is BlackRoad OS and how it works', href: '/docs/intro', icon: Book },
      { title: 'Quick Start', description: 'Deploy your first agent in 5 minutes', href: '/docs/quickstart', icon: Zap },
      { title: 'Architecture', description: 'How the Pi fleet, tunnels, and mesh work together', href: '/docs/architecture', icon: Globe },
    ],
  },
  {
    category: 'Infrastructure',
    items: [
      { title: 'Fleet Setup', description: 'Raspberry Pi fleet configuration and management', href: '/docs/fleet', icon: Server },
      { title: 'Cloudflare Tunnels', description: 'Remote-managed tunnel architecture and routing', href: '/docs/tunnels', icon: Shield },
      { title: 'Agent Daemon', description: 'REST API for remote shell, file ops, and git on Pi fleet', href: '/docs/daemon', icon: Terminal },
    ],
  },
  {
    category: 'AI & Models',
    items: [
      { title: 'Ollama Models', description: '15 models on Cecilia Pi — routing, fallback, and tuning', href: '/docs/models', icon: Cpu },
      { title: 'AI Skills', description: '50 skills: CoT, ReAct, ToT, federated inference, and more', href: '/docs/skills', icon: Zap },
      { title: 'Semantic RAG', description: 'Vector search with Qdrant + nomic-embed-text', href: '/docs/rag', icon: Code },
    ],
  },
  {
    category: 'Development',
    items: [
      { title: 'Chat Platform', description: 'chat.blackroad.io — voice-first multi-AI chat', href: '/docs/chat', icon: Terminal },
      { title: 'Memory System', description: 'Persistent journal, codex, TIL broadcast, and FTS5 search', href: '/docs/memory', icon: Book },
      { title: 'API Reference', description: 'REST endpoints for all BlackRoad services', href: '/docs/api', icon: Code },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Documentation</h1>
        <p className="text-gray-400 text-sm mt-1">
          Guides, references, and architecture docs for BlackRoad OS
        </p>
      </div>

      {DOCS.map(section => (
        <div key={section.category}>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {section.category}
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {section.items.map(item => (
              <Link
                key={item.title}
                href={item.href}
                className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 hover:bg-white/[0.07] transition-all"
              >
                <item.icon className="h-5 w-5 text-gray-500 mb-3 group-hover:text-[#FF1D6C] transition-colors" />
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-8">
        <h2 className="text-lg font-semibold text-white mb-2">External Resources</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {[
            { label: 'Gitea (primary)', url: 'https://git.blackroad.io' },
            { label: 'Chat Platform', url: 'https://chat.blackroad.io' },
            { label: 'Status Page', url: 'https://status.blackroad.io' },
            { label: 'Portal', url: 'https://portal.blackroad.io' },
          ].map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <span className="text-sm text-gray-300">{link.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
