import { useState, useEffect } from "react";
import { trackEvent } from "../lib/analytics";
import { useAuth } from "../lib/useAuth";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

const ROADPAY_API = "https://roadpay.amundsonalexa.workers.dev";

// Plans and addons now loaded from RoadPay API — no hardcoded Stripe price IDs

// ─── RoadPay checkout ────────────────────────────────────────────────
async function handleSubscribe(planSlug, addonSlugs, token, customerId) {
  if (!planSlug) return;
  trackEvent('checkout_start', { plan: planSlug });

  if (!token) {
    window.location.href = "/auth?redirect=/pricing";
    return;
  }

  try {
    const res = await fetch(`${ROADPAY_API}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer_id: customerId,
        plan_slug: planSlug,
        addon_slugs: addonSlugs || [],
        success_url: window.location.origin + "/billing?success=true",
        cancel_url: window.location.origin + "/pricing",
      }),
    });

    const data = await res.json();

    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else if (data.status === 'active') {
      // Free plan — subscribed immediately
      window.location.href = "/billing?success=true";
    } else {
      console.error("Subscribe error:", data);
    }
  } catch (e) {
    console.error("Subscribe failed:", e);
  }
}

async function handlePortal(customerId, token) {
  if (!customerId || !token) {
    window.location.href = "/auth?redirect=/pricing";
    return;
  }
  try {
    const res = await fetch(`${ROADPAY_API}/portal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ customer_id: customerId }),
    });
    const data = await res.json();
    // RoadPay returns full billing data, not a redirect
    return data;
  } catch (e) {
    console.error("Portal failed:", e);
  }
}

// ─── Plan colors by tier ─────────────────────────────────────────────
const TIER_COLORS = ["#4488FF", "#FF6B2B", "#8844FF", "#00D4FF"];
const TIER_CTA = ["Deploy Free", "Start Rider", "Get Paver", "Talk to Us"];
const TIER_TAGLINE = ["Open source core", "For builders", "For teams", "Custom everything"];

// ─── Components ─────────────────────────────────────────────────────
function PlanCard({ plan, annual, onSubscribe }) {
  const [hover, setHover] = useState(false);
  const color = TIER_COLORS[plan.tier] || "#4488FF";
  const price = plan.amount / 100;
  const displayPrice = plan.tier === 3 ? "Custom" : annual ? `$${Math.round(price * 10)}` : price === 0 ? "$0" : `$${price}`;
  const displayInterval = plan.tier === 3 ? "" : annual ? "/year" : price === 0 ? "" : "/mo";
  const featured = plan.tier === 2;

  const onClick = () => {
    if (plan.tier === 0) window.open("https://github.com/blackboxprogramming/BlackRoad-Operating-System", "_blank");
    else if (plan.tier === 3) window.location.href = "mailto:alexa@blackroad.io?subject=Enterprise%20Inquiry";
    else onSubscribe(plan.slug);
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: featured ? "#080808" : "#050505",
        border: `1px solid ${featured ? color + "44" : hover ? color + "33" : "#151515"}`,
        padding: "32px 24px",
        position: "relative",
        boxShadow: featured ? `0 0 60px ${color}15` : hover ? `0 0 30px ${color}10` : "none",
        display: "flex", flexDirection: "column",
        transition: "all 0.25s",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      {featured && (
        <div style={{ position: "absolute", top: -1, left: 24, right: 24, height: 2, background: GRAD }} />
      )}

      {/* Plan name */}
      <div style={{ fontFamily: mono, fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
        {plan.name}
      </div>
      <div style={{ fontFamily: inter, fontSize: 12, color: "#383838", marginBottom: 24 }}>{TIER_TAGLINE[plan.tier] || plan.description}</div>

      {/* Price */}
      <div style={{ marginBottom: 28 }}>
        <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 42, color: "#f0f0f0", letterSpacing: "-0.04em" }}>{displayPrice}</span>
        <span style={{ fontFamily: mono, fontSize: 12, color: "#383838", marginLeft: 4 }}>{displayInterval}</span>
      </div>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32, flex: 1 }}>
        {(plan.features || []).map(f => (
          <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 6 }} />
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
          background: featured ? GRAD : price === 0 ? "transparent" : color + "22",
          backgroundSize: featured ? "200% 100%" : "auto",
          border: featured ? "none" : `1px solid ${price === 0 ? "#2a2a2a" : color + "44"}`,
          color: featured ? "#fff" : price === 0 ? "#888" : "#f5f5f5",
          cursor: "pointer",
          transition: "all 0.2s",
          letterSpacing: "0.01em",
        }}
      >{TIER_CTA[plan.tier] || plan.name}</button>
    </div>
  );
}

