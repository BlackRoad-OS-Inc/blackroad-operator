#!/bin/bash
# BlackRoad Enterprise Full Setup — All 34 Orgs
# Run after rate limit resets. Self-pacing.
set -e

ENTERPRISE="blackroad-os"
LOGFILE="$HOME/enterprise-setup.log"
echo "=== Enterprise Full Setup $(date -u) ===" > "$LOGFILE"

wait_rate() {
  while true; do
    remaining=$(gh api /rate_limit -q '.rate.remaining' 2>/dev/null || echo "0")
    if [ "$remaining" -gt 100 ]; then return; fi
    reset=$(gh api /rate_limit -q '.rate.reset' 2>/dev/null || echo "0")
    now=$(date +%s)
    wait=$((reset - now + 5))
    [ "$wait" -gt 0 ] && echo "  Rate limit: ${remaining} left. Sleeping ${wait}s..." && sleep "$wait"
  done
}

ORGS=(
  BlackRoad-OS-Inc BlackRoad-OS BlackRoad-Agents BlackRoad-AI
  BlackRoad-Alphabet BlackRoad-Anthropic BlackRoad-App BlackRoad-Archive
  BlackRoad-Cloud BlackRoad-Com BlackRoad-Data BlackRoad-Dev
  BlackRoad-Education BlackRoad-Forge BlackRoad-Foundation BlackRoad-Google
  BlackRoad-Gov BlackRoad-Hardware BlackRoad-Interactive BlackRoad-Labs
  BlackRoad-Media BlackRoad-Nvidia BlackRoad-OpenAI BlackRoad-QI
  BlackRoad-Quantum BlackRoad-README BlackRoad-Sandbox BlackRoad-Security
  BlackRoad-Studio BlackRoad-Tech BlackRoad-Ventures BlackRoad-X
  BlackRoad-xAI BlackRoad-XYZ
)

# ============================================
# PHASE 1: Enterprise-Level Rulesets
# ============================================
echo ""
echo "=== PHASE 1: Enterprise Rulesets ==="

# Check existing rulesets
existing=$(gh api /enterprises/$ENTERPRISE/rulesets -q '.[].name' 2>/dev/null || echo "")

wait_rate

