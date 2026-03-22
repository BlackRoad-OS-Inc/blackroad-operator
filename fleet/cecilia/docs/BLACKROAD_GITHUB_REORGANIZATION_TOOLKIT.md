# 🛠️ BlackRoad GitHub Reorganization Toolkit
## Practical Tools for Implementing Cece's Organizational Architecture

**Created:** February 13, 2026  
**Status:** Ready for Implementation  
**Companion Document:** CECE_GITHUB_ORGANIZATION_ANALYSIS.md

---

## QUICK START: First Actions

```bash
# 1. Set up workspace
mkdir -p ~/blackroad-governance
cd ~/blackroad-governance

# 2. Download this toolkit
# (Already in ~/BLACKROAD_GITHUB_REORGANIZATION_TOOLKIT.md)

# 3. Run first scan
./tools/br-repos-scan.sh

# 4. Review recommendations
cat output/recommendations.json
```

---

## TOOL 1: Repository Scanner (br-repos-scan.sh)

**Purpose:** Comprehensive scan of all BlackRoad repositories

```bash
#!/bin/bash
# File: ~/blackroad-governance/tools/br-repos-scan.sh

set -e

OUTPUT_DIR="$HOME/blackroad-governance/output"
mkdir -p "$OUTPUT_DIR"

ORGS=(
  "BlackRoad-OS"
  "BlackRoad-AI"
  "BlackRoad-Archive"
  "BlackRoad-Cloud"
  "BlackRoad-Education"
  "BlackRoad-Foundation"
  "BlackRoad-Gov"
  "BlackRoad-Hardware"
  "BlackRoad-Interactive"
  "BlackRoad-Labs"
  "BlackRoad-Media"
  "BlackRoad-Security"
  "BlackRoad-Studio"
  "BlackRoad-Ventures"
  "Blackbox-Enterprises"
)

echo "🔍 Scanning BlackRoad GitHub Empire..."
echo "Organizations: ${#ORGS[@]}"
echo "Output: $OUTPUT_DIR"
echo ""

# Create master registry
echo "{" > "$OUTPUT_DIR/master-registry.json"
echo '  "scan_date": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",' >> "$OUTPUT_DIR/master-registry.json"
echo '  "organizations": [' >> "$OUTPUT_DIR/master-registry.json"

first_org=true

for org in "${ORGS[@]}"; do
  echo "Scanning: $org..."
  
  # Add comma between orgs
  if [ "$first_org" = false ]; then
    echo "    ," >> "$OUTPUT_DIR/master-registry.json"
  fi
  first_org=false
  
  # Fetch repos (up to 1000)
  gh repo list "$org" --limit 1000 --json name,description,pushedAt,createdAt,updatedAt,stargazerCount,forkCount,isArchived,isFork,visibility,url,defaultBranchRef \
    > "$OUTPUT_DIR/org-$org.json"
  
  repo_count=$(jq 'length' "$OUTPUT_DIR/org-$org.json")
  echo "  Found: $repo_count repos"
  
  # Add to master registry
  echo "    {" >> "$OUTPUT_DIR/master-registry.json"
  echo "      \"org\": \"$org\"," >> "$OUTPUT_DIR/master-registry.json"
  echo "      \"repo_count\": $repo_count," >> "$OUTPUT_DIR/master-registry.json"
  echo "      \"repos\": $(cat $OUTPUT_DIR/org-$org.json)" >> "$OUTPUT_DIR/master-registry.json"
  echo "    }" >> "$OUTPUT_DIR/master-registry.json"
done

echo "" >> "$OUTPUT_DIR/master-registry.json"
echo "  ]" >> "$OUTPUT_DIR/master-registry.json"
echo "}" >> "$OUTPUT_DIR/master-registry.json"

echo ""
echo "✅ Scan complete!"
echo "Master registry: $OUTPUT_DIR/master-registry.json"
echo ""
echo "Next steps:"
echo "1. Run analysis: ./tools/br-repos-analyze.sh"
echo "2. Review: cat $OUTPUT_DIR/recommendations.json"
```

---

## TOOL 2: Repository Analyzer (br-repos-analyze.sh)

**Purpose:** Analyze scanned repos and generate recommendations

