import { useState, useRef, useEffect } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const SCENE_OBJECTS = [
  { id: 1, name: "Terrain", type: "mesh", visible: true, locked: false },
  { id: 2, name: "Mountains", type: "mesh", visible: true, locked: false },
  { id: 3, name: "Pine Forest", type: "group", visible: true, locked: false },
  { id: 4, name: "River", type: "particle", visible: true, locked: false },
  { id: 5, name: "Cabin", type: "mesh", visible: true, locked: false },
  { id: 6, name: "Campfire", type: "light+particle", visible: true, locked: false },
  { id: 7, name: "Sky Dome", type: "environment", visible: true, locked: true },
  { id: 8, name: "Ambient Audio", type: "audio", visible: true, locked: false },
];

const COMMAND_HISTORY = [
  { input: "create terrain 200x200 with rolling hills", output: "Terrain generated. 200×200 units, perlin noise hills, grass material applied.", time: "2m ago" },
  { input: "add mountain range along the north edge", output: "Mountain range added. 12 peaks, snow caps above 80% height, rock material below.", time: "4m ago" },
  { input: "scatter pine trees across the hills, denser near water", output: "Pine Forest group created. 847 instances, density weighted by proximity to River path.", time: "5m ago" },
  { input: "add a river flowing from the mountains to the south", output: "River particle system created. Spline path from Mountains to south edge, flow speed 2.4m/s, foam particles at rapids.", time: "7m ago" },
  { input: "place a small cabin near the river bend", output: "Cabin mesh placed at river bend. Procedural log cabin, 6×4m footprint, chimney included.", time: "9m ago" },
  { input: "add a campfire next to the cabin with warm light", output: "Campfire created. Point light (warm 2700K, radius 8m), fire particle system, ember particles, crackle audio.", time: "10m ago" },
  { input: "make the sky sunset, golden hour", output: "Sky Dome updated. Sun angle 12°, color temperature 3200K, volumetric clouds enabled, god rays active.", time: "11m ago" },
  { input: "add ambient forest sounds — birds, wind, water", output: "Ambient Audio added. 3 spatial audio sources: birdsong (randomized), wind (directional), river flow (proximity-based).", time: "12m ago" },
];

const PHYSICS_SETTINGS = [
  { name: "Gravity", value: "9.81 m/s²", desc: "Standard earth gravity" },
  { name: "Wind", value: "2.4 m/s NW", desc: "Affects particles and trees" },
  { name: "Water Flow", value: "2.4 m/s", desc: "River current speed" },
  { name: "Collision", value: "Mesh + Terrain", desc: "All solid objects" },
  { name: "Time of Day", value: "6:42 PM", desc: "Golden hour" },
];

const EXPORT_TARGETS = [
  { platform: "Web", format: "WebGL / WASM", size: "~18MB", status: "ready" },
  { platform: "iOS", format: "Metal", size: "~42MB", status: "ready" },
  { platform: "Android", format: "Vulkan", size: "~38MB", status: "ready" },
  { platform: "Desktop", format: "Native", size: "~64MB", status: "ready" },
  { platform: "VR", format: "OpenXR", size: "~72MB", status: "beta" },
];

const ASSET_LIBRARY = [
  { name: "Pine Tree", category: "vegetation", variants: 12 },
  { name: "Rock Formation", category: "terrain", variants: 8 },
  { name: "Log Cabin", category: "structures", variants: 4 },
  { name: "Campfire", category: "effects", variants: 3 },
  { name: "Water Shader", category: "materials", variants: 6 },
  { name: "Sky Dome", category: "environment", variants: 14 },
  { name: "Birdsong", category: "audio", variants: 20 },
  { name: "Footsteps", category: "audio", variants: 8 },
];

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function TypeIcon({ type }) {
  const icons = { mesh: "△", group: "◫", particle: "✦", "light+particle": "◉", environment: "◍", audio: "♫" };
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", width: 16, display: "inline-block", textAlign: "center" }}>
      {icons[type] || "·"}
    </span>
  );
}

