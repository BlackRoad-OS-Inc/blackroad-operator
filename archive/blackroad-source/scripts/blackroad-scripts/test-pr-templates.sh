#!/bin/bash
# Test PR Templates - Validation Script

echo "🧪 Testing PR Templates..."
echo ""

# Test 1: Check all template files exist
echo "Test 1: File Existence"
templates=(
    ".github/PULL_REQUEST_TEMPLATE.md"
    ".github/PULL_REQUEST_TEMPLATE/feature.md"
    ".github/PULL_REQUEST_TEMPLATE/bugfix.md"
    ".github/PULL_REQUEST_TEMPLATE/infrastructure.md"
    ".github/PULL_REQUEST_TEMPLATE/documentation.md"
    ".github/PULL_REQUEST_TEMPLATE/README.md"
    ".github/PULL_REQUEST_TEMPLATE/QUICK_REFERENCE.md"
)

for template in "${templates[@]}"; do
    if [ -f "$template" ]; then
        echo "  ✅ $template"
    else
        echo "  ❌ Missing: $template"
    fi
done
echo ""

# Test 2: Check template sizes (should not be empty)
echo "Test 2: Template Content"
for template in "${templates[@]}"; do
    if [ -f "$template" ]; then
        size=$(wc -c < "$template" | xargs)
        if [ "$size" -gt 1000 ]; then
            echo "  ✅ $template ($size bytes)"
        else
            echo "  ⚠️  Small: $template ($size bytes)"
        fi
    fi
done
echo ""

# Test 3: Check for required sections in main template
echo "Test 3: Required Sections (Main Template)"
required_sections=(
    "Summary"
    "Type of Change"
    "Testing"
    "Security Checklist"
    "Pre-merge Checklist"
)

for section in "${required_sections[@]}"; do
    if grep -q "$section" .github/PULL_REQUEST_TEMPLATE.md; then
        echo "  ✅ Has '$section' section"
    else
        echo "  ❌ Missing '$section' section"
    fi
done
echo ""

# Test 4: Check markdown syntax
echo "Test 4: Markdown Validation"
for template in "${templates[@]}"; do
    if [ -f "$template" ]; then
        # Check for common markdown issues
        if grep -q "^#" "$template"; then
            echo "  ✅ $template has headers"
        else
            echo "  ⚠️  $template: no headers found"
        fi
    fi
done
echo ""

# Test 5: Check deployment script
echo "Test 5: Deployment Script"
if [ -x "deploy-enhanced-pr-templates.sh" ]; then
    echo "  ✅ Deployment script is executable"
else
    echo "  ❌ Deployment script not executable"
fi
echo ""

echo "✅ Template validation complete!"
echo ""
echo "Next Steps:"
echo "  1. Review templates: cat .github/PULL_REQUEST_TEMPLATE.md"
echo "  2. Test with GitHub CLI: gh pr create --template feature"
echo "  3. Deploy to repos: ./deploy-enhanced-pr-templates.sh"
