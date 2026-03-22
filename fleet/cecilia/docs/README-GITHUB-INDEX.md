# GitHub Repository Index System

## Overview
This index system provides comprehensive searchable access to all **1,225 repositories** across **15 BlackRoad organizations**.

## Files Created

### 📋 Main Indexes
- **`github-master-index.json`** - Complete structured index with all organizations and repositories
- **`GITHUB_REPOSITORY_INDEX.md`** - Human-readable markdown index with tables
- **`github-search-helper.json`** - Flat searchable list of all repos

### 🏢 Per-Organization Indexes
Individual JSON files for each organization:
- `github-index-Blackbox-Enterprises.json`
- `github-index-BlackRoad-AI.json`
- `github-index-BlackRoad-OS.json` (largest: 1000 repos)
- `github-index-BlackRoad-Labs.json`
- `github-index-BlackRoad-Cloud.json`
- `github-index-BlackRoad-Ventures.json`
- `github-index-BlackRoad-Foundation.json`
- `github-index-BlackRoad-Media.json`
- `github-index-BlackRoad-Hardware.json`
- `github-index-BlackRoad-Education.json`
- `github-index-BlackRoad-Gov.json`
- `github-index-BlackRoad-Security.json`
- `github-index-BlackRoad-Interactive.json`
- `github-index-BlackRoad-Archive.json`
- `github-index-BlackRoad-Studio.json`

## 🔧 Search Tools

### `github-search.sh` - Search across all repos
```bash
./github-search.sh quantum          # Search by keyword
./github-search.sh "AI agent"       # Multi-word search
./github-search.sh prism            # Find specific project
```

### `github-stats.sh` - View statistics
```bash
./github-stats.sh                   # Show overview and top repos
```

## 📊 Quick Stats
- **Total Organizations:** 15
- **Total Repositories:** 1,225
- **Largest Org:** BlackRoad-OS (1,000 repos)
- **Most Recent Activity:** 2026-01-30

## 🔍 Search Examples

### Using jq directly
```bash
# Find all AI-related repos
jq '.[] | select(.description | contains("AI"))' github-search-helper.json

# List all private repos
jq '.[] | select(.private == true)' github-search-helper.json

# Find repos in specific org
jq '.[] | select(.org == "BlackRoad-AI")' github-search-helper.json

# Get repo count by org
jq 'group_by(.org) | map({org: .[0].org, count: length})' github-search-helper.json
```

### Using grep on markdown
```bash
# Search markdown index
grep -i "quantum" GITHUB_REPOSITORY_INDEX.md
grep -i "agent" GITHUB_REPOSITORY_INDEX.md
```

## 🔄 Updating the Index

To refresh the indexes with latest data:
```bash
# Re-run the indexing process
for org in Blackbox-Enterprises BlackRoad-AI BlackRoad-OS BlackRoad-Labs BlackRoad-Cloud BlackRoad-Ventures BlackRoad-Foundation BlackRoad-Media BlackRoad-Hardware BlackRoad-Education BlackRoad-Gov BlackRoad-Security BlackRoad-Interactive BlackRoad-Archive BlackRoad-Studio; do
  gh repo list $org --json name,description,url,updatedAt,isPrivate,stargazerCount --limit 1000
done > /tmp/all-repos.json

# Then run the Python indexer again
```

## 📁 Index Structure

Each repository entry contains:
- `name` - Repository name
- `description` - Project description  
- `url` - GitHub URL
- `updatedAt` - Last update timestamp
- `isPrivate` - Privacy status
- `stargazerCount` - Number of stars
- `org` - Parent organization

## 💡 Use Cases

1. **Find projects by topic** - Search for keywords like "quantum", "AI", "blockchain"
2. **Track activity** - See most recently updated repos
3. **Audit privacy** - List all private vs public repos
4. **Discover projects** - Browse by organization
5. **Monitor growth** - Track total repo counts over time

## 🛠️ Integration

These indexes can be used with:
- Shell scripts for automation
- CI/CD pipelines for discovery
- Documentation generation
- Project management tools
- Internal search systems

---

**Last Updated:** 2026-01-30  
**Maintainer:** BlackRoad OS Team
