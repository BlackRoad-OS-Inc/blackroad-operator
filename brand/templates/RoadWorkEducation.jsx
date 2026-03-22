import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;
const T = {
  text: { primary: "#f5f5f5", secondary: "#d4d4d4", tertiary: "#a3a3a3", muted: "#737373", dim: "#525252", faint: "#404040", ghost: "#333", invisible: "#262626" },
  bg: { page: "#0a0a0a", card: "#131313", inset: "#0f0f0f" },
  border: { card: "#1a1a1a", subtle: "#141414", hover: "#262626" },
  font: { headline: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
};

const SUBJECTS = [
  { name: "Mathematics", icon: "∑", lessons: 142, mastery: 68, color: COLORS[3], topics: ["Algebra", "Geometry", "Calculus", "Statistics", "Linear Algebra"] },
  { name: "Physics", icon: "⊕", lessons: 98, mastery: 45, color: COLORS[4], topics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Quantum"] },
  { name: "Computer Science", icon: "⟨⟩", lessons: 124, mastery: 82, color: COLORS[5], topics: ["Python", "Algorithms", "Data Structures", "AI/ML"] },
  { name: "Music Theory", icon: "♫", lessons: 56, mastery: 31, color: COLORS[0], topics: ["Notation", "Harmony", "Rhythm", "Composition"] },
  { name: "Writing", icon: "✎", lessons: 78, mastery: 54, color: COLORS[1], topics: ["Grammar", "Essays", "Creative Writing", "Rhetoric"] },
  { name: "Quantum Computing", icon: "Ψ", lessons: 34, mastery: 12, color: COLORS[2], topics: ["Qubits", "Gates", "Algorithms", "Error Correction"] },
];

const HOMEWORK = [
  { id: 1, title: "Linear Algebra Problem Set 4", subject: "Mathematics", by: "Dr. Chen", due: "Tomorrow", status: "in-progress", done: 5, total: 8 },
  { id: 2, title: "Implement Dijkstra's Algorithm", subject: "Computer Science", by: "Prof. Kumar", due: "Mar 25", status: "not-started", done: 0, total: 1 },
  { id: 3, title: "Essay: The Observer Effect", subject: "Writing", by: "Ms. Park", due: "Mar 28", status: "not-started", done: 0, total: 1 },
  { id: 4, title: "Harmonic Analysis Exercises", subject: "Music Theory", by: "cadence", due: "Done", status: "completed", done: 12, total: 12 },
];

function GradientBar({ h = 1, s = {} }) { return <div style={{ height: h, background: GRADIENT, ...s }} />; }

function PBar({ value, max = 100, h = 4, color = null }) {
  return <div style={{ width: "100%", height: h, background: T.border.card, borderRadius: h/2, overflow: "hidden" }}><div style={{ width: `${Math.min((value/max)*100,100)}%`, height: "100%", background: color || T.text.faint, borderRadius: h/2, transition: "width 0.4s ease" }} /></div>;
}

function Ring({ value, size = 44, color = T.text.faint }) {
  const c = Math.PI * (size - 6);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={(size-6)/2} fill="none" stroke={T.border.card} strokeWidth={3} />
      <circle cx={size/2} cy={size/2} r={(size-6)/2} fill="none" stroke={color} strokeWidth={3} strokeDasharray={c} strokeDashoffset={c-(value/100)*c} strokeLinecap="round" />
      <text x={size/2} y={size/2} fill={T.text.tertiary} fontSize={size*0.25} fontFamily={T.font.mono} textAnchor="middle" dominantBaseline="central" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{value}%</text>
    </svg>
  );
}

function Nav({ view, setView, role }) {
  const views = role === "teacher" ? ["dashboard", "assign", "review"] : ["learn", "homework", "subjects", "progress"];
  return (
    <nav style={{ padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border.card}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 2 }}>{COLORS.map((c) => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}</div>
        <span style={{ fontFamily: T.font.headline, fontSize: 16, fontWeight: 700, color: T.text.primary }}>RoadWork</span>
        <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.faint, background: T.bg.inset, padding: "3px 8px", borderRadius: 4, border: `1px solid ${T.border.card}`, textTransform: "uppercase" }}>{role}</span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {views.map((v) => <button key={v} onClick={() => setView(v)} style={{ fontFamily: T.font.mono, fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: view === v ? T.text.primary : T.text.faint, background: view === v ? T.border.card : "transparent", border: "none", borderRadius: 5, padding: "6px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>{v}</button>)}
      </div>
    </nav>
  );
}

function LearnView() {
  const [chat, setChat] = useState(false);
  const [msgs, setMsgs] = useState([{ f: "tutor", t: "Hey! Working on eigenvalues. Want to pick up where we left off, or try a different angle?" }]);
  const [inp, setInp] = useState("");
  const send = () => { if (!inp.trim()) return; setMsgs(p => [...p, { f: "you", t: inp }]); setInp(""); setTimeout(() => setMsgs(p => [...p, { f: "tutor", t: "Think of an eigenvector as a direction that doesn't change when you apply a transformation — it just gets scaled. Like a door hinge: the door swings, but the hinge direction stays put. The eigenvalue is how much it scales." }]), 700); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ height: 2, background: GRADIENT }} />
        <div style={{ padding: 24 }}>
          <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Continue Learning</div>
          <div style={{ fontFamily: T.font.headline, fontSize: 24, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Eigenvalues & Eigenvectors</div>
          <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint, marginBottom: 16 }}>Mathematics → Linear Algebra · 25 min · intermediate</div>
          <PBar value={65} h={6} />
          <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0 18px" }}><span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>65%</span><span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>~9 min left</span></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: T.bg.page, background: T.text.primary, border: "none", padding: "12px 28px", borderRadius: 8, cursor: "pointer" }}>Continue</button>
            <button onClick={() => setChat(!chat)} style={{ fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: T.text.tertiary, background: "transparent", border: `1px solid ${T.border.hover}`, padding: "12px 22px", borderRadius: 8, cursor: "pointer" }}>Ask Tutor</button>
          </div>
        </div>
      </div>
      {chat && (
        <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border.card}`, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.text.tertiary }} />
            <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.dim }}>AI Tutor · Linear Algebra</span>
            <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost, marginLeft: "auto" }}>adapts to your level</span>
          </div>
          <div style={{ padding: 16, maxHeight: 260, overflowY: "auto" }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.f === "you" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: 10, background: m.f === "you" ? T.border.card : T.bg.inset, border: `1px solid ${m.f === "you" ? T.border.hover : T.border.subtle}` }}>
                  <div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.ghost, marginBottom: 4, textTransform: "uppercase" }}>{m.f}</div>
                  <div style={{ fontFamily: T.font.body, fontSize: 13, color: m.f === "you" ? T.text.secondary : T.text.muted, lineHeight: 1.6 }}>{m.t}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "0 16px 12px", display: "flex", gap: 8 }}>
            <input type="text" value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything..." style={{ flex: 1, background: T.bg.page, border: `1px solid ${T.border.card}`, borderRadius: 8, color: T.text.primary, fontFamily: T.font.body, fontSize: 13, padding: "10px 14px", outline: "none", minWidth: 0 }} />
            <button onClick={send} style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 500, color: T.bg.page, background: T.text.primary, border: "none", padding: "10px 18px", borderRadius: 7, cursor: "pointer" }}>Send</button>
          </div>
          <div style={{ padding: "0 16px 14px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Explain simpler", "Give an example", "Why does this matter?", "Quiz me"].map(p => <button key={p} onClick={() => setInp(p)} style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, background: "transparent", border: `1px solid ${T.border.subtle}`, borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}>{p}</button>)}
          </div>
        </div>
      )}
      <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em" }}>Up Next</div>
      {[{ t: "Graph Traversal: BFS vs DFS", s: "Computer Science", d: "30 min", p: 40 }, { t: "Wave-Particle Duality", s: "Physics", d: "35 min", p: 15 }].map(l => (
        <div key={l.t} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
          <Ring value={l.p} size={42} color={SUBJECTS.find(x => x.name === l.s)?.color} />
          <div style={{ flex: 1 }}><div style={{ fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: T.text.secondary }}>{l.t}</div><div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint }}>{l.s} · {l.d}</div></div>
        </div>
      ))}
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontFamily: T.font.headline, fontSize: 32, fontWeight: 700, color: T.text.primary }}>7</div>
        <div style={{ flex: 1 }}><div style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.secondary }}>Day streak</div><div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>Consistency beats intensity.</div></div>
        <div style={{ display: "flex", gap: 3 }}>{COLORS.map((c, i) => <div key={i} style={{ width: 5, height: 16, borderRadius: 2, background: c, opacity: 0.5 }} />)}</div>
      </div>
    </div>
  );
}

function HWView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Homework</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Teacher → student → response. Tracked and supported by AI.</p></div>
      {HOMEWORK.map(hw => {
        const sub = SUBJECTS.find(s => s.name === hw.subject);
        return (
          <div key={hw.id} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden", opacity: hw.status === "completed" ? 0.5 : 1 }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: sub?.color || T.text.faint, opacity: hw.status === "completed" ? 0.2 : 1 }} />
            <div style={{ paddingLeft: 6 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <div><div style={{ fontFamily: T.font.body, fontSize: 15, fontWeight: 500, color: T.text.primary, marginBottom: 2 }}>{hw.title}</div><div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.faint }}>{hw.subject} · by {hw.by} · Due: {hw.due}</div></div>
                <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.faint, background: T.bg.page, padding: "3px 8px", borderRadius: 4, border: `1px solid ${T.border.card}`, textTransform: "uppercase" }}>{hw.status}</span>
              </div>
              {hw.total > 1 && <><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{hw.done}/{hw.total}</span></div><PBar value={hw.done} max={hw.total} h={4} color={sub?.color} /><div style={{ height: 12 }} /></>}
              {hw.status !== "completed" && <div style={{ display: "flex", gap: 8 }}><button style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 500, color: T.bg.page, background: T.text.primary, border: "none", padding: "8px 18px", borderRadius: 7, cursor: "pointer" }}>{hw.status === "in-progress" ? "Continue" : "Start"}</button><button style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 500, color: T.text.dim, background: "transparent", border: `1px solid ${T.border.card}`, padding: "8px 18px", borderRadius: 7, cursor: "pointer" }}>Get Help</button></div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SubView() {
  const [sel, setSel] = useState(null);
  if (sel) {
    const s = SUBJECTS.find(x => x.name === sel);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => setSel(null)} style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.ghost, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>← back</button>
        <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 14, padding: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><Ring value={s.mastery} size={64} color={s.color} /><div><div style={{ fontFamily: T.font.headline, fontSize: 26, fontWeight: 700, color: T.text.primary }}>{s.name}</div><div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>{s.lessons} lessons · {s.mastery}%</div></div></div>
        </div>
        {s.topics.map((topic, i) => {
          const m = Math.min(100, Math.max(0, s.mastery - i * 14 + 10));
          return <div key={topic} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}><Ring value={m} size={38} color={s.color} /><div style={{ flex: 1 }}><div style={{ fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: T.text.secondary }}>{topic}</div><div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{Math.round(s.lessons / s.topics.length)} lessons</div></div><span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.invisible }}>→</span></div>;
        })}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div><h2 style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>Subjects</h2><p style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim }}>Free K-12. $10/mo advanced. Schools pay per outcome, not seats.</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
        {SUBJECTS.map(s => (
          <div key={s.name} onClick={() => setSel(s.name)} style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 18, cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.5 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}><span style={{ fontFamily: T.font.mono, fontSize: 20, color: T.text.faint }}>{s.icon}</span><Ring value={s.mastery} size={36} color={s.color} /></div>
            <div style={{ fontFamily: T.font.headline, fontSize: 15, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{s.lessons} lessons · {s.topics.length} topics</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgView() {
  const avg = Math.round(SUBJECTS.reduce((a, s) => a + s.mastery, 0) / SUBJECTS.length);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 1, background: T.border.card, borderRadius: 10, overflow: "hidden" }}>
        {[{ v: `${avg}%`, l: "Mastery" }, { v: "7", l: "Streak" }, { v: "34h", l: "Time" }, { v: "142", l: "Lessons" }].map(s => <div key={s.l} style={{ background: T.bg.inset, padding: "14px 12px", textAlign: "center" }}><div style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary }}>{s.v}</div><div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.faint, textTransform: "uppercase", marginTop: 4 }}>{s.l}</div></div>)}
      </div>
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Subject Mastery</div>
        {[...SUBJECTS].sort((a, b) => b.mastery - a.mastery).map(s => <div key={s.name} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.tertiary }}>{s.name}</span><span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>{s.mastery}%</span></div><PBar value={s.mastery} color={s.color} h={6} /></div>)}
      </div>
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Achievements</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 6 }}>
          {[{ n: "7-Day Streak", d: "Studied every day", on: true }, { n: "First Mastery", d: "Mastered a topic", on: true }, { n: "Night Owl", d: "Lesson after midnight", on: true }, { n: "Curiosity Chain", d: "5 connected topics", on: false }, { n: "Teach Back", d: "Explained to AI", on: false }, { n: "Zero to Hero", d: "0% → 100%", on: false }].map(a => <div key={a.n} style={{ background: T.bg.inset, border: `1px solid ${T.border.subtle}`, borderRadius: 8, padding: "10px 12px", opacity: a.on ? 1 : 0.3 }}><div style={{ fontFamily: T.font.body, fontSize: 13, fontWeight: 500, color: T.text.secondary, marginBottom: 2 }}>{a.n}</div><div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{a.d}</div></div>)}
        </div>
      </div>
      <div style={{ background: T.bg.inset, border: `1px solid ${T.border.card}`, borderRadius: 10, padding: "14px 18px", textAlign: "center" }}>
        <div style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.dim, fontStyle: "italic" }}>There is no leaderboard. Learning isn't a competition. Your only metric is yesterday-you vs today-you.</div>
      </div>
    </div>
  );
}

function TeacherDash() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 1, background: T.border.card, borderRadius: 10, overflow: "hidden" }}>
        {[{ v: "24", l: "Students" }, { v: "8", l: "Active" }, { v: "92%", l: "Completion" }, { v: "+3.2", l: "Growth" }].map(s => <div key={s.l} style={{ background: T.bg.inset, padding: "14px 12px", textAlign: "center" }}><div style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary }}>{s.v}</div><div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.faint, textTransform: "uppercase", marginTop: 4 }}>{s.l}</div></div>)}
      </div>
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Needs Attention</div>
        {[{ s: "Maya", i: "Stuck on eigenvalue decomposition — 3 sessions", t: "Try visual approach, she responds to geometric explanations" }, { s: "Jake", i: "Hasn't started Python assignment (due tomorrow)", t: "He works in bursts — a nudge now could help" }, { s: "Sofia", i: "Physics mastery dropped 12% this week", t: "She switched to evening study — may be less focused" }].map((x, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: i < 2 ? `1px solid ${T.border.subtle}` : "none" }}>
            <div style={{ fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: T.text.secondary, marginBottom: 4 }}>{x.s}</div>
            <div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.dim, marginBottom: 4 }}>{x.i}</div>
            <div style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.ghost, fontStyle: "italic" }}>AI: {x.t}</div>
          </div>
        ))}
      </div>
      <div style={{ background: T.bg.card, border: `1px solid ${T.border.card}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Recent Submissions</div>
        {[{ s: "Alex", h: "Linear Algebra PS4", sc: "7/8", t: "1h ago" }, { s: "Maya", h: "Harmonic Analysis", sc: "10/12", t: "3h ago" }, { s: "Carlos", h: "Graph Traversal", sc: "Pending", t: "5h ago" }].map((x, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${T.border.subtle}` : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: T.bg.page, border: `1px solid ${T.border.card}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font.mono, fontSize: 11, color: T.text.faint }}>{x.s[0]}</div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: T.font.body, fontSize: 13, color: T.text.secondary }}>{x.s} — {x.h}</div><div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.ghost }}>{x.t}</div></div>
            <span style={{ fontFamily: T.font.mono, fontSize: 12, color: T.text.tertiary }}>{x.sc}</span>
            <button style={{ fontFamily: T.font.body, fontSize: 11, color: T.bg.page, background: T.text.primary, border: "none", padding: "6px 14px", borderRadius: 6, cursor: "pointer" }}>Review</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RoadWorkApp() {
  const [role, setRole] = useState("student");
  const [view, setView] = useState("learn");
  const sw = r => { setRole(r); setView(r === "teacher" ? "dashboard" : "learn"); };
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
        button:hover { opacity: 0.88; }
      `}</style>
      <div style={{ background: T.bg.page, minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: T.font.body, color: T.text.primary }}>
        <GradientBar />
        <Nav view={view} setView={setView} role={role} />
        <div style={{ borderBottom: `1px solid ${T.border.card}`, padding: "8px 16px", display: "flex", justifyContent: "center", gap: 4 }}>
          {["student", "teacher"].map(r => <button key={r} onClick={() => sw(r)} style={{ fontFamily: T.font.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: role === r ? T.text.primary : T.text.ghost, background: role === r ? T.border.card : "transparent", border: `1px solid ${role === r ? T.border.hover : "transparent"}`, borderRadius: 5, padding: "4px 14px", cursor: "pointer" }}>{r} view</button>)}
        </div>
        <div style={{ padding: "20px 16px 80px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            {role === "student" && view === "learn" && <LearnView />}
            {role === "student" && view === "homework" && <HWView />}
            {role === "student" && view === "subjects" && <SubView />}
            {role === "student" && view === "progress" && <ProgView />}
            {role === "teacher" && view === "dashboard" && <TeacherDash />}
            {role === "teacher" && view === "assign" && <div style={{ textAlign: "center", padding: 48 }}><div style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 8 }}>Create Assignment</div><div style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.dim }}>AI-generated problem sets, rubrics, adaptive difficulty. Phase 2.</div></div>}
            {role === "teacher" && view === "review" && <div style={{ textAlign: "center", padding: 48 }}><div style={{ fontFamily: T.font.headline, fontSize: 22, fontWeight: 700, color: T.text.primary, marginBottom: 8 }}>Review Submissions</div><div style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.dim }}>AI-assisted grading with rubric alignment and personalized feedback.</div></div>}
          </div>
        </div>
      </div>
    </>
  );
}
