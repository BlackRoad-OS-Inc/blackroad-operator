#!/bin/bash
# Arkham Intelligence API Client
# Docs: https://docs.arkm.com/

set -euo pipefail

# Configuration
BASE_URL="https://api.arkhamintelligence.com"
API_KEY="${ARKHAM_API_KEY:-}"

if [[ -z "$API_KEY" ]]; then
    echo "Error: ARKHAM_API_KEY environment variable not set" >&2
    echo "Usage: export ARKHAM_API_KEY='your-api-key'" >&2
    echo "       $0 <endpoint> [method] [body]" >&2
    exit 1
fi

# Parse arguments
ENDPOINT="${1:-}"
METHOD="${2:-GET}"
BODY="${3:-}"

if [[ -z "$ENDPOINT" ]]; then
    echo "Usage: $0 <endpoint> [method] [body]" >&2
    echo "" >&2
    echo "Examples:" >&2
    echo "  $0 /intelligence/address/0x123..." >&2
    echo "  $0 /intelligence/entity/alexamundson77" >&2
    echo "  $0 /portfolio/address/0x123..." >&2
    exit 1
fi

# Generate timestamp
EXPIRES=$(date +%s)

# Generate signature (HMAC-SHA256)
# Format: METHOD + REQUEST_PATH + EXPIRES + BODY
REQUEST_PATH="$ENDPOINT"
MESSAGE="${METHOD}${REQUEST_PATH}${EXPIRES}${BODY}"

# Generate HMAC signature
SIGNATURE=$(echo -n "$MESSAGE" | openssl dgst -sha256 -hmac "$API_KEY" -binary | base64)

# Make request
echo "🔍 Arkham API Request" >&2
echo "   Endpoint: $ENDPOINT" >&2
echo "   Method: $METHOD" >&2
echo "" >&2

if [[ -n "$BODY" ]]; then
    curl -X "$METHOD" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -H "Arkham-Api-Key: $API_KEY" \
        -H "Arkham-Expires: $EXPIRES" \
        -H "Arkham-Signature: $SIGNATURE" \
        -d "$BODY" \
        "${BASE_URL}${REQUEST_PATH}"
else
    curl -X "$METHOD" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -H "Arkham-Api-Key: $API_KEY" \
        -H "Arkham-Expires: $EXPIRES" \
        -H "Arkham-Signature: $SIGNATURE" \
        "${BASE_URL}${REQUEST_PATH}"
fi

echo "" >&2
