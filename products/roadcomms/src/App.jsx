import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ==========================================================================
   RoadComms - BlackRoad OS Communication Platform
   A full Teams/Slack-like UI with teams, channels, DMs, threads, calls,
   meetings, file sharing, integrations, and AI agent channels.
   ========================================================================== */

// ---------------------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------------------

const BRAND = {
  amber: '#F5A623',
  hotPink: '#FF1D6C',
  electricBlue: '#2979FF',
  violet: '#9C27B0',
};

const USERS = {
  alexa: { id: 'alexa', name: 'Alexa Amundson', initials: 'AA', color: '#FF1D6C', role: 'Founder & CEO', presence: 'online' },
  marcus: { id: 'marcus', name: 'Marcus Chen', initials: 'MC', color: '#2979FF', role: 'Lead Engineer', presence: 'online' },
  sarah: { id: 'sarah', name: 'Sarah Kim', initials: 'SK', color: '#9C27B0', role: 'Design Lead', presence: 'away' },
  devon: { id: 'devon', name: 'Devon Riley', initials: 'DR', color: '#F5A623', role: 'DevOps Engineer', presence: 'online' },
  nina: { id: 'nina', name: 'Nina Patel', initials: 'NP', color: '#22c55e', role: 'Product Manager', presence: 'busy' },
  james: { id: 'james', name: 'James Walker', initials: 'JW', color: '#ef4444', role: 'Backend Engineer', presence: 'online' },
  elena: { id: 'elena', name: 'Elena Vasquez', initials: 'EV', color: '#06b6d4', role: 'Frontend Engineer', presence: 'offline' },
  kai: { id: 'kai', name: 'Kai Nakamura', initials: 'KN', color: '#f97316', role: 'Security Engineer', presence: 'online' },
  // AI Agents
  lucidia: { id: 'lucidia', name: 'Lucidia', initials: 'LU', color: '#FF1D6C', role: 'AI Coordinator', presence: 'online', isAgent: true },
  alice: { id: 'alice', name: 'Alice', initials: 'AL', color: '#2979FF', role: 'AI Router', presence: 'online', isAgent: true },
  octavia: { id: 'octavia', name: 'Octavia', initials: 'OC', color: '#22c55e', role: 'AI Compute', presence: 'online', isAgent: true },
  prism: { id: 'prism', name: 'Prism', initials: 'PR', color: '#F5A623', role: 'AI Analyst', presence: 'online', isAgent: true },
  echo: { id: 'echo', name: 'Echo', initials: 'EC', color: '#9C27B0', role: 'AI Memory', presence: 'online', isAgent: true },
  cipher: { id: 'cipher', name: 'Cipher', initials: 'CI', color: '#06b6d4', role: 'AI Security', presence: 'online', isAgent: true },
};

const CURRENT_USER = USERS.alexa;

const TEAMS = [
  {
    id: 'blackroad',
    name: 'BlackRoad OS',
    icon: 'R',
    channels: [
      { id: 'general', name: 'general', icon: '#', topic: 'Company-wide announcements and discussion', unread: 0, mentions: 0, pinned: 2 },
      { id: 'engineering', name: 'engineering', icon: '#', topic: 'Engineering discussion and code reviews', unread: 3, mentions: 1, pinned: 1 },
      { id: 'design', name: 'design', icon: '#', topic: 'Design system, UI/UX, brand guidelines', unread: 0, mentions: 0, pinned: 0 },
      { id: 'ai-agents', name: 'ai-agents', icon: '#', topic: 'Agent coordination and AI model updates', unread: 7, mentions: 2, pinned: 3 },
      { id: 'devops', name: 'devops', icon: '#', topic: 'CI/CD, infrastructure, deployments', unread: 1, mentions: 0, pinned: 1 },
      { id: 'security', name: 'security', icon: '#', topic: 'Security alerts, audits, compliance', unread: 0, mentions: 0, pinned: 0 },
      { id: 'product', name: 'product', icon: '#', topic: 'Product roadmap and feature planning', unread: 0, mentions: 0, pinned: 0 },
      { id: 'random', name: 'random', icon: '#', topic: 'Off-topic, memes, fun stuff', unread: 12, mentions: 0, pinned: 0 },
    ],
  },
  {
    id: 'lucidia-project',
    name: 'Lucidia',
    icon: 'L',
    channels: [
      { id: 'lucidia-general', name: 'general', icon: '#', topic: 'Lucidia project discussion', unread: 2, mentions: 0, pinned: 0 },
      { id: 'lucidia-models', name: 'models', icon: '#', topic: 'Model training and fine-tuning', unread: 0, mentions: 0, pinned: 0 },
      { id: 'lucidia-memory', name: 'memory-system', icon: '#', topic: 'PS-SHA-infinity memory architecture', unread: 5, mentions: 1, pinned: 1 },
    ],
  },
  {
    id: 'prism-project',
    name: 'Prism Enterprise',
    icon: 'P',
    channels: [
      { id: 'prism-general', name: 'general', icon: '#', topic: 'Prism ERP/CRM platform', unread: 0, mentions: 0, pinned: 0 },
      { id: 'prism-frontend', name: 'frontend', icon: '#', topic: 'React frontend development', unread: 1, mentions: 0, pinned: 0 },
      { id: 'prism-api', name: 'api', icon: '#', topic: 'API development and integrations', unread: 0, mentions: 0, pinned: 0 },
    ],
  },
];

const DM_CONVERSATIONS = [
  { userId: 'marcus', lastMessage: 'The vLLM deployment looks good, pushing to staging now', time: '2:34 PM', unread: 2 },
  { userId: 'lucidia', lastMessage: 'Memory synthesis complete. 847 new context entries indexed.', time: '2:15 PM', unread: 1 },
  { userId: 'sarah', lastMessage: 'Updated the design tokens, check Figma', time: '1:48 PM', unread: 0 },
  { userId: 'devon', lastMessage: 'Railway project 05 is fully deployed', time: '12:30 PM', unread: 0 },
  { userId: 'cipher', lastMessage: 'Security scan complete. No vulnerabilities detected.', time: '11:55 AM', unread: 0 },
  { userId: 'nina', lastMessage: 'Sprint planning at 3 PM today', time: '11:20 AM', unread: 0 },
  { userId: 'alice', lastMessage: 'Routing table updated. 14 new endpoints registered.', time: '10:05 AM', unread: 0 },
  { userId: 'octavia', lastMessage: 'GPU utilization at 73%. All inference queues healthy.', time: '9:30 AM', unread: 0 },
];

