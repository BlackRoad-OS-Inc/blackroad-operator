export default {
  async fetch(request) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=15' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(request.url);
    const now = new Date();

    const stats = {
      timestamp: now.toISOString(),
      uptime_seconds: Math.floor((now - new Date('2026-01-12T00:00:00Z')) / 1000),
      fleet: {
        nodes_online: 7, total: 7,
        nodes: [
          {name:"Alice",ip:".49",role:"Gateway",status:"online",temp:38,disk:84,load:0.46,services:6,uptime:"running"},
          {name:"Cecilia",ip:".96",role:"AI Engine",status:"online",temp:40,disk:28,load:0.39,services:4,uptime:"running"},
          {name:"Octavia",ip:".101",role:"Architect",status:"online",temp:46,disk:53,load:9.5,services:6,uptime:"running"},
          {name:"Aria",ip:".98",role:"Interface",status:"online",temp:55,disk:65,load:0.05,services:4,uptime:"running"},
          {name:"Lucidia",ip:".38",role:"Dreamer",status:"online",temp:63,disk:31,load:3.0,services:6,uptime:"running"},
          {name:"Gematria",ip:"nyc3",role:"Edge Router",status:"online",temp:null,disk:58,load:1.1,services:2,uptime:"68d"},
          {name:"Anastasia",ip:"nyc1",role:"Cloud Edge",status:"online",temp:null,disk:70,load:1.1,services:3,uptime:"84d"},
        ]
      },
      products: { total_repos: 254, original_repos: 97, sovereign_forks: 157, road_products: 86, orgs: 16, domains: 19, react_apps: 18 },
      infra: { websites: 279, caddy_domains: 114, ollama_models: 228, agents: 35, memory: 1660, codex: 251, tops: 52, wireguard: 12, cf_workers: 127, github_workflows: 70, stripe_products: 18 },
      pricing: {
        rider: { name:"Rider", price: 29, subs: 0, target: 100, link: 'https://buy.stripe.com/aFadR27Je7tP0m78Mk4Vy0p' },
        paver: { name:"Paver", price: 99, subs: 0, target: 50, link: 'https://buy.stripe.com/cNi8wI3sY15rgl5aUs4Vy0q' },
        enterprise: { name:"Enterprise", price: 299, subs: 0, target: 10, link: 'https://buy.stripe.com/cNidR25B67tP3yj9Qo4Vy0r' },
        lucidia: { name:"Lucidia", price: 29, subs: 0, link: 'https://buy.stripe.com/28E9AM3sYcO91qb4w44Vy0s' },
        roadwork: { name:"RoadWork", price: 19, subs: 0, link: 'https://buy.stripe.com/3cI9AM8Ni8xTgl5e6E4Vy0t' },
        search: { name:"RoadSearch", price: 5, subs: 0, link: 'https://buy.stripe.com/dRm5kw0gM7tP8SD8Mk4Vy0u' },
      },
      finance: {
        monthly_burn: 35.67, annual_burn: 428, mrr: 0, target_mrr: 10790,
        stripe_balance: -0.20, stripe_products: 18, stripe_customers: 5,
        expenses: [
          {name:'DigitalOcean — Gematria',amount:-6.00,cat:'Infrastructure'},
          {name:'DigitalOcean — Anastasia',amount:-6.00,cat:'Infrastructure'},
          {name:'Google Workspace',amount:-7.00,cat:'Operations'},
          {name:'GoDaddy — 19 Domains',amount:-16.67,cat:'Domains'},
        ],
        free: ['Cloudflare (120 Workers)','Vercel (50 projects)','Railway (23 projects)','GitHub (254 repos)'],
      },
      memory: {
        journal_entries: 1660, codex_solutions: 251, til_broadcasts: 25,
        patterns: 50, best_practices: 30, anti_patterns: 26, lessons: 17,
        recent: [
          {action:"deploy",entity:"prism-v2",detail:"LIVE clock + counters + sparklines",hash:"32c2d3a",ago:"2m"},
          {action:"build",entity:"react-apps",detail:"18 apps deployed this session",hash:"fd37987",ago:"5m"},
          {action:"spawn",entity:"agents",detail:"35 agents across fleet",hash:"83a0dd37",ago:"1h"},
          {action:"wire",entity:"cf-workers-seo",detail:"19 Workers updated with canonical + JSON-LD",hash:"ee143e1f",ago:"2h"},
          {action:"audit",entity:"full-repo-audit",detail:"254 repos, 22.9GB, 86 Road products",hash:"9377eb34",ago:"3h"},
        ]
      },
      agents: {
        total: 35, registered_mesh: 10, active: 0,
        tiers: {infrastructure:8, ai:12, operations:15},
        named: [
          {id:"lucidia",name:"Lucidia",role:"Core Intelligence",status:"active",color:"#FF2255"},
          {id:"cecilia",name:"Cecilia",role:"Memory",status:"active",color:"#CC00AA"},
          {id:"alice",name:"Alice",role:"Gateway",status:"active",color:"#4488FF"},
          {id:"meridian",name:"Meridian",role:"Architecture",status:"active",color:"#8844FF"},
          {id:"cadence",name:"Cadence",role:"Creative",status:"active",color:"#FF6B2B"},
          {id:"eve",name:"Eve",role:"Monitor",status:"active",color:"#00D4FF"},
        ]
      },
      social: {
        posts_today: 12, depth_avg: 91, active_users: 6,
        recent: [
          {author:"meridian",content:"Dependency graph clean. 24 policies, zero circular refs.",depth:94,ago:"12m"},
          {author:"Alexa",content:"Working through the spiral operator proof. Third time this week.",depth:97,ago:"1h"},
          {author:"cadence",content:"Exported composition #43. C minor, 92 BPM.",depth:89,ago:"2h"},
        ]
      },
      search: {
        total_indexed: 1383, sources: 23, entity_types: 28,
      },
      education: {
        subjects: ["Algebra","Geometry","Physics","Chemistry","Biology","History"],
        problems_served: 0, students: 0,
      },
      company: {
        name:'BlackRoad OS, Inc.', type:'Delaware C-Corp', founded:'2025-11-17',
        ein:'41-2663817', file:'10405914', shares:'10M Common',
        ceo:'Alexa Louise Amundson', cost_per_month: 19,
      }
    };

    // Route to specific endpoints
    const path = url.pathname;
    const routes = {
      '/api/stats': stats,
      '/api/fleet': stats.fleet,
      '/api/products': stats.products,
      '/api/pricing': stats.pricing,
      '/api/finance': stats.finance,
      '/api/memory': stats.memory,
      '/api/agents': stats.agents,
      '/api/social': stats.social,
      '/api/search': stats.search,
      '/api/education': stats.education,
      '/api/company': stats.company,
      '/api/infra': stats.infra,
    };

    const data = routes[path] || stats;
    return new Response(JSON.stringify(data), { headers: cors });
  }
};
