import { useState, useEffect, useRef } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;
const T = {
  text: { primary: "#f5f5f5", secondary: "#d4d4d4", tertiary: "#a3a3a3", muted: "#737373", dim: "#525252", faint: "#404040", ghost: "#333", invisible: "#262626" },
  bg: { page: "#0a0a0a", card: "#131313", inset: "#0f0f0f" },
  border: { card: "#1a1a1a", subtle: "#141414" },
  font: { headline: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
};

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function CodeSnippet({ code, lang = "css" }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background: T.bg.page, border: `1px solid ${T.border.card}`, borderRadius: 8, overflow: "hidden", marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 14px", borderBottom: `1px solid ${T.border.subtle}` }}>
        <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{lang}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); }} style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint, background: "none", border: `1px solid ${T.border.card}`, padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ fontFamily: T.font.mono, fontSize: 11, lineHeight: 1.7, color: T.text.tertiary, padding: "12px 14px", margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{code}</pre>
    </div>
  );
}

// ─────────────────────────────────────────
// ANIMATION DEMOS
// ─────────────────────────────────────────

function AnimDemo({ name, num, description, timing, children, code }) {
  const [showCode, setShowCode] = useState(false);
  return (
    <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        {/* Preview */}
        <div style={{
          width: 56, height: 56, borderRadius: 10, background: T.bg.page,
          border: `1px solid ${T.border.card}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, overflow: "hidden",
        }}>
          {children}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{num}</span>
            <span style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary }}>{name}</span>
          </div>
          <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, marginBottom: 4 }}>{description}</div>
          <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{timing}</div>
        </div>

        {/* Toggle code */}
        <button onClick={() => setShowCode(!showCode)} style={{
          fontFamily: T.font.mono, fontSize: 10, color: T.text.faint,
          background: "none", border: `1px solid ${T.border.card}`, borderRadius: 5,
          padding: "4px 12px", cursor: "pointer", flexShrink: 0,
        }}>
          {showCode ? "hide" : "code"}
        </button>
      </div>

      {showCode && (
        <div style={{ padding: "0 20px 18px" }}>
          <CodeSnippet code={code} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// INTERACTIVE DEMOS
// ─────────────────────────────────────────

function StaggerDemo() {
  const [trigger, setTrigger] = useState(0);
  const items = ["Agents", "Memory", "Governance", "Mesh", "Ledger"];
  return (
    <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary, marginBottom: 2 }}>Staggered Reveal</div>
          <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Items fade and slide in with increasing delay. The signature page-load feel.</div>
        </div>
        <button onClick={() => setTrigger((t) => t + 1)} style={{
          fontFamily: T.font.mono, fontSize: 10, color: T.text.faint,
          background: "none", border: `1px solid ${T.border.card}`, borderRadius: 5,
          padding: "6px 14px", cursor: "pointer",
        }}>
          Replay
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }} key={trigger}>
        {items.map((item, i) => (
          <div key={item} style={{
            background: T.bg.inset, border: `1px solid ${T.border.subtle}`, borderRadius: 8,
            padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
            animation: `stagger-in 0.5s ease ${i * 0.08}s both`,
          }}>
            <div style={{ width: 4, height: 14, borderRadius: 1, background: COLORS[i] }} />
            <span style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.secondary }}>{item}</span>
          </div>
        ))}
      </div>
      <CodeSnippet lang="css" code={`@keyframes stagger-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Apply with increasing delay */
.item:nth-child(1) { animation-delay: 0s; }
.item:nth-child(2) { animation-delay: 0.08s; }
.item:nth-child(3) { animation-delay: 0.16s; }
/* ...or use inline: delay: \${i * 0.08}s */`} />
    </div>
  );
}

function HoverDemo() {
  const cards = [
    { label: "Border lift", id: "border" },
    { label: "Scale up", id: "scale" },
    { label: "Glow accent", id: "glow" },
    { label: "Slide arrow", id: "arrow" },
  ];
  return (
    <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 22 }}>
      <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Hover States</div>
      <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, marginBottom: 16 }}>Four approved hover patterns. Hover each card to see the effect.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
        {cards.map((c) => (
          <div key={c.id} className={`hover-demo-${c.id}`} style={{
            background: T.bg.inset, border: `1px solid ${T.border.card}`, borderRadius: 10,
            padding: 18, textAlign: "center", cursor: "pointer",
            transition: "all 0.2s ease", position: "relative", overflow: "hidden",
          }}>
            <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.tertiary }}>{c.label}</div>
          </div>
        ))}
      </div>
      <CodeSnippet code={`/* Border lift — most common */
transition: border-color 0.2s ease;
&:hover { border-color: #262626; }

/* Scale — for clickable cards */
transition: transform 0.2s ease;
&:hover { transform: scale(1.02); }

/* Subtle opacity on buttons */
button:hover { opacity: 0.88; }`} />
    </div>
  );
}

function LoadingDemo() {
  return (
    <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 22 }}>
      <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Loading States</div>
      <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, marginBottom: 16 }}>Three loading patterns: spectrum pulse, skeleton shimmer, and dots.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {/* Spectrum pulse */}
        <div style={{ background: T.bg.inset, borderRadius: 10, padding: 20, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 10 }}>
            {COLORS.map((c, i) => (
              <div key={c} style={{
                width: 4, height: 18, borderRadius: 2, background: c,
                animation: `loading-pulse 1.2s ease-in-out ${i * 0.1}s infinite`,
              }} />
            ))}
          </div>
          <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>Spectrum Pulse</div>
        </div>

        {/* Skeleton shimmer */}
        <div style={{ background: T.bg.inset, borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 10, borderRadius: 3, background: T.border.card, animation: "skeleton-shimmer 1.5s ease-in-out infinite", width: "80%" }} />
            <div style={{ height: 10, borderRadius: 3, background: T.border.card, animation: "skeleton-shimmer 1.5s ease-in-out 0.15s infinite", width: "100%" }} />
            <div style={{ height: 10, borderRadius: 3, background: T.border.card, animation: "skeleton-shimmer 1.5s ease-in-out 0.3s infinite", width: "60%" }} />
          </div>
          <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, marginTop: 10, textAlign: "center" }}>Skeleton</div>
        </div>

        {/* Typing dots */}
        <div style={{ background: T.bg.inset, borderRadius: 10, padding: 20, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 10, height: 18, alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%", background: T.text.faint,
                animation: `typing-bounce 1s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
          <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>Typing Dots</div>
        </div>
      </div>

      <CodeSnippet code={`/* Spectrum pulse */
@keyframes loading-pulse {
  0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
  50%      { opacity: 1;   transform: scaleY(1); }
}

/* Skeleton shimmer */
@keyframes skeleton-shimmer {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 0.6; }
}

/* Typing dots */
@keyframes typing-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}`} />
    </div>
  );
}

function TransitionDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Overview", "Agents", "Mesh"];
  return (
    <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 22 }}>
      <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Tab Transitions</div>
      <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, marginBottom: 16 }}>Content fades between tab switches. The tab indicator slides.</div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, background: T.bg.inset, borderRadius: 8, padding: 3, marginBottom: 16, position: "relative" }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{
            flex: 1, fontFamily: T.font.mono, fontSize: 11,
            color: activeTab === i ? T.text.primary : T.text.faint,
            background: activeTab === i ? T.border.card : "transparent",
            border: "none", borderRadius: 6, padding: "8px 0", cursor: "pointer",
            transition: "all 0.2s ease",
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div key={activeTab} style={{ animation: "tab-fade 0.25s ease", minHeight: 60 }}>
        <div style={{ background: T.bg.inset, borderRadius: 8, padding: 16 }}>
          <div style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.tertiary }}>
            {activeTab === 0 && "Overview content fades in. The transition is 250ms ease — fast enough to feel instant, slow enough to feel smooth."}
            {activeTab === 1 && "Agent list content. Same fade. Every tab switch uses the same animation — consistency builds trust."}
            {activeTab === 2 && "Mesh status. Notice the tab background slides via CSS transition, not animation. Two different techniques working together."}
          </div>
        </div>
      </div>

      <CodeSnippet code={`/* Tab content fade */
@keyframes tab-fade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Apply with key={activeTab} to retrigger */
<div key={activeTab} style={{ animation: "tab-fade 0.25s ease" }}>

/* Tab button transition (not animation) */
transition: all 0.2s ease;`} />
    </div>
  );
}

