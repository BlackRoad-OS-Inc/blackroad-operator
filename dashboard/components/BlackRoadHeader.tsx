'use client'

import { useState } from 'react'

const fonts = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap');`

const css = `
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --grad: linear-gradient(90deg, #FF8400, #FF4400, #FF0066, #CC00AA, #8800FF, #0066FF, #2233CC);
  --font-headline: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

body { background: #000; color: #fff; font-family: var(--font-mono); }

.grad-rule { height: 2px; background: var(--grad); width: 100%; }

.br-header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(0,0,0,0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.br-header-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 0 24px; height: 56px;
  display: flex; align-items: center; gap: 36px;
}

/* ── LOGO ── */
.br-logo {
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0; text-decoration: none; cursor: default;
}

.br-logo-mark {
  width: 32px; height: 32px;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.br-logo-mark span {
  font-family: var(--font-headline);
  font-size: 0.85rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.04em;
  line-height: 1;
  user-select: none;
}

.br-logo-text {
  font-family: var(--font-headline);
  font-size: 1.05rem; font-weight: 700;
  letter-spacing: -0.01em; color: #fff;
}

/* ── NAV ── */
.br-nav { display: flex; align-items: center; gap: 2px; flex: 1; }

.br-nav-item {
  font-size: 0.58rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(255,255,255,0.32); padding: 6px 12px; cursor: pointer;
  transition: color 0.15s, background 0.15s;
  border: none; background: transparent;
  font-family: var(--font-mono); position: relative;
}
.br-nav-item:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.04); }
.br-nav-item.active { color: #fff; }
.br-nav-item.active::after {
  content: ''; position: absolute;
  bottom: -1px; left: 12px; right: 12px;
  height: 1px; background: var(--grad);
}

/* ── DROPDOWN ── */
.br-nav-group { position: relative; }
.br-dropdown {
  position: absolute; top: calc(100% + 12px); left: 0;
  background: #0d0d0d; border: 1px solid rgba(255,255,255,0.09);
  min-width: 200px; padding: 6px; z-index: 200;
  animation: dropIn 0.12s ease;
}
@keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

.br-dropdown-item {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono);
  font-size: 0.56rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(255,255,255,0.4); padding: 9px 10px; cursor: pointer;
  transition: color 0.1s, background 0.1s;
}
.br-dropdown-item:hover { color: #fff; background: rgba(255,255,255,0.04); }
.br-dropdown-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.br-dropdown-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }

/* ── RIGHT ── */
.br-actions { margin-left: auto; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.br-status {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.48rem; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(255,255,255,0.22);
  padding-right: 16px; border-right: 1px solid rgba(255,255,255,0.07);
}
@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.7)} }
.br-status-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #FF8400;
  animation: pulse-dot 2.2s ease-in-out infinite; flex-shrink: 0;
}

.br-btn {
  font-family: var(--font-mono); font-size: 0.54rem; font-weight: 500;
  letter-spacing: 0.07em; text-transform: uppercase;
  cursor: pointer; border: none; padding: 7px 15px; transition: all 0.15s;
}
.br-btn-ghost {
  background: transparent; color: rgba(255,255,255,0.45);
  border: 1px solid rgba(255,255,255,0.13);
}
.br-btn-ghost:hover { border-color: rgba(255,255,255,0.35); color: #fff; }
.br-btn-primary { background: #fff; color: #000; }
.br-btn-primary:hover { opacity: 0.88; }

/* ── HAMBURGER ── */
.br-hamburger {
  display: none; flex-direction: column; gap: 4px;
  cursor: pointer; padding: 4px; background: none; border: none;
}
.br-hamburger span {
  display: block; width: 20px; height: 1px;
  background: rgba(255,255,255,0.55);
  transition: transform 0.2s, opacity 0.2s;
}

/* ── MOBILE NAV ── */
.br-mobile-nav {
  background: #080808; border-top: 1px solid rgba(255,255,255,0.05);
  padding: 8px 20px 20px;
}
.br-mobile-section {
  font-family: var(--font-mono);
  font-size: 0.44rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(255,255,255,0.2); padding: 14px 0 6px;
}
.br-mobile-nav-item {
  font-family: var(--font-mono);
  font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(255,255,255,0.38);
  padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
  cursor: pointer; background: none; border-top: none; border-left: none; border-right: none;
  text-align: left; width: 100%; transition: color 0.15s;
  display: flex; align-items: center; gap: 10px;
}
.br-mobile-nav-item:last-child { border-bottom: none; }
.br-mobile-nav-item:hover, .br-mobile-nav-item.active { color: #fff; }

/* ── PREVIEW ── */
.preview { min-height: 100vh; background: #000; }
.preview-body { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
.preview-headline {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(3rem, 9vw, 5.5rem);
  font-weight: 700; line-height: 1; letter-spacing: -0.02em; margin-bottom: 28px;
}
.preview-rule { height: 2px; width: 120px; background: var(--grad); margin-bottom: 24px; }
.preview-sub { font-family: var(--font-mono); font-size: 0.68rem; opacity: 0.3; line-height: 1.9; }

@media (max-width: 768px) {
  .br-nav, .br-status, .br-btn-ghost { display: none; }
  .br-hamburger { display: flex; }
}
`