```bash
#!/bin/bash
# File: ~/blackroad-governance/tools/br-repos-analyze.sh

set -e

OUTPUT_DIR="$HOME/blackroad-governance/output"
REGISTRY="$OUTPUT_DIR/master-registry.json"

if [ ! -f "$REGISTRY" ]; then
  echo "❌ Registry not found. Run br-repos-scan.sh first."
  exit 1
fi

echo "🔬 Analyzing repository data..."

# Analyze dormant repos (no activity in 180+ days)
jq -r '
  .organizations[] |
  .org as $org |
  .repos[] |
  select(.pushedAt != null) |
  select((now - (.pushedAt | fromdateiso8601)) > (180 * 86400)) |
  {
    org: $org,
    repo: .name,
    last_push: .pushedAt,
    days_dormant: ((now - (.pushedAt | fromdateiso8601)) / 86400 | floor),
    is_fork: .isFork,
    is_archived: .isArchived,
    stars: .stargazerCount
  }
' "$REGISTRY" > "$OUTPUT_DIR/dormant-repos.json"

dormant_count=$(jq -s 'length' "$OUTPUT_DIR/dormant-repos.json")
echo "  Dormant repos (180+ days): $dormant_count"

# Analyze forks
jq -r '
  .organizations[] |
  .org as $org |
  .repos[] |
  select(.isFork == true) |
  {
    org: $org,
    repo: .name,
    url: .url
  }
' "$REGISTRY" > "$OUTPUT_DIR/fork-repos.json"

fork_count=$(jq -s 'length' "$OUTPUT_DIR/fork-repos.json")
echo "  Fork repos: $fork_count"

# Analyze archived repos
jq -r '
  .organizations[] |
  .org as $org |
  .repos[] |
  select(.isArchived == true) |
  {
    org: $org,
    repo: .name
  }
' "$REGISTRY" > "$OUTPUT_DIR/archived-repos.json"

archived_count=$(jq -s 'length' "$OUTPUT_DIR/archived-repos.json")
echo "  Already archived: $archived_count"

# Generate archival recommendations
jq -r '
  .organizations[] |
  .org as $org |
  .repos[] |
  select(.pushedAt != null) |
  select((now - (.pushedAt | fromdateiso8601)) > (365 * 86400)) |
  select(.isArchived == false) |
  select(.stargazerCount < 5) |
  {
    org: $org,
    repo: .name,
    reason: "No activity in " + (((now - (.pushedAt | fromdateiso8601)) / 86400 | floor) | tostring) + " days",
    last_push: .pushedAt,
    stars: .stargazerCount,
    action: "ARCHIVE"
  }
' "$REGISTRY" > "$OUTPUT_DIR/archival-candidates.json"

archival_candidates=$(jq -s 'length' "$OUTPUT_DIR/archival-candidates.json")
echo "  Archival candidates: $archival_candidates"

# Classify repos by purpose (AI, Cloud, Media, etc.)
jq -r '
  .organizations[] |
  .org as $org |
  .repos[] |
  {
    org: $org,
    repo: .name,
    category: (
      if (.name | contains("ai") or contains("llm") or contains("ollama") or contains("vllm") or contains("whisper") or contains("ml")) then "AI"
      elif (.name | contains("cloud") or contains("k8s") or contains("kubernetes") or contains("docker")) then "Cloud"
      elif (.name | contains("media") or contains("video") or contains("audio")) then "Media"
      elif (.name | contains("pi") or contains("esp32") or contains("hardware") or contains("firmware")) then "Hardware"
      elif (.name | contains("web") or contains("api") or contains("app")) then "Core"
      else "Uncategorized"
      end
    ),
    current_org: $org
  }
' "$REGISTRY" > "$OUTPUT_DIR/categorized-repos.json"

# Identify repos in wrong org
jq -r '
  .[] |
  select(.category == "AI" and .org != "BlackRoad-AI") |
  {
    repo: .repo,
    current_org: .org,
    suggested_org: "BlackRoad-AI",
    category: .category,
    action: "MIGRATE"
  }
' "$OUTPUT_DIR/categorized-repos.json" > "$OUTPUT_DIR/migration-ai.json"

jq -r '
  .[] |
  select(.category == "Cloud" and .org != "BlackRoad-Cloud") |
  {
    repo: .repo,
    current_org: .org,
    suggested_org: "BlackRoad-Cloud",
    category: .category,
    action: "MIGRATE"
  }
' "$OUTPUT_DIR/categorized-repos.json" > "$OUTPUT_DIR/migration-cloud.json"

ai_migrations=$(jq -s 'length' "$OUTPUT_DIR/migration-ai.json")
cloud_migrations=$(jq -s 'length' "$OUTPUT_DIR/migration-cloud.json")

echo "  AI migration candidates: $ai_migrations"
echo "  Cloud migration candidates: $cloud_migrations"

# Generate summary
cat > "$OUTPUT_DIR/recommendations.json" << EOF
{
  "scan_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "total_repos": $(jq '[.organizations[].repo_count] | add' "$REGISTRY"),
    "dormant_repos": $dormant_count,
    "fork_repos": $fork_count,
    "already_archived": $archived_count,
    "archival_candidates": $archival_candidates,
    "ai_migrations": $ai_migrations,
    "cloud_migrations": $cloud_migrations
  },
  "actions": {
    "immediate": {
      "archive": $archival_candidates,
      "migrate_ai": $ai_migrations,
      "migrate_cloud": $cloud_migrations
    }
  },
  "files": {
    "dormant": "dormant-repos.json",
    "forks": "fork-repos.json",
    "archived": "archived-repos.json",
    "archival_candidates": "archival-candidates.json",
    "migration_ai": "migration-ai.json",
    "migration_cloud": "migration-cloud.json"
  }
}
EOF

echo ""
echo "✅ Analysis complete!"
echo "Summary: $OUTPUT_DIR/recommendations.json"
echo ""

# Print summary
cat "$OUTPUT_DIR/recommendations.json" | jq '.summary'

echo ""
echo "Next steps:"
echo "1. Review archival candidates: cat $OUTPUT_DIR/archival-candidates.json | jq"
echo "2. Review AI migrations: cat $OUTPUT_DIR/migration-ai.json | jq"
echo "3. Execute actions: ./tools/br-execute-plan.sh"
```