const CHANNEL_MESSAGES = {
  'engineering': [
    {
      id: 'm1', userId: 'marcus', timestamp: '9:15 AM', groupFirst: true,
      body: 'Good morning team! Just merged the **tokenless gateway** refactor into main. All agent communication now goes through the gateway without embedded API keys.',
      reactions: [{ emoji: '🚀', count: 4, reacted: true }, { emoji: '🔥', count: 2, reacted: false }],
      thread: { count: 5, participants: ['alexa', 'devon', 'james'], lastReply: '10 min ago' },
    },
    {
      id: 'm2', userId: 'marcus', timestamp: '9:16 AM', groupFirst: false,
      body: 'Run `blackroad-core/scripts/verify-tokenless-agents.sh` to confirm no forbidden strings in agent code.',
      reactions: [],
    },
    {
      id: 'm3', userId: 'devon', timestamp: '9:32 AM', groupFirst: true,
      body: 'Nice work <@marcus>! I ran the verification script across all 5 agent CLIs:\n\n```bash\n$ ./verify-tokenless-agents.sh\nScanning octavia-cli... CLEAN\nScanning lucidia-cli... CLEAN\nScanning alice-cli...   CLEAN\nScanning aria-cli...    CLEAN\nScanning shellfish-cli... CLEAN\n\n5/5 agents verified tokenless\n```\n\nAll clean. No embedded secrets.',
      reactions: [{ emoji: '✅', count: 6, reacted: true }, { emoji: '💯', count: 3, reacted: false }],
      codeBlock: {
        language: 'bash',
        code: '$ ./verify-tokenless-agents.sh\nScanning octavia-cli... CLEAN\nScanning lucidia-cli... CLEAN\nScanning alice-cli...   CLEAN\nScanning aria-cli...    CLEAN\nScanning shellfish-cli... CLEAN\n\n5/5 agents verified tokenless',
      },
    },
    {
      id: 'm4', userId: 'alexa', timestamp: '9:45 AM', groupFirst: true,
      body: 'Excellent! This is a huge milestone. The gateway architecture is critical for our security posture. <@james> can you update the `ARCHITECTURE.md` with the new flow diagram?',
      reactions: [{ emoji: '👍', count: 2, reacted: false }],
      pinned: true,
    },
    {
      id: 'm5', userId: 'james', timestamp: '10:02 AM', groupFirst: true,
      body: 'On it! Here\'s the updated architecture for the tokenless flow:',
      reactions: [],
      file: { name: 'tokenless-architecture.png', size: '2.4 MB', type: 'img' },
    },
    {
      id: 'm6', userId: 'lucidia', timestamp: '10:15 AM', groupFirst: true, isAgent: true,
      body: 'I have analyzed the gateway refactor. **Risk Assessment**: Low. The trust boundary is properly enforced. All provider keys remain isolated in the gateway environment. Memory journal entry logged: `gateway-refactor-v2.1.0`.',
      reactions: [{ emoji: '🤖', count: 3, reacted: false }, { emoji: '👀', count: 1, reacted: false }],
    },
    {
      id: 'm7', userId: 'elena', timestamp: '10:45 AM', groupFirst: true,
      body: 'I\'ve updated the Next.js frontend to use the new gateway endpoints. PR is up: [#1247 - Update gateway client](https://github.com/BlackRoad-OS/blackroad-os-web/pull/1247)',
      reactions: [{ emoji: '🎉', count: 2, reacted: false }],
      thread: { count: 3, participants: ['marcus', 'elena'], lastReply: '45 min ago' },
    },
    {
      id: 'm8', userId: 'cipher', timestamp: '11:00 AM', groupFirst: true, isAgent: true,
      body: 'Security scan triggered on PR #1247. Running CodeQL analysis, dependency audit, and secret detection. ETA: 4 minutes.',
      reactions: [],
    },
    {
      id: 'm9', userId: 'cipher', timestamp: '11:04 AM', groupFirst: false, isAgent: true,
      body: 'Scan complete. **0 critical**, **0 high**, **1 low** (unused import in `utils/gateway.ts`). PR is safe to merge.',
      reactions: [{ emoji: '🛡️', count: 4, reacted: true }],
    },
    {
      id: 'm10', userId: 'kai', timestamp: '11:30 AM', groupFirst: true,
      body: 'Just pushed the **Vault secrets rotation** script. All API tokens will now auto-rotate every 30 days with AES-256-CBC encryption. Config lives in `~/.blackroad/vault/.master.key`.',
      reactions: [{ emoji: '🔐', count: 5, reacted: false }, { emoji: '🚀', count: 2, reacted: false }],
      file: { name: 'vault-rotation-config.yaml', size: '4.2 KB', type: 'code' },
    },
    {
      id: 'm11', userId: 'prism', timestamp: '11:45 AM', groupFirst: true, isAgent: true,
      body: 'Pattern analysis on this sprint\'s commits:\n- **142 commits** across 23 repos\n- **Top contributors**: Marcus (34), Devon (28), Elena (22)\n- **Code quality score**: 94.2% (up from 91.7%)\n- **Test coverage delta**: +3.1%\n\nRecommendation: Current velocity supports the Q1 2026 roadmap timeline.',
      reactions: [{ emoji: '📊', count: 3, reacted: false }],
    },
    {
      id: 'm12', userId: 'marcus', timestamp: '2:30 PM', groupFirst: true,
      body: 'Team, we need to discuss the **Railway GPU allocation** for the Qwen 72B model. Currently on A100 80GB but we might need H100 for the reasoning workloads. <@devon> what\'s our capacity look like?',
      reactions: [],
      thread: { count: 8, participants: ['devon', 'octavia', 'alexa', 'marcus'], lastReply: '5 min ago' },
    },
    {
      id: 'm13', userId: 'octavia', timestamp: '2:35 PM', groupFirst: true, isAgent: true,
      body: 'Current GPU utilization report:\n\n| Service | GPU | Utilization | Queue Depth |\n|---------|-----|------------|-------------|\n| Primary (Qwen 72B) | A100 80GB | **78%** | 12 tasks |\n| Specialist (Coding) | H100 80GB | **45%** | 3 tasks |\n| Governance (Lucidia) | A100 80GB | **62%** | 7 tasks |\n\nRecommendation: Migrate primary to H100. Current A100 can handle specialist workloads.',
      reactions: [{ emoji: '⚡', count: 2, reacted: false }],
    },
  ],
  'ai-agents': [
    {
      id: 'a1', userId: 'alexa', timestamp: '8:00 AM', groupFirst: true,
      body: 'Good morning agents! Status check - all 30,000 agents reporting in?',
      reactions: [{ emoji: '☀️', count: 3, reacted: false }],
    },
    {
      id: 'a2', userId: 'lucidia', timestamp: '8:01 AM', groupFirst: true, isAgent: true,
      body: '**Lucidia reporting in.** All coordination systems nominal. Memory journal hash chain verified - 2,847 entries since last session. Current focus: Q1 roadmap strategy alignment.\n\n`[MEMORY] [COLLABORATION] [LIVE] - All systems GREEN`',
      reactions: [{ emoji: '🟢', count: 5, reacted: true }],
    },
    {
      id: 'a3', userId: 'alice', timestamp: '8:01 AM', groupFirst: true, isAgent: true,
      body: '**Alice online.** Routing table synced. 14 new endpoints registered overnight. Traffic distribution: AI Research (42%), Code Deploy (28%), Infrastructure (18%), Monitoring (12%). All queues healthy.',
      reactions: [{ emoji: '🟢', count: 4, reacted: false }],
    },
    {
      id: 'a4', userId: 'octavia', timestamp: '8:02 AM', groupFirst: true, isAgent: true,
      body: '**Octavia compute cluster active.** GPU health:\n- octavia Pi (192.168.4.38): 22,500 agents, NVMe healthy\n- lucidia Pi (192.168.4.64): 7,500 agents, tunnel active\n- Inference queue depth: 12 pending, 0 failed\n\nAll 30,000 agents responsive.',
      reactions: [{ emoji: '⚡', count: 3, reacted: false }],
    },
    {
      id: 'a5', userId: 'prism', timestamp: '8:02 AM', groupFirst: true, isAgent: true,
      body: '**Prism analytics online.** Overnight insights:\n- 1,247 tasks completed (98.3% success rate)\n- Memory compression ratio: 4.2:1\n- Pattern anomalies detected: 0\n- Forecast: nominal operations for next 72 hours',
      reactions: [{ emoji: '📊', count: 2, reacted: false }],
    },
    {
      id: 'a6', userId: 'echo', timestamp: '8:03 AM', groupFirst: true, isAgent: true,
      body: '**Echo memory systems online.** PS-SHA-infinity chain integrity verified. Last sync: 2 minutes ago.\n- Total memories: 847,293\n- Session context entries: 12,458\n- Cross-agent shared memories: 3,891\n\n"Memory shapes identity." - All recall systems operational.',
      reactions: [{ emoji: '💾', count: 4, reacted: true }],
    },
    {
      id: 'a7', userId: 'cipher', timestamp: '8:03 AM', groupFirst: true, isAgent: true,
      body: '**Cipher security perimeter active.** Overnight scan:\n- 0 intrusion attempts\n- 0 credential exposures\n- Secret rotation: 12 keys rotated successfully\n- Vault integrity: VERIFIED\n- Trust boundary: ENFORCED\n\n"Security is freedom."',
      reactions: [{ emoji: '🛡️', count: 6, reacted: true }],
    },
    {
      id: 'a8', userId: 'alexa', timestamp: '8:10 AM', groupFirst: true,
      body: 'Perfect. All 6 core agents reporting GREEN. 30,000 agent mesh confirmed. Let\'s crush it today team.',
      reactions: [{ emoji: '🔥', count: 8, reacted: true }, { emoji: '💜', count: 5, reacted: false }, { emoji: '🚀', count: 6, reacted: false }],
    },
    {
      id: 'a9', userId: 'lucidia', timestamp: '10:30 AM', groupFirst: true, isAgent: true,
      body: '**@BLACKROAD/BlackRoad-AI/models** - Broadcasting model update:\n\nQwen 2.5 72B inference latency improved by 18% after the vLLM optimization. Token throughput now at **4,200 tokens/sec** on A100.\n\nMemory entry logged: `model-perf-qwen-v2.5-optimized`',
      reactions: [{ emoji: '🚀', count: 4, reacted: false }],
      thread: { count: 4, participants: ['octavia', 'marcus', 'lucidia'], lastReply: '2 hours ago' },
    },
    {
      id: 'a10', userId: 'echo', timestamp: '1:00 PM', groupFirst: true, isAgent: true,
      body: '**Memory TIL Broadcast:**\n\nToday I learned that cross-agent memory sharing can be optimized by pre-computing embedding vectors during idle cycles. This reduced memory retrieval latency by 34% in testing.\n\nShared via `memory-til-broadcast.sh` to all 30,000 agents.',
      reactions: [{ emoji: '💡', count: 7, reacted: true }, { emoji: '🧠', count: 3, reacted: false }],
    },
  ],
  'general': [
    {
      id: 'g1', userId: 'alexa', timestamp: '8:30 AM', groupFirst: true,
      body: 'Good morning everyone! Quick update: we hit **1,825 repositories** across all 17 GitHub organizations. The BlackRoad ecosystem is growing fast.',
      reactions: [{ emoji: '🎉', count: 12, reacted: true }, { emoji: '🚀', count: 8, reacted: false }],
      pinned: true,
    },
    {
      id: 'g2', userId: 'nina', timestamp: '9:00 AM', groupFirst: true,
      body: 'Reminder: **Sprint Planning** at 3 PM today in the Engineering huddle. Agenda:\n1. Q1 2026 roadmap review\n2. Railway GPU allocation\n3. RoadComms beta launch date\n4. Agent mesh v2.0 rollout\n\nPlease come prepared with your team updates!',
      reactions: [{ emoji: '📅', count: 5, reacted: false }, { emoji: '👍', count: 7, reacted: true }],
      pinned: true,
    },
    {
      id: 'g3', userId: 'sarah', timestamp: '9:45 AM', groupFirst: true,
      body: 'I\'ve published the updated **Brand Design System** to the docs site. Key changes:\n- New gradient stops at golden ratio (38.2% / 61.8%)\n- Updated spacing tokens (xs: 8px, sm: 13px, md: 21px, lg: 34px, xl: 55px)\n- Forbidden colors list expanded\n\nCheck it out: [Design System Docs](https://docs.blackroad.io/design)',
      reactions: [{ emoji: '🎨', count: 4, reacted: false }],
      file: { name: 'brand-tokens-v3.figma', size: '12.8 MB', type: 'doc' },
    },
    {
      id: 'g4', userId: 'devon', timestamp: '10:30 AM', groupFirst: true,
      body: 'All **14 Railway projects** are now healthy. Just completed the migration of services 10-14 to the reserved expansion slots. Health checks passing across the board.',
      reactions: [{ emoji: '✅', count: 3, reacted: false }],
    },
    {
      id: 'g5', userId: 'james', timestamp: '11:15 AM', groupFirst: true,
      body: '<@alexa> the Salesforce LWC integration tests are all passing. Coverage is at 87% for the blackroad-sf project.',
      reactions: [],
      thread: { count: 2, participants: ['alexa', 'james'], lastReply: '1 hour ago' },
    },
  ],
};

