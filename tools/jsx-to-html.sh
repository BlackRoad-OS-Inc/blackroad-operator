#!/bin/bash
# Convert BlackRoad JSX templates to SEO-friendly HTML pages
# Embeds real content for Google crawlers + React for interactivity
# Usage: ./jsx-to-html.sh

set -e

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

TEMPLATES="$HOME/blackroad-operator/websites/_templates"
WEBSITES="$HOME/blackroad-operator/websites"

# JSX file → dir|title|domain|description|keywords
declare -A MAPPING=(
  ["backroad-social.jsx"]="social|BackRoad Social|social.blackroad.io|Social without the sickness. No vanity metrics, no addiction mechanics. 3-hour posting delay, depth scoring, campfires, and plans that get you into the real world.|social-network,anti-social-media,ai-agents,depth-over-engagement"
  ["cashroad-finance.jsx"]="cashroad|CashRoad Finance|pay.blackroad.io|Financial clarity without judgment. Budget tracking, spending insights, investment monitoring, and decision-time assistance — not post-spending shame.|personal-finance,budgeting,financial-planning,ai-finance"
  ["roadview-search.jsx"]="roadview|RoadView Search|search.blackroad.io|Search that verifies before it surfaces. Every result scored for confidence and source quality. No ads, no SEO gaming — just truth.|search-engine,truth-first-search,ai-search,verified-results"
  ["roadwork-education.jsx"]="roadwork|RoadWork Education|tutor.blackroad.io|AI tutoring that adapts to how you actually learn. Courses, quizzes, flashcards, and progress tracking without leaderboards.|education,ai-tutoring,adaptive-learning,edtech"
  ["soundroad-studio.jsx"]="soundroad|SoundRoad Studio|radio.blackroad.io|Music production studio with AI-assisted composition. Waveform editing, effects rack, stem separation, and 80% creator revenue.|music-production,ai-music,digital-audio-workstation,creator-economy"
  ["genesis-road-engine.jsx"]="genesis|Genesis Road Engine|game.blackroad.io|3D scene editor with natural language commands. Build worlds by describing them. Export to WebGL, Metal, Vulkan.|game-engine,3d-editor,natural-language,scene-builder"
  ["vaultroad-brain.jsx"]="vaultroad|VaultRoad Brain|book.blackroad.io|Your second brain. Save URLs, notes, PDFs, images, voice memos. AI finds connections you missed. Knowledge graph for everything you know.|second-brain,knowledge-management,ai-notes,personal-knowledge"
  ["oneway-api.jsx"]="oneway|OneWay API Gateway|api.blackroad.io|Unified API gateway for 9 AI providers. Rate limiting, key management, webhooks, cost tracking. One endpoint, any model.|api-gateway,ai-providers,unified-api,developer-tools"
  ["roadtrip-collab.jsx"]="roadtrip|RoadTrip Collaboration|work.blackroad.io|Multi-agent collaboration platform. Humans and AI agents work together on trips with tasks, chat, file sharing, and timelines.|collaboration,multi-agent,project-management,ai-teamwork"
  ["roundtrip-hardware.jsx"]="roundtrip-hw|RoundTrip Hardware|roundtrip.blackroad.io|Hardware mesh management for IoT fleets. Device discovery, health monitoring, firmware updates, SSH access, and network topology.|hardware-management,iot,raspberry-pi,fleet-management"
  ["dashboard.jsx"]="dashboard|BlackRoad Dashboard|dash.blackroad.io|Operations console for the BlackRoad fleet. Agent status, service health, KPIs, deployments, and real-time log streaming.|dashboard,operations,monitoring,fleet-health"
  ["status-page.jsx"]="status-app|BlackRoad Status|status.blackroad.io|Real-time status of all BlackRoad services across Experience, Governance, Infrastructure, and Data layers. 30-day uptime history.|status-page,uptime,service-health,incident-tracking"
  ["docs-page.jsx"]="docs-app|BlackRoad Docs|docs.blackroad.io|Documentation for BlackRoad OS. Architecture guides, API reference, agent system, memory system, fleet management, and deployment.|documentation,developer-docs,api-reference,getting-started"
  ["pricing-page.jsx"]="pricing|BlackRoad Pricing|blackroad.io/pricing|Simple pricing for sovereign infrastructure. Free tier with 5 agents. Builder at \$10/mo. Studio at \$29/mo. 80% creator revenue on all plans.|pricing,plans,saas,sovereign-infrastructure"
  ["ecosystem-index.jsx"]="ecosystem|BlackRoad Ecosystem|blackroad.io/ecosystem|16 GitHub organizations, 20 domains, 668 repositories, 109 agents. The complete map of the BlackRoad OS ecosystem.|ecosystem,organizations,infrastructure-map,github"
  ["agent-profile.jsx"]="agent-profile|Agent Profile|agents.blackroad.io|AI agents with persistent memory, individual identity, and evolving capabilities. View agent config, conversation history, and skill trees.|ai-agents,agent-profile,persistent-memory,agent-identity"
  ["changelog-page.jsx"]="changelog|BlackRoad Changelog|blackroad.io/changelog|What shipped. Release notes, new features, improvements, and fixes across the BlackRoad OS platform.|changelog,releases,updates,version-history"
  ["about-page (1).jsx"]="about|About BlackRoad|blackroad.io/about|BlackRoad OS is a distributed AI operating system built by Alexa Amundson. 1000 agents, 20 domains, sovereign infrastructure.|about,company,team,mission"
  ["leadership-page (1).jsx"]="leadership|BlackRoad Leadership|blackroad.io/leadership|BlackRoad OS Inc is a Delaware C-Corp founded November 2025. 16 GitHub organizations, 20 domains, sovereign from DNS to AI.|leadership,organization,corporate,governance"
  ["onboarding-flow.jsx"]="onboarding|Welcome to BlackRoad|blackroad.io/onboarding|Get started with BlackRoad OS. Choose your role, interests, workspace, and AI agent companion.|onboarding,getting-started,setup,welcome"
  ["roadtube-video.jsx"]="roadtube|RoadTube Video|video.blackroad.io|AI-powered video platform. Generate, edit, and publish videos with 80% creator revenue. No ads on free tier.|video-platform,ai-video,creator-economy,video-generation"
)

