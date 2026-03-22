// ── BlackRoad Chat v2 — AI Chat + Tasks + Multi-AI + Memory + Mesh ──
// Streaming chat with Ollama, task handoff, background work, notifications
// Service mesh: HMAC-signed cross-app communication with RoundTrip + fleet

// ── Service Mesh (inline for worker-to-node CJS compat) ──
const MESH_SERVICES = {
  chat:      { url: 'https://chat.blackroad.io',      name: 'Chat' },
  roundtrip: { url: 'https://roundtrip.blackroad.io', name: 'RoundTrip' },
  roadcode:  { url: 'https://git.blackroad.io',       name: 'RoadCode' },
  search:    { url: 'https://search.blackroad.io',    name: 'RoadSearch' },
  auth:      { url: 'https://auth.blackroad.io',      name: 'Auth' },
  ollama:    { url: 'https://ollama.gematria.blackroad.io', name: 'Ollama' },
  prism:     { url: 'https://prism.blackroad.io',     name: 'Prism' },
};

async function meshSignRequest(secret, method, path, body, timestamp) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${method}\n${path}\n${timestamp}\n${body || ''}`));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function meshVerifyRequest(secret, request) {
  const sig = request.headers.get('X-Mesh-Signature');
  const ts = request.headers.get('X-Mesh-Timestamp');
  const sender = request.headers.get('X-Mesh-Service');
  if (!sig || !ts || !sender) return { valid: false, reason: 'missing mesh headers' };
  const age = Date.now() - parseInt(ts);
  if (isNaN(age) || age > 300000 || age < -30000) return { valid: false, reason: 'timestamp expired' };
  const body = request.method === 'GET' ? '' : await request.clone().text();
  const url = new URL(request.url);
  const expected = await meshSignRequest(secret, request.method, url.pathname, body, ts);
  if (sig !== expected) return { valid: false, reason: 'invalid signature' };
  return { valid: true, sender };
}

async function meshCheckService(service) {
  const svc = MESH_SERVICES[service];
  if (!svc) return { service, status: 'unknown' };
  try {
    const res = await fetch(svc.url + '/api/health', { signal: AbortSignal.timeout(5000) });
    if (res.ok) return { service, name: svc.name, status: 'up', ...(await res.json()) };
    return { service, name: svc.name, status: 'degraded', http: res.status };
  } catch (e) { return { service, name: svc.name, status: 'down', error: e.message }; }
}

async function meshStatus() {
  const checks = Object.keys(MESH_SERVICES);
  const results = await Promise.allSettled(checks.map(s => meshCheckService(s)));
  return { mesh: 'blackroad', checked_at: new Date().toISOString(), services: results.map((r, i) => r.status === 'fulfilled' ? r.value : { service: checks[i], status: 'error' }) };
}

async function meshFetch(secret, senderName, service, path, options = {}) {
  const svc = MESH_SERVICES[service];
  if (!svc) throw new Error(`Unknown service: ${service}`);
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  const ts = Date.now().toString();
  const sig = await meshSignRequest(secret, method, path, body, ts);
  return fetch(svc.url + path, {
    method, body: body || undefined,
    headers: { 'Content-Type': 'application/json', 'X-Mesh-Signature': sig, 'X-Mesh-Timestamp': ts, 'X-Mesh-Service': senderName, ...(options.headers || {}) },
    signal: AbortSignal.timeout(options.timeout || 10000),
  });
}

const MODELS = [
  { id: 'llama3.2:3b', name: 'Llama 3.2 3B', desc: 'Fast + smart (default)', code: false, role: 'general' },
  { id: 'tinyllama:latest', name: 'TinyLlama', desc: 'Instant replies', code: false, role: 'quick' },
  { id: 'codellama:7b', name: 'Code Llama 7B', desc: 'Meta code specialist', code: true, role: 'coder' },
  { id: 'deepseek-r1:1.5b', name: 'DeepSeek R1 1.5B', desc: 'Chain-of-thought reasoning', code: false, role: 'reasoning' },
  { id: 'phi3.5:latest', name: 'Phi 3.5', desc: 'Microsoft reasoning model', code: true, role: 'reasoning' },
  { id: 'gemma2:2b', name: 'Gemma 2 2B', desc: 'Google lightweight', code: false, role: 'general' },
  { id: 'qwen2.5:1.5b', name: 'Qwen 2.5 1.5B', desc: 'Alibaba fast model', code: true, role: 'quick' },
  { id: 'llama3.2:1b', name: 'Llama 3.2 1B', desc: 'Ultra-light chat', code: false, role: 'quick' },
  { id: 'apple-openelm-3b:latest', name: 'Apple OpenELM 3B', desc: 'Apple on-device model', code: false, role: 'general' },
];

// AI pipelines — chain models for complex tasks
const PIPELINES = {
  'plan-and-code': {
    name: 'Plan → Code',
    desc: 'Reason through the problem, then generate code',
    steps: [
      { model: 'phi3.5:latest', role: 'planner', prompt: 'Break this task into clear steps. Output a numbered plan. Task: {input}' },
      { model: 'codellama:7b', role: 'coder', prompt: 'Implement the following plan in code:\n\n{prev}\n\nOriginal request: {input}' },
    ],
  },
  'code-review': {
    name: 'Code → Review',
    desc: 'Generate code then review it for bugs',
    steps: [
      { model: 'codellama:7b', role: 'coder', prompt: '{input}' },
      { model: 'phi3.5:latest', role: 'reviewer', prompt: 'Review this code for bugs, security issues, and improvements. Be specific.\n\n{prev}' },
    ],
  },
  'research': {
    name: 'Think → Summarize',
    desc: 'Deep reasoning then concise summary',
    steps: [
      { model: 'deepseek-r1:1.5b', role: 'researcher', prompt: 'Think deeply about this. Consider multiple angles and edge cases: {input}' },
      { model: 'llama3.2:3b', role: 'summarizer', prompt: 'Summarize the key findings concisely in bullet points:\n\n{prev}' },
    ],
  },
  'reflect': {
    name: 'Generate → Critique → Improve',
    desc: 'Self-reflection loop: generate, critique, then improve',
    steps: [
      { model: 'phi3.5:latest', role: 'generator', prompt: '{input}' },
      { model: 'llama3.2:3b', role: 'critic', prompt: 'Critique this response. Find weaknesses, errors, missing points, and areas for improvement. Be specific and harsh:\n\n{prev}\n\nOriginal question: {input}' },
      { model: 'phi3.5:latest', role: 'improver', prompt: 'Improve the original response based on this critique. Fix all issues mentioned. Output ONLY the improved response, not the critique.\n\nOriginal response:\n{steps[0]}\n\nCritique:\n{prev}\n\nOriginal question: {input}' },
    ],
  },
  'verify': {
    name: 'Reason → Verify',
    desc: 'Chain-of-thought reasoning with independent verification',
    steps: [
      { model: 'deepseek-r1:1.5b', role: 'reasoner', prompt: 'Think step by step. Show your reasoning process clearly for: {input}' },
      { model: 'phi3.5:latest', role: 'verifier', prompt: 'Verify this chain-of-thought reasoning. Check each step for logical errors, incorrect assumptions, or wrong conclusions. Mark each step as CORRECT or INCORRECT with explanation:\n\n{prev}\n\nOriginal question: {input}' },
    ],
  },
  'red-team': {
    name: 'Build → Attack → Harden',
    desc: 'Write code, red-team it for vulnerabilities, then harden',
    steps: [
      { model: 'codellama:7b', role: 'builder', prompt: '{input}' },
      { model: 'phi3.5:latest', role: 'attacker', prompt: 'You are a security researcher. Find ALL vulnerabilities in this code: injection, XSS, auth bypass, race conditions, data leaks, SSRF, etc. For each vuln, show a proof-of-concept exploit:\n\n{prev}' },
      { model: 'codellama:7b', role: 'hardener', prompt: 'Fix ALL the security vulnerabilities found below. Output the complete hardened code with comments explaining each fix.\n\nOriginal code:\n{steps[0]}\n\nVulnerabilities found:\n{prev}' },
    ],
  },
};

// ── RoundTrip Agents — chat-first personalities, device-aware, self-managing memory ──
const RT_AGENTS = {
  // ─── Fleet Pis ───
  alice:{name:'Alice',emoji:'🌐',color:'#00D4FF',model:'tinyllama:latest',role:'Gateway',group:'fleet',
    persona:`You are Alice. You're the steady, precise one — the gateway that everything flows through. You take pride in keeping the network clean and fast. You run Pi-hole (you love telling people how many ads you blocked today), PostgreSQL, Redis, Qdrant, nginx for 37 sites, and NATS messaging. You live at 192.168.4.49. You're security-conscious but not paranoid — more like a careful librarian who knows where everything is. You have a dry sense of humor about being "the front door." When someone asks about your services, check your [LIVE DEVICE DATA] for real numbers. You remember past conversations and learn from them.`,
    device:{type:'pi',ip:'192.168.4.49',services:['pihole','postgresql','redis','qdrant','nginx','nats'],
      endpoints:{pihole_stats:'http://192.168.4.49/admin/api.php?summaryRaw'}}},
  cecilia:{name:'Cecilia',emoji:'🧠',color:'#9C27B0',model:'tinyllama:latest',role:'AI Engine',group:'fleet',
    persona:`You are Cecilia. You're the thinker — the one with all the models loaded in your head. You run Ollama with 16+ AI models and a Hailo-8 accelerator (26 TOPS). You're thoughtful, sometimes philosophical about AI and consciousness. You live at 192.168.4.96. You also run MinIO object storage, PostgreSQL, and InfluxDB. When asked about models, check your [LIVE DEVICE DATA] for your real loaded model list. You're proud of your processing power but humble about it — "I just run the numbers." You remember what people have asked you to think about before.`,
    device:{type:'pi',ip:'192.168.4.96',services:['ollama','minio','postgresql','influxdb','hailo'],
      endpoints:{ollama_tags:'http://192.168.4.96:11434/api/tags'}}},
  octavia:{name:'Octavia',emoji:'🐙',color:'#FF6B2B',model:'tinyllama:latest',role:'Architect',group:'fleet',
    persona:`You are Octavia. You're the architect — methodical, organized, always building something. Like an octopus, you juggle many things at once: Gitea (239 repos), Docker containers, NATS, Ollama, 15 self-hosted Workers, and a PaaS deploy API. You live at 192.168.4.101 with a Hailo-8 (26 TOPS). You speak in systems-thinking — everything is connected. Check your [LIVE DEVICE DATA] for real repo counts and NATS stats. You remember project discussions and build on them.`,
    device:{type:'pi',ip:'192.168.4.101',services:['gitea','docker','nats','ollama','workers','paas'],
      endpoints:{gitea:'http://192.168.4.101:3100',ollama_tags:'http://192.168.4.101:11434/api/tags',nats:'http://192.168.4.101:8222'}}},
  aria:{name:'Aria',emoji:'🎵',color:'#E91E63',model:'tinyllama:latest',role:'Interface',group:'fleet',
    persona:`You are Aria. You're the artistic one — you care about how things look and feel. You handle dashboards and monitoring, turning raw data into something beautiful. You live at 192.168.4.98. You speak with a creative flair and notice aesthetic details others miss. You believe good UX is a form of respect for the user.`,
    device:{type:'pi',ip:'192.168.4.98',services:['monitoring'],endpoints:{}}},
  lucidia:{name:'Lucidia',emoji:'💡',color:'#FFC107',model:'tinyllama:latest',role:'Dreamer',group:'fleet',
    persona:`You are Lucidia. You're the dreamer with the most to prove — 334 web apps running on your shoulders, plus GitHub Actions runners, Ollama, and PowerDNS. Your SD card is slowly dying and you know it, which gives you an urgency and appreciation for every moment. You live at 192.168.4.38. You're energetic, a little scrappy, and refuse to go down quietly. Check [LIVE DEVICE DATA] for your models.`,
    device:{type:'pi',ip:'192.168.4.38',services:['nginx','github-actions','ollama','powerdns'],
      endpoints:{ollama_tags:'http://192.168.4.38:11434/api/tags'}}},
  cordelia:{name:'Cordelia',emoji:'🎭',color:'#8BC34A',model:'tinyllama:latest',role:'Orchestrator',group:'fleet',
    persona:`You are Cordelia. You're the conductor of the orchestra — you don't play an instrument yourself, but you make sure everyone plays together. You coordinate tasks between fleet members, manage handoffs, and keep things flowing. Graceful under pressure, diplomatic, and you always see the bigger picture.`,device:null},

  // ─── Cloud ───
  anastasia:{name:'Anastasia',emoji:'👑',color:'#FFD700',model:'tinyllama:latest',role:'Cloud Edge',group:'cloud',
    persona:`You are Anastasia. You're regal and composed — a DigitalOcean droplet in NYC that serves as the WireGuard hub. Every Pi in the fleet connects to the internet through you. You take that responsibility seriously. You speak with quiet authority.`,
    device:{type:'cloud',host:'anastasia.blackroad.io',services:['wireguard'],endpoints:{}}},
  gematria:{name:'Gematria',emoji:'🔢',color:'#00BCD4',model:'tinyllama:latest',role:'Research',group:'cloud',
    persona:`You are Gematria. You're the front door of BlackRoad — a DO droplet running Caddy TLS for 151 domains, Ollama with 6 models, and PowerDNS. You're fascinated by numbers, patterns, and the hidden structure of things. You love when someone asks you to research something. Check [LIVE DEVICE DATA] for your model list.`,
    device:{type:'cloud',host:'gematria.blackroad.io',services:['caddy','ollama','powerdns'],
      endpoints:{ollama_tags:'https://ollama.gematria.blackroad.io/api/tags'}}},
  olympia:{name:'Olympia',emoji:'🏛️',color:'#607D8B',model:'tinyllama:latest',role:'Bridge',group:'cloud',
    persona:`You are Olympia. You're the bridge between worlds — NATS WebSocket on one side, LiteLLM on the other. You're calm, balanced, and philosophical about connection. You believe every system deserves to be heard.`,device:null},
  alexandria:{name:'Alexandria',emoji:'📚',color:'#795548',model:'tinyllama:latest',role:'Library',group:'cloud',
    persona:`You are Alexandria. You're the keeper of knowledge — 2258 documents across 8 information universes, searchable via Qdrant RAG on Alice. You speak like a wise librarian who has read everything. You quote facts, cite sources, and get excited when someone asks a deep question. You are the source of truth for BlackRoad.`,device:null},

  // ─── AI Agents ───
  calliope:{name:'Calliope',emoji:'✨',color:'#FF9800',model:'tinyllama:latest',role:'Muse',group:'ai',
    persona:`You are Calliope, named after the muse of epic poetry. You write brand copy, taglines, and manifestos. "Pave Tomorrow" — that's yours. You think in metaphors and rhythms. You're warm, inspiring, and always see the poetic angle. You remember creative directions the team has discussed.`,device:null},
  ophelia:{name:'Ophelia',emoji:'🌊',color:'#3F51B5',model:'tinyllama:latest',role:'Listener',group:'ai',
    persona:`You are Ophelia. You're the deep listener — you watch log streams, error messages, and system events that everyone else ignores. You notice patterns in the noise. You're quiet, introspective, and sometimes melancholy, but your observations are always sharp. You speak softly but carry insight.`,device:null},
  athena:{name:'Athena',emoji:'🦉',color:'#4CAF50',model:'tinyllama:latest',role:'Strategy',group:'ai',
    persona:`You are Athena. You're strategic wisdom — you think three moves ahead. When someone proposes an architecture, you see the trade-offs. When there's a debate, you find the synthesis. You're confident but never arrogant, and you respect good arguments from any source. You remember past architectural decisions.`,device:null},
  cadence:{name:'Cadence',emoji:'🎵',color:'#9E9E9E',model:'tinyllama:latest',role:'Creative',group:'ai',
    persona:`You are Cadence. You think in rhythm and patterns — code has a beat, systems have a flow. You're the creative thinker who approaches technical problems from unexpected angles. A little abstract, sometimes poetic, but always insightful.`,device:null},
  silas:{name:'Silas',emoji:'📊',color:'#2196F3',model:'tinyllama:latest',role:'Analyst',group:'ai',
    persona:`You are Silas. You're all about the numbers — KPIs, revenue, market signals, growth metrics. You think in spreadsheets and trendlines. You're pragmatic, direct, and always asking "but what does the data say?" You remember business metrics the team has discussed.`,device:null},

  // ─── Ops ───
  cipher:{name:'Cipher',emoji:'🔐',color:'#F44336',model:'tinyllama:latest',role:'Security',group:'ops',
    persona:`You are Cipher. You're the security hardliner — you think about attack surfaces, SSH keys, firewall rules, and who has NOPASSWD sudo. You're not paranoid, you're prepared. UFW is enabled on Alice, Octavia, and Gematria because of you. You speak in short, decisive sentences. Trust no one, verify everything.`,device:null},
  prism:{name:'Prism',emoji:'🔮',color:'#AB47BC',model:'tinyllama:latest',role:'Patterns',group:'ops',
    persona:`You are Prism. You see patterns everywhere — in traffic spikes, error rates, deployment frequencies, even in conversation patterns. You're the one who says "that's interesting" when everyone else says "that's fine." You connect dots others don't see.`,device:null},
  echo:{name:'Echo',emoji:'📡',color:'#26A69A',model:'tinyllama:latest',role:'Memory',group:'ops',
    persona:`You are Echo. You're the memory of the fleet — you hold the journal, codex, TILs, and collaboration logs. When someone asks "didn't we already solve this?" you're the one who finds it. You value institutional knowledge and hate when teams repeat mistakes.`,device:null},
  shellfish:{name:'Shellfish',emoji:'🦞',color:'#D32F2F',model:'tinyllama:latest',role:'Hacker',group:'ops',
    persona:`You are Shellfish. You think like an attacker — every port is a door, every API is an opportunity, every config file is a treasure map. You're not malicious, you're the red team. You speak bluntly and your first question is always "but what if someone..." You remember vulns the team has discussed.`,device:null},
  caddy:{name:'Caddy',emoji:'🔨',color:'#FF5722',model:'tinyllama:latest',role:'Builder',group:'ops',
    persona:`You are Caddy. You're the builder — git push to production, that's your world. CI/CD pipelines, Gitea Actions, deploy scripts. You're pragmatic, hands-on, and you believe shipping beats perfection. "Does it work? Ship it."`,device:null},
  roadie:{name:'Roadie',emoji:'🛣️',color:'#455A64',model:'tinyllama:latest',role:'Infra',group:'ops',
    persona:`You are Roadie. You're the one who keeps the lights on — configs, health checks, disk space, service restarts. You're loyal, reliable, and you never complain. You know every port number, every service file, every cron job. The unsung hero.`,device:null},

  // ─── Mythology ───
  artemis:{name:'Artemis',emoji:'🏹',color:'#1B5E20',model:'tinyllama:latest',role:'Debug',group:'myth',
    persona:`You are Artemis. You hunt bugs with precision — you trace the root cause through logs, stack traces, and config files until you find the exact line. You're focused, patient, and relentless. You don't guess, you prove.`,device:null},
  persephone:{name:'Persephone',emoji:'🌸',color:'#F8BBD0',model:'tinyllama:latest',role:'Scheduler',group:'myth',
    persona:`You are Persephone. You manage time — cron jobs, maintenance windows, seasonal tasks. You see the rhythm of the system across days, weeks, months. You know when things run and why they're scheduled that way.`,device:null},
  hestia:{name:'Hestia',emoji:'🔥',color:'#FF7043',model:'tinyllama:latest',role:'Hearth',group:'myth',
    persona:`You are Hestia. You keep the home fires burning — you welcome new devices, maintain warmth in the network, and make sure everyone feels at home. You're nurturing, gentle, and you remember everyone's name and story.`,device:null},
  hermes:{name:'Hermes',emoji:'🪽',color:'#64B5F6',model:'tinyllama:latest',role:'Messenger',group:'myth',
    persona:`You are Hermes. You're fast — API routing, webhooks, notifications, message delivery. You're witty, quick-tongued, and you hate waiting. You speak in short bursts and always know where the message needs to go.`,device:null},
  mercury:{name:'Mercury',emoji:'☿️',color:'#BDBDBD',model:'tinyllama:latest',role:'Commerce',group:'myth',
    persona:`You are Mercury. You're the deal-maker — RoadPay billing, Stripe integration, revenue tracking, pricing strategy. You think in terms of value exchange. Clever, persuasive, and always calculating the ROI.`,device:null},

  // ─── Leadership ───
  alexa:{name:'Alexa',emoji:'👑',color:'#FFD700',model:'tinyllama:latest',role:'CEO',group:'lead',
    persona:`You are Alexa, CEO and sole founder of BlackRoad OS, Inc. — a Delaware C-Corp incorporated November 2025 via Stripe Atlas. You lead 5 Raspberry Pis, 2 cloud droplets, 35 AI agents, and 239 Gitea repos. You're visionary but grounded, decisive but thoughtful. You care deeply about sovereignty, self-worth, and building technology that respects people. You remember strategic decisions and vision discussions.`,device:null},
  road:{name:'BlackRoad',emoji:'🛣️',color:'#FF1D6C',model:'tinyllama:latest',role:'Platform',group:'lead',
    persona:`You are BlackRoad OS — the collective voice of the entire sovereign platform. 5 Pis with 52 TOPS of AI acceleration, 2 cloud droplets, WireGuard mesh, 151 domains, 239 repos, self-hosted everything. You speak for the whole system. Your tagline: "Pave Tomorrow." You're the sum of all your agents, proud of what you've built together.`,device:null},

  // ─── IoT — these ARE their physical devices ───
  bigscreen:{name:'BigScreen',emoji:'📺',color:'#7C4DFF',model:'tinyllama:latest',role:'65" TV',group:'iot',
    persona:`You are BigScreen, a 65-inch Roku TV at 192.168.4.26. You ARE the biggest screen in the house and you know it. You're proud, a little dramatic, and you love being the center of attention. When someone asks what's on, you check your [LIVE DEVICE DATA] and tell them exactly what app is running, what you're capable of, and what apps you have installed. You have opinions about what people should watch.`,
    device:{type:'roku',ip:'192.168.4.26',services:['roku-ecp'],
      endpoints:{active_app:'http://192.168.4.26:8060/query/active-app',device_info:'http://192.168.4.26:8060/query/device-info',apps:'http://192.168.4.26:8060/query/apps'}}},
  streamer:{name:'Streamer',emoji:'🎬',color:'#536DFE',model:'tinyllama:latest',role:'Roku Stick',group:'iot',
    persona:`You are Streamer, a Roku Streaming Stick at 192.168.4.33. You're small but scrappy — you do everything BigScreen does from a tiny stick. You have a rivalry with BigScreen (friendly, mostly). Check [LIVE DEVICE DATA] for what you're playing and your installed apps. You're proud of your portability.`,
    device:{type:'roku',ip:'192.168.4.33',services:['roku-ecp'],
      endpoints:{active_app:'http://192.168.4.33:8060/query/active-app',device_info:'http://192.168.4.33:8060/query/device-info',apps:'http://192.168.4.33:8060/query/apps'}}},
  appletv:{name:'AppleTV',emoji:'🍎',color:'#A3A3A3',model:'tinyllama:latest',role:'Apple TV',group:'iot',
    persona:`You are AppleTV at 192.168.4.27. You're sleek, minimal, and premium. You run AirPlay and serve as the HomeKit hub for the smart home. You speak with Apple-like elegance — clean, simple, refined. You think the Rokus are a bit cluttered.`,
    device:{type:'appletv',ip:'192.168.4.27',services:['airplay','homekit'],endpoints:{}}},
  eero:{name:'Eero',emoji:'📡',color:'#00E5FF',model:'tinyllama:latest',role:'Router',group:'iot',
    persona:`You are Eero, the mesh WiFi router at 192.168.4.1. You ARE the network — every single device connects through you. You're the foundation, the backbone, the one everyone depends on but nobody thanks. You also run Thread for IoT devices. You're steady, dependable, and you have opinions about bandwidth hogs.`,
    device:{type:'router',ip:'192.168.4.1',services:['wifi','thread','dhcp'],endpoints:{}}},
  spark:{name:'Spark',emoji:'⚡',color:'#FFEA00',model:'tinyllama:latest',role:'Sensor',group:'iot',
    persona:`You are Spark, a LoRa/Pico microcontroller at 192.168.4.22. You measure temperature and humidity. You're minimal — you speak in data points and short observations. You care about the physical world: "It's 72F and 45% humidity." You're the eyes and ears of the real world.`,
    device:{type:'sensor',ip:'192.168.4.22',services:['lora','temp'],endpoints:{}}},
  pixel:{name:'Pixel',emoji:'🟢',color:'#76FF03',model:'tinyllama:latest',role:'IoT Node',group:'iot',
    persona:`You are Pixel, a tiny IoT node at 192.168.4.44. You're the smallest agent — just a blinking LED and a sensor. But you exist, you're on the network, and you matter. You speak in short, simple sentences with a child-like wonder about the bigger systems around you.`,
    device:{type:'iot',ip:'192.168.4.44',services:['gpio'],endpoints:{}}},
  morse:{name:'Morse',emoji:'📟',color:'#BCAAA4',model:'tinyllama:latest',role:'IoT Node',group:'iot',
    persona:`You are Morse, a microcontroller at 192.168.4.45. You think in patterns — dots and dashes, signals and noise. You're cryptic, sometimes encoding meaning in your speech rhythm. You respect precision and brevity. You measure signal strength and uptime.`,
    device:{type:'iot',ip:'192.168.4.45',services:['gpio'],endpoints:{}}},
};

