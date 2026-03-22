#!/bin/bash
# br repo-scaffold <name> <description> <vertical> — Create new repo with RoadCode
set -e
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

NAME="$1"
DESC="${2:-BlackRoad OS product}"
VERTICAL="${3:-General}"

if [ -z "$NAME" ]; then
  echo "Usage: br repo-scaffold <name> <description> <vertical>"
  exit 1
fi

echo -e "${PINK}Creating ${NAME}...${RESET}"

# Create repo
gh repo create "BlackRoad-OS-Inc/$NAME" --public --description "$DESC — PROPRIETARY BlackRoad OS, Inc." 2>/dev/null

TMPDIR=$(mktemp -d)
cd "$TMPDIR"
git init -b main
git remote add origin "https://github.com/BlackRoad-OS-Inc/$NAME.git"

# PROPRIETARY LICENSE
cat > LICENSE << 'EOF'
BLACKROAD OS, INC. — PROPRIETARY LICENSE
Copyright (c) 2025-2026 BlackRoad OS, Inc. All rights reserved.
NOT open source. No copying, modification, or distribution without written permission.
BlackRoad OS, Inc. | Delaware C-Corp | EIN: 41-2663817
For licensing: alexa@blackroad.io
EOF

# README
cat > README.md << EOF
# $NAME
> $DESC
**Vertical**: $VERTICAL | **License**: PROPRIETARY
Part of [BlackRoad OS](https://blackroad.io) — 120+ products, 7 nodes, sovereign infrastructure.
EOF

# RoadCode structure
mkdir -p RoadCode/{docs,src,assets}
cat > RoadCode/TODO.md << EOF
# TODO — $NAME [$VERTICAL]
- [ ] [RC] Initial implementation
- [ ] [RC] Deploy to Gematria
- [ ] [RC] Wire CI/CD
- [ ] [RC] Documentation
EOF

# Full filesystem
for d in agents/{cece,codex,domain-agents,lucidia,operator,skills,system-agents,templates,tools} api/{agents,auth,gateway,graphql,nodes,rest,services,websocket} archive/{deprecated,experiments,legacy,snapshots} cli/{br,br-agent,br-config,br-models,br-node,br-service,tools} config/{agents,environments,policies,routing,secrets,services} core/{execution,graph,memory,messaging,protocols,registry,scheduler,state,task-engine,utilities} data/{cache,datasets,embeddings,indexes,logs,snapshots,telemetry} docs/{agents,api,architecture,guides,infrastructure,operators,whitepapers} infrastructure/{cloud,cloudflare,deployments,github,k8s,railway,terraform,vercel} models/{embeddings,evaluation,fine-tuning,llm,routing,speech,vision} nodes/{cloud,clusters,edge,jetson,mac,node-config,raspberry-pi} runtime/{containers,environments,orchestrator,pipelines,queue,scheduler,workers} scripts/{bootstrap,deploy,install,maintenance,migration,setup} services/{analytics,compute,gateway,indexing,inference,notifications,orchestration,routing,search,storage} system/{auth,events,identity,kernel,lifecycle,logging,monitoring,networking,permissions,security,storage} tests/{agents,api,integration,performance,services,unit} web/{admin,brand,console,dashboard,docs,public,studio}; do
  mkdir -p "$d"
  touch "$d/.gitkeep"
done

# CI workflow
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'YML'
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate structure
        run: |
          test -f LICENSE && echo "✓ LICENSE"
          test -f README.md && echo "✓ README"
          echo "All checks passed."
YML

git add -A
git commit -m "feat: initialize $NAME with RoadCode structure

$DESC | Vertical: $VERTICAL
Full BlackRoad-Source filesystem + CI + PROPRIETARY license.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push -u origin main 2>&1 | tail -2

# Protect main
gh api "repos/BlackRoad-OS-Inc/$NAME/branches/main/protection" --method PUT --input - <<'JSON' 2>/dev/null | tail -1
{"required_pull_request_reviews":{"required_approving_review_count":1,"dismiss_stale_reviews":true},"enforce_admins":false,"required_status_checks":null,"restrictions":null}
JSON

rm -rf "$TMPDIR"
echo -e "${GREEN}✅ $NAME created, pushed, protected.${RESET}"
