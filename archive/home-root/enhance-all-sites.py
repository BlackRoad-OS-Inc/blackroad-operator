#!/usr/bin/env python3
"""
BlackRoad Fleet Enhancement — Enhance all 100 CF Pages sites.
Adds: GA4, RoundTrip chat, Stripe CTA, robots.txt, sitemap.xml,
      JSON-LD, security headers, preconnect, canonical URLs.
"""
import subprocess, os, sys, tempfile, shutil, json, re, time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import urlopen, Request
from urllib.error import URLError

WORK = tempfile.mkdtemp(prefix="br-enhance-")
GA_ID = "G-XXXXXXXXXX"
TODAY = datetime.now().strftime("%Y-%m-%d")

SITES = [
    "app-blackroad-io", "blackboxprogramming-io", "blackroad-agents",
    "blackroad-alexa", "blackroad-animation-dictionary", "blackroad-autobahn",
    "blackroad-beacon", "blackroad-blackmode", "blackroad-boulevard",
    "blackroad-brand-kit", "blackroad-brand-style-guide", "blackroad-bypass",
    "blackroad-cadence", "blackroad-canvas", "blackroad-carkeys",
    "blackroad-company", "blackroad-compass", "blackroad-crossroads",
    "blackroad-cruise", "blackroad-dashboard", "blackroad-detour",
    "blackroad-directory", "blackroad-express", "blackroad-family",
    "blackroad-freeway", "blackroad-game", "blackroad-garage",
    "blackroad-greenlight", "blackroad-guardrail", "blackroad-handoff",
    "blackroad-highway", "blackroad-intersection", "blackroad-io",
    "blackroad-kids", "blackroad-lane", "blackroad-live",
    "blackroad-loading-bars", "blackroad-loadroad", "blackroad-me",
    "blackroad-median", "blackroad-merge", "blackroad-mile",
    "blackroad-mind", "blackroad-music", "blackroad-network",
    "blackroad-operator", "blackroad-os-brand", "blackroad-os-docs",
    "blackroad-os-prism", "blackroad-os-web", "blackroad-parkway",
    "blackroad-pricing", "blackroad-prism-console", "blackroad-radio",
    "blackroad-ramp", "blackroad-research", "blackroad-roadblock",
    "blackroad-roadbook", "blackroad-roadcode", "blackroad-roadflow",
    "blackroad-roadloop", "blackroad-roadpay", "blackroad-roadrunner",
    "blackroad-roadsearch", "blackroad-roadsync", "blackroad-roadtv",
    "blackroad-roadwork", "blackroad-route", "blackroad-shoulder",
    "blackroad-showcase", "blackroad-signal-alerts", "blackroad-sim",
    "blackroad-social", "blackroad-stats", "blackroad-sunroof",
    "blackroad-systems", "blackroad-toll", "blackroad-trailhead",
    "blackroad-translate", "blackroad-tube", "blackroad-tutor",
    "blackroad-tv", "blackroad-video", "blackroad-wiki",
    "blackroad-world", "blackroad-writing", "blackroadai-com",
    "blackroadinc-us", "blackroadqi-com", "blackroadquantum-com",
    "blackroadquantum-info", "blackroadquantum-net", "blackroadquantum-shop",
    "blackroadquantum-store", "lucidia-earth", "lucidia-platform",
    "lucidia-studio", "lucidiaqi-com", "roadchain-io", "roadcoin-io",
]

# ── Snippets ──

GA4_SNIPPET = f'''<!-- GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag('js',new Date());gtag('config','{GA_ID}')</script>'''

PRECONNECT = '''<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.blackroad.io">'''

CHAT_WIDGET = '''<!-- RoundTrip Chat Widget -->
<div id="br-chat-toggle" onclick="var f=document.getElementById('br-chat-frame');f.style.display=f.style.display==='none'?'flex':'none'" style="position:fixed;bottom:20px;right:20px;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#FF6B2B,#CC00AA);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999;box-shadow:0 4px 20px rgba(204,0,170,0.4);transition:transform 0.2s" onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform='scale(1)'">
<svg width="24" height="24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
</div>
<div id="br-chat-frame" style="display:none;position:fixed;bottom:80px;right:20px;width:360px;height:480px;border-radius:10px;border:1px solid #1a1a1a;background:#0a0a0a;z-index:9998;flex-direction:column;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.6)">
<div style="padding:14px 16px;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;gap:8px">
<div style="width:8px;height:8px;border-radius:50%;background:#00D4FF;animation:barPulse 2s ease infinite"></div>
<span style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:14px;color:#f5f5f5">RoundTrip</span>
<span style="font-family:'Inter',sans-serif;font-size:11px;color:#737373;margin-left:auto">Chat with BlackRoad</span>
</div>
<iframe src="https://roundtrip.blackroad.io/embed" style="flex:1;border:none;background:#0a0a0a" title="RoundTrip Chat"></iframe>
</div>'''

