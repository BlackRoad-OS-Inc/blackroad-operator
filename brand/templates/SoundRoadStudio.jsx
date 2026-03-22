import { useState, useEffect, useRef } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const TRACKS = [
  {
    id: 1, title: "2am Rain", bpm: 92, key: "C minor", duration: "3:42",
    status: "mastered", stems: 6, created: "2h ago",
    vibe: "Sad piano, rain on a window, 2am alone in a city",
    stems_list: [
      { name: "Piano", color: COLORS[4], volume: 82, muted: false },
      { name: "Rain Ambience", color: COLORS[5], volume: 45, muted: false },
      { name: "Sub Bass", color: COLORS[3], volume: 60, muted: false },
      { name: "Lo-fi Drums", color: COLORS[0], volume: 55, muted: false },
      { name: "Vinyl Crackle", color: COLORS[2], volume: 20, muted: false },
      { name: "Pad Wash", color: COLORS[1], volume: 38, muted: true },
    ],
  },
  {
    id: 2, title: "Golden Hour Drive", bpm: 108, key: "G major", duration: "4:18",
    status: "mixing", stems: 5, created: "Yesterday",
    vibe: "Windows down, sunset highway, warm synths, feeling free",
    stems_list: [
      { name: "Synth Lead", color: COLORS[0], volume: 75, muted: false },
      { name: "Driving Bass", color: COLORS[3], volume: 68, muted: false },
      { name: "808 Drums", color: COLORS[1], volume: 70, muted: false },
      { name: "Guitar Layer", color: COLORS[4], volume: 50, muted: false },
      { name: "Wind Texture", color: COLORS[5], volume: 25, muted: false },
    ],
  },
  {
    id: 3, title: "Meridian's Theme", bpm: 72, key: "D minor", duration: "2:56",
    status: "draft", stems: 3, created: "3 days ago",
    vibe: "Orchestral, architectural, building something vast and precise",
    stems_list: [
      { name: "Strings", color: COLORS[2], volume: 80, muted: false },
      { name: "Cello Solo", color: COLORS[3], volume: 65, muted: false },
      { name: "Timpani", color: COLORS[0], volume: 40, muted: false },
    ],
  },
];

const MARKETPLACE_ITEMS = [
  { title: "Lo-fi Piano Kit", creator: "cadence", price: "$4.99", downloads: 842, type: "stems" },
  { title: "Ambient Rain Collection", creator: "cadence", price: "$2.99", downloads: 1204, type: "samples" },
  { title: "Cinematic Strings Vol. 1", creator: "alexa", price: "$7.99", downloads: 356, type: "stems" },
  { title: "808 Essentials", creator: "community", price: "Free", downloads: 3420, type: "drums" },
  { title: "Vinyl Texture Pack", creator: "cadence", price: "$1.99", downloads: 678, type: "fx" },
];

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function VolumeBar({ value, color }) {
  return (
    <div style={{ width: "100%", height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color || "#404040", borderRadius: 2, transition: "width 0.3s ease", opacity: 0.6 }} />
    </div>
  );
}

function WaveformPlaceholder({ color = "#262626", height = 40, animated = false }) {
  const bars = 48;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1, height, justifyContent: "center" }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = Math.sin(i * 0.4) * 0.4 + Math.random() * 0.4 + 0.2;
        return (
          <div key={i} style={{
            width: 2, borderRadius: 1, flexShrink: 0,
            height: `${h * 100}%`,
            background: color,
            opacity: animated ? undefined : 0.6,
            animation: animated ? `wave-bar 1.2s ease-in-out ${i * 0.03}s infinite alternate` : "none",
          }} />
        );
      })}
    </div>
  );
}