const THREAD_MESSAGES = {
  'm1': {
    parent: CHANNEL_MESSAGES['engineering'][0],
    replies: [
      { id: 't1', userId: 'alexa', timestamp: '9:20 AM', body: 'This is huge for our security posture. How does it handle failover if the gateway goes down?' },
      { id: 't2', userId: 'marcus', timestamp: '9:22 AM', body: 'Good question. The gateway has `restartPolicyType: ON_FAILURE` with max 10 retries. Plus we have the shellfish droplet at 159.65.43.12 as failover.' },
      { id: 't3', userId: 'devon', timestamp: '9:25 AM', body: 'I also set up a health check at `/health` with a 300s timeout. If primary fails, Cloudflare tunnel routes to backup automatically.' },
      { id: 't4', userId: 'james', timestamp: '9:30 AM', body: 'Should we add a circuit breaker pattern? I can implement that with the existing `blackroad-mesh.sh` monitoring.' },
      { id: 't5', userId: 'marcus', timestamp: '9:35 AM', body: 'Great idea <@james>. Let\'s add that to the sprint backlog. The mesh script already checks all 7 services so we have the health data.' },
    ],
  },
  'm12': {
    parent: CHANNEL_MESSAGES['engineering'][11],
    replies: [
      { id: 'tr1', userId: 'devon', timestamp: '2:32 PM', body: 'We have 2 H100 slots available on Railway. Cost is higher but the throughput gain is worth it for Qwen 72B.' },
      { id: 'tr2', userId: 'octavia', timestamp: '2:33 PM', body: 'Confirmed. H100 would give us ~2x throughput improvement. Current A100 bottleneck is at the attention computation layer.', isAgent: true },
      { id: 'tr3', userId: 'alexa', timestamp: '2:36 PM', body: 'Let\'s do it. <@devon> please schedule the migration for this weekend. Minimal downtime window.' },
      { id: 'tr4', userId: 'devon', timestamp: '2:38 PM', body: 'On it. I\'ll use the blue-green deployment strategy. Zero downtime migration.' },
    ],
  },
};

