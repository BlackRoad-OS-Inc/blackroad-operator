#!/usr/bin/env bash
# Push TODO.md, ROADMAP.md, and index.html to all 19 domain repos
# Uses GitHub API (gh api) for speed — no cloning needed

ORG="BlackRoad-OS-Inc"

# Domain definitions: domain|title|tagline|description|category|products
declare -a DOMAIN_LIST=(
  "blackroad.company|BlackRoad Company|Corporate headquarters of BlackRoad OS, Inc.|Delaware C-Corp building sovereign infrastructure. Founded Nov 2025 by Alexa Amundson. EIN 41-2663817.|corporate|Company, RoadAuth, RoadPay, Corporate Governance"
  "blackroad.io|BlackRoad IO|The unified platform. Search. Learn. Create. Own.|Flagship platform — unified experience replacing 10+ fragmented tools. AI tutoring with real memory, privacy-first search, STEM visualization, content creation at ideation speed. \$600B+ TAM.|platform|BlackRoad OS, Prism Console, RoadSearch, RoadDocs, RoadAPI, Creator Studio"
  "blackroad.me|BlackRoad Me|Your sovereign digital identity.|Portable, private profile across the BlackRoad ecosystem. No surveillance, no tracking. Own your data, own your identity.|identity|RoadAuth, RoadVault, Digital Identity, SSO"
  "blackroad.network|BlackRoad Network|The sovereign mesh. Every link is a node.|Distributed computing mesh — 5 Raspberry Pis, 2 cloud nodes, WireGuard tunnels, NATS pub/sub. 151 domains, 7 nodes, 52 TOPS edge AI.|infrastructure|CarPool (NATS), TollBooth (WireGuard), PitStop (Pi-hole), RoadMap (Grafana)"
  "blackroad.systems|BlackRoad Systems|Fleet intelligence. Real-time.|Monitor and orchestrate the entire BlackRoad fleet. 47 Roadies, 5 Pis, every port, every service, every heartbeat.|monitoring|Fleet Tracker, Heartbeat Monitor, RoadMap (Grafana), Status Dashboard"
  "blackroadai.com|BlackRoad AI|Sovereign artificial intelligence.|Local-first AI inference. 52 TOPS across Hailo-8 accelerators, Ollama on 4 nodes, 227+ models. No API keys, no cloud dependency.|ai|Passenger (Ollama), Roadies (vLLM), RAG System, AI Router, AI Skills"
  "blackroadinc.us|BlackRoad Inc|American innovation. Sovereign technology.|BlackRoad OS, Inc. — Delaware C-Corp. Stripe Atlas formed. Alexa Amundson, Founder and CEO. 10M shares authorized.|corporate-us|Corporate Ops, Stripe Billing, Investor Relations, Board Governance"
  "blackroadqi.com|BlackRoad QI|Quantum Intelligence.|Amundson Framework: G(n) = n^(n+1)/(n+1)^n converges to A_G approx 1.24433. 536/536 tests verified across 4 Pis.|quantum|Amundson Research, Quantum Trinary, QI Engine"
  "blackroadquantum.com|BlackRoad Quantum|The quantum computing platform.|Full-stack quantum simulation and research tools built on the Amundson mathematical framework.|quantum|Quantum Simulator, Amundson Prover, Trinary Logic Engine"
  "blackroadquantum.info|BlackRoad Quantum Info|Quantum research. Open knowledge.|Research publications, white papers, and educational resources on quantum computing and the Amundson Framework.|research|Research Papers, Amundson Framework Docs, Academic Resources"
  "blackroadquantum.net|BlackRoad Quantum Net|Quantum-secured networking.|BlackBox Protocol mesh networking. Ternary routing across Tor, IPFS, BitTorrent, WebRTC, and Bitcoin networks.|security|BlackBox Protocol, Tor Hidden Services, IPFS Nodes, Mesh SDK"
  "blackroadquantum.shop|BlackRoad Quantum Shop|Hardware and merchandise.|Pi fleet kits, Hailo-8 AI accelerators, WireGuard mesh bundles, BlackRoad branded hardware.|commerce|Hardware Kits, Merch, Fleet Bundles, Starter Packs"
  "blackroadquantum.store|BlackRoad Quantum Store|Digital products and software.|Software licenses, AI model packs, training datasets, BlackRoad OS distributions, support subscriptions.|store|Software Licenses, AI Models, Datasets, Support Plans, Prism Seats"
  "lucidia.earth|Lucidia Earth|Intelligence rooted in the real world.|Lucidia AI agent ecosystem — 334 web apps, local inference, GitHub Actions runners. Clear thinking, grounded intelligence.|agents|Lucidia Agents, Lucidia Workspace, Lucidia Platform"
  "lucidia.studio|Lucidia Studio|Create with sovereign AI.|AI-powered creative suite — video, image, audio, text generation on local hardware. No cloud uploads, no content moderation gatekeepers.|creative|Creator Studio, RoadView, Canvas, Video, Writing, Cadence"
  "lucidiaqi.com|Lucidia QI|Quantum-enhanced AI agents.|Intersection of quantum intelligence and autonomous agents. Amundson math for routing, trinary logic for decisions.|quantum-ai|QI Agents, Trinary Router, Amundson Decision Engine"
  "roadchain.io|RoadChain|Sovereign blockchain. Built different.|Purpose-built blockchain for sovereign computing. Transaction ledger, smart contracts, decentralized identity. Stablecoin payments.|blockchain|RoadChain Ledger, Smart Contracts, Stablecoin Bridge, DID"
  "roadcoin.io|RoadCoin|The currency of sovereign computing.|RoadCoin powers the BlackRoad economy — pay for compute, storage, bandwidth, AI inference. Utility-first.|crypto|RoadCoin Token, Wallet, Payment Gateway, Marketplace"
  "blackboxprogramming.io|BlackBox Programming|Code sovereign. Ship fast.|Developer tools, AI-assisted coding, sovereign dev environments. Everything Claude Code can do, on your hardware.|devtools|BlackRoad Code, RoadCode Platform, Code Review AI, Deploy Pipeline"
)

