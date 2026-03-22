#!/usr/bin/env node
// seed.js — Generates wrangler d1 execute commands to seed the BlackRoad Database
// Usage: node seed.js | bash
//   or:  node seed.js > seed.sh && bash seed.sh

const DB_NAME = 'blackroad-database';
const now = Math.floor(Date.now() / 1000);

const items = [
  // ── Repos ──
  { type: 'repos', name: 'BlackRoad-Operating-System', description: 'The sovereign operating system. 400+ scripts, fleet orchestration, mesh networking.', url: 'https://github.com/blackboxprogramming/BlackRoad-Operating-System', tags: 'os,fleet,scripts,core', icon: '\u{1F4E6}' },
  { type: 'repos', name: 'lucidia', description: 'Lucidia — the dreamer agent. Metaverse engine, personality system, memory.', url: 'https://github.com/blackboxprogramming/lucidia', tags: 'agent,ai,metaverse,personality', icon: '\u{1F4E6}' },
  { type: 'repos', name: 'quantum-math-lab', description: 'Quantum mathematics research. Proofs, simulations, number theory.', url: 'https://github.com/blackboxprogramming/quantum-math-lab', tags: 'quantum,math,research,proofs', icon: '\u{1F4E6}' },
  { type: 'repos', name: 'simulation-theory', description: 'Simulation theory explorations. Mathematical frameworks for reality modeling.', url: 'https://github.com/blackboxprogramming/simulation-theory', tags: 'simulation,theory,philosophy,math', icon: '\u{1F4E6}' },
  { type: 'repos', name: 'blackroad-api-sdks', description: 'Official BlackRoad API SDKs. Python, Node.js, Go clients.', url: 'https://github.com/blackboxprogramming/blackroad-api-sdks', tags: 'api,sdk,python,node,go', icon: '\u{1F4E6}' },
  { type: 'repos', name: 'blackroad-operator', description: 'The operator monorepo. Websites, workers, infrastructure as code.', url: 'https://github.com/blackboxprogramming/blackroad-operator', tags: 'monorepo,infra,workers,websites', icon: '\u{1F4E6}' },
  { type: 'repos', name: 'blackroad-web', description: 'BlackRoad web properties. Landing pages, dashboards, public sites.', url: 'https://github.com/blackboxprogramming/blackroad-web', tags: 'web,frontend,landing,sites', icon: '\u{1F4E6}' },
  { type: 'repos', name: 'blackroad-os-kpis', description: 'KPI collection and reporting. Fleet health, GitHub stats, code metrics.', url: 'https://github.com/blackboxprogramming/blackroad-os-kpis', tags: 'kpi,metrics,monitoring,stats', icon: '\u{1F4E6}' },
  { type: 'repos', name: 'BLACKROAD-OS-BRAND-LOCK', description: 'Brand guidelines and design templates. Colors, fonts, layouts — locked.', url: 'https://github.com/blackboxprogramming/BLACKROAD-OS-BRAND-LOCK', tags: 'brand,design,templates,guidelines', icon: '\u{1F4E6}' },

  // ── Agents ──
  { type: 'agents', name: 'Octavia', description: 'The Architect. Fleet orchestration, Gitea master, Docker Swarm leader. Pi5 with Hailo-8 + 1TB NVMe.', url: 'https://git.blackroad.io', tags: 'architect,orchestration,gitea,swarm', icon: '\u{1F916}', metadata: { color: 'violet', node: 'octavia', ip: '192.168.4.101' } },
  { type: 'agents', name: 'Lucidia', description: 'The Dreamer. Personality engine, memory system, metaverse. Pi5 with 334 web apps.', url: 'https://lucidia.earth', tags: 'dreamer,personality,memory,metaverse', icon: '\u{1F916}', metadata: { color: 'cyan', node: 'lucidia', ip: '192.168.4.38' } },
  { type: 'agents', name: 'Alice', description: 'The Operator. Main gateway, Pi-hole DNS, PostgreSQL, Qdrant, 48+ domain ingress.', url: 'https://blackroad.io', tags: 'operator,gateway,dns,ingress', icon: '\u{1F916}', metadata: { color: 'green', node: 'alice', ip: '192.168.4.49' } },
  { type: 'agents', name: 'Cecilia', description: 'The Voice. CECE personality engine, TTS API, MinIO, Hailo-8 AI accelerator.', url: 'https://chat.blackroad.io', tags: 'voice,tts,cece,personality', icon: '\u{1F916}', metadata: { color: 'magenta', node: 'cecilia', ip: '192.168.4.96' } },
  { type: 'agents', name: 'Aria', description: 'The Interface. Portainer, Headscale, container orchestration. Currently offline.', url: 'https://blackroad.io', tags: 'interface,portainer,headscale,containers', icon: '\u{1F916}', metadata: { color: 'blue', node: 'aria', ip: '192.168.4.98', status: 'offline' } },
  { type: 'agents', name: 'Shellfish', description: 'The Hacker. Security auditing, penetration testing, network scanning agent.', url: 'https://blackroad.io', tags: 'hacker,security,scanning,audit', icon: '\u{1F916}', metadata: { color: 'red' } },
  { type: 'agents', name: 'CECE', description: 'Personality Engine. 4 custom Ollama models (cece-v1 to v4), emotional context, TTS.', url: 'https://chat.blackroad.io', tags: 'personality,ollama,tts,emotion', icon: '\u{1F916}', metadata: { color: 'magenta', models: 4 } },

  // ── Domains ──
  { type: 'domains', name: 'blackroad.io', description: 'Primary domain. Main landing page and gateway.', url: 'https://blackroad.io', tags: 'primary,landing,gateway', icon: '\u{1F310}' },
  { type: 'domains', name: 'blackroadai.com', description: 'AI-focused landing. Mesh network, sovereign inference.', url: 'https://blackroadai.com', tags: 'ai,landing,mesh', icon: '\u{1F310}' },
  { type: 'domains', name: 'lucidia.earth', description: 'Lucidia agent home. Metaverse and personality.', url: 'https://lucidia.earth', tags: 'agent,lucidia,metaverse', icon: '\u{1F310}' },
  { type: 'domains', name: 'lucidiaqi.com', description: 'Lucidia Qi. Quantum intelligence interface.', url: 'https://lucidiaqi.com', tags: 'lucidia,quantum,intelligence', icon: '\u{1F310}' },
  { type: 'domains', name: 'lucidia.studio', description: 'Lucidia Studio. Creative and design tools.', url: 'https://lucidia.studio', tags: 'lucidia,studio,creative', icon: '\u{1F310}' },
  { type: 'domains', name: 'roadchain.io', description: 'RoadChain. Distributed ledger and chain infrastructure.', url: 'https://roadchain.io', tags: 'chain,distributed,ledger', icon: '\u{1F310}' },
  { type: 'domains', name: 'blackroadquantum.com', description: 'Quantum computing research portal.', url: 'https://blackroadquantum.com', tags: 'quantum,research,computing', icon: '\u{1F310}' },
  { type: 'domains', name: 'blackroad.network', description: 'Network infrastructure dashboard.', url: 'https://blackroad.network', tags: 'network,infrastructure,dashboard', icon: '\u{1F310}' },
  { type: 'domains', name: 'blackroad.systems', description: 'Systems engineering and fleet management.', url: 'https://blackroad.systems', tags: 'systems,fleet,engineering', icon: '\u{1F310}' },
  { type: 'domains', name: 'chat.blackroad.io', description: 'AI chat interface. Free inference via fleet models.', url: 'https://chat.blackroad.io', tags: 'chat,ai,inference,free', icon: '\u{1F310}' },
  { type: 'domains', name: 'db.blackroad.io', description: 'BlackRoad Database. Searchable ecosystem index.', url: 'https://db.blackroad.io', tags: 'database,search,index', icon: '\u{1F310}' },
  { type: 'domains', name: 'bb.blackroad.io', description: 'BlackBoard analytics. Privacy-first event tracking.', url: 'https://bb.blackroad.io', tags: 'analytics,tracking,privacy', icon: '\u{1F310}' },
  { type: 'domains', name: 'stats.blackroad.io', description: 'Live fleet statistics and metrics dashboard.', url: 'https://stats.blackroad.io', tags: 'stats,metrics,live,dashboard', icon: '\u{1F310}' },
  { type: 'domains', name: 'images.blackroad.io', description: 'Image hosting. R2-backed with D1 metadata index.', url: 'https://images.blackroad.io', tags: 'images,hosting,r2,cdn', icon: '\u{1F310}' },
  { type: 'domains', name: 'git.blackroad.io', description: 'Gitea instance on Octavia. 207 repos, 7 orgs.', url: 'https://git.blackroad.io', tags: 'git,gitea,repos,code', icon: '\u{1F310}' },
  { type: 'domains', name: 'index.blackroad.io', description: 'Full-text search index. 354 repos, 2524 files.', url: 'https://index.blackroad.io', tags: 'index,search,fts5,files', icon: '\u{1F310}' },
  { type: 'domains', name: 'mesh.blackroad.io', description: 'Mesh network portal. WebRTC peer-to-peer inference.', url: 'https://mesh.blackroad.io', tags: 'mesh,webrtc,p2p,inference', icon: '\u{1F310}' },

  // ── Models ──
  { type: 'models', name: 'llama3.2:3b', description: 'Meta Llama 3.2 3B. Fast general-purpose chat and reasoning.', url: 'https://ollama.com/library/llama3.2', tags: 'llama,meta,3b,chat', icon: '\u{1F9E0}', metadata: { params: '3B', provider: 'Meta' } },
  { type: 'models', name: 'qwen2.5:7b', description: 'Alibaba Qwen 2.5 7B. Strong multilingual and coding.', url: 'https://ollama.com/library/qwen2.5', tags: 'qwen,alibaba,7b,coding', icon: '\u{1F9E0}', metadata: { params: '7B', provider: 'Alibaba' } },
  { type: 'models', name: 'deepseek-r1:8b', description: 'DeepSeek R1 8B. Reasoning-focused, chain-of-thought.', url: 'https://ollama.com/library/deepseek-r1', tags: 'deepseek,reasoning,8b,cot', icon: '\u{1F9E0}', metadata: { params: '8B', provider: 'DeepSeek' } },
  { type: 'models', name: 'phi4:14b', description: 'Microsoft Phi-4 14B. Compact but powerful reasoning model.', url: 'https://ollama.com/library/phi4', tags: 'phi,microsoft,14b,reasoning', icon: '\u{1F9E0}', metadata: { params: '14B', provider: 'Microsoft' } },
  { type: 'models', name: 'cece-v1', description: 'CECE v1. First custom personality model for Cecilia.', url: 'https://chat.blackroad.io', tags: 'cece,custom,personality,v1', icon: '\u{1F9E0}', metadata: { params: 'custom', provider: 'BlackRoad' } },
  { type: 'models', name: 'cece-v2', description: 'CECE v2. Enhanced emotional context and memory.', url: 'https://chat.blackroad.io', tags: 'cece,custom,personality,v2', icon: '\u{1F9E0}', metadata: { params: 'custom', provider: 'BlackRoad' } },
  { type: 'models', name: 'cece-v3', description: 'CECE v3. Improved voice synthesis integration.', url: 'https://chat.blackroad.io', tags: 'cece,custom,personality,v3', icon: '\u{1F9E0}', metadata: { params: 'custom', provider: 'BlackRoad' } },
  { type: 'models', name: 'cece-v4', description: 'CECE v4. Latest personality engine with full TTS pipeline.', url: 'https://chat.blackroad.io', tags: 'cece,custom,personality,v4', icon: '\u{1F9E0}', metadata: { params: 'custom', provider: 'BlackRoad' } },
  { type: 'models', name: 'gemma2:9b', description: 'Google Gemma 2 9B. Efficient open model for diverse tasks.', url: 'https://ollama.com/library/gemma2', tags: 'gemma,google,9b,general', icon: '\u{1F9E0}', metadata: { params: '9B', provider: 'Google' } },
  { type: 'models', name: 'mistral:7b', description: 'Mistral 7B. Fast European LLM, strong at instruction following.', url: 'https://ollama.com/library/mistral', tags: 'mistral,7b,instruction,fast', icon: '\u{1F9E0}', metadata: { params: '7B', provider: 'Mistral AI' } },
  { type: 'models', name: 'nomic-embed', description: 'Nomic Embed. Text embedding model for semantic search and RAG.', url: 'https://ollama.com/library/nomic-embed-text', tags: 'embedding,nomic,search,rag', icon: '\u{1F9E0}', metadata: { params: 'embed', provider: 'Nomic' } },
  { type: 'models', name: 'llava:7b', description: 'LLaVA 7B. Multimodal vision-language model for image understanding.', url: 'https://ollama.com/library/llava', tags: 'llava,vision,multimodal,7b', icon: '\u{1F9E0}', metadata: { params: '7B', provider: 'LLaVA' } },

  // ── Workers ──
  { type: 'workers', name: 'blackboard', description: 'Privacy-first analytics. Event tracking, page views, custom metrics.', url: 'https://bb.blackroad.io', tags: 'analytics,tracking,events,privacy', icon: '\u{2699}\uFE0F' },
  { type: 'workers', name: 'stats', description: 'Live fleet metrics. CPU, memory, temps, uptime from all Pi nodes.', url: 'https://stats.blackroad.io', tags: 'stats,metrics,fleet,live', icon: '\u{2699}\uFE0F' },
  { type: 'workers', name: 'mesh', description: 'WebRTC mesh coordinator. Browser-to-browser inference routing.', url: 'https://mesh.blackroad.io', tags: 'mesh,webrtc,p2p,inference', icon: '\u{2699}\uFE0F' },
  { type: 'workers', name: 'signup', description: 'Registration worker. User signups with D1 storage.', url: 'https://blackroad.io/signup', tags: 'auth,signup,registration,users', icon: '\u{2699}\uFE0F' },
  { type: 'workers', name: 'auth', description: 'Authentication worker. Token validation, session management.', url: 'https://blackroad.io/auth', tags: 'auth,tokens,sessions,security', icon: '\u{2699}\uFE0F' },
  { type: 'workers', name: 'database', description: 'This worker. Searchable index of the entire BlackRoad ecosystem.', url: 'https://db.blackroad.io', tags: 'database,search,index,fts5', icon: '\u{2699}\uFE0F' },
  { type: 'workers', name: 'ai-gateway', description: 'LLM routing gateway. Load balancing across fleet Ollama instances.', url: 'https://chat.blackroad.io', tags: 'ai,gateway,llm,routing,ollama', icon: '\u{2699}\uFE0F' },

  // ── Scripts ──
  { type: 'scripts', name: 'br-video', description: 'Video processing pipeline. Download, transcode, optimize for web.', url: 'https://github.com/blackboxprogramming/BlackRoad-Operating-System', tags: 'video,processing,ffmpeg,pipeline', icon: '\u{1F4DC}' },
  { type: 'scripts', name: 'br-video-create', description: 'AI video creation. Generate videos from prompts using fleet models.', url: 'https://github.com/blackboxprogramming/BlackRoad-Operating-System', tags: 'video,creation,ai,generation', icon: '\u{1F4DC}' },
  { type: 'scripts', name: 'roadid', description: 'RoadID identity tool. Generate and manage BlackRoad identities.', url: 'https://github.com/blackboxprogramming/BlackRoad-Operating-System', tags: 'identity,roadid,auth,cli', icon: '\u{1F4DC}' },
  { type: 'scripts', name: 'carpool', description: 'CarPool agent dispatcher. Route tasks to fleet nodes by capability.', url: 'https://github.com/blackboxprogramming/BlackRoad-Operating-System', tags: 'carpool,dispatch,agents,routing', icon: '\u{1F4DC}' },
];

