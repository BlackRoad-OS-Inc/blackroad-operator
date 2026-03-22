import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;
const T = {
  text: { primary: "#f5f5f5", secondary: "#d4d4d4", tertiary: "#a3a3a3", muted: "#737373", dim: "#525252", faint: "#404040", ghost: "#333", invisible: "#262626" },
  bg: { page: "#0a0a0a", card: "#131313", inset: "#0f0f0f" },
  border: { card: "#1a1a1a", subtle: "#141414", hover: "#262626" },
  font: { headline: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
};

const VIDEOS = [
  { id: 1, title: "Building the Governance Layer — From Zero to Cece", creator: "Alexa", duration: "12:34", views: null, quality: 96, lengths: ["30s", "2m", "5m", "12m"], tags: ["architecture", "governance"], generated: false, published: "2h ago",
    desc: "Walking through the entire governance spine — policy engine, ledger integrity, audit trails. How Cece evaluates 12,400 decisions with zero bypasses." },
  { id: 2, title: "Z-Framework Explained in 4 Levels of Complexity", creator: "Alexa", duration: "8:22", views: null, quality: 94, lengths: ["30s", "2m", "5m", "8m"], tags: ["math", "z-framework"], generated: false, published: "Yesterday",
    desc: "Z := yx − w explained for a child, a student, a researcher, and a mathematician. Same equation, four different depths." },
  { id: 3, title: "SoundRoad Demo: Hum to Track in 90 Seconds", creator: "cadence", duration: "1:32", views: null, quality: 91, lengths: ["30s", "1m"], tags: ["demo", "soundroad", "music"], generated: true, published: "2 days ago",
    desc: "AI-generated demo video showing the hum-to-track pipeline. From hummed melody to finished lo-fi track in real time." },
  { id: 4, title: "The 1-2-3-4 Pauli Model — Visual Proof", creator: "Alexa", duration: "15:47", views: null, quality: 98, lengths: ["30s", "2m", "5m", "10m", "15m"], tags: ["math", "pauli-model", "proof"], generated: false, published: "4 days ago",
    desc: "Visual walkthrough of how ÛĈL̂ = iI proves Strength emerges from Structure × Change × Scale. The ontological primitives mapped to su(2) Lie algebra." },
  { id: 5, title: "Agent Memory: How PS-SHA∞ Works", creator: "cecilia", duration: "5:18", views: null, quality: 93, lengths: ["30s", "2m", "5m"], tags: ["agents", "memory", "ps-sha"], generated: true, published: "1 week ago",
    desc: "Cecilia explains her own memory system. Append-only journals, truth state commits, hash chain verification." },
  { id: 6, title: "Raspberry Pi Mesh Cluster Setup", creator: "Alexa", duration: "22:10", views: null, quality: 89, lengths: ["30s", "2m", "5m", "10m", "22m"], tags: ["hardware", "mesh", "tutorial"], generated: false, published: "1 week ago",
    desc: "Full tutorial: K3s on Raspberry Pi, Traefik routing, agent registration on the mesh network. From unboxing to first deployed agent." },
];

const REVENUE_STREAMS = [
  { stream: "Ad Revenue", share: "80%", desc: "Non-intrusive, clearly labeled. Never mid-roll." },
  { stream: "Tips", share: "95%", desc: "Direct creator support. 5% processing fee only." },
  { stream: "Licensed Assets", share: "80%", desc: "Sell stems, presets, templates from your videos." },
  { stream: "Courses", share: "80%", desc: "Turn video series into paid courses." },
  { stream: "Presets / Downloads", share: "80%", desc: "Attach downloadable files to any video." },
];

const GENERATE_PRESETS = [
  { label: "Product Demo", desc: "Screen capture + voiceover + annotations", duration: "1-3 min" },
  { label: "Explainer", desc: "Animated diagrams + narration from script", duration: "2-5 min" },
  { label: "Tutorial", desc: "Step-by-step with code/UI recording", duration: "5-15 min" },
  { label: "Highlight Reel", desc: "Auto-edited from longer footage", duration: "30s-2 min" },
  { label: "Social Clip", desc: "Vertical format, captions baked in", duration: "15-60s" },
  { label: "Podcast Visual", desc: "Waveform + transcript + chapter marks", duration: "Any" },
];

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function QualityBadge({ value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: value > 90 ? T.text.tertiary : T.text.faint }} />
      <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint }}>{value}%</span>
    </div>
  );
}

