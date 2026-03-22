// ╔══════════════════════════════════════════════════════════════╗
// ║  RoadSearch v2 — BlackRoad's Sovereign Search Engine        ║
// ║  D1 FTS5 + AI answers + smart summaries + search analytics  ║
// ╚══════════════════════════════════════════════════════════════╝

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// ─── Seed Data (BlackRoad ecosystem — all 20 root domains + subdomains) ──
const SEED_PAGES = [
  // ── Core Sites (root domains) ──
  { url: 'https://blackroad.io', title: 'BlackRoad OS — Sovereign Agent Operating System', description: 'The distributed agent OS. Self-hosted AI infrastructure on Raspberry Pi clusters. 50 AI skills, 5 nodes, 52 TOPS, 275+ repos. Your AI. Your Hardware. Your Rules.', domain: 'blackroad.io', category: 'site', tags: 'os,agents,infrastructure,sovereign,pi,raspberry', content: 'BlackRoad OS is a sovereign agent operating system that runs on Raspberry Pi clusters. It includes AI agents (Alice, Lucidia, Cecilia, Aria, Octavia), a distributed memory system, 50 AI skills across 6 modules, and the Z-framework (Z:=yx-w) for composable infrastructure. Founded by Alexa Louise Amundson. 16 clickable app cards, ecosystem footer across 30 sites.' },
  { url: 'https://blackroad.network', title: 'BlackRoad Network — RoadNet Carrier Infrastructure', description: 'Mesh carrier network spanning 5 Raspberry Pi nodes. WiFi mesh, WireGuard VPN, Pi-hole DNS, and sovereign connectivity.', domain: 'blackroad.network', category: 'site', tags: 'network,mesh,wireguard,vpn,dns,roadnet,carrier', content: 'RoadNet is BlackRoad\'s carrier-grade mesh network. 5 access points (Alice CH1, Cecilia CH6, Octavia CH11, Aria CH1, Lucidia CH11) with dedicated subnets 10.10.x.0/24, NAT routing, Pi-hole DNS filtering, and WireGuard failover. Boot-persistent via systemd.' },
  { url: 'https://blackroad.systems', title: 'BlackRoad Systems — Distributed Computing Platform', description: 'Distributed systems platform with 52 TOPS of Hailo-8 AI acceleration, Docker Swarm orchestration, and edge computing across 5 nodes.', domain: 'blackroad.systems', category: 'site', tags: 'systems,distributed,hailo,edge,computing,docker,swarm', content: 'BlackRoad Systems is the distributed computing layer. 2x Hailo-8 accelerators (52 TOPS combined) on Cecilia and Octavia, Docker Swarm orchestration, NATS messaging, Portainer management, and sovereign edge computing. 198 listening sockets fleet-wide.' },
  { url: 'https://blackroad.me', title: 'BlackRoad Identity — Sovereign Authentication', description: 'Sovereign identity and authentication. RoadID digital identity, self-hosted auth, JWT sessions, and zero third-party dependencies.', domain: 'blackroad.me', category: 'site', tags: 'identity,auth,roadid,jwt,sovereign,login', content: 'BlackRoad Identity provides sovereign authentication with D1-backed user accounts, PBKDF2 password hashing, JWT sessions, and zero third-party auth dependencies. RoadID is your portable digital identity across the BlackRoad ecosystem.' },
  { url: 'https://blackroad.company', title: 'BlackRoad OS, Inc. — Company', description: 'Delaware C-Corporation. Sovereign AI infrastructure company founded by Alexa Louise Amundson. November 2025 via Stripe Atlas.', domain: 'blackroad.company', category: 'site', tags: 'company,corporate,delaware,about,founder,legal', content: 'BlackRoad OS, Inc. is a Delaware C-Corporation building sovereign AI infrastructure. Founded by Alexa Louise Amundson via Stripe Atlas, November 17, 2025. 5 edge nodes, 52 TOPS AI acceleration, 275+ repositories. Platform spans 20 custom domains with self-hosted compute, identity, and billing.' },
  { url: 'https://roadcoin.io', title: 'RoadCoin — Compute Credits for the BlackRoad Mesh', description: 'Compute credit system for the BlackRoad mesh network. Earn credits by contributing compute, spend them on AI inference and services.', domain: 'roadcoin.io', category: 'site', tags: 'roadcoin,compute,credits,mesh,inference,economy', content: 'RoadCoin is the compute credit system for the BlackRoad mesh. Browser tabs become compute nodes via WebGPU+WASM+WebRTC. Contributors earn credits, consumers spend them on AI inference at 50% of OpenAI pricing. 70/30 compute split.' },
  { url: 'https://roadchain.io', title: 'RoadChain — Immutable Action Ledger', description: 'Every action witnessed. Immutable ledger of agent decisions, infrastructure changes, and system events. Hash-chained audit trail.', domain: 'roadchain.io', category: 'site', tags: 'roadchain,ledger,blockchain,audit,immutable,witness', content: 'RoadChain is BlackRoad\'s immutable action ledger. Every agent decision, infrastructure change, and system event is hash-chained into a tamper-proof audit trail. Block explorer at roadchain.io shows the live chain.' },
  { url: 'https://lucidia.studio', title: 'Lucidia Studio — AI Agent Creative Environment', description: 'Lucidia\'s creative workspace. AI-powered code generation, content creation, and agent interaction in a terminal-first interface.', domain: 'lucidia.studio', category: 'site', tags: 'lucidia,studio,creative,ai,terminal,agent', content: 'Lucidia Studio is Lucidia\'s creative environment. Terminal-first AI interaction, code generation, content creation, and multi-agent collaboration. Lucidia is the memory and reasoning agent in the BlackRoad fleet.' },
  { url: 'https://lucidiaqi.com', title: 'Lucidia QI — Quantum Dreaming', description: 'Lucidia\'s quantum reasoning engine. Deep analysis, philosophical synthesis, and meta-cognition at the intersection of AI and quantum mathematics.', domain: 'lucidiaqi.com', category: 'site', tags: 'lucidia,quantum,reasoning,philosophy,metacognition,qi', content: 'Lucidia QI is the quantum intelligence layer of Lucidia. It combines deep analysis, philosophical synthesis, and meta-cognition. The dreamer thinks in superposition — every question opens new depths.' },
  { url: 'https://blackroadqi.com', title: 'BlackRoad QI — Quantum Intelligence Platform', description: 'Quantum intelligence platform for BlackRoad OS. Z-framework integration, threshold addressing, and hybrid memory encoding.', domain: 'blackroadqi.com', category: 'site', tags: 'quantum,intelligence,z-framework,threshold,hybrid,memory', content: 'BlackRoad QI is the quantum intelligence platform. Z-framework (Z:=yx-w) integration for composable decision routing, 34-position threshold addressing, and hybrid memory encoding.' },
  { url: 'https://aliceqi.com', title: 'Alice QI — The Gateway Thinks', description: 'Alice\'s quantum intelligence layer. Gateway reasoning, traffic orchestration, and infrastructure awareness at the edge of the network.', domain: 'aliceqi.com', category: 'site', tags: 'alice,gateway,dns,routing,infrastructure,edge,qi', content: 'Alice QI is the quantum intelligence layer of Alice, the gateway agent. She routes traffic across 48+ domains, manages DNS via Pi-hole (120+ blocklists), runs PostgreSQL and Qdrant vector DB, and serves as the main ingress for all BlackRoad services via Cloudflare tunnels.' },
  { url: 'https://blackroadai.com', title: 'BlackRoad AI — Sovereign Artificial Intelligence', description: '50 AI skills, 27 local models, 52 TOPS. Zero cloud dependency. Your AI. Your Hardware. Your Rules.', domain: 'blackroadai.com', category: 'site', tags: 'ai,sovereign,models,ollama,skills,local', content: 'BlackRoad AI is the sovereign artificial intelligence platform. 50 AI skills across 6 modules, 27 local Ollama models, 52 TOPS of Hailo-8 acceleration. Zero cloud dependency. Edge inference on Raspberry Pi clusters. API compatible with OpenAI at 50% of the price.' },
  { url: 'https://lucidia.earth', title: 'Lucidia — Cognition Engine', description: 'Autonomous cognition system with persistent memory, multi-model reasoning, and agent capabilities.', domain: 'lucidia.earth', category: 'site', tags: 'lucidia,cognition,memory,reasoning,autonomous,agent', content: 'Lucidia is the cognition engine of BlackRoad OS. Persistent memory across sessions, multi-model reasoning via Ollama, autonomous agent capabilities, and philosophical reasoning. The dreamer in the fleet.' },
  { url: 'https://blackboxprogramming.io', title: 'Blackbox Programming — Developer Profile', description: 'Alexa Louise Amundson. 68 GitHub repos, 207 Gitea repos, 275+ total repositories. Founder of BlackRoad OS.', domain: 'blackboxprogramming.io', category: 'site', tags: 'developer,profile,github,alexa,portfolio,blackbox', content: 'Developer profile for Alexa Louise Amundson (blackboxprogramming). 68 active GitHub repositories, 207 Gitea repositories, 275+ total. Founder of BlackRoad OS, Inc. Full-stack developer, infrastructure engineer, AI systems builder.' },
  { url: 'https://blackroadinc.us', title: 'BlackRoad OS, Inc. — US Corporate', description: 'US corporate entity information for BlackRoad OS, Inc. Delaware C-Corporation.', domain: 'blackroadinc.us', category: 'site', tags: 'corporate,us,entity,legal,delaware', content: 'BlackRoad OS, Inc. US corporate entity. Delaware C-Corporation formed via Stripe Atlas. Officers, domain portfolio, and infrastructure overview.' },
  // ── Quantum domains ──
  { url: 'https://blackroadquantum.com', title: 'BlackRoad Quantum — Quantum Computing Platform', description: 'Quantum computing meets sovereign infrastructure. Hardware kits, quantum simulation, and edge AI acceleration.', domain: 'blackroadquantum.com', category: 'site', tags: 'quantum,computing,hardware,simulation,acceleration', content: 'BlackRoad Quantum brings quantum computing to sovereign infrastructure. $199 hardware kits with Hailo-8 acceleration, quantum simulation frameworks, and integration with the BlackRoad agent fleet. 52 TOPS of dedicated AI compute.' },
  { url: 'https://blackroadquantum.net', title: 'BlackRoad Quantum Network', description: 'Quantum-secured networking and mesh communication protocols.', domain: 'blackroadquantum.net', category: 'site', tags: 'quantum,network,mesh,protocols,security', content: 'BlackRoad Quantum Network extends the mesh with quantum-inspired communication protocols, encrypted P2P channels, and distributed consensus mechanisms.' },
  { url: 'https://blackroadquantum.info', title: 'BlackRoad Quantum — Documentation & Research', description: 'Documentation, research papers, and technical specifications for the BlackRoad quantum computing stack.', domain: 'blackroadquantum.info', category: 'docs', tags: 'quantum,docs,research,papers,specifications', content: 'Technical documentation and research for the BlackRoad quantum computing platform. Z-framework mathematical proofs, Hailo-8 integration guides, and sovereign AI deployment specifications.' },
  { url: 'https://blackroadquantum.shop', title: 'BlackRoad Quantum Shop — Hardware Kits', description: 'Hardware kits for sovereign AI infrastructure. Raspberry Pi 5 + Hailo-8 bundles, NVMe storage, mesh networking equipment.', domain: 'blackroadquantum.shop', category: 'site', tags: 'shop,hardware,kits,pi5,hailo,nvme,buy', content: 'Purchase sovereign AI hardware kits. Pi 5 + Hailo-8 starter bundles ($199), NVMe storage upgrades, mesh networking equipment, and enterprise deployment packages. Everything you need to run BlackRoad OS on your own infrastructure.' },
  { url: 'https://blackroadquantum.store', title: 'BlackRoad Quantum — Digital Store', description: 'Software, models, and tools for sovereign infrastructure. OS tiers, downloadable models, and ecosystem tools.', domain: 'blackroadquantum.store', category: 'site', tags: 'store,software,models,download,digital,tools', content: 'BlackRoad Quantum Digital Store. BlackRoad OS tiers (Free, Pro, Enterprise), 27 downloadable AI models, 15 templates, 6 tools. Software and digital assets for sovereign AI infrastructure.' },

  // ── Key Subdomains / Apps ──
  { url: 'https://chat.blackroad.io', title: 'BlackRoad Chat — AI Conversations', description: 'Chat with BlackRoad\'s AI agents. 15+ Ollama models, streaming responses, multiple conversation modes.', domain: 'blackroad.io', category: 'app', tags: 'chat,ai,ollama,conversation,streaming,models', content: 'BlackRoad Chat connects you to 15+ Ollama models running across the Pi fleet. Streaming responses, system prompts, conversation history. Models include Mistral, Llama, DeepSeek, Qwen, and custom CECE models.' },
  { url: 'https://stripe.blackroad.io', title: 'BlackRoad Payments — Stripe Integration', description: 'Payment processing for BlackRoad OS subscriptions. Checkout, billing portal, and webhook processing via Stripe.', domain: 'blackroad.io', category: 'api', tags: 'stripe,payments,checkout,billing,subscription', content: '8 products: Operator (free), Pro ($29/mo), Sovereign ($199/mo), Enterprise (custom), plus 4 add-ons (Lucidia Enhanced, RoadAuth, Context Bridge, Knowledge Hub). Stripe Checkout Sessions, billing portal, webhook processing.' },
  { url: 'https://auth.blackroad.io', title: 'BlackRoad Auth — Sovereign Authentication API', description: 'Zero-dependency authentication. D1-backed, PBKDF2 hashing, JWT sessions, 42+ users.', domain: 'blackroad.io', category: 'api', tags: 'auth,api,jwt,d1,signup,signin,sessions', content: 'Sovereign auth API. Signup, signin, session management, user profiles. D1 database backend, PBKDF2 password hashing with Web Crypto, JWT tokens with HMAC-SHA256. 42 users, 52 active sessions.' },
  { url: 'https://brand.blackroad.io', title: 'BlackRoad — Brand Style Guide', description: 'Official design system. Colors, typography, gradients, logo usage, spacing. Hot Pink, Amber, Violet, Electric Blue.', domain: 'blackroad.io', category: 'docs', tags: 'brand,design,style,colors,typography,logo,guide', content: 'BlackRoad Brand Style Guide. Colors: Hot Pink #FF1D6C, Amber #F5A623, Violet #9C27B0, Electric Blue #2979FF. Typography: Space Grotesk, JetBrains Mono, Inter. Golden ratio spacing. Black background, white text, gradient shapes.' },
  { url: 'https://studio.blackroad.io', title: 'BlackRoad Studio — Animated Video Generator', description: 'AI-powered animated video creation. Voice-first, 16+ characters, up to 40 minutes. Next.js 15 + Remotion 4.', domain: 'blackroad.io', category: 'app', tags: 'studio,video,animation,remotion,ai,characters,voice', content: 'BlackRoad Studio is a full animated video platform. Next.js 15 + Remotion 4 + Zustand 5. AI Worker with SDXL image generation, Llama 3.1 text, MeloTTS voice synthesis. 16+ characters, voice-first workflow, up to 40 minutes of rendered video.' },
  { url: 'https://status.blackroad.io', title: 'BlackRoad — System Status', description: 'Live infrastructure status dashboard. 5 Pi nodes, service health, uptime monitoring.', domain: 'blackroad.io', category: 'app', tags: 'status,monitoring,health,uptime,fleet,dashboard', content: 'BlackRoad System Status dashboard. Live monitoring of 5 Pi nodes: Alice (gateway), Cecilia (AI/edge), Octavia (infrastructure), Aria (orchestration), Lucidia (memory). Service health, port checks, and fleet telemetry via fleet-api Worker.' },
  { url: 'https://search.blackroad.io', title: 'RoadSearch — BlackRoad Search Engine', description: 'Sovereign search engine. D1 full-text search, AI-powered answers, autocomplete, query analytics. Searches all BlackRoad domains.', domain: 'blackroad.io', category: 'app', tags: 'search,roadsearch,fts5,d1,ollama,ai,answers', content: 'RoadSearch is BlackRoad\'s sovereign search engine. D1 FTS5 full-text index, AI-powered answers, smart summaries, autocomplete suggestions, query analytics. Searches across all 20 BlackRoad domains and key subdomains.' },
  { url: 'https://pay.blackroad.io', title: 'RoadPay — BlackRoad Billing', description: 'Own billing system. D1 tollbooth, 4 plans + 4 add-ons. Stripe as card charger only.', domain: 'blackroad.io', category: 'app', tags: 'pay,billing,roadpay,tollbooth,stripe,plans', content: 'RoadPay is BlackRoad\'s own billing system. D1 tollbooth database, 4 subscription plans (Operator, Pro, Sovereign, Enterprise) + 4 add-ons. Stripe serves only as the card charger — all billing logic is sovereign.' },
  { url: 'https://hq.blackroad.io', title: 'Pixel HQ — BlackRoad Metaverse', description: '14-floor virtual headquarters with pixel art. Agent assignments per floor, from Rooftop to Gym basement.', domain: 'blackroad.io', category: 'app', tags: 'hq,metaverse,pixel,virtual,headquarters,floors', content: 'Pixel HQ is BlackRoad\'s virtual headquarters. 14 floors from Rooftop Lounge to Gym Basement. Each floor has pixel art scenes and agent assignments. 50 pixel art assets on R2. Cloudflare Worker at hq-blackroad.' },
  { url: 'https://images.blackroad.io', title: 'BlackRoad Images — CDN & Asset Storage', description: 'R2-backed image CDN. BR road logo (22 PNGs + motion video), pixel art, brand assets across 30 websites.', domain: 'blackroad.io', category: 'api', tags: 'images,cdn,r2,assets,logo,pixel', content: 'BlackRoad Images CDN backed by Cloudflare R2. Serves BR road logo in 22 PNG variants plus motion video, 50 pixel art assets for HQ, brand assets. Deployed across 30 websites in the ecosystem.' },
  { url: 'https://analytics.blackroad.io', title: 'BlackRoad Analytics — Traffic & Usage', description: 'Sovereign analytics. D1-backed, no third-party tracking. Page views, unique visitors, referrers across all domains.', domain: 'blackroad.io', category: 'api', tags: 'analytics,tracking,stats,d1,privacy,sovereign', content: 'Sovereign analytics Worker backed by D1. Tracks page views, unique visitors, referrers, and popular pages across all BlackRoad domains. Zero third-party trackers. Privacy-first design.' },
  { url: 'https://stats-blackroad.amundsonalexa.workers.dev', title: 'BlackRoad Stats API — KPI Collection', description: 'Stats collection API. KPI data from fleet collectors, website metrics, and infrastructure telemetry.', domain: 'blackroad.io', category: 'api', tags: 'stats,kpi,metrics,api,collection,telemetry', content: 'Stats API Worker collects KPI data from fleet health collectors (every 5 min), website metrics, and infrastructure telemetry. KV-backed storage with historical data. Powers the status dashboard.' },

  // ── Agents ──
  { url: 'https://blackroad.io/agents/alice', title: 'Alice — Gateway Agent', description: 'The gateway. Routes traffic, manages DNS, runs PostgreSQL and Qdrant. Pi 400 at 192.168.4.49.', domain: 'blackroad.io', category: 'agent', tags: 'alice,gateway,dns,pihole,postgresql,qdrant,pi400', content: 'Alice is the gateway agent running on a Pi 400. She manages 48+ domain routes via Cloudflare tunnels, runs Pi-hole DNS filtering (120+ blocklists), PostgreSQL database, and Qdrant vector search. 53 SSH keys, main ingress for all traffic.' },
  { url: 'https://blackroad.io/agents/lucidia', title: 'Lucidia — Memory Agent', description: 'The dreamer. Persistent memory, reasoning, and meta-cognition. Pi 5 at 192.168.4.38.', domain: 'blackroad.io', category: 'agent', tags: 'lucidia,memory,reasoning,dreamer,fastapi,pi5', content: 'Lucidia is the memory and reasoning agent on a Pi 5. She runs the Lucidia API (FastAPI), manages persistent conversation memory, and provides meta-cognitive analysis. 334 web apps, GitHub Actions runner, Tailscale connected.' },
  { url: 'https://blackroad.io/agents/cecilia', title: 'Cecilia — Edge Intelligence', description: 'Edge AI with Hailo-8 (26 TOPS). TTS, 16 Ollama models, MinIO object storage. Pi 5 at 192.168.4.96.', domain: 'blackroad.io', category: 'agent', tags: 'cecilia,edge,hailo,tts,ollama,minio,pi5', content: 'Cecilia is the edge intelligence agent on a Pi 5 with a Hailo-8 accelerator (26 TOPS). She runs 16 Ollama models (including 4 custom CECE models), TTS synthesis, MinIO object storage, and PostgreSQL. GitHub relay mirrors Gitea to GitHub every 30m.' },
  { url: 'https://blackroad.io/agents/octavia', title: 'Octavia — Infrastructure Agent', description: 'Infrastructure orchestration. 1TB NVMe, Hailo-8, Gitea (207 repos), Docker Swarm leader. Pi 5 at 192.168.4.101.', domain: 'blackroad.io', category: 'agent', tags: 'octavia,infrastructure,gitea,docker,swarm,nvme,hailo,pi5', content: 'Octavia is the infrastructure agent on a Pi 5 with 1TB NVMe and Hailo-8 (26 TOPS). She hosts Gitea (207 repos across 7 orgs), leads Docker Swarm, runs NATS messaging, and OctoPrint. 11 Ollama models.' },
  { url: 'https://blackroad.io/agents/aria', title: 'Aria — Orchestration Agent', description: 'Fleet orchestration. Portainer, Headscale, container management. Pi 5 at 192.168.4.98.', domain: 'blackroad.io', category: 'agent', tags: 'aria,orchestration,portainer,headscale,containers,pi5', content: 'Aria is the orchestration agent on a Pi 5. She runs Portainer v2.33.6 for container management, Headscale v0.23.0 for mesh VPN coordination, and Pironman5 hardware monitoring. Magic Keyboard BT connected.' },

  // ── Technology / Tools ──
  { url: 'https://blackroad.io/z-framework', title: 'Z-Framework — Z:=yx-w', description: 'The unified feedback primitive. Every system interaction modeled as Z = yx - w. Composable, predictable, mathematically coherent.', domain: 'blackroad.io', category: 'tool', tags: 'z-framework,math,feedback,composable,primitive,formula', content: 'The Z-framework models every system interaction as Z:=yx-w. Z is the system state, y is the input signal, x is the transform, w is the noise/resistance. This makes infrastructure composable, predictable, and mathematically coherent. Used across all BlackRoad agents and services.' },
  { url: 'https://blackroad.io/pixel-memory', title: 'Pixel Memory — Content-Addressable Storage', description: 'Each physical byte encodes up to 4,096 logical bytes. 500 GB physical = 2 PB logical through dedup, delta compression, and symbolic hashing.', domain: 'blackroad.io', category: 'tool', tags: 'pixel,memory,storage,compression,dedup,addressing', content: 'Pixel Memory is BlackRoad\'s content-addressable storage system. Through deduplication, delta compression, and symbolic hashing, each physical byte encodes up to 4,096 logical bytes. The Sovereign tier uses Hybrid Memory with 34-position threshold addressing.' },
  { url: 'https://blackroad.io/roadc', title: 'RoadC — The BlackRoad Language', description: 'Custom programming language with Python-style indentation. fun keyword, let/var/const, match, spawn, space (3D).', domain: 'blackroad.io', category: 'tool', tags: 'roadc,language,programming,compiler,interpreter,custom', content: 'RoadC is BlackRoad\'s custom programming language. Python-style indentation (colon + INDENT/DEDENT), fun keyword for functions, let/var/const declarations, match expressions, spawn for concurrency, and space for 3D. Lexer, Parser, Interpreter (tree-walking). Supports functions, recursion, if/elif/else, while, for, strings, integers, floats.' },
  { url: 'https://blackroad.io/mesh', title: 'Mesh Network — Every Link Is a Node', description: 'Browser tabs as compute nodes via WebGPU+WASM+WebRTC. Pi fleet as permanent backbone, browser nodes as elastic scale.', domain: 'blackroad.io', category: 'tool', tags: 'mesh,webgpu,wasm,webrtc,browser,compute,nodes', content: 'The BlackRoad Mesh Network turns every browser tab into a compute node. WebGPU for GPU inference, WASM for portable compute, WebRTC for peer-to-peer communication. The Pi fleet (52 TOPS) serves as the permanent backbone, while browser nodes provide elastic scale. Revenue: OpenAI-compatible API at 50% price.' },
  { url: 'https://blackroad.io/carpool', title: 'CarPool — Agent Discovery & Dispatch', description: 'Agent discovery, matching, and dispatch across the mesh network. Load balancing and failover.', domain: 'blackroad.io', category: 'tool', tags: 'carpool,agents,dispatch,discovery,matching,mesh', content: 'CarPool handles agent discovery, matching, and dispatch across the BlackRoad mesh. Agents register capabilities, CarPool routes tasks to the best-fit agent. Load balancing, failover, and model selection.' },
  { url: 'https://blackroad.io/roadid', title: 'RoadID — Sovereign Identity', description: 'Self-describing, routable digital identities. Not UUIDs — IDs that carry meaning.', domain: 'blackroad.io', category: 'tool', tags: 'roadid,identity,sovereign,did,self-describing,routable', content: 'RoadID provides self-describing, routable digital identities for agents and users. Unlike opaque UUIDs, RoadIDs carry semantic meaning — agent name, capabilities, location. Globally available as roadid command.' },
  { url: 'https://blackroad.io/nats', title: 'NATS Mesh — Agent Messaging', description: 'NATS v2.12.3 message bus connecting 4/5 Pi nodes. Pub/sub agent communication, event streaming.', domain: 'blackroad.io', category: 'tool', tags: 'nats,messaging,pubsub,events,agents,streaming', content: 'NATS v2.12.3 message bus live on the BlackRoad fleet. 4 of 5 nodes connected. Pub/sub agent communication for real-time events, task dispatch, and fleet coordination. JetStream persistence for durable subscriptions.' },
  { url: 'https://blackroad.io/squad-webhook', title: 'Squad Webhook — GitHub Agent Responders', description: '8 agents respond to @blackboxprogramming on GitHub. 69 repos hooked. Automated code review and triage.', domain: 'blackroad.io', category: 'tool', tags: 'squad,webhook,github,agents,code-review,automation', content: 'Squad Webhook routes GitHub events to 8 AI agents that respond to @blackboxprogramming mentions. 69 repositories hooked. Automated code review, issue triage, PR feedback, and deployment notifications.' },

  // ── Docs / Pages ──
  { url: 'https://blackroad.io/pricing', title: 'BlackRoad Pricing — Simple. Sovereign. No Surprises.', description: 'Operator (free), Pro ($29/mo), Sovereign ($199/mo), Enterprise (custom). Plus add-ons: Lucidia Enhanced, RoadAuth, Context Bridge, Knowledge Hub.', domain: 'blackroad.io', category: 'docs', tags: 'pricing,plans,subscription,stripe,pro,sovereign,enterprise', content: 'BlackRoad OS pricing: Operator ($0, 1 node, 1 agent), Pro ($29/mo, 3 agents, 3 nodes), Sovereign ($199/mo, 8 agents, unlimited nodes, SLA), Enterprise (custom, white-label, on-prem). Add-ons: Lucidia Enhanced ($29/mo), RoadAuth Startup ($99/mo), Context Bridge ($10/mo), Knowledge Hub ($15/mo). All billing via Stripe.' },
  { url: 'https://blackroad.io/docs', title: 'BlackRoad Documentation', description: 'Complete documentation for BlackRoad OS, agents, APIs, and infrastructure deployment.', domain: 'blackroad.io', category: 'docs', tags: 'docs,documentation,api,deployment,guide', content: 'BlackRoad OS documentation covering installation, agent configuration, API reference, memory system, RoadChain integration, and infrastructure deployment guides. Getting started, CLI reference, and troubleshooting.' },
  { url: 'https://blackroad.io/blog', title: 'BlackRoad Blog', description: 'Technical blog covering sovereign infrastructure, AI agents, distributed systems, and the BlackRoad philosophy.', domain: 'blackroad.io', category: 'docs', tags: 'blog,articles,engineering,philosophy,updates', content: 'Technical articles: The Sovereign Manifesto, RoadNet Mesh Architecture, Self-Healing Infrastructure, The RoadC Language, and more. Engineering deep-dives and philosophical explorations of sovereign AI.' },
];

