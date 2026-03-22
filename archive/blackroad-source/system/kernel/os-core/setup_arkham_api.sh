#!/bin/bash
# Arkham API Setup Helper

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           Arkham Intelligence API Setup                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if already set
if [[ -n "${ARKHAM_API_KEY:-}" ]] && [[ "$ARKHAM_API_KEY" != "your-api-key-here" ]]; then
    echo "✅ ARKHAM_API_KEY is already set!"
    echo "   Length: ${#ARKHAM_API_KEY} characters"
    echo ""
    echo "Testing connection..."

    # Test the key
    EXPIRES=$(date +%s)
    REQUEST_PATH="/intelligence/entity/alexamundson77"
    METHOD="GET"
    MESSAGE="${METHOD}${REQUEST_PATH}${EXPIRES}"
    SIGNATURE=$(echo -n "$MESSAGE" | openssl dgst -sha256 -hmac "$ARKHAM_API_KEY" -binary | base64)

    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -H "Arkham-Api-Key: $ARKHAM_API_KEY" \
        -H "Arkham-Expires: $EXPIRES" \
        -H "Arkham-Signature: $SIGNATURE" \
        "https://api.arkhamintelligence.com${REQUEST_PATH}")

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [[ "$HTTP_CODE" == "200" ]]; then
        echo "✅ API key works!"
        echo "$BODY" | python3 -m json.tool
    else
        echo "⚠️  API key set but not working (HTTP $HTTP_CODE)"
        echo "$BODY"
    fi
    exit 0
fi

echo "❌ No API key found"
echo ""
echo "To get an Arkham API key:"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ Step 1: Create Account (FREE)                                 │"
echo "│   → https://platform.arkm.com/                                │"
echo "│   → Click 'Sign Up' (top right)                               │"
echo "│   → Use email: blackroad.systems@gmail.com                    │"
echo "│                                                                │"
echo "│ Step 2: Get API Key                                           │"
echo "│   → Go to: https://platform.arkm.com/settings/api            │"
echo "│   → Click 'Create API Key'                                    │"
echo "│   → Copy the key (shown only once!)                           │"
echo "│                                                                │"
echo "│ Step 3: Set API Key                                           │"
echo "│   → Paste in terminal:                                        │"
echo "│     export ARKHAM_API_KEY='your-key-here'                     │"
echo "│                                                                │"
echo "│ Step 4: Make It Permanent (optional)                          │"
echo "│   → Run:                                                       │"
echo "│     echo 'export ARKHAM_API_KEY=\"your-key\"' >> ~/.zshrc     │"
echo "│     source ~/.zshrc                                            │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "Opening signup page in 3 seconds..."
sleep 3
open "https://platform.arkm.com/"
echo ""
echo "Once you have the key, run:"
echo "  export ARKHAM_API_KEY='paste-key-here'"
echo "  ./arkham_api_client.sh /intelligence/entity/alexamundson77"
echo ""