interface NavChild {
  label: string
  color: string
}

interface NavItem {
  label: string
  active?: boolean
  children?: NavChild[]
}

const NAV: NavItem[] = [
  { label: 'OS', active: true },
  {
    label: 'Products',
    children: [
      { label: 'Lucidia', color: '#FF8400' },
      { label: 'RoadWork', color: '#0066FF' },
      { label: 'RoadView', color: '#FF0066' },
      { label: 'RoadWorld', color: '#8800FF' },
      { label: 'BackRoad', color: '#CC00AA' },
    ],
  },
  { label: 'Agents' },
  { label: 'Research' },
  { label: 'Docs' },
]

function Dropdown({
  items,
  onClose,
}: {
  items: NavChild[]
  onClose: () => void
}) {
  return (
    <div className="br-dropdown">
      {items.map((item, i) => (
        <div key={item.label}>
          {i > 0 && <div className="br-dropdown-divider" />}
          <div className="br-dropdown-item" onClick={onClose}>
            <span
              className="br-dropdown-dot"
              style={{ background: item.color }}
            />
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function BlackRoadHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const toggle = (label: string) =>
    setActiveDropdown((p) => (p === label ? null : label))

  return (
    <>
      <style>{fonts}{css}</style>

      <div className="preview">
        <div className="grad-rule" />

        <header className="br-header">
          <div className="br-header-inner">
            {/* LOGO */}
            <a className="br-logo" href="/">
              <div className="br-logo-mark">
                <span>BR</span>
              </div>
              <span className="br-logo-text">BlackRoad</span>
            </a>

            {/* DESKTOP NAV */}
            <nav className="br-nav">
              {NAV.map((item) =>
                item.children ? (
                  <div key={item.label} className="br-nav-group">
                    <button
                      className={`br-nav-item${activeDropdown === item.label ? ' active' : ''}`}
                      onClick={() => toggle(item.label)}
                    >
                      {item.label} ↓
                    </button>
                    {activeDropdown === item.label && (
                      <Dropdown
                        items={item.children}
                        onClose={() => setActiveDropdown(null)}
                      />
                    )}
                  </div>
                ) : (
                  <button
                    key={item.label}
                    className={`br-nav-item${item.active ? ' active' : ''}`}
                  >
                    {item.label}
                  </button>
                ),
              )}
            </nav>

            {/* RIGHT */}
            <div className="br-actions">
              <div className="br-status">
                <span className="br-status-dot" />
                All systems online
              </div>
              <button className="br-btn br-btn-ghost">Sign in</button>
              <button className="br-btn br-btn-primary">Get access</button>
              <button
                className="br-hamburger"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <span
                  style={{
                    transform: mobileOpen
                      ? 'rotate(45deg) translateY(5px)'
                      : 'none',
                  }}
                />
                <span style={{ opacity: mobileOpen ? 0 : 1 }} />
                <span
                  style={{
                    transform: mobileOpen
                      ? 'rotate(-45deg) translateY(-5px)'
                      : 'none',
                  }}
                />
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav className="br-mobile-nav">
              <div className="br-mobile-section">Navigation</div>
              {NAV.filter((i) => !i.children).map((item) => (
                <button
                  key={item.label}
                  className={`br-mobile-nav-item${item.active ? ' active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
              <div className="br-mobile-section">Products</div>
              {NAV.find((i) => i.children)?.children?.map((item) => (
                <button key={item.label} className="br-mobile-nav-item">
                  <span
                    className="br-dropdown-dot"
                    style={{ background: item.color }}
                  />
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </header>

        <div className="preview-body">
          <div className="preview-headline">
            BlackRoad
            <br />
            Header
          </div>
          <div className="preview-rule" />
          <p className="preview-sub">
            Sticky · backdrop-blur · gradient rule
            <br />
            Products dropdown · status pulse · responsive
          </p>
        </div>
      </div>
    </>
  )
}
