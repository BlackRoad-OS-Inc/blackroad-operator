import { useState } from "react";

/*
 * ═══════════════════════════════════════════════════════════════
 * BLACKROAD JSX TOOLKIT — The Complete Guide
 * ═══════════════════════════════════════════════════════════════
 *
 * This file IS the documentation. Every component is reusable.
 * Copy any section into your own app.
 *
 * RULES:
 * 1. Background: #0a0a0a always
 * 2. Text: grayscale only (#f5f5f5 → #262626) — NEVER colored
 * 3. Color only on decorative bars, dots, dividers
 * 4. Fonts: Space Grotesk 700 headlines, Inter body, JetBrains Mono data
 * 5. Cards: #131313 bg, #1a1a1a border, 10-14px radius
 * 6. Max width: 720px centered content
 * 7. Nav: 52px height, spectrum mark, hamburger at 560px
 * 8. Gradient bar between major sections
 */

// ─────────────────────────────────────────
// 1. DESIGN TOKENS
// ─────────────────────────────────────────

const T = {
  // Accent colors — decorative use ONLY
  colors: ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"],
  gradient: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)",

  // Text hierarchy — ONLY these values for text
  text: {
    primary:   "#f5f5f5",  // Headlines, emphasis
    secondary: "#d4d4d4",  // Subheads, active items
    tertiary:  "#a3a3a3",  // Body text, labels
    muted:     "#737373",  // Descriptions, paragraphs
    dim:       "#525252",  // Secondary info
    faint:     "#404040",  // Timestamps, hints
    ghost:     "#333333",  // Disabled, barely visible
    invisible: "#262626",  // Separators in text
    gone:      "#1a1a1a",  // Near-invisible hints
  },

  // Surfaces
  bg: {
    page:   "#0a0a0a",  // Always
    card:   "#131313",  // Cards, panels
    inset:  "#0f0f0f",  // Inset areas, input backgrounds
    deep:   "#0a0a0a",  // Nested elements inside cards
  },

  // Borders
  border: {
    card:    "#1a1a1a",  // Card borders
    subtle:  "#141414",  // Row dividers inside cards
    hover:   "#262626",  // Hover state
    input:   "#1a1a1a",  // Input borders
    focus:   "#262626",  // Input focus
  },

  // Radius
  radius: {
    card:  "10px",   // Standard cards (10-14)
    large: "14px",   // Hero cards
    btn:   "7px",    // Buttons
    input: "8px",    // Inputs
    small: "5px",    // Tags, badges
    pill:  "6px",    // Nav items
    dot:   "50%",    // Status dots
  },

  // Typography
  font: {
    headline: "'Space Grotesk', sans-serif",  // Weight: 700 only
    body:     "'Inter', sans-serif",           // Weight: 400, 500, 600
    mono:     "'JetBrains Mono', monospace",   // Weight: 400, 500
  },

  // Spacing
  maxWidth: 720,
  navHeight: 52,
  mobileBreak: 560,
};

// ─────────────────────────────────────────
// 2. REUSABLE COMPONENTS
// ─────────────────────────────────────────

// GRADIENT BAR — Use between major sections
function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: T.gradient, ...style }} />;
}

// SPECTRUM MARK — The BlackRoad logo mark
function SpectrumMark({ barWidth = 3, barHeight = 14, gap = 2 }) {
  return (
    <div style={{ display: "flex", gap }}>
      {T.colors.map((c) => (
        <div key={c} style={{ width: barWidth, height: barHeight, borderRadius: Math.max(1, barWidth / 2), background: c }} />
      ))}
    </div>
  );
}

// SPECTRUM DOTS — Alternative logo mark
function SpectrumDots({ size = 5, gap = 3 }) {
  return (
    <div style={{ display: "flex", gap }}>
      {T.colors.map((c) => (
        <div key={c} style={{ width: size, height: size, borderRadius: T.radius.dot, background: c }} />
      ))}
    </div>
  );
}