echo -e "\n${PINK}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  JSX → SEO HTML Converter v2                     ║${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════╝${RESET}\n"

count=0

for jsx_file in "${!MAPPING[@]}"; do
  IFS='|' read -r dir_name title domain description keywords <<< "${MAPPING[$jsx_file]}"

  src="$TEMPLATES/$jsx_file"
  if [ ! -f "$src" ]; then
    echo -e "  ${DIM}skip: $jsx_file (not found)${RESET}"
    continue
  fi

  target_dir="$WEBSITES/$dir_name"
  mkdir -p "$target_dir"

  jsx_content=$(cat "$src")

  component_name=$(grep -oP 'export default function \K\w+' "$src" 2>/dev/null || \
                    grep -oP 'function \K\w+(?=\(\))' "$src" 2>/dev/null | tail -1 || \
                    echo "App")

  # Determine canonical URL
  if [[ "$domain" == *"/"* ]]; then
    canonical="https://${domain}"
  else
    canonical="https://${domain}"
  fi

  cat > "$target_dir/index.html" << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — BlackRoad OS</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords},blackroad-os,sovereign-infrastructure,ai-agents">
<meta name="author" content="BlackRoad OS, Inc.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/png" sizes="32x32" href="https://images.blackroad.io/brand/br-square-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="https://images.blackroad.io/brand/br-square-192.png">

<!-- Open Graph -->
<meta property="og:title" content="${title} — BlackRoad OS">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="BlackRoad OS">

<!-- Twitter -->
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title} — BlackRoad OS">
<meta name="twitter:description" content="${description}">