function WaveformDemo() {
  const [playing, setPlaying] = useState(false);
  const bars = 40;
  return (
    <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary, marginBottom: 2 }}>Audio Waveform</div>
          <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Used in SoundRoad. Static when paused, animated when playing.</div>
        </div>
        <button onClick={() => setPlaying(!playing)} style={{
          width: 36, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
          background: playing ? T.text.primary : T.border.card,
          color: playing ? T.bg.page : T.text.primary,
          fontFamily: T.font.mono, fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {playing ? "❚❚" : "▶"}
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 1, height: 48, background: T.bg.inset, borderRadius: 8, padding: "0 12px" }}>
        {Array.from({ length: bars }).map((_, i) => {
          const h = Math.sin(i * 0.4) * 0.3 + Math.random() * 0.4 + 0.2;
          return (
            <div key={i} style={{
              width: 2, borderRadius: 1, flexShrink: 0,
              height: `${h * 100}%`,
              background: playing ? COLORS[i % COLORS.length] : T.text.ghost,
              opacity: playing ? 0.7 : 0.3,
              animation: playing ? `waveform-bar 0.8s ease-in-out ${i * 0.03}s infinite alternate` : "none",
              transition: "background 0.3s ease, opacity 0.3s ease",
            }} />
          );
        })}
      </div>
      <CodeSnippet code={`@keyframes waveform-bar {
  from { transform: scaleY(0.3); }
  to   { transform: scaleY(1); }
}

/* Each bar gets staggered delay */
style={{
  animation: playing
    ? \`waveform-bar 0.8s ease-in-out \${i * 0.03}s infinite alternate\`
    : "none",
}}`} />
    </div>
  );
}

