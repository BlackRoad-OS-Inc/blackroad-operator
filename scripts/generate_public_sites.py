#!/usr/bin/env python3
"""Generate consumer-friendly website landing pages for BlackRoad domains."""

from __future__ import annotations

from html import escape
from pathlib import Path


ROOT = Path("/Users/alexa/blackroad-operator")
WEBSITES_DIR = ROOT / "websites"


PILLARS = [
    ("BlackRoad-OS", "the platform", "Core apps, APIs, operator systems, and runtime tooling."),
    ("BlackRoad-AI", "the intelligence", "Local-first AI, agents, memory systems, and model integrations."),
    ("BlackRoad-Studio", "the experience", "Websites, design systems, docs, and polished product surfaces."),
    ("BlackRoad-Forge", "the experiments", "Prototypes, interactive builds, tutorials, and maker projects."),
]


SITE_OVERRIDES = {
    "blackroad-io": {
        "title": "BlackRoad",
        "eyebrow": "Public Front Door",
        "description": "BlackRoad builds the platform, intelligence, experience, and experiments behind a sovereign software ecosystem.",
        "cta_primary": ("Explore The Ecosystem", "#pillars"),
        "cta_secondary": ("View Docs", "https://docs.blackroad.io"),
        "links": [
            ("Platform", "https://github.com/BlackRoad-OS"),
            ("AI", "https://github.com/BlackRoad-AI"),
            ("Studio", "https://github.com/BlackRoad-Studio"),
            ("Forge", "https://github.com/BlackRoad-Forge"),
        ],
        "stats": [("4", "Public Orgs"), ("Sovereign", "Posture"), ("Local-First", "AI"), ("Operator", "Runtime")],
    },
    "blackroad-ai": {
        "title": "BlackRoad AI",
        "eyebrow": "The Intelligence",
        "description": "The intelligence layer of BlackRoad: local-first AI systems, agents, memory, and model integrations.",
    },
    "blackroad-company": {
        "title": "BlackRoad Company",
        "eyebrow": "Company",
        "description": "The company-facing home for the BlackRoad ecosystem, products, and long-range roadmap.",
    },
    "blackroad-network": {
        "title": "BlackRoad Network",
        "eyebrow": "Platform Infrastructure",
        "description": "Connectivity, routing, gateways, and the network layer that supports the BlackRoad platform.",
    },
    "blackroad-systems": {
        "title": "BlackRoad Systems",
        "eyebrow": "Fleet Status",
        "description": "A live systems view into the fleet, infrastructure posture, and the current health of the BlackRoad runtime.",
    },
    "lucidia-earth": {
        "title": "Lucidia Earth",
        "eyebrow": "AI Surface",
        "description": "Lucidia is a public-facing BlackRoad AI surface focused on reasoning, memory, and local-first intelligence.",
    },
    "lucidia-studio": {
        "title": "Lucidia Studio",
        "eyebrow": "Studio Surface",
        "description": "The design-forward home for Lucidia interfaces, identity, and public product presentation.",
    },
    "roadsearch": {
        "title": "RoadSearch",
        "eyebrow": "Discovery",
        "description": "Search the BlackRoad ecosystem across products, docs, systems, and experiments.",
    },
    "roadcode": {
        "title": "RoadCode",
        "eyebrow": "Developer Surface",
        "description": "Code hosting and developer workflows inside the broader BlackRoad platform ecosystem.",
    },
    "roadcoin": {
        "title": "RoadCoin",
        "eyebrow": "Experiment",
        "description": "An experimental economic layer for the BlackRoad ecosystem, focused on coordination, exchange, and incentives.",
    },
}


DOMAIN_MAP = {
    "blackroad-io": "blackroad.io",
    "blackroad-ai": "blackroadai.com",
    "blackroad-company": "blackroad.company",
    "blackroad-me": "blackroad.me",
    "blackroad-network": "blackroad.network",
    "blackroad-systems": "blackroad.systems",
    "blackroadinc-us": "blackroadinc.us",
    "blackroadqi": "blackroadqi.com",
    "blackroad-quantum": "blackroadquantum.com",
    "blackroad-quantum-info": "blackroadquantum.info",
    "blackroad-quantum-net": "blackroadquantum.net",
    "blackroad-quantum-shop": "blackroadquantum.shop",
    "blackroad-quantum-store": "blackroadquantum.store",
    "lucidia-earth": "lucidia.earth",
    "lucidia-studio": "lucidia.studio",
    "lucidiaqi": "lucidiaqi.com",
    "roadchain": "roadchain.io",
    "roadcoin": "roadcoin.io",
    "blackboxprogramming": "blackboxprogramming.io",
}


