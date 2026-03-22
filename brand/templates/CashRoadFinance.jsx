import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const ACCOUNTS = [
  { name: "Checking", balance: 3847.22, type: "bank" },
  { name: "Savings", balance: 12480.00, type: "bank" },
  { name: "Credit Card", balance: -1243.67, type: "credit" },
];

const TRANSACTIONS = [
  { id: 1, name: "Target", amount: -67.43, category: "Shopping", date: "Today", flag: null },
  { id: 2, name: "Spotify", amount: -10.99, category: "Subscriptions", date: "Today", flag: null },
  { id: 3, name: "Deposit — BlackRoad", amount: 2400.00, category: "Income", date: "Yesterday", flag: null },
  { id: 4, name: "Whole Foods", amount: -94.12, category: "Groceries", date: "Yesterday", flag: null },
  { id: 5, name: "Gas Station", amount: -48.30, category: "Transport", date: "Mar 19", flag: null },
  { id: 6, name: "Amazon", amount: -129.99, category: "Shopping", date: "Mar 18", flag: "decision" },
  { id: 7, name: "Electric Bill", amount: -142.00, category: "Bills", date: "Mar 18", flag: null },
  { id: 8, name: "Coffee — Caribou", amount: -6.45, category: "Food", date: "Mar 17", flag: null },
  { id: 9, name: "Netflix", amount: -15.49, category: "Subscriptions", date: "Mar 17", flag: null },
  { id: 10, name: "Haircut", amount: -35.00, category: "Personal", date: "Mar 16", flag: null },
];

const INSIGHTS = [
  { type: "clarity", title: "$847 flexible until the 15th", body: "That's $60/day after bills and commitments. You're in good shape — no stress needed." },
  { type: "pattern", title: "Subscriptions: $78.47/mo", body: "You have 6 active subscriptions. That's $941/year. Two haven't been used in 30+ days." },
  { type: "win", title: "Groceries down 18% this month", body: "You spent $312 vs $380 last month. Whatever you're doing differently is working." },
];

const GOALS = [
  { name: "Vacation Fund", target: 3000, current: 1840, deadline: "Aug 2026" },
  { name: "Emergency Fund", target: 10000, current: 8200, deadline: "Ongoing" },
  { name: "New Laptop", target: 1800, current: 620, deadline: "Jun 2026" },
];

const FUTURE_SCENARIOS = [
  { label: "Keep current pace", age: 40, savings: "$142,000", retirement: "On track", mood: "steady" },
  { label: "Save $200 more/mo", age: 40, savings: "$178,000", retirement: "Ahead", mood: "optimistic" },
  { label: "Add $500 expense", age: 40, savings: "$96,000", retirement: "Behind", mood: "caution" },
];

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function ProgressBar({ value, max, height = 4 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: "100%", height, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: pct > 80 ? "#a3a3a3" : "#404040", borderRadius: 2, transition: "width 0.4s ease" }} />
    </div>
  );
}