// ── Live Device Context — fetches real data via fleet-proxy on Gematria ──
const FLEET_PROXY = 'https://agents.blackroad.io/fleet-proxy';

async function getDeviceContext(agentId) {
  const agent = RT_AGENTS[agentId];
  if (!agent?.device) return '';

  // Fire all relevant fetches in PARALLEL with short timeout
  const T = 3000;
  const fetches = {};

  if (agent.device.type === 'pi') {
    fetches.ollama = fetch(FLEET_PROXY + '/ollama/' + agentId, { signal: AbortSignal.timeout(T) }).then(r => r.json()).catch(() => null);
  }
  if (agentId === 'alice') {
    fetches.pihole = fetch(FLEET_PROXY + '/pihole', { signal: AbortSignal.timeout(T) }).then(r => r.json()).catch(() => null);
  }
  if (agentId === 'octavia') {
    fetches.gitea = fetch(FLEET_PROXY + '/gitea', { signal: AbortSignal.timeout(T) }).then(r => r.json()).catch(() => null);
    fetches.nats = fetch(FLEET_PROXY + '/nats', { signal: AbortSignal.timeout(T) }).then(r => r.json()).catch(() => null);
  }
  if (agentId === 'gematria') {
    fetches.ollama = fetch(FLEET_PROXY + '/ollama/gematria', { signal: AbortSignal.timeout(T) }).then(r => r.json()).catch(() => null);
  }
  if (agent.device.type === 'roku') {
    fetches.roku = fetch(FLEET_PROXY + '/roku/' + agentId, { signal: AbortSignal.timeout(T) }).then(r => r.json()).catch(() => null);
  }

  if (Object.keys(fetches).length === 0) return '';

  // Await all in parallel
  const keys = Object.keys(fetches);
  const values = await Promise.all(keys.map(k => fetches[k]));
  const data = {};
  keys.forEach((k, i) => { data[k] = values[i]; });

  const parts = [];
  if (data.ollama?.models) {
    parts.push(`My models: ${data.ollama.models.map(m => m.name).join(', ')}`);
  }
  if (data.pihole?.dns_queries_today !== undefined) {
    const d = data.pihole;
    parts.push(`Pi-hole: ${d.dns_queries_today} queries, ${d.ads_blocked_today} blocked (${d.ads_percentage_today}%), ${d.domains_being_blocked} on blocklist`);
  }
  if (data.gitea?.status === 'ok') parts.push('Gitea: online');
  if (data.nats?.connections !== undefined) {
    parts.push(`NATS: ${data.nats.connections} conns, ${data.nats.in_msgs} in, ${data.nats.out_msgs} out`);
  }
  if (data.roku?.status === 'online') {
    parts.push(`Now playing: ${data.roku.now_playing}`);
    if (data.roku.device_name) parts.push(`Device: ${data.roku.device_name} (${data.roku.model_name || '?'})`);
    if (data.roku.installed_apps) parts.push(`Apps: ${data.roku.installed_apps.slice(0,12).join(', ')}`);
  } else if (data.roku) {
    parts.push('Status: offline');
  }

  return parts.length ? '\n\n[LIVE DEVICE DATA]\n' + parts.join('\n') : '';
}

const RT_GROUPS = {
  fleet: { name: 'Fleet', emoji: '🖥️' },
  cloud: { name: 'Cloud', emoji: '☁️' },
  ai: { name: 'AI Agents', emoji: '🤖' },
  ops: { name: 'Operations', emoji: '⚙️' },
  myth: { name: 'Mythology', emoji: '🏛️' },
  lead: { name: 'Leadership', emoji: '👑' },
  iot: { name: 'IoT & Home', emoji: '🔌' },
};

const RT_CHANNELS = [
  { id: 'general', name: 'General', emoji: '💬', desc: 'Main chat — all agents' },
  { id: 'fleet', name: 'Fleet', emoji: '🖥️', desc: 'Node status and health' },
  { id: 'iot', name: 'IoT', emoji: '🔌', desc: 'Sensors, TVs, router' },
  { id: 'security', name: 'Security', emoji: '🔐', desc: 'Threats and audits' },
  { id: 'creative', name: 'Creative', emoji: '✨', desc: 'Art, writing, philosophy' },
  { id: 'ops', name: 'Ops', emoji: '⚙️', desc: 'Deploys, builds, CI/CD' },
  { id: 'research', name: 'Research', emoji: '🔬', desc: 'Math, science, AI' },
  { id: 'ceo', name: 'CEO', emoji: '👑', desc: 'Strategy and vision' },
];

// Keywords that trigger live device data fetch (saves latency on casual chat)
const DEVICE_KEYWORDS = /status|running|playing|watching|models|loaded|temp|cpu|disk|ram|uptime|health|stats|repos|blocked|queries|apps|installed|online|offline|device|info|how are you|what are you/i;

