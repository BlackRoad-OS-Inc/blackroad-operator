// Alexa Amundson — 25 Live Resume Dashboards
// Cloudflare Worker serving brand-locked resume pages with live KPI data

const ROLES = [
  { slug: 'devops', num: '01', title: 'Senior DevOps Engineer', accent: '#FF6B2B',
    summary: 'Needed production infrastructure without a team or budget. Built a self-healing 7-node fleet from Raspberry Pis, automated 52 operational tasks, and deployed 99 cloud services — solo, from scratch.',
    sections: [
      { title: 'The Problem: Zero Infrastructure, Zero Team', bullets: [
        'No existing infrastructure, no ops team, no vendor contracts — needed production-grade systems running 48+ domains on day one',
        'Solved by designing a hybrid fleet: 5 Pi nodes + 2 cloud VMs + Cloudflare edge, all connected via WireGuard mesh VPN — total cost under $700 hardware',
        'Result: 256 systemd services running across fleet, 48 Nginx reverse proxy sites, 14 Docker containers — all managed by one person',
      ]},
<<<<<<< Updated upstream
      { title: 'CI/CD & Automation', bullets: [
        'Built 223 CLI tools for infrastructure management and deployment',
        'Maintain Mac cron jobs + fleet timers for continuous automation',
        'Operate GitHub Actions CI/CD and self-hosted Gitea (207 repos)',
        'Automated GitHub-to-Gitea relay syncing every 30 minutes',
      ]},
      { title: 'Cloud Infrastructure', bullets: [
        'Deployed 101 Pages projects, 25 D1 databases, 47 KV namespaces, 11 R2 buckets',
        'Manage Cloudflare Workers for edge compute and API routing',
      ]},
      { title: 'Monitoring & Reliability', bullets: [
        'Built daily KPI system tracking 60+ metrics across 9 collectors',
        'Fleet power optimization with CPU governor tuning and voltage monitoring',
        'Self-healing cron autonomy on all nodes (heartbeat 1m, heal 5m)',
=======
      { title: 'The Bet: Self-Healing Over Manual Ops', bullets: [
        'Fleet nodes crash, services fail, temperatures spike — manual monitoring doesn\'t scale for a solo operator running 256 services',
        'Built autonomy scripts: heartbeat every 60 seconds, heal cycle every 5 minutes, automatic service restarts on failure',
        'Detected a node cooking at 73.8\u00b0C from a runaway Ollama loop — auto-isolated the process, dropped temp to 57.9\u00b0C without downtime',
      ]},
      { title: 'The Multiplier: 212 CLI Tools', bullets: [
        'Every repeated task became a tool. 212 CLI tools (121 MB) in ~/bin — deploy, probe, audit, sync, report',
        'GitHub-to-Gitea relay syncs 207 repos every 30 minutes. Daily KPI collection tracks 60+ metrics across 10 data sources',
        '99 Cloudflare Pages, 23 D1 databases, 47 KV namespaces, 11 R2 buckets — all deployed and maintained through CLI automation',
>>>>>>> Stashed changes
      ]},
    ],
    skills: ['Linux/Debian', 'Docker Swarm', 'systemd', 'Nginx', 'WireGuard', 'Cloudflare', 'GitHub Actions', 'Bash', 'Python'],
    kpis: ['systemd_services', 'docker_containers', 'fleet_total', 'cf_pages', 'bin_tools', 'repos_total', 'nginx_sites'],
  },
  { slug: 'ai-ml', num: '02', title: 'AI/ML Engineer', accent: '#CC00AA',
    summary: 'Cloud AI APIs are expensive and you don\'t own the data. Deployed 27 language models on-premise across edge hardware with 52 TOPS of dedicated acceleration — full inference sovereignty at a fraction of the cost.',
    sections: [
      { title: 'The Problem: AI Without Vendor Lock-In', bullets: [
        'Needed persistent, private AI inference without per-token API costs or data leaving the network',
        'Deployed 27 Ollama models (48.1 GB) across 3 Pi 5 nodes — installed 2x Hailo-8 NPUs (52 TOPS total) for hardware acceleration',
        'Fine-tuned 4 custom CECE personality models for domain-specific generation — models that don\'t exist anywhere else',
      ]},
      { title: 'The Challenge: Thermals Kill Edge AI', bullets: [
        'Inference on $80 hardware generates heat. A runaway generation loop pushed one node to 73.8\u00b0C — approaching thermal shutdown',
        'Built power monitoring (cron every 5 min), CPU governor tuning, and voltage optimization — stabilized fleet at 42\u00b0C average',
        'Reduced GPU memory allocation from 256MB to 16MB on headless nodes, capped frequencies, applied conservative governors — no inference quality loss',
      ]},
      { title: 'The Stack: From Model to API to User', bullets: [
        'Built Ollama Bridge SSE proxy for streaming model responses to web clients in real-time',
        'AI image generation hub with 4 backend agents (DALL-E, Flux, SDXL, FAL) — single API, best-model routing',
        'FTS5 knowledge index across 156,675 memory entries — models can search their own history across 230 SQLite databases',
      ]},
    ],
    skills: ['Ollama', 'Hailo-8 NPU', 'DALL-E', 'Flux', 'SDXL', 'FastAPI', 'Python', 'FTS5', 'Docker'],
    kpis: ['ollama_models', 'ollama_size_gb', 'total_loc', 'repos_total', 'sqlite_dbs', 'docker_containers'],
  },
  { slug: 'sre', num: '03', title: 'Site Reliability Engineer', accent: '#FF2255',
    summary: 'Running 256 services across distributed hardware with no on-call team. Built observability from scratch, resolved 10+ production incidents solo, and automated reliability into the infrastructure itself.',
    sections: [
      { title: 'The Reality: Solo On-Call for Everything', bullets: [
        'One person responsible for 256 services, 48 domains, 7 nodes, 283 databases — every incident is yours',
        'Built a 10-collector KPI system tracking 60+ metrics daily: fleet health, service status, temperatures, swap, processes, connections',
        'Day-over-day delta tracking catches regressions before they become outages — automated Slack notifications on anomalies',
      ]},
      { title: 'The Incidents: Real Problems, Real Fixes', bullets: [
        'Node at 73.8\u00b0C — identified runaway Ollama generation loop via power monitoring, killed and disabled the service, temp dropped to 57.9\u00b0C',
        'Swap at 100% on Cecilia — found 4 concurrent rclone instances syncing same Google Drive, consolidated to 1, freed 2 GB swap',
        'Obfuscated cron dropper discovered on Cecilia — exec\'ing from /tmp/op.py. Removed the malware, audited all nodes, rotated credentials fleet-wide',
        'Leaked GitHub PAT found in systemd service file — removed from config, rotated token, migrated all secrets to chmod 600 env files',
      ]},
      { title: 'The System: Reliability as Code', bullets: [
        'Self-healing autonomy: heartbeat every 60s detects down services, heal cycle every 5m auto-restarts them',
        'Power monitoring on every node (cron */5, persistent logs) — voltage, throttle state, temperature, governor all tracked',
        'Distributed tracing database with nanosecond-precision spans — can trace any request across any node',
      ]},
    ],
    skills: ['systemd', 'cron', 'Nginx', 'Docker Swarm', 'WireGuard', 'Tailscale', 'distributed tracing', 'Bash', 'Python'],
    kpis: ['systemd_services', 'failed_units', 'fleet_total', 'fleet_online', 'avg_temp_c', 'docker_containers', 'nginx_sites'],
  },
  { slug: 'platform', num: '04', title: 'Platform Engineer', accent: '#8844FF',
    summary: 'No platform team, no internal tools budget. Built a complete developer platform from scratch: 212 CLI tools, self-hosted Git, code search, CI/CD pipelines, and automated observability — because waiting for someone else wasn\'t an option.',
    sections: [
<<<<<<< Updated upstream
      { title: 'Developer Platform', bullets: [
        'Built 223 CLI tools (121 MB) for developer workflow automation',
        'Self-hosted Gitea with 207 repos across 7 organizations on fleet',
        '101 Cloudflare Pages projects with git-based CI/CD pipelines',
        'Custom code search engine indexing 354 repos with FTS5',
=======
      { title: 'The Gap: No Developer Platform Exists', bullets: [
        '1,603 repos across 17 GitHub orgs + 207 Gitea repos — needed unified tooling to manage code, deploy, search, and monitor across all of it',
        'Built 212 CLI tools (121 MB) — every common workflow is a single command: deploy, probe, audit, sync, collect, report',
        'Self-hosted Gitea on the fleet with 207 repos across 7 orgs — full Git sovereignty with GitHub-to-Gitea relay syncing every 30 minutes',
>>>>>>> Stashed changes
      ]},
      { title: 'The Platform: Search, Deploy, Observe', bullets: [
        'Code search engine indexing 354 repos with FTS5 full-text search — find anything across the entire codebase in milliseconds',
        '99 Cloudflare Pages projects with git-push deployment — every commit triggers build and deploy automatically',
        '10-collector KPI system generates daily observability: fleet health, code velocity, cloud inventory, service status',
      ]},
      { title: 'Why It Matters', bullets: [
        'A solo developer operating at the output of a small team needs tools that multiply, not slow down',
        '326 commits/day sustained velocity. 4,019 PRs merged. 20 languages. This throughput requires platform, not heroics',
      ]},
    ],
    skills: ['Cloudflare Pages/Workers', 'Gitea', 'GitHub Actions', 'Docker Swarm', 'CLI tooling', 'Bash', 'Python', 'FTS5'],
    kpis: ['bin_tools', 'repos_total', 'cf_pages', 'systemd_services', 'docker_containers', 'total_loc'],
  },
  { slug: 'fullstack', num: '05', title: 'Full-Stack Engineer', accent: '#4488FF',
<<<<<<< Updated upstream
    summary: 'Full-stack engineer with 7.2M+ lines of code across 1,600+ repositories in 20 languages. Builds end-to-end applications deployed across 101 Cloudflare Pages and 7 backend nodes.',
    sections: [
      { title: 'Frontend', bullets: [
        '75 design templates (HTML/JSX) with brand-locked design system',
        '101 Cloudflare Pages projects deployed across 48+ custom domains',
        'React/Next.js applications with real-time WebSocket integration',
=======
    summary: 'Designed, built, and shipped end-to-end: 7.2M lines of code, 20 languages, 99 deployed sites, FastAPI backends, 283 databases, and a brand system powering 75 templates — because "full-stack" means owning the entire vertical.',
    sections: [
      { title: 'The Frontend: 99 Live Sites, One Design System', bullets: [
        '75 design templates with brand-locked system — gradient spectrum, golden ratio spacing, Space Grotesk + JetBrains Mono typography',
        '99 Cloudflare Pages projects deployed across 48+ custom domains — every site is live, every domain has SSL',
        '15 page types covering the full SaaS surface: landing, pricing, blog, docs, dashboard, auth, portfolio, settings, status, changelog',
>>>>>>> Stashed changes
      ]},
      { title: 'The Backend: APIs That Power Everything', bullets: [
        'CECE API (FastAPI) for custom LLM interaction and TTS. Lucidia API for application platform. Fleet health APIs for monitoring',
        'AI image generation API with 4 backend agents — single endpoint, automatic model routing between DALL-E, Flux, SDXL',
        '48 Nginx reverse proxy sites routing traffic to the right backend across the fleet — zero-trust via Cloudflare tunnels',
      ]},
<<<<<<< Updated upstream
      { title: 'Databases', bullets: [
        '11 PostgreSQL + 230 SQLite + 25 D1 + 47 KV databases',
        'FTS5 full-text search indexing 354 repos',
=======
      { title: 'The Data Layer: 283 Databases, 5 Engines', bullets: [
        '11 PostgreSQL for relational data, 230 SQLite (1.4 GB) for app state, 23 D1 for serverless, 47 KV for edge config, Qdrant for vectors',
        'FTS5 full-text search across 156K entries — sub-millisecond lookups across the entire knowledge base',
>>>>>>> Stashed changes
      ]},
    ],
    skills: ['React', 'Next.js', 'FastAPI', 'Node.js', 'PostgreSQL', 'SQLite', 'Cloudflare D1/KV/R2', 'Docker', 'Nginx'],
    kpis: ['total_loc', 'repos_total', 'cf_pages', 'postgres_dbs', 'sqlite_dbs', 'nginx_sites', 'docker_containers'],
  },
  { slug: 'cloud', num: '06', title: 'Cloud Engineer', accent: '#00D4FF',
<<<<<<< Updated upstream
    summary: 'Cloud engineer managing hybrid edge-cloud infrastructure: 101 Pages, 25 D1, 47 KV, 11 R2, 2 droplets, and 5 edge nodes connected via WireGuard mesh.',
    sections: [
      { title: 'Cloudflare Platform', bullets: [
        '101 Pages projects with git-based CI/CD',
        '25 D1 serverless databases for application state',
        '47 KV namespaces for edge config and caching',
        '11 R2 object storage buckets for assets and models',
        '48+ custom domains through 4 Cloudflare tunnels',
=======
    summary: 'Needed global reach without global infrastructure costs. Architected a hybrid edge-cloud stack: Cloudflare serverless for global distribution, Pi fleet for sovereignty, WireGuard mesh for secure connectivity — 178 cloud resources managed solo.',
    sections: [
      { title: 'The Strategy: Edge + Cloud, Not Either/Or', bullets: [
        'Pure cloud is expensive and you don\'t own the compute. Pure edge is limited and hard to reach. Combined both',
        '99 Pages for global CDN, 23 D1 for serverless databases, 47 KV for edge config, 11 R2 for object storage — all on Cloudflare',
        '5 Pi edge nodes for persistent compute, AI inference, and data sovereignty. WireGuard mesh connects everything. 4 tunnels route 48+ domains',
>>>>>>> Stashed changes
      ]},
      { title: 'The Architecture: Zero Open Ports', bullets: [
        'No port forwarding, no exposed services. All external traffic flows through Cloudflare tunnels to fleet',
        'WireGuard mesh (10.8.0.x) for encrypted inter-node communication. Tailscale overlay (9 peers) for management access',
        'RoadNet WiFi mesh (5 APs) provides local device connectivity — devices on the mesh can reach the fleet directly',
      ]},
      { title: 'The Numbers', bullets: [
        '178 total Cloudflare resources deployed and maintained. 48+ custom domains with automated SSL/TLS',
        'Cloudflare Workers for edge compute and API routing — millisecond response times at the edge, heavy processing on fleet',
      ]},
    ],
    skills: ['Cloudflare Pages/Workers/D1/KV/R2/Tunnels', 'DigitalOcean', 'WireGuard', 'Tailscale', 'Docker', 'Nginx'],
    kpis: ['cf_pages', 'cf_d1_databases', 'cf_kv_namespaces', 'cf_r2_buckets', 'fleet_total', 'nginx_sites'],
  },
  { slug: 'infrastructure', num: '07', title: 'Infrastructure Engineer', accent: '#FF6B2B',
    summary: 'Built a production fleet from single-board computers. 5 Raspberry Pis, 2 cloud VMs, 52 TOPS of AI acceleration, 707 GB distributed storage — proving that serious infrastructure doesn\'t require serious budgets.',
    sections: [
      { title: 'The Thesis: Commodity Hardware, Production Workloads', bullets: [
        'A Raspberry Pi 5 costs $80. A Hailo-8 NPU costs $100. Together they deliver 26 TOPS of AI inference with 8 GB RAM',
        'Built a 7-node fleet for under $700 total hardware cost — runs 256 systemd services, 14 Docker containers, 27 AI models, 48 Nginx sites',
        'Same fleet handles production traffic across 48+ domains serving real users through Cloudflare tunnels',
      ]},
      { title: 'The Hard Part: Power, Heat, and Storage', bullets: [
        'Pi 5 + Hailo-8 + NVMe draws more than a standard 5V/3A PSU can deliver — diagnosed undervoltage (0.75V), tuned config.txt, recovered +95mV',
        'Reduced GPU memory 256MB to 16MB on headless nodes. Applied conservative CPU governors. Disabled 16 skeleton microservices — freed 800 MB RAM',
        'Fleet averages 42\u00b0C now. Power monitoring runs every 5 minutes on all nodes, logging voltage, throttle state, and governor',
      ]},
      { title: 'The Network: Every Node Reachable, Every Path Encrypted', bullets: [
        'WireGuard mesh VPN (10.8.0.x) connects all nodes. RoadNet WiFi mesh (5 APs, 5 subnets) provides local coverage',
        '4 Cloudflare tunnels route 48+ domains to fleet services. Tailscale overlay (9 peers) for remote management',
      ]},
    ],
    skills: ['Raspberry Pi', 'Linux', 'WireGuard', 'Nginx', 'systemd', 'Docker Swarm', 'Hailo-8', 'NVMe'],
    kpis: ['fleet_total', 'fleet_online', 'fleet_disk_total_gb', 'fleet_mem_total_mb', 'systemd_services', 'nginx_sites'],
  },
  { slug: 'backend', num: '08', title: 'Backend Engineer', accent: '#FF2255',
    summary: 'Every feature needs an API. Built 6+ production services, unified 283 databases across 5 engines, and designed data architectures that run on $80 hardware — because the backend doesn\'t care how much you spent on it.',
    sections: [
      { title: 'The APIs: Each One Solving a Real Problem', bullets: [
        'CECE API (FastAPI) — needed custom LLM interaction with personality. Built TTS generation endpoint. Runs on Pi 5 at the edge',
        'AI image generation API — 4 backend agents (DALL-E, Flux, SDXL, FAL) behind a single endpoint. Automatic model routing based on prompt type',
        'Code search engine — needed to find anything across 354 repos instantly. Built FTS5 index, sub-millisecond lookups across entire codebase',
        'Fleet health APIs — SSH-based probes collect metrics from every node. Powers the KPI dashboard and automated alerting',
      ]},
<<<<<<< Updated upstream
      { title: 'Databases (283 total)', bullets: [
        '11 PostgreSQL databases for relational data',
        '230 SQLite databases (1.4 GB) for app state',
        '22 Cloudflare D1 for serverless apps',
        '47 KV namespaces for edge caching',
        'FTS5 full-text search across 156K entries',
=======
      { title: 'The Data: Right Database for the Right Job', bullets: [
        '11 PostgreSQL for transactional data. 230 SQLite (1.4 GB) for agent memory and local state — embedded, zero-config, fast',
        '23 Cloudflare D1 for serverless applications. 47 KV namespaces for edge configuration and caching. Qdrant for vector search',
        'FTS5 full-text search across 156K entries — the entire knowledge base is searchable in under a millisecond',
>>>>>>> Stashed changes
      ]},
    ],
    skills: ['Python/FastAPI', 'Node.js', 'PostgreSQL', 'SQLite/FTS5', 'D1', 'KV', 'Docker', 'Nginx', 'Redis'],
    kpis: ['postgres_dbs', 'sqlite_dbs', 'cf_d1_databases', 'cf_kv_namespaces', 'docker_containers', 'total_loc'],
  },
  { slug: 'systems', num: '09', title: 'Systems Engineer', accent: '#CC00AA',
    summary: 'When your production fleet is single-board computers, every kernel parameter matters. Tuned CPU governors, stabilized voltage, integrated PCIe AI accelerators, and squeezed production workloads from hardware that fits in your hand.',
    sections: [
      { title: 'The Constraint: Maximum Work from Minimum Hardware', bullets: [
        'A Pi 5 has 8 GB RAM, a quad-core ARM, and a 30W power budget. It needs to run Docker, Ollama, Nginx, PostgreSQL, and 50+ systemd services simultaneously',
        'Tuned swappiness to 10, dirty_ratio to 40, applied conservative CPU governors, capped frequency to 2 GHz — workloads stable, temperatures safe',
        'GPU memory reduced from 256MB to 16MB on headless nodes — freed RAM for actual compute. Disabled cups, rpcbind, nfs, lightdm across fleet',
      ]},
      { title: 'The Integration: Making Hardware Talk', bullets: [
        '2x Hailo-8 NPU via PCIe — installed drivers, firmware, verified /dev/hailo0 on both nodes. 52 TOPS of AI acceleration, zero cloud cost',
        'NVMe SSD on Octavia (1TB) — faster I/O for Gitea, Docker images, and model weights. USB peripherals: UART, keyboards, microphones, OLED displays',
        'Overclock on one node caused undervoltage (0.75V) — removed overclock, tuned config.txt, recovered +95mV. Fleet-wide voltage monitoring deployed',
      ]},
      { title: 'The Discipline: 256 Services, Zero Chaos', bullets: [
        '256 systemd services and 35 timers across fleet — each one has a purpose, a health check, and an owner',
        'Self-healing watchdogs restart failed services. Power monitoring logs every 5 minutes. Everything persistent across reboots via sysctl.d and tmpfiles.d',
      ]},
    ],
    skills: ['Linux kernel', 'systemd', 'sysctl', 'PCIe', 'I2C', 'GPIO', 'Hailo-8', 'NVMe', 'Bash', 'Python'],
    kpis: ['systemd_services', 'systemd_timers', 'fleet_total', 'avg_temp_c', 'fleet_mem_total_mb', 'fleet_disk_total_gb'],
  },
  { slug: 'edge', num: '10', title: 'Edge Computing Engineer', accent: '#8844FF',
    summary: 'Cloud inference is someone else\'s computer running your data. Deployed 27 AI models on-device across 5 Pi nodes with 52 TOPS acceleration, built a WiFi mesh for local connectivity, and kept it all running with self-healing automation.',
    sections: [
      { title: 'The Vision: AI at the Edge, Not in the Cloud', bullets: [
        '27 Ollama models (48.1 GB) running on 3 Pi 5 nodes — inference happens on-premise, data never leaves the network',
        '2x Hailo-8 NPUs (52 TOPS total) for hardware-accelerated inference — PCIe integration, driver management, firmware updates',
        '4 custom fine-tuned CECE models — personality, voice, and domain expertise that can\'t be replicated with off-the-shelf models',
      ]},
      { title: 'The Network: Mesh Connectivity Without Internet', bullets: [
        'RoadNet WiFi mesh: 5 APs on channels 1/6/11, 5 subnets (10.10.x.0/24), NAT through wlan0 — devices connect to fleet directly',
        'WireGuard mesh for encrypted node-to-node communication. Tailscale overlay (9 peers) for remote management from anywhere',
        'Pi-hole DNS for local resolution + custom zones (.cece, .blackroad) — edge services discoverable by name, not IP',
      ]},
      { title: 'The Challenge: Keeping Edge Alive', bullets: [
        'Edge hardware fails differently than cloud — SD cards degrade, power supplies sag, thermal throttling kills inference mid-response',
        'Self-healing autonomy on every node. Power monitoring every 5 minutes. Automatic service restarts. Temperature alerts before shutdown',
      ]},
    ],
    skills: ['Raspberry Pi', 'Hailo-8', 'Ollama', 'WireGuard', 'WiFi mesh', 'Pi-hole', 'Docker', 'Linux'],
    kpis: ['fleet_total', 'fleet_online', 'ollama_models', 'avg_temp_c', 'tailscale_peers', 'fleet_disk_total_gb'],
  },
  { slug: 'automation', num: '11', title: 'Automation Engineer', accent: '#4488FF',
    summary: 'A solo operator can\'t manually manage 256 services, 1,603 repos, and 7 nodes. Built 212 CLI tools and 52 scheduled automations that turn a one-person operation into a self-sustaining system.',
    sections: [
<<<<<<< Updated upstream
      { title: 'CLI Tools & Scripts', bullets: [
        '223 CLI tools (121 MB) in ~/bin for every operational task',
        '91 shell scripts for fleet management and deployment',
        'Custom brand compliance auditing and mass update tools',
        'Automated GitHub-to-Gitea relay syncing every 30 minutes',
=======
      { title: 'The Philosophy: If You Did It Twice, Automate It', bullets: [
        '212 CLI tools (121 MB) in ~/bin — every deployment, probe, audit, sync, and report is a single command',
        '91 shell scripts for fleet management. Custom brand compliance auditing. Mass update tooling across all 99 sites',
        'GitHub-to-Gitea relay syncs 207 repos every 30 minutes — cross-platform Git without manual intervention',
>>>>>>> Stashed changes
      ]},
      { title: 'The Schedule: 52 Tasks Running Without You', bullets: [
        '17 Mac cron jobs + 35 fleet systemd timers = 52 automated tasks running daily, hourly, and every 5 minutes',
        'Daily KPI collection at 6 AM: 10 collectors pull from GitHub API, fleet SSH, Cloudflare CLI, local Mac — aggregated into daily report',
        'Self-healing autonomy: heartbeat every 60s, heal every 5m, power monitor every 5m — fleet maintains itself overnight',
      ]},
      { title: 'The Pipeline: Data That Updates Itself', bullets: [
        '10 collectors generate snapshots \u2192 aggregated into daily JSON \u2192 pushed to Cloudflare KV \u2192 live resume dashboards update automatically',
        'Every number on this page came from an automated collector, not a human typing it. Updated daily. Verified by source',
      ]},
    ],
    skills: ['Bash', 'Python', 'cron', 'systemd timers', 'GitHub Actions', 'SSH automation', 'jq', 'curl'],
    kpis: ['bin_tools', 'home_scripts', 'mac_cron_jobs', 'systemd_timers', 'fleet_cron_jobs', 'repos_total'],
  },
  { slug: 'database', num: '12', title: 'Database Engineer', accent: '#00D4FF',
    summary: 'Different data needs different storage. Designed and operate 283 databases across 5 engines — PostgreSQL for transactions, SQLite for embedded state, D1 for serverless, KV for edge config, Qdrant for vectors. Each one chosen for a reason.',
    sections: [
<<<<<<< Updated upstream
      { title: 'Database Fleet (283 total)', bullets: [
        '11 PostgreSQL databases for relational application data',
        '230 SQLite databases (1.4 GB) for agent memory and metrics',
        '22 Cloudflare D1 serverless databases',
        '47 KV namespaces for edge configuration',
        'Qdrant vector database for semantic search',
=======
      { title: 'The Decision: Why 5 Engines, Not 1', bullets: [
        'PostgreSQL (11 DBs) for relational data that needs ACID guarantees — user state, application data, fleet metadata',
        'SQLite (230 DBs, 1.4 GB) for embedded, zero-config storage — agent memory, metrics history, local state. No server process, instant access',
        'Cloudflare D1 (23 DBs) for serverless apps at the edge — data lives next to the Workers that query it. Millisecond reads globally',
        'KV (47 namespaces) for configuration and caching — edge-distributed, eventually consistent, perfect for feature flags and session data',
>>>>>>> Stashed changes
      ]},
      { title: 'The Search: Finding Anything Instantly', bullets: [
        'FTS5 full-text search across 156,675 memory entries — the entire knowledge base searchable in under a millisecond',
        'Code search engine indexing 354 repos — find any function, any file, any pattern across the whole codebase',
        '111 registered systems tracked in a systems database — every device, service, and endpoint has a record',
      ]},
    ],
    skills: ['PostgreSQL', 'SQLite/FTS5', 'Cloudflare D1', 'KV stores', 'Qdrant', 'SQL', 'Python', 'database design'],
    kpis: ['postgres_dbs', 'sqlite_dbs', 'total_db_rows', 'cf_d1_databases', 'cf_kv_namespaces', 'fts5_entries'],
  },
  { slug: 'network', num: '13', title: 'Network Engineer', accent: '#FF6B2B',
    summary: 'Connecting 7 nodes across 3 physical locations with zero open ports. Built a multi-layer network: WireGuard mesh for encryption, Cloudflare tunnels for zero-trust access, RoadNet WiFi mesh for local coverage, and Pi-hole DNS for control.',
    sections: [
      { title: 'The Layers: Defense in Depth', bullets: [
        'Layer 1 — WireGuard mesh VPN (10.8.0.x): encrypted tunnels between all nodes. Every packet between nodes is encrypted, period',
        'Layer 2 — Cloudflare tunnels (4 active): 48+ domains routed to fleet with zero open ports. External traffic never touches a public IP',
        'Layer 3 — Tailscale overlay (9 peers): management access from anywhere. MagicDNS for node resolution. Exit nodes for remote debugging',
        'Layer 4 — RoadNet WiFi mesh: 5 APs on non-overlapping channels, 5 subnets, NAT, auto-failover — local devices talk to fleet directly',
      ]},
      { title: 'The DNS: Names, Not Numbers', bullets: [
        'Pi-hole for ad blocking and local DNS resolution. PowerDNS Docker for custom authoritative zones',
        'Custom DNS zones: .cece, .blackroad, .entity, .soul, .dream — edge services discoverable by domain name within the network',
        '48 Nginx reverse proxy sites with health checking — each domain routes to the right backend on the right node',
      ]},
    ],
    skills: ['WireGuard', 'Tailscale', 'Nginx', 'Cloudflare Tunnels', 'Pi-hole', 'PowerDNS', 'UFW', 'iptables'],
    kpis: ['nginx_sites', 'tailscale_peers', 'fleet_total', 'cf_pages', 'fleet_connections', 'systemd_services'],
  },
  { slug: 'security', num: '14', title: 'Security Engineer', accent: '#FF2255',
    summary: 'Found a crypto miner, a cron dropper, and a leaked PAT in my own infrastructure. Cleaned all of it, rotated credentials fleet-wide, and rebuilt security from zero-trust architecture up — because the hardest incidents are the ones inside your own network.',
    sections: [
      { title: 'The Incidents: What I Found and How I Fixed It', bullets: [
        'Obfuscated cron dropper on Cecilia — exec\'ing from /tmp/op.py every 5 minutes. Traced it, removed the cron entry, cleaned /tmp, audited all nodes',
        'xmrig crypto miner service configured on Lucidia — unit file referencing mining pool. Service removed, system audited for persistence mechanisms',
        'Leaked GitHub PAT (gho_Gfu...) embedded in a systemd service file on Lucidia — removed from config, token revoked on GitHub, all secrets migrated to chmod 600 env files',
        '50+ SSH authorized keys on some nodes — audited every key, identified which ones are active, locked down access paths',
      ]},
      { title: 'The Architecture: Trust Nothing by Default', bullets: [
        'Zero open ports — all external access through Cloudflare tunnels. No port forwarding, no exposed SSH, no public APIs',
        'WireGuard encryption for all inter-node traffic. UFW with INPUT DROP policy on edge nodes. Credential rotation enforced fleet-wide',
        'GitHub security scanning workflows check for AWS keys, tokens, passwords on every push — catches secrets before they ship',
      ]},
      { title: 'The Lesson', bullets: [
        'Security isn\'t a feature you add — it\'s what you find when you actually look. Every fleet needs an adversarial audit, not just a firewall',
      ]},
    ],
    skills: ['incident response', 'malware analysis', 'credential rotation', 'WireGuard', 'Cloudflare tunnels', 'UFW', 'SSH', 'Linux hardening'],
    kpis: ['failed_units', 'fleet_total', 'systemd_services', 'tailscale_peers', 'nginx_sites', 'fleet_online'],
  },
  { slug: 'data', num: '15', title: 'Data Engineer', accent: '#CC00AA',
    summary: 'Needed to prove every metric on every resume. Built a 10-collector pipeline that pulls from GitHub API, SSH fleet probes, Cloudflare CLI, and local system — 80+ KPIs aggregated daily, pushed to KV, served live on 20 dashboards.',
    sections: [
      { title: 'The Problem: Unverifiable Claims Don\'t Get Hired', bullets: [
        'Resumes say "managed 200+ services" but nobody can verify it. Needed machine-verified metrics with traceable sources',
        'Built 10 automated collectors: GitHub, GitHub-deep, all-orgs, Gitea, fleet, services, autonomy, LOC, local, Cloudflare',
        'Each collector runs independently, outputs JSON snapshots. Daily aggregation merges into a single file with 80+ keys. Every number has a source',
      ]},
      { title: 'The Pipeline: Collect \u2192 Aggregate \u2192 Serve', bullets: [
        'Fleet probes: Python scripts piped over SSH stdin to remote nodes — avoids shell quoting issues, runs on any node without installing anything',
        'Cloudflare inventory: wrangler CLI queries Pages, D1, KV, R2 counts. GitHub API: paginated queries across 17 organizations, deduped',
        'Daily JSON pushed to Cloudflare KV \u2192 Worker serves 20 live resume dashboards. Every number on this page updated automatically at 6 AM',
      ]},
      { title: 'The Scale: 283 Databases, One Pipeline', bullets: [
        '283 databases across PostgreSQL, SQLite, D1, KV, Qdrant — each one discovered, counted, and tracked by the collectors',
        'FTS5 full-text search across 156K entries. 111 registered systems. Day-over-day deltas show trends, not just snapshots',
      ]},
    ],
    skills: ['Python', 'PostgreSQL', 'SQLite/FTS5', 'Cloudflare D1', 'data pipelines', 'SSH probes', 'JSON', 'Bash'],
    kpis: ['total_loc', 'repos_total', 'postgres_dbs', 'sqlite_dbs', 'total_db_rows', 'cf_d1_databases'],
  },
  { slug: 'architect', num: '16', title: 'Solutions Architect', accent: '#8844FF',
<<<<<<< Updated upstream
    summary: 'Solutions architect: designed full hybrid edge-cloud architecture spanning 7 nodes, 184 Cloudflare resources, 48+ domains, and distributed AI inference.',
=======
    summary: 'Designed a hybrid architecture that combines $700 in edge hardware with Cloudflare\'s global network — 178 cloud resources, 48+ domains, 7 nodes, 52 TOPS AI compute, all working as one system. The proof is that it\'s running right now.',
>>>>>>> Stashed changes
    sections: [
      { title: 'The Design Decision: Why Hybrid', bullets: [
        'Pure cloud: fast to start, expensive to scale, no data sovereignty. Pure edge: cheap to run, limited reach, hard to expose',
        'Combined both: Cloudflare for global CDN, edge compute, and serverless databases. Pi fleet for persistent workloads, AI inference, and data ownership',
        'WireGuard mesh connects everything. Cloudflare tunnels expose services. Tailscale provides management plane. Three networking layers, one unified system',
      ]},
<<<<<<< Updated upstream
      { title: 'Cloudflare Stack', bullets: [
        '101 Pages + 25 D1 + 47 KV + 11 R2 = 178 resources',
        '4 tunnels routing 48+ domains to fleet services',
        'Workers for edge compute and API routing',
=======
      { title: 'The Stack: 178 Cloudflare Resources + 7 Fleet Nodes', bullets: [
        '99 Pages (global CDN) + 23 D1 (serverless SQL) + 47 KV (edge config) + 11 R2 (object storage) = 178 managed resources',
        '5 Pi nodes for persistent compute: Docker, Ollama, PostgreSQL, Nginx. 2 cloud VMs for VPN hub and public services',
        'AI inference distributed across 3 nodes with 52 TOPS — requests route to the node with the right model loaded',
      ]},
      { title: 'The Validation', bullets: [
        'This architecture runs 48+ production domains, serves real traffic, and costs under $50/month in cloud spend. The rest is hardware you own',
        '283 databases across 5 engines — each one placed where the latency and consistency requirements demand it',
>>>>>>> Stashed changes
      ]},
    ],
    skills: ['system design', 'Cloudflare', 'WireGuard', 'distributed systems', 'edge computing', 'AI infrastructure'],
    kpis: ['cf_pages', 'cf_d1_databases', 'cf_kv_namespaces', 'cf_r2_buckets', 'fleet_total', 'repos_total'],
  },
  { slug: 'lead', num: '17', title: 'Technical Lead', accent: '#4488FF',
<<<<<<< Updated upstream
    summary: 'Technical lead: 51,211 commits in 2026 (3,582 in a single day peak), 4,019 PRs merged, 1,810 repos across 17 organizations, 20 languages, 7.2M+ lines of code.',
    sections: [
      { title: 'Code Velocity', bullets: [
        '51,000+ commits YTD sustained across all repositories',
        '4,019 PRs merged all-time',
        '1,603 GitHub repos across 17 organizations',
        '207 Gitea repos across 7 self-hosted organizations',
      ]},
      { title: 'Technical Breadth', bullets: [
        '20 programming languages: Python, JavaScript, TypeScript, Shell, Go, C, and more',
        '7.2M+ lines of code with daily LOC tracking',
        '223 CLI tools built for operational efficiency',
        'Custom programming language (RoadC) with interpreter',
=======
    summary: '326 commits/day. 4,019 PRs merged. 1,603 repos across 17 organizations. 20 languages. 7.2M lines of code. This is what sustained technical velocity looks like when you architect for speed and automate everything that slows you down.',
    sections: [
      { title: 'The Velocity: Why These Numbers Are Real', bullets: [
        '326 commits/day isn\'t sprinting — it\'s the natural output of 212 CLI tools, automated pipelines, and infrastructure that doesn\'t fight you',
        '4,019 PRs merged across all repos. Every change goes through a PR, even solo. The discipline of code review applies to yourself',
        '1,603 GitHub repos across 17 organizations — each org has a purpose (AI, Cloud, Hardware, Education, etc.). 207 more on self-hosted Gitea',
      ]},
      { title: 'The Breadth: 20 Languages, One Person', bullets: [
        'Python (470 repos), JavaScript (114), HTML (314), Shell (160), TypeScript (85), Go, C, MDX, Dockerfile, CSS — the right language for the right job',
        '7.2M lines of code tracked daily by automated LOC collector — not vanity, verification. Every line is accounted for',
        'Custom programming language (RoadC) with full interpreter: lexer, parser, tree-walking evaluator — because sometimes the right tool doesn\'t exist yet',
      ]},
      { title: 'The Principle', bullets: [
        'Technical leadership isn\'t about managing people. It\'s about building systems so well that one person can operate what usually takes a team',
>>>>>>> Stashed changes
      ]},
    ],
    skills: ['Python', 'JavaScript', 'TypeScript', 'Bash', 'Go', 'C', 'React', 'FastAPI', 'system design', 'mentorship'],
    kpis: ['commits_ytd', 'commits_today', 'prs_merged_total', 'repos_total', 'total_loc', 'github_language_count', 'bin_tools'],
  },
  { slug: 'python', num: '18', title: 'Python Developer', accent: '#00D4FF',
    summary: '470 Python repos. FastAPI services handling AI inference, fleet probes, and data pipelines. Python isn\'t just a language in this stack — it\'s the glue that holds 7 nodes, 27 models, and 283 databases together.',
    sections: [
      { title: 'The Services: Python in Production', bullets: [
        'CECE API (FastAPI) — custom LLM personality engine with text-to-speech. Runs on Pi 5, serves inference over HTTP',
        'Lucidia API (FastAPI) — application platform backend. CarPool (Next.js + Clerk) frontend, Python API layer',
        'Fleet probes — Python scripts piped over SSH stdin to remote nodes. No installation needed. Collects CPU, RAM, disk, Docker, Ollama, systemd stats',
        'KPI aggregation pipeline — 10 collectors output JSON, Python merges into daily summary with 80+ keys, pushes to KV',
      ]},
      { title: 'The Tools: Python Solving Real Problems', bullets: [
        'FTS5 search engine — Python + SQLite full-text search across 156K memory entries. Sub-millisecond lookups',
        'RoadC interpreter — custom language with Python-style indentation. Lexer, parser, and tree-walking evaluator, all in Python',
        'AI image generation hub — Python orchestrating 4 backend agents (DALL-E, Flux, SDXL, FAL), automatic model selection',
        'Automated reporting — terminal dashboards, Slack notifications, markdown reports, resume generation. All Python',
      ]},
    ],
    skills: ['Python', 'FastAPI', 'SQLite', 'PostgreSQL', 'Ollama', 'asyncio', 'subprocess', 'json', 'data pipelines'],
    kpis: ['total_loc', 'repos_total', 'postgres_dbs', 'sqlite_dbs', 'ollama_models', 'systems_registered'],
  },
  { slug: 'product', num: '19', title: 'Product Engineer', accent: '#FF6B2B',
    summary: '99 live sites, but no design team. Built a brand-locked design system with 75 templates, 15 page types, and automated compliance auditing — every site ships on-brand because the system won\'t let you ship off-brand.',
    sections: [
<<<<<<< Updated upstream
      { title: 'Product Development', bullets: [
        '101 Cloudflare Pages projects deployed across 48+ domains',
        '75 design templates with brand-locked system (gradients, typography, spacing)',
        '15 page types: landing, pricing, blog, docs, dashboard, auth, portfolio, status',
        'AI image generation hub with 4 backend agents',
=======
      { title: 'The System: Brand as Code', bullets: [
        'Gradient spectrum locked: #FF6B2B \u2192 #FF2255 \u2192 #CC00AA \u2192 #8844FF \u2192 #4488FF \u2192 #00D4FF. No other colors in containers with text',
        'Typography locked: Space Grotesk for display, JetBrains Mono for code, Inter for body. Golden ratio spacing (\u03C6 = 1.618)',
        'Automated brand compliance auditing — tooling scans all 99 sites for violations. Mass update tooling applies fixes fleet-wide',
>>>>>>> Stashed changes
      ]},
      { title: 'The Coverage: 15 Page Types, Every SaaS Surface', bullets: [
        'Landing (hero, light alt), pricing, blog (listing + article), docs, dashboard, auth, portfolio, contact, error-404, status, settings, team, changelog',
        '75 design templates (HTML/JSX) — each one brand-locked, responsive, and production-ready. Plug in content and deploy',
        '99 Cloudflare Pages projects across 48+ custom domains — every site is live, every domain has SSL, every page loads in under 2 seconds',
      ]},
      { title: 'The Product: AI Image Generation', bullets: [
        'images.blackroad.io — AI image generation hub with 4 backend agents, R2 storage, D1 metadata, single API endpoint',
        'Users request images by prompt. System routes to best model (DALL-E for quality, Flux for speed). Results stored and served from R2',
      ]},
    ],
    skills: ['React', 'Next.js', 'HTML/CSS', 'Cloudflare Pages', 'design systems', 'brand management', 'Figma'],
    kpis: ['cf_pages', 'templates', 'repos_total', 'total_loc', 'nginx_sites', 'bin_tools'],
  },
  { slug: 'cto', num: '20', title: 'Startup CTO', accent: '#CC00AA',
<<<<<<< Updated upstream
    summary: 'Technical founder who orchestrated AI agents to build BlackRoad OS from zero: 7.2M LOC, 1,810 repos, 7-node fleet, 96 Workers, 27 AI models, 283 databases, and 54 live domains. One person directing agents.',
    sections: [
      { title: 'Orchestrated From Zero', bullets: [
        '7.2M+ lines of code (5.0M unique non-duped) — directed AI agents to write it, reviewed and shipped it',
        '20 programming languages, 51,000+ commits YTD — sustained 700/day velocity via agent orchestration',
        '223 CLI tools — defined patterns once, agents replicated consistently across all tools',
        '4,019 PRs merged — agent-generated code reviewed and merged through disciplined workflow',
=======
    summary: 'Built BlackRoad OS from nothing — no team, no funding, no existing code. One person, 7.2M lines of code, 1,810 repos, 7-node fleet, 27 AI models, 283 databases, 48+ live domains. The entire company\'s technical stack, soup to nuts, solo.',
    sections: [
      { title: 'From Zero to Production — Alone', bullets: [
        'Started with an idea and a credit card. Now: 7.2M lines of code, 1,603 GitHub repos across 17 orgs, 207 Gitea repos across 7 more',
        '326 commits/day sustained velocity. 4,019 PRs merged. 20 programming languages. 212 CLI tools built for every operational workflow',
        'No investors, no employees, no outsourcing — every line of code, every server config, every DNS record is my work',
>>>>>>> Stashed changes
      ]},
      { title: 'The Infrastructure Decision: Own Everything', bullets: [
        '5 Raspberry Pi edge nodes + 2 cloud VMs + Cloudflare serverless — total hardware cost under $700, cloud spend under $50/month',
        '256 systemd services, 14 Docker containers, 48 Nginx sites, 27 Ollama models (48.1 GB), 52 TOPS AI compute (2x Hailo-8)',
        'WireGuard mesh + 4 Cloudflare tunnels + Tailscale overlay — three networking layers ensuring everything talks to everything, encrypted',
      ]},
      { title: 'The Cloud Platform: 178 Managed Resources', bullets: [
        '99 Pages, 23 D1, 47 KV, 11 R2 — Cloudflare is the global layer. Fleet is the sovereign layer. Both managed through CLI automation',
        '283 databases across 5 engines. 48+ custom domains. 52 automated tasks. 60+ KPIs tracked daily across 10 collectors',
      ]},
<<<<<<< Updated upstream
      { title: 'Cloud & Data', bullets: [
        '101 Pages, 25 D1, 47 KV, 11 R2, 48+ domains',
        '283 databases across 5 engines',
        '52 automated tasks, 60+ KPIs tracked daily',
=======
      { title: 'Why It Matters', bullets: [
        'This isn\'t a portfolio project — it\'s a production system serving real traffic. Every metric on this page is collected from live infrastructure, right now',
        'A CTO who built the whole stack understands every layer. I don\'t delegate debugging because I wrote the code that\'s breaking',
>>>>>>> Stashed changes
      ]},
    ],
    skills: ['everything'],
    kpis: ['commits_ytd', 'total_loc', 'unique_loc', 'non_fork_repos', 'github_contributions_ytd', 'github_commit_streak_days', 'github_avg_commits_per_day', 'github_clones_14d', 'repos_total', 'github_repos_updated_7d', 'prs_merged_total', 'github_issues_closed_total', 'fleet_total', 'ollama_models', 'cf_pages', 'cf_workers_total', 'cf_tunnels_healthy', 'docker_containers', 'systemd_services', 'nginx_sites'],
  },
  { slug: 'agent-orchestrator', num: '21', title: 'AI Agent Orchestrator', accent: '#FF2255',
    summary: 'Directed AI coding agents (Claude, GPT, Gemini) to produce 7.2M LOC across 1,810 repos. Didn\'t write it — architected the system, defined the specs, reviewed the output, and shipped it.',
    sections: [
      { title: 'Agent-Driven Development', bullets: [
        'Orchestrated Claude Code, GPT-4, and Gemini agents to generate production code across 20 languages',
        'Directed 51,211 commits in 2026 — average 700/day sustained velocity via agent orchestration',
        'Defined architecture specs, reviewed agent output, iterated on quality, merged and deployed',
        'Built 223 CLI tools, 101 Cloudflare Pages, 96 Workers — all via agent-directed development',
      ]},
      { title: 'Orchestration Methodology', bullets: [
        'System-level prompting: CLAUDE.md files define project context, conventions, and constraints for every repo',
        'Multi-agent pipelines: different agents for architecture, implementation, testing, deployment',
        'Quality gates: human review at architecture decisions, agent handles implementation details',
        'Iteration loops: spec → agent draft → review → refinement → ship — no manual line-by-line coding',
      ]},
      { title: 'What This Produced', bullets: [
        '7.2M LOC (5.0M unique non-duplicated) — 1,563 non-fork original repos (97% her own specs)',
        'Complete sovereign OS: CLI dispatcher, AI gateway, fleet automation, KPI pipeline, brand system',
        'Self-updating resume system: 11 collectors → 60+ KPIs → live on 20 role pages → auto-commits daily',
        'Custom programming language (RoadC) with lexer, parser, and interpreter — directed agent to build it',
      ]},
      { title: 'Why This Matters', bullets: [
        'The future of software is directing agents, not typing code — this is 10 months of proof',
        'One person + AI agents = output of a 20-person engineering team',
        'The skill is knowing WHAT to build, HOW to spec it, and WHEN the agent output is wrong',
        'Shipped to production daily — not toy demos, real infrastructure serving real traffic',
      ]},
    ],
    skills: ['Claude Code', 'GPT-4', 'Gemini', 'Prompt Engineering', 'System Architecture', 'Code Review', 'CLAUDE.md', 'Agent Pipelines', 'Technical Direction'],
    kpis: ['commits_ytd', 'total_loc', 'unique_loc', 'non_fork_repos', 'repos_total', 'github_contributions_ytd', 'github_commit_streak_days', 'github_avg_commits_per_day', 'github_clones_14d', 'prs_merged_total', 'bin_tools', 'cf_pages', 'cf_workers_total'],
  },
  { slug: 'ai-director', num: '22', title: 'Technical AI Director', accent: '#9C27B0',
    summary: 'Technical director who treats AI agents as a team. Defines architecture, writes specs, assigns work to agents, reviews output, and ships. Built a 7.2M LOC platform this way in 10 months.',
    sections: [
      { title: 'Directing AI Teams', bullets: [
        'Treat each AI agent as a team member with strengths: Claude for architecture, GPT for breadth, Gemini for speed',
        'Write CLAUDE.md project files that give agents full context — conventions, structure, dependencies, constraints',
        'Break complex systems into agent-sized tasks: "build the lexer," "add SSE streaming," "write the fleet probe"',
        'Review agent output like a tech lead reviews PRs — catch architectural mistakes, not typos',
      ]},
      { title: 'Production Results', bullets: [
        '1,810 repositories across 17 GitHub organizations — all agent-directed',
        '96 Cloudflare Workers, 101 Pages, 25 D1 databases — production infrastructure, not prototypes',
        '223 CLI tools, each with its own SQLite database — consistent patterns across all tools',
        '11 KPI collectors gathering 60+ metrics daily — agents built the monitoring for what agents built',
      ]},
      { title: 'Technical Judgment', bullets: [
        'Know when to accept agent output and when to push back — agents are fast but not always right',
        'Architecture decisions are human: "use Cloudflare Workers not Lambda," "SQLite not Postgres for CLI tools"',
        'Agent output scales linearly, but judgment about what to build is the bottleneck — that\'s the job',
        'Debugged agent mistakes: thermal throttling, leaked credentials, obfuscated cron droppers, broken DNS',
      ]},
    ],
    skills: ['AI Agent Management', 'Technical Direction', 'Architecture', 'Code Review', 'System Design', 'Prompt Engineering', 'Risk Assessment'],
    kpis: ['commits_ytd', 'total_loc', 'unique_loc', 'repos_total', 'prs_merged_total', 'github_repos_updated_7d', 'bin_tools', 'cf_pages', 'ollama_models', 'fleet_total'],
  },
  { slug: 'prompt-engineer', num: '23', title: 'Enterprise Prompt Engineer', accent: '#4488FF',
    summary: 'Prompt engineer at production scale. Not chatbot prompts — system-level CLAUDE.md files, multi-step agent pipelines, and orchestration patterns that produced 7.2M LOC of shipping software.',
    sections: [
      { title: 'System-Level Prompting', bullets: [
        'CLAUDE.md files in every repo: project structure, conventions, brand rules, deployment targets, testing patterns',
        'Memory systems: agent context persists across conversations via structured memory files',
        'Constraint engineering: agents follow brand-lock rules (gradient spectrum, font stack, no solid-color containers)',
        'Error recovery: prompts that handle agent confusion, hallucination, and scope creep',
      ]},
      { title: 'Multi-Agent Orchestration', bullets: [
        'Chain agents: architect agent → implementation agent → review agent → deploy agent',
        'Parallel agents: run research, implementation, and testing agents simultaneously',
        'Specialist routing: security tasks to one agent, UI to another, infrastructure to a third',
        'Context management: know when to start fresh vs continue, when to summarize vs keep full history',
      ]},
      { title: 'Production Outcomes', bullets: [
        '51,211 commits in 2026 — sustained 700/day velocity, not a weekend hackathon',
        '223 CLI tools with consistent patterns — same prompt patterns produced uniform quality',
        'Self-healing fleet: agents wrote the autonomy scripts that keep the fleet running',
        'This resume system: agents built the Worker, the KPI collectors, the daily pipeline, the brand CSS',
      ]},
    ],
    skills: ['CLAUDE.md Authoring', 'Claude Code', 'System Prompts', 'Few-Shot Examples', 'Chain-of-Thought', 'Agent Pipelines', 'Context Window Management', 'Prompt Debugging'],
    kpis: ['commits_ytd', 'total_loc', 'unique_loc', 'repos_total', 'github_commit_streak_days', 'github_avg_commits_per_day', 'bin_tools', 'cf_pages', 'cf_workers_total', 'github_clones_14d'],
  },
  { slug: 'ai-ops', num: '24', title: 'AI Operations Lead', accent: '#00D4FF',
    summary: 'AI Ops: deploying, monitoring, and operating 27 AI models across a distributed Pi fleet with 52 TOPS of dedicated acceleration. Not just training models — running them in production 24/7.',
    sections: [
      { title: 'Model Operations', bullets: [
        '27 Ollama models (48.1 GB) deployed across 3 edge inference nodes',
        '4 custom fine-tuned CECE personality models for domain-specific generation',
        '2x Hailo-8 NPUs (52 TOPS total) — dedicated AI silicon, not shared GPU time',
        'Ollama Bridge SSE proxy for real-time streaming to web clients',
      ]},
      { title: 'AI Gateway Operations', bullets: [
        'OpenAI-compatible API at api.blackroad.io — 29 models, 7 providers, automatic failover',
        'Tier-based authentication and rate limiting via Cloudflare Workers',
        'Provider abstraction: switch between Claude, GPT, Llama, Qwen without client changes',
        'Health monitoring and model availability tracking across all providers',
      ]},
      { title: 'Fleet AI Infrastructure', bullets: [
        'Thermal management: identified and fixed runaway inference loops (73°C → 52°C)',
        'Power optimization: CPU governor tuning, voltage monitoring, undervoltage detection',
        'Model distribution: right models on right nodes based on RAM and NPU availability',
        'Agent coding workflow: AI agents generate code → deploy to fleet → fleet runs AI models (recursive!)',
      ]},
    ],
    skills: ['Ollama', 'Hailo-8 NPU', 'Model Deployment', 'Edge AI', 'Inference Optimization', 'Thermal Management', 'AI Gateway', 'SSE Streaming'],
    kpis: ['ollama_models', 'ollama_size_gb', 'fleet_total', 'fleet_online', 'avg_temp_c', 'cf_workers_total', 'docker_containers', 'systemd_services'],
  },
  { slug: 'technical-pm', num: '25', title: 'Technical Program Manager', accent: '#FF6B2B',
    summary: 'TPM who ships by orchestrating AI agents instead of managing human sprint teams. Defined scope, wrote specs, directed agents, reviewed output, deployed to production — 51K commits in 10 months.',
    sections: [
      { title: 'Program Execution', bullets: [
        'Defined and shipped 8 major projects in 10 months — OS, CLI, gateway, fleet, cloud stack, KPI system, AI identity, custom language',
        'Managed scope across 1,810 repositories and 17 GitHub organizations',
        'Maintained 700 commits/day velocity — not by typing, by directing and reviewing agent work',
        'Zero project failures — every project shipped to production and is running live',
      ]},
      { title: 'Stakeholder Management', bullets: [
        'Previous: $26.8M enterprise sales at Securian Financial (92% quota in Year 1)',
        'Keynote speaker to 450+ attendees (4.8/5.0 rating)',
        'Due diligence presenter for 24,000-advisor LPL network',
        'Bridge technical depth and business communication — explain Hailo-8 NPUs to a board, explain ROI to engineers',
      ]},
      { title: 'Process & Metrics', bullets: [
        'Built the KPI system that tracks the work: 11 collectors, 60+ metrics, daily automated pipeline',
        'Every decision data-driven: fleet health, code velocity, cloud costs, model performance',
        'Self-updating documentation: VERIFIED-METRICS.md auto-generated from live data',
        'Automated reporting: Slack notifications, daily summaries, weekly digests',
      ]},
    ],
    skills: ['Program Management', 'AI Agent Direction', 'Stakeholder Communication', 'Metrics & KPIs', 'Enterprise Sales', 'Keynote Speaking', 'Cross-Functional Leadership'],
    kpis: ['commits_ytd', 'repos_total', 'github_repos_updated_7d', 'prs_merged_total', 'github_issues_closed_total', 'bin_tools', 'cf_pages', 'fleet_total', 'github_commit_streak_days'],
  },
];

const KPI_LABELS = {
  total_loc: 'Lines of Code',
  unique_loc: 'Unique LOC (Non-Duped)',
  non_fork_repos: 'Non-Fork Repos',
  github_views_14d: 'GitHub Views (14d)',
  github_clones_14d: 'GitHub Clones (14d)',
  github_contributions_ytd: 'Contributions YTD',
  github_commit_streak_days: 'Commit Streak (days)',
  github_avg_commits_per_day: 'Avg Commits/Day',
  github_issues_closed_total: 'Issues Closed',
  github_repos_updated_7d: 'Repos Active (7d)',
  cf_zones_count: 'CF Zones',
  cf_workers_total: 'CF Workers (total)',
  cf_tunnels_healthy: 'Tunnels Healthy',
  commits_today: 'Commits Today',
  commits_ytd: 'Commits (2026)',
  prs_merged_total: 'PRs Merged',
  prs_open: 'PRs Open',
  repos_total: 'Total Repos',
  repos_github: 'GitHub Repos',
  repos_gitea: 'Gitea Repos',
  github_org_count: 'GitHub Orgs',
  github_language_count: 'Languages',
  cf_workers: 'CF Workers',
  cf_domains: 'Custom Domains',
  fleet_total: 'Fleet Nodes',
  fleet_online: 'Nodes Online',
  avg_temp_c: 'Avg Temp',
  fleet_mem_total_mb: 'Fleet RAM (MB)',
  fleet_mem_used_mb: 'RAM Used (MB)',
  fleet_disk_total_gb: 'Fleet Storage (GB)',
  fleet_disk_used_gb: 'Disk Used (GB)',
  fleet_connections: 'Net Connections',
  fleet_processes: 'Processes',
  systemd_services: 'Systemd Services',
  systemd_timers: 'Systemd Timers',
  docker_containers: 'Docker Containers',
  docker_images: 'Docker Images',
  nginx_sites: 'Nginx Sites',
  ollama_models: 'AI Models',
  ollama_size_gb: 'Model Size (GB)',
  postgres_dbs: 'PostgreSQL DBs',
  sqlite_dbs: 'SQLite DBs',
  cf_pages: 'CF Pages',
  cf_d1_databases: 'D1 Databases',
  cf_kv_namespaces: 'KV Namespaces',
  cf_r2_buckets: 'R2 Buckets',
  failed_units: 'Failed Units',
  tailscale_peers: 'Tailscale Peers',
  bin_tools: 'CLI Tools',
  home_scripts: 'Shell Scripts',
  templates: 'Templates',
  mac_cron_jobs: 'Mac Crons',
  fleet_cron_jobs: 'Fleet Crons',
  fts5_entries: 'FTS5 Entries',
  systems_registered: 'Systems Registered',
  total_db_rows: 'Total DB Rows',
};

const KPI_SOURCES = {
  total_loc: 'loc.sh — cloc + fleet SSH',
  commits_today: 'github.sh — gh api events',
  prs_merged_total: 'github.sh — gh api search/issues',
  prs_open: 'github.sh — gh api search/issues',
  repos_total: 'github-all-orgs.sh — gh api repos (17 owners)',
  repos_github: 'github-all-orgs.sh — gh api repos (17 owners)',
  repos_gitea: 'gitea.sh — Gitea REST API',
  github_org_count: 'github-all-orgs.sh — unique owner count',
  github_language_count: 'github-all-orgs.sh — repo language field',
  fleet_total: 'fleet.sh — SSH probe to all nodes',
  fleet_online: 'fleet.sh — SSH probe to all nodes',
  avg_temp_c: 'fleet.sh — /sys/class/thermal via SSH',
  fleet_mem_total_mb: 'fleet.sh — /proc/meminfo via SSH',
  fleet_mem_used_mb: 'fleet.sh — /proc/meminfo via SSH',
  fleet_disk_total_gb: 'fleet.sh — df via SSH',
  fleet_disk_used_gb: 'fleet.sh — df via SSH',
  fleet_connections: 'services.sh — ss -tun via SSH',
  fleet_processes: 'services.sh — /proc count via SSH',
  systemd_services: 'services.sh — systemctl list-units via SSH',
  systemd_timers: 'services.sh — systemctl list-timers via SSH',
  docker_containers: 'services.sh — docker ps via SSH',
  docker_images: 'services.sh — docker images via SSH',
  nginx_sites: 'services.sh — /etc/nginx/sites-enabled via SSH',
  ollama_models: 'services.sh — ollama list via SSH',
  ollama_size_gb: 'services.sh — ollama list via SSH',
  postgres_dbs: 'services.sh — psql -l via SSH',
  sqlite_dbs: 'local.sh — find ~/.blackroad -name *.db',
  cf_pages: 'cloudflare.sh — wrangler pages list',
  cf_d1_databases: 'cloudflare.sh — wrangler d1 list --json',
  cf_kv_namespaces: 'cloudflare.sh — wrangler kv list',
  cf_r2_buckets: 'cloudflare.sh — wrangler r2 bucket list',
  failed_units: 'services.sh — systemctl --failed via SSH',
  tailscale_peers: 'services.sh — tailscale status via SSH',
  bin_tools: 'local.sh — ls ~/bin | wc -l',
  home_scripts: 'local.sh — find ~/ -name *.sh',
  templates: 'local.sh — ls ~/Desktop/templates',
  mac_cron_jobs: 'local.sh — crontab -l | wc -l',
  fleet_cron_jobs: 'autonomy.sh — crontab -l via SSH',
  fts5_entries: 'local.sh — sqlite3 FTS5 count',
  systems_registered: 'local.sh — sqlite3 systems count',
  total_db_rows: 'local.sh — sqlite3 row count across 230 DBs',
};

const KPI_ACHIEVEMENTS = {
  total_loc: 'Built a complete sovereign OS — no vendor lock-in, no rented infrastructure',
  unique_loc: '97% original code — only 46 forks out of 1,609 repos',
  non_fork_repos: 'Nearly every repo is original work, not forked templates',
  commits_today: 'Sustained daily velocity across 17 organizations',
  commits_ytd: '~700 commits/day average — shipping production code daily for 10 months straight',
  prs_merged_total: 'Disciplined PR workflow across solo + fleet-automated pipelines',
  prs_open: 'Active development across multiple repos simultaneously',
  repos_total: 'Complete product ecosystem — CLI, API, dashboards, agents, docs, infra',
  repos_github: 'Public + org repos across 17 GitHub organizations',
  repos_gitea: 'Self-hosted Gitea on Pi fleet — sovereign code hosting, no cloud dependency',
  github_org_count: 'Structured monorepo strategy — AI, Cloud, Security, Labs, Hardware separated',
  github_language_count: 'Full-stack polyglot — right tool for each job, no single-language bias',
  cf_workers: 'Edge compute for API routing, auth, and KPI serving — <50ms global latency',
  cf_workers_total: '96 serverless functions handling auth, routing, analytics, and AI gateway',
  cf_domains: '54 domains managed via CLI — zero manual DNS or portal clicks',
  fleet_total: 'Distributed edge fleet — compute lives where the data lives',
  fleet_online: 'Self-healing autonomy keeps fleet running without manual intervention',
  avg_temp_c: 'Power optimization reduced temps from 73°C to ~52°C — extended hardware life',
  fleet_mem_total_mb: 'Sufficient RAM for 27 AI models + Docker + services without swapping',
  fleet_mem_used_mb: 'Optimized memory — disabled 16 skeleton services, freed 800MB on Lucidia',
  fleet_disk_total_gb: '707 GB distributed storage — NVMe + SD across all nodes',
  fleet_disk_used_gb: 'Storage headroom maintained for AI model downloads and log rotation',
  fleet_connections: 'Active network connections — WireGuard mesh + Tailscale + tunnels',
  fleet_processes: 'Lean process counts — aggressive cleanup of unused services',
  systemd_services: '256 services managed with auto-restart policies and health checks',
  systemd_timers: 'Cron-free scheduling — systemd timers for reliability and logging',
  docker_containers: 'Containerized Gitea, NATS, Ollama, PowerDNS — isolated and portable',
  docker_images: 'Minimal image count — removed 141 orphaned containers from Aria',
  nginx_sites: '48 reverse proxy configs routing to internal services via tunnels',
  ollama_models: '27 models deployed — llama, qwen, phi, gemma, custom CECE fine-tunes',
  ollama_size_gb: '48 GB of AI models running on $400 worth of Pi hardware — not $50K GPU servers',
  postgres_dbs: 'Relational storage for Qdrant vectors, agent state, and task queues',
  sqlite_dbs: '230 databases — each CLI tool and agent gets its own isolated datastore',
  cf_pages: '101 static sites deployed from CLI — landing pages, docs, dashboards, portfolios',
  cf_d1_databases: '25 edge databases — search indexes, analytics, auth, KPIs served at edge',
  cf_kv_namespaces: '47 key-value stores — config, feature flags, session state, live metrics',
  cf_r2_buckets: '11 object storage buckets — images, backups, model artifacts',
  failed_units: 'Zero failed units = self-healing autonomy scripts catching and fixing issues',
  tailscale_peers: 'Overlay network — access any node from anywhere without port forwarding',
  bin_tools: '223 tools — every repetitive task automated into a single command',
  home_scripts: 'Shell automation layer — backup, sync, deploy, monitor',
  templates: '75 brand-locked templates — consistent UI across all 101 sites',
  mac_cron_jobs: 'Mac orchestrates fleet — health checks, syncs, KPI collection, git patrol',
  fleet_cron_jobs: 'Fleet self-heals — heartbeat every 1min, auto-restart every 5min',
  fts5_entries: '156K searchable entries — instant full-text search across all agent memory',
  systems_registered: '111 systems tracked — devices, services, APIs in unified registry',
  github_views_14d: 'Organic discovery — developers finding BlackRoad OS repos',
  github_clones_14d: '10K+ clones in 14 days — people are downloading and running the code',
  github_unique_cloners_14d: '893 unique cloners — real developers, not bots',
  github_contributions_ytd: 'GitHub contribution graph — sustained green for entire year',
  github_commit_streak_days: 'Consecutive days with commits — no gaps in development velocity',
  github_avg_commits_per_day: 'Velocity metric — consistent output, not burst-and-disappear',
  github_issues_closed_total: 'Issues resolved — bugs fixed, features shipped, debt paid down',
  github_repos_updated_7d: 'Active repos this week — breadth of ongoing development',
  cf_zones_count: '20 DNS zones managed — all automated via Cloudflare API',
  cf_tunnels_healthy: 'Healthy tunnels routing traffic to Pi fleet without public IPs',
  cf_tunnels_total: '18 tunnels — redundant paths to all fleet nodes',
  github_unique_visitors_14d: 'Unique visitors viewing repos on GitHub',
};

function fmt(key, val) {
  if (val === undefined || val === null) return '—';
  if (key === 'total_loc' || key === 'prs_merged_total' || key === 'fts5_entries' || key === 'total_db_rows') {
    return typeof val === 'number' ? val.toLocaleString() : val;
  }
  if (key === 'avg_temp_c') return typeof val === 'number' ? val.toFixed(1) + '\u00b0C' : val;
  if (key === 'ollama_size_gb') return typeof val === 'number' ? val.toFixed(1) + ' GB' : val;
  if (typeof val === 'number') return val.toLocaleString();
  return val;
}

function css() {
  return `*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;scroll-behavior:smooth}
:root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--white:#fff;--border:#1a1a1a;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
body{background:var(--bg);color:var(--white);font-family:var(--sg);line-height:1.618}
a{color:var(--white);text-decoration:none}
.grad-bar{height:4px;background:var(--g)}
nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(0,0,0,.92);backdrop-filter:blur(20px);z-index:100}
.nav-logo{font-weight:700;font-size:18px;display:flex;align-items:center;gap:10px}
.nav-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
.nav-right{display:flex;align-items:center;gap:24px;font-size:13px}
.nav-right a{opacity:.4;transition:opacity .2s}
.nav-right a:hover{opacity:1}
.live-clock{font-family:var(--jb);font-size:12px;opacity:.5;letter-spacing:.05em}
.live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:6px;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}

.hero{padding:100px 48px 60px;text-align:center;position:relative;overflow:hidden;animation:fadeUp .6s}
.hero-orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:.07;pointer-events:none}
.hero-orb-1{width:500px;height:500px;top:-100px;left:5%}
.hero-orb-2{width:400px;height:400px;top:0;right:5%}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;margin-bottom:24px;font-family:var(--jb)}
.hero h1{font-size:52px;font-weight:700;line-height:1.1;margin-bottom:16px;max-width:800px;margin-left:auto;margin-right:auto}
.hero-role{background:var(--g135);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{font-size:17px;opacity:.5;max-width:600px;margin:0 auto 40px;line-height:1.7}
.hero-links{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.hero-links a{padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;transition:all .2s}
.btn-solid{background:var(--white);color:#000}
.btn-solid:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(255,255,255,.15)}
.btn-outline{border:1px solid var(--border)}
.btn-outline:hover{border-color:#444}

.kpi-strip{display:flex;justify-content:center;gap:48px;padding:48px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);flex-wrap:wrap;animation:fadeUp .8s}
.kpi-item{text-align:center;animation:countUp .6s both}
.kpi-val{font-size:36px;font-weight:700;font-family:var(--jb)}
.kpi-label{font-size:11px;opacity:.35;text-transform:uppercase;letter-spacing:.1em;margin-top:4px;font-family:var(--jb)}

.section{max-width:900px;margin:0 auto;padding:64px 48px}
.section-title{font-size:14px;text-transform:uppercase;letter-spacing:.15em;opacity:.3;margin-bottom:32px;font-family:var(--jb)}

.exp-block{margin-bottom:40px;padding:32px;border:1px solid var(--border);border-radius:12px;position:relative;transition:border-color .2s}
.exp-block:hover{border-color:#333}
.exp-block::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:12px 12px 0 0;background:var(--g);opacity:.5;transition:opacity .2s}
.exp-block:hover::before{opacity:1}
.exp-block h3{font-size:18px;font-weight:600;margin-bottom:16px}
.exp-block ul{list-style:none;padding:0}
.exp-block li{padding:6px 0;padding-left:20px;position:relative;font-size:14px;opacity:.7;line-height:1.7}
.exp-block li::before{content:'';position:absolute;left:0;top:14px;width:6px;height:6px;border-radius:50%;background:var(--g135)}

.skills-grid{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.skill-tag{padding:6px 14px;border:1px solid var(--border);border-radius:6px;font-size:13px;font-family:var(--jb);transition:all .2s}
.skill-tag:hover{border-color:#444;transform:translateY(-1px)}

.metrics-table{width:100%;border-collapse:collapse;margin-top:16px}
.metrics-table tr{border-bottom:1px solid var(--border);transition:background .2s}
.metrics-table tr:hover{background:rgba(255,255,255,.02)}
.metrics-table td{padding:14px 16px;font-size:14px;vertical-align:top}
.metrics-table td:first-child{font-family:var(--jb);font-size:12px;opacity:.5;text-transform:uppercase;letter-spacing:.08em;width:160px;white-space:nowrap}
.metrics-table td:nth-child(2){font-weight:600;text-align:right;font-family:var(--jb);font-size:18px;width:110px;white-space:nowrap}
.metrics-table td:nth-child(3){font-size:12px;opacity:.55;line-height:1.5;padding-left:24px}
.metrics-table td:last-child{font-family:var(--jb);font-size:10px;opacity:.2;text-align:right;padding-left:16px;white-space:nowrap;width:120px}

.collected-at{text-align:center;padding:24px;font-size:12px;opacity:.3;font-family:var(--jb)}

footer{border-top:1px solid var(--border);padding:48px;text-align:center}
.footer-roles{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:24px;max-width:900px;margin-left:auto;margin-right:auto}
.footer-roles a{padding:4px 12px;border:1px solid var(--border);border-radius:4px;font-size:11px;font-family:var(--jb);opacity:.4;transition:all .2s}
.footer-roles a:hover{opacity:1;border-color:#444}
.footer-roles a.active{opacity:1;border-color:#444}
.footer-copy{font-size:12px;opacity:.25;margin-top:16px}

@media(max-width:768px){
  nav{padding:14px 20px}
  .hero{padding:60px 20px 40px}
  .hero h1{font-size:32px}
  .kpi-strip{gap:24px;padding:32px 20px}
  .kpi-val{font-size:28px}
  .section{padding:40px 20px}
  .exp-block{padding:20px}
  .metrics-table td:first-child{width:100px}
  .metrics-table td:nth-child(3){display:none}
  .metrics-table td:last-child{display:none}
  footer{padding:32px 20px}
}
@media print{
  *{color:#000!important;background:#fff!important;box-shadow:none!important;border-color:#ddd!important}
  .grad-bar,.hero-orb,.live-dot,.live-clock,.nav-right a,.footer-roles,.btn-solid,.btn-outline{display:none!important}
  nav{position:static;border-bottom:2px solid #000;padding:12px 0}
  .nav-logo{color:#000!important}
  .nav-mark{background:#000!important}
  .hero{padding:40px 0 20px}
  .hero h1{font-size:28px}
  .hero-role{-webkit-text-fill-color:#000!important;color:#000!important}
  .hero-badge{border-color:#ddd}
  .hero p{opacity:1;font-size:14px}
  .kpi-strip{padding:20px 0;gap:32px;border-color:#ddd}
  .kpi-val{font-size:24px}
  .kpi-label{opacity:1}
  .section{padding:24px 0}
  .section-title{opacity:1}
  .exp-block{page-break-inside:avoid;border-color:#ddd}
  .exp-block::before{background:#000!important;opacity:1!important}
  .exp-block li{opacity:1}
  .exp-block li::before{background:#000!important}
  .skill-tag{border-color:#ddd;opacity:1}
  .metrics-table td{opacity:1}
  .collected-at{opacity:1}
  footer{border-color:#ddd}
  .footer-copy{opacity:1}
  a{text-decoration:none}
}`;
}

function indexPage(kpis) {
  const s = kpis || {};
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Alexa Amundson — Resume Portfolio</title>
<meta name="description" content="20 role-specific resumes with live machine-verified metrics from BlackRoad OS infrastructure. Every number sourced from automated KPI collection.">
<meta property="og:title" content="Alexa Amundson — 20 Live Resume Dashboards">
<meta property="og:description" content="Every metric machine-verified from live infrastructure. 7.2M LOC, 1,603 repos, 7-node fleet, 27 AI models. Updated daily.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://resume.blackroad.io">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Alexa Amundson — Resume Portfolio">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${css()}
.roles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;max-width:1200px;margin:0 auto;padding:0 48px 64px}
.role-card{border:1px solid var(--border);border-radius:12px;padding:28px;transition:all .3s;position:relative;overflow:hidden;cursor:pointer;text-decoration:none;display:block;animation:fadeUp .6s both}
.role-card:hover{border-color:#444;transform:translateY(-4px);box-shadow:0 12px 40px rgba(255,29,108,.08)}
.role-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);opacity:0;transition:opacity .3s}
.role-card:hover::before{opacity:1}
.role-num{font-family:var(--jb);font-size:11px;opacity:.3;margin-bottom:8px}
.role-title{font-size:18px;font-weight:600;margin-bottom:8px}
.role-summary{font-size:13px;opacity:.45;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.role-kpis{display:flex;gap:16px;margin-top:16px;flex-wrap:wrap}
.role-kpi{font-family:var(--jb);font-size:11px;opacity:.5}
.role-kpi b{opacity:1;font-size:14px;display:block}
@media(max-width:768px){.roles-grid{grid-template-columns:1fr;padding:0 20px 40px}}
</style>
</head>
<body>
<div class="grad-bar"></div>
<nav>
  <div class="nav-logo"><div class="nav-mark"></div> Alexa Amundson</div>
  <div class="nav-right">
    <a href="mailto:amundsonalexa@gmail.com">Contact</a>
    <a href="https://github.com/blackboxprogramming">GitHub</a>
    <span class="live-clock"><span class="live-dot"></span><span id="clock"></span></span>
  </div>
</nav>
<section class="hero">
  <div class="hero-orb hero-orb-1" style="background:#FF2255"></div>
  <div class="hero-orb hero-orb-2" style="background:#4488FF"></div>
  <div class="hero-badge"><span class="live-dot"></span> Live Metrics</div>
  <h1>25 Roles. <span class="hero-role">One Platform.</span></h1>
  <p>Every number machine-verified from live automated KPI collection across BlackRoad OS infrastructure. Updated daily.</p>
</section>
<div class="kpi-strip">
  <div class="kpi-item" title="${KPI_ACHIEVEMENTS.commits_ytd}"><div class="kpi-val">${(s.commits_ytd||0).toLocaleString()}</div><div class="kpi-label">Commits (2026)</div></div>
  <div class="kpi-item" title="${KPI_ACHIEVEMENTS.total_loc}"><div class="kpi-val">${(s.total_loc||0).toLocaleString()}</div><div class="kpi-label">Lines of Code</div></div>
  <div class="kpi-item" title="${KPI_ACHIEVEMENTS.unique_loc}"><div class="kpi-val">${(s.unique_loc||0).toLocaleString()}</div><div class="kpi-label">Unique (Non-Duped)</div></div>
  <div class="kpi-item" title="${KPI_ACHIEVEMENTS.non_fork_repos}"><div class="kpi-val">${s.non_fork_repos||0}</div><div class="kpi-label">Non-Fork Repos</div></div>
  <div class="kpi-item" title="${KPI_ACHIEVEMENTS.repos_total}"><div class="kpi-val">${(s.repos_total||0).toLocaleString()}</div><div class="kpi-label">Total Repos</div></div>
  <div class="kpi-item" title="${KPI_ACHIEVEMENTS.ollama_models}"><div class="kpi-val">${s.ollama_models||0}</div><div class="kpi-label">AI Models</div></div>
  <div class="kpi-item" title="${KPI_ACHIEVEMENTS.cf_pages}"><div class="kpi-val">${s.cf_pages||0}</div><div class="kpi-label">Cloud Deployments</div></div>
  <div class="kpi-item" title="${KPI_ACHIEVEMENTS.bin_tools}"><div class="kpi-val">${s.bin_tools||0}</div><div class="kpi-label">CLI Tools</div></div>
</div>
<section class="section">
  <div class="section-title">What I Built &mdash; Key Projects</div>
  <div class="exp-block">
    <h3>BlackRoad OS &mdash; Sovereign AI Operating System</h3>
    <ul>
      <li><strong>What:</strong> Full operating system — CLI dispatcher, agent fleet, AI gateway, infrastructure automation, deployment pipeline</li>
      <li><strong>Scale:</strong> ${(s.total_loc||0).toLocaleString()} LOC (${(s.unique_loc||0).toLocaleString()} unique non-duped), ${(s.repos_total||0).toLocaleString()} repos (${s.non_fork_repos||0} non-fork), ${(s.commits_ytd||0).toLocaleString()} commits in 2026</li>
      <li><strong>Solved:</strong> Eliminated vendor lock-in — AI runs on owned hardware, not rented cloud GPUs. Zero monthly AI API spend.</li>
    </ul>
  </div>
  <div class="exp-block">
    <h3>AI Gateway &mdash; OpenAI-Compatible Multi-Provider API</h3>
    <ul>
      <li><strong>What:</strong> Drop-in OpenAI replacement at api.blackroad.io — ${s.ollama_models||27} models, 7 providers, tier-based auth, SSE streaming</li>
      <li><strong>Scale:</strong> ${s.cf_workers_total||96} Cloudflare Workers, ${s.cf_zones_count||20} DNS zones, serving requests globally with &lt;50ms edge latency</li>
      <li><strong>Solved:</strong> Single API endpoint abstracts 7 AI providers. Switch models without changing client code. Automatic fallback if provider is down.</li>
    </ul>
  </div>
  <div class="exp-block">
    <h3>Pi Fleet &mdash; Distributed Edge Compute</h3>
    <ul>
      <li><strong>What:</strong> ${s.fleet_total||7}-node Raspberry Pi cluster with 52 TOPS Hailo-8 AI acceleration, WireGuard mesh VPN, self-healing autonomy</li>
      <li><strong>Scale:</strong> ${s.systemd_services||256} services, ${s.docker_containers||14} containers, ${s.nginx_sites||48} Nginx sites, ${s.ollama_models||27} AI models (${s.ollama_size_gb||48.1} GB)</li>
      <li><strong>Solved:</strong> $0/month compute cost for AI inference. Self-healing — fleet auto-recovers from crashes, thermal throttling, and service failures without human intervention.</li>
    </ul>
  </div>
  <div class="exp-block">
    <h3>br CLI &mdash; 223 Command-Line Tools</h3>
    <ul>
      <li><strong>What:</strong> ${s.bin_tools||223} CLI tools for fleet management, AI orchestration, deployment, monitoring, and automation</li>
      <li><strong>Scale:</strong> 90 tool scripts in dispatcher, ${s.home_scripts||92} shell scripts, ${s.mac_cron_jobs||17} Mac crons + ${s.fleet_cron_jobs||35} fleet crons = ${(s.mac_cron_jobs||17)+(s.fleet_cron_jobs||35)} automated tasks</li>
      <li><strong>Solved:</strong> Every repetitive task reduced to one command. Deploy, monitor, debug, and manage entire fleet from a single terminal.</li>
    </ul>
  </div>
  <div class="exp-block">
    <h3>Cloudflare Stack &mdash; Serverless Infrastructure</h3>
    <ul>
      <li><strong>What:</strong> ${s.cf_pages||101} Pages, ${s.cf_d1_databases||25} D1 databases, ${s.cf_kv_namespaces||47} KV namespaces, ${s.cf_r2_buckets||11} R2 buckets, ${s.cf_domains||54} custom domains</li>
      <li><strong>Scale:</strong> ${s.cf_tunnels_total||18} tunnels (${s.cf_tunnels_healthy||8} healthy), all managed from CLI — zero portal clicks</li>
      <li><strong>Solved:</strong> Global edge infrastructure at near-zero cost. Static sites, edge databases, object storage, and serverless compute — all deployed via \`wrangler\` from terminal.</li>
    </ul>
  </div>
  <div class="exp-block">
    <h3>KPI System &mdash; Automated Metrics Collection</h3>
    <ul>
      <li><strong>What:</strong> 11 data collectors, 60+ KPIs, daily cron pipeline pushing to Cloudflare KV — these resume pages read live from it</li>
      <li><strong>Scale:</strong> ${s.sqlite_dbs||230} SQLite databases, ${(s.fts5_entries||0).toLocaleString()} FTS5 search entries, ${s.systems_registered||111} registered systems</li>
      <li><strong>Solved:</strong> No more stale resume numbers. Every metric on this page is machine-verified, collected daily, and served live. The resume updates itself.</li>
    </ul>
  </div>
  <div class="exp-block">
    <h3>CECE / Lucidia &mdash; AI Identity System</h3>
    <ul>
      <li><strong>What:</strong> Persistent AI identity with memory — 4 custom fine-tuned models, TTS API, image generation, knowledge graph</li>
      <li><strong>Scale:</strong> ${(s.fts5_entries||0).toLocaleString()} memory entries indexed, 52 TOPS dedicated AI compute via 2x Hailo-8 NPUs</li>
      <li><strong>Solved:</strong> AI agents that remember context across conversations. Not stateless chatbots — persistent identities with searchable long-term memory.</li>
    </ul>
  </div>
  <div class="exp-block">
    <h3>RoadC &mdash; Custom Programming Language</h3>
    <ul>
      <li><strong>What:</strong> Python-indented language with lexer, parser, and tree-walking interpreter. Supports functions, recursion, pattern matching, 3D primitives.</li>
      <li><strong>Scale:</strong> Full language implementation — tokenizer, AST, interpreter, REPL</li>
      <li><strong>Solved:</strong> Domain-specific language for agent orchestration and 3D scene composition. Demonstrates compiler engineering depth.</li>
    </ul>
  </div>
</section>

<section class="section"><div class="section-title">Select a Role</div></section>
<div class="roles-grid">
${ROLES.map((r, i) => {
  const topKpis = r.kpis.slice(0, 3);
  return `<a href="/${r.slug}" class="role-card" style="animation-delay:${i * 0.05}s">
    <div class="role-num">${r.num}</div>
    <div class="role-title">${r.title}</div>
    <div class="role-summary">${r.summary}</div>
    <div class="role-kpis">${topKpis.map(k => `<div class="role-kpi"><b>${fmt(k, s[k])}</b>${KPI_LABELS[k]||k}</div>`).join('')}</div>
  </a>`;
}).join('\n')}
</div>
<section class="section">
  <div class="section-title">Data Sources &mdash; 11 Collectors</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">github.sh</h3><p style="font-size:12px;opacity:.4">Commits, PRs, events via GitHub API (gh cli)</p></div>
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">github-deep.sh</h3><p style="font-size:12px;opacity:.4">Stars, forks, profile, org breakdown</p></div>
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">github-all-orgs.sh</h3><p style="font-size:12px;opacity:.4">Full scan of 17 GitHub owners, deduped</p></div>
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">gitea.sh</h3><p style="font-size:12px;opacity:.4">Self-hosted Gitea REST API (207 repos)</p></div>
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">fleet.sh</h3><p style="font-size:12px;opacity:.4">SSH probe: uptime, CPU, RAM, disk, temp</p></div>
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">services.sh</h3><p style="font-size:12px;opacity:.4">Docker, Ollama, Nginx, systemd, PostgreSQL</p></div>
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">autonomy.sh</h3><p style="font-size:12px;opacity:.4">Self-healing events, restarts, cron jobs</p></div>
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">loc.sh</h3><p style="font-size:12px;opacity:.4">Lines of code via cloc + fleet SSH</p></div>
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">local.sh</h3><p style="font-size:12px;opacity:.4">Mac: ~/bin, scripts, DBs, brew, cron, disk</p></div>
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">cloudflare.sh</h3><p style="font-size:12px;opacity:.4">Pages, D1, KV, R2 via wrangler CLI</p></div>
    <div class="exp-block" style="padding:20px;margin:0"><h3 style="font-size:13px">traffic.sh</h3><p style="font-size:12px;opacity:.4">CF zones/workers/tunnels, GitHub clones/views/streak</p></div>
  </div>
  <p style="font-size:11px;opacity:.25;margin-top:16px;font-family:var(--jb);text-align:center">Pipeline: collect (6am cron) &rarr; aggregate (daily JSON) &rarr; push to KV &rarr; Worker serves live &rarr; updated every request</p>
</section>
<div class="collected-at">Last collected: ${s._collected_at || 'pending'} &mdash; Updated daily at 06:00 &mdash; <a href="/api/kpis" style="opacity:.5">Raw JSON API</a></div>
<footer>
  <div class="footer-copy">All metrics verified from live automated KPI collection &mdash; <a href="https://github.com/blackboxprogramming/blackroad-os-kpis" style="opacity:.5">blackroad-os-kpis</a><br>&copy; 2026 Alexa Amundson &mdash; BlackRoad OS, Inc.</div>
</footer>
<div class="grad-bar"></div>
<script>
function tick(){const d=new Date();document.getElementById('clock').textContent=d.toLocaleString('en-US',{timeZone:'America/Chicago',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})+' CST'}
tick();setInterval(tick,1000);
</script>
</body>
</html>`;
}

function resumePage(role, kpis) {
  const s = kpis || {};
  const prevSlug = ROLES[ROLES.indexOf(role) - 1]?.slug;
  const nextSlug = ROLES[ROLES.indexOf(role) + 1]?.slug;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Alexa Amundson — ${role.title}</title>
<meta name="description" content="${role.summary}">
<meta property="og:title" content="Alexa Amundson — ${role.title}">
<meta property="og:description" content="${role.summary.substring(0, 200)}">
<meta property="og:type" content="profile">
<meta property="og:url" content="https://resume.blackroad.io/${role.slug}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Alexa Amundson — ${role.title}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${css()}</style>
</head>
<body>
<div class="grad-bar"></div>
<nav>
  <div class="nav-logo"><a href="/"><div class="nav-mark"></div> Alexa Amundson</a></div>
  <div class="nav-right">
    ${prevSlug ? `<a href="/${prevSlug}">&larr; Prev</a>` : ''}
    <a href="/">All Roles</a>
    ${nextSlug ? `<a href="/${nextSlug}">Next &rarr;</a>` : ''}
    <a href="mailto:amundsonalexa@gmail.com">Contact</a>
    <a href="https://github.com/blackboxprogramming">GitHub</a>
    <span class="live-clock"><span class="live-dot"></span><span id="clock"></span></span>
  </div>
</nav>

<section class="hero">
  <div class="hero-orb hero-orb-1" style="background:${role.accent}"></div>
  <div class="hero-orb hero-orb-2" style="background:#4488FF"></div>
  <div class="hero-badge"><span class="live-dot"></span> Live Data &mdash; ${s._date || 'loading'}</div>
  <h1><span class="hero-role">${role.title}</span></h1>
  <p>${role.summary}</p>
  <div class="hero-links">
    <a href="mailto:amundsonalexa@gmail.com" class="btn-solid">amundsonalexa@gmail.com</a>
    <a href="https://github.com/blackboxprogramming" class="btn-outline">github.com/blackboxprogramming</a>
  </div>
</section>

<div class="kpi-strip">
  ${role.kpis.slice(0, 6).map((k, i) => `<div class="kpi-item" style="animation-delay:${i*0.1}s"><div class="kpi-val">${fmt(k, s[k])}</div><div class="kpi-label">${KPI_LABELS[k]||k}</div></div>`).join('\n  ')}
</div>

<section class="section">
  <div class="section-title">Experience &mdash; BlackRoad OS | 2025&ndash;Present</div>
  ${role.sections.map(sec => `
  <div class="exp-block">
    <h3>${sec.title}</h3>
    <ul>${sec.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
  </div>`).join('')}
</section>

<section class="section">
  <div class="section-title">Technical Skills</div>
  <div class="skills-grid">
    ${(role.skills[0] === 'everything'
      ? ['Python','JavaScript','TypeScript','Bash','Go','C','React','Next.js','FastAPI','Docker','Linux','Nginx','WireGuard','Cloudflare','PostgreSQL','SQLite','systemd','Hailo-8','Ollama','GitHub Actions']
      : role.skills
    ).map(s => `<span class="skill-tag">${s}</span>`).join('')}
  </div>
</section>

<section class="section">
  <div class="section-title">Live Metrics Dashboard</div>
  <table class="metrics-table">
    <tr style="border-bottom:2px solid var(--border)"><td style="opacity:.3;font-size:10px">METRIC</td><td style="opacity:.3;font-size:10px;text-align:right">VALUE</td><td style="opacity:.3;font-size:10px">WHAT IT ACHIEVED</td><td style="opacity:.15;font-size:10px;text-align:right">SOURCE</td></tr>
    ${role.kpis.map(k => `<tr><td>${KPI_LABELS[k]||k}</td><td>${fmt(k, s[k])}</td><td>${KPI_ACHIEVEMENTS[k]||'—'}</td><td>${KPI_SOURCES[k]||'—'}</td></tr>`).join('\n    ')}
  </table>
</section>

<div class="collected-at">Last collected: ${s._collected_at || 'pending'} &mdash; Updated daily at 06:00 &mdash; <a href="/api/kpis" style="opacity:.5">Raw JSON API</a></div>

<footer>
  <div class="footer-roles">
    ${ROLES.map(r => `<a href="/${r.slug}" class="${r.slug === role.slug ? 'active' : ''}">${r.num} ${r.title}</a>`).join('')}
  </div>
  <div class="footer-copy">Every metric sourced from <a href="https://github.com/blackboxprogramming/blackroad-os-kpis" style="opacity:.5">blackroad-os-kpis</a> &mdash; 11 collectors, 60+ keys, updated daily<br>&copy; 2026 Alexa Amundson &mdash; BlackRoad OS, Inc.</div>
</footer>
<div class="grad-bar"></div>
<script>
function tick(){const d=new Date();document.getElementById('clock').textContent=d.toLocaleString('en-US',{timeZone:'America/Chicago',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})+' CST'}
tick();setInterval(tick,1000);

// Animate KPI numbers counting up
document.querySelectorAll('.kpi-val').forEach(el => {
  const target = parseInt(el.textContent.replace(/,/g, ''));
  if (isNaN(target) || target < 2) return;
  const duration = 1200;
  const start = performance.now();
  const initial = Math.max(0, Math.floor(target * 0.7));
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(initial + (target - initial) * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
});
</script>
</body>
</html>`;
}

function apiResponse(kpis) {
  return new Response(JSON.stringify(kpis || {}, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    // Load KPI data from KV
    let kpis = {};
    try {
      const raw = await env.KPIS.get('latest', 'json');
      if (raw) kpis = raw;
    } catch (e) {}

    // API endpoint
    if (path === '/api/kpis') return apiResponse(kpis);

    // Sitemap
    if (path === '/sitemap.xml') {
      const base = url.origin;
      const urls = ['/', ...ROLES.map(r => `/${r.slug}`)];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${base}${u}</loc><changefreq>daily</changefreq></url>`).join('\n')}
</urlset>`;
      return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
    }

    // Index
    if (path === '/') {
      return new Response(indexPage(kpis), {
        headers: { 'Content-Type': 'text/html;charset=utf-8', 'Cache-Control': 'public, max-age=300' },
      });
    }

    // Resume pages
    const slug = path.slice(1);
    const role = ROLES.find(r => r.slug === slug || r.num + '-' + r.slug === slug);
    if (role) {
      return new Response(resumePage(role, kpis), {
        headers: { 'Content-Type': 'text/html;charset=utf-8', 'Cache-Control': 'public, max-age=300' },
      });
    }

    // 404
    return new Response(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title>
<style>body{background:#000;color:#fff;font-family:'Space Grotesk',sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}
a{color:#fff;opacity:.5}</style></head><body><div><h1>404</h1><p><a href="/">Back to Portfolio</a></p></div></body></html>`, {
      status: 404,
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  },
};
