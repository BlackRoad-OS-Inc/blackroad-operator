import React, { useState, useEffect, useRef } from 'react';

// ─── PRODUCT REGISTRY ─────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'roadchain',
    name: 'RoadChain',
    tagline: 'Blockchain & Crypto Platform',
    description: 'Full cryptocurrency exchange, blockchain explorer, wallet management, ROAD token, and the legendary Bitcoin Lottery.',
    icon: '⛓️',
    color: '#F5A623',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #FF8C00 100%)',
    category: 'Finance',
    status: 'live',
    users: '12.4K',
    port: 3001,
    features: ['Blockchain Explorer', 'Wallet Dashboard', 'ROAD Token Swap', 'Bitcoin Lottery', 'Mining Stats', 'Price Charts'],
    org: 'BlackRoad-OS',
  },
  {
    id: 'roadstream',
    name: 'RoadStream',
    tagline: 'Video Platform',
    description: 'Watch, upload, and stream video content. Creator studio, live streaming, shorts, and AI-powered recommendations.',
    icon: '📺',
    color: '#FF1D6C',
    gradient: 'linear-gradient(135deg, #FF1D6C 0%, #FF6B9D 100%)',
    category: 'Media',
    status: 'live',
    users: '89.2K',
    port: 3002,
    features: ['Video Player', 'Live Streaming', 'Creator Studio', 'Shorts', 'Channels', 'Comments & Community'],
    org: 'BlackRoad-Media',
  },
  {
    id: 'roadfeed',
    name: 'RoadFeed',
    tagline: 'Social Network',
    description: 'Connect, share, and discover. Posts, communities (Roads), messaging, events, marketplace — all in one social platform.',
    icon: '🌐',
    color: '#2979FF',
    gradient: 'linear-gradient(135deg, #2979FF 0%, #448AFF 100%)',
    category: 'Social',
    status: 'live',
    users: '156K',
    port: 3003,
    features: ['News Feed', 'Communities (Roads)', 'Messaging', 'Events', 'Marketplace', 'Stories'],
    org: 'BlackRoad-OS',
  },
  {
    id: 'roadsearch',
    name: 'RoadSearch',
    tagline: 'Search Engine',
    description: 'Search the web, images, videos, news, and more. AI-powered answers, knowledge panels, and deep web indexing.',
    icon: '🔍',
    color: '#00E676',
    gradient: 'linear-gradient(135deg, #00E676 0%, #69F0AE 100%)',
    category: 'Search',
    status: 'live',
    users: '234K',
    port: 3004,
    features: ['Web Search', 'Image Search', 'AI Answers', 'News', 'Maps', 'Knowledge Panels'],
    org: 'BlackRoad-OS',
  },
  {
    id: 'roadcode',
    name: 'RoadCode',
    tagline: 'Code Hosting Platform',
    description: 'Host repositories, review code, manage issues and pull requests. Built-in CI/CD, code search, and AI code review.',
    icon: '💻',
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #CE93D8 100%)',
    category: 'Developer',
    status: 'live',
    users: '45.8K',
    port: 3005,
    features: ['Repositories', 'Pull Requests', 'Issues', 'CI/CD Actions', 'Code Search', 'Gists'],
    org: 'BlackRoad-OS-Inc',
  },
  {
    id: 'roadcomms',
    name: 'RoadComms',
    tagline: 'Communication Hub',
    description: 'Team messaging, video calls, screen sharing, and channels. AI agents as team members. The command center for collaboration.',
    icon: '💬',
    color: '#00BCD4',
    gradient: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)',
    category: 'Communication',
    status: 'live',
    users: '67.3K',
    port: 3006,
    features: ['Team Channels', 'Direct Messages', 'Video Calls', 'Screen Sharing', 'AI Agents', 'File Sharing'],
    org: 'BlackRoad-OS',
  },
  {
    id: 'roadverse',
    name: 'RoadVerse',
    tagline: 'Metaverse & VR',
    description: '3D virtual worlds with VR/Oculus support. Explore 14 zones, meet AI agents, build structures, and attend live events.',
    icon: '🌌',
    color: '#E040FB',
    gradient: 'linear-gradient(135deg, #E040FB 0%, #EA80FC 100%)',
    category: 'Metaverse',
    status: 'live',
    users: '28.9K',
    port: 3007,
    features: ['3D Worlds', 'VR/Oculus Mode', 'Avatar Creator', 'World Builder', 'Virtual Desktop', '14 Explorable Zones'],
    org: 'BlackRoad-Interactive',
  },
  {
    id: 'roaddesk',
    name: 'RoadDesk',
    tagline: 'Virtual Desktop',
    description: 'A full operating system in your browser. Draggable windows, file manager, terminal, and all RoadOS apps integrated.',
    icon: '🖥️',
    color: '#FF6E40',
    gradient: 'linear-gradient(135deg, #FF6E40 0%, #FF9E80 100%)',
    category: 'Productivity',
    status: 'live',
    users: '34.1K',
    port: 3008,
    features: ['Window Manager', 'File Manager', 'Terminal', 'Desktop Apps', 'Multi-Desktop', 'System Monitor'],
    org: 'BlackRoad-OS',
  },
];

