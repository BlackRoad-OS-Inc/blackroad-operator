import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const ROLES = [
  { id: "creator", label: "Creator", desc: "Music, video, design, writing — you make things." },
  { id: "student", label: "Student", desc: "Learning, homework, research — you're building knowledge." },
  { id: "teacher", label: "Teacher", desc: "Curriculum, grading, tutoring — you guide others." },
  { id: "developer", label: "Developer", desc: "Code, APIs, infrastructure — you build systems." },
  { id: "researcher", label: "Researcher", desc: "Math, physics, quantum — you push boundaries." },
  { id: "founder", label: "Founder", desc: "Business, strategy, product — you're building something." },
];

const INTERESTS = [
  "AI Agents", "Music Production", "Game Dev", "Mathematics",
  "Quantum Computing", "Education", "Automation", "Video",
  "Finance", "Writing", "Open Source", "Hardware",
  "3D Worlds", "Social", "Privacy", "Blockchain",
];

const AGENTS_POOL = [
  { name: "lucidia", role: "Core Intelligence", desc: "Conversation, reasoning, code. Your primary thinking partner.", color: COLORS[1] },
  { name: "cecilia", role: "Memory", desc: "Remembers everything. Persistent journals. Nothing lost.", color: COLORS[2] },
  { name: "cadence", role: "Music", desc: "Hum a melody, describe a vibe — she makes it real.", color: COLORS[0] },
  { name: "meridian", role: "Architecture", desc: "System design, planning, capability mapping.", color: COLORS[3] },
  { name: "radius", role: "Physics", desc: "Simulation, calculation, scientific reasoning.", color: COLORS[4] },
  { name: "eve", role: "Monitoring", desc: "Watches your systems. Alerts before things break.", color: COLORS[5] },
];

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function Input({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{
          background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8,
          color: "#f5f5f5", fontFamily: "'Inter', sans-serif", fontSize: 14,
          padding: "12px 16px", outline: "none", width: "100%",
        }}
      />
    </div>
  );
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(null);
  const [interests, setInterests] = useState([]);
  const [workspace, setWorkspace] = useState("");
  const [selectedAgents, setSelectedAgents] = useState(["lucidia"]);

  const toggleInterest = (i) => setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  const toggleAgent = (a) => setSelectedAgents((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const steps = [
    { num: "01", label: "Identity" },
    { num: "02", label: "Role" },
    { num: "03", label: "Interests" },
    { num: "04", label: "Workspace" },
    { num: "05", label: "Agents" },
    { num: "06", label: "Launch" },
  ];

  const canProceed = () => {
    if (step === 0) return name.length > 0;
    if (step === 1) return role !== null;
    if (step === 2) return interests.length > 0;
    if (step === 3) return workspace.length > 0;
    if (step === 4) return selectedAgents.length > 0;
    return true;
  };

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
        input:focus { border-color: #262626 !important; }
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5", display: "flex", flexDirection: "column" }}>
        <GradientBar />

        {/* Header */}
        <header style={{ padding: "0 20px", height: 52, display: "flex", alignItems: "center", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {COLORS.map((c) => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>BlackRoad</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginLeft: 4 }}>Setup</span>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 20px 48px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>

            {/* Progress bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                  <div
                    onClick={() => i < step && setStep(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      cursor: i < step ? "pointer" : "default",
                      opacity: i <= step ? 1 : 0.25,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500,
                      background: i < step ? "#f5f5f5" : i === step ? "#1a1a1a" : "transparent",
                      color: i < step ? "#0a0a0a" : "#f5f5f5",
                      border: i === step ? "1px solid #262626" : "1px solid transparent",
                    }}>
                      {i < step ? "✓" : s.num}
                    </div>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: i === step ? "#a3a3a3" : "#404040",
                      display: i === step || i < step ? "inline" : "none",
                    }}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 1, margin: "0 8px", background: i < step ? "#262626" : "#141414" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div style={{ flex: 1 }}>

              {/* Step 0: Identity */}
              {step === 0 && (
                <div>
                  <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 8 }}>
                    Welcome to BlackRoad.
                  </h1>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.6, marginBottom: 36, maxWidth: 420 }}>
                    You bring your chaos, your curiosity, your half-finished dreams. BlackRoad brings structure, compute, and care.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 360 }}>
                    <Input label="Display Name" placeholder="What should we call you?" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input label="Email" placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Step 1: Role */}
              {step === 1 && (
                <div>
                  <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 8 }}>
                    What describes you best?
                  </h1>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", marginBottom: 28 }}>
                    This shapes your default workspace. You can change it anytime.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        style={{
                          background: role === r.id ? "#f5f5f5" : "#131313",
                          color: role === r.id ? "#0a0a0a" : "#f5f5f5",
                          border: `1px solid ${role === r.id ? "#f5f5f5" : "#1a1a1a"}`,
                          borderRadius: 10, padding: 18, textAlign: "left",
                          cursor: "pointer", transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{r.label}</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, opacity: role === r.id ? 0.6 : 0.4, lineHeight: 1.4 }}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Interests */}
              {step === 2 && (
                <div>
                  <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 8 }}>
                    What are you into?
                  </h1>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", marginBottom: 28 }}>
                    Select all that apply. Your agents will prioritize these domains.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {INTERESTS.map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleInterest(item)}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500,
                          padding: "10px 16px", borderRadius: 7, cursor: "pointer",
                          background: interests.includes(item) ? "#f5f5f5" : "transparent",
                          color: interests.includes(item) ? "#0a0a0a" : "#a3a3a3",
                          border: `1px solid ${interests.includes(item) ? "#f5f5f5" : "#262626"}`,
                          transition: "all 0.12s ease",
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {interests.length > 0 && (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginTop: 16 }}>
                      {interests.length} selected
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Workspace */}
              {step === 3 && (
                <div>
                  <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 8 }}>
                    Name your workspace.
                  </h1>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", marginBottom: 28 }}>
                    This is your home inside BlackRoad OS.
                  </p>
                  <div style={{ maxWidth: 360 }}>
                    <Input label="Workspace Name" placeholder="my-studio" value={workspace} onChange={(e) => setWorkspace(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
                    {workspace && (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#333", marginTop: 12 }}>
                        <span style={{ color: "#525252" }}>{workspace}</span>.blackroad.io
                      </div>
                    )}
                  </div>

                  {/* Config preview */}
                  <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20, marginTop: 28 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Preview</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2, color: "#525252" }}>
                      <div><span style={{ color: "#333" }}>name:</span> <span style={{ color: "#a3a3a3" }}>{name || "—"}</span></div>
                      <div><span style={{ color: "#333" }}>role:</span> <span style={{ color: "#a3a3a3" }}>{role || "—"}</span></div>
                      <div><span style={{ color: "#333" }}>interests:</span> <span style={{ color: "#a3a3a3" }}>{interests.length > 0 ? interests.join(", ") : "—"}</span></div>
                      <div><span style={{ color: "#333" }}>workspace:</span> <span style={{ color: "#a3a3a3" }}>{workspace || "—"}.blackroad.io</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Agents */}
              {step === 4 && (
                <div>
                  <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 8 }}>
                    Choose your team.
                  </h1>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", marginBottom: 28 }}>
                    Select the agents you want in your workspace. Lucidia is always included. You can add more later.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {AGENTS_POOL.map((a) => {
                      const selected = selectedAgents.includes(a.name);
                      const isLucidia = a.name === "lucidia";
                      return (
                        <button
                          key={a.name}
                          onClick={() => !isLucidia && toggleAgent(a.name)}
                          style={{
                            background: selected ? "#171717" : "#0f0f0f",
                            border: `1px solid ${selected ? "#262626" : "#1a1a1a"}`,
                            borderRadius: 10, padding: "16px 18px", textAlign: "left",
                            cursor: isLucidia ? "default" : "pointer",
                            display: "flex", alignItems: "flex-start", gap: 14,
                            position: "relative", overflow: "hidden",
                            transition: "all 0.12s ease",
                          }}
                        >
                          <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: a.color, opacity: selected ? 1 : 0.2 }} />

                          {/* Checkbox */}
                          <div style={{
                            width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                            background: selected ? "#f5f5f5" : "transparent",
                            border: `1px solid ${selected ? "#f5f5f5" : "#262626"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#0a0a0a",
                          }}>
                            {selected && "✓"}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: selected ? "#f5f5f5" : "#737373" }}>{a.name}</span>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040" }}>{a.role}</span>
                              {isLucidia && (
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", background: "#0a0a0a", padding: "2px 7px", borderRadius: 3, border: "1px solid #1a1a1a" }}>
                                  REQUIRED
                                </span>
                              )}
                            </div>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", lineHeight: 1.4 }}>{a.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginTop: 12 }}>
                    {selectedAgents.length} agent{selectedAgents.length !== 1 ? "s" : ""} selected
                  </div>
                </div>
              )}

              {/* Step 5: Launch */}
              {step === 5 && (
                <div style={{ textAlign: "center", paddingTop: 32 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {COLORS.map((c) => <div key={c} style={{ width: 6, height: 24, borderRadius: 3, background: c }} />)}
                    </div>
                  </div>

                  <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 7vw, 48px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.03em", marginBottom: 12, lineHeight: 1.1 }}>
                    You're in.
                  </h1>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 32px" }}>
                    Your workspace is ready. {selectedAgents.length} agent{selectedAgents.length !== 1 ? "s are" : " is"} online and waiting. The road is yours.
                  </p>

                  <GradientBar height={2} style={{ width: 120, margin: "0 auto 32px", borderRadius: 1 }} />

                  {/* Summary */}
                  <div style={{ display: "flex", gap: 0, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
                    {[
                      { v: role ? ROLES.find((r) => r.id === role)?.label : "—", l: "Role" },
                      { v: String(interests.length), l: "Interests" },
                      { v: String(selectedAgents.length), l: "Agents" },
                    ].map((s, i, arr) => (
                      <div key={i} style={{
                        padding: "0 28px",
                        borderRight: i < arr.length - 1 ? "1px solid #1a1a1a" : "none",
                      }}>
                        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#f5f5f5", lineHeight: 1 }}>{s.v}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 6 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Terminal preview */}
                  <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden", textAlign: "left", maxWidth: 440, margin: "0 auto" }}>
                    <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333" }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#262626", marginLeft: 4 }}>{workspace}.blackroad.io</span>
                    </div>
                    <div style={{ padding: "16px 18px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2 }}>
                      <div style={{ color: "#333" }}>$ blackroad status</div>
                      <div style={{ color: "#525252" }}>  workspace: <span style={{ color: "#a3a3a3" }}>{workspace}</span></div>
                      <div style={{ color: "#525252" }}>  user:      <span style={{ color: "#a3a3a3" }}>{name}</span></div>
                      <div style={{ color: "#525252" }}>  role:      <span style={{ color: "#a3a3a3" }}>{role}</span></div>
                      <div style={{ color: "#525252" }}>  agents:    <span style={{ color: "#a3a3a3" }}>{selectedAgents.length} online</span></div>
                      <div style={{ color: "#525252" }}>  mesh:      <span style={{ color: "#a3a3a3" }}>NA1 ✓</span></div>
                      <div style={{ color: "#333", marginTop: 4 }}>  ready.</div>
                    </div>
                  </div>

                  <button style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600,
                    color: "#0a0a0a", background: "#f5f5f5", border: "none",
                    padding: "14px 40px", borderRadius: 8, cursor: "pointer", marginTop: 28,
                  }}>
                    Launch Workspace
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            {step < 5 && (
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 36, borderTop: "1px solid #1a1a1a", marginTop: 36 }}>
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500,
                    background: "transparent", color: "#525252", border: "1px solid #1a1a1a",
                    padding: "10px 22px", borderRadius: 7, cursor: "pointer",
                    opacity: step === 0 ? 0.2 : 1, pointerEvents: step === 0 ? "none" : "auto",
                  }}
                >
                  Back
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#262626" }}>
                    {step + 1} / {steps.length}
                  </span>
                  <button
                    onClick={() => canProceed() && setStep(step + 1)}
                    style={{
                      fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
                      background: canProceed() ? "#f5f5f5" : "#1a1a1a",
                      color: canProceed() ? "#0a0a0a" : "#404040",
                      border: "none", padding: "10px 28px", borderRadius: 7, cursor: canProceed() ? "pointer" : "default",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
