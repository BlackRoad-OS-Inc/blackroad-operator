import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CONFIG } from "../lib/config";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

const STRIPE_API = "https://stripe.blackroad.io";

const stripePromise = CONFIG.stripe.publishableKey
  ? loadStripe(CONFIG.stripe.publishableKey)
  : null;

// ─── Plan definitions ───────────────────────────────────────────────
const PLANS = [
  {
    id: "operator",
    name: "Operator",
    tagline: "Open source core",
    price: 0,
    interval: "forever",
    color: "#4488FF",
    priceId: null,
    features: [
      "Self-hosted deployment",
      "Lucidia base agent",
      "Z-framework SDK",
      "Community support",
      "BlackRoad CLI tools",
      "1 Pi node",
    ],
    cta: "Deploy Free",
    action: "github",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For builders",
    price: 49,
    interval: "month",
    color: "#FF6B2B",
    priceId: "price_1SzlKdChUUSEbzyhh5y6TzhL",
    features: [
      "Everything in Operator",
      "3 AI agents",
      "RoadCode private repos",
      "Pixel Memory (×4,096)",
      "Priority support",
      "Up to 3 nodes",
    ],
    cta: "Start Pro",
    action: "checkout",
  },
  {
    id: "sovereign",
    name: "Sovereign",
    tagline: "Full sovereignty",
    price: 299,
    interval: "month",
    color: "#8844FF",
    featured: true,
    priceId: "price_1SzlKmChUUSEbzyhXSDXOAVw",
    features: [
      "Everything in Pro",
      "Full agent fleet (8 agents)",
      "Hybrid Memory (×2.18B)",
      "Threshold addressing",
      "Dedicated infrastructure",
      "Unlimited nodes",
      "SLA guarantee",
      "Direct Slack support",
    ],
    cta: "Get Sovereign",
    action: "checkout",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom everything",
    price: null,
    interval: "custom",
    color: "#00D4FF",
    priceId: "price_1T0oP8ChUUSEbzyhWO1Y5vHJ",
    features: [
      "Everything in Sovereign",
      "White-label OS",
      "On-prem or air-gapped",
      "Custom agent training",
      "Hailo-8 AI acceleration",
      "Dedicated success team",
      "Custom integrations",
      "Volume licensing",
    ],
    cta: "Talk to Us",
    action: "contact",
  },
];

const ADDONS = [
  { name: "Lucidia Enhanced", price: 29, interval: "mo", priceId: "price_1T0oP4ChUUSEbzyhxPGyhZEe", desc: "Advanced reasoning + memory", color: "#8844FF" },
  { name: "RoadAuth Startup", price: 99, interval: "mo", priceId: "price_1T0oP5ChUUSEbzyhBXArCxFy", desc: "Auth, SSO, RBAC for your apps", color: "#FF2255" },
  { name: "Context Bridge", price: 10, interval: "mo", priceId: "price_1T0DndChUUSEbzyhy6FPPtXG", desc: "AI assistant context hosting", color: "#4488FF" },
  { name: "Knowledge Hub", price: 15, interval: "mo", priceId: "price_1Snl1ZChUUSEbzyhMhOCqYoB", desc: "Searchable knowledge base", color: "#FF6B2B" },
];