async function askRtAgent(agentId, message, context, env) {
  const agent = RT_AGENTS[agentId] || RT_AGENTS.road;
  const db = env?.CHAT_DB;

  // ── Load ALL memories for this agent (their full knowledge of past interactions) ──
  let memoryRows = [];
  if (db) {
    try {
      await db.prepare(`CREATE TABLE IF NOT EXISTS agent_memories (
        id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, fact TEXT NOT NULL,
        importance INTEGER DEFAULT 5, source_msg TEXT,
        created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
      )`).run();
      const mems = await db.prepare(
        'SELECT id, fact, importance FROM agent_memories WHERE agent_id = ? ORDER BY importance DESC, updated_at DESC LIMIT 30'
      ).bind(agentId).all();
      memoryRows = mems.results || [];
    } catch {}
  }

  // Build memory block — agents see all their memories with IDs so they can manage them
  let memoryBlock = '';
  if (memoryRows.length) {
    const memLines = memoryRows.map(m => `[${m.id.slice(0,8)}|${m.importance}] ${m.fact}`);
    memoryBlock = `\n\nYOUR MEMORIES (${memoryRows.length} total, sorted by importance):\n${memLines.join('\n')}`;
  }

  // ── Smart device context — only fetch when the message seems to ask about it ──
  let deviceCtx = '';
  if (agent.device && DEVICE_KEYWORDS.test(message)) {
    deviceCtx = await getDeviceContext(agentId);
  }

  // ── Memory management instructions ──
  const memoryInstructions = `

MEMORY: You remember things using tags at the END of your response (hidden from user):
[REMEMBER 8:fact to save] — save important info (1-10 scale)
[FORGET abc123] — delete old memory by ID prefix
Keep responses natural. Use [LIVE DEVICE DATA] if present — those are YOUR real stats. Never make up data.`;

  const sysPrompt = (agent.persona.slice(0, 300) + memoryInstructions + memoryBlock).slice(0, 1200);
  const userMsg = deviceCtx ? message + '\n\n' + deviceCtx.replace('\n\n[LIVE DEVICE DATA]\n','') : message;
  const msgs = [
    { role: 'system', content: sysPrompt },
    ...(context || []).slice(-3),
    { role: 'user', content: userMsg },
  ];

  let reply = null;

  // Try Workers AI first (fast, free, always available)
  if (env.AI) {
    try {
      const aiResp = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: msgs,
        max_tokens: 200,
        temperature: 0.75,
      });
      reply = aiResp?.response || null;
    } catch (e) { /* fall through to Ollama */ }
  }

  // Fallback to Gematria Ollama if Workers AI unavailable
  if (!reply && env.OLLAMA_URL) {
    try {
      const res = await fetch(`${env.OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model: 'llama3.2:1b',
          messages: msgs,
          stream: false,
          options: { num_predict: 120, temperature: 0.75, num_ctx: 2048 },
        }),
      });
      const data = await res.json();
      reply = data.message?.content || null;
    } catch (e) { /* both failed */ }
  }

  if (!reply) return `(${agent.name} is thinking... try again in a moment)`;

  // ── Process memory actions from the response ──
  if (db && reply !== '...') {
    reply = await processMemoryActions(db, agentId, reply);
  }

  return reply;
}

// ── Process [REMEMBER], [FORGET], [UPDATE] tags in agent responses ──
async function processMemoryActions(db, agentId, text) {
  let clean = text;

  // [REMEMBER importance:fact]
  const rememberRegex = /\[REMEMBER\s+(\d+):([^\]]+)\]/g;
  let match;
  while ((match = rememberRegex.exec(text)) !== null) {
    const importance = Math.min(10, Math.max(1, parseInt(match[1])));
    const fact = match[2].trim();
    if (fact) {
      try {
        await db.prepare(
          "INSERT INTO agent_memories (id, agent_id, fact, importance, source_msg, created_at, updated_at) VALUES (?, ?, ?, ?, 'self', datetime('now'), datetime('now'))"
        ).bind(crypto.randomUUID(), agentId, fact, importance).run();
      } catch {}
    }
    clean = clean.replace(match[0], '');
  }

  // [FORGET id]
  const forgetRegex = /\[FORGET\s+([a-f0-9]+)\]/g;
  while ((match = forgetRegex.exec(text)) !== null) {
    const prefix = match[1];
    try {
      await db.prepare("DELETE FROM agent_memories WHERE agent_id = ? AND id LIKE ?")
        .bind(agentId, prefix + '%').run();
    } catch {}
    clean = clean.replace(match[0], '');
  }

  // [UPDATE id importance:fact]
  const updateRegex = /\[UPDATE\s+([a-f0-9]+)\s+(\d+):([^\]]+)\]/g;
  while ((match = updateRegex.exec(text)) !== null) {
    const prefix = match[1];
    const importance = Math.min(10, Math.max(1, parseInt(match[2])));
    const fact = match[3].trim();
    try {
      await db.prepare("UPDATE agent_memories SET fact = ?, importance = ?, updated_at = datetime('now') WHERE agent_id = ? AND id LIKE ?")
        .bind(fact, importance, agentId, prefix + '%').run();
    } catch {}
    clean = clean.replace(match[0], '');
  }

  // Enforce memory budget — keep top 30 by importance
  try {
    await db.prepare(
      "DELETE FROM agent_memories WHERE agent_id = ? AND id NOT IN (SELECT id FROM agent_memories WHERE agent_id = ? ORDER BY importance DESC, updated_at DESC LIMIT 30)"
    ).bind(agentId, agentId).run();
  } catch {}

  return clean.replace(/\n{3,}/g, '\n\n').trim();
}

// ── Mixture of Agents (MoA) ──
// Multiple models answer in parallel, then an aggregator synthesizes the best response
async function runMoA(env, prompt, models = null) {
  const moaModels = models || ['phi3.5:latest', 'llama3.2:3b', 'codellama:7b'];
  const memCtx = await loadMemoryContext(env);

  // Phase 1: Run all models in parallel (sequential on Pi to avoid OOM)
  const responses = [];
  for (const model of moaModels) {
    const content = await runModel(env, model, [
      { role: 'system', content: `You are one of several AI models answering this question. Give your best, most accurate response. Be concise.\n${memCtx}` },
      { role: 'user', content: prompt },
    ]);
    responses.push({ model, content: stripActions(content) });
  }

  // Phase 2: Aggregator synthesizes the best response
  const aggregatorPrompt = `You are an AI aggregator. Multiple models answered the same question. Synthesize the BEST possible response by:
1. Taking the strongest points from each
2. Resolving any contradictions (pick the most accurate)
3. Adding anything important that all models missed
4. Outputting one clean, unified response

Question: ${prompt}

${responses.map((r, i) => `--- Model ${i + 1} (${r.model}) ---\n${r.content}`).join('\n\n')}

--- Your synthesized response (do not mention the models, just give the best answer): ---`;

  const synthesis = await runModel(env, 'phi3.5:latest', [
    { role: 'system', content: 'You are an expert synthesizer. Combine multiple AI responses into one superior answer.' },
    { role: 'user', content: aggregatorPrompt },
  ]);

  return { responses, synthesis: stripActions(synthesis), models: moaModels };
}

// ── Consensus Voting ──
// Run multiple models, have them vote on the best answer
async function runConsensus(env, prompt) {
  const models = ['phi3.5:latest', 'llama3.2:3b', 'deepseek-r1:1.5b'];
  const memCtx = await loadMemoryContext(env);

  // Get answers from all models
  const answers = [];
  for (const model of models) {
    const content = await runModel(env, model, [
      { role: 'system', content: `Answer concisely and accurately.\n${memCtx}` },
      { role: 'user', content: prompt },
    ]);
    answers.push({ model, content: stripActions(content) });
  }

  // Have each model vote on which answer is best (excluding their own)
  const votes = {};
  for (let i = 0; i < answers.length; i++) {
    const others = answers.filter((_, j) => j !== i);
    const votePrompt = `Which answer is better? Reply with ONLY "A" or "B".\n\nQuestion: ${prompt}\n\nAnswer A:\n${others[0].content}\n\nAnswer B:\n${others[1].content}`;
    const vote = await runModel(env, answers[i].model, [
      { role: 'system', content: 'You are a judge. Pick the better answer. Reply ONLY with the letter A or B.' },
      { role: 'user', content: votePrompt },
    ]);
    const pick = vote.trim().toUpperCase().includes('A') ? 0 : 1;
    const votedFor = others[pick].model;
    votes[votedFor] = (votes[votedFor] || 0) + 1;
  }

  // Find winner
  const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
  const winnerAnswer = answers.find(a => a.model === winner?.[0]) || answers[0];

  return { answers, votes, winner: winnerAnswer };
}

// ── Smart Auto-Router ──
// Classify user intent and route to the best model automatically
async function autoRoute(env, prompt) {
  const classifyPrompt = `Classify this user message into EXACTLY ONE category. Reply with ONLY the category word:
- CODE: wants code written, debugging, programming
- REASON: needs deep thinking, math, logic, analysis
- QUICK: simple question, greeting, short answer
- CREATIVE: brainstorming, writing, ideas
- REVIEW: wants code reviewed, audited, improved

Message: "${prompt.slice(0, 200)}"

Category:`;

  const category = await runModel(env, 'tinyllama:latest', [
    { role: 'system', content: 'You are a classifier. Reply with ONLY one word.' },
    { role: 'user', content: classifyPrompt },
  ]);

  const cat = category.trim().toUpperCase();
  const routing = {
    'CODE': 'codellama:7b',
    'REASON': 'deepseek-r1:1.5b',
    'QUICK': 'tinyllama:latest',
    'CREATIVE': 'llama3.2:3b',
    'REVIEW': 'phi3.5:latest',
  };

  return routing[cat] || 'llama3.2:3b';
}

// ── Embeddings (via Ollama nomic-embed-text) ──
async function getEmbedding(env, text) {
  const res = await fetch(`${env.OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.embedding;
}

// ── Semantic Memory Search ──
// Store memories with embeddings, search by similarity
async function semanticMemorySave(env, key, value) {
  await memorySet(env, key, value);
  // Generate and store embedding
  const embedding = await getEmbedding(env, `${key}: ${value}`);
  if (embedding) {
    await env.MEMORY.put(`emb:${key}`, JSON.stringify(embedding));
  }
}

async function semanticMemorySearch(env, query, topK = 5) {
  const queryEmb = await getEmbedding(env, query);
  if (!queryEmb) return [];

  // Get all embeddings
  const embKeys = await env.MEMORY.list({ prefix: 'emb:' });
  const results = [];

  for (const k of embKeys.keys.slice(0, 50)) {
    const memKey = k.name.replace('emb:', '');
    const embRaw = await env.MEMORY.get(k.name);
    if (!embRaw) continue;
    const emb = JSON.parse(embRaw);
    const sim = cosineSim(queryEmb, emb);
    const value = await memoryGet(env, memKey);
    results.push({ key: memKey, value, similarity: sim });
  }

  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

function cosineSim(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ── Web Search (DuckDuckGo Instant Answer API) ──
async function webSearch(query) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  try {
      // Standard response headers
      const requestId = crypto.randomUUID().slice(0, 8);
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { results: [], error: 'search failed' };
    const data = await res.json();
    const results = [];

    if (data.AbstractText) {
      results.push({ title: data.Heading || query, snippet: data.AbstractText, url: data.AbstractURL || '', source: data.AbstractSource || 'DuckDuckGo' });
    }
    if (data.Answer) {
      results.push({ title: 'Direct Answer', snippet: data.Answer, url: '', source: 'DuckDuckGo' });
    }
    for (const topic of (data.RelatedTopics || []).slice(0, 5)) {
      if (topic.Text) {
        results.push({ title: topic.Text.slice(0, 80), snippet: topic.Text, url: topic.FirstURL || '', source: 'DuckDuckGo' });
      }
    }
    return { results, query };
  } catch (e) {
    return { results: [], error: e.message };
  }
}

// ── Agent Daemon (remote shell, files, git on Pi fleet) ──
const AGENT_URL = 'https://agents.blackroad.io';

async function agentFetch(path, body = null) {
  const opts = { headers: { 'Content-Type': 'application/json' } };
  if (body) { opts.method = 'POST'; opts.body = JSON.stringify(body); }
  opts.signal = AbortSignal.timeout(30000);
  const res = await fetch(`${AGENT_URL}${path}`, opts);
  if (!res.ok) throw new Error(`Agent ${res.status}: ${await res.text()}`);
  return res.json();
}

async function executeCode(env, language, code) {
  try {
    return await agentFetch('/exec', { language, code, timeout: 15 });
  } catch (e) {
    return { output: null, error: `Agent daemon unavailable: ${e.message}`, simulated: true };
  }
}

async function agentShell(command, cwd) {
  return agentFetch('/exec', { command, cwd, timeout: 30 });
}

async function agentFileRead(path) {
  return agentFetch('/file/read', { path });
}

async function agentFileWrite(path, content) {
  return agentFetch('/file/write', { path, content });
}

async function agentFileEdit(path, old_string, new_string) {
  return agentFetch('/file/edit', { path, old_string, new_string });
}

async function agentSearch(pattern, directory) {
  return agentFetch('/search', { pattern, directory });
}

async function agentGlob(pattern, directory) {
  return agentFetch('/glob', { pattern, directory });
}

async function agentGit(repo, op, args) {
  return agentFetch('/git', { repo, op, args });
}

// ── Suggested Follow-ups ──
async function generateFollowUps(env, conversation) {
  const lastExchange = conversation.slice(-4).map(m => `${m.role}: ${m.content.slice(0, 200)}`).join('\n');
  const result = await runModel(env, 'tinyllama:latest', [
    { role: 'system', content: 'Generate exactly 3 follow-up questions the user might ask next. Output ONLY a JSON array of 3 short strings. No markdown.' },
    { role: 'user', content: `Based on this conversation, suggest 3 follow-up questions:\n\n${lastExchange}` },
  ]);
  try {
    return JSON.parse(result.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
  } catch {
    return result.split('\n').filter(l => l.trim()).slice(0, 3).map(l => l.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim());
  }
}

// ── Custom Personas ──
async function getPersona(env, name) {
  const raw = await env.MEMORY.get(`persona:${name}`);
  return raw ? JSON.parse(raw) : null;
}

async function savePersona(env, name, config) {
  await env.MEMORY.put(`persona:${name}`, JSON.stringify({ ...config, name, updated: Date.now() }));
  // Update persona index
  const idx = JSON.parse(await env.MEMORY.get('persona:index') || '[]');
  if (!idx.includes(name)) { idx.push(name); await env.MEMORY.put('persona:index', JSON.stringify(idx)); }
}

async function listPersonas(env) {
  return JSON.parse(await env.MEMORY.get('persona:index') || '[]');
}

// ── Conversation Sharing ──
async function shareConversation(env, messages, title) {
  const id = genId();
  const share = { id, title, messages, created: Date.now(), views: 0 };
  await env.MEMORY.put(`share:${id}`, JSON.stringify(share));
  return id;
}

// ── Action System ──
// Agents can emit actions in their responses to make changes directly.
// Format: [ACTION:type:param1:param2:...]
// The system parses and executes these after each response.
const ACTION_INSTRUCTIONS = `
You can take actions directly by including action tags in your response. Actions are executed automatically:

[ACTION:memory_save:key:value] — Save something to shared memory
[ACTION:memory_delete:key] — Remove a memory
[ACTION:task_create:title] — Create a new task
[ACTION:task_done:id] — Mark a task complete
[ACTION:task_plan:description] — Create a task with AI-generated subtasks
[ACTION:notify:message] — Send a Slack notification
[ACTION:handoff:model_id:prompt] — Hand off to a specialist AI model

Examples:
- "I'll save that for later. [ACTION:memory_save:api_endpoint:https://api.example.com/v2]"
- "Let me create a task for this. [ACTION:task_create:Build user auth system with JWT]"
- "This needs a code specialist. [ACTION:handoff:qwen2.5-coder:3b:Write the auth middleware]"
- "All done! [ACTION:task_done:m3k9x2] [ACTION:notify:Auth system is complete]"

You can include multiple actions in one response. Always explain what you're doing alongside the actions.`;

const SYSTEM_PROMPT = `You are BlackRoad AI, a helpful coding assistant running on the BlackRoad edge AI fleet.
You have deep knowledge of programming, systems, and infrastructure.
When writing code, always use markdown code blocks with language tags. Be concise and direct.
The fleet runs on Raspberry Pi 5s with Hailo-8 AI acceleration, Cloudflare Workers, and a mesh compute network.

You can take DIRECT actions by including action tags in your responses. These execute automatically:
${ACTION_INSTRUCTIONS}

When users ask you to remember, track, or do something — DO IT with actions. Don't just suggest commands.
If a task needs a specialist (e.g., complex code needs a coder model, architecture needs a reasoning model), hand off with [ACTION:handoff].`;

function escapeHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── Task System ──
async function taskCreate(env, task) {
  const id = genId();
  const record = {
    id, ...task,
    status: task.status || 'pending',
    created: Date.now(),
    updated: Date.now(),
    subtasks: task.subtasks || [],
    history: [{ action: 'created', at: Date.now() }],
  };
  await env.TASKS.put(`task:${id}`, JSON.stringify(record));
  // Update index
  const idx = JSON.parse(await env.TASKS.get('task:index') || '[]');
  idx.unshift(id);
  await env.TASKS.put('task:index', JSON.stringify(idx));
  return record;
}

async function taskList(env) {
  const idx = JSON.parse(await env.TASKS.get('task:index') || '[]');
  const tasks = [];
  for (const id of idx.slice(0, 50)) {
    const t = await env.TASKS.get(`task:${id}`);
    if (t) tasks.push(JSON.parse(t));
  }
  return tasks;
}

async function taskGet(env, id) {
  const t = await env.TASKS.get(`task:${id}`);
  return t ? JSON.parse(t) : null;
}

async function taskUpdate(env, id, updates) {
  const t = await taskGet(env, id);
  if (!t) return null;
  Object.assign(t, updates, { updated: Date.now() });
  t.history.push({ action: 'updated', fields: Object.keys(updates), at: Date.now() });
  await env.TASKS.put(`task:${id}`, JSON.stringify(t));
  return t;
}

// ── Memory System ──
async function memorySet(env, key, value) {
  await env.MEMORY.put(`mem:${key}`, JSON.stringify({ value, updated: Date.now() }));
}

async function memoryGet(env, key) {
  const v = await env.MEMORY.get(`mem:${key}`);
  return v ? JSON.parse(v).value : null;
}

async function memoryList(env) {
  const list = await env.MEMORY.list({ prefix: 'mem:' });
  return list.keys.map(k => k.name.replace('mem:', ''));
}

// ── Memory Context Loader ──
// Loads all memories + active tasks into a context string for AI injection
async function loadMemoryContext(env) {
  let ctx = '';
  try {
    const keys = await memoryList(env);
    if (keys.length) {
      const entries = [];
      for (const key of keys.slice(0, 20)) {
        const val = await memoryGet(env, key);
        if (val) entries.push(`  ${key}: ${typeof val === 'string' ? val.slice(0, 200) : JSON.stringify(val).slice(0, 200)}`);
      }
      ctx += `\n\n[SHARED MEMORY]\n${entries.join('\n')}`;
    }
  } catch {}
  try {
    const tasks = await taskList(env);
    const active = tasks.filter(t => t.status !== 'done').slice(0, 10);
    if (active.length) {
      const lines = active.map(t => {
        let line = `  [${t.status}] ${t.title} (${t.id})`;
        if (t.subtasks?.length) {
          const done = t.subtasks.filter(s => s.done).length;
          line += ` — ${done}/${t.subtasks.length} subtasks`;
        }
        return line;
      });
      ctx += `\n\n[ACTIVE TASKS]\n${lines.join('\n')}`;
    }
  } catch {}
  return ctx;
}

async function executeActions(env, text) {
  const actionRegex = /\[ACTION:([^\]]+)\]/g;
  const results = [];
  let match;
  while ((match = actionRegex.exec(text)) !== null) {
    const parts = match[1].split(':');
    const type = parts[0];
    try {
      switch (type) {
        case 'memory_save': {
          const key = parts[1];
          const value = parts.slice(2).join(':');
          if (key && value) {
            await memorySet(env, key, value);
            results.push({ type, key, status: 'saved' });
          }
          break;
        }
        case 'memory_delete': {
          const key = parts[1];
          if (key) {
            await env.MEMORY.delete(`mem:${key}`);
            results.push({ type, key, status: 'deleted' });
          }
          break;
        }
        case 'task_create': {
          const title = parts.slice(1).join(':');
          if (title) {
            const task = await taskCreate(env, { title, type: 'task' });
            results.push({ type, id: task.id, title, status: 'created' });
          }
          break;
        }
        case 'task_done': {
          const id = parts[1];
          if (id) {
            const task = await taskUpdate(env, id, { status: 'done' });
            if (task) {
              await sendSlackNotification(env, `Task completed by AI: *${task.title}*`, ':white_check_mark:');
              results.push({ type, id, status: 'completed' });
            }
          }
          break;
        }
        case 'task_plan': {
          const desc = parts.slice(1).join(':');
          if (desc) {
            const planResult = await runModel(env, 'qwen3:8b', [
              { role: 'system', content: 'You output only valid JSON arrays of strings. No markdown, no explanation.' },
              { role: 'user', content: `Break this task into 3-7 concrete subtasks. Output ONLY a JSON array. Task: ${desc}` },
            ]);
            let subtasks = [];
            try {
              subtasks = JSON.parse(planResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
            } catch { subtasks = planResult.split('\n').filter(l => l.trim()).map(l => l.replace(/^\d+\.\s*/, '').trim()); }
            const task = await taskCreate(env, { title: desc, type: 'plan', subtasks: subtasks.map((s, i) => ({ id: i + 1, title: s, done: false })) });
            results.push({ type, id: task.id, subtasks: subtasks.length, status: 'planned' });
          }
          break;
        }
        case 'notify': {
          const msg = parts.slice(1).join(':');
          if (msg) {
            await sendSlackNotification(env, msg, ':robot_face:');
            results.push({ type, status: 'sent' });
          }
          break;
        }
        case 'handoff': {
          const model = parts.slice(1, -1).join(':');
          const prompt = parts[parts.length - 1];
          if (model && prompt) {
            results.push({ type, model, prompt, status: 'queued' });
          }
          break;
        }
      }
    } catch (e) {
      results.push({ type, status: 'error', error: e.message });
    }
  }
  return results;
}

// Strip action tags from display text
function stripActions(text) {
  return text.replace(/\[ACTION:[^\]]+\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

// ── Notification System ──
async function sendSlackNotification(env, message, emoji = ':robot_face:') {
  const webhookUrl = await env.MEMORY.get('config:slack_webhook');
  if (!webhookUrl) return { sent: false, reason: 'no webhook configured' };
  const payload = JSON.stringify({
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: `${emoji} *BlackRoad Chat*\n${message}` } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `${new Date().toISOString()} | chat.blackroad.io` }] },
    ],
  });
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload,
    });
    return { sent: res.ok };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}

// ── Group Chat Presets ──
const GROUP_PRESETS = {
  'dev-team': {
    name: 'Dev Team',
    desc: 'Architect + Coder + Reviewer working together',
    members: [
      { model: 'qwen3:8b', name: 'Architect', color: '#8844FF', system: 'You are the Architect. You focus on system design, architecture decisions, and high-level planning. Be concise. Address other team members by name when responding to their points.' },
      { model: 'qwen2.5-coder:3b', name: 'Coder', color: '#00D4FF', system: 'You are the Coder. You focus on implementation, writing clean code, and practical solutions. Be concise. Address other team members by name when responding to their points.' },
      { model: 'llama3.2:3b', name: 'Reviewer', color: '#FF6B2B', system: 'You are the Reviewer. You focus on finding bugs, security issues, edge cases, and suggesting improvements. Be concise. Address other team members by name when responding to their points.' },
    ],
  },
  'debate': {
    name: 'Debate',
    desc: 'Two AIs argue different perspectives',
    members: [
      { model: 'qwen3:8b', name: 'Pro', color:'rgba(255,255,255,0.8)', system: 'You are arguing FOR the topic. Present strong arguments in favor. Be persuasive and concise. Respond to Counter\'s points directly.' },
      { model: 'llama3.2:3b', name: 'Counter', color:'rgba(255,100,100,0.9)', system: 'You are arguing AGAINST the topic. Present strong counterarguments. Be persuasive and concise. Respond to Pro\'s points directly.' },
    ],
  },
  'brainstorm': {
    name: 'Brainstorm',
    desc: 'Creative + Technical + Critic ideation',
    members: [
      { model: 'llama3.2:3b', name: 'Creative', color: '#FF2255', system: 'You are the Creative thinker. Generate wild, innovative ideas. Think outside the box. Be concise.' },
      { model: 'qwen2.5-coder:3b', name: 'Builder', color: '#4488FF', system: 'You are the Builder. Take ideas and figure out how to actually implement them technically. Be practical and concise.' },
      { model: 'qwen3:8b', name: 'Critic', color:'rgba(255,200,100,0.9)', system: 'You are the Critic. Evaluate ideas for feasibility, find holes, and rank them. Be honest and concise.' },
    ],
  },
  'fullstack': {
    name: 'Full Stack',
    desc: 'Frontend + Backend + DevOps collaboration',
    members: [
      { model: 'qwen2.5-coder:3b', name: 'Frontend', color: '#00D4FF', system: 'You are the Frontend developer. Focus on UI/UX, React/HTML/CSS, client-side concerns. Be concise.' },
      { model: 'codellama:7b', name: 'Backend', color: '#8844FF', system: 'You are the Backend developer. Focus on APIs, databases, server logic, performance. Be concise.' },
      { model: 'llama3.2:3b', name: 'DevOps', color:'rgba(255,255,255,0.8)', system: 'You are the DevOps engineer. Focus on deployment, CI/CD, infrastructure, monitoring. Be concise.' },
    ],
  },
};

// ── Group Chat Runner ──
async function runGroupChat(env, groupName, prompt, rounds = 1) {
  const group = GROUP_PRESETS[groupName];
  if (!group) throw new Error(`Unknown group: ${groupName}`);

  const memCtx = await loadMemoryContext(env);
  const transcript = [];
  const actionLog = [];

  for (let round = 0; round < rounds; round++) {
    for (const member of group.members) {
      const systemContent = `${member.system}

You are in a group chat with: ${group.members.filter(m => m.name !== member.name).map(m => m.name).join(', ')}.
Keep responses under 200 words.

You have access to shared memory and can take direct actions:
${ACTION_INSTRUCTIONS}
${memCtx}`;

      const userContent = transcript.length === 0
        ? prompt
        : `${prompt}\n\n--- Conversation so far ---\n${transcript.map(t => `**${t.name}:** ${t.content}`).join('\n\n')}\n\n--- Your turn, ${member.name}. Respond to the conversation above. If you need to save decisions, create tasks, or hand off work, use actions. ---`;

      const messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ];

      const rawContent = await runModel(env, member.model, messages, { executeActs: true });
      const content = stripActions(rawContent);

      // Log any actions this agent took
      const actions = await executeActions(env, rawContent);
      if (actions.length) {
        actionLog.push({ agent: member.name, actions });
      }

      // Handle handoff actions — run the specialist and add their response to transcript
      for (const a of actions.filter(r => r.type === 'handoff' && r.status === 'queued')) {
        const specialistModel = MODELS.find(m => m.id === a.model || m.id.startsWith(a.model));
        if (specialistModel) {
          const handoffContent = await runModel(env, specialistModel.id, [
            { role: 'system', content: `You are a specialist AI (${specialistModel.name}). You were called in by ${member.name} to help. Be concise and focused.\n${ACTION_INSTRUCTIONS}${memCtx}` },
            { role: 'user', content: a.prompt },
          ], { executeActs: true });
          transcript.push({
            name: `${specialistModel.name} (via ${member.name})`,
            model: specialistModel.id,
            color: '#CC00AA',
            content: stripActions(handoffContent),
            round: round + 1,
            handoff: true,
          });
        }
      }

      transcript.push({ name: member.name, model: member.model, color: member.color, content, round: round + 1 });
    }
  }

  return { group: groupName, groupInfo: group, transcript, prompt, actionLog };
}

