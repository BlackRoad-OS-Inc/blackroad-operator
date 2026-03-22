// BlackRoad Cloud — Configuration
// All real infrastructure endpoints

export const CONFIG = {
  // Clerk Auth
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  },

  // Stripe
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    prices: {
      pro_monthly: 'price_1T5wq63e5FMFdlFwHhMAtyNi',
      pro_yearly: 'price_1T5wq73e5FMFdlFw5ELr89dX',
      enterprise_monthly: 'price_1T5wq83e5FMFdlFwt53jdGqX',
      enterprise_yearly: 'price_1T5wq83e5FMFdlFw6Bsae4dK',
    },
  },

  // API endpoints — your real infrastructure
  api: {
    // Cloudflare Worker API (deployed)
    gateway: 'https://api.blackroad.io',
    // RoadCode (self-hosted Git on Octavia Pi 5)
    roadcode: 'http://192.168.4.97:3100',
    roadcodeToken: import.meta.env.VITE_ROADCODE_TOKEN || '',
    // Ollama (on Octavia via tunnel or local)
    ollama: 'https://ollama.blackroad.io',
    ollamaLocal: 'http://192.168.4.97:11434',
  },

  // Real infrastructure
  infra: {
    pis: [
      { name: 'Alice', ip: '192.168.4.49', role: 'Gateway', model: 'Pi 400', ram: '4GB', storage: '16GB SD', wg: '10.8.0.6', tunnelConns: 8, services: ['pi-hole','postgresql','pm2','cloudflared'] },
      { name: 'Octavia', ip: '192.168.4.97', role: 'Compute', model: 'Pi 5', ram: '8GB', storage: '1TB NVMe', wg: '10.8.0.4', tunnelConns: 4, services: ['docker-swarm','ollama','nats','gitea','influxdb'] },
      { name: 'Cecilia', ip: '192.168.4.96', role: 'Edge', model: 'Pi 5', ram: '8GB', storage: '128GB SD', wg: '10.8.0.3', tunnelConns: 4, services: ['docker','minio','caddy','hailo-ai'] },
      { name: 'Aria', ip: '192.168.4.98', role: 'Agents', model: 'Pi 4', ram: '4GB', storage: '32GB SD', wg: '10.8.0.7', tunnelConns: 0, services: ['docker','agents'] },
    ],
    droplets: [
      { name: 'Gematria', ip: '159.65.43.12', region: 'NYC3', specs: '4 vCPU, 8GB, 80GB', services: ['caddy','ollama','nats','cloudflared'] },
      { name: 'Anastasia', ip: '174.138.44.45', region: 'NYC1', specs: '1 vCPU, 1GB, 25GB', services: ['headscale','nginx','redis','wireguard'] },
    ],
    devices: [
      { name: 'Pico W #1', ip: '192.168.4.95', type: 'microcontroller' },
      { name: 'Pico W #2', ip: '192.168.4.99', type: 'microcontroller' },
    ],
  },

  // Real domains
  domains: {
    primary: ['blackroad.io','blackroadai.com','lucidia.earth','roadchain.io'],
    active: ['blackroad.me','blackroad.network','blackroad.systems','lucidiaqi.com','aliceqi.com','lucidia.studio','blackboxprogramming.io'],
    subdomains: ['app','api','dashboard','status','chat','console','agents','docs','admin','ops','fleet','gateway','metrics','drive','ollama'],
    total: 48,
  },

  // Real agents
  agents: [
    { name: 'Alice', role: 'Gateway & DNS', color: '#FF6B2B', pi: 'alice', status: 'online' },
    { name: 'Lucidia', role: 'Memory & Cognition', color: '#8844FF', pi: 'octavia', status: 'online' },
    { name: 'Cecilia', role: 'Edge & Storage', color: '#CC00AA', pi: 'cecilia', status: 'online' },
    { name: 'Cece', role: 'API Gateway', color: '#FF2255', pi: 'cecilia', status: 'online' },
    { name: 'Aria', role: 'Agent Orchestration', color: '#4488FF', pi: 'aria', status: 'degraded' },
    { name: 'Eve', role: 'Intelligence', color: '#00D4FF', pi: 'gematria', status: 'online' },
    { name: 'Meridian', role: 'Networking', color: '#FF6B2B', pi: 'anastasia', status: 'online' },
    { name: 'Sentinel', role: 'Security & Compliance', color: '#4488FF', pi: 'alice', status: 'online' },
  ],

  // RoadCode orgs
  roadcode: {
    orgs: ['blackroad-os','lucidia','roadchain','infrastructure','agents','platform','services','tools'],
    totalRepos: 207,
  },

  // Company
  company: {
    name: 'BlackRoad OS, Inc.',
    founder: 'Alexa Louise Amundson',
    email: 'amundsonalexa@gmail.com',
    founded: '2024',
    equations: '317+',
    domains: 141,
    volumes: 7,
  },
};
