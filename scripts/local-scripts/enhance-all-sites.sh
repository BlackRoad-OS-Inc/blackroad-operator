#!/bin/bash
# Enhance ALL 100 BlackRoad Pages sites with:
# - GA4 analytics
# - RoundTrip chat widget
# - Stripe payment CTA
# - robots.txt + sitemap.xml
# - Improved OG meta tags
# - Structured data (JSON-LD)
# - Canonical links
# - Performance: preconnect, defer scripts
set -e

WORK="/tmp/br-enhance-$$"
mkdir -p "$WORK"

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
CYAN='\033[38;5;69m'
RESET='\033[0m'

GA_ID="G-XXXXXXXXXX"  # Replace with real GA4 ID if available
SUCCESS=0
FAIL=0
SKIP=0
TOTAL=0

# All 100 Pages projects
SITES=(
  app-blackroad-io
  blackboxprogramming-io
  blackroad-agents
  blackroad-alexa
  blackroad-animation-dictionary
  blackroad-autobahn
  blackroad-beacon
  blackroad-blackmode
  blackroad-boulevard
  blackroad-brand-kit
  blackroad-brand-style-guide
  blackroad-bypass
  blackroad-cadence
  blackroad-canvas
  blackroad-carkeys
  blackroad-company
  blackroad-compass
  blackroad-crossroads
  blackroad-cruise
  blackroad-dashboard
  blackroad-detour
  blackroad-directory
  blackroad-express
  blackroad-family
  blackroad-freeway
  blackroad-game
  blackroad-garage
  blackroad-greenlight
  blackroad-guardrail
  blackroad-handoff
  blackroad-highway
  blackroad-intersection
  blackroad-io
  blackroad-kids
  blackroad-lane
  blackroad-live
  blackroad-loading-bars
  blackroad-loadroad
  blackroad-me
  blackroad-median
  blackroad-merge
  blackroad-mile
  blackroad-mind
  blackroad-music
  blackroad-network
  blackroad-operator
  blackroad-os-brand
  blackroad-os-docs
  blackroad-os-prism
  blackroad-os-web
  blackroad-parkway
  blackroad-pricing
  blackroad-prism-console
  blackroad-radio
  blackroad-ramp
  blackroad-research
  blackroad-roadblock
  blackroad-roadbook
  blackroad-roadcode
  blackroad-roadflow
  blackroad-roadloop
  blackroad-roadpay
  blackroad-roadrunner
  blackroad-roadsearch
  blackroad-roadsync
  blackroad-roadtv
  blackroad-roadwork
  blackroad-route
  blackroad-shoulder
  blackroad-showcase
  blackroad-signal-alerts
  blackroad-sim
  blackroad-social
  blackroad-stats
  blackroad-sunroof
  blackroad-systems
  blackroad-toll
  blackroad-trailhead
  blackroad-translate
  blackroad-tube
  blackroad-tutor
  blackroad-tv
  blackroad-video
  blackroad-wiki
  blackroad-world
  blackroad-writing
  blackroadai-com
  blackroadinc-us
  blackroadqi-com
  blackroadquantum-com
  blackroadquantum-info
  blackroadquantum-net
  blackroadquantum-shop
  blackroadquantum-store
  lucidia-earth
  lucidia-platform
  lucidia-studio
  lucidiaqi-com
  roadchain-io
  roadcoin-io
)

# ── GA4 snippet ──
GA_SNIPPET="<!-- GA4 -->
<script async src=\"https://www.googletagmanager.com/gtag/js?id=${GA_ID}\"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}')</script>"