function Nav({ activeView, setActiveView }) {
  const views = ["studio", "library", "create", "market"];
  return (
    <nav style={{
      padding: "0 16px", height: 48, display: "flex", alignItems: "center",
      justifyContent: "space-between", borderBottom: "1px solid #1a1a1a",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {COLORS.map((c) => <div key={c} style={{ width: 3, height: 12, borderRadius: 1, background: c }} />)}
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>SoundRoad</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS[0] }} />
          cadence online
        </span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {views.map((v) => (
          <button key={v} onClick={() => setActiveView(v)} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.06em",
            color: activeView === v ? "#f5f5f5" : "#404040",
            background: activeView === v ? "#1a1a1a" : "transparent",
            border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
            {v}
          </button>
        ))}
      </div>
    </nav>
  );
}

function StudioView() {
  const [activeTrack, setActiveTrack] = useState(TRACKS[0]);
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Now playing */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ height: 2, background: GRADIENT }} />
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, color: "#f5f5f5", marginBottom: 4 }}>{activeTrack.title}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040" }}>
                {activeTrack.bpm} BPM · {activeTrack.key} · {activeTrack.duration}
              </div>
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: activeTrack.status === "mastered" ? "#a3a3a3" : "#404040",
              background: activeTrack.status === "mastered" ? "#1a1a1a" : "#111",
              padding: "4px 10px", borderRadius: 4, border: "1px solid #1a1a1a",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {activeTrack.status}
            </span>
          </div>

          {/* Vibe description */}
          <div style={{ background: "#0a0a0a", border: "1px solid #151515", borderRadius: 8, padding: "12px 16px", marginBottom: 18 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#262626", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Vibe</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", fontStyle: "italic" }}>{activeTrack.vibe}</div>
          </div>

          {/* Waveform */}
          <div style={{ marginBottom: 16, background: "#0a0a0a", borderRadius: 8, padding: "12px 16px" }}>
            <WaveformPlaceholder color={playing ? "#525252" : "#1a1a1a"} height={48} animated={playing} />
          </div>

          {/* Transport */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
            <button style={{ background: "none", border: "none", color: "#404040", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>⏮</button>
            <button
              onClick={() => setPlaying(!playing)}
              style={{
                width: 44, height: 44, borderRadius: 10, border: "none", cursor: "pointer",
                background: "#f5f5f5", color: "#0a0a0a",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 16,
              }}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <button style={{ background: "none", border: "none", color: "#404040", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>⏭</button>
          </div>

          {/* Stems mixer */}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Stems</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {activeTrack.stems_list.map((s) => (
              <div key={s.name} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                background: "#0a0a0a", borderRadius: 6, border: "1px solid #151515",
                opacity: s.muted ? 0.3 : 1,
              }}>
                <div style={{ width: 4, height: 18, borderRadius: 1, background: s.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#d4d4d4", width: 100, flexShrink: 0 }}>{s.name}</span>
                <div style={{ flex: 1 }}>
                  <VolumeBar value={s.volume} color={s.color} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", width: 28, textAlign: "right" }}>{s.volume}%</span>
                <button style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: s.muted ? "#333" : "#525252",
                  background: "none", border: "1px solid #1a1a1a", borderRadius: 4,
                  padding: "3px 8px", cursor: "pointer",
                }}>
                  {s.muted ? "M" : "S"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 18 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>One-Click Distribution</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Spotify", "Apple Music", "YouTube Music", "SoundCloud", "Marketplace"].map((p) => (
            <button key={p} style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252",
              background: "transparent", border: "1px solid #1a1a1a", borderRadius: 6,
              padding: "7px 14px", cursor: "pointer",
            }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LibraryView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Library</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>
          Every track you've created. Every melody you hummed at 2am.
        </p>
      </div>

      {TRACKS.map((t, i) => (
        <div key={t.id} style={{
          background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12,
          padding: "18px 20px", position: "relative", overflow: "hidden", cursor: "pointer",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: COLORS[i * 2] }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ paddingLeft: 6 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#f5f5f5", marginBottom: 2 }}>{t.title}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040" }}>
                {t.bpm} BPM · {t.key} · {t.duration} · {t.stems} stems
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: t.status === "mastered" ? "#a3a3a3" : "#404040",
                background: "#0a0a0a", padding: "3px 8px", borderRadius: 3, border: "1px solid #1a1a1a",
                textTransform: "uppercase",
              }}>
                {t.status}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#262626" }}>{t.created}</span>
            </div>
          </div>

          <div style={{ paddingLeft: 6, marginBottom: 10 }}>
            <WaveformPlaceholder color={COLORS[i * 2]} height={28} />
          </div>

          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", fontStyle: "italic", paddingLeft: 6 }}>
            "{t.vibe}"
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateView() {
  const [mode, setMode] = useState(null);
  const [vibeText, setVibeText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Create</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>
          Music production has a 10,000-hour gatekeeping problem. By the time you learn the DAW, the melody is gone. Not here.
        </p>
      </div>

      {/* Mode selector */}
      {!mode && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {[
            { id: "hum", title: "Hum to Track", desc: "Hum or sing a melody. Cadence turns it into a full arrangement.", icon: "🎤" },
            { id: "vibe", title: "Vibe-Based", desc: "Describe the feeling. 'Sad piano, 2am, rain on a window.' That's enough.", icon: "✦" },
            { id: "stems", title: "Stems on Demand", desc: "Request specific parts. 'Drums like Billie Eilish's producer.' Done.", icon: "⊞" },
            { id: "remix", title: "Remix Existing", desc: "Take any track from your library and reimagine it.", icon: "↻" },
          ].map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12,
              padding: 22, textAlign: "left", cursor: "pointer",
            }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{m.icon}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>{m.title}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252", lineHeight: 1.5 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Hum mode */}
      {mode === "hum" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setMode(null)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>← back</button>

          <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, padding: 28, textAlign: "center" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#f5f5f5", marginBottom: 8 }}>Hum to Track</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", marginBottom: 28 }}>
              Hum your melody. Cadence listens, transcribes, and arranges.
            </p>

            {/* Record button */}
            <button
              onClick={() => setIsRecording(!isRecording)}
              style={{
                width: 80, height: 80, borderRadius: 20, border: "none", cursor: "pointer",
                background: isRecording ? "#f5f5f5" : "#1a1a1a",
                color: isRecording ? "#0a0a0a" : "#f5f5f5",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 24,
                transition: "all 0.2s ease",
              }}
            >
              {isRecording ? "■" : "●"}
            </button>

            {isRecording && (
              <div style={{ marginBottom: 16 }}>
                <WaveformPlaceholder color={COLORS[1]} height={36} animated={true} />
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", marginTop: 8 }}>
                  Listening... hum or sing your melody
                </div>
              </div>
            )}

            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#333" }}>
              Then describe the arrangement: "Like a sad piano" → your hummed melody plays back as emotional piano
            </div>
          </div>
        </div>
      )}

      {/* Vibe mode */}
      {mode === "vibe" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setMode(null)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>← back</button>

          <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, padding: 24 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 8 }}>Describe the Vibe</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", marginBottom: 20 }}>
              No music theory needed. Just describe how it should feel.
            </p>

            <textarea
              value={vibeText}
              onChange={(e) => setVibeText(e.target.value)}
              placeholder="Make it sound more like 2am in a city. Lonely but not sad. Piano and rain. Maybe some vinyl crackle..."
              rows={4}
              style={{
                width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8,
                color: "#f5f5f5", fontFamily: "'Inter', sans-serif", fontSize: 14, padding: "14px 16px",
                resize: "vertical", outline: "none", lineHeight: 1.6, marginBottom: 14,
              }}
            />

            {/* Quick vibes */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {["Sunset highway", "Rainy café", "Epic cinematic", "Late night coding", "Morning calm", "Dance floor"].map((v) => (
                <button key={v} onClick={() => setVibeText(v)} style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040",
                  background: "transparent", border: "1px solid #1a1a1a", borderRadius: 5,
                  padding: "5px 12px", cursor: "pointer",
                }}>
                  {v}
                </button>
              ))}
            </div>

            <button style={{
              fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
              color: vibeText.trim() ? "#0a0a0a" : "#404040",
              background: vibeText.trim() ? "#f5f5f5" : "#1a1a1a",
              border: "none", padding: "12px 28px", borderRadius: 8, cursor: vibeText.trim() ? "pointer" : "default",
              width: "100%",
            }}>
              Generate Track
            </button>
          </div>
        </div>
      )}

      {/* Stems mode */}
      {mode === "stems" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setMode(null)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>← back</button>

          <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, padding: 24 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 8 }}>Stems on Demand</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", marginBottom: 20 }}>
              Request specific parts in plain language. Cadence generates original stems.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Drums like Billie Eilish's producer", "Warm analog bass, 92 BPM", "Ambient pad, C minor, very slow", "Acoustic guitar, fingerpicked, melancholy"].map((s) => (
                <div key={s} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                  background: "#0a0a0a", borderRadius: 8, border: "1px solid #151515",
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#262626", flexShrink: 0 }}>❯</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#a3a3a3", flex: 1 }}>{s}</span>
                  <button style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
                    color: "#0a0a0a", background: "#f5f5f5", border: "none",
                    padding: "6px 14px", borderRadius: 6, cursor: "pointer", flexShrink: 0,
                  }}>
                    Generate
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <input type="text" placeholder="Or type your own stem request..." style={{
                flex: 1, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8,
                color: "#f5f5f5", fontFamily: "'Inter', sans-serif", fontSize: 13,
                padding: "10px 14px", outline: "none", minWidth: 0,
              }} />
              <button style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                color: "#0a0a0a", background: "#f5f5f5", border: "none",
                padding: "10px 18px", borderRadius: 7, cursor: "pointer", flexShrink: 0,
              }}>Go</button>
            </div>
          </div>
        </div>
      )}

      {mode === "remix" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setMode(null)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>← back</button>
          <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, padding: 24, textAlign: "center" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 8 }}>Remix</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", marginBottom: 20 }}>Select a track from your library, then describe the remix.</p>
            {TRACKS.map((t) => (
              <button key={t.id} style={{
                display: "block", width: "100%", textAlign: "left", background: "#0a0a0a",
                border: "1px solid #1a1a1a", borderRadius: 8, padding: "12px 16px",
                marginBottom: 6, cursor: "pointer",
              }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#d4d4d4" }}>{t.title}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", marginLeft: 10 }}>{t.key} · {t.bpm} BPM</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MarketView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Marketplace</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>
          Sell beats. Buy stems. 80% creator revenue. One video → ad revenue + tips + licensed assets.
        </p>
      </div>

      <input type="text" placeholder="Search stems, samples, presets..." style={{
        width: "100%", background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10,
        color: "#f5f5f5", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
        padding: "12px 16px", outline: "none",
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {MARKETPLACE_ITEMS.map((item, i) => (
          <div key={i} style={{
            background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10,
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          }}>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500, color: "#f5f5f5", marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040" }}>
                by {item.creator} · {item.downloads.toLocaleString()} downloads · {item.type}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: item.price === "Free" ? "#a3a3a3" : "#f5f5f5" }}>{item.price}</span>
              <button style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                color: "#0a0a0a", background: "#f5f5f5", border: "none",
                padding: "8px 16px", borderRadius: 7, cursor: "pointer",
              }}>
                {item.price === "Free" ? "Get" : "Buy"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue callout */}
      <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: 22, textAlign: "center" }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: "#f5f5f5", marginBottom: 4 }}>80%</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", marginBottom: 8 }}>creator revenue share</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333" }}>
          Compare: Spotify ~0.3% · YouTube ~55% · Roblox ~29%
        </div>
      </div>
    </div>
  );
}

export default function SoundRoadApp() {
  const [activeView, setActiveView] = useState("studio");

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
        @keyframes wave-bar { 0% { transform: scaleY(0.3); } 100% { transform: scaleY(1); } }
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <GradientBar />
        <Nav activeView={activeView} setActiveView={setActiveView} />

        <div style={{ padding: "20px 16px 80px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            {activeView === "studio" && <StudioView />}
            {activeView === "library" && <LibraryView />}
            {activeView === "create" && <CreateView />}
            {activeView === "market" && <MarketView />}
          </div>
        </div>
      </div>
    </>
  );
}
