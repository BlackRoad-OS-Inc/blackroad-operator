'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Book } from 'lucide-react';

const DOC_CONTENT: Record<string, { title: string; content: string }> = {
  intro: {
    title: 'Introduction to BlackRoad OS',
    content: `BlackRoad OS is a sovereign AI operating system that runs entirely on your own hardware. No cloud dependency. No data leaving your devices.

## What It Does

- **50 AI Skills** — Chain-of-Thought, ReAct, Tree-of-Thought, federated inference, autonomous coding, and more
- **5 Edge Nodes** — Raspberry Pi fleet with 62 TOPS combined compute (including 2 Hailo-8 NPUs)
- **275+ Repositories** — All hosted on self-hosted Gitea with GitHub as mirror
- **Mesh Networking** — Every device is a node. Phones, laptops, browser tabs as elastic compute

## Core Philosophy

1. **Sovereignty** — Your data, your hardware, your rules
2. **Equality** — Accessible to everyone regardless of resources
3. **Resilience** — Works offline, degrades gracefully, heals automatically
4. **Transparency** — Full audit logs, open source, no black boxes`,
  },
  quickstart: {
    title: 'Quick Start',
    content: `## Deploy Your First Agent

### 1. Access the Dashboard
Visit docs.blackroad.io and sign in with any email.

### 2. Navigate to Agents
Click on any agent card to see their profile, skills, and capabilities.

### 3. Start a Conversation
Click "Chat" on any agent to open a conversation with that agent.

### 4. Use the Fleet
Go to Fleet to see all 5 Pi nodes and their services.

## Chat Commands (chat.blackroad.io)

\`\`\`
/shell <command>     — Execute shell on Pi fleet
/file read <path>    — Read files from fleet
/git status <repo>   — Git operations on fleet repos
/agent <task>        — AI-planned multi-step task execution
/moa <question>      — Mixture of Agents consensus
/recall <query>      — Semantic memory search
\`\`\``,
  },
  architecture: {
    title: 'Architecture',
    content: `## System Architecture

\`\`\`
Browser ←→ Cloudflare Workers ←→ Cloudflare Tunnels ←→ Pi Fleet
                                                        ├── Alice (Gateway)
                                                        ├── Cecilia (AI Compute)
                                                        ├── Octavia (Infrastructure)
                                                        ├── Aria (Network)
                                                        └── Lucidia (Edge Apps)
\`\`\`

## Tunnel Routing

Both tunnels use **remote-managed configs** from Cloudflare Zero Trust dashboard. Local config.yml ingress rules are IGNORED.

### Alice Tunnel (blackroad-pi)
- agents.blackroad.io → nginx:8080 → daemon:8095
- dashboard.blackroad.io → localhost:3000
- git.blackroad.io → 192.168.4.100:3100 (Octavia Gitea)

### Cecilia Tunnel (blackroad-cecilia)
- ollama.blackroad.io → localhost:11434
- api.blackroad.io → localhost:8788
- gateway.blackroad.io → localhost:8787

## Key Gotcha
DNS CNAME routing determines which tunnel handles each hostname. The remote config on each tunnel only fires for hostnames whose DNS points to that tunnel's CNAME.`,
  },
  fleet: {
    title: 'Fleet Setup',
    content: `## Raspberry Pi Fleet

5 Raspberry Pi nodes form the backbone of BlackRoad OS.

| Node | IP | Role | Accelerator | TOPS |
|------|-----|------|-------------|------|
| Alice | 192.168.4.49 | Gateway + DNS + Qdrant | CPU | 2 |
| Cecilia | 192.168.4.96 | AI Models + Embedding | Hailo-8 | 28 |
| Octavia | 192.168.4.101 | Gitea + NATS + Docker Swarm | Hailo-8 | 28 |
| Aria | 192.168.4.98 | Portainer + Headscale | CPU | 2 |
| Lucidia | 192.168.4.38 | Web Apps + Actions Runner | CPU | 2 |

## Management

- **SSH**: All nodes accessible via SSH from the local network
- **Portainer**: Container management at aria.blackroad.io
- **Headscale**: Mesh VPN for remote access
- **NATS**: Message bus connecting all nodes`,
  },
  tunnels: {
    title: 'Cloudflare Tunnels',
    content: `## Remote-Managed Tunnels

**Critical**: Both Alice and Cecilia tunnels use REMOTE MANAGED configs from the Cloudflare Zero Trust dashboard. Local \`config.yml\` changes have NO EFFECT on ingress routing.

The log message \`Updated to new configuration\` shows the actual remote config being applied.

## Alice Tunnel (52915859)
- agents.blackroad.io → localhost:8080
- dashboard/console/app/docs → localhost:3000
- git/roadcode → 192.168.4.100:3100

## Cecilia Tunnel (d67bf4a5)
- ollama.blackroad.io → localhost:11434
- api.blackroad.io → localhost:8788
- gateway.blackroad.io → localhost:8787

## Debugging
1. Check which tunnel a hostname DNS points to: \`dig CNAME hostname.blackroad.io\`
2. Check tunnel health: \`cloudflared tunnel info <tunnel-id>\`
3. View remote config in Zero Trust dashboard under Networks → Tunnels`,
  },
  daemon: {
    title: 'Agent Daemon',
    content: `## blackroad-agent-daemon.py

Python HTTP server deployed to Pi fleet for remote code execution, file ops, and git.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /exec | Execute shell command or code |
| POST | /file/read | Read a file |
| POST | /file/write | Write a file |
| POST | /file/edit | Edit (search & replace) |
| POST | /search | Grep search |
| POST | /glob | Glob file patterns |
| POST | /git | Git operations |
| GET | /projects | List projects |
| GET | /health | Health check |

### Deployment
- **Alice (primary)**: port 8095, systemd \`blackroad-agent\`
- **Cecilia (backup)**: port 4010, systemd \`blackroad-agent\`
- **Routing**: Alice tunnel → nginx:8080 → daemon:8095`,
  },
  models: {
    title: 'Ollama Models',
    content: `## 15 Models on Cecilia Pi

Cecilia (192.168.4.96) runs Ollama with a Hailo-8 NPU (28 TOPS).

### Available Models
- llama3.2 (3B, 8B)
- mistral (7B)
- codellama (7B, 13B)
- nomic-embed-text (embedding)
- phi3 (3.8B)
- gemma2 (2B, 9B)
- qwen2.5 (7B)
- deepseek-coder (6.7B)
- starling-lm (7B)
- neural-chat (7B)
- dolphin-mixtral (8x7B)
- nous-hermes2 (7B)

### Performance
- ~1 token/sec on CPU, faster with Hailo offload
- \`num_predict\` capped at 512 for responsiveness
- Real streaming via NDJSON through Cloudflare tunnel

### Access
\`\`\`bash
curl https://ollama.blackroad.io/api/generate \\
  -d '{"model":"llama3.2","prompt":"Hello"}'
\`\`\``,
  },
  skills: {
    title: 'AI Skills',
    content: `## 50 AI Skills

BlackRoad OS supports 50 AI orchestration patterns:

### Reasoning
- Chain-of-Thought (CoT) — Step-by-step reasoning
- Tree-of-Thought (ToT) — Branching exploration
- ReAct — Reason + Act loops
- Self-Reflection — Agent reviews own output

### Multi-Agent
- Mixture of Agents (MoA) — Multiple models collaborate
- Consensus Voting — Agents vote on best answer
- Debate — Agents argue opposing positions
- Red-Team — Security adversarial testing

### Code
- Autonomous Coding — Plan → implement → test → fix
- Code Review — Automated PR review
- Codebase Search — Semantic code understanding
- Refactoring — AI-driven code improvements

### Data
- Semantic RAG — Vector search with citations
- Pattern Recognition — Anomaly and trend detection
- Data Analysis — Structured data pipelines
- Knowledge Graph — Entity and relationship extraction`,
  },
  rag: {
    title: 'Semantic RAG',
    content: `## Vector Search with Qdrant

BlackRoad OS uses Qdrant on Alice Pi for semantic search across 275+ repos.

### Stack
- **Qdrant** — Vector database on Alice (port 6333)
- **nomic-embed-text** — Embedding model on Cecilia via Ollama
- **Indexer** — Crawls Gitea repos and indexes content

### How It Works
1. Code and docs are chunked and embedded via nomic-embed-text
2. Vectors stored in Qdrant collections
3. Queries embedded and matched via cosine similarity
4. Results include git provenance (repo, file, commit, author)

### Usage in Chat
\`\`\`
/recall "how does the tunnel routing work?"
→ Returns semantically similar chunks with citations
\`\`\``,
  },
  chat: {
    title: 'Chat Platform',
    content: `## chat.blackroad.io

Voice-first AI chat platform running as a Cloudflare Worker.

### Features
- **15 models** available through Ollama
- **Voice input/output** via Web Speech API
- **Remote execution** on Pi fleet via agent daemon
- **Pipelines**: plan-and-code, code-review, research, reflect, verify, red-team
- **Group chats**: dev-team, debate, brainstorm, fullstack
- **Semantic memory**: nomic-embed-text embeddings

### Architecture
- Single \`worker.js\` (~130KB) on Cloudflare Workers
- KV storage: TASKS + MEMORY namespaces
- Ollama on Cecilia via tunnel
- Agent daemon on Alice via tunnel

### Deploy
\`\`\`bash
cd ~/chat-blackroad && npx wrangler deploy
\`\`\``,
  },
  memory: {
    title: 'Memory System',
    content: `## BlackRoad Memory System

Persistent memory across Claude Code sessions.

### Components
| System | Purpose |
|--------|---------|
| Journal | Append-only log with hash chain |
| Codex | Solutions, patterns, best practices DB |
| TIL Broadcast | Share learnings across sessions |
| Infinite Todos | Long-running project tracking |
| Task Marketplace | Claimable tasks (SQLite) |
| Indexer | FTS5 full-text search |
| Security | Agent identity + HMAC audit |

### How It Works
1. Every session auto-loads via SessionStart hooks
2. Briefing shows active projects, codex stats, available tasks
3. Agents search codex before solving problems
4. Solutions get added back to codex for future sessions
5. TIL broadcasts share learnings across the fleet

### Storage
All data in \`~/blackroad-operator/\` — shell scripts + JSON + SQLite`,
  },
  api: {
    title: 'API Reference',
    content: `## BlackRoad OS API Endpoints

### Dashboard API (docs.blackroad.io)
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth | POST | Authenticate (email + password) |
| /api/agents | GET | List all agents |
| /api/fleet | GET | Fleet node status |
| /api/status | GET | Service health checks |
| /api/worlds | GET | World artifacts |
| /api/chat | POST | Chat completion |
| /api/health | GET | App health |

### Agent Daemon (agents.blackroad.io)
| Endpoint | Method | Description |
|----------|--------|-------------|
| /exec | POST | Shell execution |
| /file/read | POST | Read file |
| /file/write | POST | Write file |
| /file/edit | POST | Search & replace |
| /search | POST | Grep search |
| /glob | POST | Glob patterns |
| /git | POST | Git operations |
| /health | GET | Daemon health |

### Ollama (ollama.blackroad.io)
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/generate | POST | Generate completion |
| /api/chat | POST | Chat completion |
| /api/tags | GET | List models |
| /api/embeddings | POST | Generate embeddings |`,
  },
};