function Nav({ activePanel, setActivePanel }) {
  const panels = ["scene", "command", "physics", "assets", "export"];
  return (
    <nav style={{
      padding: "0 16px", height: 48, display: "flex", alignItems: "center",
      justifyContent: "space-between", borderBottom: "1px solid #1a1a1a",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {COLORS.map((c) => <div key={c} style={{ width: 3, height: 12, borderRadius: 1, background: c }} />)}
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>Genesis Road</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#262626", marginLeft: 2 }}>v0.1</span>
      </div>
      <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
        {panels.map((p) => (
          <button key={p} onClick={() => setActivePanel(p)} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.06em",
            color: activePanel === p ? "#f5f5f5" : "#404040",
            background: activePanel === p ? "#1a1a1a" : "transparent",
            border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
            {p}
          </button>
        ))}
      </div>
    </nav>
  );
}

function ViewportPlaceholder() {
  return (
    <div style={{
      background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12,
      height: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", marginBottom: 14,
    }}>
      {/* Fake 3D grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${(i / 12) * 100}%`, height: 1, background: "#fff" }} />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${(i / 16) * 100}%`, width: 1, background: "#fff" }} />
        ))}
      </div>

      {/* Scene indicator */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 12 }}>
          {COLORS.map((c) => <div key={c} style={{ width: 4, height: 4, borderRadius: "50%", background: c, opacity: 0.4 }} />)}
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 4 }}>3D Viewport</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#1a1a1a" }}>Mountain Cabin Scene · 8 objects · golden hour</div>
      </div>

      {/* Viewport controls */}
      <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 4 }}>
        {["orbit", "pan", "zoom", "focus"].map((c) => (
          <span key={c} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#262626",
            background: "#0a0a0a", border: "1px solid #151515", borderRadius: 4,
            padding: "3px 8px",
          }}>
            {c}
          </span>
        ))}
      </div>

      {/* FPS counter */}
      <div style={{ position: "absolute", top: 12, right: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#262626" }}>
        60 fps · 12.4K tris
      </div>
    </div>
  );
}

