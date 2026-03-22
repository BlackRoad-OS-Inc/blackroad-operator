import { useState, useRef, useEffect } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const MOCK_RESULTS = {
  "Z-framework equilibrium": {
    answer: "The Z-Framework (Z := yx − w) defines equilibrium as the state where Z = ∅, meaning the transformation of input matches expected output with zero feedback gap. When Z ≠ ∅, the system must adapt. This unifies control theory feedback loops, quantum measurement collapse, conservation laws, and observer-observed dynamics under a single equation.",
    confidence: 97,
    sources: 4,
    results: [
      { title: "Z-Framework: Unifying Feedback Systems", url: "docs.blackroad.io/frameworks/z-framework", source: "BlackRoad Docs", quality: 98, type: "primary", snippet: "Core equation Z := yx − w where x = input, y = transformation, w = expected output. Z = ∅ indicates equilibrium — no adaptation needed. Z ≠ ∅ triggers the feedback loop." },
      { title: "Amundson Equations Registry — A34", url: "docs.blackroad.io/equations/a34", source: "BlackRoad Docs", quality: 96, type: "primary", snippet: "Equation A34 establishes the Z-Framework as the foundational identity. Key insight: ∂(human+AI)/∂t means the unified system evolves toward Z=∅ together." },
      { title: "Control Theory and Quantum Measurement Bridges", url: "arxiv.org/abs/2025.14823", source: "arXiv", quality: 88, type: "academic", snippet: "Recent work by Amundson demonstrates isomorphism between classical feedback control and quantum measurement collapse through a single operator equation." },
      { title: "Z-Check.io — Interactive Feedback Diagnostic", url: "z-check.io", source: "Z-Check", quality: 85, type: "tool", snippet: "Free diagnostic tool implementing the Z-Framework. Describe input, transformation, and expected output — the tool computes Z and surfaces the feedback gap." },
    ],
  },
  "PS-SHA∞ agent identity": {
    answer: "PS-SHA∞ is BlackRoad's cryptographic identity protocol for AI agents. Each agent receives a unique hash at birth that persists across sessions. Memory is stored in append-only journals with truth state commits, creating an immutable chain of verified interactions. This gives agents verifiable, persistent identity — not just a session token.",
    confidence: 94,
    sources: 3,
    results: [
      { title: "PS-SHA∞ Identity Hash Protocol", url: "docs.blackroad.io/memory/ps-sha", source: "BlackRoad Docs", quality: 97, type: "primary", snippet: "Each agent receives a PS-SHA∞ identity hash at spawn. Memory journals are append-only with truth state commits. Chain integrity is verified on every read." },
      { title: "PatternBirth.com — Agent Identity Infrastructure", url: "patternbirth.com", source: "PatternBirth", quality: 90, type: "tool", snippet: "Cryptographic identity infrastructure for AI agents. Free for indie devs (10 agents). Enterprise pricing at $0.001/verification." },
      { title: "Persistent Memory in Multi-Agent Systems", url: "arxiv.org/abs/2026.02841", source: "arXiv", quality: 86, type: "academic", snippet: "Survey of memory persistence approaches in multi-agent architectures. PS-SHA∞ cited as novel approach combining cryptographic hashing with append-only journals." },
    ],
  },
  "how to make sourdough bread": {
    answer: "Sourdough bread requires a mature starter (fed flour and water, fermented 5-7 days), strong bread flour, water, and salt. The process involves mixing, bulk fermentation (4-6 hours with stretch-and-folds), shaping, cold retarding overnight in the fridge, and baking in a preheated Dutch oven at 450°F.",
    confidence: 92,
    sources: 5,
    results: [
      { title: "The Complete Guide to Sourdough Bread", url: "theperfectloaf.com/beginners-sourdough", source: "The Perfect Loaf", quality: 95, type: "primary", snippet: "Comprehensive guide covering starter creation, flour selection, hydration ratios, bulk fermentation timing, and baking techniques for consistent results." },
      { title: "Sourdough Bread — Serious Eats", url: "seriouseats.com/sourdough-bread", source: "Serious Eats", quality: 93, type: "primary", snippet: "Step-by-step recipe with detailed timing. Emphasis on the stretch-and-fold technique during bulk fermentation for gluten development." },
      { title: "Tartine Bread Method Explained", url: "kingarthurbaking.com/tartine-method", source: "King Arthur", quality: 91, type: "primary", snippet: "Adaptation of Chad Robertson's Tartine method with precise temperature and timing guidelines for home bakers." },
      { title: "r/Sourdough — Beginner FAQ", url: "reddit.com/r/Sourdough/wiki/faq", source: "Reddit", quality: 72, type: "community", snippet: "Community-compiled frequently asked questions covering common beginner mistakes, starter troubleshooting, and equipment recommendations." },
      { title: "Sourdough Science: The Fermentation Process", url: "ncbi.nlm.nih.gov/pmc/articles/PMC7284", source: "PubMed", quality: 88, type: "academic", snippet: "Peer-reviewed analysis of lactobacillus cultures in sourdough fermentation. Explains the biochemistry behind flavor development and gluten modification." },
    ],
  },
};

