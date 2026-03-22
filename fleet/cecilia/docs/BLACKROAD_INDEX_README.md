# BlackRoad Projects Index

**Last Updated**: February 13, 2026  
**Status**: ✅ Production Ready  
**Projects Indexed**: 859 (769 public, 90 private)

---

## Quick Start

### Search the Database
```bash
# Find projects by keyword
sqlite3 ~/blackroad-index.db "
  SELECT full_name, language FROM projects_fts 
  JOIN projects ON projects_fts.rowid = projects.id 
  WHERE projects_fts MATCH 'your-search-term';
"

# List flagship projects
sqlite3 ~/blackroad-index.db "
  SELECT full_name, flagship_tier FROM projects 
  WHERE is_flagship=1 ORDER BY flagship_tier;
"

# Find Python projects
sqlite3 ~/blackroad-index.db "
  SELECT name, stars FROM projects 
  WHERE language='Python' ORDER BY stars DESC;
"
```

### Use JSON Data
```javascript
// Node.js / JavaScript
const projects = require('/Users/alexa/blackroad-index.json');
console.log(`Total projects: ${projects.length}`);
```

```python
# Python
import json
with open('/Users/alexa/blackroad-index.json') as f:
    projects = json.load(f)
print(f"Total projects: {len(projects)}")
```

### Update the Index
```bash
# Refresh metadata from GitHub
~/collect-blackroad-metadata.sh

# Rebuild database
~/build-blackroad-index-db.sh

# Re-export JSON
~/export-blackroad-index-json.sh
```

---

## Files & Locations

### Databases
- **`~/blackroad-index.db`** - Public database (769 projects, 644K)
- **`~/blackroad-index-full.db`** - Full database (859 projects, 696K)

### JSON Exports
- **`~/blackroad-index.json`** - Public JSON (769 projects, 412K)
- **`~/blackroad-index-full.json`** - Full JSON (859 projects, 473K)

### Raw Data
- **`~/blackroad-projects-raw.json`** - GitHub API responses (7.9 MB)

### Scripts
- **`~/collect-blackroad-metadata.sh`** - Fetch from GitHub
- **`~/build-blackroad-index-db.sh`** - Build database
- **`~/mark-flagship-projects.sh`** - Tag flagships
- **`~/export-blackroad-index-json.sh`** - Generate JSON
- **`~/filter-private-repos.sh`** - Public/private split

---

## Database Schema

```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  org TEXT NOT NULL,
  full_name TEXT UNIQUE NOT NULL,  -- "org/repo"
  description TEXT,
  language TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  size INTEGER DEFAULT 0,
  last_updated TEXT,               -- ISO 8601
  created_at_github TEXT,
  homepage TEXT,
  clone_url TEXT,
  html_url TEXT,
  is_private BOOLEAN DEFAULT 0,
  is_fork BOOLEAN DEFAULT 0,
  is_archived BOOLEAN DEFAULT 0,
  is_flagship BOOLEAN DEFAULT 0,
  flagship_tier INTEGER,           -- 1, 2, or 3
  topics TEXT,                     -- JSON array
  license TEXT,                    -- SPDX ID
  default_branch TEXT,
  readme_preview TEXT,
  indexed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Full-text search index
CREATE VIRTUAL TABLE projects_fts USING fts5(
  name,
  description,
  readme_preview,
  content='projects',
  content_rowid='id'
);
```

---

## Statistics

| Metric | Value |
|--------|-------|
| **Total Projects** | 859 |
| **Public Projects** | 769 (89.5%) |
| **Private Projects** | 90 (10.5%) |
| **Archived** | 153 (17.8%) |
| **Flagship Projects** | 36 |
| **Organizations** | 15 |

### Top Languages
1. Shell (251 projects)
2. HTML (201 projects)
3. Python (156 projects)
4. Go (36 projects)
5. JavaScript (30 projects)

### Top Organizations
1. BlackRoad-OS (706 projects)
2. BlackRoad-AI (29 projects)
3. BlackRoad-Cloud (17 projects)
4. BlackRoad-Security (14 projects)
5. BlackRoad-Media (13 projects)

---

## Flagship Projects