// NAV — Standard navigation bar
function BRNav({ title = "BlackRoad", subtitle = "", links = [], rightContent = null }) {
  return (
    <nav style={{
      padding: "0 20px", height: T.navHeight, display: "flex", alignItems: "center",
      justifyContent: "space-between", borderBottom: `1px solid ${T.border.card}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SpectrumMark />
        <span style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary, letterSpacing: "-0.02em" }}>{title}</span>
        {subtitle && <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.ghost, marginLeft: 2 }}>{subtitle}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {links.map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.muted, textDecoration: "none" }}>{l}</a>
        ))}
        {rightContent}
      </div>
    </nav>
  );
}

// SECTION LABEL — Mono uppercase header above sections
function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
      {children}
    </div>
  );
}

// SECTION TITLE — Space Grotesk headline
function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: T.font.headline, fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: T.text.primary, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.15 }}>
      {children}
    </h2>
  );
}

// CARD — Standard content card
function Card({ children, highlight = false, accentColor = null, style: extraStyle = {} }) {
  return (
    <div style={{
      background: T.bg.card, border: `1px solid ${highlight ? T.border.hover : T.border.card}`,
      borderRadius: T.radius.card, overflow: "hidden", position: "relative",
      ...extraStyle,
    }}>
      {accentColor && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accentColor }} />}
      {children}
    </div>
  );
}

// STAT CARD — Number + label
function StatCard({ value, label }) {
  return (
    <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: "8px", padding: "14px 16px", textAlign: "center" }}>
      <div style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary }}>{value}</div>
      <div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.faint, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{label}</div>
    </div>
  );
}

// STAT STRIP — Row of stats with 1px gap
function StatStrip({ stats }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(100, 400 / stats.length)}px, 1fr))`, gap: 1, background: T.border.card, borderRadius: T.radius.card, overflow: "hidden" }}>
      {stats.map((s) => (
        <div key={s.label} style={{ background: T.bg.inset, padding: "14px 16px", textAlign: "center" }}>
          <div style={{ fontFamily: T.font.headline, fontSize: 20, fontWeight: 700, color: T.text.primary }}>{s.value}</div>
          <div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.faint, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// STATUS DOT
function StatusDot({ status = "active", size = 6 }) {
  const color = status === "active" ? T.text.tertiary : status === "idle" ? T.text.faint : T.text.ghost;
  return <div style={{ width: size, height: size, borderRadius: T.radius.dot, background: color, flexShrink: 0 }} />;
}

// BUTTON — Primary, secondary, ghost
function BRButton({ children, variant = "primary", onClick, disabled = false, style: extraStyle = {} }) {
  const styles = {
    primary:   { color: T.bg.page, background: T.text.primary, border: "none" },
    secondary: { color: T.text.tertiary, background: "transparent", border: `1px solid ${T.text.faint}` },
    ghost:     { color: T.text.dim, background: "transparent", border: `1px solid ${T.border.card}` },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: T.font.body, fontSize: 13, fontWeight: 500,
      ...s, padding: "10px 22px", borderRadius: T.radius.btn, cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.3 : 1, ...extraStyle,
    }}>
      {children}
    </button>
  );
}

// INPUT
function BRInput({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.dim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{
        background: T.bg.deep, border: `1px solid ${T.border.input}`, borderRadius: T.radius.input,
        color: T.text.primary, fontFamily: T.font.body, fontSize: 14, padding: "12px 16px", outline: "none", width: "100%",
      }} />
    </div>
  );
}

// SEARCH BAR
function BRSearch({ placeholder = "Search...", value, onChange }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", background: T.bg.card, border: `1px solid ${T.border.card}`,
      borderRadius: T.radius.card, padding: "3px 3px 3px 16px",
    }}>
      <span style={{ fontFamily: T.font.mono, fontSize: 13, color: T.text.invisible, flexShrink: 0, marginRight: 8 }}>⌕</span>
      <input type="text" value={value} onChange={onChange} placeholder={placeholder} style={{
        flex: 1, background: "none", border: "none", color: T.text.primary,
        fontFamily: T.font.body, fontSize: 14, padding: "10px 0", outline: "none", minWidth: 0,
      }} />
      <BRButton variant="primary" style={{ padding: "8px 20px", fontSize: 13 }}>Search</BRButton>
    </div>
  );
}