const DEFAULT_QUERY = "";

function ConfidenceBar({ value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 48, height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: value > 90 ? "#a3a3a3" : value > 75 ? "#525252" : "#333", borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: value > 90 ? "#a3a3a3" : "#525252" }}>{value}%</span>
    </div>
  );
}

function QualityDot({ quality }) {
  const color = quality > 90 ? "#a3a3a3" : quality > 80 ? "#525252" : quality > 70 ? "#404040" : "#333";
  return <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

function TypeBadge({ type }) {
  const styles = {
    primary: { color: "#a3a3a3", bg: "#1a1a1a" },
    academic: { color: "#737373", bg: "#141414" },
    tool: { color: "#525252", bg: "#111" },
    community: { color: "#404040", bg: "#0f0f0f" },
  };
  const s = styles[type] || styles.community;
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 500,
      color: s.color, background: s.bg, padding: "2px 7px", borderRadius: 3,
      border: "1px solid #1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {type}
    </span>
  );
}

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

export default function SearchEngine() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [activeQuery, setActiveQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const inputRef = useRef(null);

  const handleSearch = (q) => {
    const searchTerm = q || query;
    if (!searchTerm.trim()) return;
    setActiveQuery(searchTerm);
    setIsSearching(true);

    // Simulate search
    setTimeout(() => {
      const key = Object.keys(MOCK_RESULTS).find((k) =>
        k.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchTerm.toLowerCase().includes(k.toLowerCase().split(" ")[0])
      );
      setResults(key ? MOCK_RESULTS[key] : MOCK_RESULTS["how to make sourdough bread"]);
      setIsSearching(false);
    }, 600);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  const suggestions = ["Z-framework equilibrium", "PS-SHA∞ agent identity", "how to make sourdough bread"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border-radius: 3px; }
        input::placeholder { color: #333; }
        input:focus { border-color: #262626 !important; outline: none; }
        @keyframes pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <GradientBar />

        {/* Nav */}
        <nav style={{
          padding: "0 20px", height: 52, display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: "1px solid #1a1a1a",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setResults(null); setActiveQuery(""); setQuery(""); }} style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
              <div style={{ display: "flex", gap: 2 }}>
                {COLORS.map((c) => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>RoadView</span>
            </a>
            {activeQuery && (
              <>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#1a1a1a" }}>·</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333" }}>Truth-First Search</span>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", textDecoration: "none" }}>About</a>
            <a href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", textDecoration: "none" }}>API</a>
          </div>
        </nav>

        {/* Homepage — no results */}
        {!results && !isSearching && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 54px)", padding: "0 20px" }}>
            <div style={{ textAlign: "center", width: "100%", maxWidth: 580 }}>
              {/* Logo mark */}
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 28 }}>
                {COLORS.map((c) => <div key={c} style={{ width: 5, height: 20, borderRadius: 3, background: c }} />)}
              </div>

              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 8vw, 56px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
                RoadView
              </h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#525252", marginBottom: 36 }}>
                Truth-first search. Every result verified. No SEO gaming.
              </p>

              {/* Search bar */}
              <div style={{
                display: "flex", alignItems: "center", gap: 0,
                background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12,
                padding: "4px 4px 4px 18px", marginBottom: 20,
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#262626", flexShrink: 0, marginRight: 10 }}>⌕</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search anything..."
                  style={{
                    flex: 1, background: "none", border: "none", color: "#f5f5f5",
                    fontFamily: "'Inter', sans-serif", fontSize: 16, padding: "12px 0",
                    outline: "none", minWidth: 0,
                  }}
                />
                <button
                  onClick={() => handleSearch()}
                  style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
                    color: "#0a0a0a", background: "#f5f5f5", border: "none",
                    padding: "10px 24px", borderRadius: 8, cursor: "pointer", flexShrink: 0,
                  }}
                >
                  Search
                </button>
              </div>

              {/* Suggestions */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); handleSearch(s); }}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040",
                      background: "transparent", border: "1px solid #1a1a1a", borderRadius: 6,
                      padding: "7px 14px", cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Features */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 1, background: "#1a1a1a", borderRadius: 10, overflow: "hidden", marginTop: 48 }}>
                {[
                  { value: "Verified", label: "Every result checked" },
                  { value: "Scored", label: "Confidence levels" },
                  { value: "No Ads", label: "Zero sponsored results" },
                  { value: "Sources", label: "Primary sources first" },
                ].map((f) => (
                  <div key={f.label} style={{ background: "#0f0f0f", padding: "18px 14px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: "#f5f5f5", marginBottom: 4 }}>{f.value}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", letterSpacing: "0.04em" }}>{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isSearching && (
          <div style={{ padding: "80px 20px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
              {COLORS.map((c, i) => (
                <div key={c} style={{
                  width: 4, height: 16, borderRadius: 2, background: c,
                  animation: `pulse 1.2s ease-in-out ${i * 0.1}s infinite`,
                }} />
              ))}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#333" }}>
              Verifying sources...
            </div>
          </div>
        )}

        {/* Results */}
        {results && !isSearching && (
          <div style={{ padding: "24px 20px 80px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>

              {/* Search bar (compact) */}
              <div style={{
                display: "flex", alignItems: "center", gap: 0,
                background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10,
                padding: "3px 3px 3px 16px", marginBottom: 24,
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#262626", flexShrink: 0, marginRight: 8 }}>⌕</span>
                <input
                  type="text" value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    flex: 1, background: "none", border: "none", color: "#f5f5f5",
                    fontFamily: "'Inter', sans-serif", fontSize: 15, padding: "10px 0",
                    outline: "none", minWidth: 0,
                  }}
                />
                <button onClick={() => handleSearch()} style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
                  color: "#0a0a0a", background: "#f5f5f5", border: "none",
                  padding: "8px 20px", borderRadius: 7, cursor: "pointer", flexShrink: 0,
                }}>
                  Search
                </button>
              </div>

              {/* AI Answer */}
              <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, padding: 24, marginBottom: 20, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: GRADIENT }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {COLORS.slice(0, 3).map((c) => <div key={c} style={{ width: 3, height: 10, borderRadius: 1, background: c }} />)}
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em" }}>Verified Answer</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <ConfidenceBar value={results.confidence} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>{results.sources} sources</span>
                  </div>
                </div>

                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#d4d4d4", lineHeight: 1.7 }}>
                  {results.answer}
                </p>
              </div>

              {/* Results header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333" }}>
                  {results.results.length} results · sorted by source quality
                </span>
              </div>

              {/* Result cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {results.results.map((r, i) => (
                  <div key={i} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: "18px 20px" }}>
                    {/* Source line */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <QualityDot quality={r.quality} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252" }}>{r.source}</span>
                      <TypeBadge type={r.type} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#262626", marginLeft: "auto" }}>{r.quality}%</span>
                    </div>

                    {/* Title */}
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 500, color: "#f5f5f5", marginBottom: 4, lineHeight: 1.35 }}>
                      {r.title}
                    </div>

                    {/* URL */}
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.url}
                    </div>

                    {/* Snippet */}
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", lineHeight: 1.55, margin: 0 }}>
                      {r.snippet}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer info */}
              <div style={{ textAlign: "center", marginTop: 32 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#262626", marginBottom: 8 }}>
                  Results verified across {results.sources} sources · No sponsored results · No SEO gaming
                </div>
                <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                  {[
                    { color: "#a3a3a3", label: "90%+" },
                    { color: "#525252", label: "80-90%" },
                    { color: "#404040", label: "70-80%" },
                    { color: "#333", label: "<70%" },
                  ].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: l.color }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