function ScenePanel() {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ViewportPlaceholder />

      {/* Scene hierarchy */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em" }}>Scene Hierarchy</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#262626" }}>{SCENE_OBJECTS.length} objects</span>
        </div>
        {SCENE_OBJECTS.map((obj, i) => (
          <div
            key={obj.id}
            onClick={() => setSelected(selected === obj.id ? null : obj.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 16px",
              borderBottom: i < SCENE_OBJECTS.length - 1 ? "1px solid #111" : "none",
              background: selected === obj.id ? "#1a1a1a" : "transparent",
              cursor: "pointer",
            }}
          >
            <TypeIcon type={obj.type} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: selected === obj.id ? "#f5f5f5" : "#a3a3a3", flex: 1 }}>{obj.name}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#262626" }}>{obj.type}</span>
            {obj.locked && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#1a1a1a" }}>🔒</span>}
          </div>
        ))}
      </div>

      {/* Properties (when selected) */}
      {selected && (() => {
        const obj = SCENE_OBJECTS.find((o) => o.id === selected);
        return (
          <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 18 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Properties — {obj.name}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2.2, color: "#525252" }}>
              <div><span style={{ color: "#333" }}>type:</span> <span style={{ color: "#a3a3a3" }}>{obj.type}</span></div>
              <div><span style={{ color: "#333" }}>visible:</span> <span style={{ color: "#a3a3a3" }}>{String(obj.visible)}</span></div>
              <div><span style={{ color: "#333" }}>locked:</span> <span style={{ color: "#a3a3a3" }}>{String(obj.locked)}</span></div>
              <div><span style={{ color: "#333" }}>position:</span> <span style={{ color: "#a3a3a3" }}>0, 0, 0</span></div>
              <div><span style={{ color: "#333" }}>scale:</span> <span style={{ color: "#a3a3a3" }}>1, 1, 1</span></div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", background: "none", border: "1px solid #1a1a1a", borderRadius: 5, padding: "5px 12px", cursor: "pointer" }}>Edit</button>
              <button style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", background: "none", border: "1px solid #1a1a1a", borderRadius: 5, padding: "5px 12px", cursor: "pointer" }}>Duplicate</button>
              <button style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", background: "none", border: "1px solid #1a1a1a", borderRadius: 5, padding: "5px 12px", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function CommandPanel() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState(COMMAND_HISTORY);
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const newEntry = {
      input: input,
      output: `Processing: "${input}" — generating scene modifications...`,
      time: "just now",
    };
    setHistory([newEntry, ...history]);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ViewportPlaceholder />

      {/* Command input */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {COLORS.slice(0, 3).map((c) => <div key={c} style={{ width: 3, height: 8, borderRadius: 1, background: c }} />)}
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em" }}>Natural Language Console</span>
        </div>

        <div style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#262626", flexShrink: 0, paddingTop: 8 }}>❯</span>
          <input
            ref={inputRef}
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Describe what you want... 'Add a waterfall flowing off the mountain'"
            style={{
              flex: 1, background: "none", border: "none", color: "#f5f5f5",
              fontFamily: "'Inter', sans-serif", fontSize: 14, padding: "8px 0",
              outline: "none", minWidth: 0,
            }}
          />
          <button onClick={handleSubmit} style={{
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
            color: "#0a0a0a", background: "#f5f5f5", border: "none",
            padding: "8px 18px", borderRadius: 7, cursor: "pointer", flexShrink: 0,
          }}>
            Generate
          </button>
        </div>

        {/* Suggestions */}
        <div style={{ padding: "0 16px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Add a waterfall", "Make gravity floaty", "Make it night time", "Add rain", "Make this co-op"].map((s) => (
            <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }} style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333",
              background: "transparent", border: "1px solid #151515", borderRadius: 4,
              padding: "4px 10px", cursor: "pointer",
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Command history */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em" }}>History</span>
        </div>
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {history.map((h, i) => (
            <div key={i} style={{ padding: "12px 16px", borderBottom: i < history.length - 1 ? "1px solid #111" : "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#262626", flexShrink: 0 }}>❯</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#d4d4d4", lineHeight: 1.4 }}>{h.input}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#1a1a1a", marginLeft: "auto", flexShrink: 0 }}>{h.time}</span>
              </div>
              <div style={{ paddingLeft: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040", lineHeight: 1.5 }}>
                {h.output}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhysicsPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ViewportPlaceholder />

      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Physics</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>
          Describe it, don't configure it. "Make gravity floaty" → physics adjusts. No inspector panels.
        </p>
      </div>

      {/* Physics command */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 16, display: "flex", gap: 8 }}>
        <input type="text" placeholder='"Make the wind stronger" or "Add water physics"' style={{
          flex: 1, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 7,
          color: "#f5f5f5", fontFamily: "'Inter', sans-serif", fontSize: 13,
          padding: "10px 14px", outline: "none", minWidth: 0,
        }} />
        <button style={{
          fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
          color: "#0a0a0a", background: "#f5f5f5", border: "none",
          padding: "10px 18px", borderRadius: 7, cursor: "pointer", flexShrink: 0,
        }}>Apply</button>
      </div>

      {/* Current settings */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em" }}>Active Parameters</span>
        </div>
        {PHYSICS_SETTINGS.map((p, i) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < PHYSICS_SETTINGS.length - 1 ? "1px solid #111" : "none" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#a3a3a3", flex: "1 1 120px" }}>{p.name}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#d4d4d4", flex: "1 1 120px" }}>{p.value}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", flex: "1 1 140px" }}>{p.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetsPanel() {
  const [filter, setFilter] = useState("all");
  const categories = ["all", ...new Set(ASSET_LIBRARY.map((a) => a.category))];
  const filtered = filter === "all" ? ASSET_LIBRARY : ASSET_LIBRARY.filter((a) => a.category === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Asset Library</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>
          Drag into scene or reference by name in the command console.
        </p>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input type="text" placeholder="Search assets..." style={{
          flex: "1 1 200px", background: "#131313", border: "1px solid #1a1a1a", borderRadius: 8,
          color: "#f5f5f5", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
          padding: "9px 14px", outline: "none", minWidth: 0,
        }} />
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            textTransform: "uppercase", letterSpacing: "0.04em",
            color: filter === c ? "#f5f5f5" : "#404040",
            background: filter === c ? "#1a1a1a" : "transparent",
            border: "1px solid #1a1a1a", borderRadius: 5,
            padding: "5px 10px", cursor: "pointer",
          }}>
            {c}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
        {filtered.map((a) => (
          <div key={a.name} style={{
            background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10,
            padding: 16, cursor: "pointer",
          }}>
            {/* Placeholder thumbnail */}
            <div style={{
              width: "100%", height: 80, background: "#0a0a0a", borderRadius: 6,
              border: "1px solid #151515", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: "#1a1a1a", marginBottom: 10,
            }}>
              {a.category === "vegetation" ? "🌲" : a.category === "terrain" ? "⛰" : a.category === "structures" ? "🏠" : a.category === "effects" ? "✨" : a.category === "materials" ? "◆" : a.category === "environment" ? "☁" : "♫"}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#d4d4d4", marginBottom: 2 }}>{a.name}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>{a.variants} variants · {a.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Export Everywhere</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>
          Web, iOS, Android, Desktop, VR — one click. Your game runs everywhere.
        </p>
      </div>

      {/* Targets */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {EXPORT_TARGETS.map((t, i) => (
          <div key={t.platform} style={{
            background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10,
            padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: COLORS[i], opacity: 0.5 }} />

            <div style={{ flex: "1 1 180px", minWidth: 0, paddingLeft: 6 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: "#f5f5f5", marginBottom: 2 }}>{t.platform}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040" }}>{t.format} · {t.size}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {t.status === "beta" && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#404040", background: "#0f0f0f", padding: "3px 8px", borderRadius: 3, border: "1px solid #1a1a1a", textTransform: "uppercase" }}>beta</span>
              )}
              <button style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                color: "#0a0a0a", background: "#f5f5f5", border: "none",
                padding: "8px 18px", borderRadius: 7, cursor: "pointer",
              }}>
                Build
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Multiplayer */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, padding: 22 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Instant Multiplayer</div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.6, marginBottom: 16 }}>
          Say "Make this co-op" and networking scaffolding auto-generates. Player sync, state management, lobby system — all from one command.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
            color: "#0a0a0a", background: "#f5f5f5", border: "none",
            padding: "10px 22px", borderRadius: 7, cursor: "pointer",
          }}>
            Enable Multiplayer
          </button>
          <button style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
            color: "#525252", background: "transparent", border: "1px solid #1a1a1a",
            padding: "10px 22px", borderRadius: 7, cursor: "pointer",
          }}>
            Test Locally
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GenesisRoadApp() {
  const [activePanel, setActivePanel] = useState("command");

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
        input:focus { border-color: #262626 !important; outline: none; }
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <GradientBar />
        <Nav activePanel={activePanel} setActivePanel={setActivePanel} />

        <div style={{ padding: "20px 16px 80px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {activePanel === "scene" && <ScenePanel />}
            {activePanel === "command" && <CommandPanel />}
            {activePanel === "physics" && <PhysicsPanel />}
            {activePanel === "assets" && <AssetsPanel />}
            {activePanel === "export" && <ExportPanel />}
          </div>
        </div>
      </div>
    </>
  );
}