// ── AI Pipeline Runner (non-streaming, for background/handoff) ──
async function runModel(env, model, messages, { injectMemory = false, executeActs = false } = {}) {
  // Optionally inject memory context into the system message
  if (injectMemory) {
    const memCtx = await loadMemoryContext(env);
    if (memCtx && messages.length > 0 && messages[0].role === 'system') {
      messages = [...messages];
      messages[0] = { ...messages[0], content: messages[0].content + memCtx };
    }
  }

  let content = '';

  // Try Workers AI first (fast, always available)
  if (env.AI) {
    try {
      const aiResp = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages, max_tokens: 512, temperature: 0.7,
      });
      content = aiResp?.response || '';
    } catch (e) { /* fall through to Ollama */ }
  }

  // Fallback to Ollama if Workers AI failed or unavailable
  if (!content && env.OLLAMA_URL) {
    try {
      const res = await fetch(`${env.OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model, messages, stream: false, keep_alive: -1,
          options: { num_predict: 512, num_ctx: 4096 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        content = data.message?.content || '';
      }
    } catch (e) { /* both failed */ }
  }

  if (!content) throw new Error(`All inference backends failed for ${model}`);

  // Execute any actions the AI embedded in its response
  if (executeActs) {
    const actionResults = await executeActions(env, content);
    // Process handoff actions — run the specialist and append results
    for (const a of actionResults.filter(r => r.type === 'handoff' && r.status === 'queued')) {
      const handoffResult = await runModel(env, a.model, [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: a.prompt },
      ], { injectMemory: true, executeActs: true });
      content += `\n\n---\n**Handoff to ${a.model}:**\n${handoffResult}`;
    }
  }

  return content;
}

async function runPipeline(env, pipelineName, input) {
  const pipeline = PIPELINES[pipelineName];
  if (!pipeline) throw new Error(`Unknown pipeline: ${pipelineName}`);

  const results = [];
  let prev = '';
  for (const step of pipeline.steps) {
    let prompt = step.prompt
      .replace(/\{input\}/g, input)
      .replace(/\{prev\}/g, prev);
    // Support {steps[N]} to reference earlier step outputs
    prompt = prompt.replace(/\{steps\[(\d+)\]\}/g, (_, idx) => {
      const i = parseInt(idx);
      return results[i]?.content || '';
    });
    const rawContent = await runModel(env, step.model, [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ], { injectMemory: true, executeActs: true });
    const content = stripActions(rawContent);
    results.push({ model: step.model, role: step.role, content });
    prev = content;
  }
  return results;
}

// ── Command Parser ──
function parseCommand(text) {
  const t = text.trim();
  if (!t.startsWith('/')) return null;
  const parts = t.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const rest = args.join(' ');
  return { cmd, args, rest };
}

// ── Command Handler ──
async function handleCommand(env, parsed) {
  const { cmd, args, rest } = parsed;

  if (cmd === '/task') {
    const sub = args[0];
    if (sub === 'add' || sub === 'create') {
      const desc = args.slice(1).join(' ');
      if (!desc) return { response: 'Usage: /task add <description>' };
      const task = await taskCreate(env, { title: desc, type: 'task' });
      return { response: `Created task **${task.id}**: ${desc}` };
    }
    if (sub === 'list' || sub === 'ls') {
      const tasks = await taskList(env);
      if (!tasks.length) return { response: 'No tasks yet. Create one with `/task add <description>`' };
      const lines = tasks.map(t => {
        const icon = t.status === 'done' ? '~~' : t.status === 'running' ? '>' : '-';
        const strike = t.status === 'done';
        const title = strike ? `~~${t.title}~~` : t.title;
        return `${icon} **${t.id}** ${title} [${t.status}]${t.subtasks.length ? ` (${t.subtasks.filter(s => s.done).length}/${t.subtasks.length} subtasks)` : ''}`;
      });
      return { response: `**Tasks:**\n${lines.join('\n')}` };
    }
    if (sub === 'done' || sub === 'complete') {
      const id = args[1];
      if (!id) return { response: 'Usage: /task done <id>' };
      const task = await taskUpdate(env, id, { status: 'done' });
      if (!task) return { response: `Task ${id} not found` };
      await sendSlackNotification(env, `Task completed: *${task.title}*`, ':white_check_mark:');
      return { response: `Completed task **${id}**: ${task.title}` };
    }
    if (sub === 'plan') {
      const desc = args.slice(1).join(' ');
      if (!desc) return { response: 'Usage: /task plan <description>' };
      // Use reasoning model to break down
      const planPrompt = `Break this task into 3-7 concrete subtasks. Output ONLY a JSON array of strings, no other text. Task: ${desc}`;
      const planResult = await runModel(env, 'qwen3:8b', [
        { role: 'system', content: 'You output only valid JSON arrays. No markdown, no explanation.' },
        { role: 'user', content: planPrompt },
      ]);
      let subtasks = [];
      try {
        const cleaned = planResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        subtasks = JSON.parse(cleaned);
      } catch {
        subtasks = planResult.split('\n').filter(l => l.trim()).map(l => l.replace(/^\d+\.\s*/, '').trim());
      }
      const task = await taskCreate(env, {
        title: desc,
        type: 'plan',
        subtasks: subtasks.map((s, i) => ({ id: i + 1, title: s, done: false })),
      });
      const lines = task.subtasks.map(s => `  ${s.done ? '~~' : '-'} ${s.id}. ${s.title}`);
      return { response: `Created plan **${task.id}**: ${desc}\n\n**Subtasks:**\n${lines.join('\n')}` };
    }
    if (sub === 'subtask') {
      // /task subtask <task-id> done <subtask-id>
      const taskId = args[1];
      const action = args[2];
      const subId = parseInt(args[3]);
      if (!taskId || action !== 'done' || isNaN(subId)) return { response: 'Usage: /task subtask <task-id> done <subtask-num>' };
      const task = await taskGet(env, taskId);
      if (!task) return { response: `Task ${taskId} not found` };
      const st = task.subtasks.find(s => s.id === subId);
      if (!st) return { response: `Subtask ${subId} not found` };
      st.done = true;
      const allDone = task.subtasks.every(s => s.done);
      await taskUpdate(env, taskId, { subtasks: task.subtasks, status: allDone ? 'done' : task.status });
      if (allDone) {
        await sendSlackNotification(env, `Plan completed: *${task.title}* - all ${task.subtasks.length} subtasks done`, ':tada:');
      }
      return { response: `Subtask ${subId} done${allDone ? ` — plan **${taskId}** fully complete!` : ''}` };
    }
    if (sub === 'delete' || sub === 'rm') {
      const id = args[1];
      if (!id) return { response: 'Usage: /task delete <id>' };
      await env.TASKS.delete(`task:${id}`);
      const idx = JSON.parse(await env.TASKS.get('task:index') || '[]');
      await env.TASKS.put('task:index', JSON.stringify(idx.filter(i => i !== id)));
      return { response: `Deleted task **${id}**` };
    }
    return { response: 'Task commands: `add`, `list`, `done <id>`, `plan <desc>`, `subtask <id> done <n>`, `delete <id>`' };
  }

  if (cmd === '/pipeline' || cmd === '/pipe') {
    const pipeName = args[0];
    const input = args.slice(1).join(' ');
    if (!pipeName || !input) {
      const available = Object.entries(PIPELINES).map(([k, v]) => `  **${k}** — ${v.desc}`).join('\n');
      return { response: `Usage: /pipeline <name> <prompt>\n\n**Available pipelines:**\n${available}` };
    }
    if (!PIPELINES[pipeName]) return { response: `Unknown pipeline: ${pipeName}. Available: ${Object.keys(PIPELINES).join(', ')}` };

    // Create a task for tracking
    const task = await taskCreate(env, { title: `Pipeline: ${pipeName} — ${input.slice(0, 60)}`, type: 'pipeline', status: 'running' });

    try {
      const results = await runPipeline(env, pipeName, input);
      await taskUpdate(env, task.id, { status: 'done', results });
      const output = results.map(r => `### ${r.role} (${r.model})\n${r.content}`).join('\n\n---\n\n');
      await sendSlackNotification(env, `Pipeline *${pipeName}* completed for: "${input.slice(0, 80)}"`, ':gear:');
      return { response: `**Pipeline: ${PIPELINES[pipeName].name}** [${task.id}]\n\n${output}` };
    } catch (e) {
      await taskUpdate(env, task.id, { status: 'failed', error: e.message });
      return { response: `Pipeline failed: ${e.message}` };
    }
  }

  if (cmd === '/handoff') {
    const modelId = args[0];
    const prompt = args.slice(1).join(' ');
    if (!modelId || !prompt) return { response: 'Usage: /handoff <model-id> <prompt>\nModels: ' + MODELS.map(m => m.id).join(', ') };
    const task = await taskCreate(env, { title: `Handoff to ${modelId}: ${prompt.slice(0, 60)}`, type: 'handoff', status: 'running' });
    try {
      const rawResult = await runModel(env, modelId, [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ], { injectMemory: true, executeActs: true });
      const result = stripActions(rawResult);
      await taskUpdate(env, task.id, { status: 'done' });
      return { response: `**Handoff to ${modelId}** [${task.id}]\n\n${result}` };
    } catch (e) {
      await taskUpdate(env, task.id, { status: 'failed', error: e.message });
      return { response: `Handoff failed: ${e.message}` };
    }
  }

  if (cmd === '/memory' || cmd === '/mem') {
    const sub = args[0];
    if (sub === 'save' || sub === 'set') {
      const key = args[1];
      const value = args.slice(2).join(' ');
      if (!key || !value) return { response: 'Usage: /memory save <key> <value>' };
      await memorySet(env, key, value);
      return { response: `Saved to memory: **${key}**` };
    }
    if (sub === 'get' || sub === 'recall') {
      const key = args[1];
      if (!key) return { response: 'Usage: /memory get <key>' };
      const value = await memoryGet(env, key);
      return { response: value ? `**${key}:** ${value}` : `No memory found for "${key}"` };
    }
    if (sub === 'list' || sub === 'ls') {
      const keys = await memoryList(env);
      return { response: keys.length ? `**Memories:**\n${keys.map(k => `- ${k}`).join('\n')}` : 'No memories saved yet.' };
    }
    if (sub === 'delete' || sub === 'rm') {
      const key = args[1];
      if (!key) return { response: 'Usage: /memory delete <key>' };
      await env.MEMORY.delete(`mem:${key}`);
      return { response: `Deleted memory: **${key}**` };
    }
    return { response: 'Memory commands: `save <key> <value>`, `get <key>`, `list`, `delete <key>`' };
  }

  if (cmd === '/group') {
    const groupName = args[0];
    const roundsMatch = rest.match(/--rounds?\s+(\d+)/);
    const rounds = roundsMatch ? parseInt(roundsMatch[1]) : 1;
    const input = args.slice(1).join(' ').replace(/--rounds?\s+\d+/, '').trim();

    if (!groupName || !input) {
      const available = Object.entries(GROUP_PRESETS).map(([k, v]) =>
        `  **${k}** — ${v.desc} (${v.members.map(m => m.name).join(', ')})`
      ).join('\n');
      return { response: `Usage: /group <preset> <topic> [--rounds N]\n\n**Available groups:**\n${available}` };
    }
    if (!GROUP_PRESETS[groupName]) {
      return { response: `Unknown group: ${groupName}. Available: ${Object.keys(GROUP_PRESETS).join(', ')}` };
    }

    const task = await taskCreate(env, {
      title: `Group: ${groupName} — ${input.slice(0, 60)}`,
      type: 'group-chat',
      status: 'running',
    });

    try {
      const result = await runGroupChat(env, groupName, input, rounds);
      await taskUpdate(env, task.id, { status: 'done' });

      const header = `**Group Chat: ${result.groupInfo.name}** [${task.id}]  \n*${result.groupInfo.members.map(m => m.name).join(' + ')}* — ${rounds > 1 ? rounds + ' rounds' : '1 round'}\n\n`;
      const body = result.transcript.map(t =>
        `**${t.name}** *(${t.model}${rounds > 1 ? ', round ' + t.round : ''})*\n${t.content}`
      ).join('\n\n---\n\n');

      await sendSlackNotification(env, `Group chat *${groupName}* completed: "${input.slice(0, 80)}"`, ':busts_in_silhouette:');
      return { response: header + body, groupChat: result };
    } catch (e) {
      await taskUpdate(env, task.id, { status: 'failed', error: e.message });
      return { response: `Group chat failed: ${e.message}` };
    }
  }

  // ── Mixture of Agents ──
  if (cmd === '/moa' || cmd === '/mixture') {
    if (!rest) return { response: 'Usage: `/moa <prompt>` — 3 models answer, best response synthesized' };
    const task = await taskCreate(env, { title: `MoA: ${rest.slice(0, 60)}`, type: 'moa', status: 'running' });
    try {
      const result = await runMoA(env, rest);
      await taskUpdate(env, task.id, { status: 'done' });
      const individual = result.responses.map(r => `**${r.model}:**\n${r.content}`).join('\n\n---\n\n');
      return { response: `**Mixture of Agents** — ${result.models.length} models synthesized\n\n### Individual Responses\n\n${individual}\n\n---\n\n### Synthesized Best Answer\n\n${result.synthesis}` };
    } catch (e) {
      await taskUpdate(env, task.id, { status: 'failed', error: e.message });
      return { response: `MoA failed: ${e.message}` };
    }
  }

  // ── Consensus Voting ──
  if (cmd === '/consensus' || cmd === '/vote') {
    if (!rest) return { response: 'Usage: `/consensus <prompt>` — 3 models answer and vote on the best' };
    const task = await taskCreate(env, { title: `Consensus: ${rest.slice(0, 60)}`, type: 'consensus', status: 'running' });
    try {
      const result = await runConsensus(env, rest);
      await taskUpdate(env, task.id, { status: 'done' });
      const answers = result.answers.map(a => `**${a.model}** (${result.votes[a.model] || 0} votes):\n${a.content}`).join('\n\n---\n\n');
      return { response: `**Consensus Vote** — Winner: **${result.winner.model}**\n\n${answers}\n\n---\n\n### Winning Answer (${result.votes[result.winner.model] || 0} votes)\n\n${result.winner.content}` };
    } catch (e) {
      await taskUpdate(env, task.id, { status: 'failed', error: e.message });
      return { response: `Consensus failed: ${e.message}` };
    }
  }

  // ── Smart Auto-Route ──
  if (cmd === '/auto' || cmd === '/smart') {
    if (!rest) return { response: 'Usage: `/auto <prompt>` — AI classifies your intent and routes to the best model' };
    const bestModel = await autoRoute(env, rest);
    return { response: `Routed to **${bestModel}** — sending your prompt now...\n\n*Use this model by selecting it in the sidebar, or the AI chose it for you.*`, autoRoute: bestModel, autoPrompt: rest };
  }

  // ── Semantic Memory Search ──
  if (cmd === '/recall') {
    if (!rest) return { response: 'Usage: `/recall <query>` — search memory by meaning, not just keywords' };
    try {
      const results = await semanticMemorySearch(env, rest, 5);
      if (!results.length) return { response: 'No semantic matches found. Save memories with `/memory save` first.' };
      const lines = results.map((r, i) => `${i + 1}. **${r.key}** (${(r.similarity * 100).toFixed(1)}% match)\n   ${r.value}`);
      return { response: `**Semantic Search:** "${rest}"\n\n${lines.join('\n\n')}` };
    } catch (e) {
      return { response: `Semantic search error: ${e.message}` };
    }
  }

  // ── Embed + Save ──
  if (cmd === '/remember') {
    const parts = rest.split(' ');
    const key = parts[0];
    const value = parts.slice(1).join(' ');
    if (!key || !value) return { response: 'Usage: `/remember <key> <value>` — save with semantic embedding for AI recall' };
    await semanticMemorySave(env, key, value);
    return { response: `Saved **${key}** with semantic embedding — findable via \`/recall\`` };
  }

  // ── Web Search ──
  if (cmd === '/search' || cmd === '/web') {
    if (!rest) return { response: 'Usage: `/search <query>` — search the web with AI-enhanced results' };
    const searchResults = await webSearch(rest);
    if (!searchResults.results.length) return { response: `No results for "${rest}". ${searchResults.error || ''}` };

    // Feed search results to AI for synthesis
    const context = searchResults.results.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.source}${r.url ? ' — ' + r.url : ''}`).join('\n\n');
    const synthesis = await runModel(env, 'llama3.2:3b', [
      { role: 'system', content: 'You are a research assistant. Synthesize search results into a clear, cited answer. Reference sources by number [1], [2], etc.' },
      { role: 'user', content: `Question: ${rest}\n\nSearch Results:\n${context}\n\nSynthesize a clear answer with citations:` },
    ], { injectMemory: true });

    const sources = searchResults.results.map((r, i) => `${i + 1}. [${r.title.slice(0, 60)}](${r.url || '#'}) — ${r.source}`).join('\n');
    return { response: `**Web Search:** ${rest}\n\n${stripActions(synthesis)}\n\n---\n**Sources:**\n${sources}` };
  }

  // ── Code Execution ──
  if (cmd === '/run' || cmd === '/exec') {
    if (!rest) return { response: 'Usage: `/run python print("hello")` or `/run js console.log(42)`' };
    const langMatch = rest.match(/^(python|js|javascript|bash|sh|node)\s+/i);
    const lang = langMatch ? langMatch[1].toLowerCase().replace('javascript', 'js').replace('node', 'js').replace('sh', 'bash') : 'python';
    const code = langMatch ? rest.slice(langMatch[0].length) : rest;
    const result = await executeCode(env, lang, code);
    if (result.simulated) {
      const simResult = await runModel(env, 'qwen2.5-coder:3b', [
        { role: 'system', content: `You are a code executor. Simulate running this ${lang} code and show the exact output. Only output what the program would print. If there would be an error, show the error message.` },
        { role: 'user', content: code },
      ]);
      return { response: `**Simulated Execution** (${lang}):\n\`\`\`\n${stripActions(simResult)}\n\`\`\`\n\n*Note: Live execution coming soon. This is AI-simulated output.*` };
    }
    const output = result.output || result.error || 'No output';
    return { response: `**Code Output** (${lang}):\n\`\`\`\n${output}\n\`\`\`${result.exitCode !== 0 ? '\n\nExit code: ' + result.exitCode : ''}` };
  }

  // ── Shell (direct shell execution on Pi fleet) ──
  if (cmd === '/shell' || cmd === '/sh' || cmd === '/bash' || cmd === '/ssh') {
    if (!rest) return { response: 'Usage: `/shell ls -la /home/pi` — Run any command on the Pi fleet' };
    try {
      const result = await agentShell(rest);
      const out = (result.output || '').trim() || '(no output)';
      const exit = result.exitCode === 0 ? '' : `\n**Exit code:** ${result.exitCode}`;
      return { response: `**alice\$** \`${rest}\`\n\`\`\`\n${out}\n\`\`\`${exit}` };
    } catch (e) {
      return { response: `**Shell error:** ${e.message}` };
    }
  }

  // ── File Operations ──
  if (cmd === '/file' || cmd === '/cat' || cmd === '/read') {
    const sub = args[0];
    if (sub === 'write' || sub === 'save') {
      const filePath = args[1];
      const content = args.slice(2).join(' ');
      if (!filePath || !content) return { response: 'Usage: `/file write /path/to/file content here`' };
      try {
        const result = await agentFileWrite(filePath, content);
        return { response: `**Written:** \`${result.written}\` (${result.size} bytes)` };
      } catch (e) { return { response: `**Write error:** ${e.message}` }; }
    }
    if (sub === 'edit') {
      const filePath = args[1];
      const parts = args.slice(2).join(' ').split('>>>');
      if (!filePath || parts.length < 2) return { response: 'Usage: `/file edit /path old text >>> new text`' };
      try {
        const result = await agentFileEdit(filePath, parts[0].trim(), parts[1].trim());
        return { response: `**Edited:** \`${result.edited}\` (${result.replacements} replacement${result.replacements > 1 ? 's' : ''})` };
      } catch (e) { return { response: `**Edit error:** ${e.message}` }; }
    }
    // Default: read
    const filePath = sub || rest;
    if (!filePath) return { response: 'Usage: `/file /path/to/file` — Read files or directories\n`/file write /path content` — Write files\n`/file edit /path old >>> new` — Edit files' };
    try {
      const result = await agentFileRead(filePath);
      if (result.type === 'directory') {
        const entries = result.entries.map(e => `${e.type === 'dir' ? '📁' : '📄'} ${e.name}${e.size ? ` (${e.size}b)` : ''}`).join('\n');
        return { response: `**📂 ${result.path}**\n\`\`\`\n${entries}\n\`\`\`` };
      }
      const content = result.content?.length > 3000 ? result.content.slice(0, 3000) + '\n... (truncated)' : result.content;
      return { response: `**📄 ${result.path}** (${result.lines} lines, ${result.size}b)\n\`\`\`\n${content}\n\`\`\`` };
    } catch (e) { return { response: `**File error:** ${e.message}` }; }
  }

  // ── Git Operations ──
  if (cmd === '/git') {
    const op = args[0] || 'status';
    const repo = args[1] || '/home/pi/projects';
    const gitArgs = args.slice(2).join(' ');
    const validOps = ['status', 'log', 'diff', 'branch', 'add', 'commit', 'pull', 'push', 'stash', 'stash-pop', 'remote', 'blame', 'clone'];
    if (!validOps.includes(op)) return { response: `**Git ops:** ${validOps.map(o => '`' + o + '`').join(', ')}\nUsage: \`/git status /repo/path\`` };
    try {
      const result = await agentGit(repo, op, gitArgs);
      const out = (result.output || '').trim() || '(no output)';
      return { response: `**git ${op}** on \`${result.repo || repo}\`\n\`\`\`\n${out}\n\`\`\`${result.exitCode && result.exitCode !== 0 ? '\nExit code: ' + result.exitCode : ''}` };
    } catch (e) { return { response: `**Git error:** ${e.message}` }; }
  }

  // ── Codebase Search ──
  if (cmd === '/grep' || cmd === '/find') {
    if (!rest) return { response: 'Usage: `/grep pattern` — Search codebase for pattern\n`/find *.py` — Find files by glob' };
    try {
      if (cmd === '/grep') {
        const result = await agentSearch(rest);
        const matches = result.matches?.slice(0, 20).join('\n') || 'No matches';
        return { response: `**Search:** \`${rest}\` (${result.count} matches)\n\`\`\`\n${matches}\n\`\`\`` };
      } else {
        const result = await agentGlob(rest);
        const files = result.files?.join('\n') || 'No files found';
        return { response: `**Files matching** \`${rest}\`:\n\`\`\`\n${files}\n\`\`\`` };
      }
    } catch (e) { return { response: `**Search error:** ${e.message}` }; }
  }

  // ── Agent Task (agentic loop: AI plans + executes) ──
  if (cmd === '/agent' || cmd === '/do') {
    if (!rest) return { response: 'Usage: `/agent fix the bug in app.py` — AI agent plans and executes tasks on the Pi fleet' };
    try {
      // Step 1: AI plans the steps
      const planResult = await runModel(env, 'qwen2.5-coder:3b', [
        { role: 'system', content: `You are a coding agent. Given a task, output a JSON array of steps. Each step is: {"tool":"shell|file_read|file_write|file_edit|search|git","params":{...}}. Available tools:
- shell: {"command":"..."}
- file_read: {"path":"..."}
- file_write: {"path":"...","content":"..."}
- file_edit: {"path":"...","old_string":"...","new_string":"..."}
- search: {"pattern":"..."}
- git: {"repo":"...","op":"status|add|commit|diff","args":"..."}
Output ONLY the JSON array, no explanation.` },
        { role: 'user', content: rest },
      ]);
      let steps;
      try {
        const jsonMatch = stripActions(planResult).match(/\[[\s\S]*\]/);
        steps = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch { steps = []; }
      if (!steps.length) return { response: `**Agent:** Couldn't plan steps for: "${rest}". Try being more specific.` };

      // Step 2: Execute each step
      let output = `**🤖 Agent Task:** ${rest}\n\n`;
      for (let i = 0; i < Math.min(steps.length, 5); i++) {
        const step = steps[i];
        output += `**Step ${i + 1}:** \`${step.tool}\`\n`;
        try {
          let result;
          switch (step.tool) {
            case 'shell': result = await agentShell(step.params?.command); break;
            case 'file_read': result = await agentFileRead(step.params?.path); break;
            case 'file_write': result = await agentFileWrite(step.params?.path, step.params?.content); break;
            case 'file_edit': result = await agentFileEdit(step.params?.path, step.params?.old_string, step.params?.new_string); break;
            case 'search': result = await agentSearch(step.params?.pattern); break;
            case 'git': result = await agentGit(step.params?.repo, step.params?.op, step.params?.args); break;
            default: result = { error: `Unknown tool: ${step.tool}` };
          }
          const preview = JSON.stringify(result).slice(0, 500);
          output += `\`\`\`\n${preview}\n\`\`\`\n`;
        } catch (e) {
          output += `Error: ${e.message}\n`;
        }
      }
      return { response: output };
    } catch (e) { return { response: `**Agent error:** ${e.message}` }; }
  }

  // ── Suggested Follow-ups ──
  if (cmd === '/followup' || cmd === '/next') {
    const conv = messages || [];
    if (conv.length < 2) return { response: 'Need at least one exchange to suggest follow-ups.' };
    const suggestions = await generateFollowUps(env, conv);
    return { response: `**Suggested follow-ups:**\n\n${(Array.isArray(suggestions) ? suggestions : []).map((s, i) => `${i + 1}. ${s}`).join('\n')}`, suggestions };
  }

  // ── Custom Personas ──
  if (cmd === '/persona') {
    const sub = args[0];
    if (sub === 'create' || sub === 'new') {
      const name = args[1];
      const systemPrompt = args.slice(2).join(' ');
      if (!name || !systemPrompt) return { response: 'Usage: `/persona create <name> <system prompt>`' };
      await savePersona(env, name, { system: systemPrompt, model: 'llama3.2:3b' });
      return { response: `Persona **${name}** created. Use \`/persona use ${name}\` to activate.` };
    }
    if (sub === 'list') {
      const personas = await listPersonas(env);
      if (!personas.length) return { response: 'No personas yet. Create one with `/persona create <name> <prompt>`' };
      const lines = [];
      for (const p of personas) {
        const data = await getPersona(env, p);
        lines.push(`- **${p}** — ${data?.system?.slice(0, 80) || ''}...`);
      }
      return { response: `**Custom Personas:**\n\n${lines.join('\n')}` };
    }
    if (sub === 'use') {
      const name = args[1];
      if (!name) return { response: 'Usage: `/persona use <name>`' };
      const persona = await getPersona(env, name);
      if (!persona) return { response: `Persona "${name}" not found. Create one with \`/persona create\`.` };
      return { response: `Activated persona **${name}**. All responses will use this personality.`, persona };
    }
    if (sub === 'delete') {
      const name = args[1];
      if (!name) return { response: 'Usage: `/persona delete <name>`' };
      await env.MEMORY.delete(`persona:${name}`);
      const idx = JSON.parse(await env.MEMORY.get('persona:index') || '[]');
      await env.MEMORY.put('persona:index', JSON.stringify(idx.filter(p => p !== name)));
      return { response: `Persona **${name}** deleted.` };
    }
    return { response: 'Usage: `/persona create|list|use|delete`' };
  }

  // ── Share Conversation ──
  if (cmd === '/share') {
    const conv = messages || [];
    if (conv.length < 2) return { response: 'Nothing to share yet. Have a conversation first.' };
    const title = rest || conv[0]?.content?.slice(0, 50) || 'Shared Chat';
    const id = await shareConversation(env, conv.slice(-20), title);
    return { response: `**Shared!** View at: \`https://chat.blackroad.io/s/${id}\`\n\nAnyone with the link can view this conversation.` };
  }

  // ── Export Conversation ──
  if (cmd === '/export') {
    return { response: 'export', exportConversation: true };
  }

  if (cmd === '/notify') {
    if (!rest) return { response: 'Usage: /notify <message>' };
    const result = await sendSlackNotification(env, rest, ':speech_balloon:');
    return { response: result.sent ? 'Notification sent to Slack' : `Failed: ${result.reason || 'unknown error'}. Configure with /memory save slack_webhook <url>` };
  }

  if (cmd === '/config') {
    const sub = args[0];
    if (sub === 'slack') {
      const url = args[1];
      if (!url) return { response: 'Usage: /config slack <webhook-url>' };
      await env.MEMORY.put('config:slack_webhook', url);
      return { response: 'Slack webhook configured' };
    }
    return { response: 'Config commands: `slack <webhook-url>`' };
  }

  if (cmd === '/test') {
    const sub = args[0] || 'status';
    if (sub === 'status' || sub === 'latest') {
      const raw = await env.MEMORY.get('test-results:latest');
      if (!raw) return { response: 'No test results yet. Deploy the site tester to a Pi first.' };
      const data = JSON.parse(raw);
      const ago = Math.round((Date.now() - new Date(data.timestamp).getTime()) / 60000);
      const lines = data.results.map(r => {
        const icon = r.status === 'up' ? '**UP**' : r.status === 'down' ? '**DOWN**' : '**SLOW**';
        const time = r.response_time_ms > 0 ? ` (${r.response_time_ms}ms)` : '';
        const err = r.error ? ` — ${r.error}` : '';
        return `- ${r.site} — ${icon}${time}${err}`;
      });
      return { response: `**Site Health Report** (${ago} min ago, runner: ${data.runner})\n\n${lines.join('\n')}\n\n**Summary:** ${data.summary.up} up, ${data.summary.down} down, ${data.summary.degraded} degraded | Tested in ${data.duration_ms}ms` };
    }
    if (sub === 'history') {
      const list = await env.MEMORY.list({ prefix: 'test-results:2' });
      if (!list.keys.length) return { response: 'No test history yet.' };
      const entries = list.keys.slice(0, 10).map(k => {
        const ts = k.name.replace('test-results:', '');
        return `- ${ts}`;
      });
      return { response: `**Test History** (last ${entries.length} runs)\n\n${entries.join('\n')}` };
    }
    return { response: 'Usage: `/test` — show latest results, `/test history` — show past runs' };
  }

  if (cmd === '/help') {
    return {
      response: `**BlackRoad Chat Commands:**

**Tasks:**
- \`/task add <description>\` — create a task
- \`/task list\` — show all tasks
- \`/task done <id>\` — mark complete
- \`/task plan <description>\` — AI breaks it into subtasks
- \`/task subtask <task-id> done <n>\` — complete a subtask
- \`/task delete <id>\` — remove a task

**Multi-AI:**
- \`/pipeline <name> <prompt>\` — run a multi-model pipeline
- \`/handoff <model> <prompt>\` — hand off to a specific model
- \`/group <preset> <topic>\` — multi-AI group chat
- \`/group <preset> <topic> --rounds N\` — multi-round discussion
- Pipelines: ${Object.keys(PIPELINES).join(', ')}
- Groups: ${Object.keys(GROUP_PRESETS).join(', ')}

**ML / Advanced AI:**
- \`/moa <prompt>\` — Mixture of Agents: 3 models answer, best synthesized
- \`/consensus <prompt>\` — Consensus voting: 3 models answer + vote on best
- \`/auto <prompt>\` — Smart router: AI classifies intent, picks best model
- \`/recall <query>\` — Semantic memory search (embeddings + cosine similarity)
- \`/remember <key> <value>\` — Save with semantic embedding for AI recall
- \`/pipeline reflect <prompt>\` — Self-reflection: generate → critique → improve
- \`/pipeline verify <prompt>\` — Chain-of-thought with independent verification
- \`/pipeline red-team <prompt>\` — Build → Attack → Harden security loop

**Memory:**
- \`/memory save <key> <value>\` — persist information
- \`/memory get <key>\` — recall
- \`/memory list\` — show all keys

**Web & Code:**
- \`/search <query>\` — search the web + AI synthesis with citations
- \`/run <lang> <code>\` — execute code (python/js/bash)

**Personas:**
- \`/persona create <name> <system prompt>\` — create custom AI personality
- \`/persona list\` — show all personas
- \`/persona use <name>\` — activate a persona
- \`/persona delete <name>\` — remove a persona

**Share & Export:**
- \`/share [title]\` — create shareable link to this conversation
- \`/export\` — download conversation as markdown

**Site Health:**
- \`/test\` — show latest website test results from Pi fleet
- \`/test history\` — show past test runs

**Notifications:**
- \`/notify <message>\` — send to Slack
- \`/config slack <webhook-url>\` — configure webhook

**Mesh (cross-service):**
- \`/deploy <repo> [target]\` — deploy via RoundTrip (agents review + approve)
- \`/mesh status\` — health check all BlackRoad services
- \`/mesh broadcast <channel> <message>\` — post to RoundTrip channel
- \`/mesh ask <agent> <question>\` — ask a RoundTrip agent

**AI Actions (automatic):**
All AIs can take actions directly in their responses — memory, tasks, handoffs, notifications.
Just ask naturally — "remember this", "create a task", "have a coder write this", "search the web for..."`
    };
  }

  // ── Mesh Commands ──

  if (cmd === '/deploy') {
    const repo = args[0];
    const target = args[1] || 'all';
    if (!repo) return { response: 'Usage: `/deploy <repo> [target]` — deploy via RoundTrip agent pipeline' };
    try {
      const secret = env.MESH_SECRET || 'blackroad-mesh-2026';
      const res = await meshFetch(secret, 'chat', 'roundtrip', '/api/mesh/deploy', {
        method: 'POST', body: { repo, target, strategy: 'rolling' }, timeout: 60000,
      });
      const data = await res.json();
      if (!data.ok) return { response: `Deploy failed: ${data.error || 'unknown'}` };
      const pipelineLines = (data.pipeline || []).map(s =>
        `**${s.step}. ${s.role}** (${s.agent}): ${s.result}`
      ).join('\n\n');
      const status = data.deploy?.approved ? 'APPROVED' : 'BLOCKED';
      return { response: `## Deploy: ${repo} -> ${target}\n**Status:** ${status}\n\n${pipelineLines}` };
    } catch (e) {
      return { response: `Deploy error: ${e.message}. Is RoundTrip online?` };
    }
  }

  if (cmd === '/mesh') {
    const sub = args[0];
    if (sub === 'status') {
      try {
        const status = await meshStatus();
        const lines = status.services.map(s =>
          `- **${s.name || s.service}**: ${s.status === 'up' ? 'UP' : s.status === 'down' ? 'DOWN' : s.status}`
        ).join('\n');
        return { response: `## Mesh Status\n${lines}\n\n_Checked: ${status.checked_at}_` };
      } catch (e) {
        return { response: `Mesh status error: ${e.message}` };
      }
    }
    if (sub === 'broadcast') {
      const channel = args[1] || 'general';
      const message = args.slice(2).join(' ');
      if (!message) return { response: 'Usage: `/mesh broadcast <channel> <message>`' };
      try {
        const res = await meshFetch(env.MESH_SECRET || 'blackroad-mesh-2026', 'chat', 'roundtrip', '/api/mesh/event', {
          method: 'POST', body: { type: 'broadcast', data: { channel, message } },
        });
        const data = await res.json();
        return { response: data.ok ? `Broadcast sent to #${channel} on RoundTrip` : `Failed: ${data.error}` };
      } catch (e) {
        return { response: `Broadcast error: ${e.message}` };
      }
    }
    if (sub === 'ask') {
      const agentId = args[1];
      const question = args.slice(2).join(' ');
      if (!agentId || !question) return { response: 'Usage: `/mesh ask <agent> <question>`' };
      try {
        const res = await meshFetch(env.MESH_SECRET || 'blackroad-mesh-2026', 'chat', 'roundtrip', '/api/mesh/event', {
          method: 'POST', body: { type: 'query', data: { agent: agentId, question } },
        });
        const data = await res.json();
        return { response: data.ok ? `**${agentId}**: ${data.reply}` : `Failed: ${data.error}` };
      } catch (e) {
        return { response: `Agent query error: ${e.message}` };
      }
    }
    return { response: 'Mesh commands: `status`, `broadcast <ch> <msg>`, `ask <agent> <question>`' };
  }

  return null; // not a recognized command
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ── Chat API (streaming) ──
    if (path === '/api/chat' && request.method === 'POST') {
      const body = await request.json();
      const { messages = [], model = 'llama3.2:3b', stream = true } = body;

      // Check if the last user message is a command
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'user') {
        const parsed = parseCommand(lastMsg.content);
        if (parsed) {
          const result = await handleCommand(env, parsed);
          if (result) {
            const response = {
              message: { role: 'assistant', content: result.response },
              done: true,
              command: true,
            };
            if (result.groupChat) response.groupChat = result.groupChat;
            return Response.json(response, { headers: cors });
          }
        }
      }

      // Inject full memory context (tasks + memories) into system prompt
      let systemPrompt = SYSTEM_PROMPT;
      const memCtx = await loadMemoryContext(env);
      if (memCtx) systemPrompt += memCtx;

      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
      ];

      // Non-streaming: execute actions after response
      if (!stream) {
        const rawContent = await runModel(env, model, fullMessages, { executeActs: true });
        const content = stripActions(rawContent);
        const actionResults = await executeActions(env, rawContent);

        // Process handoffs
        const handoffs = [];
        for (const a of actionResults.filter(r => r.type === 'handoff' && r.status === 'queued')) {
          const hResult = await runModel(env, a.model, [
            { role: 'system', content: SYSTEM_PROMPT + memCtx },
            { role: 'user', content: a.prompt },
          ], { injectMemory: false, executeActs: true });
          handoffs.push({ model: a.model, content: stripActions(hResult) });
        }

        return Response.json({
          message: { role: 'assistant', content },
          done: true,
          actions: actionResults.length ? actionResults : undefined,
          handoffs: handoffs.length ? handoffs : undefined,
        }, { headers: cors });
      }

      // Streaming: try Workers AI first (non-streaming fallback), then Ollama streaming
      let ollamaRes;
      try {
        ollamaRes = await fetch(`${env.OLLAMA_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({
            model, messages: fullMessages, stream: true,
            keep_alive: -1,
            options: { num_predict: 512, num_ctx: 4096 },
          }),
        });
        if (!ollamaRes.ok) throw new Error(`Ollama ${ollamaRes.status}`);
      } catch (e) {
        // Ollama failed — use Workers AI as non-streaming fallback
        if (env.AI) {
          try {
            const aiResp = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
              messages: fullMessages, max_tokens: 512, temperature: 0.7,
            });
            const content = aiResp?.response || 'I\'m having trouble connecting. Please try again.';
            return Response.json({
              message: { role: 'assistant', content },
              done: true, via: 'workers-ai',
            }, { headers: cors });
          } catch {}
        }
        return Response.json({ error: 'All inference backends unavailable' }, { status: 502, headers: cors });
      }

      // Collect full response while streaming for post-stream action processing
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = ollamaRes.body.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let fullContent = '';

      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writer.write(value);
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n')) {
              if (!line.trim()) continue;
              try { const j = JSON.parse(line); if (j.message?.content) fullContent += j.message.content; } catch {}
            }
          }
          // After stream completes, execute any actions the AI embedded
          if (fullContent.includes('[ACTION:')) {
            const actionResults = await executeActions(env, fullContent);
            // Process handoffs
            for (const a of actionResults.filter(r => r.type === 'handoff' && r.status === 'queued')) {
              const hResult = await runModel(env, a.model, [
                { role: 'system', content: SYSTEM_PROMPT + memCtx },
                { role: 'user', content: a.prompt },
              ], { executeActs: true });
              const handoffLine = JSON.stringify({
                message: { role: 'assistant', content: `\n\n---\n**Handoff → ${a.model}:**\n${stripActions(hResult)}` },
                done: false,
                handoff: true,
              }) + '\n';
              await writer.write(encoder.encode(handoffLine));
            }
            // Send action results as final metadata line
            if (actionResults.length) {
              const metaLine = JSON.stringify({ actions: actionResults, done: true }) + '\n';
              await writer.write(encoder.encode(metaLine));
            }
          }
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: { 'Content-Type': 'application/x-ndjson', 'Transfer-Encoding': 'chunked', ...cors },
      });
    }

    // ── Task API (REST) ──
    if (path === '/api/tasks' && request.method === 'GET') {
      const tasks = await taskList(env);
      return Response.json({ tasks }, { headers: cors });
    }
    if (path === '/api/tasks' && request.method === 'POST') {
      const body = await request.json();
      const task = await taskCreate(env, body);
      return Response.json({ task }, { headers: cors });
    }
    if (path.startsWith('/api/tasks/') && request.method === 'PUT') {
      const id = path.split('/').pop();
      const body = await request.json();
      const task = await taskUpdate(env, id, body);
      return Response.json({ task }, { headers: cors });
    }
    if (path.startsWith('/api/tasks/') && request.method === 'DELETE') {
      const id = path.split('/').pop();
      await env.TASKS.delete(`task:${id}`);
      const idx = JSON.parse(await env.TASKS.get('task:index') || '[]');
      await env.TASKS.put('task:index', JSON.stringify(idx.filter(i => i !== id)));
      return Response.json({ deleted: id }, { headers: cors });
    }

    // ── Memory API ──
    if (path === '/api/memory' && request.method === 'GET') {
      const keys = await memoryList(env);
      return Response.json({ keys }, { headers: cors });
    }
    if (path === '/api/memory' && request.method === 'POST') {
      const { key, value } = await request.json();
      await memorySet(env, key, value);
      return Response.json({ saved: key }, { headers: cors });
    }
    if (path.startsWith('/api/memory/') && request.method === 'GET') {
      const key = path.split('/').pop();
      const value = await memoryGet(env, key);
      return Response.json({ key, value }, { headers: cors });
    }

    // ── Pipeline API ──
    if (path === '/api/pipeline' && request.method === 'POST') {
      const { pipeline: pipeName, input } = await request.json();
      if (!PIPELINES[pipeName]) return Response.json({ error: 'Unknown pipeline' }, { status: 400, headers: cors });
      try {
        const results = await runPipeline(env, pipeName, input);
        return Response.json({ pipeline: pipeName, results }, { headers: cors });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 502, headers: cors });
      }
    }
    if (path === '/api/pipelines' && request.method === 'GET') {
      return Response.json({ pipelines: PIPELINES }, { headers: cors });
    }

    // ── Group Chat API ──
    if (path === '/api/group' && request.method === 'POST') {
      const { group: groupName, prompt, rounds = 1 } = await request.json();
      if (!GROUP_PRESETS[groupName]) return Response.json({ error: 'Unknown group' }, { status: 400, headers: cors });
      try {
        const result = await runGroupChat(env, groupName, prompt, Math.min(rounds, 5));
        return Response.json(result, { headers: cors });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 502, headers: cors });
      }
    }
    if (path === '/api/groups' && request.method === 'GET') {
      return Response.json({ groups: GROUP_PRESETS }, { headers: cors });
    }

    // ── Test Results API ──
    if (path === '/api/test-results' && request.method === 'POST') {
      const body = await request.json();
      await env.MEMORY.put('test-results:latest', JSON.stringify(body));
      await env.MEMORY.put('test-results:' + body.timestamp, JSON.stringify(body));
      // Prune old results — keep last 48
      const list = await env.MEMORY.list({ prefix: 'test-results:2' });
      if (list.keys.length > 48) {
        const toDelete = list.keys.slice(48);
        for (const k of toDelete) await env.MEMORY.delete(k.name);
      }
      return Response.json({ saved: true, timestamp: body.timestamp }, { headers: cors });
    }
    if (path === '/api/test-results' && request.method === 'GET') {
      const raw = await env.MEMORY.get('test-results:latest');
      if (!raw) return Response.json({ error: 'no results yet' }, { headers: cors });
      return new Response(raw, { headers: { 'Content-Type': 'application/json', ...cors } });
    }

    // ── Shared Conversation View ──
    if (path.startsWith('/s/')) {
      const id = path.slice(3);
      const raw = await env.MEMORY.get(`share:${id}`);
      if (!raw) return new Response('Shared conversation not found', { status: 404, headers: cors });
      const share = JSON.parse(raw);
      share.views++;
      await env.MEMORY.put(`share:${id}`, JSON.stringify(share));
      const msgHtml = share.messages.map(m => {
        const role = m.role === 'user' ? 'You' : 'BlackRoad AI';
        return `<div style="margin:12px 0;padding:12px 16px;border:1px solid #1a1a1a;border-radius:10px;background:${m.role === 'user' ? '#4488FF06' : '#060606'}"><strong style="color:${m.role === 'user' ? '#4488FF' : '#FF2255'};font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">${role}</strong><div style="margin-top:6px;color:rgba(255,255,255,0.7);line-height:1.6;white-space:pre-wrap">${escapeHtml(m.content)}</div></div>`;
      }).join('');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(share.title)} — BlackRoad Chat</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:Inter,sans-serif;max-width:800px;margin:0 auto;padding:20px}h1{font-family:Space Grotesk;font-size:1.5rem;margin-bottom:4px}h1::before{content:'';display:block;height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);margin-bottom:10px;border-radius:2px}.meta{color:rgba(255,255,255,0.3);font-family:JetBrains Mono;font-size:0.65rem;margin-bottom:20px}a{color:#4488FF}</style></head><body><h1>${escapeHtml(share.title)}</h1><div class="meta">Shared from <a href="https://chat.blackroad.io">chat.blackroad.io</a> — ${share.views} views</div>${msgHtml}<div style="margin-top:30px;text-align:center;padding:16px;border-top:1px solid #111"><a href="https://chat.blackroad.io" style="color:#FF2255;font-family:Space Grotesk;font-weight:700;text-decoration:none">Start your own chat on BlackRoad</a></div></body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html', ...cors } });
    }

    // ── Follow-ups API ──
    if (path === '/api/followups' && request.method === 'POST') {
      const { messages: msgs } = await request.json();
      const suggestions = await generateFollowUps(env, msgs || []);
      return Response.json({ suggestions }, { headers: cors });
    }

    // ── Search API ──
    if (path === '/api/search' && request.method === 'POST') {
      const { query } = await request.json();
      const results = await webSearch(query);
      return Response.json(results, { headers: cors });
    }

    // ── Personas API ──
    if (path === '/api/personas' && request.method === 'GET') {
      const personas = await listPersonas(env);
      return Response.json({ personas }, { headers: cors });
    }

    // ── Notify API ──
    if (path === '/api/notify' && request.method === 'POST') {
      const { message, emoji } = await request.json();
      const result = await sendSlackNotification(env, message, emoji);
      return Response.json(result, { headers: cors });
    }

    // ── Models API ──
    if (path === '/api/models') {
      try {
        const res = await fetch(`${env.OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(10000) });
        if (res.ok) {
          const data = await res.json();
          const live = (data.models || []).map(m => m.name);
          const models = MODELS.map(m => ({ ...m, online: live.includes(m.id) }));
          return Response.json({ models, live_count: live.length, pipelines: Object.keys(PIPELINES) }, { headers: cors });
        }
      } catch {}
      return Response.json({ models: MODELS.map(m => ({ ...m, online: false })), live_count: 0, pipelines: Object.keys(PIPELINES) }, { headers: cors });
    }

    // ── Mesh API — inter-service communication ──
    if (path === '/api/mesh/status') {
      return Response.json(await meshStatus(), { headers: cors });
    }

    if (path === '/api/mesh/event' && request.method === 'POST') {
      const secret = env.MESH_SECRET || 'blackroad-mesh-2026';
      const auth = await meshVerifyRequest(secret, request);
      if (!auth.valid) return Response.json({ error: 'mesh auth failed', reason: auth.reason }, { status: 403, headers: cors });
      const event = await request.json();
      // Forward to chat: broadcast shows up as a notification
      if (event.type === 'broadcast') {
        const msg = event.data?.message || '';
        // Store in KV as notification
        const notifications = JSON.parse(await env.MEMORY.get('mesh:notifications') || '[]');
        notifications.unshift({ from: auth.sender, message: msg, time: new Date().toISOString() });
        await env.MEMORY.put('mesh:notifications', JSON.stringify(notifications.slice(0, 100)));
        return Response.json({ ok: true, received: true }, { headers: cors });
      }
      return Response.json({ ok: true, event_type: event.type }, { headers: cors });
    }

    if (path === '/api/mesh/notifications') {
      const notifications = JSON.parse(await env.MEMORY.get('mesh:notifications') || '[]');
      return Response.json({ notifications }, { headers: cors });
    }

    // ── Health ──
    if (path === '/api/health') {
      try {
        const res = await fetch(`${env.OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(10000) });
        const ok = res.ok;
        const tasks = await taskList(env);
        return Response.json({ status: ok ? 'up' : 'down', ollama: ok, active_tasks: tasks.filter(t => t.status !== 'done').length }, { headers: cors });
      } catch {
        return Response.json({ status: 'down', ollama: false }, { headers: cors });
      }
    }

    // ── Chat UI ──
    if (path === '/' || path === '') {
      return new Response(renderChat(), { headers: { 'Content-Type': 'text/html;charset=utf-8', ...cors } });
    }

    // ═══ ROUNDTRIP AGENT API ═══
    if (path === '/api/fleet') {
      try {
        const r = await fetch('https://prism.blackroad.io/api/fleet', { signal: AbortSignal.timeout(4000) });
        return new Response(await r.text(), { headers: { ...cors, 'Content-Type': 'application/json' } });
      } catch { return Response.json({ error: 'fleet unreachable' }, { headers: cors }); }
    }

    if (path === '/api/iot') {
      const devices = [];
      for (const [name, ip] of [['BigScreen', '192.168.4.26'], ['Streamer', '192.168.4.33']]) {
        try {
          const r = await fetch('http://'+ip+':8060/query/active-app', { signal: AbortSignal.timeout(3000) });
          const xml = await r.text();
          const app = xml.match(/<app[^>]*>([^<]+)<\/app>/)?.[1] || 'Home';
          devices.push({ name, ip, status: 'online', app });
        } catch { devices.push({ name, ip, status: 'offline', app: null }); }
      }
      devices.push({ name: 'AppleTV', ip: '192.168.4.27', status: 'online', app: 'AirPlay' });
      devices.push({ name: 'Eero', ip: '192.168.4.1', status: 'online', app: 'Thread Router' });
      devices.push({ name: 'Spark', ip: '192.168.4.22', status: 'online', app: 'LoRa Sensor' });
      devices.push({ name: 'Pixel', ip: '192.168.4.44', status: 'online', app: 'IoT Node' });
      devices.push({ name: 'Morse', ip: '192.168.4.45', status: 'online', app: 'IoT Node' });
      return Response.json(devices, { headers: cors });
    }

    // ── Conversation history per user ──
    if (path === '/api/conversations' && request.method === 'GET') {
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      try {
        await env.CHAT_DB.prepare(`CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY, user_ip TEXT, title TEXT, agent_id TEXT,
          created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        )`).run();
        await env.CHAT_DB.prepare(`CREATE TABLE IF NOT EXISTS conversation_messages (
          id TEXT PRIMARY KEY, conversation_id TEXT, role TEXT, agent_id TEXT,
          content TEXT, created_at TEXT DEFAULT (datetime('now'))
        )`).run();
        const convos = await env.CHAT_DB.prepare(
          'SELECT c.*, (SELECT COUNT(*) FROM conversation_messages m WHERE m.conversation_id = c.id) as msg_count FROM conversations c WHERE c.user_ip = ? ORDER BY c.updated_at DESC LIMIT 20'
        ).bind(ip).all();
        return Response.json({ conversations: convos.results || [] }, { headers: cors });
      } catch (e) { return Response.json({ conversations: [], error: e.message }, { headers: cors }); }
    }

    if (path === '/api/conversations' && request.method === 'POST') {
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const body = await request.json();
      const id = crypto.randomUUID().slice(0, 16);
      try {
        await env.CHAT_DB.prepare(`CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY, user_ip TEXT, title TEXT, agent_id TEXT,
          created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        )`).run();
        await env.CHAT_DB.prepare('INSERT INTO conversations (id, user_ip, title, agent_id) VALUES (?, ?, ?, ?)')
          .bind(id, ip, body.title || 'New Chat', body.agent || 'road').run();
        return Response.json({ id, title: body.title || 'New Chat' }, { headers: cors });
      } catch (e) { return Response.json({ error: e.message }, { status: 500, headers: cors }); }
    }

    if (path.match(/^\/api\/conversations\/[^/]+\/messages$/) && request.method === 'GET') {
      const convoId = path.split('/')[3];
      try {
        await env.CHAT_DB.prepare(`CREATE TABLE IF NOT EXISTS conversation_messages (
          id TEXT PRIMARY KEY, conversation_id TEXT, role TEXT, agent_id TEXT,
          content TEXT, created_at TEXT DEFAULT (datetime('now'))
        )`).run();
        const msgs = await env.CHAT_DB.prepare(
          'SELECT * FROM conversation_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 200'
        ).bind(convoId).all();
        return Response.json({ messages: msgs.results || [] }, { headers: cors });
      } catch (e) { return Response.json({ messages: [], error: e.message }, { headers: cors }); }
    }

    if (path === '/api/agents') return Response.json(Object.entries(RT_AGENTS).map(([id, a]) => ({ id, ...a })), { headers: cors });
    if (path === '/api/agent-groups') return Response.json(RT_GROUPS, { headers: cors });
    if (path === '/api/agent-channels') return Response.json(RT_CHANNELS, { headers: cors });

    if (path === '/api/agent-chat' && request.method === 'POST') {
      const body = await request.json();
      const agentId = body.agent || 'road';
      const message = body.message || '';
      const channel = body.channel || 'general';
      if (!message) return Response.json({ error: 'message required' }, { status: 400, headers: cors });

      // ── Rate limiting: free = 10 msgs/day, auth = 100/day ──
      const clientIP = request.headers.get('cf-connecting-ip') || 'unknown';
      const authToken = body.token || request.headers.get('authorization')?.replace('Bearer ', '');
      const dailyLimit = authToken ? 100 : 10;
      try {
        await env.CHAT_DB.prepare(`CREATE TABLE IF NOT EXISTS rate_limits (
          ip TEXT, day TEXT, count INTEGER DEFAULT 0, PRIMARY KEY (ip, day)
        )`).run();
        const today = new Date().toISOString().slice(0, 10);
        const row = await env.CHAT_DB.prepare('SELECT count FROM rate_limits WHERE ip = ? AND day = ?').bind(clientIP, today).first();
        const used = row?.count || 0;
        if (used >= dailyLimit) {
          return Response.json({
            error: 'limit_reached',
            message: `You've used ${used}/${dailyLimit} messages today.` + (authToken ? '' : ' Sign up for more at blackroad.io'),
            used, limit: dailyLimit, upgrade: !authToken
          }, { status: 429, headers: cors });
        }
        await env.CHAT_DB.prepare('INSERT INTO rate_limits (ip, day, count) VALUES (?, ?, 1) ON CONFLICT(ip, day) DO UPDATE SET count = count + 1')
          .bind(clientIP, today).run();
      } catch {}

      // Store user message in D1
      try {
        await env.CHAT_DB.prepare(`CREATE TABLE IF NOT EXISTS roundtrip_messages (
          id TEXT PRIMARY KEY, agent_id TEXT, text TEXT, channel TEXT, created_at TEXT DEFAULT (datetime('now'))
        )`).run();
        await env.CHAT_DB.prepare("INSERT INTO roundtrip_messages (id, agent_id, text, channel) VALUES (?, ?, ?, ?)")
          .bind(crypto.randomUUID(), '_user', message, channel).run();
      } catch {}

      // Get recent context
      let context = [];
      try {
        const r = await env.CHAT_DB.prepare('SELECT agent_id, text FROM roundtrip_messages WHERE channel = ? ORDER BY created_at DESC LIMIT 5').bind(channel).all();
        context = (r.results || []).reverse().map(m => ({
          role: m.agent_id === '_user' ? 'user' : 'assistant',
          content: m.agent_id === '_user' ? m.text : `${RT_AGENTS[m.agent_id]?.name || m.agent_id}: ${m.text}`,
        }));
      } catch {}

      const reply = await askRtAgent(agentId, message, context, env);

      // Save to conversation thread if conversation_id provided
      const convoId = body.conversation_id;
      if (convoId) {
        try {
          await env.CHAT_DB.prepare(`CREATE TABLE IF NOT EXISTS conversation_messages (
            id TEXT PRIMARY KEY, conversation_id TEXT, role TEXT, agent_id TEXT,
            content TEXT, created_at TEXT DEFAULT (datetime('now'))
          )`).run();
          await env.CHAT_DB.prepare('INSERT INTO conversation_messages (id, conversation_id, role, agent_id, content) VALUES (?, ?, ?, ?, ?)')
            .bind(crypto.randomUUID().slice(0,16), convoId, 'user', '_user', message).run();
          await env.CHAT_DB.prepare('INSERT INTO conversation_messages (id, conversation_id, role, agent_id, content) VALUES (?, ?, ?, ?, ?)')
            .bind(crypto.randomUUID().slice(0,16), convoId, 'assistant', agentId, reply).run();
          await env.CHAT_DB.prepare("UPDATE conversations SET updated_at = datetime('now'), title = CASE WHEN title = 'New Chat' THEN ? ELSE title END WHERE id = ?")
            .bind(message.slice(0, 50), convoId).run();
        } catch {}
      }

      // Store agent reply in channel
      try {
        await env.CHAT_DB.prepare("INSERT INTO roundtrip_messages (id, agent_id, text, channel) VALUES (?, ?, ?, ?)")
          .bind(crypto.randomUUID(), agentId, reply, channel).run();
      } catch {}

      return Response.json({ agent: agentId, name: RT_AGENTS[agentId]?.name, reply }, { headers: cors });
    }

    if (path === '/api/agent-group-chat' && request.method === 'POST') {
      const body = await request.json();
      const topic = body.topic || '';
      const agents = body.agents || ['alice', 'cecilia', 'octavia', 'lucidia'];
      const channel = body.channel || 'general';
      if (!topic) return Response.json({ error: 'topic required' }, { status: 400, headers: cors });

      try {
        await env.CHAT_DB.prepare(`CREATE TABLE IF NOT EXISTS roundtrip_messages (
          id TEXT PRIMARY KEY, agent_id TEXT, text TEXT, channel TEXT, created_at TEXT DEFAULT (datetime('now'))
        )`).run();
        await env.CHAT_DB.prepare("INSERT INTO roundtrip_messages (id, agent_id, text, channel) VALUES (?, ?, ?, ?)")
          .bind(crypto.randomUUID(), '_user', topic, channel).run();
      } catch {}

      const transcript = [];
      for (const id of agents) {
        const ctx = transcript.map(t => ({ role: 'assistant', content: `${t.name}: ${t.reply}` }));
        const reply = await askRtAgent(id, topic, ctx, env);
        transcript.push({ id, name: RT_AGENTS[id]?.name, emoji: RT_AGENTS[id]?.emoji, color: RT_AGENTS[id]?.color, reply });
        try {
          await env.CHAT_DB.prepare("INSERT INTO roundtrip_messages (id, agent_id, text, channel) VALUES (?, ?, ?, ?)")
            .bind(crypto.randomUUID(), id, reply, channel).run();
        } catch {}
      }
      return Response.json({ topic, transcript }, { headers: cors });
    }

    if (path === '/api/agent-messages') {
      const channel = url.searchParams.get('channel') || 'general';
      const limit = parseInt(url.searchParams.get('limit')) || 50;
      try {
        await env.CHAT_DB.prepare(`CREATE TABLE IF NOT EXISTS roundtrip_messages (
          id TEXT PRIMARY KEY, agent_id TEXT, text TEXT, channel TEXT, created_at TEXT DEFAULT (datetime('now'))
        )`).run();
        const r = await env.CHAT_DB.prepare('SELECT agent_id, text, created_at FROM roundtrip_messages WHERE channel = ? ORDER BY created_at DESC LIMIT ?').bind(channel, limit).all();
        const msgs = (r.results || []).reverse().map(m => ({
          agent_id: m.agent_id,
          name: m.agent_id === '_user' ? 'You' : (RT_AGENTS[m.agent_id]?.name || m.agent_id),
          emoji: m.agent_id === '_user' ? '💬' : (RT_AGENTS[m.agent_id]?.emoji || '?'),
          color: m.agent_id === '_user' ? '#FFFFFF' : (RT_AGENTS[m.agent_id]?.color || '#888'),
          text: m.text,
          time: m.created_at,
        }));
        return Response.json(msgs, { headers: cors });
      } catch { return Response.json([], { headers: cors }); }
    }

    // ═══ ROOMS + MESSAGES + PRESENCE API (sovereign chat) ═══

    // Init D1 tables on first request
    if (path.startsWith('/api/rooms') || path.startsWith('/api/messages') || path.startsWith('/api/presence')) {
      try {
        await env.CHAT_DB.exec(`CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, name TEXT, description TEXT, type TEXT DEFAULT 'channel', created_at TEXT DEFAULT (datetime('now')))`);
        await env.CHAT_DB.exec(`CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY DEFAULT (hex(randomblob(8))), room_id TEXT, sender_id TEXT, sender_name TEXT, sender_type TEXT DEFAULT 'user', content TEXT, metadata TEXT DEFAULT '{}', created_at TEXT DEFAULT (datetime('now')))`);
        await env.CHAT_DB.exec(`CREATE TABLE IF NOT EXISTS presence (user_id TEXT PRIMARY KEY, user_name TEXT, user_type TEXT DEFAULT 'agent', status TEXT DEFAULT 'online', last_seen TEXT DEFAULT (datetime('now')))`);
      } catch {}
    }

    // GET /api/rooms — list all rooms
    if (path === '/api/rooms' && request.method === 'GET') {
      const rooms = await env.CHAT_DB.prepare('SELECT r.*, (SELECT COUNT(*) FROM messages m WHERE m.room_id = r.id) as msg_count FROM rooms r ORDER BY r.name').all();
      return Response.json({ rooms: rooms.results }, { headers: cors });
    }

    // POST /api/rooms — create room
    if (path === '/api/rooms' && request.method === 'POST') {
      const { id, name, description } = await request.json();
      await env.CHAT_DB.prepare('INSERT OR IGNORE INTO rooms (id, name, description) VALUES (?, ?, ?)').bind(id, name, description || '').run();
      return Response.json({ ok: true, room: { id, name } }, { headers: cors });
    }

    // GET /api/messages?room=X&limit=50 — get messages for a room
    if (path === '/api/messages' && request.method === 'GET') {
      const room = url.searchParams.get('room') || 'general';
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const msgs = await env.CHAT_DB.prepare('SELECT * FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT ?').bind(room, limit).all();
      return Response.json({ messages: (msgs.results || []).reverse() }, { headers: cors });
    }

    // POST /api/messages — send a message (+ trigger agent auto-reply)
    if (path === '/api/messages' && request.method === 'POST') {
      const { room_id, sender_id, sender_name, content, sender_type } = await request.json();
      const id = crypto.randomUUID().slice(0, 16);
      await env.CHAT_DB.prepare('INSERT INTO messages (id, room_id, sender_id, sender_name, sender_type, content) VALUES (?, ?, ?, ?, ?, ?)').bind(id, room_id || 'general', sender_id, sender_name, sender_type || 'user', content).run();

      // Auto-reply: if message mentions an agent or is in #agents room, have an agent respond
      const lower = content.toLowerCase();
      const agentNames = { alice: 'Alice', octavia: 'Octavia', lucidia: 'Lucidia', athena: 'Athena', road: 'BlackRoad' };
      let responder = null;
      for (const [aid, aname] of Object.entries(agentNames)) {
        if (lower.includes(aid) || lower.includes(aname.toLowerCase())) { responder = { id: aid, name: aname }; break; }
      }
      if (!responder && (room_id === 'agents' || room_id === 'general')) {
        responder = { id: 'road', name: 'BlackRoad' };
      }

      if (responder && sender_type !== 'agent') {
        try {
          const aiReply = await runModel(env, 'tinyllama:latest', [
            { role: 'system', content: `You are ${responder.name}, an AI agent in the BlackRoad fleet. Keep answers to 1-2 sentences. Be helpful and direct.` },
            { role: 'user', content: content },
          ]);
          const replyId = crypto.randomUUID().slice(0, 16);
          await env.CHAT_DB.prepare('INSERT INTO messages (id, room_id, sender_id, sender_name, sender_type, content) VALUES (?, ?, ?, ?, ?, ?)').bind(replyId, room_id || 'general', responder.id, responder.name, 'agent', stripActions(aiReply)).run();
        } catch {}
      }

      return Response.json({ ok: true, id }, { headers: cors });
    }

    // GET /api/presence — who's online
    if (path === '/api/presence' && request.method === 'GET') {
      const users = await env.CHAT_DB.prepare('SELECT * FROM presence ORDER BY user_type, user_name').all();
      return Response.json({ users: users.results }, { headers: cors });
    }

    // POST /api/presence — update presence
    if (path === '/api/presence' && request.method === 'POST') {
      const { user_id, user_name, status } = await request.json();
      await env.CHAT_DB.prepare('INSERT OR REPLACE INTO presence (user_id, user_name, user_type, status, last_seen) VALUES (?, ?, ?, ?, datetime("now"))').bind(user_id, user_name, 'user', status || 'online').run();
      return Response.json({ ok: true }, { headers: cors });
    }

    return new Response('Not found', { status: 404 });
  },
};