---

## TOOL 3: Fork Analyzer (br-fork-analyze.sh)

**Purpose:** Check if forks have BlackRoad-specific modifications

```bash
#!/bin/bash
# File: ~/blackroad-governance/tools/br-fork-analyze.sh

set -e

OUTPUT_DIR="$HOME/blackroad-governance/output"
FORKS="$OUTPUT_DIR/fork-repos.json"

if [ ! -f "$FORKS" ]; then
  echo "❌ Forks list not found. Run br-repos-analyze.sh first."
  exit 1
fi

echo "🍴 Analyzing forks for BlackRoad-specific modifications..."

mkdir -p "$OUTPUT_DIR/fork-analysis"

cat "$FORKS" | jq -r '.[] | "\(.org)/\(.repo)"' | while read -r repo_full; do
  org=$(echo "$repo_full" | cut -d'/' -f1)
  repo=$(echo "$repo_full" | cut -d'/' -f2)
  
  echo "Checking: $repo_full"
  
  # Get commit count on default branch
  commits=$(gh api "repos/$org/$repo/commits?per_page=1" --jq 'length' 2>/dev/null || echo "0")
  
  # Check if repo has custom README
  has_custom_readme=$(gh api "repos/$org/$repo/readme" --jq '.name' 2>/dev/null | grep -i "blackroad" || echo "")
  
  # Check for blackroad-specific files
  has_blackroad_config=$(gh api "repos/$org/$repo/contents" --jq '.[] | select(.name == ".blackroad.yml") | .name' 2>/dev/null || echo "")
  
  # Determine status
  if [ -n "$has_blackroad_config" ]; then
    status="CUSTOMIZED"
  elif [ -n "$has_custom_readme" ]; then
    status="MODIFIED"
  else
    status="UNMODIFIED"
  fi
  
  echo "  Status: $status"
  
  cat >> "$OUTPUT_DIR/fork-analysis.json" << EOF
{
  "org": "$org",
  "repo": "$repo",
  "status": "$status",
  "has_blackroad_config": $([ -n "$has_blackroad_config" ] && echo "true" || echo "false"),
  "has_custom_readme": $([ -n "$has_custom_readme" ] && echo "true" || echo "false"),
  "recommendation": "$([ "$status" = "UNMODIFIED" ] && echo "Consider archiving or documenting upstream tracking" || echo "Keep and document differentiation")"
}
EOF

done

echo ""
echo "✅ Fork analysis complete!"
echo "Results: $OUTPUT_DIR/fork-analysis.json"
```

