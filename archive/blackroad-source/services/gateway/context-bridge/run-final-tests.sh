#!/bin/bash

echo "🧪 Context Bridge - Final Automated Test Suite"
echo "=============================================="
echo ""

PASS=0
FAIL=0
WARN=0

# Test 1: Chrome Extension Structure
echo "📦 Test 1: Chrome Extension Structure"
if [ -f "extension/manifest.json" ] && \
   [ -f "extension/popup/popup.html" ] && \
   [ -f "extension/popup/popup.js" ] && \
   [ -f "extension/background/service-worker.js" ] && \
   [ -d "extension/content" ]; then
    echo "   ✅ PASS - All Chrome extension files present"
    ((PASS++))
else
    echo "   ❌ FAIL - Missing Chrome extension files"
    ((FAIL++))
fi

# Test 2: Firefox Extension Structure
echo "📦 Test 2: Firefox Extension Structure"
if [ -f "extension-firefox/manifest.json" ] && \
   [ -f "extension-firefox/popup/popup.html" ] && \
   [ -f "extension-firefox/popup/popup.js" ] && \
   [ -f "extension-firefox/background/background.js" ] && \
   [ -d "extension-firefox/content" ]; then
    echo "   ✅ PASS - All Firefox extension files present"
    ((PASS++))
else
    echo "   ❌ FAIL - Missing Firefox extension files"
    ((FAIL++))
fi

# Test 3: Content Scripts (4 platforms)
echo "🎯 Test 3: Content Scripts for All Platforms"
EXPECTED_SCRIPTS=("chatgpt.js" "claude.js" "copilot.js" "gemini.js")
MISSING=0
for script in "${EXPECTED_SCRIPTS[@]}"; do
    if [ ! -f "extension/content/$script" ]; then
        echo "   ❌ Missing: $script"
        ((MISSING++))
    fi
done
if [ $MISSING -eq 0 ]; then
    echo "   ✅ PASS - All 4 content scripts present"
    ((PASS++))
else
    echo "   ❌ FAIL - Missing $MISSING content scripts"
    ((FAIL++))
fi

# Test 4: Cache Management Scripts
echo "💾 Test 4: Cache Management"
if [ -f "extension/content/cache-manager.js" ] && \
   [ -f "extension/content/claude-with-cache.js" ]; then
    echo "   ✅ PASS - Cache management scripts present"
    ((PASS++))
else
    echo "   ⚠️  WARN - Some cache scripts missing (non-critical)"
    ((WARN++))
fi

# Test 5: Manifest Validation (Chrome)
echo "📋 Test 5: Chrome Manifest Validation"
if node -e "require('./extension/manifest.json')" 2>/dev/null; then
    VERSION=$(node -e "console.log(require('./extension/manifest.json').version)")
    PERMS=$(node -e "console.log(require('./extension/manifest.json').permissions.length)")
    echo "   ✅ PASS - Chrome manifest valid (v$VERSION, $PERMS permissions)"
    ((PASS++))
else
    echo "   ❌ FAIL - Chrome manifest.json invalid JSON"
    ((FAIL++))
fi

# Test 6: Manifest Validation (Firefox)
echo "📋 Test 6: Firefox Manifest Validation"
if node -e "require('./extension-firefox/manifest.json')" 2>/dev/null; then
    VERSION=$(node -e "console.log(require('./extension-firefox/manifest.json').version)")
    PERMS=$(node -e "console.log(require('./extension-firefox/manifest.json').permissions.length)")
    echo "   ✅ PASS - Firefox manifest valid (v$VERSION, $PERMS permissions)"
    ((PASS++))
else
    echo "   ❌ FAIL - Firefox manifest.json invalid JSON"
    ((FAIL++))
fi