EXCLUDED = {"_templates", "_shared", "wiki"}


def titleize(slug: str) -> str:
    pieces = slug.replace("-", " ").split()
    cooked: list[str] = []
    for piece in pieces:
        if piece.lower() in {"ai", "os", "qi"}:
            cooked.append(piece.upper())
        elif piece.lower() == "lucidia":
            cooked.append("Lucidia")
        elif piece.lower() == "blackroad":
            cooked.append("BlackRoad")
        else:
            cooked.append(piece.capitalize())
    return " ".join(cooked)


def site_kind(slug: str) -> str:
    if slug.startswith("lucidia") or slug in {"blackroad-ai", "mind"}:
        return "BlackRoad-AI"
    if slug.startswith("road") or slug in {"game", "sim", "tutor", "kids", "writing"}:
        return "BlackRoad-Forge"
    if slug.startswith("blackroad") or slug in {"dashboard", "status-app", "docs-app", "directory", "ecosystem"}:
        return "BlackRoad-OS"
    return "BlackRoad-Studio"


def default_description(slug: str) -> str:
    kind = site_kind(slug)
    title = titleize(slug)
    if kind == "BlackRoad-AI":
        return f"{title} is part of the BlackRoad AI surface, focused on local-first intelligence, memory, and agent systems."
    if kind == "BlackRoad-Forge":
        return f"{title} is part of BlackRoad Forge, where experiments, tutorials, prototypes, and interactive builds take shape."
    if kind == "BlackRoad-Studio":
        return f"{title} is part of BlackRoad Studio, the experience layer for public websites, design systems, and polished surfaces."
    return f"{title} is part of BlackRoad OS, the core platform for apps, APIs, operator systems, and runtime infrastructure."


def stat_block(kind: str) -> list[tuple[str, str]]:
    if kind == "BlackRoad-AI":
        return [("Local-First", "AI"), ("Agents", "Systems"), ("Memory", "Layer"), ("Reasoning", "Surface")]
    if kind == "BlackRoad-Forge":
        return [("Prototype", "Velocity"), ("Interactive", "Builds"), ("Tutorial", "Flow"), ("Maker", "Mindset")]
    if kind == "BlackRoad-Studio":
        return [("Public", "Surface"), ("Design", "System"), ("Docs", "Layer"), ("Brand", "Signals")]
    return [("Platform", "Core"), ("Operator", "Runtime"), ("Services", "Layer"), ("Sovereign", "Compute")]


def related_links(kind: str) -> list[tuple[str, str]]:
    base = [
        ("Home", "https://blackroad.io"),
        ("Docs", "https://docs.blackroad.io"),
        ("Search", "https://search.blackroad.io"),
        ("GitHub", "https://github.com/BlackRoad-OS"),
    ]
    if kind == "BlackRoad-AI":
        return [("BlackRoad AI", "https://github.com/BlackRoad-AI"), ("Lucidia", "https://lucidia.earth"), *base]
    if kind == "BlackRoad-Forge":
        return [("BlackRoad Forge", "https://github.com/BlackRoad-Forge"), ("RoadSearch", "https://search.blackroad.io"), *base]
    if kind == "BlackRoad-Studio":
        return [("BlackRoad Studio", "https://github.com/BlackRoad-Studio"), ("BlackRoad.io", "https://blackroad.io"), *base]
    return [("BlackRoad OS", "https://github.com/BlackRoad-OS"), ("Systems", "https://blackroad.systems"), *base]


def render_pillars() -> str:
    cards = []
    for org, label, blurb in PILLARS:
        cards.append(
            f"""
        <article class="pillar-card">
          <div class="section-label">{escape(label)}</div>
          <h3>{escape(org)}</h3>
          <p>{escape(blurb)}</p>
        </article>"""
        )
    return "\n".join(cards)


def render_links(links: list[tuple[str, str]]) -> str:
    return "\n".join(
        f'<a class="link-pill" href="{escape(url)}">{escape(label)}</a>' for label, url in links
    )


def render_stats(stats: list[tuple[str, str]]) -> str:
    return "\n".join(
        f"""
      <div class="stat-card">
        <div class="stat-value">{escape(value)}</div>
        <div class="stat-label">{escape(label)}</div>
      </div>"""
        for value, label in stats
    )


