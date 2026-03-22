#!/bin/bash
# Script to update GitHub Actions to use full commit SHAs

set -e

echo "Updating GitHub Actions to use full commit SHAs..."

# Common action SHA mappings (latest stable versions)
declare -A ACTION_SHAS=(
    ["actions/checkout@v4"]="actions/checkout@08eba0b27e820071cde6df949e0beb9ba4906955 # v4"
    ["actions/checkout@v3"]="actions/checkout@f43a0e5ff2bd294095638e18286ca9a3d1956744 # v3"
    ["actions/setup-node@v4"]="actions/setup-node@b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8 # v4"
    ["actions/setup-node@v3"]="actions/setup-node@64ed1c7eab4cce3362f8c340dee64e5eaeef8f7c # v3"
    ["actions/setup-python@v5"]="actions/setup-python@0b93645e9fea7318ecaed2b359559ac225c90a2b # v5"
    ["actions/setup-python@v4"]="actions/setup-python@82c7e631bb3cdc910f68e0081d67478d79c6982d # v4"
    ["actions/upload-artifact@v4"]="actions/upload-artifact@26f96dfa697d77e81fd5907df203aa23a56210a8 # v4"
    ["actions/download-artifact@v4"]="actions/download-artifact@fa0a91b85d4f404e444e00e005971372dc801d16 # v4"
    ["actions/cache@v4"]="actions/cache@1bd1e32a3bdc45362d1e726936510720a7c30a57 # v4"
    ["actions/cache@v3"]="actions/cache@704facf57e6136b1bc63b828d79edcd491f0ee84 # v3"
    ["github/codeql-action/init@v3"]="github/codeql-action/init@429e1977040da7a23b6822b13c129cd1ba93dbb2 # v3"
    ["github/codeql-action/analyze@v3"]="github/codeql-action/analyze@429e1977040da7a23b6822b13c129cd1ba93dbb2 # v3"
    ["docker/setup-buildx-action@v3"]="docker/setup-buildx-action@c47758b77c9736f4b2ef4073d4d51994fabfe349 # v3"
    ["docker/login-action@v3"]="docker/login-action@9780b0c442fbb1117ed29e0efdff1e18412f7567 # v3"
    ["docker/build-push-action@v5"]="docker/build-push-action@4f58ea79222b3b9dc2c8bbdd6debcef730109a75 # v5"
    ["open-policy-agent/setup-opa@v2"]="open-policy-agent/setup-opa@950f159c93899f2a46eb2184e7793f2b978ac6fc # v2.3.0"
)

# Find all workflow files
WORKFLOW_DIR=".github/workflows"
UPDATED_COUNT=0
TOTAL_FILES=0

# Process each workflow file
for file in "$WORKFLOW_DIR"/*.yml "$WORKFLOW_DIR"/*.yaml; do
    [ -f "$file" ] || continue

    TOTAL_FILES=$((TOTAL_FILES + 1))
    FILE_UPDATED=false

    # Create a temporary file
    TEMP_FILE=$(mktemp)
    cp "$file" "$TEMP_FILE"

    # Replace each action with its SHA version
    for pattern in "${!ACTION_SHAS[@]}"; do
        replacement="${ACTION_SHAS[$pattern]}"
        if grep -q "$pattern" "$file"; then
            sed -i "s|$pattern|$replacement|g" "$TEMP_FILE"
            FILE_UPDATED=true
        fi
    done

    # If file was updated, replace the original
    if [ "$FILE_UPDATED" = true ]; then
        mv "$TEMP_FILE" "$file"
        UPDATED_COUNT=$((UPDATED_COUNT + 1))
        echo "✓ Updated: $(basename "$file")"
    else
        rm "$TEMP_FILE"
    fi
done

echo ""
echo "========================================="
echo "Updated $UPDATED_COUNT out of $TOTAL_FILES workflow files"
echo "========================================="