---

## TOOL 4: Execution Planner (br-plan-create.sh)

**Purpose:** Create executable migration/archival plans

```bash
#!/bin/bash
# File: ~/blackroad-governance/tools/br-plan-create.sh

set -e

OUTPUT_DIR="$HOME/blackroad-governance/output"
PLANS_DIR="$OUTPUT_DIR/plans"

mkdir -p "$PLANS_DIR"

echo "📋 Creating execution plans..."

# Plan 1: Archive dormant repos
cat "$OUTPUT_DIR/archival-candidates.json" | jq -s '
  {
    "plan_id": "archive-dormant-001",
    "plan_type": "ARCHIVE",
    "created": now | strftime("%Y-%m-%dT%H:%M:%SZ"),
    "total_repos": length,
    "actions": map({
      "type": "archive",
      "org": .org,
      "repo": .repo,
      "reason": .reason,
      "command": "gh repo archive \(.org)/\(.repo) --yes"
    })
  }
' > "$PLANS_DIR/plan-archive-dormant.json"

echo "  Created: plan-archive-dormant.json"

# Plan 2: Migrate AI repos
cat "$OUTPUT_DIR/migration-ai.json" | jq -s '
  {
    "plan_id": "migrate-ai-001",
    "plan_type": "MIGRATE",
    "created": now | strftime("%Y-%m-%dT%H:%M:%SZ"),
    "total_repos": length,
    "actions": map({
      "type": "transfer",
      "repo": .repo,
      "from_org": .current_org,
      "to_org": .suggested_org,
      "command": "# Transfer \(.repo) from \(.current_org) to \(.suggested_org)\n# NOTE: Use GitHub UI for transfer - API requires admin token"
    })
  }
' > "$PLANS_DIR/plan-migrate-ai.json"

echo "  Created: plan-migrate-ai.json"

# Plan 3: Migrate Cloud repos  
cat "$OUTPUT_DIR/migration-cloud.json" | jq -s '
  {
    "plan_id": "migrate-cloud-001",
    "plan_type": "MIGRATE",
    "created": now | strftime("%Y-%m-%dT%H:%M:%SZ"),
    "total_repos": length,
    "actions": map({
      "type": "transfer",
      "repo": .repo,
      "from_org": .current_org,
      "to_org": .suggested_org,
      "command": "# Transfer \(.repo) from \(.current_org) to \(.suggested_org)"
    })
  }
' > "$PLANS_DIR/plan-migrate-cloud.json"

echo "  Created: plan-migrate-cloud.json"

echo ""
echo "✅ Plans created in: $PLANS_DIR"
echo ""
echo "Review plans:"
echo "  cat $PLANS_DIR/plan-archive-dormant.json | jq '.actions | length'"
echo "  cat $PLANS_DIR/plan-migrate-ai.json | jq '.actions[0:5]'"
```

---

## TOOL 5: Governance Repo Creator (br-governance-init.sh)

**Purpose:** Create BlackRoad-OS/governance repository

