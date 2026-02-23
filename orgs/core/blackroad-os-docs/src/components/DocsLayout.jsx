import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/architecture', label: 'Architecture' },
  { href: '/services', label: 'Services' },
  { href: '/agents', label: 'Agents' },
  { href: '/deployment', label: 'Deployment' },
];

export default function DocsLayout({ title, intro, children }) {
  const router = useRouter();

  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        <div className="docs-brand">BlackRoad OS</div>
        <nav>
          <ul className="docs-nav">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <li key={item.href} className={isActive ? 'active' : undefined}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="docs-main">
        {(title || intro) && (
          <header className="docs-header">
            {title && <h1>{title}</h1>}
            {intro && <p className="subtle">{intro}</p>}
          </header>
        )}
        <div className="docs-content">{children}</div>
      </div>
    </div>
  );
}

