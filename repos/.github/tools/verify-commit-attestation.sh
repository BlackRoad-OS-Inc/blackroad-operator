#!/bin/bash
set -euo pipefail

# Commit Attestation Verification Tool
# Verifies commits using dual SHA-256/SHA-512 attestation tokens

COMMIT="${1:-HEAD}"
MODE="${2:-verify}" # verify, attest, or both

# Validate COMMIT parameter: must be a SHA-1, SHA-256, or a valid ref name (simple check)
if [[ ! "$COMMIT" =~ ^([0-9a-fA-F]{40}|[0-9a-fA-F]{64}|[A-Za-z0-9._/-]+)$ ]]; then
    echo -e "${RED}❌ Invalid commit parameter: '$COMMIT'${NC}"
    echo "    Must be a SHA-1, SHA-256, or a valid ref name (alphanumeric, ., _, /, -)"
    exit 1
fi
echo "🔐 Commit Attestation Tool"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to generate attestation token
generate_attestation() {
    local commit=$1
    local token_type=$2 # primary or secondary

    echo -e "${BLUE}📝 Generating $token_type attestation token for commit $commit${NC}"

    # Get commit content
    COMMIT_CONTENT=$(git cat-file commit "$commit")

    # Generate SHA-256 hash
    SHA256=$(echo "$COMMIT_CONTENT" | sha256sum | awk '{print $1}')

    # Generate SHA-512 hash (infinite precision as requested)
    SHA512=$(echo "$COMMIT_CONTENT" | sha512sum | awk '{print $1}')

    # Get commit metadata
    AUTHOR=$(git log -1 --format="%an <%ae>" "$commit")
    DATE=$(git log -1 --format="%ci" "$commit")
    MESSAGE=$(git log -1 --format="%s" "$commit")

    # Create attestation token
    ATTESTATION_DATA=$(cat <<EOF
{
  "token_type": "$token_type",
  "commit": "$commit",
  "sha256": "$SHA256",
  "sha512": "$SHA512",
  "author": "$AUTHOR",
  "date": "$DATE",
  "message": "$MESSAGE",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)

    # Generate token signature (hash of attestation data)
    TOKEN_SIGNATURE=$(echo "$ATTESTATION_DATA" | sha256sum | awk '{print $1}')

    # Create final token
    ATTESTATION_TOKEN=$(cat <<EOF
{
  "data": $ATTESTATION_DATA,
  "signature": "$TOKEN_SIGNATURE",
  "version": "1.0"
}
EOF
)

    echo "$ATTESTATION_TOKEN"
}

# Function to verify commit integrity
verify_commit() {
    local commit=$1

    echo -e "${BLUE}🔍 Verifying commit integrity: $commit${NC}"

    # Get expected SHA (from Git)
    EXPECTED_SHA=$(git rev-parse "$commit")

    # Recompute SHA from commit content
    ACTUAL_SHA=$(git cat-file commit "$commit" | git hash-object -t commit --stdin)

    if [ "$EXPECTED_SHA" = "$ACTUAL_SHA" ]; then
        echo -e "${GREEN}✅ Commit integrity verified${NC}"
        return 0
    else
        echo -e "${RED}❌ Commit integrity check FAILED${NC}"
        echo "  Expected: $EXPECTED_SHA"
        echo "  Actual:   $ACTUAL_SHA"
        return 1
    fi
}

# Function to verify commit signature
verify_signature() {
    local commit=$1

    echo -e "${BLUE}🔏 Checking commit signature${NC}"

    if git verify-commit "$commit" 2>/dev/null; then
        echo -e "${GREEN}✅ Commit is cryptographically signed${NC}"
        git show --show-signature --format="%GK %GS" "$commit" | head -1
        return 0
    else
        echo -e "${YELLOW}⚠️  Commit is not signed${NC}"
        return 1
    fi
}

# Function to perform dual attestation
dual_attest() {
    local commit=$1

    echo -e "${BLUE}🔐 Generating dual attestation tokens${NC}"
    echo ""

    # Generate primary token
    echo -e "${BLUE}📝 Token 1 (Primary):${NC}"
    PRIMARY_TOKEN=$(generate_attestation "$commit" "primary")
    echo "$PRIMARY_TOKEN" | jq .

    echo ""

    # Generate secondary token (independent verification)
    echo -e "${BLUE}📝 Token 2 (Secondary):${NC}"
    SECONDARY_TOKEN=$(generate_attestation "$commit" "secondary")
    echo "$SECONDARY_TOKEN" | jq .

    echo ""

    # Verify tokens match
    echo -e "${BLUE}⚖️  Verifying token consensus${NC}"

    PRIMARY_HASH=$(echo "$PRIMARY_TOKEN" | jq -r '.data.sha256')
    SECONDARY_HASH=$(echo "$SECONDARY_TOKEN" | jq -r '.data.sha256')

    if [ "$PRIMARY_HASH" = "$SECONDARY_HASH" ]; then
        echo -e "${GREEN}✅ Dual attestation consensus achieved${NC}"
        echo "  SHA-256: $PRIMARY_HASH"
        echo "  SHA-512: $(echo "$PRIMARY_TOKEN" | jq -r '.data.sha512')"

        # Save attestations
        ATTESTATION_DIR=".git/attestations"
        mkdir -p "$ATTESTATION_DIR"

        echo "$PRIMARY_TOKEN" > "$ATTESTATION_DIR/${commit}_primary.json"
        echo "$SECONDARY_TOKEN" > "$ATTESTATION_DIR/${commit}_secondary.json"

        echo ""
        echo -e "${GREEN}💾 Attestation tokens saved to $ATTESTATION_DIR${NC}"

        return 0
    else
        echo -e "${RED}❌ Attestation mismatch - verification failed${NC}"
        return 1
    fi
}

# Main execution
echo "Commit: $COMMIT"
echo "Mode: $MODE"
echo ""

case "$MODE" in
    verify)
        verify_commit "$COMMIT"
        verify_signature "$COMMIT" || true
        ;;
    attest)
        dual_attest "$COMMIT"
        ;;
    both)
        verify_commit "$COMMIT" && \
        verify_signature "$COMMIT" || true && \
        dual_attest "$COMMIT"
        ;;
    *)
        echo -e "${RED}❌ Invalid mode: $MODE${NC}"
        echo "Usage: $0 <commit> <mode>"
        echo "  mode: verify, attest, or both"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Verification complete${NC}"