# Test 7: Submission Packages
echo "📦 Test 7: Submission Packages"
if [ -f "build/context-bridge-chrome.zip" ] && \
   [ -f "build/context-bridge-firefox.zip" ]; then
    CHROME_SIZE=$(ls -lh build/context-bridge-chrome.zip | awk '{print $5}')
    FIREFOX_SIZE=$(ls -lh build/context-bridge-firefox.zip | awk '{print $5}')
    echo "   ✅ PASS - Both ZIPs exist (Chrome: $CHROME_SIZE, Firefox: $FIREFOX_SIZE)"
    ((PASS++))
else
    echo "   ⚠️  WARN - Missing submission ZIPs (run package-for-submission.sh)"
    ((WARN++))
fi

# Test 8: Documentation
echo "📚 Test 8: Documentation Files"
DOCS=("README.md" "QUICKSTART.md" "FAQ.md" "PRIVACY_POLICY.md" "CHANGELOG.md")
MISSING_DOCS=0
for doc in "${DOCS[@]}"; do
    if [ ! -f "$doc" ]; then
        echo "   ❌ Missing: $doc"
        ((MISSING_DOCS++))
    fi
done
if [ $MISSING_DOCS -eq 0 ]; then
    echo "   ✅ PASS - All documentation present"
    ((PASS++))
else
    echo "   ❌ FAIL - Missing $MISSING_DOCS documentation files"
    ((FAIL++))
fi

# Test 9: Store Listings
echo "🏪 Test 9: Store Listing Content"
if [ -f "CHROME_WEB_STORE_LISTING.md" ] && \
   [ -f "FIREFOX_ADDONS_LISTING.md" ]; then
    echo "   ✅ PASS - Store listing content ready"
    ((PASS++))
else
    echo "   ❌ FAIL - Missing store listing files"
    ((FAIL++))
fi

# Test 10: Launch Content
echo "🚀 Test 10: Launch Marketing Content"
if [ -f "LAUNCH_TWEET_THREAD.md" ] && \
   [ -f "LINKEDIN_ANNOUNCEMENT.md" ] && \
   [ -f "REDDIT_POSTS.md" ] && \
   [ -f "PRODUCT_HUNT_LAUNCH_KIT.md" ]; then
    echo "   ✅ PASS - All launch content ready"
    ((PASS++))
else
    echo "   ⚠️  WARN - Some launch content missing"
    ((WARN++))
fi

# Test 11: Icons
echo "🎨 Test 11: Icon Assets"
if [ -f "extension/icons/icon.svg" ]; then
    echo "   ✅ PASS - SVG icon source present"
    ((PASS++))
else
    echo "   ❌ FAIL - Missing icon.svg"
    ((FAIL++))
fi

# Test 12: Test Context
echo "📝 Test 12: Test Context File"
if [ -f "test-context.md" ]; then
    echo "   ✅ PASS - Test context available"
    ((PASS++))
else
    echo "   ⚠️  WARN - No test context (optional)"
    ((WARN++))
fi

# Summary
echo ""
echo "=============================================="
echo "📊 Test Results Summary"
echo "=============================================="
echo "✅ Passed:  $PASS"
echo "❌ Failed:  $FAIL"
echo "⚠️  Warnings: $WARN"
echo ""

TOTAL=$((PASS + FAIL))
PERCENT=$((PASS * 100 / TOTAL))

if [ $FAIL -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! ($PERCENT%)"
    echo ""
    echo "✅ Context Bridge is ready for submission!"
    echo ""
    echo "Next steps:"
    echo "  1. Generate PNG icons (optional): bash extension/icons/generate-icons.sh"
    echo "  2. Review PACKAGING_CHECKLIST.md"
    echo "  3. Submit to Chrome Web Store"
    echo "  4. Submit to Firefox Add-ons"
    echo "  5. Launch on Product Hunt!"
    exit 0
else
    echo "⚠️  $FAIL TESTS FAILED ($PERCENT% passed)"
    echo ""
    echo "Please fix the failed tests before submission."
    exit 1
fi
