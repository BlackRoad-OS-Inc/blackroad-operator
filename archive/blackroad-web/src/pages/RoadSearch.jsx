import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

const PRIMARY_API = "https://search.blackroad.io";
const FALLBACK_API = "https://road-search.amundsonalexa.workers.dev";

const CATEGORIES = ["All", "Sites", "Agents", "Tech", "API", "Apps"];

// ── Helpers ──────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useSearchParams() {
  const get = () => {
    const p = new URLSearchParams(window.location.search);
    return { q: p.get("q") || "", cat: p.get("category") || "All" };
  };
  const set = (q, cat) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cat && cat !== "All") p.set("category", cat);
    const s = p.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
  };
  return { get, set };
}

async function apiFetch(path, signal) {
  try {
    const res = await fetch(`${PRIMARY_API}${path}`, { signal });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") throw e;
    const res = await fetch(`${FALLBACK_API}${path}`, { signal });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  }
}

// ── Main Component ───────────────────────────────────────────────────
export default function RoadSearch() {
  const params = useSearchParams();
  const initial = params.get();

  const [query, setQuery] = useState(initial.q);
  const [submitted, setSubmitted] = useState(initial.q);
  const [category, setCategory] = useState(initial.cat);
  const [results, setResults] = useState(null);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestIdx, setSuggestIdx] = useState(-1);

  const [stats, setStats] = useState({ indexed: 0, queries: 0 });
  const [trending, setTrending] = useState([]);

  const inputRef = useRef(null);
  const suggestRef = useRef(null);
  const abortRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);
  const hasResults = submitted && results !== null;

  // ── Load stats + trending on mount ──
  useEffect(() => {
    apiFetch("/stats").then((d) => {
      setStats({ indexed: d.indexed || d.total_pages || 0, queries: d.queries_today || d.queries || 0 });
      setTrending(d.trending || d.top_queries || []);
    }).catch(() => {});
  }, []);

  // ── URL param initial search ──
  useEffect(() => {
    if (initial.q) doSearch(initial.q, initial.cat, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Autocomplete ──
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    if (debouncedQuery === submitted) return;
    let cancelled = false;
    apiFetch(`/suggest?q=${encodeURIComponent(debouncedQuery)}`).then((d) => {
      if (!cancelled) {
        setSuggestions(d.suggestions || d || []);
        setShowSuggest(true);
        setSuggestIdx(-1);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [debouncedQuery, submitted]);

  // ── Global / key ──
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Click outside to close suggestions ──
  useEffect(() => {
    const handler = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Search ──
  const doSearch = useCallback(async (q, cat, pg) => {
    if (!q.trim()) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setShowSuggest(false);
    setSubmitted(q);
    params.set(q, cat);

    const catParam = cat && cat !== "All" ? `&category=${encodeURIComponent(cat.toLowerCase())}` : "";
    const start = performance.now();

    try {
      const data = await apiFetch(`/search?q=${encodeURIComponent(q)}${catParam}&ai=true&page=${pg}&limit=10`, controller.signal);
      setDuration(Math.round(performance.now() - start));
      setResults(data.results || []);
      setTotalResults(data.total || data.results?.length || 0);
      setAiAnswer(data.ai_answer || data.answer || null);
      setPage(pg);
    } catch (e) {
      if (e.name !== "AbortError") {
        setResults([]);
        setTotalResults(0);
        setAiAnswer(null);
        setDuration(null);
      }
    } finally {
      setLoading(false);
    }
  }, [params]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    doSearch(query, category, 1);
  };

  const handleKeyDown = (e) => {
    if (showSuggest && suggestions.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestIdx((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestIdx((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && suggestIdx >= 0) {
        e.preventDefault();
        const pick = typeof suggestions[suggestIdx] === "string" ? suggestions[suggestIdx] : suggestions[suggestIdx].query;
        setQuery(pick);
        doSearch(pick, category, 1);
        return;
      }
    }
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") {
      setShowSuggest(false);
      inputRef.current?.blur();
    }
  };

  const handleLucky = () => {
    if (results && results.length > 0) {
      const url = results[0].url || results[0].link;
      if (url) window.open(url, "_blank", "noopener");
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────
  const s = {
    page: {
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      fontFamily: inter,
      display: "flex",
      flexDirection: "column",
    },
    heroWrap: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: hasResults ? "flex-start" : "center",
      paddingTop: hasResults ? 24 : 0,
      transition: "all 0.3s ease",
    },
    title: {
      fontFamily: grotesk,
      fontSize: hasResults ? 24 : 56,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      marginBottom: hasResults ? 0 : 8,
      cursor: "pointer",
      transition: "font-size 0.3s ease",
    },
    subtitle: {
      fontFamily: mono,
      fontSize: 13,
      color: "#666",
      marginBottom: 28,
    },
    searchWrap: {
      position: "relative",
      width: "100%",
      maxWidth: hasResults ? 680 : 560,
      padding: "0 20px",
      transition: "max-width 0.3s ease",
    },
    input: {
      width: "100%",
      padding: "14px 48px 14px 18px",
      fontSize: 16,
      fontFamily: inter,
      background: "#111",
      color: "#fff",
      border: "1px solid #333",
      borderRadius: 8,
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    searchIcon: {
      position: "absolute",
      right: 34,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#666",
      cursor: "pointer",
      fontSize: 18,
    },
    hint: {
      fontFamily: mono,
      fontSize: 11,
      color: "#444",
      marginTop: 8,
      textAlign: "center",
    },
    pills: {
      display: "flex",
      gap: 8,
      justifyContent: "center",
      marginTop: 16,
      flexWrap: "wrap",
      padding: "0 20px",
    },
    pill: (active) => ({
      fontFamily: mono,
      fontSize: 12,
      padding: "5px 14px",
      borderRadius: 20,
      border: active ? "none" : "1px solid #333",
      background: active ? GRAD : "transparent",
      color: "#fff",
      cursor: "pointer",
      transition: "all 0.2s",
      fontWeight: active ? 600 : 400,
    }),
    trendingWrap: {
      marginTop: 36,
      textAlign: "center",
      padding: "0 20px",
    },
    trendingLabel: {
      fontFamily: mono,
      fontSize: 11,
      color: "#555",
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    trendingItem: {
      fontFamily: inter,
      fontSize: 13,
      color: "#888",
      cursor: "pointer",
      padding: "4px 12px",
      display: "inline-block",
      transition: "color 0.2s",
    },
    suggestBox: {
      position: "absolute",
      top: "100%",
      left: 20,
      right: 20,
      marginTop: 4,
      background: "#111",
      border: "1px solid #333",
      borderRadius: 8,
      overflow: "hidden",
      zIndex: 100,
    },
    suggestItem: (active) => ({
      padding: "10px 16px",
      fontSize: 14,
      fontFamily: inter,
      color: active ? "#fff" : "#aaa",
      background: active ? "#222" : "transparent",
      cursor: "pointer",
      transition: "background 0.15s",
    }),
    resultsArea: {
      width: "100%",
      maxWidth: 680,
      padding: "0 20px",
      marginTop: 20,
    },
    meta: {
      fontFamily: mono,
      fontSize: 12,
      color: "#555",
      marginBottom: 16,
    },
    aiBox: {
      background: "#0a0a0a",
      borderLeft: `3px solid transparent`,
      borderImage: `${GRAD} 1`,
      padding: "16px 20px",
      borderRadius: "0 8px 8px 0",
      marginBottom: 24,
    },
    aiLabel: {
      fontFamily: mono,
      fontSize: 11,
      color: "#888",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    aiText: {
      fontFamily: inter,
      fontSize: 14,
      color: "#ccc",
      lineHeight: 1.65,
      whiteSpace: "pre-wrap",
    },
    resultCard: {
      padding: "16px 0",
      borderBottom: "1px solid #1a1a1a",
      transition: "background 0.2s",
    },
    resultTitle: {
      fontFamily: grotesk,
      fontSize: 17,
      fontWeight: 600,
      color: "#7ab8ff",
      textDecoration: "none",
      cursor: "pointer",
      transition: "color 0.2s",
    },
    resultUrl: {
      fontFamily: mono,
      fontSize: 12,
      color: "#4a9",
      marginTop: 3,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    resultSnippet: {
      fontFamily: inter,
      fontSize: 14,
      color: "#999",
      lineHeight: 1.55,
      marginTop: 5,
    },
    badge: {
      fontFamily: mono,
      fontSize: 10,
      padding: "2px 8px",
      borderRadius: 4,
      border: "1px solid #333",
      color: "#888",
      marginRight: 6,
      textTransform: "uppercase",
    },
    tag: {
      fontFamily: mono,
      fontSize: 10,
      color: "#555",
      marginLeft: 6,
    },
    pagination: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      padding: "24px 0",
    },
    pageBtn: (disabled) => ({
      fontFamily: mono,
      fontSize: 13,
      padding: "6px 16px",
      border: "1px solid #333",
      borderRadius: 6,
      background: "transparent",
      color: disabled ? "#333" : "#aaa",
      cursor: disabled ? "default" : "pointer",
      transition: "all 0.2s",
    }),
    lucky: {
      fontFamily: mono,
      fontSize: 12,
      color: "#555",
      cursor: "pointer",
      textAlign: "center",
      padding: "8px 0 20px",
      transition: "color 0.2s",
    },
    footer: {
      textAlign: "center",
      padding: "20px 0",
      borderTop: "1px solid #111",
    },
    footerText: {
      fontFamily: mono,
      fontSize: 11,
      color: "#333",
    },
    spinner: {
      display: "inline-block",
      width: 20,
      height: 20,
      border: "2px solid #333",
      borderTopColor: "#888",
      borderRadius: "50%",
      animation: "spin 0.6s linear infinite",
    },
  };

  // ── Render ─────────────────────────────────────────────────────────
  const renderSuggestions = () => {
    if (!showSuggest || !suggestions.length) return null;
    return (
      <div ref={suggestRef} style={s.suggestBox}>
        {suggestions.slice(0, 8).map((item, i) => {
          const text = typeof item === "string" ? item : item.query || item.text;
          return (
            <div
              key={i}
              style={s.suggestItem(i === suggestIdx)}
              onMouseEnter={() => setSuggestIdx(i)}
              onClick={() => {
                setQuery(text);
                doSearch(text, category, 1);
              }}
            >
              {text}
            </div>
          );
        })}
      </div>
    );
  };

  const renderAiAnswer = () => {
    if (!aiAnswer) return null;
    return (
      <div style={s.aiBox}>
        <div style={s.aiLabel}>AI Answer</div>
        <div style={s.aiText}>{aiAnswer}</div>
      </div>
    );
  };

  const renderResults = () => {
    if (!hasResults) return null;
    if (loading) {
      return (
        <div style={{ ...s.resultsArea, textAlign: "center", paddingTop: 40 }}>
          <div style={s.spinner} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }
    if (results.length === 0) {
      return (
        <div style={{ ...s.resultsArea, textAlign: "center", paddingTop: 40 }}>
          <div style={{ fontFamily: grotesk, fontSize: 18, color: "#666", marginBottom: 8 }}>No results found</div>
          <div style={{ fontFamily: inter, fontSize: 14, color: "#444" }}>Try different keywords or broaden your search.</div>
        </div>
      );
    }

    const totalPages = Math.ceil(totalResults / 10);

    return (
      <div style={s.resultsArea}>
        {duration !== null && (
          <div style={s.meta}>{totalResults} result{totalResults !== 1 ? "s" : ""} in {duration}ms</div>
        )}
        {renderAiAnswer()}
        {results.map((r, i) => {
          const title = r.title || r.name || "Untitled";
          const url = r.url || r.link || "#";
          const snippet = r.snippet || r.description || r.content || "";
          const cat = r.category || r.type || "";
          const tags = r.tags || [];
          return (
            <div
              key={i}
              style={s.resultCard}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#0a0a0a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <a href={url} target="_blank" rel="noopener noreferrer" style={s.resultTitle}
                onMouseEnter={(e) => { e.target.style.color = "#aad4ff"; }}
                onMouseLeave={(e) => { e.target.style.color = "#7ab8ff"; }}
              >
                {title}
              </a>
              <div style={s.resultUrl}>{url}</div>
              <div style={s.resultSnippet}>{snippet}</div>
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                {cat && <span style={s.badge}>{cat}</span>}
                {tags.map((t, j) => <span key={j} style={s.tag}>#{t}</span>)}
              </div>
            </div>
          );
        })}
        {results.length > 0 && (
          <div style={s.lucky} onClick={handleLucky}
            onMouseEnter={(e) => { e.target.style.color = "#888"; }}
            onMouseLeave={(e) => { e.target.style.color = "#555"; }}
          >
            I'm Feeling Lucky
          </div>
        )}
        {totalPages > 1 && (
          <div style={s.pagination}>
            <button
              style={s.pageBtn(page <= 1)}
              disabled={page <= 1}
              onClick={() => { if (page > 1) doSearch(submitted, category, page - 1); }}
            >
              Prev
            </button>
            <span style={{ fontFamily: mono, fontSize: 12, color: "#555" }}>
              {page} / {totalPages}
            </span>
            <button
              style={s.pageBtn(page >= totalPages)}
              disabled={page >= totalPages}
              onClick={() => { if (page < totalPages) doSearch(submitted, category, page + 1); }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderTrending = () => {
    if (hasResults || !trending.length) return null;
    return (
      <div style={s.trendingWrap}>
        <div style={s.trendingLabel}>Trending</div>
        <div>
          {trending.slice(0, 8).map((t, i) => {
            const text = typeof t === "string" ? t : t.query || t.text;
            return (
              <span
                key={i}
                style={s.trendingItem}
                onClick={() => { setQuery(text); doSearch(text, category, 1); }}
                onMouseEnter={(e) => { e.target.style.color = "#ccc"; }}
                onMouseLeave={(e) => { e.target.style.color = "#888"; }}
              >
                {text}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const [inputFocused, setInputFocused] = useState(false);

  return (
    <div style={s.page}>
      <div style={s.heroWrap}>
        {/* Title */}
        <div
          style={s.title}
          onClick={() => {
            setSubmitted("");
            setResults(null);
            setAiAnswer(null);
            setQuery("");
            params.set("", "All");
          }}
        >
          RoadSearch
        </div>

        {!hasResults && <div style={s.subtitle}>Search the Road. Find the Way.</div>}

        {/* Search input */}
        <div style={s.searchWrap}>
          <form onSubmit={handleSubmit} autoComplete="off">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { setInputFocused(true); if (suggestions.length) setShowSuggest(true); }}
              onBlur={() => setInputFocused(false)}
              placeholder="Search..."
              style={{
                ...s.input,
                borderColor: inputFocused ? "transparent" : "#333",
                borderImage: inputFocused ? "none" : "none",
                borderBottom: inputFocused ? `2px solid` : "1px solid #333",
                borderBottomColor: inputFocused ? undefined : "#333",
                ...(inputFocused ? { borderImage: `${GRAD} 1`, borderImageSlice: "0 0 1 0" } : {}),
              }}
            />
            <span style={s.searchIcon} onClick={handleSubmit}>
              {loading ? (
                <>
                  <span style={s.spinner} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </>
              ) : (
                "\u2315"
              )}
            </span>
          </form>
          {renderSuggestions()}
          {!hasResults && <div style={s.hint}>Press / to focus</div>}
        </div>

        {/* Category pills */}
        <div style={s.pills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              style={s.pill(category === cat)}
              onClick={() => {
                setCategory(cat);
                if (submitted) doSearch(submitted, cat, 1);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Trending */}
        {renderTrending()}

        {/* Results */}
        {renderResults()}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.footerText}>
          {stats.indexed > 0 ? `${stats.indexed.toLocaleString()} pages indexed` : ""}{stats.indexed > 0 && stats.queries > 0 ? " \u00B7 " : ""}{stats.queries > 0 ? `${stats.queries.toLocaleString()} queries today` : ""}
        </div>
        <div style={{ ...s.footerText, marginTop: 4 }}>BlackRoad OS — Pave Tomorrow.</div>
      </div>
    </div>
  );
}
