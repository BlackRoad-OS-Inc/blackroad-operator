import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const PLANS = [
  {
    name: "Open",
    price: "0",
    period: "",
    desc: "For learners, explorers, and anyone who just wants to see what this is.",
    features: [
      "Full K-12 RoadWork access",
      "Lucidia chat — 50 messages/day",
      "RoadView search — unlimited",
      "BackRoad social — full access",
      "1 AI agent companion",
      "Community support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Builder",
    price: "10",
    period: "/mo",
    desc: "For creators, students, and independent professionals building real things.",
    features: [
      "Everything in Open",
      "Unlimited Lucidia chat + code",
      "RoadGlitch automations — 100/mo",
      "SoundRoad — 10 tracks/mo",
      "Genesis Road — basic 3D",
      "VaultRoad second brain — 10GB",
      "5 AI agents with memory",
      "CashRoad financial co-pilot",
      "Priority support",
    ],
    cta: "Start Building",
    highlight: true,
  },
  {
    name: "Studio",
    price: "29",
    period: "/mo",
    desc: "For teams, studios, and serious creators who need the full stack.",
    features: [
      "Everything in Builder",
      "Unlimited automations",
      "SoundRoad — unlimited tracks",
      "Genesis Road — full engine",
      "VaultRoad — 100GB",
      "25 AI agents with persistent memory",
      "RoadWorld — publish & earn",
      "80% revenue on all content",
      "API access",
      "Team collaboration — up to 5",
    ],
    cta: "Go Studio",
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For schools, organizations, and companies that need the OS at scale.",
    features: [
      "Everything in Studio",
      "Unlimited agents",
      "Custom agent training",
      "Dedicated infrastructure",
      "SSO / SAML / SCIM",
      "Compliance & audit logs",
      "Outcome-based pricing for schools",
      "SLA guarantee",
      "Dedicated support engineer",
    ],
    cta: "Talk to Us",
    highlight: false,
  },
];

const FAQS = [
  { q: "What's outcome-based pricing?", a: "Schools pay per successful student outcome — not per seat. If a student doesn't learn, you don't pay. We believe in aligning incentives with actual results." },
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade instantly, downgrade at end of billing cycle. No contracts, no cancellation fees, no friction." },
  { q: "What does 80% creator revenue mean?", a: "When you publish content, sell assets, or earn through the ecosystem, you keep 80%. Compare that to Roblox at 29%, YouTube at 55%, or Spotify at roughly 0.3%." },
  { q: "What's an AI agent with memory?", a: "Each agent has persistent memory via PS-SHA∞ hashing. They remember every interaction, evolve over time, and develop individual capabilities. They're teammates, not tools." },
  { q: "Is my data portable?", a: "Always. Export everything — your content, your audience contacts, your agent configurations, your vault. You own it all." },
  { q: "Do you sell my data?", a: "No. Ever. Your data trains nothing except your own agents. BlackRoad is funded by subscriptions and creator revenue sharing — not surveillance." },
];

const COMPARISONS = [
  { feature: "Creator revenue share", blackroad: "80%", others: "29–55%" },
  { feature: "Data ownership", blackroad: "Full export", others: "Platform-locked" },
  { feature: "AI agents with memory", blackroad: "Up to 1,000", others: "None" },
  { feature: "Search verification", blackroad: "Confidence scored", others: "SEO-driven" },
  { feature: "Social metrics", blackroad: "Hidden by design", others: "Vanity-first" },
  { feature: "Admin automation", blackroad: "Zero-friction OS", others: "Manual" },
];

function GradientBar({ height = 2, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function Nav() {
  return (
    <nav style={{
      padding: "0 20px", height: 52,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid #1a1a1a",
    }}>
      <a href="#" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
        <div style={{ display: "flex", gap: 2 }}>
          {COLORS.map((c) => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>BlackRoad</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a href="#compare" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>Compare</a>
        <a href="#faq" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>FAQ</a>
      </div>
    </nav>
  );
}

function PlanCard({ plan, index }) {
  return (
    <div style={{
      background: plan.highlight ? "#171717" : "#0f0f0f",
      border: `1px solid ${plan.highlight ? "#404040" : "#1a1a1a"}`,
      borderRadius: 14,
      padding: "28px 24px",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {plan.highlight && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: GRADIENT }} />
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 4, height: 16, borderRadius: 2, background: COLORS[index] }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#f5f5f5" }}>{plan.name}</span>
          {plan.highlight && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 500,
              color: "#a3a3a3", background: "#262626",
              padding: "3px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Popular
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 10 }}>
          {plan.price !== "Custom" && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252" }}>$</span>}
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: plan.price === "Custom" ? 32 : 40, fontWeight: 700, color: "#f5f5f5", lineHeight: 1 }}>
            {plan.price}
          </span>
          {plan.period && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#525252" }}>{plan.period}</span>}
        </div>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", lineHeight: 1.5, margin: 0 }}>
          {plan.desc}
        </p>
      </div>

      <div style={{ flex: 1, marginBottom: 24 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "7px 0",
            borderBottom: i < plan.features.length - 1 ? "1px solid #1a1a1a" : "none",
          }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040", flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#a3a3a3", lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
      </div>

      <button style={{
        width: "100%",
        fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
        color: plan.highlight ? "#0a0a0a" : "#d4d4d4",
        background: plan.highlight ? "#f5f5f5" : "transparent",
        border: plan.highlight ? "none" : "1px solid #404040",
        padding: "12px 0", borderRadius: 8, cursor: "pointer",
      }}>
        {plan.cta}
      </button>
    </div>
  );
}

function CompareSection() {
  return (
    <section id="compare" style={{ padding: "80px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Comparison
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 32 }}>
          What changes when the<br />incentives are different.
        </h2>

        <div style={{ background: "#171717", border: "1px solid #262626", borderRadius: 12, overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            padding: "14px 20px", borderBottom: "1px solid #262626",
          }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em" }}>Feature</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.08em" }}>BlackRoad</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em" }}>Industry</span>
          </div>
          {COMPARISONS.map((c, i) => (
            <div key={c.feature} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              padding: "12px 20px",
              borderBottom: i < COMPARISONS.length - 1 ? "1px solid #1a1a1a" : "none",
              alignItems: "center",
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373" }}>{c.feature}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#d4d4d4" }}>{c.blackroad}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#525252" }}>{c.others}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section id="faq" style={{ padding: "80px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Questions
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 32 }}>
          The fine print,<br />in plain english.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#262626", borderRadius: 12, overflow: "hidden" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: "#171717" }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: "none", border: "none",
                  padding: "18px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                }}
              >
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: openIndex === i ? "#f5f5f5" : "#a3a3a3" }}>
                  {faq.q}
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#404040", flexShrink: 0,
                  transform: openIndex === i ? "rotate(45deg)" : "none",
                  transition: "transform 0.2s ease",
                }}>
                  +
                </span>
              </button>
              {openIndex === i && (
                <div style={{ padding: "0 20px 18px" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.6, margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "0 20px 48px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <GradientBar height={1} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {COLORS.map((c) => <div key={c} style={{ width: 3, height: 10, borderRadius: 2, background: c }} />)}
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: "#a3a3a3" }}>BlackRoad OS</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040" }}>
              blackroad.io
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Home", "Docs", "GitHub"].map((link) => (
              <a key={link} href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252", textDecoration: "none" }}>{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

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
        a:hover { color: #a3a3a3 !important; }
        button:hover { opacity: 0.88; }
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <Nav />

        {/* Hero */}
        <section style={{ padding: "56px 20px 64px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252",
              textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <div style={{ display: "flex", gap: 3 }}>
                {COLORS.map((c) => <div key={c} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />)}
              </div>
              Pricing
            </div>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 7vw, 52px)",
              fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.03em", lineHeight: 1.1,
              marginBottom: 16,
            }}>
              Simple pricing.<br />Honest incentives.
            </h1>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 32px" }}>
              No hidden fees. No data selling. No dark patterns. Schools pay per outcome, not per seat. Creators keep 80%.
            </p>

            {/* Billing toggle */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              background: "#171717", borderRadius: 10, padding: 4,
            }}>
              <button
                onClick={() => setAnnual(false)}
                style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
                  color: !annual ? "#f5f5f5" : "#525252",
                  background: !annual ? "#262626" : "transparent",
                  border: "none", padding: "8px 18px", borderRadius: 7, cursor: "pointer",
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
                  color: annual ? "#f5f5f5" : "#525252",
                  background: annual ? "#262626" : "transparent",
                  border: "none", padding: "8px 18px", borderRadius: 7, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                Annual
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  color: "#a3a3a3", background: "#0a0a0a",
                  padding: "2px 6px", borderRadius: 3,
                }}>
                  2mo free
                </span>
              </button>
            </div>
          </div>
        </section>

        <GradientBar height={1} />

        {/* Plans */}
        <section style={{ padding: "56px 20px" }}>
          <div style={{
            maxWidth: 960, margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}>
            {PLANS.map((plan, i) => {
              const displayPlan = annual && plan.price !== "0" && plan.price !== "Custom"
                ? { ...plan, price: String(Math.round(parseInt(plan.price) * 10 / 12)), period: "/mo" }
                : plan;
              return <PlanCard key={plan.name} plan={displayPlan} index={i} />;
            })}
          </div>
        </section>

        <CompareSection />
        <FAQSection />

        {/* Bottom CTA */}
        <section style={{ padding: "40px 20px 80px", textAlign: "center" }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <GradientBar height={1} style={{ marginBottom: 40, opacity: 0.4 }} />
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 12 }}>
              Start free. Build when ready.
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.6, marginBottom: 28 }}>
              The Open plan is free forever. No credit card. No trial expiration. Just start.
            </p>
            <button style={{
              fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500,
              color: "#0a0a0a", background: "#f5f5f5", border: "none",
              padding: "14px 36px", borderRadius: 8, cursor: "pointer",
            }}>
              Get Started — Free
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
