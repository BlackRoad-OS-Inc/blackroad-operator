import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

// Pages — all 20 templates
import BlackRoadLanding from './pages/BlackRoadLanding';
import BlackRoadDashboard from './pages/BlackRoadDashboard';
import BlackRoadStatus from './pages/BlackRoadStatus';
import BlackRoadChat from './pages/BlackRoadChat';
import BlackRoadChat2 from './pages/BlackRoadChat2';
import BlackRoadOS from './pages/BlackRoadOS';
import BlackRoadExplorer from './pages/BlackRoadExplorer';
import BlackRoadCommand from './pages/BlackRoadCommand';
import BlackRoadDocs from './pages/BlackRoadDocs';
import BlackRoadAuth from './pages/BlackRoadAuth';
import BlackRoadSettings from './pages/BlackRoadSettings';
import BlackRoadAnimations from './pages/BlackRoadAnimations';
import BlackRoadBrandSystem from './pages/BlackRoadBrandSystem';
import BlackRoadOnboarding from './pages/BlackRoadOnboarding';
import BlackRoadRoadmapPage from './pages/BlackRoadRoadmapPage';
import BrandTemplate from './pages/BrandTemplate';
import LucidiaTerminal from './pages/LucidiaTerminal';
import RoadChainExplorer from './pages/RoadChainExplorer';
import AboutPage from './pages/about-page';
import LeadershipPage from './pages/leadership-page';
import BlackRoadPricing from './pages/BlackRoadPricing';
import BlogList from './pages/blog/BlogList';
import BlogPost from './pages/blog/BlogPost';

const inter = "'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/os', label: 'OS' },
  { path: '/status', label: 'Status' },
  { path: '/chat', label: 'Chat' },
  { path: '/terminal', label: 'Terminal' },
  { path: '/explorer', label: 'Explorer' },
  { path: '/chain', label: 'RoadChain' },
  { path: '/docs', label: 'Docs' },
  { path: '/about', label: 'About' },
  { path: '/leadership', label: 'Leadership' },
  { path: '/auth', label: 'Auth' },
  { path: '/settings', label: 'Settings' },
  { path: '/onboarding', label: 'Onboarding' },
  { path: '/roadmap', label: 'Roadmap' },
  { path: '/brand', label: 'Brand' },
  { path: '/brand-kit', label: 'Brand Kit' },
  { path: '/animations', label: 'Animations' },
  { path: '/command', label: 'Command' },
  { path: '/chat2', label: 'Chat v2' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/billing', label: 'Billing' },
  { path: '/blog', label: 'Blog' },
];

function AppNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (location.pathname === '/') return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: open ? 220 : 48, zIndex: 9999, transition: 'width 0.2s ease' }}>
      <div style={{ background: '#050505', borderRight: '1px solid #141414', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <button onClick={() => setOpen(!open)} style={{
          background: 'none', border: 'none', color: '#555', cursor: 'pointer',
          padding: '16px 14px', fontFamily: mono, fontSize: 14, textAlign: 'left',
        }}>
          {open ? '◂' : '▸'}
        </button>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)} style={{
                fontFamily: inter, fontSize: 11, fontWeight: active ? 600 : 400,
                color: active ? '#f0f0f0' : '#444',
                textDecoration: 'none', padding: '8px 14px',
                background: active ? '#111' : 'transparent',
                borderLeft: active ? '2px solid #8844FF' : '2px solid transparent',
                whiteSpace: 'nowrap', overflow: 'hidden',
                transition: 'color 0.15s, background 0.15s',
              }}>
                {open ? item.label : item.label[0]}
              </Link>
            );
          })}
        </div>
        {open && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid #141414' }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: '#252525', letterSpacing: '0.1em' }}>BLACKROAD CLOUD</div>
            <div style={{ fontFamily: mono, fontSize: 8, color: '#1a1a1a' }}>186 repos · 48 domains · 8 agents</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppNav />
      <Routes>
        <Route path="/" element={<BlackRoadLanding />} />
        <Route path="/dashboard" element={<BlackRoadDashboard />} />
        <Route path="/os" element={<BlackRoadOS />} />
        <Route path="/status" element={<BlackRoadStatus />} />
        <Route path="/chat" element={<BlackRoadChat />} />
        <Route path="/chat2" element={<BlackRoadChat2 />} />
        <Route path="/terminal" element={<LucidiaTerminal />} />
        <Route path="/explorer" element={<BlackRoadExplorer />} />
        <Route path="/chain" element={<RoadChainExplorer />} />
        <Route path="/docs" element={<BlackRoadDocs />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/leadership" element={<LeadershipPage />} />
        <Route path="/auth" element={<BlackRoadAuth />} />
        <Route path="/settings" element={<BlackRoadSettings />} />
        <Route path="/onboarding" element={<BlackRoadOnboarding />} />
        <Route path="/roadmap" element={<BlackRoadRoadmapPage />} />
        <Route path="/brand" element={<BlackRoadBrandSystem />} />
        <Route path="/brand-kit" element={<BrandTemplate />} />
        <Route path="/animations" element={<BlackRoadAnimations />} />
        <Route path="/command" element={<BlackRoadCommand />} />
        <Route path="/pricing" element={<BlackRoadPricing />} />
        <Route path="/billing" element={<BlackRoadPricing />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </BrowserRouter>
  );
}