function VideoThumbnail({ video, size = "large" }) {
  const h = size === "large" ? 180 : 100;
  return (
    <div style={{
      width: "100%", height: h, background: T.bg.inset, borderRadius: 8,
      border: `1px solid ${T.border.subtle}`, position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Fake waveform / visual */}
      <div style={{ display: "flex", alignItems: "center", gap: 1, height: "50%", opacity: 0.15 }}>
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} style={{
            width: 2, borderRadius: 1, flexShrink: 0,
            height: `${(Math.sin(i * 0.5 + video.id) * 0.4 + 0.5) * 100}%`,
            background: COLORS[i % COLORS.length],
          }} />
        ))}
      </div>

      {/* Play button */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 40, height: 40, borderRadius: 10, background: "rgba(245,245,245,0.1)",
        backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: T.font.mono, fontSize: 14, color: T.text.primary,
      }}>
        ▶
      </div>

      {/* Duration */}
      <div style={{
        position: "absolute", bottom: 8, right: 8,
        fontFamily: T.font.mono, fontSize: 10, color: T.text.tertiary,
        background: "rgba(10,10,10,0.85)", padding: "3px 7px", borderRadius: 4,
      }}>
        {video.duration}
      </div>

      {/* AI generated badge */}
      {video.generated && (
        <div style={{
          position: "absolute", top: 8, left: 8,
          fontFamily: T.font.mono, fontSize: 9, color: T.text.dim,
          background: "rgba(10,10,10,0.85)", padding: "3px 8px", borderRadius: 4,
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          AI Generated
        </div>
      )}
    </div>
  );
}

