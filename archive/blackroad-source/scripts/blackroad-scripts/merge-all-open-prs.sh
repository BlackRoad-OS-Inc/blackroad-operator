#!/bin/bash
# Merge ALL open PRs across BlackRoad orgs
# No more PRs sitting there forever

echo "🔀 MERGING ALL OPEN PRS"
echo "======================="

orgs="BlackRoad-OS BlackRoad-AI BlackRoad-Cloud BlackRoad-Security BlackRoad-Labs"

total=0
merged=0

for org in $orgs; do
    echo ""
    echo "📁 Organization: $org"
    
    # Get all open PRs
    prs=$(gh pr list --org "$org" --state open --json url,number,headRepositoryOwner,headRepository -q '.[] | "\(.headRepositoryOwner.login)/\(.headRepository.name)#\(.number)"' 2>/dev/null || echo "")
    
    for pr in $prs; do
        repo=$(echo "$pr" | cut -d'#' -f1)
        num=$(echo "$pr" | cut -d'#' -f2)
        
        echo "  🔄 Merging $repo #$num..."
        
        # Try to merge - squash preferred
        if gh pr merge "$num" -R "$repo" --squash --admin 2>/dev/null; then
            echo "    ✅ Merged!"
            merged=$((merged + 1))
        elif gh pr merge "$num" -R "$repo" --merge --admin 2>/dev/null; then
            echo "    ✅ Merged (merge commit)!"
            merged=$((merged + 1))
        else
            echo "    ⚠️  Could not merge (conflicts or permissions)"
        fi
        
        total=$((total + 1))
    done
done

echo ""
echo "======================="
echo "📊 Results: $merged/$total PRs merged"
echo ""
echo "Remaining PRs likely have conflicts."
echo "Run: gh pr list --org BlackRoad-OS --state open"