// TAG / BADGE
function Tag({ children, tier = null }) {
  const tierColor = tier ? T.colors[["enterprise","core","product","infra","research","corporate"].indexOf(tier)] : null;
  return (
    <span style={{
      fontFamily: T.font.mono, fontSize: 10, color: T.text.dim,
      background: T.bg.deep, padding: "4px 10px", borderRadius: T.radius.small,
      border: `1px solid ${T.border.card}`, textTransform: "uppercase", letterSpacing: "0.04em",
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      {tierColor && <div style={{ width: 4, height: 8, borderRadius: 1, background: tierColor }} />}
      {children}
    </span>
  );
}

// PROGRESS BAR
function ProgressBar({ value, max = 100, height = 4, color = null }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: "100%", height, background: T.border.card, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color || T.text.faint, borderRadius: 2, transition: "width 0.4s ease" }} />
    </div>
  );
}

// ACCENT BAR — Colored left bar on a card
function AccentBar({ color, width = 3 }) {
  return <div style={{ position: "absolute", top: 0, left: 0, width, height: "100%", background: color }} />;
}

// TERMINAL BLOCK — Code/CLI display
function Terminal({ title = "terminal", children }) {
  return (
    <Card>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border.card}`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: T.radius.dot, background: T.text.ghost }} />
        <div style={{ width: 6, height: 6, borderRadius: T.radius.dot, background: T.text.ghost }} />
        <div style={{ width: 6, height: 6, borderRadius: T.radius.dot, background: T.text.ghost }} />
        <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.invisible, marginLeft: 4 }}>{title}</span>
      </div>
      <div style={{ padding: "16px 18px", fontFamily: T.font.mono, fontSize: 12, lineHeight: 2 }}>
        {children}
      </div>
    </Card>
  );
}

// LIST ROW — Standard row inside a card
function ListRow({ left, right, divider = true }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      padding: "10px 18px", borderBottom: divider ? `1px solid ${T.border.subtle}` : "none",
      flexWrap: "wrap",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>{left}</div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

// FILTER TABS
function FilterTabs({ options, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} style={{
          fontFamily: T.font.mono, fontSize: 10, fontWeight: 500,
          textTransform: "uppercase", letterSpacing: "0.06em",
          color: active === o ? T.text.primary : T.text.faint,
          background: active === o ? T.border.card : "transparent",
          border: `1px solid ${T.border.card}`, borderRadius: T.radius.small,
          padding: "5px 12px", cursor: "pointer",
        }}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ACCORDION / FAQ ITEM
function Accordion({ question, answer, isOpen, onToggle }) {
  return (
    <div style={{ background: T.bg.card }}>
      <button onClick={onToggle} style={{
        width: "100%", textAlign: "left", cursor: "pointer",
        background: "none", border: "none", padding: "16px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <span style={{ fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: isOpen ? T.text.primary : T.text.tertiary }}>{question}</span>
        <span style={{
          fontFamily: T.font.mono, fontSize: 14, color: T.text.faint, flexShrink: 0,
          transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s ease",
        }}>+</span>
      </button>
      {isOpen && (
        <div style={{ padding: "0 18px 16px" }}>
          <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted, lineHeight: 1.6, margin: 0 }}>{answer}</p>
        </div>
      )}
    </div>
  );
}

// FOOTER
function BRFooter({ label = "BlackRoad OS", sub = "blackroad.io", links = ["Home", "Docs", "GitHub"] }) {
  return (
    <footer style={{ padding: "0 20px 48px" }}>
      <div style={{ maxWidth: T.maxWidth, margin: "0 auto" }}>
        <GradientBar />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <SpectrumMark barWidth={3} barHeight={10} />
              <span style={{ fontFamily: T.font.headline, fontSize: 13, fontWeight: 600, color: T.text.tertiary }}>{label}</span>
            </div>
            <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{sub}</div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {links.map((l) => <a key={l} href="#" style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.dim, textDecoration: "none" }}>{l}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}


// ─────────────────────────────────────────
// 3. PATTERN EXAMPLES — THE GUIDE ITSELF
// ─────────────────────────────────────────

function Section({ id, children }) {
  return <section id={id} style={{ padding: "48px 0" }}>{children}</section>;
}

function CodeSnippet({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background: T.bg.deep, border: `1px solid ${T.border.card}`, borderRadius: T.radius.input, overflow: "hidden", margin: "12px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 14px", borderBottom: `1px solid ${T.border.subtle}` }}>
        <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>JSX</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); }} style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint, background: "none", border: `1px solid ${T.border.card}`, padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ fontFamily: T.font.mono, fontSize: 11, lineHeight: 1.7, color: T.text.tertiary, padding: "12px 14px", margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{code}</pre>
    </div>
  );
}

function DocBlock({ title, description, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: T.font.headline, fontSize: 18, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>{title}</div>
      {description && <p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, lineHeight: 1.5, marginBottom: 12 }}>{description}</p>}
      {children}
    </div>
  );
}


// ─────────────────────────────────────────
// 4. MAIN APP — THE GUIDE
// ─────────────────────────────────────────

export default function BlackRoadToolkit() {
  const [activeSection, setActiveSection] = useState("tokens");
  const [demoFilter, setDemoFilter] = useState("all");
  const [demoAccordion, setDemoAccordion] = useState(null);
  const [demoInput, setDemoInput] = useState("");
  const [demoSearch, setDemoSearch] = useState("");

  const sections = [
    { id: "tokens", label: "Tokens" },
    { id: "components", label: "Components" },
    { id: "patterns", label: "Patterns" },
    { id: "rules", label: "Rules" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        html, body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #333; }
        input:focus { border-color: #262626 !important; outline: none; }
        button:hover { opacity: 0.88; }
        a:hover { color: #a3a3a3 !important; }
      `}</style>

      <div style={{ background: T.bg.page, minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: T.font.body, color: T.text.primary }}>
        <GradientBar />
        <BRNav title="BlackRoad" subtitle="Toolkit" links={sections.map((s) => s.label)} />

        <div style={{ padding: "32px 20px 80px" }}>
          <div style={{ maxWidth: T.maxWidth, margin: "0 auto" }}>

            {/* Hero */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <SpectrumDots />
                <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim, textTransform: "uppercase", letterSpacing: "0.15em" }}>JSX Toolkit</span>
              </div>
              <h1 style={{ fontFamily: T.font.headline, fontSize: "clamp(32px, 7vw, 48px)", fontWeight: 700, color: T.text.primary, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
                How to build<br />BlackRoad apps.
              </h1>
              <p style={{ fontFamily: T.font.body, fontSize: 15, color: T.text.muted, lineHeight: 1.65, maxWidth: 480 }}>
                Every component, token, and pattern used across all 17 BlackRoad templates. Copy any piece. Build anything in the ecosystem.
              </p>
            </div>

            <GradientBar />

            {/* Nav tabs */}
            <div style={{ display: "flex", gap: 2, background: T.bg.inset, borderRadius: T.radius.input, padding: 3, margin: "24px 0" }}>
              {sections.map((s) => (
                <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                  flex: 1, fontFamily: T.font.mono, fontSize: 11, fontWeight: 500,
                  color: activeSection === s.id ? T.text.primary : T.text.faint,
                  background: activeSection === s.id ? T.border.card : "transparent",
                  border: "none", borderRadius: T.radius.pill, padding: "9px 0", cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* ═══ TOKENS ═══ */}
            {activeSection === "tokens" && (
              <div>
                <Section id="colors">
                  <SectionLabel>01 · Accent Palette</SectionLabel>
                  <SectionTitle>Six colors. Decorative only.</SectionTitle>
                  <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted, lineHeight: 1.6, marginBottom: 20 }}>
                    Never on text. Only on bars, dots, dividers, and decorative elements. The palette defines identity without polluting readability.
                  </p>
                  <div style={{ display: "flex", gap: 1, background: T.border.card, borderRadius: T.radius.card, overflow: "hidden", marginBottom: 16 }}>
                    {[
                      { name: "Ember", hex: "#FF6B2B" },
                      { name: "Fuse", hex: "#FF2255" },
                      { name: "Pulse", hex: "#CC00AA" },
                      { name: "Drift", hex: "#8844FF" },
                      { name: "Signal", hex: "#4488FF" },
                      { name: "Arc", hex: "#00D4FF" },
                    ].map((c) => (
                      <div key={c.name} style={{ flex: 1, background: T.bg.card, padding: 16, textAlign: "center" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: c.hex, margin: "0 auto 8px" }} />
                        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.dim }}>{c.name}</div>
                        <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.tertiary }}>{c.hex}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 6, background: T.gradient, borderRadius: 3 }} />
                </Section>

                <GradientBar />

                <Section id="grays">
                  <SectionLabel>02 · Text Hierarchy</SectionLabel>
                  <SectionTitle>Eight grays. That's it.</SectionTitle>
                  <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted, lineHeight: 1.6, marginBottom: 20 }}>
                    Every text element in the system uses one of these values. The hierarchy creates depth through luminance, not color.
                  </p>
                  <Card>
                    {[
                      { name: "primary", hex: "#f5f5f5", use: "Headlines, emphasis, active states" },
                      { name: "secondary", hex: "#d4d4d4", use: "Subheads, card titles, active nav" },
                      { name: "tertiary", hex: "#a3a3a3", use: "Body text, data values, labels" },
                      { name: "muted", hex: "#737373", use: "Descriptions, paragraphs, snippets" },
                      { name: "dim", hex: "#525252", use: "Secondary info, captions" },
                      { name: "faint", hex: "#404040", use: "Timestamps, hints, disabled" },
                      { name: "ghost", hex: "#333333", use: "Barely visible, section markers" },
                      { name: "invisible", hex: "#262626", use: "Separators, near-hidden text" },
                    ].map((g, i, arr) => (
                      <div key={g.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.border.subtle}` : "none" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: g.hex, flexShrink: 0 }} />
                        <span style={{ fontFamily: T.font.mono, fontSize: 12, color: g.hex, width: 80 }}>{g.name}</span>
                        <span style={{ fontFamily: T.font.mono, fontSize: 12, color: T.text.dim, width: 70 }}>{g.hex}</span>
                        <span style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.faint }}>{g.use}</span>
                      </div>
                    ))}
                  </Card>
                </Section>

                <GradientBar />

                <Section id="type">
                  <SectionLabel>03 · Typography</SectionLabel>
                  <SectionTitle>Three fonts. Strict roles.</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Card style={{ padding: 22 }}>
                      <div style={{ fontFamily: T.font.headline, fontSize: 36, fontWeight: 700, color: T.text.primary, marginBottom: 6 }}>Space Grotesk 700</div>
                      <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>Headlines only. Never body text. Always weight 700. Letter-spacing -0.02em to -0.03em.</div>
                    </Card>
                    <Card style={{ padding: 22 }}>
                      <div style={{ fontFamily: T.font.body, fontSize: 16, color: T.text.tertiary, lineHeight: 1.65, marginBottom: 6 }}>Inter — the workhorse. Body text, descriptions, buttons, navigation labels. Weights 400, 500, 600. Clean and invisible.</div>
                      <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>Body font. Weights 400 (body), 500 (buttons, emphasis), 600 (rare strong emphasis).</div>
                    </Card>
                    <Card style={{ padding: 22 }}>
                      <div style={{ fontFamily: T.font.mono, fontSize: 14, color: T.text.tertiary, lineHeight: 1.8, marginBottom: 6 }}>JetBrains Mono — data, labels, code, timestamps, badges, section headers, terminal output. Everything technical.</div>
                      <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>Monospace. Section labels: 10-11px uppercase tracking 0.15em #525252. Code: 12px. Data: 11-13px.</div>
                    </Card>
                  </div>
                </Section>

                <GradientBar />

                <Section id="surfaces">
                  <SectionLabel>04 · Surfaces & Borders</SectionLabel>
                  <SectionTitle>Three depths. One border.</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                    {[
                      { name: "Page", hex: "#0a0a0a", token: "bg.page" },
                      { name: "Card", hex: "#131313", token: "bg.card" },
                      { name: "Inset", hex: "#0f0f0f", token: "bg.inset" },
                      { name: "Border", hex: "#1a1a1a", token: "border.card" },
                      { name: "Subtle", hex: "#141414", token: "border.subtle" },
                      { name: "Hover", hex: "#262626", token: "border.hover" },
                    ].map((s) => (
                      <div key={s.name} style={{ background: s.hex, border: `1px solid ${T.border.card}`, borderRadius: T.radius.input, padding: 18 }}>
                        <div style={{ fontFamily: T.font.mono, fontSize: 12, color: T.text.dim, marginBottom: 2 }}>{s.name}</div>
                        <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>{s.hex}</div>
                        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{s.token}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* ═══ COMPONENTS ═══ */}
            {activeSection === "components" && (
              <div>
                <DocBlock title="Buttons" description="Three variants. Never border-radius > 8px. Inter font always.">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    <BRButton variant="primary">Primary</BRButton>
                    <BRButton variant="secondary">Secondary</BRButton>
                    <BRButton variant="ghost">Ghost</BRButton>
                    <BRButton variant="primary" disabled>Disabled</BRButton>
                  </div>
                  <CodeSnippet code={`<BRButton variant="primary">Label</BRButton>
<BRButton variant="secondary">Label</BRButton>
<BRButton variant="ghost">Label</BRButton>`} />
                </DocBlock>

                <DocBlock title="Inputs" description="Dark inset background. JetBrains Mono label. Focus border #262626.">
                  <BRInput label="Example Label" placeholder="Type something..." value={demoInput} onChange={(e) => setDemoInput(e.target.value)} />
                  <CodeSnippet code={`<BRInput label="Email" placeholder="you@example.com" value={val} onChange={setVal} />`} />
                </DocBlock>

                <DocBlock title="Search Bar" description="Magnifying glass prefix. Input + button combined. Used in RoadView, VaultRoad, docs.">
                  <BRSearch placeholder="Search your vault..." value={demoSearch} onChange={(e) => setDemoSearch(e.target.value)} />
                </DocBlock>

                <DocBlock title="Cards" description="The fundamental container. #131313 bg, #1a1a1a border, 10-14px radius. Optional accent bar.">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Card style={{ padding: 20 }}>
                      <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted }}>Standard card. No accent.</p>
                    </Card>
                    <Card accentColor={T.gradient} style={{ padding: 20 }}>
                      <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted }}>Card with gradient accent bar at top.</p>
                    </Card>
                    <Card accentColor={T.colors[3]} highlight style={{ padding: 20 }}>
                      <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted }}>Highlighted card with single-color accent.</p>
                    </Card>
                  </div>
                </DocBlock>

                <DocBlock title="Stat Strip" description="Row of KPIs with 1px gap between. Used in every dashboard and landing page.">
                  <StatStrip stats={[
                    { value: "847", label: "Agents" },
                    { value: "20", label: "Domains" },
                    { value: "99.97%", label: "Uptime" },
                    { value: "22ms", label: "Latency" },
                  ]} />
                </DocBlock>

                <DocBlock title="Tags & Badges" description="Mono font, uppercase, subtle border. Optional tier color pip.">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Tag>default</Tag>
                    <Tag tier="core">core</Tag>
                    <Tag tier="product">product</Tag>
                    <Tag tier="infra">infra</Tag>
                    <Tag tier="research">research</Tag>
                    <Tag tier="corporate">corporate</Tag>
                  </div>
                </DocBlock>

                <DocBlock title="Filter Tabs" description="Horizontal filter row. Active tab gets #1a1a1a background.">
                  <FilterTabs options={["all", "feature", "improved", "fixed", "docs"]} active={demoFilter} onChange={setDemoFilter} />
                </DocBlock>

                <DocBlock title="Status Dots" description="Three states: active (#a3a3a3), idle (#404040), offline (#333).">
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {["active", "idle", "offline"].map((s) => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <StatusDot status={s} />
                        <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </DocBlock>

                <DocBlock title="Progress Bars" description="4px default height. Gray fill. Optional color override.">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <ProgressBar value={75} />
                    <ProgressBar value={45} color={T.text.dim} />
                    <ProgressBar value={90} height={6} />
                  </div>
                </DocBlock>

                <DocBlock title="Terminal Block" description="Used for CLI output, agent status, config display. Dots + title header.">
                  <Terminal title="blackroad.status">
                    <div style={{ color: T.text.ghost }}>$ blackroad status</div>
                    <div style={{ color: T.text.dim }}>  agents: <span style={{ color: T.text.tertiary }}>847 online</span></div>
                    <div style={{ color: T.text.dim }}>  mesh:   <span style={{ color: T.text.tertiary }}>NA1 ✓ · EU1 ✓ · AP1 ✓</span></div>
                    <div style={{ color: T.text.dim }}>  uptime: <span style={{ color: T.text.tertiary }}>99.97%</span></div>
                  </Terminal>
                </DocBlock>

                <DocBlock title="Accordion / FAQ" description="Used in pricing FAQ, docs, changelogs. Plus icon rotates 45° on open.">
                  <Card>
                    <Accordion question="What is BlackRoad OS?" answer="A distributed AI operating system built on novel mathematical foundations. 20 domains, 150+ subdomains, 1,000 AI agents." isOpen={demoAccordion === 0} onToggle={() => setDemoAccordion(demoAccordion === 0 ? null : 0)} />
                    <Accordion question="What does 80% creator revenue mean?" answer="When you publish content, sell assets, or earn through the ecosystem, you keep 80%. Compare: Roblox 29%, YouTube 55%, Spotify 0.3%." isOpen={demoAccordion === 1} onToggle={() => setDemoAccordion(demoAccordion === 1 ? null : 1)} />
                  </Card>
                </DocBlock>

                <DocBlock title="Spectrum Marks" description="Two variants: bars (nav, footer) and dots (section headers).">
                  <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                    <div>
                      <SpectrumMark />
                      <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, marginTop: 6 }}>Bars (nav)</div>
                    </div>
                    <div>
                      <SpectrumDots />
                      <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, marginTop: 6 }}>Dots (sections)</div>
                    </div>
                    <div>
                      <SpectrumMark barWidth={5} barHeight={20} gap={3} />
                      <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, marginTop: 6 }}>Large (heroes)</div>
                    </div>
                  </div>
                </DocBlock>

                <DocBlock title="Footer" description="Gradient bar, logo + subtitle, links row. Same on every page.">
                  <BRFooter />
                </DocBlock>
              </div>
            )}

            {/* ═══ PATTERNS ═══ */}
            {activeSection === "patterns" && (
              <div>
                <DocBlock title="Page Structure" description="Every BlackRoad page follows this skeleton:">
                  <CodeSnippet code={`<GradientBar />
<BRNav title="PortalName" subtitle="v0.1" links={["Tab1","Tab2"]} />

<section style={{ padding: "56px 20px 48px" }}>
  <div style={{ maxWidth: 720, margin: "0 auto" }}>
    <SpectrumDots />
    <SectionLabel>Category</SectionLabel>
    <SectionTitle>Big headline here.</SectionTitle>
    <p>Description paragraph in Inter, #737373.</p>
  </div>
</section>

<GradientBar />  {/* Between major sections */}

<section style={{ padding: "48px 20px" }}>
  <div style={{ maxWidth: 720, margin: "0 auto" }}>
    {/* Content */}
  </div>
</section>

<BRFooter />`} />
                </DocBlock>

                <DocBlock title="Section Pattern" description="Section label → title → description → content. Always this order.">
                  <Card style={{ padding: 22 }}>
                    <SectionLabel>Section Label</SectionLabel>
                    <SectionTitle>Section Title</SectionTitle>
                    <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted, lineHeight: 1.6, marginBottom: 16 }}>
                      Description paragraph explaining this section. Always Inter, always #737373, always 14-15px.
                    </p>
                    <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.ghost }}>↓ Content goes here ↓</div>
                  </Card>
                </DocBlock>

                <DocBlock title="Card List Pattern" description="Items inside a card separated by #141414 borders. Used for transactions, agents, policies, domains.">
                  <Card>
                    {["First item", "Second item", "Third item"].map((item, i) => (
                      <ListRow key={item} divider={i < 2}
                        left={<span style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.secondary }}>{item}</span>}
                        right={<span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>detail</span>}
                      />
                    ))}
                  </Card>
                </DocBlock>

                <DocBlock title="Grid Layouts" description="Auto-fill grids with flexible minimums. Standard pattern for cards, stats, assets.">
                  <CodeSnippet code={`// Stat grid
gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))"

// Card grid
gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))"