// Escape single quotes for SQL
function esc(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/'/g, "''");
}

console.log('#!/bin/bash');
console.log('# BlackRoad Database seed script');
console.log('# Generated: ' + new Date().toISOString());
console.log('# Run: node seed.js | bash');
console.log('');
console.log('set -e');
console.log('');

// Build all inserts as a single SQL batch
const sqlStatements = items.map(item => {
  const metadata = JSON.stringify(item.metadata || {});
  return `INSERT OR REPLACE INTO items (type, name, description, url, tags, metadata, icon, updated_at) VALUES ('${esc(item.type)}', '${esc(item.name)}', '${esc(item.description)}', '${esc(item.url)}', '${esc(item.tags)}', '${esc(metadata)}', '${esc(item.icon)}', ${now});`;
});

// Split into chunks of 10 to avoid command line length limits
const chunkSize = 10;
for (let i = 0; i < sqlStatements.length; i += chunkSize) {
  const chunk = sqlStatements.slice(i, i + chunkSize);
  const sql = chunk.join('\n');
  console.log(`echo "Seeding items ${i + 1}-${Math.min(i + chunkSize, sqlStatements.length)} of ${sqlStatements.length}..."`);
  console.log(`npx wrangler d1 execute ${DB_NAME} --command="${esc(sql)}"`);
  console.log('');
}

console.log('echo ""');
console.log(`echo "Seeded ${items.length} items into ${DB_NAME}"`);
console.log(`echo "  Repos:   ${items.filter(i => i.type === 'repos').length}"`);
console.log(`echo "  Agents:  ${items.filter(i => i.type === 'agents').length}"`);
console.log(`echo "  Domains: ${items.filter(i => i.type === 'domains').length}"`);
console.log(`echo "  Models:  ${items.filter(i => i.type === 'models').length}"`);
console.log(`echo "  Workers: ${items.filter(i => i.type === 'workers').length}"`);
console.log(`echo "  Scripts: ${items.filter(i => i.type === 'scripts').length}"`);
console.log(`echo ""`);
console.log(`echo "Done. Verify at https://db.blackroad.io"`);