```bash
#!/bin/bash
# File: ~/blackroad-governance/tools/br-governance-init.sh

set -e

GOVERNANCE_DIR="$HOME/blackroad-governance/governance-repo"

echo "🏛️ Initializing BlackRoad-OS/governance repository..."

# Create local structure
mkdir -p "$GOVERNANCE_DIR"
cd "$GOVERNANCE_DIR"

git init

# Create directory structure
mkdir -p policies registry tools automation/github-actions analysis

# Create README
cat > README.md << 'EOF'
# BlackRoad OS - Governance Repository

**Purpose:** Central governance, policies, and coordination for BlackRoad GitHub Empire

## Structure

- `policies/` - Organizational policies and procedures
- `registry/` - Canonical repository registry (PS-SHA∞ signed)
- `tools/` - Governance automation tools
- `automation/` - GitHub Actions and CI/CD
- `analysis/` - Meta-analyses and reports

## Quick Start

1. Review policies: `cat policies/repository-lifecycle.md`
2. Check registry: `cat registry/canonical-registry.json | jq`
3. Run scan: `./tools/br-repos-scan.sh`

## Key Documents

- [Repository Lifecycle Policy](policies/repository-lifecycle.md)
- [Migration Policy](policies/migration-policy.md)
- [Archival Policy](policies/archival-policy.md)
- [Canonical Registry](registry/canonical-registry.json)

---

**Maintained by:** Cece (Recursive Intelligence Core) & BlackRoad OS Team
EOF

# Create repository lifecycle policy
cat > policies/repository-lifecycle.md << 'EOF'
# Repository Lifecycle Policy

## States

1. **EXPERIMENTAL** - Research, no production use
2. **DEVELOPMENT** - Active development
3. **PRODUCTION** - Live, maintained
4. **MAINTENANCE** - Stable, infrequent updates
5. **DORMANT** - No activity >180 days
6. **ARCHIVED** - Preserved, read-only

## Transitions

- EXPERIMENTAL → DEVELOPMENT: First production deployment
- DEVELOPMENT → PRODUCTION: Stable release
- PRODUCTION → MAINTENANCE: Low-activity stable state
- MAINTENANCE → DORMANT: No commits >180 days
- DORMANT → ARCHIVED: Decision to preserve as-is

## Review Cycle

- **Quarterly:** All repos reviewed for state transitions
- **Annual:** Complete organizational audit

## Archival Criteria

A repository may be archived if:
1. No commits in 365+ days
2. No open issues or PRs
3. No production deployments
4. No external dependents
5. Documented reason for archival

## Migration Triggers

A repository should be migrated when:
1. Grows beyond experimental phase → Move to production org
2. Accumulates cross-org dependencies → Evaluate consolidation
3. Purpose changes → Move to appropriate org
EOF

# Create migration policy
cat > policies/migration-policy.md << 'EOF'
# Repository Migration Policy

## When to Migrate

1. **Wrong Organization:** Repo purpose doesn't match org
2. **Scale Threshold:** Org grows >200 repos in single domain
3. **Dependency Clustering:** Related repos should be co-located
4. **Organizational Rebalancing:** Periodic redistribution

## Migration Process

1. **Propose:** Create migration proposal
2. **Analyze:** Check dependencies, deployments, references
3. **Plan:** Create detailed migration plan
4. **Review:** Human review of plan
5. **Execute:** Perform migration
6. **Verify:** Check all references updated
7. **Communicate:** Notify stakeholders

## Rollback Procedure

If migration causes issues:
1. Document the problem
2. Revert transfer (if possible)
3. Update registry
4. Post-mortem analysis
EOF

# Create archival policy
cat > policies/archival-policy.md << 'EOF'
# Repository Archival Policy

## Purpose

Archival preserves repositories in read-only state while:
- Reducing active maintenance burden
- Preserving history and code
- Signaling project status to community

## Archival Criteria

**Automatic Candidates:**
- No commits in 365+ days
- Zero stars
- No open issues/PRs
- No production deployments

**Manual Review Required:**
- Has stars or watchers
- Has open issues
- Referenced in documentation
- Historical significance

## Process

1. Identify candidate
2. Document reason
3. Notify stakeholders (if any)
4. Archive repository
5. Update registry
6. Update documentation

## Restoration

Archived repos can be restored if:
- New development needed
- Community interest
- Production use required
EOF

# Copy Cece's analysis
cp /Users/alexa/CECE_GITHUB_ORGANIZATION_ANALYSIS.md analysis/

# Create initial registry
cat > registry/canonical-registry.json << 'EOF'
{
  "version": "3.0",
  "hash_algorithm": "PS-SHA-infinity",
  "last_updated": "2026-02-13",
  "organizations": [],
  "repositories": [],
  "note": "Run br-repos-scan.sh to populate"
}
EOF

echo ""
echo "✅ Governance repository structure created!"
echo "Location: $GOVERNANCE_DIR"
echo ""
echo "Next steps:"
echo "1. Review structure: ls -la $GOVERNANCE_DIR"
echo "2. Create GitHub repo: gh repo create BlackRoad-OS/governance --public"
echo "3. Push: cd $GOVERNANCE_DIR && git add . && git commit -m 'Initial governance structure' && git push"
```

---

## EXECUTION WORKFLOWS