STRIPE_CTA = '''<!-- Stripe CTA -->
<div style="position:fixed;bottom:20px;left:20px;z-index:9998">
<a href="https://buy.stripe.com/blackroad" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#111;border:1px solid #1a1a1a;border-radius:6px;color:#f5f5f5;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;text-decoration:none;transition:border-color 0.2s" onmouseenter="this.style.borderColor='#333'" onmouseleave="this.style.borderColor='#1a1a1a'">Get BlackRoad &mdash; $99/mo</a>
</div>'''

HEADERS_FILE = '''/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/index.html
  Cache-Control: public, max-age=3600

/_shared/*
  Cache-Control: public, max-age=86400
'''

REDIRECTS_FILE = '''/home    /    301
/index   /    301
'''


def fetch(url, timeout=10):
    try:
        req = Request(url, headers={"User-Agent": "BlackRoad-Enhancer/1.0"})
        return urlopen(req, timeout=timeout).read().decode("utf-8", errors="replace")
    except Exception:
        return ""


def make_robots(project):
    return f"""User-agent: *
Allow: /

Sitemap: https://{project}.pages.dev/sitemap.xml
"""


def make_sitemap(project):
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://{project}.pages.dev/</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
"""


def make_jsonld(title, desc, url):
    data = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": title or "BlackRoad",
        "description": desc or "BlackRoad OS — Pave Tomorrow.",
        "url": url,
        "applicationCategory": "Software",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "99",
            "priceCurrency": "USD",
        },
        "author": {
            "@type": "Organization",
            "name": "BlackRoad OS, Inc.",
            "url": "https://blackroad.io",
        },
    }
    return f'<script type="application/ld+json">{json.dumps(data, separators=(",",":"))}</script>'


def enhance_html(html, project):
    """Inject all enhancements into the HTML."""
    url = f"https://{project}.pages.dev"

    # Extract title and description
    title_m = re.search(r"<title>(.*?)</title>", html)
    title = title_m.group(1) if title_m else "BlackRoad"
    desc_m = re.search(r'name="description"\s+content="([^"]*)"', html)
    desc = desc_m.group(1) if desc_m else "BlackRoad OS — Pave Tomorrow."

    head_injections = []
    body_injections = []

    # 1. Preconnect (before </head>)
    if "preconnect" not in html:
        head_injections.append(PRECONNECT)

    # 2. Canonical URL
    if "canonical" not in html:
        head_injections.append(f'<link rel="canonical" href="{url}/">')

    # 3. GA4
    if "gtag" not in html:
        head_injections.append(GA4_SNIPPET)

    # 4. JSON-LD
    if "application/ld+json" not in html:
        head_injections.append(make_jsonld(title, desc, url))

    # 5. OG enhancements - add missing og tags
    if 'og:type' not in html:
        head_injections.append('<meta property="og:type" content="website">')
    if 'og:url' not in html:
        head_injections.append(f'<meta property="og:url" content="{url}/">')
    if 'og:site_name' not in html:
        head_injections.append('<meta property="og:site_name" content="BlackRoad OS">')
    if 'theme-color' not in html:
        head_injections.append('<meta name="theme-color" content="#0a0a0a">')

    # 6. Design CSS fallback (if not using it already)
    if "design.css" not in html and "--grad" not in html and "--ember" not in html:
        head_injections.append('<link rel="stylesheet" href="/_shared/design.css">')

    # 7. RoundTrip chat widget (before </body>)
    if "br-chat-toggle" not in html:
        body_injections.append(CHAT_WIDGET)

    # 8. Stripe CTA
    if "stripe" not in html.lower() and "buy.stripe" not in html:
        body_injections.append(STRIPE_CTA)

    # Inject into HTML
    if head_injections:
        head_block = "\n".join(head_injections)
        html = html.replace("</head>", f"{head_block}\n</head>", 1)

    if body_injections:
        body_block = "\n".join(body_injections)
        html = html.replace("</body>", f"{body_block}\n</body>", 1)

    return html


def enhance_site(project, idx, total):
    """Download, enhance, and redeploy a single site."""
    prefix = f"[{idx}/{total}]"
    site_dir = os.path.join(WORK, project)
    os.makedirs(site_dir, exist_ok=True)

    # Download current HTML
    html = fetch(f"https://{project}.pages.dev")
    orig_size = len(html)

    if orig_size < 100:
        return (project, "skip", orig_size, 0, "empty/unreachable")

    # Enhance
    enhanced = enhance_html(html, project)

    # Write files
    with open(os.path.join(site_dir, "index.html"), "w") as f:
        f.write(enhanced)

    with open(os.path.join(site_dir, "robots.txt"), "w") as f:
        f.write(make_robots(project))

    with open(os.path.join(site_dir, "sitemap.xml"), "w") as f:
        f.write(make_sitemap(project))

    with open(os.path.join(site_dir, "_headers"), "w") as f:
        f.write(HEADERS_FILE)

    with open(os.path.join(site_dir, "_redirects"), "w") as f:
        f.write(REDIRECTS_FILE)

    # Copy shared design CSS
    shared_dir = os.path.join(site_dir, "_shared")
    os.makedirs(shared_dir, exist_ok=True)
    css = fetch("https://blackroad-brand-style-guide.pages.dev/_shared/design.css")
    if css:
        with open(os.path.join(shared_dir, "design.css"), "w") as f:
            f.write(css)

    new_size = len(enhanced)

    # Deploy
    try:
        result = subprocess.run(
            ["npx", "wrangler", "pages", "deploy", site_dir,
             "--project-name", project, "--commit-dirty=true"],
            capture_output=True, text=True, timeout=60,
        )
        if result.returncode == 0:
            return (project, "success", orig_size, new_size, "")
        else:
            err = result.stderr.strip().split("\n")[-1] if result.stderr else "unknown"
            return (project, "fail", orig_size, new_size, err)
    except subprocess.TimeoutExpired:
        return (project, "fail", orig_size, new_size, "timeout")
    except Exception as e:
        return (project, "fail", orig_size, new_size, str(e))


def main():
    total = len(SITES)
    print(f"\033[38;5;205m╔{'═'*58}╗\033[0m")
    print(f"\033[38;5;205m║\033[0m  \033[38;5;69mBlackRoad Fleet Enhancement — {total} Sites\033[0m               \033[38;5;205m║\033[0m")
    print(f"\033[38;5;205m╚{'═'*58}╝\033[0m")
    print()
    print("Enhancements: GA4 | RoundTrip Chat | Stripe CTA | robots.txt | sitemap.xml")
    print("              JSON-LD | Security Headers | Preconnect | Canonical | OG tags")
    print()

    success = fail = skip = 0
    start = time.time()

    # Run 4 at a time
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {
            pool.submit(enhance_site, site, i + 1, total): site
            for i, site in enumerate(SITES)
        }

        for future in as_completed(futures):
            project, status, orig, new, err = future.result()
            if status == "success":
                success += 1
                delta = new - orig
                print(f"  \033[38;5;82m✓\033[0m {project} ({orig}→{new}b, +{delta}b)")
            elif status == "skip":
                skip += 1
                print(f"  \033[38;5;214m⚠\033[0m {project} (skipped: {err})")
            else:
                fail += 1
                print(f"  \033[38;5;205m✗\033[0m {project} ({err})")

    elapsed = time.time() - start
    print()
    print(f"\033[38;5;205m╔{'═'*58}╗\033[0m")
    print(f"\033[38;5;205m║\033[0m  \033[38;5;82mEnhancement Complete\033[0m                                    \033[38;5;205m║\033[0m")
    print(f"\033[38;5;205m╚{'═'*58}╝\033[0m")
    print(f"  \033[38;5;82mSuccess:\033[0m {success}")
    print(f"  \033[38;5;205mFailed:\033[0m  {fail}")
    print(f"  \033[38;5;214mSkipped:\033[0m {skip}")
    print(f"  Total:   {total}")
    print(f"  Time:    {elapsed:.0f}s")

    # Cleanup
    shutil.rmtree(WORK, ignore_errors=True)


if __name__ == "__main__":
    main()