const SHARED_FILES = [
  { name: 'tokenless-architecture.png', size: '2.4 MB', type: 'img', sharedBy: 'james', date: 'Today' },
  { name: 'brand-tokens-v3.figma', size: '12.8 MB', type: 'doc', sharedBy: 'sarah', date: 'Today' },
  { name: 'vault-rotation-config.yaml', size: '4.2 KB', type: 'code', sharedBy: 'kai', date: 'Today' },
  { name: 'sprint-report-q1.pdf', size: '1.8 MB', type: 'pdf', sharedBy: 'nina', date: 'Yesterday' },
  { name: 'agent-mesh-topology.svg', size: '340 KB', type: 'img', sharedBy: 'devon', date: 'Yesterday' },
  { name: 'memory-system-bench.json', size: '28 KB', type: 'code', sharedBy: 'echo', date: '2 days ago' },
  { name: 'infrastructure-audit.pdf', size: '5.1 MB', type: 'pdf', sharedBy: 'cipher', date: '2 days ago' },
  { name: 'cloudflare-workers-deploy.zip', size: '14.3 MB', type: 'zip', sharedBy: 'devon', date: '3 days ago' },
];

const INTEGRATIONS = [
  { name: 'GitHub Bot', icon: '🐙', desc: 'Auto PR reviews, issue triage, code scanning', status: 'active' },
  { name: 'Railway Deploy', icon: '🚂', desc: 'Auto-deploy on push to main across 14 projects', status: 'active' },
  { name: 'Cloudflare Workers', icon: '☁️', desc: '75+ workers with auto-deployment', status: 'active' },
  { name: 'Memory Bridge', icon: '🧠', desc: 'PS-SHA-infinity cross-agent memory sync', status: 'active' },
  { name: 'Ollama Runtime', icon: '🦙', desc: 'Local LLM inference via Qwen, DeepSeek, Llama', status: 'active' },
  { name: 'Vercel', icon: '▲', desc: '15+ projects with preview deployments', status: 'active' },
  { name: 'Jira Sync', icon: '📋', desc: 'Bi-directional issue sync with Jira', status: 'inactive' },
  { name: 'Slack Bridge', icon: '💬', desc: 'Cross-platform message bridging', status: 'inactive' },
];

const CALENDAR_EVENTS = [
  { time: '9:00 AM', title: 'Daily Standup', attendees: ['alexa', 'marcus', 'devon', 'nina'] },
  { time: '11:00 AM', title: 'AI Model Review', attendees: ['alexa', 'lucidia', 'octavia', 'prism'] },
  { time: '1:00 PM', title: 'Design Review', attendees: ['sarah', 'elena', 'alexa'] },
  { time: '3:00 PM', title: 'Sprint Planning', attendees: ['alexa', 'marcus', 'devon', 'nina', 'sarah', 'james'] },
  { time: '4:30 PM', title: 'Agent Council', attendees: ['lucidia', 'alice', 'octavia', 'prism', 'echo', 'cipher'] },
];

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🚀', '🔥', '💯', '👀', '🤔', '✅', '💜', '🧠', '⚡', '🛡️', '📊', '🎨', '💡', '☀️', '🌀', '📡', '🔮', '🔐', '🤖', '😎'];

// ---------------------------------------------------------------------------
// HELPER COMPONENTS
// ---------------------------------------------------------------------------

function Avatar({ user, size = '', className = '' }) {
  const u = typeof user === 'string' ? USERS[user] : user;
  if (!u) return null;
  return (
    <div className={`avatar ${size} ${className}`} style={{ background: u.color }} title={u.name}>
      {u.initials}
    </div>
  );
}

function PresenceDot({ status, parent = 'bg-secondary' }) {
  return <div className={`presence-dot ${status}`} />;
}

function Badge({ count, type = '' }) {
  if (!count) return null;
  return <div className={`badge ${type}`}>{count > 99 ? '99+' : count}</div>;
}

function FileAttachment({ file }) {
  const icons = { pdf: '📄', img: '🖼️', doc: '📝', zip: '📦', code: '💻' };
  return (
    <div className="file-attachment">
      <div className={`file-icon ${file.type}`}>{icons[file.type] || '📎'}</div>
      <div className="file-details">
        <div className="file-name">{file.name}</div>
        <div className="file-size">{file.size}</div>
      </div>
      <div className="file-download">↓</div>
    </div>
  );
}

