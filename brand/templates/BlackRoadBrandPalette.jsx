import { useState } from "react";

const chromaticStops = [
{ name: "Ember",   hex: "#FF6B2B", label: "Warm anchor" },
{ name: "Flare",   hex: "#FF2255", label: "Hot energy" },
{ name: "Magenta", hex: "#CC00AA", label: "Bold pivot" },
{ name: "Orchid",  hex: "#8844FF", label: "Depth" },
{ name: "Arc",     hex: "#4488FF", label: "Cool tension" },
{ name: "Cyan",    hex: "#00D4FF", label: "Cool edge" },
];

const gradients = [
{
name: "Full Spectrum",
desc: "All six stops, warm to cool",
css: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)",
},
{
name: "Warm → Cool",
desc: "Orange through orchid to blue",
css: "linear-gradient(90deg, #FF6B2B, #FF2255, #8844FF, #4488FF)",
},
{
name: "Fire",
desc: "Ember to Flare",
css: "linear-gradient(90deg, #FF6B2B, #FF2255)",
},
{
name: "Violet Shift",
desc: "Magenta through Orchid",
css: "linear-gradient(90deg, #CC00AA, #8844FF)",
},
{
name: "Arc Light",
desc: "Arc to Cyan",
css: "linear-gradient(90deg, #4488FF, #00D4FF)",
},
];

const grayscale = [
{ name: "950", hex: "#0a0a0a", label: "Deep Black" },
{ name: "900", hex: "#171717", label: "Surface" },
{ name: "800", hex: "#262626", label: "Card" },
{ name: "700", hex: "#404040", label: "Border Active" },
{ name: "500", hex: "#737373", label: "Placeholder" },
{ name: "300", hex: "#d4d4d4", label: "Label" },
{ name: "100", hex: "#f5f5f5", label: "Foreground" },
];

function ColorSwatch({ color }) {
const [copied, setCopied] = useState(false);
const copy = () => {
navigator.clipboard?.writeText(color.hex);
setCopied(true);
setTimeout(() => setCopied(false), 1200);
};
return (
<div onClick={copy} style={{ cursor: "pointer", marginBottom: 12 }}>
<div style={{ width: "100%", height: 80, borderRadius: 12, background: color.hex, marginBottom: 8 }} />
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
<span style={{ color: "#f5f5f5", fontSize: 15, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{color.name}</span>
<span style={{ color: copied ? "#00D4FF" : "#525252", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}>
{copied ? "copied!" : color.hex}
</span>
</div>
<div style={{ color: "#525252", fontSize: 11, fontFamily: "Inter, sans-serif", marginTop: 2 }}>{color.label}</div>
</div>
);
}

function GraySwatch({ color }) {
const [copied, setCopied] = useState(false);
const copy = () => {
navigator.clipboard?.writeText(color.hex);
setCopied(true);
setTimeout(() => setCopied(false), 1200);
};
return (
<div onClick={copy} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
<div style={{ width: 40, height: 40, borderRadius: 8, background: color.hex, border: "1px solid #333", flexShrink: 0 }} />
<div style={{ flex: 1 }}>
<div style={{ color: "#d4d4d4", fontSize: 13, fontFamily: "Inter, sans-serif", fontWeight: 500 }}>{color.label}</div>
<div style={{ color: "#525252", fontSize: 11, fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>{color.hex}</div>
</div>
<div style={{ color: copied ? "#00D4FF" : "#404040", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
{copied ? "copied" : `—${color.name}`}
</div>
</div>
);
}

function GradientCard({ g }) {
const [copied, setCopied] = useState(false);
const copy = () => {
navigator.clipboard?.writeText(g.css);
setCopied(true);
setTimeout(() => setCopied(false), 1400);
};
return (
<div onClick={copy} style={{ cursor: "pointer", marginBottom: 20 }}>
<div style={{ width: "100%", height: 72, borderRadius: 12, background: g.css, marginBottom: 8 }} />
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
<span style={{ color: "#f5f5f5", fontSize: 14, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{g.name}</span>
<span style={{ color: copied ? "#00D4FF" : "#525252", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
{copied ? "copied css" : "tap to copy"}
</span>
</div>
<div style={{ color: "#525252", fontSize: 11, fontFamily: "Inter, sans-serif", marginTop: 2 }}>{g.desc}</div>
</div>
);
}

function Section({ title, children, sub }) {
return (
<div style={{ marginBottom: 40 }}>
<div style={{ color: "#404040", fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: sub ? 8 : 16 }}>
{title}
</div>
{sub && <div style={{ color: "#525252", fontSize: 12, marginBottom: 16 }}>{sub}</div>}
{children}
</div>
);
}

export default function BrandPalette() {
return (
<div style={{ background: "#0a0a0a", minHeight: "100vh", padding: "40px 20px 60px", maxWidth: 430, margin: "0 auto" }}>
{/* Header */}
<div style={{ marginBottom: 48 }}>
<div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#404040", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
BlackRoad · Brand System
</div>
<div style={{ fontSize: 36, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 6 }}>
Six chromatic stops.
</div>
<div style={{ color: "#525252", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
From warm Ember through cool Cyan. Tap any swatch to copy.
</div>
<div style={{ marginTop: 20, height: 4, borderRadius: 99, background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }} />
</div>

  <Section title="Chromatic Stops">
    {chromaticStops.map(c => <ColorSwatch key={c.hex} color={c} />)}
  </Section>

  <Section title="Gradient Combinations" sub="For backgrounds, borders, and emphasis elements. Click to copy.">
    {gradients.map(g => <GradientCard key={g.name} g={g} />)}
  </Section>

  <Section title="Grayscale">
    {grayscale.map(c => <GraySwatch key={c.hex} color={c} />)}
  </Section>

  <div style={{ color: "#262626", fontSize: 10, fontFamily: "JetBrains Mono, monospace", textAlign: "center", paddingTop: 8 }}>
    blackroad.io
  </div>
</div>
);
}