const EXISTING_PRODUCTS = [
  {
    id: 'roadworld',
    name: 'RoadWorld',
    tagline: 'Street-Level Maps',
    icon: '🗺️',
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
    category: 'Maps',
    status: 'live',
    users: '18.7K',
    org: 'BlackRoad-OS',
  },
  {
    id: 'lucidia-platform',
    name: 'Lucidia',
    tagline: 'AI Learning Platform',
    icon: '🧠',
    color: '#FF5722',
    gradient: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)',
    category: 'Education',
    status: 'live',
    users: '41.2K',
    org: 'BlackRoad-Education',
  },
  {
    id: 'ecosystem-dashboard',
    name: 'Mission Control',
    tagline: 'Ecosystem Dashboard',
    icon: '📊',
    color: '#3F51B5',
    gradient: 'linear-gradient(135deg, #3F51B5 0%, #7986CB 100%)',
    category: 'Operations',
    status: 'live',
    users: '8.5K',
    org: 'BlackRoad-OS-Inc',
  },
  {
    id: 'prism-console',
    name: 'Prism Console',
    tagline: 'Enterprise ERP',
    icon: '💎',
    color: '#607D8B',
    gradient: 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)',
    category: 'Enterprise',
    status: 'live',
    users: '5.2K',
    org: 'BlackRoad-OS-Inc',
  },
  {
    id: 'blackstream',
    name: 'BlackStream',
    tagline: 'Streaming Aggregator',
    icon: '🎬',
    color: '#795548',
    gradient: 'linear-gradient(135deg, #795548 0%, #A1887F 100%)',
    category: 'Media',
    status: 'beta',
    users: '3.1K',
    org: 'BlackRoad-Media',
  },
  {
    id: 'road-wallet',
    name: 'Road Wallet',
    tagline: 'Browser Extension',
    icon: '👛',
    color: '#FFC107',
    gradient: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)',
    category: 'Finance',
    status: 'beta',
    users: '9.8K',
    org: 'BlackRoad-OS',
  },
];

const ALL_PRODUCTS = [...PRODUCTS, ...EXISTING_PRODUCTS];

const CATEGORIES = ['All', 'Finance', 'Media', 'Social', 'Search', 'Developer', 'Communication', 'Metaverse', 'Productivity', 'Maps', 'Education', 'Operations', 'Enterprise'];

const STATS = {
  totalUsers: '754.2K',
  totalOrgs: 17,
  totalRepos: '1,825+',
  totalAgents: '30,000',
  totalWorkers: '75+',
  uptime: '99.97%',
};