// ─── Checkout handler ───────────────────────────────────────────────
async function handleCheckout(priceId) {
  if (!priceId) return;

  try {
    const res = await fetch(`${STRIPE_API}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        successUrl: window.location.origin + "/billing?success=true",
        cancelUrl: window.location.origin + "/pricing",
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else if (data.sessionId && stripePromise) {
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } else {
      console.error("Checkout error:", data);
    }
  } catch (err) {
    console.error("Checkout failed:", err);
  }
}

async function handlePortal() {
  try {
    const res = await fetch(`${STRIPE_API}/portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        returnUrl: window.location.origin + "/billing",
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  } catch (err) {
    console.error("Portal failed:", err);
  }
}

// ─── Components ─────────────────────────────────────────────────────
function PlanCard({ plan, annual }) {
  const [hover, setHover] = useState(false);
  const displayPrice = plan.price === null ? "Custom" : annual ? `$${Math.round(plan.price * 10)}` : `$${plan.price}`;
  const displayInterval = plan.price === null ? "" : annual ? "/year" : plan.price === 0 ? "" : "/mo";

  const onClick = () => {
    if (plan.action === "github") window.open("https://github.com/blackroad-os", "_blank");
    else if (plan.action === "contact") window.location.href = "mailto:alexa@blackroad.io?subject=Enterprise%20Inquiry";
    else if (plan.action === "checkout") handleCheckout(plan.priceId);
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: plan.featured ? "#080808" : "#050505",
        border: `1px solid ${plan.featured ? plan.color + "44" : hover ? plan.color + "33" : "#151515"}`,
        padding: "32px 24px",
        position: "relative",
        boxShadow: plan.featured ? `0 0 60px ${plan.color}15` : hover ? `0 0 30px ${plan.color}10` : "none",
        display: "flex", flexDirection: "column",
        transition: "all 0.25s",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      {plan.featured && (
        <div style={{ position: "absolute", top: -1, left: 24, right: 24, height: 2, background: GRAD }} />
      )}

      {/* Plan name */}
      <div style={{ fontFamily: mono, fontSize: 9, color: plan.color, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>{plan.name}</div>
      <div style={{ fontFamily: inter, fontSize: 12, color: "#383838", marginBottom: 24 }}>{plan.tagline}</div>

      {/* Price */}
      <div style={{ marginBottom: 28 }}>
        <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 42, color: "#f0f0f0", letterSpacing: "-0.04em" }}>{displayPrice}</span>
        <span style={{ fontFamily: mono, fontSize: 12, color: "#383838", marginLeft: 4 }}>{displayInterval}</span>
      </div>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32, flex: 1 }}>
        {plan.features.map(f => (
          <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: plan.color, flexShrink: 0, marginTop: 6 }} />
            <span style={{ fontFamily: inter, fontSize: 13, color: "#606060", lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onClick}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        style={{
          fontFamily: inter, fontWeight: 600, fontSize: 14,
          padding: "14px 24px",
          background: plan.featured ? GRAD : plan.price === 0 ? "transparent" : plan.color + "22",
          backgroundSize: plan.featured ? "200% 100%" : "auto",
          border: plan.featured ? "none" : `1px solid ${plan.price === 0 ? "#2a2a2a" : plan.color + "44"}`,
          color: plan.featured ? "#fff" : plan.price === 0 ? "#888" : plan.color,
          cursor: "pointer",
          transition: "all 0.2s",
          letterSpacing: "0.01em",
        }}
      >{plan.cta}</button>
    </div>
  );
}

function AddonCard({ addon }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => handleCheckout(addon.priceId)}
      style={{
        background: "#050505",
        border: `1px solid ${hover ? addon.color + "33" : "#151515"}`,
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex", alignItems: "center", gap: 16,
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: addon.color + "15", border: `1px solid ${addon.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: addon.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 14, color: "#d0d0d0", marginBottom: 2 }}>{addon.name}</div>
        <div style={{ fontFamily: inter, fontSize: 12, color: "#444" }}>{addon.desc}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f0f0f0" }}>${addon.price}</div>
        <div style={{ fontFamily: mono, fontSize: 9, color: "#383838" }}>/{addon.interval}</div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: "#050505",
        border: "1px solid #151515",
        padding: "18px 20px",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: inter, fontSize: 14, color: "#c0c0c0", fontWeight: 500 }}>{q}</span>
        <span style={{ fontFamily: mono, fontSize: 14, color: "#383838", transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </div>
      {open && (
        <div style={{ fontFamily: inter, fontSize: 13, color: "#555", lineHeight: 1.7, marginTop: 12, paddingTop: 12, borderTop: "1px solid #111" }}>{a}</div>
      )}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────
export default function BlackRoadPricing() {
  const [annual, setAnnual] = useState(false);
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    fetch(`${STRIPE_API}/prices`)
      .then(r => r.json())
      .then(d => setPrices(d.prices))
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; background: #000; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        @keyframes gradShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#f0f0f0" }}>
        {/* Header */}
        <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "80px 20px 60px", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>Pricing</div>
          <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(36px, 8vw, 64px)", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 20 }}>
            Simple. Sovereign.<br />No surprises.
          </h1>
          <p style={{ fontFamily: inter, fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 32 }}>
            Own your infrastructure. Every plan includes BlackRoad Cloud, RoadCode, and the full agent framework.
          </p>

          {/* Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#060606", border: "1px solid #1a1a1a", padding: "4px", borderRadius: 0 }}>
            {["Monthly", "Annual"].map(opt => (
              <button
                key={opt}
                onClick={() => setAnnual(opt === "Annual")}
                style={{
                  fontFamily: inter, fontSize: 13, fontWeight: 500,
                  padding: "8px 20px",
                  background: (opt === "Annual") === annual ? "#111" : "transparent",
                  border: "none",
                  color: (opt === "Annual") === annual ? "#f0f0f0" : "#444",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {opt}
                {opt === "Annual" && <span style={{ fontFamily: mono, fontSize: 9, color: "#00D4FF", marginLeft: 6 }}>-17%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 60px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
            {PLANS.map(p => <PlanCard key={p.id} plan={p} annual={annual} />)}
          </div>
        </div>

        {/* Add-ons */}
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px 60px" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20, textAlign: "center" }}>Add-ons</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ADDONS.map(a => <AddonCard key={a.name} addon={a} />)}
          </div>
        </div>

        {/* Comparison */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 60px" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20, textAlign: "center" }}>Compare Plans</div>
          <div style={{ border: "1px solid #151515", overflow: "hidden" }}>
            {[
              ["Feature", "Operator", "Pro", "Sovereign", "Enterprise"],
              ["AI Agents", "1", "3", "8", "Unlimited"],
              ["Memory Encoding", "Binary", "Binary + Trinary", "Hybrid (×2.18B)", "Custom"],
              ["Pixel Memory", "—", "×4,096", "×531,441", "×2.18B"],
              ["Nodes", "1", "3", "Unlimited", "Unlimited"],
              ["RoadCode Repos", "Public", "Private", "Unlimited", "Unlimited"],
              ["Threshold Addressing", "—", "—", "34 positions", "Custom chain"],
              ["Decision Routing", "—", "YES only", "YES/NO/MACHINE", "Custom"],
              ["Support", "Community", "Email", "Slack + SLA", "Dedicated team"],
              ["Infrastructure", "Self-hosted", "Shared", "Dedicated", "On-prem"],
            ].map((row, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(4, 1fr)", borderBottom: ri < 9 ? "1px solid #111" : "none", background: ri === 0 ? "#060606" : "transparent" }}>
                {row.map((cell, ci) => (
                  <div key={ci} style={{
                    padding: "12px 14px",
                    fontFamily: ri === 0 || ci === 0 ? mono : inter,
                    fontSize: ri === 0 ? 9 : 12,
                    color: ri === 0 ? "#555" : ci === 0 ? "#888" : cell === "—" ? "#222" : "#666",
                    fontWeight: ri === 0 ? 500 : 400,
                    textTransform: ri === 0 ? "uppercase" : "none",
                    letterSpacing: ri === 0 ? "0.1em" : "0",
                    borderRight: ci < 4 ? "1px solid #0d0d0d" : "none",
                    textAlign: ci === 0 ? "left" : "center",
                  }}>{cell}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px 80px" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20, textAlign: "center" }}>FAQ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <FAQItem q="What is Pixel Memory?" a="Pixel Memory is our content-addressable storage system. Each physical byte encodes up to 4,096 logical bytes through dedup, delta compression, and symbolic hashing. 500 GB physical = 2 PB logical." />
            <FAQItem q="What are the 8 agents?" a="Alice (Gateway), Lucidia (Memory), Cecilia (Edge), Cece (API), Aria (Orchestration), Eve (Intelligence), Meridian (Networking), and Sentinel (Security). Each runs on dedicated hardware." />
            <FAQItem q="Can I self-host everything?" a="Yes. The Operator plan is fully open source. You deploy to your own Raspberry Pis, servers, or cloud instances. We never touch your data." />
            <FAQItem q="What is Z:=yx-w?" a="The Z-framework is our unified feedback primitive. It models every system interaction as Z = yx - w, making infrastructure composable, predictable, and mathematically coherent." />
            <FAQItem q="How does billing work?" a="All billing is handled through Stripe. You can manage your subscription, update payment methods, and view invoices through the billing portal." />
          </div>
        </div>

        {/* Billing portal link */}
        <div style={{ textAlign: "center", padding: "0 20px 60px" }}>
          <button
            onClick={handlePortal}
            style={{
              fontFamily: inter, fontSize: 13, color: "#444",
              background: "none", border: "1px solid #1a1a1a",
              padding: "10px 24px", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#888"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#444"; }}
          >
            Manage existing subscription →
          </button>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #0d0d0d", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>BlackRoad OS, Inc. · Payments secured by Stripe</div>
          <div style={{ height: 1, width: 40, background: GRAD, opacity: 0.4 }} />
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>Z:=yx−w · 2026</div>
        </div>
      </div>
    </>
  );
}
