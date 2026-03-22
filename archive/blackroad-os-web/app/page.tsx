import Link from 'next/link'

const marqueeItems = [
  'Sovereign',
  'Spatial',
  'Sentient',
  'Z:=yx-w',
  'BlackRoad OS',
  'Edge-first',
  'Agent-native',
  'Post-cloud',
]

const features = [
  {
    icon: '⬡',
    title: 'Sovereign Infrastructure',
    body: 'Own your stack. BlackRoad runs on your cluster, your devices, and your routing layer instead of someone else’s platform tax.',
  },
  {
    icon: '◈',
    title: 'Sentient Agents',
    body: 'Lucidia, Aura, and the operator fleet stay online with persistent memory, role-aware routing, and recoverable state.',
  },
  {
    icon: '◉',
    title: 'Spatial Interfaces',
    body: 'Interfaces adapt to context across browser, device, and node so the system feels like one operating surface instead of ten products.',
  },
  {
    icon: '△',
    title: 'Z Framework Core',
    body: 'A single feedback primitive keeps infrastructure, agents, and UI composable enough to reason about under pressure.',
  },
  {
    icon: '⊞',
    title: 'Edge-first Compute',
    body: 'Deploy on your Pis, cloud nodes, and edge workers together with clear routing and operational visibility.',
  },
  {
    icon: '◐',
    title: 'Unified Data Layer',
    body: 'Repos, fleet telemetry, memory, and operators sit in one coherent stack instead of scattered dashboards and brittle scripts.',
  },
]

const agents = [
  {
    name: 'Lucidia',
    role: 'Memory & Cognition',
    stat: '4.8K calls/day',
    desc: 'Persistent memory, truth-state commits, and recursive self-modeling for the cognitive core.',
  },
  {
    name: 'BlackBot',
    role: 'Orchestration',
    stat: '3.1K calls/day',
    desc: 'Routes work across repos, fleet nodes, and agents so the operator surface stays coherent.',
  },
  {
    name: 'Aura',
    role: 'Intelligence',
    stat: '2.7K calls/day',
    desc: 'Research synthesis and live operational context for decisions that need more than a canned status page.',
  },
  {
    name: 'Sentinel',
    role: 'Security & Compliance',
    stat: '930 calls/day',
    desc: 'Auth, audit, anomaly detection, and review surfaces across the BlackRoad control plane.',
  },
]

const surfaces = [
  {
    label: 'Workspace',
    href: '/workspace',
    eyebrow: 'Operator surface',
    title: 'Launch the command layer.',
    body: 'Start conversations, route work across agents, and move from idea to execution without leaving the control plane.',
    meta: 'Agents · Conversations · Commands',
  },
  {
    label: 'Docs',
    href: '/docs',
    eyebrow: 'System knowledge',
    title: 'Read the operating model.',
    body: 'Architecture, fleet setup, tunnels, daemon docs, and the pieces that make the system coherent under pressure.',
    meta: 'Architecture · Fleet · API',
  },
  {
    label: 'Status',
    href: '/status',
    eyebrow: 'Live health',
    title: 'See the platform breathe.',
    body: 'Track real-time service health, latency, and operational readiness from the same environment your team works inside.',
    meta: 'Health checks · Uptime · Telemetry',
  },
  {
    label: 'Fleet',
    href: '/fleet',
    eyebrow: 'Edge compute',
    title: 'Operate the node mesh.',
    body: 'Inspect the Raspberry Pi fleet, remote nodes, and edge capacity that power the BlackRoad stack.',
    meta: 'Pis · Edge workers · Capacity',
  },
]

const plans = [
  {
    name: 'Operator',
    price: '$0',
    cadence: 'open source core',
    items: ['Self-hosted cluster', 'Base agent runtime', 'RoadCode workflow', 'Community support'],
    cta: 'Deploy Free',
  },
  {
    name: 'Sovereign',
    price: '$499',
    cadence: '/ month',
    items: ['Everything in Operator', 'Full agent fleet', 'Priority routing', 'Dedicated support lane'],
    cta: 'Get Sovereign',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'contact us',
    items: ['Air-gapped or private cloud', 'Org-specific operator layer', 'White-label deployment', 'Hands-on rollout support'],
    cta: 'Talk to Us',
  },
]

