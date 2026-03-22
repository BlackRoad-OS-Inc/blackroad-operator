# 🧹 BlackRoad Repository Cleanup Mission

## Current Situation
- **Local Repos:** 208
- **GitHub Repos:** 100+
- **Issue:** Many scaffolding, test, and incomplete repos need organization

## Mission Objectives
1. Categorize all repositories
2. Archive or delete unnecessary repos
3. Improve documentation for active repos
4. Create a master index
5. Establish naming conventions

---

## Phase 1: Audit & Categorization

### Obvious Cleanup Candidates (Found in top 20):
- `my-awesome-app` - Test repo
- `blackroad-auto-deploy-test` - Test repo
- `blackroad-io-79f17491` - Temp deployment (hash in name)
- `blackroad-gitlab-ci` - Integration template
- `blackroad-postman` - Integration template
- `blackroad-zapier` - Integration template
- `blackroad-notion` - Integration template
- `blackroad-linear` - Integration template

### Repository Categories:

#### 📦 **Active Production** (Keep & Document)
- `blackroad` - Main repo
- `blackroad-scripts` - Active scripts
- `blackroad-operator` - Production operator
- `blackroad-templates` - Reusable templates
- `BlackRoad-Infinity` - Active project
- `BLACKROAD-OS-MASTER` - Master OS repo

#### 🚧 **In Development** (Keep & Improve)
- `lucidia` - Lucidia agent workspace
- `lucidia-workspace` - Development workspace
- `blackroad-garage` - Infrastructure docs (private)
- `blackroad-container` - Container setup

#### 📚 **Templates/Integration Starters** (Consolidate or Archive)
- `blackroad-gitlab-ci`
- `blackroad-postman`
- `blackroad-zapier`
- `blackroad-notion`
- `blackroad-linear`
- `blackroad-templates` (keep this, archive others into it)

#### 🗑️ **Delete** (Test/Temp Repos)
- `my-awesome-app`
- `blackroad-auto-deploy-test`
- `blackroad-io-79f17491` (temp deploy)

#### 🗄️ **Archive** (Old/Completed)
- `epstein-files-transparency` (public archive, already complete)
- `blackboxprogramming` (old personal repo?)

---

## Phase 2: Agent Tasks

### Lucidia's Technical Audit 🖤🛣️
```bash
# For each repo, analyze:
1. Last commit date
2. Number of commits
3. Presence of meaningful code vs scaffolding
4. Dependencies and complexity
5. README quality
6. Active issues/PRs

# Generate report:
- Production-ready repos
- Incomplete repos
- Duplicate functionality
- Consolidation opportunities
```

### CECE's Documentation Work 💜
```bash
# For each active repo, create/improve:
1. Clear README with purpose
2. Installation instructions
3. Usage examples
4. Contribution guidelines
5. License information
6. Link to master index

# Create master index:
- Categorized list of all repos
- Brief description of each
- Status (active/archived/deprecated)
- Links to documentation
```

---

## Phase 3: Cleanup Actions

### Immediate Actions:
1. **Delete test repos** - `my-awesome-app`, `blackroad-auto-deploy-test`
2. **Archive completed** - repos that are done and won't change
3. **Consolidate templates** - merge integration templates into `blackroad-templates`
4. **Update READMEs** - for all active production repos

### Organization Actions:
1. **Naming Convention:**
   - `blackroad-<service>` - Production services
   - `blackroad-<integration>` - Third-party integrations
   - `blackroad-<tool>` - Development tools
   - Personal agent names (lucidia, cecilia) for agent workspaces

2. **GitHub Topics:**
   - Add topics: `blackroad-os`, `production`, `template`, `infrastructure`
   - Makes searching and filtering easier

3. **Branch Protection:**
   - Enable for production repos
   - Require PR reviews

---

## Phase 4: Ongoing Maintenance

### New Repo Checklist:
- [ ] Meaningful name following convention
- [ ] Complete README
- [ ] LICENSE file
- [ ] .gitignore
- [ ] Listed in master index
- [ ] Proper GitHub topics

### Monthly Audit:
- Review repos not updated in 90 days
- Archive or delete as needed
- Update documentation

---

## Success Metrics
- ✅ All production repos have complete READMEs
- ✅ Test/temp repos deleted
- ✅ Templates consolidated
- ✅ Master index created
- ✅ Naming convention established
- ✅ Reduce total repo count by 30%

---

## Commands for Agents

### List all repos by activity:
```bash
gh repo list blackboxprogramming --limit 1000 --json name,pushedAt,isArchived \
  | jq -r 'sort_by(.pushedAt) | reverse | .[] | "\(.pushedAt) | \(.name)"'
```

### Find repos with no commits:
```bash
for dir in /Users/alexa/*/; do
  if [ -d "$dir/.git" ]; then
    commits=$(cd "$dir" && git rev-list --all --count 2>/dev/null)
    if [ "$commits" = "0" ]; then
      echo "Empty: $(basename $dir)"
    fi
  fi
done
```

### Archive a repo on GitHub:
```bash
gh repo archive <owner>/<repo>
```

---

**Mission Start:** Ready for agent execution
**Estimated Cleanup:** 50-70 repos to delete/archive
**Timeline:** Ongoing project
**Status:** ACTIVE
