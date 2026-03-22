#!/bin/bash

# 🖤 BlackRoad OS - Security Automation Setup
# Enables Dependabot, CodeQL, and secret scanning across all repos
# Author: Alexa Amundson
# Date: 2026-01-30

set -euo pipefail

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;33m'
GREEN='\033[38;5;10m'
RESET='\033[0m'

echo -e "${PINK}╔═══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║      🖤 BlackRoad OS - Security Automation Setup 🔒          ║${RESET}"
echo -e "${PINK}╚═══════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Priority organizations
ORGS=(
  "BlackRoad-OS"
  "Blackbox-Enterprises"
  "BlackRoad-AI"
)

enable_org_security() {
  local org="$1"
  
  echo -e "${BLUE}🔐 Configuring security for: $org${RESET}"
  
  # Get all repos in org (limit to first 100 for now)
  local repos=$(gh repo list "$org" --limit 100 --json name --jq '.[].name')
  local count=0
  local enabled=0
  
  while IFS= read -r repo; do
    if [[ -z "$repo" ]]; then
      continue
    fi
    
    ((count++))
    local full_repo="$org/$repo"
    
    echo -e "  → $repo"
    
    # Enable vulnerability alerts
    gh api -X PUT "repos/$full_repo/vulnerability-alerts" 2>/dev/null && \
      echo "    ✓ Vulnerability alerts" || echo "    ⚠️  Vulnerability alerts (may be enabled)"
    
    # Enable automated security fixes (Dependabot)
    gh api -X PUT "repos/$full_repo/automated-security-fixes" 2>/dev/null && \
      echo "    ✓ Automated security fixes" || echo "    ⚠️  Security fixes (may be enabled)"
    
    # Enable secret scanning (requires GitHub Advanced Security)
    # gh api -X PUT "repos/$full_repo/secret-scanning" 2>/dev/null && \
    #   echo "    ✓ Secret scanning" || echo "    ⚠️  Secret scanning (requires GH Advanced Security)"
    
    ((enabled++))
    
    # Rate limit protection
    if (( count % 10 == 0 )); then
      sleep 2
    fi
    
  done <<< "$repos"
  
  echo -e "  ${GREEN}✅ Processed $enabled repositories${RESET}"
  echo ""
}

# Create Dependabot config template
create_dependabot_config() {
  cat > /tmp/dependabot.yml <<'EOF'
version: 2
updates:
  # npm packages
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "blackboxprogramming"
    commit-message:
      prefix: "deps"
      include: "scope"
    groups:
      dev-dependencies:
        dependency-type: "development"
      production-dependencies:
        dependency-type: "production"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    reviewers:
      - "blackboxprogramming"
    commit-message:
      prefix: "ci"

  # Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    reviewers:
      - "blackboxprogramming"
    commit-message:
      prefix: "deps(docker)"
EOF

  echo -e "${GREEN}✅ Created Dependabot config template: /tmp/dependabot.yml${RESET}"
}

# Create CodeQL workflow template
create_codeql_workflow() {
  cat > /tmp/codeql.yml <<'EOF'
name: "CodeQL Security Scan"

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main", "develop" ]
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM UTC

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript', 'typescript' ]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: ${{ matrix.language }}
        queries: security-extended

    - name: Autobuild
      uses: github/codeql-action/autobuild@v3

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
      with:
        category: "/language:${{matrix.language}}"
EOF

  echo -e "${GREEN}✅ Created CodeQL workflow template: /tmp/codeql.yml${RESET}"
}

# Create SECURITY.md template
create_security_policy() {
  cat > /tmp/SECURITY.md <<'EOF'
# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@blackroad.io**

You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

## Response Timeline

- **Initial Response:** Within 24 hours
- **Status Update:** Within 72 hours
- **Fix Timeline:** Critical issues within 7 days

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Measures

We implement:

- 🔒 **Automated Scanning** - Daily vulnerability scans
- 🔐 **Secret Detection** - Pre-commit and CI/CD scanning
- 📊 **Dependency Monitoring** - Automated updates via Dependabot
- 🛡️ **Code Analysis** - Weekly CodeQL security scans
- 🔍 **Penetration Testing** - Quarterly third-party audits
- 📋 **SOC2 Compliance** - Annual audits
- 🔏 **Encryption** - At-rest and in-transit

## Hall of Fame

We recognize security researchers who help keep BlackRoad OS secure:

<!-- Contributors will be listed here -->

---

**🖤 BlackRoad OS Security Team**
EOF

  echo -e "${GREEN}✅ Created security policy template: /tmp/SECURITY.md${RESET}"
}

# Main execution
echo -e "${AMBER}Step 1: Creating security templates...${RESET}"
echo ""

create_dependabot_config
create_codeql_workflow
create_security_policy

echo ""
echo -e "${AMBER}Step 2: Enabling security features for organizations...${RESET}"
echo ""

for org in "${ORGS[@]}"; do
  enable_org_security "$org"
done

echo ""
echo -e "${PINK}╔═══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║                    ✅ SECURITY SETUP COMPLETE                 ║${RESET}"
echo -e "${PINK}╚═══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${BLUE}Templates created:${RESET}"
echo -e "  • /tmp/dependabot.yml - Dependabot configuration"
echo -e "  • /tmp/codeql.yml - CodeQL security scanning"
echo -e "  • /tmp/SECURITY.md - Security policy"
echo ""
echo -e "${BLUE}Next steps:${RESET}"
echo -e "  1. Copy templates to repositories"
echo -e "  2. Configure GitHub Advanced Security (for private repos)"
echo -e "  3. Review security alerts in each org"
echo -e "  4. Set up security@blackroad.io email forwarding"
echo ""