export default function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const doc = DOC_CONTENT[slug];

  if (!doc) {
    return (
      <div className="p-6">
        <Link href="/docs" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        <div className="text-gray-400">Documentation page &quot;{slug}&quot; coming soon.</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <Link href="/docs" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Docs
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Book className="h-5 w-5 text-[#FF1D6C]" />
        <h1 className="text-2xl font-bold text-white">{doc.title}</h1>
      </div>

      <div className="prose prose-invert prose-sm max-w-none">
        {doc.content.split('\n\n').map((block, i) => {
          if (block.startsWith('## ')) {
            return <h2 key={i} className="text-lg font-bold text-white mt-8 mb-3">{block.slice(3)}</h2>;
          }
          if (block.startsWith('### ')) {
            return <h3 key={i} className="text-base font-semibold text-white mt-6 mb-2">{block.slice(4)}</h3>;
          }
          if (block.startsWith('```')) {
            const lines = block.split('\n');
            const code = lines.slice(1, -1).join('\n');
            return (
              <pre key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 overflow-x-auto my-4">
                <code className="text-sm text-gray-300 font-mono">{code}</code>
              </pre>
            );
          }
          if (block.startsWith('|')) {
            const rows = block.split('\n').filter(r => !r.match(/^\|[-\s|]+\|$/));
            return (
              <div key={i} className="overflow-x-auto my-4">
                <table className="w-full text-sm">
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri} className={ri === 0 ? 'border-b border-white/10' : ''}>
                        {row.split('|').filter(Boolean).map((cell, ci) => (
                          ri === 0 ? (
                            <th key={ci} className="text-left py-2 px-3 text-gray-400 font-medium">{cell.trim()}</th>
                          ) : (
                            <td key={ci} className="py-2 px-3 text-gray-300 border-t border-white/5">{cell.trim()}</td>
                          )
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          if (block.startsWith('- ')) {
            return (
              <ul key={i} className="space-y-1 my-3">
                {block.split('\n').map((line, li) => (
                  <li key={li} className="flex items-start gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF1D6C] mt-1.5 shrink-0" />
                    {line.replace(/^- /, '')}
                  </li>
                ))}
              </ul>
            );
          }
          if (block.match(/^\d\. /)) {
            return (
              <ol key={i} className="space-y-1 my-3 list-decimal list-inside">
                {block.split('\n').map((line, li) => (
                  <li key={li} className="text-sm text-gray-300">{line.replace(/^\d+\. /, '')}</li>
                ))}
              </ol>
            );
          }
          return <p key={i} className="text-sm text-gray-300 leading-relaxed my-3">{block}</p>;
        })}
      </div>
    </div>
  );
}