// Compact chips
display: "flex", flexWrap: "wrap", gap: 6

// 1px-gap strip (stat strips)
gap: 1, background: "#1a1a1a", overflow: "hidden"`} />
                </DocBlock>

                <DocBlock title="Portal Nav Pattern" description="Each portal app uses the same nav structure with tab switching:">
                  <CodeSnippet code={`function Nav({ activeView, setActiveView }) {
  const views = ["feed", "create", "library", "settings"];
  return (
    <nav style={{ padding: "0 16px", height: 48, ... }}>
      <div>{/* Logo + title */}</div>
      <div style={{ display: "flex", gap: 2 }}>
        {views.map((v) => (
          <button key={v}
            onClick={() => setActiveView(v)}
            style={{
              fontFamily: T.font.mono, fontSize: 9,
              color: activeView === v ? "#f5f5f5" : "#404040",
              background: activeView === v ? "#1a1a1a" : "transparent",
              ...
            }}>
            {v}
          </button>
        ))}
      </div>
    </nav>
  );
}`} />
                </DocBlock>
              </div>
            )}

            {/* ═══ RULES ═══ */}
            {activeSection === "rules" && (
              <div>
                <Section id="do">
                  <SectionLabel>Rules</SectionLabel>
                  <SectionTitle>Do and Don't.</SectionTitle>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    <Card style={{ padding: 22 }}>
                      <div style={{ fontFamily: T.font.headline, fontSize: 18, fontWeight: 700, color: T.text.primary, marginBottom: 14 }}>Do</div>
                      {[
                        "Text is grayscale only (#f5f5f5 → #262626)",
                        "Colors on bars, dots, dividers — never text",
                        "JetBrains Mono for all data, labels, code, badges",
                        "Space Grotesk 700 for headlines only",
                        "Inter for body, buttons, descriptions",
                        "Cards: #131313 bg, #1a1a1a border, 10-14px radius",
                        "1px gradient bar between major sections",
                        "maxWidth: 720px centered on every page",
                        "Nav: 52px height, spectrum mark, hamburger at 560px",
                        "Section labels: mono 10-11px uppercase #525252",
                      ].map((r, i) => (
                        <div key={i} style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, lineHeight: 2.2, display: "flex", gap: 8 }}>
                          <span style={{ color: T.text.tertiary, flexShrink: 0 }}>✓</span> {r}
                        </div>
                      ))}
                    </Card>

                    <Card style={{ padding: 22 }}>
                      <div style={{ fontFamily: T.font.headline, fontSize: 18, fontWeight: 700, color: T.text.primary, marginBottom: 14 }}>Don't</div>
                      {[
                        "Never color text — no orange, pink, purple, blue text",
                        "No gradient text (WebkitTextFillColor)",
                        "No gray hex on text except the 8 approved values",
                        "No border-radius > 14px on cards",
                        "No system fonts — Arial, Helvetica, system-ui",
                        "No drop shadows on anything",
                        "No more than 2 accent colors per component",
                        "No colored backgrounds on buttons (grayscale only)",
                        "No visible focus rings (use border-color change)",
                        "No emoji in professional contexts (only in content)",
                      ].map((r, i) => (
                        <div key={i} style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, lineHeight: 2.2, display: "flex", gap: 8 }}>
                          <span style={{ color: T.text.faint, flexShrink: 0 }}>✕</span> {r}
                        </div>
                      ))}
                    </Card>
                  </div>
                </Section>

                <GradientBar />

                <Section id="checklist">
                  <SectionLabel>Preflight Checklist</SectionLabel>
                  <SectionTitle>Before shipping any page.</SectionTitle>
                  <Card>
                    {[
                      "Google Fonts import includes Space Grotesk, Inter, JetBrains Mono",
                      "Page background is #0a0a0a",
                      "overflow-x: hidden on html and body",
                      "GradientBar at the very top of the page",
                      "Nav height is 52px with spectrum mark",
                      "Content maxWidth is 720px (or 960 for dashboard grids)",
                      "All text colors are from the 8-value grayscale hierarchy",
                      "No colored text anywhere in the UI",
                      "Section labels are JetBrains Mono 10-11px uppercase #525252",
                      "Cards use #131313 bg, #1a1a1a border, 10-14px radius",
                      "Buttons use Inter, 7px radius, grayscale only",
                      "Mobile: test at 375px width, no horizontal overflow",
                      "Scrollbar styled (5px width, #262626 thumb, #0a0a0a track)",
                      "input::placeholder color is #333",
                      "Footer has gradient bar separator",
                    ].map((item, i) => (
                      <ListRow key={i} divider={i < 14}
                        left={
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.ghost, flexShrink: 0, width: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                            <span style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>{item}</span>
                          </div>
                        }
                      />
                    ))}
                  </Card>
                </Section>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