# ── RoundTrip Chat Widget ──
ROUNDTRIP_WIDGET='<!-- RoundTrip Chat -->
<div id="br-chat-toggle" onclick="document.getElementById('"'"'br-chat-frame'"'"').style.display=document.getElementById('"'"'br-chat-frame'"'"').style.display==='"'"'none'"'"'?'"'"'flex'"'"':'"'"'none'"'"'" style="position:fixed;bottom:20px;right:20px;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#FF6B2B,#CC00AA);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999;box-shadow:0 4px 20px rgba(204,0,170,0.4);transition:transform 0.2s" onmouseenter="this.style.transform='"'"'scale(1.1)'"'"'" onmouseleave="this.style.transform='"'"'scale(1)'"'"'">
<svg width="24" height="24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
</div>
<div id="br-chat-frame" style="display:none;position:fixed;bottom:80px;right:20px;width:360px;height:480px;border-radius:10px;border:1px solid #1a1a1a;background:#0a0a0a;z-index:9998;flex-direction:column;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.6)">
<div style="padding:14px 16px;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;gap:8px">
<div style="width:8px;height:8px;border-radius:50%;background:#00D4FF;animation:barPulse 2s ease infinite"></div>
<span style="font-family:Space Grotesk,sans-serif;font-weight:700;font-size:14px;color:#f5f5f5">RoundTrip</span>
<span style="font-family:Inter,sans-serif;font-size:11px;color:#737373;margin-left:auto">Chat with BlackRoad</span>
</div>
<iframe src="https://roundtrip.blackroad.io/embed" style="flex:1;border:none;background:#0a0a0a" title="RoundTrip Chat"></iframe>
</div>'

# ── Structured Data (JSON-LD) ──
json_ld() {
  local name="$1" desc="$2" url="$3"
  cat <<JSONLD
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebApplication","name":"$name","description":"$desc","url":"$url","applicationCategory":"Software","operatingSystem":"Web","offers":{"@type":"Offer","price":"99","priceCurrency":"USD","url":"https://buy.stripe.com/blackroad"},"author":{"@type":"Organization","name":"BlackRoad OS, Inc.","url":"https://blackroad.io"}}
</script>
JSONLD
}

# ── Robots.txt ──
make_robots() {
  local domain="$1"
  cat <<ROBOTS
User-agent: *
Allow: /

Sitemap: https://${domain}.pages.dev/sitemap.xml
ROBOTS
}

# ── Sitemap.xml ──
make_sitemap() {
  local domain="$1"
  cat <<SITEMAP
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${domain}.pages.dev/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
SITEMAP
}