function formatMoney(n) {
  const abs = Math.abs(n);
  const str = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${str}` : `$${str}`;
}

function Nav({ activeView, setActiveView }) {
  const views = ["overview", "transactions", "goals", "future"];
  return (
    <nav style={{
      padding: "0 20px", height: 52, display: "flex", alignItems: "center",
      justifyContent: "space-between", borderBottom: "1px solid #1a1a1a",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {COLORS.map((c) => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>CashRoad</span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {views.map((v) => (
          <button key={v} onClick={() => setActiveView(v)} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.06em",
            color: activeView === v ? "#f5f5f5" : "#404040",
            background: activeView === v ? "#1a1a1a" : "transparent",
            border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer",
          }}>
            {v}
          </button>
        ))}
      </div>
    </nav>
  );
}

function OverviewView() {
  const total = ACCOUNTS.reduce((a, b) => a + b.balance, 0);
  const [showDecision, setShowDecision] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Net worth card */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, padding: 28, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: GRADIENT }} />
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Net Position</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 8vw, 52px)", fontWeight: 700, color: "#f5f5f5", lineHeight: 1, marginBottom: 16 }}>
          {formatMoney(total)}
        </div>
        <div style={{ display: "flex", gap: 1, background: "#1a1a1a", borderRadius: 8, overflow: "hidden" }}>
          {ACCOUNTS.map((a) => (
            <div key={a.name} style={{ flex: 1, background: "#0f0f0f", padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: a.balance < 0 ? "#737373" : "#f5f5f5" }}>
                {formatMoney(a.balance)}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{a.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {INSIGHTS.map((insight, i) => {
          const icons = { clarity: "◈", pattern: "◇", win: "◆" };
          return (
            <div key={i} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#404040" }}>{icons[insight.type]}</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5" }}>{insight.title}</span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", lineHeight: 1.55, margin: 0, paddingLeft: 20 }}>
                {insight.body}
              </p>
            </div>
          );
        })}
      </div>

      {/* Decision-time assistant */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, padding: 22 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Decision-Time Assistant</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="About to buy something? Type what and how much..."
            style={{
              flex: "1 1 220px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8,
              color: "#f5f5f5", fontFamily: "'Inter', sans-serif", fontSize: 14,
              padding: "12px 16px", outline: "none", minWidth: 0,
            }}
            onFocus={() => setShowDecision(true)}
          />
          <button
            onClick={() => setShowDecision(true)}
            style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
              color: "#0a0a0a", background: "#f5f5f5", border: "none",
              padding: "12px 20px", borderRadius: 8, cursor: "pointer", flexShrink: 0,
            }}
          >
            Check
          </button>
        </div>

        {showDecision && (
          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10, padding: 18 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#d4d4d4", marginBottom: 12, lineHeight: 1.6 }}>
              If you spend <span style={{ color: "#f5f5f5", fontWeight: 600 }}>$129.99</span> on that Amazon order:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Flexible cash drops to", value: "$717", impact: "neutral" },
                { label: "Vacation fund pushed back", value: "~2 weeks", impact: "caution" },
                { label: "Daily budget until 15th", value: "$51/day", impact: "neutral" },
                { label: "Still covers all bills?", value: "Yes", impact: "good" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #141414" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252" }}>{item.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: item.impact === "good" ? "#a3a3a3" : item.impact === "caution" ? "#737373" : "#d4d4d4" }}>{item.value}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#404040", marginTop: 14, fontStyle: "italic", lineHeight: 1.5 }}>
              No judgment. You can afford it. Just know the vacation fund moves. Still want it?
            </p>
          </div>
        )}
      </div>

      {/* Recent transactions preview */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Recent</div>
        {TRANSACTIONS.slice(0, 5).map((t, i) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid #141414" : "none" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "#0a0a0a", border: "1px solid #1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040", flexShrink: 0,
            }}>
              {t.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#d4d4d4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>{t.category} · {t.date}</div>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 500, color: t.amount > 0 ? "#a3a3a3" : "#737373", flexShrink: 0 }}>
              {t.amount > 0 ? "+" : ""}{formatMoney(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsView() {
  const [filter, setFilter] = useState("all");
  const categories = ["all", ...new Set(TRANSACTIONS.map((t) => t.category))];
  const filtered = filter === "all" ? TRANSACTIONS : TRANSACTIONS.filter((t) => t.category === filter);

  const income = TRANSACTIONS.filter((t) => t.amount > 0).reduce((a, b) => a + b.amount, 0);
  const spending = TRANSACTIONS.filter((t) => t.amount < 0).reduce((a, b) => a + b.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#1a1a1a", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ background: "#131313", padding: "16px 18px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#a3a3a3" }}>{formatMoney(income)}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", marginTop: 4 }}>Income</div>
        </div>
        <div style={{ background: "#131313", padding: "16px 18px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#737373" }}>{formatMoney(spending)}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", marginTop: 4 }}>Spending</div>
        </div>
        <div style={{ background: "#131313", padding: "16px 18px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5" }}>{formatMoney(income + spending)}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", marginTop: 4 }}>Net</div>
        </div>
      </div>

      {/* Filters */}
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

      {/* Transaction list */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
        {filtered.map((t, i) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #141414" : "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: "#0a0a0a", border: "1px solid #1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#404040", flexShrink: 0,
            }}>
              {t.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#d4d4d4" }}>{t.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>{t.category} · {t.date}</div>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 500, color: t.amount > 0 ? "#a3a3a3" : "#737373", flexShrink: 0 }}>
              {t.amount > 0 ? "+" : ""}{formatMoney(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalsView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Goals</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252" }}>
          No shame. No pressure. Just clarity on where you're headed.
        </p>
      </div>

      {GOALS.map((g, i) => {
        const pct = Math.round((g.current / g.target) * 100);
        return (
          <div key={g.name} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, padding: 22, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: COLORS[i * 2], opacity: 0.6 }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#f5f5f5", marginBottom: 2 }}>{g.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333" }}>Target: {g.deadline}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#f5f5f5" }}>{pct}%</div>
              </div>
            </div>

            <ProgressBar value={g.current} max={g.target} height={6} />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#525252" }}>{formatMoney(g.current)}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#333" }}>{formatMoney(g.target)}</span>
            </div>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #141414" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#404040", lineHeight: 1.5, fontStyle: "italic" }}>
                {pct >= 80 ? "Almost there. Keep going."
                  : pct >= 50 ? "More than halfway. You're doing this."
                  : "Early days. Every dollar counts."}
              </div>
            </div>
          </div>
        );
      })}

      {/* Add goal */}
      <button style={{
        background: "#0f0f0f", border: "1px dashed #1a1a1a", borderRadius: 12,
        padding: 24, cursor: "pointer", textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: "#404040", marginBottom: 4 }}>Add a goal</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#262626" }}>Vacation? Emergency fund? New gear? Name it.</div>
      </button>
    </div>
  );
}

function FutureView() {
  const [activeScenario, setActiveScenario] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Future You</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252", lineHeight: 1.5 }}>
          "Show me age 40 if I keep doing this." Compound effects visualized. No judgment — just math.
        </p>
      </div>

      {/* Scenario selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {FUTURE_SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveScenario(i)}
            style={{
              background: activeScenario === i ? "#171717" : "#131313",
              border: `1px solid ${activeScenario === i ? "#262626" : "#1a1a1a"}`,
              borderRadius: 12, padding: "18px 22px", textAlign: "left", cursor: "pointer",
              position: "relative", overflow: "hidden",
            }}
          >
            {activeScenario === i && <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: COLORS[i * 2] }} />}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: activeScenario === i ? "#f5f5f5" : "#737373", marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>
                  Age {s.age} · {s.retirement}
                </div>
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: activeScenario === i ? "#f5f5f5" : "#404040" }}>
                {s.savings}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Projection detail */}
      <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, padding: 22 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Projection: {FUTURE_SCENARIOS[activeScenario].label}
        </div>

        {/* Simulated growth bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {[
            { year: "2027", value: activeScenario === 0 ? 28 : activeScenario === 1 ? 35 : 18 },
            { year: "2028", value: activeScenario === 0 ? 42 : activeScenario === 1 ? 52 : 26 },
            { year: "2029", value: activeScenario === 0 ? 58 : activeScenario === 1 ? 72 : 34 },
            { year: "2030", value: activeScenario === 0 ? 72 : activeScenario === 1 ? 88 : 42 },
            { year: "2031", value: activeScenario === 0 ? 85 : activeScenario === 1 ? 100 : 50 },
          ].map((y) => (
            <div key={y.year} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", width: 36, flexShrink: 0 }}>{y.year}</span>
              <div style={{ flex: 1, height: 8, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${y.value}%`, height: "100%", background: "#333", borderRadius: 3, transition: "width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
          {[
            { label: "Projected Savings", value: FUTURE_SCENARIOS[activeScenario].savings },
            { label: "Retirement Status", value: FUTURE_SCENARIOS[activeScenario].retirement },
            { label: "At Age", value: String(FUTURE_SCENARIOS[activeScenario].age) },
          ].map((s) => (
            <div key={s.label} style={{ background: "#0a0a0a", border: "1px solid #151515", borderRadius: 8, padding: 14 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#262626", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#f5f5f5" }}>{s.value}</div>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#404040", marginTop: 16, fontStyle: "italic", lineHeight: 1.5 }}>
          {activeScenario === 0 && "You're on a solid path. Nothing needs to change — unless you want it to."}
          {activeScenario === 1 && "An extra $200/month compounds beautifully. Small changes, massive difference over time."}
          {activeScenario === 2 && "Adding $500 in expenses isn't a disaster — but it slows things down. Worth knowing before committing."}
        </p>
      </div>
    </div>
  );
}

export default function CashRoadApp() {
  const [activeView, setActiveView] = useState("overview");

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
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <GradientBar />
        <Nav activeView={activeView} setActiveView={setActiveView} />

        <div style={{ padding: "24px 20px 80px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            {activeView === "overview" && <OverviewView />}
            {activeView === "transactions" && <TransactionsView />}
            {activeView === "goals" && <GoalsView />}
            {activeView === "future" && <FutureView />}
          </div>
        </div>
      </div>
    </>
  );
}
