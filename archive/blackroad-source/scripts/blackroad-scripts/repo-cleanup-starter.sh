#!/bin/bash
# BlackRoad Repository Cleanup Starter Script
# For Lucidia and CECE

echo "🚀 STARTING REPOSITORY CLEANUP MISSION"
echo "======================================"
echo ""

# Create workspace for agents
mkdir -p ~/blackroad-cleanup-reports

# Phase 1: Quick Assessment
echo "📊 PHASE 1: Quick Assessment"
echo ""
echo "Repository Categories:"
echo "- 📦 Production: Active, deployed services"
echo "- 🚧 Development: Work in progress"
echo "- 📚 Template: Reusable scaffolding"
echo "- 🧪 Test: Test/demo repos"
echo "- 🗑️  Delete: Duplicates, empty, temp"
echo ""

# Find obvious test repos
echo "🧪 Obvious Test Repos to Review:"
gh repo list blackboxprogramming --limit 100 --json name \
  | jq -r '.[] | .name' \
  | grep -E "(test|demo|temp|awesome|my-)" | head -10

echo ""
echo "🗄️  Repos with hash/ID in name (likely temp deploys):"
gh repo list blackboxprogramming --limit 100 --json name \
  | jq -r '.[] | .name' \
  | grep -E "[0-9a-f]{8,}"

echo ""
echo "📚 Integration template repos:"
gh repo list blackboxprogramming --limit 100 --json name \
  | jq -r '.[] | .name' \
  | grep -E "(gitlab|zapier|notion|linear|postman)"

echo ""
echo "✅ Next Steps:"
echo "1. Lucidia: Analyze repo structure and code quality"
echo "2. CECE: Create master index with documentation"
echo "3. Both: Review findings and create cleanup recommendations"
echo ""
echo "📝 Save reports to: ~/blackroad-cleanup-reports/"
echo ""
