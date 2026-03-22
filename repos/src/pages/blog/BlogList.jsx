import { Link } from 'react-router-dom';

const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";
const GRAD = 'linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)';

// eslint-disable-next-line react-refresh/only-export-components
export const posts = [
  {
    slug: '52-tops-on-400-dollars',
    title: '52 TOPS on $400: Running AI Inference at the Edge',
    date: '2026-03-10',
    author: 'Alexa Louise Amundson',
    excerpt: 'How we built a distributed AI inference cluster with two Hailo-8 accelerators, five Raspberry Pis, and a custom mesh network — delivering 52 trillion operations per second for under $400 in hardware.',
    readTime: '14 min read',
    tags: ['edge-ai', 'hailo-8', 'raspberry-pi', 'inference', 'mesh-network'],
    published: true,
  },
  {
    slug: 'roadnet-carrier-grade-mesh',
    title: 'Building a Carrier-Grade Mesh Network on Raspberry Pis',
    date: '2026-03-08',
    author: 'Alexa Louise Amundson',
    excerpt: 'RoadNet: 5 access points, 5 subnets, WireGuard failover, Pi-hole DNS — a real carrier network running on $35 boards.',
    readTime: '11 min read',
    tags: ['mesh-network', 'wireguard', 'raspberry-pi', 'networking'],
    published: true,
  },
  {
    slug: 'self-healing-infrastructure',
    title: 'Self-Healing Infrastructure: When Your Servers Fix Themselves',
    date: '2026-03-06',
    author: 'Alexa Louise Amundson',
    excerpt: 'Autonomy scripts, heartbeat monitors, and automatic service recovery — how we eliminated 3am pages.',
    readTime: '9 min read',
    tags: ['infrastructure', 'self-healing', 'automation', 'devops'],
    published: true,
  },
  {
    slug: 'roadc-language-for-agents',
    title: 'Designing a Programming Language for AI Agents',
    date: '2026-03-04',
    author: 'Alexa Louise Amundson',
    excerpt: 'Why existing languages fail for agent orchestration, and how RoadC solves it with Python-style indentation and first-class concurrency.',
    readTime: '16 min read',
    tags: ['programming-languages', 'roadc', 'ai-agents', 'language-design'],
    published: true,
  },
  {
    slug: 'sovereign-computing-manifesto',
    title: 'The Sovereign Computing Manifesto',
    date: '2026-03-02',
    author: 'Alexa Louise Amundson',
    excerpt: 'Your infrastructure should answer to you. Not a cloud provider. Not a vendor. You.',
    readTime: '7 min read',
    tags: ['sovereign-computing', 'philosophy', 'self-hosted', 'independence'],
    published: true,
  },
];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function TagBadge({ tag }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 11, color: '#a1a1aa',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
      padding: '2px 8px', display: 'inline-block',
    }}>
      {tag}
    </span>
  );
}

function PostCard({ post, featured }) {
  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          padding: featured ? 32 : 24,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          background: featured ? '#080808' : 'transparent',
          transition: 'border-color 0.2s, background 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.background = '#0a0a0a';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.background = featured ? '#080808' : 'transparent';
        }}
      >
        {featured && (
          <div style={{
            fontFamily: mono, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
            marginBottom: 16,
            color: '#f5f5f5',
            display: 'inline-block',
          }}>
            Latest Post
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {post.tags.slice(0, 3).map(tag => <TagBadge key={tag} tag={tag} />)}
        </div>
        <h2 style={{
          fontFamily: grotesk, fontSize: featured ? 28 : 20, fontWeight: 700,
          color: '#fff', lineHeight: 1.2, marginBottom: 12,
        }}>
          {post.title}
        </h2>
        <p style={{ fontFamily: inter, fontSize: featured ? 16 : 14, color: '#a1a1aa', lineHeight: 1.6, marginBottom: 16 }}>
          {post.excerpt}
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 12, color: '#71717a' }}>{formatDate(post.date)}</span>
          <span style={{ fontFamily: mono, fontSize: 12, color: '#71717a' }}>{post.readTime}</span>
        </div>
      </article>
    </Link>
  );
}

function ComingSoonCard({ post }) {
  return (
    <article style={{
      padding: 24,
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 8,
      opacity: 0.6,
    }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {post.tags.slice(0, 3).map(tag => <TagBadge key={tag} tag={tag} />)}
      </div>
      <h3 style={{ fontFamily: grotesk, fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
        {post.title}
      </h3>
      <p style={{ fontFamily: inter, fontSize: 14, color: '#71717a', lineHeight: 1.6, marginBottom: 12 }}>
        {post.excerpt}
      </p>
      <span style={{ fontFamily: mono, fontSize: 12, color: '#52525b' }}>Coming soon</span>
    </article>
  );
}

export default function BlogList() {
  const published = posts.filter(p => p.published);
  const upcoming = posts.filter(p => !p.published);
  const [featured, ...rest] = published;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 64px' }}>
        {/* Header */}
        <header style={{ marginBottom: 64 }}>
          <div style={{ height: 2, background: GRAD, marginBottom: 32, borderRadius: 1 }} />
          <h1 style={{ fontFamily: grotesk, fontSize: 48, fontWeight: 700, color: '#fff', lineHeight: 1.05, marginBottom: 16 }}>
            Blog
          </h1>
          <p style={{ fontFamily: inter, fontSize: 18, color: '#a1a1aa', lineHeight: 1.6 }}>
            Building sovereign infrastructure from scratch. Hardware, networking, AI inference, and the scripts that keep it all alive.
          </p>
        </header>

        {/* Featured Post */}
        {featured && (
          <div style={{ marginBottom: 32 }}>
            <PostCard post={featured} featured />
          </div>
        )}

        {/* Other Published Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 64 }}>
          {rest.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Coming Soon */}
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontFamily: grotesk, fontSize: 20, fontWeight: 700, color: '#71717a', marginBottom: 24 }}>
              Coming Soon
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {upcoming.map(post => (
                <ComingSoonCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Subscribe CTA */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '48px 0',
          textAlign: 'center',
        }}>
          <h2 style={{ fontFamily: grotesk, fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            Stay in the loop
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, color: '#a1a1aa', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
            New articles on edge AI, mesh networking, and sovereign infrastructure. No spam. No tracking.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="you@example.com"
              style={{
                fontFamily: inter, fontSize: 14, padding: '10px 16px',
                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, color: '#fff', outline: 'none', width: 260,
              }}
            />
            <button
              style={{
                fontFamily: mono, fontSize: 13, fontWeight: 600,
                padding: '10px 20px', borderRadius: 6, border: 'none',
                background: GRAD, color: '#fff', cursor: 'pointer',
              }}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ paddingTop: 32 }}>
          <p style={{ fontFamily: mono, fontSize: 12, color: '#333', textAlign: 'center' }}>
            BlackRoad OS — Pave Tomorrow.
          </p>
        </footer>
      </div>
    </div>
  );
}
