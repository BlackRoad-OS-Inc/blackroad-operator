import { useParams, Link } from 'react-router-dom';
import { posts } from './BlogList';

import Edge52TOPS from './posts/Edge52TOPS';
import RoadNetMesh from './posts/RoadNetMesh';
import SelfHealingInfra from './posts/SelfHealingInfra';
import RoadCLanguage from './posts/RoadCLanguage';
import SovereignManifesto from './posts/SovereignManifesto';

const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";
const GRAD = 'linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)';

const contentMap = {
  '52-tops-on-400-dollars': Edge52TOPS,
  'roadnet-carrier-grade-mesh': RoadNetMesh,
  'self-healing-infrastructure': SelfHealingInfra,
  'roadc-language-for-agents': RoadCLanguage,
  'sovereign-computing-manifesto': SovereignManifesto,
};

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find(p => p.slug === slug);
  const ContentComponent = contentMap[slug];

  if (!post || !ContentComponent) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: grotesk, fontSize: 48, fontWeight: 700, marginBottom: 16 }}>404</h1>
          <p style={{ fontFamily: inter, fontSize: 16, color: '#a1a1aa', marginBottom: 24 }}>Post not found.</p>
          <Link to="/blog" style={{ fontFamily: mono, fontSize: 14, color: '#fff', textDecoration: 'underline', textUnderlineOffset: 4 }}>
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 64px' }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {post.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: mono, fontSize: 11, color: '#a1a1aa',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
              padding: '2px 8px',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: grotesk, fontSize: 40, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          <span style={{ fontFamily: inter, fontSize: 14, color: '#a1a1aa' }}>{post.author}</span>
          <span style={{ fontFamily: mono, fontSize: 12, color: '#71717a' }}>{formatDate(post.date)}</span>
          <span style={{ fontFamily: mono, fontSize: 12, color: '#71717a' }}>{post.readTime}</span>
        </div>

        {/* Gradient divider */}
        <div style={{ height: 2, background: GRAD, borderRadius: 1, marginBottom: 48 }} />

        {/* Article content */}
        <ContentComponent />

        {/* Gradient divider */}
        <div style={{ height: 2, background: GRAD, borderRadius: 1, marginTop: 48, marginBottom: 48 }} />

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: 24,
        }}>
          <div>
            <p style={{ fontFamily: inter, fontSize: 14, color: '#a1a1aa', marginBottom: 4 }}>
              Written by <span style={{ color: '#fff' }}>{post.author}</span>
            </p>
            <p style={{ fontFamily: inter, fontSize: 13, color: '#71717a' }}>
              Building sovereign infrastructure at{' '}
              <a href="https://blackroad.io" style={{ color: '#a1a1aa', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                blackroad.io
              </a>
            </p>
          </div>
          <Link to="/blog" style={{
            fontFamily: mono, fontSize: 13, color: '#a1a1aa',
            textDecoration: 'none', padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
            transition: 'border-color 0.2s, color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#a1a1aa'; }}
          >
            All posts
          </Link>
        </div>
      </div>
    </div>
  );
}