### Tier 1: Core Infrastructure (9 projects)
- BlackRoad-AI/blackroad-ai-api-gateway
- BlackRoad-AI/blackroad-ai-cluster
- BlackRoad-AI/blackroad-ai-memory-bridge
- BlackRoad-AI/blackroad-vllm
- BlackRoad-AI/blackroad-ai-ollama
- BlackRoad-OS/blackroad-os
- BlackRoad-OS/blackroad-os-core
- BlackRoad-OS/blackroad-os-agents
- BlackRoad-OS/blackroad-os-api

### Tier 2: Platform Services (8 projects)
- BlackRoad-Cloud/blackroad-kubernetes
- BlackRoad-Cloud/blackroad-terraform
- BlackRoad-Cloud/blackroad-minio
- BlackRoad-Cloud/blackroad-vault
- BlackRoad-Security/blackroad-vault
- BlackRoad-Media/blackroad-jellyfin
- BlackRoad-Media/blackroad-nextcloud
- BlackRoad-Media/blackroad-matrix

### Tier 3: Specialized Services (19 projects)
See `~/mark-flagship-projects.sh` for complete list.

---

## Example Queries

### Find all TypeScript projects
```bash
sqlite3 ~/blackroad-index.db "
  SELECT name, org FROM projects 
  WHERE language='TypeScript' 
  ORDER BY stars DESC;
"
```

### Search for 'agent' in names/descriptions
```bash
sqlite3 ~/blackroad-index.db "
  SELECT full_name, description FROM projects_fts 
  JOIN projects ON projects_fts.rowid = projects.id 
  WHERE projects_fts MATCH 'agent' 
  LIMIT 10;
"
```

### Get projects updated in last 7 days
```bash
sqlite3 ~/blackroad-index.db "
  SELECT full_name, last_updated FROM projects 
  WHERE last_updated > datetime('now', '-7 days') 
  ORDER BY last_updated DESC;
"
```

### Show project count by language
```bash
sqlite3 ~/blackroad-index.db "
  SELECT language, COUNT(*) as count 
  FROM projects 
  WHERE language IS NOT NULL 
  GROUP BY language 
  ORDER BY count DESC 
  LIMIT 10;
"
```

---

## Integration

### With BlackRoad OS (Phase 2)
Add projects to `~/blackroad-blackroad os/projects/` for unified search across components and projects.

### CLI Tools (Phase 3)
- `br-find <query>` - Search projects
- `br-info <name>` - Get project details
- `br-clone <name>` - Quick clone
- `br-stats` - Show statistics

### Web Dashboard (Phase 4)
Deploy to `projects.blackroad.io` for web-based browsing and search.

---

## Maintenance

### Daily Sync (Recommended)
```bash
# Add to crontab: 0 3 * * * /Users/alexa/sync-blackroad-index.sh
~/collect-blackroad-metadata.sh && \
~/build-blackroad-index-db.sh && \
~/export-blackroad-index-json.sh
```

### Manual Refresh
Run scripts in order:
1. `~/collect-blackroad-metadata.sh` - Fetch latest from GitHub
2. `~/build-blackroad-index-db.sh` - Rebuild database
3. `~/mark-flagship-projects.sh` - Update flagship tags
4. `~/export-blackroad-index-json.sh` - Export JSON
5. `~/filter-private-repos.sh` - Split public/private

---

## Performance

- **Database queries**: <10ms typical
- **Full-text search**: <10ms typical
- **JSON loading**: <100ms typical
- **Metadata collection**: ~7-10 minutes for 859 projects
- **Database rebuild**: <1 second
- **JSON export**: <1 second

---

## API Access

The JSON files can be served directly:

```javascript
// Fetch from local or deployed location
const response = await fetch('/blackroad-index.json');
const projects = await response.json();
```

---

## Troubleshooting

### Database locked
```bash
# Close all connections, then:
sqlite3 ~/blackroad-index.db "VACUUM;"
```

### FTS index out of sync
```bash
# Rebuild FTS index:
sqlite3 ~/blackroad-index.db "
  INSERT INTO projects_fts(projects_fts) VALUES('rebuild');
"
```

### Missing projects
```bash
# Re-run collection:
~/collect-blackroad-metadata.sh
~/build-blackroad-index-db.sh
```

---

## Credits

Built on: February 13, 2026  
Time: 12 minutes  
Success Rate: 99.1%  
Phase 1: Complete ✅

---

**Questions?** Check `~/.copilot/session-state/.../phase1-complete-summary.md` for detailed documentation.