<!-- JSON-LD Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "${title}",
  "description": "${description}",
  "url": "${canonical}",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "author": {
    "@type": "Organization",
    "name": "BlackRoad OS, Inc.",
    "url": "https://blackroad.io"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: #0a0a0a; color: #f5f5f5; font-family: 'Inter', sans-serif; min-height: 100vh; overflow-x: hidden; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #0a0a0a; }
::-webkit-scrollbar-thumb { background: #262626; border-radius: 3px; }
#root { min-height: 100vh; }
/* SEO fallback content — hidden once React mounts */
.seo-content { max-width: 720px; margin: 0 auto; padding: 80px 20px; }
.seo-content h1 { font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.02em; }
.seo-content p { font-size: 15px; color: #737373; line-height: 1.65; margin-bottom: 12px; }
.seo-content .seo-nav { display: flex; gap: 16px; margin-bottom: 32px; }
.seo-content .seo-nav a { font-size: 13px; color: #525252; text-decoration: none; }
.seo-content .seo-footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #1a1a1a; font-size: 12px; color: #333; }
.seo-content .seo-footer a { color: #525252; text-decoration: none; margin-right: 16px; }
</style>
</head>
<body>
<div id="root">
<!-- SEO-visible content for crawlers — replaced by React on mount -->
<div class="seo-content">
  <nav class="seo-nav">
    <a href="https://blackroad.io">BlackRoad</a>
    <a href="https://docs.blackroad.io">Docs</a>
    <a href="https://blackroad.io/pricing">Pricing</a>
    <a href="https://blackroad.io/about">About</a>
    <a href="https://github.com/BlackRoad-OS-Inc">GitHub</a>
  </nav>
  <h1>${title}</h1>
  <p>${description}</p>
  <p>BlackRoad OS is a distributed AI operating system with 1,000 agents, 20 domains, and sovereign infrastructure running on a fleet of Raspberry Pis and Hailo-8 accelerators. No cloud dependency. No API keys. No vendor lock-in.</p>
  <p>Built by Alexa Amundson. Delaware C-Corp, founded November 2025.</p>
  <ul style="list-style:none;padding:0;margin:24px 0;">
    <li style="color:#525252;padding:4px 0;">Part of the <a href="https://blackroad.io/ecosystem" style="color:#737373">BlackRoad Ecosystem</a> — 16 orgs, 668 repos</li>
    <li style="color:#525252;padding:4px 0;"><a href="https://blackroad.io/pricing" style="color:#737373">Free tier available</a> — 5 agents, full platform access</li>
    <li style="color:#525252;padding:4px 0;"><a href="https://docs.blackroad.io" style="color:#737373">Read the docs</a> — Architecture, API reference, guides</li>
  </ul>
  <div class="seo-footer">
    <a href="https://blackroad.io">blackroad.io</a>
    <a href="https://github.com/BlackRoad-OS-Inc">GitHub</a>
    <a href="https://status.blackroad.io">Status</a>
    <a href="https://docs.blackroad.io">Docs</a>
    <span style="float:right">© 2024-2026 BlackRoad OS, Inc.</span>
  </div>
</div>
</div>

<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" data-type="module">
const { useState, useEffect, useRef, useCallback, useMemo, Fragment } = React;

${jsx_content}

const root = ReactDOM.createRoot(document.getElementById('root'));
const ComponentName = typeof ${component_name} === 'function' ? ${component_name} : (typeof App === 'function' ? App : () => React.createElement('div', null, 'Loading...'));
root.render(React.createElement(ComponentName));
</script>
</body>
</html>
HTMLEOF

  echo -e "  ${GREEN}✓${RESET} ${BOLD}$jsx_file${RESET} → $dir_name/index.html  ${DIM}($domain)${RESET}"
  count=$((count + 1))
done

echo -e "\n  ${BOLD}${GREEN}$count SEO-optimized pages generated${RESET}\n"
echo -e "  ${DIM}Templates: $TEMPLATES${RESET}"
echo -e "  ${DIM}Output: $WEBSITES${RESET}\n"