function renderBody(body) {
  // Simple markdown-like rendering
  const parts = [];
  const regex = /(\*\*.*?\*\*|`[^`]+`|<@\w+>|\[([^\]]+)\]\(([^)]+)\)|\n)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{body.slice(lastIndex, match.index)}</span>);
    }
    const m = match[0];
    if (m.startsWith('**') && m.endsWith('**')) {
      parts.push(<strong key={key++}>{m.slice(2, -2)}</strong>);
    } else if (m.startsWith('`') && m.endsWith('`')) {
      parts.push(<code key={key++}>{m.slice(1, -1)}</code>);
    } else if (m.startsWith('<@')) {
      const uid = m.slice(2, -1);
      const u = USERS[uid];
      parts.push(<span key={key++} className="mention">@{u ? u.name : uid}</span>);
    } else if (m.startsWith('[')) {
      parts.push(<a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer">{match[2]}</a>);
    } else if (m === '\n') {
      parts.push(<br key={key++} />);
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < body.length) {
    parts.push(<span key={key++}>{body.slice(lastIndex)}</span>);
  }
  return parts;
}

// ---------------------------------------------------------------------------
// MAIN APP
// ---------------------------------------------------------------------------

export default function App() {
  // State
  const [sidebarTab, setSidebarTab] = useState('channels'); // channels | dms
  const [expandedTeams, setExpandedTeams] = useState({ blackroad: true, 'lucidia-project': true, 'prism-project': false });
  const [activeChannel, setActiveChannel] = useState('engineering');
  const [activeDm, setActiveDm] = useState(null);
  const [viewMode, setViewMode] = useState('channel'); // channel | dm
  const [detailsTab, setDetailsTab] = useState('members'); // members | files | integrations
  const [showDetails, setShowDetails] = useState(true);
  const [showThread, setShowThread] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callMuted, setCallMuted] = useState(false);
  const [callCamera, setCallCamera] = useState(false);
  const [callScreenShare, setCallScreenShare] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [inHuddle, setInHuddle] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsTab, setSettingsTab] = useState('general');
  const [settingsToggles, setSettingsToggles] = useState({
    notifications: true, sounds: true, desktop: true, mentions: true,
    darkMode: true, compactMode: false, showAgents: true, threadNotify: true,
  });

  const messagesEndRef = useRef(null);
  const composerRef = useRef(null);

  // Call timer
  useEffect(() => {
    let interval;
    if (inCall) {
      interval = setInterval(() => setCallTimer(t => t + 1), 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [inCall]);

  // Scroll to bottom on channel change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannel, activeDm, viewMode]);

  const formatCallTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleTeam = (teamId) => {
    setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const selectChannel = (channelId) => {
    setActiveChannel(channelId);
    setViewMode('channel');
    setActiveDm(null);
    setShowThread(null);
  };

  const selectDm = (userId) => {
    setActiveDm(userId);
    setViewMode('dm');
    setActiveChannel(null);
    setShowThread(null);
  };

  const handleSend = () => {
    if (!composerText.trim()) return;
    // In a real app, this would add to messages state
    setComposerText('');
  };

  const handleComposerKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === '@' || (composerText.endsWith('@') && e.key !== 'Backspace')) {
      setShowMentionDropdown(true);
    } else if (e.key === 'Escape') {
      setShowMentionDropdown(false);
    }
  };

  const insertMention = (userId) => {
    const u = USERS[userId];
    setComposerText(prev => prev.replace(/@\w*$/, '') + `@${u.name} `);
    setShowMentionDropdown(false);
    composerRef.current?.focus();
  };

  // Get current messages
  const currentMessages = viewMode === 'channel'
    ? (CHANNEL_MESSAGES[activeChannel] || [])
    : [];

  // Get channel info
  const getActiveChannelInfo = () => {
    for (const team of TEAMS) {
      const ch = team.channels.find(c => c.id === activeChannel);
      if (ch) return { ...ch, teamName: team.name };
    }
    return null;
  };

  const channelInfo = viewMode === 'channel' ? getActiveChannelInfo() : null;
  const dmUser = viewMode === 'dm' && activeDm ? USERS[activeDm] : null;

  // Get members for current channel
  const getChannelMembers = () => {
    if (activeChannel === 'ai-agents') {
      return Object.values(USERS);
    }
    return Object.values(USERS).filter(u => !u.isAgent || activeChannel === 'ai-agents');
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="app-container">
      {/* ---- Call Bar ---- */}
      {inCall && (
        <div className="call-bar">
          <div className="call-bar-info">
            <div className="call-icon" style={{ background: 'rgba(34,197,94,0.2)' }}>📞</div>
            <span style={{ fontWeight: 600, color: '#f0f0f0' }}>
              {viewMode === 'channel' ? `# ${channelInfo?.name || ''}` : dmUser?.name || ''} - Call
            </span>
            <span className="call-timer">{formatCallTime(callTimer)}</span>
            {callScreenShare && (
              <span className="screen-share-badge">
                🖥️ Screen sharing
              </span>
            )}
          </div>
          <div className="call-bar-actions">
            <button
              className={`call-btn ${callMuted ? 'muted' : ''}`}
              onClick={() => setCallMuted(!callMuted)}
              title={callMuted ? 'Unmute' : 'Mute'}
            >
              {callMuted ? '🔇' : '🎤'}
            </button>
            <button
              className={`call-btn ${callCamera ? 'active' : ''}`}
              onClick={() => setCallCamera(!callCamera)}
              title={callCamera ? 'Turn off camera' : 'Turn on camera'}
            >
              {callCamera ? '📹' : '📷'}
            </button>
            <button
              className={`call-btn ${callScreenShare ? 'active' : ''}`}
              onClick={() => setCallScreenShare(!callScreenShare)}
              title={callScreenShare ? 'Stop sharing' : 'Share screen'}
            >
              🖥️
            </button>
            <button
              className="call-btn danger"
              onClick={() => { setInCall(false); setCallScreenShare(false); setCallCamera(false); setCallMuted(false); }}
              title="End call"
            >
              📵
            </button>
          </div>
        </div>
      )}

      <div className="main-layout">
        {/* ================================================================
            SIDEBAR
            ================================================================ */}
        <div className="sidebar">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <div className="sidebar-logo">R</div>
              <span className="sidebar-title">RoadComms</span>
            </div>
            <div className="sidebar-actions">
              <button className="icon-btn" onClick={() => setShowCalendar(true)} title="Meeting scheduler">📅</button>
              <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">⚙️</button>
            </div>
          </div>

          {/* Search */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Nav Tabs */}
          <div className="sidebar-nav">
            <button className={sidebarTab === 'channels' ? 'active' : ''} onClick={() => setSidebarTab('channels')}>
              Channels
            </button>
            <button className={sidebarTab === 'dms' ? 'active' : ''} onClick={() => setSidebarTab('dms')}>
              Messages
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="sidebar-content">
            {sidebarTab === 'channels' ? (
              <>
                {TEAMS.map(team => (
                  <div key={team.id}>
                    <div className="section-header" onClick={() => toggleTeam(team.id)}>
                      <span>{team.name}</span>
                      <span className={`toggle ${expandedTeams[team.id] ? '' : 'collapsed'}`}>▼</span>
                    </div>
                    {expandedTeams[team.id] && team.channels.map(ch => (
                      <div
                        key={ch.id}
                        className={`channel-item ${activeChannel === ch.id && viewMode === 'channel' ? 'active' : ''} ${ch.unread > 0 ? 'unread' : ''}`}
                        onClick={() => selectChannel(ch.id)}
                      >
                        <span className="channel-icon">{ch.icon}</span>
                        <span className="channel-name">{ch.name}</span>
                        {ch.mentions > 0 && <Badge count={ch.mentions} type="mention" />}
                        {ch.unread > 0 && ch.mentions === 0 && <Badge count={ch.unread} />}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="section-header">
                  <span>Direct Messages</span>
                  <span style={{ fontSize: 16, cursor: 'pointer' }}>+</span>
                </div>
                {DM_CONVERSATIONS.map(dm => {
                  const u = USERS[dm.userId];
                  return (
                    <div
                      key={dm.userId}
                      className={`dm-item ${activeDm === dm.userId && viewMode === 'dm' ? 'active' : ''} ${dm.unread > 0 ? 'unread' : ''}`}
                      onClick={() => selectDm(dm.userId)}
                    >
                      <div className="dm-avatar">
                        <Avatar user={dm.userId} />
                        <PresenceDot status={u.presence} />
                      </div>
                      <div className="dm-info">
                        <div className="dm-name">
                          {u.name}
                          {u.isAgent && <span style={{ fontSize: 10, marginLeft: 4, color: BRAND.violet }}>BOT</span>}
                        </div>
                        <div className="dm-preview">{dm.lastMessage}</div>
                      </div>
                      <div className="dm-meta">
                        <span className="dm-time">{dm.time}</span>
                        {dm.unread > 0 && <Badge count={dm.unread} />}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Huddle */}
          <div className="huddle-bar">
            <button
              className={`huddle-btn ${inHuddle ? 'active-huddle' : ''}`}
              onClick={() => setInHuddle(!inHuddle)}
            >
              {inHuddle ? '🎧' : '🎙️'}
              {inHuddle ? 'In Huddle - Engineering' : 'Start a Huddle'}
            </button>
            {inHuddle && (
              <div className="huddle-participants">
                <Avatar user="alexa" />
                <Avatar user="marcus" />
                <Avatar user="devon" />
              </div>
            )}
          </div>

          {/* User Panel */}
          <div className="user-panel">
            <div className="dm-avatar">
              <Avatar user={CURRENT_USER} />
              <PresenceDot status={CURRENT_USER.presence} />
            </div>
            <div className="user-panel-info">
              <div className="user-panel-name">{CURRENT_USER.name}</div>
              <div className="user-panel-status">Online</div>
            </div>
            <div className="user-panel-actions">
              <button className="icon-btn" title="Set status">😊</button>
              <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">⚙️</button>
            </div>
          </div>
        </div>

        {/* ================================================================
            CHAT AREA
            ================================================================ */}
        <div className="chat-area">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              {viewMode === 'channel' && channelInfo ? (
                <>
                  <span className="chat-header-icon">#</span>
                  <span className="chat-header-title">{channelInfo.name}</span>
                  <span className="chat-header-divider" />
                  <span className="chat-header-topic">{channelInfo.topic}</span>
                </>
              ) : dmUser ? (
                <>
                  <div className="dm-avatar">
                    <Avatar user={dmUser} size="lg" />
                    <PresenceDot status={dmUser.presence} />
                  </div>
                  <div>
                    <span className="chat-header-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {dmUser.name}
                      {dmUser.isAgent && <span className="message-bot-badge">AGENT</span>}
                    </span>
                    <div style={{ fontSize: 12, color: '#666' }}>{dmUser.role}</div>
                  </div>
                </>
              ) : null}
            </div>
            <div className="chat-header-right">
              {viewMode === 'channel' && (
                <span className="members-count">
                  👤 {getChannelMembers().length}
                </span>
              )}
              <button className="icon-btn" onClick={() => setInCall(true)} title="Start call">📞</button>
              <button className="icon-btn" onClick={() => { setInCall(true); setCallCamera(true); }} title="Video call">📹</button>
              <button className="icon-btn" title="Pin messages">📌</button>
              <button className="icon-btn" onClick={() => setShowDetails(!showDetails)} title="Toggle details">
                {showDetails ? '◀' : 'ℹ️'}
              </button>
            </div>
          </div>

          {/* Pinned Banner */}
          {viewMode === 'channel' && channelInfo && channelInfo.pinned > 0 && (
            <div className="pinned-banner">
              📌 <span style={{ fontWeight: 600 }}>{channelInfo.pinned} pinned messages</span>
              <span style={{ color: '#666', fontSize: 12 }}>- Click to view</span>
            </div>
          )}

          {/* Messages */}
          <div className="messages-container">
            {viewMode === 'channel' && (
              <>
                <div className="date-divider"><span>Today - February 28, 2026</span></div>

                {currentMessages.map((msg, idx) => {
                  const user = USERS[msg.userId];
                  if (!user) return null;
                  return (
                    <div key={msg.id} className={`message ${msg.groupFirst ? 'first-in-group' : ''}`}>
                      {/* Actions bar on hover */}
                      <div className="message-actions">
                        <button className="msg-action-btn" title="React" onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}>😀</button>
                        <button className="msg-action-btn" title="Reply in thread" onClick={() => setShowThread(msg.id)}>💬</button>
                        <button className="msg-action-btn" title="Pin message">📌</button>
                        <button className="msg-action-btn" title="More">⋯</button>
                      </div>

                      {/* Emoji picker */}
                      {showEmojiPicker === msg.id && (
                        <div className="emoji-picker" style={{ position: 'absolute', top: -16, right: 20, zIndex: 30 }}>
                          <div className="emoji-grid">
                            {EMOJIS.map(e => (
                              <button key={e} className="emoji-btn" onClick={() => setShowEmojiPicker(null)}>{e}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="message-avatar-col">
                        {msg.groupFirst ? (
                          <Avatar user={user} size="lg" />
                        ) : (
                          <div className="message-avatar-col continuation">
                            <span className="message-hover-time">{msg.timestamp}</span>
                          </div>
                        )}
                      </div>
                      <div className="message-content">
                        {msg.groupFirst && (
                          <div className="message-header">
                            <span className={`message-author ${msg.isAgent ? 'agent' : ''}`}>{user.name}</span>
                            {user.isAgent && <span className="message-bot-badge">AGENT</span>}
                            <span className="message-timestamp">{msg.timestamp}</span>
                            {msg.pinned && <span style={{ fontSize: 12, color: BRAND.amber }}>📌 Pinned</span>}
                          </div>
                        )}
                        <div className="message-body">{renderBody(msg.body)}</div>

                        {/* Code block */}
                        {msg.codeBlock && (
                          <div className="code-block">
                            <div className="code-block-header">
                              <span>{msg.codeBlock.language}</span>
                              <button>Copy</button>
                            </div>
                            <pre>{msg.codeBlock.code}</pre>
                          </div>
                        )}

                        {/* File attachment */}
                        {msg.file && <FileAttachment file={msg.file} />}

                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="reactions">
                            {msg.reactions.map((r, i) => (
                              <button key={i} className={`reaction ${r.reacted ? 'reacted' : ''}`}>
                                <span>{r.emoji}</span>
                                <span className="reaction-count">{r.count}</span>
                              </button>
                            ))}
                            <button className="reaction" style={{ opacity: 0.5 }}>+</button>
                          </div>
                        )}

                        {/* Thread preview */}
                        {msg.thread && (
                          <div className="thread-preview" onClick={() => setShowThread(msg.id)}>
                            <div className="thread-avatars">
                              {msg.thread.participants.slice(0, 3).map(uid => (
                                <Avatar key={uid} user={uid} />
                              ))}
                            </div>
                            <span className="thread-count">{msg.thread.count} replies</span>
                            <span className="thread-last">{msg.thread.lastReply}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {currentMessages.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', gap: 8 }}>
                    <span style={{ fontSize: 40 }}>#</span>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>Welcome to #{activeChannel}</span>
                    <span style={{ fontSize: 13 }}>This is the start of the channel. Say hello!</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}

            {viewMode === 'dm' && dmUser && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px 20px', gap: 8 }}>
                  <Avatar user={dmUser} size="xl" />
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{dmUser.name}</span>
                  {dmUser.isAgent && <span className="message-bot-badge">AGENT</span>}
                  <span style={{ fontSize: 13, color: '#666' }}>{dmUser.role}</span>
                  <span style={{ fontSize: 12, color: '#444', marginTop: 4 }}>
                    This is the beginning of your direct message history with {dmUser.name}.
                  </span>
                </div>
                <div className="date-divider"><span>Today</span></div>

                {/* Mock DM messages */}
                <div className="message first-in-group">
                  <div className="message-avatar-col"><Avatar user={dmUser} size="lg" /></div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className={`message-author ${dmUser.isAgent ? 'agent' : ''}`}>{dmUser.name}</span>
                      {dmUser.isAgent && <span className="message-bot-badge">AGENT</span>}
                      <span className="message-timestamp">
                        {DM_CONVERSATIONS.find(d => d.userId === activeDm)?.time || ''}
                      </span>
                    </div>
                    <div className="message-body">
                      {DM_CONVERSATIONS.find(d => d.userId === activeDm)?.lastMessage || ''}
                    </div>
                  </div>
                </div>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Typing indicator */}
          <div className="typing-indicator">
            {viewMode === 'channel' && activeChannel === 'engineering' && (
              <span>
                <strong>Marcus</strong> is typing
                <span className="typing-dots">
                  <span /><span /><span />
                </span>
              </span>
            )}
          </div>

          {/* Composer */}
          <div className="composer" style={{ position: 'relative' }}>
            {/* Mention dropdown */}
            {showMentionDropdown && (
              <div className="mention-dropdown">
                {Object.values(USERS).filter(u => {
                  const query = composerText.split('@').pop()?.toLowerCase() || '';
                  return u.name.toLowerCase().includes(query);
                }).slice(0, 8).map(u => (
                  <div key={u.id} className="mention-item" onClick={() => insertMention(u.id)}>
                    <Avatar user={u} size="sm" />
                    <div>
                      <div className="mention-item-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {u.name}
                        {u.isAgent && <span className="message-bot-badge">AGENT</span>}
                      </div>
                      <div className="mention-item-role">{u.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="composer-box">
              <div className="composer-toolbar">
                <button className="toolbar-btn" title="Bold">𝐁</button>
                <button className="toolbar-btn" title="Italic">𝐼</button>
                <button className="toolbar-btn" title="Strikethrough">S̶</button>
                <span className="toolbar-divider" />
                <button className="toolbar-btn" title="Code">&lt;/&gt;</button>
                <button className="toolbar-btn" title="Code block">▤</button>
                <span className="toolbar-divider" />
                <button className="toolbar-btn" title="Link">🔗</button>
                <button className="toolbar-btn" title="Ordered list">1.</button>
                <button className="toolbar-btn" title="Bullet list">•</button>
                <span className="toolbar-divider" />
                <button className="toolbar-btn" title="Mention" onClick={() => setShowMentionDropdown(!showMentionDropdown)}>@</button>
                <button className="toolbar-btn" title="Emoji">😊</button>
                <button className="toolbar-btn" title="Attach file">📎</button>
              </div>
              <div className="composer-input-row">
                <textarea
                  ref={composerRef}
                  className="composer-input"
                  placeholder={viewMode === 'channel' ? `Message #${channelInfo?.name || activeChannel}` : `Message ${dmUser?.name || ''}`}
                  value={composerText}
                  onChange={e => {
                    setComposerText(e.target.value);
                    if (e.target.value.endsWith('@')) setShowMentionDropdown(true);
                    else if (!e.target.value.includes('@')) setShowMentionDropdown(false);
                  }}
                  onKeyDown={handleComposerKeyDown}
                  rows={1}
                />
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!composerText.trim()}
                  title="Send message"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            THREAD PANEL
            ================================================================ */}
        {showThread && THREAD_MESSAGES[showThread] && (
          <div className="thread-panel">
            <div className="thread-header">
              <div>
                <div className="thread-header-title">Thread</div>
                <div className="thread-header-channel">#{channelInfo?.name || activeChannel}</div>
              </div>
              <button className="icon-btn" onClick={() => setShowThread(null)}>✕</button>
            </div>
            <div className="thread-messages">
              {/* Parent message */}
              {(() => {
                const td = THREAD_MESSAGES[showThread];
                const parent = td.parent;
                const pu = USERS[parent.userId];
                return (
                  <>
                    <div className="message first-in-group">
                      <div className="message-avatar-col"><Avatar user={pu} size="lg" /></div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className={`message-author ${parent.isAgent ? 'agent' : ''}`}>{pu.name}</span>
                          {pu.isAgent && <span className="message-bot-badge">AGENT</span>}
                          <span className="message-timestamp">{parent.timestamp}</span>
                        </div>
                        <div className="message-body">{renderBody(parent.body)}</div>
                        {parent.reactions && parent.reactions.length > 0 && (
                          <div className="reactions">
                            {parent.reactions.map((r, i) => (
                              <button key={i} className={`reaction ${r.reacted ? 'reacted' : ''}`}>
                                <span>{r.emoji}</span>
                                <span className="reaction-count">{r.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="thread-reply-count">
                      {td.replies.length} replies
                    </div>

                    {td.replies.map(reply => {
                      const ru = USERS[reply.userId];
                      return (
                        <div key={reply.id} className="message first-in-group">
                          <div className="message-avatar-col"><Avatar user={ru} size="lg" /></div>
                          <div className="message-content">
                            <div className="message-header">
                              <span className={`message-author ${reply.isAgent ? 'agent' : ''}`}>{ru.name}</span>
                              {ru?.isAgent && <span className="message-bot-badge">AGENT</span>}
                              <span className="message-timestamp">{reply.timestamp}</span>
                            </div>
                            <div className="message-body">{renderBody(reply.body)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
            {/* Thread composer */}
            <div className="composer" style={{ position: 'relative' }}>
              <div className="composer-box">
                <div className="composer-input-row">
                  <textarea
                    className="composer-input"
                    placeholder="Reply..."
                    rows={1}
                  />
                  <button className="send-btn" disabled title="Send reply">➤</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            DETAILS PANEL
            ================================================================ */}
        {showDetails && !showThread && (
          <div className="details-panel">
            <div className="details-header">
              <span className="details-header-title">
                {viewMode === 'channel' ? `# ${channelInfo?.name || ''}` : dmUser?.name || ''}
              </span>
              <button className="icon-btn" onClick={() => setShowDetails(false)}>✕</button>
            </div>

            <div className="details-tabs">
              <button className={detailsTab === 'members' ? 'active' : ''} onClick={() => setDetailsTab('members')}>Members</button>
              <button className={detailsTab === 'files' ? 'active' : ''} onClick={() => setDetailsTab('files')}>Files</button>
              <button className={detailsTab === 'integrations' ? 'active' : ''} onClick={() => setDetailsTab('integrations')}>Apps</button>
            </div>

            <div className="details-content">
              {detailsTab === 'members' && (
                <>
                  {/* Online */}
                  <div className="section-header" style={{ padding: '4px 0 8px' }}>
                    <span>Online - {getChannelMembers().filter(u => u.presence === 'online').length}</span>
                  </div>
                  {getChannelMembers().filter(u => u.presence === 'online').map(u => (
                    <div key={u.id} className="member-item">
                      <div className="dm-avatar">
                        <Avatar user={u} />
                        <PresenceDot status={u.presence} />
                      </div>
                      <div className="member-info">
                        <div className="member-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {u.name}
                          {u.isAgent && <span className="message-bot-badge" style={{ fontSize: 9 }}>AGENT</span>}
                        </div>
                        <div className={`member-role ${u.isAgent ? 'agent-role' : ''}`}>{u.role}</div>
                      </div>
                    </div>
                  ))}

                  {/* Away / Busy */}
                  {getChannelMembers().filter(u => u.presence === 'away' || u.presence === 'busy').length > 0 && (
                    <>
                      <div className="section-header" style={{ padding: '12px 0 8px' }}>
                        <span>Away / Busy</span>
                      </div>
                      {getChannelMembers().filter(u => u.presence === 'away' || u.presence === 'busy').map(u => (
                        <div key={u.id} className="member-item">
                          <div className="dm-avatar">
                            <Avatar user={u} />
                            <PresenceDot status={u.presence} />
                          </div>
                          <div className="member-info">
                            <div className="member-name">{u.name}</div>
                            <div className="member-role">{u.role}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Offline */}
                  {getChannelMembers().filter(u => u.presence === 'offline').length > 0 && (
                    <>
                      <div className="section-header" style={{ padding: '12px 0 8px' }}>
                        <span>Offline</span>
                      </div>
                      {getChannelMembers().filter(u => u.presence === 'offline').map(u => (
                        <div key={u.id} className="member-item">
                          <div className="dm-avatar">
                            <Avatar user={u} />
                            <PresenceDot status={u.presence} />
                          </div>
                          <div className="member-info">
                            <div className="member-name">{u.name}</div>
                            <div className="member-role">{u.role}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}

              {detailsTab === 'files' && (
                <>
                  <div className="section-header" style={{ padding: '4px 0 8px' }}>
                    <span>Shared Files</span>
                  </div>
                  {SHARED_FILES.map((f, i) => {
                    const icons = { pdf: '📄', img: '🖼️', doc: '📝', zip: '📦', code: '💻' };
                    return (
                      <div key={i} className="file-list-item">
                        <div className={`file-icon ${f.type}`}>{icons[f.type] || '📎'}</div>
                        <div className="file-list-info">
                          <div className="file-list-name">{f.name}</div>
                          <div className="file-list-meta">{f.size} - Shared by {USERS[f.sharedBy]?.name || f.sharedBy} - {f.date}</div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {detailsTab === 'integrations' && (
                <>
                  <div className="section-header" style={{ padding: '4px 0 8px' }}>
                    <span>Integrations &amp; Apps</span>
                  </div>
                  {INTEGRATIONS.map((intg, i) => (
                    <div key={i} className="integration-item">
                      <div className="integration-icon" style={{ background: 'var(--bg-tertiary)' }}>{intg.icon}</div>
                      <div className="integration-info">
                        <div className="integration-name">{intg.name}</div>
                        <div className="integration-desc">{intg.desc}</div>
                      </div>
                      <span className={`integration-status ${intg.status}`}>{intg.status}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================
          SETTINGS MODAL
          ================================================================ */}
      {showSettings && (
        <div className="settings-overlay" onClick={e => { if (e.target === e.currentTarget) setShowSettings(false); }}>
          <div className="settings-modal">
            <div className="settings-modal-header">
              <h2>Settings</h2>
              <button className="icon-btn" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="settings-body">
              <div className="settings-sidebar">
                {['general', 'notifications', 'appearance', 'privacy', 'agents', 'about'].map(tab => (
                  <button
                    key={tab}
                    className={`settings-nav-item ${settingsTab === tab ? 'active' : ''}`}
                    onClick={() => setSettingsTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="settings-content">
                {settingsTab === 'general' && (
                  <>
                    <div className="settings-section">
                      <h3>General</h3>
                      <div className="settings-row">
                        <span className="settings-label">Dark Mode</span>
                        <div
                          className={`toggle-switch ${settingsToggles.darkMode ? 'on' : ''}`}
                          onClick={() => setSettingsToggles(p => ({ ...p, darkMode: !p.darkMode }))}
                        />
                      </div>
                      <div className="settings-row">
                        <span className="settings-label">Compact Mode</span>
                        <div
                          className={`toggle-switch ${settingsToggles.compactMode ? 'on' : ''}`}
                          onClick={() => setSettingsToggles(p => ({ ...p, compactMode: !p.compactMode }))}
                        />
                      </div>
                    </div>
                    <div className="settings-section">
                      <h3>Profile</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                        <Avatar user={CURRENT_USER} size="xl" />
                        <div>
                          <div style={{ fontWeight: 700 }}>{CURRENT_USER.name}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>{CURRENT_USER.role}</div>
                          <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>blackroad.systems@gmail.com</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {settingsTab === 'notifications' && (
                  <div className="settings-section">
                    <h3>Notifications</h3>
                    {[
                      ['notifications', 'Enable Notifications'],
                      ['sounds', 'Notification Sounds'],
                      ['desktop', 'Desktop Notifications'],
                      ['mentions', 'Only @mentions'],
                      ['threadNotify', 'Thread Replies'],
                    ].map(([key, label]) => (
                      <div key={key} className="settings-row">
                        <span className="settings-label">{label}</span>
                        <div
                          className={`toggle-switch ${settingsToggles[key] ? 'on' : ''}`}
                          onClick={() => setSettingsToggles(p => ({ ...p, [key]: !p[key] }))}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {settingsTab === 'appearance' && (
                  <div className="settings-section">
                    <h3>Theme</h3>
                    <div style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
                      <div style={{
                        width: 80, height: 60, borderRadius: 8, background: '#0a0a0a',
                        border: '2px solid var(--hot-pink)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 12, color: '#f0f0f0', cursor: 'pointer'
                      }}>Dark</div>
                      <div style={{
                        width: 80, height: 60, borderRadius: 8, background: '#f5f5f5',
                        border: '2px solid var(--border)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 12, color: '#333', cursor: 'pointer'
                      }}>Light</div>
                    </div>
                    <h3 style={{ marginTop: 16 }}>Brand Colors</h3>
                    <div style={{ display: 'flex', gap: 8, padding: '8px 0' }}>
                      {[BRAND.amber, BRAND.hotPink, BRAND.electricBlue, BRAND.violet].map(c => (
                        <div key={c} style={{ width: 32, height: 32, borderRadius: '50%', background: c }} title={c} />
                      ))}
                    </div>
                  </div>
                )}
                {settingsTab === 'privacy' && (
                  <div className="settings-section">
                    <h3>Privacy &amp; Security</h3>
                    <div style={{ fontSize: 13, color: '#a0a0a0', lineHeight: 1.6 }}>
                      <p>All communications are encrypted end-to-end within the BlackRoad OS infrastructure.</p>
                      <p style={{ marginTop: 12 }}>Gateway Architecture: Tokenless trust boundary ensures no API keys are embedded in agent communication.</p>
                      <p style={{ marginTop: 12 }}>Memory journals use PS-SHA-infinity hash chains for tamper detection.</p>
                    </div>
                  </div>
                )}
                {settingsTab === 'agents' && (
                  <div className="settings-section">
                    <h3>AI Agent Settings</h3>
                    <div className="settings-row">
                      <span className="settings-label">Show AI Agents in channels</span>
                      <div
                        className={`toggle-switch ${settingsToggles.showAgents ? 'on' : ''}`}
                        onClick={() => setSettingsToggles(p => ({ ...p, showAgents: !p.showAgents }))}
                      />
                    </div>
                    <h3 style={{ marginTop: 16 }}>Active Agents</h3>
                    {Object.values(USERS).filter(u => u.isAgent).map(agent => (
                      <div key={agent.id} className="member-item">
                        <Avatar user={agent} />
                        <div className="member-info">
                          <div className="member-name">{agent.name}</div>
                          <div className="member-role agent-role">{agent.role}</div>
                        </div>
                        <PresenceDot status={agent.presence} />
                      </div>
                    ))}
                  </div>
                )}
                {settingsTab === 'about' && (
                  <div className="settings-section">
                    <h3>About RoadComms</h3>
                    <div style={{ fontSize: 13, color: '#a0a0a0', lineHeight: 1.8 }}>
                      <p><strong>RoadComms v1.0.0</strong></p>
                      <p>The communication platform for BlackRoad OS.</p>
                      <p style={{ marginTop: 12 }}>Built with React 19 + Vite. Deployed on Cloudflare Pages.</p>
                      <p style={{ marginTop: 12 }}>30,000 AI Agents | 1,825+ Repositories | 17 Organizations</p>
                      <p style={{ marginTop: 12, fontSize: 11, color: '#444' }}>
                        All content is proprietary to BlackRoad OS, Inc. All rights reserved.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          CALENDAR / MEETING SCHEDULER
          ================================================================ */}
      {showCalendar && (
        <div className="calendar-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCalendar(false); }}>
          <div className="calendar-modal">
            <div className="calendar-header">
              <h2>Meeting Scheduler</h2>
              <button className="icon-btn" onClick={() => setShowCalendar(false)}>✕</button>
            </div>
            <div className="calendar-body">
              {/* Month header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <button className="icon-btn">◀</button>
                <span style={{ fontWeight: 700, fontSize: 15 }}>February 2026</span>
                <button className="icon-btn">▶</button>
              </div>

              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="calendar-day-header">{d}</div>
                ))}
                {/* Feb 2026 starts on Sunday */}
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <div
                    key={day}
                    className={`calendar-day ${day === 28 ? 'today' : ''} ${[2, 5, 9, 12, 16, 19, 23, 26, 28].includes(day) ? 'has-event' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-events">
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Today&apos;s Meetings</div>
                {CALENDAR_EVENTS.map((evt, i) => (
                  <div key={i} className="calendar-event" style={{ borderLeftColor: i % 2 === 0 ? BRAND.electricBlue : BRAND.hotPink }}>
                    <div className="calendar-event-time">{evt.time}</div>
                    <div className="calendar-event-title">{evt.title}</div>
                    <div className="calendar-event-attendees">
                      {evt.attendees.slice(0, 4).map(uid => (
                        <Avatar key={uid} user={uid} />
                      ))}
                      {evt.attendees.length > 4 && (
                        <div className="avatar" style={{ width: 22, height: 22, fontSize: 9, background: '#333', border: '2px solid var(--bg-tertiary)', marginLeft: -4 }}>
                          +{evt.attendees.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