def build_html(slug: str) -> str:
    override = SITE_OVERRIDES.get(slug, {})
    title = override.get("title", titleize(slug))
    kind = site_kind(slug)
    eyebrow = override.get("eyebrow", kind.replace("BlackRoad-", ""))
    description = override.get("description", default_description(slug))
    canonical_domain = DOMAIN_MAP.get(slug)
    canonical = f"https://{canonical_domain}" if canonical_domain else f"https://blackroad.io/{slug}"
    cta_primary = override.get("cta_primary", ("Explore BlackRoad OS", "https://blackroad.io"))
    cta_secondary = override.get("cta_secondary", ("View GitHub", f"https://github.com/{kind}"))
    links = override.get("links", related_links(kind))
    stats = override.get("stats", stat_block(kind))

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{escape(title)} | BlackRoad</title>
  <meta name="description" content="{escape(description)}">
  <meta name="theme-color" content="#0b0b0b">
  <link rel="canonical" href="{escape(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{escape(title)} | BlackRoad">
  <meta property="og:description" content="{escape(description)}">
  <meta property="og:url" content="{escape(canonical)}">
  <meta property="og:site_name" content="BlackRoad">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{escape(title)} | BlackRoad">
  <meta name="twitter:description" content="{escape(description)}">
  <link rel="icon" type="image/png" sizes="32x32" href="https://images.blackroad.io/brand/br-square-32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="https://images.blackroad.io/brand/br-square-192.png">
  <link rel="apple-touch-icon" sizes="180x180" href="https://images.blackroad.io/brand/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #090909;
      --bg-soft: #111111;
      --card: #131313;
      --border: #232323;
      --text: #f5f5f5;
      --muted: #b2b2b2;
      --dim: #6d6d6d;
      --ember: #ff6b2b;
      --flare: #ff2255;
      --magenta: #cc00aa;
      --orchid: #8844ff;
      --arc: #4488ff;
      --cyan: #00d4ff;
      --grad: linear-gradient(100deg, var(--ember), var(--flare), var(--magenta), var(--orchid), var(--arc), var(--cyan));
      --display: 'Space Grotesk', sans-serif;
      --body: 'Inter', sans-serif;
      --mono: 'JetBrains Mono', monospace;
    }}
    * {{ box-sizing: border-box; }}
    html, body {{ margin: 0; padding: 0; background: radial-gradient(circle at top, #151515 0, var(--bg) 45%); color: var(--text); }}
    body {{ font-family: var(--body); min-height: 100vh; }}
    a {{ color: inherit; text-decoration: none; }}
    .topbar {{ height: 4px; background: var(--grad); background-size: 180% 100%; animation: shift 7s linear infinite; }}
    @keyframes shift {{ from {{ background-position: 0 0; }} to {{ background-position: 180% 0; }} }}
    .shell {{ max-width: 1160px; margin: 0 auto; padding: 0 24px 80px; }}
    .nav {{ display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid var(--border); }}
    .brand {{ display: flex; align-items: center; gap: 12px; font-family: var(--display); font-weight: 700; letter-spacing: -0.03em; }}
    .brand-mark {{ display: grid; grid-template-columns: repeat(3, 8px); gap: 4px; }}
    .brand-mark span {{ width: 8px; height: 8px; border-radius: 999px; }}
    .brand-mark span:nth-child(1) {{ background: var(--ember); }}
    .brand-mark span:nth-child(2) {{ background: var(--flare); }}
    .brand-mark span:nth-child(3) {{ background: var(--cyan); }}
    .nav-links {{ display: flex; gap: 18px; font-size: 13px; color: var(--muted); }}
    .hero {{ padding: 72px 0 48px; display: grid; gap: 28px; }}
    .eyebrow {{ font-family: var(--mono); color: var(--dim); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; }}
    h1 {{ font-family: var(--display); font-size: clamp(38px, 6vw, 74px); line-height: 0.95; letter-spacing: -0.05em; margin: 0; max-width: 900px; }}
    .hero-copy {{ max-width: 740px; font-size: 18px; line-height: 1.7; color: var(--muted); }}
    .hero-actions {{ display: flex; flex-wrap: wrap; gap: 14px; }}
    .btn-primary, .btn-secondary {{ padding: 14px 20px; border-radius: 999px; font-weight: 600; font-size: 14px; }}
    .btn-primary {{ background: var(--text); color: #050505; }}
    .btn-secondary {{ border: 1px solid var(--border); color: var(--muted); }}
    .stats {{ display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }}
    .stat-card, .pillar-card {{ background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 20px; padding: 20px; }}
    .stat-value {{ font-family: var(--display); font-size: clamp(24px, 4vw, 34px); letter-spacing: -0.04em; }}
    .stat-label {{ font-family: var(--mono); font-size: 11px; color: var(--dim); text-transform: uppercase; letter-spacing: 0.12em; margin-top: 6px; }}
    .section {{ padding: 40px 0; }}
    .section-head {{ display: grid; gap: 10px; margin-bottom: 20px; }}
    .section-head h2 {{ font-family: var(--display); font-size: clamp(26px, 4vw, 40px); letter-spacing: -0.04em; margin: 0; }}
    .section-head p {{ margin: 0; color: var(--muted); max-width: 760px; line-height: 1.7; }}
    .pillars {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }}
    .pillar-card h3 {{ font-family: var(--display); margin: 8px 0 10px; font-size: 24px; letter-spacing: -0.03em; }}
    .pillar-card p {{ color: var(--muted); margin: 0; line-height: 1.7; }}
    .links {{ display: flex; flex-wrap: wrap; gap: 10px; }}
    .link-pill {{ border: 1px solid var(--border); border-radius: 999px; padding: 10px 14px; color: var(--muted); font-size: 13px; }}
    footer {{ margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; gap: 12px; color: var(--dim); font-family: var(--mono); font-size: 11px; }}
    @media (max-width: 860px) {{
      .stats, .pillars {{ grid-template-columns: 1fr 1fr; }}
      .nav {{ gap: 16px; flex-direction: column; align-items: flex-start; }}
      footer {{ flex-direction: column; }}
    }}
    @media (max-width: 560px) {{
      .shell {{ padding: 0 16px 56px; }}
      .stats, .pillars {{ grid-template-columns: 1fr; }}
      .hero {{ padding-top: 44px; }}
      .hero-copy {{ font-size: 16px; }}
    }}
  </style>
</head>
<body>
  <div class="topbar"></div>
  <div class="shell">
    <nav class="nav">
      <a class="brand" href="https://blackroad.io">
        <span class="brand-mark"><span></span><span></span><span></span></span>
        <span>BlackRoad</span>
      </a>
      <div class="nav-links">
        <a href="https://github.com/BlackRoad-OS">OS</a>
        <a href="https://github.com/BlackRoad-AI">AI</a>
        <a href="https://github.com/BlackRoad-Studio">Studio</a>
        <a href="https://github.com/BlackRoad-Forge">Forge</a>
      </div>
    </nav>

    <main>
      <section class="hero">
        <div class="eyebrow">{escape(eyebrow)}</div>
        <h1>{escape(title)}</h1>
        <p class="hero-copy">{escape(description)}</p>
        <div class="hero-actions">
          <a class="btn-primary" href="{escape(cta_primary[1])}">{escape(cta_primary[0])}</a>
          <a class="btn-secondary" href="{escape(cta_secondary[1])}">{escape(cta_secondary[0])}</a>
        </div>
      </section>

      <section class="section">
        <div class="stats">
          {render_stats(stats)}
        </div>
      </section>

      <section class="section" id="pillars">
        <div class="section-head">
          <div class="eyebrow">Public Map</div>
          <h2>The BlackRoad ecosystem is organized around 4 public surfaces.</h2>
          <p>Instead of asking visitors to decode dozens of internal orgs, BlackRoad now leads with 4 clear pillars: the platform, the intelligence, the experience, and the experiments.</p>
        </div>
        <div class="pillars">
          {render_pillars()}
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div class="eyebrow">Related</div>
          <h2>Keep moving.</h2>
          <p>Use these links to move across the public BlackRoad surface without getting lost in internal structure.</p>
        </div>
        <div class="links">
          {render_links(links)}
        </div>
      </section>
    </main>

    <footer>
      <span>{escape(title)} · part of BlackRoad</span>
      <span>Pave Tomorrow.</span>
    </footer>
  </div>
</body>
</html>
"""


def main() -> int:
    for site_dir in sorted(WEBSITES_DIR.iterdir()):
        if not site_dir.is_dir() or site_dir.name in EXCLUDED:
            continue
        index_path = site_dir / "index.html"
        if not index_path.exists():
            continue
        index_path.write_text(build_html(site_dir.name), encoding="utf-8")
        print(f"generated\t{index_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