export default function LandingPage() {
  return (
    <main className="br-shell">
      <div className="br-topbar" />

      <header className="br-nav-wrap">
        <nav className="br-nav">
          <Link href="/" className="br-logo">
            <span className="br-logo-bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="br-logo-text">BlackRoad</span>
          </Link>

          <div className="br-nav-links">
            <a href="#product">Product</a>
            <a href="#vision">Vision</a>
            <a href="#agents">Agents</a>
            <a href="#pricing">Pricing</a>
          </div>

          <Link href="/workspace" className="br-btn br-btn-solid br-btn-small">
            Request Access
          </Link>
        </nav>
      </header>

      <section className="br-hero">
        <div className="br-hero-orb br-hero-orb-center" />
        <div className="br-hero-orb br-hero-orb-left" />
        <div className="br-hero-orb br-hero-orb-right" />

        <div className="br-badge">
          <span className="br-badge-dot" />
          <span>Now in private beta</span>
        </div>

        <h1 className="br-display">Computing</h1>
        <h1 className="br-display br-display-gradient">Sovereign.</h1>

        <p className="br-hero-copy">
          BlackRoad OS is the operating system for AI-native organizations: sovereign
          infrastructure, spatial interfaces, and sentient agents under one roof.
        </p>

        <div className="br-hero-actions">
          <Link href="/workspace" className="br-btn br-btn-solid">
            Get Early Access
          </Link>
          <a href="#product" className="br-btn br-btn-outline">
            Explore the Stack
          </a>
        </div>

        <div className="br-stats">
          <div>
            <strong>12K+</strong>
            <span>API calls/day</span>
          </div>
          <div>
            <strong>5</strong>
            <span>Active agents</span>
          </div>
          <div>
            <strong>38ms</strong>
            <span>Avg latency</span>
          </div>
          <div>
            <strong>99.9%</strong>
            <span>Uptime</span>
          </div>
        </div>
      </section>

      <section className="br-marquee" aria-label="BlackRoad themes">
        <div className="br-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`} className="br-marquee-item">
              <span>{item}</span>
              <i />
            </span>
          ))}
        </div>
      </section>

      <section className="br-section" id="product">
        <div className="br-section-head">
          <p className="br-kicker">01 — Product</p>
          <h2 className="br-title">Everything. One OS.</h2>
          <p className="br-copy">
            Six primitives. One coherent stack. BlackRoad replaces a patchwork of tools
            with a single operator layer you can actually own.
          </p>
        </div>

        <div className="br-grid br-grid-three">
          {features.map((feature) => (
            <article key={feature.title} className="br-card">
              <div className="br-card-icon">{feature.icon}</div>
              <div className="br-card-line" />
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="br-section br-section-vision" id="vision">
        <div className="br-vision-grid">
          <div>
            <p className="br-kicker">02 — Vision</p>
            <h2 className="br-title">The OS for what comes after the cloud.</h2>
            <p className="br-copy">
              The cloud optimized for scale. BlackRoad optimizes for sovereignty: your
              compute, your data, your intelligence layer, and your operator surface.
            </p>
            <p className="br-copy">
              This is not another SaaS dashboard. It is an operating system for
              AI-native organizations.
            </p>
            <a href="/docs" className="br-btn br-btn-solid">
              Read the Docs
            </a>
          </div>

          <div className="br-vision-compare">
            <article className="br-card br-compare-card">
              <p className="br-card-tag">Traditional Cloud</p>
              <ul>
                <li>Vendor dependency</li>
                <li>Shared infrastructure</li>
                <li>Opaque data flows</li>
                <li>Per-seat pricing treadmill</li>
              </ul>
            </article>
            <article className="br-card br-compare-card br-compare-card-bright">
              <p className="br-card-tag">BlackRoad OS</p>
              <ul>
                <li>Full sovereignty</li>
                <li>Your own cluster</li>
                <li>Z-framework coherence</li>
                <li>One flat operator tier</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="br-section br-section-muted" id="agents">
        <div className="br-section-head">
          <p className="br-kicker">03 — Agents</p>
          <h2 className="br-title">Your fleet. Always on.</h2>
        </div>

        <div className="br-grid br-grid-two">
          {agents.map((agent) => (
            <article key={agent.name} className="br-card br-agent-card">
              <div className="br-agent-bar" />
              <div className="br-agent-content">
                <div className="br-agent-top">
                  <div>
                    <h3>{agent.name}</h3>
                    <p className="br-card-tag">{agent.role}</p>
                  </div>
                  <span className="br-agent-stat">{agent.stat}</span>
                </div>
                <p>{agent.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="br-section" id="surfaces">
        <div className="br-section-head">
          <p className="br-kicker">04 — Surfaces</p>
          <h2 className="br-title">Not just a story. A live operating surface.</h2>
          <p className="br-copy">
            BlackRoad already ships with the workspace, docs, fleet, and status layers
            connected. The landing page should open into the real system.
          </p>
        </div>

        <div className="br-surface-grid">
          {surfaces.map((surface) => (
            <a key={surface.label} href={surface.href} className="br-card br-surface-card">
              <p className="br-card-tag">{surface.eyebrow}</p>
              <h3>{surface.title}</h3>
              <p>{surface.body}</p>
              <div className="br-card-line" />
              <div className="br-surface-meta">
                <span>{surface.meta}</span>
                <strong>{surface.label}</strong>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="br-section" id="pricing">
        <div className="br-section-head">
          <p className="br-kicker">05 — Pricing</p>
          <h2 className="br-title">Simple. Sovereign. No surprises.</h2>
        </div>

        <div className="br-grid br-grid-three">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`br-card br-pricing-card${plan.featured ? ' br-pricing-card-featured' : ''}`}
            >
              <p className="br-card-tag">{plan.name}</p>
              <div className="br-price-row">
                <strong>{plan.price}</strong>
                <span>{plan.cadence}</span>
              </div>
              <ul className="br-price-list">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a href="/signup" className={`br-btn ${plan.featured ? 'br-btn-solid' : 'br-btn-outline'}`}>
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="br-section br-cta">
        <p className="br-kicker">Join the Beta</p>
        <h2 className="br-title">Own your infrastructure.</h2>
        <p className="br-copy">
          Launch the BlackRoad operator surface, agent fleet, and sovereign deployment
          model on infrastructure that is actually yours.
        </p>
        <div className="br-hero-actions">
          <a href="/workspace" className="br-btn br-btn-solid">
            Open Workspace
          </a>
          <a href="/docs" className="br-btn br-btn-outline">
            Read the Docs
          </a>
        </div>
        <p className="br-footnote">Z:=yx-w · blackroad.io · All systems operational</p>
      </section>

      <footer className="br-footer">
        <div className="br-footer-line" />
        <div className="br-footer-body">
          <div>
            <div className="br-logo">
              <span className="br-logo-bars" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </span>
              <span className="br-logo-text">BlackRoad</span>
            </div>
            <p className="br-footnote">The OS for AI-native organizations.</p>
          </div>
          <div className="br-footer-links">
            <a href="/docs">Docs</a>
            <a href="/agents">Agents</a>
            <a href="/status">Status</a>
            <a href="https://git.blackroad.io" target="_blank" rel="noreferrer">
              RoadCode
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