# ── Enhance a single site ──
enhance_site() {
  local project="$1"
  local dir="$WORK/$project"
  mkdir -p "$dir"

  # Download current index.html
  local html
  html=$(curl -sL --max-time 10 "https://${project}.pages.dev" 2>/dev/null)
  local size=${#html}

  if [ "$size" -lt 100 ]; then
    echo -e "  ${AMBER}⚠ ${project}: empty or unreachable (${size}b), skipping${RESET}"
    SKIP=$((SKIP + 1))
    return
  fi

  # Extract title for JSON-LD
  local title
  title=$(echo "$html" | sed -n 's/.*<title>\(.*\)<\/title>.*/\1/p' | head -1)
  local desc
  desc=$(echo "$html" | sed -n 's/.*name="description" content="\([^"]*\)".*/\1/p' | head -1)

  # ── Inject enhancements ──
  local enhanced="$html"

  # 1. Add preconnect hints (before first stylesheet)
  if ! echo "$enhanced" | grep -q "preconnect"; then
    enhanced=$(echo "$enhanced" | sed 's|<link rel="stylesheet"|<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="preconnect" href="https://images.blackroad.io">\n<link rel="stylesheet"|')
  fi

  # 2. Add canonical link
  if ! echo "$enhanced" | grep -q "canonical"; then
    enhanced=$(echo "$enhanced" | sed "s|</head>|<link rel=\"canonical\" href=\"https://${project}.pages.dev/\">\n</head>|")
  fi

  # 3. Add GA4 (before </head>)
  if ! echo "$enhanced" | grep -q "gtag"; then
    enhanced=$(echo "$enhanced" | sed "s|</head>|${GA_SNIPPET}\n</head>|")
  fi

  # 4. Add JSON-LD structured data
  if ! echo "$enhanced" | grep -q "application/ld+json"; then
    local ld
    ld=$(json_ld "${title:-BlackRoad}" "${desc:-BlackRoad OS — Pave Tomorrow.}" "https://${project}.pages.dev")
    enhanced=$(echo "$enhanced" | sed "s|</head>|${ld}\n</head>|")
  fi

  # 5. Add RoundTrip chat widget (before </body>)
  if ! echo "$enhanced" | grep -q "br-chat-toggle"; then
    enhanced=$(echo "$enhanced" | sed "s|</body>|${ROUNDTRIP_WIDGET}\n</body>|")
  fi

  # 6. Add Stripe CTA if no payment link exists
  if ! echo "$enhanced" | grep -q "stripe\|buy\.stripe"; then
    local stripe_btn='<div style="position:fixed;bottom:20px;left:20px;z-index:9998"><a href="https://buy.stripe.com/blackroad" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#111;border:1px solid #1a1a1a;border-radius:6px;color:#f5f5f5;font-family:Inter,sans-serif;font-size:12px;font-weight:600;text-decoration:none;transition:border-color 0.2s" onmouseenter="this.style.borderColor='"'"'#333'"'"'" onmouseleave="this.style.borderColor='"'"'#1a1a1a'"'"'">Get BlackRoad — $99/mo</a></div>'
    enhanced=$(echo "$enhanced" | sed "s|</body>|${stripe_btn}\n</body>|")
  fi

  # 7. Ensure design.css is linked (inline if relative path fails)
  if ! echo "$enhanced" | grep -q "design.css\|--grad\|--ember"; then
    enhanced=$(echo "$enhanced" | sed 's|</head>|<link rel="stylesheet" href="https://blackroad-brand-style-guide.pages.dev/_shared/design.css">\n</head>|')
  fi

  # Write enhanced HTML
  echo "$enhanced" > "$dir/index.html"

  # Create robots.txt
  make_robots "$project" > "$dir/robots.txt"

  # Create sitemap.xml
  make_sitemap "$project" > "$dir/sitemap.xml"

  # Create _headers for security/caching
  cat > "$dir/_headers" <<'HEADERS'
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/index.html
  Cache-Control: public, max-age=3600

/*.css
  Cache-Control: public, max-age=86400

/*.js
  Cache-Control: public, max-age=86400
HEADERS

  # Create _redirects for clean URLs
  cat > "$dir/_redirects" <<'REDIRECTS'
/home    /    301
/index   /    301
REDIRECTS

  # Copy shared design.css
  mkdir -p "$dir/_shared"
  curl -sL "https://blackroad-brand-style-guide.pages.dev/_shared/design.css" -o "$dir/_shared/design.css" 2>/dev/null || true

  # Deploy
  if npx wrangler pages deploy "$dir" --project-name="$project" --commit-dirty=true 2>&1 | tail -1; then
    local new_size
    new_size=$(wc -c < "$dir/index.html")
    echo -e "  ${GREEN}✓ ${project}${RESET} (${size}b → ${new_size}b) +GA4 +chat +stripe +robots +sitemap +headers"
    SUCCESS=$((SUCCESS + 1))
  else
    echo -e "  ${PINK}✗ ${project} FAILED${RESET}"
    FAIL=$((FAIL + 1))
  fi
}

# ── Main ──
echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║${RESET}  ${CYAN}BlackRoad Fleet Enhancement — 100 Sites${RESET}                ${PINK}║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "Enhancements: GA4 | RoundTrip Chat | Stripe CTA | robots.txt | sitemap.xml"
echo -e "              JSON-LD | Security Headers | Preconnect | Canonical URLs"
echo ""

# Run 4 parallel deploys at a time
PARALLEL=4
RUNNING=0

for site in "${SITES[@]}"; do
  TOTAL=$((TOTAL + 1))
  echo -e "${CYAN}[${TOTAL}/${#SITES[@]}]${RESET} Enhancing ${site}..."
  enhance_site "$site" &
  RUNNING=$((RUNNING + 1))

  if [ "$RUNNING" -ge "$PARALLEL" ]; then
    wait -n 2>/dev/null || wait
    RUNNING=$((RUNNING - 1))
  fi
done

# Wait for remaining
wait

echo ""
echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║${RESET}  ${GREEN}Enhancement Complete${RESET}                                    ${PINK}║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${RESET}"
echo -e "  ${GREEN}Success:${RESET} $SUCCESS"
echo -e "  ${PINK}Failed:${RESET}  $FAIL"
echo -e "  ${AMBER}Skipped:${RESET} $SKIP"
echo -e "  Total:   $TOTAL"
echo ""

# Cleanup
rm -rf "$WORK"

echo "Done."