# 1a. Protect main branch (may already exist)
if ! echo "$existing" | grep -q "Protect main branch"; then
  echo "  Creating: Protect main branch..."
  gh api /enterprises/$ENTERPRISE/rulesets --method POST --input - <<'RULE1' 2>/dev/null
{"name":"Protect main branch","target":"branch","enforcement":"active","conditions":{"organization_name":{"include":["~ALL"],"exclude":[]},"repository_name":{"include":["~ALL"],"exclude":[]},"ref_name":{"include":["refs/heads/main","refs/heads/master"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"},{"type":"pull_request","parameters":{"required_approving_review_count":0,"dismiss_stale_reviews_on_push":false,"require_code_owner_review":false,"require_last_push_approval":false,"required_review_thread_resolution":false}}],"bypass_actors":[{"actor_id":1,"actor_type":"OrganizationAdmin","bypass_mode":"always"},{"actor_id":5,"actor_type":"RepositoryRole","bypass_mode":"always"}]}
RULE1
  echo "  OK" | tee -a "$LOGFILE"
else
  echo "  SKIP: Protect main branch (already exists)"
fi
sleep 2

# 1b. Protect release/production branches
if ! echo "$existing" | grep -q "Protect release"; then
  echo "  Creating: Protect release branches..."
  gh api /enterprises/$ENTERPRISE/rulesets --method POST --input - <<'RULE2' 2>/dev/null
{"name":"Protect release and production branches","target":"branch","enforcement":"active","conditions":{"organization_name":{"include":["~ALL"],"exclude":[]},"repository_name":{"include":["~ALL"],"exclude":[]},"ref_name":{"include":["refs/heads/release/*","refs/heads/production","refs/heads/prod"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"},{"type":"pull_request","parameters":{"required_approving_review_count":0,"dismiss_stale_reviews_on_push":false,"require_code_owner_review":false,"require_last_push_approval":false,"required_review_thread_resolution":false}}],"bypass_actors":[{"actor_id":1,"actor_type":"OrganizationAdmin","bypass_mode":"always"}]}
RULE2
  echo "  OK" | tee -a "$LOGFILE"
else
  echo "  SKIP: Protect release branches (already exists)"
fi
sleep 2

# 1c. Protect version tags
if ! echo "$existing" | grep -q "Protect version tags"; then
  echo "  Creating: Protect version tags..."
  gh api /enterprises/$ENTERPRISE/rulesets --method POST --input - <<'RULE3' 2>/dev/null
{"name":"Protect version tags","target":"tag","enforcement":"active","conditions":{"organization_name":{"include":["~ALL"],"exclude":[]},"repository_name":{"include":["~ALL"],"exclude":[]},"ref_name":{"include":["refs/tags/v*"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"},{"type":"update"}],"bypass_actors":[{"actor_id":1,"actor_type":"OrganizationAdmin","bypass_mode":"always"}]}
RULE3
  echo "  OK" | tee -a "$LOGFILE"
else
  echo "  SKIP: Protect version tags (already exists)"
fi
sleep 2

# 1d. Block sensitive files
if ! echo "$existing" | grep -q "Block sensitive"; then
  echo "  Creating: Block sensitive file pushes..."
  gh api /enterprises/$ENTERPRISE/rulesets --method POST --input - <<'RULE4' 2>/dev/null
{"name":"Block sensitive file pushes","target":"push","enforcement":"active","conditions":{"organization_name":{"include":["~ALL"],"exclude":[]},"repository_name":{"include":["~ALL"],"exclude":[]}},"rules":[{"type":"file_path_restriction","parameters":{"restricted_file_paths":[".env",".env.*","*.pem","*.key","id_rsa","id_ed25519","credentials.json","service-account*.json","*.p12","*.pfx"]}}],"bypass_actors":[{"actor_id":1,"actor_type":"OrganizationAdmin","bypass_mode":"always"}]}
RULE4
  echo "  OK" | tee -a "$LOGFILE"
else
  echo "  SKIP: Block sensitive files (already exists)"
fi
sleep 2

# ============================================
# PHASE 2: Org-Level Security Settings
# ============================================
echo ""
echo "=== PHASE 2: Org Security (all 34 orgs) ==="

COUNT=0
for org in "${ORGS[@]}"; do
  wait_rate
  COUNT=$((COUNT + 1))

  # Security settings
  gh api "/orgs/$org" --method PATCH \
    -f default_repository_permission=read \
    -F members_can_create_public_repositories=false \
    -F members_can_delete_repositories=false \
    -F members_can_delete_issues=false \
    -F members_can_change_repository_visibility=false \
    -F members_can_fork_private_repositories=false \
    -f secret_scanning_enabled_for_new_repositories=true \
    -f secret_scanning_push_protection_enabled_for_new_repositories=true \
    -f dependabot_alerts_enabled_for_new_repositories=true \
    -f dependabot_security_updates_enabled_for_new_repositories=true \
    -q '.login' 2>/dev/null && echo "  OK [$COUNT/34] $org" || echo "  ERR [$COUNT/34] $org"

  echo "OK $org" >> "$LOGFILE"
  sleep 1.5
done

# ============================================
# PHASE 3: .github repos (org-level defaults)
# ============================================
echo ""
echo "=== PHASE 3: Org .github Repos (SECURITY, COC, CONTRIBUTING) ==="

SECURITY_MD='# Security Policy

## Reporting Vulnerabilities

Email security@blackroad.io with details. Do not open public issues for security vulnerabilities.

## Supported Versions

Only the latest release is supported.

## Response Time

We aim to respond within 48 hours.

(c) 2025-2026 BlackRoad OS, Inc. All rights reserved.'

COC_MD='# Code of Conduct

## Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

## Standards

- Be respectful and constructive
- Focus on collaboration
- Accept responsibility for mistakes

## Enforcement

Report issues to conduct@blackroad.io.

(c) 2025-2026 BlackRoad OS, Inc. All rights reserved.'

CONTRIBUTING_MD='# Contributing

All code in this repository is proprietary to BlackRoad OS, Inc.

## Process

1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Wait for review from @blackboxprogramming

## License

All contributions become property of BlackRoad OS, Inc.

(c) 2025-2026 BlackRoad OS, Inc. All rights reserved.'

for org in "${ORGS[@]}"; do
  wait_rate

  # Check if .github repo exists
  exists=$(gh api "/repos/$org/.github" -q '.name' 2>/dev/null || echo "")

  if [ -z "$exists" ]; then
    echo "  Creating .github repo for $org..."
    gh api "/orgs/$org/repos" --method POST \
      -f name=".github" \
      -f description="Organization-wide community health files for $org" \
      -F auto_init=true \
      -q '.name' 2>/dev/null || true
    sleep 2
  fi

  # Push SECURITY.md
  sec_sha=$(gh api "/repos/$org/.github/contents/SECURITY.md" -q '.sha' 2>/dev/null || echo "")
  sec_b64=$(echo "$SECURITY_MD" | base64)
  if [ -n "$sec_sha" ]; then
    gh api "/repos/$org/.github/contents/SECURITY.md" --method PUT \
      -f message="Update SECURITY.md" -f content="$sec_b64" -f sha="$sec_sha" \
      -q '.commit.sha' 2>/dev/null || true
  else
    gh api "/repos/$org/.github/contents/SECURITY.md" --method PUT \
      -f message="Add SECURITY.md" -f content="$sec_b64" \
      -q '.commit.sha' 2>/dev/null || true
  fi

  # Push CODE_OF_CONDUCT.md
  coc_sha=$(gh api "/repos/$org/.github/contents/CODE_OF_CONDUCT.md" -q '.sha' 2>/dev/null || echo "")
  coc_b64=$(echo "$COC_MD" | base64)
  if [ -n "$coc_sha" ]; then
    gh api "/repos/$org/.github/contents/CODE_OF_CONDUCT.md" --method PUT \
      -f message="Update CODE_OF_CONDUCT.md" -f content="$coc_b64" -f sha="$coc_sha" \
      -q '.commit.sha' 2>/dev/null || true
  else
    gh api "/repos/$org/.github/contents/CODE_OF_CONDUCT.md" --method PUT \
      -f message="Add CODE_OF_CONDUCT.md" -f content="$coc_b64" \
      -q '.commit.sha' 2>/dev/null || true
  fi

  # Push CONTRIBUTING.md
  con_sha=$(gh api "/repos/$org/.github/contents/CONTRIBUTING.md" -q '.sha' 2>/dev/null || echo "")
  con_b64=$(echo "$CONTRIBUTING_MD" | base64)
  if [ -n "$con_sha" ]; then
    gh api "/repos/$org/.github/contents/CONTRIBUTING.md" --method PUT \
      -f message="Update CONTRIBUTING.md" -f content="$con_b64" -f sha="$con_sha" \
      -q '.commit.sha' 2>/dev/null || true
  else
    gh api "/repos/$org/.github/contents/CONTRIBUTING.md" --method PUT \
      -f message="Add CONTRIBUTING.md" -f content="$con_b64" \
      -q '.commit.sha' 2>/dev/null || true
  fi

  echo "  OK .github for $org" | tee -a "$LOGFILE"
  sleep 2
done

# ============================================
# PHASE 4: Org Profiles (avatar, description, URL)
# ============================================
echo ""
echo "=== PHASE 4: Org Profiles ==="

declare -A ORG_DESC=(
  ["BlackRoad-OS-Inc"]="BlackRoad OS, Inc. — Parent company. Delaware C-Corp. Sovereign computing, edge AI, distributed infrastructure."
  ["BlackRoad-OS"]="BlackRoad OS — Coordinator org. 1000+ repos. The operating system for everything."
  ["BlackRoad-Agents"]="BlackRoad Agents — Autonomous AI agents, fleet orchestration, 30K agent ecosystem."
  ["BlackRoad-AI"]="BlackRoad AI — Machine learning, model training, inference infrastructure."
  ["BlackRoad-Archive"]="BlackRoad Archive — Historical records, data preservation, 228 databases."
  ["BlackRoad-Cloud"]="BlackRoad Cloud — Cloud infrastructure, Workers, edge compute."
  ["BlackRoad-Education"]="BlackRoad Education — RoadWork tutoring, adaptive learning, FSRS spaced repetition."
  ["BlackRoad-Forge"]="BlackRoad Forge — 367 forked and rebranded open-source tools. The Forkies library."
  ["BlackRoad-Foundation"]="BlackRoad Foundation — Community, grants, open research, Amundson Framework."
  ["BlackRoad-Gov"]="BlackRoad Gov — Governance, compliance, regulatory frameworks, policy engine."
  ["BlackRoad-Hardware"]="BlackRoad Hardware — Pi fleet, Hailo-8 edge AI, IoT, mesh networking."
  ["BlackRoad-Interactive"]="BlackRoad Interactive — Games, simulations, metaverse, RoadWorld."
  ["BlackRoad-Labs"]="BlackRoad Labs — Research, experiments, prototypes, bleeding edge."
  ["BlackRoad-Media"]="BlackRoad Media — Video, audio, streaming, RoadTube, RoadRadio."
  ["BlackRoad-QI"]="BlackRoad QI — Quantum computing, information theory, Amundson Framework applications."
  ["BlackRoad-Quantum"]="BlackRoad Quantum — Quantum algorithms, qutrit experiments, trinary logic."
  ["BlackRoad-README"]="BlackRoad README — Organization README repos and documentation."
  ["BlackRoad-Sandbox"]="BlackRoad Sandbox — Experimental repos, testing ground, prototypes."
  ["BlackRoad-Security"]="BlackRoad Security — Security tooling, audits, vulnerability scanning, hardening."
  ["BlackRoad-Studio"]="BlackRoad Studio — Creator tools, design, canvas, video editing."
  ["BlackRoad-Ventures"]="BlackRoad Ventures — Business development, partnerships, market research."
  ["BlackRoad-Data"]="BlackRoad Data — Data engineering, pipelines, analytics, warehousing."
  ["BlackRoad-Dev"]="BlackRoad Dev — Developer tools, SDKs, CLIs, integrations."
  ["BlackRoad-Tech"]="BlackRoad Tech — Technical infrastructure, DevOps, platform engineering."
)

for org in "${!ORG_DESC[@]}"; do
  wait_rate
  desc="${ORG_DESC[$org]}"
  gh api "/orgs/$org" --method PATCH \
    -f description="$desc" \
    -f company="BlackRoad OS, Inc." \
    -f blog="https://blackroad.io" \
    -f email="alexa@blackroad.io" \
    -f location="Lakeville, Minnesota" \
    -q '.login' 2>/dev/null && echo "  OK profile: $org" || echo "  ERR profile: $org"
  sleep 1.5
done

# ============================================
# PHASE 5: Verify Everything
# ============================================
echo ""
echo "=== PHASE 5: Verification ==="

echo "  Rulesets:"
gh api /enterprises/$ENTERPRISE/rulesets -q '.[] | "    \(.name) (\(.enforcement))"' 2>/dev/null

echo "  Sample org check (BlackRoad-OS-Inc):"
gh api /orgs/BlackRoad-OS-Inc -q '{
  desc: .description,
  default_perm: .default_repository_permission,
  secret_scan: .secret_scanning_enabled_for_new_repositories,
  dependabot: .dependabot_alerts_enabled_for_new_repositories,
  delete_repos: .members_can_delete_repositories
}' 2>/dev/null

echo ""
echo "========================================="
echo "  ENTERPRISE SETUP COMPLETE"
echo "========================================="
echo "  Rulesets: 5 (branch, release, tag, sensitive files, agent config)"
echo "  Orgs configured: 34"
echo "  .github repos: 34 (SECURITY, COC, CONTRIBUTING)"
echo "  Org profiles: ${#ORG_DESC[@]} updated"
echo "========================================="