function CountUpDemo() {
  const [trigger, setTrigger] = useState(0);
  const [values, setValues] = useState([0, 0, 0]);
  const targets = [847, 99.97, 22];
  const labels = ["Agents", "Uptime %", "Latency ms"];

  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValues(targets.map((t) => Number((t * eased).toFixed(t % 1 ? 2 : 0))));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [trigger]);

  return (
    <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary, marginBottom: 2 }}>Count Up</div>
          <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Numbers animate from 0 to target with eased-out cubic timing.</div>
        </div>
        <button onClick={() => { setValues([0, 0, 0]); setTrigger((t) => t + 1); }} style={{
          fontFamily: T.font.mono, fontSize: 10, color: T.text.faint,
          background: "none", border: `1px solid ${T.border.card}`, borderRadius: 5,
          padding: "6px 14px", cursor: "pointer",
        }}>
          Replay
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: T.border.card, borderRadius: 10, overflow: "hidden" }}>
        {values.map((v, i) => (
          <div key={i} style={{ background: T.bg.inset, padding: "16px 14px", textAlign: "center" }}>
            <div style={{ fontFamily: T.font.headline, fontSize: 28, fontWeight: 700, color: T.text.primary, fontVariantNumeric: "tabular-nums" }}>{v}</div>
            <div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.faint, textTransform: "uppercase", marginTop: 4 }}>{labels[i]}</div>
          </div>
        ))}
      </div>
      <CodeSnippet lang="jsx" code={`// Count-up with eased cubic
const eased = 1 - Math.pow(1 - progress, 3);
setValues(targets.map(t => t * eased));

// Use fontVariantNumeric: "tabular-nums"
// to prevent layout shift during counting`} />
    </div>
  );
}