const ADDON_COLORS = { "lucidia-enhanced": "#8844FF", "roadauth": "#FF2255", "context-bridge": "#4488FF", "knowledge-hub": "#FF6B2B" };

function AddonCard({ addon, onSubscribe }) {
  const [hover, setHover] = useState(false);
  const color = ADDON_COLORS[addon.slug] || "#4488FF";
  const price = addon.amount / 100;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSubscribe(addon.slug)}
      style={{
        background: "#050505",
        border: `1px solid ${hover ? color + "33" : "#151515"}`,
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex", alignItems: "center", gap: 16,
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color + "15", border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 14, color: "#d0d0d0", marginBottom: 2 }}>{addon.name}</div>
        <div style={{ fontFamily: inter, fontSize: 12, color: "#444" }}>{addon.description}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f0f0f0" }}>${price}</div>
        <div style={{ fontFamily: mono, fontSize: 9, color: "#383838" }}>/mo</div>
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
  const [plans, setPlans] = useState([]);
  const [addons, setAddons] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    fetch(`${ROADPAY_API}/plans`).then(r => r.json()).then(d => setPlans(d.plans || [])).catch(() => {});
    fetch(`${ROADPAY_API}/addons`).then(r => r.json()).then(d => setAddons(d.addons || [])).catch(() => {});
  }, []);

  // Check if user has existing subscription
  useEffect(() => {
    if (user?.email) {
      fetch(`${ROADPAY_API}/lookup?email=${encodeURIComponent(user.email)}`)
        .then(r => r.json())
        .then(d => { if (d.found) setCurrentPlan(d); })
        .catch(() => {});
    }
  }, [user]);

  const doSubscribe = async (planSlug, addonSlugs) => {
    // Ensure customer exists in RoadPay
    if (!user) {
      window.location.href = "/auth?redirect=/pricing";
      return;
    }

    let customerId = currentPlan?.customer_id;
    if (!customerId) {
      // Create customer
      try {
        const res = await fetch(`${ROADPAY_API}/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ email: user.email, name: user.name || user.email }),
        });
        const data = await res.json();
        if (data.id) customerId = data.id;
        else if (res.status === 409) {
          // Already exists, look them up
          const lookup = await fetch(`${ROADPAY_API}/lookup?email=${encodeURIComponent(user.email)}`).then(r => r.json());
          customerId = lookup.customer_id;
        }
      } catch (e) {
        console.error("Customer creation failed:", e);
        return;
      }
    }

    handleSubscribe(planSlug, addonSlugs, token, customerId);
  };

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
                {opt === "Annual" && <span style={{ fontFamily: mono, fontSize: 9, color: "#f5f5f5", marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00D4FF", display: "inline-block" }} />-17%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Current plan indicator */}
        {currentPlan?.plan && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#060606", border: "1px solid #1a1a1a", padding: "8px 16px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4FF" }} />
              <span style={{ fontFamily: inter, fontSize: 12, color: "#888" }}>Current plan: <strong style={{ color: "#f0f0f0" }}>{currentPlan.plan.name}</strong></span>
            </div>
          </div>
        )}

        {/* Plans */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 60px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
            {plans.map(p => <PlanCard key={p.id} plan={p} annual={annual} onSubscribe={(slug) => doSubscribe(slug)} />)}
          </div>
        </div>

        {/* Add-ons */}
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px 60px" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20, textAlign: "center" }}>Add-ons</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {addons.map(a => <AddonCard key={a.id} addon={a} onSubscribe={(slug) => doSubscribe('rider', [slug])} />)}
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
            <FAQItem q="How does billing work?" a="Billing is powered by RoadPay, BlackRoad's own payment system. You can manage your subscription, view invoices, and update payment methods through the billing portal." />
          </div>
        </div>

        {/* Billing portal link */}
        <div style={{ textAlign: "center", padding: "0 20px 60px" }}>
          <button
            onClick={() => handlePortal(currentPlan?.customer_id, token)}
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
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>BlackRoad OS — Pave Tomorrow. · Powered by RoadPay</div>
          <div style={{ height: 1, width: 40, background: GRAD, opacity: 0.4 }} />
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>Z:=yx−w · 2026</div>
        </div>
      </div>
    </>
  );
}