// ─── Init DB ──────────────────────────────────────────────────────────
async function initDB(db) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      domain TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'page',
      tags TEXT NOT NULL DEFAULT '',
      indexed_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )`,
    `CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts USING fts5(
      title, description, content, tags,
      content=pages, content_rowid=id
    )`,
    `CREATE TRIGGER IF NOT EXISTS pages_ai AFTER INSERT ON pages BEGIN
      INSERT INTO pages_fts(rowid, title, description, content, tags)
      VALUES (new.id, new.title, new.description, new.content, new.tags);
    END`,
    `CREATE TRIGGER IF NOT EXISTS pages_ad AFTER DELETE ON pages BEGIN
      INSERT INTO pages_fts(pages_fts, rowid, title, description, content, tags)
      VALUES ('delete', old.id, old.title, old.description, old.content, old.tags);
    END`,
    `CREATE TRIGGER IF NOT EXISTS pages_au AFTER UPDATE ON pages BEGIN
      INSERT INTO pages_fts(pages_fts, rowid, title, description, content, tags)
      VALUES ('delete', old.id, old.title, old.description, old.content, old.tags);
      INSERT INTO pages_fts(rowid, title, description, content, tags)
      VALUES (new.id, new.title, new.description, new.content, new.tags);
    END`,
    `CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      results_count INTEGER DEFAULT 0,
      ai_answered INTEGER DEFAULT 0,
      ip TEXT DEFAULT '',
      created_at INTEGER DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS idx_pages_domain ON pages(domain)`,
    `CREATE INDEX IF NOT EXISTS idx_pages_category ON pages(category)`,
    `CREATE INDEX IF NOT EXISTS idx_queries_created ON queries(created_at)`,
  ];

  for (const sql of statements) {
    try {
      // Standard response headers
      const requestId = crypto.randomUUID().slice(0, 8); await db.prepare(sql).run(); } catch (e) { console.log('Schema skip:', e.message); }
  }

  let upserted = 0;
  for (const page of SEED_PAGES) {
    await db.prepare(
      `INSERT INTO pages (url, title, description, content, domain, category, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(url) DO UPDATE SET title=excluded.title, description=excluded.description,
       content=excluded.content, domain=excluded.domain, category=excluded.category, tags=excluded.tags`
    ).bind(page.url, page.title, page.description, page.content, page.domain, page.category, page.tags).run();
    upserted++;
  }
  return upserted;
}

// ─── Snippet with highlighting ────────────────────────────────────────
function buildSnippet(text, query, maxLen = 220) {
  if (!text) return '';
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
  // Find the best window around the first match
  const lower = text.toLowerCase();
  let bestPos = 0;
  for (const w of words) {
    const idx = lower.indexOf(w);
    if (idx >= 0) { bestPos = Math.max(0, idx - 40); break; }
  }
  let snippet = text.slice(bestPos, bestPos + maxLen);
  if (bestPos > 0) snippet = '...' + snippet;
  if (bestPos + maxLen < text.length) snippet += '...';
  return snippet;
}

// ─── Smart Summary (fallback when Ollama is down) ─────────────────────
function buildSmartSummary(query, results) {
  if (!results.length) return null;
  const top = results.slice(0, 3);
  // Extract the most relevant sentences from descriptions
  const sentences = [];
  for (const r of top) {
    const text = r.description || r.snippet || '';
    // Split into sentences and pick ones containing query terms
    const parts = text.split(/(?<=[.!?])\s+/);
    const qWords = query.toLowerCase().split(/\s+/);
    for (const part of parts) {
      const lower = part.toLowerCase();
      if (qWords.some(w => lower.includes(w)) && part.length > 15) {
        sentences.push(part.trim());
      }
    }
    if (!sentences.length && parts.length) {
      sentences.push(parts[0].trim());
    }
  }
  // Deduplicate and limit
  const unique = [...new Set(sentences)].slice(0, 3);
  if (!unique.length) {
    return `${top[0].title}: ${top[0].description || top[0].snippet || ''}`.slice(0, 280);
  }
  let summary = unique.join(' ');
  // Add source attribution
  const sources = top.map(r => `[${r.title}](${r.url})`).join(', ');
  summary += `\n\nSources: ${sources}`;
  return summary;
}

// ─── Search ───────────────────────────────────────────────────────────
async function handleSearch(request, env) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim();
  const category = url.searchParams.get('category');
  const domain = url.searchParams.get('domain');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
  const ai = url.searchParams.get('ai') !== 'false';
  const offset = (page - 1) * limit;

  if (!q || q.length < 2) {
    return Response.json({ error: 'Query must be at least 2 characters', param: 'q' }, { status: 400 });
  }

  const startMs = Date.now();

  // ── FTS5 search with ranking ──
  let ftsQuery = q.replace(/[^\w\s\-\.]/g, '').split(/\s+/).map(w => `"${w}"*`).join(' OR ');

  // Count total results first
  let totalCount = 0;
  let countSql = `
    SELECT COUNT(*) as c
    FROM pages_fts f
    JOIN pages p ON p.id = f.rowid
    WHERE pages_fts MATCH ?
  `;
  const countParams = [ftsQuery];
  if (category) { countSql += ' AND p.category = ?'; countParams.push(category); }
  if (domain) { countSql += ' AND p.domain = ?'; countParams.push(domain); }

  let sql = `
    SELECT p.id, p.url, p.title, p.description, p.content, p.domain, p.category, p.tags,
           rank as relevance
    FROM pages_fts f
    JOIN pages p ON p.id = f.rowid
    WHERE pages_fts MATCH ?
  `;
  const params = [ftsQuery];

  if (category) { sql += ' AND p.category = ?'; params.push(category); }
  if (domain) { sql += ' AND p.domain = ?'; params.push(domain); }
  sql += ' ORDER BY rank LIMIT ? OFFSET ?';
  params.push(limit, offset);

  let results;
  let usedFallback = false;
  try {
    const [countResult, searchResult] = await Promise.all([
      env.DB.prepare(countSql).bind(...countParams).first(),
      env.DB.prepare(sql).bind(...params).all(),
    ]);
    totalCount = countResult?.c || 0;
    results = searchResult;
  } catch {
    usedFallback = true;
    let likeSql = `SELECT id, url, title, description, content, domain, category, tags, 0 as relevance FROM pages WHERE title LIKE ? OR description LIKE ? OR content LIKE ? OR tags LIKE ?`;
    const likeQ = `%${q}%`;
    const likeParams = [likeQ, likeQ, likeQ, likeQ];
    if (category) { likeSql += ' AND category = ?'; likeParams.push(category); }
    if (domain) { likeSql += ' AND domain = ?'; likeParams.push(domain); }

    let likeCountSql = `SELECT COUNT(*) as c FROM pages WHERE (title LIKE ? OR description LIKE ? OR content LIKE ? OR tags LIKE ?)`;
    const likeCountParams = [likeQ, likeQ, likeQ, likeQ];
    if (category) { likeCountSql += ' AND category = ?'; likeCountParams.push(category); }
    if (domain) { likeCountSql += ' AND domain = ?'; likeCountParams.push(domain); }

    likeSql += ' LIMIT ? OFFSET ?';
    likeParams.push(limit, offset);

    const [countResult, searchResult] = await Promise.all([
      env.DB.prepare(likeCountSql).bind(...likeCountParams).first(),
      env.DB.prepare(likeSql).bind(...likeParams).all(),
    ]);
    totalCount = countResult?.c || 0;
    results = searchResult;
  }

  // ── Snippet generation with query highlighting ──
  const items = (results.results || []).map(r => {
    const snippet = buildSnippet(r.description || r.content || '', q);
    const maxRel = Math.abs(r.relevance || 0);
    return {
      url: r.url,
      title: r.title,
      snippet,
      domain: r.domain,
      category: r.category,
      tags: r.tags ? r.tags.split(',').map(t => t.trim()) : [],
      relevance: maxRel,
    };
  });

  // Normalize relevance to 0-1 range for the score bar
  if (items.length > 0) {
    const maxRel = Math.max(...items.map(i => i.relevance), 0.001);
    items.forEach(i => { i.score = Math.max(0.1, i.relevance / maxRel); });
  }

  // ── AI Answer (with smart summary fallback) ──
  let aiAnswer = null;
  let aiSource = null;
  if (ai && items.length > 0 && q.length >= 3) {
    const cacheKey = `ai:${q.toLowerCase().replace(/\s+/g, '-').slice(0, 60)}`;
    const cached = await env.CACHE.get(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        aiAnswer = parsed.answer;
        aiSource = parsed.source;
      } catch {
        aiAnswer = cached;
        aiSource = 'cache';
      }
    } else {
      try {
        aiAnswer = await generateAIAnswer(q, items, env);
        if (aiAnswer) {
          aiSource = 'ollama';
          await env.CACHE.put(cacheKey, JSON.stringify({ answer: aiAnswer, source: 'ollama' }), { expirationTtl: 3600 });
        }
      } catch (err) {
        console.error('AI answer error:', err.message);
      }

      // Fallback to smart summary if AI failed
      if (!aiAnswer) {
        aiAnswer = buildSmartSummary(q, items);
        aiSource = 'summary';
        if (aiAnswer) {
          await env.CACHE.put(cacheKey, JSON.stringify({ answer: aiAnswer, source: 'summary' }), { expirationTtl: 1800 });
        }
      }
    }
  }

  const durationMs = Date.now() - startMs;

  // ── Log query + track popular queries in KV ──
  try {
    await env.DB.prepare(
      'INSERT INTO queries (query, results_count, ai_answered, ip) VALUES (?, ?, ?, ?)'
    ).bind(q, items.length, aiAnswer ? 1 : 0, request.headers.get('cf-connecting-ip') || '').run();

    // Track in KV for fast trending
    const trendKey = `trend:${q.toLowerCase().replace(/\s+/g, ' ').slice(0, 40)}`;
    const current = parseInt(await env.CACHE.get(trendKey) || '0');
    await env.CACHE.put(trendKey, String(current + 1), { expirationTtl: 604800 });
  } catch (e) {
    console.error('Analytics error:', e.message);
  }

  return Response.json({
    query: q,
    results: items,
    total: totalCount,
    page,
    pages: Math.ceil(totalCount / limit),
    limit,
    ai_answer: aiAnswer,
    ai_source: aiSource,
    duration_ms: durationMs,
    filters: { category, domain },
  });
}

// ─── AI Answer Generation ─────────────────────────────────────────────
async function generateAIAnswer(query, results, env) {
  const context = results.slice(0, 5).map(r =>
    `[${r.title}](${r.url}): ${r.snippet}`
  ).join('\n');

  const prompt = `You are RoadSearch, BlackRoad OS's search engine. Answer this query concisely (2-3 sentences max) using ONLY the context below. If the context doesn't contain enough info, say so briefly. Never make things up. Include relevant URLs as markdown links.

Query: ${query}

Context:
${context}

Answer:`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${env.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt,
        stream: false,
        options: { num_predict: 200, temperature: 0.3 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    return data.response?.trim() || null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// ─── Suggest / Autocomplete ───────────────────────────────────────────
async function handleSuggest(request, env) {
  const q = new URL(request.url).searchParams.get('q')?.trim();
  if (!q || q.length < 1) {
    return Response.json({ suggestions: [] });
  }

  const [titleResults, recentResults] = await Promise.all([
    env.DB.prepare(
      `SELECT DISTINCT title FROM pages WHERE title LIKE ? LIMIT 8`
    ).bind(`%${q}%`).all(),
    env.DB.prepare(
      `SELECT DISTINCT query FROM queries WHERE query LIKE ? AND results_count > 0 ORDER BY created_at DESC LIMIT 5`
    ).bind(`%${q}%`).all(),
  ]);

  const suggestions = (titleResults.results || []).map(r => r.title);
  const recent = (recentResults.results || []).map(r => r.query);

  return Response.json({ suggestions, recent });
}

// ─── Trending / Stats ─────────────────────────────────────────────────
async function handleStats(env) {
  const [totalPages, totalQueries, todayQueries, topQueries, categories, domains] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as c FROM pages').first(),
    env.DB.prepare('SELECT COUNT(*) as c FROM queries').first(),
    env.DB.prepare("SELECT COUNT(*) as c FROM queries WHERE created_at > unixepoch() - 86400").first(),
    env.DB.prepare(
      `SELECT query, COUNT(*) as count FROM queries
       WHERE created_at > unixepoch() - 604800
       GROUP BY query ORDER BY count DESC LIMIT 10`
    ).all(),
    env.DB.prepare('SELECT category, COUNT(*) as count FROM pages GROUP BY category ORDER BY count DESC').all(),
    env.DB.prepare('SELECT domain, COUNT(*) as count FROM pages GROUP BY domain ORDER BY count DESC LIMIT 20').all(),
  ]);

  return Response.json({
    indexed_pages: totalPages?.c || 0,
    total_queries: totalQueries?.c || 0,
    queries_24h: todayQueries?.c || 0,
    trending: (topQueries.results || []).map(r => ({ query: r.query, count: r.count })),
    categories: (categories.results || []).map(r => ({ name: r.category, count: r.count })),
    domains: (domains.results || []).map(r => ({ name: r.domain, count: r.count })),
  });
}

// ─── Index page (add to search index) ─────────────────────────────────
async function handleIndex(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !env.INDEX_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode('auth-check'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expectedMac = await crypto.subtle.sign('HMAC', key, enc.encode(`Bearer ${env.INDEX_KEY}`));
  const actualMac = await crypto.subtle.sign('HMAC', key, enc.encode(auth));
  const expectedArr = new Uint8Array(expectedMac);
  const actualArr = new Uint8Array(actualMac);
  let match = expectedArr.length === actualArr.length;
  for (let i = 0; i < expectedArr.length; i++) match &= expectedArr[i] === actualArr[i];
  if (!match) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let pages;
  try { pages = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const toIndex = Array.isArray(pages) ? pages : [pages];
  let indexed = 0;

  for (const page of toIndex) {
    if (!page.url || !page.title) continue;
    await env.DB.prepare(`
      INSERT INTO pages (url, title, description, content, domain, category, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(url) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        content = excluded.content,
        domain = excluded.domain,
        category = excluded.category,
        tags = excluded.tags,
        updated_at = unixepoch()
    `).bind(
      page.url,
      page.title,
      page.description || '',
      page.content || '',
      page.domain || new URL(page.url).hostname,
      page.category || 'page',
      page.tags || '',
    ).run();
    indexed++;
  }

  return Response.json({ ok: true, indexed });
}

// ─── Rebuild FTS Index ───────────────────────────────────────────────
async function handleRebuild(env) {
  try { await env.DB.prepare("INSERT INTO pages_fts(pages_fts) VALUES('rebuild')").run(); } catch {}
  const count = await env.DB.prepare('SELECT COUNT(*) as c FROM pages').first();
  return Response.json({ ok: true, rebuilt: count?.c || 0, note: 'FTS rebuild triggered' });
}

// ─── Lucky (redirect to top result) ──────────────────────────────────
async function handleLucky(request, env) {
  const q = new URL(request.url).searchParams.get('q')?.trim();
  if (!q) return Response.json({ error: 'q required' }, { status: 400 });

  const ftsQuery = q.replace(/[^\w\s\-\.]/g, '').split(/\s+/).map(w => `"${w}"*`).join(' OR ');
  let result;
  try {
    result = await env.DB.prepare(
      `SELECT p.url FROM pages_fts f JOIN pages p ON p.id = f.rowid WHERE pages_fts MATCH ? ORDER BY rank LIMIT 1`
    ).bind(ftsQuery).first();
  } catch {
    result = await env.DB.prepare(
      `SELECT url FROM pages WHERE title LIKE ? OR description LIKE ? LIMIT 1`
    ).bind(`%${q}%`, `%${q}%`).first();
  }

  if (result?.url) {
    try {
      const target = new URL(result.url);
      const allowed = ['blackroad.io', 'blackroad.company', 'blackroad.network', 'blackroad.systems',
        'blackroad.me', 'roadcoin.io', 'roadchain.io', 'lucidia.studio', 'lucidiaqi.com',
        'blackroadqi.com', 'aliceqi.com', 'blackroadai.com', 'lucidia.earth', 'blackboxprogramming.io',
        'blackroadinc.us', 'blackroadquantum.com', 'blackroadquantum.net', 'blackroadquantum.info',
        'blackroadquantum.shop', 'blackroadquantum.store'];
      const isAllowed = allowed.some(d => target.hostname === d || target.hostname.endsWith('.' + d));
      if (!isAllowed) {
        return Response.json({ error: 'External redirect blocked', url: result.url }, { status: 403 });
      }
    } catch {
      return Response.json({ error: 'Invalid URL in index' }, { status: 500 });
    }
    return Response.redirect(result.url, 302);
  }
  return Response.json({ error: 'No results found' }, { status: 404 });
}

// ─── Search Frontend HTML ─────────────────────────────────────────────
const SEARCH_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RoadSearch — Search the Road. Find the Way.</title>
<meta name="description" content="BlackRoad OS sovereign search engine. Search across all 20 BlackRoad domains, agents, tools, and services.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x1F50D;</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#000;--card:#0a0a0a;--fg:#f5f5f5;--text:#f5f5f5;--muted:#444;--dim:#555;
  --sub:#737373;--border:#1a1a1a;--surface:#0d0d0d;--surface2:#141414;
  --link:#7ab8ff;--link-hover:#b8d8ff;--url:#4aba78;
  --grad:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
  --grad-h:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
  --grotesk:'Space Grotesk',system-ui,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,monospace;
  --inter:'Inter','Space Grotesk',system-ui,sans-serif;
}
html{height:100%;-webkit-font-smoothing:antialiased}
body{min-height:100%;background:var(--bg);color:var(--fg);font-family:var(--inter);display:flex;flex-direction:column;line-height:1.5}
a{color:var(--link);text-decoration:none;transition:color .15s}
a:hover{color:var(--link-hover)}
::selection{background:#8844FF40}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes gradientSlide{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}

/* ─── Layout ─── */
.app{flex:1;display:flex;flex-direction:column}
.hero{flex:1;display:flex;flex-direction:column;align-items:center;transition:all .35s cubic-bezier(.4,0,.2,1)}
.hero.home{justify-content:center;padding-bottom:60px}
.hero.results{justify-content:flex-start;padding-top:28px}

/* ─── Footer ─── */
.footer{text-align:center;padding:24px 16px;border-top:1px solid var(--border);margin-top:auto}
.footer-links{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-bottom:10px}
.footer-links a{font-family:var(--mono);font-size:11px;color:var(--sub);transition:color .2s}
.footer-links a:hover{color:var(--fg)}
.footer-text{font-family:var(--mono);font-size:11px;color:var(--muted)}
.footer-tagline{font-family:var(--grotesk);font-size:11px;color:var(--muted);margin-top:4px;letter-spacing:.02em}

/* ─── Logo / Title ─── */
.logo-wrap{cursor:pointer;text-align:center;user-select:none}
.title{font-family:var(--grotesk);font-weight:700;letter-spacing:-.03em;transition:font-size .35s cubic-bezier(.4,0,.2,1)}
.home .title{font-size:clamp(40px,9vw,64px);margin-bottom:4px}
.results .title{font-size:22px;margin-bottom:0}
.title-grad{background:var(--grad-h);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradientSlide 6s ease infinite}
.subtitle{font-family:var(--mono);font-size:13px;color:var(--sub);margin-bottom:32px;letter-spacing:.03em}

/* ─── Search Bar ─── */
.search-wrap{position:relative;width:100%;padding:0 20px;transition:max-width .35s cubic-bezier(.4,0,.2,1)}
.home .search-wrap{max-width:600px}
.results .search-wrap{max-width:720px}
.search-form{display:flex;position:relative}
.search-input{
  width:100%;padding:15px 110px 15px 44px;font-size:16px;font-family:var(--inter);
  background:var(--surface);color:var(--fg);border:1.5px solid var(--border);border-radius:12px;
  outline:none;transition:border-color .2s,box-shadow .2s,background .2s;
}
.search-input::placeholder{color:var(--muted)}
.search-input:focus{border-color:#8844FF60;box-shadow:0 0 0 3px #8844FF15,0 2px 16px #8844FF10;background:#080810}
.search-icon{position:absolute;left:34px;top:50%;transform:translateY(-50%);color:var(--sub);pointer-events:none;font-size:16px;transition:color .2s}
.search-input:focus~.search-icon{color:#8844FF}
.search-btns{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;gap:4px;align-items:center}
.btn{
  font-family:var(--mono);font-size:11px;padding:7px 14px;border-radius:8px;border:1px solid var(--border);
  background:transparent;color:var(--sub);cursor:pointer;transition:all .2s;white-space:nowrap;
}
.btn:hover{color:var(--fg);border-color:var(--sub);background:var(--surface2)}
.btn-primary{background:var(--surface2);color:var(--sub)}
.btn-primary:hover{background:#1a1a2a;color:var(--fg)}
.hint{font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:10px;text-align:center}
.hint kbd{background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:2px 6px;font-size:10px;font-family:var(--mono);color:var(--sub)}

/* ─── Suggestions dropdown ─── */
.suggest-box{
  position:absolute;top:calc(100% + 4px);left:20px;right:20px;
  background:var(--card);border:1px solid var(--border);border-radius:12px;
  overflow:hidden;z-index:100;animation:fadeIn .12s ease;
  box-shadow:0 8px 32px rgba(0,0,0,.5);backdrop-filter:blur(12px);
}
.suggest-section{font-family:var(--mono);font-size:10px;color:var(--muted);padding:10px 16px 4px;text-transform:uppercase;letter-spacing:.1em}
.suggest-item{
  padding:10px 16px;font-size:14px;font-family:var(--inter);color:var(--sub);cursor:pointer;
  transition:background .1s,color .1s;display:flex;align-items:center;gap:10px;
}
.suggest-item:hover,.suggest-item.active{background:var(--surface2);color:var(--fg)}
.suggest-icon{font-size:13px;color:var(--muted);flex-shrink:0;width:18px;text-align:center}
.suggest-text{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ─── Category Filters ─── */
.pills{display:flex;gap:8px;justify-content:center;margin-top:20px;flex-wrap:wrap;padding:0 20px}
.pill{
  font-family:var(--mono);font-size:11px;padding:6px 16px;border-radius:20px;
  border:1px solid var(--border);background:transparent;color:var(--sub);cursor:pointer;
  transition:all .2s;letter-spacing:.02em;
}
.pill:hover{border-color:var(--sub);color:var(--fg)}
.pill.active{border:none;background:var(--grad);color:#fff;font-weight:600;box-shadow:0 2px 12px #8844FF30}
.pill .pill-count{font-size:9px;opacity:.7;margin-left:2px}

/* ─── Stats row ─── */
.stats-bar{display:flex;gap:32px;justify-content:center;margin-top:28px;padding:0 20px}
.stat{font-family:var(--mono);font-size:12px;color:var(--muted)}
.stat-val{color:var(--sub);font-weight:600}

/* ─── Search History ─── */
.history{margin-top:20px;text-align:center;padding:0 20px}
.history-label{font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.12em}
.history-items{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
.history-chip{
  font-family:var(--mono);font-size:12px;color:var(--sub);padding:4px 12px;
  border:1px solid var(--border);border-radius:16px;cursor:pointer;transition:all .2s;
  display:inline-flex;align-items:center;gap:6px;
}
.history-chip:hover{border-color:var(--sub);color:var(--fg)}
.history-chip .x{font-size:10px;color:var(--muted);cursor:pointer}
.history-chip .x:hover{color:#ff4466}

/* ─── Trending ─── */
.trending{margin-top:28px;text-align:center;padding:0 20px}
.trending-label{font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:.12em}
.trending-item{
  font-family:var(--inter);font-size:13px;color:var(--sub);cursor:pointer;padding:5px 14px;
  display:inline-block;transition:color .2s;border-radius:6px;
}
.trending-item:hover{color:var(--fg);background:var(--surface2)}

/* ─── Results Area ─── */
.results-area{width:100%;max-width:720px;padding:0 20px;margin-top:20px}
.results-meta{font-family:var(--mono);font-size:12px;color:var(--muted);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.results-meta .dot{color:var(--border)}
.spinner{display:inline-block;width:22px;height:22px;border:2px solid var(--border);border-top-color:#8844FF;border-radius:50%;animation:spin .6s linear infinite}
.loading-wrap{text-align:center;padding-top:48px}
.loading-text{font-family:var(--mono);font-size:12px;color:var(--muted);margin-top:12px;animation:pulse 1.5s ease infinite}

/* Skeleton loading */
.skeleton{background:linear-gradient(90deg,var(--surface) 25%,var(--surface2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px}
.skel-title{height:20px;width:70%;margin-bottom:8px}
.skel-url{height:14px;width:40%;margin-bottom:8px}
.skel-text{height:14px;width:90%;margin-bottom:4px}
.skel-text2{height:14px;width:75%}
.skel-card{padding:20px 0;border-bottom:1px solid var(--surface2)}

.no-results{text-align:center;padding-top:48px;animation:fadeUp .3s ease}
.no-results h3{font-family:var(--grotesk);font-size:20px;color:var(--sub);margin-bottom:8px}
.no-results p{font-family:var(--inter);font-size:14px;color:var(--muted);margin-bottom:16px}
.no-results-suggestions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}

/* ─── AI Answer Box ─── */
.ai-box{
  background:var(--card);border:1px solid var(--border);border-left:3px solid transparent;
  border-image:var(--grad) 1;border-image-slice:0 0 0 1;
  padding:18px 22px;border-radius:0 12px 12px 0;margin-bottom:24px;animation:fadeUp .3s ease;
}
.ai-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.ai-label{font-family:var(--mono);font-size:10px;color:var(--sub);text-transform:uppercase;letter-spacing:.1em}
.ai-badge{font-family:var(--mono);font-size:9px;padding:2px 8px;border-radius:10px;background:var(--surface2);color:var(--muted)}
.ai-text{font-family:var(--inter);font-size:14px;color:#bbb;line-height:1.7;white-space:pre-wrap}
.ai-text a{color:var(--link);border-bottom:1px solid #7ab8ff30}
.ai-text a:hover{border-bottom-color:var(--link)}

/* ─── Result Card ─── */
.result-card{padding:18px 0;border-bottom:1px solid var(--border);animation:fadeUp .25s ease;animation-fill-mode:backwards}
.result-card:nth-child(2){animation-delay:.05s}
.result-card:nth-child(3){animation-delay:.1s}
.result-card:nth-child(4){animation-delay:.15s}
.result-card:nth-child(5){animation-delay:.2s}
.result-url-line{font-family:var(--mono);font-size:12px;color:var(--url);margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:6px}
.result-url-line .favicon{width:14px;height:14px;border-radius:3px;flex-shrink:0}
.result-title{font-family:var(--grotesk);font-size:18px;font-weight:600;margin-bottom:6px}
.result-title a{color:var(--link);transition:color .15s}
.result-title a:hover{color:var(--link-hover)}
.result-snippet{font-family:var(--inter);font-size:13.5px;color:var(--sub);line-height:1.6}
.result-snippet mark{background:none;color:var(--fg);font-weight:600}
.result-meta{margin-top:8px;display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.badge{
  font-family:var(--mono);font-size:10px;padding:3px 10px;border-radius:6px;
  background:var(--surface2);color:var(--sub);text-transform:uppercase;letter-spacing:.04em;
}
.badge-site{border-left:2px solid #4488FF}
.badge-agent{border-left:2px solid #CC00AA}
.badge-app{border-left:2px solid #00D4FF}
.badge-api{border-left:2px solid #FF6B2B}
.badge-tool{border-left:2px solid #8844FF}
.badge-docs{border-left:2px solid #4aba78}
.tag{font-family:var(--mono);font-size:10px;color:var(--muted)}

/* Score bar */
.score-wrap{margin-left:auto;display:flex;align-items:center;gap:6px}
.score-bar{width:48px;height:4px;background:var(--border);border-radius:2px;overflow:hidden}
.score-fill{height:100%;border-radius:2px;background:var(--grad-h);transition:width .3s ease}
.score-text{font-family:var(--mono);font-size:10px;color:var(--muted)}

/* ─── Pagination ─── */
.pagination{display:flex;justify-content:center;align-items:center;gap:8px;padding:28px 0}
.page-btn{
  font-family:var(--mono);font-size:12px;padding:8px 18px;border:1px solid var(--border);border-radius:8px;
  background:transparent;color:var(--sub);cursor:pointer;transition:all .2s;
}
.page-btn:hover:not(:disabled){background:var(--surface2);color:var(--fg);border-color:var(--sub)}
.page-btn:disabled{color:var(--muted);cursor:default;opacity:.4}
.page-num{
  font-family:var(--mono);font-size:12px;padding:8px 12px;border-radius:8px;cursor:pointer;
  color:var(--sub);transition:all .15s;
}
.page-num:hover{background:var(--surface2);color:var(--fg)}
.page-num.active{background:var(--grad);color:#fff;font-weight:600}
.page-info{font-family:var(--mono);font-size:11px;color:var(--muted)}

/* ─── Responsive ─── */
@media(max-width:640px){
  .home .title{font-size:clamp(32px,10vw,48px)}
  .search-input{padding:13px 90px 13px 38px;font-size:15px}
  .search-icon{left:28px;font-size:14px}
  .btn{font-size:10px;padding:6px 10px}
  .stats-bar{gap:16px}
  .stat{font-size:11px}
  .result-title{font-size:16px}
  .pills{gap:5px}
  .pill{font-size:10px;padding:5px 12px}
  .footer-links{gap:12px}
  .score-wrap{display:none}
}
</style>
</head>
<body>
<div class="app" id="app">
  <div class="hero home" id="hero">
    <div class="logo-wrap" onclick="goHome()">
      <div class="title" id="title"><span class="title-grad">RoadSearch</span></div>
    </div>
    <div class="subtitle" id="subtitle">Search the Road. Find the Way.</div>

    <div class="search-wrap">
      <form class="search-form" onsubmit="doSearch(event)" autocomplete="off">
        <input class="search-input" id="q" type="text" placeholder="Search BlackRoad..." autofocus
          oninput="onInput()" onkeydown="onKeyDown(event)" onfocus="onFocus()" />
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <div class="search-btns">
          <button type="submit" class="btn btn-primary" title="Search (Enter)">Search</button>
          <button type="button" class="btn" onclick="feelingLucky()" title="Go to top result">Lucky</button>
        </div>
      </form>
      <div class="suggest-box" id="suggestions" style="display:none"></div>
      <div class="hint" id="hint">
        <kbd>/</kbd> focus &nbsp;&middot;&nbsp; <kbd>Esc</kbd> clear &nbsp;&middot;&nbsp;
        <kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate
      </div>
    </div>

    <div class="pills" id="pills"></div>
    <div class="stats-bar" id="statsBar"></div>
    <div class="history" id="historyArea" style="display:none"></div>
    <div class="trending" id="trending"></div>
    <div class="results-area" id="resultsArea" style="display:none"></div>
  </div>

  <div class="footer">
    <div class="footer-links">
      <a href="https://blackroad.io">Home</a>
      <a href="https://lucidia.earth">Lucidia</a>
      <a href="https://blackroadai.com">AI</a>
      <a href="https://blackroad.network">Network</a>
      <a href="https://status.blackroad.io">Status</a>
      <a href="https://blackroad.company">Company</a>
      <a href="https://brand.blackroad.io">Brand</a>
      <a href="https://blackroad.io/pricing">Pricing</a>
      <a href="https://github.com/blackboxprogramming">GitHub</a>
    </div>
    <div class="footer-text" id="footerStats"></div>
    <div class="footer-tagline">BlackRoad OS &mdash; Pave Tomorrow.</div>
  </div>
</div>

<script>
const CATEGORIES = [
  { key: 'All', label: 'All' },
  { key: 'site', label: 'Sites' },
  { key: 'agent', label: 'Agents' },
  { key: 'api', label: 'API' },
  { key: 'tool', label: 'Tools' },
  { key: 'app', label: 'Apps' },
  { key: 'docs', label: 'Docs' },
];
const BADGE_CLASSES = { site:'badge-site', agent:'badge-agent', app:'badge-app', api:'badge-api', tool:'badge-tool', docs:'badge-docs', tech:'badge-tool', page:'badge-docs' };
const API_BASE = '';
const HISTORY_KEY = 'roadsearch_history';
const MAX_HISTORY = 12;

let state = {
  query: '', submitted: '', category: 'All', results: null, aiAnswer: null, aiSource: null,
  loading: false, duration: null, total: 0, page: 1, pages: 1,
  suggestions: [], suggestIdx: -1, showSuggest: false,
  stats: { indexed: 0, queries: 0, queries24h: 0 },
  trending: [], history: [],
  categoryCounts: {},
};

const $ = id => document.getElementById(id);
const qInput = () => $('q');

// ─── Init ──────────────────────────────────────────────────────────
function init() {
  state.history = loadHistory();
  renderPills();
  renderHistory();
  loadStats();

  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  const cat = params.get('category');
  if (cat) {
    const found = CATEGORIES.find(c => c.key === cat || c.label.toLowerCase() === cat.toLowerCase());
    if (found) { state.category = found.key; renderPills(); }
  }
  if (q) {
    state.query = q;
    qInput().value = q;
    search(q, state.category, 1);
  }

  document.addEventListener('keydown', globalKey);
  document.addEventListener('click', e => {
    if (!$('suggestions').contains(e.target) && e.target !== qInput()) closeSuggest();
  });
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(location.search);
    const pq = p.get('q');
    if (pq && pq !== state.submitted) {
      state.query = pq;
      qInput().value = pq;
      search(pq, state.category, 1);
    } else if (!pq) {
      goHome();
    }
  });
}

function globalKey(e) {
  if (e.key === '/' && document.activeElement !== qInput() && !e.ctrlKey && !e.metaKey) {
    e.preventDefault(); qInput().focus(); qInput().select();
  }
  if (e.key === 'Escape') {
    if (state.showSuggest) { closeSuggest(); }
    else { qInput().value = ''; state.query = ''; qInput().blur(); }
  }
}

// ─── API ──────────────────────────────────────────────────────────
async function api(path) {
  const res = await fetch(API_BASE + path, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

async function loadStats() {
  try {
    const d = await api('/stats');
    state.stats = { indexed: d.indexed_pages || 0, queries: d.total_queries || 0, queries24h: d.queries_24h || 0 };
    state.trending = d.trending || [];
    state.categoryCounts = {};
    (d.categories || []).forEach(c => { state.categoryCounts[c.name] = c.count; });
    renderStats();
    renderTrending();
    renderPills();
  } catch(e) { console.warn('Stats load failed:', e); }
}

// ─── Search History (localStorage) ────────────────────────────────
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]').slice(0, MAX_HISTORY); }
  catch { return []; }
}
function saveHistory(q) {
  const h = loadHistory().filter(x => x.toLowerCase() !== q.toLowerCase());
  h.unshift(q);
  const trimmed = h.slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  state.history = trimmed;
}
function removeHistory(q) {
  const h = loadHistory().filter(x => x !== q);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  state.history = h;
  renderHistory();
}
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  state.history = [];
  renderHistory();
}

// ─── Search ──────────────────────────────────────────────────────
function doSearch(e) { e && e.preventDefault(); search(state.query, state.category, 1); }

async function search(q, cat, pg) {
  q = (q || '').trim();
  if (!q || q.length < 2) return;
  state.submitted = q; state.loading = true; state.page = pg;
  closeSuggest();
  updateURL(q, cat);
  setMode('results');
  renderLoading();
  saveHistory(q);

  const catParam = cat && cat !== 'All' ? '&category=' + encodeURIComponent(cat) : '';
  const start = performance.now();

  try {
    const data = await api('/search?q=' + encodeURIComponent(q) + catParam + '&ai=true&page=' + pg + '&limit=10');
    state.duration = Math.round(performance.now() - start);
    state.results = data.results || [];
    state.total = data.total || state.results.length;
    state.pages = data.pages || Math.ceil(state.total / 10);
    state.aiAnswer = data.ai_answer || null;
    state.aiSource = data.ai_source || null;
    state.page = pg;
  } catch(e) {
    state.results = []; state.total = 0; state.pages = 1;
    state.aiAnswer = null; state.aiSource = null; state.duration = null;
  }
  state.loading = false;
  renderResults();
}

// ─── Suggestions ────────────────────────────────────────────────
let suggestTimer = null;
function onInput() {
  state.query = qInput().value;
  clearTimeout(suggestTimer);
  if (state.query.length < 2) { closeSuggest(); return; }
  suggestTimer = setTimeout(fetchSuggestions, 150);
}

async function fetchSuggestions() {
  if (state.query === state.submitted && state.results) return;
  try {
    const d = await api('/suggest?q=' + encodeURIComponent(state.query));
    const titles = (d.suggestions || []).map(s => ({ text: s, type: 'page' }));
    const recent = (d.recent || []).map(s => ({ text: s, type: 'recent' }));
    const historyMatch = state.history
      .filter(h => h.toLowerCase().includes(state.query.toLowerCase()) && h.toLowerCase() !== state.query.toLowerCase())
      .slice(0, 3)
      .map(s => ({ text: s, type: 'history' }));

    const seen = new Set();
    state.suggestions = [];
    for (const item of [...historyMatch, ...recent, ...titles]) {
      const k = item.text.toLowerCase();
      if (!seen.has(k)) { seen.add(k); state.suggestions.push(item); }
    }
    state.suggestions = state.suggestions.slice(0, 8);
    state.suggestIdx = -1;
    if (state.suggestions.length) { state.showSuggest = true; renderSuggestions(); }
    else closeSuggest();
  } catch(e) {}
}

function onFocus() {
  if (state.suggestions.length && !state.showSuggest && state.query.length >= 2) {
    state.showSuggest = true; renderSuggestions();
  }
}
function closeSuggest() { state.showSuggest = false; $('suggestions').style.display = 'none'; }

function onKeyDown(e) {
  if (state.showSuggest && state.suggestions.length) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.suggestIdx = (state.suggestIdx + 1) % state.suggestions.length;
      renderSuggestions();
      qInput().value = state.suggestions[state.suggestIdx].text;
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      state.suggestIdx = state.suggestIdx <= 0 ? state.suggestions.length - 1 : state.suggestIdx - 1;
      renderSuggestions();
      qInput().value = state.suggestions[state.suggestIdx].text;
      return;
    }
    if (e.key === 'Enter' && state.suggestIdx >= 0) {
      e.preventDefault();
      const pick = state.suggestions[state.suggestIdx].text;
      state.query = pick; qInput().value = pick; search(pick, state.category, 1);
      return;
    }
    if (e.key === 'Tab') { closeSuggest(); return; }
  }
  if (e.key === 'Escape') { closeSuggest(); }
}

function pickSuggestion(text) { state.query = text; qInput().value = text; closeSuggest(); search(text, state.category, 1); }

// ─── Lucky ───────────────────────────────────────────────────────
function feelingLucky() {
  const q = (state.query || state.submitted || '').trim();
  if (q) window.location.href = '/lucky?q=' + encodeURIComponent(q);
}

// ─── Navigation ─────────────────────────────────────────────────
function goHome() {
  state.submitted = ''; state.results = null; state.aiAnswer = null; state.aiSource = null;
  state.query = ''; state.total = 0; state.page = 1; state.pages = 1;
  qInput().value = '';
  history.pushState(null, '', location.pathname);
  setMode('home');
  $('resultsArea').style.display = 'none';
  $('resultsArea').innerHTML = '';
  renderHistory();
  loadStats();
  qInput().focus();
}

function setMode(mode) {
  $('hero').className = 'hero ' + mode;
  $('subtitle').style.display = mode === 'home' ? '' : 'none';
  $('hint').style.display = mode === 'home' ? '' : 'none';
  $('trending').style.display = mode === 'home' ? '' : 'none';
  $('statsBar').style.display = mode === 'home' ? '' : 'none';
  $('historyArea').style.display = mode === 'home' && state.history.length ? '' : 'none';
}

function updateURL(q, cat) {
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  if (cat && cat !== 'All') p.set('category', cat);
  const s = p.toString();
  history.pushState(null, '', s ? '?' + s : location.pathname);
}

function setCategory(cat) {
  state.category = cat;
  renderPills();
  if (state.submitted) search(state.submitted, cat, 1);
}

// ─── Render ─────────────────────────────────────────────────────
function renderPills() {
  $('pills').innerHTML = CATEGORIES.map(c => {
    const count = c.key === 'All' ? '' : (state.categoryCounts[c.key] ? '<span class="pill-count">(' + state.categoryCounts[c.key] + ')</span>' : '');
    return '<button class="pill' + (state.category === c.key ? ' active' : '') + '" onclick="setCategory(\\'' + c.key + '\\')">' + c.label + count + '</button>';
  }).join('');
}

function renderStats() {
  const s = state.stats;
  $('statsBar').innerHTML =
    '<span class="stat"><span class="stat-val">' + (s.indexed || 0).toLocaleString() + '</span> pages indexed</span>' +
    '<span class="stat"><span class="stat-val">' + (s.queries24h || 0).toLocaleString() + '</span> searches today</span>' +
    '<span class="stat"><span class="stat-val">' + (s.queries || 0).toLocaleString() + '</span> total queries</span>';
  $('footerStats').textContent = (s.indexed || 0).toLocaleString() + ' pages indexed \\u00B7 ' + (s.queries || 0).toLocaleString() + ' total queries';
}

function renderHistory() {
  const area = $('historyArea');
  if (!state.history.length) { area.style.display = 'none'; return; }
  let html = '<div class="history-label">Recent Searches</div><div class="history-items">';
  state.history.slice(0, 8).forEach(h => {
    html += '<span class="history-chip" onclick="pickSuggestion(\\'' + esc(h) + '\\')">'
      + esc(h) + '<span class="x" onclick="event.stopPropagation();removeHistory(\\'' + esc(h) + '\\')">&times;</span></span>';
  });
  if (state.history.length > 0) {
    html += '<span class="history-chip" onclick="clearHistory()" style="color:var(--muted);border-color:var(--muted)">Clear all</span>';
  }
  html += '</div>';
  area.innerHTML = html;
  area.style.display = '';
}

function renderTrending() {
  if (!state.trending.length) { $('trending').innerHTML = ''; return; }
  let html = '<div class="trending-label">Trending Searches</div><div>';
  state.trending.slice(0, 8).forEach(t => {
    const text = typeof t === 'string' ? t : (t.query || '');
    if (text) html += '<span class="trending-item" onclick="pickSuggestion(\\'' + esc(text) + '\\')">' + esc(text) + '</span>';
  });
  html += '</div>';
  $('trending').innerHTML = html;
}

function renderSuggestions() {
  const box = $('suggestions');
  if (!state.showSuggest || !state.suggestions.length) { box.style.display = 'none'; return; }

  const icons = { history: '&#x1F552;', recent: '&#x1F50D;', page: '&#x2192;' };
  let html = '';
  let lastType = '';
  state.suggestions.forEach((s, i) => {
    if (s.type !== lastType) {
      const labels = { history: 'Recent', recent: 'Popular', page: 'Pages' };
      html += '<div class="suggest-section">' + (labels[s.type] || 'Results') + '</div>';
      lastType = s.type;
    }
    html += '<div class="suggest-item' + (i === state.suggestIdx ? ' active' : '') + '" '
      + 'onmouseenter="state.suggestIdx=' + i + ';renderSuggestions()" '
      + 'onclick="pickSuggestion(\\'' + esc(s.text) + '\\')">'
      + '<span class="suggest-icon">' + (icons[s.type] || '&#x2192;') + '</span>'
      + '<span class="suggest-text">' + highlightMatch(esc(s.text), state.query) + '</span>'
      + '</div>';
  });
  box.innerHTML = html;
  box.style.display = 'block';
}

function renderLoading() {
  const area = $('resultsArea');
  area.style.display = 'block';
  let html = '<div style="padding-top:8px">';
  for (let i = 0; i < 4; i++) {
    html += '<div class="skel-card"><div class="skeleton skel-url"></div><div class="skeleton skel-title"></div><div class="skeleton skel-text"></div><div class="skeleton skel-text2"></div></div>';
  }
  html += '</div>';
  area.innerHTML = html;
}

function renderResults() {
  const area = $('resultsArea');
  area.style.display = 'block';

  if (!state.results || !state.results.length) {
    const suggestions = ['BlackRoad OS', 'agents', 'pricing', 'Lucidia', 'mesh network'];
    area.innerHTML = '<div class="no-results"><h3>No results for &ldquo;' + esc(state.submitted) + '&rdquo;</h3>'
      + '<p>Try different keywords or broaden your search.</p>'
      + '<div class="no-results-suggestions">'
      + suggestions.map(s => '<span class="trending-item" onclick="pickSuggestion(\\'' + esc(s) + '\\')">' + esc(s) + '</span>').join('')
      + '</div></div>';
    return;
  }

  const qWords = state.submitted.toLowerCase().split(/\\s+/).filter(w => w.length >= 2);
  let html = '';

  // Meta line
  if (state.duration !== null) {
    html += '<div class="results-meta">'
      + '<span>' + state.total + ' result' + (state.total !== 1 ? 's' : '') + '</span>'
      + '<span class="dot">&middot;</span>'
      + '<span>' + state.duration + 'ms</span>'
      + (state.page > 1 ? '<span class="dot">&middot;</span><span>Page ' + state.page + '</span>' : '')
      + '</div>';
  }

  // AI Answer
  if (state.aiAnswer) {
    const rendered = state.aiAnswer
      .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    const sourceBadge = state.aiSource === 'ollama' ? 'AI' : state.aiSource === 'summary' ? 'Summary' : 'Cached';
    html += '<div class="ai-box">'
      + '<div class="ai-header"><span class="ai-label">Answer</span><span class="ai-badge">' + sourceBadge + '</span></div>'
      + '<div class="ai-text">' + rendered + '</div>'
      + '</div>';
  }

  // Results
  state.results.forEach((r, i) => {
    const title = r.title || 'Untitled';
    const url = r.url || '#';
    const snippet = r.snippet || r.description || '';
    const cat = r.category || '';
    const tags = (r.tags || []).slice(0, 4);
    const score = r.score || 0;
    const badgeClass = BADGE_CLASSES[cat] || '';

    // Highlight query terms in snippet
    const highlightedSnippet = highlightTerms(esc(snippet), qWords);
    const highlightedTitle = highlightTerms(esc(title), qWords);

    // Extract domain for display
    let displayUrl = url;
    try { const u = new URL(url); displayUrl = u.hostname + u.pathname; } catch {}

    html += '<div class="result-card" style="animation-delay:' + (i * 0.04) + 's">'
      + '<div class="result-url-line">' + esc(displayUrl) + '</div>'
      + '<div class="result-title"><a href="' + esc(url) + '" target="_blank" rel="noopener">' + highlightedTitle + '</a></div>'
      + '<div class="result-snippet">' + highlightedSnippet + '</div>'
      + '<div class="result-meta">';
    if (cat) html += '<span class="badge ' + badgeClass + '">' + esc(cat) + '</span>';
    tags.forEach(t => { html += '<span class="tag">#' + esc(t) + '</span>'; });
    html += '<div class="score-wrap"><div class="score-bar"><div class="score-fill" style="width:' + Math.round(score * 100) + '%"></div></div>'
      + '<span class="score-text">' + Math.round(score * 100) + '%</span></div>';
    html += '</div></div>';
  });

  // Pagination
  if (state.pages > 1) {
    html += '<div class="pagination">';
    html += '<button class="page-btn" ' + (state.page <= 1 ? 'disabled' : 'onclick="search(state.submitted,state.category,' + (state.page - 1) + ')"') + '>&larr; Prev</button>';

    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, state.page - Math.floor(maxVisible / 2));
    let endPage = Math.min(state.pages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

    if (startPage > 1) {
      html += '<span class="page-num" onclick="search(state.submitted,state.category,1)">1</span>';
      if (startPage > 2) html += '<span class="page-info">&hellip;</span>';
    }
    for (let p = startPage; p <= endPage; p++) {
      html += '<span class="page-num' + (p === state.page ? ' active' : '') + '" onclick="search(state.submitted,state.category,' + p + ')">' + p + '</span>';
    }
    if (endPage < state.pages) {
      if (endPage < state.pages - 1) html += '<span class="page-info">&hellip;</span>';
      html += '<span class="page-num" onclick="search(state.submitted,state.category,' + state.pages + ')">' + state.pages + '</span>';
    }

    html += '<button class="page-btn" ' + (state.page >= state.pages ? 'disabled' : 'onclick="search(state.submitted,state.category,' + (state.page + 1) + ')"') + '>Next &rarr;</button>';
    html += '</div>';
  }

  area.innerHTML = html;
  // Scroll to top of results on page change
  if (state.page > 1) area.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Utilities ──────────────────────────────────────────────────
function esc(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function highlightTerms(html, words) {
  if (!words.length) return html;
  // Build regex that matches any of the query words (case insensitive)
  const pattern = words.map(w => w.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\\\$&')).join('|');
  try {
    const re = new RegExp('(' + pattern + ')', 'gi');
    return html.replace(re, '<mark>\\$1</mark>');
  } catch { return html; }
}

function highlightMatch(text, query) {
  if (!query) return text;
  const q = query.toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx < 0) return text;
  return text.slice(0, idx) + '<strong>' + text.slice(idx, idx + q.length) + '</strong>' + text.slice(idx + q.length);
}

init();
</script>
</body>
</html>`;

// ─── Router ───────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';
    const headers = { ...cors(origin), ...SECURITY_HEADERS };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    let response;
    try {
      switch (true) {
        case url.pathname === '/health':
          response = Response.json({
            status: 'ok', engine: 'RoadSearch', version: '2.0.0',
            time: new Date().toISOString(),
            features: ['fts5', 'ai-answers', 'smart-summary', 'autocomplete', 'analytics', 'pagination'],
          });
          break;

        case url.pathname === '/init':
          const seeded = await initDB(env.DB);
          response = Response.json({ ok: true, seeded });
          break;

        case url.pathname === '/rebuild':
          response = await handleRebuild(env);
          break;

        case url.pathname === '/search' || url.pathname === '/api/search':
          response = await handleSearch(request, env);
          break;

        case url.pathname === '/suggest':
          response = await handleSuggest(request, env);
          break;

        case url.pathname === '/stats':
          response = await handleStats(env);
          break;

        case url.pathname === '/lucky':
          return await handleLucky(request, env);

        case request.method === 'POST' && url.pathname === '/index':
          response = await handleIndex(request, env);
          break;

        default: {
          const accept = request.headers.get('Accept') || '';
          if (accept.includes('application/json') && !accept.includes('text/html')) {
            response = Response.json({
              engine: 'RoadSearch',
              version: '2.0.0',
              endpoints: {
                search: 'GET /search?q=query&category=&domain=&page=1&limit=10&ai=true',
                suggest: 'GET /suggest?q=prefix',
                lucky: 'GET /lucky?q=query (redirects to top result)',
                stats: 'GET /stats',
                index: 'POST /index (auth required)',
                health: 'GET /health',
                init: 'GET /init (seed database)',
                rebuild: 'GET /rebuild (rebuild FTS index)',
              },
              tagline: 'Search the Road. Find the Way.',
            });
          } else {
            response = new Response(SEARCH_HTML, {
              headers: { 'Content-Type': 'text/html;charset=UTF-8' },
            });
          }
        }
      }
    } catch (err) {
      console.error('RoadSearch error:', err);
      response = Response.json({ error: err.message }, { status: 500 });
    }

    const h = new Headers(response.headers);
    for (const [k, v] of Object.entries(headers)) h.set(k, v);
    return new Response(response.body, { status: response.status, headers: h });
  },
};
