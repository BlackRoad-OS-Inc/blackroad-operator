#!/usr/bin/env bash
echo "🔍 br-sync Status"
echo "════════════════════════════════════════"
if [ -f ~/.blackroad-sync/dependency-graph.json ]; then
    echo "✅ Dependency graph: EXISTS"
    repos=$(jq '.metadata.totalRepos' ~/.blackroad-sync/dependency-graph.json)
    date=$(jq -r '.metadata.generatedAt' ~/.blackroad-sync/dependency-graph.json | cut -d'T' -f1)
    echo "   Repos: $repos"
    echo "   Generated: $date"
else
    echo "⚠️  Dependency graph: NOT FOUND"
    echo "   Run: br-sync discover"
fi
echo ""
echo "📂 Data directory: ~/.blackroad-sync/"
ls -lh ~/.blackroad-sync/*.json 2>/dev/null || echo "   (no data files yet)"