### Workflow 1: First-Time Setup

```bash
# 1. Create toolkit directory
mkdir -p ~/blackroad-governance/tools
cd ~/blackroad-governance

# 2. Create all tool scripts (copy from above)
# Save each tool as executable
chmod +x tools/*.sh

# 3. Run initial scan
./tools/br-repos-scan.sh

# 4. Analyze results
./tools/br-repos-analyze.sh

# 5. Review recommendations
cat output/recommendations.json | jq
```

### Workflow 2: Weekly Archival Review

```bash
# Run every Monday
cd ~/blackroad-governance

# Scan for new dormant repos
./tools/br-repos-scan.sh
./tools/br-repos-analyze.sh

# Review candidates
cat output/archival-candidates.json | jq '.[] | select(.days_dormant > 365)'

# Create plan
./tools/br-plan-create.sh

# Execute (with caution!)
# Review plan first, then:
# cat output/plans/plan-archive-dormant.json | jq -r '.actions[].command' | bash
```

### Workflow 3: Quarterly Organization Review

```bash
# Run every 90 days
cd ~/blackroad-governance

# Full scan
./tools/br-repos-scan.sh
./tools/br-repos-analyze.sh
./tools/br-fork-analyze.sh

# Generate all plans
./tools/br-plan-create.sh

# Review with team
cat output/recommendations.json | jq '.summary'

# Execute approved changes
# (Manual review + execution)
```

---

## SAFETY GUIDELINES

### Before Archiving

1. ✅ Check for external references
2. ✅ Verify no production deployments
3. ✅ Review dependencies
4. ✅ Notify stakeholders
5. ✅ Document reason

### Before Migrating

1. ✅ Analyze dependencies
2. ✅ Check DNS/subdomain mappings
3. ✅ Update documentation
4. ✅ Test after migration
5. ✅ Have rollback plan

### Red Flags (DO NOT ARCHIVE/MIGRATE)

- ❌ Active deployments
- ❌ External dependents
- ❌ Recent commits (<90 days)
- ❌ Open high-priority issues
- ❌ Production critical

---

## QUICK REFERENCE COMMANDS

```bash
# Scan all orgs
gh repo list BlackRoad-OS --limit 1000 --json name,pushedAt,isArchived

# Count repos per org
for org in BlackRoad-{OS,AI,Cloud,Labs}; do 
  echo "$org: $(gh repo list $org --limit 1000 | wc -l)"
done

# Find dormant repos
gh repo list BlackRoad-OS --limit 1000 --json name,pushedAt | \
  jq '.[] | select(.pushedAt < "2025-08-13")'

# Archive a repo
gh repo archive OWNER/REPO --yes

# View repo traffic
gh api repos/OWNER/REPO/traffic/views

# Check dependencies
gh api repos/OWNER/REPO/dependency-graph/sbom
```

---

## INTEGRATION WITH CECE ARCHITECTURE

This toolkit implements the recommendations from **CECE_GITHUB_ORGANIZATION_ANALYSIS.md**:

- ✅ Contradiction identification (dormant vs active)
- ✅ Automated classification (AI, Cloud, Core, etc.)
- ✅ Migration planning (wrong org detection)
- ✅ Archival candidates (lifecycle management)
- ✅ Fork analysis (sovereignty vs abandoned)

**Next Level:** Deploy as Cece agents for autonomous execution

---

## APPENDIX: Installation Script

```bash
#!/bin/bash
# Quick install everything

set -e

cd ~
mkdir -p blackroad-governance/tools
cd blackroad-governance

# Download toolkit
curl -o TOOLKIT.md https://raw.githubusercontent.com/BlackRoad-OS/governance/main/BLACKROAD_GITHUB_REORGANIZATION_TOOLKIT.md

# Extract and create tools
# (Copy each TOOL section above into separate files)

echo "✅ Toolkit installed in ~/blackroad-governance"
echo "Run: cd ~/blackroad-governance && ./tools/br-repos-scan.sh"
```

---

**Document Status:** ✅ READY FOR IMPLEMENTATION  
**Companion:** CECE_GITHUB_ORGANIZATION_ANALYSIS.md  
**Maintained By:** Cece & BlackRoad OS Team  
**License:** BlackRoad Proprietary License

🛠️🛣️