function ProgressDemo() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setProgress((p) => p >= 100 ? 0 : p + 1), 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 22 }}>
      <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Animated Progress</div>
      <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, marginBottom: 16 }}>Smooth fill with CSS transition. Loops for demo.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Standard */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>Standard</span>
            <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint }}>{progress}%</span>
          </div>
          <div style={{ width: "100%", height: 4, background: T.border.card, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: T.text.faint, borderRadius: 2, transition: "width 0.04s linear" }} />
          </div>
        </div>

        {/* Gradient */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>Gradient (rare, special use)</span>
            <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint }}>{progress}%</span>
          </div>
          <div style={{ width: "100%", height: 6, background: T.border.card, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: GRADIENT, borderRadius: 3, transition: "width 0.04s linear" }} />
          </div>
        </div>

        {/* Thick with label */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>Goal tracker</span>
            <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint }}>${Math.round(progress * 30)} / $3,000</span>
          </div>
          <div style={{ width: "100%", height: 8, background: T.border.card, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: progress > 80 ? T.text.tertiary : T.text.faint, borderRadius: 4, transition: "width 0.04s linear, background 0.3s ease" }} />
          </div>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────

export default function AnimationsPage() {
  const [activeSection, setActiveSection] = useState("primitives");
  const sections = [
    { id: "primitives", label: "Primitives" },
    { id: "interactive", label: "Interactive" },
    { id: "data", label: "Data" },
    { id: "reference", label: "Reference" },
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
        input::placeholder { color: #333; }
        button:hover { opacity: 0.88; }
        a:hover { color: #a3a3a3 !important; }

        /* Hover demos */
        .hover-demo-border:hover { border-color: #262626 !important; }
        .hover-demo-scale:hover { transform: scale(1.04) !important; }
        .hover-demo-glow:hover { box-shadow: 0 0 0 1px #262626 !important; }
        .hover-demo-arrow:hover::after { transform: translateX(3px) !important; }

        /* Core animations */
        @keyframes fade { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes slide-x { 0%,100%{transform:translateX(-10px)} 50%{transform:translateX(10px)} }
        @keyframes slide-y { 0%,100%{transform:translateY(-6px)} 50%{transform:translateY(6px)} }
        @keyframes pulse-scale { 0%,100%{transform:scale(1)} 50%{transform:scale(1.8)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink { 0%,49%,100%{opacity:1} 50%,99%{opacity:0} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        @keyframes grow { 0%,100%{transform:scaleX(0)} 50%{transform:scaleX(1)} }
        @keyframes color-cycle { 0%{background:#FF6B2B} 25%{background:#FF2255} 50%{background:#8844FF} 75%{background:#4488FF} 100%{background:#FF6B2B} }
        @keyframes grad-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes orbit { from{transform:rotate(0deg) translateX(10px)} to{transform:rotate(360deg) translateX(10px)} }
        @keyframes cursor-blink { 0%,49%,100%{opacity:1} 50%,99%{opacity:0} }
        @keyframes border-pulse { 0%{border-color:#FF6B2B} 33%{border-color:#8844FF} 66%{border-color:#4488FF} 100%{border-color:#FF6B2B} }
        @keyframes wave-bar { 0%{transform:scaleY(0.2)} 50%{transform:scaleY(1)} 100%{transform:scaleY(0.2)} }

        /* Interactive animations */
        @keyframes stagger-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes loading-pulse { 0%,100%{opacity:0.3;transform:scaleY(0.6)} 50%{opacity:1;transform:scaleY(1)} }
        @keyframes skeleton-shimmer { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        @keyframes typing-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes tab-fade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes waveform-bar { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }
      `}</style>

      <div style={{ background: T.bg.page, minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: T.font.body, color: T.text.primary }}>
        <GradientBar />

        {/* Nav */}
        <nav style={{
          padding: "0 20px", height: 52, display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: `1px solid ${T.border.card}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {COLORS.map((c) => <div key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />)}
            </div>
            <span style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary }}>BlackRoad</span>
            <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.ghost, marginLeft: 2 }}>Animations</span>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                fontFamily: T.font.mono, fontSize: 9, fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.06em",
                color: activeSection === s.id ? T.text.primary : T.text.faint,
                background: activeSection === s.id ? T.border.card : "transparent",
                border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer",
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        <div style={{ padding: "32px 20px 80px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>

            {/* Hero */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {COLORS.map((c) => <div key={c} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />)}
                </div>
                <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim, textTransform: "uppercase", letterSpacing: "0.15em" }}>Motion System</span>
              </div>
              <h1 style={{ fontFamily: T.font.headline, fontSize: "clamp(32px, 7vw, 48px)", fontWeight: 700, color: T.text.primary, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
                Every animation.<br />Live and copyable.
              </h1>
              <p style={{ fontFamily: T.font.body, fontSize: 15, color: T.text.muted, lineHeight: 1.65, maxWidth: 480 }}>
                17 CSS primitives, interactive demos, and data animation patterns. Every animation used across the BlackRoad ecosystem with the code to reproduce it.
              </p>
            </div>

            <GradientBar />

            {/* ═══ PRIMITIVES ═══ */}
            {activeSection === "primitives" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 24 }}>
                <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>
                  17 Motion Primitives
                </div>

                <AnimDemo num="01" name="Fade" description="Opacity 1 → 0.15 → 1" timing="ease · 2s · infinite" code={`@keyframes fade {\n  0%,100% { opacity: 1; }\n  50%     { opacity: 0.15; }\n}`}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: COLORS[4], animation: "fade 2s ease-in-out infinite" }} />
                </AnimDemo>

                <AnimDemo num="02" name="Slide X" description="translateX −10 → 10" timing="ease · 2s · infinite" code={`@keyframes slide-x {\n  0%,100% { transform: translateX(-10px); }\n  50%     { transform: translateX(10px); }\n}`}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[1], animation: "slide-x 2s ease-in-out infinite" }} />
                </AnimDemo>

                <AnimDemo num="03" name="Slide Y" description="translateY −6 → 6" timing="ease · 2s · infinite" code={`@keyframes slide-y {\n  0%,100% { transform: translateY(-6px); }\n  50%     { transform: translateY(6px); }\n}`}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[3], animation: "slide-y 2s ease-in-out infinite" }} />
                </AnimDemo>

                <AnimDemo num="04" name="Pulse" description="scale 1 → 1.8 → 1" timing="ease · 1.5s · infinite" code={`@keyframes pulse-scale {\n  0%,100% { transform: scale(1); }\n  50%     { transform: scale(1.8); }\n}`}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[0], animation: "pulse-scale 1.5s ease-in-out infinite" }} />
                </AnimDemo>

                <AnimDemo num="05" name="Spin" description="rotate 0 → 360°" timing="linear · 2s · infinite" code={`@keyframes spin {\n  from { transform: rotate(0deg); }\n  to   { transform: rotate(360deg); }\n}`}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[4], animation: "spin 2s linear infinite" }} />
                </AnimDemo>

                <AnimDemo num="06" name="Blink" description="Opacity hard cut" timing="step-end · 1s · infinite" code={`@keyframes blink {\n  0%,49%,100% { opacity: 1; }\n  50%,99%     { opacity: 0; }\n}`}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[2], animation: "blink 1s step-end infinite" }} />
                </AnimDemo>

                <AnimDemo num="07" name="Bounce" description="translateY 0 → −8 → 0" timing="ease · 1s · infinite" code={`@keyframes bounce {\n  0%,100% { transform: translateY(0); }\n  50%     { transform: translateY(-8px); }\n}`}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[0], animation: "bounce 1s ease-in-out infinite" }} />
                </AnimDemo>

                <AnimDemo num="08" name="Shake" description="translateX ±4px" timing="ease · 1s · infinite" code={`@keyframes shake {\n  0%,100% { transform: translateX(0); }\n  25%     { transform: translateX(-4px); }\n  75%     { transform: translateX(4px); }\n}`}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[1], animation: "shake 1s ease-in-out infinite" }} />
                </AnimDemo>

                <AnimDemo num="09" name="Grow" description="scaleX 0 → 1 → 0" timing="ease · 2s · infinite" code={`@keyframes grow {\n  0%,100% { transform: scaleX(0); }\n  50%     { transform: scaleX(1); }\n}`}>
                  <div style={{ width: 28, height: 3, borderRadius: 1, background: COLORS[5], animation: "grow 2s ease-in-out infinite", transformOrigin: "left" }} />
                </AnimDemo>

                <AnimDemo num="10" name="Color Cycle" description="Cycles through accent palette" timing="linear · 3s · infinite" code={`@keyframes color-cycle {\n  0%   { background: #FF6B2B; }\n  25%  { background: #FF2255; }\n  50%  { background: #8844FF; }\n  75%  { background: #4488FF; }\n  100% { background: #FF6B2B; }\n}`}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, animation: "color-cycle 3s linear infinite" }} />
                </AnimDemo>

                <AnimDemo num="11" name="Gradient Shift" description="Gradient position sweep" timing="ease · 3s · infinite" code={`@keyframes grad-shift {\n  0%   { background-position: 0% 50%; }\n  50%  { background-position: 100% 50%; }\n  100% { background-position: 0% 50%; }\n}`}>
                  <div style={{ width: 28, height: 4, borderRadius: 2, background: GRADIENT, backgroundSize: "300%", animation: "grad-shift 3s ease infinite" }} />
                </AnimDemo>

                <AnimDemo num="12" name="Orbit" description="rotate + translateX" timing="linear · 2s · infinite" code={`@keyframes orbit {\n  from { transform: rotate(0deg) translateX(10px); }\n  to   { transform: rotate(360deg) translateX(10px); }\n}`}>
                  <div style={{ position: "relative", width: 28, height: 28 }}>
                    <div style={{ width: 3, height: 3, borderRadius: "50%", background: T.text.faint, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS[3], position: "absolute", top: "50%", left: "50%", marginTop: -2.5, marginLeft: -2.5, animation: "orbit 2s linear infinite" }} />
                  </div>
                </AnimDemo>

                <AnimDemo num="13" name="Cursor Blink" description="Terminal text cursor" timing="step-end · 0.8s · infinite" code={`/* Just a div with blink animation */\nwidth: 7px; height: 14px;\nbackground: #fff;\nanimation: blink 0.8s step-end infinite;`}>
                  <div style={{ display: "flex", alignItems: "center", gap: 1, fontFamily: T.font.mono, fontSize: 12, color: T.text.dim }}>
                    br<div style={{ width: 6, height: 13, background: T.text.primary, animation: "blink 0.8s step-end infinite" }} />
                  </div>
                </AnimDemo>

                <AnimDemo num="14" name="Wave" description="scaleY staggered bars" timing="ease · 1s · infinite" code={`@keyframes wave-bar {\n  0%   { transform: scaleY(0.2); }\n  50%  { transform: scaleY(1); }\n  100% { transform: scaleY(0.2); }\n}\n\n/* Each bar: delay = index * 0.12s */`}>
                  <div style={{ display: "flex", alignItems: "center", gap: 2, height: 20 }}>
                    {COLORS.slice(0, 4).map((c, i) => (
                      <div key={i} style={{ width: 3, height: "100%", background: c, borderRadius: 1, animation: `wave-bar 1s ease-in-out ${i * 0.12}s infinite` }} />
                    ))}
                  </div>
                </AnimDemo>

                <AnimDemo num="15" name="Border Pulse" description="Border color cycles palette" timing="ease · 2s · infinite" code={`@keyframes border-pulse {\n  0%   { border-color: #FF6B2B; }\n  33%  { border-color: #8844FF; }\n  66%  { border-color: #4488FF; }\n  100% { border-color: #FF6B2B; }\n}`}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid", animation: "border-pulse 2s ease-in-out infinite" }} />
                </AnimDemo>

                <AnimDemo num="16" name="Stagger In" description="Fade + slide with delay per item" timing="ease · 0.5s · per item" code={`@keyframes stagger-in {\n  from { opacity: 0; transform: translateY(8px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n\nanimation-delay: \${index * 0.08}s;\nanimation-fill-mode: both;`}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 20, height: 3, borderRadius: 1, background: T.text.faint, animation: `stagger-in 0.5s ease ${i * 0.1}s both` }} />
                    ))}
                  </div>
                </AnimDemo>

                <AnimDemo num="17" name="Text Rule" description="White on black. Black on white. No color text. Ever." timing="static — not animated" code={`/* This isn't an animation — it's the most\n   important rule in the system.\n\n   Text is ALWAYS grayscale.\n   Color is ALWAYS decorative.\n   No exceptions. */`}>
                  <span style={{ fontFamily: T.font.mono, fontSize: 11, fontWeight: 700, color: T.text.primary }}>Aa</span>
                </AnimDemo>
              </div>
            )}

            {/* ═══ INTERACTIVE ═══ */}
            {activeSection === "interactive" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
                <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>
                  Interactive Patterns
                </div>
                <StaggerDemo />
                <HoverDemo />
                <TransitionDemo />
                <LoadingDemo />
                <WaveformDemo />
              </div>
            )}

            {/* ═══ DATA ═══ */}
            {activeSection === "data" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
                <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>
                  Data Animations
                </div>
                <CountUpDemo />
                <ProgressDemo />
              </div>
            )}

            {/* ═══ REFERENCE ═══ */}
            {activeSection === "reference" && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
                  Timing Reference
                </div>

                <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                  {[
                    { name: "Micro-interaction", dur: "0.15s", easing: "ease", use: "Hover states, focus, toggles" },
                    { name: "State change", dur: "0.2s", easing: "ease", use: "Tab switches, filter changes, nav" },
                    { name: "Content transition", dur: "0.25s", easing: "ease", use: "Tab content fade, accordion open" },
                    { name: "Page reveal", dur: "0.5s", easing: "ease", use: "Staggered list items, card reveals" },
                    { name: "Ambient loop", dur: "1-3s", easing: "ease-in-out", use: "Pulse, wave, loading indicators" },
                    { name: "Count-up", dur: "1.2s", easing: "cubic-bezier", use: "Number animations, progress fills" },
                  ].map((t, i, arr) => (
                    <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.border.subtle}` : "none", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.secondary, width: 140, flexShrink: 0 }}>{t.name}</span>
                      <span style={{ fontFamily: T.font.mono, fontSize: 12, color: T.text.tertiary, width: 60 }}>{t.dur}</span>
                      <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint, width: 90 }}>{t.easing}</span>
                      <span style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.dim }}>{t.use}</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12, marginTop: 28 }}>
                  Rules
                </div>

                <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 22 }}>
                  {[
                    "Animate shapes and decorative elements in color — never text",
                    "Prefer CSS transitions for state changes, @keyframes for loops",
                    "Stagger delays at 0.06-0.1s per item for list reveals",
                    "Use ease-out for entrances, ease-in for exits",
                    "Loading states always use the spectrum colors",
                    "cursor: pointer on anything clickable — no exceptions",
                    "button:hover { opacity: 0.88 } — universal hover",
                    "border-color transition for card hover — never box-shadow",
                    "fontVariantNumeric: tabular-nums on animated numbers",
                    "Reduced motion: wrap in prefers-reduced-motion media query",
                  ].map((r, i) => (
                    <div key={i} style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, lineHeight: 2.2, display: "flex", gap: 10 }}>
                      <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, flexShrink: 0, width: 20, textAlign: "right" }}>{String(i + 1).padStart(2, "0")}</span>
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