// ─── ANIMATED PARTICLES BACKGROUND ──────────────────────────────────────────
function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        color: ['#F5A623', '#FF1D6C', '#2979FF', '#9C27B0'][Math.floor(Math.random() * 4)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '40';
        ctx.fill();

        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color + Math.floor((1 - dist / 120) * 20).toString(16).padStart(2, '0');
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
}

// ─── SPARKLINE COMPONENT ────────────────────────────────────────────────────
function Sparkline({ data, color, width = 120, height = 30 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points={`0,${height} ${points} ${width},${height}`} fill={color + '15'} stroke="none" />
    </svg>
  );
}

// ─── LIVE ACTIVITY FEED ──────────────────────────────────────────────────────
const ACTIVITY_EVENTS = [
  { user: 'Lucidia', action: 'deployed', target: 'RoadVerse v2.4.1 to production', time: '2m ago', color: '#E040FB' },
  { user: 'Alice', action: 'merged PR', target: '#847 in roadchain-core', time: '5m ago', color: '#00BCD4' },
  { user: 'Octavia', action: 'scaled', target: 'RoadSearch to 12 replicas', time: '8m ago', color: '#4CAF50' },
  { user: 'Cipher', action: 'patched', target: 'CVE-2026-1847 in auth-worker', time: '12m ago', color: '#FFC107' },
  { user: 'Prism', action: 'analyzed', target: '2.4M search queries, updated rankings', time: '15m ago', color: '#FF5722' },
  { user: 'Echo', action: 'backed up', target: '847GB to R2 cold storage', time: '18m ago', color: '#9C27B0' },
  { user: 'Alexa', action: 'created', target: 'new Road community: r/quantum-computing', time: '22m ago', color: '#FF1D6C' },
  { user: 'Alice', action: 'routed', target: '1.2M requests through RoadComms mesh', time: '25m ago', color: '#2979FF' },
  { user: 'Lucidia', action: 'trained', target: 'RoadSearch ML model epoch 47/100', time: '30m ago', color: '#E040FB' },
  { user: 'Octavia', action: 'processed', target: '48K video transcodes on RoadStream', time: '35m ago', color: '#4CAF50' },
];

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [time, setTime] = useState(new Date());
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = ALL_PRODUCTS.filter((p) => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const openProduct = (product) => {
    setSelectedProduct(product);
    setPage('product');
  };

  return (
    <div className="app">
      <ParticleBackground />

      {/* ─── TOP NAV ──────────────────────────────────────── */}
      <nav className="topnav">
        <div className="topnav-left">
          <div className="logo" onClick={() => { setPage('home'); setSelectedProduct(null); }}>
            <span className="logo-icon">🛣️</span>
            <span className="logo-text">RoadOS</span>
          </div>
          <div className="nav-links">
            <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>Home</button>
            <button className={page === 'products' ? 'active' : ''} onClick={() => setPage('products')}>Products</button>
            <button className={page === 'infra' ? 'active' : ''} onClick={() => setPage('infra')}>Infrastructure</button>
            <button className={page === 'agents' ? 'active' : ''} onClick={() => setPage('agents')}>Agents</button>
          </div>
        </div>
        <div className="topnav-right">
          <div className="nav-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage('products'); }}
            />
          </div>
          <button className="activity-btn" onClick={() => setShowActivity(!showActivity)}>
            <span>🔔</span>
            <span className="badge">3</span>
          </button>
          <div className="nav-time">{time.toLocaleTimeString()}</div>
          <div className="avatar">A</div>
        </div>
      </nav>

      {/* ─── ACTIVITY PANEL ────────────────────────────────── */}
      {showActivity && (
        <div className="activity-panel">
          <h3>Live Activity</h3>
          {ACTIVITY_EVENTS.map((e, i) => (
            <div key={i} className="activity-item">
              <div className="activity-dot" style={{ background: e.color }} />
              <div className="activity-content">
                <span style={{ color: e.color, fontWeight: 600 }}>{e.user}</span>{' '}
                <span className="activity-action">{e.action}</span>{' '}
                <span className="activity-target">{e.target}</span>
              </div>
              <span className="activity-time">{e.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* ─── HOME PAGE ────────────────────────────────────── */}
      {page === 'home' && (
        <main className="content">
          <section className="hero">
            <div className="hero-badge">BLACKROAD OS, INC.</div>
            <h1 className="hero-title">
              The Complete
              <span className="gradient-text"> Product Ecosystem</span>
            </h1>
            <p className="hero-subtitle">
              {ALL_PRODUCTS.length} products across {STATS.totalOrgs} organizations. {STATS.totalAgents} AI agents.
              {' '}{STATS.totalRepos} repositories. One unified platform.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => setPage('products')}>Explore Products</button>
              <button className="btn-secondary" onClick={() => openProduct(PRODUCTS.find(p => p.id === 'roaddesk'))}>Launch Desktop</button>
            </div>
          </section>

          {/* ─── STATS BAR ─── */}
          <div className="stats-bar">
            {[
              { label: 'Active Users', value: STATS.totalUsers, icon: '👥' },
              { label: 'Organizations', value: STATS.totalOrgs, icon: '🏢' },
              { label: 'Repositories', value: STATS.totalRepos, icon: '📦' },
              { label: 'AI Agents', value: STATS.totalAgents, icon: '🤖' },
              { label: 'Workers', value: STATS.totalWorkers, icon: '⚡' },
              { label: 'Uptime', value: STATS.uptime, icon: '💚' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <span className="stat-icon">{s.icon}</span>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ─── FEATURED PRODUCTS ─── */}
          <section className="section">
            <h2 className="section-title">Core Products</h2>
            <div className="product-grid featured">
              {PRODUCTS.map((p) => (
                <div key={p.id} className="product-card featured-card" onClick={() => openProduct(p)}>
                  <div className="card-gradient" style={{ background: p.gradient }} />
                  <div className="card-content">
                    <div className="card-header">
                      <span className="card-icon">{p.icon}</span>
                      <span className="card-status" data-status={p.status}>{p.status}</span>
                    </div>
                    <h3 className="card-name">{p.name}</h3>
                    <p className="card-tagline">{p.tagline}</p>
                    <p className="card-desc">{p.description}</p>
                    <div className="card-features">
                      {p.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="feature-chip">{f}</span>
                      ))}
                      {p.features.length > 3 && <span className="feature-chip more">+{p.features.length - 3}</span>}
                    </div>
                    <div className="card-footer">
                      <span className="card-users">👥 {p.users}</span>
                      <span className="card-org">{p.org}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── EXISTING PRODUCTS ─── */}
          <section className="section">
            <h2 className="section-title">Extended Ecosystem</h2>
            <div className="product-grid compact">
              {EXISTING_PRODUCTS.map((p) => (
                <div key={p.id} className="product-card compact-card" onClick={() => openProduct(p)}>
                  <div className="card-accent" style={{ background: p.gradient }} />
                  <span className="card-icon-sm">{p.icon}</span>
                  <div>
                    <h4 className="card-name-sm">{p.name}</h4>
                    <p className="card-tagline-sm">{p.tagline}</p>
                  </div>
                  <span className="card-status" data-status={p.status}>{p.status}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ─── AGENT ACTIVITY ─── */}
          <section className="section">
            <h2 className="section-title">Agent Activity</h2>
            <div className="agent-grid">
              {[
                { name: 'Lucidia', role: 'Coordinator', color: '#E040FB', status: 'active', tasks: 847, icon: '🔴' },
                { name: 'Alice', role: 'Router', color: '#00BCD4', status: 'active', tasks: 1203, icon: '🔵' },
                { name: 'Octavia', role: 'Compute', color: '#4CAF50', status: 'active', tasks: 956, icon: '🟢' },
                { name: 'Prism', role: 'Analyst', color: '#FF9800', status: 'active', tasks: 634, icon: '🟡' },
                { name: 'Echo', role: 'Memory', color: '#9C27B0', status: 'busy', tasks: 512, icon: '🟣' },
                { name: 'Cipher', role: 'Security', color: '#2979FF', status: 'active', tasks: 389, icon: '🔵' },
              ].map((a, i) => (
                <div key={i} className="agent-card">
                  <div className="agent-avatar" style={{ background: a.color + '20', borderColor: a.color }}>
                    <span>{a.icon}</span>
                  </div>
                  <div className="agent-info">
                    <h4>{a.name}</h4>
                    <p>{a.role}</p>
                  </div>
                  <div className="agent-stats">
                    <Sparkline data={Array.from({ length: 20 }, () => Math.random() * 100)} color={a.color} />
                    <span className="agent-tasks">{a.tasks} tasks</span>
                  </div>
                  <div className="agent-status-dot" style={{ background: a.status === 'active' ? '#4CAF50' : '#FF9800' }} />
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ─── PRODUCTS PAGE ────────────────────────────────── */}
      {page === 'products' && !selectedProduct && (
        <main className="content">
          <section className="section">
            <h2 className="section-title">All Products</h2>
            <div className="category-bar">
              {CATEGORIES.map((c) => (
                <button key={c} className={`cat-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="product-grid featured">
              {filtered.map((p) => (
                <div key={p.id} className="product-card featured-card" onClick={() => openProduct(p)}>
                  <div className="card-gradient" style={{ background: p.gradient }} />
                  <div className="card-content">
                    <div className="card-header">
                      <span className="card-icon">{p.icon}</span>
                      <span className="card-status" data-status={p.status}>{p.status}</span>
                    </div>
                    <h3 className="card-name">{p.name}</h3>
                    <p className="card-tagline">{p.tagline}</p>
                    {p.description && <p className="card-desc">{p.description}</p>}
                    {p.features && (
                      <div className="card-features">
                        {p.features.slice(0, 3).map((f, i) => (
                          <span key={i} className="feature-chip">{f}</span>
                        ))}
                      </div>
                    )}
                    <div className="card-footer">
                      <span className="card-users">👥 {p.users}</span>
                      <span className="card-org">{p.org}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ─── PRODUCT DETAIL ────────────────────────────────── */}
      {page === 'product' && selectedProduct && (
        <main className="content">
          <button className="back-btn" onClick={() => { setSelectedProduct(null); setPage('products'); }}>
            ← Back to Products
          </button>
          <div className="product-detail">
            <div className="detail-hero" style={{ background: selectedProduct.gradient }}>
              <span className="detail-icon">{selectedProduct.icon}</span>
              <div>
                <h1 className="detail-name">{selectedProduct.name}</h1>
                <p className="detail-tagline">{selectedProduct.tagline}</p>
              </div>
              <div className="detail-actions">
                <button className="btn-launch">Launch App</button>
                <span className="card-status" data-status={selectedProduct.status}>{selectedProduct.status}</span>
              </div>
            </div>
            <div className="detail-body">
              <div className="detail-main">
                <h2>About</h2>
                <p>{selectedProduct.description || `${selectedProduct.name} is a core product in the BlackRoad OS ecosystem.`}</p>

                {selectedProduct.features && (
                  <>
                    <h2>Features</h2>
                    <div className="detail-features">
                      {selectedProduct.features.map((f, i) => (
                        <div key={i} className="detail-feature">
                          <div className="feature-dot" style={{ background: selectedProduct.color }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <h2>Activity</h2>
                <div className="detail-chart">
                  <Sparkline
                    data={Array.from({ length: 30 }, () => Math.random() * 100 + 50)}
                    color={selectedProduct.color}
                    width={600}
                    height={120}
                  />
                  <div className="chart-labels">
                    <span>30 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>
              <div className="detail-sidebar">
                <div className="sidebar-card">
                  <h3>Info</h3>
                  <div className="info-row"><span>Organization</span><span>{selectedProduct.org}</span></div>
                  <div className="info-row"><span>Category</span><span>{selectedProduct.category}</span></div>
                  <div className="info-row"><span>Users</span><span>{selectedProduct.users}</span></div>
                  <div className="info-row"><span>Status</span><span className="card-status" data-status={selectedProduct.status}>{selectedProduct.status}</span></div>
                  {selectedProduct.port && <div className="info-row"><span>Dev Port</span><span>:{selectedProduct.port}</span></div>}
                </div>
                <div className="sidebar-card">
                  <h3>Tech Stack</h3>
                  <div className="tech-tags">
                    {['React', 'Vite', 'TypeScript', 'Cloudflare Pages', 'Workers', 'D1 Database'].map((t, i) => (
                      <span key={i} className="tech-tag">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="sidebar-card">
                  <h3>Deployment</h3>
                  <div className="deploy-targets">
                    {['Cloudflare Pages', 'Railway', 'Vercel'].map((d, i) => (
                      <div key={i} className="deploy-row">
                        <span className="deploy-dot" style={{ background: '#4CAF50' }} />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ─── INFRASTRUCTURE PAGE ───────────────────────────── */}
      {page === 'infra' && (
        <main className="content">
          <section className="section">
            <h2 className="section-title">Infrastructure</h2>
            <div className="infra-grid">
              {[
                { name: 'Cloudflare', icon: '☁️', color: '#F38020', items: ['75+ Workers', '10+ Pages Sites', 'R2 Storage (135GB)', 'D1 Databases', 'KV Namespaces', 'Tunnel (QUIC)'], status: 'healthy' },
                { name: 'Railway', icon: '🚂', color: '#9B59B6', items: ['14 Projects', 'GPU Services (A100/H100)', 'PostgreSQL', 'Redis', 'Auto-scaling', 'Health Checks'], status: 'healthy' },
                { name: 'Vercel', icon: '▲', color: '#fff', items: ['15+ Projects', 'Edge Functions', 'Analytics', 'Serverless', 'ISR/SSR', 'Preview Deploys'], status: 'healthy' },
                { name: 'DigitalOcean', icon: '🌊', color: '#0080FF', items: ['Droplet: 159.65.43.12', 'Spaces Storage', 'Managed DB', 'Load Balancers', 'Kubernetes', 'VPC'], status: 'healthy' },
                { name: 'Raspberry Pi Fleet', icon: '🍓', color: '#C51A4A', items: ['blackroad-pi (192.168.4.64)', 'aria64 (192.168.4.38)', 'alice (192.168.4.49)', 'lucidia (192.168.4.99)', '30K Agent Capacity', 'Cloudflared Tunnel'], status: 'healthy' },
                { name: 'GitHub', icon: '🐙', color: '#6e5494', items: ['17 Organizations', '1,825+ Repositories', '50+ Workflows', 'Actions CI/CD', 'Pages (16+ sites)', 'Security Scanning'], status: 'healthy' },
              ].map((infra, i) => (
                <div key={i} className="infra-card">
                  <div className="infra-header">
                    <span className="infra-icon">{infra.icon}</span>
                    <h3 style={{ color: infra.color }}>{infra.name}</h3>
                    <span className="infra-status" data-status={infra.status}>
                      <span className="status-dot" style={{ background: '#4CAF50' }} />
                      {infra.status}
                    </span>
                  </div>
                  <ul className="infra-list">
                    {infra.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ─── AGENTS PAGE ──────────────────────────────────── */}
      {page === 'agents' && (
        <main className="content">
          <section className="section">
            <h2 className="section-title">Agent Network — 30,000 Agents</h2>
            <div className="agents-overview">
              {[
                { type: 'AI Research', count: '12,592', pct: 42, color: '#E040FB' },
                { type: 'Code Deploy', count: '8,407', pct: 28, color: '#2979FF' },
                { type: 'Infrastructure', count: '5,401', pct: 18, color: '#4CAF50' },
                { type: 'Monitoring', count: '3,600', pct: 12, color: '#FF9800' },
              ].map((a, i) => (
                <div key={i} className="agent-type-card">
                  <h4>{a.type}</h4>
                  <div className="agent-count">{a.count}</div>
                  <div className="agent-bar">
                    <div className="agent-bar-fill" style={{ width: `${a.pct}%`, background: a.color }} />
                  </div>
                  <span className="agent-pct">{a.pct}%</span>
                </div>
              ))}
            </div>

            <h2 className="section-title" style={{ marginTop: 40 }}>Core Agents</h2>
            <div className="core-agents">
              {[
                { name: 'LUCIDIA', role: 'The Coordinator', color: '#E040FB', icon: '🔴', desc: 'Strategy, mentorship, oversight. Primary AI coordinator across all systems.', skills: { reason: 5, route: 3, compute: 3, analyze: 4, memory: 3, security: 3 } },
                { name: 'ALICE', role: 'The Router', color: '#00BCD4', icon: '🔵', desc: 'Traffic routing, navigation, task distribution. Handles 1.2M+ requests daily.', skills: { reason: 3, route: 5, compute: 3, analyze: 3, memory: 3, security: 4 } },
                { name: 'OCTAVIA', role: 'The Compute Engine', color: '#4CAF50', icon: '🟢', desc: 'Inference, processing, heavy computation. GPU orchestration specialist.', skills: { reason: 3, route: 3, compute: 5, analyze: 3, memory: 2, security: 3 } },
                { name: 'PRISM', role: 'The Analyst', color: '#FF9800', icon: '🟡', desc: 'Pattern recognition, data analysis. Processes petabytes of telemetry data.', skills: { reason: 4, route: 3, compute: 3, analyze: 5, memory: 4, security: 3 } },
                { name: 'ECHO', role: 'The Memory', color: '#9C27B0', icon: '🟣', desc: 'Storage, recall, context preservation. PS-SHA∞ hash-chain guardian.', skills: { reason: 3, route: 2, compute: 2, analyze: 4, memory: 5, security: 2 } },
                { name: 'CIPHER', role: 'The Security', color: '#2979FF', icon: '🔵', desc: 'Authentication, encryption, access control. Zero-day hunter.', skills: { reason: 3, route: 4, compute: 3, analyze: 3, memory: 3, security: 5 } },
              ].map((agent, i) => (
                <div key={i} className="core-agent-card">
                  <div className="core-agent-header" style={{ borderLeftColor: agent.color }}>
                    <span className="core-agent-icon">{agent.icon}</span>
                    <div>
                      <h3 style={{ color: agent.color }}>{agent.name}</h3>
                      <p className="core-agent-role">{agent.role}</p>
                    </div>
                  </div>
                  <p className="core-agent-desc">{agent.desc}</p>
                  <div className="skill-bars">
                    {Object.entries(agent.skills).map(([skill, level]) => (
                      <div key={skill} className="skill-row">
                        <span className="skill-name">{skill}</span>
                        <div className="skill-bar">
                          <div className="skill-fill" style={{ width: `${level * 20}%`, background: agent.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🛣️</span> RoadOS — BlackRoad OS, Inc.
          </div>
          <div className="footer-links">
            <span>17 Organizations</span>
            <span>•</span>
            <span>1,825+ Repos</span>
            <span>•</span>
            <span>30K Agents</span>
            <span>•</span>
            <span>Your AI. Your Hardware. Your Rules.</span>
          </div>
          <div className="footer-copy">© 2026 BlackRoad OS, Inc. All rights reserved. PROPRIETARY.</div>
        </div>
      </footer>
    </div>
  );
}