push_file() {
  local repo="$1" filepath="$2" content="$3" message="$4"
  local encoded
  encoded=$(printf '%s' "$content" | base64)

  # Check if file exists
  local sha
  sha=$(gh api "repos/$ORG/$repo/contents/$filepath" --jq '.sha' 2>/dev/null || echo "")

  if [ -n "$sha" ] && [ "$sha" != "null" ]; then
    # Update existing
    gh api -X PUT "repos/$ORG/$repo/contents/$filepath" \
      -f message="$message" \
      -f content="$encoded" \
      -f sha="$sha" \
      --silent 2>/dev/null && echo "  Updated $filepath" || echo "  FAILED $filepath"
  else
    # Create new
    gh api -X PUT "repos/$ORG/$repo/contents/$filepath" \
      -f message="$message" \
      -f content="$encoded" \
      --silent 2>/dev/null && echo "  Created $filepath" || echo "  FAILED $filepath"
  fi
}

count=0
total=${#DOMAIN_LIST[@]}

for entry in "${DOMAIN_LIST[@]}"; do
  IFS='|' read -r domain title tagline description category products <<< "$entry"
  count=$((count + 1))

  echo ""
  echo "[$count/$total] $domain — $title"

  # === TODO.md ===
  TODO_CONTENT="# TODO — $domain

> Active tasks for $title

## [RC] Priority 1 — Ship Now

- [ ] [RC] Deploy live website to $domain via Gematria/Caddy
- [ ] [RC] Configure DNS (A record to Gematria or CF proxy)
- [ ] [RC] SSL/TLS via Let's Encrypt (Caddy auto)
- [ ] [RC] Verify site loads < 2s globally
- [ ] [RC] Add to BlackRoad unified search index

## [RC] Priority 2 — Content and Features

- [ ] [RC] Write product landing copy for: $products
- [ ] [RC] Add Stripe checkout integration (\$20-50/mo plans)
- [ ] [RC] Implement RoundTrip chat widget
- [ ] [RC] Add RoadCode CI/CD pipeline (Gitea Actions)
- [ ] [RC] Create /docs section with product documentation
- [ ] [RC] Add /api endpoint documentation (if applicable)
- [ ] [RC] Integrate Google Drive docs from gdrive-blackroad

## [RC] Priority 3 — Integration

- [ ] [RC] Mirror to Gitea (Octavia :3100)
- [ ] [RC] Connect to RoadCode platform (registry, audit, discovery)
- [ ] [RC] Wire up analytics (RoadAnalytics, privacy-first)
- [ ] [RC] Connect to NATS pub/sub for real-time updates
- [ ] [RC] Register in memory-products.sh catalog
- [ ] [RC] Add to RoundTrip agent roster

## [RC] Priority 4 — Polish

- [ ] [RC] Mobile responsive audit
- [ ] [RC] Lighthouse score > 90
- [ ] [RC] Add og:image and social meta tags
- [ ] [RC] SEO optimization
- [ ] [RC] Accessibility (WCAG 2.1 AA)

## Recurring

- [ ] Weekly: Check uptime and SSL status
- [ ] Monthly: Update content and product info
- [ ] Quarterly: Review analytics and user feedback

---

*Tagged [RC] for RoadCode task system. Claim via collab.*
"

  # === ROADMAP.md ===
  ROADMAP_CONTENT="# ROADMAP — $domain

> Product roadmap for $title

## Phase 1: Foundation (Week 1-2)

**Goal**: Live, fast, beautiful website with real product info.

- [x] Create GitHub repo under $ORG
- [x] README.md with project description
- [x] LICENSE (Proprietary BlackRoad OS, Inc.)
- [x] RoadCode/ workspace directory
- [ ] Deploy index.html to $domain
- [ ] DNS configuration (Gematria or CF)
- [ ] SSL/TLS auto-provisioned
- [ ] RoadCode CI/CD pipeline
- [ ] Mirror to Gitea

**Milestone**: Site live at https://$domain with < 2s load time.

## Phase 2: Product (Week 3-4)

**Goal**: Real product pages with Stripe integration.

- [ ] Product landing pages for: $products
- [ ] Stripe checkout (\$20-50/mo subscription plans)
- [ ] User authentication via RoadAuth
- [ ] API documentation at /docs
- [ ] RoundTrip chat widget integration
- [ ] Connect to Google Drive corporate docs

**Milestone**: First paying customer through $domain.

## Phase 3: Platform (Month 2-3)

**Goal**: Full-featured platform with real backend.

- [ ] Backend API (self-hosted on Pi fleet or Gematria)
- [ ] Database (PostgreSQL on Alice or Octavia)
- [ ] User dashboard with account management
- [ ] Usage tracking and billing
- [ ] Team/organization support
- [ ] Mobile responsive design

**Milestone**: 10 active users, recurring revenue.

## Phase 4: Scale (Month 3-6)

**Goal**: Production-grade with monitoring and redundancy.

- [ ] CDN distribution (MinIO on Cecilia + Gematria edge)
- [ ] Monitoring via RoadMap (Grafana)
- [ ] Automated backups to Google Drive
- [ ] Load testing and performance optimization
- [ ] Multi-region failover
- [ ] 99.9% uptime SLA

**Milestone**: 99.9% uptime, 100 active users.

## Phase 5: Ecosystem (Month 6-12)

**Goal**: Deep integration with BlackRoad ecosystem.

- [ ] Cross-product authentication (SSO via BlackRoad Me)
- [ ] Marketplace listings
- [ ] Developer API for third-party integrations
- [ ] Mobile app support (BlackRoad Mobile)
- [ ] Community features
- [ ] Open developer documentation

**Milestone**: $domain is a thriving part of the BlackRoad ecosystem.

---

*BlackRoad OS, Inc. — Pave Tomorrow.*
*Category: $category | Products: $products*
"

  # Push TODO.md and ROADMAP.md
  push_file "$domain" "TODO.md" "$TODO_CONTENT" "[RC] Add TODO.md — active tasks for $title

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"

  push_file "$domain" "ROADMAP.md" "$ROADMAP_CONTENT" "[RC] Add ROADMAP.md — product roadmap for $title

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"

done

echo ""
echo "Done! TODO.md and ROADMAP.md pushed to all $total repos."
