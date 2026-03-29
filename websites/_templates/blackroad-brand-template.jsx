import { useEffect } from "react";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";

function injectFonts() {
  if (!document.querySelector(`link[href="${FONTS_URL}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_URL;
    document.head.appendChild(link);
  }
}

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg:        "#0a0a1a",
  card:      "#10102a",
  hover:     "#16163a",
  code:      "#08081a",
  text:      "#e8e8f0",
  muted:     "rgba(232,232,240,0.45)",
  border:    "rgba(100,140,255,0.08)",
  borderAct: "rgba(255,100,40,0.2)",

  ember:  "#FF6B2B",
  fuse:   "#FF2255",
  pulse:  "#CC00AA",
  drift:  "#8844FF",
  signal: "#4488FF",
  arc:    "#00D4FF",

  fontHead: "'Space Grotesk', sans-serif",
  fontBody: "'Inter', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const glow = (color, spread = 18) =>
  `0 0 ${spread}px ${color}66, 0 0 ${spread * 2}px ${color}22`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function LogoMark({ size = 32 }) {
  const colors = [T.ember, T.fuse, T.pulse, T.drift, T.signal, T.arc];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {colors.map((c, i) => (
        <rect
          key={i}
          x={i * 4 + 4}
          y={16 - (i + 1) * 2}
          width={3}
          height={(i + 1) * 4}
          fill={c}
          opacity={0.9}
          style={{ filter: `drop-shadow(0 0 4px ${c})` }}
        />
      ))}
    </svg>
  );
}

function GradientBar() {
  return (
    <div style={{
      height: 2,
      background: `linear-gradient(90deg, ${T.ember}, ${T.fuse}, ${T.pulse}, ${T.drift}, ${T.signal}, ${T.arc})`,
      boxShadow: `0 0 12px ${T.signal}44`,
    }} />
  );
}

function Tag({ color, children }) {
  return (
    <span style={{
      fontFamily: T.fontMono,
      fontSize: 11,
      fontWeight: 500,
      color,
      background: color + "18",
      border: `1px solid ${color}44`,
      boxShadow: glow(color, 6),
      padding: "2px 8px",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
}

function ColorSwatch({ label, hex, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <div style={{
        width: 48,
        height: 48,
        background: hex,
        boxShadow: accent ? glow(hex) : "none",
        border: `1px solid ${hex}44`,
      }} />
      <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted }}>{label}</span>
      <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.text }}>{hex}</span>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          fontFamily: T.fontMono,
          fontSize: 11,
          color: T.arc,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}>
          {label}
        </span>
        <div style={{ flex: 1, height: 1, background: T.border }} />
      </div>
      {children}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      padding: "24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Main Template ─────────────────────────────────────────────────────────

export default function BrandTemplate() {
  useEffect(() => { injectFonts(); }, []);

  const accents = [
    { label: "Ember",  hex: T.ember  },
    { label: "Fuse",   hex: T.fuse   },
    { label: "Pulse",  hex: T.pulse  },
    { label: "Drift",  hex: T.drift  },
    { label: "Signal", hex: T.signal },
    { label: "Arc",    hex: T.arc    },
  ];

  const grays = [
    { label: "BG",    hex: "#0a0a1a" },
    { label: "Card",  hex: "#10102a" },
    { label: "Hover", hex: "#16163a" },
    { label: "Code",  hex: "#08081a" },
    { label: "Text",  hex: "#e8e8f0" },
  ];

  return (
    <div style={{
      background: T.bg,
      color: T.text,
      fontFamily: T.fontBody,
      minHeight: "100vh",
      padding: "48px 40px",
      maxWidth: 900,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 48,
      overflowX: "hidden",
    }}>

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LogoMark size={36} />
          <span style={{
            fontFamily: T.fontHead,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "-0.02em",
            color: T.text,
          }}>
            BlackRoad OS
          </span>
          <Tag color={T.arc}>Brand Kit</Tag>
        </div>
        <GradientBar />
        <p style={{ fontFamily: T.fontBody, fontSize: 14, color: T.muted, maxWidth: 480 }}>
          Minimal design system reference — Neon Noir v2. Deep space navy base with a
          6-stop accent spectrum. Grayscale builds structure; color carries meaning.
        </p>
      </div>

      {/* Colors */}
      <Section label="Accent Spectrum">
        <Card>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {accents.map(a => <ColorSwatch key={a.label} label={a.label} hex={a.hex} accent />)}
          </div>
        </Card>
      </Section>

      <Section label="Surface Palette">
        <Card>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {grays.map(g => <ColorSwatch key={g.label} label={g.label} hex={g.hex} />)}
          </div>
        </Card>
      </Section>

      {/* Typography */}
      <Section label="Typography">
        <Card style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, marginBottom: 6, letterSpacing: "0.1em" }}>SPACE GROTESK 700 — DISPLAY</div>
            <div style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 42, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Build the Road.
            </div>
          </div>
          <div style={{ height: 1, background: T.border }} />
          <div>
            <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, marginBottom: 6, letterSpacing: "0.1em" }}>INTER 400 / 600 — BODY</div>
            <p style={{ fontFamily: T.fontBody, fontSize: 16, color: T.text, lineHeight: 1.7, maxWidth: 520 }}>
              BlackRoad OS is a large-scale distributed AI operating system. Every agent, every signal, every transaction runs on infrastructure designed for the next era of computing.
            </p>
          </div>
          <div style={{ height: 1, background: T.border }} />
          <div>
            <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, marginBottom: 6, letterSpacing: "0.1em" }}>JETBRAINS MONO — CODE / DATA</div>
            <code style={{ fontFamily: T.fontMono, fontSize: 13, color: T.arc, background: T.code, padding: "12px 16px", display: "block" }}>
              Z := yx − w &nbsp;·&nbsp; K(t) = C·e^λ|δ| &nbsp;·&nbsp; RC:4200
            </code>
          </div>
        </Card>
      </Section>

      {/* UI Elements */}
      <Section label="UI Elements">
        <Card style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button style={{
              fontFamily: T.fontBody, fontSize: 14, fontWeight: 600,
              background: T.text, color: T.bg, border: "none",
              padding: "10px 22px", cursor: "pointer",
            }}>Primary</button>
            <button style={{
              fontFamily: T.fontBody, fontSize: 14, fontWeight: 500,
              background: "transparent", color: T.text,
              border: `1px solid rgba(232,232,240,0.2)`,
              padding: "10px 22px", cursor: "pointer",
            }}>Secondary</button>
            <button style={{
              fontFamily: T.fontMono, fontSize: 12,
              background: T.ember + "18", color: T.ember,
              border: `1px solid ${T.ember}44`,
              boxShadow: glow(T.ember, 8),
              padding: "9px 20px", cursor: "pointer",
            }}>Accent / CTA</button>
          </div>

          <div style={{ height: 1, background: T.border }} />

          {/* Tags */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              [T.arc,    "agent:online"],
              [T.ember,  "priority:high"],
              [T.fuse,   "status:error"],
              [T.pulse,  "type:governance"],
              [T.drift,  "chain:roadchain"],
              [T.signal, "rc:4200"],
            ].map(([c, l]) => <Tag key={l} color={c}>{l}</Tag>)}
          </div>

          <div style={{ height: 1, background: T.border }} />

          {/* Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 360 }}>
            <label style={{ fontFamily: T.fontMono, fontSize: 11, color: T.muted, letterSpacing: "0.08em" }}>AGENT ID</label>
            <input
              placeholder="lucidia.001"
              readOnly
              style={{
                fontFamily: T.fontMono, fontSize: 13,
                background: T.code, color: T.text,
                border: `1px solid ${T.border}`,
                padding: "12px 16px", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
            />
          </div>
        </Card>
      </Section>

      {/* Gradient bar footer */}
      <GradientBar />
      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, letterSpacing: "0.12em", textAlign: "center" }}>
        BLACKROAD OS INC. · NEON NOIR v2 · DESIGN SYSTEM
      </div>
    </div>
  );
}