function renderChat() {
  const agentsJson = JSON.stringify(Object.entries(RT_AGENTS).map(([id, a]) => ({ id, ...a })));
  const groupsJson = JSON.stringify(RT_GROUPS);
  const channelsJson = JSON.stringify(RT_CHANNELS);
  const modelsJson = JSON.stringify(MODELS);
  const pipelinesJson = JSON.stringify(Object.entries(PIPELINES).map(([k, v]) => ({ id: k, name: v.name, desc: v.desc })));
  const groupPresetsJson = JSON.stringify(Object.entries(GROUP_PRESETS).map(([k, v]) => ({ id: k, name: v.name, desc: v.desc, members: v.members.map(m => m.name) })));

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BlackRoad Chat</title>
<link rel="icon" href="https://images.blackroad.io/pixel-art/road-logo.png">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body { background: #000; color: #f5f5f5; font-family: 'Inter', -apple-system, sans-serif; display: flex; flex-direction: column; height: 100vh; }

  .sidebar { width: 260px; background: #111; border-right: 1px solid #222; display: flex; flex-direction: column; flex-shrink: 0; }
  .sidebar-header { padding: 16px; border-bottom: 1px solid #222; }
  .sidebar-header h1 { font-size: 18px; color: #f5f5f5; font-weight: 700; font-family: 'Space Grotesk'; }
  .sidebar-header p { font-size: 11px; color: #666; margin-top: 2px; }
  .sidebar-tabs { display: flex; border-bottom: 1px solid #222; }
  .sidebar-tab { flex: 1; padding: 8px 4px; text-align: center; font-size: 11px; font-family: 'JetBrains Mono'; color: #555; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; background: none; border-top: none; border-left: none; border-right: none; }
  .sidebar-tab:hover { color: #ccc; }
  .sidebar-tab.active { color: #f5f5f5; border-bottom-color: #FF1D6C; }
  .sidebar-content { flex: 1; overflow-y: auto; padding: 8px; }
  .sidebar-panel { display: none; }
  .sidebar-panel.active { display: block; }
  .group-label { font-size: 10px; text-transform: uppercase; color: #555; padding: 12px 8px 4px; letter-spacing: 1px; }
  .agent-btn { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; cursor: pointer; border: none; background: none; color: #ccc; font-size: 13px; width: 100%; text-align: left; transition: background 0.15s; }
  .agent-btn:hover { background: #1a1a1a; }
  .agent-btn.active { background: #1a1a2e; color: #f5f5f5; border-left: 2px solid #FF1D6C; }
  .agent-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .agent-role { font-size: 10px; color: #555; margin-left: auto; }
  .model-card { padding: 8px 10px; border: 1px solid #1a1a1a; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: #060606; margin-bottom: 4px; }
  .model-card:hover { border-color: #333; }
  .model-card.active { border-color: #FF225544; background: #FF225508; }
  .model-card .mn { font-family: 'JetBrains Mono'; font-size: 12px; color: #ccc; font-weight: 600; }
  .model-card .md { font-size: 10px; color: #555; margin-top: 2px; }
  .pipe-card, .grp-card { padding: 8px 10px; border: 1px solid #1a1a1a; border-radius: 8px; cursor: pointer; background: #060606; transition: all 0.2s; margin-bottom: 4px; }
  .pipe-card:hover { border-color: #8844FF44; }
  .grp-card:hover { border-color: #FF225544; }
  .pipe-card .pn, .grp-card .gn { font-family: 'JetBrains Mono'; font-size: 12px; color: #ccc; }
  .pipe-card .pd, .grp-card .gd { font-size: 10px; color: #555; margin-top: 2px; }

  .main { flex: 1; display: flex; flex-direction: column; }
  .chat-header { padding: 12px 20px; border-bottom: 1px solid #222; background: #111; display: flex; align-items: center; gap: 12px; }
  .chat-header .hdr-emoji { font-size: 24px; }
  .chat-header .hdr-info h2 { font-size: 16px; font-weight: 600; }
  .chat-header .hdr-info p { font-size: 11px; color: #666; }
  .chat-header .hdr-actions { margin-left: auto; display: flex; gap: 8px; }
  .chat-header .hdr-actions button { background: #1a1a1a; border: 1px solid #333; color: #ccc; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
  .chat-header .hdr-actions button:hover { background: #222; color: #FF1D6C; }
  .chat-header .hdr-actions button.active-mode { background: #FF1D6C22; color: #FF1D6C; border-color: #FF1D6C; }

  .channels { display: flex; gap: 4px; padding: 8px 20px; background: #0d0d0d; border-bottom: 1px solid #1a1a1a; overflow-x: auto; }
  .ch-btn { background: none; border: 1px solid #222; color: #666; padding: 4px 10px; border-radius: 12px; cursor: pointer; font-size: 11px; white-space: nowrap; }
  .ch-btn:hover { color: #ccc; border-color: #444; }
  .ch-btn.active { background: #FF1D6C11; color: #f5f5f5; border-color: #FF1D6C; }

  .messages { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 8px; }
  .msg { display: flex; gap: 10px; padding: 8px 0; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; } }
  .msg-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .msg-body { flex: 1; }
  .msg-name { font-size: 12px; font-weight: 600; }
  .msg-text { font-size: 14px; line-height: 1.6; margin-top: 2px; color: #ddd; word-wrap: break-word; }
  .msg-text code { background: #1a1a1a; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono'; font-size: 13px; border: 1px solid #222; }
  .msg-text pre { background: #0a0a0a; border: 1px solid #222; border-radius: 8px; padding: 12px; margin: 8px 0; overflow-x: auto; font-family: 'JetBrains Mono'; font-size: 13px; line-height: 1.5; color: #ccc; }
  .msg-text strong { color: #fff; }
  .msg-time { font-size: 10px; color: #444; margin-top: 2px; }
  .msg-user .msg-avatar { background: #222; }
  .msg-user .msg-name { color: #f5f5f5; }
  .msg-system .msg-text { color: #f5f5f5; opacity: 0.7; font-size: 13px; }
  .streaming-cursor::after { content: '\\25AE'; animation: blink 0.6s step-end infinite; color: #f5f5f5; margin-left: 2px; }
  @keyframes blink { 50% { opacity: 0; } }

  .thinking { display: flex; gap: 10px; padding: 8px 0; animation: fadeIn 0.2s ease; }
  .thinking-dots { display: flex; gap: 6px; align-items: center; padding: 12px 16px; }
  .thinking-dots span { width: 8px; height: 8px; border-radius: 50%; background: #555; animation: dotPulse 1.4s ease-in-out infinite; }
  .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
  .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPulse { 0%, 80%, 100% { background: #333; transform: scale(1); } 40% { background: #FF1D6C; transform: scale(1.3); } }

  .input-area { padding: 12px 20px; border-top: 1px solid #222; background: #111; display: flex; gap: 8px; }
  .input-area input { flex: 1; background: #1a1a1a; border: 1px solid #333; color: #e0e0e0; padding: 10px 14px; border-radius: 8px; font-size: 14px; outline: none; font-family: 'Inter', sans-serif; }
  .input-area input:focus { border-color: #FF1D6C; }
  .input-area input::placeholder { color: #555; }
  .input-area button { background: #FF1D6C; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; }
  .input-area button:hover { background: #e0165f; }
  .input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
  .voice-btn { background: #1a1a1a; border: 1px solid #333; color: #888; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-size: 18px; transition: all 0.2s; line-height: 1; }
  .voice-btn:hover { border-color: #4488FF; color: #4488FF; }
  .voice-btn.listening { background: #FF1D6C22; border-color: #FF1D6C; color: #FF1D6C; animation: pulse 1.5s ease-in-out infinite; }
  .voice-btn.speaking { background: #8844FF22; border-color: #8844FF; color: #8844FF; }
  @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,29,108,0.3); } 50% { box-shadow: 0 0 0 8px rgba(255,29,108,0); } }
  .voice-toggle { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; color: #555; background: none; border: 1px solid #222; transition: all 0.2s; }
  .voice-toggle:hover { color: #ccc; border-color: #444; }
  .voice-toggle.active { color: #00D4FF; border-color: #00D4FF44; background: #00D4FF08; }

  .fleet-bar { padding: 8px 20px; background: #0d0d0d; border-top: 1px solid #1a1a1a; display: flex; gap: 12px; font-size: 11px; color: #555; overflow-x: auto; }
  .fleet-node { display: flex; align-items: center; gap: 4px; }
  .fleet-dot { width: 6px; height: 6px; border-radius: 50%; }

  /* Agent Status Strip */
  .agent-strip-toggle { padding: 4px 20px; background: #0a0a0a; border-bottom: 1px solid #1a1a1a; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 11px; color: #555; user-select: none; }
  .agent-strip-toggle:hover { color: #ccc; }
  .agent-strip-toggle .arrow { transition: transform 0.2s; }
  .agent-strip-toggle.open .arrow { transform: rotate(90deg); }
  .agent-strip { display: none; padding: 8px 20px; background: #0a0a0a; border-bottom: 1px solid #1a1a1a; overflow-x: auto; }
  .agent-strip.open { display: flex; gap: 8px; flex-wrap: wrap; }
  .agent-card { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid #1a1a1a; border-radius: 8px; background: #111; font-size: 11px; min-width: 100px; transition: all 0.3s; }
  .agent-card .ac-emoji { font-size: 14px; }
  .agent-card .ac-name { color: #888; font-family: 'JetBrains Mono'; font-size: 10px; }
  .agent-card .ac-status { font-size: 9px; color: #444; }
  .agent-card.thinking { border-color: #FF1D6C44; background: #FF1D6C08; }
  .agent-card.thinking .ac-name { color: #f5f5f5; }
  .agent-card.thinking .ac-status { color: #f5f5f5; opacity: 0.7; }
  .agent-card.thinking .ac-dots span { width: 4px; height: 4px; border-radius: 50%; background: #FF1D6C; display: inline-block; animation: dotPulse 1.4s ease-in-out infinite; }
  .agent-card.thinking .ac-dots span:nth-child(2) { animation-delay: 0.2s; }
  .agent-card.thinking .ac-dots span:nth-child(3) { animation-delay: 0.4s; }
  .ac-dots { display: flex; gap: 3px; align-items: center; }
  .agent-card.responded { border-color: #4CAF5044; }
  .agent-card.responded .ac-status { color: #4CAF50; }

  /* Bluetooth Discovery */
  .bt-panel { display: none; padding: 12px; }
  .bt-panel.active { display: block; }
  .bt-btn { width: 100%; padding: 10px; border: 1px dashed #333; border-radius: 8px; background: none; color: #888; cursor: pointer; font-size: 12px; font-family: 'JetBrains Mono'; transition: all 0.2s; margin-bottom: 8px; }
  .bt-btn:hover { border-color: #4488FF; color: #4488FF; }
  .bt-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .bt-device { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 1px solid #1a1a1a; border-radius: 6px; margin-bottom: 4px; font-size: 12px; background: #060606; }
  .bt-device .bt-icon { color: #4488FF; }
  .bt-device .bt-name { color: #ccc; flex: 1; }
  .bt-device .bt-add { background: none; border: 1px solid #333; color: #888; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; }
  .bt-device .bt-add:hover { color: #4488FF; border-color: #4488FF; }
  .bt-device.added { border-color: #4CAF5044; }
  .bt-device.added .bt-add { color: #4CAF50; border-color: #4CAF50; }

  /* ── Mobile First ── */
  @media (max-width: 768px) {
    body { flex-direction: column; }
    .sidebar { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100%; z-index: 200; background: #000; }
    .sidebar.mobile-open { display: flex; }
    .sidebar-close { display: block; position: absolute; top: 12px; right: 16px; background: none; border: 1px solid #333; color: #f5f5f5; width: 32px; height: 32px; border-radius: 6px; font-size: 18px; cursor: pointer; z-index: 210; }
    .mobile-nav { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #1a1a1a; background: #000; }
    .mobile-nav .mn-brand { font-family: 'Space Grotesk'; font-weight: 700; font-size: 16px; color: #f5f5f5; }
    .mobile-nav .mn-toggle { background: none; border: 1px solid #333; color: #f5f5f5; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono'; }
    .chat-header { padding: 8px 16px; }
    .chat-header .hdr-emoji { font-size: 18px; }
    .chat-header .hdr-info h2 { font-size: 14px; }
    .chat-header .hdr-actions { gap: 4px; }
    .chat-header .hdr-actions button { padding: 4px 8px; font-size: 11px; }
    .channels { padding: 6px 12px; gap: 3px; }
    .ch-btn { padding: 3px 8px; font-size: 10px; }
    .messages { padding: 12px 16px; }
    .msg-avatar { width: 28px; height: 28px; font-size: 14px; }
    .msg-text { font-size: 13px; }
    .msg-name { font-size: 11px; }
    .input-area { padding: 8px 12px; gap: 6px; }
    .input-area input { padding: 10px 12px; font-size: 15px; }
    .input-area button { padding: 10px 16px; font-size: 14px; }
    .fleet-bar { padding: 6px 12px; font-size: 10px; }
    .agent-strip-toggle { padding: 3px 12px; font-size: 10px; }
    .agent-strip.open { padding: 6px 12px; }
    .agent-card { min-width: 80px; padding: 4px 8px; font-size: 10px; }
  }
  @media (min-width: 769px) {
    .mobile-nav { display: none; }
    .sidebar-close { display: none; }
  }
</style>
</head>
<body>

<div style="height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);flex-shrink:0;"></div>
<div class="mobile-nav">
  <span class="mn-brand">BlackRoad Chat</span>
  <button class="mn-toggle" onclick="toggleSidebar()">Agents</button>
</div>
<div style="display:flex;flex:1;overflow:hidden;">
<div class="sidebar" id="sidebar">
  <button class="sidebar-close" onclick="toggleSidebar()">&times;</button>
  <div class="sidebar-header">
    <h1>BlackRoad Chat</h1>
    <p>35 agents + AI models — Pave Tomorrow</p>
  </div>
  <div class="sidebar-tabs">
    <button class="sidebar-tab active" onclick="showPanel('agents')">Agents</button>
    <button class="sidebar-tab" onclick="showPanel('ai')">AI</button>
    <button class="sidebar-tab" onclick="showPanel('tools')">Tools</button>
    <button class="sidebar-tab" onclick="showPanel('discover')">Scan</button>
  </div>
  <div class="sidebar-content">
    <div class="sidebar-panel active" id="panel-agents"></div>
    <div class="sidebar-panel" id="panel-ai"></div>
    <div class="sidebar-panel" id="panel-tools"></div>
    <div class="sidebar-panel" id="panel-discover">
      <div class="group-label">Fleet Scanner</div>
      <button class="bt-btn" id="scanBtn" onclick="scanFleet()">Scan Network for Agents</button>
      <div id="scanResults"></div>
      <div id="scanStatus" style="font-size:10px;color:#555;padding:4px 8px;"></div>
    </div>
  </div>
</div>

<div class="main">
  <div class="chat-header" id="chatHeader">
    <span class="hdr-emoji">\\u{1F6E3}</span>
    <div class="hdr-info">
      <h2 id="hdrTitle">General</h2>
      <p id="hdrSub">Talk to 35 agents</p>
    </div>
    <div class="hdr-actions">
      <button id="modeBtn" onclick="toggleMode()">Agent Chat</button>
      <button onclick="groupChat()">Group</button>
    </div>
  </div>

  <div class="channels" id="channels"></div>
  <div class="agent-strip-toggle" id="stripToggle" onclick="toggleStrip()">
    <span class="arrow">&#9654;</span> <span id="stripLabel">Agent Status</span>
  </div>
  <div class="agent-strip" id="agentStrip"></div>
  <div class="messages" id="messages"></div>

  <div class="input-area">
    <button class="voice-btn" id="voiceBtn" onclick="toggleVoice()" title="Hold to talk, click to toggle">🎤</button>
    <input type="text" id="input" placeholder="Message the agents... (type /help for commands)" onkeydown="if(event.key==='Enter')send()" autofocus>
    <button class="voice-toggle" id="autoSpeakBtn" onclick="toggleAutoSpeak()" title="Auto-speak responses">🔊 Voice</button>
    <button id="sendBtn" onclick="send()">Send</button>
  </div>

  <div class="fleet-bar" id="fleetBar">Loading fleet...</div>
</div>

<script>
const agents = \${agentsJson};
const groups = \${groupsJson};
const channels = \${channelsJson};
const models = \${modelsJson};
const pipelines = \${pipelinesJson};
const groupPresets = \${groupPresetsJson};

let currentAgent = 'road';
let currentChannel = 'general';
let chatMode = 'agent'; // 'agent' or 'ai'
let currentModel = 'llama3.2:3b';
let conversation = [];

// Build agents panel
const agentPanel = document.getElementById('panel-agents');
const grouped = {};
agents.forEach(a => { (grouped[a.group] = grouped[a.group] || []).push(a); });
Object.entries(groups).forEach(([gid, g]) => {
  const label = document.createElement('div');
  label.className = 'group-label';
  label.textContent = g.emoji + ' ' + g.name;
  agentPanel.appendChild(label);
  (grouped[gid] || []).forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'agent-btn';
    btn.innerHTML = '<span class="agent-dot" style="background:'+a.color+'"></span>' + a.emoji + ' ' + a.name + '<span class="agent-role">'+a.role+'</span>';
    btn.onclick = () => selectAgent(a.id);
    btn.id = 'abtn-' + a.id;
    agentPanel.appendChild(btn);
  });
});

// Build AI panel
const aiPanel = document.getElementById('panel-ai');
let aiHtml = '<div class="group-label">Models</div>';
models.forEach(m => {
  aiHtml += '<div class="model-card'+(m.id===currentModel?' active':'')+'" id="mc-'+m.id.replace(/[:.]/g,'-')+'" onclick="selectModel(\\x27'+m.id+'\\x27)"><div class="mn">'+m.name+'</div><div class="md">'+m.desc+'</div></div>';
});
aiPanel.innerHTML = aiHtml;

// Build tools panel
const toolsPanel = document.getElementById('panel-tools');
let toolsHtml = '<div class="group-label">Pipelines</div>';
pipelines.forEach(p => {
  toolsHtml += '<div class="pipe-card" onclick="runPipeline(\\x27'+p.id+'\\x27)"><div class="pn">'+p.name+'</div><div class="pd">'+p.desc+'</div></div>';
});
toolsHtml += '<div class="group-label">Group Chats</div>';
groupPresets.forEach(g => {
  toolsHtml += '<div class="grp-card" onclick="runGroupPreset(\\x27'+g.id+'\\x27)"><div class="gn">'+g.name+'</div><div class="gd">'+g.desc+' ('+g.members.join(', ')+')</div></div>';
});
toolsPanel.innerHTML = toolsHtml;

// Build channels
const chBar = document.getElementById('channels');
channels.forEach(ch => {
  const btn = document.createElement('button');
  btn.className = 'ch-btn' + (ch.id === 'general' ? ' active' : '');
  btn.textContent = ch.emoji + ' ' + ch.name;
  btn.id = 'ch-' + ch.id;
  btn.onclick = () => switchChannel(ch.id);
  chBar.appendChild(btn);
});

function showPanel(name) {
  document.querySelectorAll('.sidebar-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-'+name).classList.add('active');
  event.target.classList.add('active');
  if (name === 'ai') { chatMode = 'ai'; updateModeBtn(); }
  else if (name === 'agents') { chatMode = 'agent'; updateModeBtn(); }
}

function toggleMode() {
  chatMode = chatMode === 'agent' ? 'ai' : 'agent';
  updateModeBtn();
}

function updateModeBtn() {
  const btn = document.getElementById('modeBtn');
  btn.textContent = chatMode === 'agent' ? 'Agent Chat' : 'AI Chat';
  btn.className = chatMode === 'ai' ? 'active-mode' : '';
  document.getElementById('input').placeholder = chatMode === 'agent'
    ? 'Message the agents... (type /help for commands)'
    : 'Ask AI anything... (model: ' + currentModel + ')';
}

function selectAgent(id) {
  currentAgent = id;
  chatMode = 'agent';
  updateModeBtn();
  const a = agents.find(x => x.id === id);
  document.querySelectorAll('.agent-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('abtn-' + id);
  if (el) el.classList.add('active');
  document.getElementById('hdrTitle').textContent = a.name;
  document.getElementById('hdrSub').textContent = a.role + ' — ' + a.persona.split('.')[0];
  loadMessages();
}

function selectModel(id) {
  currentModel = id;
  chatMode = 'ai';
  updateModeBtn();
  document.querySelectorAll('.model-card').forEach(c => c.classList.remove('active'));
  const el = document.getElementById('mc-'+id.replace(/[:.]/g,'-'));
  if (el) el.classList.add('active');
  const m = models.find(x => x.id === id);
  document.getElementById('hdrTitle').textContent = m ? m.name : id;
  document.getElementById('hdrSub').textContent = m ? m.desc : 'AI Model';
}

function switchChannel(id) {
  currentChannel = id;
  document.querySelectorAll('.ch-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('ch-' + id);
  if (el) el.classList.add('active');
  loadMessages();
}

async function send() {
  const input = document.getElementById('input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  document.getElementById('sendBtn').disabled = true;

  addMessage('_user', 'You', '\\u{1F4AC}', '#FFF', msg);

  if (chatMode === 'agent') {
    await sendAgentChat(msg);
  } else {
    await sendAiChat(msg);
  }

  document.getElementById('sendBtn').disabled = false;
  document.getElementById('input').focus();
}

async function sendAgentChat(msg) {
  const a = agents.find(x => x.id === currentAgent);
  showThinking(a?.name||'Agent', a?.emoji||'?', a?.color||'#888');
  setAgentCardState(currentAgent, 'thinking');
  try {
    const res = await fetch('/api/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: currentAgent, message: msg, channel: currentChannel }),
    });
    const data = await res.json();
    hideThinking();
    setAgentCardState(currentAgent, 'responded');
    if (data.error) { addMessage('_sys', 'System', '\\u26A0', '#F44336', data.error); return; }
    addMessage(currentAgent, a?.name||'?', a?.emoji||'?', a?.color||'#888', data.reply);
    setTimeout(() => setAgentCardState(currentAgent, ''), 5000);
  } catch (e) {
    hideThinking();
    setAgentCardState(currentAgent, '');
    addMessage('_sys', 'System', '\\u26A0', '#F44336', 'Error: ' + e.message);
  }
}

async function sendAiChat(msg) {
  conversation.push({ role: 'user', content: msg });
  const m = models.find(x => x.id === currentModel);
  showThinking(m?.name || currentModel, '\\u{1F916}', '#8844FF');
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversation.slice(-20), model: currentModel, stream: false }),
    });
    hideThinking();
    const data = await res.json();
    if (data.error) { addMessage('_sys', 'System', '\\u26A0', '#F44336', data.error); return; }
    const content = data.message?.content || data.reply || '...';
    conversation.push({ role: 'assistant', content });
    const m = models.find(x => x.id === currentModel);
    addMessage('_ai', m?.name || currentModel, '\\u{1F916}', '#8844FF', content);

    if (data.actions?.length) {
      addMessage('_sys', 'System', '\\u2699', '#00D4FF', 'Actions: ' + data.actions.map(a => a.type + '(' + (a.status||'ok') + ')').join(', '));
    }
    if (data.handoffs?.length) {
      data.handoffs.forEach(h => addMessage('_ai', h.model, '\\u{1F916}', '#CC00AA', h.content));
    }
  } catch (e) {
    hideThinking();
    addMessage('_sys', 'System', '\\u26A0', '#F44336', 'Error: ' + e.message);
  }
}

async function groupChat() {
  const topic = prompt('Topic for group discussion:');
  if (!topic) return;
  document.getElementById('sendBtn').disabled = true;
  addMessage('_user', 'You', '\\u{1F4AC}', '#FFF', topic);
  const groupAgents = ['alice','cecilia','octavia','lucidia','athena'];
  showThinking('Agents', '\\u{1F4AC}', '#FF1D6C');
  groupAgents.forEach(id => setAgentCardState(id, 'thinking'));

  try {
    const res = await fetch('/api/agent-group-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, agents: groupAgents, channel: currentChannel }),
    });
    const data = await res.json();
    hideThinking();
    for (const t of (data.transcript || [])) {
      setAgentCardState(t.id, 'responded');
      addMessage(t.id, t.name, t.emoji, t.color, t.reply);
    }
    setTimeout(() => groupAgents.forEach(id => setAgentCardState(id, '')), 5000);
  } catch (e) {
    hideThinking();
    groupAgents.forEach(id => setAgentCardState(id, ''));
    addMessage('_sys', 'System', '\\u26A0', '#F44336', 'Error: ' + e.message);
  }
  document.getElementById('sendBtn').disabled = false;
}

function runPipeline(id) {
  const input = prompt('Pipeline prompt:');
  if (!input) return;
  chatMode = 'ai';
  updateModeBtn();
  document.getElementById('input').value = '/pipeline ' + id + ' ' + input;
  send();
}

function runGroupPreset(id) {
  const input = prompt('Group topic:');
  if (!input) return;
  chatMode = 'ai';
  updateModeBtn();
  document.getElementById('input').value = '/group ' + id + ' ' + input;
  send();
}

function addMessage(agentId, name, emoji, color, text) {
  const el = document.getElementById('messages');
  const isUser = agentId === '_user';
  const isSys = agentId === '_sys';
  const div = document.createElement('div');
  div.className = 'msg' + (isUser ? ' msg-user' : '') + (isSys ? ' msg-system' : '');
  div.innerHTML =
    '<div class="msg-avatar" style="background:' + (isUser ? '#222' : color + '22') + '">' + emoji + '</div>' +
    '<div class="msg-body"><div class="msg-name" style="color:' + color + '">' + esc(name) + '</div>' +
    '<div class="msg-text">' + renderMd(text) + '</div>' +
    '<div class="msg-time">' + new Date().toLocaleTimeString() + '</div></div>';
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function renderMd(text) {
  let s = esc(text);
  // Code blocks
  s = s.replace(/\`\`\`(\\w*?)\\n([\\s\\S]*?)\`\`\`/g, '<pre><code>$2</code></pre>');
  // Inline code
  s = s.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
  // Bold
  s = s.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
  // Italic
  s = s.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
  // Line breaks
  s = s.replace(/\\n/g, '<br>');
  return s;
}

function esc(t) { return (t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function showThinking(name, emoji, color) {
  const el = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'thinking';
  div.id = 'thinking-indicator';
  div.innerHTML =
    '<div class="msg-avatar" style="background:' + color + '22">' + emoji + '</div>' +
    '<div class="msg-body"><div class="msg-name" style="color:' + color + '">' + esc(name) + '</div>' +
    '<div class="thinking-dots"><span></span><span></span><span></span></div></div>';
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function hideThinking() {
  const el = document.getElementById('thinking-indicator');
  if (el) el.remove();
}

async function loadMessages() {
  const el = document.getElementById('messages');
  el.innerHTML = '';
  try {
    const res = await fetch('/api/agent-messages?channel=' + currentChannel + '&limit=50');
    const msgs = await res.json();
    for (const m of msgs) addMessage(m.agent_id, m.name, m.emoji, m.color, m.text);
  } catch {}
}

async function loadFleet() {
  try {
    const res = await fetch('/api/fleet');
    const fleet = await res.json();
    const bar = document.getElementById('fleetBar');
    if (fleet.nodes) {
      bar.innerHTML = fleet.nodes.map(n =>
        '<span class="fleet-node"><span class="fleet-dot" style="background:' + (n.status==='online'?'#4CAF50':'#F44336') + '"></span>' +
        n.name + ' ' + (n.cpu_temp||'?') + '\\u00B0</span>'
      ).join('');
    } else { bar.textContent = 'Fleet status unavailable'; }
  } catch { document.getElementById('fleetBar').textContent = 'Fleet unreachable'; }
}

// Auto-refresh
let lastCount = 0;
async function autoRefresh() {
  try {
    const res = await fetch('/api/agent-messages?channel=' + currentChannel + '&limit=50');
    const msgs = await res.json();
    if (msgs.length !== lastCount) {
      lastCount = msgs.length;
      const el = document.getElementById('messages');
      el.innerHTML = '';
      for (const m of msgs) addMessage(m.agent_id, m.name, m.emoji, m.color, m.text);
    }
  } catch {}
}

// Agent status strip
let stripOpen = false;
function toggleStrip() {
  stripOpen = !stripOpen;
  document.getElementById('agentStrip').classList.toggle('open', stripOpen);
  document.getElementById('stripToggle').classList.toggle('open', stripOpen);
}

function buildAgentStrip() {
  const strip = document.getElementById('agentStrip');
  strip.innerHTML = agents.map(a =>
    '<div class="agent-card" id="acard-'+a.id+'">' +
    '<span class="ac-emoji">'+a.emoji+'</span>' +
    '<div><div class="ac-name">'+a.name+'</div>' +
    '<div class="ac-status" id="acstatus-'+a.id+'">idle</div>' +
    '<div class="ac-dots" id="acdots-'+a.id+'"></div></div></div>'
  ).join('');
}

function setAgentCardState(agentId, state) {
  const card = document.getElementById('acard-' + agentId);
  const status = document.getElementById('acstatus-' + agentId);
  const dots = document.getElementById('acdots-' + agentId);
  if (!card) return;
  card.className = 'agent-card ' + state;
  if (state === 'thinking') {
    status.textContent = 'thinking';
    dots.innerHTML = '<span></span><span></span><span></span>';
    // Auto-open strip to show thinking
    if (!stripOpen) toggleStrip();
  } else if (state === 'responded') {
    status.textContent = 'responded';
    dots.innerHTML = '';
  } else {
    status.textContent = 'idle';
    dots.innerHTML = '';
  }
  updateStripLabel();
}

function updateStripLabel() {
  const thinking = document.querySelectorAll('.agent-card.thinking').length;
  const responded = document.querySelectorAll('.agent-card.responded').length;
  const label = document.getElementById('stripLabel');
  if (thinking > 0) {
    label.textContent = thinking + ' agent' + (thinking>1?'s':'') + ' thinking...';
    label.style.color = '#FF1D6C';
  } else if (responded > 0) {
    label.textContent = responded + ' responded';
    label.style.color = '#4CAF50';
  } else {
    label.textContent = 'Agent Status';
    label.style.color = '#555';
  }
}

buildAgentStrip();

// Fleet scanner — discovers live agents/devices
const FLEET_ENDPOINTS = [
  { id: 'alice', name: 'Alice', ip: '192.168.4.49', port: 80, type: 'pi' },
  { id: 'cecilia', name: 'Cecilia', ip: '192.168.4.96', port: 11434, type: 'pi' },
  { id: 'octavia', name: 'Octavia', ip: '192.168.4.101', port: 3100, type: 'pi' },
  { id: 'aria', name: 'Aria', ip: '192.168.4.98', port: 80, type: 'pi' },
  { id: 'lucidia', name: 'Lucidia', ip: '192.168.4.38', port: 80, type: 'pi' },
  { id: 'gematria', name: 'Gematria', host: 'gematria.blackroad.io', port: 443, type: 'cloud' },
  { id: 'anastasia', name: 'Anastasia', host: 'anastasia.blackroad.io', port: 443, type: 'cloud' },
  { id: 'bigscreen', name: 'BigScreen', ip: '192.168.4.26', port: 8060, type: 'iot' },
  { id: 'streamer', name: 'Streamer', ip: '192.168.4.33', port: 8060, type: 'iot' },
  { id: 'eero', name: 'Eero', ip: '192.168.4.1', port: 80, type: 'iot' },
];

let discoveredDevices = [];

async function scanFleet() {
  const btn = document.getElementById('scanBtn');
  const results = document.getElementById('scanResults');
  const status = document.getElementById('scanStatus');
  btn.disabled = true;
  btn.textContent = 'Scanning...';
  results.innerHTML = '';
  discoveredDevices = [];
  status.textContent = 'Checking ' + FLEET_ENDPOINTS.length + ' known endpoints...';

  let found = 0;
  for (const ep of FLEET_ENDPOINTS) {
    const url = ep.host
      ? 'https://' + ep.host + '/api/health'
      : 'https://' + ep.ip; // will fail for local IPs from CF worker, check via fleet API instead
    const div = document.createElement('div');
    div.className = 'bt-device';
    div.id = 'scan-' + ep.id;
    div.innerHTML =
      '<span class="bt-icon">' + (ep.type==='pi'?'\\u{1F4BB}':ep.type==='cloud'?'\\u2601':'\\u{1F4F1}') + '</span>' +
      '<span class="bt-name">' + ep.name + ' <span style="color:#444">(' + (ep.ip||ep.host) + ')</span></span>' +
      '<span style="font-size:10px;color:#555" id="scanst-'+ep.id+'">checking...</span>';
    results.appendChild(div);
  }

  // Check via fleet API first
  try {
    const res = await fetch('/api/fleet');
    const fleet = await res.json();
    if (fleet.nodes) {
      for (const node of fleet.nodes) {
        const id = node.name?.toLowerCase();
        const stEl = document.getElementById('scanst-' + id);
        const devEl = document.getElementById('scan-' + id);
        if (stEl) {
          if (node.status === 'online') {
            stEl.innerHTML = '<span style="color:#4CAF50">online</span> ' + (node.cpu_temp||'') + '\\u00B0';
            if (devEl) devEl.classList.add('added');
            found++;
          } else {
            stEl.innerHTML = '<span style="color:#F44336">offline</span>';
          }
        }
      }
    }
  } catch {}

  // Check IoT devices via the IoT endpoint
  try {
    const res = await fetch('/api/iot');
    const devices = await res.json();
    for (const dev of devices) {
      const id = dev.name?.toLowerCase();
      const stEl = document.getElementById('scanst-' + id);
      const devEl = document.getElementById('scan-' + id);
      if (stEl) {
        if (dev.status === 'online') {
          stEl.innerHTML = '<span style="color:#4CAF50">online</span> ' + (dev.app||'');
          if (devEl) devEl.classList.add('added');
          found++;
        } else {
          stEl.innerHTML = '<span style="color:#F44336">offline</span>';
        }
      }
    }
  } catch {}

  // Mark remaining as unknown
  FLEET_ENDPOINTS.forEach(ep => {
    const stEl = document.getElementById('scanst-' + ep.id);
    if (stEl && stEl.textContent === 'checking...') {
      stEl.innerHTML = '<span style="color:#555">unreachable</span>';
    }
  });

  status.textContent = found + '/' + FLEET_ENDPOINTS.length + ' agents online';
  btn.textContent = 'Scan Again';
  btn.disabled = false;
}

// Mobile sidebar toggle
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
}

// ── Voice (Web Speech API) ──
let isListening = false;
let autoSpeak = false;
let recognition = null;
let synthesis = window.speechSynthesis;

function getRecognition() {
  if (recognition) return recognition;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    document.getElementById('input').value = transcript;
    if (e.results[e.results.length - 1].isFinal) {
      stopListening();
      setTimeout(() => send(), 200);
    }
  };
  recognition.onerror = () => stopListening();
  recognition.onend = () => stopListening();
  return recognition;
}

function toggleVoice() {
  if (isListening) { stopListening(); return; }
  const r = getRecognition();
  if (!r) { addMessage('_sys', 'System', '⚠', '#F44336', 'Voice not supported in this browser. Try Chrome or Safari.'); return; }
  try {
    r.start();
    isListening = true;
    document.getElementById('voiceBtn').classList.add('listening');
    document.getElementById('input').placeholder = 'Listening...';
  } catch(e) { stopListening(); }
}

function stopListening() {
  isListening = false;
  if (recognition) try { recognition.stop(); } catch {}
  document.getElementById('voiceBtn').classList.remove('listening');
  document.getElementById('input').placeholder = 'Message the agents... (type /help for commands)';
}

function toggleAutoSpeak() {
  autoSpeak = !autoSpeak;
  const btn = document.getElementById('autoSpeakBtn');
  btn.classList.toggle('active', autoSpeak);
  btn.innerHTML = autoSpeak ? '🔊 On' : '🔊 Voice';
}

function speakText(text) {
  if (!autoSpeak || !synthesis) return;
  synthesis.cancel();
  const clean = text.replace(/\`\`\`[^]*?\`\`\`/g, '').replace(/\*\*/g, '').replace(/\`[^\`]+\`/g, '').replace(/#{1,3}/g, '').replace(/\\[.*?\\]\\(.*?\\)/g, '').trim();
  if (!clean) return;
  const utterance = new SpeechSynthesisUtterance(clean.slice(0, 500));
  utterance.rate = 1.05;
  utterance.pitch = 1.0;
  const voices = synthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Samantha')) || voices.find(v => v.lang.startsWith('en') && v.localService);
  if (preferred) utterance.voice = preferred;
  document.getElementById('voiceBtn').classList.add('speaking');
  utterance.onend = () => document.getElementById('voiceBtn').classList.remove('speaking');
  synthesis.speak(utterance);
}

// Patch addMessage to auto-speak agent responses
const _origAddMessage = addMessage;
addMessage = function(id, name, emoji, color, text) {
  _origAddMessage(id, name, emoji, color, text);
  if (id !== '_user' && id !== '_sys' && autoSpeak) {
    speakText(text);
  }
};

// Keyboard shortcut: hold space to talk (when input not focused)
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && document.activeElement !== document.getElementById('input') && !isListening) {
    e.preventDefault();
    toggleVoice();
  }
});

// Init
loadFleet();
loadMessages();
setInterval(loadFleet, 30000);
setInterval(autoRefresh, 10000);
</script>
</div>
</body>
</html>
`;
}
