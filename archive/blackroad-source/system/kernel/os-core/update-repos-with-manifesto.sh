#!/bin/bash
# Update all BlackRoad repositories with manifesto reference

echo "🚗 Updating BlackRoad Repositories with Manifesto"
echo "═══════════════════════════════════════════════════"
echo ""

MANIFESTO_URL="https://github.com/BlackRoad-OS/blackroad-os-core/blob/main/BLACKROAD_MANIFESTO.md"

# Key repositories to update
repos=(
    "roadchain-frontend"
    "roadchain-api"
    "roadchain-bridges"
    "../blackroad-services-phase1"
)

success=0
failed=0

for repo in "${repos[@]}"; do
    echo "📂 Updating $repo..."

    if [ ! -d "$repo" ]; then
        echo "   ⚠️  Directory not found, skipping"
        ((failed++))
        continue
    fi

    cd "$repo" || continue

    # Check if README.md exists
    if [ ! -f "README.md" ]; then
        echo "   ⚠️  No README.md found, skipping"
        cd - > /dev/null
        ((failed++))
        continue
    fi

    # Check if manifesto link already exists
    if grep -q "BLACKROAD_MANIFESTO" README.md; then
        echo "   ⏭️  Manifesto already referenced"
        cd - > /dev/null
        continue
    fi

    # Add manifesto reference to README
    cat >> README.md <<EOF

---

## 🚗 BlackRoad Architecture

This project follows the **[BlackRoad Manifesto](${MANIFESTO_URL})** - an anti-dynamic, upstream-first architecture philosophy.

**Core Principles:**
- ✅ Git is Truth - All changes are versioned
- ✅ URLs are Forever - No breaking changes to published endpoints
- ✅ Builds are Deterministic - Same code = same output, always

For RoadChain-specific rules on blockchain immutability, NFT permanence, and content addressing, see the [Blockchain Rules](${MANIFESTO_URL}#-blockchain-specific-rules-roadchain) section.

**The Promise:** PROMISE IS FOREVER 🚗💎✨
EOF

    echo "   ✅ Added manifesto reference"
    ((success++))

    cd - > /dev/null
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Updated: $success repositories"
echo "⚠️  Failed/Skipped: $failed repositories"
echo ""
echo "Next: Commit changes in each repository"
echo "═══════════════════════════════════════════════════"