function Nav({ activeView, setActiveView }) {
  const views = ["browse", "create", "studio", "revenue"];
  return (
    <nav style={{
      padding: "0 16px", height: 52, display: "flex", alignItems: "center",
      justifyContent: "space-between", borderBottom: `1px solid ${T.border.card}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {COLORS.map((c) => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}
        </div>
        <span style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary, letterSpacing: "-0.02em" }}>RoadTube</span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {views.map((v) => (
          <button key={v} onClick={() => setActiveView(v)} style={{
            fontFamily: T.font.mono, fontSize: 9, fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.06em",
            color: activeView === v ? T.text.primary : T.text.faint,
            background: activeView === v ? T.border.card : "transparent",
            border: "none", borderRadius: 5, padding: "6px 10px", cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
            {v}
          </button>
        ))}
      </div>
    </nav>
  );
}

function BrowseView() {
  const [filter, setFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const tags = ["all", ...new Set(VIDEOS.flatMap((v) => v.tags))];
  const filtered = filter === "all" ? VIDEOS : VIDEOS.filter((v) => v.tags.includes(filter));

  if (selectedVideo) {
    const v = VIDEOS.find((x) => x.id === selectedVideo);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={() => setSelectedVideo(null)} style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.ghost, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>← back to browse</button>

        <VideoThumbnail video={v} size="large" />

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: T.font.headline, fontSize: 24, fontWeight: 700, color: T.text.primary, flex: 1 }}>{v.title}</span>
            <QualityBadge value={v.quality} />
          </div>
          <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint, marginBottom: 14 }}>
            {v.creator} · {v.duration} · {v.published} · Confidence: {v.quality}%
          </div>
          <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted, lineHeight: 1.65, marginBottom: 20 }}>{v.desc}</p>
        </div>

        {/* Multi-length export */}
        <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Available Lengths</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {v.lengths.map((l) => (
              <button key={l} style={{
                fontFamily: T.font.mono, fontSize: 12, color: T.text.tertiary,
                background: T.bg.inset, border: `1px solid ${T.border.card}`, borderRadius: 7,
                padding: "10px 18px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
                <span style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary }}>{l}</span>
                <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost }}>version</span>
              </button>
            ))}
          </div>
          <div style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.ghost, marginTop: 10 }}>
            One video → multiple lengths. AI edits for each duration while preserving the key message.
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {v.tags.map((tag) => (
            <span key={tag} style={{
              fontFamily: T.font.mono, fontSize: 10, color: T.text.dim,
              background: T.bg.page, padding: "4px 10px", borderRadius: 4,
              border: `1px solid ${T.border.card}`,
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={{ fontFamily: T.font.body, fontSize: 13, fontWeight: 500, color: T.bg.page, background: T.text.primary, border: "none", padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}>Watch</button>
          <button style={{ fontFamily: T.font.body, fontSize: 13, fontWeight: 500, color: T.text.tertiary, background: "transparent", border: `1px solid ${T.border.hover}`, padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}>Download</button>
          <button style={{ fontFamily: T.font.body, fontSize: 13, fontWeight: 500, color: T.text.dim, background: "transparent", border: `1px solid ${T.border.card}`, padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}>Share</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", background: T.bg.card, border: `1px solid ${T.border.card}`,
        borderRadius: 10, padding: "3px 3px 3px 16px",
      }}>
        <span style={{ fontFamily: T.font.mono, fontSize: 13, color: T.text.invisible, flexShrink: 0, marginRight: 8 }}>⌕</span>
        <input type="text" placeholder="Search videos... no SEO gaming, no sponsored results" style={{
          flex: 1, background: "none", border: "none", color: T.text.primary,
          fontFamily: T.font.body, fontSize: 14, padding: "10px 0", outline: "none", minWidth: 0,
        }} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {tags.map((t) => (
          <button key={t} onClick={() => setFilter(t)} style={{
            fontFamily: T.font.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em",
            color: filter === t ? T.text.primary : T.text.faint,
            background: filter === t ? T.border.card : "transparent",
            border: `1px solid ${T.border.card}`, borderRadius: 5,
            padding: "5px 10px", cursor: "pointer",
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {filtered.map((v) => (
          <div key={v.id} onClick={() => setSelectedVideo(v.id)} style={{
            background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12,
            overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s ease",
          }}>
            <VideoThumbnail video={v} size="large" />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontFamily: T.font.body, fontSize: 15, fontWeight: 500, color: T.text.primary, marginBottom: 4, lineHeight: 1.3 }}>{v.title}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint }}>{v.creator} · {v.published}</span>
                <QualityBadge value={v.quality} />
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {v.lengths.map((l) => (
                  <span key={l} style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost, background: T.bg.page, padding: "2px 6px", borderRadius: 3, border: `1px solid ${T.border.subtle}` }}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No algorithm notice */}
      <div style={{ textAlign: "center", padding: 16 }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.invisible }}>
          Sorted by confidence score · No algorithm manipulation · No sponsored placement
        </div>
      </div>
    </div>
  );
}

function CreateView() {
  const [prompt, setPrompt] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: T.font.headline, fontSize: 24, fontWeight: 700, color: T.text.primary, marginBottom: 6 }}>AI Video Generation</h2>
        <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.dim, lineHeight: 1.5 }}>
          Natural language → multi-length video export (30s, 2min, 5min, 10min). Describe what you want. The AI handles the rest.
        </p>
      </div>

      {/* Prompt input */}
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ height: 2, background: GRADIENT }} />
        <div style={{ padding: 22 }}>
          <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Describe your video</div>
          <textarea
            value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder="A 5-minute explainer about the Z-Framework. Start with a simple analogy, then build to the full equation. Use animated diagrams. Tone: curious but precise."
            rows={4}
            style={{
              width: "100%", background: T.bg.page, border: `1px solid ${T.border.card}`, borderRadius: 8,
              color: T.text.primary, fontFamily: T.font.body, fontSize: 14, padding: "14px 16px",
              resize: "vertical", outline: "none", lineHeight: 1.6, marginBottom: 14,
            }}
          />

          {/* Length selector */}
          <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Export Lengths</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {["30s", "2 min", "5 min", "10 min"].map((l, i) => (
              <button key={l} style={{
                fontFamily: T.font.mono, fontSize: 11, color: i < 3 ? T.text.primary : T.text.faint,
                background: i < 3 ? T.border.card : "transparent",
                border: `1px solid ${T.border.card}`, borderRadius: 6,
                padding: "8px 16px", cursor: "pointer",
              }}>
                {l}
              </button>
            ))}
          </div>

          <button style={{
            fontFamily: T.font.body, fontSize: 14, fontWeight: 500,
            color: prompt.trim() ? T.bg.page : T.text.faint,
            background: prompt.trim() ? T.text.primary : T.border.card,
            border: "none", padding: "12px 28px", borderRadius: 8,
            cursor: prompt.trim() ? "pointer" : "default", width: "100%",
          }}>
            Generate Video
          </button>
        </div>
      </div>

      {/* Presets */}
      <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Templates</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
        {GENERATE_PRESETS.map((p) => (
          <button key={p.label} onClick={() => setPrompt(`Create a ${p.label.toLowerCase()}: `)} style={{
            background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10,
            padding: 18, textAlign: "left", cursor: "pointer",
          }}>
            <div style={{ fontFamily: T.font.headline, fontSize: 15, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.faint, lineHeight: 1.4, marginBottom: 6 }}>{p.desc}</div>
            <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{p.duration}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StudioView() {
  const [selectedVideo, setSelectedVideo] = useState(VIDEOS[0]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: T.font.headline, fontSize: 24, fontWeight: 700, color: T.text.primary, marginBottom: 6 }}>Studio</h2>
        <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.dim, lineHeight: 1.5 }}>
          Edit, trim, add chapters, and export at multiple lengths.
        </p>
      </div>

      {/* Video selector */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
        {VIDEOS.slice(0, 4).map((v) => (
          <button key={v.id} onClick={() => setSelectedVideo(v)} style={{
            background: selectedVideo.id === v.id ? T.border.card : T.bg.card,
            border: `1px solid ${selectedVideo.id === v.id ? T.border.hover : T.border.card}`,
            borderRadius: 8, padding: "8px 14px", cursor: "pointer", flexShrink: 0,
            fontFamily: T.font.mono, fontSize: 11, color: selectedVideo.id === v.id ? T.text.primary : T.text.faint,
            whiteSpace: "nowrap",
          }}>
            {v.title.substring(0, 25)}...
          </button>
        ))}
      </div>

      {/* Preview */}
      <VideoThumbnail video={selectedVideo} size="large" />

      {/* Timeline */}
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: 18 }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Timeline</div>

        {/* Track lanes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
          {[
            { name: "Video", color: COLORS[4], width: "100%" },
            { name: "Audio", color: COLORS[0], width: "100%" },
            { name: "Voiceover", color: COLORS[2], width: "72%" },
            { name: "Captions", color: COLORS[5], width: "88%" },
          ].map((track) => (
            <div key={track.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, width: 60, flexShrink: 0 }}>{track.name}</span>
              <div style={{ flex: 1, height: 16, background: T.bg.page, borderRadius: 3, overflow: "hidden", border: `1px solid ${T.border.subtle}` }}>
                <div style={{ width: track.width, height: "100%", background: track.color, opacity: 0.2, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div style={{ width: "100%", height: 2, background: T.border.card, borderRadius: 1, position: "relative", marginBottom: 8 }}>
          <div style={{ position: "absolute", left: "35%", top: -3, width: 8, height: 8, borderRadius: "50%", background: T.text.primary, transform: "translateX(-50%)" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>0:00</span>
          <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint }}>4:22 / {selectedVideo.duration}</span>
          <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{selectedVideo.duration}</span>
        </div>
      </div>

      {/* Tools */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["Trim", "Chapters", "Captions", "Voiceover", "Transitions", "Export"].map((tool) => (
          <button key={tool} style={{
            fontFamily: T.font.mono, fontSize: 10, color: T.text.dim,
            background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 6,
            padding: "8px 16px", cursor: "pointer",
          }}>
            {tool}
          </button>
        ))}
      </div>

      {/* Multi-length export */}
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: 18 }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Multi-Length Export</div>
        <p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, marginBottom: 14, lineHeight: 1.5 }}>
          One edit session → AI generates versions at each length. It keeps the key moments and trims the rest.
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {selectedVideo.lengths.map((l, i) => (
            <div key={l} style={{
              background: T.bg.inset, border: `1px solid ${T.border.card}`, borderRadius: 8,
              padding: "12px 18px", textAlign: "center", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: COLORS[i % COLORS.length], opacity: 0.4 }} />
              <div style={{ fontFamily: T.font.headline, fontSize: 18, fontWeight: 700, color: T.text.primary }}>{l}</div>
              <div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost }}>version</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: T.font.headline, fontSize: 24, fontWeight: 700, color: T.text.primary, marginBottom: 6 }}>Creator Revenue Stack</h2>
        <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.dim, lineHeight: 1.5 }}>
          One video → five revenue streams. 80% to you. Not 45% like YouTube. Not 0.3% like Spotify.
        </p>
      </div>

      {/* Big number */}
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 14, padding: 28, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ height: 2, background: GRADIENT, position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ fontFamily: T.font.headline, fontSize: 64, fontWeight: 700, color: T.text.primary, lineHeight: 1 }}>80%</div>
        <div style={{ fontFamily: T.font.body, fontSize: 16, color: T.text.dim, marginTop: 8, marginBottom: 16 }}>creator revenue share on everything</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {[
            { platform: "YouTube", share: "55%" },
            { platform: "Roblox", share: "29%" },
            { platform: "Spotify", share: "~0.3%" },
            { platform: "RoadTube", share: "80%" },
          ].map((p) => (
            <div key={p.platform} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: T.font.headline, fontSize: 20, fontWeight: 700, color: p.platform === "RoadTube" ? T.text.primary : T.text.faint }}>{p.share}</div>
              <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{p.platform}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue streams */}
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", padding: "14px 18px", borderBottom: `1px solid ${T.border.card}` }}>Revenue Streams</div>
        {REVENUE_STREAMS.map((r, i) => (
          <div key={r.stream} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderBottom: i < REVENUE_STREAMS.length - 1 ? `1px solid ${T.border.subtle}` : "none",
            flexWrap: "wrap",
          }}>
            <div style={{ width: 4, height: 20, borderRadius: 1, background: COLORS[i], flexShrink: 0 }} />
            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              <div style={{ fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: T.text.secondary }}>{r.stream}</div>
              <div style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.faint }}>{r.desc}</div>
            </div>
            <span style={{ fontFamily: T.font.headline, fontSize: 20, fontWeight: 700, color: T.text.primary, flexShrink: 0 }}>{r.share}</span>
          </div>
        ))}
      </div>

      {/* Payout */}
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 22 }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Simulated Monthly Revenue</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
          {[
            { label: "Ad Revenue", value: "$1,240" },
            { label: "Tips", value: "$380" },
            { label: "Licensed Assets", value: "$560" },
            { label: "Course Sales", value: "$890" },
            { label: "Downloads", value: "$220" },
            { label: "Total", value: "$3,290" },
          ].map((s) => (
            <div key={s.label} style={{
              background: s.label === "Total" ? T.border.card : T.bg.inset,
              border: `1px solid ${s.label === "Total" ? T.border.hover : T.border.subtle}`,
              borderRadius: 8, padding: 14, textAlign: "center",
            }}>
              <div style={{ fontFamily: T.font.headline, fontSize: s.label === "Total" ? 24 : 18, fontWeight: 700, color: T.text.primary }}>{s.value}</div>
              <div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Export audience */}
      <div style={{ background: T.bg.inset, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary, marginBottom: 2 }}>Your audience is yours.</div>
          <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.faint }}>Export your entire subscriber list with contact info. Anytime. No lock-in.</div>
        </div>
        <button style={{
          fontFamily: T.font.body, fontSize: 13, fontWeight: 500,
          color: T.bg.page, background: T.text.primary, border: "none",
          padding: "10px 22px", borderRadius: 7, cursor: "pointer", flexShrink: 0,
        }}>
          Export Audience
        </button>
      </div>
    </div>
  );
}

export default function RoadTubeApp() {
  const [activeView, setActiveView] = useState("browse");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #333; }
        input:focus, textarea:focus { border-color: #262626 !important; outline: none; }
        button:hover { opacity: 0.88; }
      `}</style>

      <div style={{ background: T.bg.page, minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: T.font.body, color: T.text.primary }}>
        <GradientBar />
        <Nav activeView={activeView} setActiveView={setActiveView} />

        <div style={{ padding: "20px 16px 80px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {activeView === "browse" && <BrowseView />}
            {activeView === "create" && <CreateView />}
            {activeView === "studio" && <StudioView />}
            {activeView === "revenue" && <RevenueView />}
          </div>
        </div>
      </div>
    </>
  );
}
