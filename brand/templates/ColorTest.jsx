import { useState } from "react";

const colors = [
  { hex: "#FF6B2B", name: "Orange", role: "Primary · Road Glow" },
  { hex: "#FF2255", name: "Red", role: "Danger · Critical" },
  { hex: "#CC00AA", name: "Magenta", role: "Gradient Mid · Accent" },
  { hex: "#8844FF", name: "Purple", role: "Governance · Accent" },
  { hex: "#4488FF", name: "Blue", role: "Links · Info" },
  { hex: "#00D4FF", name: "Cyan", role: "Secondary · City Lights" },
];

const GRAD = `linear-gradient(90deg, ${colors.map(c => c.hex).join(", ")})`;
const bg = "#0a0a1a";
const bgCard = "#10102a";
const border = "rgba(100,140,255,0.08)";
const text = "#e8e8f0";
const textDim = "rgba(200,210,240,0.4)";
const textMute = "rgba(160,170,210,0.2)";
const font = { headline: "'Space Grotesk', sans-serif", mono: "'JetBrains Mono', monospace" };

export default function ColorTest() {
  const [copied, setCopied] = useState(null);
  const copy = (hex, i) => { navigator.clipboard?.writeText(hex); setCopied(i); setTimeout(() => setCopied(null), 1200); };

  return (
    <div style={{ background: bg, color: text, minHeight: "100vh", fontFamily: font.mono, padding: 0 }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes glow-pulse{0%,100%{opacity:0.5}50%{opacity:1}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>

      {/* Gradient bar */}
      <div style={{ height: 4, background: GRAD, boxShadow: "0 0 30px rgba(255,107,43,0.2), 0 0 80px rgba(0,212,255,0.08)" }} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ padding: "56px 0 40px", borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: "0.5rem", color: colors[0].hex, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16, textShadow: `0 0 12px ${colors[0].hex}40` }}>
            BlackRoad OS · Neon Noir v2.0
          </div>
          <h1 style={{ fontFamily: font.headline, fontSize: "clamp(2.2rem, 7vw, 3.4rem)", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em", margin: 0 }}>
            Color System
          </h1>
          <div style={{ height: 2, background: GRAD, width: 120, margin: "24px 0 0", boxShadow: "0 0 20px rgba(255,107,43,0.15)" }} />
        </div>

        {/* Full gradient strip */}
        <div style={{ padding: "32px 0", borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: "0.42rem", color: textMute, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
            Signature Gradient
          </div>
          <div style={{ height: 56, background: GRAD, boxShadow: "0 0 40px rgba(255,107,43,0.15), 0 0 80px rgba(0,212,255,0.08)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {colors.map((c, i) => (
              <span key={i} style={{ fontSize: "0.38rem", color: c.hex, textShadow: `0 0 6px ${c.hex}30` }}>{c.hex}</span>
            ))}
          </div>
        </div>

        {/* Large swatches */}
        <div style={{ padding: "32px 0", borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: "0.42rem", color: textMute, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
            Accent Palette · Click to copy
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {colors.map((c, i) => (
              <div key={i} onClick={() => copy(c.hex, i)} style={{ cursor: "pointer" }}>
                <div style={{
                  height: 100, background: c.hex,
                  boxShadow: `0 0 24px ${c.hex}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  {copied === i ? (
                    <span style={{ fontSize: "0.5rem", color: bg, fontWeight: 700, letterSpacing: "0.15em" }}>COPIED</span>
                  ) : (
                    <span style={{ fontSize: "1.4rem", fontFamily: font.headline, fontWeight: 700, color: bg, opacity: 0.3 }}>{c.name.charAt(0)}</span>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.hex, boxShadow: `0 0 8px ${c.hex}60` }} />
                    <span style={{ fontSize: "0.52rem", fontWeight: 700, color: c.hex, textShadow: `0 0 8px ${c.hex}30` }}>{c.name}</span>
                  </div>
                  <div style={{ fontSize: "0.42rem", color: textMute, marginTop: 2 }}>{c.hex}</div>
                  <div style={{ fontSize: "0.4rem", color: textDim, marginTop: 1 }}>{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Glow dots */}
        <div style={{ padding: "32px 0", borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: "0.42rem", color: textMute, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
            Glow System
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 0" }}>
            {colors.map((c, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: c.hex,
                  boxShadow: `0 0 20px ${c.hex}70, 0 0 50px ${c.hex}25`,
                  animation: "glow-pulse 2.5s ease-in-out infinite",
                  animationDelay: `${i * 0.4}s`,
                }} />
                <span style={{ fontSize: "0.4rem", color: c.hex, fontWeight: 700, textShadow: `0 0 8px ${c.hex}40` }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* On dark backgrounds */}
        <div style={{ padding: "32px 0", borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: "0.42rem", color: textMute, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
            Text on Background
          </div>
          {colors.map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "12px 0",
              borderBottom: `1px solid ${border}`,
            }}>
              <div style={{ width: 10, height: 10, background: c.hex, boxShadow: `0 0 8px ${c.hex}50`, flexShrink: 0 }} />
              <span style={{ fontFamily: font.headline, fontSize: "1.1rem", fontWeight: 700, color: c.hex, textShadow: `0 0 10px ${c.hex}30`, flex: 1 }}>
                {c.name}
              </span>
              <span style={{ fontSize: "0.46rem", color: c.hex, opacity: 0.6 }}>{c.hex}</span>
              <span style={{
                fontSize: "0.42rem", fontWeight: 700, padding: "2px 8px",
                border: `1px solid ${c.hex}60`, color: c.hex,
                letterSpacing: "0.1em", fontFamily: font.mono,
                textShadow: `0 0 6px ${c.hex}30`, background: `${c.hex}08`,
              }}>BADGE</span>
            </div>
          ))}
        </div>

        {/* On color backgrounds */}
        <div style={{ padding: "32px 0", borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: "0.42rem", color: textMute, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
            Cards with Color Accents
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {colors.map((c, i) => (
              <div key={i} style={{
                background: bgCard, border: `1px solid ${border}`, padding: "18px 16px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ height: 2, background: c.hex, position: "absolute", top: 0, left: 0, right: 0, boxShadow: `0 0 12px ${c.hex}60` }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.hex, boxShadow: `0 0 8px ${c.hex}60`, animation: "glow-pulse 2s ease-in-out infinite", animationDelay: `${i * 0.3}s` }} />
                  <span style={{ fontSize: "0.52rem", fontWeight: 700 }}>{c.name}</span>
                </div>
                <div style={{ fontSize: "0.44rem", color: textDim, lineHeight: 1.7, marginBottom: 10 }}>{c.role}</div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ height: "100%", width: `${30 + i * 12}%`, background: c.hex, boxShadow: `0 0 6px ${c.hex}40` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient combos */}
        <div style={{ padding: "32px 0", borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: "0.42rem", color: textMute, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
            Gradient Variations
          </div>
          {[
            { label: "Full Spectrum", grad: GRAD },
            { label: "Warm (Orange → Magenta)", grad: `linear-gradient(90deg, ${colors[0].hex}, ${colors[1].hex}, ${colors[2].hex})` },
            { label: "Cool (Purple → Cyan)", grad: `linear-gradient(90deg, ${colors[3].hex}, ${colors[4].hex}, ${colors[5].hex})` },
            { label: "Fire (Orange → Red)", grad: `linear-gradient(90deg, ${colors[0].hex}, ${colors[1].hex})` },
            { label: "Electric (Blue → Cyan)", grad: `linear-gradient(90deg, ${colors[4].hex}, ${colors[5].hex})` },
            { label: "Violet (Red → Purple)", grad: `linear-gradient(90deg, ${colors[1].hex}, ${colors[2].hex}, ${colors[3].hex})` },
          ].map((g, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ height: 28, background: g.grad, boxShadow: `0 0 16px rgba(255,107,43,0.08)` }} />
              <div style={{ fontSize: "0.42rem", color: textDim, marginTop: 4 }}>{g.label}</div>
            </div>
          ))}
        </div>

        {/* CSS export */}
        <div style={{ padding: "32px 0 48px" }}>
          <div style={{ fontSize: "0.42rem", color: textMute, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
            CSS Variables
          </div>
          <div style={{ background: "#08081a", border: `1px solid ${border}`, padding: "20px 24px" }}>
            <pre style={{ fontFamily: font.mono, fontSize: "0.48rem", lineHeight: 2, margin: 0, color: textDim }}>{
`:root {
  /* Backgrounds */
  --br-bg:       #0a0a1a;
  --br-bg-card:  #10102a;
  --br-bg-code:  #08081a;
  --br-bg-hover: #16163a;

  /* Borders */
  --br-border:     rgba(100,140,255,0.08);
  --br-border-lit: rgba(255,100,40,0.2);

  /* Text */
  --br-text:      #e8e8f0;
  --br-text-dim:  rgba(200,210,240,0.4);
  --br-text-mute: rgba(160,170,210,0.2);

  /* Accent Palette */
  --br-orange:  #FF6B2B;   /* Primary · Road Glow */
  --br-red:     #FF2255;   /* Danger · Critical */
  --br-magenta: #CC00AA;   /* Gradient Mid */
  --br-purple:  #8844FF;   /* Governance · Accent */
  --br-blue:    #4488FF;   /* Links · Info */
  --br-cyan:    #00D4FF;   /* Secondary · City Lights */

  /* Extended */
  --br-green:   #00CC88;   /* Success */
  --br-yellow:  #FFAA00;   /* Warning */
  --br-pink:    #FF44AA;   /* Highlight */

  /* Gradient */
  --br-gradient: linear-gradient(
    90deg,
    #FF6B2B, #FF2255, #CC00AA,
    #8844FF, #4488FF, #00D4FF
  );
}`
            }</pre>
          </div>
        </div>

      </div>
      <div style={{ height: 4, background: GRAD, boxShadow: "0 0 30px rgba(255,107,43,0.2), 0 0 80px rgba(0,212,255,0.08)" }} />
    </div>
  );
}
