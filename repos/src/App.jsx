import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { usePageTracking } from './lib/analytics';
import { DomainProvider, useDomain } from './config/DomainContext';

// Pages
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
import TrollBridge from './pages/TrollBridge';
import BlackRoadAnalytics from './pages/BlackRoadAnalytics';
import RoadSearch from './pages/RoadSearch';

const inter = "'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";

// Component map — string keys from domain config → React components
const COMPONENT_MAP = {
  BlackRoadLanding,
  BlackRoadDashboard,
  BlackRoadStatus,
  BlackRoadChat,
  BlackRoadChat2,
  BlackRoadOS,
  BlackRoadExplorer,
  BlackRoadCommand,
  BlackRoadDocs,
  BlackRoadAuth,
  BlackRoadSettings,
  BlackRoadAnimations,
  BlackRoadBrandSystem,
  BlackRoadOnboarding,
  BlackRoadRoadmapPage,
  BrandTemplate,
  LucidiaTerminal,
  RoadChainExplorer,
  AboutPage,
  LeadershipPage,
  BlackRoadPricing,
  BlogList,
  TrollBridge,
  BlackRoadAnalytics,
  RoadSearch,
};

// All available routes
const ALL_ROUTES = [
  { path: '/dashboard', element: <BlackRoadDashboard />, label: 'Dashboard' },
  { path: '/os', element: <BlackRoadOS />, label: 'OS' },
  { path: '/status', element: <BlackRoadStatus />, label: 'Status' },
  { path: '/chat', element: <BlackRoadChat />, label: 'Chat' },
  { path: '/chat2', element: <BlackRoadChat2 />, label: 'Chat v2' },
  { path: '/terminal', element: <LucidiaTerminal />, label: 'Terminal' },
  { path: '/explorer', element: <BlackRoadExplorer />, label: 'Explorer' },
  { path: '/chain', element: <RoadChainExplorer />, label: 'RoadChain' },
  { path: '/docs', element: <BlackRoadDocs />, label: 'Docs' },
  { path: '/about', element: <AboutPage />, label: 'About' },
  { path: '/leadership', element: <LeadershipPage />, label: 'Leadership' },
  { path: '/auth', element: <BlackRoadAuth />, label: 'Auth' },
  { path: '/settings', element: <BlackRoadSettings />, label: 'Settings' },
  { path: '/onboarding', element: <BlackRoadOnboarding />, label: 'Onboarding' },
  { path: '/roadmap', element: <BlackRoadRoadmapPage />, label: 'Roadmap' },
  { path: '/brand', element: <BlackRoadBrandSystem />, label: 'Brand' },
  { path: '/brand-kit', element: <BrandTemplate />, label: 'Brand Kit' },
  { path: '/animations', element: <BlackRoadAnimations />, label: 'Animations' },
  { path: '/command', element: <BlackRoadCommand />, label: 'Command' },
  { path: '/pricing', element: <BlackRoadPricing />, label: 'Pricing' },
  { path: '/billing', element: <BlackRoadPricing />, label: 'Billing' },
  { path: '/blog', element: <BlogList />, label: 'Blog' },
  { path: '/trollbridge', element: <TrollBridge />, label: 'TrollBridge' },
  { path: '/analytics', element: <BlackRoadAnalytics />, label: 'Analytics' },
  { path: '/search', element: <RoadSearch />, label: 'Search' },
];

function AppNav() {
  const location = useLocation();
  const domain = useDomain();
  const [open, setOpen] = useState(false);

  if (location.pathname === '/') return null;

  // Filter nav items based on domain's allowed routes
  const navItems = [{ path: '/', label: 'Home' }].concat(
    domain.routes === 'all'
      ? ALL_ROUTES
      : ALL_ROUTES.filter(r => domain.routes.includes(r.path))
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: open ? 220 : 48, zIndex: 9999, transition: 'width 0.2s ease' }}>
      <div style={{ background: '#050505', borderRight: '1px solid #141414', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <button onClick={() => setOpen(!open)} style={{
          background: 'none', border: 'none', color: '#555', cursor: 'pointer',
          padding: '16px 14px', fontFamily: mono, fontSize: 14, textAlign: 'left',
        }}>
          {open ? '\u25C2' : '\u25B8'}
        </button>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)} style={{
                fontFamily: inter, fontSize: 11, fontWeight: active ? 600 : 400,
                color: active ? '#f0f0f0' : '#444',
                textDecoration: 'none', padding: '8px 14px',
                background: active ? '#111' : 'transparent',
                borderLeft: active ? `2px solid ${domain.theme.accent}` : '2px solid transparent',
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
            <div style={{ fontFamily: mono, fontSize: 8, color: '#252525', letterSpacing: '0.1em' }}>{domain.name.toUpperCase()}</div>
            <div style={{ fontFamily: mono, fontSize: 8, color: '#1a1a1a' }}>{domain.tagline}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function PageTracker() {
  usePageTracking();
  return null;
}

function AppRoutes() {
  const domain = useDomain();
  const LandingComponent = COMPONENT_MAP[domain.landing] || BlackRoadLanding;

  // Filter routes based on domain config
  const activeRoutes = domain.routes === 'all'
    ? ALL_ROUTES
    : ALL_ROUTES.filter(r => domain.routes.includes(r.path));

  // Set document title based on domain
  if (typeof document !== 'undefined') {
    document.title = `${domain.name} \u2014 ${domain.tagline}`;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingComponent />} />
      {activeRoutes.map(r => (
        <Route key={r.path} path={r.path} element={r.element} />
      ))}
      {/* Blog post route always available if /blog is allowed */}
      {(domain.routes === 'all' || domain.routes.includes('/blog')) && (
        <Route path="/blog/:slug" element={<BlogPost />} />
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <DomainProvider>
      <BrowserRouter>
        <PageTracker />
        <AppNav />
        <AppRoutes />
      </BrowserRouter>
    </DomainProvider>
  );
}
